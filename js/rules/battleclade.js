// battleclade: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CONTROL, OBJ_R, TARGET_ACTIONS, advanceStrategy, aplNow, availableActions, boardOf, deployZones, doMissionAction, doMove, doPickUp, dropMarkers, edgeDist, hasPloy, isEngaged, living, log, mission, missionActionsFor, moveAllowance, opName, ployChooser, radius, sameTeam, team, teamZh, tpl, visibility } from '../game.js';
import { TEAM_MAP } from '../data/teams.js';
import { dist, distPointRect } from '../geometry.js';
import { findPath, moveCtx, wholeInchPath } from '../path.js';


// ---------- Battleclade ----------
export const isServitor = (op) => !!tpl(op).servitor;
/** Within 6" of a friendly Auto-proxy or the Servitor Underseer (Noospheric Possession, Network Override, Datacoronal Accumulator). */
export const nearRelay = (g, op, d = 6) => living(g, op.side).some((r) => (tpl(r).autoProxy || tpl(r).underseer) && edgeDist(r, op) <= d);
/** Achillan Eye (Auto-proxy): shooting an enemy it can see — Saturate (not while it's in an enemy's control range). */
export const achillan = (g, op, target) => !!target && living(g, op.side).some((p) => tpl(p).achillanEye && sameTeam(p, op) && !isEngaged(g, p) && visibility(g, p, target).visible);
/** Servitors that can NETWORK COUNTERACT now (APL 2+, not done this TP, not the one that just activated). */
export function netCands(g, side) {
  const n = g.netcounter;
  return living(g, side).filter((o) => isServitor(o) && o.netTP !== g.tp && !o.counteracted && aplNow(g, o) >= 2 && o.uid !== n?.by && (!n?.only || n.only.includes(o.uid)));
}
/** End of a side's Strategy phase: the Prioritised Acquisition marker is the objective nearest the team. */
export function battlecladeStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].noosphericNetwork || !hasPloy(g, side, 'prioritisedAcq') || g.acquisition?.[side]?.tp === g.tp || !g.objectives?.length) return;
  const mine = living(g, side), d = (o) => Math.min(...mine.map((m) => dist(m, o)));
  const obj = [...g.objectives].sort((a, b) => d(a) - d(b))[0];
  (g.acquisition ||= [null, null])[side] = { tp: g.tp, id: obj.id, x: obj.x, y: obj.y };
  log(g, { zh: `${teamZh(g, side)} 優先取得：目標點 ${obj.id + 1}`, en: `${team(g, side).name.en} Prioritised Acquisition: objective ${obj.id + 1}` }, `side${side}`);
}

/** Seeker of Divine Arcana: one strategic gambit, an order change and/or one free action. */
export function seekerOptions(g, op) {
  if (!op || !tpl(op).omniscanner || op.dead || g.phase !== 'strategy' || op.side !== ployChooser(g) || op.seekerTP === g.tp) return [];
  const allowed = ['omniscanner', 'fallBack', 'reposition', 'pickUp', ...missionActionsFor(g,op.side)];
  const probe = { ...op, ap:99, acted:{}, counter:false };
  const result = availableActions(g,probe).filter(a => allowed.includes(a.id) && a.ok && !(a.id==='reposition' && op.feGuisesTP===g.tp));
  if ((g.markers || []).some(m=>m.carriedBy===op.uid)) result.push({id:'seekerPlace',ap:0,ok:true});
  return result;
}

export function seekerZoneGap(g, op, p) {
  const z=deployZones(g)[op.side],r=radius(op);
  return distPointRect(p,{x:z.x0+r,y:(z.y0??0)+r,w:Math.max(0,z.x1-z.x0-2*r),h:Math.max(0,(z.y1??boardOf(g).h)-(z.y0??0)-2*r)});
}

export function seekerMoveCheck(g, op, action, path) {
  const ctx=moveCtx(g,op,action),max=moveAllowance(g,op,action);
  const legal=wholeInchPath(ctx,path,max,p=>!ctx.inEnemyER(p));
  if (!legal || legal.len > max+.01) return false;
  const end=legal.pts.at(-1);
  if ((g.markers||[]).some(m=>m.carriedBy===op.uid)) return true;
  const markers=[...g.objectives,...(g.markers||[]).filter(m=>!m.carriedBy && (mission(g).canPickUp?.(g,op,m) || ['retrieval','banner','orb','data','energyCell'].includes(m.kind)))];
  if (markers.some(m=>dist(end,m)-radius(op)-OBJ_R <= CONTROL+.01) || seekerZoneGap(g,op,end)<.01) return true;
  // If the drop zone cannot be reached this move, find the closest legal reachable position.
  let best=seekerZoneGap(g,op,op);
  for(let x=Math.max(radius(op),op.x-max);x<=Math.min(boardOf(g).w-radius(op),op.x+max);x+=.5)
    for(let y=Math.max(radius(op),op.y-max);y<=Math.min(boardOf(g).h-radius(op),op.y+max);y+=.5){
      const p={x,y},gap=seekerZoneGap(g,op,p);
      if(gap>=best || !ctx.free(p) || ctx.inEnemyER(p))continue;
      const route=findPath(ctx,p),candidate=route&&wholeInchPath(ctx,route,max,q=>!ctx.inEnemyER(q));
      if(candidate) best=Math.min(best,seekerZoneGap(g,op,candidate.pts.at(-1)));
    }
  return best>.01 && seekerZoneGap(g,op,end)<=best+.05;
}

export function useSeeker(g, op, order, action=null, target=null, path=null) {
  if (!op || !tpl(op).omniscanner || op.dead || g.phase!=='strategy' || op.side!==ployChooser(g) || op.seekerTP===g.tp || !['engage','conceal'].includes(order)) return false;
  if (action && !seekerOptions(g,op).some(a=>a.id===action)) return false;
  if (action==='omniscanner' && !TARGET_ACTIONS.omniscanner.targets(g,op).includes(target)) return false;
  if (['reposition','fallBack'].includes(action) && !seekerMoveCheck(g,op,action,path)) return false;
  if(action==='reposition')op.feSeekerTP=g.tp;
  const before={ap:op.ap,acted:op.acted,order:op.order};
  op.order=order; op.acted={}; g.seekerFree=op.uid;
  try {
    if(action==='omniscanner'){const msg=TARGET_ACTIONS.omniscanner.apply(g,op,target);log(g,msg,`side${op.side}`);}
    else if(action==='seekerPlace'){dropMarkers(g,op);log(g,{zh:'放置標記（免費）',en:'Place Marker (free)'},`side${op.side}`);}
    else if(action==='pickUp') doPickUp(g,op);
    else if(['reposition','fallBack'].includes(action)) { if(doMove(g,op,action,path)===false) {op.order=before.order;return false;} }
    else if(action) doMissionAction(g,op,action);
  } finally {op.ap=before.ap;op.acted=before.acted;delete g.seekerFree;}
  op.seekerTP=g.tp;
  log(g,{zh:`${opName(op,'zh')} 尋覓神聖秘藏（0CP）：${order==='engage'?'交戰':'隱蔽'}${action?'＋免費行動':''}`,en:`${opName(op,'en')} Seeker of Divine Arcana (0CP): ${order}${action?' and a free action':''}`},`side${op.side}`);
  advanceStrategy(g,op.side);
  return true;
}
