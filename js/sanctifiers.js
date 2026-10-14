// Sanctifiers (淨化者) rules engine: the Ministorum Sermon, Blaze tokens, Commanding Declamation, Miracle, the ploys and the
// faction equipment. game.js calls these hooks; the team data is in data/sanctifiers.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { abilityArmed, ACTIONS, TARGET_ACTIONS, CONTROL, OBJ_R, applyDamage, aplNow, autoFF, changeApl, checkMines, controller, d3, d6, edgeDist, engagedEnemies, foes, forcedShot, getOp, hasPloy, isEngaged, living, log, opName, radius, spend, team, tpl, visibility } from './game.js';
import { dist } from './geometry.js';
import { moveCtx, wholeInchPath } from './path.js';
import { scTrapCheck } from './scouts.js';
import { SANCTIFIERS_TEAM, sanctifiersRosterError } from './data/sanctifiers.js';

export function isSF(o) { return o?.team === 'sanctifiers'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }
const hasBlaze = (o) => tpl(o).weapons.some((w) => w.rules.blaze);

// ---------- setup ----------
export function sfSetup(g, roster) {
  g.sfOrator = [null, null]; g.sfDecl = [false, false]; g.sfOrbTP = [0, 0]; g.sfUsed = [{}, {}]; g.sfGambitTP = [0, 0];
  for (const side of [0, 1]) if (g.teams[side] === 'sanctifiers') {
    const error = sanctifiersRosterError(SANCTIFIERS_TEAM, roster[side]);
    if (error) throw new Error(error.en);
  }
}

// ---------- the Orator and the Ministorum Sermon ----------
/** The friendly ORATOR: the Confessor while he lives, otherwise the operative picked by the gambit. */
export function sfOrator(g, side) {
  if (g.teams[side] !== 'sanctifiers') return null;
  const c = living(g, side).find((o) => tpl(o).sfConfessor);
  if (c) return c;
  const o = g.sfOrator?.[side] != null ? getOp(g, g.sfOrator[side]) : null;
  return o && !o.dead ? o : null;
}
const oratorRange = (o) => (tpl(o).sfConfessor ? 6 : 3);
/** Within the Orator's range (3", or 6" for the Confessor); the Orator itself is within 0". */
function nearOrator(g, op) {
  const or = sfOrator(g, op.side);
  return !!or && (or === op || edgeDist(op, or) <= oratorRange(or) + 0.01);
}
/** The target of Ardent Eradication: an enemy within the Orator's range. */
export function sfNearOrator(g, side, target) {
  const or = sfOrator(g, side);
  return !!or && edgeDist(or, target) <= oratorRange(or) + 0.01;
}
/** Benefitting from the Sermon: near the Orator, activated near it, a holy relic, or a Preacher that controls a marker. */
export function sfSermon(g, op) {
  if (!isSF(op) || op.dead || op.side > 1 || op.x < -50) return false;
  if (op.sfSermonAct || tpl(op).holyRelic || nearOrator(g, op)) return true;
  return !!tpl(op).defendFaith && (g.objectives || []).some((m) => dist(op, m) - radius(op) - OBJ_R <= CONTROL + 0.01 && controller(g, m) === op.side);
}

