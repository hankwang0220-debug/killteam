import { abilityArmed, ACTIONS, TARGET_ACTIONS, tpl, living, foes, radius, edgeDist, isEngaged, visibility, shootCheck, weaponsFor, availableActions, spend, log, applyDamage, aplNow, hasPloy, getOp, readyOps, activate, d3 as roll3 } from './game.js';
import { dist, distPointRect } from './geometry.js';
import { moveCtx, findPath, wholeInchPath } from './path.js';
import { MD_DART, MD_GEM } from './data/mandrakes.js';

export const isMandrake = (o) => o?.team === 'mandrakes';
const equip = (g, side, id) => !!g.equip?.[side]?.includes(id);
// Heavy walls are assumed tall enough on the existing flat-board maps.
export function withinShadow(g, o) {
  return o.x > -50 && (g.terrain.some((t) => t.kind === 'heavy' && distPointRect(o, t) - radius(o) <= 1.01)
    || (g.markers || []).some((m) => m.kind === 'mdPortal' && dist(o, m) - radius(o) <= 1.01));
}
export function mandrakeRosterError(t, roster = {}) {
  const ids = t.ops.filter((o) => o.count).flatMap((o) => Array.from({ length: o.count }, (_, i) => (Array.isArray(roster[o.id]) ? roster[o.id][i] : roster[o.id]) || o.id));
  return ids.length !== 9 || ids.filter((id) => id === 'mdNightfiend').length !== 1 || ids.some((id) => id !== 'mdWarrior' && ids.filter((x) => x === id).length > 1)
    ? { zh: '曼德拉須有一名夜魔、共九名特工，專家不可重複。', en: 'Mandrakes require one Nightfiend, nine operatives, and unique specialists.' } : null;
}
export function mdSetup(g, roster) {
  for (const side of [0, 1]) if (g.teams[side] === 'mandrakes') {
    const error = mandrakeRosterError({ ops: g.ops.filter((o) => o.side === side).map((o) => ({ id: o.tplId, count: 1 })) }, {});
    if (error) throw new Error(error.en);
  }
}
export function mdReady(g) {
  for (const o of living(g)) if (tpl(o).mdOubliex) o.mdOubliex = true;
}
export function mdStrategy(g) {
  for (const o of living(g).filter((x) => tpl(x).mdProjection)) {
    const t = foes(g, o).filter((e) => e.placed && !e.reserve).sort((a, b) => edgeDist(o, a) - edgeDist(o, b))[0];
    (g.mdFocus ||= [null, null])[o.side] = t?.uid || null;
  }
}
export function mdActivate(g, o) {
  // Expiry is at the START of the source's activation, not at the end.
  for (const x of g.ops) { if (x.mdBalefire === o.uid) x.mdBalefire = null; if (x.mdProjection === o.uid) x.mdProjection = null; }
  o.mdGlyph = false;
  if (isMandrake(o) && !g.counter && withinShadow(g, o) && (equip(g, o.side, 'mdGlyph') && abilityArmed(g, o.side, 'mdGlyph')) && g.mdGlyphTP?.[o.side] !== g.tp) {
    o.mdGlyph = true; (g.mdGlyphTP ||= [0, 0])[o.side] = g.tp;
  }
}
export function mdProjected(g, o) { return !!o.mdProjection && !getOp(g, o.mdProjection)?.dead; }
export function mdRules(g, o, w, target, r) {
  if (isMandrake(o) && withinShadow(g, o) && hasPloy(g, o.side, 'mdNightmare')) r.balanced = true;
  if (w.type === 'ranged' && isMandrake(o) && target?.mdBalefire && getOp(g, target.mdBalefire)?.side === o.side && !getOp(g, target.mdBalefire)?.dead) r.saturate = true;
}
export function mdRangedBonus(g, o, t) {
  let n = 0;
  const source = t.mdBalefire && getOp(g, t.mdBalefire);
  if (source && !source.dead) {
    if (isMandrake(o) && source.side === o.side && t.side !== o.side) n++;
    if (isMandrake(t) && source.side === t.side) n--;
  }
  return n;
}
export function mdWeapons(g, o, ws) {
  if (!isMandrake(o)) return ws;
  if (equip(g, o.side, 'mdDarts') && g.mdDartTP?.[o.side] !== g.tp) ws = [...ws, MD_DART];
  if (equip(g, o.side, 'mdGem') && g.mdGemTP?.[o.side] !== g.tp && ws.some((w) => w.id === 'mdBaleblast')) ws = [...ws, MD_GEM];
  return ws;
}
export function mdShot(g, o, w) {
  if (w.id === 'mdDart') (g.mdDartTP ||= [0, 0])[o.side] = g.tp;
  if (w.id === 'mdGemBlast') (g.mdGemTP ||= [0, 0])[o.side] = g.tp;
  if (o.mdFocusTarget) o.mdFocusTarget = null;
}
export function mdHarvest(g, o, t, weaponId) {
  if (!t.dead || !tpl(o).mdHarvest || !['mdBaleblade', 'mdCollector'].includes(weaponId)) return;
  (g.mdSouls ||= [0, 0])[o.side] += aplNow(g, t) >= 3 ? 2 : 1;
  log(g, { zh: `收割靈魂：${g.mdSouls[o.side]} 點`, en: `Soul Harvest: ${g.mdSouls[o.side]} points` }, `side${o.side}`);
}
export function mdKill(g, o, t, id) {
  mdHarvest(g, o, t, id);
  if (tpl(o).mdOubliex && id === 'mdHuskblade' && !o.dead) o.mdOubliex = true;
}
export function mdDeath(g, o) {
  for (const x of g.ops) { if (x.mdBalefire === o.uid) x.mdBalefire = null; if (x.mdProjection === o.uid) x.mdProjection = null; }
  g.smoke = (g.smoke || []).filter((s) => s.mdSource !== o.uid);
}
export function mdFeast(g, o, t, count, useFF) {
  if (isMandrake(o) && !o.dead && o.wounds < o.maxW && count > 0 && edgeDist(o, t) <= 6.01 && useFF(g, o.side, 'mdFeast')) {
    o.wounds = Math.min(o.maxW, o.wounds + aplNow(g, t) * count);
  }
}

