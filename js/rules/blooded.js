// blooded: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { applyDamage, autoFF, d3, d6, edgeDist, ffArmed, ffReady, foes, hasPloy, inEngagement, isEngaged, living, log, opName, radius, rolls, team, teamZh, territoryOf, tpl, visibility } from '../game.js';


// ---------- Blooded ----------
export const isBloodedTeam = (g, side) => side < 2 && !!TEAM_MAP[g.teams[side]]?.bloodedTokens;
/** Callous Disregard (Blooded firefight ploy, automatic): it may shoot an enemy its friends are fighting... */
export const blFriendsIn = (g, op, target) => living(g, op.side).filter((f) => f !== op && inEngagement(f, target, g));
export const blCallousOk = (g, op) => isBloodedTeam(g, op.side) && ffReady(g, op.side, 'callousDisregard') && ffArmed(g, op.side, 'callousDisregard');
export function blCallousUse(g, op, target) { return blFriendsIn(g, op, target).length > 0 && blCallousOk(g, op) && autoFF(g, op.side, 'callousDisregard'); }
/** ...and each attack dice discarded as a fail inflicts its result on a friend within the target's control range (the sturdiest). */
export function blCallousHits(g, op, target, pool) {
  for (const d of pool.dice.filter((x) => !x.auto && x.res === 'miss')) {
    const f = blFriendsIn(g, op, target).sort((a, b) => b.wounds - a.wounds)[0];
    if (!f) return;
    log(g, { zh: `冷酷漠視：失敗骰 ${d.v} 打到 ${opName(f, 'zh')}`, en: `Callous Disregard: a failed ${d.v} hits ${opName(f, 'en')}` }, `side${op.side}`);
    applyDamage(g, null, f, d.v);
  }
}
export function gainBlood(g, side, why) {
  if (!isBloodedTeam(g, side)) return;
  (g.bloodPool ||= [0, 0])[side]++;
  log(g, { zh: `${teamZh(g, side)} 獲得血祭標記（${why.zh}；未分配 ${g.bloodPool[side]}）`, en: `${team(g, side).name.en} gains a Blooded token (${why.en}; ${g.bloodPool[side]} unassigned)` }, `side${side}`);
}
/** STRATEGIC GAMBIT: give an unassigned Blooded token to a friendly operative (one each). */
export function assignBlood(g, side, op) {
  if (!op || op.dead || op.side !== side || op.bloodToken || !(g.bloodPool?.[side] > 0)) return false;
  g.bloodPool[side]--; op.bloodToken = true;
  log(g, { zh: `${opName(op, 'zh')} 獲得血祭標記`, en: `${opName(op, 'en')} takes a Blooded token` }, `side${side}`);
  return true;
}
/** With four or more token holders, one of them is under the Gaze of the Gods for the turning point. */
export function setGaze(g, side, op) {
  const holders = living(g, side).filter((o) => o.bloodToken);
  if (!op || holders.length < 4 || !holders.includes(op)) return false;
  (g.gaze ||= [null, null])[side] = { uid: op.uid, tp: g.tp };
  log(g, { zh: `${opName(op, 'zh')} 受到諸神注視`, en: `${opName(op, 'en')} is under the Gaze of the Gods` }, `side${side}`);
  return true;
}
/** Under the Gaze of the Gods: picked this TP, or the Chieftain's Lead With Strength. */
export const underGaze = (g, op) => (g.gaze?.[op.side]?.tp === g.tp && g.gaze[op.side].uid === op.uid)
  || (tpl(op).leadWithStrength && (op.bloodToken || whollyIn(g, op, 1 - op.side)));
/** The operative's base is wholly within that side's territory. */
export function whollyIn(g, op, side) {
  const along = g.axis === 'y' ? 'y' : 'x', r = radius(op);
  return [-r, r].every((d) => territoryOf(g, { ...op, [along]: op[along] + d }) === side);
}
/** Gruelling Disciplinarian (Enforcer): friendlies within 6" ignore the stat changes from being injured. */
export const disciplined = (g, op) => op.side < 2 && living(g, op.side).some((e) => tpl(e).disciplinarian && edgeDist(e, op) <= 6);
/** Glory Kill (ploy): the enemy picked for this turning point. */
export function setGloryKill(g, side, enemy) {
  if (!enemy || !g.ploys[side].includes('gloryKill')) return;
  (g.gloryKill ||= [null, null])[side] = { uid: enemy.uid, tp: g.tp };
  log(g, { zh: `榮耀擊殺目標：${opName(enemy, 'zh')}`, en: `Glory Kill target: ${opName(enemy, 'en')}` }, `side${side}`);
}