/** The gambit: with the Confessor gone, pick a new Orator (any SANCTIFIER). */
export function sfGambitLeft(g, side) {
  return g.teams[side] === 'sanctifiers' && g.phase === 'strategy' && !living(g, side).some((o) => tpl(o).sfConfessor) && g.sfGambitTP?.[side] !== g.tp && living(g, side).length > 0;
}
export function sfChooseOrator(g, side, uid) {
  const o = getOp(g, uid);
  if (!sfGambitLeft(g, side) || !o || o.dead || o.side !== side) return false;
  g.sfGambitTP[side] = g.tp; g.sfOrator[side] = o.uid;
  note(g, side, `佈道：${opName(o, 'zh')} 成為佈道者`, `Ministorum Sermon: ${opName(o, 'en')} becomes the orator`);
  return true;
}
const bestOrator = (g, side) => living(g, side).filter((o) => !tpl(o).sfCherub).sort((a, b) => b.wounds - a.wounds)[0] || living(g, side)[0] || null;
/** The Ready step: a replacement Orator when the Confessor and the old Orator are gone; Ecclesiarchy Texts. */
export function sfReady(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'sanctifiers') {
    if (!sfOrator(g, side)) {
      const o = bestOrator(g, side);
      if (o) { g.sfOrator[side] = o.uid; note(g, side, `佈道：${opName(o, 'zh')} 成為佈道者`, `Ministorum Sermon: ${opName(o, 'en')} becomes the orator`); }
    }
    const or = sfOrator(g, side);
    if (g.tp > 1 && or && equip(g, side, 'sfTexts')) {
      const r = d6() + d6() + d6();
      const ok = r < or.wounds;
      if (ok) g.cp[side]++;
      note(g, side, `教會典籍：擲 3D6 = ${r}（佈道者剩 ${or.wounds} 生命）${ok ? '，+1CP' : '，沒有效果'}`, `Ecclesiarchy Texts: 3D6 = ${r} (orator has ${or.wounds} wounds)${ok ? ' — +1CP' : ' — no effect'}`);
    }
  }
}
export function sfAiStrategy(g, side) {
  if (!sfGambitLeft(g, side)) return;
  const o = sfOrator(g, side) || bestOrator(g, side);
  if (o && g.sfOrator[side] !== o.uid) sfChooseOrator(g, side, o.uid);
}

// ---------- activation ----------
/** The end of activate(): a Sermon that lasts the activation, and the Blaze token damage. */
export function sfActivate(g, op) {
  if (g.counter || op.side > 1) return;
  if (isSF(op)) op.sfSermonAct = nearOrator(g, op);
  for (const s of [0, 1]) if (op.sfBlaze?.[s] && (op.sfBlazeTP?.[s] ?? 0) !== g.tp) {
    (op.sfBlazeTP ||= [0, 0])[s] = g.tp;
    const d = d3();
    note(g, s, `烈焰：${opName(op, 'zh')} 啟動，受到 ${d} 傷害`, `Blaze: ${opName(op, 'en')} activates and takes ${d} damage`);
    applyDamage(g, null, op, d);
    if (op.dead) return;
    // The token's owner chose nothing: with few wounds left it pays -1 APL (sure), otherwise it rolls a D6 for 3+.
    if (op.wounds <= 3 && op.ap > 0) {
      op.ap--; op.sfBlaze[s] = false;
      note(g, s, `${opName(op, 'zh')} APL -1 以移除烈焰標記`, `${opName(op, 'en')} takes -1 APL to remove the Blaze token`);
    } else {
      const r = d6();
      if (r >= 3) { op.sfBlaze[s] = false; note(g, s, `${opName(op, 'zh')} 擲 ${r}：烈焰標記移除`, `${opName(op, 'en')} rolls ${r}: the Blaze token is removed`); }
      else note(g, s, `${opName(op, 'zh')} 擲 ${r}：烈焰標記還在燒`, `${opName(op, 'en')} rolls ${r}: the Blaze token stays`);
    }
  }
}
/** The end of an activation: the Sermon bonus for having been activated beside the Orator is over. */
export function sfEnd(op) { if (op) op.sfSermonAct = false; }

// ---------- weapon rules ----------
export function sfRules(g, op, weapon, target, r) {
  if (!isSF(op)) return;
  if (target && weapon.rules.blaze && target.sfDoused?.[op.side]) r.seek = true; // Sanctification Orbs: Doused
  if (tpl(op).sfSpread && !living(g, op.side).some((o) => o !== op && edgeDist(o, op) <= 6)) r.severe = true; // Spread the Word of the God-Emperor
  if (weapon.type === 'melee') {
    if (hasPloy(g, op.side, 'sfBrawl') && sfSermon(g, op)) r.ceaseless = true; // Fervent Brawl
    if (hasPloy(g, op.side, 'sfZealous') && g.active === op.uid && (op.acted?.charge || 0) > 0) r.lethal = Math.min(r.lethal || 6, 5); // Zealous Persecution
  }
}
/** Conversion Field (Salvationist): a friendly beside it shot from more than 6" away saves one better. */
export function sfConversion(g, shooter, target) {
  if (!isSF(target) || target.side > 1) return 0;
  return living(g, target.side).some((s) => tpl(s).sfSalvationist && edgeDist(s, target) <= 6 && edgeDist(s, shooter) > 6) ? 1 : 0;
}
/** Null Skull (Drill Abbot): an enemy within 4" of it can't have a positive APL change. */
export function sfNullApl(g, op, v) {
  if (op.side > 1 || v <= tpl(op).apl) return v;
  return foes(g, op).some((e) => tpl(e).sfDrill && edgeDist(e, op) <= 4.01) ? tpl(op).apl : v;
}

