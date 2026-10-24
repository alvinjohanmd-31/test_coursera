/*
 * CEO Mandate — simulation engine.
 *
 * Pure game logic on a plain-JSON state object, so it runs in the browser and in
 * Node (see test/simulate.js). Every random draw is seeded from the class code,
 * the scenario and the quarter, so students with the same class code face the
 * same macro shocks and the same case order.
 */
(function (root) {
  'use strict';
  const C = root.CEO_CONTENT;
  const index = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
  const VAR = index(C.vars), POL = index(C.policies), GRP = index(C.groups), SIT = index(C.situations);
  const SCEN = index(C.scenarios), DIL = index(C.dilemmas), MEV = index(C.macroEvents);

  const RATINGS = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC'];
  const SPREAD = [0.5, 0.8, 1.2, 1.8, 2.8, 4.2, 6.5]; // percentage points over BI-Rate
  const TAX = 0.22; // Indonesian corporate income tax
  const SHARE_SCALE = 0.4; // share KPI 1.0 = 40% market share
  const CAPITAL_MAX = 30;
  const MACRO_BASE = { gdp: 5.0, bi: 6.0, input: 1.0, fx: 16000 };
  const INFLATION = 0.03;

  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const cen = (x) => 2 * x - 1;
  const inScenario = (item, id) => (!item.only || item.only.includes(id)) && !(item.not && item.not.includes(id));

  // Policies, KPIs and stakeholders with the scenario's renames and effect overrides applied.
  const defCache = {};
  function defs(scenario) {
    if (defCache[scenario]) return defCache[scenario];
    const m = SCEN[scenario].mods || {};
    const merge = (list, mods) => list.map((x) => (mods && mods[x.id] ? Object.assign({}, x, mods[x.id]) : x));
    const d = { pol: merge(C.policies, m.pol), var: merge(C.vars, m.var), grp: merge(C.groups, m.grp) };
    d.POL = index(d.pol);
    d.VAR = index(d.var);
    d.GRP = index(d.grp);
    d.sit = C.situations.filter((x) => inScenario(x, scenario));
    d.dil = C.dilemmas.filter((x) => inScenario(x, scenario));
    d.theories = C.theories.filter((x) => inScenario(x, scenario));
    return (defCache[scenario] = d);
  }
  // Business theory for an arrow, preferring a scenario-specific one.
  function theory(scenario, from, to) {
    const list = defs(scenario).theories.filter((x) => x.from === from && x.to === to);
    return list.find((x) => x.only) || list[0] || null;
  }

  /* ------------------------------------------------------------- randomness */

  function hash(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
  function rng(...parts) {
    let a = hash(parts.join('|'));
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) {
    const u = Math.max(1e-9, r()), v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function shuffle(list, r) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------------------------------------------------------------- helpers */

  const isOn = (s, id) => !!(s.pol[id] && s.pol[id].on);
  // A flag is either permanent (true) or lasts until a quarter number.
  const flagOn = (s, id) => { const f = s.flags[id]; return f === true || (typeof f === 'number' && f >= s.t); };
  const polEff = (s, id) => (s.pol[id] ? s.pol[id].eff : 0);
  // Effect multiplier of a policy: intensity for sliders, −1..+1 for bipolar.
  const polMag = (p, eff) => (p.kind === 'bipolar' ? cen(eff) : eff);

  // Helpers handed to content functions (conditions, objectives, risk odds).
  function helpers(s) {
    return {
      scen: SCEN[s.scenario],
      on: (id) => isOn(s, id),
      eff: (id) => polEff(s, id),
      lastFin: (n) => s.finHist.filter((q) => q.t >= 1).slice(-n),
      tsr: (st) => tsr(st),
      money: (v) => (Math.round(v)).toString(),
      pct: (v, d = 0) => (v * 100).toFixed(d) + '%',
      signedPct: (v) => (v >= 0 ? '+' : '') + (v * 100).toFixed(0) + '%',
      rating: (i) => RATINGS[i],
    };
  }

  // Value of any input id: KPI, policy (effective intensity), situation (0/1),
  // finance signal ("f:…") or stakeholder happiness ("g:…").
  function src(s, id) {
    if (id[1] === ':') {
      const k = id[0], key = id.slice(2);
      if (k === 'f') return s.sig[key];
      if (k === 'g') return s.groups[key].h;
    }
    if (id.startsWith('flag:')) return flagOn(s, id.slice(5)) ? 1 : 0;
    if (VAR[id]) return s.vars[id];
    if (POL[id]) return polEff(s, id);
    if (SIT[id]) return s.sit[id].on ? 1 : 0;
    return 0;
  }

  function volume(s) {
    const mExp = 1 + 0.25 * polEff(s, 'expansion');
    return s.fin.M * mExp * s.vars.share * SHARE_SCALE;
  }

  /* --------------------------------------------------------- KPI dynamics */

  function varTargets(s, explainId) {
    const tg = {}, parts = [];
    const add = (vid, val, kind, ref) => {
      if (!(vid in tg)) return;
      tg[vid] += val;
      if (vid === explainId && Math.abs(val) > 5e-4) parts.push({ kind, ref, val });
    };
    for (const v of C.vars) tg[v.id] = v.base;
    if (explainId) parts.push({ kind: 'base', val: VAR[explainId].base });
    for (const k in s.baseAdj) add(k, s.baseAdj[k], 'struct');
    for (const p of defs(s.scenario).pol) {
      const e = s.pol[p.id].eff;
      if (p.kind !== 'bipolar' && e < 1e-3) continue;
      const m = polMag(p, e);
      for (const [vid, c] of p.fx) add(vid, c * m * (p.id === 'pricing' && vid === 'share' ? elasticity(s) : 1), 'pol', p.id);
    }
    for (const v of C.vars) for (const [vid, c] of v.fx || []) add(vid, c * cen(s.vars[v.id]), 'var', v.id);
    if (s.flags.techShift) add('share', 0.08 * cen(s.vars.digital), 'flag', 'techShift');
    for (const si of C.situations) if (s.sit[si.id].on) for (const [vid, c] of si.fx || []) add(vid, c, 'sit', si.id);
    for (const m of s.mods) if (m.k === 'v') add(m.id, m.v, 'mod', m.src);
    for (const k in tg) tg[k] = clamp(tg[k], 0.02, 0.98);
    return explainId ? { target: tg[explainId], parts } : tg;
  }

  // Customers react less to price when the brand and product are differentiated.
  function elasticity(s) {
    return clamp(1 - 1.2 * ((s.vars.brand + s.vars.quality) / 2 - 0.5), 0.4, 1.6);
  }

  function stepVars(s, speedMul = 1) {
    const tg = varTargets(s);
    for (const v of C.vars) s.vars[v.id] = clamp(s.vars[v.id] + (tg[v.id] - s.vars[v.id]) * Math.min(1, v.speed * speedMul), 0.02, 0.98);
  }

  /* ------------------------------------------------------------ stakeholders */

  function groupTargets(s, explainId) {
    const tg = {}, parts = [];
    const add = (gid, val, kind, ref) => {
      if (!(gid in tg)) return;
      tg[gid] += val;
      if (gid === explainId && Math.abs(val) > 5e-4) parts.push({ kind, ref, val });
    };
    for (const g of C.groups) tg[g.id] = g.base;
    if (explainId) parts.push({ kind: 'base', val: GRP[explainId].base });
    const sc = SCEN[s.scenario];
    const focus = { 'f:profit': sc.profitW ?? 1, 'f:growth': sc.growthW ?? 1 };
    for (const g of C.groups) {
      const investor = g.id === 'shareholders' || g.id === 'board';
      for (const [sid, c] of g.inputs) add(g.id, c * (investor ? focus[sid] ?? 1 : 1) * cen(src(s, sid)), 'in', sid);
    }
    if (s.flags.esgFunds) add('shareholders', 0.10 * cen(s.vars.sustainability), 'flag', 'esgFunds');
    if (s.flags.pdpLaw) add('regulators', 0.08 * cen(polEff(s, 'cyber')), 'flag', 'pdpLaw');
    if (s.flags.carbonTax) add('regulators', 0.06 * cen(s.vars.sustainability), 'flag', 'carbonTax');
    if (s.flags.aiRule) add('regulators', 0.10 * cen(s.vars.compliance) + 0.05 * cen(polEff(s, 'qualityctl')), 'flag', 'aiRule');
    if (s.flags.eudr) add('customers', 0.08 * cen(s.vars.sustainability), 'flag', 'eudr');
    for (const p of defs(s.scenario).pol) {
      const e = s.pol[p.id].eff;
      if (p.kind !== 'bipolar' && e < 1e-3) continue;
      const m = polMag(p, e);
      for (const [gid, c] of p.gx) add(gid, c * m, 'pol', p.id);
    }
    for (const si of C.situations) if (s.sit[si.id].on) for (const [gid, c] of si.gx || []) add(gid, c, 'sit', si.id);
    for (const m of s.mods) if (m.k === 'g') add(m.id, m.v, 'mod', m.src);
    for (const k in tg) tg[k] = clamp(tg[k], 0.02, 0.98);
    return explainId ? { target: tg[explainId], parts } : tg;
  }

  function stepGroups(s, instant) {
    const tg = groupTargets(s);
    for (const g of C.groups) {
      const st = s.groups[g.id];
      st.h = instant ? tg[g.id] : clamp(st.h + (tg[g.id] - st.h) * g.speed, 0.02, 0.98);
    }
  }

  // Influence shifts with conditions, like voter-group membership in Democracy.
  function groupWeight(s, id) {
    const g = GRP[id];
    let w = g.w;
    if (id === 'activists') w *= (1 + 1.2 * Math.max(0, 0.45 - s.vars.sustainability) / 0.45) * (s.flags.carbonTax ? 1.5 : 1);
    if (id === 'union') w *= 1 + Math.max(0, 0.45 - s.vars.morale) / 0.45;
    if (id === 'creditors') w *= 1 + 1.2 * (1 - s.sig.rating);
    if (id === 'regulators') w *= (s.sit.antitrust.on ? 1.5 : 1) * (s.flags.carbonTax ? 1.2 : 1);
    return w;
  }

  function approval(s) {
    let num = 0, den = 0;
    for (const g of C.groups) {
      const w = groupWeight(s, g.id);
      num += w * s.groups[g.id].h;
      den += w;
    }
    return num / den;
  }

  function votes(s) {
    const total = C.groups.reduce((a, g) => a + groupWeight(s, g.id), 0);
    return C.groups.map((g) => {
      const share = groupWeight(s, g.id) / total;
      return { id: g.id, share, h: s.groups[g.id].h, contrib: share * s.groups[g.id].h };
    });
  }

  /* -------------------------------------------------------------- situations */

  function sitScore(s, id) {
    const si = SIT[id];
    if (!inScenario(si, s.scenario)) return 0;
    if (si.requires && !isOn(s, si.requires)) return 0;
    if (si.requiresFlag && !flagOn(s, si.requiresFlag)) return 0;
    let num = 0, den = 0;
    for (const [sid, w, mode] of si.inputs) {
      let v = src(s, sid);
      if (mode === 'inv') v = 1 - v;
      num += w * v;
      den += w;
    }
    return num / den;
  }
  const sitOn = (si) => si.on ?? (si.kind === 'bad' ? 0.66 : 0.72);
  const sitOff = (si) => si.off ?? (si.kind === 'bad' ? 0.55 : 0.62);

  function stepSituations(s, rep) {
    for (const si of C.situations) {
      const st = s.sit[si.id];
      st.score = sitScore(s, si.id);
      if (!st.on && st.score >= sitOn(si)) {
        st.on = true;
        st.since = s.t;
        if (rep) rep.started.push(si.id);
      } else if (st.on && st.score < sitOff(si)) {
        st.on = false;
        if (rep) rep.ended.push(si.id);
      }
    }
  }

  /* ----------------------------------------------------------------- finance */

  function finAdjust(s) {
    const a = { revMult: s.finMods.revMult, cogsAdd: s.finMods.cogsAdd, opexAdd: s.finMods.opexAdd, psAdd: 0, interestAdd: 0, cost: 0 };
    for (const si of C.situations) if (s.sit[si.id].on && si.fin) for (const k in si.fin) a[k] += si.fin[k];
    for (const m of s.mods) if (m.k === 'f') a[m.id] = (a[m.id] || 0) + m.v;
    return a;
  }

  function policyCost(s, p, vol) {
    const st = s.pol[p.id];
    if (!p.cost) return 0;
    if (p.kind === 'bipolar') return p.cost * cen(st.x) * vol;
    if (p.cost > 0) return st.on ? p.cost * st.x * vol : 0; // spending hits immediately
    return p.cost * st.eff * vol; // savings phase in (and out)
  }

  function computePL(s, extra = 0) {
    const sc = SCEN[s.scenario], f = s.fin, m = s.macro, adj = finAdjust(s);
    const vol = volume(s);
    const priceFactor = 0.85 + 0.30 * s.pol.pricing.x;
    const fxMove = m.fx / MACRO_BASE.fx - 1;
    const revenue = vol * priceFactor * Math.max(0.5, 1 + adj.revMult) * (1 + (sc.fxRev || 0) * fxMove);
    const inputIdx = m.input * (1 + (sc.fxCost ?? 0.4) * fxMove);
    const inputFactor = 1 + (inputIdx - 1) * 0.6 * (1 - 0.7 * polEff(s, 'hedging'));
    const cogsRatio = sc.cogs - 0.25 * (s.vars.efficiency - 0.5) + adj.cogsAdd;
    const cogs = vol * cogsRatio * inputFactor;
    // Operating leverage: most overhead and depreciation are fixed (volRef grows with inflation).
    const base = 0.6 * f.volRef + 0.4 * vol;
    const opex = base * sc.opex + vol * (adj.opexAdd + (s.flags.minWage ? 0.008 : 0));
    const carbon = s.flags.carbonTax ? vol * 0.02 * sc.carbon * (1 - s.vars.sustainability) : 0;
    const items = [];
    let polCost = 0;
    for (const p of defs(s.scenario).pol) {
      const c = policyCost(s, p, vol);
      if (Math.abs(c) > 1e-6) {
        polCost += c;
        items.push([p.id, c]);
      }
    }
    const ebitda = revenue - cogs - opex - carbon - polCost;
    const da = (0.7 * f.volRef + 0.3 * vol) * sc.da;
    const rate = (m.bi + SPREAD[f.ratingIdx]) / 100 + adj.interestAdd;
    const interest = (f.debt * rate) / 4 - (Math.max(0, f.cash) * 0.03) / 4;
    const extraordinary = extra + adj.cost * vol;
    const ebt = ebitda - da - interest - extraordinary;
    const tax = Math.max(0, ebt) * TAX;
    const ni = ebt - tax;
    return { vol, revenue, priceFactor, inputIdx, inputFactor, cogs, cogsRatio, opex, carbon, polCost, items, ebitda, da,
      ebit: ebitda - da, rate, interest, extraordinary, ebt, tax, ni, psAdd: adj.psAdd };
  }

  function histAt(s, t) {
    for (let i = s.finHist.length - 1; i >= 0; i--) if (s.finHist[i].t === t) return s.finHist[i];
    return s.finHist[0];
  }

  function updateRating(s, pl, sticky) {
    const f = s.fin;
    const prev = s.finHist.length ? s.finHist[s.finHist.length - 1].ebitda : pl.ebitda;
    const ebitdaA = ((pl.ebitda + prev) / 2) * 4;
    const netDebt = f.debt - f.cash;
    let idx;
    if (ebitdaA > 0) {
      const lev = netDebt / ebitdaA;
      idx = lev < 1.25 ? 0 : lev < 2 ? 1 : lev < 3 ? 2 : lev < 4 ? 3 : lev < 5 ? 4 : lev < 6.5 ? 5 : 6;
      if (pl.ni < 0 && lev >= 3 && idx < 6) idx += 1;
    } else if (netDebt > 0) {
      idx = 6;
    } else {
      // Loss-making with net cash: rated on runway (quarters of cash left).
      const runway = f.cash / Math.max(1, -pl.ni);
      idx = runway >= 12 ? 3 : runway >= 8 ? 4 : runway >= 4 ? 5 : 6;
    }
    if (sticky) idx = clamp(idx, f.ratingIdx - 1, f.ratingIdx + 1);
    f.ratingIdx = idx;
    f.netDebtEbitda = ebitdaA > 0 ? netDebt / ebitdaA : null;
  }

  function updateValuation(s, pl, instant) {
    const sc = SCEN[s.scenario], f = s.fin, v = s.vars;
    const rev4 = histAt(s, s.t - 4).rev;
    const yoy = pl.revenue / rev4 - 1;
    const nm = pl.ni / pl.revenue;
    const lt = Math.log(sc.ps)
      + 2.2 * (clamp(nm, -0.25, 0.25) - 0.05)
      + 1.4 * (clamp(yoy, -0.3, 0.6) - sc.gRef)
      + 0.30 * cen(v.innovation) + 0.15 * cen(v.brand) + 0.15 * cen(v.compliance)
      + (s.flags.esgFunds ? 0.18 : 0.06) * cen(v.sustainability)
      + Math.min(0.45, pl.psAdd) - (f.ratingIdx >= 5 ? 0.15 * (f.ratingIdx - 4) : 0);
    f.logPS = instant ? lt : f.logPS + (lt - f.logPS) * 0.5;
    const ev = pl.revenue * 4 * Math.exp(f.logPS);
    const equity = Math.max(ev - (f.debt - f.cash), ev * 0.12);
    f.mcap = equity;
    f.price = equity / f.shares;
    f.yoy = yoy;
  }

  function computeSignals(s) {
    const f = s.fin, pl = f.last, sc = SCEN[s.scenario];
    const old = histAt(s, s.t - 4);
    let dps = 0;
    for (const q of s.finHist) if (q.t > s.t - 4 && q.t <= s.t) dps += q.dps || 0;
    const tsr4 = (f.price + dps) / old.price - 1;
    s.sig = {
      profit: 0.5 + 0.5 * clamp(pl.ni / pl.revenue / 0.08, -1, 1),
      growth: 0.5 + 0.5 * clamp((f.yoy - sc.gRef) / 0.15, -1, 1),
      tsr: 0.5 + 0.5 * clamp(tsr4 / 0.3, -1, 1),
      rating: 1 - f.ratingIdx / 6,
      cash: clamp(f.cash / (0.6 * pl.revenue), 0, 1),
      competition: s.macro.comp,
      inputcost: clamp(0.5 + (pl.inputIdx - 1) / 0.6, 0, 1),
    };
  }

  function stepFinance(s, rep, extra, capex) {
    const sc = SCEN[s.scenario], f = s.fin;
    const g = (sc.beta * (s.macro.gdp + INFLATION * 100)) / 100;
    f.M *= (1 + g / 4) * s.marketShock;
    // Fixed costs rise with inflation, and step up once volume outgrows them (growth needs
    // people and systems), but stay sticky when volume falls.
    f.volRef = Math.max(f.volRef * (1 + INFLATION / 4), volume(s) * 0.8);
    s.marketShock = 1;
    const pl = computePL(s, extra);
    const div = isOn(s, 'dividend') ? Math.max(0, pl.ni) * (0.1 + 0.6 * s.pol.dividend.x) : 0;
    const bb = isOn(s, 'buyback') ? pl.vol * 0.04 * s.pol.buyback.x : 0;
    f.cash += pl.ni - div - bb - capex;
    let repay = 0;
    if (isOn(s, 'debtpay') && f.debt > 0) {
      const excess = f.cash - 0.3 * pl.revenue;
      if (excess > 0) {
        repay = Math.min(f.debt, excess * (0.2 + 0.8 * s.pol.debtpay.x));
        f.debt -= repay;
        f.cash -= repay;
      }
    }
    let borrowed = 0;
    if (f.cash < 0) {
      // Banks will not lend to a CCC credit that has run out of cash.
      if (f.ratingIdx >= 6) {
        s.status = 'bankrupt';
        s.endReason = 'bankrupt';
      }
      borrowed = -f.cash + 0.05 * pl.revenue;
      f.debt += borrowed;
      f.cash = 0.05 * pl.revenue;
      rep.news.push({ type: 'borrow', amount: borrowed });
    }
    if (bb > 0) f.shares = Math.max(f.shares0 * 0.5, f.shares - bb / f.price);
    const dps = div / f.shares;
    f.cumDps += dps;
    Object.assign(pl, { div, buyback: bb, capex, repay, borrowed, cashFlow: pl.ni - div - bb - capex });
    updateRating(s, pl, true);
    f.last = pl;
    updateValuation(s, pl, false);
    s.finHist.push({ t: s.t, rev: pl.revenue, ni: pl.ni, ebitda: pl.ebitda, price: f.price, cash: f.cash, debt: f.debt, rating: f.ratingIdx, dps, vol: pl.vol });
  }

  /* ------------------------------------------------------------------- macro */

  function stepMacro(s, rep) {
    const r = rng(s.seed, s.scenario, 'macro', s.t), m = s.macro;
    m.gdp += (MACRO_BASE.gdp - m.gdp) * 0.3 + gauss(r) * 0.25;
    m.bi += (MACRO_BASE.bi - m.bi) * 0.12 + gauss(r) * 0.05;
    m.input += (MACRO_BASE.input - m.input) * 0.22 + gauss(r) * 0.015;
    m.fx += (MACRO_BASE.fx - m.fx) * 0.12 + gauss(r) * 120;
    m.comp += (s.compBase - m.comp) * 0.2 + gauss(r) * 0.015;
    for (const ev of s.timeline) {
      if (ev.q !== s.t) continue;
      MEV[ev.id].apply(s);
      rep.news.push({ type: 'macro', id: ev.id });
    }
    m.gdp = clamp(m.gdp, -3, 9);
    m.bi = clamp(m.bi, 3.5, 10);
    m.input = clamp(m.input, 0.75, 1.6);
    m.fx = clamp(m.fx, 13500, 21000);
    m.comp = clamp(m.comp, 0.2, 0.95);
  }

  function buildTimeline(seed, scenario, length) {
    const sc = SCEN[scenario], r = rng(seed, scenario, 'timeline');
    const out = [], used = new Set();
    for (const [id, lo, hi] of sc.forced || []) {
      const q = Math.min(length - 1, lo + Math.floor(r() * (hi - lo + 1)));
      out.push({ q, id });
      used.add(q);
    }
    const forcedIds = new Set(out.map((e) => e.id));
    const pool = shuffle(C.macroEvents.filter((e) => !forcedIds.has(e.id) && inScenario(e, scenario) && !(e.only && sc.forced && sc.forced.some(([f]) => f === e.id))), r);
    const n = length <= 8 ? 3 : 5;
    let picked = 0;
    for (const ev of pool) {
      if (picked >= n) break;
      if ((ev.id === 'rateCut' && out.some((e) => e.id === 'rateHike')) || (ev.id === 'rateHike' && out.some((e) => e.id === 'rateCut'))) continue;
      let q, tries = 0;
      do q = 2 + Math.floor(r() * (length - 2)); while (used.has(q) && ++tries < 20);
      if (used.has(q)) continue;
      used.add(q);
      out.push({ q, id: ev.id });
      picked++;
    }
    return out.sort((a, b) => a.q - b.q);
  }

  /* ---------------------------------------------------------------- effects */

  function setPolicyDirect(s, id, on, x) {
    const p = POL[id], st = s.pol[id];
    st.on = p.core ? true : on;
    st.x = clamp(x, p.kind === 'bipolar' ? 0 : 0.1, 1);
    s.polStart[id] = { on: st.on, x: st.x };
  }

  // Applies a case/event effect bundle (see the key list in content.js).
  function applyFx(s, fx, srcId) {
    if (!fx) return;
    const vol = volume(s);
    for (const [id, mode, val] of fx.pol || []) {
      const st = s.pol[id];
      const cur = st.on ? st.x : 0;
      if (mode === 'off') setPolicyDirect(s, id, false, st.x);
      else if (mode === 'set') setPolicyDirect(s, id, true, val);
      else if (mode === 'min') setPolicyDirect(s, id, true, Math.max(cur, val));
      else if (mode === 'add') {
        const nx = cur + val;
        if (!POL[id].core && nx < 0.1) setPolicyDirect(s, id, false, st.x);
        else setPolicyDirect(s, id, true, nx);
      }
    }
    for (const [k, id, v, n] of fx.mods || []) s.mods.push({ k, id, v, n, src: srcId });
    for (const [id, d] of fx.base || []) s.baseAdj[id] = (s.baseAdj[id] || 0) + d;
    for (const [k, d] of fx.finp || []) s.finMods[k] += d;
    if (fx.cash) s.fin.cash += fx.cash * vol;
    if (fx.debt) s.fin.debt += fx.debt * vol * 4;
    if (fx.borrow) { s.fin.debt += fx.borrow * vol * 4; s.fin.cash += fx.borrow * vol * 4; }
    if (fx.specialDiv) {
      const amount = Math.min(Math.max(0, s.fin.cash), fx.specialDiv * vol);
      s.fin.cash -= amount;
      s.fin.cumDps += amount / s.fin.shares;
    }
    if (fx.rights) {
      s.fin.cash += fx.rights * s.fin.shares * s.fin.price * 0.8;
      s.fin.shares *= 1 + fx.rights;
    }
    if (fx.cap) s.capital = clamp(s.capital + fx.cap, 0, CAPITAL_MAX);
    if (fx.risk) {
      s.pending.push({ due: s.t + fx.risk.delay, src: srcId, chance: fx.risk.chance, mit: fx.risk.mit || [], text: fx.risk.text, fx: fx.risk.fx });
    }
  }

  function resolvePending(s, rep) {
    const keep = [];
    for (const p of s.pending) {
      if (p.due > s.t) { keep.push(p); continue; }
      let chance = p.chance;
      for (const [id, f] of p.mit) chance *= 1 - f * polEff(s, id);
      const roll = rng(s.seed, s.scenario, 'pending', p.src, p.due)();
      if (roll < chance) {
        applyFx(s, p.fx, p.src);
        rep.news.push({ type: 'consequence', src: p.src, text: p.text });
      }
    }
    s.pending = keep;
  }

  function rollRiskEvents(s, rep) {
    const H = helpers(s);
    let n = 0;
    for (const ev of C.riskEvents) {
      if (n >= 2) break;
      const p = clamp(ev.p(s, H), 0, 0.6);
      if (rng(s.seed, s.scenario, 'risk', ev.id, s.t)() < p) {
        applyFx(s, ev.fx(s, H), ev.id);
        rep.news.push({ type: 'risk', id: ev.id });
        n++;
      }
    }
  }

  /* -------------------------------------------------------- executive capital */

  function changeCost(s, id, on = s.pol[id].on, x = s.pol[id].x) {
    const p = POL[id], a = s.polStart[id];
    if (!a.on && on) return p.intro;
    if (a.on && !on) return Math.ceil(p.intro * 0.5);
    if (a.on && on) {
      const d = Math.abs(x - a.x);
      if (d < 1e-3) return 0;
      return Math.max(1, Math.round(d * (p.adj ?? p.intro)));
    }
    return 0;
  }
  const capitalSpent = (s) => C.policies.reduce((a, p) => a + changeCost(s, p.id), 0);
  const capitalLeft = (s) => s.capital - capitalSpent(s);

  // Player action: returns false (and changes nothing) if capital is short.
  function setPolicy(s, id, on, x) {
    const p = POL[id];
    if (p.core) on = true;
    x = clamp(Math.round(x * 20) / 20, p.kind === 'bipolar' ? 0 : 0.1, 1);
    const others = capitalSpent(s) - changeCost(s, id);
    if (s.capital - others - changeCost(s, id, on, x) < 0) return false;
    s.pol[id].on = on;
    s.pol[id].x = x;
    return true;
  }
  function revertPolicy(s, id) {
    s.pol[id].on = s.polStart[id].on;
    s.pol[id].x = s.polStart[id].x;
  }

  function capitalGain(s) {
    const ex = s.pol.execpay.x;
    let gain = 3 + Math.round(approval(s) * 6) + (ex >= 0.85 ? 2 : ex >= 0.6 ? 1 : ex <= 0.2 ? -1 : 0);
    for (const si of C.situations) if (s.sit[si.id].on) gain += si.cap || 0;
    return Math.max(1, gain);
  }

  /* ---------------------------------------------------------------- dilemmas */

  function drawDilemma(s) {
    const H = helpers(s);
    for (let i = 0; i < s.deck.length; i++) {
      const d = DIL[s.deck[i]];
      if (!d.when || d.when(s, H)) {
        s.deck.splice(i, 1);
        return d.id;
      }
    }
    return null;
  }

  function chooseDilemma(s, idx) {
    if (!s.dilemma) return null;
    const d = DIL[s.dilemma], opt = d.options[idx];
    const fx = typeof opt.fx === 'function' ? opt.fx(s, helpers(s)) : opt.fx;
    applyFx(s, fx, d.id);
    s.log.push({ t: s.t + 1, type: 'case', id: d.id, choice: idx });
    s.dilemma = null;
    return opt;
  }

  /* -------------------------------------------------------------- game setup */

  // Scenario-specific cases alternate with general ones so every story case shows up.
  function buildDeck(seed, scenario) {
    const r = rng(seed, scenario, 'deck');
    const own = shuffle(defs(scenario).dil.filter((d) => d.only).map((d) => d.id), r);
    const general = shuffle(defs(scenario).dil.filter((d) => !d.only).map((d) => d.id), r);
    const deck = [];
    while (own.length || general.length) {
      if (own.length) deck.push(own.shift());
      if (general.length) deck.push(general.shift());
    }
    return deck;
  }

  function snapshotPolicies(s) {
    s.polStart = {};
    for (const p of C.policies) s.polStart[p.id] = { on: s.pol[p.id].on, x: s.pol[p.id].x };
  }

  function newGame(opts) {
    const sc = SCEN[opts.scenario];
    const length = opts.length || 12;
    const seed = String(opts.seed || 'MBA').trim().toUpperCase() || 'MBA';
    const s = {
      v: 1, scenario: sc.id, seed, length, t: 0, year0: opts.year0 || 2027, status: 'playing', endReason: null,
      vars: {}, pol: {}, polStart: {}, groups: {}, sit: {}, mods: [], baseAdj: { ...sc.baseAdj },
      finMods: { revMult: 0, cogsAdd: 0, opexAdd: 0 }, flags: {}, marketShock: 1, compBase: sc.compBase,
      macro: { gdp: MACRO_BASE.gdp, bi: MACRO_BASE.bi, input: MACRO_BASE.input, fx: MACRO_BASE.fx, comp: sc.compBase },
      fin: { M: sc.M, cash: sc.cash, debt: sc.debt, shares: sc.shares, shares0: sc.shares, cumDps: 0, ratingIdx: 3, logPS: Math.log(sc.ps), price: 0 },
      finHist: [], hist: { vars: [], groups: [], approval: [], macro: [] },
      capital: 12, pending: [], log: [], dilemma: null, rupslbRun: 0, sig: {},
      timeline: buildTimeline(seed, sc.id, length),
      deck: buildDeck(seed, sc.id),
    };
    for (const p of C.policies) {
      const preset = sc.policies[p.id];
      const on = p.kind === 'bipolar' || preset != null;
      const x = preset != null ? preset : p.kind === 'bipolar' ? 0.5 : p.x0 || 0.5;
      s.pol[p.id] = { on, x, eff: on ? x : 0 };
    }
    snapshotPolicies(s);
    for (const [k, id, v, n] of sc.startMods || []) s.mods.push({ k, id, v, n, src: 'start' });
    // A new CEO gets a honeymoon with investors through the first annual meeting.
    s.mods.push({ k: 'g', id: 'shareholders', v: 0.05, n: 4, src: 'honeymoon' }, { k: 'g', id: 'board', v: 0.05, n: 4, src: 'honeymoon' });
    for (const si of C.situations) s.sit[si.id] = { on: false, since: null, score: 0 };
    for (const v of C.vars) s.vars[v.id] = v.base;
    for (let i = 0; i < 60; i++) stepVars(s, 2);
    for (const k in sc.start || {}) s.vars[k] = clamp(s.vars[k] + sc.start[k], 0.02, 0.98);
    s.fin.volRef = volume(s);

    // The quarter before you took office, plus a synthetic year of history.
    const pl = computePL(s);
    for (let k = 4; k >= 1; k--) {
      const scale = Math.pow(1 + sc.initGrowth, -k / 4);
      s.finHist.push({ t: -k, rev: pl.revenue * scale, ni: pl.ni * scale, ebitda: pl.ebitda * scale, price: 0, cash: sc.cash, debt: sc.debt, rating: 3, dps: 0, vol: pl.vol * scale });
    }
    updateRating(s, pl, false);
    s.fin.last = Object.assign(pl, { div: 0, buyback: 0, capex: 0, repay: 0, borrowed: 0, cashFlow: 0 });
    updateValuation(s, pl, true);
    for (const q of s.finHist) q.price = s.fin.price;
    s.finHist.push({ t: 0, rev: pl.revenue, ni: pl.ni, ebitda: pl.ebitda, price: s.fin.price, cash: s.fin.cash, debt: s.fin.debt, rating: s.fin.ratingIdx, dps: 0, vol: pl.vol });
    computeSignals(s);
    for (const g of C.groups) s.groups[g.id] = { h: 0.5 };
    for (let i = 0; i < 3; i++) stepGroups(s, true);
    stepSituations(s, null);
    s.start = { price: s.fin.price, share: s.vars.share, approval: approval(s), vars: { ...s.vars } };
    record(s);
    return s;
  }

  function record(s) {
    s.hist.vars.push({ ...s.vars });
    s.hist.groups.push(Object.fromEntries(C.groups.map((g) => [g.id, s.groups[g.id].h])));
    s.hist.approval.push(approval(s));
    s.hist.macro.push({ ...s.macro });
  }

  /* --------------------------------------------------------------- the turn */

  function endQuarter(s) {
    if (s.status !== 'playing') return null;
    const before = { t: s.t, approval: approval(s), price: s.fin.price, cash: s.fin.cash, vars: { ...s.vars }, groups: Object.fromEntries(C.groups.map((g) => [g.id, s.groups[g.id].h])), last: s.fin.last };
    const rep = { t: s.t + 1, news: [], started: [], ended: [], before, rups: null, capitalGain: 0 };

    // Commit this quarter's decisions.
    const spent = capitalSpent(s);
    const changes = [];
    const vol0 = volume(s);
    let severance = 0, capex = 0;
    for (const p of C.policies) {
      const a = s.polStart[p.id], b = s.pol[p.id];
      if (a.on !== b.on || Math.abs(a.x - b.x) > 1e-3) changes.push({ id: p.id, from: a.on ? a.x : null, to: b.on ? b.x : null });
      const d = (b.on ? b.x : 0) - (a.on ? a.x : 0);
      if (d > 0) {
        if (p.id === 'layoffs') severance += 0.06 * vol0 * d;
        if (p.capex) capex += p.capex * vol0 * d;
      }
    }
    s.capital -= spent;
    if (changes.length) s.log.push({ t: s.t + 1, type: 'policy', changes });
    rep.spent = spent;
    rep.changes = changes;

    s.t += 1;
    stepMacro(s, rep);
    for (const p of C.policies) {
      const st = s.pol[p.id];
      st.eff += ((st.on ? st.x : 0) - st.eff) * p.speed;
      if (!st.on && st.eff < 0.01) st.eff = 0;
    }
    stepVars(s);
    stepFinance(s, rep, severance, capex);
    rep.severance = severance;
    computeSignals(s);
    stepGroups(s);
    stepSituations(s, rep);
    resolvePending(s, rep);
    rollRiskEvents(s, rep);
    s.mods = s.mods.map((m) => ({ ...m, n: m.n - 1 })).filter((m) => m.n > 0);

    rep.capitalGain = capitalGain(s);
    s.capital = clamp(s.capital + rep.capitalGain, 0, CAPITAL_MAX);
    record(s);
    rep.approval = approval(s);

    // Removal paths: insolvency, an extraordinary meeting, or the annual RUPS.
    s.rupslbRun = s.sit.rupslb.on ? s.rupslbRun + 1 : 0;
    if (s.status === 'playing' && s.rupslbRun >= 2) {
      s.status = 'fired';
      s.endReason = 'rupslb';
    }
    if (s.status === 'playing' && s.t % 4 === 0) {
      rep.rups = { year: s.year0 + s.t / 4 - 1, approval: rep.approval, votes: votes(s), pass: rep.approval >= 0.5 };
      if (!rep.rups.pass) {
        s.status = 'fired';
        s.endReason = 'rups';
      }
    }
    if (s.status === 'playing' && s.t >= s.length) {
      s.status = 'done';
      s.endReason = 'term';
    }
    if (s.status === 'playing') s.dilemma = drawDilemma(s);
    snapshotPolicies(s);
    return rep;
  }

  /* ---------------------------------------------------------------- scoring */

  function tsr(s) {
    return (s.fin.price + s.fin.cumDps) / s.start.price - 1;
  }

  function finalScore(s) {
    const H = helpers(s), sc = SCEN[s.scenario], v = s.vars, ap = approval(s);
    const r = tsr(s);
    const parts = {
      fin: 170 * clamp((r + 0.4) / 1.2, 0, 1) + 80 * (1 - s.fin.ratingIdx / 6),
      cust: 75 * v.custsat + 75 * clamp((v.share / s.start.share - 0.7) / 0.6, 0, 1),
      proc: 60 * v.quality + 60 * v.efficiency,
      learn: 40 * (v.talent + v.innovation + v.morale),
      esg: 50 * (v.sustainability + v.compliance),
      stake: 110 * clamp((ap - 0.3) / 0.4, 0, 1),
    };
    const objectives = sc.objectives.map((o) => o.check(s, H));
    parts.obj = 50 * objectives.filter((o) => o.ok).length;
    let total = Object.values(parts).reduce((a, b) => a + b, 0);
    let factor = 1;
    if (s.status === 'fired') factor = 0.55 + 0.25 * (s.t / s.length);
    if (s.status === 'bankrupt') factor = 0.35;
    total = Math.round(total * factor);
    const grade = total >= 760 ? 'A' : total >= 640 ? 'B' : total >= 520 ? 'C' : total >= 400 ? 'D' : 'E';

    // Leadership style: which stakeholder cluster ended up happiest.
    const avg = (ids) => ids.reduce((a, id) => a + s.groups[id].h, 0) / ids.length;
    const clusters = {
      capital: avg(['shareholders', 'board', 'creditors']),
      people: avg(['employees', 'union']),
      market: avg(['customers', 'suppliers']),
      society: avg(['regulators', 'community', 'activists']),
    };
    const vals = Object.values(clusters);
    const spread = Math.max(...vals) - Math.min(...vals);
    const style = spread < 0.08 && Math.min(...vals) > 0.5 ? 'balanced' : Object.entries(clusters).sort((a, b) => b[1] - a[1])[0][0];
    return { total, grade, parts, factor, objectives, tsr: r, approval: ap, style, clusters };
  }

  /* -------------------------------------------------------------- explainers */

  function explainVar(s, id) { return varTargets(s, id); }
  function explainGroup(s, id) { return groupTargets(s, id); }

  root.CEO_ENGINE = {
    RATINGS, SPREAD, SHARE_SCALE, CAPITAL_MAX, TAX,
    VAR, POL, GRP, SIT, SCEN, DIL, MEV,
    newGame, endQuarter, chooseDilemma, setPolicy, revertPolicy, changeCost, capitalSpent, capitalLeft, capitalGain,
    defs, theory, inScenario, flagOn,
    approval, votes, groupWeight, elasticity, sitScore, sitOn, sitOff, computePL, volume, policyCost, explainVar, explainGroup,
    finalScore, tsr, helpers, src, clamp,
  };
})(typeof window !== 'undefined' ? window : globalThis);
