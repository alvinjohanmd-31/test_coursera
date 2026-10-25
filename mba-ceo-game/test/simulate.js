#!/usr/bin/env node
/*
 * Headless balance check for CEO Mandate.
 *
 *   node test/simulate.js                 # summary table, every scenario × strategy (12 and 20 quarters)
 *   node test/simulate.js --len 20        # summary for one term length only
 *   node test/simulate.js turnaround passive 0 --len 20   # quarter-by-quarter trace
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
      ai: [['qualityctl', true, 0.6], ['ethics', true, 0.6], ['automation', true, 0.5], ['supplier', true, 0.5], ['outsourcing', false],
        ['pricing', true, 0.55], ['esgreport', true, 0.4], ['cyber', true, 0.6], ['hybrid', true, 0.5]],
      palmoil: [['expansion', false], ['safety', true, 0.7], ['esgreport', true, 0.6], ['greenops', true, 0.6], ['supplier', true, 0.6],
        ['lobbying', false], ['rnd', true, 0.4], ['csr', true, 0.5], ['dividend', true, 0.3], ['ai', true, 0.4]],
      health: [['qualityctl', true, 0.7], ['hybrid', true, 0.5], ['training', true, 0.5], ['ethics', true, 0.5], ['custservice', true, 0.5],
        ['wages', true, 0.55], ['automation', true, 0.4], ['outsourcing', false], ['cyber', true, 0.5]],
      creator: [['supplier', true, 0.6], ['qualityctl', true, 0.5], ['esgreport', true, 0.5], ['greenops', true, 0.4], ['ethics', true, 0.5],
        ['jit', true, 0.3], ['safety', true, 0.4], ['outsourcing', true, 0.4]],
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
      ai: [[1, [['qualityctl', true, 0.6], ['outsourcing', false], ['ethics', true, 0.5]]], [2, [['automation', true, 0.5], ['supplier', true, 0.4]]],
        [3, [['esgreport', true, 0.4], ['cyber', true, 0.6]]], [5, [['pricing', true, 0.55], ['advertising', true, 0.3]]]],
      palmoil: [[1, [['expansion', false], ['safety', true, 0.7], ['esgreport', true, 0.5]]], [2, [['greenops', true, 0.5], ['lobbying', false]]],
        [3, [['supplier', true, 0.6], ['csr', true, 0.5]]], [5, [['rnd', true, 0.4], ['greenops', true, 0.7]]]],
      health: [[1, [['qualityctl', true, 0.6], ['ethics', true, 0.5], ['hybrid', true, 0.4]]], [2, [['training', true, 0.45], ['outsourcing', false]]],
        [3, [['automation', true, 0.4], ['custservice', true, 0.45]]], [5, [['ai', true, 0.3], ['qualityctl', true, 0.7]]]],
      creator: [[1, [['supplier', true, 0.5], ['qualityctl', true, 0.45], ['jit', true, 0.35]]], [2, [['esgreport', true, 0.45], ['ethics', true, 0.4]]],
        [3, [['greenops', true, 0.4], ['safety', true, 0.4]]], [5, [['supplier', true, 0.65], ['rnd', true, 0.3]]]],
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
  // The focused plan plus the new levers: replace the weakest director early and run
  // strategic projects one after another.
  builder: (s) => {
    strategies.focused(s);
    if (s.t === 1) {
      const weak = Object.entries(s.team).filter(([, d]) => !d.vacant && d.comp < 0.45).sort((a, b) => a[1].comp - b[1].comp)[0];
      if (weak) E.hireDirector(s, weak[0], 2);
    }
    for (const [d, x] of Object.entries(s.team)) if (x.vacant) E.hireDirector(s, d, 1);
    if (s.t >= 2 && s.projects.active.length < 1) {
      const next = E.projectList(s).filter((p) => E.canStart(s, p.id)).sort((a, b) => (b.only ? 1 : 0) - (a.only ? 1 : 0))[0];
      if (next) E.startProject(s, next.id);
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

function run(scenario, strat, choice, seed, trace, length = 12) {
  const s = E.newGame({ scenario, seed, length });
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
  while (s.status === 'playing' && q < 60) {
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
        ` | team ${Object.values(s.team).map((d) => d.vacant ? '--' : Math.round(d.loy * 100)).join('/')} proj ${s.projects.active.map((a) => a.id + ':' + Math.round(a.prog * 100)).join(',')}` +
        `${rep.news.length ? ' | news ' + rep.news.map((n) => n.id || n.type).join(',') : ''}${rep.rups ? ` | RUPS ${rep.rups.pass ? 'PASS' : 'FAIL'}` : ''}`);
    }
    q++;
  }
  const sc = E.finalScore(s);
  return { s, sc };
}

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
if (args.length && !args[0].startsWith('-')) {
  const [scenario, strat = 'passive', choice = '0'] = args;
  run(scenario, strat, choice === 'random' ? 'random' : Number(choice), opt('--seed', 'MBA'), true, Number(opt('--len', 12)));
} else {
  const seeds = ['MBA', 'KELAS-A', 'SBM2027', 'X1', 'PPM'];
  const lengths = args.includes('--len') ? [Number(opt('--len'))] : [12, 20];
  const only = opt('--scen', null);
  for (const length of lengths) {
  console.log(`\n== ${length} quarters`);
  console.log('scenario    strategy    choice  survived  avgQ  avgScore  grades     avgTSR   avgAppr  endReasons');
  for (const scenario of C.scenarios.map((x) => x.id).filter((x) => !only || x === only)) {
    for (const strat of Object.keys(strategies)) {
      for (const choice of [0, 1]) {
        const results = seeds.map((seed) => run(scenario, strat, choice, seed, false, length));
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
}
if (failures) { console.log(`\n${failures} invariant failure(s)`); process.exit(1); }