// ---------- Blaze and Doused tokens ----------
function giveBlaze(g, src, target) {
  if (!target || target.dead || target.side > 1) return;
  (target.sfBlaze ||= [false, false])[src.side] = true;
  note(g, src.side, `${opName(target, 'zh')} 獲得烈焰標記`, `${opName(target, 'en')} gains a Blaze token`);
}
/** After a shooting sequence: critical damage with a Blaze weapon gives a Blaze token; the Doused token is used up. */
export function sfShootBlaze(g, op, weapon, target, critDamage) {
  if (!isSF(op) || !weapon.rules.blaze || !target) return;
  if (critDamage) giveBlaze(g, op, target);
  if (target.sfDoused?.[op.side]) target.sfDoused[op.side] = false;
}
export function sfFightBlaze(g, op, weapon, target, crit, dmg) {
  if (!isSF(op) || !weapon.rules.blaze || !target) return;
  if (crit && dmg > 0) giveBlaze(g, op, target);
  if (target.sfDoused?.[op.side]) target.sfDoused[op.side] = false;
}

// ---------- equipment: Purity Seals and Imperial Cult Symbols ----------
/** Purity Seals (once per TP): two or more fails — one is discarded and another kept as a normal success. */
export function sfRoll(g, op, pool, retally) {
  if (!isSF(op) || op.side > 1 || !pool || !(equip(g, op.side, 'sfSeals') && abilityArmed(g, op.side, 'sfSeals')) || g.sfUsed?.[op.side]?.seals === g.tp) return;
  if (pool.dice.filter((d) => !d.auto && d.res === 'miss').length < 2) return;
  g.sfUsed[op.side].seals = g.tp;
  // (A post step, so the change survives any later re-roll and re-count.)
  const seals = (p) => { const m = p.dice.filter((d) => !d.auto && d.res === 'miss'); if (m.length >= 2) { m[0].res = 'norm'; m[0].indo = true; p.norms++; } };
  const prev = pool.post;
  pool.post = prev ? (p) => { prev(p); seals(p); } : seals;
  retally(pool);
  note(g, op.side, `純潔封印：${opName(op, 'zh')} 一個失敗保留為普通成功`, `Purity Seals: ${opName(op, 'en')} retains a fail as a normal success`);
}
/** Imperial Cult Symbols (once per TP): one of the shooter's retained critical successes becomes a normal one. */
export function sfSymbols(g, target, a) {
  if (!isSF(target) || target.side > 1 || a.crits < 1 || !(equip(g, target.side, 'sfSymbols') && abilityArmed(g, target.side, 'sfSymbols')) || g.sfUsed?.[target.side]?.symbols === g.tp || !sfSermon(g, target)) return false;
  g.sfUsed[target.side].symbols = g.tp;
  const x = a.dice.find((d) => d.res === 'crit');
  if (!x) return false;
  x.res = 'norm'; x.obsc = true; a.crits--; a.norms++;
  note(g, target.side, `帝國教派聖徽：一個暴擊改為普通成功`, `Imperial Cult Symbols: a critical success becomes a normal one`);
  return true;
}