/** Blooded tokens gained from deaths, Explosive Demise and Bitter Demise. */
export function bloodedOnDeath(g, dead) {
  dead.hadToken = !!dead.bloodToken;
  gains: {
    const t = (g.bloodTP ||= [{}, {}]);
    for (const s of [0, 1]) if (t[s].tp !== g.tp) t[s] = { tp: g.tp };
    // The first enemy incapacitated each TP.
    const foe = 1 - dead.side;
    if (dead.side < 2 && isBloodedTeam(g, foe) && !t[foe].enemy) { t[foe].enemy = true; gainBlood(g, foe, { zh: '本回合第一次使敵人殘廢', en: 'first enemy down this TP' }); }
    if (!isBloodedTeam(g, dead.side)) break gains;
    dead.bloodToken = false;
    // Blooded Icon (Chieftain): once per TP, a friendly with a Blooded token falling within 6" of it — the token is regained.
    if (dead.hadToken && g.blIconTP?.[dead.side] !== g.tp && living(g, dead.side).some((c) => c !== dead && tpl(c).bloodedIcon && c.x > -50 && edgeDist(c, dead) <= 6)) { (g.blIconTP ||= [0, 0])[dead.side] = g.tp; gainBlood(g, dead.side, { zh: '血祭聖像', en: 'Blooded Icon' }); }
    // The first friendly incapacitated within 6" of an enemy each TP.
    if (!t[dead.side].friend && foes(g, dead).some((e) => edgeDist(e, dead) <= 6)) { t[dead.side].friend = true; gainBlood(g, dead.side, { zh: '本回合第一次友方在敵人附近殘廢', en: 'first friendly down near the enemy this TP' }); }
  }
  // Caustic Demise (Sludge-grub): a D6 for each visible enemy within 2" — 4+: 1 damage.
  if (tpl(dead).causticDemise) {
    for (const e of foes(g, dead).filter((o) => edgeDist(o, dead) <= 2 && visibility(g, dead, o).visible)) {
      const r = d6();
      log(g, { zh: `${opName(dead, 'zh')} 腐蝕之死：對 ${opName(e, 'zh')} 擲 ${r}${r >= 4 ? '，受 1 傷害' : ''}`, en: `${opName(dead, 'en')} Caustic Demise: rolled ${r} for ${opName(e, 'en')}${r >= 4 ? ', 1 damage' : ''}` }, `side${dead.side}`);
      if (r >= 4) applyDamage(g, dead, e, 1);
    }
  }
  // Explosive Demise (Brimstone Grenadier): 2D6 (1 if engaged), any 4+ → D3+2 (D6+2 with the bomb unused) to each visible operative within 2".
  if (tpl(dead).explosiveDemise) {
    const rolls = isEngaged(g, dead) ? [d6()] : [d6(), d6()];
    if (rolls.some((r) => r >= 4)) {
      const unused = !(dead.used?.diabolykBomb);
      const near = g.ops.filter((o) => !o.dead && o !== dead && edgeDist(o, dead) <= 2 && visibility(g, dead, o).visible);
      log(g, { zh: `${opName(dead, 'zh')} 爆炸死亡（擲 ${rolls.join('、')}）：2" 內 ${near.length} 名特工受傷`, en: `${opName(dead, 'en')} Explosive Demise (rolled ${rolls.join(', ')}): ${near.length} operative(s) within 2" are hit` }, `side${dead.side}`);
      for (const o of near) applyDamage(g, dead, o, (unused ? d6() : d3()) + 2);
    }
  }
  // Bitter Demise (Blooded ploy): D3 — on a 3 (2+ with a token), that much damage to a visible enemy within 2".
  if (hasPloy(g, dead.side, 'bitterDemise') && isBloodedTeam(g, dead.side)) {
    const r = d3(), e = foes(g, dead).filter((o) => edgeDist(o, dead) <= 2 && visibility(g, dead, o).visible).sort((a, b) => a.wounds - b.wounds)[0];
    if (e && r >= (dead.hadToken ? 2 : 3)) {
      log(g, { zh: `${opName(dead, 'zh')} 苦澀的死亡（擲 ${r}）：${opName(e, 'zh')} 受到 ${r} 傷害`, en: `${opName(dead, 'en')} Bitter Demise (rolled ${r}): ${opName(e, 'en')} takes ${r} damage` }, `side${dead.side}`);
      applyDamage(g, dead, e, r);
    }
  }
}

/** Stimms (Corpseman): Rejuvenated (heal 2D3), Enraged (melee Relentless), Fortified (Dmg 3+ deals 1 less on a 5+). */
export function giveStimm(g, op, kind) {
  (op.stimms ||= {})[kind] = true;
  if (kind === 'rejuvenated') op.wounds = Math.min(op.maxW, op.wounds + d3() + d3());
}