const portalNear = (o, p) => dist(o, p) - radius(o) <= 1.01;
export function shadowPassageCheck(g, o, p) {
  const a = availableActions(g, o).find((x) => x.id === 'mdPass');
  if (!a?.ok) return { ok: false, why: { zh: '目前不能使用暗影通道', en: 'Shadow Passage unavailable' } };
  const end = { ...o, ...p }, ctx = moveCtx(g, o);
  if (!ctx.free(p) || ctx.inEnemyER(p) || !withinShadow(g, end)) return { ok: false, why: { zh: '落點須合法、位於暗影且離開敵人控制範圍', en: 'Destination must be legal, in shadow, and outside enemy control' } };
  if (foes(g, o).some((e) => shootCheck(g, { ...e, order: 'engage', ap: 99, acted: {}, mdPassLockTP: null, mdFocusTarget: null }, end, { type: 'ranged', rules: {}, hit: 3, atk: 4, dmg: [3, 4], id: 'mdProbe', group: 'mdProbe' }).ok)) return { ok: false, why: { zh: '落點會成為敵人有效目標', en: 'Destination is a valid enemy target' } };
  const portals = (g.markers || []).filter((m) => m.kind === 'mdPortal' && m.owner === o.side);
  const pair = o.mdPortalTP !== g.tp && portals.length === 2 && portals.some((m, i) => portalNear(o, m) && portalNear(end, portals[1 - i]));
  if (g.mdPassTP?.[o.side] === g.tp && !pair) return { ok: false, why: { zh: '本回合普通通道已用；須在兩門之間傳送', en: 'Normal passage used; must travel between the two portals' } };
  return { ok: true, pair };
}
export function doShadowPassage(g, o, p) {
  const c = shadowPassageCheck(g, o, p); if (!c.ok) return false;
  const start = { x: o.x, y: o.y };
  spend(g, o, 'reposition');
  if (c.pair) o.mdPortalTP = g.tp; else (g.mdPassTP ||= [0, 0])[o.side] = g.tp;
  o.x = p.x; o.y = p.y; o.mdPassLockTP = g.tp;
  if (tpl(o).mdPortal) {
    g.markers = (g.markers || []).filter((m) => m.kind !== 'mdPortal' || m.owner !== o.side);
    g.markers.push(...[start, p].map((q, i) => ({ ...q, id: `mdPortal-${o.side}-${i}`, kind: 'mdPortal', owner: o.side, carriedBy: null })));
  }
  log(g, { zh: '暗影通道：重新定位，本回合不能射擊／近戰', en: 'Shadow Passage: Repositioned; no Shoot/Fight this TP' }, `side${o.side}`);
  return true;
}
export function mdActions(g, o, add) {
  if (!isMandrake(o)) return;
  const engaged = isEngaged(g, o), done = { zh: '條件不符或已使用', en: 'Unavailable or already used' };
  const reposition = availableReposition(g, o);
  add('mdPass', !o.counter && reposition && withinShadow(g, o) && (g.mdPassTP?.[o.side] !== g.tp || (o.mdPortalTP !== g.tp && (g.markers || []).some((m) => m.kind === 'mdPortal' && m.owner === o.side && portalNear(o, m)))), done);
  for (const [id, flag] of [['mdWreathe', 'mdBalefire'], ['mdProject', 'mdProjection'], ['mdWeave', 'mdPortal']]) {
    if (tpl(o)[flag]) add(id, !o.acted[id] && (!engaged || id === 'mdProject') && TARGET_ACTIONS[id].targets(g, o).length > 0, done);
  }
  if (!o.counter && (g.mdSouls?.[o.side] || 0) > 0) {
    const start = !Object.keys(o.acted).some((k) => o.acted[k]);
    add('mdSoulApl', start && !o.mdSoulApl, done);
    add('mdSoulHeal', start && o.wounds < o.maxW, done);
  }
}
// Avoid availableActions recursion while computing the special Reposition option.
function availableReposition(g, o) { return !isEngaged(g, o) && !['reposition', 'charge', 'fallBack'].some((id) => o.acted[id]) && (!o.acted.heavy || o.acted.heavy === 'reposition'); }
export function mdSelfAction(g, o, id) {
  if (!['mdSoulApl', 'mdSoulHeal'].includes(id)) return false;
  if (!availableActions(g, o).find((a) => a.id === id)?.ok) return false;
  g.mdSouls[o.side]--;
  if (id === 'mdSoulApl') { o.mdSoulApl = true; o.ap++; } else o.wounds = Math.min(o.maxW, o.wounds + roll3() + roll3());
  o.acted[id] = true; o.orderSet = true;
  return true;
}
export function mdFallBack(g, o, d6, d3) {
  const enemies = foes(g, o).filter((e) => isMandrake(e) && edgeDist(o, e) <= 1.01);
  for (const e of enemies) if (equip(g, e.side, 'mdSnare') && g.mdSnareTP?.[e.side] !== g.tp && foes(g, e).filter((t) => edgeDist(e, t) <= 1.01).length === 1) {
    const rolls = Array.from({ length: o.maxW > e.maxW ? 1 : 2 }, d6);
    if (rolls.some((v) => v >= 4)) { (g.mdSnareTP ||= [0, 0])[e.side] = g.tp; o.acted.fallBackDenied = true; log(g, { zh: '鏈索陷阱：撤退被阻止（不花 AP）', en: 'Chain Snare: Fall Back prevented, no AP spent' }, `side${e.side}`); return false; }
  }
  for (const e of enemies.filter((x) => tpl(x).mdHarvest)) {
    applyDamage(g, e, o, d3() + d3()); if (o.dead) { mdHarvest(g, e, o, 'mdCollector'); return false; }
  }
  return true;
}
export function mdInterrupt(g, o, d6) {
  if (g.counter || g.mdResume || o.team === 'npo') return false;
  const dirge = foes(g, o).find((e) => tpl(e).mdProjection && e.ready && g.mdFocus?.[e.side] === o.uid && o.mdInterruptedTP !== g.tp);
  if (dirge) {
    const probe = { ...dirge, order: 'engage', ap: 3, acted: {} };
    const canHit = edgeDist(dirge, o) <= 1.01 || weaponsFor(g, dirge).some((w) => w.type === 'ranged' && shootCheck(g, probe, o, w).ok);
    if (canHit) { o.mdInterruptedTP = g.tp; g.mdResume = { uid: o.uid, side: o.side }; g.turn = dirge.side; activate(g, dirge); dirge.order = 'engage'; dirge.mdFocusTarget = o.uid; return true; }
  }
  const night = foes(g, o).find((e) => tpl(e).mdOubliex && edgeDist(e, o) <= 6.01);
  if (night && o.mdInterruptedTP !== g.tp && readyOps(g, o.side).some((x) => x !== o)) {
    o.mdInterruptedTP = g.tp;
    if (d6() > aplNow(g, o)) { o.mdWhisperTP = g.tp; log(g, { zh: '恐懼低語：這次請改選其他特工', en: 'Harrowing Whispers: select another operative for this activation' }, `side${night.side}`); return true; }
  }
  return false;
}
export function mdEnd(g, o, useFF) {
  if (!o) return;
  // Optional reactions use the simulator's automatic recipient convention.
  for (const side of [0, 1]) if (g.teams[side] === 'mandrakes') {
    const eligible = living(g, side).filter((x) => x.order === 'engage' && withinShadow(g, x));
    const pick = eligible.find((x) => x === o) || eligible[0];
    if (pick && useFF(g, side, 'mdSlither')) pick.order = 'conceal';
    if (o.side !== side && !o.counter && g.tp > 1 && hasPloy(g, side, 'mdCreeping')) {
      for (const x of living(g, side).filter((x) => x.order === 'conceal' && withinShadow(g, x) && x.mdCreepTP !== g.tp && !isEngaged(g, x))) {
        const ctx = moveCtx(g, x), candidates = [];
        for (let dx = -3; dx <= 3; dx += 1) for (let dy = -3; dy <= 3; dy += 1) {
          const p = { x: x.x + dx, y: x.y + dy };
          if (dist(x, p) < 0.1 || !ctx.free(p) || ctx.inEnemyER(p) || !withinShadow(g, { ...x, ...p })) continue;
          const raw = findPath(ctx, p), path = raw && wholeInchPath(ctx, raw, 3, (q) => !ctx.inEnemyER(q) && withinShadow(g, { ...x, ...q }));
          if (path) candidates.push({ p: path.pts.at(-1), path });
        }
        const score = (p) => Math.min(...g.objectives.map((m) => dist(p, m)));
        candidates.sort((a, b) => score(a.p) - score(b.p));
        const dest = candidates[0];
        if (dest && score(dest.p) < score(x)) { x.x = dest.p.x; x.y = dest.p.y; x.mdCreepTP = g.tp; log(g, { zh: '潛行恐懼：免費衝刺', en: 'Creeping Horror: free Dash' }, `side${side}`); break; }
      }
    }
  }
}
export function registerMandrakeActions() {
  for (const [id, zh, en, ap] of [['mdPass', '暗影通道', 'Shadow Passage', 1], ['mdWreathe', '冥焰纏身', 'Wreathe in Balefire', 1], ['mdProject', '幻象投射', 'Pareidolic Projection', 1], ['mdWeave', '編織黑暗', 'Weave Darkness', 1], ['mdSoulApl', '收割靈魂：永久 APL +1', 'Soul Harvest: permanent +1 APL', 0], ['mdSoulHeal', '收割靈魂：回復 2D3', 'Soul Harvest: heal 2D3', 0]]) ACTIONS[id] = { ap, name: { zh, en } };
  TARGET_ACTIONS.mdWreathe = { targets: (g, o) => living(g).filter((t) => !t.mdBalefire && visibility(g, o, t).visible), apply(g, o, t) { for (const x of g.ops) if (x.mdBalefire === o.uid) x.mdBalefire = null; t.mdBalefire = o.uid; return { zh: '放置冥焰標記', en: 'places a Balefire token' }; } };
  TARGET_ACTIONS.mdProject = { targets: (g, o) => foes(g, o).filter((t) => (!isEngaged(g, o) || foes(g, o).filter((e) => edgeDist(e, o) <= 1.01).every((e) => e === t)) && (withinShadow(g, t) || shootCheck(g, { ...o, ap: 99, order: 'engage', acted: {} }, t, { ...MD_GEM, rules: {} }).ok)), apply(g, o, t) { for (const x of g.ops) if (x.mdProjection === o.uid) x.mdProjection = null; t.mdProjection = o.uid; return { zh: '投射幻象：Move -2、命中變差 1', en: 'projects a visage: -2 Move, worsen Hit by 1' }; } };
  TARGET_ACTIONS.mdWeave = { targets: (g, o) => living(g).filter((t) => visibility(g, o, t).visible), apply(g, o, t) { g.smoke = (g.smoke || []).filter((s) => s.mdSource !== o.uid); g.smoke.push({ x: t.x, y: t.y, tp: g.tp, mdSource: o.uid, persistent: true }); return { zh: '編織持續黑暗煙霧', en: 'weaves persistent smoke' }; } };
}