// ---------- ploys ----------
/** Unwavering Devotion: the Orator or the Miraculist is picked as a target — another friendly within 3" takes it instead. */
export function sfSwap(g, target, weapon) {
  if (!isSF(target) || target.side > 1 || weapon?.rules.blast || weapon?.rules.torrent) return target;
  const or = sfOrator(g, target.side);
  if (!(target === or || tpl(target).sfMiraculist)) return target;
  const cands = living(g, target.side).filter((o) => o !== target && !tpl(o).sfConfessor && !tpl(o).sfMiraculist && o !== or && edgeDist(o, target) <= 3 && visibility(g, target, o).visible);
  if (!cands.length || !autoFF(g, target.side, 'sfUnwavering')) return target;
  const sub = cands.sort((a, b) => b.wounds - a.wounds)[0];
  note(g, target.side, `堅定奉獻：${opName(sub, 'zh')} 替 ${opName(target, 'zh')} 承受攻擊`, `Unwavering Devotion: ${opName(sub, 'en')} takes the attack for ${opName(target, 'en')}`);
  return sub;
}
/** Rally the Flock (bought in the Strategy phase, not in the first turning point): free Dashes or Fall Backs towards the Orator. */
export function sfPloyBought(g, side, ploy) {
  if (ploy.id !== 'sfRally') return;
  const or = sfOrator(g, side);
  if (g.tp === 1 || !or) { note(g, side, '聚攏信眾：沒有效果', 'Rally the Flock: no effect'); return; }
  for (const o of living(g, side).filter((x) => x !== or && sfSermon(g, x))) {
    const eng = isEngaged(g, o);
    const q = bestStep(g, o, 3, eng ? 'fallBack' : 'dash', (p) => {
      const d0 = edgeDist(o, or), d1 = dist(p, or) - radius(o) - radius(or);
      return d1 < d0 - 0.05 && sees(g, or, o, p) ? d0 - d1 : null;
    });
    if (!q) continue;
    stepTo(g, o, q);
    note(g, side, `聚攏信眾：${opName(o, 'zh')} 免費${eng ? '撤退' : '衝刺'}，靠近佈道者`, `Rally the Flock: ${opName(o, 'en')} makes a free ${eng ? 'Fall Back' : 'Dash'} towards the orator`);
  }
}
const sees = (g, a, b, p) => { const sx = b.x, sy = b.y; b.x = p.x; b.y = p.y; const ok = visibility(g, a, b).visible || visibility(g, b, a).visible; b.x = sx; b.y = sy; return ok; };

// ---------- free moves (Rally the Flock, Miracle) ----------
/** The best destination of up to maxLen" (or null): score(p) gives a number, or null when the spot isn't acceptable. */
export function bestStep(g, o, maxLen, kind, score) {
  const ctx = moveCtx(g, o, kind === 'fallBack' ? 'fallBack' : 'dash');
  let best = null;
  for (const r of [maxLen, maxLen * 0.67, maxLen * 0.33]) for (let a = 0; a < 16; a++) {
    const p = { x: o.x + Math.cos(a * Math.PI / 8) * r, y: o.y + Math.sin(a * Math.PI / 8) * r };
    if (!ctx.free(p) || ctx.inEnemyER(p) || !ctx.segFree(o, p) || ctx.climbs?.([o, p])) continue;
    const path = wholeInchPath(ctx, { pts: [{ x: o.x, y: o.y }, p] }, maxLen, (q) => !ctx.inEnemyER(q));
    if (!path) continue;
    const q = path.pts.at(-1), s = score(q);
    if (s != null && (!best || s > best.s)) best = { q, s };
  }
  return best?.q || null;
}
export function stepTo(g, o, q) {
  const from = { x: o.x, y: o.y };
  Object.assign(o, { x: q.x, y: q.y });
  for (const m of g.markers || []) if (m.carriedBy === o.uid) { m.x = q.x; m.y = q.y; }
  o.acted.movedDist = (o.acted.movedDist || 0) + dist(from, q);
  checkMines(g, o);
  scTrapCheck(g, o);
}

// ---------- Miracle: a free Dash or Fall Back after being saved ----------
/** At the end of an action: a Miraculist that was just saved by Miracle moves away (3" at most). */
export function sfMiracleMoves(g) {
  for (const o of g.ops.filter((x) => x.sfMiracleNow && !x.dead)) {
    o.sfMiracleNow = false;
    const eng = isEngaged(g, o);
    const q = bestStep(g, o, 3, eng ? 'fallBack' : 'dash', (p) => Math.min(99, ...foes(g, o).map((e) => dist(p, e) - radius(e) - radius(o))));
    if (q) { stepTo(g, o, q); note(g, o.side, `奇蹟：${opName(o, 'zh')} 免費${eng ? '撤退' : '衝刺'}`, `Miracle: ${opName(o, 'en')} makes a free ${eng ? 'Fall Back' : 'Dash'}`); }
  }
}

