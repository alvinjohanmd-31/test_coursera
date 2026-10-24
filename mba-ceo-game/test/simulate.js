#!/usr/bin/env node
/*
 * Headless balance check for CEO Mandate.
 *
 *   node test/simulate.js            # summary table for every scenario × strategy
 *   node test/simulate.js turnaround passive --trace   # quarter-by-quarter trace
 *
 * Exits non-zero if any run produces NaN/out-of-range values, so it doubles as a
 * smoke test after editing content.js.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console, Math, JSON, Object, Array, String, Number, Set, Map };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['content.js', 'engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
}
const E = ctx.CEO_ENGINE;
const C = ctx.CEO_CONTENT;

// Strategies take the state at the start of a quarter and adjust policies.
const strategies = {
  passive: () => {},
  // A reasonable, balanced CEO: fixes the obvious weaknesses of each scenario.
  balanced: (s) => {
    const want = {
      turnaround: [['dividend', false], ['qualityctl', true, 0.7], ['custservice', true, 0.6], ['training', true, 0.5], ['ecommerce', true, 0.5],
        ['rnd', true, 0.4], ['debtpay', true, 0.6], ['wages', true, 0.55], ['supplier', true, 0.5], ['loyalty', true, 0.4], ['automation', true, 0.4], ['outsourcing', false]],
      scaleup: [['pricing', true, 0.5], ['advertising', true, 0.45], ['ethics', true, 0.6], ['esgreport', true, 0.5], ['qualityctl', true, 0.5],
        ['automation', true, 0.5], ['cvc', false], ['cyber', true, 0.6], ['rnd', true, 0.45], ['ai', true, 0.6]],
      incumbent: [['greenops', true, 0.8], ['rnd', true, 0.6], ['esgreport', true, 0.6], ['netzero', true, 0.4], ['training', true, 0.5],
        ['lobbying', false], ['ethics', true, 0.5], ['ai', true, 0.4], ['buyback', false], ['dividend', true, 0.4]],
    }[s.scenario];
    for (const [id, on, x] of want) {
      const st = s.pol[id];
      if (st.on === on && (!on || Math.abs(st.x - x) < 0.01)) continue;
      E.setPolicy(s, id, on, on ? x : st.x);
    }
  },
  // Phases spending: fix cash and quality first, invest as capital and cash allow.
  focused: (s) => {
    const plan = {
      turnaround: [[1, [['dividend', true, 0.2], ['costcut', true, 0.5], ['lobbying', false], ['qualityctl', true, 0.5], ['debtpay', true, 0.4]]],
        [2, [['custservice', true, 0.5], ['training', true, 0.4]]], [3, [['automation', true, 0.4], ['rnd', true, 0.35]]], [5, [['ecommerce', true, 0.4], ['wages', true, 0.5]]]],
      scaleup: [[1, [['pricing', true, 0.45], ['advertising', true, 0.55], ['ethics', true, 0.5]]], [2, [['esgreport', true, 0.4], ['cvc', false]]],
        [3, [['automation', true, 0.4], ['cyber', true, 0.5]]], [5, [['qualityctl', true, 0.4]]]],
      incumbent: [[1, [['rnd', true, 0.4], ['lobbying', false], ['esgreport', true, 0.5], ['buyback', false]]], [2, [['greenops', true, 0.5], ['ethics', true, 0.4]]],
        [3, [['training', true, 0.4], ['ai', true, 0.3]]], [5, [['greenops', true, 0.7], ['rnd', true, 0.55]]]],
    }[s.scenario];
    for (const [from, moves] of plan) {
      if (s.t + 1 < from) continue;
      for (const [id, on, x] of moves) {
        const st = s.pol[id];
        if (st.on === on && (!on || Math.abs(st.x - x) < 0.01)) continue;
        E.setPolicy(s, id, on, on ? x : st.x);
      }
    }
  },
  // Pure shareholder primacy: cut everything, pay everything out.
  extractive: (s) => {
    for (const [id, on, x] of [['layoffs', true, 0.6], ['costcut', true, 0.8], ['outsourcing', true, 0.8], ['dividend', true, 0.9], ['buyback', true, 0.6],
      ['wages', true, 0.25], ['rnd', false], ['csr', false], ['training', false], ['advertising', true, 0.3]]) {
      const st = s.pol[id];
      if (st.on === on && (!on || Math.abs(st.x - x) < 0.01)) continue;
      E.setPolicy(s, id, on, on ? x : st.x);
    }
  },
  // Spend on everything good, ignoring cost.
  spender: (s) => {
    for (const p of C.policies) {
      if (['layoffs', 'outsourcing', 'costcut', 'jit', 'lobbying', 'buyback'].includes(p.id)) { if (s.pol[p.id].on) E.setPolicy(s, p.id, false, s.pol[p.id].x); continue; }
      if (p.kind === 'bipolar') continue;
      if (!s.pol[p.id].on || s.pol[p.id].x < 0.8) E.setPolicy(s, p.id, true, 0.8);
    }
  },
};

const fmt = (n, d = 0) => (n == null || Number.isNaN(n) ? 'NaN' : n.toFixed(d));
let failures = 0;

function check(s, label) {
  const bad = [];
  for (const [k, v] of Object.entries(s.vars)) if (!(v >= 0 && v <= 1)) bad.push(`var ${k}=${v}`);
  for (const [k, g] of Object.entries(s.groups)) if (!(g.h >= 0 && g.h <= 1)) bad.push(`group ${k}=${g.h}`);
  for (const k of ['cash', 'debt', 'price', 'M', 'shares']) if (!Number.isFinite(s.fin[k])) bad.push(`fin ${k}=${s.fin[k]}`);
  if (!Number.isFinite(E.approval(s))) bad.push('approval NaN');
  if (bad.length) { failures++; console.log(`  !! ${label}: ${bad.join(', ')}`); }
}

function run(scenario, strat, choice, seed, trace) {
  const s = E.newGame({ scenario, seed, length: 12 });
  check(s, `${scenario} start`);
  if (trace) {
    console.log(`\n${scenario} / ${strat} / choice=${choice} / seed=${seed}`);
    console.log('  start approval', fmt(E.approval(s) * 100), 'price', fmt(s.fin.price), 'rev', fmt(s.fin.last.revenue), 'ni', fmt(s.fin.last.ni),
      'ebitda', fmt(s.fin.last.ebitda), 'rating', E.RATINGS[s.fin.ratingIdx], 'share', fmt(s.vars.share * 40, 1) + '%');
    console.log('  groups', Object.entries(s.groups).map(([k, g]) => `${k}:${fmt(g.h * 100)}`).join(' '));
    console.log('  vars', Object.entries(s.vars).map(([k, v]) => `${k}:${fmt(v * 100)}`).join(' '));
    console.log('  sits', Object.entries(s.sit).filter(([, v]) => v.on).map(([k]) => k).join(',') || '-');
  }
  let q = 0;
  while (s.status === 'playing' && q < 40) {
    strategies[strat](s);
    const rep = E.endQuarter(s);
    check(s, `${scenario} t=${s.t}`);
    if (s.dilemma) {
      const d = E.DIL[s.dilemma];
      const idx = choice === 'random' ? (s.t * 7 + seed.length) % d.options.length : choice;
      E.chooseDilemma(s, idx);
    }
    if (trace) {
      const pl = s.fin.last;
      console.log(`  Q${s.t} rev ${fmt(pl.revenue)} ebitda ${fmt(pl.ebitda)} ni ${fmt(pl.ni)} cash ${fmt(s.fin.cash)} debt ${fmt(s.fin.debt)} ${E.RATINGS[s.fin.ratingIdx]}` +
        ` px ${fmt(s.fin.price)} share ${fmt(s.vars.share * 40, 1)}% appr ${fmt(rep.approval * 100)} cap ${s.capital}` +
        ` | sh ${fmt(s.groups.shareholders.h * 100)} bd ${fmt(s.groups.board.h * 100)} em ${fmt(s.groups.employees.h * 100)} cu ${fmt(s.groups.customers.h * 100)}` +
        ` | ${Object.entries(s.sit).filter(([, v]) => v.on).map(([k]) => k).join(',')}` +
        `${rep.news.length ? ' | news ' + rep.news.map((n) => n.id || n.type).join(',') : ''}${rep.rups ? ` | RUPS ${rep.rups.pass ? 'PASS' : 'FAIL'}` : ''}`);
    }
    q++;
  }
  const sc = E.finalScore(s);
  return { s, sc };
}

const args = process.argv.slice(2);
if (args.length && !args[0].startsWith('-')) {
  const [scenario, strat = 'passive', choice = '0'] = args;
  run(scenario, strat, choice === 'random' ? 'random' : Number(choice), args.includes('--seed') ? args[args.indexOf('--seed') + 1] : 'MBA', true);
} else {
  const seeds = ['MBA', 'KELAS-A', 'SBM2027', 'X1', 'PPM'];
  console.log('scenario    strategy    choice  survived  avgQ  avgScore  grades     avgTSR   avgAppr  endReasons');
  for (const scenario of C.scenarios.map((x) => x.id)) {
    for (const strat of Object.keys(strategies)) {
      for (const choice of [0, 1]) {
        const results = seeds.map((seed) => run(scenario, strat, choice, seed, false));
        const survived = results.filter((r) => r.s.status === 'done').length;
        const avg = (f) => results.reduce((a, r) => a + f(r), 0) / results.length;
        const reasons = {};
        for (const r of results) reasons[r.s.endReason] = (reasons[r.s.endReason] || 0) + 1;
        console.log(`${scenario.padEnd(11)} ${strat.padEnd(11)} ${String(choice).padEnd(7)} ${String(survived + '/' + seeds.length).padEnd(9)} ${fmt(avg((r) => r.s.t), 1).padEnd(5)} ` +
          `${fmt(avg((r) => r.sc.total)).padEnd(9)} ${results.map((r) => r.sc.grade).join('').padEnd(10)} ${(fmt(avg((r) => r.sc.tsr) * 100) + '%').padEnd(8)} ` +
          `${fmt(avg((r) => r.sc.approval) * 100).padEnd(8)} ${JSON.stringify(reasons)}`);
      }
    }
  }
}
if (failures) { console.log(`\n${failures} invariant failure(s)`); process.exit(1); }
