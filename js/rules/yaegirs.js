// yaegirs: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { CONTROL, OBJ_R, applyDamage, autoFF, avgDmg, boardOf, d3, d6, deployZones, edgeDist, ffArmed, ffReady, foes, isEngaged, living, log, moveStat, opName, radius, resolveShoot, shootCheck, startOfActivation, team, teamZh, tpl, visibility, weaponsFor } from '../game.js';
import { dist, distPointRect } from '../geometry.js';
import { findPath, moveCtx, wholeInchPath } from '../path.js';


// ---------- Hernkyn Yaegirs ----------
export const isHY = (op) => !!TEAM_MAP[op?.team]?.yaegirs;
export const isHYTeam = (g, side) => side < 2 && !!TEAM_MAP[g.teams[side]]?.yaegirs;
export const resourceLeft = (g, side) => (isHYTeam(g, side) && g.resTP?.[side] === g.tp ? g.res?.[side] || 0 : 0);
/** Ready step (after the first TP): Resourceful points by friendlies not in enemy control range (5+ → 2, 3-4 → 1), +1 Veteran Adventurer. */
export function yaegirReady(g) {
  for (const side of [0, 1]) {
    if (!isHYTeam(g, side)) continue;
    (g.res ||= [0, 0])[side] = 0; (g.resTP ||= [0, 0])[side] = g.tp;
    // Minefield (Ironbraek): when it's readied out of enemy control range, one flipped marker in its control range is reset.
    for (const ib of living(g, side).filter((o) => tpl(o).minefield && !isEngaged(g, o))) {
      const m = (g.markers || []).find((x) => x.kind === 'hyMine' && x.owner === side && x.flipped && dist(ib, x) - radius(ib) - OBJ_R <= CONTROL);
      if (m) { m.flipped = false; log(g, { zh: `${opName(ib, 'zh')} 重設一個地雷區標記`, en: `${opName(ib, 'en')} resets a Minefield marker` }, `side${side}`); }
    }
    if (g.tp === 1) continue;
    const free = living(g, side).filter((o) => !isEngaged(g, o)).length;
    const vet = living(g, side).some((o) => tpl(o).veteranAdventurer && !isEngaged(g, o)) ? 1 : 0;
    g.res[side] = (free >= 5 ? 2 : free >= 3 ? 1 : 0) + vet;
    if (g.res[side]) log(g, { zh: `${teamZh(g, side)} 獲得 ${g.res[side]} 資源點${vet ? '（含老練冒險家 1 點）' : ''}`, en: `${team(g, side).name.en} gains ${g.res[side]} Resourceful point(s)${vet ? ' (1 from Veteran Adventurer)' : ''}` }, `side${side}`);
  }
}
/** Resourceful: the uses open to the active operative now ('apl': +1 APL; 'heal': D3+1 when activated). */
export function resourceOptions(g, op) {
  if (!isHY(op) || g.active !== op.uid || g.phase !== 'firefight' || op.dead || !resourceLeft(g, op.side) || op.acted.resUsed || isEngaged(g, op)) return [];
  return [{ id: 'apl' }, ...(startOfActivation(op) && op.wounds < op.maxW ? [{ id: 'heal' }] : [])];
}
export function useResource(g, op, id) {
  if (!resourceOptions(g, op).some((o) => o.id === id)) return false;
  g.res[op.side]--; op.acted.resUsed = id;
  if (id === 'apl') { op.ap += 1; if (tpl(op).intrepid) op.mania = true; } // (Intrepid: until the start of its next activation)
  let gain = 0;
  if (id === 'heal') { const b = op.wounds; op.wounds = Math.min(op.maxW, op.wounds + (tpl(op).intrepid ? 4 : d3() + 1)); gain = op.wounds - b; }
  log(g, { zh: `${opName(op, 'zh')} 使用資源點：${id === 'apl' ? 'APL +1' : `回復 ${gain} 生命`}（剩 ${g.res[op.side]}）`, en: `${opName(op, 'en')} spends a Resourceful point: ${id === 'apl' ? '+1 APL' : `regains ${gain} wounds`} (${g.res[op.side]} left)` }, `side${op.side}`);
  return true;
}
/** Minefield (Ironbraek): five face-down markers (three HY-Pex mines, two blanks) set up automatically before the battle. */
export function setupMinefield(g, side) {
  if (!isHYTeam(g, side) || !g.ops.some((o) => o.side === side && tpl(o).minefield)) return;
  const opp = deployZones(g)[1 - side];
  const zoneDist = (p, z) => Math.hypot(Math.max(0, z.x0 - p.x, p.x - z.x1), Math.max(0, (z.y0 ?? 0) - p.y, p.y - (z.y1 ?? boardOf(g).h)));
  const cands = [];
  for (let x = 1.5; x <= boardOf(g).w - 1.5; x += 1) for (let y = 1.5; y <= boardOf(g).h - 1.5; y += 1) {
    const p = { x, y }, dz = zoneDist(p, opp);
    if (dz <= 6.2 || g.terrain.some((t) => distPointRect(p, t) < 0.6)) continue;
    cands.push({ p, s: -Math.abs(dz - 8) * 0.6 - Math.min(...(g.objectives || []).map((o) => dist(o, p))) * 0.3 + Math.random() * 1.5 });
  }
  cands.sort((a, b) => b.s - a.s);
  const placed = [];
  for (const c of cands) {
    if (placed.length >= 5) break;
    if (placed.some((m) => dist(m, c.p) <= 6.05) || [...(g.markers || []), ...(g.objectives || [])].some((m) => dist(m, c.p) <= 2.05)) continue;
    placed.push(c.p);
  }
  const live = [true, true, true, false, false].sort(() => Math.random() - 0.5);
  placed.forEach((p, i) => (g.markers ||= []).push({ id: g.markers.length, kind: 'hyMine', owner: side, x: p.x, y: p.y, carriedBy: null, live: live[i], flipped: false }));
  log(g, { zh: `${teamZh(g, side)} 佈下 ${placed.length} 個地雷區標記（3 個是 HY-Pex 地雷，其餘是空的）`, en: `${team(g, side).name.en} sets up ${placed.length} Minefield markers (three are HY-Pex mines, the rest blanks)` }, `side${side}`);
}
/** HY-Pex mines: a face-down marker in an enemy's control range (and no friendly Yaegir's) is flipped. */
export function hyMines(g, op) {
  for (const m of (g.markers || []).filter((x) => x.kind === 'hyMine' && !x.flipped && x.owner !== op.side)) {
    if (op.dead || op.side > 1 || dist(op, m) - radius(op) - OBJ_R > CONTROL) continue;
    if (living(g, m.owner).some((f) => isHY(f) && dist(f, m) - radius(f) - OBJ_R <= CONTROL)) continue;
    m.flipped = true;
    if (!m.live) { log(g, { zh: `${opName(op, 'zh')} 翻開一個地雷區標記：是空的`, en: `${opName(op, 'en')} flips a Minefield marker: a blank` }, `side${m.owner}`); continue; }
    const r = d6(), dmg = 3 + (r < tpl(op).save ? r : 0);
    log(g, { zh: `💥 ${opName(op, 'zh')} 踩到 HY-Pex 地雷（擲 ${r}）：受到 ${dmg} 傷害`, en: `💥 ${opName(op, 'en')} sets off a HY-Pex mine (rolled ${r}): takes ${dmg} damage` }, 'kill');
    applyDamage(g, null, op, dmg);
  }
}
/** Dauntless Explorers (TP1 gambit): friendlies wholly within the drop zone Reposition, ending wholly within 4" of it. */
export function dauntlessExplorers(g, side) {
  if (!isHYTeam(g, side) || g.tp !== 1 || g.dauntless?.[side]) return;
  (g.dauntless ||= [false, false])[side] = true;
  const z = deployZones(g)[side];
  const zd = (p, r) => Math.hypot(Math.max(0, z.x0 - (p.x - r), (p.x + r) - z.x1), Math.max(0, (z.y0 ?? 0) - (p.y - r), (p.y + r) - (z.y1 ?? boardOf(g).h)));
  let n = 0;
  for (const op of living(g, side).filter((o) => isHY(o) && zd(o, radius(o)) <= 0.01)) {
    const ctx = moveCtx(g, op), r = radius(op), max = moveStat(g, op);
    const goal = [...(g.objectives || [])].sort((a, b) => dist(op, a) - dist(op, b))[0];
    if (!goal) continue;
    let best = null;
    for (let a = 0; a < 16; a++) for (const f of [1, 0.66, 0.33]) {
      const q = { x: op.x + Math.cos(a * Math.PI / 8) * max * f, y: op.y + Math.sin(a * Math.PI / 8) * max * f };
      if (zd(q, r) > 4 || !ctx.free(q) || ctx.inEnemyER(q)) continue;
      const raw = findPath(ctx, q), path = raw && wholeInchPath(ctx, raw, max, (p) => !ctx.inEnemyER(p) && zd(p, r) <= 4);
      if (!path || path.len > max + 0.01) continue;
      const end = path.pts.at(-1), s = dist(op, goal) - dist(end, goal);
      if (s > 0.5 && (!best || s > best.s)) best = { q: end, path, s };
    }
    if (!best) continue;
    op.x = best.q.x; op.y = best.q.y; n++;
    (g.trailLog ||= []).push({ uid: op.uid, side, tp: g.tp, kind: 'reposition', len: Math.round(best.path.len * 10) / 10, pts: best.path.pts.map((p) => ({ x: p.x, y: p.y })) });
  }
  log(g, { zh: `無畏探險者：${n} 名友方免費移動`, en: `Dauntless Explorers: ${n} friendlies Reposition for free` }, `side${side}`);
}
/** Wroughtlock Negotiation (Bombast gambit): a free Shoot now (an Engage-order Bombast, or the computer's). */
export function wroughtlockNegotiation(g, side) {
  if (!isHYTeam(g, side) || g.negotiationTP?.[side] === g.tp) return;
  (g.negotiationTP ||= [0, 0])[side] = g.tp;
  const b = living(g, side).find((o) => tpl(o).negotiation && !isEngaged(g, o));
  if (!b || (b.order !== 'engage' && g.ai !== side)) return;
  const w = tpl(b).weapons.find((x) => x.id === 'hyWroughtlock');
  const keep = { order: b.order, ap: b.ap, acted: b.acted };
  b.order = 'engage'; b.acted = {}; b.ap = 1;
  const t = foes(g, b).filter((e) => e.side < 2 && shootCheck(g, b, e, w).ok).sort((x, y) => x.wounds - y.wounds)[0];
  if (!t) { Object.assign(b, keep); return; }
  log(g, { zh: `${opName(b, 'zh')} 鍛鎖談判：免費射擊 ${opName(t, 'zh')}`, en: `${opName(b, 'en')} Wroughtlock Negotiation: a free Shoot at ${opName(t, 'en')}` }, `side${side}`);
  b.negotiatedTP = g.tp;
  resolveShoot(g, b, w, t);
  b.ap = keep.ap; b.acted = keep.acted;
}
/** Stalwart Defence (firefight ploy): an enemy ends a Charge by a Yaegir — another one within 6" shoots it. */
export function stalwartDefence(g, enemy) {
  for (const side of [0, 1]) {
    if (side === enemy.side || !isHYTeam(g, side) || enemy.dead || !ffReady(g, side, 'stalwartDefence') || !ffArmed(g, side, 'stalwartDefence')) continue;
    const charged = living(g, side).filter((f) => isHY(f) && edgeDist(f, enemy) <= CONTROL + 0.01);
    g.stalwart = { target: enemy.uid };
    let best = null;
    for (const s of living(g, side).filter((o) => isHY(o) && !charged.includes(o) && !isEngaged(g, o) && charged.some((c) => edgeDist(c, o) <= 6 && visibility(g, c, o).visible))) {
      const keep = { ap: s.ap, acted: s.acted }; s.ap = 1; s.acted = {};
      for (const w of weaponsFor(g, s).filter((x) => x.type === 'ranged' && !x.rules.blast && !x.rules.devSplash)) if (shootCheck(g, s, enemy, w).ok && (!best || avgDmg(w) > avgDmg(best.w))) best = { s, w };
      s.ap = keep.ap; s.acted = keep.acted;
    }
    if (best && autoFF(g, side, 'stalwartDefence')) {
      const { s, w } = best, keep = { ap: s.ap, acted: s.acted };
      g.stalwart.by = s.uid; s.ap = 1; s.acted = {};
      log(g, { zh: `堅毅防守：${opName(s, 'zh')} 對衝鋒過來的 ${opName(enemy, 'zh')} 開火`, en: `Stalwart Defence: ${opName(s, 'en')} shoots ${opName(enemy, 'en')}` }, `side${side}`);
      resolveShoot(g, s, w, enemy);
      s.ap = keep.ap; s.acted = keep.acted;
    }
    g.stalwart = null;
  }
}
/** No Kin Left Behind: within 3" of the Fallen Kin marker, one fail → normal success (or one normal → critical). */
export const kinPost = (g, op) => (isHY(op) && op.side < 2 && (g.markers || []).some((m) => m.kind === 'fallenKin' && m.owner === op.side && dist(op, m) - radius(op) <= 3) ? (pool) => {
  const m = pool.dice.find((x) => x.res === 'miss');
  if (m) { m.res = 'norm'; m.indo = true; pool.norms++; return; }
  const n = pool.dice.find((x) => x.res === 'norm');
  if (n) { n.res = 'crit'; n.rend = true; pool.norms--; pool.crits++; }
} : null);
export const chainPost = (a, b) => (a && b ? (p) => { a(p); b(p); } : a || b);
/** Bonds That Bind: ready Yaegirs visible within 3" (not a Bombast that used Wroughtlock Negotiation this TP). */
export const bondsCands = (g, o) => living(g, o.side).filter((x) => x !== o && x.ready && isHY(x) && x.negotiatedTP !== g.tp && edgeDist(x, o) <= 3 && visibility(g, o, x).visible);