// ---------- deaths: Redeemed Through Fire, Imperial Cult Devotion ----------
/** An incapacitation, before the operative is removed. */
export function sfDeath(g, src, target) {
  if (!isSF(target) || target.side > 1) return;
  if (hasBlaze(target) && autoFF(g, target.side, 'sfRedeemed')) {
    for (const e of foes(g, target).filter((x) => x.side < 2 && edgeDist(x, target) <= 2 && visibility(g, target, x).visible)) giveBlaze(g, target, e);
  }
  // Imperial Cult Devotion (Reliquant, once per TP): a ready friendly visible within 6" takes a free Shoot before it is removed.
  const rel = living(g, target.side).find((o) => tpl(o).sfReliquant && o.sfDevTP !== g.tp && edgeDist(o, target) <= 6 && visibility(g, o, target).visible);
  if (rel && target.readyAtDeath) {
    const w = tpl(target).weapons.filter((x) => x.type === 'ranged' && !x.rules.wreathed && !(x.rules.limited && (target.used?.[x.id] || 0) >= x.rules.limited))
      .sort((a, b) => b.atk * b.dmg[1] - a.atk * a.dmg[1])[0];
    const t = w && foes(g, target).filter((e) => e.side < 2 && edgeDist(target, e) <= (w.rules.range || 99) && visibility(g, target, e).visible).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) {
      rel.sfDevTP = g.tp;
      note(g, rel.side, `帝國教派奉獻：${opName(target, 'zh')} 殘廢前免費射擊 ${opName(t, 'zh')}`, `Imperial Cult Devotion: ${opName(target, 'en')} shoots ${opName(t, 'en')} for free before it falls`);
      forcedShot(g, target, w, [t], true);
    }
  }
}

// ---------- Commanding Declamation (Confessor) ----------
/** An enemy is about to Shoot, Fight or Charge near the Confessor: a D6 higher than its APL cancels the action (once it works). */
export function sfDeclaim(g, op, id) {
  if (!['shoot', 'fight', 'charge'].includes(id) || op.side > 1 || op.dead) return false;
  const c = living(g, 1 - op.side).find((o) => tpl(o).sfConfessor && !g.sfDecl?.[o.side] && edgeDist(o, op) <= 6 && visibility(g, o, op).visible);
  if (!c) return false;
  const r = d6(), apl = aplNow(g, op);
  if (r <= apl) { note(g, c.side, `號令宣告：擲 ${r}，沒有高過 ${opName(op, 'zh')} 的 APL ${apl}`, `Commanding Declamation: rolled ${r}, not above ${opName(op, 'en')}'s APL ${apl}`); return false; }
  g.sfDecl[c.side] = true;
  note(g, c.side, `號令宣告：擲 ${r} 高過 APL ${apl}，${opName(op, 'zh')} 不能進行這個動作（AP 不退還）`, `Commanding Declamation: rolled ${r} against APL ${apl} — ${opName(op, 'en')} can't perform that action (the AP isn't refunded)`);
  return true;
}

// ---------- actions ----------
const eligibleOrb = (g, op) => isSF(op) && (tpl(op).sfConflagrator || (equip(g, op.side, 'sfOrbs') && g.sfOrbTP?.[op.side] !== g.tp && !tpl(op).sfCherub && !tpl(op).sfAssassin && !tpl(op).sfMiraculist));
export function sfActions(g, op, add) {
  if (!isSF(op)) return;
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' }, DONE = { zh: '已用過', en: 'Already used' };
  if (eligibleOrb(g, op)) {
    const ok = !eng && !op.acted?.sfOrb && TARGET_ACTIONS.sfOrb.targets(g, op).length > 0;
    add('sfOrb', ok, eng ? ENG : op.acted?.sfOrb ? DONE : { zh: '6" 內沒有看得到的敵人', en: 'No visible enemy within 6"' });
  }
  if (tpl(op).sfMiraculist) {
    const here = foes(g, op).filter((e) => edgeDist(op, e) <= 1.01 && visibility(g, op, e).visible).length;
    const used = (op.used?.sfWreathe || 0) >= 1, shot = (op.acted?.shoot || 0) > 0;
    add('sfWreathe', !used && !shot && op.order === 'engage' && here > 0, used ? { zh: '已用過（限用 1 次）', en: 'Used up (Limited 1)' } : shot ? DONE : op.order !== 'engage' ? { zh: '需要交戰指令', en: 'Needs an Engage order' } : { zh: '1" 內沒有看得到的敵人', en: 'No visible enemy within 1"' });
  }
  if (tpl(op).sfAssassin) add('sfTrained', !eng && !op.acted?.sfTrained, eng ? ENG : DONE);
}
/** Self actions: Wreathe in Fire and Trained Assassin. */
export function sfSelf(g, op, id) {
  if (id === 'sfTrained') {
    spend(g, op, id);
    op.order = op.order === 'conceal' ? 'engage' : 'conceal';
    note(g, op.side, `${opName(op, 'zh')} 受過訓練的刺客：改為${op.order === 'engage' ? '交戰' : '隱蔽'}指令`, `${opName(op, 'en')} Trained Assassin: now has ${op.order === 'engage' ? 'an Engage' : 'a Conceal'} order`);
    return true;
  }
  if (id === 'sfWreathe') {
    const w = tpl(op).weapons.find((x) => x.rules.wreathed);
    const ts = foes(g, op).filter((e) => edgeDist(op, e) <= 1.01 && visibility(g, op, e).visible);
    if (!w || !ts.length) return true;
    spend(g, op, id);
    op.acted.shoot = (op.acted.shoot || 0) + 1;
    (op.used ||= {})[w.id] = (op.used[w.id] || 0) + 1;
    op.used.sfWreathe = 1;
    note(g, op.side, `${opName(op, 'zh')} 烈焰纏身：${ts.length} 名敵人受到攻擊`, `${opName(op, 'en')} Wreathe in Fire: ${ts.length} enemy operative(s) are attacked`);
    forcedShot(g, op, w, ts);
    return true;
  }
  return false;
}
export function registerSanctifierActions() {
  ACTIONS.sfIncentivise = { ap: 1, name: { zh: '激勵', en: 'Incentivise' } };
  TARGET_ACTIONS.sfIncentivise = {
    targets: (g, o) => (isEngaged(g, o) ? [] : living(g, o.side).filter((t) => t !== o && isSF(t) && !tpl(t).sfConfessor && !tpl(t).sfAssassin && !tpl(t).sfMiraculist && t !== sfOrator(g, o.side)
      && edgeDist(o, t) <= 2.01 && visibility(g, o, t).visible)),
    apply(g, o, t) {
      changeApl(g, t, 1);
      return { zh: `激勵：${opName(t, 'zh')} 到下次啟動結束 APL +1`, en: `Incentivise: ${opName(t, 'en')} gets +1 APL until the end of its next activation` };
    },
  };
  ACTIONS.sfOrb = { ap: 1, name: { zh: '淨化聖球', en: 'Sanctification Orb' } };
  TARGET_ACTIONS.sfOrb = {
    targets: (g, o) => foes(g, o).filter((e) => e.side < 2 && edgeDist(o, e) <= 6.01 && visibility(g, o, e).visible),
    apply(g, o, t) {
      if (!tpl(o).sfConflagrator) g.sfOrbTP[o.side] = g.tp;
      o.acted.sfOrb = 1;
      const hit = [t, ...foes(g, o).filter((e) => e !== t && e.side < 2 && edgeDist(t, e) <= 1.01)];
      const out = hit.map((e) => { const r = d6(); if (r >= 3) (e.sfDoused ||= [false, false])[o.side] = true; return `${opName(e, 'en')} ${r}${r >= 3 ? '✓' : ''}`; });
      return { zh: `淨化聖球：${hit.length} 名敵人做濕透檢定（3+ 獲得濕透標記）`, en: `Sanctification Orb: doused tests — ${out.join(', ')}` };
    },
  };
  ACTIONS.sfTrained = { ap: 1, name: { zh: '受過訓練的刺客', en: 'Trained Assassin' } };
  ACTIONS.sfWreathe = { ap: 1, name: { zh: '烈焰纏身', en: 'Wreathe in Fire' } };
}
