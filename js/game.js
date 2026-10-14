import { TOMB_WORLD_MAPS, tombWorldTerrain, initialHatches } from './tombworld-maps.js';
import { wallAllowsControl, hatchwayFightAccess, accessPointsOf, hatchActionId, nearHatch } from './tombworld-access.js';
import { DEATHWATCH_EQUIPMENT } from './data/deathwatch.js';
import { MANDRAKES_EQUIPMENT } from './data/mandrakes.js';
import { MURDERWING_EQUIPMENT } from './data/murderwing.js';
import { WRECKA_EQUIPMENT } from './data/wrecka.js';
import { NIGHTLORDS_EQUIPMENT } from './data/nightlords.js';
import { SCOUTS_EQUIPMENT } from './data/scouts.js';
import { RATLINGS_EQUIPMENT } from './data/ratlings.js';
import { SANCTIFIERS_EQUIPMENT } from './data/sanctifiers.js';
import { PATHFINDERS_EQUIPMENT } from './data/pathfinders.js';
import { ANGELS_EQUIPMENT } from './data/angels.js';
import { PLAGUE_EQUIPMENT } from './data/plague.js';
import { KOMMANDOS_EQUIPMENT } from './data/kommandos.js';
import { KINBAND_EQUIPMENT } from './data/kinband.js';
import { CANOPTEK_EQUIPMENT } from './data/canoptek.js';
import { DEATHKORPS_EQUIPMENT } from './data/deathkorps.js';
import { RAVENERS_EQUIPMENT } from './data/raveners.js';
import { SPECTRES_EQUIPMENT } from './data/spectres.js';
import { AQUILONS_EQUIPMENT } from './data/aquilons.js';
import { VOIDDANCERS_EQUIPMENT } from './data/voiddancers.js';
import { VESPIDS_EQUIPMENT } from './data/vespids.js';
import { STEALTH_EQUIPMENT } from './data/stealthsuits.js';
import { isXV, xvSetup, xvStealth, xvFallBackCheap, xvRules, xvShootStart, xvShootEnd, xvHolowave, xvChaffStart, xvChaffOn, xvChaffEnd, xvObscure, xvSwap, xvRetro, xvActivate, xvEnd, xvCanCounter, xvFilter, xvActions, xvSelf, xvActionCost, xvAfterPickUp, xvReady, xvPloyBought, xvJamControl, registerStealthActions } from './stealthsuits.js';
import { isVS, vsSetup, vsReady, vsTargetOk, vsShootStart, vsReroll, vsWeapons, vsRules, vsNoPierce, vsCamo, vsHidden, vsAgility, vsExo, vsVenom, vsShootEnd, vsActivate, vsMoved, vsChargeOk, vsGate, vsMissionSpend, vsCommuneFree, vsActions, vsSelf, registerVespidActions } from './vespids.js';
import { isVD, vdSetup, vdFill, vdActivate, vdEnd, vdRules, vdShootStart, vdShootEnd, vdPanoply, vdDefence, vdElusiveHidden, vdRoll, vdDomino, vdJest, vdCurtain, vdDeath, vdLuckFree, vdLuckUsed, vdLuckReroll, vdActions, vdFogged, registerVoidDancerActions } from './voiddancers.js';
import { isAQ, aqSetup, aqReady, aqTPEnd, aqActivate, aqEnd, aqActions, aqSelf, aqWeapons, aqRules, aqDefence, aqDetectedBlock, aqStimms, aqControl, aqPloyBought, aqVetFree, aqVetUsed, aqVetReroll, aqVetRerollUsed, aqTrack, aqAfterShoot, aqDynamic, aqObscure, aqPlaceAuto, aqOverseerOk, aqUseOverseer, registerAquilonActions } from './aquilons.js';
import { isSP, spSetup, spReady, spTPEnd, spActions, spSelf, spActivate, spEnd, spWeapons, spRules, spPloyBought, spBeaconOk, spPlaceAuto, spTvid, spTvidUsed, spTrimEquipment, spCamoHidden, spPatience, spPatienceOk, spStarshell, spStarshellOk, registerSpectreActions } from './spectres.js';
import { rvSensesOk, rvUseSenses, isRV, rvSetup, rvStart, rvActivate, rvEnd, rvActions, rvSelf, rvRules, rvShot, rvDefence, rvNoReroll, rvCrestExtra, rvCrestControl, rvLurkCover, rvChroma, rvCarapace, rvCrush, rvAcidBlood, rvHorror, rvDeath, rvPloyBought, rvAmbush, rvPoisonHit, rvPlaceAuto, rvEndBattle, rvFreeBurrow, registerRavenerActions } from './raveners.js';
import { dkSetup, dkFreeHas, dkAdaptiveFree, dkBeadsOn, dkBeadsTarget, dkLeadership, dkLifeShame, dkVeteranActivate, dkDeath, dkPloyBought, dkGasApl, dkReady, dkWeapons, dkActions, dkSelf, registerDeathKorpsActions, hasOrder } from './deathkorps.js';
import { kfSetup, kfActions, kfSelf, kfActivate, kfQuickDraw, kfShootStart, kfShootEnd, kfRules, kfGatherFree, registerKinbandActions } from './kinband.js';
import { kmSetup, kmReady, kmWeapons, kmPloyBought, kmEndFirefight, kmKunnin, kmActions, kmSelf, registerKommandoActions } from './kommandos.js';
import { pmSetup, pmRules, pmBells, pmVents, pmWeapons, pmPloyBought, pmReady, pmCloud, pmCurse } from './plague.js';
import { adSetup, adTactics, adVeteran, adPloyBought, adHeroicFree, adHeroicUsed, adIronHalo, adRoll, adShootStart, adAuspexOn, adEnd, adTilting, adReliquaries } from './angels.js';
import { isPulse, pfSetup, pfActivate, pfEnd, pfRules, pfGravHit, pfShield, pfTaoBonus, pfShootStart, pfShootEnd, pfMarkerTargets, pfMarkerlight, pfSwap, pfPointBlank, pfPloyBought, pfWorthy, pfActions, pfSelf, registerPathfinderActions } from './pathfinders.js';
import { isSF, sfSetup, sfSermon, sfOrator, sfNearOrator, sfReady, sfActivate, sfEnd, sfRules, sfConversion, sfNullApl, sfShootBlaze, sfFightBlaze, sfRoll, sfSymbols, sfSwap, sfPloyBought, sfMiracleMoves, sfDeath, sfDeclaim, sfActions, sfSelf, registerSanctifierActions } from './sanctifiers.js';
import { rtShootHideWhy, isRat, isSmall, isRifle, rtSetup, rtFree, rtTripwires, rtStolen, rtMine, rtSilent, rtRules, rtShifty, rtEquipRoll, rtArmour, rtBlockSI, rtScarper, rtAfterEnemyAction, rtMoved, rtLieInWait, rtShot, rtActions, registerRatlingActions } from './ratlings.js';
import { isSC, scSetup, scResolve, scReady, scActivate, scNoteAttack, scEmbOk, scRules, scGuerrilla, scCamoExtra, scWeapons, scOculars, scVoxFree, scPloyBought, scActions, scTrapPath, scTrapShorten, scTrapFire, scTrapCheck, registerScoutActions } from './scouts.js';
import { isNC, ncSetup, ncReady, ncTPEnd, ncPortent, ncTerror, ncFightToken, ncActivate, ncPoisonCheck, ncObscure, ncScreeched, ncRules, ncWeapons, ncJammed, ncDeath, ncMoved, ncReturn, ncScream, ncKill, ncSnare, ncActions, ncSelf, registerNightlordsActions } from './nightlords.js';
import { isWK, wkSetup, wkActionStart, wkRoll, wkKompetitive, wkActivate, shokked, wkMove, wkSaveBonus, wkReckless, wkRules, wkGlyphFree, wkPloyBought, wkReady, wkBoom, wkDetonate, wkSmash, wkPulsaShot, wkActions, wkSelf, registerWreckaActions } from './wrecka.js';
import { isMurderwing, mwSetup, mwStrategy, mwActivation, mwActionStart, mwBoon, mwRules, mwDelay, mwFallBack, mwMoved, mwActions, mwSelf, mwHonour, registerMurderwingActions } from './murderwing.js';
import { isMandrake, withinShadow, mdSetup, mdReady, mdStrategy, mdActivate, mdProjected, mdRules, mdRangedBonus, mdWeapons, mdShot, mdKill, mdDeath, mdFeast, mdActions, mdSelfAction, mdFallBack, mdInterrupt, mdEnd, registerMandrakeActions } from './mandrakes.js';
import { isDeathwatch, dwSetup, dwCommandFree, dwConsumeCommand, dwSecondShotExtra, dwReduceDamage, dwRules, dwDefence, dwAuspexOn, dwTriangulation, dwActivate, dwBeforeActivation, dwApplyAmmo, dwAmmoWeapon, dwActions, dwSelfAction, dwMissionDone, dwDigital, dwAfterAction, dwBlocked, dwStrategy, registerDwActions } from './deathwatch.js';
import { ARCHON_EQUIPMENT, CORSAIR_EQUIPMENT } from './data/eldar.js';
import { isCorsair, setupCorsair, corsairActivate, corsairCost, corsairSpend, corsairRules, corsairDefence, corsairStrategy, corsairShield, corsairEquip, registerCorsairActions, corsairPlunder, corsairAfterAction, slicingAttack } from './corsair.js';
import { isArchon, setupArchon, archonWeapons, archonReady, archonActivate, archonRules, archonDefence, archonBeforeAttack, archonAfterAction, painSnapshot, archonDeath, stingerBurst, chainSnare, painRerollValues, painReroll, aiPain, gainPain } from './archon.js';

import { TEAM_MAP, isBoltWeapon, BK_SHRIEK, ES_ASSETS } from './data/teams.js';
import { MISSIONS, MISSION_ACTIONS, TAC_OPS, npoTargetFor, tacOnKill, tacOnTPEnd, tacOnBattleEnd, tacOnStrategyEnd, scoutTargets } from './missions.js';
import { dist, distPointRect, segRect, pathLength, truncatePath } from './geometry.js';
import { flatSight } from './sight.js';
import { moveCtx, findPath, wholeInchPath } from './path.js'; // (Exodite Sprint, Goremonger Hunt for Blood; path.js imports this module too — only used at run time)

export const BOARD = { w: 30, h: 22 };
export const boardOf = (g) => g.board || BOARD;
export const ER = 1;          // engagement range (inches, base edge to base edge)
export const CONTROL = 1;     // objective control range
export const OBJ_R = 0.4;     // objective marker radius
export const MAX_TP = 4;
export const DEPLOY = [{ x0: 0, x1: 6, y0: 0, y1: 22 }, { x0: 24, x1: 30, y0: 0, y1: 22 }];
/** Side index for non-player operatives (mission NPOs), hostile to both players. */
export const NPO = 2;
/** Drop zones for this game (missions can move them, e.g. to the long edges). */
export const deployZones = (g) => g.deploy || DEPLOY;

// ---------- static helpers ----------
export const team = (g, side) => TEAM_MAP[g.teams[side]];
/** Team name for Chinese log lines, with the English name appended. */
const teamZh = (g, side) => `${team(g, side).name.zh}（${team(g, side).name.en}）`;
export const tpl = (op) => TEAM_MAP[op.team].ops.find((o) => o.id === op.tplId);
export const radius = (op) => tpl(op).base / 25.4 / 2;
export const isInjured = (op) => op.wounds < op.maxW / 2;
export const DEFENCE_DICE = 3;
export const hasPloy = (g, side, id) => g.ploys[side].includes(id);
export const living = (g, side) => g.ops.filter((o) => !o.dead && (side == null || o.side === side));
export const getOp = (g, uid) => g.ops.find((o) => o.uid === uid);
export const activeOp = (g) => (g.active == null ? null : getOp(g, g.active));
export const edgeDist = (a, b) => dist(a, b) - radius(a) - radius(b);
export const inEngagement = (a, b, g) => {
  if (tpl(a)?.spBeacon || tpl(b)?.spBeacon) return false; // (the Vox-relay Beacon's control range can be ignored)
  const virtual = g?.hatchwayFight && !g.fight?.done && g.hatchwayFight.includes(a.uid) && g.hatchwayFight.includes(b.uid) && a.uid !== b.uid;
  return !!virtual || (edgeDist(a, b) <= ER + 0.01 && (!g || wallAllowsControl(g,a,b)));
};
/** Living operatives hostile to op: the other player's and any NPOs (NPOs are hostile to everyone). */
export const foes = (g, op) => g.ops.filter((o) => !o.dead && o.side !== op.side);
export const engagedEnemies = (g, op) => foes(g, op).filter((e) => inEngagement(op, e, g));
/** The current mission's rules (standard if none). */
export const mission = (g) => MISSIONS[g.mission] || MISSIONS.standard;
export const isEngaged = (g, op) => engagedEnemies(g, op).length > 0;
export const missionEngaged = (g, op) => isEngaged(g, op) && !op.acted?.lightFingers && !op.acted?.dwThrall && !op.rtLarcenous; // (Larcenous: Ratlings)
// Every dice roll goes through these, so the UI can tell whether an action rolled anything (undo is
// only offered for actions that didn't — otherwise it would allow re-rolling).
let rolls = 0;
export const rollCount = () => rolls;
export const d6 = () => { rolls++; return 1 + Math.floor(Math.random() * 6); };
export const d3 = () => { rolls++; return 1 + Math.floor(Math.random() * 3); };
/** Injured stat changes apply (And They Shall Know No Fear ignores them). */
export const injuredPenalty = (g, op) => isInjured(op) && !pmBells(g, op) && !op.acted?.mwIgnoreInjury && !op.scRaw && !hasPloy(g, op.side, 'noFear') && !disciplined(g, op) && !op.ragingHeat // (Raging Heat of the Dying Flame)
  && !(markOf(op) === 'nurgle' && hasPloy(g, op.side, 'implacable')); // Implacable (Legionaries)
/** The operative has this Chapter Tactic (Angels of Death); the sniper's Camo Cloak grants Stealthy. */
export const hasTactic = (g, op, id) => !!adTactics(g, op.side)?.includes(id) || adVeteran(g, op, id) || (id === 'hardy' && !!tpl(op).repulsive) || (id === 'stealthy' && (!!tpl(op).camoCloak || !!tpl(op).weavewerke || !!tpl(op).wastelandStalker)); // (Repulsive Fortitude: Plague Marine Warrior) // (Wasteland Stalker: Ruststalkers)

/** Art of War option (Mont'ka / Kauyon) in effect for this operative; the Blooded veteran gets either. */
export const artOfWar = (g, op, id) => hasPloy(g, op.side, id)
  || (!!tpl(op).veteran && hasPloy(g, op.side, id === 'montka' ? 'kauyon' : 'montka'));
const isDrone = (op) => !!tpl(op).drone;

/**
 * Contagion (enemy Plague Marine ploy): poisoned and visible within 3" of a Plague Marine, or visible
 * within 3" of the Icon Bearer.
 */
function contagion(g, op) {
  const seen = (pm) => edgeDist(pm, op) <= 3 && (visibility(g, pm, op).visible || visibility(g, op, pm).visible);
  return [0, 1].some((foe) => foe !== op.side && hasPloy(g, foe, 'contagion')
    && living(g, foe).some((pm) => (op.poison || tpl(pm).iconBearer) && seen(pm)));
}
/** -2" Move and Hit worsened by 1: injured (unless ignored) or Contagion; the two aren't cumulative. */
export const statPenalty = (g, op) => injuredPenalty(g, op) || contagion(g, op) || mdProjected(g, op) || op.vdHumbled != null; // (Humbling Cruelty: Void-dancer Death Jester, not cumulative with being injured)

export function moveStat(g, op) {
  // Injured: -2" Move, but never below 4" (unless the Move stat itself is lower).
  const base = tpl(op).move;
  if (op.acted?.pursuit) return base + (op.inspiring ? 1 : 0); // Unshakeable Pursuit (Celestian Insidiants): no Move changes, +1" if inspiring
  let m = statPenalty(g, op) && !tpl(op).engenderedFocus && !aqStimms(g, op) && !(isArchon(op) && op.drug === 'hypex' && !contagion(g, op)) ? Math.max(Math.min(base, 4), base - 2) : base;
  if (artOfWar(g, op, 'montka')) m += 1;
  if (op.shieldingOn) m -= 2; // Shielding (Trench Sweeper)
  if (op.rvSlow) m -= 2;
  if (op.xvPhoton) m -= 2; // Photon Grenade Launcher (XV26 Gun Drone) // Burrow: -2" Move until the end of the activation (Raveners)
  if (nullFielded(g, op)) m -= 2; // Null Field (Celestian Insidiant Censor)
  if (hasGift(g, op, 'fleet')) m += 1; // Fleet (Chaos Cult Accursed Gift)
  if (op.wailsUntil === g.tp && !isMounted(op)) m -= 2; // Wails of the World (Exodite Stonesinger)
  if (optimised(g, op, 'aggressor')) m += 1; // Aggressor Imperative
  if (markOf(op) === 'slaanesh') m += 1; // Unnatural Agility (Legionaries)
  m += op.acted?.moveBonus || 0; // Wild Rage (firefight ploy)
  if (deprecated(g, op, 'bulwark')) m -= 1; // Bulwark Imperative
  if (isDrone(op) && living(g, op.side).some((o) => tpl(o).droneController)) m += 2;
  m += wkMove(g, op); // Shokkwave (Pulsa marker), Extra Armour (Wrecka Krew)
  if (op.scRaw) m += 1; // Raw Physiology (Scout Squad): +1" Move
  return m;
}

/** APL for this activation: changes last until the end of the operative's next activation (Resolute ignores them). */
// The APL stat can't be changed by more than 1 in total.
// NEMESIS NPOs use the APL from their activation card and ignore all changes (Bulky).
// Viral Vox-static (Gellerpox Techno-curse): an infected operative's APL can't be increased.
export const aplNow = (g, op) => Math.max(0, sfNullApl(g, op, matrixApl(g, op, tpl(op).nemesis && op.cardApl ? op.cardApl
  : Math.max(0, tpl(op).apl + (hasTactic(g, op, 'resolute') || tpl(op).chemEnhanced || tpl(op).toxicBlessings || tpl(op).engenderedFocus || op.shakeTP === g.tp ? 0 // Chem-enhanced / Toxic Blessings / Engendered Focus ignore APL changes
    : Math.max(-1, Math.min((op.aplNext || 0) > 0 && (cursed(g, op, 'voxStatic') || ncJammed(g, op)) ? 0 : 1, op.aplNext || 0)))))) - dkGasApl(g, op));
/** Obelisk Node Matrix (Canoptek Circle): +1 APL within it, to a maximum of 3. */
// (Ardour, a Celestian Insidiant Benediction: +1 APL for the rest of the battle.)
// (Mania, a Goremonger Sanguavitae: +1 APL until its next activation.)
// (Tanked Up, Wrecka Krew: +1 APL until its next activation.)
const matrixApl = (g, op, v0) => { const v = v0 + (op.ardour ? 1 : 0) + (op.mania ? 1 : 0) + (op.mdSoulApl ? 1 : 0) + (op.wkTanked ? 1 : 0); return v < 3 && op.side < 2 && TEAM_MAP[op.team]?.obeliskNodes && inMatrix(g, op.side, op) ? v + 1 : v; };

/** Change APL until the end of the operative's next activation (not the one it's in right now). */
export function changeApl(g, op, n) {
  op.aplNext = (op.aplNext || 0) + n;
  if (g.active === op.uid && !op.counter) op.aplKeep = true;
}
export function moveAllowance(g, op, kind) {
  let d = moveStat(g, op);
  if (tpl(op).blinkPack && op.blinkOn && kind !== 'dash') return op.counter ? 2 : 7;
  if (kind === 'dash') d = tpl(op).blademaster && op.acted?.charge ? Math.min(3, op.acted.chargeRemaining || 0) : 3;
  if (kind === 'reposition' && op.mvb) d = Math.max(0, d - 2); // Move With Barricade
  if (kind === 'reposition' && op.acted?.vsDart) d += op.acted.vsDart; // Darting Flight (Vespid Stingwings)
  if ((kind === 'charge' || kind === 'dash') && isVS(op) && !tpl(op).vsDrone && g.equip?.[op.side]?.includes('vsAccelerant')) d += 1; // Accelerant Stimulant
  if (kind === 'reposition' && op.acted?.vdRestOn) return op.acted.vdRest || 0; // Darting Salvo: the rest of that Reposition
  if (kind === 'reposition' && hasOrder(g, op, 'moveMove')) d += 1; // Move! Move! Move!
  if (kind === 'reposition' && skillOn(g, op, 'strikeFast')) d += 1; // Strike Fast (Kasrkin)
  if (kind === 'reposition' && isES(op) && hasPloy(g, op.side, 'quickMarch') && !op.counter) d += 1; // Quick March (Elucidian Starstriders)
  // Stealth Attack's free Charge can't exceed the Move stat.
  if (kind === 'charge') d = moveStat(g, op) + (op.acted?.free?.charge === 'stealth' || tpl(op).sfCherub ? 0 : op.acted?.boost ? 4 : 2); // Boost: +4" (the Cherub's Fly gains nothing extra)
  if (kind === 'charge' && op.acted?.free?.charge === 'rampage') d = 3; // Ruthless Rampage: a free Charge of up to 3"
  if (kind === 'charge' && op.acted?.free?.charge === 'woe') d = op.acted.woeLeft || 0; // The Woe: what's left of the first Charge
  if (kind === 'charge' && op.acted?.free?.charge === 'bloodlust') d = 2; // Obsessive Bloodlust (Goremonger Aspirant): up to 2"
  if (kind === 'charge' && op.acted?.free?.charge === 'murder') d = 3; // Proclivity for Murder (Nemesis Claw): up to 3"
  if ((kind === 'charge' || kind === 'reposition') && op.acted?.sangArm?.surge && !['bloodlust', 'rampage', 'woe'].includes(op.acted?.free?.charge)) d += 1; // Surge (Sanguavitae)
  // Mission NEMESIS NPOs can't move more than a set distance per turning point.
  const cap = mission(g).npoMoveCap;
  if (cap && tpl(op).nemesis) d = Math.max(0, Math.min(d, cap - (op.movedTP || 0)));
  if (tpl(op).alphaPredator) d = Math.max(0, Math.min(d, 9 - (op.movedTP || 0))); // Alpha Predator: no more than 9" a turning point
  if (kind === 'charge' && op.acted?.mdNowhere) d = Math.min(d, moveStat(g, op));
  if (isMurderwing(op) && kind === 'charge' && !op.counter) d = Math.min(d, 6);
  if (isMurderwing(op) && op.acted?.mwWings && ['reposition', 'fallBack'].includes(kind) && !op.counter) d += 3;
  return op.counter ? Math.min(d, Math.max(0, (op.ctlMove || 2) - (isDeathwatch(op) ? op.acted?.movedDist || 0 : 0))) : d; // counteraction's total movement cannot exceed 2" (Incite Urgency, Chaos Cult: 3")
}

// ---------- killzone ----------
function mirror(r) { return { ...r, x: BOARD.w - r.x - r.w, y: BOARD.h - r.y - r.h }; }
function makeTerrain() {
  const half = [
    { kind: 'heavy', x: 7, y: 2, w: 4, h: 0.6 },
    { kind: 'heavy', x: 7, y: 2, w: 0.6, h: 4 },
    { kind: 'heavy', x: 12, y: 8, w: 0.6, h: 6 },
    { kind: 'heavy', x: 9, y: 15, w: 5, h: 0.6 },
    { kind: 'heavy', x: 13.5, y: 0, w: 3, h: 2.5 },
    { kind: 'heavy', x: 2, y: 7.2, w: 1.5, h: 0.6 },
    { kind: 'heavy', x: 10.5, y: 12, w: 1, h: 1 },
    { kind: 'light', x: 7, y: 12.8, w: 0.4, h: 2 },
    { kind: 'light', x: 4.5, y: 10, w: 0.4, h: 2 },
    { kind: 'light', x: 13.5, y: 12.6, w: 3, h: 0.4 },
    { kind: 'light', x: 9.5, y: 9, w: 0.4, h: 2.5 },
    { kind: 'light', x: 3.5, y: 17, w: 2.5, h: 0.4 },
    { kind: 'light', x: 3.5, y: 4.6, w: 2.5, h: 0.4 },
  ];
  return [...half, ...half.map(mirror)];
}
const OBJECTIVES = [{ x: 15, y: 11 }, { x: 10, y: 4.5 }, { x: 20, y: 4.5 }, { x: 10, y: 17.5 }, { x: 20, y: 17.5 }];

// ---------- setup ----------
export function newGame({ teams, ai, tactics = [], mission: missionId = 'standard', map: mapId = 'default', tacOps = [], primaryOps = [], equip = [], loadouts = [], roster = [], scouting = [], ratFree = [], dkFree = [], vsCommune = [] }) {
  const m = MISSIONS[missionId] || MISSIONS.standard;
  const map = m.terrain ? null : TOMB_WORLD_MAPS.find((v) => v.id === mapId);
  const g = {
    // Index 2 (NPO) of the per-side arrays is for mission NPOs.
    v: 1, teams: [...teams, 'npo'], ai, tp: 0, phase: 'deploy', cp: [2, 2, 0], vp: [0, 0, 0], kills: [0, 0, 0], ploys: [[], [], []],
    initiative: 0, turn: 0, active: null, log: [], mission: m.id,
    map: map?.id || 'default', board: map ? { ...map.board } : { ...BOARD }, pads: map ? map.pads.map((p) => ({ ...p })) : [],
    hatches: map ? initialHatches(map) : {},
    terrain: (map ? tombWorldTerrain(map) : m.terrain || makeTerrain()).map((t) => ({ ...t })),
    objectives: (map?.objectives || m.objectives || OBJECTIVES).map((o, i) => ({ ...o, id: i })),
    markers: [], // mission markers that can be carried: {id, kind, x, y, carriedBy}
    deploy: map?.deploy.map((z) => ({ ...z })) || m.deploy || null, axis: map?.axis || m.axis || 'x', ops: [], seq: 0,
    // Chapter Tactics [primary, secondary] for teams that have them; free ploys already used (Doctrine Warfare).
    tactics: [0, 1].map((s) => (TEAM_MAP[teams[s]].tactics ? (tactics[s] || TEAM_MAP[teams[s]].defaultTactics).slice(0, 2) : null)),
    vet: [0, 1].map((s) => (teams[s] === 'angels' ? tactics[s]?.[2] || null : null)), // (Chapter Veteran: the Sergeants' extra Chapter Tactic)
    freePloys: [[], [], []],
  };
  for (const side of [0, 1]) {
    let n = 0;
    // Package picks (Brood Brothers' Broodcoven selections) add their operatives after the slots.
    const extra = Object.entries(TEAM_MAP[teams[side]].packages || {}).flatMap(([pid, pk]) => {
      const opt = pk.options[roster[side]?.[pid]] || Object.values(pk.options)[0];
      if (opt.freePloys) (g.freePloyCount ||= [0, 0])[side] = opt.freePloys;
      return opt.ops.map((id) => ({ id, count: 1, pkg: true }));
    });
    for (const slot of [...TEAM_MAP[teams[side]].ops, ...extra]) {
      if (!slot.count) continue;
      // A slot's pick is one template id, or (perCopyRoster teams) a list with one id per copy.
      const pick = slot.pkg ? null : roster[side]?.[slot.id];
      const allowed = TEAM_MAP[teams[side]].replacements?.[slot.id];
      for (let k = 0; k < slot.count; k++) {
        const chosen = (Array.isArray(pick) ? pick[k] : pick) || slot.id;
        if (chosen !== slot.id && !allowed?.includes(chosen)) throw new Error('Invalid roster replacement');
        const t = TEAM_MAP[teams[side]].ops.find((o) => o.id === chosen);
        if (t.none) continue; // (an empty selection: the MB3 Recon Drone's second one, the Kommandos' extra half selection)
        n++;
        g.ops.push({
          uid: `${side}-${n}`, side, team: teams[side], tplId: t.id, num: n, x: 0, y: 0,
          // Operatives are set up with Conceal orders.
          wounds: t.wounds, maxW: t.wounds, order: 'conceal', ready: true, ap: 0, acted: {},
          // ml: enemy Markerlight tokens on it; aplNext: APL change until the end of its next activation;
          // used: uses of Limited weapons.
          // poison: has an enemy Poison token.
          ml: 0, aplNext: 0, used: {}, poison: false, damagedTP: false, dead: false, counteracted: false,
        });
      }
    }
  }
  dwSetup(g, roster);
  mdSetup(g, roster);
  mwSetup(g, roster, loadouts);
  wkSetup(g, roster);
  ncSetup(g, roster);
  scSetup(g, roster, scouting);
  rtSetup(g, roster, ratFree);
  sfSetup(g, roster); // Sanctifiers: roster check, the Orator and Declamation state
  pfSetup(g, roster); // Pathfinders: roster limits
  adSetup(g, roster); // Angels of Death: roster limits
  pmSetup(g, roster); // Plague Marines: roster limits
  kmSetup(g, roster); // Kommandos: roster limits
  kfSetup(g, roster); // Farstalker Kinband: roster limits
  dkSetup(g, roster, dkFree); // Death Korps: roster limits, the Trooper slots traded for free ploys
  rvSetup(g, roster); // Raveners: roster limits, the Tunnel
  spSetup(g, roster); // Spectre Squad: roster limits, Fieldcraft points
  aqSetup(g, roster); // Tempestus Aquilons: roster limits, Drop markers
  vdSetup(g, roster); // Void-dancer Troupe: roster limits, Saedath
  vsSetup(g, roster, vsCommune); // Vespid Stingwings: roster limits, Commune
  xvSetup(g, roster); // XV26 Stealth Battlesuits: roster limits, the Homing Beacon
  setupArchon(g, loadouts);
  setupCorsair(g, loadouts);
  // Other teams' weapon options (Blades of Khaine Exarchs).
  for (const o of g.ops) {
    const choices = tpl(o).loadouts;
    if (!choices || o.loadout) continue;
    const id = loadouts[o.side]?.[o.tplId];
    o.loadout = choices[id] ? id : Object.keys(choices)[0];
  }
  // Deployment: players alternate setting up a third of their team (rounded up) at a time; a roll-off
  // decides who sets up first. Operatives not set up yet wait off the board (x = -99).
  for (const o of g.ops) { o.x = -99; o.y = -99; o.placed = false; }
  // Draconic Cavalry Tactics (Exodite Dragon Masters): riders start in reserve (they enter when activated in TP1); everyone faces the enemy.
  for (const o of g.ops) { if (isEDM(o)) { o.facing = facingIn(g, o.side); o.speed = 3; } if (isMounted(o)) { o.reserve = true; o.placed = true; } }
  let r0, r1;
  do { r0 = d6(); r1 = d6(); } while (r0 === r1);
  const first = r0 > r1 ? 0 : 1;
  g.setupFirst = first; // the set-up roll-off winner (initiative before the battle)
  g.dep = { turn: first, batch: [], size: [0, 1].map((s) => Math.ceil(g.ops.filter((o) => o.side === s).length / 3)), done: false };
  g.dep.need = depNeed(g, first);
  g.zonePick = { side: first, done: ai === first }; // (the roll-off winner chooses the drop zone; the computer keeps what it's given)
  log(g, { zh: `部署擲骰 ${r0} : ${r1} → ${teamZh(g, first)} 先部署；雙方輪流每次部署隊伍的 1/3（無條件進位）`, en: `Deployment roll ${r0} : ${r1} → ${team(g, first).name.en} sets up first; players alternate setting up a third of their team (rounded up)` }, 'tp');
  // Initiative cards (house rules): the loser of this roll-off gets the Re-roll card.
  g.initCards = [[], []];
  g.initCards[1 - first].push('reroll');
  log(g, { zh: `${teamZh(g, 1 - first)} 擲輸，獲得「重擲」先攻卡（之後的先攻階段可用一次）`, en: `${team(g, 1 - first).name.en} lost the roll-off and gains the Re-roll initiative card (usable once in a later Initiative phase)` }, `side${1 - first}`);
  for (const side of [0, 1]) {
    if (!g.tactics[side]) continue;
    const names = g.tactics[side].map((id) => team(g, side).tactics.find((t) => t.id === id).name);
    const lab = team(g, side).tacticsLabel;
    if (lab) { log(g, { zh: `${teamZh(g, side)} ${lab.zh}：「${names[0].zh}」`, en: `${team(g, side).name.en} ${lab.en}: ${names[0].en}` }, `side${side}`); continue; }
    log(g, { zh: `${teamZh(g, side)} 戰團戰術：主要「${names[0].zh}」、次要「${names[1].zh}」`, en: `${team(g, side).name.en} Chapter Tactics: ${names[0].en} (primary), ${names[1].en} (secondary)` }, `side${side}`);
  }
  log(g, { zh: `任務：${m.name.zh}`, en: `Mission: ${m.name.en}` }, 'tp');
  // Approved Ops missions: each player has a secret Tac Op (picked at setup, or at random from its archetypes).
  if (m.approved) g.tacOps = [0, 1].map((s) => ({ id: tacOps[s] && TAC_OPS[tacOps[s]] ? tacOps[s] : randomTacOp(teams[s]), revealed: false }));
  if (m.approved) g.primaryOps = [0, 1].map((s) => (PRIMARY_OPS.includes(primaryOps[s]) ? primaryOps[s] : null)); // each chooses in secret in the first Strategy phase, revealed at the end
  m.setup?.(g);
  // Warrant of Trade — Coordinate (Elucidian Starstriders): +1CP at the end of the Select Operatives step (automatic).
  for (const s of [0, 1]) if (TEAM_MAP[teams[s]].starstriders) { g.cp[s] += 1; useWarrant(g, s, 'coordinate'); }
  // Universal equipment, set up before the battle (the computer takes its usual kit).
  const equipmentStart = { terrain: g.terrain.length, markers: g.markers.length };
  for (const s of [0, 1]) setupEquipment(g, s, equip[s] || (ai === s ? AI_EQUIP : []));
  const terrainItems = g.terrain.splice(equipmentStart.terrain);
  const markerItems = g.markers.splice(equipmentStart.markers);
  g.eqDeploy = { turn: first, queues: [0, 1].map(side => [
    ...terrainItems.filter(t => t.equip === side).map(item => ({ type: 'terrain', item })),
    ...markerItems.filter(m => m.owner === side).map(item => ({ type: 'marker', item })),
  ]), done: false };
  g.eqDeploy.done = !g.eqDeploy.queues.some(q => q.length);
  if (!g.eqDeploy.done && !g.eqDeploy.queues[first].length) g.eqDeploy.turn = 1 - first;
  for (const s of [0, 1]) setupMinefield(g, s); // Hernkyn Yaegir Ironbraek
  rtStolen(g); // Stolen Goods (Ratlings equipment): D3 at the end of the Select Operatives step
  // Regular Dosage (Blooded Corpseman): another friendly starts with a stimm — the Fortified stimm on the Ogryn (or the Chieftain).
  for (const side of [0, 1]) {
    if (!g.ops.some((o) => o.side === side && tpl(o).stimms)) continue;
    const t = g.ops.find((o) => o.side === side && tpl(o).chemEnhanced) || g.ops.find((o) => o.side === side && tpl(o).leadWithStrength);
    if (t) giveStimm(g, t, 'fortified');
  }
  log(g, { zh: '部署階段：選一名待部署的特工，再點己方部署區放置；這一批在按「完成」前都能拖曳調整。', en: 'Deployment: pick an operative waiting to be set up, then tap inside your zone; this step\'s operatives can be dragged until you press Done.' });
  return g;
}

/** Add a mission NPO to the game (position it afterwards). */
export function spawnNpo(g, tplId) {
  const t = TEAM_MAP.npo.ops.find((o) => o.id === tplId);
  const num = g.ops.filter((o) => o.side === NPO).length + 1;
  const op = {
    uid: `${NPO}-${num}`, side: NPO, team: 'npo', tplId, num: g.ops.filter((o) => o.side === NPO && o.tplId === tplId).length + 1, x: 0, y: 0,
    wounds: t.wounds, maxW: t.wounds, order: 'conceal', ready: true, ap: 0, acted: {},
    ml: 0, aplNext: 0, used: {}, poison: false, damagedTP: false, dead: false, counteracted: false, actTP: 0, movedTP: 0,
  };
  g.ops.push(op);
  return op;
}

/**
 * Start the NPOs' slot in the alternating sequence: draw the mission's NPO activation card. Returns
 * {op, apl, bid} when an NPO activates (bid: players bid to control it — see resolveBid), or null
 * when the slot is skipped (the slot ends).
 */
export function npoBegin(g) {
  const pick = mission(g).npoDraw?.(g);
  if (!pick || pick.op.dead) { endActivation(g); return null; }
  if (pick.bid) { g.bidding = { uid: pick.op.uid, apl: pick.apl, bids: [null, null] }; return pick; }
  activateNpo(g, pick.op, pick.apl, pick.fights);
  return pick;
}

/** Activate an NPO with the APL from its activation card. */
export function activateNpo(g, op, apl, fights = 1) {
  g.active = op.uid;
  op.acted = { fightsAllowed: fights };
  op.cardApl = apl;
  op.ap = apl;
  op.orderSet = true;
  op.actTP = (op.actTP || 0) + 1;
  (g.recent ||= [null, null])[op.side] = { uid: op.uid, tp: g.tp, trails: [] };
  if (tpl(op).nemesis) op.order = 'engage';
  log(g, { zh: `${opName(op, 'zh')} 啟動（APL ${apl}）`, en: `${opName(op, 'en')} activates (APL ${apl})` }, 'npo');
  // Rad-Maggot Symbiosis (Ambull): regains APL+1 wounds whenever it's activated.
  if (tpl(op).symbiosis && op.wounds < op.maxW) {
    const gain = Math.min(op.maxW - op.wounds, apl + 1);
    op.wounds += gain;
    log(g, { zh: `${opName(op, 'zh')} 輻射蛆共生：回復 ${gain} 生命`, en: `${opName(op, 'en')} Rad-Maggot Symbiosis: regains ${gain} wounds` }, 'npo');
  }
}

/** Negotiation: record a player's secret bid; once both are in, resolve who (if anyone) controls the NPO. */
export function placeBid(g, side, amount) {
  const b = g.bidding;
  if (!b || b.bids[side] != null) return;
  b.bids[side] = Math.max(0, Math.min(g.negotiation?.[side] || 0, Math.floor(amount)));
  if (b.bids.every((x) => x != null)) resolveBid(g);
}

function resolveBid(g) {
  const b = g.bidding, op = getOp(g, b.uid);
  g.bidding = null;
  const [a, c] = b.bids;
  const winner = a > c ? 0 : c > a ? 1 : null;
  log(g, { zh: `談判出價 ${a} : ${c}`, en: `Negotiation bids ${a} : ${c}` }, 'npo');
  if (winner != null) {
    g.negotiation[winner] -= b.bids[winner];
    // Controlled as a friendly player operative for this activation.
    op.homeSide = NPO; op.side = winner;
    g.turn = winner;
    log(g, { zh: `${team(g, winner).name.zh} 本次操控 ${opName(op, 'zh')}`, en: `${team(g, winner).name.en} controls ${opName(op, 'en')} for this activation` }, `side${winner}`);
  } else if (!npoTargetFor(g, op)) {
    // No target under the modified threat principle and nobody controls it: skip.
    log(g, { zh: '沒有目標，檔案管理員略過這次啟動', en: 'No target: the Archivist skips this activation' }, 'npo');
    endActivation(g);
    return;
  }
  activateNpo(g, op, b.apl);
}

// ---------- mission markers ----------
const inMarkerRange = (op, m) => dist(op, m) - radius(op) - OBJ_R <= CONTROL + 0.01;
/** Markers op can pick up now (the mission decides which kinds; carry limit 1 unless the mission says). */
/** Everything that can be carried: mission markers, Retrieval markers, and objective markers in missions that allow it (Energy Cells). */
export const carriables = (g) => [...(g.markers || []), ...(mission(g).carryObjectives ? g.objectives : [])];
/** Can op pick this marker up (whatever the distance)? */
export function canPickUpMarker(g, op, m) {
  if (m.kind === 'retrieval' || m.kind === 'intel') return m.owner === op.side; // Retrieval / Steal Intelligence tac ops
  if (m.kind === 'banner') return true; // Plant Banner tac op: either side
  if (m.kind === 'dkMine') return m.owner === op.side && !!tpl(op).dkSapper; // the Death Korps Mine marker: its Sapper
  if (m.kind === 'xvBeacon') return !isDrone(op); // the XV26 Homing Beacon: anyone but a drone (an enemy discards it)
  if (g.objectives.includes(m)) return !!mission(g).carryObjectives && !!mission(g).canPickUpObjective?.(g, op, m);
  return !!mission(g).canPickUp?.(g, op, m);
}
export function pickUpTargets(g, op) {
  const m = mission(g);
  // (Steal Intelligence: the first Intelligence marker the operative carries is ignored for this.)
  const held = carriables(g).filter((x) => x.carriedBy === op.uid);
  const carried = held.length - (held.some((x) => x.kind === 'intel') ? 1 : 0);
  if (carried >= (m.carryCap?.(g, op) ?? 1)) return [];
  return carriables(g).filter((x) => !x.carriedBy && canPickUpMarker(g, op, x) && inMarkerRange(op, x) && (controller(g, x) === op.side || (op.rtLarcenous && isRat(op)) || op.kfPoach)); // (Poach, Gather: Kinband; Larcenous: it only has to contest the marker)
}
/** A random Tac Op from the team's archetypes (any of them if none match). */
export function tacOpsFor(teamId) {
  const arch = (TEAM_MAP[teamId].info?.archetypes || []).map((a) => a.en);
  const ids = Object.keys(TAC_OPS).filter((id) => arch.includes(TAC_OPS[id].arch));
  return ids.length ? ids : Object.keys(TAC_OPS);
}
const randomTacOp = (teamId) => { const ids = tacOpsFor(teamId); return ids[Math.floor(Math.random() * ids.length)]; };
/** Mission actions this side can perform: the mission's, plus its Tac Op's (Clear, Retrieve). */
export const missionActionsFor = (g, side) => [...accessPointsOf(g).filter(d=>d.kind === 'hatchway').map(hatchActionId), ...(g.pads?.length ? ['twTeleport'] : []), ...(mission(g).actions || []), ...(side < 2 ? TAC_OPS[g.tacOps?.[side]?.id]?.actions || [] : [])];
/** Is any operative of this side contesting the marker (within control range of it)? */
export const contests = (g, side, m) => living(g, side).some((o) => inMarkerRange(o, m));
/** Score VP from a mission source ('crit' / 'tac'), with a log line. */
export function addVP(g, side, n, kind, msg) {
  if (kind === 'crit' || kind === 'tac') n = Math.min(n, 6 - (g.vpBy?.[side]?.[kind] || 0)); // each op is worth 6VP at most (not counting the Primary Op bonus)
  if (n <= 0) return;
  g.vp[side] += n;
  ((g.vpBy ||= [{}, {}])[side])[kind] = (g.vpBy[side][kind] || 0) + n;
  log(g, { zh: `${teamZh(g, side)} ${msg.zh}（+${n} VP）`, en: `${team(g, side).name.en} ${msg.en} (+${n}VP)` }, 'tp');
}
export function doPickUp(g, op) {
  // (Its own planted Banner last: it only scores on the killzone floor.)
  const ownBanner = (m) => (m.kind === 'banner' && m.owner === op.side ? 1 : 0);
  const mk = pickUpTargets(g, op).sort((a, b) => ownBanner(a) - ownBanner(b) || dist(op, a) - dist(op, b))[0];
  if (!mk) return;
  vsMissionSpend(g, op, 'pickUp'); // Communion: a point for Pick Up Marker (Vespid Stingwings)
  spend(g, op, 'pickUp');
  mk.carriedBy = op.uid; mk.x = op.x; mk.y = op.y;
  xvAfterPickUp(g, op, mk); // the XV26 Homing Beacon: an enemy picking it up discards it
  log(g, { zh: `${opName(op, 'zh')} 撿起標記`, en: `${opName(op, 'en')} picks up a marker` }, `side${op.side}`);
  dwAfterAction(g, op);
}
/** Markers a carrier was holding stay where it fell. */
function dropMarkers(g, op) {
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.carriedBy = null; m.x = op.x; m.y = op.y; }
}
export function doMissionAction(g, op, id) {
  if (/^tw(Open|Close)_/.test(id) && (g.phase !== 'firefight' || g.active !== op.uid || op.dead || !availableActions(g,op).some(a=>a.id === id && a.ok))) return false;
  vsMissionSpend(g, op, id); // Communion: a point for a mission action (Vespid Stingwings)
  spend(g, op, id);
  if (tpl(op).gotIt) op.acted.gotItUsed = true;
  const msg = MISSION_ACTIONS[id].apply(g, op);
  if (msg) log(g, { zh: `${opName(op, 'zh')} ${msg.zh}`, en: `${opName(op, 'en')} ${msg.en}` }, `side${op.side}`); // (Scout)
  dwMissionDone(g, op, id);
  dwAfterAction(g, op);
}

export function deployOk(g, op, p) {
  if (tpl(op).spBeacon) return spBeaconOk(g, op, p); // Pre-Deploy (Spectre Vox-relay Beacon): anywhere in the territory
  const z = deployZones(g)[op.side], r = radius(op);
  if (p.x - r < z.x0 || p.x + r > z.x1 || p.y - r < z.y0 || p.y + r > z.y1) return false;
  if (g.terrain.some((t) => distPointRect(p, t) < r)) return false;
  return !g.ops.some((o) => o.uid !== op.uid && !o.dead && dist(o, p) < radius(o) + r + 0.05);
}

// ---------- alternating deployment ----------
const unplaced = (g, side) => g.ops.filter((o) => o.side === side && !o.dead && o.placed === false);
/** How many operatives the side must set up in its current deployment step. */
/** The side whose roll-off decides the drop zone: it picks which edge of the killzone it sets up on (before anything is placed). */
export const zonePending = (g) => !!g.zonePick && !g.zonePick.done;
export function chooseDropZone(g, side, swap) {
  if (!zonePending(g) || g.zonePick.side !== side) return false;
  if (swap) {
    const z = deployZones(g);
    g.deploy = [{ ...z[1] }, { ...z[0] }];
    for (const o of g.ops) if (isEDM(o)) o.facing = facingIn(g, o.side);
  }
  g.zonePick.done = true;
  log(g, { zh: `${teamZh(g, side)} 選擇降落區：${swap ? '換邊' : '維持原位'}`, en: `${team(g, side).name.en} chooses a drop zone: ${swap ? 'the other side' : 'as shown'}` }, `side${side}`);
  return true;
}
/** Where a side's drop zone lies, for the picker: 'low' (left / top) or 'high'. */
export const zoneEdge = (g, side) => { const a = g.axis === 'y' ? 'y' : 'x'; return deployZones(g)[side][a + '0'] < (a === 'x' ? boardOf(g).w : boardOf(g).h) / 2 ? 'low' : 'high'; };
/** Deployment groups: the team split into three as evenly as possible, bigger groups first (10 operatives: 4-3-3; 7: 3-2-2). */
function depNeed(g, side) {
  const n = g.ops.filter((o) => o.side === side).length, step = g.dep.step?.[side] || 0;
  if (step >= 3) return unplaced(g, side).length;
  return Math.min(Math.max(1, Math.floor(n / 3) + (step < n % 3 ? 1 : 0)), unplaced(g, side).length);
}

/** Can this operative be (re)placed now? Unplaced ones of the deploying side, or ones placed in this step. */
export function canPlace(g, op) {
  if (g.eqDeploy && !g.eqDeploy.done) return false;
  const d = g.dep;
  if (!d || d.done || g.phase !== 'deploy' || op.side !== d.turn) return false;
  return d.batch.includes(op.uid) || (op.placed === false && d.batch.length < d.need);
}

/** Set up (or move, within this step) one operative. */
export function placeOp(g, op, p) {
  if (!canPlace(g, op) || !deployOk(g, op, p)) return false;
  op.x = p.x; op.y = p.y;
  if (op.placed === false) { op.placed = true; g.dep.batch.push(op.uid); }
  return true;
}

/** Finish this deployment step; play passes to the other side while it still has operatives to set up. */
export function finishDeployStep(g) {
  if (g.eqDeploy && !g.eqDeploy.done) return false;
  const d = g.dep;
  if (!d || d.done || d.batch.length < d.need) return false;
  (d.step ||= [0, 0])[d.turn]++;
  const side = d.turn;
  log(g, { zh: `${teamZh(g, side)} 部署了 ${d.batch.length} 名特工`, en: `${team(g, side).name.en} set up ${d.batch.length} operative(s)` }, `side${side}`);
  const other = 1 - side;
  d.turn = unplaced(g, other).length ? other : side;
  d.batch = [];
  if (!unplaced(g, 0).length && !unplaced(g, 1).length) {
    d.done = true;
    log(g, { zh: '雙方部署完成', en: 'Both teams are set up' }, 'tp');
  } else d.need = depNeed(g, d.turn);
  return true;
}

/** Set up the rest of the current step automatically (the computer, or the "auto" button). */
export function autoDeployStep(g) {
  if (g.eqDeploy && !g.eqDeploy.done) return;
  const d = g.dep;
  if (!d || d.done) return;
  const ops = unplaced(g, d.turn).slice(0, d.need - d.batch.length);
  for (const o of placeAuto(g, d.turn, ops)) { o.placed = true; d.batch.push(o.uid); }
}

/** Place every operative of a side automatically (rearranging them). */
export function autoDeploy(g, side) {
  for (const o of g.ops) if (o.side === side && o.underground) { o.underground = false; o.reserve = false; } // (Raveners underground are set up again)
  const ops = g.ops.filter((o) => o.side === side && !o.reserve); // (Exodite riders in reserve aren't set up)
  for (const o of ops) { o.x = -99; o.y = -99; o.placed = false; }
  for (const o of placeAuto(g, side, ops)) o.placed = true;
}

export function placeAuto(g, side, ops) { return rvPlaceAuto(g, side, ops, (g2, s2, o2) => aqPlaceAuto(g2, s2, o2, (g3, s3, o3) => spPlaceAuto(g3, s3, o3, placeAutoBase))); } // (Raveners: all but the first two go underground)
function placeAutoBase(g, side, ops) {
  const result = [];
  const z = deployZones(g)[side];
  const cands = [];
  for (let x = z.x0 + 0.8; x <= z.x1 - 0.8; x += 1.6)
    for (let y = z.y0 + 0.8; y <= z.y1 - 0.8; y += 1.7) cands.push({ x, y });
  // Hidden spots first, then the front line (nearest the centre along the mission's axis), spread out from the middle.
  const along = g.axis === 'y' ? 'y' : 'x', across = along === 'x' ? 'y' : 'x';
  const mid = { x: boardOf(g).w / 2, y: boardOf(g).h / 2 };
  const front = (a) => Math.abs(a[along] - mid[along]);
  // Prefer spots where a Concealed operative can't be targeted from the enemy's drop zone (or from enemies
  // already set up): in cover or out of sight from as many viewpoints as possible.
  const ez = deployZones(g)[1 - side], probe = ops[0];
  const views = g.ops.filter((o) => o.side === 1 - side && !o.dead && o.x > -50).map((o) => ({ x: o.x, y: o.y }));
  for (let x = ez.x0 + 1; x <= ez.x1 - 1; x += Math.max(1, (ez.x1 - ez.x0 - 2) / 3)) for (let y = ez.y0 + 1; y <= ez.y1 - 1; y += Math.max(1, (ez.y1 - ez.y0 - 2) / 3)) views.push({ x, y });
  const exposed = (p) => {
    if (!probe) return 0;
    const me = { ...probe, x: p.x, y: p.y, order: 'conceal' };
    let n = 0;
    for (const v of views) { const s = visibility(g, { ...probe, x: v.x, y: v.y }, me); if (s.visible) n += s.cover ? 0.15 : 1; }
    return n;
  };
  const exp = new Map(cands.map((p) => [p, exposed(p)]));
  cands.sort((a, b) => Math.round(exp.get(a) * 2) - Math.round(exp.get(b) * 2) || front(a) - front(b) || Math.abs(a[across] - mid[across]) - Math.abs(b[across] - mid[across]));
  const placed = g.ops.filter((o) => o.side === side && !ops.includes(o) && o.x > -50).map((o) => ({ x: o.x, y: o.y }));
  for (const o of ops) {
    let spot = cands.find((p) => deployOk(g, o, p) && placed.every((q) => dist(p, q) >= 2.6))
      || cands.find((p) => deployOk(g, o, p));
    // Large bases (e.g. a 50mm Technomancer) may not fit the coarse grid: try a finer one.
    for (let x = z.x0 + radius(o); !spot && x <= z.x1 - radius(o); x += 0.4)
      for (let y = z.y0 + radius(o); !spot && y <= z.y1 - radius(o); y += 0.4) if (deployOk(g, o, { x, y })) spot = { x, y };
    if (!spot) continue; // No legal space: leave the operative unset rather than overlapping a base or cover.
    o.x = spot.x; o.y = spot.y; placed.push(spot);
    result.push(o);
  }
  return result;
}

// ---------- log ----------
export function log(g, msg, cls = '') {
  g.seq = (g.seq || 0) + 1;
  g.log.push({ msg, cls, tp: g.tp, n: g.seq });
  if (g.log.length > 200) g.log.shift();
}

// ---------- turning points ----------
export function startBattle(g) {
  if (g.eqDeploy && !g.eqDeploy.done) return false;
  // Anyone not set up yet (e.g. automatic games) is placed automatically.
  for (const side of [0, 1]) {
    const rest = unplaced(g, side);
    if (rest.length) for (const o of placeAuto(g, side, rest)) o.placed = true;
  }
  if (unplaced(g, 0).length || unplaced(g, 1).length) return false;
  if (g.dep) g.dep.done = true;
  scResolve(g); // Scout Squad: Forward Scouting options (end of the Set Up Operatives step)
  rvStart(g); // Raveners: Tunnel marker 0
  startTP(g);
}

function startTP(g) {
  g.tp++;
  g.phase = 'initiative'; // the Initiative phase comes first; startStrategy moves on
  // Roll-off (house rules): the higher roll decides who has initiative, after any initiative cards are used.
  let a, b;
  a = d6(); b = d6(); // (ties don't re-roll: see initWinner)
  g.initRoll = [a, b];
  g.initRolled = [a, b];
  g.prevInitiative = g.initiative;
  g.initiative = null;
  g.initDecider = null;
  g.initLocked = false;
  g.initCards ||= [[], []];
  // Well Supplied (Hearthkyn Lugger): +1CP in the first turning point.
  if (g.tp === 1) for (const s of [0, 1]) if (living(g, s).some((o) => tpl(o).wellSupplied)) g.cp[s] += 1;
  g.counter = false;
  g.stratStep = 0;
  g.stratTurn = null; g.stratPasses = 0; g.stratOpportunities = [0, 0];
  g.actCount = [0, 0, 0];
  for (const s of [0, 1]) gainBlood(g, s, { zh: '策略階段', en: 'Strategy phase' }); // Blooded: a token each Ready step
  // Strategic Oversight (Phobos Commsman): D6 4+ for 1 more CP, if it isn't within enemy control range.
  for (const s of [0, 1]) {
    const cm = living(g, s).find((o) => tpl(o).oversight && !isEngaged(g, o));
    if (!cm) continue;
    const r = d6();
    if (r >= 4) g.cp[s]++;
    log(g, { zh: `${opName(cm, 'zh')} 戰略監督（擲 ${r}）${r >= 4 ? '：+1CP' : '：沒有效果'}`, en: `${opName(cm, 'en')} Strategic Oversight (rolled ${r})${r >= 4 ? ': +1CP' : ': no effect'}` }, `side${s}`);
  }
  // actTP / movedTP: NPO activation and movement limits per turning point.
  for (const o of g.ops) { o.ready = !o.dead; o.acted = {}; o.ap = 0; o.counteracted = false; o.dwGuard = false; o.actTP = 0; o.movedTP = 0; o.patSpent = 0; }
  yaegirReady(g); // Hernkyn Yaegirs: Resourceful points, Minefield resets
  // Malefic Vortex (Chaos Cult Mindwitch): in the Ready step, 1 damage to each enemy within 2" of the marker.
  for (const m of (g.markers || []).filter((x) => x.kind === 'vortex')) {
    for (const e of g.ops.filter((o) => !o.dead && o.side === 1 - m.owner && o.x > -50 && dist(o, m) - radius(o) <= 2)) applyDamage(g, null, e, 1);
  }
  for (const s of [0, 1]) { livingMetal(g, s); readyReanimation(g, s); readyFaith(g, s); } // Hierotek Circle / Novitiates
  archonReady(g);
  mdReady(g);
  // Smoke grenades from the last turning point stay for D3 more activations (rolled in this Ready step).
  g.smoke = (g.smoke || []).filter((s) => s.persistent || s.tp === g.tp - 1).map((s) => s.persistent ? s : ({ ...s, left: d3() }));
  log(g, { zh: `── 第 ${g.tp} 回合 ── 主動權擲骰 ${a} : ${b}`, en: `── Turning Point ${g.tp} ── Initiative roll ${a} : ${b}` }, 'tp');
  // The computer plays its initiative cards at once; with no card a human player can use, the result stands.
  aiInitCards(g);
  if (![0, 1].some((s) => s !== g.ai && g.initCards[s].length)) lockInitRoll(g);
  wkReady(g); // Wrecka Krew: Pulsa markers lose a point, Demolition markers go
  ncReady(g); // Nemesis Claw: D3 Prescience points
  scReady(g); // Scout Squad: Trip Alarm markers go in the third turning point
  pmReady(g); // Plague Marines: the Clouds of Flies go
  kmReady(g); // Kommandos: the Harpoon is ready again
  dkReady(g); // Death Korps: the Gas marker goes
  sfReady(g); // Sanctifiers: a new Orator when needed, Ecclesiarchy Texts
  spReady(g); // Spectre Squad: Fieldcraft points
  aqReady(g); // Tempestus Aquilons: a Drop marker goes in TP2 and TP3
  vsReady(g); // Vespid Stingwings: Communion points
  xvReady(g); // XV26 Stealth Battlesuits: the Ambush marker, the Homing Beacon
  mission(g).onReady?.(g); // the Ready step
}

// ---------- initiative cards (house rules) ----------
// The loser of the roll-off when setting up the battle gets a Re-roll card, of TP1 a ±1 card, of TP2 ±2, of TP3 ±3.
// Each is used once, in a later Initiative phase: Re-roll re-rolls your own die, ±N adds or subtracts N from either die.
// Ties: re-rolled in TP1; after that the first one is decided by the loser of the TP1 roll-off, later ones by the player who didn't decide last time.
export const INIT_CARDS = {
  reroll: { n: 0, name: { zh: '重擲', en: 'Re-roll' } },
  pm1: { n: 1, name: { zh: '±1', en: '±1' } },
  pm2: { n: 2, name: { zh: '±2', en: '±2' } },
  pm3: { n: 3, name: { zh: '±3', en: '±3' } },
};
const INIT_AWARD = [null, 'pm1', 'pm2', 'pm3']; // by turning point (the Re-roll card comes from the setup roll-off)
/** Who would decide initiative with the dice as they stand now. */
export function initWinner(g, roll = g.initRoll) {
  const [a, b] = roll;
  if (a !== b) return a > b ? 0 : 1;
  // A tie is won by the player without initiative at the moment (TP1: the one who didn't have it at set-up); the loser gets the card.
  return 1 - (g.tp === 1 ? g.setupFirst : g.prevInitiative);
}
/** Use an initiative card: 'reroll' (own die), or ±N with die (0/1) and sign (+1/-1). */
export function useInitCard(g, side, id, die = side, sign = 1) {
  const i = g.initCards?.[side]?.indexOf(id) ?? -1;
  if (g.phase !== 'initiative' || g.initLocked || i < 0) return false;
  g.initCards[side].splice(i, 1);
  const before = [...g.initRoll];
  if (id === 'reroll') g.initRoll[side] = d6();
  else g.initRoll[die] += sign * INIT_CARDS[id].n;
  const who = (s) => (s === side ? '自己' : '對手'), whoEn = (s) => (s === side ? 'its own' : 'the opponent\'s');
  log(g, id === 'reroll'
    ? { zh: `${teamZh(g, side)} 使用重擲卡：骰子 ${before[side]} → ${g.initRoll[side]}（${g.initRoll[0]} : ${g.initRoll[1]}）`, en: `${team(g, side).name.en} uses its Re-roll card: ${before[side]} → ${g.initRoll[side]} (${g.initRoll[0]} : ${g.initRoll[1]})` }
    : { zh: `${teamZh(g, side)} 使用 ±${INIT_CARDS[id].n} 卡：${who(die)}的骰子 ${sign > 0 ? '+' : '-'}${INIT_CARDS[id].n}（${g.initRoll[0]} : ${g.initRoll[1]}）`, en: `${team(g, side).name.en} uses its ±${INIT_CARDS[id].n} card: ${sign > 0 ? '+' : '-'}${INIT_CARDS[id].n} to ${whoEn(die)} die (${g.initRoll[0]} : ${g.initRoll[1]})` }, `side${side}`);
  return true;
}
/** The dice are final: the roll-off result decides who chooses initiative; the loser gets this turning point's card. */
export function lockInitRoll(g) {
  if (g.initLocked) return;
  g.initLocked = true;
  const [a, b] = g.initRoll, tie = a === b;
  const d = initWinner(g);
  if (g.tp === 1) g.initFirstLoser = 1 - d;
  if (tie) g.initTies = (g.initTies || 0) + 1;
  g.lastDecider = d;
  g.initDecider = d;
  if (tie) log(g, { zh: `主動權平手（${a} : ${b}）→ ${teamZh(g, d)} 決定先後攻`, en: `Initiative tie (${a} : ${b}) → ${team(g, d).name.en} decides` }, 'tp');
  // The player who didn't get to decide gets this turning point's card (not in the last one: it couldn't be used).
  const card = g.tp < MAX_TP ? INIT_AWARD[g.tp] : null;
  if (card) {
    g.initCards[1 - d].push(card);
    log(g, { zh: `${teamZh(g, 1 - d)} 擲輸，獲得「${INIT_CARDS[card].name.zh}」卡（之後的先攻階段可用一次）`, en: `${team(g, 1 - d).name.en} lost the roll-off and gains the ${INIT_CARDS[card].name.en} card (usable once in a later Initiative phase)` }, `side${1 - d}`);
  }
  // The computer decides at once (it takes initiative); a human player chooses in the Initiative phase.
  if (g.ai === d) setInitiative(g, d);
}
/** The computer's initiative cards: when it would lose, the smallest card that wins it the roll-off (else a Re-roll if its die is low). */
export function aiInitCards(g) {
  const s = g.ai;
  if (s == null || s > 1 || g.initLocked) return;
  if (initWinner(g) !== s && rvSensesOk(g, s)) rvUseSenses(g, s); // Heightened Senses (Raveners)
  const cards = g.initCards[s];
  if (!cards.length || initWinner(g) === s) return;
  for (const id of ['pm1', 'pm2', 'pm3'].filter((c) => cards.includes(c))) {
    const n = INIT_CARDS[id].n;
    for (const [die, sign] of [[s, 1], [1 - s, -1]]) {
      const r = [...g.initRoll]; r[die] += sign * n;
      if (initWinner(g, r) === s) { useInitCard(g, s, id, die, sign); return; }
    }
  }
  if (cards.includes('reroll') && g.initRoll[s] <= 3) useInitCard(g, s, 'reroll');
}
export { rvSensesOk, rvUseSenses };

/** The roll-off winner's choice: who has initiative this turning point. Then each player gains CP. */
export function setInitiative(g, side) {
  if (g.initiative != null) return;
  g.initiative = side;
  // Each player gains 1CP; after the first TP the player without initiative gains 2CP instead.
  g.cp[side] += 1;
  g.cp[1 - side] += g.tp > 1 ? 2 : 1;
  const d = g.initDecider;
  log(g, { zh: `${teamZh(g, d)} 擲贏主動權，${d === side ? '選擇自己先攻' : `讓 ${teamZh(g, side)} 先攻`}`, en: `${team(g, d).name.en} wins the roll-off and ${d === side ? 'takes initiative' : `gives initiative to ${team(g, side).name.en}`}` }, `side${d}`);
}

/** End the Initiative phase (roll-off, CP, Ready step) and begin the Strategy phase. */
export function startStrategy(g) {
  mdStrategy(g);
  mwStrategy(g);
  if (g.phase !== 'initiative') return;
  lockInitRoll(g); // (cards not used: the dice stand)
  if (g.initiative == null) setInitiative(g, g.initDecider); // (not chosen: the winner takes it)
  g.phase = 'strategy';
  log(g, { zh: '進入策略階段', en: 'Strategy phase begins' }, 'tp');
}

/** The side choosing strategy ploys: the initiative player first, then the other player. */
export const ployChooser = (g) => g.stratTurn ?? (g.stratStep ? 1 - g.initiative : g.initiative);

/** The current chooser is done with ploys; after both sides the Firefight phase begins. */
export function finishPloys(g) {
  if (g.phase !== 'strategy') return false;
  const side = ployChooser(g);
  log(g, { zh: `${teamZh(g, side)} 跳過（0CP）`, en: `${team(g, side).name.en} passes (0CP)` }, `side${side}`);
  g.stratOpportunities ||= [0, 0];
  if (!g.stratOpportunities[side] && !g.ploys[side].length && living(g, side).some((o) => tpl(o).cunning)) { g.cp[side]++; log(g, { zh: '狡詐：首先放棄策略計謀，+1CP', en: 'Cunning: passed at first opportunity, +1CP' }, `side${side}`); }
  g.stratOpportunities[side]++;
  g.stratPasses = (g.stratPasses || 0) + 1;
  g.stratTurn = 1 - side;
  if (g.stratPasses >= 2) {
    fillPrimary(g);
    vdFill(g); // Void-dancer Troupe: an allegory and a Pivotal Role if nobody picked one
    for (const s of [g.initiative, 1 - g.initiative]) finalizeStrategy(g, s);
    startFirefight(g);
  }
  return true;
}

function finalizeStrategy(g, side) {
  corsairStrategy(g, side);
  dwStrategy(g, side);
  handOutGuardOrder(g, side);
  tacOnStrategyEnd(g, side); // Stake Claim / Envoy picks not made yet are made now
  ncReturn(g, side); // Return to Darkness (Nemesis Claw): a free move beside Heavy terrain
  skillsStrategyEnd(g, side); // Kasrkin: Skill at Arms (if not picked) and the Clearance Sweep marker
  battlecladeStrategyEnd(g, side); // Battleclade: Prioritised Acquisition marker
  danceOfDeath(g, side); // Blades of Khaine
  goremongerStrategyEnd(g, side); // Goremongers: Hunt for Blood
  dauntlessExplorers(g, side); wroughtlockNegotiation(g, side); // Hernkyn Yaegirs gambits
  broodStrategyEnd(g, side); // Brood Brothers: Coordinate, Spiritual Leader
  placeNodes(g, side); ceaselessScuttling(g, side); // Canoptek Circle: obelisk nodes, A Ceaseless Scuttling
  cultStrategyEnd(g, side); // Chaos Cult: Mutation
  starstridersStrategyEnd(g, side); // Elucidian Starstriders: Stake Claim
  insidiantsStrategyEnd(g, side); // Celestian Insidiants: Zealous Ultimatum, Suspect & Eliminate
}

/** An operative whose Doctrine Warfare makes this ploy free (once per battle each), if any. */
function freePloyOp(g, side, ploy) {
  if (g.freePloys?.[side]?.includes(ploy.id)) return null;
  return living(g, side).find((o) => tpl(o).doctrineWarfare?.includes(ploy.id)) || null;
}

/** Which player's territory a point is in (its half of the killzone, along the mission's axis). */
export function territoryOf(g, p) {
  const zones = deployZones(g), along = g.axis === 'y' ? 'y' : 'x', mid = along === 'x' ? boardOf(g).w / 2 : boardOf(g).h / 2;
  const side0Low = zones[0][along + '0'] < mid;
  return (p[along] < mid) === side0Low ? 0 : 1;
}
/** In the opponent's territory (wholly in their half of the killzone). */
const inEnemyTerritory = (g, op) => {
  const along = g.axis === 'y' ? 'y' : 'x', r = radius(op);
  return [op[along] - r, op[along] + r].every((v) => territoryOf(g, { [along]: v }) !== op.side);
};

// Icon of Contagion: Contagion is free while the Icon Bearer is in the opponent's territory.
// Command Breach (Sergeant-at-Arms): Attack / Defence Order cost 0CP.
export const ployCost = (g, side, ploy) => (dwCommandFree(g, side, 'strategy') || vsCommuneFree(g, side, ploy) || freePloyOp(g, side, ploy)
  || (ploy.id === 'contagion' && living(g, side).some((o) => tpl(o).iconBearer && inEnemyTerritory(g, o)))
  || (ploy.group === 'navyOrder' && living(g, side).some((o) => tpl(o).commandBreach))
  || broodFreePloy(g, side, ploy)
  || wkGlyphFree(g, side, ploy) // Glyphs (Wrecka Krew)
  || rtFree(g, side, ploy.id) // a Ratling ploy chosen to cost 0CP for the battle
  || dkFreeHas(g, side, ploy.id) // a Death Korps ploy chosen to cost 0CP for the battle
  || (ploy.id === 'suspectEliminate' && living(g, side).some((o) => tpl(o).accusingExorcist && o.inspiring)) ? 0 : ploy.cp + (ploy.id === 'denounce' ? g.denounceUses?.[side] || 0 : 0)); // Accusing Exorcist (Denuncia); Denounce (Inquisition): +1CP per earlier use
/** Brood Brothers: Broodcoven selections taken as ploys — the first ones bought cost 0CP for the rest of the battle. */
const broodFreePloy = (g, side, ploy) => !!g.freePloyCount?.[side] && team(g, side).ploys.includes(ploy)
  && (g.bbFree?.[side]?.includes(ploy.id) || (g.bbFree?.[side]?.length || 0) < g.freePloyCount[side]);

/**
 * Can't be used now: already used this ploy, or another from its group this turning point (e.g. one
 * Combat Doctrine), a once-per-battle ploy already used, or the operative it needs isn't in the killzone.
 */
export const ployTaken = (g, side, ploy) => (ploy.id === 'mdCreeping' && g.tp === 1) || g.ploys[side].some((id) => id === ploy.id
  || (ploy.group && team(g, side).ploys.find((p) => p.id === id)?.group === ploy.group))
  || (ploy.oncePerBattle && !!g.battlePloys?.[side]?.includes(ploy.id))
  || (ploy.needs && !living(g, side).some((o) => o.tplId === ploy.needs))
  || (ploy.id === 'plunderers' && g.tp === 1)
  || (ploy.id === 'scStealth' && g.tp === 1); // Stealth Relocation (Scout Squad): not in the first turning point

export function buyPloy(g, side, ploy) {
  if (g.phase !== 'strategy' || !ploy) return false;
  if (ploy.id === 'mdCreeping' && g.tp === 1) return false;
  const cost = ployCost(g, side, ploy);
  if (side !== ployChooser(g) || g.cp[side] < cost || ployTaken(g, side, ploy)) return false;
  if (g.ployBlocked?.[side]?.[ploy.id] === g.tp) return false; // (Absolute Authority: not again this TP)
  if (absoluteAuthority(g, side, ploy, cost)) { advanceStrategy(g, side); return true; } // (Inquisition: cancelled, nothing spent)
  if (dwCommandFree(g, side, 'strategy')) dwConsumeCommand(g, side, 'strategy');
  g.cp[side] -= cost;
  g.ploys[side].push(ploy.id);
  scrivener(g, side, ploy.id); // Scrivener (Inquisition Autosavant)
  if (isIATeam(g, side)) inquisitionPloy(g, side, ploy); // Denounce / Quarry
  if (broodFreePloy(g, side, ploy) && !g.bbFree?.[side]?.includes(ploy.id)) ((g.bbFree ||= [[], []])[side]).push(ploy.id); // (free from now on)
  if (ploy.id === 'plunderers') corsairPlunder(g, side);
  wkPloyBought(g, side, ploy, cost); // Wrecka Krew: Glyphs used, Amped Up heals
  scPloyBought(g, side, ploy); // Scout Squad: Adaptable Training, Stealth Relocation
  sfPloyBought(g, side, ploy); // Sanctifiers: Rally the Flock
  pmPloyBought(g, side, ploy); // Plague Marines: Cloud of Flies, Nurglings
  kmPloyBought(g, side, ploy); // Kommandos: Sssshhhh!
  pfPloyBought(g, side, ploy); // Pathfinders: Recon Sweep
  dkPloyBought(g, side, ploy); // Death Korps: Regroup
  rvPloyBought(g, side, ploy); // Raveners: Writhe Out of Sight
  spPloyBought(g, side, ploy); // Spectre Squad: Disappear
  xvPloyBought(g, side, ploy); // XV26 Stealth Battlesuits: Prepare Ambush
  aqPloyBought(g, side, ploy); // Tempestus Aquilons: Sudden Offensive, Eye Above, Drop and Secure
  adPloyBought(g, side, ploy); // Angels of Death: Adaptive Tactics
  if (ploy.oncePerBattle) ((g.battlePloys ||= [[], []])[side]).push(ploy.id);
  // Glory Kill: the toughest enemy a friendly can see (it can be changed while choosing ploys).
  if (ploy.id === 'gloryKill') setGloryKill(g, side, living(g, 1 - side).filter((e) => living(g, side).some((f) => visibility(g, f, e).visible)).sort((a, b) => b.wounds - a.wounds)[0]);
  // Attack / Defence Order: the marker starts by the friendly operative nearest the centre of the killzone.
  if (ploy.marker) placeNavyOrder(g, side, living(g, side).sort((a, b) => dist(a, { x: boardOf(g).w / 2, y: boardOf(g).h / 2 }) - dist(b, { x: boardOf(g).w / 2, y: boardOf(g).h / 2 }))[0]);
  const free = cost === 0 && ploy.cp > 0 ? freePloyOp(g, side, ploy) : null;
  if (free) (g.freePloys[side] ||= []).push(ploy.id);
  const note = free ? { zh: `（${opName(free, 'zh')} 教條戰：0CP）`, en: ` (${opName(free, 'en')} Doctrine Warfare: 0CP)` } : { zh: '', en: '' };
  log(g, { zh: `${teamZh(g, side)} 使用計謀「${ploy.name.zh}（${ploy.name.en}）」${note.zh}`, en: `${team(g, side).name.en} uses ploy "${ploy.name.en}"${note.en}` }, `side${side}`);
  advanceStrategy(g, side);
  return true;
}

function advanceStrategy(g, side) {
  g.stratOpportunities ||= [0, 0]; g.stratOpportunities[side]++;
  g.stratPasses = 0; g.stratTurn = 1 - side;
}

export function startFirefight(g) {
  g.phase = 'firefight';
  g.turn = g.initiative;
  pfWorthy(g); // Pathfinders: A Worthy Cause
}

/**
 * Can this ready operative be activated? A C.A.T. unit can't while within enemy control range or once its
 * Surveyor is gone (the turning point can end with it still ready).
 */
export function canActivateOp(g, o) {
  if (!o.ready || o.dead) return false;
  if (tpl(o).catUnit && (isEngaged(g, o) || !living(g, o.side).some((s) => tpl(s).surveyor))) return false;
  return true;
}
export function hasReady(g, side) { return living(g, side).some((o) => canActivateOp(g, o)); }

// ---------- Group Activation / Directive (Death Korps) ----------
/** Ready operatives the side may activate now (only the chained ones right after a Trooper or a Directive). */
// System Jam tokens (Hearthkyn Kinlynk): those operatives wait until every ready one without a token is expended.
export function readyOps(g, side) {
  let ready = living(g, side).filter((o) => canActivateOp(g, o) && (!g.chain || g.chain.uids.includes(o.uid)));
  ready = ready.filter((o) => !scrambled(g, o, ready) && !dwBlocked(g, o) && o.mdWhisperTP !== g.tp); // Omni-scrambler (Phobos), Harrowing Whispers
  if (g.ncScream && ready.some((o) => o.uid !== g.ncScream)) ready = ready.filter((o) => o.uid !== g.ncScream); // Vox Scream (Nemesis Claw)
  ready = ready.filter((o) => !denounced(g, o, ready)); // Denounce (Inquisition)
  ready = ready.filter((o) => !vdFogged(g, o, ready)); // Fog of Dreams (Void-dancer Shadowseer)
  return ready.some((o) => !o.jam) ? ready.filter((o) => !o.jam) : ready;
}

/** After a Directive (optional), the player may decline to activate the chosen operative. */
export function passChain(g) {
  if (!g.chain || g.chain.must || g.active) return;
  const side = g.chain.side;
  // Not using Breach and Clear: an Armsman's Group Activation still applies.
  const fb = (g.chain.fallback || []).filter((u) => canActivateOp(g, getOp(g, u)));
  if (fb.length) { g.chain = { side, uids: fb, must: true, by: g.chain.by }; return; }
  g.chain = null;
  handOff(g, side);
}

export function activate(g, op) {
  if (mwDelay(g, op, autoFF)) return false;
  if (ncScream(g, op, autoFF)) return false; // Vox Scream (Nemesis Claw): the opponent must pick another operative
  g.ncScream = null;
  if (mdInterrupt(g, op, d6)) return false;
  for (const o of living(g, op.side)) o.mdWhisperTP = null;
  op.chained = !!g.chain; // activated through Group Activation / Directive: doesn't chain again
  op.orderPicked = false; // (see setOrder)
  op.chainFrom = g.chain; // restored if the player switches to another operative before acting
  if (g.chain?.kind === 'breach') {
    (g.breachTP ||= [0, 0])[op.side] = g.tp;
    op.breachedTP = g.tp; // (Overwhelm Target)
    log(g, { zh: `突破清場：${opName(op, 'zh')} 接著行動`, en: `Breach and Clear: ${opName(op, 'en')} activates next` }, `side${op.side}`);
  }
  // Breach and Clear (Navy Breachers): ready friendlies visible within 3" now, one of which may activate right after it.
  if (TEAM_MAP[op.team].breachAndClear && !g.counter && !g.chain && g.breachTP?.[op.side] !== g.tp) {
    op.breach = living(g, op.side).filter((o) => o !== op && o.ready && edgeDist(o, op) <= 3 && visibility(g, op, o).visible).map((o) => o.uid);
  }
  g.chain = null;
  op.acted = {}; // (before Cult Ambush below records whether it started unseen)
  mdActivate(g, op);
  mwActivation(g);
  wkActivate(g, op); // Wrecka Krew: Tanked Up ends, Stoopid, Engine Oil
  if (!g.counter && tpl(op).ruststalker && hasPloy(g, op.side, 'accelerant')) op.acted.accelerant = true;
  if (!g.counter) op.jam = false; // System Jam token removed when activated
  if (!g.counter) op.rtLarcenous = false; op.kfPoach = false; // Larcenous (Ratlings) and Poach (Kinband) last until the end of the activation
  if (!g.counter) ncActivate(g, op); // Terrorchem Poison (Nemesis Claw): D3 damage when an operative with a token activates
  scActivate(g, op); // Scout Squad: Raw Physiology / Covert Position end, Guidance and Experience
  if (!g.counter) op.shieldingOn = false; // Shielding lasts until the start of its next activation
  if (!g.counter) op.gongOn = false; // so does Gong Knell
  if (!g.counter) { op.ragingHeat = false; op.gloom = false; } // and Raging Heat / One with the Gloom (Blades of Khaine)
  if (!g.counter) op.bbStartEngaged = isEngaged(g, op); // (Uprising: no effect if activated within an enemy's control range)
  if (!g.counter && g.mantle?.[op.side] === op.uid) g.mantle[op.side] = null; // and Mantle of Darkness
  // Cult Ambush (Wyrmblade): not visible to enemy operatives at the start of the activation.
  if (!g.counter && (TEAM_MAP[op.team].cultAmbush || TEAM_MAP[op.team].scoutAmbush)) op.acted.unseen = !foes(g, op).some((e) => visibility(g, e, op).visible);
  if (!g.counter) (g.actCount ||= [0, 0, 0])[op.side] = (g.actCount[op.side] || 0) + 1; // for Omni-scrambler
  if (!g.counter && g.auspex?.[op.side] === op.uid) g.auspex[op.side] = null; // Auspex Scan lasts until its next activation
  // Warpcoven psychic powers last until the start of the caster's next activation.
  if (!g.counter) for (const k of ['fate', 'ravage', 'alight']) if (g[k]?.[op.side]?.by === op.uid) g[k][op.side] = null;
  if (!g.counter && g.pan?.[op.side]?.by === op.uid) g.pan[op.side] = null; // Pan Spectral Scan ends when the Lokâtr activates
  g.active = op.uid;
  // Directive (Confidant): ready friendlies visible within 6" now, one of which may activate right after it.
  // Attuned in Purpose (Chaos Cult Blessed Blade): another ready Blessed Blade within 6" may activate with it (right after it here).
  if (tpl(op).attuned && !g.counter) op.directive = living(g, op.side).filter((o) => o !== op && o.ready && tpl(o).attuned && edgeDist(o, op) <= 6).map((o) => o.uid);
  if (!g.counter && g.ruinous?.[op.side]?.by === op.uid) g.ruinous[op.side] = null; // Ruinous Icon lasts until the Iconarch's next activation
  if (!g.counter && g.calib?.[op.side]?.by === op.uid) g.calib[op.side] = null; // so does Calibrate Voltagheist (Lectro-Maester)
  // Exodite Dragon Masters: Survivalist Spirit lasts until its next activation; Wind's Grace until the Stonesinger's first
  // activation of the next turning point.
  if (!g.counter && g.scry?.[op.side]?.by === op.uid) g.scry[op.side] = null; // Scry lasts until the Mystic's next activation
  if (!g.counter) op.mania = false; // Mania (Goremongers) lasts until the start of its next activation
  if (!g.counter) { op.survSpirit = false; for (const o of g.ops) if (o.windGrace && o.windGrace.by === op.uid && o.windGrace.tp < g.tp) o.windGrace = null; }
  if (tpl(op).confidant && !g.counter && !g.secondInCommand?.[op.side]) {
    op.directive = living(g, op.side).filter((o) => o !== op && o.ready && sameTeam(o, op) && edgeDist(o, op) <= 6 && visibility(g, op, o).visible).map((o) => o.uid);
  }
  // Each side's latest activated operative and its movement this activation, shown on the board.
  (g.recent ||= [null, null])[op.side] = { uid: op.uid, tp: g.tp, trails: [] };
  if (g.counter) {
    // Counteract: an expended Engage operative performs one 1AP action for free; order unchanged.
    op.counter = true;
    op.ap = isDeathwatch(op) ? 2 : 1;
    op.orderSet = true;
    // Network Counteract (Battleclade): any servitor, ready or not; first select its order. It stays ready if it was.
    // (Canoptek Control: just a free 1AP action — no order change, and it doesn't count as its counteraction.)
    if (g.netcounter) { op.netCounter = true; op.netWasReady = op.ready; if (g.netcounter.kind === 'control') op.ctlCounter = true; else { op.netTP = g.tp; op.orderSet = false; } }
    // (Incite Slaughter / Urgency, Chaos Cult: only that free action, and Charge / Dash up to 3".)
    op.ctlOnly = g.netcounter?.onlyActions || null; op.ctlMove = g.netcounter?.ctlMove || null;
    // Gorethirst (Goremonger firefight ploy): a Concealed one counteracts — Engage first, then only Charge, Shoot or Fight.
    if (!g.netcounter && isGM(op) && op.order === 'conceal' && ffReady(g, op.side, 'gorethirst') && ffArmed(g, op.side, 'gorethirst')) {
      spendFF(g, op.side, 'gorethirst'); op.order = 'engage'; op.ctlOnly = ['charge', 'shoot', 'fight'];
    }
  } else {
    if (op.darkAnimus) { op.aplNext = (op.aplNext || 0) - 1; op.aplKeep = false; }
    dwBeforeActivation(g, op);
    op.ap = aplNow(g, op);
    // Alpha Predator (Patriarch): two activations a turning point, no more than 4AP between them.
    if (tpl(op).alphaPredator) { op.ap = Math.max(0, Math.min(op.ap, 4 - (op.patSpent || 0))); op.patStartAp = op.ap; }
    // Draconic Cavalry Tactics (mounted Dragon Masters): two activations a TP, 3AP each at most and the APL in total.
    if (isMounted(op)) { op.ap = Math.max(0, Math.min(op.ap, 3, aplNow(g, op) - (op.patSpent || 0))); op.patStartAp = op.ap; }
    // Sorcerous Automata (Rubric Marines): -1 APL this activation unless a friendly Sorcerer is within 9".
    // Lobotomised (Gun Servitor): +1 APL this activation visible to and within 3" of another agent (not a Gun Servitor).
    if (tpl(op).lobotomised && living(g, op.side).some((o) => o !== op && !tpl(o).gunServitor && edgeDist(o, op) <= 3 && visibility(g, o, op).visible)) op.ap += 1;
    if (tpl(op).automata && !sorcererNear(g, op, 9)) {
      op.ap = Math.max(0, op.ap - 1);
      log(g, { zh: `${opName(op, 'zh')} 巫術自動機：9" 內沒有巫師，本次啟動 APL -1`, en: `${opName(op, 'en')} Sorcerous Automata: no Sorcerer within 9", -1 APL this activation` }, `side${op.side}`);
    }
    op.orderSet = false;
    op.prevOrder = op.order;
    op.optics = false; // Optics lasts until the start of the operative's next activation
    op.longSightOn = false; // so does Long-sight
    if (g.veriscant?.[op.side]?.by === op.uid) g.veriscant[op.side] = null; // Veriscant (Malocator)
    if (g.scrapcode?.[op.side] === op.uid) g.scrapcode[op.side] = null; // Scrapcode Overload
    for (const k of ['augment', 'reinforce']) if (g[k]?.[op.side]?.by === op.uid) g[k][op.side] = null; // Augment Weapon / Reinforce Metal
    if (g.pechra?.[op.side]?.by === op.uid) g.pechra[op.side] = null; // the Tracker's Pech'ra marker
    // (Once per turning point, so switching to another operative before acting doesn't repeat it.)
    const hadPoison = !!op.poison, vents = op.poisonTP !== g.tp ? pmVents(g, op) : { dmg: 1 }; // (Poison Vents: Plague Marines equipment)
    if (hadPoison && op.poisonTP !== g.tp) {
      op.poisonTP = g.tp;
      log(g, { zh: `${opName(op, 'zh')} 中毒，啟動時受到 ${vents.dmg} 傷害`, en: `${opName(op, 'en')} is poisoned and takes ${vents.dmg} damage on activation` }, `side${op.side}`);
      applyDamage(g, op, op, vents.dmg);
    }
  }
  archonActivate(g, op);
  corsairActivate(g, op);
  dwActivate(g, op);
  sfActivate(g, op); // Sanctifiers: the Sermon for this activation, Blaze token damage
  pfActivate(g, op); // Pathfinders: Point-Blank Fusillade snapshot, Pulse Accelerator and Photon Grenade tokens
  kfActivate(g, op); // Farstalker Kinband: Meat, Trophy
  ccManipActivate(g, op); // Canoptek Circle: Matrix Manipulator
  dkVeteranActivate(g, op); // Death Korps: the Veteran receives an order
  rvActivate(g, op); // Raveners: Poison tokens, Metamorphic Flesh
  spActivate(g, op); // Spectre Squad: Ambushing Volley, Weapons Team
  aqActivate(g, op); // Tempestus Aquilons: Sudden Offensive count
  vdActivate(g, op); // Void-dancer Troupe: Humbling Cruelty, Elusive Target, Understudy's Mask
  vsActivate(g, op); // Vespid Stingwings: Neutron Fragment, Neutron Fallout
  xvActivate(g, op); // XV26 Stealth Battlesuits: Multispectrum Sensor Package, Bonds of Unity, Target Locks
}

  // Archon effects are committed only when an action begins.

/** You may pick a different operative to activate (or counteract with) until its first action. */
export function canSwitchActive(g) {
  const op = activeOp(g);
  return !!op && startOfActivation(op);
}

/** Undo an activation (or counteract) that hasn't done anything yet. */
export function deactivate(g) {
  const op = activeOp(g);
  if (!op) return;
  if (op.counter) op.counter = false;
  else { if (op.prevOrder) op.order = op.prevOrder; op.orderSet = false; if (g.actCount) g.actCount[op.side]--; }
  op.ap = 0; op.acted = {};
  op.directive = null; op.breach = null;
  if (op.chainFrom?.kind === 'breach' && g.breachTP) g.breachTP[op.side] = 0;
  if (op.chainFrom) g.chain = op.chainFrom;
  op.chainFrom = null; op.chained = false;
  g.active = null;
}

export function setOrder(g, op, order) {
  if (op.orderSet) return;
  if (tpl(op).noEngage && order === 'engage') return; // Sneaky Zogger (Kommando Grot)
  if ((op.frenzy || tpl(op).stoopid) && order === 'conceal') return; // Frenzy / Stoopid (Bomb Squig): it can't have a Conceal order
  op.order = order;
  op.orderPicked = true; // the player has chosen this activation's order (the UI asks before any action)
  if (order === 'engage') dkLifeShame(g, op); // In Life, Shame (Death Korps)
}

/** Expended, Engage-order operatives that haven't counteracted this TP (Astartes: any order). */
export const counterCandidates = (g, side) => (g.netcounter?.side === side // Battleclade: NETWORK COUNTERACT (Canoptek Control: just the one picked)
  ? (g.netcounter.kind === 'control' ? living(g, side).filter((o) => g.netcounter.only.includes(o.uid)) : netCands(g, side))
  : living(g, side).filter((o) => !o.ready && (o.order === 'engage' || isAstartes(o) || tpl(o).rvAnyCounter || xvCanCounter(g, o) || (isGM(o) && ffReady(g, side, 'gorethirst') && ffArmed(g, side, 'gorethirst'))) && !o.counteracted && !tpl(o).spBeacon && !dwBlocked(g, o) && o.dwReGuardTP !== g.tp));

export function endActivation(g) {
  const op = activeOp(g);
  g.ccManip = null; g.nodalOpen = null; if (op) { op.mvb = false; rvEnd(op); spEnd(op); aqEnd(g, op); vdEnd(op); xvEnd(g, op); }
  mdEnd(g, op, autoFF);
  ncPoisonCheck(g); // Poison Objective (Nemesis Claw): enemies now contesting a poisoned objective marker
  const wasCounter = g.counter, wasNpo = !!g.npoSlot;
  const apLeft = op?.ap || 0; // (Alpha Predator: AP it didn't spend carry over to its second activation)
  if (g.proxy) endProxy(g); // an unused Interstitial Command Shoot is lost
  g.ffPending = null; g.ffAtk = null;
  if (g.smoke?.length) { for (const s of g.smoke) if (s.left != null) s.left--; g.smoke = g.smoke.filter((s) => s.left == null || s.left > 0); }
  if (op?.acted?.slink && op.order === 'engage') { op.order = 'conceal'; log(g, { zh: `${opName(op, 'zh')} 遁入黑暗：改為隱蔽指令`, en: `${opName(op, 'en')} Slink into Darkness: now Concealed` }, `side${op.side}`); }
  if (op) {
    op.ready = false; op.ap = 0; op.rtLarcenous = false; op.kfPoach = false; sfEnd(op); pfEnd(op); adEnd(op); // (Larcenous: Ratlings, until the end of the activation; the Sanctifier Sermon)
    if (op.counter) { op.counter = false; if (!op.ctlCounter) op.counteracted = true; op.ctlCounter = false; op.ctlOnly = null; op.ctlMove = null; } else if (op.aplKeep) op.aplKeep = false; else op.aplNext = 0;
    if (op.netCounter) { op.ready = op.netWasReady && !op.dead; op.netCounter = false; } // (it can still activate later)
    // Lacerate Flesh (Goremonger firefight ploy): the tank goes down again at the end, or it takes D3.
    if (op.acted.lacerate && !op.dead && !goreDown(op)) { const d = d3(); log(g, { zh: `割裂血肉：${opName(op, 'zh')} 血槽已空，受到 ${d} 傷害`, en: `Lacerate Flesh: ${opName(op, 'en')}'s tank is empty — it takes ${d} damage` }, `side${op.side}`); applyDamage(g, null, op, d); }
    // Mercurial Speed (Exodite Dragon Masters): an activation that didn't gain SPEED ends with SPEED 3-.
    if (!wasCounter && isEDM(op) && !op.acted.speedSet) op.speed = 3;
    // Devotion (Insidiant Reliquarius): inspiring and controlling an objective at the end of its activation — inspire a friendly within 6".
    if (!wasCounter && tpl(op).devotion && op.inspiring && !op.dead && (g.objectives || []).some((m) => dist(op, m) - radius(op) - OBJ_R <= CONTROL && controller(g, m) === op.side)) {
      const t = pickInspire(g, op, 6);
      if (t) inspire(g, t, { zh: '奉獻', en: 'Devotion' });
    }
    // Alpha Predator (Patriarch): after its first activation it stays ready while it has AP left this turning point.
    if ((tpl(op).alphaPredator || isMounted(op)) && !wasCounter && op.patStartAp != null) {
      op.patSpent = (op.patSpent || 0) + Math.max(0, op.patStartAp - apLeft);
      op.patStartAp = null;
      if (op.patSecondTP !== g.tp && (isMounted(op) || op.patSpent < 4) && !op.dead) { op.ready = true; op.patSecondTP = g.tp; }
    }
    // Frenzy: a Frenzied Fellgor falls when its activation or counteraction ends.
    if (op.frenzy && !op.dead) frenzyDie(g, op);
    // Mindburn lasts until the end of the target's next activation.
    if (!wasCounter && g.mindburn) for (const s of [0, 1]) if (g.mindburn[s] === op.uid) g.mindburn[s] = null;
    // An NPO controlled by a player for one activation (Negotiation) goes back to being an NPO.
    if (op.homeSide != null) { op.side = op.homeSide; op.homeSide = null; }
  }
  g.active = null;
  g.counter = false;
  g.chain = null;
  const net = g.netcounter;
  g.netcounter = null;
  if (checkWipe(g)) return;
  if (op && !wasCounter && !wasNpo && op.side < 2) rtScarper(g, 1 - op.side); // Scarper (Ratlings): a free Dash after each enemy activation
  if (g.mdResume) {
    const resume = g.mdResume; g.mdResume = null;
    const next = getOp(g, resume.uid); g.turn = resume.side;
    if (next && !next.dead && next.ready) activate(g, next);
    return;
  }
  // Battleclade: after a NETWORK COUNTERACT (or passing on one), Network Override resumes the Underseer's
  // activation; otherwise the opponent activates as normal.
  if (net && wasCounter) {
    const back = net.resume && getOp(g, net.resume);
    // Remote Pilot: note which free actions the drone took, so it can't repeat one this activation.
    if (net.pilotOf && back && !back.dead) {
      const dr = getOp(g, net.only[0]), done = ((back.acted.pilotDone ||= {})[net.only[0]] ||= []);
      if (dr) for (const k of Object.keys(dr.acted || {})) if (!['unseen', 'free', 'movedDist', 'accelerant'].includes(k) && !done.includes(k)) done.push(k);
    }
    if (back && !back.dead) { g.active = back.uid; g.turn = back.side; g.counter = net.resumeCounter; return; }
    handOff(g, net.side); return;
  }
  // Transfer Power: after this activation, one other friendly servitor may NETWORK COUNTERACT first.
  if (op && !wasCounter && !wasNpo && count(op, 'transferPower')) {
    g.netcounter = { side: op.side, by: op.uid };
    if (netCands(g, op.side).length) { g.turn = op.side; g.counter = true; return; }
    g.netcounter = null;
  }
  // Group Activation (Trooper, mandatory) / Directive (Confidant, optional): one more friendly activation first.
  if (op && !wasCounter && !wasNpo && !op.dead && !op.chained) {
    const cur = op.side;
    const grp = tpl(op).groupAct; // Trooper / Glitchling / Mutant / Armsman
    const grpUids = grp ? living(g, cur).filter((o) => canActivateOp(g, o) && tpl(o).groupAct === grp).map((o) => o.uid) : [];
    // Breach and Clear (Navy Breachers, once per TP, optional): a friendly that was ready, visible and within 3"
    // when this one activated. An Armsman that doesn't use it still has to Group Activate.
    const bc = (op.breach || []).filter((u) => canActivateOp(g, getOp(g, u)));
    op.breach = null;
    if (bc.length && g.breachTP?.[cur] !== g.tp) {
      g.chain = { side: cur, uids: bc, must: false, by: op.uid, kind: 'breach', fallback: grpUids.length ? grpUids : null };
      g.turn = cur; return;
    }
    if (grp) {
      if (grpUids.length) { g.chain = { side: cur, uids: grpUids, must: true, by: op.uid }; g.turn = cur; return; }
    } else if (op.directive?.length) {
      const uids = op.directive.filter((u) => getOp(g, u).ready && !getOp(g, u).dead);
      op.directive = null;
      if (uids.length) { g.chain = { side: cur, uids, must: false, by: op.uid }; g.turn = cur; return; }
    }
  }
  if (wasNpo) {
    // The NPO slot is over: play resumes with the player who was due to activate.
    const next = g.npoSlot.next;
    g.npoSlot = null;
    if (hasReady(g, next)) g.turn = next;
    else if (hasReady(g, 1 - next)) g.turn = 1 - next;
    else endTP(g);
    return;
  }
  const cur = g.turn, other = 1 - cur;
  if (wasCounter) {
    // After a counteract (or passing on one), play returns to the player with ready operatives.
    if (hasReady(g, other)) passTurn(g, other);
    else if (!hasReady(g, cur)) endTP(g);
    return;
  }
  handOff(g, cur);
}

/** Play passes on after `cur` finished an activation. */
export function handOff(g, cur) {
  const other = 1 - cur;
  if (g.rvSkip === other) { g.rvSkip = null; if (hasReady(g, cur)) { passTurn(g, cur); return; } } // Subterranean Ambush used the Ravener player's activation
  if (hasReady(g, other)) { passTurn(g, other); return; }
  if (!hasReady(g, cur)) { endTP(g); return; }
  // The opponent has no ready operatives: between activations they may counteract.
  if (counterCandidates(g, other).length || orderSwapCands(g, other).length) { g.turn = other; g.counter = true; return; }
  passTurn(g, cur);
}

/**
 * Hand play to `next`. In missions with NPOs, once both players have activated (i.e. play is about to go
 * back to the player with initiative), the NPOs get their slot first.
 */
function passTurn(g, next) {
  const m = mission(g);
  if (m.npoSlotDue?.(g) && next === g.initiative) {
    g.npoSlot = { next };
    g.turn = NPO;
    return;
  }
  g.turn = next;
}

/** Farstalker: friendly operatives whose order can be changed (not within enemy control range). */
export const orderSwapCands = (g, side) => (TEAM_MAP[g.teams[side]].farstalker ? living(g, side).filter((o) => !isEngaged(g, o)) : []);

function toggleOrder(g, op) {
  op.order = op.order === 'conceal' ? 'engage' : 'conceal';
  log(g, { zh: `${opName(op, 'zh')} 改為${op.order === 'conceal' ? '隱蔽' : '交戰'}指令`, en: `${opName(op, 'en')} switches to ${op.order === 'conceal' ? 'Conceal' : 'Engage'}` }, `side${op.side}`);
}

/** Farstalker, Strategy phase: change the order of up to three operatives while choosing ploys. */
export function strategySwap(g, op) {
  const side = op.side;
  if (g.phase !== 'strategy' || side !== ployChooser(g) || (g.orderSwaps?.[side] || 0) >= 3 || !orderSwapCands(g, side).includes(op)) return false;
  toggleOrder(g, op);
  (g.orderSwaps ||= [0, 0])[side] = (g.orderSwaps[side] || 0) + 1;
  return true;
}

/** Farstalker, counteract: change one operative's order instead (counts as your counteract, not the operative's). */
export function counterSwap(g, op) {
  if (!g.counter || g.active || op.side !== g.turn || !orderSwapCands(g, g.turn).includes(op)) return false;
  toggleOrder(g, op);
  endActivation(g);
  return true;
}

/** Decline the chance to counteract. */
export function passCounter(g) {
  log(g, { zh: `${teamZh(g, g.turn)} 放棄反擊`, en: `${team(g, g.turn).name.en} does not counteract` }, `side${g.turn}`);
  endActivation(g);
}

/** The side whose operatives control a marker (highest total APL contesting it), or null. */
export function controller(g, obj) {
  if (obj.carriedBy) { const c = getOp(g, obj.carriedBy); return c && !c.dead ? c.side : null; } // a carried marker belongs to its carrier
  // Irrefutable Report (Inquisition Autosavant): an objective or mission marker it contests is always its side's.
  const irr = ((g.objectives || []).includes(obj) || obj.owner == null) && living(g).find((o) => o.side < 2 && tpl(o).irrefutable && dist(o, obj) - radius(o) - OBJ_R <= CONTROL);
  if (irr) return irr.side;
  const sum = [0, 0, 0], shriek = [false, false, false], nuncio = [false, false, false], present = [false, false, false], simu = [false, false, false];
  for (const o of living(g)) {
    if (o.brutalDisplayTP === g.tp || o.ncFlayTP === g.tp || tpl(o).spBeacon) continue; // (the Vox-relay Beacon can't contest) // (Flay Them Alive: Nemesis Claw)
    // Drones count as 1 APL lower for objective control, the Icon Bearer as 1 higher; NEMESIS NPOs use their Control stat.
    // Ravage Destiny (Warpcoven): the target counts 1 lower. Frenzy (Fellgor): APL 1, whatever else applies.
    const ravaged = o.side < 2 && psyOn(g, 'ravage', 1 - o.side, o) ? 1 : 0;
    // (the Deathknell, an Icon Bearer, keeps its APL even with a Frenzy token)
    const apl = o.frenzy && !tpl(o).warGong ? 1 : tpl(o).control ?? Math.max(0, aplNow(g, o) - ((isDrone(o) && !o.xvFreeDrone) || tpl(o).machine || tpl(o).sfCherub ? 1 : 0) + (tpl(o).iconBearer || tpl(o).controlPlus || tpl(o).ncIconBearer ? 1 : 0) - ravaged); // (controlPlus: Censor, Virge of Admonition Icon Bearer)
    if (dist(o, obj) - radius(o) - OBJ_R <= CONTROL) { sum[o.side] += apl; present[o.side] = true; if (simulacrumNear(g, o) || nightmareNear(g, o, 'creaturesNightmare')) simu[o.side] = true; if (shrieked(g, o)) shriek[o.side] = true; if (nuncioNear(g, o) || scrapNear(g, o) || grislyNear(g, o)) nuncio[o.side] = true; }
  }
  // Nuncio-aquila (Exaction Squad): likewise 1 lower if one is within 3" of the Proctor-exactant (cumulative).
  for (let s = 0; s < 3; s++) if (nuncio[s]) sum[s] = Math.max(0, sum[s] - 1);
  // Horrifying Shrieking: a side's total counts 1 lower if one of its contesting operatives is within 3" of a Fleshscreamer.
  for (let s = 0; s < 3; s++) if (shriek[s]) sum[s] = Math.max(0, sum[s] - 1);
  // Simulacrum Nullificatus (Insidiant Reliquarius): likewise 1 lower if one is within 3" of it.
  for (let s = 0; s < 3; s++) if (simu[s]) sum[s] = Math.max(0, sum[s] - 1);
  rvCrestControl(g, obj, sum); // Neuropredatory Crest (Raveners): 1 lower near the Prime
  aqControl(g, obj, sum); // Drop and Secure (Tempestus Aquilons)
  xvJamControl(g, obj, sum); // Counter-Network Jammers (XV26)
  // Prioritised Acquisition (Battleclade ploy): +1 to the total while contesting the chosen marker.
  for (const s of [0, 1]) if (sum[s] > 0 && g.acquisition?.[s]?.tp === g.tp && g.acquisition[s].id === obj.id && !obj.kind) sum[s]++;
  // Cult Icon (Brood Brother Iconward): +1 to the total for a marker within 4" of it that a friendly contests.
  for (const s of [0, 1]) if (sum[s] > 0 && living(g, s).some((o) => tpl(o).cultIcon && dist(o, obj) - radius(o) <= 4)) sum[s]++;
  // Obelisk nodes (Canoptek Circle) control a marker within 1" that no enemy contests (unless both players' nodes would).
  if (obj.kind !== 'obeliskNode') {
    const nodeSides = [0, 1].filter((s) => !present[1 - s] && nodesOf(g, s).some((n) => dist(n, obj) - OBJ_R <= 1));
    if (nodeSides.length === 1) return nodeSides[0];
  }
  const best = Math.max(...sum);
  return best > 0 && sum.filter((v) => v === best).length === 1 ? sum.indexOf(best) : null;
}

function endTP(g) {
  log(g, { zh: `第 ${g.tp} 回合結束`, en: `End of Turning Point ${g.tp}` }, 'tp');
  spTPEnd(g); // Spectre Squad: the Fieldcraft points are discarded
  aqTPEnd(g); // Tempestus Aquilons: more than half in the killzone after TP1; whoever is still above after TP2 falls
  mission(g).onTPEnd?.(g);
  tacOnTPEnd(g); // Tac Op scoring (before damage this TP is forgotten)
  kmEndFirefight(g); // Krump 'Em! (Kommandos): a free Fight at the end of the Firefight phase
  ncTPEnd(g); // Nemesis Claw: unspent Prescience points are discarded
  if (g.phase === 'gameover') return;
  g.ploys = [[], [], []];
  g.mark = [null, null]; // Call the Kill lasts for the turning point
  g.orderSwaps = [0, 0];
  g.gorders = [null, null]; // Guardsman Orders
  g.chain = null;
  for (const o of g.ops) o.damagedTP = false; // Markerlight tokens stay until removed by moving
  if (g.tp >= MAX_TP) return gameOver(g);
  startTP(g);
}

// ---------- Kill Op (Approved Ops) ----------
// Enemy operatives that must be incapacitated to reach kill grades 1–5, by the enemy's starting count.
const KILL_GRADE = {
  5: [1, 2, 3, 4, 5], 6: [1, 2, 4, 5, 6], 7: [1, 3, 4, 6, 7], 8: [2, 3, 5, 6, 8], 9: [2, 4, 5, 7, 9],
  10: [2, 4, 6, 8, 10], 11: [2, 4, 7, 9, 11], 12: [2, 5, 7, 10, 12], 13: [3, 5, 8, 10, 13], 14: [3, 6, 8, 11, 14],
};
export function killThresholds(g, side) {
  // Expendable operatives (Breachers' C.A.T. unit, Gheistskull) don't count.
  const start = g.ops.filter((o) => o.side !== side && o.side !== NPO && !tpl(o).expendable).length;
  return KILL_GRADE[Math.min(14, Math.max(5, start))];
}
export const killGrade = (g, side) => killThresholds(g, side).filter((n) => g.kills[side] >= n).length;

/** Kill Op VP: 1 per kill grade reached, +1 at the end of the battle for the higher kill grade. */
export function killOpVP(g, side) {
  const grade = killGrade(g, side);
  const bonus = g.phase === 'gameover' && grade > killGrade(g, 1 - side) ? 1 : 0;
  return grade + bonus;
}
/** Primary Op: chosen after the Tac Ops and revealed when the battle ends — the VP from that op count 1.5x (rounded up). */
export const PRIMARY_OPS = ['crit', 'tac', 'kill'];
/** The Primary Op is chosen in secret in the first Strategy phase (after deployment) — Approved Ops missions only. */
export const primaryPending = (g, side) => !!g.primaryOps && g.tp === 1 && g.phase === 'strategy' && !g.primaryOps[side];
export function choosePrimary(g, side, id) {
  if (!primaryPending(g, side) || !PRIMARY_OPS.includes(id)) return false;
  g.primaryOps[side] = id; // (not logged: it stays hidden until the battle ends)
  return true;
}
/** Whoever hasn't chosen by the end of the first Strategy phase (the computer, or a player who skipped it) gets a random one. */
function fillPrimary(g) {
  if (g.primaryOps) for (const s of [0, 1]) if (!g.primaryOps[s]) g.primaryOps[s] = PRIMARY_OPS[Math.floor(Math.random() * 3)];
}
export function primaryBase(g, side) {
  const p = g.primaryOps?.[side];
  return p === 'kill' ? killOpVP(g, side) : p ? (g.vpBy?.[side]?.[p] || 0) : 0;
}
export const primaryBonus = (g, side) => (g.primaryOps && g.phase === 'gameover' ? Math.ceil(primaryBase(g, side) * 1.5) - primaryBase(g, side) : 0);
// Missions can replace the kill op with their own VP (mission(g).killOp === false).
export const totalVP = (g, side) => g.vp[side] + (mission(g).killOp === false ? 0 : killOpVP(g, side)) + primaryBonus(g, side);

function checkWipe(g) {
  if (living(g, 0).length && living(g, 1).length) return false;
  // Some missions play out the remaining turning points when one player is wiped out.
  if (mission(g).playOut && (living(g, 0).length || living(g, 1).length)) return false;
  gameOver(g);
  return true;
}

function gameOver(g) {
  g.phase = 'gameover';
  g.active = null;
  for (const o of g.ops) if (o.frenzy && !o.dead) frenzyDie(g, o); // Frenzy: they fall when the battle ends
  mission(g).onBattleEnd?.(g);
  tacOnBattleEnd(g);
  rvEndBattle(g); // Raveners still underground are incapacitated
  if (g.primaryOps) for (const s of [0, 1]) log(g, { zh: `${teamZh(g, s)} 的主要任務是「${{ crit: "核心任務", tac: "戰術行動", kill: "Kill Op" }[g.primaryOps[s]]}」：${primaryBase(g, s)} 分 ×1.5 → +${primaryBonus(g, s)}`, en: `${team(g, s).name.en}'s Primary Op was ${{ crit: "Crit Op", tac: "Tac Op", kill: "Kill Op" }[g.primaryOps[s]]}: ${primaryBase(g, s)}VP x1.5 → +${primaryBonus(g, s)}` }, "tp");
  const a = totalVP(g, 0), b = totalVP(g, 1);
  g.winner = a > b ? 0 : b > a ? 1 : null;
  log(g, { zh: `遊戲結束！總分 ${a} : ${b}`, en: `Game over! Final score ${a} : ${b}` }, 'tp');
}

// ---------- actions ----------
const MOVE_ACTIONS = ['reposition', 'charge', 'fallBack'];
const count = (op, k) => op.acted[k] || 0;
// Accelerant Agents (Hunter Clade ploy): set on the Ruststalker when it activates.
const accelerant = (op) => !!op.acted?.accelerant;
const moved = (op) => MOVE_ACTIONS.some((k) => count(op, k)) || count(op, 'dash');

// Astartes (Angels of Death): two Shoot or two Fight actions per activation, but not a second of
// either after doing one of each.
/** Astartes faction rule applies to this operative (Warpcoven: not to its Tzaangor). */
const isAstartes = (op) => !!TEAM_MAP[op.team].astartes && !tpl(op).notAstartes;

function attackAllowed(op, kind) {
  if (isMurderwing(op) && kind === 'fight' && op.acted.mwCarving && count(op, kind) >= 1) return false;
  if (isDeathwatch(op) && op.counter) return !count(op, 'shoot') && !count(op, 'fight');
  if (count(op, kind) === 0) return true;
  if (kind === 'fight' && (tpl(op).krumpin || tpl(op).twoFights || op.acted?.wkTwoFights) && count(op, kind) === 1) return true; // Krumpin' Time / Expert Swordsman / Proppa Scrap (Wrecka Krew)
  if (kind === 'shoot' && tpl(op).pistolBarrage && op.acted.barrage?.remaining > 0) return true;
  if (kind === 'shoot' && op.acted.iaBar?.left > 0) return true; // Pistol Barrage (Inquisition Pistolier)
  if (kind === 'shoot' && tpl(op).mercilessHunter && !op.acted.archonMark && count(op, kind) === 1) return true;
  if (kind === 'shoot' && tpl(op).twoShoots && count(op, kind) === 1) return true; // Expert Gunslinger
  if (kind === 'shoot' && count(op, kind) === 1 && rapidOK(op) && op.acted.shotRapid) return true; // Rapid Fire (Kasrkin)
  if (op.acted.scTrain && count(op, kind) === 1 && count(op, kind === 'shoot' ? 'fight' : 'shoot') === 0) return true; // Astartes Training (Scout Squad): two Shoots or two Fights
  if (kind === 'fight' && count(op, kind) < (op.acted.fightsAllowed || 1)) return true; // Enraged Ambull: two Fights
  if (kind === 'fight' && count(op, kind) === 1 && accelerant(op)) return true; // Accelerant Agents (Ruststalkers)
  if (kind === 'shoot' && op.acted.starfall && count(op, kind) === 1) return true; // Starfall (Blades of Khaine)
  const otherKind = kind === 'shoot' ? 'fight' : 'shoot';
  // Astartes / Exarch (Blades of Khaine) / Fist of the Patriarch (Primus): two Shoot or two Fight actions.
  return (isAstartes(op) || !!tpl(op).exarch || !!tpl(op).fistPatriarch) && count(op, kind) === 1 && count(op, otherKind) === 0;
}

export const ACTIONS = {
  reposition: { ap: 1, name: { zh: '移動', en: 'Reposition' } },
  dash: { ap: 1, name: { zh: '衝刺', en: 'Dash' } },
  charge: { ap: 1, name: { zh: '衝鋒', en: 'Charge' } },
  fallBack: { ap: 2, name: { zh: '撤退', en: 'Fall Back' } },
  shoot: { ap: 1, name: { zh: '射擊', en: 'Shoot' } },
  fight: { ap: 1, name: { zh: '近戰', en: 'Fight' } },
  optics: { ap: 1, name: { zh: '光學瞄準', en: 'Optics' } },
  markerlight: { ap: 1, name: { zh: '標記光', en: 'Markerlight' } },
  signal: { ap: 1, name: { zh: '信號', en: 'Signal' } },
  spot: { ap: 1, name: { zh: '觀測', en: 'Spot' } },
  knuxSmash: { ap: 1, name: { zh: '指虎重擊', en: 'Knux Smash' } },
  boost: { ap: 1, name: { zh: '加速', en: 'Boost' } },
  guerrilla: { ap: 1, name: { zh: '游擊戰', en: 'Guerrilla Warfare' } },
  auspexScan: { ap: 1, name: { zh: '鳥卜儀掃描', en: 'Auspex Scan' } },
  helix: { ap: 1, name: { zh: '螺旋手套', en: 'Helix Gauntlet' } },
  gongKnell: { ap: 1, name: { zh: '鳴鑼', en: 'Gong Knell' } },
  inciteFury: { ap: 1, name: { zh: '煽動怒火', en: 'Incite Fury' } },
  rejuvenation: { ap: 1, name: { zh: '暴怒回春', en: 'Apoplectic Rejuvenation' } },
  mantle: { ap: 1, name: { zh: '黑暗披風', en: 'Mantle of Darkness' } },
  sweepingBlow: { ap: 1, name: { zh: '橫掃重擊', en: 'Sweeping Blow' } },
  actuation: { ap: 1, name: { zh: '褻瀆啟動', en: 'Sacrilegious Actuation' } },
  stimm: { ap: 1, name: { zh: '興奮劑', en: 'Stimms' } },
  shieldingUp: { ap: 0, name: { zh: '舉盾', en: 'Shielding' } },
  fate: { ap: 1, name: { zh: '命運庇護', en: 'Protected by Fate' } },
  ravage: { ap: 1, name: { zh: '摧毀命運', en: 'Ravage Destiny' } },
  alight: { ap: 1, name: { zh: '點燃', en: 'Alight' } },
  wayfind: { ap: 1, name: { zh: '尋路', en: 'Wayfind' } },
  pulse: { ap: 1, name: { zh: '干擾脈衝', en: 'Interference Pulse' } },
  signalAny: { ap: 1, name: { zh: '信號', en: 'Signal' } },
  jamToken: { ap: 1, name: { zh: '系統干擾', en: 'System Jam' } },
  panScan: { ap: 1, name: { zh: '全光譜掃描', en: 'Pan Spectral Scan' } },
  systemJam: { ap: 1, name: { zh: '系統干擾', en: 'System Jam' } },
  medikit: { ap: 1, name: { zh: '醫療包', en: 'Medikit' } },
  getItDun: { ap: 1, name: { zh: '快去做！', en: 'Get It Dun!' } },
  listenIn: { ap: 1, name: { zh: '聽好了', en: 'Listen In' } },
  stunGrenade: { ap: 1, name: { zh: '震撼手雷', en: 'Stun Grenade' } },
  dakkaDash: { ap: 1, name: { zh: '達卡衝刺', en: 'Dakka Dash' } },
  flail: { ap: 1, name: { zh: '連枷', en: 'Flail' } },
  miasma: { ap: 1, name: { zh: '毒瘴', en: 'Poisonous Miasma' } },
  vitality: { ap: 1, name: { zh: '腐敗活力', en: 'Putrescent Vitality' } },
  eyeAbove: { ap: 1, name: { zh: '天上之眼', en: 'From the Eye Above' } },
  pechra: { ap: 1, name: { zh: '標記獵物', en: 'Marked for the Hunt' } },
  energise: { ap: 1, name: { zh: '充能', en: 'Energise' } },
  longSight: { ap: 1, name: { zh: '遠視', en: 'Long-sight' } },
  stealthAttack: { ap: 2, name: { zh: '潛行突襲', en: 'Stealth Attack' } },
  pickUp: { ap: 1, name: { zh: '撿起標記', en: 'Pick Up Marker' } },
  veriscant: { ap: 1, name: { zh: '真相鑑定', en: 'Veriscant' } },
  apprehend: { ap: 0, name: { zh: '扣押', en: 'Apprehend' } },
  interstitial: { ap: 1, name: { zh: '間隙指令', en: 'Interstitial Command' } },
  canoptekRepair: { ap: 1, name: { zh: '聖甲蟲修復', en: 'Canoptek Repair' } },
  augment: { ap: 1, name: { zh: '強化武器', en: 'Augment Weapon' } },
  reinforce: { ap: 1, name: { zh: '強化金屬', en: 'Reinforce Metal' } },
  accelerate: { ap: 1, name: { zh: '加速', en: 'Accelerate' } },
  reanimate: { ap: 1, name: { zh: '復甦（擲骰）', en: 'Reanimate (roll)' } },
  reanimateSure: { ap: 2, name: { zh: '復甦（自動）', en: 'Reanimate (automatic)' } },
  mdVision: { ap: 1, name: { zh: '多維視覺', en: 'Multi-dimensional Vision' } },
  ammoResupply: { ap: 0, name: { zh: '補充彈藥', en: 'Ammo Resupply' } },
  meltaMine: { ap: 1, name: { zh: '放置熱熔地雷', en: 'Place Melta Mine' } },
  battleComms: { ap: 1, name: { zh: '戰場通訊', en: 'Battle Comms' } },
  tacticalCommand: { ap: 0, name: { zh: '戰術指揮', en: 'Tactical Command' } },
  grislyMark: { ap: 2, name: { zh: '血腥標記', en: 'Grisly Mark' } },
  unleashDaemon: { ap: 0, name: { zh: '釋放惡魔', en: 'Unleash Daemon' } },
  eqStun: { ap: 1, name: { zh: '震撼彈', en: 'Stun Grenade' } },
  eqSmoke: { ap: 1, name: { zh: '煙霧彈', en: 'Smoke Grenade' } },
  transferPower: { ap: 1, name: { zh: '轉移能量', en: 'Transfer Power' } },
  omniscanner: { ap: 1, name: { zh: '全知掃描儀', en: 'Omniscanner' } },
  datacoronal: { ap: 1, name: { zh: '數據冠累加器', en: 'Datacoronal Accumulator' } },
  networkOverride: { ap: 1, name: { zh: '網路覆寫：反擊', en: 'Network Override: counteract' } },
  overrideDash: { ap: 1, name: { zh: '網路覆寫：衝刺', en: 'Network Override: Dash' } },
  explosives: { ap: 1, name: { zh: '爆破', en: 'Explosives' } },
  bbJam: { ap: 1, name: { zh: '干擾', en: 'Jam' } },
  telepathicOverload: { ap: 1, name: { zh: '心靈過載', en: 'Telepathic Overload' } },
  mentalOnslaught: { ap: 1, name: { zh: '精神衝擊', en: 'Mental Onslaught' } },
  conspire: { ap: 1, name: { zh: '密謀', en: 'Conspire' } },
  intoShadow: { ap: 1, name: { zh: '隱入暗影', en: 'Into Shadow' } },
  edSprint: { ap: 0, name: { zh: '疾馳', en: 'Sprint' } },
  edTurn: { ap: 1, name: { zh: '轉向', en: 'Turn' } },
  songOne: { ap: 1, name: { zh: '更新之歌：一名', en: 'Song of Renewal: one' } },
  songAll: { ap: 1, name: { zh: '更新之歌：全體', en: 'Song of Renewal: all' } },
  cleansing: { ap: 1, name: { zh: '淡月淨化', en: 'Cleansing of the Pale Moon' } },
  wails: { ap: 1, name: { zh: '世界哀嚎', en: 'Wails of the World' } },
  windsGrace: { ap: 1, name: { zh: '風之恩典', en: 'Wind\'s Grace' } },
  transfusion: { ap: 1, name: { zh: '輸血儀式', en: 'Transfusion Ritual' } },
  iaBarrage: { ap: 1, name: { zh: '手槍彈幕', en: 'Pistol Barrage' } },
  scryGuide: { ap: 1, name: { zh: '預視：指引', en: 'Scry: Guidance' } },
  scryProtect: { ap: 1, name: { zh: '預視：守護', en: 'Scry: Protection' } },
  goreFuel: { ap: 1, name: { zh: '血燃', en: 'Gore-fuel' } },
  dashSpray: { ap: 1, name: { zh: '衝刺掃射', en: 'Dash and Spray' } },
  calibCharge: { ap: 0, name: { zh: '校準電能幽靈：充能', en: 'Calibrate Voltagheist: Charge' } },
  calibField: { ap: 0, name: { zh: '校準電能幽靈：力場', en: 'Calibrate Voltagheist: Field' } },
  inciteSlaughter: { ap: 1, name: { zh: '煽動屠殺', en: 'Incite Slaughter' } },
  inciteUrgency: { ap: 1, name: { zh: '煽動急進', en: 'Incite Urgency' } },
  ruinousInvig: { ap: 1, name: { zh: '毀滅聖像：活化', en: 'Ruinous Icon: Invigoration' } },
  ruinousDeter: { ap: 1, name: { zh: '毀滅聖像：衰敗', en: 'Ruinous Icon: Deterioration' } },
  heinousDeluge: { ap: 1, name: { zh: '可憎洪流', en: 'Heinous Deluge' } },
  maleficVortex: { ap: 1, name: { zh: '惡毒漩渦', en: 'Malefic Vortex' } },
  spiritualMentor: { ap: 1, name: { zh: '靈性導師', en: 'Spiritual Mentor' } },
  nullifyingRitual: { ap: 1, name: { zh: '虛無儀式', en: 'Nullifying Ritual' } },
  speakDeeds: { ap: 1, name: { zh: '宣揚她的事蹟', en: 'Speak of Her Deeds' } },
  geomantic: { ap: 1, name: { zh: '地占擾動', en: 'Geomantic Disturbance' } },
  canoptekControl: { ap: 1, name: { zh: '冥工控制', en: 'Canoptek Control' } },
  remotePilot: { ap: 1, name: { zh: '遙控操作', en: 'Remote Pilot' } },
  molecularBreach: { ap: 1, name: { zh: '分子穿越', en: 'Molecular Breach' } },
  overcharge: { ap: 1, name: { zh: '超載', en: 'Overcharge' } },
  cranialOverload: { ap: 1, name: { zh: '顱腦過載', en: 'Cranial Overload' } },
  nanoscarab: { ap: 1, name: { zh: '奈米聖甲蟲光束', en: 'Nanoscarab Beam' } },
};
// Cryptek unique actions (an Apprentek can perform one of them per turning point).
const CRYPTEK_ACTIONS = ['interstitial', 'canoptekRepair', 'augment', 'reinforce'];
Object.assign(ACTIONS, MISSION_ACTIONS); // mission actions (Siphon Power…)

const ACUTE = ['pickUp', 'veriscant'];
Object.assign(ACTIONS, {
  archonMark: { ap: 1, name: { zh: '刺客標記', en: 'Mark' } },
  tormentGrenade: { ap: 1, name: { zh: '折磨手榴彈', en: 'Torment Grenade' } },
  drugHeal: { ap: 1, name: { zh: '施用藥劑：治療', en: 'Administer Drug: heal' } },
  drugPainbringer: { ap: 1, name: { zh: '施用藥劑：痛苦使者', en: 'Administer Drug: Painbringer' } },
  drugAdrenalight: { ap: 1, name: { zh: '施用藥劑：腎上腺之光', en: 'Administer Drug: Adrenalight' } },
  drugHypex: { ap: 1, name: { zh: '施用藥劑：亢奮劑', en: 'Administer Drug: Hypex' } },
});

export function actionCost(g, op, id) {
  if (/^tw(Open|Close)_/.test(id)) return 1;
  const raider = corsairCost(g, op, id); if (raider != null) return raider;
  if (id === 'medikit' && tpl(op).medikit0) return 0; // Kasrkin Combat Medic
  if (kfGatherFree(op, id)) return 0; // Gather (Kroot Hound): a free Pick Up Marker
  if ((id === 'pickUp' || MISSION_ACTIONS[id] || id === 'placeMarker') && op.acted?.aqExemplar) return Math.max(0, actionCost(g, { ...op, acted: { ...op.acted, aqExemplar: false } }, id) - 1); // Tempestus Exemplars (Aquilons)
  if (xvActionCost(op, id) != null) return xvActionCost(op, id); // System Jam (XV26 Neutraliser): 2AP while Concealed
  if (id === 'rvBurrow' && rvFreeBurrow(g, op)) return 0; // a counteracting RAVENER's free Burrow
  if (id === 'fallBack' && (op.acted?.rvSlither || op.acted?.spDodge || xvFallBackCheap(op))) return Math.max(1, ACTIONS.fallBack.ap - 1); // Slithering Evasion
  if (id === 'fallBack' && tpl(op).fearless) return Math.max(1, ACTIONS.fallBack.ap - 1) + (whipped(g, op) ? 1 : 0); // Fearless on the Frontline (Shas'la): 1 less AP
  if (id === 'fallBack' && op.acted?.slip) return Math.max(1, actionCost(g, { ...op, acted: { ...op.acted, slip: false } }, id) - 1); // Slip Away
  if (id === 'fallBack' && (hasTactic(g, op, 'mobile') || tpl(op).disengage)) return 1 + (whipped(g, op) ? 1 : 0); // Mobile / Disengage (Endurant)
  if (id === 'fallBack' && whipped(g, op)) return ACTIONS.fallBack.ap + 1; // Whip Control (Herd-goad)
  // Kauyon: a Concealed operative's Markerlight is free.
  if (id === 'markerlight' && op.order === 'conceal' && artOfWar(g, op, 'kauyon')) return 0;
  // Free actions from Dakka Dash, Savage Assault and Stealth Attack.
  if (['dash', 'shoot', 'charge', 'fight', 'reposition'].includes(id) && op.acted?.free?.[id]) return 0;
  if (id === 'fight' && count(op, 'fight') === 1 && accelerant(op)) return 0; // Accelerant Agents: one Fight is free
  if (id === 'fight' && count(op, 'fight') === 1 && op.acted?.fury) return 0; // Fury (Goremonger Sanguavitae): the second Fight is free
  // Acute Focus (Malocator): once per activation, Pick Up, Veriscant or a mission action costs 1 less.
  const acute = (tpl(op).acuteFocus || tpl(op).lightFingered || tpl(op).gotAPlan) && !op.acted?.acuteUsed && (ACUTE.includes(id) || MISSION_ACTIONS[id]) ? 1 : 0; // (Light-fingered: Ratling Stashmaster)
  if (id === 'veriscant') return ACTIONS.veriscant.ap - acute;
  // Pick Up Marker and mission actions: +1AP for Nightmare Hulks (not Vulgrar), and within 3" of a Fleshscreamer.
  if (id === 'pickUp' || MISSION_ACTIONS[id]) {
    // I've Got It (Hearthkyn Lugger): once per activation, a mission action costs 1 less.
    // Vanguard (Phobos): once per turning point, one operative with it pays 1 less for Pick Up or a mission action.
    const gotIt = (MISSION_ACTIONS[id] && tpl(op).gotIt && !op.acted?.gotItUsed ? 1 : 0)
      + (tpl(op).vanguard && g.vanguardTP?.[op.side] !== g.tp ? 1 : 0)
      + (MISSION_ACTIONS[id] && isDeathwatch(op) && op.acted?.dwThrall ? 1 : 0);
    // Slow-witted (Blooded Ogryn) pays 1 more as well.
    // Nuncio-aquila (Proctor-exactant): +1AP within 3" of it.
    // Energy Cells (crit op): picking up an objective marker costs extra in TP2-3, and that can't be reduced.
    const extra = id === 'pickUp' && pickUpTargets(g, op).some((m) => g.objectives.includes(m)) ? mission(g).pickUpExtra?.(g) || 0 : 0;
    return Math.max(0, ACTIONS[id].ap + ((tpl(op).hulk && !tpl(op).vulgrar) || tpl(op).slowWitted ? 1 : 0) + (shrieked(g, op) ? 1 : 0) + (nuncioNear(g, op) ? 1 : 0) + (grislyNear(g, op) ? 1 : 0) + rvCrestExtra(g, op) + (intimidated(g, op) ? 1 : 0) - gotIt - acute) + extra; // (+ Grisly Mark)
  }
  if (op.brutalDisplayTP === g.tp && (id === 'pickUp' || MISSION_ACTIONS[id])) return Infinity;
  return ACTIONS[id].ap;
}

// ---------- unique actions that pick an operative ----------
const sameTeam = (a, b) => a.side === b.side && a.team === b.team;
export const TARGET_ACTIONS = {
  archonMark: {
    targets: (g, o) => foes(g, o).filter((t) => visibility(g, o, t).visible),
    apply(g, o, t) { o.archonMark = { uid: t.uid, tp: g.tp }; return { zh: '標記：搜尋輕型，無視遮擋', en: 'Mark: Seek Light, ignore obscuring' }; },
  },
  tormentGrenade: {
    targets: (g, o) => foes(g, o).filter((t) => edgeDist(o, t) <= 6 && visibility(g, o, t).visible),
    apply(g, o, t) {
      const ts = living(g).filter((x) => x === t || edgeDist(x, t) <= 1);
      for (const x of ts) { if (d6() + (tpl(x).save >= 4 ? 1 : 0) >= 3) { x.archonPoison ||= o.uid; applyDamage(g, o, x, d3()); } }
      return { zh: '折磨手榴彈：命中者受到 D3 傷害並在每次啟動受到 D3 毒素傷害', en: 'Torment Grenade: successful tests cause D3 damage and D3 poison each activation' };
    },
  },
  // Markerlight: a visible enemy gains tokens (max 4). After a Shoot this activation, only its target.
  markerlight: {
    targets: (g, op) => pfMarkerTargets(g, op),
    apply: (g, op, t) => pfMarkerlight(g, op, t),
  },
  // Signal (SUPPORT): another friendly Pathfinder visible within 6" gets +1 APL until the end of its next activation.
  signal: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && edgeDist(op, t) <= 6 + commsBonus(g, op) && visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `信號：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Signal: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Spot (SUPPORT, Death Korps Spotter): until the end of the TP, friendlies within 3" of the Spotter shooting that
  // enemy have Seek Light and it can't be obscured.
  spot: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible && (!tpl(op).spotRange || edgeDist(op, t) <= tpl(op).spotRange)),
    apply(g, op, t) {
      (g.spot ||= [null, null])[op.side] = { by: op.uid, t: t.uid, tp: g.tp };
      return { zh: `觀測：${opName(t, 'zh')}（本回合 3" 內友方射擊它時「搜尋（輕型）」且不會被遮擋）`, en: `Spot: ${opName(t, 'en')} (this TP, friendlies within 3" shooting it have Seek Light and it can't be obscured)` };
    },
  },
  // ---- Kasrkin ----
  // Battle Comms (Vox-trooper, twice per activation): another friendly +1 APL next activation (to a maximum of 3).
  battleComms: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && tpl(t).apl + Math.max(0, t.aplNext || 0) < 3),
    apply(g, op, t) { changeApl(g, t, 1); return { zh: `戰場通訊：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Battle Comms: ${opName(t, 'en')} gets +1 APL next activation` }; },
  },
  // Tactical Command (Sergeant): one friendly gets one more Skill at Arms until next TP (the one that suits it best).
  tacticalCommand: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && t.skillExtra?.tp !== g.tp),
    apply(g, op, t) {
      const have = g.skills?.[op.side]?.tp === g.tp ? g.skills[op.side].ids : [];
      const melee = avgDmg(bestMelee(t)) > Math.max(0, ...tpl(t).weapons.filter((w) => w.type === 'ranged').map((w) => avgDmg(w)));
      const id = (melee ? ['forCadia', 'iceInVeins', 'strikeFast', 'lightEmUp'] : ['lightEmUp', 'iceInVeins', 'strikeFast', 'forCadia']).find((s) => !have.includes(s));
      t.skillExtra = { tp: g.tp, id };
      return { zh: `戰術指揮：${opName(t, 'zh')} 獲得戰技「${SKILLS[id].name.zh}」`, en: `Tactical Command: ${opName(t, 'en')} gains ${SKILLS[id].name.en}` };
    },
  },
  // ---- Universal equipment ----
  // Stun grenade: an enemy visible within 6" and each operative within 1" of it: D6, 3+ = -1 APL next activation.
  eqStun: {
    targets: (g, op) => (eqLeft(g, op.side, 'stun') || adaptiveOk(g, op, 'stun') ? foes(g, op).filter((t) => t.side < 2 && edgeDist(op, t) <= 6 && visibility(g, op, t).visible) : []),
    apply(g, op, t) {
      if (adaptiveOk(g, op, 'stun')) ((g.adaptive ||= [{}, {}])[op.side]).stun = g.tp; else g.eqUses[op.side].stun--; // Adaptive Equipment (Kasrkin Trooper) first
      const hit = [t, ...g.ops.filter((o) => !o.dead && o !== t && o.side < 2 && edgeDist(o, t) <= 1)].map((o) => { const roll = d6(); if (roll >= 3) changeApl(g, o, -1); return { o, roll }; });
      const list = (lang) => hit.map(({ o, roll }) => `${opName(o, lang)} ${roll}${roll >= 3 ? (lang === 'zh' ? '（APL -1）' : ' (-1 APL)') : ''}`).join(lang === 'zh' ? '、' : ', ');
      return { zh: `震撼彈：${list('zh')}`, en: `Stun Grenade: ${list('en')}` };
    },
  },
  // Smoke grenade: placed on an operative visible within 6" (friend or foe).
  eqSmoke: {
    targets: (g, op) => (eqLeft(g, op.side, 'smoke') || adaptiveOk(g, op, 'smoke') || tpl(op).spGrenadier ? g.ops.filter((t) => !t.dead && t.x > -50 && edgeDist(op, t) <= 6 && (t === op || visibility(g, op, t).visible)) : []),
    apply(g, op, t) {
      if (tpl(op).spGrenadier) { /* Spectre Grenadier: its own smoke grenades (not from the team's uses) */ } else if (adaptiveOk(g, op, 'smoke')) ((g.adaptive ||= [{}, {}])[op.side]).smoke = g.tp; else g.eqUses[op.side].smoke--;
      (g.smoke ||= []).push({ x: t.x, y: t.y, side: op.side, tp: g.tp, left: null });
      return { zh: `煙霧彈：在 ${opName(t, 'zh')} 處放出煙霧`, en: `Smoke Grenade: smoke on ${opName(t, 'en')}` };
    },
  },
  // ---- Hierotek Circle ----
  // Interstitial Command (SUPPORT): another friendly visible within 6" (or 6" of a visible Despotek) takes a free Shoot.
  interstitial: {
    targets: (g, op) => interstitialTargets(g, op),
    apply(g, op, t) {
      startProxy(g, op, t);
      return { zh: `間隙指令：${opName(t, 'zh')} 立刻免費射擊一次`, en: `Interstitial Command: ${opName(t, 'en')} takes a free Shoot now` };
    },
  },
  // Canoptek Repair (SUPPORT, once per turning point): a friendly visible within 6" regains up to 2D3 wounds.
  canoptekRepair: {
    targets: (g, op) => (g.repairTP?.[op.side] === g.tp ? [] : living(g, op.side).filter((t) => sameTeam(t, op) && t.wounds < t.maxW && edgeDist(op, t) <= 6 + commsBonus(g, op) && (t === op || visibility(g, op, t).visible))),
    apply(g, op, t) {
      (g.repairTP ||= [0, 0])[op.side] = g.tp;
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + d3() + d3());
      return { zh: `聖甲蟲修復：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Canoptek Repair: ${opName(t, 'en')} regains ${t.wounds - before} wounds` };
    },
  },
  // Augment Weapon (SUPPORT): until the caster's next activation, two weapon rules on one weapon of a friendly within 6".
  augment: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && edgeDist(op, t) <= 6 + commsBonus(g, op) && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) {
      const w = tpl(t).weapons.filter((x) => x.type === 'ranged').sort((a, b) => avgDmg(b) - avgDmg(a))[0] || bestMelee(t);
      // Lethal 5+ and Rending if it lacks them; otherwise Severe / Saturate.
      const rules = ['lethal', 'rending', 'severe', 'saturate'].filter((k) => !(k === 'lethal' ? (w.rules.lethal || 6) <= 5 : w.rules[k])).slice(0, 2);
      (g.augment ||= [null, null])[op.side] = { by: op.uid, t: t.uid, w: w.id, rules };
      const name = { lethal: ['致命 5+', 'Lethal 5+'], rending: ['撕裂', 'Rending'], severe: ['重創', 'Severe'], saturate: ['飽和', 'Saturate'] };
      return { zh: `強化武器：${opName(t, 'zh')} 的${w.name.zh}獲得「${rules.map((k) => name[k][0]).join('」「')}」`, en: `Augment Weapon: ${opName(t, 'en')}'s ${w.name.en} gains ${rules.map((k) => name[k][1]).join(' and ')}` };
    },
  },
  // Reinforce Metal (SUPPORT): until the caster's next activation, attack dice of 3+ damage deal 1 less to a friendly within 6".
  reinforce: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && edgeDist(op, t) <= 6 + commsBonus(g, op) && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) {
      (g.reinforce ||= [null, null])[op.side] = { by: op.uid, t: t.uid };
      return { zh: `強化金屬：${opName(t, 'zh')} 受到 3 以上的傷害時 -1`, en: `Reinforce Metal: attack dice inflicting 3+ damage on ${opName(t, 'en')} deal 1 less` };
    },
  },
  // Accelerate (Plasmacyte): a Deathmark or Immortal visible within 6" gets +1 APL until the end of its next activation.
  accelerate: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && (tpl(t).deathmark || tpl(t).steadfast) && edgeDist(op, t) <= 6 && visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `加速：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Accelerate: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // ---- Exaction Squad ----
  // Veriscant (Malocator): a visible enemy — friendly weapons have Lethal 5+ and Severe against it until its next activation.
  veriscant: {
    targets: (g, op) => foes(g, op).filter((t) => t.side !== NPO && visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.veriscant ||= [null, null])[op.side] = { by: op.uid, t: t.uid };
      return { zh: `真相鑑定：${opName(t, 'zh')}（直到下次啟動，友方攻擊它時「致命 5+」＋「重創」）`, en: `Veriscant: ${opName(t, 'en')} (until its next activation, friendlies attacking it have Lethal 5+ and Severe)` };
    },
  },
  // Apprehend (Cyber-mastiff): an enemy in its control range — Hit worsened by 1 and no Fall Back while it stays there.
  apprehend: {
    targets: (g, op) => engagedEnemies(g, op),
    apply(g, op, t) {
      op.apprehend = t.uid;
      return { zh: `扣押：${opName(t, 'zh')} 留在牠控制範圍內時命中變差 1、不能撤退`, en: `Apprehend: while ${opName(t, 'en')} stays in its control range, its Hit is worsened by 1 and it can't Fall Back` };
    },
  },
  // ---- Fellgor Ravagers ----
  // Incite Fury (Herd-goad): another friendly (not the Shaman or Ironhorn) visible within 3" gets +1 APL next activation.
  inciteFury: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && !tpl(t).fgShaman && !tpl(t).ironhorn && edgeDist(op, t) <= 3 && visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `煽動怒火：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Incite Fury: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Apoplectic Rejuvenation (Shaman): a friendly without a Frenzy token visible within 6" regains 2D3 (6 if it has a melee kill).
  rejuvenation: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && !t.frenzy && t.wounds < t.maxW && edgeDist(op, t) <= 6 && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) {
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + (t.meleeKill ? 6 : d3() + d3()));
      return { zh: `暴怒回春：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Apoplectic Rejuvenation: ${opName(t, 'en')} regains ${t.wounds - before} wounds` };
    },
  },
  // ---- Blooded ----
  // Stimms (Corpseman): a friendly in control range gets Rejuvenated (heal 2D3) if hurt, otherwise another stimm it lacks.
  stimm: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && edgeDist(op, t) <= CONTROL + 0.01
      && ((!t.stimms?.rejuvenated && t.wounds < t.maxW) || !t.stimms?.fortified || !t.stimms?.enraged)),
    apply(g, op, t) {
      const kind = !t.stimms?.rejuvenated && t.maxW - t.wounds >= 2 ? 'rejuvenated'
        : !t.stimms?.fortified ? 'fortified' : !t.stimms?.enraged ? 'enraged' : 'rejuvenated';
      const before = t.wounds;
      giveStimm(g, t, kind);
      const name = { rejuvenated: ['回春', 'Rejuvenated'], fortified: ['強化', 'Fortified'], enraged: ['狂怒', 'Enraged'] }[kind];
      return { zh: `興奮劑「${name[0]}」：${opName(t, 'zh')}${kind === 'rejuvenated' ? ` 回復 ${t.wounds - before} 生命` : ' 整場有效'}`, en: `Stimms (${name[1]}): ${opName(t, 'en')}${kind === 'rejuvenated' ? ` regains ${t.wounds - before} wounds` : ' for the battle'}` };
    },
  },
  // ---- Warpcoven (PSYCHIC; until the start of the caster's next activation) ----
  // Protected by Fate (Sorcerer of Destiny): a visible friendly re-rolls any defence dice when shot.
  fate: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) {
      (g.fate ||= [null, null])[op.side] = { by: op.uid, uid: t.uid };
      return { zh: `命運庇護：${opName(t, 'zh')} 被射擊時可重擲任意防禦骰`, en: `Protected by Fate: ${opName(t, 'en')} re-rolls any defence dice when shot` };
    },
  },
  // Ravage Destiny (Sorcerer of Destiny): a visible enemy within 9" must re-roll attack dice results of 6; counts 1 lower for control.
  ravage: {
    targets: (g, op) => foes(g, op).filter((t) => t.side !== NPO && edgeDist(op, t) <= 9 && visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.ravage ||= [null, null])[op.side] = { by: op.uid, uid: t.uid };
      return { zh: `摧毀命運：${opName(t, 'zh')} 攻擊時必須重擲擲出 6 的骰，控制目標時 APL -1`, en: `Ravage Destiny: ${opName(t, 'en')} must re-roll attack dice results of 6 and counts 1 lower for control` };
    },
  },
  // Alight (Sorcerer of Warpfire): friendlies attacking that visible enemy have Ceaseless.
  alight: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.alight ||= [null, null])[op.side] = { by: op.uid, uid: t.uid };
      return { zh: `點燃：攻擊 ${opName(t, 'zh')} 的友方武器「無休」`, en: `Alight: friendly weapons have Ceaseless against ${opName(t, 'en')}` };
    },
  },
  // ---- Phobos Strike Team ----
  // Helix Gauntlet (Helix Adept): a friendly within control range regains D3+3 wounds (not one saved by Medic! this TP).
  helix: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && t.wounds < t.maxW && t.medicTP !== g.tp && edgeDist(op, t) <= CONTROL + 0.01),
    apply(g, op, t) {
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + d3() + 3);
      return { zh: `螺旋手套：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命（${t.wounds}/${t.maxW}）`, en: `Helix Gauntlet: ${opName(t, 'en')} regains ${t.wounds - before} wounds (${t.wounds}/${t.maxW})` };
    },
  },
  // ---- Imperial Navy Breachers ----
  // Wayfind (Surveyor, SUPPORT): another friendly (not a machine) visible within 6" of it or of the C.A.T. unit: +1 APL.
  wayfind: {
    targets: (g, op) => {
      const from = [op, ...living(g, op.side).filter((c) => tpl(c).catUnit)];
      return living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && !tpl(t).machine
        && from.some((f) => edgeDist(f, t) <= 6 && visibility(g, f, t).visible));
    },
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `尋路：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Wayfind: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Interference Pulse (Void-jammer): an enemy visible to and within 8" of the Gheistskull; D6 (+1 if a valid target for it), 3+ = -1 APL.
  pulse: {
    targets: (g, op) => {
      const skulls = living(g, op.side).filter((s) => tpl(s).gheistskull);
      return foes(g, op).filter((t) => skulls.some((s) => edgeDist(s, t) <= 8 && visibility(g, s, t).visible));
    },
    apply(g, op, t) {
      const skull = living(g, op.side).find((s) => tpl(s).gheistskull && edgeDist(s, t) <= 8 && visibility(g, s, t).visible);
      const roll = d6(), bonus = skull && validTarget(g, skull, t, { type: 'ranged', rules: {} }) ? 1 : 0;
      const hit = roll + bonus >= 3;
      if (hit) changeApl(g, t, -1);
      return { zh: `干擾脈衝（擲 ${roll}${bonus ? '+1' : ''}）：${hit ? `${opName(t, 'zh')} 下次啟動 APL -1` : '沒有效果'}`, en: `Interference Pulse (rolled ${roll}${bonus ? '+1' : ''}): ${hit ? `${opName(t, 'en')} gets -1 APL next activation` : 'no effect'}` };
    },
  },
  // ---- Hearthkyn Salvagers ----
  // Knux Smash (Dôzr): an enemy in control range takes D3+1; on a 3, -1 APL until the end of its next activation.
  // (The 3" push and the free 3" Charge aren't modelled.)
  knuxSmash: {
    targets: (g, op) => engagedEnemies(g, op),
    apply(g, op, t) {
      const r = d3(), dmg = r + 1;
      applyDamage(g, op, t, dmg);
      if (r === 3 && !t.dead) changeApl(g, t, -1);
      return { zh: `指虎重擊：${opName(t, 'zh')} 受到 ${dmg} 傷害${r === 3 ? '，下次啟動 APL -1' : ''}`, en: `Knux Smash: ${opName(t, 'en')} takes ${dmg} damage${r === 3 ? ' and gets -1 APL next activation' : ''}` };
    },
  },
  // Signal (Kinlynk): any other friendly operative in the killzone gets +1 APL until the end of its next activation.
  signalAny: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && sameTeam(t, op)),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `信號：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Signal: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // System Jam (Kinlynk): a valid target gains a token; it can't be activated until every enemy without one is expended.
  jamToken: {
    targets: (g, op) => foes(g, op).filter((t) => !t.jam && t.side !== NPO && validTarget(g, op, t, { type: 'ranged', rules: {} })),
    apply(g, op, t) {
      t.jam = true;
      return { zh: `系統干擾：${opName(t, 'zh')} 要等其他敵人都行動完才能啟動`, en: `System Jam: ${opName(t, 'en')} can't activate until every other enemy is expended` };
    },
  },
  // Pan Spectral Scan (Lokâtr): marker by a visible enemy; friendlies shooting enemies within 3" of it have Accurate 1 and Saturate.
  panScan: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.pan ||= [null, null])[op.side] = { x: t.x, y: t.y, by: op.uid };
      return { zh: `全光譜掃描：標記放在 ${opName(t, 'zh')} 處（3" 內的敵人被射擊時，射手「精準 1」＋「飽和」）`, en: `Pan Spectral Scan: marker by ${opName(t, 'en')} (shooting enemies within 3" of it: Accurate 1 + Saturate)` };
    },
  },
  // System Jam: a visible enemy gets -1 APL until the end of its next activation.
  systemJam: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible),
    apply(g, op, t) {
      changeApl(g, t, -1);
      return { zh: `系統干擾：${opName(t, 'zh')} 下次啟動 APL -1`, en: `System Jam: ${opName(t, 'en')} gets -1 APL for its next activation` };
    },
  },
  // Medikit: a wounded friendly non-drone Pathfinder within control range regains 2D3 wounds.
  // ---- Exodite Dragon Masters ----
  // Song of Renewal (Stonesinger, PSYCHIC, once per TP): a visible friendly regains up to 2D3 (or every friendly D3 — songAll).
  songOne: {
    targets: (g, op) => living(g, op.side).filter((t) => isEDM(t) && !t.reserve && t.wounds < t.maxW && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) { op.songTP = g.tp; const b = t.wounds; t.wounds = Math.min(t.maxW, t.wounds + d3() + d3()); return { zh: `更新之歌：${opName(t, 'zh')} 回復 ${t.wounds - b} 生命`, en: `Song of Renewal: ${opName(t, 'en')} regains ${t.wounds - b} wounds` }; },
  },
  // Cleansing of the Pale Moon (Stonesinger upgrade, PSYCHIC): a visible friendly loses the opponent's effects on it.
  cleansing: {
    targets: (g, op) => living(g, op.side).filter((t) => isEDM(t) && !t.reserve && (t === op || visibility(g, op, t).visible) && (t.poison || (t.aplNext || 0) < 0 || t.jam)),
    apply(g, op, t) { t.poison = false; if ((t.aplNext || 0) < 0) t.aplNext = 0; t.jam = false; return { zh: `淡月淨化：${opName(t, 'zh')} 的負面效果被移除`, en: `Cleansing of the Pale Moon: ${opName(t, 'en')} is cleansed` }; },
  },
  // Wails of the World (Stonesinger upgrade, PSYCHIC, once per TP): a visible enemy and those within 2" of it get -2" Move,
  // then take damage equal to the difference between 2D3 and their new Move. (Mounted operatives are unaffected.)
  wails: {
    targets: (g, op) => foes(g, op).filter((t) => t.side < 2 && visibility(g, op, t).visible),
    apply(g, op, t) {
      op.wailsTP = g.tp;
      const hit = [t, ...foes(g, op).filter((e) => e !== t && e.side < 2 && edgeDist(e, t) <= 2)].filter((e) => !isMounted(e));
      const out = [];
      for (const e of hit) {
        e.wailsUntil = g.tp; // (-2" Move until the end of its next activation: approximated as this turning point)
        const r = d3() + d3(), dmg = Math.abs(r - moveStat(g, e));
        out.push(`${opName(e, 'zh')} ${dmg}`);
        if (dmg) applyDamage(g, op, e, dmg);
      }
      return { zh: `世界哀嚎：${out.join('、') || '沒有影響'}`, en: `Wails of the World: ${out.join(', ') || 'no effect'}` };
    },
  },
  // Wind's Grace (Stonesinger upgrade, PSYCHIC, once per TP): a visible friendly's SPEED is one higher for a while.
  windsGrace: {
    targets: (g, op) => living(g, op.side).filter((t) => isEDM(t) && !t.reserve && !t.windGrace && (t === op || visibility(g, op, t).visible)),
    apply(g, op, t) { op.windsTP = g.tp; t.windGrace = { by: op.uid, tp: g.tp }; return { zh: `風之恩典：${opName(t, 'zh')} 速度提升一級`, en: `Wind's Grace: ${opName(t, 'en')}'s SPEED is one higher` }; },
  },
  // ---- Inquisitorial Agents ----
  // Scry (Mystic, PSYCHIC): a friendly agent within 6" gets Guidance or Protection until the Mystic's next activation.
  scryGuide: { targets: (g, op) => living(g, op.side).filter((t) => !tpl(t).psychicNull && edgeDist(op, t) <= 6), apply(g, op, t) { (g.scry ||= [null, null])[op.side] = { by: op.uid, uid: t.uid, mode: 'guide' }; return { zh: `預視（指引）：${opName(t, 'zh')} 攻擊時一顆失敗改普通（或普通改暴擊）`, en: `Scry (Guidance): ${opName(t, 'en')} upgrades one attack die` }; } },
  scryProtect: { targets: (g, op) => living(g, op.side).filter((t) => !tpl(t).psychicNull && edgeDist(op, t) <= 6), apply(g, op, t) { (g.scry ||= [null, null])[op.side] = { by: op.uid, uid: t.uid, mode: 'protect' }; return { zh: `預視（守護）：${opName(t, 'zh')} 被射擊時一顆防禦骰失敗改普通（或普通改暴擊）`, en: `Scry (Protection): ${opName(t, 'en')} upgrades one defence die when shot` }; } },
  // ---- Goremongers ----
  // Transfusion Ritual (Bloodtaker): its tank down, another friendly's within 8" up.
  transfusion: {
    targets: (g, op) => (goreOf(op) > 0 ? living(g, op.side).filter((t) => t !== op && isGM(t) && goreOf(t) < 2 && edgeDist(op, t) <= 8) : []),
    apply(g, op, t) { goreDown(op); goreUp(g, t, { zh: '輸血儀式', en: 'Transfusion Ritual' }); return { zh: `輸血儀式：${opName(op, 'zh')} 把血分給 ${opName(t, 'zh')}`, en: `Transfusion Ritual: ${opName(op, 'en')} tops up ${opName(t, 'en')}` }; },
  },
  // ---- Chaos Cult ----
  // Incite Slaughter / Incite Urgency (Demagogue, SUPPORT): another friendly visible within 9" performs a free Fight,
  // or a free Charge (up to 3") or Dash, right away; then the Demagogue's activation continues.
  inciteSlaughter: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && isCult(t) && fightTargets(g, t).length && edgeDist(op, t) <= 9 + commsBonus(g, op) && visibility(g, op, t).visible),
    apply(g, op, t) {
      g.netcounter = { side: op.side, only: [t.uid], resume: op.uid, resumeCounter: !!g.counter, kind: 'control', onlyActions: ['fight'] };
      g.active = null; g.counter = true; g.turn = op.side;
      return { zh: `煽動屠殺：${opName(t, 'zh')} 免費近戰一次`, en: `Incite Slaughter: ${opName(t, 'en')} fights for free` };
    },
  },
  inciteUrgency: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && isCult(t) && !isEngaged(g, t) && edgeDist(op, t) <= 9 + commsBonus(g, op) && visibility(g, op, t).visible),
    apply(g, op, t) {
      g.netcounter = { side: op.side, only: [t.uid], resume: op.uid, resumeCounter: !!g.counter, kind: 'control', onlyActions: ['charge', 'dash'], ctlMove: 3 };
      g.active = null; g.counter = true; g.turn = op.side;
      return { zh: `煽動急進：${opName(t, 'zh')} 免費衝鋒（最多 3"）或衝刺一次`, en: `Incite Urgency: ${opName(t, 'en')} Charges (up to 3") or Dashes for free` };
    },
  },
  // Heinous Deluge (Mindwitch, PSYCHIC): a valid target gets -1 APL until the end of its next activation.
  heinousDeluge: {
    targets: (g, op) => foes(g, op).filter((t) => t.side < 2 && broodValid(g, op, t)),
    apply(g, op, t) { changeApl(g, t, -1); return { zh: `可憎洪流：${opName(t, 'zh')} 下次啟動 APL -1`, en: `Heinous Deluge: ${opName(t, 'en')} -1 APL next activation` }; },
  },
  // Malefic Vortex (Mindwitch, PSYCHIC): the marker is (re)placed by a visible enemy — 1 damage to each enemy within 2" now,
  // and again in each Ready step. (Tap an enemy to place it there.)
  maleficVortex: {
    targets: (g, op) => foes(g, op).filter((t) => t.side < 2 && visibility(g, op, t).visible),
    apply(g, op, t) {
      g.markers = g.markers.filter((m) => !(m.kind === 'vortex' && m.owner === op.side));
      const m = { id: g.markers.length, kind: 'vortex', owner: op.side, x: t.x, y: t.y, carriedBy: null };
      g.markers.push(m);
      const hit = foes(g, op).filter((e) => e.side < 2 && dist(e, m) - radius(e) <= 2);
      for (const e of hit) applyDamage(g, op, e, 1);
      return { zh: `惡毒漩渦：放在 ${opName(t, 'zh')} 處，2" 內 ${hit.length} 名敵人各受 1 傷害`, en: `Malefic Vortex: placed by ${opName(t, 'en')}; ${hit.length} enemies within 2" take 1 damage each` };
    },
  },
  // ---- Celestian Insidiants ----
  // Spiritual Mentor (Superior, SUPPORT, once per TP): a friendly visible within 6" becomes inspiring.
  spiritualMentor: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && isCI(t) && !t.inspiring && edgeDist(op, t) <= 6 + commsBonus(g, op) && visibility(g, op, t).visible),
    apply(g, op, t) { op.mentorTP = g.tp; inspire(g, t, { zh: '靈性導師', en: 'Spiritual Mentor' }); return { zh: `靈性導師：${opName(t, 'zh')}`, en: `Spiritual Mentor: ${opName(t, 'en')}` }; },
  },
  // Speak of Her Deeds (Denuncia, SUPPORT): an inspiring friendly within 6" stops being inspiring, and another friendly
  // within 6" gets a Benediction.
  speakDeeds: {
    targets: (g, op) => (deedsSource(g, op) ? living(g, op.side).filter((t) => isCI(t) && (t === op || (edgeDist(op, t) <= 6 + commsBonus(g, op) && visibility(g, op, t).visible))
      && living(g, op.side).some((s) => s !== t && s.inspiring && (s === op || (edgeDist(op, s) <= 6 && visibility(g, op, s).visible)))) : []),
    apply(g, op, t) {
      const s = living(g, op.side).find((x) => x !== t && x.inspiring && (x === op || (edgeDist(op, x) <= 6 && visibility(g, op, x).visible)));
      s.inspiring = false;
      benediction(g, t);
      return { zh: `宣揚她的事蹟：${opName(s, 'zh')} 不再激勵，${opName(t, 'zh')} 獲得祝福`, en: `Speak of Her Deeds: ${opName(s, 'en')} is no longer inspiring; ${opName(t, 'en')} gains a Benediction` };
    },
  },
  // ---- Canoptek Circle ----
  // Geomantic Disturbance (Geomancer): a point on terrain visible within 8" — 2D6 for each operative within 2" of it,
  // the excess over its remaining wounds is damage. (Picked here by tapping an enemy near terrain; the point is the
  // terrain nearest that enemy.)
  geomantic: {
    targets: (g, op) => foes(g, op).filter((t) => geoPoint(g, op, t)),
    apply(g, op, t) {
      const p = geoPoint(g, op, t), hits = [];
      for (const o of g.ops.filter((x) => !x.dead && x.x > -50 && dist(x, p) - radius(x) <= 2)) {
        const r = d6() + d6(), dmg = Math.max(0, r - o.wounds);
        hits.push(`${opName(o, 'zh')} ${r}${dmg ? `→${dmg}` : ''}`);
        if (dmg) applyDamage(g, op, o, dmg);
      }
      return { zh: `地占擾動：${hits.join('、')}`, en: `Geomantic Disturbance: ${hits.join(', ')}` };
    },
  },
  // Canoptek Control (Geomancer, SUPPORT): a Canoptek within 6" (or visible and within the matrix) performs a free 1AP
  // action (moving no more than 2"), then the Geomancer's activation continues.
  canoptekControl: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && tpl(t).canoptek && sameTeam(t, op) && visibility(g, op, t).visible
      && (edgeDist(op, t) <= 6 + commsBonus(g, op) || inMatrix(g, op.side, t))),
    apply(g, op, t) {
      g.netcounter = { side: op.side, only: [t.uid], resume: op.uid, resumeCounter: !!g.counter, kind: 'control' };
      g.active = null; g.counter = true; g.turn = op.side;
      return { zh: `冥工控制：${opName(t, 'zh')} 立刻免費執行一個 1AP 動作（移動不超過 2"）`, en: `Canoptek Control: ${opName(t, 'en')} performs a free 1AP action now (moving no more than 2")` };
    },
  },
  // Remote Pilot (Pathfinder Drone Controller): a friendly DRONE performs one free action (moving no more than 2") — even one its Drone
  // rule restricts — then the Controller's activation continues. A drone can't repeat the same free action in one activation.
  remotePilot: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && isDrone(t) && sameTeam(t, op) && !t.reserve),
    apply(g, op, t) {
      const done = (op.acted.pilotDone ||= {})[t.uid] || [];
      const all = ['reposition', 'dash', 'charge', 'fallBack', 'shoot', 'fight', 'markerlight', 'pickUp', ...missionActionsFor(g, op.side)];
      g.netcounter = { side: op.side, only: [t.uid], resume: op.uid, resumeCounter: !!g.counter, kind: 'control', onlyActions: all.filter((a) => !done.includes(a)), ctlMove: 2, pilotOf: op.uid };
      g.active = null; g.counter = true; g.turn = op.side;
      return { zh: `遙控操作：${opName(t, 'zh')} 立刻免費執行一個動作（移動不超過 2"），之後繼續本次啟動`, en: `Remote Pilot: ${opName(t, 'en')} performs a free action now (moving no more than 2"), then this activation continues` };
    },
  },
  // Molecular Breach (Geomancer, SUPPORT): the friendly's next move is a teleport within its Move (3" for a Dash).
  molecularBreach: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && !t.breachMove && (t === op || visibility(g, op, t).visible)
      && (edgeDist(op, t) <= 6 + commsBonus(g, op) || inMatrix(g, op.side, t))),
    apply(g, op, t) { t.breachMove = true; return { zh: `分子穿越：${opName(t, 'zh')} 下次移動改為直接傳送`, en: `Molecular Breach: ${opName(t, 'en')}'s next move is a teleport` }; },
  },
  // Overcharge (Accelerator): another Canoptek visible within 3" (or both within the matrix) gets +1 APL.
  overcharge: {
    targets: (g, op) => living(g, op.side).filter((t) => t !== op && tpl(t).canoptek && sameTeam(t, op)
      && ((edgeDist(op, t) <= 3 && visibility(g, op, t).visible) || (inMatrix(g, op.side, op) && inMatrix(g, op.side, t)))),
    apply(g, op, t) { changeApl(g, t, 1); return { zh: `超載：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Overcharge: ${opName(t, 'en')} +1 APL for its next activation` }; },
  },
  // Cranial Overload (Accelerator): an enemy visible within 3" (or within the matrix, if it is too) gets -1 APL.
  cranialOverload: {
    targets: (g, op) => foes(g, op).filter((t) => t.side < 2 && ((edgeDist(op, t) <= 3 && visibility(g, op, t).visible) || (inMatrix(g, op.side, op) && inMatrix(g, op.side, t)))),
    apply(g, op, t) { changeApl(g, t, -1); return { zh: `顱腦過載：${opName(t, 'zh')} 下次啟動 APL -1`, en: `Cranial Overload: ${opName(t, 'en')} -1 APL for its next activation` }; },
  },
  // Nanoscarab Beam (Reanimator, once per TP): a friendly visible within 6" (or within the matrix) regains up to 3D3.
  nanoscarab: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && t.wounds < t.maxW && t.medicTP !== g.tp && (t === op || visibility(g, op, t).visible)
      && (edgeDist(op, t) <= 6 || (inMatrix(g, op.side, op) && inMatrix(g, op.side, t)))),
    apply(g, op, t) {
      op.nanoTP = g.tp;
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + d3() + d3() + d3());
      return { zh: `奈米聖甲蟲光束：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Nanoscarab Beam: ${opName(t, 'en')} regains ${t.wounds - before} wounds` };
    },
  },
  // Jam (Brood Brother Vox-operator): a ready enemy that's a valid target can't activate until it's the last one,
  // or until the opponent has activated D6 other operatives.
  bbJam: {
    targets: (g, op) => foes(g, op).filter((t) => t.ready && t.side < 2 && broodValid(g, op, t)),
    apply(g, op, t) {
      const r = d6();
      (g.scramble ||= [null, null])[op.side] = { uid: t.uid, tp: g.tp, n: (g.actCount?.[t.side] || 0) + r };
      return { zh: `干擾：${opName(t, 'zh')} 要等對手再啟動 ${r} 名特工（或只剩它）才能行動`, en: `Jam: ${opName(t, 'en')} can't act until the opponent has activated ${r} more operatives (or it's the last)` };
    },
  },
  // Telepathic Overload (Magus, PSYCHIC): a valid target gets -1 APL until the end of its activation.
  telepathicOverload: {
    targets: (g, op) => foes(g, op).filter((t) => broodValid(g, op, t)),
    apply(g, op, t) { changeApl(g, t, -1); return { zh: `心靈過載：${opName(t, 'zh')} APL -1（到它啟動結束）`, en: `Telepathic Overload: ${opName(t, 'en')} -1 APL (until the end of its activation)` }; },
  },
  // Mental Onslaught (Magus, PSYCHIC): 2 damage (4 within 6"), then keep rolling a D6 above its APL for more, up to 8.
  mentalOnslaught: {
    targets: (g, op) => foes(g, op).filter((t) => broodValid(g, op, t)),
    apply(g, op, t) {
      const step = edgeDist(op, t) <= 6 ? 4 : 2, rolls = [];
      let total = 0;
      const hit = () => { const d = Math.min(step, 8 - total); total += d; applyDamage(g, op, t, d); };
      hit();
      while (!t.dead && total < 8) { const r = d6(); rolls.push(r); if (r <= aplNow(g, t)) break; hit(); }
      return { zh: `精神衝擊：${opName(t, 'zh')} 受到 ${total} 傷害（擲骰 ${rolls.join('、') || '—'}）`, en: `Mental Onslaught: ${opName(t, 'en')} takes ${total} damage (rolls ${rolls.join(', ') || '—'})` };
    },
  },
  // Omniscanner (Technoarcheologist): an enemy visible or within 8" gains an Omniscanner token (Ceaseless against it).
  omniscanner: {
    targets: (g, op) => foes(g, op).filter((t) => !t.omni?.[op.side] && (edgeDist(op, t) <= 8 || visibility(g, op, t).visible)),
    apply(g, op, t) {
      (t.omni ||= [false, false])[op.side] = true;
      return { zh: `全知掃描儀：${opName(t, 'zh')} 獲得掃描標記（戰鬥支隊對它攻擊時武器「無休」）`, en: `Omniscanner: ${opName(t, 'en')} gains an Omniscanner token (Battleclade weapons have Ceaseless against it)` };
    },
  },
  // Network Override (Servitor Underseer): a friendly servitor within 6" of it or of the Auto-proxy NETWORK COUNTERACTS now.
  networkOverride: {
    targets: (g, op) => netCands({ ...g, netcounter: null }, op.side).filter((o) => !(op.acted.overrode || []).includes(o.uid) && (edgeDist(o, op) <= 6 || nearRelay(g, o))),
    apply(g, op, t) {
      (op.acted.overrode ||= []).push(t.uid);
      g.netcounter = { side: op.side, only: [t.uid], resume: op.uid, resumeCounter: !!g.counter };
      g.active = null; g.counter = true; g.turn = op.side;
      return { zh: `網路覆寫：${opName(t, 'zh')} 立刻網路反擊（之後繼續本次啟動）`, en: `Network Override: ${opName(t, 'en')} network counteracts now (then this activation continues)` };
    },
  },
  // Network Override, the other option: that servitor makes a free Dash instead (then the Underseer's activation continues).
  overrideDash: {
    targets: (g, op) => TARGET_ACTIONS.networkOverride.targets(g, op).filter((o) => !isEngaged(g, o)),
    apply(g, op, t) {
      (op.acted.overrode ||= []).push(t.uid);
      g.netcounter = { side: op.side, only: [t.uid], resume: op.uid, resumeCounter: !!g.counter, kind: 'control', onlyActions: ['dash'], ctlMove: 3 };
      g.active = null; g.counter = true; g.turn = op.side;
      return { zh: `網路覆寫：${opName(t, 'zh')} 免費衝刺一次（之後繼續本次啟動）`, en: `Network Override: ${opName(t, 'en')} makes a free Dash (then this activation continues)` };
    },
  },
  medikit: {
    targets: (g, op) => living(g, op.side).filter((t) => sameTeam(t, op) && !isDrone(t) && t.wounds < t.maxW
      && t !== op && t.medicTP !== g.tp && edgeDist(op, t) <= CONTROL + 0.01 && visibility(g, op, t).visible),
    apply(g, op, t) {
      const before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + (tpl(op).medikitBig ? d3() + 3 : d3() + d3())); // up to 2D3 (Expedient Repair: D3+3)
      return { zh: `醫療包：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命（${t.wounds}/${t.maxW}）`, en: `Medikit: ${opName(t, 'en')} regains ${t.wounds - before} wounds (${t.wounds}/${t.maxW})` };
    },
  },
  // Get It Dun! / Listen In (SUPPORT): another friendly visible within 6" gets +1 APL until the end of its next activation.
  // From the Eye Above (SUPPORT): same as Signal.
  eyeAbove: {
    targets: (g, op) => TARGET_ACTIONS.signal.targets(g, op),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `天上之眼：${opName(t, 'zh')} 下次啟動 APL +1`, en: `From the Eye Above: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Marked for the Hunt: the Pech'ra marker goes next to a visible enemy until the Tracker's next
  // activation; friendly shooting at enemies within 1" of it has Seek Light.
  pechra: {
    targets: (g, op) => foes(g, op).filter((t) => visibility(g, op, t).visible),
    apply(g, op, t) {
      (g.pechra ||= [null, null])[op.side] = { x: t.x, y: t.y, by: op.uid };
      return { zh: `標記獵物：鳥標放在 ${opName(t, 'zh')} 旁`, en: `Marked for the Hunt: the Pech'ra marker is placed by ${opName(t, 'en')}` };
    },
  },
  getItDun: {
    targets: (g, op) => TARGET_ACTIONS.signal.targets(g, op),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `快去做！：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Get It Dun!: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  listenIn: {
    targets: (g, op) => TARGET_ACTIONS.signal.targets(g, op),
    apply(g, op, t) {
      changeApl(g, t, 1);
      return { zh: `聽好了：${opName(t, 'zh')} 下次啟動 APL +1`, en: `Listen In: ${opName(t, 'en')} gets +1 APL for its next activation` };
    },
  },
  // Stun Grenade (Taktical Wot-notz, one Boy per turning point): an enemy visible within 6" and every
  // other operative within 1" of it roll a D6 — on a 3+, -1 APL until the end of its next activation.
  stunGrenade: {
    targets: (g, op) => (g.wotNotz?.[op.side] === g.tp ? [] : foes(g, op).filter((t) => edgeDist(op, t) <= 6 && visibility(g, op, t).visible)),
    apply(g, op, t) {
      (g.wotNotz ||= [0, 0])[op.side] = g.tp;
      const hit = [t, ...g.ops.filter((o) => !o.dead && o !== t && edgeDist(o, t) <= 1)].map((o) => {
        const roll = d6();
        if (roll >= 3) changeApl(g, o, -1);
        return { o, roll };
      });
      const list = (lang) => hit.map(({ o, roll }) => `${opName(o, lang)} ${roll}${roll >= 3 ? (lang === 'zh' ? '（APL -1）' : ' (-1 APL)') : ''}`).join(lang === 'zh' ? '、' : ', ');
      return { zh: `震撼手雷：${list('zh')}`, en: `Stun Grenade: ${list('en')}` };
    },
  },
  // Poisonous Miasma (PSYCHIC): an enemy visible within 7" (or a valid target) gains a Poison token;
  // if it already has one, it takes 3 damage instead.
  miasma: {
    targets: (g, op) => foes(g, op).filter((t) => (edgeDist(op, t) <= 7 && visibility(g, op, t).visible) || validTarget(g, op, t, { rules: {} })),
    apply(g, op, t) {
      if (!t.poison) { t.poison = true; return { zh: `毒瘴：${opName(t, 'zh')} 中毒`, en: `Poisonous Miasma: ${opName(t, 'en')} is poisoned` }; }
      applyDamage(g, op, t, 3);
      return { zh: `毒瘴：${opName(t, 'zh')} 已中毒，受到 3 傷害`, en: `Poisonous Miasma: ${opName(t, 'en')} is already poisoned and takes 3 damage` };
    },
  },
  // Putrescent Vitality (PSYCHIC, once per turning point): a friendly visible within 3" rolls 2D6 —
  // a total of 7 regains 7 wounds, otherwise the highest D6.
  vitality: {
    targets: (g, op) => (op.vitalityTP === g.tp ? [] : living(g, op.side).filter((t) => t !== op && t.wounds < t.maxW
      && edgeDist(op, t) <= 3 && visibility(g, op, t).visible)),
    apply(g, op, t) {
      op.vitalityTP = g.tp;
      const a = d6(), b = d6(), before = t.wounds;
      t.wounds = Math.min(t.maxW, t.wounds + (a + b === 7 ? 7 : Math.max(a, b)));
      return { zh: `腐敗活力（${a}+${b}）：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Putrescent Vitality (${a}+${b}): ${opName(t, 'en')} regains ${t.wounds - before} wounds` };
    },
  },
};

/** Free actions still to take this activation (Dakka Dash), so it shouldn't end at 0AP. */
export const freePending = (op) => { const f = op.acted?.free; return !!(op.acted?.proxyFor || (f && (f.dash || f.shoot || f.charge || f.fight))); }; // (or an Interstitial Command Shoot)

/** Dakka Dash: spend 1AP for a free Dash and a free Shoot with the dakka shoota, in either order. */
export function doDakkaDash(g, op) {
  spend(g, op, 'dakkaDash');
  op.acted.free = { dash: true, shoot: 'dakka' };
  log(g, { zh: `${opName(op, 'zh')} 達卡衝刺：可免費衝刺與用達卡槍射擊`, en: `${opName(op, 'en')} Dakka Dash: a free Dash and a free dakka shoota Shoot` }, `side${op.side}`);
}

/** Operatives the Flail action hits: every other operative visible to and within 2" (friends too). */
export const flailTargets = (g, op) => g.ops.filter((t) => !t.dead && t !== op && edgeDist(op, t) <= 2 && visibility(g, op, t).visible);

/** Flail (treated as a Fight action): D3+2 damage to each; an enemy also gains a Poison token on a D3 of 3. */
export function doFlail(g, op) {
  spend(g, op, 'fight');
  log(g, { zh: `${opName(op, 'zh')} 揮舞連枷`, en: `${opName(op, 'en')} swings the Flail` }, `side${op.side}`);
  for (const t of flailTargets(g, op)) {
    const roll = d3();
    const poisoned = t.side !== op.side && roll === 3 && !t.poison;
    if (poisoned) t.poison = true;
    log(g, { zh: `連枷：${opName(t, 'zh')} 受到 ${roll + 2} 傷害${poisoned ? '並中毒' : ''}`, en: `Flail: ${opName(t, 'en')} takes ${roll + 2} damage${poisoned ? ' and is poisoned' : ''}` }, `side${op.side}`);
    applyDamage(g, op, t, roll + 2);
  }
}

export function doTargetAction(g, op, id, target) {
  if (id === 'warpFold' && !op.warpFirst) { op.warpFirst = target.uid; return false; }
  spend(g, op, id);
  const before = painSnapshot(g);
  const msg = TARGET_ACTIONS[id].apply(g, op, target);
  archonAfterAction(g, op, before);
  corsairAfterAction(g, op);
  dwAfterAction(g, op);
  log(g, { zh: `${opName(op, 'zh')} ${msg.zh}`, en: `${opName(op, 'en')} ${msg.en}` }, `side${op.side}`);
}
// Scout (Scout Enemy Movement tac op): a mission action whose enemy the player clicks (the computer's is picked for it).
TARGET_ACTIONS.scout = { targets: (g, o) => scoutTargets(g, o), apply: (g, o, t) => MISSION_ACTIONS.scout.apply(g, o, t) };
for (const [id, drug] of Object.entries({ drugHeal: null, drugPainbringer: 'painbringer', drugAdrenalight: 'adrenalight', drugHypex: 'hypex' })) {
  TARGET_ACTIONS[id] = {
    targets: (g, o) => living(g, o.side).filter((t) => isArchon(t) && edgeDist(o, t) <= 3 && (t === o || visibility(g, o, t).visible) && (drug ? t.drug !== drug : t.wounds < t.maxW)),
    apply(g, o, t) { if (drug) t.drug = drug; else t.wounds = Math.min(t.maxW, t.wounds + d3() + d3()); return { zh: `為 ${opName(t, 'zh')} 施用藥劑`, en: `Administer Drug to ${opName(t, 'en')}` }; },
  };
}

// The second Shoot of an Astartes activation costs +1AP if both use the sniper rifle or heavy bolter.
const DOUBLE_SHOT_GROUPS = ['sniper', 'heavyBolter', 'soulreaper', 'warpflamer']; // Warpcoven: soulreaper cannon / warpflamer
// One of an Astartes operative's two Shoots must use a bolt weapon (Plague Marines: or a Psychic weapon).
const astartesShot = (w) => (isBoltWeapon(w) && !w.rules.notBolt) || !!w.rules.psychic || !!w.rules.astartesOk; // (notBolt: the Nemesis Claw heavy bolter isn't a bolt pistol or boltgun)

/** Can the active operative shoot with this weapon now? {ok, ap, why} */
export function shootWeapon(g, op, w) {
  if (op.mwAttackLockTP === g.tp) return { ok: false, ap: 1, why: { zh: '黑暗之翼後本回合不能攻擊', en: 'No attacks this TP after Wings of Darkness' } };
  if (op.mdPassLockTP === g.tp) return { ok: false, ap: 1, why: { zh: '暗影通道後本回合不能攻擊', en: 'No attacks this TP after Shadow Passage' } };
  if ((w.id === 'mdDart' && g.mdDartTP?.[op.side] === g.tp) || (w.id === 'mdGemBlast' && g.mdGemTP?.[op.side] === g.tp)) return { ok: false, ap: 1, why: { zh: '本回合已使用', en: 'Already used this TP' } };
  const no = (zh, en) => ({ ok: false, ap: 1, why: { zh, en } });
  if (w.type !== 'ranged') return no('不是遠程武器', 'Not a ranged weapon');
  if (w.rules.wreathed) return no('用「烈焰纏身」行動施放', 'Use the Wreathe in Fire action');
  if (w.rules.dkDetonate) return no('用「引爆」行動', 'Use the Detonate action');
  if (op.acted?.rtSlingshot) return no('用過彈弓的啟動不能射擊', 'No Shoot in an activation with a Slingshot'); // (Ratling Raider)
  if (op.order === 'conceal' && !w.rules.silent && !rtSilent(g, op, w)) return no('隱蔽指令無法射擊', 'Cannot Shoot while Concealed');
  if (w.rules.psychic && witchHunted(g, op)) return no('3" 內有隱伏者，不能用靈能武器', 'An Insidiant within 3": no Psychic weapons');
  if (w.rules.aimed && (op.acted.movedDist || 0) > 3) return no('本次啟動移動超過 3"，不能用定點武器', 'Moved more than 3" this activation: no Aimed weapon');
  // Heavy (X only): any move other than X rules the weapon out.
  const h = w.rules.heavy;
  const heavyMoved = typeof h === 'string' ? ['reposition', 'dash', 'charge', 'fallBack'].some((k) => k !== h && count(op, k)) : h && moved(op);
  if (heavyMoved) return no('本次已移動，不能用重型武器', 'Moved — cannot use a Heavy weapon');
  let ap = actionCost(g, op, 'shoot');
  if (tpl(op).pistolBarrage) {
    if (op.acted.barrage) {
      if (!op.acted.barrage.remaining || !['cvFusion', 'cvPistol'].includes(w.id) || op.acted.barrage.used.includes(w.id)) return no('手槍彈幕每把手槍各一次', 'Pistol Barrage: each pistol once');
      return { ok: true, ap: 0, why: null };
    }
  }
  if (op.acted?.iaBar) { // Pistol Barrage (Pistolier): one Shoot with each pistol, free
    if (!op.acted.iaBar.left || !['iaPlasma', 'iaSuppressed'].includes(w.group) || op.acted.iaBar.used.includes(w.group)) return no('手槍彈幕：兩把手槍各射一次', 'Pistol Barrage: each pistol once');
    return { ok: true, ap: 0, why: null };
  }
  if (w.rules.limited && (op.used?.[w.id] || 0) >= w.rules.limited) return no('已用完（限用）', 'Used up (Limited)');
  if (w.rules.detonate && !living(g, op.side).some((o) => tpl(o).gheistskull)) return no('鬼骷髏不在場上', 'No Gheistskull in the killzone');
  if (w.rules.psychic && nullRodded(g, op)) return no('譴責者 6" 內不能用靈能武器', 'No PSYCHIC weapons within 6" of a Condemnor');
  if (w.rules.equipGrenade && !eqLeft(g, op.side, w.rules.equipGrenade)) return no('手榴彈用完了', 'No grenades left');
  if (w.rules.firstShotOnly && op.used?.shoot) return no('只能在第一次射擊使用', 'Only for the first Shoot of the battle');
  const free = op.acted?.free?.shoot; // Dakka Dash: a free Shoot with the dakka shoota
  if (free === 'any') return { ok: true, ap: 0, why: null }; // The Ancestors Are Watching
  if (free) return w.group === free ? { ok: true, ap: 0, why: null } : no('達卡衝刺只能用達卡槍', 'Dakka Dash: dakka shoota only');
  if (op.acted.dwAmmoPick === 'blast' && dwAmmoWeapon(w) && w.rules.torrent) return no('洪流武器不能選爆裂彈藥；請改選或取消', 'Torrent cannot use Blast ammo; change or cancel ammo');
  if (count(op, 'shoot')) {
    const first = op.acted.shotWith;
    if (tpl(op).mercilessHunter) {
      if (op.acted.archonMark || count(op, 'shoot') >= 2 || ((first === 'haRazorwing') === (w.id === 'haRazorwing'))) return no('雙射必須恰好一次使用剃刀翼，且本次不能標記', 'Exactly one Razorwing Shoot; cannot Mark');
      return { ok: op.ap >= ap, ap, why: null };
    }
    if (TEAM_MAP[op.team].rapidFire && !rapidWeapon(w)) return no('快速射擊兩次都要用爆彈手槍或熱射雷射槍／手槍', 'Rapid Fire: both Shoots need a bolt pistol or hot-shot lasgun / laspistol');
    // Astartes Training (Scout Squad ploy) for an operative that isn't Astartes itself: a shotgun / bolt pistol / boltgun in one of the two
    // Shoots, or both with heavy weapons (a heavy bolter, missile launcher or sniper rifle) — the second one costs 1 more AP.
    const scHeavy = (grp) => ['scHeavyBolter', 'scMissile', 'scSniperRifle'].includes(grp);
    const scTrain = op.acted.scTrain && !isAstartes(op);
    if (scTrain) {
      if (!astartesShot(w) && !op.acted.shotBolt && !(scHeavy(first) && scHeavy(w.group))) return no('阿斯塔特訓練：兩次射擊至少一次要用霰彈槍、爆彈手槍或爆彈槍（或兩次都用重武器／狙擊步槍）', 'Astartes Training: an Astartes shotgun, bolt pistol or boltgun for one Shoot (or heavy weapons / sniper rifle for both)');
      if (!astartesShot(w) && !op.acted.shotBolt) ap += 1;
    }
    if (!scTrain && !tpl(op).aqSentry && !TEAM_MAP[op.team].anyAstartesShot && !TEAM_MAP[op.team].rapidFire && !TEAM_MAP[op.team].bladesOfKhaine && !TEAM_MAP[op.team].broodBrothers && !astartesShot(w) && !op.acted.shotBolt) return no('兩次射擊至少一次要用爆彈（或靈能）武器', 'One of the two Shoots must use a bolt (or Psychic) weapon');
    if (w.rules.psychic && first === w.group) return no('同一把靈能武器不能用兩次', 'Same Psychic weapon twice');
    if (isDeathwatch(op)) { if (dwSecondShotExtra(first, w)) ap += 1; }
    else if (first === w.group && DOUBLE_SHOT_GROUPS.includes(w.group)) ap = 2;
  }
  if (op.ap < ap) return { ok: false, ap, why: { zh: 'AP 不足', en: 'Not enough AP' } };
  return { ok: true, ap, why: null };
}

/** Returns [{id, ap, ok, why}] for the active operative. */
export function availableActions(g, op) {
  const engaged = isEngaged(g, op);
  const did = (...ks) => ks.some((k) => count(op, k));
  const hasRanged = weaponsFor(g, op).some((w) => w.type === 'ranged');
  const conceal = op.order === 'conceal';
  const list = [];
  const add = (id, cond, why) => {
    const ap = actionCost(g, op, id);
    const counterBad = isDeathwatch(op) && op.counter && (ACTIONS[id].ap > 1 || id.startsWith('dwCuffs') || id === 'dwThrallUse');
    const ok = cond && !counterBad && !dwBlocked(g, op) && op.ap >= ap;
    list.push({ id, ap, ok, why: !cond ? why : op.ap < ap ? { zh: 'AP 不足', en: 'Not enough AP' } : null });
  };
  const ENG = { zh: '處於交戰中', en: 'Engaged' };
  const DONE = { zh: '本次啟動已執行', en: 'Already done' };
  const CONC = { zh: '隱蔽指令無法執行', en: 'Not while Concealed' };
  // Official combinations: Reposition ✕ Fall Back/Charge; Dash ✕ Charge; Charge ✕ Reposition/Dash/Fall Back.
  const COMBO = { zh: '本次啟動已執行衝突的移動動作', en: 'Conflicts with a move already made' };
  // Heavy: an operative cannot move in an activation or counteraction in which it used a Heavy weapon
  // (Heavy (Dash only) / (Reposition only): that one move is still allowed).
  // Rapid Fire (Kasrkin): after shooting twice it can't move this activation.
  const rapidLock = TEAM_MAP[op.team].rapidFire && count(op, 'shoot') >= 2;
  const HEAVY = rapidLock ? { zh: '快速射擊兩次後不能移動', en: 'Shot twice with Rapid Fire, cannot move' } : { zh: '本次已使用重型武器，不能移動', en: 'Used a Heavy weapon, cannot move' };
  const heavyBlocks = (k) => (op.warpMoveLockTP === g.tp && k !== 'dash') || rapidLock || (!!count(op, 'heavy') && op.acted.heavy !== k);
  const free = op.acted.free || {};
  // Mobile: may Charge while within control range of an enemy.
  const chargeEngaged = engaged && !hasTactic(g, op, 'mobile') && !op.acted.rvSlither; // (Slithering Evasion: Charge from engagement)
  add('reposition', !engaged && !heavyBlocks('reposition') && (!did('reposition', 'fallBack', 'charge') || !!op.acted.vdRestOn), engaged ? ENG : heavyBlocks('reposition') ? HEAVY : count(op, 'reposition') ? DONE : COMBO);
  const bladeDash = tpl(op).blademaster && count(op, 'charge') && (op.acted.chargeRemaining || 0) > 0;
  const caprice = free.dash === 'capricious' || free.dash === 'fade' || free.dash === 'murder'; // Capricious Plan / Strike and Fade: a free Dash whatever it did before
  add('dash', !engaged && (caprice || (!heavyBlocks('dash') && !count(op, 'dash') && (!count(op, 'charge') || bladeDash || (isVD(op) && hasPloy(g, op.side, 'vdCrescendo'))))) && op.plunderTP !== g.tp, engaged ? ENG : heavyBlocks('dash') ? HEAVY : count(op, 'dash') ? DONE : COMBO);
  // A Concealed operative can never Charge (the Kommandos' Throat Slittas and the Stalker's exception are not applied).
  const noCharge = conceal && !(tpl(op).rvTremor && op.acted.rvBurrow) && !op.acted.spSilent && !tpl(op).dwHeadtaker && !tpl(op).rtHunter && !(TEAM_MAP[op.team].concealCharge && !tpl(op).stoopid) && !(isMandrake(op) && hasPloy(g, op.side, 'mdBladeDark')); // (Hunter: Ratling Hardbit)
  // (Dakka Dash includes a Dash, so it also rules out Charge.)
  const rampage = free.charge === 'rampage' || free.charge === 'woe' || free.charge === 'bloodlust' || free.charge === 'murder'; // (murder: Proclivity for Murder) // Ruthless Rampage / The Woe / Obsessive Bloodlust: a free Charge even after one
  add('charge', !chargeEngaged && !noCharge && (rampage || (!heavyBlocks('charge') && !did('charge', 'reposition', 'dash', 'fallBack', 'dakkaDash'))), chargeEngaged ? ENG : noCharge ? CONC : heavyBlocks('charge') ? HEAVY : count(op, 'charge') ? DONE : COMBO);
  // Apprehend / Castigator's Arrest (Exaction Squad): held in place.
  const held = engaged && (arrested(g, op) || !!op.acted.fallBackDenied);
  add('fallBack', engaged && !held && !heavyBlocks('fallBack') && !did('fallBack', 'reposition', 'charge'), !engaged ? { zh: '未處於交戰', en: 'Not engaged' } : held ? { zh: '被逮捕／扣押，無法撤退', en: 'Apprehended / arrested — cannot Fall Back' } : heavyBlocks('fallBack') ? HEAVY : count(op, 'fallBack') ? DONE : COMBO);
  const shots = weaponsFor(g, op).filter((w) => w.type === 'ranged').map((w) => shootWeapon(g, op, w));
  // Close Quarters Vigilance (Vigilant): may Shoot while engaged, unless it Charged this activation (counteracting is fine).
  // (Explosive: a Bomb Squig can set off its explosives within an enemy's control range.)
  const shootEngaged = engaged && !tpl(op).quickTrigger && !(tpl(op).vigilance && (op.counter || !count(op, 'charge')))
    && !weaponsFor(g, op).some((w) => w.rules.wkExplosive && shootWeapon(g, op, w).ok);
  const shootWhy = shootEngaged ? ENG : !attackAllowed(op, 'shoot') ? DONE : (shots.find((s) => !s.ok)?.why || DONE);
  add('shoot', hasRanged && !shootEngaged && attackAllowed(op, 'shoot') && shots.some((s) => s.ok), shootWhy);
  // Savage Assault / Stealth Attack: a free Fight (against the same enemy for Savage Assault).
  add('fight', fightTargets(g, op).length > 0 && (attackAllowed(op, 'fight') || !!free.fight), !engaged ? { zh: '沒有交戰敵人或合法門間近戰目標', en: 'No engaged enemy or legal hatchway fight target' } : DONE);
  if (!engaged && g.map?.startsWith('tombworld-')) list.at(-1).name = {zh:'門間近戰',en:'Hatchway Fight'};
  if (tpl(op).optics) add('optics', !engaged && !count(op, 'optics'), engaged ? ENG : DONE);
  const NONE = { zh: '沒有可選的目標', en: 'No valid target' };
  const unique = (id, extra = true, extraWhy = null) => {
    const cond = !engaged && extra && !count(op, id) && TARGET_ACTIONS[id].targets(g, op).length > 0;
    add(id, cond, engaged ? ENG : !extra ? extraWhy : count(op, id) ? DONE : NONE);
  };
  for (const id of ['soulChannel', 'soulHeal', 'wardingShield', 'warpFold']) if (tpl(op)[id]) unique(id);
  if (tpl(op).blinkPack) add('blinkToggle', !did('reposition', 'charge', 'fallBack'), DONE);
  if (tpl(op).iaBarrage) add('iaBarrage', !conceal && !engaged && !did('shoot', 'iaBarrage'), conceal ? CONC : engaged ? ENG : DONE); // (Inquisition Pistolier)
  if (tpl(op).scry) { unique('scryGuide', !count(op, 'scryProtect'), DONE); unique('scryProtect', !count(op, 'scryGuide'), DONE); } // (Inquisition Mystic)
  if (tpl(op).pistolBarrage) add('pistolBarrage', !conceal && !did('shoot', 'pistolBarrage'), conceal ? CONC : DONE);
  if (tpl(op).tormentGrenade) unique('tormentGrenade');
  if (tpl(op).administerDrug) for (const id of ['drugHeal', 'drugPainbringer', 'drugAdrenalight', 'drugHypex']) unique(id, !['drugHeal', 'drugPainbringer', 'drugAdrenalight', 'drugHypex'].some((x) => count(op, x)), DONE);
  if (tpl(op).archonMark) unique('archonMark', count(op, 'shoot') < 2, DONE);
  if (tpl(op).markerlight) { if (tpl(op).fearless) add('markerlight', !count(op, 'markerlight') && TARGET_ACTIONS.markerlight.targets(g, op).length > 0, count(op, 'markerlight') ? DONE : NONE); else unique('markerlight'); } // (Shas'la, Fearless on the Frontline: even when engaged)
  pfActions(g, op, add); // Pathfinders: Pulse Accelerator, Photon Grenade
  kmActions(g, op, add); // Kommandos: Breach, Grappling Hook, Smoke Grenade
  mvbActions(g, op, add); // Portable Barricade: Move With Barricade
  kfActions(g, op, add); // Farstalker Kinband: Gather
  dkActions(g, op, add); // Death Korps: the Sapper's mine
  aqActions(g, op, add); // Tempestus Aquilons: Land, Expend
  vdActions(g, op, add); // Void-dancer Troupe: Mirror of Minds, Fog of Dreams
  vsActions(g, op, add); // Vespid Stingwings: Aerial Guidance, Skytorch Assault
  xvActions(g, op, add); // XV26 Stealth Battlesuits: Focused Markerlight, System Jam, Photon Grenade Launcher, Homing Beacon
  spActions(g, op, add); // Spectre Squad: Issue Mission, Signal, Load Weapon, Advanced Camouflage
  rvActions(g, op, add); // Raveners: Burrow, Toxic Lunge, Distend Dorsal Sac
  if (tpl(op).signal) unique('signal');
  if (tpl(op).signalAny) unique('signalAny');
  if (tpl(op).jamToken) unique('jamToken');
  if (tpl(op).panScan) unique('panScan');
  if (tpl(op).pulse) unique('pulse');
  if (tpl(op).helix) unique('helix');
  if (tpl(op).destiny) { unique('fate'); unique('ravage'); }
  if (tpl(op).stimms) unique('stimm');
  if (tpl(op).inciteFury) unique('inciteFury');
  if (tpl(op).fgShaman) { unique('rejuvenation'); add('mantle', !engaged && !count(op, 'mantle'), engaged ? ENG : DONE); }
  if (tpl(op).gongKnell) add('gongKnell', !count(op, 'gongKnell'), DONE);
  if (tpl(op).sweepingBlow) add('sweepingBlow', !conceal && !count(op, 'sweepingBlow'), conceal ? CONC : DONE);
  if (tpl(op).actuation) add('actuation', !engaged && !!op.bloodToken && !count(op, 'actuation'), engaged ? ENG : !op.bloodToken ? { zh: '自己沒有血祭標記', en: 'It has no Blooded token' } : DONE);
  // Shielding (Trench Sweeper): when activated, -2" Move and re-roll any defence dice until its next activation.
  if (tpl(op).shielding && !op.counter) add('shieldingUp', !op.shieldingOn && Object.keys(op.acted).length === 0, op.shieldingOn ? DONE : { zh: '只能在啟動時使用', en: 'Only when activated' });
  if (tpl(op).alight) unique('alight');
  if (tpl(op).auspex) add('auspexScan', !engaged && !count(op, 'auspexScan'), engaged ? ENG : DONE);
  // Guerrilla Warfare (Phobos ploy): change this operative's order.
  if (hasPloy(g, op.side, 'guerrilla') && TEAM_MAP[op.team].omniScrambler) add('guerrilla', !engaged && !count(op, 'guerrilla') && !op.counter, engaged ? ENG : DONE);
  // Boost (Gheistskull): once per battle, not in the first TP — the next Charge this activation moves +4" instead of +2".
  if (tpl(op).boost) add('boost', g.tp > 1 && !op.boostUsed && !count(op, 'charge'), g.tp <= 1 ? { zh: '第 1 回合不能使用', en: 'Not in the first turning point' } : DONE);
  if (tpl(op).knux) add('knuxSmash', engaged && !count(op, 'knuxSmash'), !engaged ? { zh: '控制範圍內沒有敵人', en: 'No enemy in control range' } : DONE);
  if (tpl(op).systemJam) unique('systemJam', !conceal, CONC);
  if (tpl(op).medikit) unique('medikit');
  if (tpl(op).droneController) add('remotePilot', !engaged && !op.counter && TARGET_ACTIONS.remotePilot.targets(g, op).length > 0, engaged ? ENG : op.counter ? { zh: '反擊時不能執行', en: 'Not while counteracting' } : NONE); // Remote Pilot (Pathfinder Drone Controller): repeatable
  if (tpl(op).veriscant) unique('veriscant');
  // Elucidian Starstriders.
  if (TEAM_MAP[op.team].starstriders) {
    if (tpl(op).calibrate) for (const id of ['calibCharge', 'calibField']) add(id, !engaged && !count(op, 'calibCharge') && !count(op, 'calibField'), engaged ? ENG : DONE);
    if (tpl(op).intoShadow) add('intoShadow', !engaged && !count(op, 'intoShadow'), engaged ? ENG : DONE); // Trained Assassin (Executioner)
  }
  // Chaos Cult.
  if (TEAM_MAP[op.team].chaosCult) {
    if (tpl(op).inciteSlaughter) { unique('inciteSlaughter', !op.counter, { zh: '反擊時不能執行', en: 'Not while counteracting' }); unique('inciteUrgency', !op.counter, { zh: '反擊時不能執行', en: 'Not while counteracting' }); }
    if (tpl(op).ruinousIcon) for (const id of ['ruinousInvig', 'ruinousDeter']) add(id, !engaged && !count(op, 'ruinousInvig') && !count(op, 'ruinousDeter'), engaged ? ENG : DONE);
    if (tpl(op).heinousDeluge) unique('heinousDeluge');
    if (tpl(op).maleficVortex) unique('maleficVortex');
  }
  // Celestian Insidiants.
  if (TEAM_MAP[op.team].insidiants) {
    if (tpl(op).spiritualMentor) unique('spiritualMentor', op.mentorTP !== g.tp, DONE);
    if (tpl(op).nullField) add('nullifyingRitual', !engaged && op.ritualTP !== g.tp && (op.nullRange || 1) < 5, engaged ? ENG : (op.nullRange || 1) >= 5 ? { zh: '虛無範圍已達 5"', en: 'Null range is already 5"' } : DONE);
    if (tpl(op).speakDeeds) unique('speakDeeds');
  }
  // Canoptek Circle.
  if (TEAM_MAP[op.team].obeliskNodes) {
    if (tpl(op).geomantic) unique('geomantic', !conceal, CONC);
    if (tpl(op).canoptekControl) unique('canoptekControl', !op.counter, { zh: '反擊時不能執行', en: 'Not while counteracting' });
    if (tpl(op).molecularBreach) unique('molecularBreach');
    if (tpl(op).overcharge) unique('overcharge');
    if (tpl(op).cranialOverload) unique('cranialOverload');
    if (tpl(op).nanoscarab) unique('nanoscarab', op.nanoTP !== g.tp, DONE);
  }
  // Brood Brothers.
  if (TEAM_MAP[op.team].broodBrothers) {
    if (tpl(op).explosives) {
      const n = op.explosivesUsed || 0, moved = did('charge', 'dash', 'fallBack');
      add('explosives', !engaged && n < 2 && !count(op, 'explosives') && !moved, engaged ? ENG : n >= 2 || count(op, 'explosives') ? DONE : COMBO);
      // (and not the other way round: no Charge, Dash or Fall Back after it this activation)
      if (count(op, 'explosives')) for (const a of list) if (['charge', 'dash', 'fallBack'].includes(a.id)) { a.ok = false; a.why = COMBO; }
    }
    if (tpl(op).jam) unique('bbJam');
    if (tpl(op).telepathicOverload) unique('telepathicOverload');
    if (tpl(op).mentalOnslaught) unique('mentalOnslaught');
    if (tpl(op).conspire) add('conspire', !engaged && op.conspireTP !== g.tp, engaged ? ENG : DONE);
    if (tpl(op).intoShadow) add('intoShadow', !engaged && !count(op, 'intoShadow'), engaged ? ENG : DONE);
  }
  // Battleclade: Noospheric Network and the Tech-Priests' actions.
  if (TEAM_MAP[op.team].noosphericNetwork) {
    if (isServitor(op) && !op.counter) add('transferPower', !count(op, 'transferPower') && aplNow(g, op) >= 2 && netCands(g, op.side).some((o) => o !== op), count(op, 'transferPower') ? DONE : aplNow(g, op) < 2 ? { zh: 'APL 低於 2', en: 'APL below 2' } : { zh: '沒有其他可網路反擊的僕從', en: 'No other servitor can network counteract' });
    if (tpl(op).omniscanner) unique('omniscanner');
    if (tpl(op).datacoronal) add('datacoronal', !engaged && !count(op, 'datacoronal'), engaged ? ENG : DONE);
    if (tpl(op).networkOverride) { // (network counteract or a free Dash: twice per activation between them, a different servitor each time)
      const used = count(op, 'networkOverride') + count(op, 'overrideDash');
      add('networkOverride', !engaged && used < 2 && TARGET_ACTIONS.networkOverride.targets(g, op).length > 0, engaged ? ENG : used >= 2 ? DONE : NONE);
      add('overrideDash', !engaged && used < 2 && TARGET_ACTIONS.overrideDash.targets(g, op).length > 0, engaged ? ENG : used >= 2 ? DONE : NONE);
    }
  }
  // Universal equipment: grenades (not beasts or machines) and the Ammo Cache.
  if (!tpl(op).actionsOnly && op.side < 2) {
    if (eqLeft(g, op.side, 'stun') || adaptiveOk(g, op, 'stun')) unique('eqStun', !conceal, CONC);
    if (eqLeft(g, op.side, 'smoke') || adaptiveOk(g, op, 'smoke') || tpl(op).spGrenadier) unique('eqSmoke');
  }
  // Kasrkin / Legionary unique actions.
  if (tpl(op).battleComms) add('battleComms', !engaged && count(op, 'battleComms') < 2 && TARGET_ACTIONS.battleComms.targets(g, op).length > 0, engaged ? ENG : count(op, 'battleComms') >= 2 ? DONE : NONE);
  if (tpl(op).tacticalCommand) unique('tacticalCommand');
  if (tpl(op).meltaMine) add('meltaMine', !engaged && !op.meltaPlaced && !count(op, 'meltaMine'), engaged ? ENG : DONE);
  if (tpl(op).grisly) add('grislyMark', !engaged && !op.grislyDone, engaged ? ENG : DONE);
  if (tpl(op).unleashDaemon && !op.counter) add('unleashDaemon', !op.unleashed && Object.keys(op.acted).every((k) => ['unseen', 'accelerant', 'free'].includes(k)), op.unleashed ? DONE : { zh: '只能在啟動時使用', en: 'Only when activated' });
  if (ammoTarget(g, op)) add('ammoResupply', !engaged && !count(op, 'ammoResupply'), engaged ? ENG : DONE);
  // Hierotek Circle: Cryptek actions (an Apprentek only one of them per turning point).
  const crypDone = tpl(op).apprentek && op.crypTP === g.tp;
  const CRYP = { zh: '本回合已用過一次技師動作', en: 'Already used a Cryptek action this turning point' };
  if (tpl(op).interstitial) unique('interstitial', !op.counter && !crypDone, op.counter ? { zh: '反擊時不能執行', en: 'Not while counteracting' } : CRYP);
  for (const id of ['canoptekRepair', 'augment', 'reinforce']) if (tpl(op)[id]) unique(id, !crypDone, CRYP);
  if (tpl(op).accelerate) unique('accelerate');
  if (tpl(op).mdVision) add('mdVision', !engaged && !count(op, 'mdVision'), engaged ? ENG : DONE);
  if (tpl(op).reanimate) {
    const why = engaged ? ENG : count(op, 'reanimate') || count(op, 'reanimateSure') ? DONE : { zh: '6" 內沒有看得到的復甦標記', en: 'No Reanimation marker visible within 6"' };
    const ok = !engaged && !count(op, 'reanimate') && !count(op, 'reanimateSure') && reanimTargets(g, op).length > 0;
    add('reanimate', ok, why); add('reanimateSure', ok, why);
  }
  if (tpl(op).apprehend) add('apprehend', engaged && !count(op, 'apprehend'), !engaged ? { zh: '控制範圍內沒有敵人', en: 'No enemy in control range' } : DONE);
  if (tpl(op).support) unique(tpl(op).support, tpl(op).support !== 'getItDun' || !op.counter, { zh: '反擊時不能執行', en: 'Not while counteracting' });
  if (tpl(op).wotNotz) unique('stunGrenade');
  if (tpl(op).dakkaDash) {
    // Dakka Dash: a free Dash and a free Shoot (dakka shoota only), in either order.
    const ok = !engaged && !conceal && !did('dakkaDash', 'dash', 'charge', 'shoot');
    add('dakkaDash', ok, engaged ? ENG : conceal ? CONC : count(op, 'dakkaDash') ? DONE : COMBO);
  }
  if (tpl(op).miasma) unique('miasma');
  if (tpl(op).vitality) unique('vitality');
  if (tpl(op).pechra) unique('pechra');
  if (tpl(op).energise) add('energise', !engaged && !count(op, 'energise'), engaged ? ENG : DONE);
  if (tpl(op).longSight) add('longSight', !engaged && !count(op, 'longSight'), engaged ? ENG : DONE);
  if (tpl(op).stealthAttack) {
    // Stealth Attack: Conceal order, not engaged, within 1" of Light or Heavy terrain.
    const nearTerrain = g.terrain.some((t) => distPointRect(op, t) - radius(op) <= 1);
    const ok = conceal && !engaged && nearTerrain && !did('stealthAttack', 'charge', 'reposition', 'dash', 'fallBack');
    add('stealthAttack', ok, !conceal ? { zh: '需要隱蔽指令', en: 'Needs a Conceal order' } : engaged ? ENG : !nearTerrain ? { zh: '1" 內沒有地形', en: 'No terrain within 1"' } : count(op, 'stealthAttack') ? DONE : COMBO);
  }
  if (tpl(op).flail) {
    // Flail counts as a Fight action (Astartes double Fight, once-per-activation limits).
    const ok = !conceal && attackAllowed(op, 'fight') && flailTargets(g, op).some((t) => t.side !== op.side);
    add('flail', ok, conceal ? CONC : !attackAllowed(op, 'fight') ? DONE : { zh: '2" 內沒有可見的敵人', en: 'No visible enemy within 2"' });
  }
  // Mission actions and Pick Up Marker (player operatives only).
  if (op.side !== NPO && op.homeSide == null && !op.unleashed && op.brutalDisplayTP !== g.tp && op.ncFlayTP !== g.tp) { // (Unleash Daemon: no Pick Up or mission actions)
    for (const id of missionActionsFor(g, op.side)) {
      const hatch=/^tw(Open|Close)_/.test(id) && accessPointsOf(g).find(d=>hatchActionId(d) === id);
      if(hatch && !nearHatch(g,op,hatch,radius(op))) continue;
      const why = MISSION_ACTIONS[id].cond(g, op);
      add(id, !why && !count(op, id), why || DONE);
      if(hatch) list.at(-1).name={zh:`${hatch.state === 'open' ? '關門':'開門'} ${hatch.component}（${Number(hatch.id.split('-')[1])+1}）`,en:`${hatch.state === 'open' ? 'Close':'Open'} ${hatch.component} door ${Number(hatch.id.split('-')[1])+1}`};
    }
    if (carriables(g).some((m) => canPickUpMarker(g, op, m))) {
      const n = pickUpTargets(g, op).length;
      add('pickUp', (!engaged || op.acted.lightFingers || op.rtLarcenous) && n > 0 && !count(op, 'pickUp'), engaged ? ENG : count(op, 'pickUp') ? DONE : { zh: '控制範圍內沒有可撿的標記（或已帶滿）', en: 'No marker to pick up in control range (or already carrying)' });
    }
  }
  // Drones can only perform the actions listed on their datacard.
  // Frenzy (Fellgor): no Pick Up, unique or mission actions (Sweeping Blow excepted).
  if (op.frenzy) {
    const core = ['reposition', 'dash', 'charge', 'fallBack', 'shoot', 'fight', 'sweepingBlow'];
    return list.filter((a) => core.includes(a.id));
  }
  dwActions(g, op, add, attackAllowed(op, 'shoot') && shots.some((a) => a.ok));
  mdActions(g, op, add);
  mwActions(g, op, add);
  wkActions(g, op, add); // Break Stuff (Wrecka Krew Fighter)
  ncActions(g, op, add); // Nemesis Claw: Premonition, Poison Objective, Disconcerting Mimicry
  scActions(g, op, add); // Scout Squad: Track Enemy
  rtActions(g, op, add); // Ratlings: Slingshot
  sfActions(g, op, add); // Sanctifiers: Sanctification Orb, Wreathe in Fire, Trained Assassin
  // Exodite Dragon Masters: a rider in reserve only enters (see enterFromReserve); riders move by Sprint and Turn only.
  if (op.reserve) return op.underground ? list.filter((a) => a.id === 'rvBurrow' || a.id === 'rvLunge') : op.above ? list.filter((a) => a.id === 'aqLand' || a.id === 'aqExpend') : []; // (underground Raveners can only Burrow, or Toxic Lunge)
  if (isMounted(op)) {
    for (let i = list.length - 1; i >= 0; i--) if (['reposition', 'dash', 'charge', 'fallBack'].includes(list[i].id)) list.splice(i, 1);
    const left = Math.min(9 - (op.acted.sprintFwd || 0), 12 - (op.movedTP || 0));
    add('edSprint', !count(op, 'sprint') && left > 0, count(op, 'sprint') ? DONE : { zh: '本回合移動距離已用完', en: 'No movement left this turning point' });
    add('edTurn', !op.counter && !count(op, 'edTurn'), op.counter ? { zh: '反擊時不能轉向', en: 'Not while counteracting' } : DONE);
    list.unshift(...list.splice(list.length - 2, 2)); // (movement first)
    if (tpl(op).songRenewal) { unique('songOne', op.songTP !== g.tp, DONE); add('songAll', !engaged && op.songTP !== g.tp, engaged ? ENG : DONE); }
    if (hasUp(op, 'cleansing')) unique('cleansing');
    if (hasUp(op, 'wails')) unique('wails', op.wailsTP !== g.tp, DONE);
    if (hasUp(op, 'winds')) unique('windsGrace', op.windsTP !== g.tp, DONE);
  }
  // Goremongers: Transfusion Ritual (Bloodtaker), Gore-fuel (Impaler), Dash and Spray (Inciter).
  if (tpl(op).transfusion) unique('transfusion', goreOf(op) > 0, { zh: '血槽是空的', en: 'GORE TANK is empty' });
  if (tpl(op).goreFuel) add('goreFuel', !engaged && goreOf(op) > 0 && !op.goreFuelOn && !count(op, 'goreFuel'), engaged ? ENG : goreOf(op) <= 0 ? { zh: '血槽是空的', en: 'GORE TANK is empty' } : DONE);
  if (tpl(op).dashSpray) add('dashSpray', !engaged && !conceal && !count(op, 'dashSpray') && !count(op, 'dash') && !count(op, 'charge') && attackAllowed(op, 'shoot'), engaged ? ENG : conceal ? CONC : DONE);
  const allowed = op.ctlOnly || (op.xvFreeDrone ? null : tpl(op).actionsOnly); // (XV26 Drone Controller: no Drone limits) // (ctlOnly: Incite Slaughter / Urgency's one free action)
  vsGate(g, op, list, missionActionsFor(g, op.side));
  { const f = xvFilter(g, op, list, missionActionsFor(g, op.side)); if (f !== list) { list.length = 0; list.push(...f); } } // XV26: Covert Protocols, Target Locks // Communion: Pick Up and mission actions need a point (Vespid Stingwings)
  if (op.vsNoAtkTP === g.tp) for (let i = list.length - 1; i >= 0; i--) if (['shoot', 'fight'].includes(list[i].id)) list.splice(i, 1); // Darting Flight (Vespid Stingwings)
  if (op.aqNoAtk === g.tp) for (let i = list.length - 1; i >= 0; i--) if (['dash', 'shoot', 'fight'].includes(list[i].id)) list.splice(i, 1); // Adjust Coordinates (Aquilons)
  const nulled = nullRodded(g, op) || witchHunted(g, op) ? list.filter((a) => !PSYCHIC_ACTIONS.includes(a.id)) : list; // Null Rod (Condemnor) / Weapons of the Witch Hunters
  return allowed ? nulled.filter((a) => allowed.includes(a.id)) : nulled;
}

/** Enemies this operative can fight: engaged ones, or only the same enemy for Savage Assault's free Fight. */
export function fightTargets(g, op) {
  if (op.mwAttackLockTP === g.tp) return [];
  if (op.mdPassLockTP === g.tp) return [];
  const only = op.acted?.free?.fight;
  const engaged = engagedEnemies(g,op);
  const candidates = engaged.length ? engaged : foes(g,op).filter(e => hatchwayFightAccess(g,op,e,radius(op),radius(e)));
  const list = candidates.filter((e) => !op.mdFocusTarget || e.uid === op.mdFocusTarget);
  if (only === 'swipe') return list.filter((e) => !op.acted.swiped?.includes(e.uid)); // Swipe: each enemy once
  return typeof only === 'string' && only !== 'stealth' && only !== 'any' ? list.filter((e) => e.uid === only) : list;
}

/** Simple instant actions without a target (Energise, Long-sight, Stealth Attack). */
export function doSelfAction(g, op, id) {
  if (mdSelfAction(g, op, id)) return;
  if (mwSelf(g, op, id)) return;
  if (wkSelf(g, op, id)) return;
  if (ncSelf(g, op, id)) return;
  if (sfSelf(g, op, id)) return; // Sanctifiers: Trained Assassin, Wreathe in Fire
  if (pfSelf(g, op, id)) return; // Pathfinders: Pulse Accelerator
  if (mvbSelf(g, op, id)) return; // Portable Barricade: Move With Barricade
  if (kmSelf(g, op, id)) return; // Kommandos: Breach
  if (kfSelf(g, op, id)) return; // Farstalker Kinband: Gather
  if (dkSelf(g, op, id)) return; // Death Korps: the Sapper's mine
  if (xvSelf(g, op, id)) return; // XV26 Stealth Battlesuits: Place Homing Beacon
  if (vsSelf(g, op, id)) return; // Vespid Stingwings: Aerial Guidance
  if (aqSelf(g, op, id)) return; // Tempestus Aquilons: Expend
  if (spSelf(g, op, id)) return; // Spectre Squad: Advanced Camouflage
  if (rvSelf(g, op, id)) return; // Raveners: Burrow (underground), Distend Dorsal Sac
  if (dwSelfAction(g, op, id)) { if (id === 'dwGuard') dwAfterAction(g, op); return; }
  if (id === 'blinkToggle') { op.blinkOn = !op.blinkOn; return; }
  if (id === 'pistolBarrage') { spend(g, op, id); op.acted.barrage = { remaining: 2, used: [] }; return; }
  if (id === 'iaBarrage') { spend(g, op, id); op.acted.iaBar = { left: 2, used: [] }; log(g, { zh: `${opName(op, 'zh')} 手槍彈幕：電漿手槍與消音手槍各免費射擊一次`, en: `${opName(op, 'en')} Pistol Barrage: a free Shoot with each pistol` }, `side${op.side}`); return; }
  if (id === 'reanimate' || id === 'reanimateSure') return doReanimate(g, op, id === 'reanimateSure');
  spend(g, op, id);
  const msg = {
    energise: { zh: '充能：加速弓獲得「致命 5+」，直到本回合結束或射擊後', en: 'Energise: the accelerator bow has Lethal 5+ until the end of the TP or until it shoots' },
    longSight: { zh: '遠視：直到下次啟動，獵槍（隱蔽／定點）獲得「致命 5+」，射擊時敵人不能被遮蔽', en: 'Long-sight: until its next activation, the hunting rifle (concealed/stationary) has Lethal 5+ and enemies cannot be obscured' },
    stealthAttack: { zh: '潛行突襲：免費衝鋒（不超過 Move）後免費近戰，第一次打擊時可再追加一次打擊', en: 'Stealth Attack: a free Charge (up to its Move) then a free Fight; its first strike is followed by another' },
    boost: { zh: '加速：這次啟動的下一次衝鋒多移動 4"（而非 2"）', en: 'Boost: its next Charge this activation moves +4" (instead of +2")' },
    auspexScan: { zh: '鳥卜儀掃描：直到下次啟動，友方射擊它 8" 內的敵人時目標不會被遮擋（突襲者再加「搜尋（輕型）」）', en: 'Auspex Scan: until its next activation, enemies within 8" of it can\'t be obscured when friendlies shoot them (Incursors also have Seek Light)' },
    gongKnell: { zh: '鳴鑼：直到下次啟動，被射擊時豁免值改善 1', en: 'Gong Knell: until its next activation, +1 Save when shot' },
    mantle: { zh: '黑暗披風：直到下次啟動，它 3" 內可見、隱蔽且在掩體中的友方無法被選為目標', en: 'Mantle of Darkness: until its next activation, Concealed friendlies in cover visible within 3" of it can\'t be targeted' },
    sweepingBlow: { zh: '橫掃重擊', en: 'Sweeping Blow' },
    shieldingUp: { zh: '舉盾：直到下次啟動，Move -2"，被射擊時可重擲任意防禦骰', en: 'Shielding: until its next activation, -2" Move and it re-rolls any defence dice when shot' },
    actuation: { zh: '褻瀆啟動', en: 'Sacrilegious Actuation' },
    meltaMine: { zh: '放置熱熔地雷，接著可免費衝刺一次（其他特工進入它的控制範圍時受 2D6+3 傷害）', en: 'places the Melta Mine and may Dash for free (any other operative entering its control range takes 2D6+3)' },
    grislyMark: { zh: '血腥標記：3" 內的敵人撿標記與任務動作多花 1AP，爭奪目標時 APL 總和 -1', en: 'Grisly Mark: enemies within 3" pay +1AP for Pick Up and mission actions, and count 1 less total APL for marker control' },
    unleashDaemon: { zh: '釋放惡魔：整場戰鬥中 4 以上的傷害 -1，惡魔爪「無休」＋「致命 5+」，不能撿標記或做任務動作', en: 'Unleash Daemon: for the rest of the battle 4+ damage deals 1 less, its claw has Ceaseless and Lethal 5+, and it can\'t pick up markers or do mission actions' },
    ammoResupply: { zh: '補充彈藥：直到下回合，射擊時可重擲一顆攻擊骰', en: 'Ammo Resupply: until next TP, it re-rolls one attack die when shooting' },
    mdVision: { zh: '多維視覺：直到下次啟動，射擊時敵人不能被遮蔽', en: 'Multi-dimensional Vision: until its next activation, enemies cannot be obscured when it shoots' },
    guerrilla: { zh: `游擊戰：改為${op.order === 'conceal' ? '交戰' : '隱蔽'}指令`, en: `Guerrilla Warfare: switches to ${op.order === 'conceal' ? 'Engage' : 'Conceal'}` },
    transferPower: { zh: '轉移能量：這次啟動結束後，另一名僕從可以網路反擊', en: 'Transfer Power: after this activation another servitor can network counteract' },
    datacoronal: { zh: '數據冠累加器', en: 'Datacoronal Accumulator' },
    explosives: (op.explosivesUsed || 0) === 0 ? { zh: '爆破：放置炸藥標記（下次爆破時引爆）', en: 'Explosives: places the Explosives marker (the next one detonates it)' } : { zh: '爆破：引爆炸藥', en: 'Explosives: detonates the charge' },
    conspire: { zh: '密謀：獲得 1CP', en: 'Conspire: +1CP' },
    nullifyingRitual: { zh: `虛無儀式：虛無範圍變為 ${(op.nullRange || 1) + 1}"`, en: `Nullifying Ritual: null range is now ${(op.nullRange || 1) + 1}"` },
    songAll: { zh: '更新之歌（全體）：每名友方回復 D3 生命', en: 'Song of Renewal (all): every friendly regains up to D3 wounds' },
    calibCharge: { zh: '校準電能幽靈（充能）：直到下次啟動，電弧手槍「致命 4+」', en: 'Calibrate Voltagheist (Charge): until its next activation, its voltaic pistol has Lethal 4+' },
    calibField: { zh: '校準電能幽靈（力場）：直到下次啟動，在它 4" 內看得到的地方結束移動的敵人受 D6 傷害', en: 'Calibrate Voltagheist (Field): until its next activation, an enemy ending a move visible within 4" of it takes D6' },
    ruinousInvig: { zh: '毀滅聖像（活化）：直到它下次啟動，4" 內的友方受到 4 以上的傷害 -1', en: 'Ruinous Icon (Invigoration): until its next activation, friendlies within 4" take 1 less from Dmg of 4+' },
    ruinousDeter: { zh: '毀滅聖像（衰敗）：直到它下次啟動，4" 內的敵人受到的傷害 +1', en: 'Ruinous Icon (Deterioration): until its next activation, enemies within 4" take 1 more damage' },
    intoShadow: { zh: `隱入暗影：改為${op.order === 'conceal' ? '交戰' : '隱蔽'}指令`, en: `Into Shadow: switches to ${op.order === 'conceal' ? 'Engage' : 'Conceal'}` },
    goreFuel: { zh: '血燃：血槽 -1，下次用穿肉鉤時武器「嚴厲」', en: 'Gore-fuel: GORE TANK down; its fleshskewer has Severe the next time it\'s used' },
    dashSpray: { zh: '衝刺掃射：可免費衝刺一次，並免費用雙自動手槍（集中）射擊一次', en: 'Dash and Spray: a free Dash and a free Shoot with the dual autopistols (focused)' },
  }[id];
  if (id === 'goreFuel') { goreDown(op); op.goreFuelOn = true; }
  if (id === 'dashSpray') op.acted.free = { ...(op.acted.free || {}), dash: true, shoot: 'gmDualF' };
  if (id === 'explosives') {
    if ((op.explosivesUsed || 0) === 0) g.markers.push({ id: g.markers.length, kind: 'explosives', owner: op.side, by: op.uid, x: op.x, y: op.y, carriedBy: null });
    else detonateExplosives(g, op);
    op.explosivesUsed = (op.explosivesUsed || 0) + 1;
  }
  if (id === 'conspire') { op.conspireTP = g.tp; g.cp[op.side]++; }
  if (id === 'nullifyingRitual') { op.ritualTP = g.tp; op.nullRange = Math.min(5, (op.nullRange || 1) + 1); }
  if (id === 'songAll') { op.songTP = g.tp; for (const o of living(g, op.side).filter((x) => isEDM(x) && x.x > -50)) o.wounds = Math.min(o.maxW, o.wounds + d3()); }
  if (id === 'calibCharge' || id === 'calibField') (g.calib ||= [null, null])[op.side] = { by: op.uid, mode: id === 'calibCharge' ? 'charge' : 'field' };
  if (id === 'ruinousInvig' || id === 'ruinousDeter') (g.ruinous ||= [null, null])[op.side] = { by: op.uid, mode: id === 'ruinousInvig' ? 'invigoration' : 'deterioration' };
  if (id === 'intoShadow') op.order = op.order === 'conceal' ? 'engage' : 'conceal';
  if (id === 'datacoronal') {
    // Friendly Battleclade operatives within 6" of it or the Auto-proxy; D3 ≤ objectives they contest = +1CP.
    const near = living(g, op.side).filter((o) => sameTeam(o, op) && (edgeDist(o, op) <= 6 || o === op || nearRelay(g, o)));
    const n = (g.objectives || []).filter((m) => !m.carriedBy && near.some((o) => dist(o, m) - radius(o) - OBJ_R <= CONTROL)).length;
    const r = d3(), ok = r <= n;
    if (ok) g.cp[op.side]++;
    msg.zh += `：擲 D3 = ${r}，爭奪 ${n} 個目標點${ok ? '，獲得 1CP' : '，沒有效果'}`;
    msg.en += `: D3 = ${r}, contesting ${n} objective(s)${ok ? ' — +1CP' : ' — no effect'}`;
  }
  if (id === 'auspexScan') (g.auspex ||= [null, null])[op.side] = op.uid;
  if (id === 'shieldingUp') op.shieldingOn = true;
  if (id === 'mdVision') op.optics = true; // same effect as Optics
  if (id === 'meltaMine') { op.meltaPlaced = true; g.markers.push({ id: g.markers.length, kind: 'meltaMine', owner: op.side, exempt: op.uid, x: op.x, y: op.y, carriedBy: null }); op.acted.free = { ...(op.acted.free || {}), dash: true }; }
  if (id === 'grislyMark') { op.grislyDone = true; g.markers.push({ id: g.markers.length, kind: 'grisly', owner: op.side, x: op.x, y: op.y, carriedBy: null }); }
  if (id === 'unleashDaemon') op.unleashed = true;
  if (id === 'ammoResupply') { const m = ammoTarget(g, op); if (m) m.usedTP = g.tp; op.ammoTP = g.tp; }
  if (id === 'gongKnell') op.gongOn = true;
  if (id === 'mantle') (g.mantle ||= [null, null])[op.side] = op.uid;
  if (id === 'sweepingBlow') {
    // Sweeping Blow (Vandal): D3+1 to each other operative visible within 2" (friends too).
    for (const o of g.ops.filter((x) => !x.dead && x !== op && edgeDist(x, op) <= 2 && visibility(g, op, x).visible)) {
      const dmg = d3() + 1;
      log(g, { zh: `${opName(op, 'zh')} 橫掃重擊：${opName(o, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(op, 'en')} Sweeping Blow: ${opName(o, 'en')} takes ${dmg} damage` }, `side${op.side}`);
      applyDamage(g, op, o, dmg);
    }
  }
  if (id === 'actuation') gainBlood(g, op.side, { zh: '褻瀆啟動', en: 'Sacrilegious Actuation' });
  if (id === 'guerrilla') op.order = op.order === 'conceal' ? 'engage' : 'conceal';
  if (id === 'boost') { op.acted.boost = true; op.boostUsed = true; }
  if (id === 'energise') op.energised = g.tp;
  if (id === 'longSight') op.longSightOn = true;
  if (id === 'stealthAttack') op.acted.free = { ...(op.acted.free || {}), charge: 'stealth', fight: 'stealth' };
  log(g, { zh: `${opName(op, 'zh')} ${msg.zh}`, en: `${opName(op, 'en')} ${msg.en}` }, `side${op.side}`);
  dwAfterAction(g, op);
}

/** Optics (Eliminator Sniper): until its next activation, enemies can't be obscured when it shoots. */
export function doOptics(g, op) {
  spend(g, op, 'optics');
  op.optics = true;
  log(g, { zh: `${opName(op, 'zh')} 使用光學瞄準：敵人無法被遮蔽`, en: `${opName(op, 'en')} uses Optics: enemies cannot be obscured` }, `side${op.side}`);
  dwAfterAction(g, op);
}

export function spend(g, op, id, ap = actionCost(g, op, id)) {
  if (g.seekerFree === op.uid) ap = 0;
  if (!['shoot', 'fight', 'mwBoostAction'].includes(id)) mwActionStart(g);
  if (id !== 'dwGuard') op.dwGuard = false;
  corsairSpend(g, op, id, ap);
  op.ap -= ap;
  if ((id === 'pickUp' || MISSION_ACTIONS[id]) && ap > 0 && intimidated(g, op)) spendFF(g, 1 - op.side, 'intimidatingPresence'); // (Inquisition)
  if ((tpl(op).acuteFocus || tpl(op).lightFingered || tpl(op).gotAPlan) && (ACUTE.includes(id) || MISSION_ACTIONS[id])) op.acted.acuteUsed = true; // Acute Focus / Light-fingered used
  if (tpl(op).apprentek && CRYPTEK_ACTIONS.includes(id)) op.crypTP = g.tp; // Apprentek Assistance: one per turning point
  if (tpl(op).vanguard && (id === 'pickUp' || MISSION_ACTIONS[id])) (g.vanguardTP ||= [0, 0])[op.side] = g.tp; // Vanguard used
  op.acted[id] = count(op, id) + 1;
  op.orderSet = true;
}

/** Apply a validated movement path. */
export function doMove(g, op, kind, path) {
  if (isMurderwing(op) && (!path?.pts?.length || path.len > moveAllowance(g, op, kind) + 0.01)) return false;
  const ctx = moveCtx(g, op, kind);
  path = wholeInchPath(op.breachMove && !g.map?.startsWith('tombworld-') ? { ...ctx, segFree: () => true, extra: () => 0 } : ctx, path, moveAllowance(g, op, kind), kind === 'charge' ? ctx.inEnemyER : (p) => !ctx.inEnemyER(p));
  if (!path) return false;
  if (kind === 'charge' && sfDeclaim(g, op, 'charge')) { spend(g, op, 'charge'); return true; } // Commanding Declamation (Sanctifier Confessor)
  if (kind === 'fallBack' && !mwFallBack(g, op)) return false;
  const mwPursuers = kind === 'fallBack' ? foes(g, op).filter((e) => isMurderwing(e) && edgeDist(e, op) <= 1.01) : [];
  const dest = path?.pts?.at(-1);
  if (kind === 'charge' && !vsChargeOk(g, op, dest)) return false; // Communion (Vespid Stingwings): the closest enemy unless a point is spent
  if (hasPloy(g, op.side, 'bound') && !op.acted.boundUsed && ctx.climbRaw?.(path.pts) > 0) op.acted.boundUsed = true; // Bound (Kinband): the first 2" of one climb was free
  if (kind === 'charge' && isMandrake(op) && op.order === 'conceal' && hasPloy(g, op.side, 'mdBladeDark') && !withinShadow(g, op) && !withinShadow(g, { ...op, ...dest })) return false;
  if (kind === 'charge') wkActionStart(g, op, 'charge'); // Tanked Up (Wrecka Krew): at the start of the Charge
  if (kind === 'fallBack' && !mdFallBack(g, op, d6, d3)) return false;
  const seenBefore = foes(g, op).filter((t) => visibility(g, op, t).visible).map((t) => t.uid);
  const movedFrom = { x: op.x, y: op.y }; // (Preternatural Evasion, Drakolithe)
  const mvbFrom = kind === 'reposition' && op.mvb ? { x: op.x, y: op.y, t: portableOf(g, op) } : null;
  if (kind === 'fallBack' && (chainSnare(g, op) || ncSnare(g, op))) return false; // Chain Snare (Hand of the Archon / Nemesis Claw)
  // Cut Them Down (Chaos Cult Blessed Blade): falling back from its control range, D3+1 damage first (2D3+2 with two of them).
  if (kind === 'fallBack') {
    const blades = foes(g, op).filter((b) => tpl(b).cutThemDown && edgeDist(b, op) <= CONTROL + 0.01);
    if (blades.length) {
      const dmg = blades.length >= 2 ? d3() + d3() + 2 : d3() + 1;
      log(g, { zh: `砍倒他們：${opName(op, 'zh')} 撤退前受到 ${dmg} 傷害`, en: `Cut Them Down: ${opName(op, 'en')} takes ${dmg} damage before falling back` }, `side${blades[0].side}`);
      applyDamage(g, blades[0], op, dmg);
      if (op.dead) return false;
    }
  }
  if (kind === 'fallBack' && foes(g, op).some((e) => isCorsair(e) && edgeDist(e, op) <= 1) && autoFF(g, 1 - op.side, 'opportunisticFighters')) { for (const e of foes(g, op).filter((x) => isCorsair(x) && edgeDist(x, op) <= 1)) { applyDamage(g, e, op, d3() + d3()); if (op.dead) return false; } }
  if (isCorsair(op)) { op.movedCorsairTP = g.tp; if (kind === 'charge') op.acted.chargeRemaining = Math.max(0, moveAllowance(g, op, kind) - path.len); }
  // Tentacled Grasp (Bloatspawn): falling back from its control range, D6 (+1 if Wounds stat 8 or less), 4+ = held.
  // Daemonic Aura (Legionary Chosen): falling back from its control range, D6 3+ = it can't (AP refunded).
  // No Escape (Inquisition Enlightener): D6 (-1 if it has the higher Wounds stat, +1 if wounded) 4+ — it can't Fall Back (AP spent).
  const enl = kind === 'fallBack' && engagedEnemies(g, op).find((e) => tpl(e).noEscape);
  if (enl) {
    const roll = d6(), total = roll - (tpl(op).wounds > tpl(enl).wounds ? 1 : 0) + (op.wounds < op.maxW ? 1 : 0);
    log(g, { zh: `${opName(enl, 'zh')} 無處可逃（擲 ${roll}，計 ${total}）：${total >= 4 ? `${opName(op, 'zh')} 撤退失敗` : '沒擋住'}`, en: `${opName(enl, 'en')} No Escape (rolled ${roll}, counts ${total}): ${total >= 4 ? `${opName(op, 'en')} can't fall back` : 'no hold'}` }, `side${enl.side}`);
    if (total >= 4) { spend(g, op, kind); op.acted.fallBackDenied = true; return false; }
  }
  const aura = kind === 'fallBack' && engagedEnemies(g, op).find((e) => tpl(e).daemonicAura);
  if (aura) {
    const roll = d6();
    log(g, { zh: `${opName(aura, 'zh')} 惡魔光環（擲 ${roll}）：${roll >= 3 ? `${opName(op, 'zh')} 無法撤退` : '沒擋住'}`, en: `${opName(aura, 'en')} Daemonic Aura (rolled ${roll}): ${roll >= 3 ? `${opName(op, 'en')} can't fall back` : 'no hold'}` }, `side${aura.side}`);
    if (roll >= 3) { op.acted.fallBackDenied = true; return false; }
  }
  const grasp = kind === 'fallBack' && engagedEnemies(g, op).find((e) => tpl(e).tentacledGrasp);
  if (grasp) {
    const roll = d6(), total = roll + (tpl(op).wounds <= 8 ? 1 : 0);
    if (total >= 4) {
      spend(g, op, kind);
      log(g, { zh: `${opName(grasp, 'zh')} 觸手擒抱（擲 ${roll}${total > roll ? '+1' : ''}）：${opName(op, 'zh')} 撤退失敗`, en: `${opName(grasp, 'en')} Tentacled Grasp (rolled ${roll}${total > roll ? '+1' : ''}): ${opName(op, 'en')} can't fall back` }, `side${grasp.side}`);
      return false;
    }
    log(g, { zh: `${opName(grasp, 'zh')} 觸手擒抱（擲 ${roll}${total > roll ? '+1' : ''}）：沒抓住`, en: `${opName(grasp, 'en')} Tentacled Grasp (rolled ${roll}${total > roll ? '+1' : ''}): no hold` }, `side${grasp.side}`);
  }
  // Scout Squad: Grapnel Assault (a Charge that climbs), and an enemy Booby Trap stops the move where its control range first reaches it.
  if (kind === 'charge' && tpl(op).scGrapnel && ctx.climbs?.(path.pts) > 0) op.acted.scGrapnel = true;
  const trap = scTrapPath(g, op, path);
  if (trap) path = scTrapShorten(ctx, path, trap);
  const end = path.pts[path.pts.length - 1];
  const ncFirst = kind === 'charge' && startOfActivation(op); // (We Have Come For You: the Charge is its first action)
  const ratConceal = kind === 'charge' && op.order === 'conceal'; // (Ratling Hunter: a Charge made with a Conceal order)
  op.x = end.x; op.y = end.y;
  if (mvbFrom) mvbMoved(g, op, mvbFrom, mvbFrom.t);
  spend(g, op, kind);
  mwMoved(g, op, kind, path, movedFrom, mwPursuers);
  const rec = g.recent?.[op.side];
  const pts = path.pts.map((p) => ({ x: Math.round(p.x * 100) / 100, y: Math.round(p.y * 100) / 100 }));
  if (rec?.uid === op.uid) rec.trails.push(pts);
  // Every move this turning point stays on the board for the players to review (older ones fade).
  const log_ = (g.trailLog ||= []);
  log_.push({ uid: op.uid, side: op.side, tp: g.tp, kind, len: path.len, pts });
  if (log_.length > 60) log_.shift();
  op.acted.movedDist = (op.acted.movedDist || 0) + path.len; // Lumbering Death
  if (['charge', 'fallBack', 'reposition'].includes(kind)) op.bigMoveTP = g.tp; // Brace for Counterattack
  if (kind === 'charge') op.chargedTP = g.tp; // Emboldened
  if (kind === 'charge') inspire(g, op, { zh: '衝鋒', en: 'Charge' }); // Inspiration (Celestian Insidiants; only for them)
  if (kind === 'charge' && hasGift(g, op, 'horned')) { // Horned (Chaos Cult Accursed Gift): 1 damage (D3 for a Torment) to an enemy in its control range
    const e = engagedEnemies(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    if (e) { const d = tpl(op).torment ? d3() : 1; log(g, { zh: `${opName(op, 'zh')} 角：${opName(e, 'zh')} 受到 ${d} 傷害`, en: `${opName(op, 'en')} Horned: ${opName(e, 'en')} takes ${d} damage` }, `side${op.side}`); applyDamage(g, op, e, d); }
  }
  if (kind === 'charge' && isBlade(op) && !op.acted.free?.charge) op.acted.woeLeft = Math.max(0, moveAllowance(g, op, 'charge') - path.len); // (The Woe)
  op.movedTP = (op.movedTP || 0) + path.len; // NPO movement limit per turning point
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.x = op.x; m.y = op.y; } // carried markers
  checkMines(g, op); // Mines (universal equipment)
  if (trap) scTrapFire(g, op, trap.m); // Booby Trap (Scout Squad): 2D3 damage, the action ends here
  if (kind === 'dash' && op.acted.free?.dash) op.acted.free.dash = false;
  if (kind === 'charge' && op.acted.free?.charge) op.acted.free.charge = null;
  // Proclivity for Murder: a free Charge OR Dash — using one uses up the other.
  if (['charge', 'dash'].includes(kind) && op.acted.free) { if (op.acted.free.charge === 'murder') op.acted.free.charge = null; if (op.acted.free.dash === 'murder') op.acted.free.dash = false; }
  ncMoved(g, op, kind, ncFirst); // Nemesis Claw: We Have Come For You, Poison Objective
  rtMoved(g, op, kind, ratConceal); // Ratlings: Hunter (Charge while Concealed), Ogryn Bayonet Charge
  rtAfterEnemyAction(g, op, true); // Ratlings: Early Warning (Battlemutt) and Evade (Sneak) after an enemy move
  // Sanguavitae (Goremongers): Surge is used up by this Charge / Reposition; Rake hurts an enemy at the end of a Charge.
  if ((kind === 'charge' || kind === 'reposition') && op.acted.sangArm?.surge) op.acted.sangArm.surge = false;
  if (kind === 'charge' && op.acted.sangArm?.rake) {
    op.acted.sangArm.rake = false;
    const e = engagedEnemies(g, op).filter((x) => x.side < 2).sort((a, b) => a.wounds - b.wounds)[0];
    if (e) { const d = d3(); log(g, { zh: `撕扯：${opName(e, 'zh')} 受到 ${d} 傷害`, en: `Rake: ${opName(e, 'en')} takes ${d} damage` }, `side${op.side}`); applyDamage(g, op, e, d); }
  }
  if (kind === 'charge' && !op.dead) stalwartDefence(g, op); // Stalwart Defence (Hernkyn Yaegirs)
  if (!op.dead) relentlessPursuit(g, op, movedFrom); // Relentless in Pursuit (Inquisition)
  if (op.breachMove) op.breachMove = false; // Molecular Breach used up (it was set up rather than moved)
  if (['charge', 'dash', 'fallBack', 'reposition'].includes(kind)) voltagheistField(g, op); // Calibrate Voltagheist: Field
  drakolitheSpeed(g, op, kind, movedFrom); // Preternatural Evasion (Exodite Drakolithe)
  log(g, { zh: `${opName(op, 'zh')} ${ACTIONS[kind].name.zh} ${path.len}"`, en: `${opName(op, 'en')} ${ACTIONS[kind].name.en} ${path.len}"` }, `side${op.side}`);
  // Markerlights: once per activation, a marked operative that moves loses one token.
  if (op.ml > 0 && !op.acted.mlDrop) {
    op.ml--; op.acted.mlDrop = true;
    log(g, { zh: `${opName(op, 'zh')} 移動，移除 1 個標記光標記（剩 ${op.ml}）`, en: `${opName(op, 'en')} moves and loses a Markerlight token (${op.ml} left)` }, `side${op.side}`);
  }
  // Avalanche of Muscle (Blooded Ogryn): D3 damage to one enemy in control range at the end of a Charge.
  if (kind === 'charge' && tpl(op).avalanche) {
    const e = engagedEnemies(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    if (e) {
      const dmg = d3();
      log(g, { zh: `${opName(op, 'zh')} 肌肉雪崩：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(op, 'en')} Avalanche of Muscle: ${opName(e, 'en')} takes ${dmg} damage` }, `side${op.side}`);
      applyDamage(g, op, e, dmg);
    }
  }
  // Spiked Charger (Lumberghast): D3 damage to each enemy in control range at the end of a Charge.
  if (kind === 'charge' && tpl(op).spikedCharger) {
    for (const e of engagedEnemies(g, op)) {
      const dmg = d3();
      log(g, { zh: `${opName(op, 'zh')} 尖刺衝撞：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(op, 'en')} Spiked Charger: ${opName(e, 'en')} takes ${dmg} damage` }, `side${op.side}`);
      applyDamage(g, op, e, dmg);
    }
  }
  if (kind === 'reposition') slicingAttack(g, op, seenBefore, path);
  corsairAfterAction(g, op, true);
  dwAfterAction(g, op);
  if (kind === 'fallBack') op.fellBackTP = g.tp; // (Instinctive Behaviour: Raveners)
  if (kind === 'charge') op.chargedTP = g.tp; // (Suppressive Fire: Spectre Squad)
  op.vdMovedTP = g.tp; // (Prismatic Blur: Void-dancer Troupe)
  vsMoved(g, op); // Vespid Stingwings: Neutron Charge, Airborne Predators, Neutron Fallout
  if (kind === 'charge') xvRetro(g, op); // Vectored Retro-Thrusters (XV26)
  if (isVD(op) && op.acted.vdRestOn) { op.acted.vdRestOn = false; op.acted.vdRest = 0; } // (Darting Salvo: the rest of the move is used)
  else if (kind === 'reposition' && isVD(op) && hasPloy(g, op.side, 'vdSalvo')) op.acted.vdRest = Math.max(0, moveAllowance(g, op, 'reposition') - (path?.len || 0)); // Darting Salvo
  rvAmbush(g, op, movedFrom); // Subterranean Ambush (Raveners): a Tremorscythe lunges from the tunnel
  return true;
}

export function opName(op, lang) {
  const t = tpl(op);
  const sameKind = TEAM_MAP[op.team].ops.find((o) => o.id === op.tplId).count > 1;
  const name = lang === 'zh' ? `${t.name.zh}（${t.name.en}）` : t.name.en;
  return name + (sameKind ? ` #${op.num}` : '');
}

// ---------- line of sight ----------
// Visibility is a model check; cover/obscuring use a fan of base targeting lines.
// Current terrain is flat: opaque heavy walls represent blocked head visibility.
export function visibility(g, from, to, opts = {}) {
  const v = flatSight(g.terrain, from, to, radius(from), radius(to), {
    lightObscures: to.order === 'conceal' && to.side < 2 && hasPloy(g, to.side, 'oneWithShadows'), ...opts,
  });
  const smoked = v.visible && edgeDist(from, to) > 2 && !opts.noObscure && g.smoke?.length && (inSmoke(g, to) || inSmoke(g, from));
  if (smoked) {
    v.obscured = true;
    v.defenceOptions = v.defenceOptions.map(o => ({ ...o, obscured: true }));
  }
  return xvObscure(g, from, to, aqObscure(g, from, to, rvLurkCover(g, from, to, xvStealth(g, from, to, v), opts), opts), opts); // Tunnel Lurkers (Raveners); a just-landed Aquilon is obscured
}

export function inRange(op, target, weapon, extra = 0) {
  return weapon.rules.range == null || edgeDist(op, target) <= weapon.rules.range + extra + 0.01;
}

/** Markerlight tokens that count when op shoots target with weapon (Pathfinders only, not the fusion grenade). */
export const mlLevel = (g, op, weapon, target) =>
  (TEAM_MAP[op.team].markerlights && !weapon.rules.noMarkerlight && target ? (target.ml || 0) + pfTaoBonus(g, op, target) : 0);

// Optics, Multi-dimensional Vision, Long-sight (hunting rifle) and 3+ Markerlight tokens: the target can't be obscured.
const spTvidLive = (g, op, target) => g.spTvidOn === op.uid || spTvid(g, op, target); // Tvid-feed Triangulation (Spectre Squad)
const shotVisibility = (g, op, target, weapon, extra = {}) => visibility(g, op, target, {
  noObscure: (op.archonMark?.tp === g.tp && op.archonMark.uid === target.uid) || !!op.optics || !!tpl(op).multiVision || mlLevel(g, op, weapon, target) >= 3 || adAuspexOn(op, target)
    || (!!op.longSightOn && weapon.group === 'huntingRifle') || spotOn(g, op, target)
    || spTvidLive(g, op, target) || !!tpl(op).incursor || auspexOn(g, op, target) || !!tpl(op).incorporealSight || !!weapon.rules.hypersense || dwAuspexOn(g, op, target) || (!!tpl(op).panVisor && edgeDist(op, target) <= 6), ...extra, // Multi-spectrum Array, Auspex Scan, Incorporeal Sight
});

/** Is target a valid target for op with this weapon (visible, and not a Concealed operative in cover)? */
function validTarget(g, op, target, weapon) {
  const v = shotVisibility(g, op, target, weapon);
  if ((target.mdGlyph || target.scCovert || rtShifty(g, target) || tpl(target).sneaky) && target.order === 'conceal' && visibility(g, op, target).cover && edgeDist(op, target) > 2) return null; // (Covert Position: Scout Squad)
  if (!v.visible || spCamoHidden(g, op, target) || vdElusiveHidden(g, op, target) || vsHidden(g, op, target) || !vsTargetOk(g, op, target)) return null; // (Ghost Rig / Evasive Drone; Communion: the closest enemy) // (Elusive Target: Void-dancer Troupe) // (Advanced Camouflage: Spectre Squad)
  if (weapon.rules?.psychic && isCI(target) && target.side !== op.side) return null; // (Psychic ranged weapons can't damage Insidiants)
  if (target.reserve) return null; // (an Exodite rider still in reserve isn't in the killzone)
  if (target.order === 'conceal') {
    const ml = mlLevel(g, op, weapon, target);
    const seek = weapon.rules.seek || ml >= 5 || (tpl(op).deathmark && !!target.dmk?.[op.side]); // Deathmarked
    const seekLight = weapon.rules.seekLight || ml >= 4 || (weapon.type === 'ranged' && (pechraNear(g, op.side, target) || spotOn(g, op, target) || (tpl(op).panVisor && edgeDist(op, target) <= 6)
      || ((tpl(op).incursor || (tpl(op).scSniper && op.optics)) && auspexOn(g, op, target))));
    // Nightmare Hulks (Gellerpox) can't use Light terrain for cover when targets are picked.
    const vt = seek ? shotVisibility(g, op, target, weapon, { ignoreAll: true })
      : seekLight || tpl(target).hulk || tpl(target).brute ? shotVisibility(g, op, target, weapon, { ignoreLight: true }) : v;
    // Small (Borewyrm): Concealed in cover it can't be targeted, whatever else applies.
    // Mantle of Darkness (Fellgor Shaman): within 3" of it and in cover — can't be targeted, whatever else applies.
    const sh = g.mantle?.[target.side] && getOp(g, g.mantle[target.side]);
    const mantled = sh && !sh.dead && edgeDist(sh, target) <= 3 && visibility(g, sh, target).visible;
    // Guilt Reveals Itself (Exaction Squad ploy): within 4" it can't be in cover for picking targets.
    const guilt = (TEAM_MAP[op.team].ruthless && hasPloy(g, op.side, 'guiltReveals') && edgeDist(op, target) <= 4)
      || (isIA(op) && op.side < 2 && hasPloy(g, op.side, 'intenseScrutiny') && edgeDist(op, target) <= 4); // Intense Scrutiny (Inquisition)
    // One with the Gloom (Striking Scorpion Aspect Technique): the same, until its next activation.
    // In Position (Hernkyn Yaegir ploy): Concealed in cover it can't be targeted, whatever else applies (not within 2").
    const inPos = isHY(target) && target.side < 2 && hasPloy(g, target.side, 'inPosition') && visibility(g, op, target).cover;
    if ((vt.cover && !guilt) || ((tpl(target).small || mantled || target.gloom) && v.cover)) return null;
    if (inPos) return null;
  }
  return v;
}

/** Can op shoot target with weapon? Returns {ok, cover, obscured} */
export function shootCheck(g, op, target, weapon, secondary = false) {
  if (!secondary && op.mdFocusTarget && op.mdFocusTarget !== target.uid) return { ok: false };
  // Detonate (Void-jammer): the friendly Gheistskull is always the primary target — no cover, not obscured.
  if (weapon.rules.detonate) {
    const ok = !target.dead && target.side === op.side && !!tpl(target).gheistskull && shootWeapon(g, op, weapon).ok && !isEngaged(g, op);
    return ok ? { ok: true, cover: false, obscured: false } : { ok: false };
  }
  // Explosive (Bomb Squig): no valid target is picked — the squig itself is always the primary target (no cover, not obscured).
  if (weapon.rules.wkExplosive) return target === op && shootWeapon(g, op, weapon).ok ? { ok: true, cover: false, obscured: false } : { ok: false };
  if (tpl(op).quickTrigger && isEngaged(g, op) && !inEngagement(op, target, g)) return { ok: false };
  if (target.dead || target.side === op.side) return { ok: false };
  if (weapon.rules.psychic && tpl(target).nullRodAura) return { ok: false }; // Null Rod: PSYCHIC weapons can't harm it
  if (!shootWeapon(g, op, weapon).ok) return { ok: false };
  // Magnify (Hierotek Circle): valid target, cover and obscured from another Cryptek / Apprentek.
  const relay = magnifyRelay(g, op, target, weapon);
  const v = validTarget(g, relay || op, target, weapon);
  if (!v) return { ok: false };
  // Ruthless Efficiency (Exaction Squad): friendlies in the enemy's control range don't stop it being picked.
  // Supporting Fire (Pathfinders firefight ploy): the same within 6".
  const support = (ffOn(g, op, 'supportingFire') && edgeDist(op, target) <= 6) || (ffOn(g, op, 'rtSharpshot') && isRifle(weapon)); // (Sharpshot: Ratlings)
  const stalwart = g.stalwart?.by === op.uid && g.stalwart.target === target.uid; // Stalwart Defence (Hernkyn Yaegirs)
  if (g.stalwart?.by === op.uid && !stalwart) return { ok: false };
  if (!TEAM_MAP[op.team].ruthless && !tpl(op).quickTrigger && !support && !stalwart && living(g, op.side).some((f) => inEngagement(f, target, g) && !(tpl(op).rqRuthless && tpl(f).rqRuthless))) return { ok: false }; // (Requisitioned Exaction Squad: Ruthless Efficiency among themselves)
  // Long Arm of the Emperor's Law (Exaction firefight ploy): Range +3".
  if (!inRange(op, target, weapon, ffOn(g, op, 'longArm') ? 3 : 0)) return { ok: false };
  // Markerlights: after a Markerlight this activation, Shoot must pick that same target.
  if (!secondary && !tpl(op).analyse && op.acted?.mlTarget && op.acted.mlTarget !== target.uid) return { ok: false };
  return { ok: true, cover: v.cover, obscured: v.obscured, defenceOptions: v.defenceOptions, relay: relay?.uid ?? null };
}

// ---------- dice ----------
export function effectiveRules(g, op, weapon, target) {
  const r = { ...weapon.rules };
  mdRules(g, op, weapon, target, r);
  mwRules(g, op, weapon, target, r);
  wkRules(g, op, weapon, target, r); // Wrecka Krew: Destruction
  ncRules(g, op, weapon, target, r); // Nemesis Claw: Black Hunt, Cruel Tormenter, Appetite, Flayed Skin, Grisly Trophy
  scRules(g, op, weapon, target, r); // Scout Squad: Trip Alarm, Track Enemy, Designate Target, Ambush, Grapnel Assault
  rtRules(g, op, weapon, target, r); // Ratlings: Target Designation, Crack Shots, Sniper Positions, Frontline Assault, Hunter, Optics
  sfRules(g, op, weapon, target, r); // Sanctifiers: Doused, Spread the Word, Fervent Brawl, Zealous Persecution
  vdRules(g, op, weapon, target, r); // Void-dancer Troupe: Accolade, Shrieker Toxin Rounds
  xvRules(g, op, weapon, target, r); // XV26 Stealth Battlesuits: Kauyon, Markerlight, Focused Markerlight, Prepare Ambush, Patient Hunters
  vsRules(g, op, weapon, target, r); // Vespid Stingwings: Neutron Charge, Airborne Predators, Warrior Instincts, Aerial Guidance
  aqRules(g, op, weapon, target, r); // Tempestus Aquilons: Sudden Offensive, Maintain Momentum, Drop and Secure
  spRules(g, op, weapon, target, r); // Spectre Squad: Ambushing Volley, Hidden Engagement, Weapon Assist, Suppressive Fire
  rvRules(g, op, weapon, target, r); // Raveners: Instinctive Behaviour, Death From Below, Distend Dorsal Sac
  pfRules(g, op, weapon, target, r); // Pathfinders: Pulse Accelerator
  pmRules(g, op, weapon, target, r); // Plague Marines: Plague Rounds
  kfRules(g, op, weapon, target, r); // Farstalker Kinband: Piercing Shot, Toxin Shot
  if (target && ffOn(g, op, 'sfArdent')) r.relentless = true; // Ardent Eradication
  if (target && isSC(op) && ffOn(g, op, 'scEmboldened') && scEmbOk(g, op, target)) r.promote = 1; // Emboldened Aspirant: a normal success is retained as a critical one
  if (target && ffOn(g, op, 'wkKaboom') && g.shotTargets?.[0] === target.uid) r.severe = true; // Kaboom!: Severe against the primary target
  if (weapon.type === 'melee') {
    if (hasPloy(g, op.side, 'docAssault')) r.balanced = true;
    if (hasPloy(g, op.side, 'waaagh')) r.balanced = true;
    if (hasTactic(g, op, 'aggressive')) r.rending = true;
  } else {
    if (hasPloy(g, op.side, 'dakkaDakka')) r.punishing = true;
    if (target && hasPloy(g, op.side, edgeDist(op, target) > 6 ? 'docDevastator' : 'docTactical')) r.balanced = true;
    const ml = mlLevel(g, op, weapon, target);
    if (ml >= 1) { r.saturate = true; r.balanced = true; }
    if (ml >= 2) r.mlHit = true; // Hit improved by 1, to a maximum of 3+
    if (ml >= 4) r.seekLight = true;
    if (ml >= 5) r.seek = true;
    // Bonded: a non-drone within 3" of another friendly non-drone has Accurate 1.
    if (hasPloy(g, op.side, 'bonded') && !isDrone(op) && living(g, op.side).some((o) => o !== op && !isDrone(o) && edgeDist(op, o) <= 3)) {
      r.accurate = Math.max(r.accurate || 0, 1);
    }
    if (hasTactic(g, op, 'siege')) r.saturate = true;
    if (hasTactic(g, op, 'sharpshooter') && isBoltWeapon(weapon) && !MOVE_ACTIONS.some((k) => count(op, k))) {
      r.accurate = Math.max(r.accurate || 0, 1); r.severe = true;
    }
  }
  // Lumbering Death: retaliating, or shooting/fighting after moving no more than 3" this activation.
  if (hasPloy(g, op.side, 'lumbering') && (g.active !== op.uid || (op.acted?.movedDist || 0) <= 3)) r.ceaseless = true;
  // ---- Farstalker Kinband ----
  // Call the Kill (Balanced) / Bring it Down! (Death Korps: Punishing) against the marked enemy.
  if (target && g.mark?.[op.side] === target.uid) { if (TEAM_MAP[op.team].bringItDown) r.punishing = true; else r.balanced = true; }
  // ---- Death Korps ----
  const order = guardOrder(g, op), allOrders = !!op.gOrder?.all && op.gOrder.tp === g.tp;
  if ((order === 'takeAim' || allOrders) && weapon.type === 'ranged' && !weapon.rules.noOrders) r.ceaseless = true;
  if ((order === 'fixBayonets' || allOrders) && weapon.type === 'melee') r.ceaseless = true;
  // Uplifting Primer: within 3" of the Zealot, weapons have Severe.
  if (living(g, op.side).some((z) => tpl(z).uplifting && sameTeam(z, op) && edgeDist(z, op) <= 3)) r.severe = true;
  if (weapon.type === 'ranged' && hasPloy(g, op.side, 'siegeWarfare')) { r.saturate = true; r.accurate = Math.max(r.accurate || 0, 1); }
  if (weapon.type === 'melee' && hasPloy(g, op.side, 'clearTheLine')) {
    r.accurate = Math.max(r.accurate || 0, 1);
    if (g.active !== op.uid || whollyInOwnTerritory(g, op)) r.severe = true; // retaliating, or wholly in your territory
  }
  if (weapon.type === 'ranged' && spotOn(g, op, target)) r.seekLight = true; // Spot
  // ---- Fellgor Ravagers ----
  if (weapon.rules.viciousBlows && g.active === op.uid) r.ceaseless = true; // Vicious Blows (fighting, not retaliating)
  if (weapon.type === 'ranged' && target && TEAM_MAP[op.team].frenzy && hasPloy(g, op.side, 'peltingFire') && target.shotBy?.tp === g.tp) {
    const others = new Set(target.shotBy.uids.filter((u) => u !== op.uid && getOp(g, u)?.side === op.side)).size;
    if (others >= 2) r.relentless = true; else if (others === 1) r.ceaseless = true; // Pelting Firepower
  }
  // ---- Blooded ----
  if (op.bloodToken) { r.accurate = Math.max(r.accurate || 0, 1); if (underGaze(g, op)) r.gaze = true; } // Blooded token / Gaze of the Gods
  else if (tpl(op).leadWithStrength && underGaze(g, op)) r.gaze = true;
  if (TEAM_MAP[op.team].bloodedTokens && hasPloy(g, op.side, 'recklessAspirant') && whollyIn(g, op, 1 - op.side)) {
    if (op.bloodToken) r.punishing = true; else r.accurate = Math.max(r.accurate || 0, 1);
  }
  const gk = g.gloryKill?.[op.side];
  if (target && gk?.tp === g.tp && gk.uid === target.uid) { if (op.bloodToken) r.relentless = true; else r.ceaseless = true; } // Glory Kill
  if (weapon.type === 'melee' && op.stimms?.enraged) r.relentless = true; // Enraged stimm
  if (weapon.rules.stalk && g.terrain.some((t) => distPointRect(op, t) - radius(op) <= CONTROL)) r.lethal = Math.min(r.lethal || 6, 5); // Stalk
  // ---- Wyrmblade ----
  if (TEAM_MAP[op.team].cultAmbush && g.active === op.uid) {
    const sprung = op.prevOrder === 'conceal' && op.order === 'engage'; // Conceal → Engage at the start of the activation
    if (sprung || op.acted?.unseen) r.ceaseless = true; // Cult Ambush
    if (sprung && hasPloy(g, op.side, 'dayAtHand')) { if (weapon.type === 'ranged') r.rending = true; else r.atkPlus = 1; } // The Day Is at Hand
  }
  if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'crossfire') && target.shotBy?.tp === g.tp && target.shotBy.uids.some((u) => u !== op.uid && getOp(g, u)?.side === op.side)) r.accurate = Math.max(r.accurate || 0, 1); // Crossfire
  if (tpl(op).bipod && weapon.type === 'ranged' && (op.counter || !op.acted?.movedDist)) { if (r.ceaseless) r.relentless = true; else r.ceaseless = true; } // Heavy Weapon Bipod
  if (tpl(op).neophyte && living(g, op.side).some((k) => tpl(k).heroic && k.killTP === g.tp && edgeDist(k, op) <= 3 && visibility(g, k, op).visible)) r.severe = true; // Heroic Inspiration
  // ---- Warpcoven ----
  if (weapon.type === 'ranged' && tpl(op).incorporealSight) r.saturate = true; // Incorporeal Sight
  if (weapon.type === 'ranged' && tpl(op).slowPurposeful && (op.counter || !['charge', 'reposition'].some((k) => count(op, k)))) r.ceaseless = true; // Slow and Purposeful
  if (target && psyOn(g, 'alight', op.side, target) && TEAM_MAP[op.team].anyAstartesShot) r.ceaseless = true; // Alight
  if (target && psyOn(g, 'ravage', 1 - op.side, op)) r.reroll6 = true; // Ravage Destiny: must re-roll attack dice results of 6
  if (target && hasPloy(g, target.side, 'aetherialWarding') && r.piercing === 1) { delete r.piercing; r.piercingCrits = Math.max(r.piercingCrits || 0, 1); }
  if (weapon.type === 'melee' && tpl(op).tzaangor && hasPloy(g, op.side, 'savageHerd')) {
    r.accurate = Math.max(r.accurate || 0, 1);
    const assisted = target && living(g, op.side).some((f) => f !== op && edgeDist(f, target) <= CONTROL + 0.01);
    if (assisted || living(g, op.side).some((s) => tpl(s).sorcerer && edgeDist(s, op) <= 6 && visibility(g, s, op).visible)) r.severe = true;
  }
  if (weapon.rules.psychic && tpl(op).sorcerer && hasPloy(g, op.side, 'brotherhood')) { if (sorcererNear(g, op, 9)) r.ceaseless = true; else r.balanced = true; }
  // ---- Phobos Strike Team ----
  if (weapon.type === 'melee' && hasPloy(g, op.side, 'lethalAssaults')) { r.balanced = true; if (count(op, 'charge')) r.lethal = Math.min(r.lethal || 6, 5); }
  if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'deadlyShots')
    && (!['charge', 'fallBack', 'reposition'].some((k) => count(op, k)) || (edgeDist(op, target) > 6 && !shotVisibility(g, op, target, weapon).cover))) r.balanced = true;
  if (weapon.type === 'ranged' && (tpl(op).incursor || (tpl(op).scSniper && op.optics)) && auspexOn(g, op, target)) r.seekLight = true; // Auspex Scan (a Scout Sniper with Optics too)
  // ---- Imperial Navy Breachers ----
  if (navyOrderNear(g, op, 'attack')) r.ceaseless = true; // Attack Order
  if (target && hasPloy(g, op.side, 'closeAssault') && edgeDist(op, target) <= 3) r.closeAssault = true; // Close Assault
  // ---- Hearthkyn Salvagers ----
  if (target && TEAM_MAP[op.team].grudges && target.grudge?.[op.side]) r.grudge = target.grudge[op.side]; // Grudge tokens
  if (weapon.rules.forceImpact && count(op, 'charge')) r.brutal = true; // Force Impact
  if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'proximateFire') && edgeDist(op, target) <= 6) r.mlHit = true; // Hit +1 to 3+
  const tac = g.tactician?.[op.side];
  if (target && tac?.tp === g.tp && tac.kind === 'attack' && dist(tac, target) - radius(target) <= 3) r.balanced = true; // Attack marker
  const pan = g.pan?.[op.side];
  if (weapon.type === 'ranged' && target && pan && dist(pan, target) - radius(target) <= 3) { r.accurate = Math.max(r.accurate || 0, 1); r.saturate = true; } // Pan Spectral Scan
  if (op.shriek) r.balanced = true; // Victory Shriek
  if (weapon.type === 'melee' && hasPloy(g, op.side, 'cutThroats')) r.atkPlus = 1;
  if (weapon.type === 'ranged' && hasPloy(g, op.side, 'prey') && !['charge', 'fallBack', 'reposition'].some((k) => count(op, k))) {
    if (r.balanced) r.ceaseless = true; else r.balanced = true;
    r.severe = true;
  }
  if (weapon.group === 'bow' && op.energised === g.tp) r.lethal = Math.min(r.lethal || 6, 5); // Energise
  if (op.longSightOn && (weapon.id === 'huntingConcealed' || weapon.id === 'huntingStationary')) r.lethal = Math.min(r.lethal || 6, 5);
  // ---- Exaction Squad ----
  if (op.optics && (weapon.id === 'execConcealed' || weapon.id === 'execStationary')) r.lethal = Math.min(r.lethal || 6, 5); // Optics (Marksman)
  if (veriscantOn(g, op, target)) { r.lethal = Math.min(r.lethal || 6, 5); r.severe = true; } // Veriscant
  if (TEAM_MAP[op.team].ruthless) {
    // Dispense Justice: fighting without having moved more than its Move this activation, or retaliating / counteracting.
    if (weapon.type === 'melee' && hasPloy(g, op.side, 'dispenseJustice') && (g.active !== op.uid || op.counter || (op.acted?.movedDist || 0) <= moveStat(g, op))) r.ceaseless = true;
    if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'terminalDecree') && edgeDist(op, target) <= 6) r.balanced = true; // Terminal Decree
  }
  if (tpl(op).aggressivePattern && weapon.type === 'melee') r.relentless = true; // Attack Pattern: Aggressive
  // ---- Exodite Dragon Masters ----
  if (isEDM(op) && op.side < 2) {
    const spd = speedOf(g, op);
    if (weapon.type === 'melee' && hasPloy(g, op.side, 'draconicFury')) { if (spd >= 7) r.ceaseless = true; else if (spd >= 4) r.balanced = true; } // Draconic Fury
    if (weapon.type === 'ranged' && spd >= 4 && hasPloy(g, op.side, 'windSwift')) r.balanced = true; // Wind-Swift Precision
    if (weapon.type === 'melee' && target && ffOn(g, op, 'feralHunger')) r.relentless = true; // Feral Hunger
  }
  // ---- Inquisitorial Agents ----
  if (target && target.side < 2 && op.side < 2) {
    if (isIA(op) && tomeNear(g, op.side, 'denunciation', target)) { r.atkPlus = (r.atkPlus || 0) + 1; r.atkMax = Math.max(r.atkMax || 0, 99); } // Denunciation
    if (isIA(target) && tomeNear(g, target.side, 'sanctification', target)) r.atkMinus = (r.atkMinus || 0) + 1; // Sanctification
    if (isIA(op) && quarryOf(g, op.side) === target) r.ceaseless = true; // Quarry
    if (tpl(op).cruel && target.wounds < target.maxW) r.relentless = true; // Cruel (Penal Legionnaire)
  }
  if (hexorcised(g, op)) { delete r.balanced; delete r.ceaseless; delete r.relentless; } // Hexorcise: no re-rolls
  // ---- Hernkyn Yaegirs ----
  if (isHY(op) && op.side < 2) {
    // Masterful Bladework: fighting, or retaliating with a Conceal order — +1 Atk (max 4) and Balanced (Ceaseless if it has Balanced).
    if (weapon.type === 'melee' && hasPloy(g, op.side, 'masterfulBladework') && (g.active === op.uid || op.order === 'conceal')) {
      r.atkPlus = (r.atkPlus || 0) + 1; r.atkMax = 4; if (r.balanced) r.ceaseless = true; else r.balanced = true;
    }
    if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'hiddenEngagement') && visibility(g, target, op).cover) r.balanced = true; // Hidden Engagement
    if (target && tpl(op).hyTracker && !target.ready && edgeDist(op, target) <= 6) r.punishing = true; // Tracker: an expended target within 6"
    if (weapon.type === 'ranged' && target && tpl(op).panVisor && edgeDist(op, target) <= 6) r.seekLight = true; // Pan Spectral Visor
  }
  // ---- Goremongers ----
  if (isGM(op) && op.side < 2) {
    if (weapon.type === 'melee' && hasPloy(g, op.side, 'enhancedViolence')) { if (goreOf(op) === 2) r.relentless = true; else if (goreOf(op) === 1) r.balanced = true; } // Enhanced Violence
    if (weapon.type === 'melee' && ffOn(g, op, 'unbridledAggression')) r.severe = true; // Unbridled Aggression
    if (weapon.group === 'gmSkewer' && op.goreFuelOn) r.severe = true; // Gore-fuel
  }
  // ---- Elucidian Starstriders ----
  if (isES(op) && op.side < 2) {
    const bal = () => { if (r.balanced) r.ceaseless = true; else r.balanced = true; }; // (Balanced, or Ceaseless if it already has it)
    if (tpl(op).merciless && target && target.wounds < target.maxW) bal(); // Merciless (Vhane)
    if (weapon.type === 'ranged' && !weapon.rules.supportAsset) {
      if (tpl(op).navis && living(g, op.side).some((v) => v !== op && tpl(v).esDisciplinarian && edgeDist(v, op) <= 3)) bal(); // Disciplinarian (Voidmaster)
      if (target && edgeDist(op, target) <= 6 && hasPloy(g, op.side, 'lethalProximity')) r.balanced = true; // Lethal Proximity
      if (target && ffOn(g, op, 'combinedArms')) r.relentless = true; // Combined Arms
    }
    if (weapon.id === 'esVoltaic' && g.calib?.[op.side]?.by === op.uid && g.calib[op.side].mode === 'charge') r.lethal = Math.min(r.lethal || 6, 4); // Calibrate Voltagheist: Charge
  }
  // ---- Chaos Cult ----
  if (isCult(op) && op.side < 2 && weapon.type === 'melee') {
    if (hasPloy(g, op.side, 'ferventOnslaught')) r.accurate = Math.max(r.accurate || 0, isWarped(op) ? 2 : 1); // Fervent Onslaught
    if (hasGift(g, op, 'sinewed')) r.brutal = true; // Sinewed
  }
  // ---- Celestian Insidiants ----
  if (isCI(op) && op.side < 2) {
    if (!weapon.rules.equipGrenade && op.inspiring) r.severe = true; // Inspiration
    if (!weapon.rules.equipGrenade && op.wrath) r.ceaseless = true; // Wrath (Benediction)
    if (weapon.rules.antiPsykerL && target && isPsyker(target)) r.lethal = Math.min(r.lethal || 6, 5); // Anti-PSYKER
    if (target && op.wounds < op.maxW && hasPloy(g, op.side, 'sufferingSacrifice')) r.balanced = true; // Suffering & Sacrifice
    if (target?.suspect?.[op.side] === g.tp) r.punishing = true; // Suspect & Eliminate
    if (target && ffOn(g, op, 'ferventHate') && !IMPERIUM_TEAMS.has(target.team)) { if (CHAOS_TEAMS.has(target.team) || isPsyker(target)) r.relentless = true; else r.ceaseless = true; } // Fervent Hate
    // Zealous Ultimatum accepted: +1 Atk for the broadsword against that enemy, and +1 for good once it's slain (max 5).
    const ult = g.ultimatum?.[op.side];
    if (tpl(op).ultimatum && weapon.type === 'melee') {
      const plus = (ult?.accepted && ult.by === op.uid && target?.uid === ult.uid ? 1 : 0) + (op.ultBonus || 0);
      if (plus) { r.atkPlus = (r.atkPlus || 0) + plus; r.atkMax = 5; }
    }
  }
  // Weapons of the Witch Hunters: within 3" of an Insidiant, Psychic melee weapons have no weapon rules.
  if (weapon.type === 'melee' && weapon.rules.psychic && witchHunted(g, op)) return {};
  // ---- Canoptek Circle ----
  if (isCC(op) && op.side < 2) {
    if (!weapon.rules.equipGrenade && inMatrix(g, op.side, op)) r.accurate = Math.max(r.accurate || 0, 1); // Obelisk Node Matrix
    if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'transdynamic') && (inMatrix(g, op.side, target) || matrixBetween(g, op.side, op, target))) r.ceaseless = true; // Transdynamic Amplification
  }
  // ---- Blades of Khaine ----
  if (isBlade(op)) {
    // Defence Tactics (Dire Avengers): contesting an objective, or shooting an enemy that does — Balanced.
    if (tpl(op).defenceTactics && (contesting2(g, op) || (weapon.type === 'ranged' && target && contesting2(g, target)))) r.balanced = true;
    if (weapon.type === 'melee' && target?.ready && hasPloy(g, op.side, 'ruthlessPoise')) r.ceaseless = true; // Ruthless Poise
    if (weapon.type === 'ranged' && target && !target.ready && hasPloy(g, op.side, 'khainesVengeance')) r.ceaseless = true; // Khaine's Vengeance
    if (ffOn(g, op, 'avVigilance')) r.lethal = Math.min(r.lethal || 6, 5); // Vigilance of the Avenger
    if (ffOn(g, op, 'ssEye')) r.seekLight = true; // Scorpion's Eye
    if (ffOn(g, op, 'ssMerciless')) r.shock = true; // Merciless Strikes (Shock only ever applies from the first critical strike)
  }
  // ---- Battleclade ----
  if (TEAM_MAP[op.team].noosphericNetwork) {
    if (weapon.type === 'ranged' && achillan(g, op, target)) r.saturate = true; // Achillan Eye
    if (target?.omni?.[op.side]) r.ceaseless = true; // Omniscanner token
    if (isServitor(op) && hasPloy(g, op.side, 'noosphericPossession') && nearRelay(g, op)) r.accurate = Math.max(r.accurate || 0, 1); // Noospheric Possession
    const acq = g.acquisition?.[op.side];
    if (weapon.type === 'melee' && acq?.tp === g.tp && dist(op, acq) - radius(op) <= 3) { r.atkPlus = 1; r.atkMax = 4; } // Prioritised Acquisition
  }
  // ---- Novitiates ----
  if (weapon.rules.antiPsyker && target && isPsyker(target)) { r.lethal = Math.min(r.lethal || 6, 5); r.antiPsykerOn = true; } // Anti-PSYKER (+1 Dmg too)
  if (target && TEAM_MAP[op.team].actsOfFaith && hasPloy(g, op.side, 'ardentVengeance') && !target.ready) r.punishing = true; // Ardent Vengeance
  if (hymnal(g, op)) r.severe = true; // Glorious Hymnal
  if (weapon.rules.zealousRage && g.active === op.uid) r.ceaseless = true; // Zealous Rage (fighting, not retaliating)
  if (weapon.type === 'ranged' && target && ffOn(g, op, 'guidedByFaith') && edgeDist(op, target) <= 6) r.seekLight = true; // Guided by Faith
  if (broadcastNear(g, op)) { delete r.balanced; delete r.ceaseless; delete r.relentless; } // Auto-broadcaster: no attack re-rolls
  // ---- Kasrkin ----
  if (weapon.type === 'ranged' && skillOn(g, op, 'lightEmUp')) r.severe = true; // Light 'Em Up
  if (weapon.type === 'melee' && skillOn(g, op, 'forCadia')) { r.atkPlus = 1; r.atkMax = 4; } // For Cadia!
  if (weapon.type === 'ranged' && sweepOn(g, op, target)) r.ceaseless = true; // Clearance Sweep
  if (TEAM_MAP[op.team].skillAtArms && target && /hot-shot/i.test(weapon.name.en) && (hasPloy(g, op.side, 'eliminationPattern') || ffOn(g, op, 'neutraliseTarget'))) {
    const exposed = auspexOn(g, op, target) || !shotVisibility(g, op, target, weapon).cover || r.saturate;
    if (exposed && hasPloy(g, op.side, 'eliminationPattern')) { if (/volley/i.test(weapon.name.en)) r.piercing = Math.max(r.piercing || 0, 1); else r.piercingCrits = Math.max(r.piercingCrits || 0, 1); } // Elimination Pattern
  }
  if (ffOn(g, op, 'neutraliseTarget')) r.relentless = true; // Neutralise Target: re-roll any attack dice
  // ---- Legionaries ----
  const mk = markOf(op);
  if ((mk === 'khorne' && weapon.type === 'melee') || (mk === 'tzeentch' && weapon.type === 'ranged')) r.severe = true; // Wrathful Onslaught / Empyreal Guidance
  if (mk === 'undivided' && target && edgeDist(op, target) <= 6) r.ceaseless = true; // Vicious Reavers
  if (op.unleashed && weapon.id === 'daemonicClaw') { r.ceaseless = true; r.lethal = Math.min(r.lethal || 6, 5); } // Unleash Daemon
  if (weapon.type === 'ranged' && target && TEAM_MAP[op.team].marksOfChaos && hasPloy(g, op.side, 'fickleFates') && target.ready) { if (r.balanced) r.relentless = true; else r.balanced = true; } // Fickle Fates
  if (weapon.type === 'ranged' && target && ffOn(g, op, 'malignantAura') && edgeDist(op, target) <= 3) r.piercing = Math.max(r.piercing || 0, 1); // Malignant Aura
  if (target && TEAM_MAP[target.team]?.marksOfChaos && hasPloy(g, target.side, 'implacable') && r.piercing === 1) { delete r.piercing; r.piercingCrits = Math.max(r.piercingCrits || 0, 1); } // Implacable
  // ---- Universal equipment ----
  if (weapon.type === 'ranged' && op.ammoTP === g.tp && !weapon.rules.equipGrenade) r.balanced = true; // Ammo Cache: re-roll one attack die
  if (target && g.ccPhase === target.uid) { if (r.piercing) r.piercing = Math.max(0, r.piercing - 1); if (r.piercing === 0) delete r.piercing; }
  if (target && g.smoke?.length && inSmoke(g, target) && edgeDist(op, target) > 2) { if (r.piercing === 2) r.piercing = 1; if (r.piercingCrits === 2) r.piercingCrits = 1; } // smoke
  // ---- Firefight ploys ----
  if (ffOn(g, op, 'combinedArms') || ffOn(g, op, 'engageToAcquire')) r.relentless = true; // re-roll any attack dice
  if (ffOn(g, op, 'shockAssault') && weapon.type === 'melee') r.shock = true;
  if (ffOn(g, op, 'blitz')) { r.accurate = Math.max(r.accurate || 0, 1); if ((g.actCount?.[op.side] || 0) <= 1) r.severe = true; }
  if (ffOn(g, op, 'coiledSerpent')) r.promote = 1;
  if (weapon.type === 'ranged' && op.omniTP === g.tp && doctrina(g, op)?.mode === 'protector') r.severe = true; // Omnissiah's Imperative
  if (target && g.vengeance?.[op.side] === target.uid) r.relentless = true; // Vengeance for the Kinband
  // ---- Hunter Clade ----
  if ((weapon.type === 'ranged' && optimised(g, op, 'protector')) || (weapon.type === 'melee' && optimised(g, op, 'conqueror'))) r.ceaseless = true; // Doctrina Imperatives
  // Targeting Protocol (Rangers): Lethal 5+ if it hasn't moved this activation, or counteracting.
  if (tpl(op).targetingProtocol && weapon.type === 'ranged' && (op.counter || g.active !== op.uid || !moved(op))) r.lethal = Math.min(r.lethal || 6, 5);
  // ---- Hierotek Circle ----
  if (weapon.rules.magnify && g.magnifyNow === op.uid) r.ceaseless = true; // Magnify
  if (weapon.type === 'ranged' && target && tpl(op).deathmark && target.dmk?.[op.side]) r.seek = true; // Deathmarked
  const aug = g.augment?.[op.side];
  if (aug && aug.t === op.uid && aug.w === weapon.id) for (const k of aug.rules) { if (k === 'lethal') r.lethal = Math.min(r.lethal || 6, 5); else r[k] = true; } // Augment Weapon
  if (isHierotek(op)) {
    if (weapon.type === 'ranged' && target && hasPloy(g, op.side, 'relentlessOnslaught') && edgeDist(op, target) <= 8) r.balanced = true; // Relentless Onslaught
    if (weapon.type === 'melee' && hasPloy(g, op.side, 'methodicalElim')) { // Methodical Elimination
      const still = g.active !== op.uid || op.counter || (op.acted?.movedDist || 0) <= moveStat(g, op);
      r.accurate = Math.max(r.accurate || 0, still ? 2 : 1);
    }
  }
  if (tpl(op).coldBlooded && target && target.wounds < target.maxW) {
    // Cold-blooded: against a wounded enemy Lethal 5+; injured as well: also Rending.
    r.lethal = Math.min(r.lethal || 6, 5);
    if (isInjured(target)) r.rending = true;
  }
  if (weapon.type === 'ranged' && pechraNear(g, op.side, target)) r.seekLight = true; // Marked for the Hunt
  archonRules(g, op, weapon, target, r);
  corsairRules(g, op, weapon, target, r);
  dwRules(g, op, weapon, target, r);
  // Sickening Emissions (Decaying Generatorium): no re-rolls for a player operative near an objective marker.
  // Voxbreak (Phobos): no re-rolls within 6" of the Voxbreaker.
  if ((mission(g).noRerollNearObjective && op.side !== NPO && g.objectives.some((o) => inMarkerRange(op, o))) || voxbroken(g, op) || neurostatic(g, op) || ncScreeched(g, op)) { // (Neurostatic Interference: Hunter Clade; Screecher: Nemesis Claw)
    delete r.balanced; delete r.ceaseless; delete r.relentless;
  }
  if (target && tpl(target).wkArmouredUp) { delete r.lethal; delete r.rending; delete r.severe; delete r.promote; delete r.grudge; } // Armoured Up (Krusha): only 6s are crits against it
  return r;
}

// ---------- Gellerpox Infected ----------
/**
 * Is this operative within the infection range of an enemy Gellerpox Techno-curse? Barrelwarp: 2" (3" of a
 * Glitchling); Viral Vox-static: 3" (4" of a Glitchling); Screaming Rustspikes: control range.
 */
export function cursed(g, op, curse) {
  const [r, rg] = { barrelwarp: [2, 3], voxStatic: [3, 4], rustspikes: [CONTROL, CONTROL] }[curse];
  return [0, 1].some((s) => s !== op.side && TEAM_MAP[g.teams[s]].tacticSlots === 1 && g.tactics?.[s]?.[0] === curse
    && living(g, s).some((o) => edgeDist(o, op) <= (tpl(o).glitchling ? rg : r) + 0.01));
}

/** Horrifying Shrieking (Fleshscreamer) / Terror (Phobos Reivers): an enemy within 3" of one. */
const shrieked = (g, op) => foes(g, op).some((o) => (tpl(o).shrieking || tpl(o).terror) && edgeDist(o, op) <= 3);

/** Blessings of Infection (fight dice): 3+ fails → one becomes a normal success; else 3+ successes → discard a fail, a normal becomes a crit. */
function blessings(pool) {
  const fails = pool.dice.filter((d) => d.res === 'miss');
  if (fails.length >= 3) { fails[0].res = 'norm'; fails[0].indo = true; pool.norms++; return; }
  const norm = pool.dice.find((d) => d.res === 'norm');
  if (pool.crits + pool.norms >= 3 && fails.length && norm) { norm.res = 'crit'; norm.rend = true; pool.norms--; pool.crits++; }
}

// ---------- Blooded ----------
const isBloodedTeam = (g, side) => side < 2 && !!TEAM_MAP[g.teams[side]]?.bloodedTokens;
function gainBlood(g, side, why) {
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
const underGaze = (g, op) => (g.gaze?.[op.side]?.tp === g.tp && g.gaze[op.side].uid === op.uid)
  || (tpl(op).leadWithStrength && (op.bloodToken || whollyIn(g, op, 1 - op.side)));
/** The operative's base is wholly within that side's territory. */
function whollyIn(g, op, side) {
  const along = g.axis === 'y' ? 'y' : 'x', r = radius(op);
  return [-r, r].every((d) => territoryOf(g, { ...op, [along]: op[along] + d }) === side);
}
/** Gruelling Disciplinarian (Enforcer): friendlies within 6" ignore the stat changes from being injured. */
const disciplined = (g, op) => op.side < 2 && living(g, op.side).some((e) => tpl(e).disciplinarian && edgeDist(e, op) <= 6);
/** Glory Kill (ploy): the enemy picked for this turning point. */
export function setGloryKill(g, side, enemy) {
  if (!enemy || !g.ploys[side].includes('gloryKill')) return;
  (g.gloryKill ||= [null, null])[side] = { uid: enemy.uid, tp: g.tp };
  log(g, { zh: `榮耀擊殺目標：${opName(enemy, 'zh')}`, en: `Glory Kill target: ${opName(enemy, 'en')}` }, `side${side}`);
}

/** Blooded tokens gained from deaths, Explosive Demise and Bitter Demise. */
function bloodedOnDeath(g, dead) {
  dead.hadToken = !!dead.bloodToken;
  gains: {
    const t = (g.bloodTP ||= [{}, {}]);
    for (const s of [0, 1]) if (t[s].tp !== g.tp) t[s] = { tp: g.tp };
    // The first enemy incapacitated each TP.
    const foe = 1 - dead.side;
    if (dead.side < 2 && isBloodedTeam(g, foe) && !t[foe].enemy) { t[foe].enemy = true; gainBlood(g, foe, { zh: '本回合第一次使敵人殘廢', en: 'first enemy down this TP' }); }
    if (!isBloodedTeam(g, dead.side)) break gains;
    dead.bloodToken = false;
    // The first friendly incapacitated within 6" of an enemy each TP.
    if (!t[dead.side].friend && foes(g, dead).some((e) => edgeDist(e, dead) <= 6)) { t[dead.side].friend = true; gainBlood(g, dead.side, { zh: '本回合第一次友方在敵人附近殘廢', en: 'first friendly down near the enemy this TP' }); }
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
function giveStimm(g, op, kind) {
  (op.stimms ||= {})[kind] = true;
  if (kind === 'rejuvenated') op.wounds = Math.min(op.maxW, op.wounds + d3() + d3());
}

// ---------- Warpcoven ----------
/** A psychic effect (Protected by Fate, Ravage Destiny, Alight) one side has on an operative: {by, uid}. */
const psy = (g, key, side) => g[key]?.[side] || null;
const psyOn = (g, key, side, op) => { const p = psy(g, key, side); return !!(p && op && p.uid === op.uid && !getOp(g, p.by)?.dead); };
/** Mindburn: the target's weapons' Hit is worsened by 1 (not cumulative with injured). */
const mindburned = (g, op) => [0, 1].some((s) => s !== op.side && g.mindburn?.[s] === op.uid);
// Apprehend (Cyber-mastiff) worsens it the same way. Engendered Focus (Castigator) ignores it all;
// Stubborn Subjugator (Subductor) ignores it for melee weapons.
const hitWorse = (g, op, w = null) => !op.acted?.emperorsWill && !w?.rules.fixedHit && !tpl(op).engenderedFocus && !(w?.type === 'melee' && tpl(op).stubbornSubjugator)
  && ((statPenalty(g, op) && !(op.acted?.ancestors && injuredPenalty(g, op) && !contagion(g, op)) && !cultIgnoresInjury(g, op, w) && !op.xvBondHit) || mindburned(g, op) || apprehended(g, op) || radSaturated(g, op) || doctrinaHit(g, op, w)
    || nullFielded(g, op) || nightmareNear(g, op, 'sickeningAura')); // Null Field (Censor), Sickening Aura (Chaos Cult)

// ---------- Exaction Squad ----------
/** Nuncio-aquila: an enemy within 3" of the Proctor-exactant (it carries the marker in this version). */
const nuncioNear = (g, op) => op.side < 2 && living(g, 1 - op.side).some((p) => tpl(p).nuncio && edgeDist(p, op) <= 3);
/** Scrapcode Overload (Hunter Clade firefight ploy): an enemy within 3" of that Infiltrator (marker control only). */
const scrapNear = (g, op) => op.side < 2 && living(g, 1 - op.side).some((p) => g.scrapcode?.[p.side] === p.uid && edgeDist(p, op) <= 3);
/** Apprehend: the Cyber-mastiff holds this enemy while it stays within its control range. */
const apprehended = (g, op) => op.side < 2 && living(g, 1 - op.side).some((m) => m.apprehend === op.uid && edgeDist(m, op) <= CONTROL + 0.01);
/** Apprehend / Castigator's Arrest (the only enemy in the Castigator's control range): can't Fall Back. */
export const arrested = (g, op) => apprehended(g, op)
  || (op.side < 2 && living(g, 1 - op.side).some((c) => tpl(c).arrest && edgeDist(c, op) <= CONTROL + 0.01 && engagedEnemies(g, c).length === 1));
/** Veriscant: friendly weapons have Lethal 5+ and Severe against this enemy until the Malocator's next activation. */
// ---------- Hierotek Circle ----------
const isHierotek = (op) => !!TEAM_MAP[op.team].reanimation;
/** Living Metal: in the Ready step, each friendly regains up to D3+1 wounds. */
function livingMetal(g, side) {
  if (!TEAM_MAP[g.teams[side]].livingMetal) return;
  for (const o of living(g, side).filter((x) => isHierotek(x) && x.wounds < x.maxW)) {
    const before = o.wounds;
    o.wounds = Math.min(o.maxW, o.wounds + d3() + 1);
    log(g, { zh: `${opName(o, 'zh')} 活體金屬：回復 ${o.wounds - before} 生命`, en: `${opName(o, 'en')} Living Metal: regains ${o.wounds - before} wounds` }, `side${side}`);
  }
}
/** Reanimation markers of a side whose operative can still come back. */
export const reanimMarkers = (g, side) => (g.reanim || []).filter((m) => m.side === side && getOp(g, m.uid)?.dead);
/** A place within 3" of the marker, not within control range of enemies (null if there's none). */
function reanimSpot(g, op, m) {
  const r = radius(op);
  for (const d of [0, 0.8, 1.6, 2.4, 3]) {
    for (let i = 0; i < (d ? 12 : 1); i++) {
      const p = { x: m.x + Math.cos(i * Math.PI / 6) * d, y: m.y + Math.sin(i * Math.PI / 6) * d };
      if (p.x - r < 0 || p.y - r < 0 || p.x + r > boardOf(g).w || p.y + r > boardOf(g).h) continue;
      if (g.terrain.some((t) => distPointRect(p, t) < r)) continue;
      if (g.ops.some((o) => o !== op && !o.dead && o.x > -50 && dist(o, p) < radius(o) + r + 0.05)) continue;
      if (foes(g, op).some((e) => dist(e, p) - radius(e) - r <= CONTROL)) continue;
      return p;
    }
  }
  return null;
}
/** REANIMATED: back with 1 wound; the opponent's kill (if it counted) is taken back. */
function reanimate(g, m, ready) {
  const op = getOp(g, m.uid);
  const p = reanimSpot(g, op, m);
  if (!p) return false;
  Object.assign(op, { dead: false, wounds: 1, x: p.x, y: p.y, ready, order: 'conceal', poison: false, aplNext: 0, aplKeep: false, ml: 0, jam: false, grudge: {}, dmk: null, acted: {}, ap: 0, bloodToken: false, stimms: null });
  g.reanim = g.reanim.filter((x) => x !== m);
  if (op.killCounted) { op.killCounted = false; g.kills[1 - op.side] = Math.max(0, g.kills[1 - op.side] - 1); }
  log(g, { zh: `✦ ${opName(op, 'zh')} 復甦！以 1 生命回到場上（對手擊殺數 -1）`, en: `✦ ${opName(op, 'en')} is REANIMATED with 1 wound (the opponent loses a kill)` }, `side${op.side}`);
  return true;
}
/** Reanimation Protocols in the Ready step: try markers (toughest operative first) until one rolls a 3+. */
function readyReanimation(g, side) {
  const ms = reanimMarkers(g, side).sort((a, b) => getOp(g, b.uid).maxW - getOp(g, a.uid).maxW);
  for (const m of ms) {
    const r = d6();
    const ok = r >= 3 && reanimate(g, m, true);
    if (!ok) log(g, { zh: `${teamZh(g, side)} 復甦協議：${opName(getOp(g, m.uid), 'zh')} 擲 ${r}，沒有復甦`, en: `${team(g, side).name.en} Reanimation Protocols: ${opName(getOp(g, m.uid), 'en')} rolled ${r}, no reanimation` }, `side${side}`);
    if (ok) return;
  }
}
/** Reanimate (Plasmacyte Reanimator): markers visible to and within 6" of it. */
const reanimTargets = (g, op) => reanimMarkers(g, op.side)
  .filter((m) => dist(op, m) - radius(op) <= 6 && visibility(g, op, { ...getOp(g, m.uid), x: m.x, y: m.y }).visible);
export function doReanimate(g, op, sure) {
  const id = sure ? 'reanimateSure' : 'reanimate';
  spend(g, op, id);
  const m = reanimTargets(g, op).sort((a, b) => getOp(g, b.uid).maxW - getOp(g, a.uid).maxW)[0];
  if (!m) return;
  const r = sure ? null : d6();
  const dead = getOp(g, m.uid);
  log(g, { zh: `${opName(op, 'zh')} 復甦：${opName(dead, 'zh')}${sure ? '（多花 1AP，自動成功）' : `（擲 ${r}）`}`, en: `${opName(op, 'en')} Reanimate: ${opName(dead, 'en')}${sure ? ' (extra AP: automatic)' : ` (rolled ${r})`}` }, `side${op.side}`);
  if ((sure || r >= 3) && !reanimate(g, m, dead.diedReady === g.tp)) log(g, { zh: '標記附近沒有可以放置的位置', en: 'No room to set it up near the marker' }, `side${op.side}`);
}
/**
 * Magnify: another friendly Cryptek / Apprentek (Engage order, not in an enemy's control range, visible to the
 * shooter) to determine valid targets, cover and obscured from. Returns the operative giving the best line
 * (null if none is better than shooting normally — ties go to Magnify for its Ceaseless).
 */
function magnifyRelay(g, op, target, weapon) {
  if (!weapon.rules.magnify || !visibility(g, op, target).visible) return null;
  const rank = (v) => (!v ? 9 : (v.cover ? 1 : 0) + (v.obscured ? 2 : 0));
  let best = null, bestRank = rank(validTarget(g, op, target, weapon));
  for (const r of living(g, op.side)) {
    if (r === op || !(tpl(r).cryptek || tpl(r).apprentek) || r.order !== 'engage' || isEngaged(g, r) || !visibility(g, op, r).visible) continue;
    const k = rank(validTarget(g, r, target, weapon));
    if (k < 9 && k <= bestRank) { best = r; bestRank = k; }
  }
  return best;
}
/** Interstitial Command: friendlies (not Crypteks / Apprenteks) that can take the free Shoot now. */
function interstitialTargets(g, op) {
  const despoteks = living(g, op.side).filter((d) => tpl(d).despotek && d !== op && visibility(g, op, d).visible);
  return living(g, op.side).filter((t) => t !== op && sameTeam(t, op) && !tpl(t).cryptek && !tpl(t).apprentek
    && t.commandTP !== g.tp && t.shotTP !== g.tp && !isEngaged(g, t)
    && ((edgeDist(op, t) <= 6 + commsBonus(g, op) && visibility(g, op, t).visible) || (!tpl(op).despotek && despoteks.some((d) => edgeDist(d, t) <= 6 && visibility(g, d, t).visible)))
    && proxyShots(g, t).length > 0);
}
/** Shots the operative could take as Interstitial Command's free Shoot: [{w, t}]. */
export function proxyShots(g, t) {
  const keep = { ap: t.ap, acted: t.acted };
  t.ap = 1; t.acted = {};
  const out = [];
  for (const w of tpl(t).weapons.filter((x) => x.type === 'ranged')) for (const e of foes(g, t)) if (shootCheck(g, t, e, w).ok) out.push({ w, t: e });
  t.ap = keep.ap; t.acted = keep.acted;
  return out;
}
/** Start the free Shoot: the commanded operative gets 1AP for it (g.proxy until it shoots or the activation ends). */
function startProxy(g, op, t) {
  t.commandTP = g.tp; t.ap = 1; t.acted = {};
  g.proxy = { uid: t.uid, by: op.uid };
  op.acted.proxyFor = t.uid;
}
export function endProxy(g) {
  const p = g.proxy && getOp(g, g.proxy.uid);
  if (p) { p.ap = 0; p.acted = {}; }
  const by = g.proxy && getOp(g, g.proxy.by);
  if (by?.acted) by.acted.proxyFor = null;
  g.proxy = null;
}
// ---------- Hunter Clade ----------
/** The Doctrina Imperative this operative's team has this turning point (null if none). */
const doctrina = (g, op) => {
  if (op.docOverride?.tp === g.tp) return { tp: g.tp, mode: op.docOverride.mode, noDep: false }; // Command Override
  const d = op.side < 2 && TEAM_MAP[op.team].doctrina ? g.doctrina?.[op.side] : null;
  return d && d.tp === g.tp ? d : null;
};
const optimised = (g, op, mode) => doctrina(g, op)?.mode === mode;
const deprecated = (g, op, mode) => { const d = doctrina(g, op); return !!d && d.mode === mode && !d.noDep; };
/** Strategic gambit: the Imperative until the next Ready step (the Primary Mode's Deprecation can be ignored once per battle). */
export function setDoctrina(g, side, mode, ignoreDep = false) {
  const primary = g.tactics?.[side]?.[0];
  const prev = g.doctrina?.[side];
  if (prev?.tp === g.tp && prev.noDep) g.primaryUsed[side] = false; // changed its mind in the same Strategy phase
  const noDep = ignoreDep && mode === primary && !g.primaryUsed?.[side];
  if (noDep) (g.primaryUsed ||= [false, false])[side] = true;
  (g.doctrina ||= [null, null])[side] = { tp: g.tp, mode, noDep };
  const t = team(g, side).tactics.find((x) => x.id === mode);
  log(g, { zh: `${teamZh(g, side)} 教條指令：${t.name.zh}${noDep ? '（主要模式：無視劣化）' : ''}`, en: `${team(g, side).name.en} Doctrina Imperative: ${t.name.en}${noDep ? ' (Primary Mode: Deprecation ignored)' : ''}` }, `side${side}`);
}
/** Can this side still ignore its Primary Mode's Deprecation? */
export const primaryLeft = (g, side) => !g.primaryUsed?.[side];
/** Hit worsened by the Imperative's Deprecation (Protector: melee; Conqueror: ranged). */
const doctrinaHit = (g, op, w) => !!w && ((w.type === 'melee' && deprecated(g, op, 'protector')) || (w.type === 'ranged' && deprecated(g, op, 'conqueror')));
const bulwark = (g, op) => !!g && optimised(g, op, 'bulwark');
/** Rad-Saturation: an enemy within 2" of a friendly Vanguard has its Hit worsened by 1. */
const radSaturated = (g, op) => op.side < 2 && living(g, 1 - op.side).some((v) => tpl(v).radSat && edgeDist(v, op) <= 2);
/** Debilitating Irradiation: the attacker is irradiated and its target is a Vanguard of a side that bought the ploy. */
const debilitated = (g, src, target) => target.side < 2 && !!tpl(target).vanguard && hasPloy(g, target.side, 'debilitating') && radSaturated(g, src);
/** Neurostatic Interference: an enemy within 6" of a friendly Infiltrator can't re-roll its attack dice. */
const neurostatic = (g, op) => op.side < 2 && hasPloy(g, 1 - op.side, 'neurostatic') && living(g, 1 - op.side).some((i) => tpl(i).infiltrator && edgeDist(i, op) <= 6);
// ---------- Kasrkin ----------
export const SKILLS = {
  lightEmUp: { name: { zh: '點燃他們', en: 'Light \'Em Up' }, desc: { zh: '遠程武器「重創」。', en: 'Ranged weapons have Severe.' } },
  forCadia: { name: { zh: '為了卡迪亞！', en: 'For Cadia!' }, desc: { zh: '近戰武器 Atk +1（最多 4）；近戰時第一次打擊 +1 傷害。', en: 'Melee weapons +1 Atk (max 4); the first strike when fighting deals 1 more.' } },
  strikeFast: { name: { zh: '快速打擊', en: 'Strike Fast' }, desc: { zh: '移動（Reposition）時 Move +1"。', en: '+1" Move when repositioning.' } },
  iceInVeins: { name: { zh: '冷血', en: 'Ice In Your Veins' }, desc: { zh: '近戰、反擊或被射擊時，每次第一顆 3 以上的普通傷害 -1。', en: 'Fighting, retaliating or being shot: the first attack die inflicting 3+ Normal Dmg each sequence deals 1 less.' } },
};
/** Skill at Arms in effect for this operative (the team's, plus one from Tactical Command). */
const skillOn = (g, op, id) => op.side < 2 && TEAM_MAP[op.team].skillAtArms && (((g.skills?.[op.side]?.tp === g.tp) && g.skills[op.side].ids.includes(id)) || (op.skillExtra?.tp === g.tp && op.skillExtra.id === id));
/** How many Skills at Arms the side picks this turning point (two while its Sergeant is in the killzone). */
export const skillSlots = (g, side) => (living(g, side).some((o) => tpl(o).veteranLeadership) ? 2 : 1);
/** Strategic gambit: the Skills at Arms for this turning point. */
export function setSkills(g, side, ids) {
  const pick = [...new Set(ids.filter((id) => SKILLS[id]))].slice(0, skillSlots(g, side));
  (g.skills ||= [null, null])[side] = { tp: g.tp, ids: pick };
  log(g, { zh: `${teamZh(g, side)} 戰技：${pick.map((id) => SKILLS[id].name.zh).join('、') || '無'}`, en: `${team(g, side).name.en} Skill at Arms: ${pick.map((id) => SKILLS[id].name.en).join(', ') || 'none'}` }, `side${side}`);
}
/** End of a side's Strategy phase: pick Skills at Arms if the player didn't; place the Clearance Sweep marker by the frontmost enemy. */
function skillsStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].skillAtArms) return;
  if (g.skills?.[side]?.tp !== g.tp) setSkills(g, side, ['lightEmUp', 'iceInVeins']);
  if (hasPloy(g, side, 'clearanceSweep') && g.sweep?.[side]?.tp !== g.tp) {
    const mine = living(g, side), cx = mine.reduce((s, o) => s + o.x, 0) / (mine.length || 1), cy = mine.reduce((s, o) => s + o.y, 0) / (mine.length || 1);
    const e = living(g, 1 - side).sort((a, b) => dist(a, { x: cx, y: cy }) - dist(b, { x: cx, y: cy }))[0];
    if (e) { (g.sweep ||= [null, null])[side] = { tp: g.tp, x: e.x, y: e.y }; log(g, { zh: `清掃標記放在 ${opName(e, 'zh')} 處（5" 範圍）`, en: `Clearance Sweep marker placed by ${opName(e, 'en')} (5" area)` }, `side${side}`); }
  }
}
/** Rapid Fire weapons: bolt pistol, hot-shot lasgun, hot-shot laspistol. */
const rapidWeapon = (w) => !!w && (!!w.rules.rapid || /^bolt pistol$/i.test(w.name.en));
const rapidOK = (op) => TEAM_MAP[op.team].rapidFire && !moved(op);
/** Clearance Sweep (ploy): the marker's 5" area. */
const sweepOn = (g, op, target) => { const m = g.sweep?.[op.side]; return !!(m && m.tp === g.tp && target && dist(op, m) - radius(op) <= 5 && dist(target, m) - radius(target) <= 5); };
const adaptiveOk = (g, op, k) => !!tpl(op).adaptive && g.adaptive?.[op.side]?.[k] !== g.tp;

// ---------- Exodite Dragon Masters ----------
const isEDM = (op) => !!TEAM_MAP[op?.team]?.dragonMasters;
export const isMounted = (op) => !!tpl(op)?.mounted;
/** Upgrades picked for a mounted Dragon Master (its loadout id lists the two). */
const hasUp = (op, id) => isEDM(op) && !!tpl(op).upgrades && (op.loadout || '').split('+').includes(id);
const DEG45 = Math.PI / 4;
const normAng = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
/** SPEED: 3 (SPEED 3-), 4 (SPEED 4+) or 7 (SPEED 7+); Wind's Grace makes it one higher. */
export function speedOf(g, op) {
  if (!isEDM(op)) return 0;
  const s = op.speed || 3;
  return op.windGrace ? (s === 3 ? 4 : 7) : s;
}
/** Facing towards the enemy's side of the killzone (riders entering, Drakolithes). */
const facingIn = (g, side) => {
  const along = g.axis === 'y' ? 'y' : 'x', lowSide = territoryOf(g, { [along]: 1, [along === 'x' ? 'y' : 'x']: 11 }) === side;
  return along === 'x' ? (lowSide ? 0 : Math.PI) : (lowSide ? Math.PI / 2 : -Math.PI / 2);
};
/** Sprint (mounted, 0AP): straight forwards (≤9") or backwards (≤3") after pivoting up to 45° at the start; 12" per TP; whole inches. */
export function sprintCheck(g, op, p) {
  const no = (zh, en) => ({ ok: false, why: { zh, en } });
  const dx = p.x - op.x, dy = p.y - op.y, d = Math.hypot(dx, dy);
  if (d < 0.25) return no('太近了', 'Too close');
  const ang = Math.atan2(dy, dx), rel = normAng(ang - (op.facing || 0));
  const leap = !!op.acted.leap, back = !leap && Math.abs(rel) > Math.PI / 2, turn = back ? normAng(rel - Math.PI) : rel;
  if (leap && d > 1.01) return no('躍起只能放到 1" 內', 'Leap: within 1"');
  if (!leap && Math.abs(turn) > DEG45 + 1e-6) return no('只能直線向前或向後（起點可轉 45°）', 'Only straight forwards or backwards (pivot up to 45° first)');
  const inches = leap ? 3 : Math.ceil(d - 1e-6);
  if (!leap && !back && (op.acted.sprintFwd || 0) + inches > 9) return no(`向前最多 9"（已用 ${op.acted.sprintFwd || 0}"）`, `Forwards 9" at most (${op.acted.sprintFwd || 0}" used)`);
  if (back && (op.acted.sprintBack || 0) + inches > 3) return no('向後最多 3"', 'Backwards 3" at most');
  if ((op.movedTP || 0) + inches > 12) return no(`每回合最多 12"（已用 ${op.movedTP || 0}"）`, `12" per TP at most (${op.movedTP || 0}" used)`);
  if (op.counter && inches > 2) return no('反擊時最多移動 2"', 'Counteracting: 2" at most');
  if (op.acted.aimedUsed && (op.acted.movedDist || 0) + inches > 3) return no('用過定點長步槍後不能移動超過 3"', 'After the stationary long rifle, no more than 3" of movement');
  const ctx = moveCtx(g, op), r = radius(op);
  // (It moves through operatives and low terrain; tall — Heavy — terrain blocks it.)
  if (!leap) {
    const n = Math.max(1, Math.ceil(d / 0.2));
    for (let k = 1; k < n; k++) {
      const q = { x: op.x + dx * k / n, y: op.y + dy * k / n };
      if (g.terrain.some((t) => t.kind === 'heavy' && t.equip == null && distPointRect(q, t) < r - 1e-6)) return no('被重型地形擋住', 'Blocked by Heavy terrain');
    }
  }
  if (!ctx.free(p)) return no('那裡放不下', 'It can\'t be placed there');
  return { ok: true, why: null, inches, back, facing: leap ? op.facing : back ? normAng(ang + Math.PI) : ang, leap };
}
export function doSprint(g, op, p) {
  const c = sprintCheck(g, op, p);
  if (!c.ok) return false;
  const from = { x: op.x, y: op.y };
  op.acted.sprint = (op.acted.sprint || 0) + 1; op.orderSet = true;
  op.x = p.x; op.y = p.y; op.facing = c.facing;
  op.movedTP = (op.movedTP || 0) + c.inches; op.acted.movedDist = (op.acted.movedDist || 0) + c.inches;
  if (c.back) op.acted.sprintBack = (op.acted.sprintBack || 0) + c.inches; else if (!c.leap) op.acted.sprintFwd = (op.acted.sprintFwd || 0) + c.inches;
  // Equipment terrain it moves through is removed from the battle.
  const gone = g.terrain.filter((t) => t.equip != null && segRect(from, p, t));
  if (gone.length) g.terrain = g.terrain.filter((t) => !gone.includes(t));
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.x = op.x; m.y = op.y; }
  // Mercurial Speed: 4"+ forwards = SPEED 4+, 7"+ = SPEED 7+, otherwise (or backwards, or a Leap) 3-.
  const fwd = c.back || c.leap ? 0 : c.inches;
  op.speed = fwd >= 7 ? 7 : fwd >= 4 ? 4 : 3; op.acted.speedSet = true;
  const rec = g.recent?.[op.side];
  if (rec?.uid === op.uid) rec.trails.push([from, { x: op.x, y: op.y }]);
  (g.trailLog ||= []).push({ uid: op.uid, side: op.side, tp: g.tp, kind: 'sprint', len: c.inches, pts: [from, { x: op.x, y: op.y }] });
  log(g, { zh: `${opName(op, 'zh')} 疾馳 ${c.back ? '後退' : c.leap ? '躍起' : '前進'} ${c.inches}"（速度 ${op.speed === 3 ? '3-' : `${op.speed}+`}）${gone.length ? `，撞毀 ${gone.length} 個裝備掩體` : ''}`, en: `${opName(op, 'en')} Sprints ${c.back ? 'back' : c.leap ? '(Leap)' : 'forwards'} ${c.inches}" (SPEED ${op.speed === 3 ? '3-' : `${op.speed}+`})${gone.length ? `, smashing ${gone.length} equipment terrain` : ''}` }, `side${op.side}`);
  // Ride Them Down (ploy, once per activation): 4"+ — 1 damage to an enemy in its control range; 7"+ or a Clanblade — D3.
  if (hasPloy(g, op.side, 'rideThemDown') && fwd >= 4 && !op.acted.rideUsed) {
    const e = engagedEnemies(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    if (e) { op.acted.rideUsed = true; const dmg = fwd >= 7 || tpl(op).edLeader ? d3() : 1; log(g, { zh: `輾壓他們：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `Ride Them Down: ${opName(e, 'en')} takes ${dmg} damage` }, `side${op.side}`); applyDamage(g, op, e, dmg); }
  }
  voltagheistField(g, op);
  checkMines(g, op);
  return true;
}
/** Turn (mounted, 1AP): pivot up to 45° towards a point. */
export function turnFacing(op, p) {
  const want = normAng(Math.atan2(p.y - op.y, p.x - op.x) - (op.facing || 0));
  return normAng((op.facing || 0) + Math.max(-DEG45, Math.min(DEG45, want)));
}
export function doTurn(g, op, p) {
  spend(g, op, 'edTurn');
  op.facing = turnFacing(op, p);
  log(g, { zh: `${opName(op, 'zh')} 轉向`, en: `${opName(op, 'en')} Turns` }, `side${op.side}`);
}
/** Draconic Cavalry Tactics: a rider in reserve enters touching your killzone edge (treated as a Turn: 1AP). */
export function entryPoint(g, op, p) {
  const along = g.axis === 'y' ? 'y' : 'x', perp = along === 'x' ? 'y' : 'x', size = { x: boardOf(g).w, y: boardOf(g).h }, r = radius(op);
  const low = territoryOf(g, { [along]: 1, [perp]: size[perp] / 2 }) === op.side;
  return { [along]: low ? r + 0.01 : size[along] - r - 0.01, [perp]: Math.max(r, Math.min(size[perp] - r, p[perp])) };
}
export function enterFromReserve(g, op, p) {
  if (!op.reserve) return false;
  const q = entryPoint(g, op, p);
  op.x = q.x; op.y = q.y;
  if (!moveCtx(g, op).free(q)) { op.x = -99; op.y = -99; return false; }
  op.reserve = false; op.facing = facingIn(g, op.side);
  op.ap = Math.max(0, op.ap - 1); op.orderSet = true; op.acted.entered = 1;
  log(g, { zh: `${opName(op, 'zh')} 從場邊進場`, en: `${opName(op, 'en')} enters from the killzone edge` }, `side${op.side}`);
  return true;
}
/** Preternatural Evasion (Drakolithe): SPEED from how far it ends from where it started this activation. */
function drakolitheSpeed(g, op, kind, from) {
  if (!tpl(op).drakolithe || !['charge', 'fallBack', 'reposition'].includes(kind)) return;
  const d = dist(op, from);
  if (d > 5) { op.speed = 7; op.acted.speedSet = true; } else if (d > 2) { op.speed = Math.max(op.acted.speedSet ? op.speed || 3 : 3, 4); op.acted.speedSet = true; }
}

// ---------- Inquisitorial Agents ----------
const isIA = (op) => !!TEAM_MAP[op?.team]?.inquisition;
const isIATeam = (g, side) => side < 2 && !!TEAM_MAP[g.teams[side]]?.inquisition;
/** Inquisitorial Tomes: Denunciation (+1 Atk attacking an enemy within 2" of it) / Sanctification (-1 Atk for enemies attacking a friendly within 2" of it). */
const tomeNear = (g, side, kind, o) => living(g, side).some((t) => tpl(t).tome === kind && edgeDist(t, o) <= 2);
/** Hexorcise (Hexorcist): an enemy visible within 6" of it can't re-roll attack or defence dice. */
const hexorcised = (g, op) => op.side < 2 && living(g, 1 - op.side).some((h) => tpl(h).hexorcise && edgeDist(h, op) <= 6 && visibility(g, h, op).visible);
/** Scry (Mystic): Guidance (attack dice) / Protection (defence dice) — one fail → normal, or one normal → crit. */
const scryOn = (g, op, mode) => { const s = g.scry?.[op.side]; return !!(s && s.uid === op.uid && s.mode === mode && getOp(g, s.by) && !getOp(g, s.by).dead); };
const upgradePost = (pool) => {
  const m = pool.dice.find((x) => x.res === 'miss');
  if (m) { m.res = 'norm'; m.indo = true; pool.norms++; return; }
  const n = pool.dice.find((x) => x.res === 'norm');
  if (n) { n.res = 'crit'; n.rend = true; pool.norms--; pool.crits++; }
};
const scryPost = (g, op, mode) => (scryOn(g, op, mode) ? upgradePost : null);
/** Quarry (ploy): the enemy friendlies attack with Ceaseless; a new one is picked (automatically) when it falls. */
const quarryOf = (g, side) => (g.quarry?.[side]?.tp === g.tp ? getOp(g, g.quarry[side].uid) : null);
function pickQuarry(g, side) {
  const mine = living(g, side), near = (e) => Math.min(...mine.map((m) => dist(m, e)));
  const t = living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => (tpl(b).apl * b.wounds) - (tpl(a).apl * a.wounds) || near(a) - near(b))[0];
  (g.quarry ||= [null, null])[side] = t ? { tp: g.tp, uid: t.uid } : null;
  if (t) log(g, { zh: `獵物：${opName(t, 'zh')}（友方攻擊它時武器「無休」）`, en: `Quarry: ${opName(t, 'en')} (friendlies attacking it have Ceaseless)` }, `side${side}`);
}
/** Denounce (ploy): the chosen enemy waits until it's the last ready one, or until its side has activated D3 operatives. */
const denounced = (g, o, ready) => { const d = g.denounce?.[1 - o.side]; return !!(d && d.tp === g.tp && d.uid === o.uid && ready.length > 1 && (g.actCount?.[o.side] || 0) < d.n); };
/** Scrivener (Autosavant): each time the opponent uses a ploy again during the battle, +1CP (2 per TP at most). */
function scrivener(g, side, id) {
  if (side > 1 || id === 'commandReroll') return;
  const uses = ((g.ployUses ||= [{}, {}])[side]);
  uses[id] = (uses[id] || 0) + 1;
  const opp = 1 - side;
  if (uses[id] < 2 || !living(g, opp).some((o) => tpl(o).scrivener)) return;
  const s = (g.scrivTP ||= [null, null]);
  if (s[opp]?.tp !== g.tp) s[opp] = { tp: g.tp, n: 0 };
  if (s[opp].n >= 2) return;
  s[opp].n++; g.cp[opp]++;
  log(g, { zh: `記錄員：對手再次使用計謀，+1CP`, en: 'Scrivener: the opponent used a ploy again, +1CP' }, `side${opp}`);
}
/** Absolute Authority (firefight ploy, automatic): an opponent's strategy ploy is cancelled and refunded (each ploy once per battle). */
function absoluteAuthority(g, side, ploy, cost) {
  const ia = 1 - side;
  if (!isIATeam(g, ia) || cost <= 0 || !ffReady(g, ia, 'absoluteAuthority') || !ffArmed(g, ia, 'absoluteAuthority')) return false;
  if (g.authorityStopped?.[ia]?.includes(ploy.id)) return false;
  spendFF(g, ia, 'absoluteAuthority');
  ((g.authorityStopped ||= [[], []])[ia]).push(ploy.id);
  ((g.ployBlocked ||= [{}, {}])[side])[ploy.id] = g.tp;
  log(g, { zh: `絕對權威：對手的「${ploy.name.zh}」被取消，CP 退回`, en: `Absolute Authority: the opponent's ${ploy.name.en} is cancelled and refunded` }, `side${ia}`);
  return true;
}
/** Intimidating Presence (firefight ploy, automatic): +1AP for an enemy picking up / doing a mission action near an agent. */
const intimidated = (g, op) => op.side < 2 && isIATeam(g, 1 - op.side) && ffReady(g, 1 - op.side, 'intimidatingPresence') && ffArmed(g, 1 - op.side, 'intimidatingPresence')
  && living(g, 1 - op.side).some((a) => edgeDist(a, op) <= (tpl(a).scry ? 6 : 3) && visibility(g, a, op).visible);
/** Relentless in Pursuit (firefight ploy, automatic): an enemy that started within 2" of a ready agent moves — the agent follows. */
function relentlessPursuit(g, enemy, from) {
  const side = 1 - enemy.side;
  if (enemy.dead || enemy.side > 1 || !isIATeam(g, side) || !ffReady(g, side, 'relentlessPursuit') || !ffArmed(g, side, 'relentlessPursuit')) return;
  const was = { ...enemy, x: from.x, y: from.y };
  const ag = living(g, side).filter((a) => a.ready && !tpl(a).machine && edgeDist(a, was) <= 2).sort((a, b) => (prefersMeleeG(b) - prefersMeleeG(a)))[0];
  if (!ag || isEngaged(g, ag)) return;
  const ctx = moveCtx(g, ag);
  const charge = ag.order === 'engage';
  let best = null;
  for (let a = 0; a < 16; a++) for (const gap of charge ? [0.5, 0.9] : [1.5, 1.9]) {
    const r = radius(enemy) + radius(ag) + gap, p = { x: enemy.x + Math.cos(a * Math.PI / 8) * r, y: enemy.y + Math.sin(a * Math.PI / 8) * r };
    if (!ctx.free(p)) continue;
    const max = charge ? moveStat(g, ag) + 2 : moveStat(g, ag);
    const raw = findPath(ctx, p), path = raw && wholeInchPath(ctx, raw, max, charge ? ctx.inEnemyER : (q) => !ctx.inEnemyER(q));
    if (path && (!best || path.len < best.path.len)) best = { path, p: path.pts.at(-1) };
  }
  if (!best || !autoFF(g, side, 'relentlessPursuit')) return;
  ag.x = best.p.x; ag.y = best.p.y;
  (g.trailLog ||= []).push({ uid: ag.uid, side, tp: g.tp, kind: charge ? 'charge' : 'reposition', len: Math.round(best.path.len * 10) / 10, pts: best.path.pts.map((p) => ({ x: p.x, y: p.y })) });
  log(g, { zh: `窮追不捨：${opName(ag, 'zh')} ${charge ? '衝鋒' : '移動'}追上 ${opName(enemy, 'zh')}`, en: `Relentless in Pursuit: ${opName(ag, 'en')} ${charge ? 'Charges' : 'Repositions'} after ${opName(enemy, 'en')}` }, `side${side}`);
  checkMines(g, ag);
}
const prefersMeleeG = (o) => { const ws = tpl(o).weapons; const best = (t) => Math.max(0, ...ws.filter((w) => w.type === t).map((w) => w.atk * w.dmg[0])); return best('melee') > best('ranged') ? 1 : 0; };
/** Inquisition strategy ploys that pick a target: Denounce and Quarry (automatic). */
function inquisitionPloy(g, side, ploy) {
  if (ploy.id === 'quarry') pickQuarry(g, side);
  if (ploy.id === 'denounce') {
    const t = living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => tpl(b).apl * b.wounds - tpl(a).apl * a.wounds)[0];
    if (t) {
      const n = d3();
      (g.denounce ||= [null, null])[side] = { tp: g.tp, uid: t.uid, n };
      ((g.denounceUses ||= [0, 0])[side])++;
      log(g, { zh: `揭發：${opName(t, 'zh')} 本回合要等對手啟動 ${n} 名特工後（或最後）才能行動`, en: `Denounce: ${opName(t, 'en')} can't activate until ${n} other operatives have (or it's the last)` }, `side${side}`);
    }
  }
}

// ---------- Hernkyn Yaegirs ----------
const isHY = (op) => !!TEAM_MAP[op?.team]?.yaegirs;
const isHYTeam = (g, side) => side < 2 && !!TEAM_MAP[g.teams[side]]?.yaegirs;
export const resourceLeft = (g, side) => (isHYTeam(g, side) && g.resTP?.[side] === g.tp ? g.res?.[side] || 0 : 0);
/** Ready step (after the first TP): Resourceful points by friendlies not in enemy control range (5+ → 2, 3-4 → 1), +1 Veteran Adventurer. */
function yaegirReady(g) {
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
function setupMinefield(g, side) {
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
function hyMines(g, op) {
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
function dauntlessExplorers(g, side) {
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
function wroughtlockNegotiation(g, side) {
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
function stalwartDefence(g, enemy) {
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
const kinPost = (g, op) => (isHY(op) && op.side < 2 && (g.markers || []).some((m) => m.kind === 'fallenKin' && m.owner === op.side && dist(op, m) - radius(op) <= 3) ? (pool) => {
  const m = pool.dice.find((x) => x.res === 'miss');
  if (m) { m.res = 'norm'; m.indo = true; pool.norms++; return; }
  const n = pool.dice.find((x) => x.res === 'norm');
  if (n) { n.res = 'crit'; n.rend = true; pool.norms--; pool.crits++; }
} : null);
const chainPost = (a, b) => (a && b ? (p) => { a(p); b(p); } : a || b);
/** Bonds That Bind: ready Yaegirs visible within 3" (not a Bombast that used Wroughtlock Negotiation this TP). */
const bondsCands = (g, o) => living(g, o.side).filter((x) => x !== o && x.ready && isHY(x) && x.negotiatedTP !== g.tp && edgeDist(x, o) <= 3 && visibility(g, o, x).visible);

// ---------- Goremongers ----------
const isGM = (op) => !!TEAM_MAP[op?.team]?.goreTanks;
/** GORE TANK: 0 empty, 1 half, 2 full (it starts at half). */
export const goreOf = (op) => (isGM(op) && op.side < 2 ? op.gore ?? 1 : null);
const GORE_NAME = [{ zh: '空', en: 'empty' }, { zh: '半', en: 'half' }, { zh: '滿', en: 'full' }];
export function goreUp(g, op, why) {
  if (!isGM(op) || op.dead || op.side > 1 || (op.gore ?? 1) >= 2) return false;
  op.gore = (op.gore ?? 1) + 1;
  log(g, { zh: `${opName(op, 'zh')} 血槽 +1（${why.zh}）→ ${GORE_NAME[op.gore].zh}`, en: `${opName(op, 'en')} GORE TANK up (${why.en}) → ${GORE_NAME[op.gore].en}` }, `side${op.side}`);
  return true;
}
function goreDown(op) { if ((op.gore ?? 1) <= 0) return false; op.gore = (op.gore ?? 1) - 1; return true; }
export const SANGUAVITAE = {
  mania: { name: { zh: '狂躁', en: 'Mania' }, desc: { zh: 'APL +1，直到它下次啟動（現在就多 1AP）', en: '+1 APL until its next activation (1 more AP now)' } },
  fury: { name: { zh: '狂怒', en: 'Fury' }, desc: { zh: '本次啟動可以近戰兩次，第二次免費', en: 'Two Fight actions this activation, the second free' } },
  rejuvenate: { name: { zh: '再生', en: 'Rejuvenate' }, desc: { zh: '回復 D3+1 生命', en: 'Regain D3+1 wounds' } },
  rage: { name: { zh: '狂暴', en: 'Rage' }, desc: { zh: '這次啟動下一次近戰：近戰武器 Atk +1', en: 'Its next Fight this activation: +1 Atk on melee weapons' } },
  rake: { name: { zh: '撕扯', en: 'Rake' }, desc: { zh: '這次啟動下一次衝鋒移動完：對控制範圍內一名敵人造成 D3', en: 'Its next Charge this activation: D3 to an enemy in its control range when it finishes moving' } },
  surge: { name: { zh: '湧動', en: 'Surge' }, desc: { zh: '這次啟動下一次衝鋒或移動：Move +1"', en: 'Its next Charge or Reposition this activation: +1" Move' } },
};
/** The Sanguavitae this operative could use now (it's activating or counteracting): [{id, ok, why}]. */
export function sangOptions(g, op) {
  if (!op || !isGM(op) || op.side > 1 || op.dead || g.active !== op.uid || g.phase !== 'firefight') return [];
  const used = op.acted.sang || [], gore = goreOf(op);
  return Object.keys(SANGUAVITAE).map((id) => {
    const why = used.includes(id) ? { zh: '這次已用過', en: 'Already used this time' }
      : used.length >= 2 ? { zh: '每次最多兩種', en: 'Two per activation at most' }
        : gore <= 0 ? { zh: '血槽是空的', en: 'GORE TANK is empty' }
          : (id === 'mania' && used.includes('fury')) || (id === 'fury' && used.includes('mania')) ? { zh: '狂躁與狂怒不能同時用', en: 'Not Mania and Fury together' }
            : ['mania', 'fury', 'rake'].includes(id) && op.counter ? { zh: '反擊時不能用', en: 'Not while counteracting' }
              : id === 'rejuvenate' && op.wounds >= op.maxW ? { zh: '沒有受傷', en: 'Not wounded' } : null;
    return { id, ok: !why, why };
  });
}
export function useSang(g, op, id) {
  if (!sangOptions(g, op).find((x) => x.id === id)?.ok) return false;
  goreDown(op);
  (op.acted.sang ||= []).push(id);
  let extra = { zh: '', en: '' };
  if (id === 'mania') { op.mania = true; op.ap += 1; }
  if (id === 'fury') { op.acted.fightsAllowed = Math.max(2, op.acted.fightsAllowed || 1); op.acted.fury = true; }
  if (id === 'rejuvenate') { const b = op.wounds; op.wounds = Math.min(op.maxW, op.wounds + d3() + 1); extra = { zh: `，回復 ${op.wounds - b}`, en: `, regains ${op.wounds - b}` }; }
  if (['rage', 'rake', 'surge'].includes(id)) (op.acted.sangArm ||= {})[id] = true;
  log(g, { zh: `${opName(op, 'zh')} 血之精華「${SANGUAVITAE[id].name.zh}」${extra.zh}（血槽 → ${GORE_NAME[op.gore].zh}）`, en: `${opName(op, 'en')} Sanguavitae: ${SANGUAVITAE[id].name.en}${extra.en} (GORE TANK → ${GORE_NAME[op.gore].en})` }, `side${op.side}`);
  return true;
}
/** Bleeding tokens (Inciter): enemies within 8" of this activating Goremonger whose token it can take. */
export const bleedTargets = (g, op) => (isGM(op) && g.active === op.uid && op.side < 2 && goreOf(op) < 2
  ? foes(g, op).filter((e) => e.bleed?.[op.side] && edgeDist(op, e) <= 8) : []);
export function useBleed(g, op, e) {
  if (!bleedTargets(g, op).includes(e)) return false;
  e.bleed[op.side] = false;
  return goreUp(g, op, { zh: `${opName(e, 'zh')} 的流血標記`, en: `${opName(e, 'en')}'s Bleeding token` });
}
/** Khorne's Favour (Blood Herald): once per activation, with an empty tank, increase it. */
export const canFavour = (g, op) => !!tpl(op).khornesFavour && g.active === op.uid && goreOf(op) === 0 && !op.acted.favour && g.phase === 'firefight';
export function useFavour(g, op) {
  if (!canFavour(g, op)) return false;
  op.acted.favour = true;
  return goreUp(g, op, { zh: '恐虐的恩寵', en: 'Khorne\'s Favour' });
}
/** Kills: Gore Tank up (control range, or visible within 2"); Incite the Hunt (Inciter, from more than 2"). */
function goreOnKill(g, src, target, near) {
  if (!src || src.dead || !isGM(src) || src.side === target.side) return;
  if (near) goreUp(g, src, { zh: '使敵人殘廢', en: 'incapacitated an enemy' });
  if (tpl(src).inciteHunt && edgeDist(src, target) > 2) {
    const t = living(g, src.side).filter((o) => isGM(o) && goreOf(o) < 2 && edgeDist(o, target) <= 8).sort((a, b) => goreOf(a) - goreOf(b))[0];
    if (t) goreUp(g, t, { zh: '煽動狩獵', en: 'Incite the Hunt' });
  }
}
/** Drag (Impaler's fleshskewer): before damage, pull the target up to 2" per unblocked success towards the shooter. */
function dragTarget(g, op, target, n) {
  if (n <= 0 || target.dead) return;
  const max = n * 2, d = dist(op, target), room = d - radius(op) - radius(target) - 0.02;
  if (room <= 0.05) return;
  const ctx = moveCtx(g, target);
  for (let len = Math.ceil(Math.min(max, room)); len >= 1; len--) {
    const l = Math.min(len, room), q = { x: target.x + (op.x - target.x) / d * l, y: target.y + (op.y - target.y) / d * l };
    if (!ctx.free(q) || !ctx.segFree(target, q) || ctx.climbs([target, q])) continue; // (not dragged over terrain)
    log(g, { zh: `拖拽：${opName(target, 'zh')} 被拉近 ${Math.ceil(l)}"`, en: `Drag: ${opName(target, 'en')} is pulled ${Math.ceil(l)}" closer` }, `side${op.side}`);
    target.x = q.x; target.y = q.y;
    for (const m of carriables(g)) if (m.carriedBy === target.uid) { m.x = q.x; m.y = q.y; }
    return;
  }
}
/** Hunt for Blood (strategy ploy): one friendly (automatic) goes Engage and makes a free Charge of up to 3". */
function goremongerStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]]?.goreTanks || !hasPloy(g, side, 'huntForBlood') || g.huntTP?.[side] === g.tp) return;
  (g.huntTP ||= [0, 0])[side] = g.tp;
  let best = null;
  for (const op of living(g, side).filter((o) => isGM(o) && !isEngaged(g, o))) {
    const ctx = moveCtx(g, op);
    for (const e of foes(g, op).filter((x) => x.side < 2 && edgeDist(op, x) <= 3 + CONTROL)) {
      for (let a = 0; a < 16; a++) {
        const r = radius(e) + radius(op) + 0.5, p = { x: e.x + Math.cos(a * Math.PI / 8) * r, y: e.y + Math.sin(a * Math.PI / 8) * r };
        const raw = ctx.free(p) && findPath(ctx, p), path = raw && wholeInchPath(ctx, raw, 3, ctx.inEnemyER);
        if (path && path.len <= 3 + 0.01 && (!best || path.len < best.path.len)) best = { op, e, path };
      }
    }
  }
  if (!best) { log(g, { zh: '血之狩獵：沒有能衝到敵人身邊的友方', en: 'Hunt for Blood: no friendly can reach an enemy' }, `side${side}`); return; }
  const { op, e, path } = best, end = path.pts[path.pts.length - 1];
  op.order = 'engage'; op.x = end.x; op.y = end.y; op.chargedTP = g.tp;
  (g.trailLog ||= []).push({ uid: op.uid, side, tp: g.tp, kind: 'charge', len: Math.round(path.len * 10) / 10, pts: path.pts.map((p) => ({ x: p.x, y: p.y })) });
  for (const m of carriables(g)) if (m.carriedBy === op.uid) { m.x = op.x; m.y = op.y; }
  log(g, { zh: `血之狩獵：${opName(op, 'zh')} 改為交戰，免費衝鋒 ${path.len}" 到 ${opName(e, 'zh')} 身邊`, en: `Hunt for Blood: ${opName(op, 'en')} goes Engage and Charges ${path.len}" to ${opName(e, 'en')}` }, `side${side}`);
  checkMines(g, op);
}

// ---------- Elucidian Starstriders ----------
const isES = (op) => !!TEAM_MAP[op?.team]?.starstriders;
/** Privateer Support Assets still available to this operative now (Navis or Vhane, once per Firefight phase, each once per battle). */
const assetsFor = (g, op) => (isES(op) && op.side < 2 && (tpl(op).navis || tpl(op).esLeader) && g.phase === 'firefight' && g.assetTP?.[op.side] !== g.tp
  ? ES_ASSETS.filter((w) => !g.assetsUsed?.[op.side]?.includes(w.id)) : []);
/** Warrant of Trade: uses left this battle (4, or 5 after Reputation to Maintain). */
const warrantsLeft = (g, side) => (g.warrantMax?.[side] || 4) - (g.warrants?.[side]?.length || 0);
const useWarrant = (g, side, id) => ((g.warrants ||= [[], []])[side]).push(id);
/** Bribe (Warrant of Trade): skip this activation. */
export function bribeSkip(g, side) {
  if (!TEAM_MAP[g.teams[side]]?.starstriders || g.phase !== 'firefight' || g.turn !== side || g.active || g.counter || g.chain) return false;
  if (warrantsLeft(g, side) <= 0 || g.warrants?.[side]?.includes('bribe') || !hasReady(g, 1 - side)) return false;
  useWarrant(g, side, 'bribe');
  log(g, { zh: `${teamZh(g, side)} 貿易許可證「賄賂」：跳過這次啟動`, en: `${team(g, side).name.en} Warrant of Trade — Bribe: skips this activation` }, `side${side}`);
  handOff(g, side);
  return true;
}
export const canBribe = (g, side) => !!TEAM_MAP[g.teams[side]]?.starstriders && g.phase === 'firefight' && g.turn === side && !g.active && !g.counter && !g.chain
  && warrantsLeft(g, side) > 0 && !g.warrants?.[side]?.includes('bribe') && hasReady(g, 1 - side);
/** Stake Claim (ploy): the Claim marker goes by the enemy nearest the team. */
function starstridersStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].starstriders || g.esTP?.[side] === g.tp) return;
  (g.esTP ||= [0, 0])[side] = g.tp;
  g.markers = (g.markers || []).filter((m) => !(m.kind === 'claim' && m.owner === side)); // (removed at the end of the previous TP)
  if (!hasPloy(g, side, 'stakeClaimES')) return;
  const mine = living(g, side), near = (e) => Math.min(...mine.map((m) => dist(m, e)));
  const t = living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => near(a) - near(b))[0];
  if (!t) return;
  g.markers.push({ id: g.markers.length, kind: 'claim', owner: side, x: t.x, y: t.y, carriedBy: null });
  log(g, { zh: `${teamZh(g, side)} 宣示所有權：標記放在 ${opName(t, 'zh')} 處`, en: `${team(g, side).name.en} Stake Claim: the marker goes by ${opName(t, 'en')}` }, `side${side}`);
}
/** Stake Claim: attacking an enemy within 3" of the Claim marker — one fail becomes a normal success, else a normal a crit. */
function claimBoost(g, op, target, pool) {
  if (!isES(op) || !target || !(g.markers || []).some((m) => m.kind === 'claim' && m.owner === op.side && dist(m, target) - radius(target) <= 3)) return;
  const m = pool.dice.find((d) => d.res === 'miss' && !d.auto), n = pool.dice.find((d) => d.res === 'norm' && !d.auto);
  if (m) m.faith = 'norm'; else if (n) n.faith = 'crit';
  tally(pool);
}
/** Calibrate Voltagheist — Field (Lectro-Maester): an enemy ending a move visible within 4" of it takes D6. */
function voltagheistField(g, op) {
  for (const s of [0, 1]) {
    const c = g.calib?.[s], lm = c && getOp(g, c.by);
    if (!lm || lm.dead || c.mode !== 'field' || op.side !== 1 - s || op.dead || edgeDist(lm, op) > 4 || !visibility(g, lm, op).visible) continue;
    const d = d6();
    log(g, { zh: `電能幽靈力場：${opName(op, 'zh')} 受到 ${d} 傷害`, en: `Voltagheist Field: ${opName(op, 'en')} takes ${d} damage` }, `side${s}`);
    applyDamage(g, lm, op, d);
  }
}

// ---------- Chaos Cult ----------
const isCult = (op) => !!TEAM_MAP[op?.team]?.chaosCult;
/** Mutant or Torment (Chaos Cult). */
const isWarped = (op) => isCult(op) && !!(tpl(op).mutant || tpl(op).torment);
export const CULT_GIFTS = {
  wings: { zh: '畸形之翼', en: 'Deformed Wings' }, fleet: { zh: '迅捷', en: 'Fleet' }, chitinous: { zh: '幾丁甲殼', en: 'Chitinous' },
  horned: { zh: '角', en: 'Horned' }, sinewed: { zh: '筋腱', en: 'Sinewed' }, barbed: { zh: '倒刺', en: 'Barbed' },
};
/** Accursed Gifts: Mutants have the primary one, Torments the primary and the secondary. */
const hasGift = (g, op, id) => { const gs = isCult(op) && g.cultGifts?.[op.side]; return !!gs && ((tpl(op).mutant && gs.primary === id) || (tpl(op).torment && (gs.primary === id || gs.secondary === id))); };
/** The Accursed Gifts this operative has (for its datacard). */
export const giftsOf = (g, op) => Object.keys(CULT_GIFTS).filter((k) => hasGift(g, op, k));
/** MUTATE: Devotee → Mutant (max 5), Mutant → Torment (max 3, twice per TP), otherwise regain D3+1. Once per TP each. */
function mutate(g, op, why) {
  if (!isCult(op) || op.dead || op.mutateTP === g.tp) return false;
  const side = op.side, mine = living(g, side);
  const tormentsTP = g.tormentTP?.[side]?.tp === g.tp ? g.tormentTP[side].n : 0;
  const into = tpl(op).devotee && mine.filter((o) => tpl(o).mutant).length < 5 ? 'ctMutant'
    : tpl(op).mutant && mine.filter((o) => tpl(o).torment).length < 3 && tormentsTP < 2 ? 'ctTorment' : null;
  if (!into && op.wounds >= op.maxW) return false;
  if (into && !moveCtx(g, { ...op, tplId: into }).free(op)) return false;
  op.mutateTP = g.tp;
  if (!into) {
    const b = op.wounds; op.wounds = Math.min(op.maxW, op.wounds + d3() + 1);
    log(g, { zh: `${opName(op, 'zh')} 變異（${why.zh}）：回復 ${op.wounds - b} 生命`, en: `${opName(op, 'en')} mutates (${why.en}): regains ${op.wounds - b} wounds` }, `side${side}`);
    return true;
  }
  const before = opName(op, 'zh'), beforeEn = opName(op, 'en');
  const lost = op.maxW - op.wounds, t = TEAM_MAP[op.team].ops.find((o) => o.id === into);
  op.tplId = into; op.maxW = t.wounds; op.wounds = Math.max(1, t.wounds - lost);
  const gs = ((g.cultGifts ||= [null, null])[side] ||= {});
  // (The gifts are picked automatically: Chitinous first, then Sinewed.)
  let gift = null;
  if (into === 'ctMutant' && !gs.primary) gift = gs.primary = 'chitinous';
  if (into === 'ctTorment') { if (!gs.secondary) gift = gs.secondary = gs.primary === 'sinewed' ? 'barbed' : 'sinewed'; (g.tormentTP ||= [null, null])[side] = { tp: g.tp, n: tormentsTP + 1 }; }
  log(g, { zh: `${before} 變異成 ${t.name.zh}（${why.zh}）${gift ? `，獲得受詛恩賜「${CULT_GIFTS[gift].zh}」` : ''}`, en: `${beforeEn} mutates into a ${t.name.en} (${why.en})${gift ? `, gaining the Accursed Gift ${CULT_GIFTS[gift].en}` : ''}` }, `side${side}`);
  return true;
}
/** Mutation (strategic gambit): 2 / 2 / 3 / 4 operatives by turning point — those nearest the enemy first. */
function cultStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].chaosCult || g.cultTP?.[side] === g.tp) return;
  (g.cultTP ||= [0, 0])[side] = g.tp;
  let n = [2, 2, 3, 4][Math.min(g.tp, 4) - 1] || 4;
  const enemies = living(g, 1 - side), near = (o) => Math.min(99, ...enemies.map((e) => edgeDist(o, e)));
  const cands = living(g, side).filter((o) => tpl(o).devotee || tpl(o).mutant).sort((a, b) => (tpl(b).mutant ? 1 : 0) - (tpl(a).mutant ? 1 : 0) || near(a) - near(b));
  for (const o of cands) if (n > 0 && mutate(g, o, { zh: '策略階段', en: 'Strategy phase' })) n--;
  for (const o of living(g, side).filter((x) => isCult(x) && x.wounds < x.maxW)) if (n > 0 && mutate(g, o, { zh: '策略階段', en: 'Strategy phase' })) n--;
}
/** Ruinous Icon (Iconarch, PSYCHIC): Invigoration (friendlies within 4": Dmg 4+ deals 1 less) or Deterioration (enemies within 4": +1). */
function ruinousIconDmg(g, target, d) {
  for (const s of [0, 1]) {
    const ic = g.ruinous?.[s], by = ic && getOp(g, ic.by);
    if (!by || by.dead || edgeDist(by, target) > 4 || witchHunted(g, by)) continue;
    if (ic.mode === 'invigoration' && target.side === s && d >= 4) d -= 1;
    if (ic.mode === 'deterioration' && target.side === 1 - s && d > 0) d += 1;
  }
  return d;
}
/** Exaltation in Pain (ploy) / Sinewed (gift, melee): the Hit stat isn't worsened by being injured. */
// (Exodite Dragon Masters too: Survivalist Spirit, and Implacable Darkscale for the Leystalker's drakesteed fangs.)
const cultIgnoresInjury = (g, op, w) => injuredPenalty(g, op) && !contagion(g, op)
  && ((isCult(op) && (hasPloy(g, op.side, 'exaltationPain') || (w?.type === 'melee' && hasGift(g, op, 'sinewed'))))
    || (isEDM(op) && (op.survSpirit || (tpl(op).implacable && w?.id === 'edFangs'))));
/** Creatures of Nightmare / Sickening Aura (ploys): an enemy within 2" of a friendly Mutant or Torment. */
const nightmareNear = (g, o, ploy) => o.side < 2 && TEAM_MAP[g.teams[1 - o.side]]?.chaosCult && hasPloy(g, 1 - o.side, ploy) && living(g, 1 - o.side).some((m) => isWarped(m) && edgeDist(m, o) <= 2);

// ---------- Celestian Insidiants ----------
const isCI = (op) => !!TEAM_MAP[op?.team]?.insidiants;
// Keywords the team's rules look at (Fervent Hate).
const IMPERIUM_TEAMS = new Set(['angels', 'kasrkin', 'deathKorps', 'exaction', 'novitiates', 'battleclade', 'hunterClade', 'navyBreachers', 'phobos', 'celestianInsidiants']);
const CHAOS_TEAMS = new Set(['legionaries', 'warpcoven', 'gellerpox', 'blooded', 'plagueMarines', 'fellgor', 'chaosCult', 'goremongers']);
/** Inspiration: the operative becomes INSPIRING (its datacard weapons have Severe). */
function inspire(g, op, why) {
  if (!op || op.dead || !isCI(op) || op.inspiring) return;
  op.inspiring = true;
  log(g, { zh: `${opName(op, 'zh')} 變為激勵（${why.zh}）`, en: `${opName(op, 'en')} becomes INSPIRING (${why.en})` }, `side${op.side}`);
}
/** A friendly to inspire from `from` (visible within range, not inspiring yet): the strongest fighter. */
const pickInspire = (g, from, range = 6, not = null) => living(g, from.side).filter((o) => o !== not && o !== from && isCI(o) && !o.inspiring
  && edgeDist(o, from) <= range && visibility(g, from, o).visible).sort((a, b) => avgDmg(bestMelee(b)) - avgDmg(bestMelee(a)))[0] || null;
/** Null Field (Censor): an enemy within its null range (1" to 5"). */
const nullFielded = (g, op) => op.side < 2 && living(g, 1 - op.side).some((c) => tpl(c).nullField && edgeDist(c, op) <= (c.nullRange || 1));
/** Weapons of the Witch Hunters: within 3" of an enemy Insidiant — no Psychic actions or Psychic ranged weapons. */
const witchHunted = (g, op) => op.side < 2 && living(g, 1 - op.side).some((c) => isCI(c) && edgeDist(c, op) <= 3);
/** A Benediction (Martyrdom / Speak of Her Deeds), picked automatically: heal if hurt, else Ardour, else Wrath. */
function benediction(g, op) {
  let kind = op.maxW - op.wounds >= 4 ? 'restoration' : !op.ardour && !tpl(op).ciLeader ? 'ardour' : !op.wrath ? 'wrath' : 'restoration';
  if (kind === 'restoration' && op.wounds >= op.maxW) kind = !op.wrath ? 'wrath' : !op.ardour && !tpl(op).ciLeader ? 'ardour' : 'restoration';
  const name = { ardour: { zh: '熱忱：整場 APL +1', en: 'Ardour: +1 APL for the battle' }, wrath: { zh: '憤怒：整場武器「無休」', en: 'Wrath: Ceaseless for the battle' }, restoration: { zh: '復原', en: 'Restoration' } }[kind];
  if (kind === 'ardour') op.ardour = true;
  if (kind === 'wrath') op.wrath = true;
  let healed = 0;
  if (kind === 'restoration') { const b = op.wounds; op.wounds = Math.min(op.maxW, op.wounds + d3() + 2); healed = op.wounds - b; }
  log(g, { zh: `${opName(op, 'zh')} 獲得祝福「${name.zh}」${healed ? `，回復 ${healed} 生命` : ''}`, en: `${opName(op, 'en')} gains a Benediction — ${name.en}${healed ? `, regains ${healed}` : ''}` }, `side${op.side}`);
}
/** Martyrdom: an inspiring friendly is incapacitated — a friendly it's visible to or within 6" of gains a Benediction. */
function martyrdom(g, dead) {
  if (!isCI(dead) || !dead.inspiring || dead.side > 1) return;
  const t = living(g, dead.side).filter((o) => o !== dead && isCI(o) && (edgeDist(o, dead) <= 6 || visibility(g, dead, o).visible))
    .sort((a, b) => edgeDist(a, dead) - edgeDist(b, dead))[0];
  if (!t) return;
  log(g, { zh: `殉道：${opName(dead, 'zh')} 的犧牲激勵了 ${opName(t, 'zh')}`, en: `Martyrdom: ${opName(dead, 'en')}'s sacrifice blesses ${opName(t, 'en')}` }, `side${dead.side}`);
  benediction(g, t);
}
/** Speak of Her Deeds needs an inspiring friendly within 6" of the Denuncia. */
const deedsSource = (g, op) => living(g, op.side).some((s) => s.inspiring && (s === op || (edgeDist(op, s) <= 6 && visibility(g, op, s).visible)));
/** Simulacrum Nullificatus (Reliquarius): an enemy contesting a marker within 3" of it. */
const simulacrumNear = (g, o) => o.side < 2 && living(g, 1 - o.side).some((r) => tpl(r).simulacrum && edgeDist(r, o) <= 3);
/** Inspired Strikes (Insidiant Warrior): +1 Critical Dmg while inspiring. */
const inspCrit = (op) => (tpl(op).inspiredStrikes && op.inspiring ? 1 : 0);
/** Zealous Ultimatum declined: that enemy fighting or retaliating against an Insidiant has -1 Atk. */
const declinedVs = (g, o, foe) => !!foe && isCI(foe) && g.ultimatum?.[foe.side]?.uid === o.uid && g.ultimatum[foe.side].accepted === false;
/** Holy Defender (Abjuror, once per TP): it takes the attack meant for a friendly within 2" of it. */
function holySwap(g, target, weapon) {
  if (!target || target.side > 1 || !isCI(target) || tpl(target).holyDefender || weapon?.rules.blast || weapon?.rules.torrent) return target;
  const ab = living(g, target.side).find((o) => tpl(o).holyDefender && o.holyTP !== g.tp && edgeDist(o, target) <= 2 && visibility(g, o, target).visible);
  if (!ab) return target;
  ab.holyTP = g.tp;
  log(g, { zh: `聖衛：${opName(ab, 'zh')} 替 ${opName(target, 'zh')} 擋下攻擊`, en: `Holy Defender: ${opName(ab, 'en')} takes the attack for ${opName(target, 'en')}` }, `side${target.side}`);
  return ab;
}
/** Strategy phase: Zealous Ultimatum (Mortisanctus, once per battle) and Suspect & Eliminate (ploy). */
function insidiantsStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].insidiants || g.ciTP?.[side] === g.tp) return;
  (g.ciTP ||= [0, 0])[side] = g.tp;
  const mort = living(g, side).find((o) => tpl(o).ultimatum);
  if (mort && !g.ultimatum?.[side]) {
    const t = living(g, 1 - side).filter((e) => e.side < 2 && edgeDist(e, mort) <= 8).sort((a, b) => b.maxW - a.maxW)[0];
    if (t) {
      // (Whether the opponent accepts is rolled here, as for an NPO: 4+ accepts.)
      const r = d6(), accepted = r >= 4;
      (g.ultimatum ||= [null, null])[side] = { by: mort.uid, uid: t.uid, accepted };
      log(g, { zh: `${opName(mort, 'zh')} 熱誠的最後通牒：${opName(t, 'zh')}${accepted ? '接受（雙方近戰時闊劍 Atk +1）' : '拒絕（它對修女近戰時 Atk -1）'}（擲 ${r}）`, en: `${opName(mort, 'en')} Zealous Ultimatum: ${opName(t, 'en')} ${accepted ? 'accepts (+1 Atk for the broadsword between them)' : 'declines (-1 Atk fighting the Insidiants)'} (rolled ${r})` }, `side${side}`);
    }
  }
  if (hasPloy(g, side, 'suspectEliminate')) {
    const mine = living(g, side), near = (e) => Math.min(...mine.map((m) => dist(m, e)));
    const crowd = (e) => living(g, 1 - side).filter((o) => o !== e && edgeDist(o, e) <= 2 && visibility(g, e, o).visible);
    const t = living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => crowd(b).length - crowd(a).length || near(a) - near(b))[0];
    if (t) for (const e of [t, ...crowd(t)]) (e.suspect ||= [0, 0])[side] = g.tp;
    if (t) log(g, { zh: `懷疑與剷除：${opName(t, 'zh')} 和身邊 ${crowd(t).length} 名敵人得到懷疑標記`, en: `Suspect & Eliminate: ${opName(t, 'en')} and ${crowd(t).length} enemies by it gain Suspicion tokens` }, `side${side}`);
  }
}

// ---------- Canoptek Circle ----------
const MATRIX_HALF = 0.39; // the matrix lines are 20mm wide
const isCC = (op) => !!TEAM_MAP[op.team]?.obeliskNodes;
const nodesOf = (g, side) => (g.markers || []).filter((m) => m.kind === 'obeliskNode' && m.owner === side);
/** The matrix: the lines between this side's obelisk nodes that are within 6" of each other. */
function matrixSegs(g, side) {
  const n = nodesOf(g, side).slice(), segs = [];
  if (g.ccManip?.side === side) { const geo = g.ops.find((o) => o.uid === g.ccManip.uid && !o.dead); if (geo) n.push(geo); }
  for (let i = 0; i < n.length; i++) for (let j = i + 1; j < n.length; j++) if (dist(n[i], n[j]) <= 6) segs.push([n[i], n[j]]);
  return segs;
}
const segDist = (p, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};
/** Is the operative (any part of its base) within this side's matrix? */
export const inMatrix = (g, side, op) => !!op && side < 2 && matrixSegs(g, side).some(([a, b]) => segDist(op, a, b) - (op.tplId ? radius(op) : 0) <= MATRIX_HALF);
const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
const segsCross = (p1, p2, q1, q2) => cross(p1, p2, q1) * cross(p1, p2, q2) < 0 && cross(q1, q2, p1) * cross(q1, q2, p2) < 0;
/** Is this side's matrix intervening between the shooter and the target? */
const matrixBetween = (g, side, from, to) => matrixSegs(g, side).some(([a, b]) => segsCross(from, to, a, b));
/** Within the matrix, or with the matrix in the way of this shot (Hypershielding, Transdynamic Amplification, Shield Flare). */
const matrixCovers = (g, side, shooter, target) => inMatrix(g, side, target) || (!!shooter && matrixBetween(g, side, shooter, target));
const souldrained = (g, o, foe) => o.side < 2 && foe.side < 2 && TEAM_MAP[g.teams[1 - o.side]]?.obeliskNodes && hasPloy(g, 1 - o.side, 'souldrain')
  && !isCC(o) && (inMatrix(g, 1 - o.side, o) || (isCC(foe) && inMatrix(g, foe.side, foe)));
/** Manual set-up: the next obelisk node goes where the player taps (wholly in the territory, first turning point). */
export function nodePlace(g, side, p) {
  if (!TEAM_MAP[g.teams[side]].obeliskNodes || g.tp !== 1 || g.phase !== 'strategy' || nodesOf(g, side).length >= 3) return false;
  const b = boardOf(g);
  if (p.x < 0.5 || p.y < 0.5 || p.x > b.w - 0.5 || p.y > b.h - 0.5) return false;
  if (territoryOf(g, { x: p.x - 0.4, y: p.y - 0.4 }) !== side || territoryOf(g, { x: p.x + 0.4, y: p.y + 0.4 }) !== side) return false; // wholly within the territory
  if (g.terrain.some((t) => distPointRect(p, t) < 0.5) || [...g.objectives, ...g.markers].some((m) => dist(m, p) < 0.8)) return false;
  g.markers.push({ id: g.markers.length, kind: 'obeliskNode', owner: side, x: p.x, y: p.y, carriedBy: null });
  if (nodesOf(g, side).length === 3) {
    (g.nodeTP ||= [0, 0])[side] = g.tp;
    log(g, { zh: `${teamZh(g, side)} 放置 3 個方尖碑節點`, en: `${team(g, side).name.en} sets up its three obelisk nodes` }, `side${side}`);
  }
  return true;
}
/** Manual move: one obelisk node up to 3" (turning points after the first), once each. */
export function nodeMove(g, side, uid, p) {
  const n = nodesOf(g, side).find((m) => m.id === uid);
  if (!n || g.tp < 2 || g.phase !== 'strategy' || n.movedTP === g.tp) return false;
  const b = boardOf(g);
  if (p.x < 0.5 || p.y < 0.5 || p.x > b.w - 0.5 || p.y > b.h - 0.5 || dist(n, p) > 3 + 0.01) return false;
  if (g.terrain.some((t) => distPointRect(p, t) < 0.5)) return false;
  const from = { x: n.x, y: n.y };
  n.x = p.x; n.y = p.y; n.movedTP = g.tp;
  log(g, { zh: `${teamZh(g, side)} 方尖碑節點移動 ${dist(from, p).toFixed(1)}"`, en: `${team(g, side).name.en} moves an obelisk node ${dist(from, p).toFixed(1)}"` }, `side${side}`);
  return true;
}
// ---------- Universal equipment: Portable Barricade, Breaching Charge ----------
const portableOf = (g, op) => op.side < 2 && g.terrain.find((t) => t.portable && t.equip === op.side && distPointRect(op, t) - radius(op) <= 1.01);
/** Move With Barricade: 1AP, then a free Reposition of up to Move -2" that carries the barricade along. */
export function mvbActions(g, op, add) {
  if (!g.equip?.[op.side]?.includes('portableBarricade') || op.side > 1) return;
  const eng = isEngaged(g, op);
  add('mvBarricade', !eng && !!portableOf(g, op) && !op.acted.mvBarricade && !op.acted.fallBack && !op.acted.charge, eng ? { zh: '處於交戰中', en: 'Engaged' } : { zh: '沒有連著路障（1" 內）', en: 'Not connected to a portable barricade (within 1")' });
}
export function mvbSelf(g, op, id) {
  if (id !== 'mvBarricade') return false;
  const t = portableOf(g, op);
  if (!t) return true;
  spend(g, op, id);
  op.acted.mvBarricade = 1; op.mvb = true;
  op.acted.free = { ...(op.acted.free || {}), reposition: true };
  log(g, { zh: `${opName(op, 'zh')} 隨路障移動：免費重新定位（最多 Move -2"），路障跟著走`, en: `${opName(op, 'en')} Move With Barricade: a free Reposition (Move -2" at most), the barricade moves along` }, `side${op.side}`);
  return true;
}
/** After a Reposition that carried a barricade: it moves the same way (it stays where it is if that spot is blocked). */
export function mvbMoved(g, op, from, t) {
  op.mvb = false;
  if (!t) return;
  const dx = op.x - from.x, dy = op.y - from.y, moved = { ...t, x: t.x + dx, y: t.y + dy };
  const b = boardOf(g);
  if (moved.x < 0 || moved.y < 0 || moved.x + moved.w > b.w || moved.y + moved.h > b.h) return;
  if (g.terrain.some((o) => o !== t && distRectRect(moved, o) < 0.1)) return;
  t.x = moved.x; t.y = moved.y;
}
const distRectRect = (a, b) => Math.hypot(Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w)), Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h)));
/** Protective: in cover with a friendly portable barricade at hand, the Save is improved by 1. */
const protectiveBonus = (g, target) => (target.side < 2 && g.terrain.some((t) => t.protective && t.equip === target.side && distPointRect(target, t) - radius(target) <= 1.01) ? 1 : 0);
// ---------- Canoptek Circle: Nodal Response, Animate Obelisk Nodes, faction equipment ----------
const ccEquip = (g, side, id) => !!g.equip?.[side]?.includes(id);
/** Awakened Obelisk Nodes: after revealing it, D3 uses of Animate Obelisk Nodes cost 0CP. */
const ccAwakenedFree = (g, side, id) => id === 'animateNodes' && (g.awakened?.[side] || 0) > 0;
/** Phase Shifter: once per TP, the first shot at the Geomancer has Piercing worsened by 1. */
function ccPhaseStart(g, op, target) {
  g.ccPhase = null;
  if (!target || target.side > 1 || !tpl(target).ccLeader || !ccEquip(g, target.side, 'ccPhase') || g.ccPhaseTP?.[target.side] === g.tp) return;
  (g.ccPhaseTP ||= [0, 0])[target.side] = g.tp; g.ccPhase = target.uid;
  log(g, { zh: '相位轉換器：這次射擊的穿甲 -1', en: 'Phase Shifter: Piercing is worsened by 1 for this shot' }, `side${target.side}`);
}
/** Matrix Manipulator: once per battle, in an activation, the Geomancer counts as a fourth node until it ends (used when it would add a line to the matrix). */
function ccManipActivate(g, op) {
  if (!g.counter && isCC(op) && op.side < 2 && ccEquip(g, op.side, 'ccCaskets') && op.wounds < op.maxW) { const h = Math.min(op.maxW - op.wounds, d3()); op.wounds += h; log(g, { zh: `納米甲蟲匣：${opName(op, 'zh')} 回復 ${h} 生命`, en: `Nanoscarab Caskets: ${opName(op, 'en')} regains ${h} wounds` }, `side${op.side}`); }
  g.ccManip = null;
  if (g.counter || !isCC(op) || op.side > 1 || !ccEquip(g, op.side, 'ccManip') || g.ccManipUsed?.[op.side] || inMatrix(g, op.side, op)) return;
  const geo = living(g, op.side).find((o) => tpl(o).ccLeader);
  if (!geo) return;
  g.ccManip = { side: op.side, uid: geo.uid };
  if (!inMatrix(g, op.side, op)) { g.ccManip = null; return; }
  (g.ccManipUsed ||= [false, false])[op.side] = true;
  log(g, { zh: '矩陣操縱器：地占術士視為第四個方尖碑節點，直到這次啟動結束', en: 'Matrix Manipulator: the Geomancer counts as a fourth obelisk node until the end of this activation' }, `side${op.side}`);
}
/** Reveal Awakened Obelisk Nodes (when the equipment is first used): rolls one D3. */
function ccRevealAwakened(g, side) {
  if (!ccEquip(g, side, 'ccAwakened') || g.awakened?.[side] != null) return;
  (g.awakened ||= [null, null])[side] = d3();
  log(g, { zh: `覺醒方尖碑節點：可以 0CP 使用「驅動方尖碑節點」${g.awakened[side]} 次`, en: `Awakened Obelisk Nodes: Animate Obelisk Nodes is free ${g.awakened[side]} time(s)` }, `side${side}`);
}
/** Animate Obelisk Nodes: instead of activating, move nodes up to 6" in all (each distance rounded up). */
export function animateBegin(g, side) {
  if (g.phase !== 'firefight' || g.turn !== side || g.active || g.counter || g.animating || !TEAM_MAP[g.teams[side]].obeliskNodes || !nodesOf(g, side).length) return false;
  ccRevealAwakened(g, side);
  if (!ffReady(g, side, 'animateNodes')) return false;
  const free = ccAwakenedFree(g, side, 'animateNodes');
  if (free) g.awakened[side]--;
  g.ccFree = free; spendFF(g, side, 'animateNodes'); g.ccFree = false;
  g.animating = { side, left: 6 };
  return true;
}
export function animateMove(g, side, uid, p) {
  const a = g.animating, n = a && a.side === side && nodesOf(g, side).find((m) => m.id === uid);
  if (!n) return false;
  const b = boardOf(g), d = Math.ceil(dist(n, p) - 1e-6);
  if (p.x < 0.5 || p.y < 0.5 || p.x > b.w - 0.5 || p.y > b.h - 0.5 || d > a.left || g.terrain.some((t) => distPointRect(p, t) < 0.5)) return false;
  n.x = p.x; n.y = p.y; a.left -= d;
  return true;
}
export function animateEnd(g, side) {
  if (!g.animating || g.animating.side !== side) return false;
  log(g, { zh: `${teamZh(g, side)} 驅動方尖碑節點（用掉 ${6 - g.animating.left}"）`, en: `${team(g, side).name.en} animates its obelisk nodes (${6 - g.animating.left}" used)` }, `side${side}`);
  g.animating = null;
  handOff(g, side);
  return true;
}
/** Nodal Response (opened by the firefight button): use a strategy ploy now, or change one already used this TP (extra CP only if dearer). */
export function nodalChoose(g, side, newId, oldId = null) {
  if (g.nodalOpen !== side) return false;
  const ploy = team(g, side).ploys.find((p) => p.id === newId), old = oldId && team(g, side).ploys.find((p) => p.id === oldId);
  if (!ploy || (oldId && (!old || !g.ploys[side].includes(oldId)))) return false;
  if (!old && ployTaken(g, side, ploy)) return false;
  if (old && ployTaken({ ...g, ploys: g.ploys.map((l, i) => (i === side ? l.filter((x) => x !== oldId) : l)) }, side, ploy)) return false;
  const cost = old ? Math.max(0, ployCost(g, side, ploy) - old.cp) : ployCost(g, side, ploy);
  if (g.cp[side] < cost) return false;
  g.cp[side] -= cost;
  if (old) g.ploys[side][g.ploys[side].indexOf(oldId)] = newId; else g.ploys[side].push(newId);
  pmPloyBought(g, side, ploy); kmPloyBought(g, side, ploy); pfPloyBought(g, side, ploy); dkPloyBought(g, side, ploy); adPloyBought(g, side, ploy);
  g.nodalOpen = null;
  log(g, { zh: `${teamZh(g, side)} 節點回應：${old ? `「${old.name.zh}」改為` : '使用'}「${ploy.name.zh}」`, en: `${team(g, side).name.en} Nodal Response: ${old ? `${old.name.en} becomes ` : 'uses '}${ploy.name.en}` }, `side${side}`);
  return true;
}
/** The player is done with the nodes this turning point (moved as far as they wished). */
export function nodesDone(g, side) { (g.nodeTP ||= [0, 0])[side] = g.tp; }
export const nodesLeftToPlace = (g, side) => (g.tp === 1 ? 3 - nodesOf(g, side).length : 0);
export const nodeList = (g, side) => nodesOf(g, side);
/** Nodes: set up in the first Strategy phase (in your territory), then moved up to 3" each turning point after. */
export function placeNodes(g, side) {
  if (!TEAM_MAP[g.teams[side]].obeliskNodes || g.nodeTP?.[side] === g.tp) return;
  if (g.tp > 1 && isComputer(g, side)) { /* the computer moves its nodes below */ } else if (g.tp > 1) return; // (a player moves them by hand)
  (g.nodeTP ||= [0, 0])[side] = g.tp;
  const mine = living(g, side);
  if (!mine.length) return;
  const along = g.axis === 'y' ? 'y' : 'x', perp = along === 'x' ? 'y' : 'x';
  const size = { x: boardOf(g).w, y: boardOf(g).h }, mid = size[along] / 2;
  const low = territoryOf(g, { [along]: 1, [perp]: size[perp] / 2 }) === side; // our territory is the low half
  const c = { x: mine.reduce((s, o) => s + o.x, 0) / mine.length, y: mine.reduce((s, o) => s + o.y, 0) / mine.length };
  const clampPerp = (v) => Math.max(1, Math.min(size[perp] - 1, v));
  const nodes = nodesOf(g, side);
  if (g.tp === 1 && nodes.length < 3) {
    // In a line across the killzone, 5" apart, as far forward as our territory allows.
    const front = low ? Math.min(c[along] + 2, mid - 1) : Math.max(c[along] - 2, mid + 1);
    const centre = clampPerp(Math.max(6, Math.min(size[perp] - 6, c[perp])));
    for (const off of [-5, 0, 5].slice(nodes.length)) g.markers.push({ id: g.markers.length, kind: 'obeliskNode', owner: side, [along]: front, [perp]: clampPerp(centre + off), carriedBy: null });
    log(g, { zh: `${teamZh(g, side)} 放置 3 個方尖碑節點`, en: `${team(g, side).name.en} sets up its three obelisk nodes` }, `side${side}`);
    return;
  }
  // Up to 3" each, together (so the matrix holds): towards the nearest objective we don't control.
  const nc = { x: nodes.reduce((s, n) => s + n.x, 0) / nodes.length, y: nodes.reduce((s, n) => s + n.y, 0) / nodes.length };
  const goal = (g.objectives || []).filter((o) => controller(g, o) !== side).sort((a, b) => dist(a, nc) - dist(b, nc))[0];
  if (!goal) return;
  const d = dist(goal, nc), step = Math.min(3, Math.max(0, d - 1));
  if (step < 0.5) return;
  const vx = (goal.x - nc.x) / d * step, vy = (goal.y - nc.y) / d * step;
  for (const n of nodes) { n.x = Math.max(0.5, Math.min(boardOf(g).w - 0.5, n.x + vx)); n.y = Math.max(0.5, Math.min(boardOf(g).h - 0.5, n.y + vy)); }
  log(g, { zh: `${teamZh(g, side)} 方尖碑節點移動 ${step.toFixed(1)}"`, en: `${team(g, side).name.en} moves its obelisk nodes ${step.toFixed(1)}"` }, `side${side}`);
}
/** Geomantic Disturbance: the point of terrain nearest this enemy, if within 2" of it and within 8" of the Geomancer. */
function geoPoint(g, op, t) {
  let best = null;
  for (const r of g.terrain) {
    const p = { x: Math.max(r.x, Math.min(r.x + r.w, t.x)), y: Math.max(r.y, Math.min(r.y + r.h, t.y)) };
    if (dist(p, t) - radius(t) > 2 || dist(op, p) - radius(op) > 8) continue;
    if (!best || dist(p, t) < dist(best, t)) best = p;
  }
  return best;
}
/** A Ceaseless Scuttling (Macrocyte Warriors): from the second turning point, a new Warrior if fewer than three remain. */
function ceaselessScuttling(g, side) {
  if (!TEAM_MAP[g.teams[side]].obeliskNodes || g.tp < 2 || g.scuttleTP?.[side] === g.tp) return;
  (g.scuttleTP ||= [0, 0])[side] = g.tp;
  if (living(g, side).filter((o) => tpl(o).ccWarrior).length >= 3) return;
  const t = TEAM_MAP[g.teams[side]].ops.find((o) => o.id === 'ccWarrior');
  const num = g.ops.filter((o) => o.side === side).length + 1;
  const op = { uid: `${side}-${num}`, side, team: g.teams[side], tplId: t.id, num, x: -99, y: -99, wounds: t.wounds, maxW: t.wounds, order: 'conceal', ready: true, ap: 0, acted: {},
    ml: 0, aplNext: 0, used: {}, poison: false, damagedTP: false, dead: false, counteracted: false, actTP: 0, movedTP: 0, placed: false };
  g.ops.push(op);
  if (!placeAuto(g, side, [op]).length) { g.ops.splice(g.ops.indexOf(op), 1); return; }
  op.placed = true;
  log(g, { zh: `${teamZh(g, side)} 無盡爬行：新的巨細胞戰士在降落區就位`, en: `${team(g, side).name.en} A Ceaseless Scuttling: a new Macrocyte Warrior is set up in the drop zone` }, `side${side}`);
}
/** Dimensional Banishment (transdimensional isolator): after it damaged or retained a crit, 2D6 above the wounds left = gone. */
function banish(g, op, target, res) {
  if (!target || target.dead || tpl(target).nemesis || !(res?.dmg > 0 || res?.attack?.crits > 0)) return;
  const r = d6() + d6();
  log(g, { zh: `跨維度放逐：擲 ${r}（${opName(target, 'zh')} 剩 ${target.wounds} 生命）`, en: `Dimensional Banishment: rolls ${r} (${opName(target, 'en')} has ${target.wounds} wounds left)` }, `side${op.side}`);
  if (r > target.wounds) { target.noReanimate = true; killOff(g, op, target); }
}

// ---------- Brood Brothers ----------
const isBrood = (op) => !!TEAM_MAP[op.team]?.broodBrothers;
/** Leaders: the Broodcoven operative if one was selected, otherwise the Commander. */
const broodLeader = (g, op) => isBrood(op) && !!tpl(op).bbLeader && (!!tpl(op).broodcoven || !g.ops.some((o) => o.side === op.side && tpl(o).broodcoven));
/** Broodguard: everyone but the Broodcoven and the Psychic Familiars. */
const broodguard = (op) => isBrood(op) && !tpl(op).broodcoven && op.tplId !== 'bbFamiliar';
/** Spiritual Leader (Magus, strategic gambit): this side's chosen benefit, while the Magus lives. */
const spiritual = (g, op, mode) => isBrood(op) && g.spiritual?.[op.side]?.tp === g.tp && g.spiritual[op.side].mode === mode
  && living(g, op.side).some((o) => tpl(o).spiritualLeader);
const crossfire = (t, side) => t?.crossfire?.[side] || 0;
/** "A valid target for this operative" for actions (visible, and not Concealed in cover). */
const PROBE = { id: 'bbProbe', name: { zh: '', en: '' }, type: 'ranged', atk: 0, hit: 6, dmg: [0, 0], rules: {}, group: 'bbProbe' };
const broodValid = (g, op, t) => !!validTarget(g, op, t, PROBE);
function gainCrossfire(g, side, t) {
  if (!t || t.dead || t.side === side || t.side > 1) return;
  (t.crossfire ||= [0, 0])[side]++;
  log(g, { zh: `${opName(t, 'zh')} 得到交叉火力標記（${t.crossfire[side]}）`, en: `${opName(t, 'en')} gains a Crossfire token (${t.crossfire[side]})` }, `side${side}`);
}
/** After a Brood Brother's attack dice are resolved: the enemy, if still standing, gains a Crossfire token. */
function broodMark(g, op, target) { if (isBrood(op) && op.side < 2 && target && !target.dead) gainCrossfire(g, op.side, target); }
/** Uprising (ploy): the first Shoot / Fight after springing from Conceal marks the target as soon as it's selected. */
function uprising(g, op, target) {
  if (!isBrood(op) || !hasPloy(g, op.side, 'uprising') || op.counter || g.active !== op.uid || op.acted.uprisingUsed) return;
  if (!sprungNow(op) || op.bbStartEngaged) return;
  op.acted.uprisingUsed = true;
  gainCrossfire(g, op.side, target);
}
/** Psiren Caster, Crossfire tokens (one re-roll each) and Idolisation, after a Brood Brother rolls its attack dice. */
function broodRerolls(g, op, target, pool, noReroll = false) {
  if (!isBrood(op) || !target || op.side > 1) return;
  const fail = () => pool.dice.find((d) => d.res === 'miss' && !d.rr && !d.auto);
  const blocked = noReroll || noRerollHere(g, op) || voxbroken(g, op) || neurostatic(g, op) || broadcastNear(g, op);
  if (!blocked) {
    const reroll = (d) => { d.v = d6(); d.rr = true; tally(pool); };
    if (fail() && living(g, op.side).some((a) => tpl(a).psiren && edgeDist(a, target) <= 6)) {
      reroll(fail());
      log(g, { zh: '心靈警報器：重擲一顆攻擊骰', en: 'Psiren Caster: one attack die re-rolled' }, `side${op.side}`);
    }
    let used = 0;
    while (crossfire(target, op.side) > 0 && fail()) { target.crossfire[op.side]--; used++; reroll(fail()); }
    if (used) log(g, { zh: `交叉火力：移除 ${used} 個標記，重擲 ${used} 顆攻擊骰`, en: `Crossfire: ${used} token(s) removed to re-roll ${used} attack dice` }, `side${op.side}`);
  }
  // Idolisation (firefight ploy): one fail is retained as a normal success, else a normal as a critical.
  if (ffOn(g, op, 'idolisation')) {
    const m = pool.dice.find((d) => d.res === 'miss' && !d.auto), n = pool.dice.find((d) => d.res === 'norm' && !d.auto);
    if (m) m.faith = 'norm'; else if (n) n.faith = 'crit';
    tally(pool);
  }
}
/** Unquestioning Loyalty (firefight ploy, automatic): a friendly Broodguard within 3" takes the Leader's place. */
// (Sacrificial Thrall, Canoptek Circle: the same for the Geomancer, with a Canoptek construct.)
function loyalSwap(g, attacker, target, weapon) {
  if (!target || target.side > 1 || weapon?.rules.blast || weapon?.rules.torrent) return target;
  // (Faithful Follower, Chaos Cult: a Dark Commune operative, swapped with a friendly that isn't Dark Commune.)
  const thrall = !!tpl(target).ccLeader, commune = isCult(target) && !!tpl(target).darkCommune;
  const id = thrall ? 'sacrificialThrall' : commune ? 'faithfulFollower' : 'unquestioningLoyalty';
  if ((!thrall && !commune && !broodLeader(g, target)) || !ffDef(g, target.side, id)) return target;
  const fits = (o) => (thrall ? tpl(o).canoptek : commune ? isCult(o) && !tpl(o).darkCommune : broodguard(o) && !broodLeader(g, o));
  const guard = living(g, target.side).filter((o) => o !== target && fits(o) && edgeDist(o, target) <= 3 && visibility(g, target, o).visible)
    .sort((a, b) => (tpl(b).bodyguard ? 1 : 0) - (tpl(a).bodyguard ? 1 : 0) || b.wounds - a.wounds)[0];
  if (!guard) return target;
  g.loyalFree = !!tpl(guard).bodyguard; // Bodyguard (Veteran): 0CP
  const used = autoFF(g, target.side, id);
  g.loyalFree = false;
  if (!used) return target;
  const nm = ffDef(g, target.side, id).name;
  log(g, { zh: `${nm.zh}：${opName(guard, 'zh')} 替 ${opName(target, 'zh')} 擋下攻擊`, en: `${nm.en}: ${opName(guard, 'en')} takes the attack for ${opName(target, 'en')}` }, `side${target.side}`);
  return guard;
}
/** Explosives (Sapper): the first use places the marker, the second deals 2D6 to everyone within 2" of it. */
function detonateExplosives(g, op) {
  const m = (g.markers || []).find((x) => x.kind === 'explosives' && x.owner === op.side && x.by === op.uid);
  if (!m) return;
  g.markers.splice(g.markers.indexOf(m), 1);
  for (const o of g.ops.filter((x) => !x.dead && x.x > -50 && dist(x, m) - radius(x) <= 2)) {
    // (Heavy terrain wholly in the way protects: the line from the marker to the operative's centre crosses Heavy terrain.)
    if (g.terrain.some((t) => t.kind === 'heavy' && segRect(m, o, t))) continue;
    const dmg = d6() + d6();
    log(g, { zh: `爆破：${opName(o, 'zh')} 受到 ${dmg} 傷害`, en: `Explosives: ${opName(o, 'en')} takes ${dmg} damage` }, `side${op.side}`);
    applyDamage(g, op, o, dmg);
  }
}
/** Strategy phase gambits: Coordinate (Commander) marks an enemy; Spiritual Leader (Magus) picks ignore-Piercing. */
function broodStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].broodBrothers || g.broodTP?.[side] === g.tp) return;
  (g.broodTP ||= [0, 0])[side] = g.tp;
  const mine = living(g, side);
  if (mine.some((o) => tpl(o).coordinate)) {
    const near = (e) => Math.min(...mine.map((m) => dist(m, e)));
    const t = living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => near(a) - near(b))[0];
    if (t) { log(g, { zh: `${teamZh(g, side)} 協調：`, en: `${team(g, side).name.en} Coordinate:` }, `side${side}`); gainCrossfire(g, side, t); }
  }
  if (mine.some((o) => tpl(o).spiritualLeader)) {
    (g.spiritual ||= [null, null])[side] = { tp: g.tp, mode: 'piercing' };
    log(g, { zh: `${teamZh(g, side)} 精神領袖：本回合友方被射擊時忽略穿甲`, en: `${team(g, side).name.en} Spiritual Leader: this TP, friendlies ignore Piercing when shot` }, `side${side}`);
  }
}

// ---------- Blades of Khaine ----------
const CATAPULTS = ['bkCatapult', 'bkTwinCatapult'];
const isBlade = (op) => !!TEAM_MAP[op.team]?.bladesOfKhaine;
/** Shimmershield (Dire Avenger Exarch with that option): a friendly visible within 2" of it ignores Piercing when shot. */
const shimmered = (g, target) => isBlade(target) && living(g, target.side).some((o) => tpl(o).shimmershield && ['direShield', 'powerShield'].includes(o.loadout)
  && (o === target || (edgeDist(o, target) <= 2 && visibility(g, o, target).visible)));
/** After a Fight in which a Blade incapacitated its enemy during its own activation: Strike and Fade, else The Woe. */
function bladesAfterFight(g, a, d) {
  if (!isBlade(a) || a.dead || !d.dead || g.active !== a.uid) return;
  if (!foes(g, a).some((e) => edgeDist(e, a) <= 3) && autoFF(g, a.side, 'ssFade', a)) {
    a.order = 'conceal';
    a.acted.free = { ...(a.acted.free || {}), dash: 'fade' };
    log(g, { zh: `${opName(a, 'zh')} 打擊後隱沒：改為隱蔽指令，可以免費衝刺一次`, en: `${opName(a, 'en')} Strike and Fade: switches to Conceal and may Dash for free` }, `side${a.side}`);
    return;
  }
  // The Woe: it Charged, then Fought — nothing else — and isn't in an enemy's control range now.
  const others = Object.keys(a.acted).some((k) => ACTIONS[k] && a.acted[k] && k !== 'charge' && k !== 'fight');
  if (count(a, 'charge') === 1 && !others && (a.acted.woeLeft || 0) >= 0.5 && !isEngaged(g, a) && autoFF(g, a.side, 'hbWoe', a)) {
    a.acted.free = { ...(a.acted.free || {}), charge: 'woe' };
    log(g, { zh: `${opName(a, 'zh')} 悲嘆：用剩下的 ${a.acted.woeLeft.toFixed(1)}" 免費再衝鋒一次`, en: `${opName(a, 'en')} The Woe: a free Charge with the remaining ${a.acted.woeLeft.toFixed(1)}"` }, `side${a.side}`);
  }
}
/** Dance of Death (strategy ploy, automatic): the better fighter further from the enemy swaps with a friendly in front. */
function danceOfDeath(g, side) {
  if (!TEAM_MAP[g.teams[side]].bladesOfKhaine || !hasPloy(g, side, 'danceOfDeath') || g.danceTP?.[side] === g.tp) return;
  (g.danceTP ||= [0, 0])[side] = g.tp;
  const mine = living(g, side), enemies = living(g, 1 - side);
  if (!enemies.length) return;
  const near = (o) => Math.min(...enemies.map((e) => dist(o, e)));
  const melee = (o) => avgDmg(bestMelee(o)) - Math.max(0, ...weaponsFor(g, o).filter((w) => w.type === 'ranged').map((w) => avgDmg(w)));
  let best = null;
  for (const a of mine) for (const b of mine) {
    if (a === b || edgeDist(a, b) > 6 || !visibility(g, a, b).visible) continue;
    const gain = (near(a) - near(b)) * (melee(a) - melee(b)); // a: the fighter at the back, b: the one in front
    if (gain > 1 && (!best || gain > best.gain)) best = { a, b, gain };
  }
  if (!best) return;
  const { a, b } = best;
  [a.x, a.y, b.x, b.y] = [b.x, b.y, a.x, a.y];
  log(g, { zh: `${teamZh(g, side)} 死亡之舞：${opName(a, 'zh')} 與 ${opName(b, 'zh')} 交換位置`, en: `${team(g, side).name.en} Dance of Death: ${opName(a, 'en')} and ${opName(b, 'en')} swap places` }, `side${side}`);
}

// ---------- Battleclade ----------
const isServitor = (op) => !!tpl(op).servitor;
/** Within 6" of a friendly Auto-proxy or the Servitor Underseer (Noospheric Possession, Network Override, Datacoronal Accumulator). */
const nearRelay = (g, op, d = 6) => living(g, op.side).some((r) => (tpl(r).autoProxy || tpl(r).underseer) && edgeDist(r, op) <= d);
/** Achillan Eye (Auto-proxy): shooting an enemy it can see — Saturate (not while it's in an enemy's control range). */
const achillan = (g, op, target) => !!target && living(g, op.side).some((p) => tpl(p).achillanEye && sameTeam(p, op) && !isEngaged(g, p) && visibility(g, p, target).visible);
/** Servitors that can NETWORK COUNTERACT now (APL 2+, not done this TP, not the one that just activated). */
export function netCands(g, side) {
  const n = g.netcounter;
  return living(g, side).filter((o) => isServitor(o) && o.netTP !== g.tp && !o.counteracted && aplNow(g, o) >= 2 && o.uid !== n?.by && (!n?.only || n.only.includes(o.uid)));
}
/** End of a side's Strategy phase: the Prioritised Acquisition marker is the objective nearest the team. */
function battlecladeStrategyEnd(g, side) {
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
  const result = availableActions(g,probe).filter(a => allowed.includes(a.id) && a.ok);
  if ((g.markers || []).some(m=>m.carriedBy===op.uid)) result.push({id:'seekerPlace',ap:0,ok:true});
  return result;
}

function seekerZoneGap(g, op, p) {
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

// ---------- Legionaries ----------
const markOf = (op) => tpl(op).mark || null;
/** Siphon Life (Balefire Acolyte, once per turning point): the most hurt friendly visible within 6" regains 1 per damaging die (D3 per critical one). */
function siphonLife(g, op, crits) {
  if (!crits.length || op.siphonTP === g.tp) return;
  const t = living(g, op.side).filter((o) => o.wounds < o.maxW && edgeDist(op, o) <= 6 && (o === op || visibility(g, op, o).visible)).sort((a, b) => (b.maxW - b.wounds) - (a.maxW - a.wounds))[0];
  if (!t) return;
  op.siphonTP = g.tp;
  const before = t.wounds;
  t.wounds = Math.min(t.maxW, t.wounds + crits.reduce((s, c) => s + (c ? d3() : 1), 0));
  log(g, { zh: `吸取生命：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Siphon Life: ${opName(t, 'en')} regains ${t.wounds - before} wounds` }, `side${op.side}`);
}
/** Disgusting Vigour (Nurgle): Normal Dmg of 3+ — on a 5+ it deals 1 less. */
function nurgleVigour(g, target, amount) {
  if (markOf(target) !== 'nurgle' || amount < 3) return amount;
  return d6() >= 5 ? amount - 1 : amount;
}
/** Unleash Daemon (Anointed): Normal and Critical Dmg of 4+ deal 1 less. */
const daemonShell = (t, d) => (t.unleashed && d >= 4 ? d - 1 : d);
/** Grisly Mark (Shrivetalon): an enemy within 3" of the marker. */
const grislyNear = (g, op) => op.side < 2 && (g.markers || []).some((m) => m.kind === 'grisly' && m.owner === 1 - op.side && dist(op, m) - radius(op) <= 3);
/** Quicksilver Speed (ploy): the Legionary moved this turning point. */
const quick = (g, op) => op.side < 2 && TEAM_MAP[op.team].marksOfChaos && hasPloy(g, op.side, 'quicksilver') && (op.movedTP || 0) > 0;

// ---------- Novitiates: Acts of Faith ----------
export const FAITH_ACTS = {
  guidance: { cost: 1, name: { zh: '引導', en: 'Guidance' }, desc: { zh: '重擲一顆骰', en: 're-roll one die' } },
  blessing: { cost: 2, name: { zh: '祝福', en: 'Blessing' }, desc: { zh: '一顆普通成功當暴擊', en: 'a normal success becomes critical' } },
  intervention: { cost: 3, name: { zh: '干預', en: 'Intervention' }, desc: { zh: '一顆失敗當普通成功', en: 'a fail becomes a normal success' } },
};
export const faithOf = (g, side) => g.faith?.[side] || 0;
function gainFaith(g, side, n, why) {
  if (n <= 0 || side > 1 || !TEAM_MAP[g.teams[side]].actsOfFaith) return;
  (g.faith ||= [0, 0])[side] += n;
  log(g, { zh: `${teamZh(g, side)} 獲得 ${n} 信仰點（${why.zh}，共 ${g.faith[side]}）`, en: `${team(g, side).name.en} gains ${n} Faith (${why.en}, ${g.faith[side]} total)` }, `side${side}`);
}
/** The die an Act of Faith would affect (the first fail to re-roll / promote, or a normal success to bless). */
function faithDie(pool, act) {
  const want = act === 'blessing' ? 'norm' : 'miss';
  return pool.dice.findIndex((d) => d.res === want && !d.auto && !d.faith);
}
/** Acts of Faith this side can use on this roll now: [{id, cost, ok}]. holder: a shooting sequence or a fight side; which: 'a' | 'd'. */
export function faithOptions(g, side, holder, which) {
  if (side > 1 || !TEAM_MAP[g.teams[side]]?.actsOfFaith || !holder || holder.faithUsed?.[which]) return [];
  const pool = holder[which === 'a' ? 'a' : 'd'];
  if (!pool) return [];
  return Object.entries(FAITH_ACTS).map(([id, a]) => ({ id, cost: a.cost, ok: faithOf(g, side) >= a.cost && faithDie(pool, id) >= 0 }));
}
export const canFaith = (g, side, holder, which) => faithOptions(g, side, holder, which).some((o) => o.ok);
/** Spend Faith on an Act of Faith for this roll. */
export function useFaith(g, side, holder, which, act, opUid = null) {
  const o = faithOptions(g, side, holder, which).find((x) => x.id === act && x.ok);
  if (!o) return false;
  const pool = holder[which === 'a' ? 'a' : 'd'], d = pool.dice[faithDie(pool, act)];
  g.faith[side] -= o.cost;
  (holder.faithUsed ||= {})[which] = true;
  const old = d.v;
  if (act === 'guidance') { d.v = d6(); d.rr = true; } else d.faith = act === 'blessing' ? 'crit' : 'norm';
  tally(pool);
  const extra = act === 'guidance' ? { zh: `：${old} → ${d.v}`, en: `: ${old} → ${d.v}` } : { zh: '', en: '' };
  log(g, { zh: `${teamZh(g, side)} 信仰行為「${FAITH_ACTS[act].name.zh}」（-${o.cost} 信仰）${extra.zh}`, en: `${team(g, side).name.en} Act of Faith: ${FAITH_ACTS[act].name.en} (-${o.cost} Faith)${extra.en}` }, `side${side}`);
  // Blessed Rejuvenation: the operative regains D3 at the end of the action.
  if (opUid && hasPloy(g, side, 'blessedRejuv')) (g.faithHeal ||= []).push(opUid);
  return true;
}
/** The computer's Act of Faith for a roll: the strongest one it can afford when it helps, or null. */
export function aiFaith(g, side, holder, which) {
  const opts = faithOptions(g, side, holder, which).filter((o) => o.ok);
  if (!opts.length) return null;
  const pool = holder[which === 'a' ? 'a' : 'd'];
  if (which === 'd') { // defence: only when attack successes would still get through
    const att = holder.a.crits + holder.a.norms, def = pool.crits + pool.norms + (holder.coverN || 0) + (holder.coverC || 0);
    if (att <= def) return null;
  }
  return (opts.find((o) => o.id === 'intervention' && faithOf(g, side) >= 5) || opts.find((o) => o.id === 'blessing') || opts.find((o) => o.id === 'guidance') || opts.find((o) => o.id === 'intervention'))?.id || null;
}
/** Blessed Rejuvenation: heal the operatives Faith was spent on this action. */
function faithRejuvenate(g) {
  for (const uid of g.faithHeal || []) {
    const o = getOp(g, uid);
    if (!o || o.dead || o.wounds >= o.maxW) continue;
    const before = o.wounds; o.wounds = Math.min(o.maxW, o.wounds + d3());
    log(g, { zh: `${opName(o, 'zh')} 神聖回春：回復 ${o.wounds - before} 生命`, en: `${opName(o, 'en')} Blessed Rejuvenation: regains ${o.wounds - before} wounds` }, `side${o.side}`);
  }
  g.faithHeal = [];
}
/** Ready step: Faith equal to half the living Novitiates (rounding up). */
function readyFaith(g, side) {
  if (!TEAM_MAP[g.teams[side]].actsOfFaith) return;
  gainFaith(g, side, Math.ceil(living(g, side).length / 2), { zh: '準備步驟', en: 'Ready step' });
}
/** The operative contests an objective marker (Defenders of the Faith). */
const contesting2 = (g, op) => (g.objectives || []).some((o) => !o.carriedBy && dist(op, o) - radius(op) - OBJ_R <= CONTROL);
const isPsyker = (op) => !!tpl(op).psyker || !!tpl(op).sorcerer || tpl(op).weapons.some((w) => w.rules.psychic);
/** Null Rod (Condemnor): an enemy within 6" of a Condemnor can't use PSYCHIC ranged weapons or actions. */
const nullRodded = (g, op) => op.side < 2 && (living(g, 1 - op.side).some((c) => tpl(c).nullRodAura && edgeDist(c, op) <= 6)
  || living(g).some((c) => c !== op && tpl(c).psychicNull && edgeDist(c, op) <= 6)); // (Psychic Null, Sisters of Silence: friend or foe)
const PSYCHIC_ACTIONS = ['vdMirror', 'vdFog', 'fate', 'ravage', 'alight', 'miasma', 'soulChannel', 'soulHeal', 'wardingShield', 'warpFold', 'telepathicOverload', 'mentalOnslaught', 'ruinousInvig', 'ruinousDeter', 'heinousDeluge', 'maleficVortex', 'songOne', 'songAll', 'cleansing', 'wails', 'windsGrace', 'scryGuide', 'scryProtect'];
// Weapons of the Witch Hunters: Psychic actions can't select enemy Insidiants (nor count them within their distances).
for (const id of PSYCHIC_ACTIONS) {
  const ta = TARGET_ACTIONS[id];
  if (ta) { const f = ta.targets; ta.targets = (g, op) => f(g, op).filter((t) => !(isCI(t) && t.side !== op.side)); }
}
/** Auto-broadcaster (Dialogus): an enemy within 3" of the marker can't re-roll its attack dice. */
const broadcastNear = (g, op) => op.side < 2 && (g.markers || []).some((m) => m.kind === 'broadcaster' && m.owner === 1 - op.side && dist(op, m) - radius(op) <= 3);
/** Glorious Hymnal (Preceptor): friendlies within 3" of it have Severe. */
const hymnal = (g, op) => op.side < 2 && living(g, op.side).some((p) => tpl(p).hymnal && sameTeam(p, op) && edgeDist(p, op) <= 3);

// ---------- Universal equipment (up to 4 options per player, set up automatically before the battle) ----------
export const EQUIPMENT = {
  comms: { name: { zh: '通訊裝置', en: 'Comms Device' }, desc: { zh: '己方領土內放一個通訊裝置標記；控制它的友方，支援動作選友方的距離 +3"。', en: 'A Comms Device marker in your territory; a friendly that controls it adds 3" to the distance of its Support rules that pick friendlies.' } },
  mines: { name: { zh: '地雷', en: 'Mines' }, desc: { zh: '己方領土內放一個地雷標記；第一次有特工（敵我皆然）進入它的控制範圍時移除並造成 D3+3 傷害。', en: 'A Mines marker in your territory; the first time any operative is within its control range, remove it and inflict D3+3 damage.' } },
  ammo: { name: { zh: '彈藥箱', en: 'Ammo Cache' }, desc: { zh: '己方領土內放一個彈藥箱；控制它的友方可執行「補充彈藥」（0AP，每回合一次）：直到下回合，射擊時可重擲一顆攻擊骰。', en: 'An Ammo Cache marker in your territory; a friendly that controls it can Ammo Resupply (0AP, once per TP): until next TP, re-roll one attack die when shooting.' } },
  utility: { name: { zh: '戰術手榴彈', en: 'Utility Grenades' }, desc: { zh: '1 顆震撼彈＋1 顆煙霧彈（全隊共用次數）。震撼：6" 內可見的敵人與它 1" 內的特工擲 D6，3+ 下次 APL -1。煙霧：放在 6" 內看得到的特工處，1" 範圍內的特工對 2" 外互相視為被遮擋。', en: '1 stun + 1 smoke grenade (uses shared by the team). Stun: an enemy visible within 6" and each operative within 1" of it roll a D6, 3+ = -1 APL next activation. Smoke: placed on an operative visible within 6"; operatives wholly within 1" of it are obscured to and from operatives more than 2" away.' } },
  explosive: { name: { zh: '爆裂手榴彈', en: 'Explosive Grenades' }, desc: { zh: '1 顆破片＋1 顆穿甲手榴彈（全隊共用次數），任何特工都能投擲。破片 4/4+/2/4，射程 6"、爆炸 2"、飽和；穿甲 4/4+/4/5，射程 6"、穿甲 1、飽和。', en: '1 frag + 1 krak grenade (uses shared by the team), any operative can throw them. Frag 4/4+/2/4, Range 6", Blast 2", Saturate; krak 4/4+/4/5, Range 6", Piercing 1, Saturate.' } },
  lightBarricades: { name: { zh: '輕掩體 ×2', en: 'Light Barricades ×2' }, desc: { zh: '兩道輕型地形，放在自己的半區內（離其他裝備地形與訪問點 2" 以外）。', en: 'Two pieces of Light terrain wholly within your half (more than 2" from other equipment terrain and access points).' } },
  heavyBarricade: { name: { zh: '重掩體', en: 'Heavy Barricade' }, desc: { zh: '一道重型地形，只能放在距離降落區 4" 內（離其他裝備地形與訪問點 2" 以外）。', en: 'A piece of Heavy terrain wholly within 4" of your drop zone (more than 2" from other equipment terrain and access points).' } },
  razorWire: { name: { zh: '鐵絲網', en: 'Razor Wire' }, desc: { zh: '暴露且阻礙：不提供掩護，特工越過它時移動距離多算 1"。放在自己的半區內（離其他裝備地形與訪問點 2" 以外）。', en: 'Exposed and Obstructing: no cover, and crossing over it counts as 1" more. Wholly within your half (more than 2" from other equipment terrain and access points).' } },
  portableBarricade: { name: { zh: '可攜式路障', en: 'Portable Barricade' }, desc: { zh: '一道輕型、防護、可攜式地形（腳是微小且暴露）：放在自己的半區內（離其他裝備地形與訪問點 2" 以外）。防護：處於它的掩護中時，防禦者的 Save 屬性 -1（最低 2+）。連著它的特工可執行「隨路障移動」（1AP）：免費重新定位，但最多 Move -2"，路障隨之移動。', en: 'A Light, Protective, Portable terrain feature, set up wholly within your territory (more than 2" from other equipment terrain and access points). Protective: an operative in cover from it improves its Save by 1 (to 2+). A connected operative can perform Move With Barricade (1AP): a free Reposition of up to its Move -2", the barricade moving with it.' } },
  breachingCharge: { name: { zh: '破壞炸藥', en: 'Breaching Charge' }, desc: { zh: '整場一次：友方特工可以執行「破門」（1AP，即使它沒有破口標記能力），在控制範圍內的地形上放破口標記。', en: 'Once per battle a friendly operative can perform the Breach action (1AP) even without the ability, placing a Breach marker on terrain in its control range.' } },
};
export const EQUIP_IDS = Object.keys(EQUIPMENT);
Object.assign(EQUIPMENT, STEALTH_EQUIPMENT, VESPIDS_EQUIPMENT, VOIDDANCERS_EQUIPMENT, AQUILONS_EQUIPMENT, SPECTRES_EQUIPMENT, RAVENERS_EQUIPMENT, CANOPTEK_EQUIPMENT, ARCHON_EQUIPMENT, CORSAIR_EQUIPMENT, DEATHWATCH_EQUIPMENT, MANDRAKES_EQUIPMENT, MURDERWING_EQUIPMENT, WRECKA_EQUIPMENT, NIGHTLORDS_EQUIPMENT, SCOUTS_EQUIPMENT, RATLINGS_EQUIPMENT, SANCTIFIERS_EQUIPMENT, PATHFINDERS_EQUIPMENT, ANGELS_EQUIPMENT, PLAGUE_EQUIPMENT, KOMMANDOS_EQUIPMENT, KINBAND_EQUIPMENT, DEATHKORPS_EQUIPMENT);
export const EQUIPMENT_LIMIT = 4;
/** The cap on equipment options: 4, or 5 for the Ratlings (their Fixer's Munitorum Contacts, and the Fixer is always in the team). */
export const equipmentLimitFor = (teamId) => (teamId === 'ratlings' || teamId === 'spectres' ? EQUIPMENT_LIMIT + 1 : EQUIPMENT_LIMIT); // (Spectres: the Guide's Prepared Killzone adds an Ammo Cache or terrain option)
const FACTION_EQUIPMENT = {
  handOfArchon: ARCHON_EQUIPMENT, corsairVoidscarred: CORSAIR_EQUIPMENT,
  deathwatch: DEATHWATCH_EQUIPMENT, mandrakes: MANDRAKES_EQUIPMENT,
  murderwing: MURDERWING_EQUIPMENT, wreckaKrew: WRECKA_EQUIPMENT,
  stealthSuits: STEALTH_EQUIPMENT, vespids: VESPIDS_EQUIPMENT, voidDancers: VOIDDANCERS_EQUIPMENT, aquilons: AQUILONS_EQUIPMENT, spectres: SPECTRES_EQUIPMENT, raveners: RAVENERS_EQUIPMENT, canoptekCircle: CANOPTEK_EQUIPMENT, nemesisClaw: NIGHTLORDS_EQUIPMENT, scoutSquad: SCOUTS_EQUIPMENT, ratlings: RATLINGS_EQUIPMENT, sanctifiers: SANCTIFIERS_EQUIPMENT, tauPathfinders: PATHFINDERS_EQUIPMENT, angels: ANGELS_EQUIPMENT, plagueMarines: PLAGUE_EQUIPMENT, kommandos: KOMMANDOS_EQUIPMENT, farstalkers: KINBAND_EQUIPMENT, deathKorps: DEATHKORPS_EQUIPMENT,
};
export const equipmentOptionsFor = (teamId) => [...EQUIP_IDS, ...Object.keys(FACTION_EQUIPMENT[teamId] || {})];
export function cleanEquipment(teamId, ids = [], limit = equipmentLimitFor(teamId)) {
  const allowed = new Set(equipmentOptionsFor(teamId));
  return [...new Set((Array.isArray(ids) ? ids : []).filter(id => allowed.has(id)))].slice(0, limit);
}

registerMurderwingActions();
registerWreckaActions();
registerNightlordsActions();
registerScoutActions();
registerRatlingActions();
registerSanctifierActions();
registerPathfinderActions();
registerKommandoActions();
registerKinbandActions();
registerRavenerActions();
registerSpectreActions();
registerAquilonActions();
registerVoidDancerActions();
registerVespidActions();
registerStealthActions();
ACTIONS.mvBarricade = { ap: 1, name: { zh: '隨路障移動', en: 'Move With Barricade' } };
registerDeathKorpsActions();
registerMandrakeActions();
registerDwActions();
registerCorsairActions();
ACTIONS.blinkToggle = { ap: 0, name: { zh: '切換瞬移背包', en: 'Toggle Blink Pack' } };
const FRAG = { id: 'eqFrag', name: { zh: '破片手榴彈', en: 'Frag grenade' }, type: 'ranged', atk: 4, hit: 4, dmg: [2, 4], rules: { range: 6, blast: 2, saturate: true, equipGrenade: 'frag', noMarkerlight: true }, group: 'eqFrag' };
const KRAK = { id: 'eqKrak', name: { zh: '穿甲手榴彈', en: 'Krak grenade' }, type: 'ranged', atk: 4, hit: 4, dmg: [4, 5], rules: { range: 6, piercing: 1, saturate: true, equipGrenade: 'krak', noMarkerlight: true }, group: 'eqKrak' };
const grenadier = (w) => { const rules = { ...w.rules, limited: 1 }; delete rules.equipGrenade; return { ...w, id: `bb${w.id.slice(2)}`, hit: w.hit - 1, rules, group: `bb${w.group.slice(2)}` }; };
const GRENADIER_FRAG = grenadier(FRAG), GRENADIER_KRAK = grenadier(KRAK);
const hasEquip = (g, side, id) => side < 2 && !!g.equip?.[side]?.includes(id);
/** Uses left of a team-limited grenade (frag / krak / stun / smoke). */
const eqLeft = (g, side, k) => g.eqUses?.[side]?.[k] || 0;
/** The operative's weapons, plus the team's explosive grenades while any are left (not for beasts and machines). */
export function weaponsFor(g, op) {
  let ws = mdWeapons(g, op, archonWeapons(op));
  // Shriek-that-Kills (Howling Banshee Aspect Technique): an extra ranged weapon while the Technique is available.
  if (tpl(op).aspect === 'hb' && op.side < 2 && g.phase === 'firefight' && g.active === op.uid && ffReady(g, op.side, 'hbShriek') && !techWhy(g, op, 'hbShriek')) ws = [...ws, BK_SHRIEK];
  // Grenadier (Brood Brother Sapper): its own frag and krak grenades, Hit improved by 1, not from the team's uses.
  if (tpl(op).grenadier) ws = [...ws, GRENADIER_FRAG, GRENADIER_KRAK];
  ws = [...ws, ...assetsFor(g, op)]; // Privateer Support Assets (Elucidian Starstriders)
  ws = ncWeapons(g, op, ws); // Preysight (Nemesis Claw): Range 6" and Seek Light versions
  ws = scWeapons(g, op, ws); // Combat Blades equipment (Scout Squad)
  ws = pmWeapons(g, op, ws); // Blight Grenades equipment (Plague Marines)
  ws = kmWeapons(g, op, ws); // Choppas, Collapsible Stocks, Dynamite, Harpoon (Kommandos equipment)
  ws = dkWeapons(g, op, ws); // Hand Axes (Death Korps equipment)
  ws = spWeapons(g, op, ws); // Spectre Squad: Weapons Team, Sniper Overwatch
  ws = aqWeapons(g, op, ws); // Tempestus Daggers (Tempestus Aquilons equipment)
  ws = vsWeapons(g, op, ws); // Sting (Vespid Stingwings ploy)
  if (!hasEquip(g, op.side, 'explosive') || tpl(op).actionsOnly) return ws;
  return [...ws, ...(eqLeft(g, op.side, 'frag') ? [FRAG] : []), ...(eqLeft(g, op.side, 'krak') ? [KRAK] : [])];
}
/** A point in a side's territory: d inches from its own killzone edge, at fraction c across the board. */
export function ownPoint(g, side, d, c) {
  const z = deployZones(g)[side];
  if (g.axis === 'y') { const fromLow = z.y0 === 0; return { x: c * boardOf(g).w, y: fromLow ? d : boardOf(g).h - d }; }
  const fromLow = z.x0 === 0;
  return { x: fromLow ? d : boardOf(g).w - d, y: c * boardOf(g).h };
}
/** The nearest spot to p clear of terrain (by r) and other markers (by 2"). */
export function clearSpot(g, p, r = 0.5) {
  for (let ring = 0; ring <= 5; ring += 0.5) {
    for (let a = 0; a < 16; a++) {
      const q = { x: p.x + Math.cos(a * Math.PI / 8) * ring, y: p.y + Math.sin(a * Math.PI / 8) * ring };
      if (q.x < r || q.y < r || q.x > boardOf(g).w - r || q.y > boardOf(g).h - r) continue;
      if (g.terrain.some((t) => distPointRect(q, t) < r + 0.3)) continue;
      if ([...g.objectives, ...g.markers].some((m) => dist(m, q) < 2)) continue;
      return q;
    }
  }
  return p;
}
/** Place one equipment item, then hand deployment to the other player. */
export function equipmentPlacement(g, p, rotated = false) {
  const d = g.eqDeploy, entry = d && !d.done && d.queues[d.turn][0];
  if (!entry || g.phase !== 'deploy') return null;
  const side = d.turn, source = entry.item;
  if (entry.type === 'terrain') {
    const w = rotated ? source.h : source.w, h = rotated ? source.w : source.h;
    const t = { ...source, x: p.x - w / 2, y: p.y - h / 2, w, h };
    if (t.x < 0 || t.y < 0 || t.x + w > boardOf(g).w || t.y + h > boardOf(g).h) return null;
    const corners = [{ x:t.x,y:t.y }, { x:t.x+w,y:t.y }, { x:t.x,y:t.y+h }, { x:t.x+w,y:t.y+h }];
    const z = deployZones(g)[side];
    if (t.kind === 'heavy' ? corners.some(c => distPointRect(c, {x:z.x0,y:z.y0 ?? 0,w:z.x1-z.x0,h:(z.y1 ?? boardOf(g).h)-(z.y0 ?? 0)}) > 4)
      : corners.some(c => territoryOf(g,c) !== side)) return null;
    const gap = (a,b) => Math.hypot(Math.max(0,a.x-b.x-b.w,b.x-a.x-a.w),Math.max(0,a.y-b.y-b.h,b.y-a.y-a.h));
    if (g.terrain.some(o => gap(t,o) <= (o.equip != null ? 2 : 0))) return null;
    if ((g.accessPoints || []).some(a => distPointRect(a,t) <= 2)) return null;
    if ([...g.objectives,...g.markers].some(m => distPointRect(m,t) < .4)) return null;
    return { type:'terrain', item:t };
  }
  if (p.x < .4 || p.y < .4 || p.x > boardOf(g).w-.4 || p.y > boardOf(g).h-.4 || territoryOf(g,p) !== side) return null;
  if (g.terrain.some(t => distPointRect(p,t) < .4) || [...g.objectives,...g.markers].some(m => (source.kind === 'tripwire' ? dist(p,m) <= 2 : dist(p,m) < .8))) return null; // (Tripwire: more than 2" from other markers)
  if (source.kind === 'tripwire' && (g.accessPoints || []).some(a => dist(a,p) <= 2)) return null;
  return { type:'marker', item:{ ...source, x:p.x,y:p.y,id:g.markers.reduce((max,m)=>Math.max(max,typeof m.id === 'number' ? m.id : -1),-1)+1 } };
}

export function placeEquipment(g, p, rotated = false) {
  const entry = equipmentPlacement(g,p,rotated);
  if (!entry) return false;
  const d = g.eqDeploy, side = d.turn;
  (entry.type === 'terrain' ? g.terrain : g.markers).push(entry.item);
  d.queues[side].shift();
  log(g,{zh:`${teamZh(g,side)} 部署${entry.type === 'terrain' ? ({heavy:'重掩體',light:'輕掩體',wire:'鐵絲網'}[entry.item.kind]) : (EQUIPMENT[{comms:'comms',mine:'mines',ammo:'ammo'}[entry.item.kind]]?.name.zh || entry.item.kind)}`,en:`${team(g,side).name.en} sets up ${entry.item.kind}`},`side${side}`);
  d.done = !d.queues.some(q=>q.length);
  d.turn = d.queues[1-side].length ? 1-side : side;
  if (d.done) log(g,{zh:'雙方裝備部署完成，開始輪流部署單位',en:'Equipment set up; begin operative deployment'},'tp');
  return true;
}

export function autoPlaceEquipment(g) {
  const d = g.eqDeploy, entry = d && !d.done && d.queues[d.turn][0];
  if (!entry) return false;
  const p = entry.type === 'terrain' ? {x:entry.item.x+entry.item.w/2,y:entry.item.y+entry.item.h/2} : entry.item;
  if (placeEquipment(g,p)) return true;
  for (let y=.5;y<boardOf(g).h;y+=.5) for(let x=.5;x<boardOf(g).w;x+=.5) for(const rotated of [false,true]) if(placeEquipment(g,{x,y},rotated)) return true;
  return false;
}

/** Prepare the chosen equipment for a side (called from newGame). */
function setupEquipment(g, side, ids) {
  (g.equip ||= [[], []])[side] = cleanEquipment(g.teams[side], ids);
  spTrimEquipment(g, side); // Spectre Squad: a fifth option only with a Guide, and only an Ammo Cache / terrain
  (g.eqUses ||= [{}, {}])[side] = { frag: 0, krak: 0, stun: 0, smoke: 0 };
  const along = g.axis === 'y' ? 'y' : 'x';
  // Where each kind may go: light cover and razor wire wholly within your territory (half); heavy cover wholly
  // within 4" of your drop zone. All of them more than 2" from other equipment terrain and from access points.
  const zone = deployZones(g)[side];
  const inHalf = (t) => [[t.x, t.y], [t.x + t.w, t.y], [t.x, t.y + t.h], [t.x + t.w, t.y + t.h]].every(([x, y]) => territoryOf(g, { x, y }) === side);
  const near4 = (t) => t.x >= zone.x0 - 4 && t.x + t.w <= zone.x1 + 4 && t.y >= (zone.y0 ?? 0) - 4 && t.y + t.h <= (zone.y1 ?? boardOf(g).h) + 4;
  const rectGap = (a, b) => Math.hypot(Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w)), Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h)));
  const wall = (p, len, kind, area, thick = 0.5) => { // across the line of advance, moved until every rule is met
    const across = along === 'x' ? 'y' : 'x', dir = ownPoint(g, side, 1, 0.5)[along] < boardOf(g)[along === 'x' ? 'w' : 'h'] / 2 ? -1 : 1;
    for (const back of [0, 1, 2, 0.5, 1.5, -1, 3, -2, 4]) {
      for (const shift of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) {
        const q = { ...p, [along]: p[along] + back * dir, [across]: p[across] + shift };
        const t = along === 'x' ? { kind, x: q.x - thick / 2, y: q.y - len / 2, w: thick, h: len } : { kind, x: q.x - len / 2, y: q.y - thick / 2, w: len, h: thick };
        if (t.x < 0 || t.y < 0 || t.x + t.w > boardOf(g).w || t.y + t.h > boardOf(g).h || !area(t)) continue;
        if (g.terrain.some((o) => rectGap(t, o) < (o.equip != null ? 2.01 : 0.4))) continue; // 2" from other equipment terrain
        if ((g.accessPoints || []).some((a) => distPointRect(a, t) <= 2)) continue; // and from access points
        if ([...g.objectives, ...g.markers].some((m) => distPointRect(m, t) < 1.5)) continue;
        g.terrain.push({ ...t, equip: side });
        return;
      }
    }
    log(g, { zh: `${teamZh(g, side)} 找不到合規的位置放${kind === 'wire' ? '鐵絲網' : kind === 'heavy' ? '重掩體' : '輕掩體'}`, en: `${team(g, side).name.en} found no legal place for its ${kind === 'wire' ? 'razor wire' : kind === 'heavy' ? 'heavy barricade' : 'light barricade'}` }, `side${side}`);
  };
  for (const id of g.equip[side]) {
    if (id === 'comms') g.markers.push({ id: g.markers.length, kind: 'comms', owner: side, ...clearSpot(g, ownPoint(g, side, 9, 0.5)), carriedBy: null });
    if (id === 'mines') g.markers.push({ id: g.markers.length, kind: 'mine', owner: side, ...clearSpot(g, ownPoint(g, side, 12.5, Math.random() < 0.5 ? 0.3 : 0.7)), carriedBy: null });
    if (id === 'ammo') g.markers.push({ id: g.markers.length, kind: 'ammo', owner: side, ...clearSpot(g, ownPoint(g, side, 7.5, 0.5)), carriedBy: null });
    if (id === 'ammo' && living(g, side).some((o) => tpl(o).wellStocked)) g.markers.push({ id: g.markers.length, kind: 'ammo', owner: side, ...clearSpot(g, ownPoint(g, side, 7.5, 0.5)), carriedBy: null }); // Well Stocked (Ratling Stashmaster): one more Ammo Cache
    if (id === 'utility') Object.assign(g.eqUses[side], { stun: 1, smoke: 1 });
    if (id === 'pmBlight') g.eqUses[side].blight = 2; // Blight Grenades (Plague Marines): twice in the battle
    if (id === 'kmDynamite') g.eqUses[side].dynamite = 1; // Dynamite (Kommandos): once in the battle
    if (id === 'kmHarpoon') g.eqUses[side].harpoon = 1; // Harpoon (Kommandos): once per turning point
    if (id === 'explosive') Object.assign(g.eqUses[side], { frag: 1, krak: 1 });
    if (id === 'lightBarricades') { wall(ownPoint(g, side, 10.5, 0.25), 3, 'light', inHalf); wall(ownPoint(g, side, 10.5, 0.75), 3, 'light', inHalf); }
    if (id === 'heavyBarricade') wall(ownPoint(g, side, 9, 0.5), 3.5, 'heavy', near4);
    if (id === 'portableBarricade') { const n = g.terrain.length; wall(ownPoint(g, side, 10.5, 0.5), 2, 'light', inHalf); if (g.terrain.length > n) Object.assign(g.terrain.at(-1), { portable: true, protective: true }); }
    if (id === 'razorWire') wall(ownPoint(g, side, 12.5, 0.5), 4, 'wire', inHalf, 0.3);
  }
  rtTripwires(g, side); // Ratling Bomber: Tripwire markers (set up with the equipment)
  if (g.equip[side].length) log(g, { zh: `${teamZh(g, side)} 的裝備：${g.equip[side].map((id) => EQUIPMENT[id].name.zh).join('、')}`, en: `${team(g, side).name.en} equipment: ${g.equip[side].map((id) => EQUIPMENT[id].name.en).join(', ')}` }, `side${side}`);
}
/** The computer's equipment: grenades, a mine, an ammo cache and a heavy barricade. */
export const AI_EQUIP = ['explosive', 'mines', 'ammo', 'heavyBarricade'];
/** Mines: the first operative to come within control range of a Mines marker sets it off. */
export function checkMines(g, op) {
  hyMines(g, op); // (Hernkyn Yaegir HY-Pex mines)
  for (const m of (g.markers || []).filter((x) => (x.kind === 'mine' || x.kind === 'meltaMine') && !x.gone)) {
    if (op.dead || m.exempt === op.uid || dist(op, m) - radius(op) - OBJ_R > CONTROL) continue;
    // Mine (Ratling Bomber): a team with one inflicts 2D3+3 instead, and its small Ratlings are ignored by its mines.
    const rat = m.kind === 'mine' ? rtMine(g, m, op) : { skip: false, dmg: null };
    if (rat.skip) continue;
    m.gone = true;
    const dmg = rat.dmg ?? (m.kind === 'meltaMine' ? d6() + d6() + 3 : d3() + 3); // Melta Mine (Kasrkin Demo-trooper): 2D6+3
    log(g, { zh: `💥 ${opName(op, 'zh')} 踩到地雷，受到 ${dmg} 傷害`, en: `💥 ${opName(op, 'en')} sets off a mine and takes ${dmg} damage` }, 'kill');
    applyDamage(g, null, op, dmg);
  }
  g.markers = g.markers.filter((x) => !x.gone);
}
/** Comms Device: +3" to Support distances that pick friendlies, while this operative controls its own marker. */
const commsBonus = (g, op) => ((g.markers || []).some((m) => m.kind === 'comms' && m.owner === op.side && dist(op, m) - radius(op) - OBJ_R <= CONTROL && controller(g, m) === op.side) ? 3 : 0);
/** Smoke: an operative wholly within 1" of a smoke marker. */
const inSmoke = (g, op) => (g.smoke || []).some((s) => dist(op, s) + radius(op) <= 1.01);
const ammoTarget = (g, op) => (g.markers || []).find((m) => m.kind === 'ammo' && m.owner === op.side && m.usedTP !== g.tp && dist(op, m) - radius(op) - OBJ_R <= CONTROL && controller(g, m) === op.side);

// ---------- Firefight ploys (交戰計謀) ----------
// Each one can be used once per turning point. Kinds:
//  button — used by the active operative during its activation (start: only before its first action);
//  aim    — chosen while picking a Shoot target (it changes which targets are valid);
//  attack — chosen with a declared Shoot / Fight, before the dice are rolled;
//  auto   — reactions (when shot, damaged, incapacitated…): used automatically while armed and affordable.
const ffList = (t) => [...(t?.firefight || []), ...(t?.techniques || [])]; // (Blades of Khaine: Aspect Techniques too)
export const ffDef = (g, side, id) => ffList(TEAM_MAP[g.teams[side]]).find((p) => p.id === id) || null;
// Aspect Techniques: each once per TP (twice if every operative shares one Aspect).
const techLimit = (g, side) => (new Set(g.ops.filter((o) => o.side === side).map((o) => tpl(o).aspect)).size === 1 ? 2 : 1);
const ffUsedNow = (g, side, id) => g.ffUsed?.[side]?.tp === g.tp && g.ffUsed[side].ids.filter((x) => x === id).length >= (ffDef(g, side, id)?.technique ? techLimit(g, side) : 1);
/** The current activation or counteraction (one Aspect Technique per side in each). */
const actKey = (g) => `${g.tp}|${g.active}|${(g.actCount || []).join(',')}|${g.counter ? 1 : 0}`;
/** Why an Aspect Technique can't be used with this operative now (null = it can). */
function techWhy(g, op, id) {
  const p = ffDef(g, op.side, id);
  if (!p?.technique) return null;
  if (tpl(op).aspect !== p.aspect) return { zh: '方陣不符', en: 'Wrong Aspect' };
  if (g.techKey?.[op.side] === actKey(g)) return { zh: '本次啟動已用過技法', en: 'Already used a Technique this activation' };
  return null;
}
/** Can this side pay for and still use this firefight ploy this turning point? */
const ffBaseCost = (g, side, id, target = g.dwAuspexTarget) => aqVetFree(g, side, id) || vdLuckFree(g, side, id) ? 0 : (g.ccFree || ccAwakenedFree(g, side, id)) && id === 'animateNodes' ? 0 : scVoxFree(g, side, id) || rtFree(g, side, id) || dkFreeHas(g, side, id) || dkAdaptiveFree(g, side, id) || (g.pfFree && id === 'saviourProtocols') || (id === 'wrathVengeance' && adReliquaries(g, side)) || adHeroicFree(g, side, id, g.ffSpec) ? 0 : dwCommandFree(g, side, 'firefight') || id === 'dwAuspex' && dwTriangulation(g, side, target) ? 0 : (id === 'unquestioningLoyalty' && g.loyalFree ? 0 : ['lightFingers', 'capriciousFlight'].includes(id) && tpl(activeOp(g) || { team: g.teams[side], tplId: TEAM_MAP[g.teams[side]].ops[0].id }).prowlingRaiders && activeOp(g)?.side === side ? 0 : ffDef(g, side, id)?.cp || 0);
const ffCostNow = (g, side, id, target = g.dwAuspexTarget) => ffBaseCost(g, side, id, target) + (g.deviousTax?.[side] === id ? 1 : 0);
export const ffReady = (g, side, id, target = g.dwAuspexTarget) => { const p = ffDef(g, side, id); return !!p && !ffUsedNow(g, side, id) && g.cp[side] >= ffCostNow(g, side, id, target) && (id !== 'deviousScheme' || !g.deviousTax?.[1 - side]); };
function spendFF(g, side, id) {
  const p = ffDef(g, side, id);
  if (g.ffUsed?.[side]?.tp !== g.tp) (g.ffUsed ||= [null, null])[side] = { tp: g.tp, ids: [] };
  g.ffUsed[side].ids.push(id);
  scrivener(g, side, id); // (Scrivener)
  const paid = ffCostNow(g, side, id);
  if (!(id === 'wrathVengeance' && adReliquaries(g, side)) && adHeroicFree(g, side, id, g.ffSpec)) adHeroicUsed(g, side); // Heroic Leader (Space Marine Captain): once per TP
  if (!aqVetFree(g, side, id) && vdLuckFree(g, side, id)) vdLuckUsed(g, side, id); // Luck of the Laughing God (Void-dancer Players)
  if (aqVetFree(g, side, id)) aqVetUsed(g, side); // Tempestus Veteran: the once-per-battle free ploy
  if (scVoxFree(g, side, id)) (g.scVoxTP ||= [0, 0])[side] = g.tp; // Tactical Vox-link (Scout Squad): free once per TP (after the cost above was worked out)
  if (dwCommandFree(g, side, 'firefight') && !(id === 'dwAuspex' && dwTriangulation(g, side, g.dwAuspexTarget))) dwConsumeCommand(g, side, 'firefight');
  g.cp[side] -= paid;
  if (g.deviousTax?.[side] === id) g.deviousTax[side] = null;
  if (id !== 'deviousScheme' && paid > 0 && !g.deviousTax?.[side] && autoFF(g, 1 - side, 'deviousScheme')) (g.deviousTax ||= [null, null])[side] = id;
  if (p.technique) { (g.techKey ||= [null, null])[side] = actKey(g); log(g, { zh: `${teamZh(g, side)} 使用技法「${p.name.zh}」`, en: `${team(g, side).name.en} uses the Aspect Technique ${p.name.en}` }, `side${side}`); return; }
  log(g, { zh: `${teamZh(g, side)} 使用交戰計謀「${p.name.zh}」（${p.cp}CP）`, en: `${team(g, side).name.en} uses the firefight ploy ${p.name.en} (${p.cp}CP)` }, `side${side}`);
}
export function skipArchonActivation(g, side) {
  if (g.phase !== 'firefight' || g.turn !== side || g.active || g.counter || !ffReady(g, side, 'heinousArrogance') || !hasReady(g, 1 - side)) return false;
  spendFF(g, side, 'heinousArrogance'); handOff(g, side); return true;
}

/** Auto ploys: armed unless the player switched them off. */
export const ffArmed = (g, side, id) => !g.ffOff?.[side]?.includes(id);
export function ffToggleArm(g, side, id) {
  const off = ((g.ffOff ||= [[], []])[side] ||= []);
  const i = off.indexOf(id);
  if (i >= 0) off.splice(i, 1); else off.push(id);
}
/** Use an auto ploy now if it's armed, affordable and unused. */
/** autoFF where the ploy names a specified operative (the Captain's Heroic Leader makes a ploy free for him). */
export function autoFFSpec(g, side, id, spec) { g.ffSpec = spec; try { return autoFF(g, side, id); } finally { g.ffSpec = null; } }
export function autoFF(g, side, id, op = null) {
  if (side > 1 || !ffDef(g, side, id) || !ffArmed(g, side, id) || !ffReady(g, side, id)) return false;
  if (ffDef(g, side, id).technique && (!op || techWhy(g, op, id))) return false;
  spendFF(g, side, id);
  return true;
}
/** Is this attack ploy chosen for the operative's current Shoot / Fight (pending or committed)? */
export const ffOn = (g, op, id) => [g.ffPending, g.ffAtk].some((x) => x && x.uid === op.uid && x.ids.includes(id));
const startOfActivation = (op) => !Object.keys(op.acted || {}).some((k) => !['unseen', 'accelerant', 'free', 'raiderFree', 'darknessTarget', 'dwUnseen', 'dwAmmoPick'].includes(k) && op.acted[k]);
const sprungNow = (op) => op.prevOrder === 'conceal' && op.order === 'engage';
const holdsObjective = (g, t) => (g.objectives || []).some((o) => dist(t, o) - radius(t) - OBJ_R <= CONTROL && controller(g, o) === t.side);

/** Firefight ploy rules, keyed by id (names and descriptions are in teams.js). */
const FF = {
  mwHonour: { kind: 'auto' },
  mwNarcissism: { kind: 'auto' },
  mwWings: { kind: 'button', cond: (g, o) => g.tp <= 1 || o.counter || ['reposition', 'charge', 'fallBack'].some((id) => o.acted[id]) ? { zh: '第 2 回合起、啟動中移動前使用', en: 'From TP2, before movement during activation' } : null, apply(g, o) { o.acted.mwWings = true; return { zh: '下次噴射移動 +3，本回合不能攻擊', en: 'Next boosted move +3; no attacks this TP' }; } },
  mdSlither: { kind: 'auto' },
  mdFeast: { kind: 'auto' },
  mdBite: { kind: 'auto' },
  mdNowhere: { kind: 'button', cond: (g, o) => o.counter ? { zh: '僅啟動中使用', en: 'During activation only' } : null, apply(g, o) { o.acted.mdNowhere = true; } },
  dwAuspex: { kind: 'attack', shoot: true },
  dwSufferAlien: { kind: 'auto' },
  dwTracking: { kind: 'button', start: true, cond: (g, o) => o.counter ? null : { zh: '僅反應開始時使用', en: 'Only at counteraction start' }, apply(g, o) { o.order = o.order === 'engage' ? 'conceal' : 'engage'; } },
  capriciousFlight: { kind: 'button', cond: (g, o) => !o.counter && isEngaged(g, o) ? null : { zh: '需要在啟動中且交戰', en: 'Must be engaged during an activation' }, apply(g, o) { o.acted.slip = true; } },
  lightFingers: { kind: 'button', cond: (g, o) => !o.counter ? null : { zh: '反擊時不能使用', en: 'Not during counteraction' }, apply(g, o) { o.acted.lightFingers = true; } },
  opportunisticFighters: { kind: 'auto' },
  contemptuousAdventurer: { kind: 'button', start: true, cond: (g, o) => (g.actCount?.[o.side] === 1 && living(g, o.side).every((t) => t === o || edgeDist(t, o) > 5)) ? null : { zh: '本回合首名啟動，且距離所有友方超過 5 吋', en: 'First activated this TP, more than 5 inches from all friendlies' }, apply(g, o) { o.acted.contemptuous = true; } },
  cruelDeception: { kind: 'button', cond: (g, o) => !o.counter && isEngaged(g, o) ? null : { zh: '需要在啟動中且交戰', en: 'Must be engaged during an activation' }, apply(g, o) { o.acted.slip = true; } },
  deviousScheme: { kind: 'auto' },
  preyWounded: { kind: 'auto' },
  // ---- Angels of Death ----
  adjustDoctrine: { kind: 'button',
    cond: (g, op) => (['docAssault', 'docDevastator', 'docTactical'].some((d) => hasPloy(g, op.side, d)) ? null : { zh: '本回合沒有用戰鬥教條', en: 'No Combat Doctrine this turning point' }),
    apply(g, op) {
      const docs = ['docAssault', 'docDevastator', 'docTactical'], cur = docs.find((d) => hasPloy(g, op.side, d));
      const next = docs[(docs.indexOf(cur) + 1) % 3];
      g.ploys[op.side] = g.ploys[op.side].map((p) => (p === cur ? next : p));
      const nm = team(g, op.side).ploys.find((p) => p.id === next)?.name;
      return nm ? { zh: `改為${nm.zh}`, en: `now ${nm.en}` } : null;
    } },
  wrathVengeance: { kind: 'button', cond: (g, op) => (op.counter && !op.acted.wrath ? null : { zh: '只能在反擊時', en: 'Only while counteracting' }), apply(g, op) { op.acted.wrath = true; op.ap += 1; } },
  transhuman: { kind: 'auto' },
  shockAssault: { kind: 'attack', fight: true, cond: (g, op) => (count(op, 'charge') ? null : { zh: '本次啟動沒有衝鋒', en: 'Didn\'t Charge this activation' }) },
  // ---- Blooded ----
  momentRepute: { kind: 'button', cond: (g, op) => (underGaze(g, op) ? null : { zh: '不在諸神注視下', en: 'Not under the Gaze of the Gods' }), apply(g, op) { op.ap += 1; } },
  rewardEarned: { kind: 'auto' },
  // ---- Death Korps ----
  // ---- Death Korps ----
  inspirationalLeadership: { kind: 'button', cond: (g, op) => (tpl(op).watchmaster || tpl(op).confidant ? null : { zh: '只有看守長或心腹', en: 'Watchmasters and Confidants only' }), apply(g, op) { return dkLeadership(g, op, giveGuardOrder); } },
  lifeShame: { kind: 'auto' },
  deathAtonement: { kind: 'auto' },
  combinedArms: { kind: 'attack', shoot: true, cond: (g, op, t) => (t?.shotBy?.tp === g.tp && t.shotBy.uids.some((u) => u !== op.uid && getOp(g, u)?.side === op.side) ? null : { zh: '目標本回合還沒被其他友方射擊', en: 'Not shot by another friendly this TP' }) },
  // ---- Exaction Squad ----
  longArm: { kind: 'aim', cond: (g, op, t, w) => (w?.rules.range ? null : { zh: '武器沒有射程限制', en: 'The weapon has no Range rule' }) },
  // ---- Fellgor Ravagers ----
  animalisticFury: { kind: 'attack', fight: true },
  wildRage: { kind: 'button', start: true, apply(g, op) { op.acted.moveBonus = (op.acted.moveBonus || 0) + 1; } },
  ruthlessRampage: { kind: 'button',
    cond: (g, op) => (count(op, 'fight') && !isEngaged(g, op) ? null : { zh: '要在近戰後、且不在敵人控制範圍內', en: 'After a Fight, out of enemy control range' }),
    apply(g, op) { op.acted.free = { ...(op.acted.free || {}), charge: 'rampage' }; } },
  // ---- Farstalker Kinband ----
  slipAway: { kind: 'button', apply(g, op) { op.acted.slip = true; } },
  poach: { kind: 'button', cond: (g, op) => (op.counter ? { zh: '反擊時不能使用', en: 'Not during counteraction' } : null), apply(g, op) { op.kfPoach = true; } },
  vengeanceKinband: { kind: 'auto' },
  savageAmbush: { kind: 'auto' },
  autoFerric: { kind: 'auto' }, // (Battleclade)
  // ---- Brood Brothers / Canoptek Circle ----
  unquestioningLoyalty: { kind: 'auto' },
  idolisation: { kind: 'attack', cond: (g, op) => (!broodLeader(g, op) && living(g, op.side).some((o) => o !== op && (broodLeader(g, o) || tpl(o).cultIcon) && edgeDist(o, op) <= 6)
    ? null : { zh: '要在領袖或聖像守衛 6" 內（自己不是領袖）', en: 'Needs a Leader or the Iconward within 6" (and not be a Leader)' }) },
  sacrificialThrall: { kind: 'auto' },
  // ---- Exodite Dragon Masters ----
  leap: { kind: 'button', cond: (g, o) => (isMounted(o) && !count(o, 'sprint') ? null : { zh: '騎乘者疾馳前才能用', en: 'A rider, before it Sprints' }), apply(g, o) { o.acted.leap = true; } },
  feralHunger: { kind: 'attack', fight: true, cond: (g, op, t, w) => (t && t.wounds < t.maxW && ['edFangs', 'edDrakeFangs'].includes(w?.id) ? null : { zh: '要用尖牙利爪近戰已受傷的敵人', en: 'Fangs & talons against a wounded enemy' }) },
  survivalistSpirit: { kind: 'button', cond: (g, o) => (isMounted(o) ? null : { zh: '只有騎乘者', en: 'Riders only' }), apply(g, o) { o.survSpirit = true; } },
  // ---- Goremongers ----
  destructiveDemise: { kind: 'auto' },
  lacerateFlesh: { kind: 'button', start: true, cond: (g, o) => (goreOf(o) === 0 ? null : { zh: '血槽要是空的', en: 'Its GORE TANK must be empty' }),
    apply(g, o) { goreUp(g, o, { zh: '割裂血肉', en: 'Lacerate Flesh' }); o.acted.lacerate = true; } },
  unbridledAggression: { kind: 'attack', fight: true, cond: (g, op) => (isGM(op) && count(op, 'charge') ? null : { zh: '本次啟動要先衝鋒過', en: 'It must have Charged this activation' }) },
  gorethirst: { kind: 'auto' },
  // ---- Inquisitorial Agents ----
  absoluteAuthority: { kind: 'auto' },
  relentlessPursuit: { kind: 'auto' },
  intimidatingPresence: { kind: 'auto' },
  emperorsWill: { kind: 'button', start: true, cond: (g, o) => (isIA(o) ? null : { zh: '只有審判庭特務', en: 'Inquisitorial Agents only' }),
    apply(g, o) { o.acted.emperorsWill = true; if (!o.counter) o.ap = Math.max(o.ap, tpl(o).apl); return { zh: '本次啟動無視屬性變化', en: 'stat changes are ignored this activation' }; } },
  // ---- Hernkyn Yaegirs ----
  bondsThatBind: { kind: 'button', start: true, cond: (g, o) => (isHY(o) && !o.counter && o.negotiatedTP !== g.tp && bondsCands(g, o).length ? null : { zh: '3" 內沒有看得到的準備中友方', en: 'No ready friendly visible within 3"' }),
    apply(g, o) { o.directive = bondsCands(g, o).map((x) => x.uid); } },
  noKinLeft: { kind: 'auto' },
  stalwartDefence: { kind: 'auto' },
  // ---- Elucidian Starstriders ----
  combinedArms: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (t && !w?.rules.supportAsset && t.shotBy?.tp === g.tp && t.shotBy.uids.some((u) => u !== op.uid && getOp(g, u)?.side === op.side)
    ? null : { zh: '目標本回合要先被其他友方射擊過（艦砲除外）', en: 'The target must have been shot by another friendly this TP (not with a support asset)' }) },
  survivalist: { kind: 'button', start: true, cond: (g, o) => (o.survUsed ? { zh: '這名特工整場已用過', en: 'Already used for this operative' } : isEngaged(g, o) ? { zh: '在交戰中', en: 'Engaged' } : null),
    apply(g, o) { o.survUsed = true; const b = o.wounds; o.wounds = Math.min(o.maxW, o.wounds + d3() + 2); o.ap = Math.max(o.ap, tpl(o).apl); return { zh: `回復 ${o.wounds - b} 生命，本次 APL 不受影響`, en: `regains ${o.wounds - b} wounds; APL changes ignored this activation` }; } },
  greatEndurance: { kind: 'button', cond: (g, o) => (tpl(o).navis && !o.counter ? null : { zh: '只有艦隊員（非反擊）', en: 'Navis operatives only (not counteracting)' }), apply(g, o) { o.ap += 1; } },
  wellDrilled: { kind: 'button', start: true, cond: (g, o) => (tpl(o).navis && !o.counter && living(g, o.side).some((x) => x !== o && x.ready && tpl(x).navis && edgeDist(x, o) <= 3 && visibility(g, o, x).visible) ? null : { zh: '3" 內沒有準備中的艦隊員', en: 'No ready Navis operative within 3"' }),
    apply(g, o) { o.directive = living(g, o.side).filter((x) => x !== o && x.ready && tpl(x).navis && edgeDist(x, o) <= 3 && visibility(g, o, x).visible).map((x) => x.uid); } },
  // ---- Chaos Cult ----
  faithfulFollower: { kind: 'auto' },
  frenziedDemise: { kind: 'auto' },
  unleashDaemonCC: { kind: 'button', cond: (g, o) => (isWarped(o) && !o.counter ? null : { zh: '只有突變者或折磨者（非反擊）', en: 'Mutants or Torments only (not counteracting)' }),
    apply(g, o) { o.acted.fightsAllowed = 2; o.acted.free = { ...(o.acted.free || {}), fight: 'any' }; } },
  // ---- Celestian Insidiants ----
  unshakeablePursuit: { kind: 'button', apply(g, o) { o.acted.pursuit = true; } },
  ferventHate: { kind: 'attack', cond: (g, op, t) => (t && !IMPERIUM_TEAMS.has(t.team) ? null : { zh: '目標是帝國特工', en: 'The target is Imperium' }) },
  gloryMartyrs: { kind: 'auto' },
  faithFury: { kind: 'attack', fight: true },
  shieldFlare: { kind: 'auto' },
  spFieldcraft: { kind: 'auto' },
  spReact: { kind: 'auto' },
  spPrepared: { kind: 'auto' },
  spDodge: { kind: 'button', cond: (g, o) => (isSP(o) ? null : { zh: '只有魅影', en: 'SPECTRE SQUAD only' }), apply(g, o) { o.acted.spDodge = true; return { zh: '閃躲：本次啟動撤退少 1AP', en: 'Dodge: Fall Back for 1 less AP this activation' }; } },
  spSilent: { kind: 'button', cond: (g, o) => (!isSP(o) ? { zh: '只有魅影', en: 'SPECTRE SQUAD only' } : o.order !== 'conceal' ? { zh: '需要隱蔽指令', en: 'Needs a Conceal order' } : foes(g, o).some((e) => e.side < 2 && e.x > -50 && visibility(g, e, o).visible && !visibility(g, e, o).cover) ? { zh: '是敵人的有效目標', en: 'Valid target for the enemy' } : null), apply(g, o) { o.acted.spSilent = true; return { zh: '無聲殺手：隱蔽指令也能衝鋒；第一次擊打 +3 傷害，但不能結算其他成功', en: 'Silent Killers: it can Charge with a Conceal order; its first strike deals +3 damage but no other success resolves' }; } },
  aqAdjust: { kind: 'auto' },
  aqHotDrop: { kind: 'attack', cond: (g, op, t) => (isAQ(op) && t && edgeDist(op, t) <= 6 && ((op.aqLandAct === op.uid && op.aqLandTP === g.tp) || whollyIn(g, op, 1 - op.side)) ? null : { zh: '需要降落或在敵方領地內，且目標在 6" 內', en: 'Needs to have landed or be in enemy territory, target within 6"' }) },
  aqExemplar: { kind: 'button', cond: (g, o) => (!isAQ(o) || tpl(o).aqSentry || tpl(o).apl > 2 ? { zh: '需要 APL 2 以下的風暴天鷹（非伺服哨兵）', en: 'Needs a TEMPESTUS AQUILON with APL 2 or less (not the Servo-sentry)' } : null), apply(g, o) { o.acted.aqExemplar = true; return { zh: '風暴楷模：本次啟動撿標記、放標記與任務行動少 1AP', en: 'Tempestus Exemplars: Pick Up, Place Marker and mission actions cost 1 less AP this activation' }; } },
  aqProgena: { kind: 'button', start: true, cond: (g, o) => (!isAQ(o) || tpl(o).aqSentry ? { zh: '需要風暴天鷹（非伺服哨兵）', en: 'Needs a TEMPESTUS AQUILON (not the Servo-sentry)' } : null), apply(g, o) { const h = Math.min(o.maxW - o.wounds, d3() + d3()); o.wounds += h; o.ap = tpl(o).apl; return { zh: `孤兒學院：回復  生命，本次啟動無視 APL 改變`, en: `Progena: regains  wounds and ignores APL changes this activation` }; } },
  xvSaviour: { kind: 'auto' },
  xvRetro: { kind: 'auto' },
  xvJet: { kind: 'button', start: true, cond: (g, o) => (isXV(o) && !tpl(o).xvDrone ? null : { zh: '只有隱形戰鬥服（非無人機）', en: 'XV26 suits only (not drones)' }), apply(g, o) { o.acted.xvJet = true; return { zh: '噴射背包：本次無視攀爬與下落的垂直距離', en: 'Engage Jet Pack: climbs and drops cost nothing this time' }; } },
  xvGhost: { kind: 'button', cond: (g, o) => (!isXV(o) ? { zh: '只有隱形戰鬥服', en: 'XV26 only' } : o.xvGhostUsed ? { zh: '這名特工整場只能一次', en: 'Once per operative per battle' } : null), apply(g, o) { o.acted.xvGhost = true; o.xvGhostUsed = true; return { zh: '幽靈罩：啟動結束時改為隱蔽指令', en: 'Ghostshroud: it switches to Conceal at the end of the activation' }; } },
  vsVenom: { kind: 'auto' },
  vsOcelli: { kind: 'button', cond: () => ({ zh: '2D 版本沒有高度，沒有效果', en: 'No effect in 2D (no heights)' }), apply() { return null; } },
  vsDart: { kind: 'button', cond: (g, o) => (!isVS(o) ? { zh: '只有胡蜂', en: 'VESPID STINGWINGS only' } : o.acted.reposition ? { zh: '已經重新定位過', en: 'Already repositioned' } : null), apply(g, o) { const r = d6(), n = Math.ceil(r / 2); o.acted.vsDart = n; o.vsNoAtkTP = g.tp; return { zh: `疾飛：擲 ${r} → 重新定位多 ${n}"，本回合不能射擊或近戰`, en: `Darting Flight: rolled ${r} → Reposition ${n}" further; no Shoot or Fight this TP` }; } },
  vsOverload: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (isVS(op) && op.acted?.vsMoved && t && edgeDist(op, t) <= 4 && (!w || w.rules?.vsNeutron) ? null : { zh: '需要在移動過的啟動中、用中子武器打 4" 內的目標', en: 'Needs a neutron weapon, a target within 4" and to have moved this activation' }) },
  vdCurtain: { kind: 'auto' },
  vdDomino: { kind: 'auto' },
  vdElusive: { kind: 'button', cond: (g, o) => (isVD(o) ? null : { zh: '只有虛空舞者', en: 'VOID-DANCER TROUPE only' }), apply(g, o) { o.vdElusive = true; return { zh: '難以捉摸：到下次啟動前，隱蔽且在掩護中時 2" 外不能被選為目標', en: 'Elusive Target: until its next activation, Concealed and in cover it can\'t be targeted beyond 2"' }; } },
  vdMurder: { kind: 'attack', fight: true, cond: (g, op) => (isVD(op) && count(op, 'charge') ? null : { zh: '本次啟動沒有衝鋒', en: 'Didn\'t Charge this activation' }) },
  rvSlither: { kind: 'button', cond: (g, o) => (isRV(o) ? null : { zh: '只有蛇蟲', en: 'RAVENERs only' }), apply(g, o) { o.acted.rvSlither = true; return { zh: '滑溜閃避：撤退少 1AP，且可以在交戰中衝鋒', en: 'Slithering Evasion: Fall Back for 1 less AP and Charge while engaged' }; } },
  rvFrenzy: { kind: 'auto' },
  rvHorror: { kind: 'auto' },
  rvStrike: { kind: 'auto' },
  nodalResponse: { kind: 'button', cond: (g, o) => o.side < 2 && g.nodalOpen != null ? { zh: '已開啟', en: 'Already open' } : null, apply(g, o) { g.nodalOpen = o.side; } },
  animateNodes: { kind: 'node' },
  // ---- Blades of Khaine (firefight ploys, then Aspect Techniques) ----
  bladewind: { kind: 'button', cond: (g, o) => (o.counter ? { zh: '反擊時不能使用', en: 'Not during counteraction' } : null), apply(g, o) { o.acted.fightsAllowed = 2; } },
  starfall: { kind: 'button', cond: (g, o) => (o.counter ? { zh: '反擊時不能使用', en: 'Not during counteraction' } : null), apply(g, o) { o.acted.starfall = true; } },
  fadingLight: { kind: 'button', apply(g, o) { o.acted.slip = true; } },
  contempt: { kind: 'auto' },
  avVigilance: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (w && CATAPULTS.includes(w.id) ? null : { zh: '要用手裡劍彈射器', en: 'Needs a shuriken catapult' }) },
  avThousand: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (w && CATAPULTS.includes(w.id) ? null : { zh: '要用手裡劍彈射器', en: 'Needs a shuriken catapult' }) },
  avUnstinting: { kind: 'auto' },
  avRagingHeat: { kind: 'button', apply(g, o) { o.ragingHeat = true; } },
  hbShriek: { kind: 'weapon' }, // (picked as a weapon: BK_SHRIEK)
  hbWoe: { kind: 'auto' },
  ssEye: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (w?.id === 'bkPistol' ? null : { zh: '要用手裡劍手槍', en: 'Needs a shuriken pistol' }) },
  ssMerciless: { kind: 'attack', fight: true },
  ssGloom: { kind: 'button', apply(g, o) { o.gloom = true; } },
  ssFade: { kind: 'auto' },
  // ---- Gellerpox Infected ----
  putrescentDemise: { kind: 'auto' },
  frighteningOnslaught: { kind: 'button',
    cond: (g, op) => (tpl(op).hulk && count(op, 'fight') && fightTargets(g, op).length ? null : { zh: '噩夢巨獸近戰後才能用', en: 'A Nightmare Hulk, after a Fight' }),
    apply(g, op) { op.acted.free = { ...(op.acted.free || {}), fight: 'any' }; } },
  revoltingTech: { kind: 'auto' },
  // ---- Hunter Clade ----
  commandOverride: { kind: 'button', start: true,
    apply(g, op) {
      const mode = avgDmg(bestMelee(op)) > Math.max(0, ...tpl(op).weapons.filter((w) => w.type === 'ranged').map((w) => avgDmg(w))) ? 'conqueror' : 'protector';
      op.docOverride = { tp: g.tp, mode };
      const t = team(g, op.side).tactics.find((x) => x.id === mode);
      return { zh: `改為${t.name.zh}`, en: `now ${t.name.en}` };
    } },
  omnissiah: { kind: 'button', cond: (g, op) => (doctrina(g, op) ? null : { zh: '沒有教條指令', en: 'No Doctrina Imperative' }), apply(g, op) { op.omniTP = g.tp; } },
  scrapcode: { kind: 'button', start: true, cond: (g, op) => (tpl(op).infiltrator ? null : { zh: '只有滲透者', en: 'Infiltrators only' }), apply(g, op) { (g.scrapcode ||= [null, null])[op.side] = op.uid; } },
  // ---- Hearthkyn Salvagers ----
  sturdy: { kind: 'auto' },
  engageToAcquire: { kind: 'attack', cond: (g, op, t) => (t && holdsObjective(g, t) ? null : { zh: '目標沒有控制目標點', en: 'The target doesn\'t control an objective' }) },
  ancestorsWatching: { kind: 'button', apply(g, op) { op.acted.ancestors = true; op.acted.free = { ...(op.acted.free || {}), shoot: 'any', fight: 'any' }; } },
  // ---- Hierotek Circle ----
  livingLightning: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (w?.id === 'teslaCarbine' ? null : { zh: '只能用特斯拉卡賓槍', en: 'Tesla carbine only' }) },
  // ---- Imperial Navy Breachers ----
  blitz: { kind: 'attack', cond: (g, op, t) => (t && edgeDist(op, t) <= 6 && g.attackTP?.[op.side] !== g.tp ? null : { zh: '要是本回合第一次攻擊、目標在 6" 內', en: 'The team\'s first attack this TP, within 6"' }) },
  overwhelmTarget: { kind: 'button', start: true, cond: (g, op) => (op.breachedTP === g.tp || op.breach?.length ? null : { zh: '要在突破清場啟動時', en: 'Only when activated with Breach and Clear' }), apply(g, op) { op.ap += 1; } },
  // ---- Kommandos ----
  justScratch: { kind: 'auto' },
  // ---- Wrecka Krew ----
  wkJustScratch: { kind: 'auto' },
  wkDemolition: { kind: 'auto' },
  // ---- Ratlings ----
  rtLarcenous: { kind: 'button', cond: (g, op) => (isSmall(op) ? null : { zh: '只有萊特林（不含歐格林、重盾歐格林）', en: 'Ratlings only (not Ogryns or Bullgryns)' }), apply(g, op) { op.rtLarcenous = true; } },
  rtShootHide: { kind: 'button', cond: (g, op) => rtShootHideWhy(g, op), apply(g, op) { op.order = 'conceal'; } },
  rtSurvival: { kind: 'auto' },
  // ---- Sanctifiers ----
  sfRosarius: { kind: 'auto' },
  sfRedeemed: { kind: 'auto' },
  sfUnwavering: { kind: 'auto' },
  sfArdent: { kind: 'attack', cond: (g, op, t) => (isSF(op) && t && sfNearOrator(g, op.side, t) ? null : { zh: '目標要在佈道者 3"（懺悔師 6"）內', en: 'The target must be within 3" of the orator (6" for the Confessor)' }) },
  rtSharpshot: { kind: 'aim', cond: (g, op, t, w) => (isRat(op) && isRifle(w) ? null : { zh: '只有萊特林用步槍', en: 'A Ratling with a rifle only' }) },
  // ---- Scout Squad ----
  scTraining: { kind: 'button', cond: (g, op) => (isSC(op) ? (isAstartes(op) ? { zh: '士官本來就能雙射／雙打', en: 'The Sergeant already has Astartes' } : null) : { zh: '只有偵察小隊特工', en: 'Scout Squad operatives only' }), apply(g, op) { op.acted.scTrain = true; } },
  scRaw: { kind: 'button', cond: (g, op) => (isSC(op) ? null : { zh: '只有偵察小隊特工', en: 'Scout Squad operatives only' }), apply(g, op) { op.scRaw = true; } },
  scCovert: { kind: 'button', cond: (g, op) => (isSC(op) ? null : { zh: '只有偵察小隊特工', en: 'Scout Squad operatives only' }), apply(g, op) { op.scCovert = true; } },
  scEmboldened: { kind: 'attack', cond: (g, op, t) => (isSC(op) && scEmbOk(g, op, t) ? null : { zh: '要是本回合第一個攻擊的友方、或敵人的 Wounds 比它高', en: 'Must be the first friendly to attack this TP, or the enemy has a higher Wounds stat' }) },
  // ---- Nemesis Claw ----
  ncDeathFalse: { kind: 'auto' },
  ncMurder: { kind: 'auto' },
  ncVox: { kind: 'auto' },
  ncDirty: { kind: 'auto' },
  wkKaboom: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (w && w.rules.blast ? null : { zh: '只能用有爆破的武器', en: 'Blast weapons only' }) },
  wkProppaScrap: { kind: 'button', cond: (g, op) => (/Breaka Boy|Boss Nob/.test(tpl(op).name.en) ? null : { zh: '只有破壞小子或頭目', en: 'Breaka Boyz and the Boss Nob only' }), apply(g, op) { op.acted.wkTwoFights = true; } },
  shakeItOff: { kind: 'button', start: true, apply(g, op) { op.shakeTP = g.tp; if ((op.aplNext || 0) < 0 && !op.counter) op.ap += Math.min(1, -op.aplNext); } },
  // ---- Pathfinders ----
  supportingFire: { kind: 'aim' },
  worthyCause: { kind: 'auto' },
  saviourProtocols: { kind: 'auto' },
  pointBlank: { kind: 'auto' },
  // ---- Phobos Strike Team ----
  criticalShot: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (w && isBoltWeapon(w) ? null : { zh: '只能用爆彈武器', en: 'Bolt weapons only' }) },
  // ---- Plague Marines ----
  sickeningResilience: { kind: 'auto' },
  virulentPoison: { kind: 'button',
    cond: (g, op) => (poisonTargets(g, op).length ? null : { zh: '附近沒有未中毒的敵人', en: 'No unpoisoned enemy nearby' }),
    apply(g, op) {
      const t = poisonTargets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
      t.poison = true;
      return { zh: `${opName(t, 'zh')} 中毒`, en: `${opName(t, 'en')} is poisoned` };
    } },
  poisonousDemise: { kind: 'auto' },
  // ---- Kasrkin ----
  neutraliseTarget: { kind: 'attack', shoot: true, cond: (g, op, t, w) => (t && w && (auspexOn(g, op, t) || !shotVisibility(g, op, t, w).cover || w.rules.saturate) ? null : { zh: '目標要沒有掩護豁免、或被掃描中', en: 'The target must have no cover saves, or be scanned' }) },
  // ---- Legionaries ----
  mutability: { kind: 'button', start: true, cond: (g, op) => (markOf(op) === 'tzeentch' ? null : { zh: '只有奸奇印記', en: 'Tzeentch only' }), apply(g, op) { op.ap += 1; } },
  malignantAura: { kind: 'attack', shoot: true, cond: (g, op, t) => (markOf(op) === 'nurgle' && t && edgeDist(op, t) <= 3 ? null : { zh: '納垢印記、目標在 3" 內', en: 'Nurgle, target within 3"' }) },
  sickeningCaptivation: { kind: 'button',
    cond: (g, op) => (markOf(op) === 'slaanesh' && foes(g, op).some((e) => e.side < 2 && edgeDist(op, e) <= 4 && visibility(g, op, e).visible) ? null : { zh: '色孽印記、4" 內有看得到的敵人', en: 'Slaanesh, a visible enemy within 4"' }),
    apply(g, op) {
      const e = foes(g, op).filter((x) => x.side < 2 && edgeDist(op, x) <= 4 && visibility(g, op, x).visible).sort((a, b) => tpl(b).apl - tpl(a).apl)[0];
      changeApl(g, e, -1);
      return { zh: `${opName(e, 'zh')} 下次啟動 APL -1`, en: `${opName(e, 'en')} gets -1 APL next activation` };
    } },
  // ---- Warpcoven ----
  allIsDust: { kind: 'auto' },
  capricious: { kind: 'button', cond: (g, op) => (tpl(op).sorcerer && !isEngaged(g, op) ? null : { zh: '只有巫師、且不在交戰中', en: 'Sorcerers only, not engaged' }), apply(g, op) { op.acted.free = { ...(op.acted.free || {}), dash: 'capricious' }; } },
  // ---- Wyrmblade ----
  slink: { kind: 'button', cond: (g, op) => (op.order === 'engage' && !op.slinkUsed ? null : { zh: '要是交戰指令（每名整場一次）', en: 'Engage order only (once per operative per battle)' }), apply(g, op) { op.acted.slink = true; op.slinkUsed = true; } },
  coiledSerpent: { kind: 'attack', cond: (g, op) => (sprungNow(op) && !count(op, 'shoot') && !count(op, 'fight') ? null : { zh: '要在隱蔽轉交戰後的第一次攻擊', en: 'First attack after switching from Conceal' }) },
};
/** The kind of a firefight ploy ('button' | 'aim' | 'attack' | 'auto'), for the interface. */
export const ffKind = (id) => FF[id]?.kind || null;
const poisonTargets = (g, op) => foes(g, op).filter((t) => !t.poison && t.side < 2 && (edgeDist(op, t) <= 3 || (edgeDist(op, t) <= 7 && visibility(g, op, t).visible)));

/** Death to the False Emperor (Nemesis Claw, automatic): re-roll against an IMPERIUM operative (unless re-rolls are barred). */
function ncPrey(g, op, target, pool) {
  if (!isNC(op) || noRerollHere(g, op) || voxbroken(g, op) || neurostatic(g, op) || broadcastNear(g, op)) return;
  ncDeath(g, op, target, pool, autoFF, tally);
}
function archonPrey(g, op, target, pool) {
  const imperium = ['angels', 'phobos', 'deathKorps', 'kasrkin', 'exaction', 'navyBreachers', 'hunterClade', 'battleclade', 'novitiates', 'celestianInsidiants', 'deathwatch'];
  const chaos = ['blooded', 'legionaries', 'plagueMarines', 'warpcoven', 'fellgor', 'gellerpox'];
  const keys = TEAM_MAP[target.team].keywords || (imperium.includes(target.team) ? ['IMPERIUM'] : chaos.includes(target.team) ? ['CHAOS'] : []);
  if (isDeathwatch(op) && !keys.includes('IMPERIUM') && !keys.includes('CHAOS') && pool.dice.some((d) => d.res === 'miss' && !d.rr) && !noRerollHere(g, op) && !voxbroken(g, op) && !neurostatic(g, op) && !broadcastNear(g, op) && autoFF(g, op.side, 'dwSufferAlien')) {
    for (const d of pool.dice) if (!d.auto && !d.rr && d.res === 'miss') { d.v = d6(); d.rr = true; } tally(pool);
  }
  if (target.wounds < target.maxW && pool.dice.some((d) => d.res === 'miss' && !d.rr) && !noRerollHere(g, op) && !voxbroken(g, op) && !neurostatic(g, op) && !broadcastNear(g, op) && autoFF(g, op.side, 'preyWounded')) {
    for (const d of pool.dice) if (!d.auto && !d.rr && d.res === 'miss') { d.v = d6(); d.rr = true; } tally(pool);
  }
}

/** Button ploys for the active operative: [{id, cp, ok, why}]. */
export function ffButtons(g, op) {
  if (!op || op.side > 1 || g.phase !== 'firefight' || g.active !== op.uid) return [];
  return ffList(TEAM_MAP[op.team]).filter((p) => FF[p.id]?.kind === 'button' && (!p.technique || tpl(op).aspect === p.aspect)).map((p) => {
    const def = FF[p.id];
    const why = ffUsedNow(g, op.side, p.id) ? { zh: '本回合已用過', en: 'Already used this TP' }
      : !ffReady(g, op.side, p.id) ? { zh: 'CP 不足', en: 'Not enough CP' }
      : def.start && !startOfActivation(op) ? { zh: '只能在啟動時（第一個動作前）', en: 'Only when activated (before its first action)' }
      : techWhy(g, op, p.id) || def.cond?.(g, op) || null;
    return { id: p.id, cp: ffCostNow(g, op.side, p.id), ok: !why, why };
  });
}
export function useFFButton(g, op, id) {
  const b = ffButtons(g, op).find((x) => x.id === id);
  if (!b?.ok) return false;
  spendFF(g, op.side, id);
  const msg = FF[id].apply(g, op);
  if (msg) log(g, { zh: `${opName(op, 'zh')}：${msg.zh}`, en: `${opName(op, 'en')}: ${msg.en}` }, `side${op.side}`);
  return true;
}
/** Aim / attack ploys that fit this Shoot or Fight: [{id, cp, ok, why, on}]. */
export function ffAttackOptions(g, op, kind, weapon, target, aim = false) {
  if (!op || op.side > 1) return [];
  return ffList(TEAM_MAP[op.team]).filter((p) => {
    const d = FF[p.id];
    if (!d || (aim ? d.kind !== 'aim' : d.kind !== 'attack') || (p.technique && tpl(op).aspect !== p.aspect)) return false;
    return kind === 'fight' ? !d.shoot && (aim ? false : true) : !d.fight;
  }).map((p) => {
    const why = ffUsedNow(g, op.side, p.id) ? { zh: '本回合已用過', en: 'Already used this TP' }
      : !ffReady(g, op.side, p.id, target) ? { zh: 'CP 不足', en: 'Not enough CP' } : techWhy(g, op, p.id) || FF[p.id].cond?.(g, op, target, weapon) || null;
    return { id: p.id, cp: ffCostNow(g, op.side, p.id, target), ok: !why, why, on: ffOn(g, op, p.id) };
  });
}
/** Choose / unchoose an aim or attack ploy for the operative's next Shoot or Fight (paid when the dice are rolled). */
export function ffToggle(g, op, id, target = null) {
  const p = (g.ffPending && g.ffPending.uid === op.uid) ? g.ffPending : (g.ffPending = { uid: op.uid, ids: [] });
  const i = p.ids.indexOf(id);
  if (i >= 0) p.ids.splice(i, 1);
  else if (ffReady(g, op.side, id, target)) p.ids.push(id);
}
export function ffClearPending(g) { g.ffPending = null; }
/** The dice are about to be rolled: pay for the chosen ploys (dropping any that no longer apply). */
export function ffCommit(g, op, kind, weapon, target) {
  const p = g.ffPending && g.ffPending.uid === op.uid ? g.ffPending : null;
  g.ffPending = null;
  const ids = [];
  for (const id of p?.ids || []) {
    const ok = [...ffAttackOptions(g, op, kind, weapon, target, true), ...ffAttackOptions(g, op, kind, weapon, target)].find((x) => x.id === id && x.ok);
    if (ok) { spendFF(g, op.side, id); ids.push(id); }
  }
  g.ffAtk = ids.length ? { uid: op.uid, ids } : null;
  (g.attackTP ||= [0, 0])[op.side] = g.tp; // (Blitz: the team's first attack this turning point)
}
/** Inviolate Jurisdiction (ploy): shot within 2" of an objective marker or an enemy — re-roll one defence die. */
const inviolate = (g, op) => op.side < 2 && TEAM_MAP[op.team].ruthless && hasPloy(g, op.side, 'inviolate')
  && ((g.objectives || []).some((o) => dist(op, o) - radius(op) - OBJ_R <= 2) || foes(g, op).some((e) => edgeDist(e, op) <= 2));
const veriscantOn = (g, op, target) => {
  const v = g.veriscant?.[op.side];
  return !!(v && target && v.t === target.uid && op.team === g.teams[op.side]);
};
const sorcererNear = (g, op, d) => living(g, op.side).some((o) => o !== op && tpl(o).sorcerer && edgeDist(o, op) <= d);

// ---------- Phobos Strike Team ----------
/** Voxbreak: an enemy within 6" of a Voxbreaker can't re-roll its attack or defence dice. */
export const voxbroken = (g, op) => foes(g, op).some((o) => tpl(o).voxbreak && edgeDist(o, op) <= 6);

/** Omni-scrambler (STRATEGIC GAMBIT): enemies that may be picked — visible to a friendly Infiltrator, or within 6" of the Voxbreaker. */
export function scrambleTargets(g, side) {
  const inf = living(g, side).filter((o) => tpl(o).infiltrator);
  if (!TEAM_MAP[g.teams[side]].omniScrambler || !inf.length) return [];
  return living(g, 1 - side).filter((t) => inf.some((o) => visibility(g, o, t).visible || (tpl(o).voxbreak && edgeDist(o, t) <= 6)));
}
export function omniScramble(g, side, target) {
  if (!target || g.scramble?.[side]?.tp === g.tp || !scrambleTargets(g, side).includes(target)) return false;
  const n = living(g, side).filter((o) => tpl(o).infiltrator).length;
  (g.scramble ||= [null, null])[side] = { uid: target.uid, tp: g.tp, n };
  log(g, { zh: `${teamZh(g, side)} 全頻擾亂器：${opName(target, 'zh')} 要等對手先啟動 ${n} 名特工才能行動`, en: `${team(g, side).name.en} Omni-scrambler: ${opName(target, 'en')} can't act until ${n} other operatives have activated` }, `side${side}`);
  return true;
}
/** Is this operative held back by an enemy Omni-scrambler right now? */
function scrambled(g, op, ready) {
  const s = g.scramble?.[1 - op.side];
  if (!s || s.tp !== g.tp || s.uid !== op.uid) return false;
  return (g.actCount?.[op.side] || 0) < s.n && ready.some((o) => o !== op);
}

/** Auspex Scan: shooting an enemy within 8" of the Voxbreaker — it can't be obscured; an Incursor also has Seek Light. */
function auspexOn(g, op, target) {
  const a = g.auspex?.[op.side];
  const vb = a && getOp(g, a);
  return !!(vb && !vb.dead && target && edgeDist(vb, target) <= 8);
}

// ---------- Imperial Navy Breachers ----------
/** The Attack / Defence Order marker for this TP (placed when the ploy is used; moved in the Strategy phase). */
export function placeNavyOrder(g, side, at) {
  const kind = g.ploys[side].includes('attackOrder') ? 'attack' : g.ploys[side].includes('defenceOrder') ? 'defence' : null;
  if (!kind || !at) return;
  (g.navyOrder ||= [null, null])[side] = { kind, x: at.x, y: at.y, tp: g.tp };
}
const navyOrderNear = (g, op, kind) => {
  const m = g.navyOrder?.[op.side];
  return !!(m && m.tp === g.tp && m.kind === kind && dist(m, op) - radius(op) <= 3);
};
/** Brace for Counterattack: in your territory, or no Charge / Fall Back / Reposition this TP. */
const braced = (g, op) => hasPloy(g, op.side, 'braceCounter') && (territoryOf(g, op) === op.side || op.bigMoveTP !== g.tp);

// ---------- Hearthkyn Salvagers ----------
function addGrudge(g, side, enemy, why) {
  (enemy.grudge ||= {})[side] = (enemy.grudge[side] || 0) + 1;
  log(g, { zh: `${opName(enemy, 'zh')} 獲得宿怨標記（${why.zh}，共 ${enemy.grudge[side]}）`, en: `${opName(enemy, 'en')} gains a Grudge token (${why.en}; ${enemy.grudge[side]} in total)` }, `side${side}`);
}

/** Eye of the Ancestors (Theyn, STRATEGIC GAMBIT): how many enemies can still be given a Grudge token this TP. */
export function eyeLeft(g, side) {
  if (!living(g, side).some((o) => tpl(o).eyeOfAncestors)) return 0;
  const lost = g.ops.filter((o) => o.side === side && o.dead).length;
  const used = g.eye?.[side]?.tp === g.tp ? g.eye[side].n : 0;
  return Math.max(0, (lost >= 3 ? 2 : 1) - used);
}
export function eyeOfAncestors(g, side, enemy) {
  if (!eyeLeft(g, side) || !enemy || enemy.dead) return false;
  const e = (g.eye ||= [null, null]);
  e[side] = { tp: g.tp, n: (e[side]?.tp === g.tp ? e[side].n : 0) + 1 };
  addGrudge(g, side, enemy, { zh: '先祖之眼', en: 'Eye of the Ancestors' });
  return true;
}

/** Tactician (Kognitâar, STRATEGIC GAMBIT): the Attack marker on an enemy, or the Defence marker on a friendly, for this TP. */
export function placeTactician(g, side, kind, at) {
  (g.tactician ||= [null, null])[side] = at ? { kind, x: at.x, y: at.y, tp: g.tp } : null;
  if (at) log(g, { zh: `${teamZh(g, side)} 戰術家：${kind === 'attack' ? '攻擊' : '防禦'}標記放在 ${opName(at, 'zh')} 處`, en: `${team(g, side).name.en} Tactician: ${kind === 'attack' ? 'Attack' : 'Defence'} marker placed at ${opName(at, 'en')}` }, `side${side}`);
}
/** Weavefield Crest: use the Theyn's once-per-battle ignore of one die's Normal Dmg (the first time it matters). */
function useCrest(g, op) {
  if (!(tpl(op).weavefield || tpl(op).apotheosis) || op.crestUsed) return false;
  op.crestUsed = true;
  if (tpl(op).apotheosis) log(g, { zh: `${opName(op, 'zh')} 即將成神：無視一次普通傷害`, en: `${opName(op, 'en')} Impending Apotheosis: ignores one Normal Dmg` }, `side${op.side}`); // (Blood Herald)
  else log(g, { zh: `${opName(op, 'zh')} 編織力場紋章：無視一次普通傷害`, en: `${opName(op, 'en')} Weavefield Crest: ignores one Normal Dmg` }, `side${op.side}`);
  return true;
}
const defenceMarker = (g, op) => { const t = g.tactician?.[op.side]; return !!(t && t.tp === g.tp && t.kind === 'defence' && dist(t, op) - radius(op) <= 3); };

// ---------- Death Korps ----------
export const GUARD_ORDERS = {
  takeAim: { zh: '瞄準！', en: 'Take Aim!', dzh: '遠程武器「無休」（迫擊砲彈幕除外）', den: 'Ranged weapons have Ceaseless (not the mortar barrage)' },
  fixBayonets: { zh: '上刺刀！', en: 'Fix Bayonets!', dzh: '近戰武器「無休」', den: 'Melee weapons have Ceaseless' },
  digIn: { zh: '固守！', en: 'Dig In!', dzh: '被射擊且能保留掩護豁免時，可重擲某一點數的所有防禦骰', den: 'When shot and cover saves can be retained, re-roll all defence dice of one result' },
  moveMove: { zh: '快快快！', en: 'Move! Move! Move!', dzh: '轉移時 Move +1"', den: '+1" Move when Repositioning' },
};
/** The Guardsman Order this operative received this turning point, if any. */
export const guardOrder = (g, op) => (op.gOrder?.tp === g.tp ? op.gOrder.id : null);

/** Who issues Guardsman Orders: the Watchmaster, or the Confidant once the Watchmaster is gone (Second in Command). */
export function orderIssuer(g, side) {
  return living(g, side).find((o) => tpl(o).watchmaster) || living(g, side).find((o) => tpl(o).confidant) || null;
}

/**
 * Strategy phase (STRATEGIC GAMBIT): choose the order for this turning point. It's handed out when the side
 * finishes choosing ploys: all friendlies within 6" of the issuer, or everyone if the Vox-operator relays it.
 */
export function chooseGuardOrder(g, side, id, relay = false) {
  (g.gorders ||= [null, null])[side] = id ? { id, relay: !!relay } : null;
}

function handOutGuardOrder(g, side) {
  const pick = g.gorders?.[side];
  const issuer = orderIssuer(g, side);
  if (!pick || !issuer) return;
  if (!tpl(issuer).watchmaster) (g.secondInCommand ||= [false, false])[side] = true;
  (g.gIssued ||= [false, false])[side] = true; // (Adaptive Orders: the Watchmaster issued one as a strategic gambit)
  giveGuardOrder(g, side, issuer, pick);
}
/** An issuer's Guardsman Order reaches the friendlies within 6" (or everyone via the Vox-operator, or one operative with Comm-beads). */
export function giveGuardOrder(g, side, issuer, pick) {
  let got = living(g, side).filter((o) => edgeDist(o, issuer) <= 6 || o === issuer);
  const vox = got.find((o) => tpl(o).relay && !isEngaged(g, o));
  const relayed = pick.relay && vox;
  if (relayed) { got = living(g, side); changeApl(g, vox, -1); }
  else if (dkBeadsOn(g, side)) got = [dkBeadsTarget(g, got, pick.id)].filter(Boolean); // Comm-beads (equipment): one operative instead of everyone
  for (const o of got) o.gOrder = { id: pick.id, tp: g.tp };
  const o = GUARD_ORDERS[pick.id];
  log(g, {
    zh: `${opName(issuer, 'zh')} 下達衛兵命令「${o.zh}」：${got.length} 名友方收到${relayed ? `（${opName(vox, 'zh')} 轉達全隊，下次啟動 APL -1）` : ''}`,
    en: `${opName(issuer, 'en')} issues the Guardsman Order "${o.en}": ${got.length} friendly operatives receive it${relayed ? ` (${opName(vox, 'en')} relays it to everyone, -1 APL next activation)` : ''}`,
  }, `side${side}`);
}

function whollyInOwnTerritory(g, op) {
  const along = g.axis === 'y' ? 'y' : 'x', r = radius(op);
  return [-r, r].every((d) => territoryOf(g, { ...op, [along]: op[along] + d }) === op.side);
}

/** Spot: shooting the spotted enemy from within 3" of the Spotter gives Seek Light, and it can't be obscured. */
function spotOn(g, op, target) {
  const s = g.spot?.[op.side];
  if (!s || s.tp !== g.tp || !target || s.t !== target.uid) return false;
  const spotter = getOp(g, s.by);
  // The Navy Breachers' C.A.T. unit spots for the whole team; the Death Korps / Hearthkyn spotters for friendlies within 3".
  // (Gaze of the Omnissiah, Battleclade Auto-proxy: for the whole team too.)
  return !!spotter && !spotter.dead && sameTeam(spotter, op) && (tpl(spotter).catUnit || tpl(spotter).spotAll || edgeDist(spotter, op) <= 3);
}

/** The enemy is within 1" of this side's Pech'ra marker. */
function pechraNear(g, side, target) {
  const m = g.pechra?.[side];
  return !!(m && target && dist(m, target) - radius(target) <= 1);
}

/**
 * A pool of dice: each die keeps its rolled value, and `tally` works out which are successes and applies
 * the rules that change them afterwards (Severe, Rending, Punishing, and `post`). Tallying again after a
 * die is re-rolled (Command Re-roll) recomputes all of that from the dice values.
 */
function rollPool(n, success, critOn, rules = {}, post = null) {
  // Accurate x: retain up to x dice as normal successes without rolling them.
  const auto = Math.min(n, rules.accurate || 0);
  const dice = Array.from({ length: n - auto }, () => ({ v: d6(), rr: false }));
  const fail = (v) => rules.soulstrikeDef ? v !== 1 && (v === 6 || v > success) : v < success || (rules.no3 && v === 3); // Soulstrike reverses defence thresholds
  if (rules.reroll6) for (const d of dice) if (d.v === 6) { d.v = d6(); d.rr = true; } // Ravage Destiny (forced)
  if (rules.ceaseless && !rules.noReroll1) for (const d of dice) if (!d.rr && d.v === 1) { d.v = d6(); d.rr = true; } // (Flayed Skin: results of 1 can't be re-rolled)
  if (rules.digIn && !rules.relentless) {
    // Dig In!: re-roll every die showing one result — the failed result that came up most.
    const tally_ = {};
    for (const d of dice) if (!d.rr && fail(d.v)) tally_[d.v] = (tally_[d.v] || 0) + 1;
    const v = +Object.keys(tally_).sort((a, b) => tally_[b] - tally_[a])[0];
    if (v) for (const d of dice) if (!d.rr && d.v === v) { d.v = d6(); d.rr = true; }
  }
  if (rules.relentless) for (const d of dice) if (!d.rr && fail(d.v) && !(rules.noReroll1 && d.v === 1)) { d.v = d6(); d.rr = true; } // re-roll all fails
  if (rules.balanced) {
    const f = dice.filter((d) => !d.rr && fail(d.v) && !(rules.noReroll1 && d.v === 1)).sort((a, b) => a.v - b.v)[0];
    if (f) { f.v = d6(); f.rr = true; }
  }
  // Void Armour (Navy Breachers): re-roll up to n failed defence dice.
  if (rules.rerollFails) {
    for (const d of dice.filter((x) => !x.rr && fail(x.v)).sort((a, b) => a.v - b.v).slice(0, rules.rerollFails)) { d.v = d6(); d.rr = true; }
  }
  dice.sort((a, b) => b.v - a.v);
  for (let k = 0; k < auto; k++) dice.push({ v: '✓', res: 'norm', auto: true });
  const pool = {
    dice, success, critOn, post, crits: 0, norms: 0,
    rules: { soulstrikeDef: !!rules.soulstrikeDef, severe: !!rules.severe, rending: !!rules.rending, punishing: !!rules.punishing, no3: !!rules.no3, grudge: rules.grudge || 0, closeAssault: !!rules.closeAssault, gaze: !!rules.gaze, promote: rules.promote || 0 },
  };
  return tally(pool);
}

function tally(pool) {
  const { dice, success, critOn, rules } = pool;
  for (const d of dice) {
    delete d.sev; delete d.rend; delete d.pun; delete d.indo; delete d.obsc; delete d.obscDrop; delete d.grudge; delete d.gaze; delete d.prom;
    const ok = rules.soulstrikeDef ? d.v !== 6 && (d.v === 1 || d.v <= success) : d.v >= success && !(rules.no3 && d.v === 3);
    d.res = d.auto ? 'norm' : ok && (rules.soulstrikeDef ? d.v === 1 : d.v >= critOn) ? 'crit' : ok ? 'norm' : 'miss';
    // Acts of Faith (Novitiates): Blessing keeps a normal as a crit, Intervention a fail as a normal.
    if (d.faith === 'crit' && d.res === 'norm') d.res = 'crit';
    if (d.faith === 'norm' && d.res === 'miss') d.res = 'norm';
  }
  let crits = dice.filter((d) => d.res === 'crit').length;
  let norms = dice.filter((d) => d.res === 'norm').length;
  if (rules.severe && crits === 0 && norms > 0) {
    // Severe: no critical success retained, so one normal success becomes critical (Rending and Punishing then don't apply).
    const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.sev = true;
    crits++; norms--;
  } else if (crits > 0) {
    if (rules.rending && norms > 0) {
      const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.rend = true;
      crits++; norms--;
    }
    // Punishing: with a critical success retained, one fail becomes a normal success.
    const miss = rules.punishing && dice.find((x) => x.res === 'miss');
    if (miss) { miss.res = 'norm'; miss.pun = true; norms++; }
  }
  // Gaze of the Gods (Blooded): the success retained through Accurate 1 is a critical success.
  const gz = rules.gaze && dice.find((x) => x.auto && x.res === 'norm');
  if (gz) { gz.res = 'crit'; gz.gaze = true; crits++; norms--; }
  // Grudge (Hearthkyn): one normal success per Grudge token is retained as a critical success.
  for (let k = 0; k < (rules.grudge || 0) && norms > 0; k++) {
    const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.grudge = true;
    crits++; norms--;
  }
  // Coiled Serpent (Wyrmblade firefight ploy): one normal success is retained as a critical success.
  for (let k = 0; k < (rules.promote || 0) && norms > 0; k++) {
    const d = dice.find((x) => x.res === 'norm'); d.res = 'crit'; d.prom = true;
    crits++; norms--;
  }
  // Close Assault (Navy Breachers): with two or more fails, one becomes a normal success.
  const misses = rules.closeAssault ? dice.filter((x) => x.res === 'miss') : [];
  if (misses.length >= 2) { misses[0].res = 'norm'; misses[0].indo = true; norms++; }
  pool.crits = crits; pool.norms = norms;
  pool.post?.(pool);
  return pool;
}

/** Obscured: the attacker's critical successes become normal successes, then one success is discarded. */
function obscure(pool) {
  for (const d of pool.dice) if (d.res === 'crit') { d.res = 'norm'; d.obsc = true; }
  const drop = pool.dice.filter((d) => d.res === 'norm').sort((x, y) => (x.auto ? 1 : 0) - (y.auto ? 1 : 0))[0];
  if (drop) { drop.res = 'miss'; drop.obscDrop = true; }
  pool.crits = 0;
  pool.norms = pool.dice.filter((d) => d.res === 'norm').length;
}

/** Expected damage of ac/an unblocked attack successes against n defence dice (save+, crit on critOn) plus retained saves. */
function expectedDamage(ac, an, n, save, critOn, cN, cC, dn, dc) {
  const pc = Math.max(0, 7 - Math.max(critOn, save)) / 6, ps = Math.max(0, 7 - save) / 6, pn = ps - pc, pm = 1 - ps;
  const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
  let e = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; i + j <= n; j++) {
    const p = fact(n) / (fact(i) * fact(j) * fact(n - i - j)) * pc ** i * pn ** j * pm ** (n - i - j);
    if (p) e += p * bestBlock(ac, an, i + cC, j + cN, dn, dc).dmg;
  }
  return e;
}

// ---------- Command Re-roll (firefight ploy, 1CP) ----------
export const isComputer = (g, side) => side === NPO || side === g.ai;
/** A player operative near an objective can't re-roll (Sickening Emissions). */
const noRerollHere = (g, op) => (!!mission(g).noRerollNearObjective && op.side !== NPO && g.objectives.some((o) => inMarkerRange(op, o)))
  || voxbroken(g, op) || hexorcised(g, op) || rvNoReroll(g, op); // Voxbreak (Phobos), Hexorcise (Inquisition), Neuropredatory Crest (Raveners)

/** Can `side` spend 1CP to re-roll one die of this pool? Each roll of dice can be re-rolled once. */
export function canCommandReroll(g, side, holder, which) {
  if (!holder || holder.rerolled?.[which] || holder.noReroll?.[which]) return false;
  const pool = holder[which === 'a' ? 'a' : 'd'];
  return !!pool && (g.cp[side] >= 1 || dutyFree(g, side, holder, which) || aqVetReroll(g, side, holder, which) || vdLuckReroll(g, side, holder)) && pool.dice.some((d) => !d.auto);
}
/** Duty of Reclamation (Battleclade ploy): a free Command Re-roll for a friendly contesting an objective marker (once per sequence). */
function dutyFree(g, side, holder, which) {
  if (side > 1 || !hasPloy(g, side, 'dutyReclamation') || holder.dutyUsed) return false;
  const o = getOp(g, holder.uid || (which === 'a' ? holder.op : holder.target));
  return !!o && o.side === side && !!TEAM_MAP[o.team].noosphericNetwork && contesting2(g, o);
}

/** Re-roll one die (Command Re-roll): costs 1CP, the pool is tallied again. */
export function commandReroll(g, side, holder, which, index) {
  if (!canCommandReroll(g, side, holder, which)) return false;
  const pool = holder[which === 'a' ? 'a' : 'd'], die = pool.dice[index];
  if (!die || die.auto || die.locked) return false; // (locked: a 3 hit by Curse of Rot)
  let free = dutyFree(g, side, holder, which);
  if (free) holder.dutyUsed = true; else if (aqVetReroll(g, side, holder, which)) { aqVetRerollUsed(g, side); free = true; } else if (vdLuckReroll(g, side, holder)) { vdLuckUsed(g, side, 'commandReroll'); free = true; } else g.cp[side]--; // (Tempestus Veteran: the Tempestor's first Command Re-roll is free)
  (holder.rerolled ||= {})[which] = true;
  const old = die.v;
  die.v = d6(); die.rr = true;
  tally(pool);
  const cost = free ? { zh: '0CP，回收使命', en: '0CP, Duty of Reclamation' } : { zh: '-1CP', en: '-1CP' };
  log(g, { zh: `${teamZh(g, side)} 指揮重擲（${cost.zh}）：${old} → ${die.v}`, en: `${team(g, side).name.en} Command Re-roll (${cost.en}): ${old} → ${die.v}` }, `side${side}`);
  return true;
}

/** The computer's Command Re-roll decision for one roll: the index of a failed die to re-roll, or -1. */
export function aiRerollChoice(g, side, holder, which) {
  if (!canCommandReroll(g, side, holder, which) || g.cp[side] < 1) return -1;
  const pool = holder[which === 'a' ? 'a' : 'd'];
  const misses = pool.dice.map((d, i) => [d, i]).filter(([d]) => !d.auto && !d.locked && d.res === 'miss');
  if (!misses.length) return -1;
  if (which === 'a') return misses.length * 2 >= pool.dice.length ? misses[0][1] : -1;
  // Defence: worth it when more successful attack dice than defence successes are left.
  const att = holder.a.crits + holder.a.norms, def = pool.crits + pool.norms + (holder.coverN || 0) + (holder.coverC || 0);
  return att > def ? misses[0][1] : -1;
}

const clampHit = (h) => Math.min(6, Math.max(2, h));

// Debilitating Irradiation (Hunter Clade ploy): -1 Normal Dmg (to a minimum of 3) for an irradiated attacker hitting a Vanguard.
const normalDmg = (w, target = null, g = null, src = null) => w.dmg[0] - (g && src && target && w.dmg[0] > 3 && debilitated(g, src, target) ? 1 : 0);

function bestBlock(ac, an, sc, sn, dn, dc) {
  let best = { dmg: Infinity };
  for (let c2c = 0; c2c <= Math.min(sc, ac); c2c++) {
    const c2n = Math.min(sc - c2c, an);
    for (let pairs = 0; pairs <= Math.min(Math.floor(sn / 2), ac - c2c); pairs++) {
      const n2n = Math.min(sn - pairs * 2, an - c2n);
      const remC = ac - c2c - pairs, remN = an - c2n - n2n;
      const dmg = remC * dc + remN * dn;
      if (dmg < best.dmg) best = { dmg, remC, remN };
    }
  }
  return best;
}

/**
 * Medic!: the first time each turning point a friendly non-drone operative (Pathfinders, Death Korps) would be
 * incapacitated while visible to and within 3" of the medic (neither in enemy control range), it survives on 1
 * wound. Not usable if the medic is a target of the Shoot action being resolved. (The free Dash isn't modelled.)
 */
function medicFor(g, target) {
  if (isDrone(target) || g.medicTP?.[target.side] === g.tp) return null;
  if (isEngaged(g, target)) return null;
  // Reanimate (Canoptek Macrocyte Reanimator): within 6", or both within the Obelisk Node Matrix.
  return living(g, target.side).find((m) => tpl(m).medic && m !== target && ((edgeDist(m, target) <= (tpl(m).medicRange || 3) && visibility(g, m, target).visible)
    || (tpl(m).matrixMedic && inMatrix(g, m.side, m) && inMatrix(g, m.side, target))) && !isEngaged(g, m) && !g.shotTargets?.includes(m.uid)) || null;
}

export function applyDamage(g, src, target, dmg) {
  const before = target.wounds;
  const killed = inflict(g, src, target, dmg);
  if (killed) mdDeath(g, target);
  grandfathersBlessing(g, target, before - Math.max(0, target.wounds));
  return killed;
}

/**
 * Call the Kill: the mark is down. Victory Shriek gives a friendly operative within 6" of the
 * Kill-broker Balanced for the rest of the battle (once each), and a new mark is picked (the enemy
 * with the most wounds left).
 */
function markDown(g, side) {
  const kb = living(g, side).find((o) => tpl(o).callTheKill);
  if (kb) {
    const pick = living(g, side).filter((o) => !o.shriek && edgeDist(o, kb) <= 6)
      .sort((a, b) => Math.max(...tpl(b).weapons.map((w) => avgDmg(w))) - Math.max(...tpl(a).weapons.map((w) => avgDmg(w))))[0];
    if (pick) {
      pick.shriek = true;
      log(g, { zh: `${opName(kb, 'zh')} 勝利尖嘯：${opName(pick, 'zh')} 之後的武器都獲得「平衡」`, en: `${opName(kb, 'en')} Victory Shriek: ${opName(pick, 'en')}'s weapons have Balanced for the rest of the battle` }, `side${side}`);
    }
  }
  const next = living(g, 1 - side).sort((a, b) => b.wounds - a.wounds)[0];
  setMark(g, side, kb || TEAM_MAP[g.teams[side]].justiceMark ? next : null); // Marked for Justice: a new mark too
}

/** Call the Kill (strategic gambit while the Kill-broker is in the killzone): mark an enemy for the turning point. */
export function setMark(g, side, target) {
  (g.mark ||= [null, null])[side] = target ? target.uid : null;
  const t = team(g, side);
  const [zh, en] = t.justiceMark ? ['正義標記', 'Marked for Justice'] : t.bringItDown ? ['集火摧毀', 'Bring it Down'] : ['呼喚獵殺', 'Call the Kill'];
  if (target) log(g, { zh: `${teamZh(g, side)} ${zh}：標記 ${opName(target, 'zh')}`, en: `${t.name.en} ${en}: ${opName(target, 'en')} is marked` }, `side${side}`);
}

/**
 * Grandfather's Blessing: when a poisoned enemy loses wounds within 7" of the Champion, the Champion
 * regains as many (at most 3 per turning point).
 */
function grandfathersBlessing(g, target, lost) {
  if (lost <= 0 || !target.poison) return;
  const champ = foes(g, target).find((o) => tpl(o).blessing && edgeDist(o, target) <= 7);
  if (!champ || champ.wounds >= champ.maxW) return;
  if (champ.blessTP !== g.tp) { champ.blessTP = g.tp; champ.blessed = 0; }
  const gain = Math.min(lost, 3 - champ.blessed, champ.maxW - champ.wounds);
  if (gain <= 0) return;
  champ.wounds += gain; champ.blessed += gain;
  log(g, { zh: `${opName(champ, 'zh')} 祖父的祝福：回復 ${gain} 生命`, en: `${opName(champ, 'en')} Grandfather's Blessing: regains ${gain} wounds` }, `side${champ.side}`);
}

function inflict(g, src, target, dmg) {
  if (dmg <= 0) return false;
  if (g.runesLost && isGM(target) && target.side < 2) { const lost = g.runesLost[target.uid] || 0; dmg = Math.min(dmg, 8 - lost); g.runesLost[target.uid] = lost + Math.max(0, dmg); if (dmg <= 0) return false; } // Runes of Khorne
  // Frenzy (Fellgor Ravagers): with a Frenzy token it's only incapacitated as the rule says (frenzyDie).
  if (target.frenzy) return false;
  target.damagedTP = true;
  if (target.medicShield) { target.wounds = Math.max(1, target.wounds - dmg); return false; }
  // Outright Conviction (Yaegir Theyn): the first time it would be incapacitated, it stays on 1 wound for the rest of the action.
  if (target.wounds - dmg <= 0 && tpl(target).outrightConviction && !target.convictionUsed && !target.frenzy) {
    target.convictionUsed = true; target.wounds = 1; target.medicShield = true; target.convictionNow = true; target.sfMiracleNow = !!tpl(target).sfMiracle;
    log(g, { zh: `${opName(target, 'zh')} 堅定信念：以 1 生命撐住，剩下的攻擊骰全部作廢`, en: `${opName(target, 'en')} Outright Conviction: stays on 1 wound; the remaining attack dice are discarded` }, `side${target.side}`);
    return false;
  }
  target.wounds -= dmg;
  const medic = target.wounds <= 0 && medicFor(g, target);
  if (medic) {
    // Survives on 1 wound for the rest of the action; both get -1 APL until the end of their next activations.
    target.wounds = tpl(medic).medicD3 ? d3() : tpl(medic).medicWounds || 1; target.medicShield = true; target.medicTP = g.tp; // Helix Adept: D3 wounds
    (g.medicTP ||= [0, 0])[target.side] = g.tp;
    if (!tpl(medic).medicNoApl) { changeApl(g, target, -1); changeApl(g, medic, -1); } // (Mechanosuture Array: no APL loss)
    if (g.active === target.uid) target.ap = 0; // used during its own activation: that activation ends
    log(g, { zh: `✚ ${opName(medic, 'zh')} 醫療兵！${opName(target, 'zh')} 以 ${target.wounds} 生命撐住`, en: `✚ ${opName(medic, 'en')} Medic! ${opName(target, 'en')} survives on ${target.wounds} wound(s)` }, `side${target.side}`);
    return false;
  }
  if (target.wounds <= 0) {
    target.wounds = 0;
    // Frenzy: instead of being incapacitated it gains a Frenzy token (the opponent scores it as a kill now).
    if (TEAM_MAP[target.team].frenzy) {
      target.frenzy = true; target.frenzyHits = 0;
      if (target.order === 'conceal') target.order = 'engage';
      log(g, { zh: `🔥 ${opName(target, 'zh')} 陷入狂暴！（對手算作擊殺）`, en: `🔥 ${opName(target, 'en')} goes into a Frenzy! (counts as incapacitated for the opponent)` }, 'kill');
      countKill(g, src, target);
      g.frenzyNow = target.uid; // the fight in progress discards its remaining dice
      return false;
    }
    return killOff(g, src, target);
  }
  return false;
}

/** Kill op: enemy operatives incapacitated (whoever caused it), except by NPOs where the mission says so. */
function countKill(g, src, target) {
  if (target.side === NPO || tpl(target).expendable || (src?.side === NPO && mission(g).npoKillsIgnored)) return;
  const scorer = 1 - target.side;
  const before = killGrade(g, scorer);
  g.kills[scorer]++;
  target.killCounted = true; // (taken back if it's REANIMATED)
  const after = killGrade(g, scorer);
  if (mission(g).killOp !== false && after > before) log(g, { zh: `${teamZh(g, scorer)} 擊殺等級 ${after}（+1 VP）`, en: `${team(g, scorer).name.en} reaches kill grade ${after} (+1 VP)` }, 'tp');
  if (g.mark?.[scorer] === target.uid) markDown(g, scorer);
  tacOnKill(g, src, target); // Tac Ops (Dominate, Sweep & Clear, Martyrs)
  // Inspirational Example (Superior) / Unflinching Example (Preceptor: a ready enemy in its control range): Faith.
  if (src && src.side === scorer && (tpl(src).inspirational || (tpl(src).unflinching && target.readyAtDeath && edgeDist(src, target) <= CONTROL + 0.01))) {
    gainFaith(g, scorer, tpl(target).wounds >= 12 ? 2 : 1, { zh: tpl(src).inspirational ? '激勵榜樣' : '不屈榜樣', en: tpl(src).inspirational ? 'Inspirational Example' : 'Unflinching Example' });
  }
}

/** Whip Control (Herd-goad): an enemy visible within 3" of it, while it isn't engaged with any other enemy. */
export function whipped(g, op) {
  return foes(g, op).some((h) => tpl(h).whipControl && edgeDist(h, op) <= 3 && visibility(g, h, op).visible
    && !engagedEnemies(g, h).some((e) => e !== op));
}

/** War Gong (Deathknell): a friendly within 3" of a Deathknell without a Frenzy token can take Normal instead of Critical Dmg. */
const warGong = (g, op) => op.side < 2 && living(g, op.side).some((d) => tpl(d).warGong && !d.frenzy && edgeDist(d, op) <= 3);

/** A Frenzied Fellgor finally falls (its kill was already counted when it gained the token). */
export function frenzyDie(g, op, src = null) {
  if (op.dead || !op.frenzy) return false;
  return killOff(g, src, op);
}

/** Firefight ploys triggered by an incapacitation (armed reactions). */
function ffOnDeath(g, src, target) {
  const side = target.side;
  if (side > 1) return;
  const near = (r) => foes(g, target).filter((e) => e.side < 2 && edgeDist(e, target) <= r && visibility(g, target, e).visible);
  // Vengeance for the Kinband: Relentless against the killer for the rest of the battle.
  const v = g.vengeance?.[side] && getOp(g, g.vengeance[side]);
  if (src && src.side === 1 - side && !src.dead && (!v || v.dead) && autoFF(g, side, 'vengeanceKinband')) {
    (g.vengeance ||= [null, null])[side] = src.uid;
    log(g, { zh: `為戰團復仇：友方攻擊 ${opName(src, 'zh')} 時武器「無情」`, en: `Vengeance for the Kinband: friendlies attacking ${opName(src, 'en')} have Relentless` }, `side${side}`);
  }
  // Putrescent Demise (Gellerpox): 1 damage (D3 for a Nightmare Hulk) to each enemy visible within 2".
  if (!tpl(target).vermin && near(2).length && autoFF(g, side, 'putrescentDemise')) {
    for (const e of near(2)) { const dmg = tpl(target).hulk ? d3() : 1; log(g, { zh: `腐爛之死：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `Putrescent Demise: ${opName(e, 'en')} takes ${dmg} damage` }, `side${side}`); applyDamage(g, target, e, dmg); }
  }
  // Poisonous Demise (Plague Marines): enemies visible within 3" are poisoned, or take 1 damage if they already were.
  if (near(3).length && autoFF(g, side, 'poisonousDemise')) {
    for (const e of near(3)) {
      if (!e.poison) { e.poison = true; log(g, { zh: `劇毒之死：${opName(e, 'zh')} 中毒`, en: `Poisonous Demise: ${opName(e, 'en')} is poisoned` }, `side${side}`); }
      else { log(g, { zh: `劇毒之死：${opName(e, 'zh')} 受到 1 傷害`, en: `Poisonous Demise: ${opName(e, 'en')} takes 1 damage` }, `side${side}`); applyDamage(g, target, e, 1); }
    }
  }
  // Glorious Martyrdom (Novitiates): for each enemy visible within 2", 1 Faith and D3 damage.
  if (near(2).length && autoFF(g, side, 'gloriousMartyrdom')) {
    for (const e of near(2)) { const dmg = d3(); log(g, { zh: `光榮殉道：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `Glorious Martyrdom: ${opName(e, 'en')} takes ${dmg} damage` }, `side${side}`); gainFaith(g, side, 1, { zh: '光榮殉道', en: 'Glorious Martyrdom' }); applyDamage(g, target, e, dmg); }
  }
  // Reward Earned (Blooded): the killer had a Blooded token and was within 2" — one more token.
  if (src && src.side === 1 - side && src.bloodToken && edgeDist(src, target) <= 2 && autoFF(g, src.side, 'rewardEarned')) gainBlood(g, src.side, { zh: '應得的獎賞', en: 'Reward Earned' });
  // No Kin Left Behind (Hernkyn Yaegirs): the Fallen Kin marker goes where it fell (the previous one is removed).
  if (isHY(target) && autoFF(g, side, 'noKinLeft')) {
    g.markers = (g.markers || []).filter((m) => !(m.kind === 'fallenKin' && m.owner === side));
    g.markers.push({ id: g.markers.length, kind: 'fallenKin', owner: side, x: target.x, y: target.y, carriedBy: null });
  }
  // Destructive Demise (Goremongers): damage by its tank to an enemy in its control range.
  const gmFoe = isGM(target) && foes(g, target).filter((e) => e.side < 2 && !e.dead && edgeDist(e, target) <= CONTROL + 0.01).sort((a, b) => a.wounds - b.wounds)[0];
  if (gmFoe && autoFF(g, side, 'destructiveDemise')) { const d = d3() + (goreOf(target) || 0); log(g, { zh: `毀滅性死亡：${opName(gmFoe, 'zh')} 受到 ${d} 傷害`, en: `Destructive Demise: ${opName(gmFoe, 'en')} takes ${d} damage` }, `side${side}`); applyDamage(g, target, gmFoe, d); }
}

function killOff(g, src, target) {
  {
    const goreNear = !!src && isGM(src) && (edgeDist(src, target) <= CONTROL + 0.01 || (edgeDist(src, target) <= 2 && visibility(g, src, target).visible)); // (Gore Tanks: before it's removed)
    const wasReady = target.ready && g.active !== target.uid;
    target.readyAtDeath = target.ready; // (Unflinching Example: incapacitating a ready enemy)
    target.wounds = 0; target.dead = true; target.ready = false;
    // Oubliex must recharge before any retaliation caused by this incapacitation.
    if (src && g.mdMeleeKill?.uid === src.uid) mdKill(g, src, target, g.mdMeleeKill.id);
    if (src && tpl(src).mwLord && g.mwChallenge?.[src.side] === target.uid && target.side !== src.side) g.cp[src.side]++;
    log(g, { zh: `☠ ${opName(target, 'zh')} 殘廢！`, en: `☠ ${opName(target, 'en')} is incapacitated!` }, 'kill');
    dropMarkers(g, target);
    if (!target.frenzy) countKill(g, src, target);
    ncKill(g, src, target, autoFF); // Nemesis Claw: Grisly Trophy, Flay Them Alive, Proclivity for Murder
    // Celestian Insidiants: incapacitating an enemy with Wounds 6+ inspires; an inspiring one falling is a martyr.
    if (src && !src.dead && isCI(src) && src.side !== target.side && target.maxW >= 6) inspire(g, src, { zh: '使強敵殘廢', en: 'incapacitated a strong enemy' });
    const ult = src && g.ultimatum?.[src.side];
    if (ult?.accepted && ult.by === src.uid && ult.uid === target.uid && g.fight && !src.ultBonus) src.ultBonus = 1; // Zealous Ultimatum fulfilled
    martyrdom(g, target);
    goreOnKill(g, src, target, goreNear); // Goremongers: Gore Tank, Incite the Hunt
    // Reputation to Maintain (Elucia Vhane): her first kill of the battle gains 1CP.
    if (src && !src.dead && tpl(src).reputation && src.side !== target.side && !src.reputationDone) { src.reputationDone = true; g.cp[src.side]++; log(g, { zh: `${opName(src, 'zh')} 維護名聲：+1CP`, en: `${opName(src, 'en')} Reputation to Maintain: +1CP` }, `side${src.side}`); }
    // Chaos Cult: a Devotee incapacitating an enemy in its control range can MUTATE; a Mutant / Torment's Frenzied Demise.
    // (During a fight it waits until the fight is over, so the fight keeps using the weapons it started with.)
    if (src && !src.dead && isCult(src) && tpl(src).devotee && src.side !== target.side && edgeDist(src, target) <= CONTROL + 0.01) {
      if (g.fight) (g.mutateQueue ||= []).push(src.uid); else mutate(g, src, { zh: '使敵人殘廢', en: 'incapacitated an enemy' });
    }
    if (isWarped(target)) {
      const e = foes(g, target).filter((x) => x.side < 2 && !x.dead && edgeDist(x, target) <= 2 && visibility(g, target, x).visible).sort((a, b) => (b === src) - (a === src) || a.wounds - b.wounds)[0];
      if (e && autoFF(g, target.side, 'frenziedDemise')) {
        const d = tpl(target).torment ? d6() : d3();
        log(g, { zh: `狂亂之死：${opName(e, 'zh')} 受到 ${d} 傷害`, en: `Frenzied Demise: ${opName(e, 'en')} takes ${d} damage` }, `side${target.side}`);
        applyDamage(g, target, e, d);
      }
    }
    // Final Defiance (Brood Brother Sapper): a free Explosives action before it's removed — it detonates a placed charge.
    if (tpl(target).finalDefiance && (target.explosivesUsed || 0) === 1) {
      log(g, { zh: `${opName(target, 'zh')} 最後的反抗：引爆炸藥`, en: `${opName(target, 'en')} Final Defiance: detonates the charge` }, `side${target.side}`);
      target.explosivesUsed = 2; detonateExplosives(g, target);
    }
    sfDeath(g, src, target); // Sanctifiers: Redeemed Through Fire, Imperial Cult Devotion
    dkDeath(g, src, target); // In Death, Atonement (Death Korps)
    rvDeath(g, src, target); // Death Frenzy (Raveners)
    vdDeath(g, src, target); // Void-dancer Troupe: the performance, Death Mask
    wkBoom(g, target); // Boom! (Wrecka Bomb Squig): it may explode before it's removed
    if (g.pechra?.[target.side]?.by === target.uid) g.pechra[target.side] = null;
    if (g.pan?.[target.side]?.by === target.uid) g.pan[target.side] = null; // Pan Spectral Scan marker
    if (g.auspex?.[target.side] === target.uid) g.auspex[target.side] = null; // Auspex Scan
    if (src && tpl(src).heroic) src.killTP = g.tp; // Heroic Inspiration (Kelermorph)
    // Extract Information (Inquisition Enlightener): an enemy incapacitated within its control range — +1CP.
    if (target.side < 2) for (const en of living(g, 1 - target.side).filter((o) => tpl(o).extractInfo && edgeDist(o, target) <= CONTROL + 0.01)) { g.cp[en.side]++; log(g, { zh: `${opName(en, 'zh')} 榨取情報：+1CP`, en: `${opName(en, 'en')} Extract Information: +1CP` }, `side${en.side}`); }
    for (const qs of [0, 1]) if (g.quarry?.[qs]?.tp === g.tp && g.quarry[qs].uid === target.uid && isIATeam(g, qs)) pickQuarry(g, qs); // Quarry: a new one
    // Grudge (Hearthkyn): the enemy operative that incapacitated a Kin gains a Grudge token.
    if (TEAM_MAP[target.team].grudges && src && !src.dead && src.side !== target.side && src.side !== NPO) {
      addGrudge(g, target.side, src, { zh: '使戰友殘廢', en: 'killed one of the Kin' });
    }
    archonDeath(g, src, target);
    mission(g).onIncapacitated?.(g, target, src);
    bloodedOnDeath(g, target);
    ffOnDeath(g, src, target); // firefight ploys used when an operative is incapacitated
    // Aggressive Defence (Macrocyte Warrior): incapacitated by an enemy within 2" — D3, on a 2+ that much damage to it.
    if (tpl(target).aggressiveDefence && src && !src.dead && src.side !== target.side && edgeDist(src, target) <= 2) {
      const r = d3();
      log(g, { zh: `${opName(target, 'zh')} 侵略性防禦：擲 ${r}${r >= 2 ? `，${opName(src, 'zh')} 受到 ${r} 傷害` : ''}`, en: `${opName(target, 'en')} Aggressive Defence: rolls ${r}${r >= 2 ? ` — ${opName(src, 'en')} takes ${r} damage` : ''}` }, `side${target.side}`);
      if (r >= 2) applyDamage(g, target, src, r);
    }
    // Reanimation Protocols (Hierotek Circle): the first time it falls, a Reanimation marker is left in its place.
    if (TEAM_MAP[target.team].reanimation && !target.reanimUsed && target.side < 2 && !target.noReanimate) { // (not after Dimensional Banishment)
      target.reanimUsed = true;
      target.diedReady = wasReady ? g.tp : 0; // brought back by the Reanimator this TP: expended unless it hadn't activated
      (g.reanim ||= []).push({ uid: target.uid, side: target.side, x: target.x, y: target.y });
    }
    return true;
  }
  return false;
}

/**
 * Damage from each unblocked attack die (and each Devastating crit), after Disgustingly Resilient:
 * a die inflicting 3+ damage on a Plague Marine rolls a D6 and deals 1 less on a 4+.
 * Returns {dmg, rolls: [{dmg, roll, saved}]}.
 */
function resolveDice(target, amounts, g = null) {
  if (g && tpl(target).mwLord) amounts = amounts.map((d) => d >= 3 && !target.mwBoonUsed ? Math.max(0, d - mwBoon(g, target)) : d);
  if (g && target.mdOubliex) amounts = amounts.map((d) => {
    if (d > 0 && target.mdOubliex && d6() >= 5) { target.mdOubliex = false; return 0; }
    return d;
  });
  // Emboldened (Navy Breacher Axejack): the same roll on a 5+, in a turning point it Charged.
  // Fortified stimm (Blooded) works the same way.
  // Toxic Blessings (Toxhorn) too.
  const emboldened = (!!g && tpl(target).emboldened && target.chargedTP === g.tp) || !!target.stimms?.fortified || !!tpl(target).toxicBlessings;
  // Zealous Dedication (Castigator): also on a 5+.
  const zealous = !!tpl(target).zealous || !!tpl(target).unnaturalRegen || !!tpl(target).iaZealot; // (Zealot, Inquisition Questkeeper) // (Unnatural Regeneration, Chaos Mutant / Torment: 5+ as well)
  // Ruinous Icon (Chaos Cult Iconarch): Invigoration / Deterioration change each inflicted damage first.
  if (g && target.side < 2 && g.ruinous) amounts = amounts.map((d) => ruinousIconDmg(g, target, d));
  // Undaunted Explorers (Elucidian Starstriders ploy): the first damage on each friendly this TP is halved (rounding up, min 2).
  if (g && amounts.length && amounts[0] > 0 && target.side < 2 && ((isES(target) && hasPloy(g, target.side, 'undauntedExplorers')) || (isHY(target) && hasPloy(g, target.side, 'toughSurvivalists'))) && target.undauntedTP !== g.tp) {
    target.undauntedTP = g.tp;
    amounts = [Math.max(Math.min(2, amounts[0]), Math.ceil(amounts[0] / 2)), ...amounts.slice(1)];
  }
  // Incantation of the Iron Soul (Battleclade ploy): 3+ damage, on a 4+ 1 less.
  const ironSoul = !!g && target.side < 2 && !!TEAM_MAP[target.team].noosphericNetwork && hasPloy(g, target.side, 'ironSoul');
  const resilient = !!TEAM_MAP[target.team].resilient || !!tpl(target).resilient || emboldened || zealous || ironSoul;
  const need = (emboldened || zealous) && !tpl(target).resilient && !ironSoul ? 5 : 4;
  // Brace for Counterattack / Reinforce Metal (Hierotek): Dmg of 3+ deals 1 less.
  // Sickening Resilience (Plague Marines firefight ploy): for the rest of this activation, Disgustingly Resilient
  // always takes 1 off (to a minimum of 2) without rolling. Used when it saves at least 2 damage or a life.
  const actKey = g ? `${g.tp}:${g.active}` : null;
  if (g && TEAM_MAP[target.team].resilient && target.sickAct !== actKey) {
    const big = amounts.filter((x) => x >= 3).length;
    if ((big >= 2 || amounts.reduce((s, x) => s + x, 0) >= target.wounds) && big && autoFF(g, target.side, 'sickeningResilience')) target.sickAct = actKey;
  }
  if (g && target.sickAct === actKey) {
    let dmg = 0;
    for (const a of amounts) dmg += a >= 3 ? Math.max(2, a - 1) : a;
    return { dmg, rolls: [] };
  }
  const brace = !!tpl(target).insensiblePain || !!g && (braced(g, target) || (g.reinforce?.[target.side]?.t === target.uid && !getOp(g, g.reinforce[target.side].by)?.dead));
  let dmg = 0;
  const rolls = [];
  for (const a0 of amounts) {
    const a = brace && a0 >= 3 ? a0 - 1 : a0;
    let d = a;
    if (isArchon(target) && target.drug === 'painbringer' && a >= 3) { const roll = d6(); if (roll === 6) d--; rolls.push({ dmg: a, roll, saved: roll === 6 }); }
    if (resilient && a >= 3) {
      const roll = d6();
      if (roll >= need) d--;
      rolls.push({ dmg: a, roll, saved: roll >= need });
    }
    dmg += d;
  }
  return { dmg, rolls };
}

/** Poison: damaging an enemy (not a friendly) with a Poison weapon gives it a Poison token. */
function poisonOnHit(g, op, target, rules, dealt) {
  if (!rules.poison || dealt <= 0 || target.side === op.side || target.poison || target.dead) return false;
  target.poison = true;
  log(g, { zh: `${opName(target, 'zh')} 中毒`, en: `${opName(target, 'en')} is poisoned` }, `side${op.side}`);
  return true;
}

/** Stun: with any retained crit, the target gets -1 APL until the end of its next activation. */
function stunOnCrit(g, rules, crits, target) {
  if (!rules.stun || crits <= 0 || target.dead || tpl(target).chemEnhanced) return false; // Chem-enhanced: not affected by Stun
  changeApl(g, target, -1);
  log(g, { zh: `${opName(target, 'zh')} 昏迷：下次啟動 APL -1`, en: `${opName(target, 'en')} is stunned: -1 APL next activation` }, `side${1 - target.side}`);
  return true;
}

/**
 * One shooting sequence (attack dice, defence dice, damage) against one target, as a generator so the
 * caller can stop after the attack dice and after the defence dice (Command Re-roll) before damage is
 * dealt. It yields {stage: 'attack' | 'defence', seq}; `seq` holds the dice pools and who can re-roll.
 */
function* shootSequence(g, op, weapon, target, vis, noReroll = false, poisonedAtStart = null) {
  vis = ncObscure(g, op, target, vis); // In Midnight Clad (Nemesis Claw): obscured in the dark by Heavy terrain
  const rules = effectiveRules(g, op, weapon, target);
  if (rules.earthenWrath && vis.cover) rules.lethal = Math.min(rules.lethal || 6, 5); // Earthen Wrath (Stonesinger): Lethal 5+ against a target in cover
  // Contempt (Blades of Khaine firefight ploy): the shooter can't re-roll its attack dice this sequence.
  if (!noReroll && target.side < 2 && isBlade(target) && (rules.balanced || rules.ceaseless || rules.relentless) && autoFF(g, target.side, 'contempt')) noReroll = true;
  if (corsairEquip(g, target, 'mistfield') && edgeDist(op, target) > 3 && rules.piercing && g.mistfieldTP?.[target.side] !== g.tp) { rules.piercing--; (g.mistfieldTP ||= [0, 0])[target.side] = g.tp; }
  if (noReroll) { delete rules.balanced; delete rules.ceaseless; delete rules.relentless; } // Suppressing Fire
  let hit = weapon.hit;
  if (!rules.fixedHit) {
    // injured / Contagion / Mindburn; Quicksilver Speed: a Slaanesh Legionary that moved, shot from more than 6"
    hit += hitWorse(g, op, weapon) || (markOf(target) === 'slaanesh' && quick(g, target) && edgeDist(op, target) > 6) ? 1 : 0;
    if (shokked(g, op)) hit += 1;
    if (rules.xvHit) hit -= 1; // Focused Markerlight (XV26 Designator) // Shokkwave (Wrecka Krew Pulsa marker): cumulative with being injured
    if (rules.mlHit && hit > 3) hit = Math.max(3, hit - 1);
  }
  hit = clampHit(hit);
  const atk = Math.max(1, weapon.atk + (rules.atkPlus || 0) - (rules.atkMinus || 0) - (cursed(g, op, 'barrelwarp') ? 1 : 0)); // (atkMinus: Sanctification) // Barrelwarp (Gellerpox)
  const a = rollPool(atk, hit, rules.lethal || 6, rules, chainPost(kinPost(g, op), scryPost(g, op, 'guide'))); // (No Kin Left Behind, Scry: Guidance)
  archonPrey(g, op, target, a);
  ncPrey(g, op, target, a); // Death to the False Emperor (Nemesis Claw)
  broodRerolls(g, op, target, a, noReroll); // Psiren Caster, Crossfire tokens, Idolisation (Brood Brothers)
  claimBoost(g, op, target, a); // Stake Claim (Elucidian Starstriders)
  wkRoll(g, op, a, target, tally); // Wrecka Rampage: 6s gain Wrecka points, points retain fails
  rtEquipRoll(g, op, weapon, a, tally); // Ratlings equipment: Purloined Rations, Lucky Round
  sfRoll(g, op, a, tally); // Sanctifiers equipment: Purity Seals
  vdRoll(g, op, a, tally); // Wraithbone Talisman (Void-dancer Troupe)
  vsReroll(g, op, a, tally); // Communion: a point to re-roll one attack die
  adRoll(g, op, a, tally); // Purity Seals (Angels of Death)
  const seq = { op: op.uid, target: target.uid, weapon, a, d: null, hit, rerolled: {}, noReroll: { a: noReroll || noRerollHere(g, op) || neurostatic(g, op) || broadcastNear(g, op), d: noRerollHere(g, target) } };
  yield { stage: 'attack', seq };
  const inCover = vis.cover && !rules.ignoreCover;
  // Toxic: +1 to both Dmg against an enemy that was poisoned at the start of the action.
  // Close Assault (Navy Breachers): Navis shotguns +1 to both Dmg (counted with Toxic's bonus).
  // (Anti-PSYKER, Novitiate Condemnor: +1 to both Dmg against a psyker.)
  const tox = (rules.toxic && poisonedAtStart?.has(target.uid) ? 1 : 0) + (rules.closeAssault && weapon.rules.shotgun ? 1 : 0) + (rules.antiPsykerOn ? 1 : 0);
  // Xenotech Shielding (Archivist): Normal and Critical Dmg of 4+ deal 1 less.
  const shield = (d) => rvCarapace(target, (tpl(target).xenotech || sfSermon(g, target)) && d >= 4 ? d - 1 : d); // (Sermon: Sanctifiers; Reinforced Carapace: Raveners)
  const tough = (d) => ((tpl(target).tough || bulwark(g, target)) && d >= 3 ? d - 1 : d); // Tough (Thug) / Bulwark Imperative: Normal Dmg of 3+ deals 1 less
  const refined = isArchon(op) && op.acted.refinedSequence && ['haSplinterRifle', 'haSplinterPistol', 'haCannonF', 'haCannonS', 'haShardcarbine', 'haStinger'].includes(weapon.id) ? 1 : 0;
  const mdBonus = mdRangedBonus(g, op, target);
  const dn = wkReckless(target, dwReduceDamage(g, target, tough(shield(Math.max(1, refined + normalDmg(weapon, target, g, op) + tox + mdBonus))), true), true); // (Reckless Temperament: Demolisha)
  // Hardy (Cold-blood): a critical hit can inflict Normal Dmg instead.
  let dc = tpl(target).hardyCrit || tpl(target).brutish ? Math.min(shield(weapon.dmg[1] + tox + inspCrit(op)), dn) : shield(weapon.dmg[1] + tox + inspCrit(op)); // (Inspired Strikes: +1 Critical Dmg)
  if (mdBonus) dc = Math.max(1, dc + mdBonus);
  dc = wkReckless(target, dc, false); // Reckless Temperament: Critical Dmg too with an Engage order
  const camo = !!tpl(target).camoCloak || !!tpl(target).weavewerke; // Camo Cloak ignores Saturate
  const rogue = hasPloy(g, target.side, 'rogue'); // Rogue: ignore Saturate, and Stealthy-style cover saves
  const saturated = rules.saturate && !camo && !rogue && !tpl(target).cultAgent; // Cult Agents ignore Saturate
  // Auto-Ferric Supplication (Battleclade firefight ploy): a Tech-Priest being shot ignores Piercing.
  // Scaleshield (Exodite Clanblade): with no attack dice retained as crits, Piercing is 1 worse.
  if (tpl(target).scaleshield && rules.piercing && a.crits === 0) rules.piercing = Math.max(0, rules.piercing - 1);
  const ferric = (!!rules.piercing && tpl(target).techPriest && autoFF(g, target.side, 'autoFerric'))
    || shimmered(g, target) // Shimmershield (Blades of Khaine) ignores Piercing too
    || tpl(target).alphaPredator || spiritual(g, target, 'piercing') || !!tpl(target).ignorePiercing; // (ignorePiercing: Vhane, Death Cult Executioner) // Alpha Predator / Spiritual Leader (Brood Brothers)
  // Defence dice and retained saves, with or without the cover save.
  const defence = (useCover, crits) => {
    // Xenotech Shielding (Archivist) ignores Piercing.
    // Cult Agent (Wyrmblade): Piercing is ignored (Piercing Crits still applies).
    let pierce = tpl(target).xenotech || tpl(target).daemonic ? 0 : tpl(target).cultAgent || ferric || isMandrake(target) ? (crits > 0 ? rules.piercingCrits || 0 : 0) : (rules.piercing || 0) + (crits > 0 ? rules.piercingCrits || 0 : 0);
    // Extra Defence (NEMESIS): one more defence die unless injured (Xenotech: even when injured).
    if (tpl(target).dwStormShield && rules.piercing && !ferric) pierce = Math.max(0, pierce - 1);
    if (vdPanoply(target, crits)) pierce = Math.max(0, pierce - 1);
    if (vsNoPierce(target)) pierce = 0;
    if (xvChaffOn(g, op, target)) pierce = 0; // Electrochaff Launcher (XV26 Lodestar) // Camouflaged / Evasive Drone (Vespid Stingwings) // Harlequin's Panoply (Void-dancer Troupe): no critical retained
    const extraDef = tpl(target).nemesis && (!isInjured(target) || tpl(target).xenotech) ? 1 : 0;
    // The number of defence dice is the target's Defence stat (datacards without one roll 3).
    const defDice = Math.max(0, (tpl(target).def ?? DEFENCE_DICE) + extraDef - pierce);
    // A Concealed target in cover can't be shot at all, so any target here that's in cover gets the cover save.
    const base = useCover && !saturated ? 1 : 0;
    let coverN = base, coverC = 0;
    if (base && (hasTactic(g, target, 'stealthy') || rogue || tpl(target).cultAgent || tpl(target).spCloak)) { // (Camo Cloaks: Spectre Squad)
      // Stealthy: one more cover save, or one as a critical; Camo Cloak with the Stealthy tactic gets both.
      if (camo && g.tactics?.[target.side]?.includes('stealthy')) coverC = 1;
      else if (crits > 0) { coverN--; coverC = 1; } else coverN++;
    }
    // Skulk About: a Concealed target retains one more defence die as a normal success.
    const skulk = target.order === 'conceal' && hasPloy(g, target.side, 'skulkAbout') ? 1 : 0;
    coverN += skulk;
    if (isMandrake(target) && withinShadow(g, target) && hasPloy(g, target.side, 'mdShroud')) coverN++;
    if (base && tpl(target).camo1) coverN++; // Camo Cloak (Blooded Sharpshooter): one more cover save
    if (base && vsCamo(target)) { coverC += coverN; coverN = 0; } // Camouflaged (Vespid Shadestrain): cover saves as criticals
    if (base && rvChroma(g, target)) coverN++; // Chromatospore Camouflage (Raveners): one more cover save
    if (base && scCamoExtra(g, target)) coverN++; // Camo Cloak equipment (Scout Squad, not Snipers): one more cover save
    // Reckless Determination (Fellgor ploy): an expended friendly without cover saves retains one die as a normal success.
    if (!base && !target.ready && TEAM_MAP[target.team].frenzy && hasPloy(g, target.side, 'recklessDetermination')) coverN++;
    // Undying Androids (Hierotek ploy): without cover saves, one defence die is retained as a normal success.
    if (!base && target.side < 2 && isHierotek(target) && hasPloy(g, target.side, 'undyingAndroids')) coverN++;
    // Mercurial Speed (Exodite): SPEED 4+ retains one defence die as a normal save, SPEED 7+ as a critical one.
    const spd = target.side < 2 ? speedOf(g, target) : 0;
    if (spd >= 7) coverC++; else if (spd >= 4) coverN++;
    // Gloaming Mantle (Leystalker upgrade): shot from more than 8" — one normal save without cover, or a cover save as a crit.
    if (hasUp(target, 'gloaming') && edgeDist(op, target) > 8) { if (base && coverN > 0) { coverN--; coverC++; } else if (!base) coverN++; }
    // Embedded (Brood Brothers ploy): cover saves from Heavy terrain — one more.
    if (base && target.side < 2 && isBrood(target) && hasPloy(g, target.side, 'embedded') && shotVisibility(g, op, target, weapon, { ignoreLight: true }).cover) coverN++;
    coverC = Math.min(coverC, defDice);
    coverN = Math.min(coverN, defDice - coverC);
    // Take Cover: if cover saves can be retained, the Save stat improves by 1.
    // Gong Knell (Deathknell): +1 Save when shot until its next activation.
    // Aggressor Imperative (Hunter Clade): the Save is worsened by 1.
    const save = Math.min(6, Math.max(2, tpl(target).save - (isMandrake(target) && withinShadow(g, target) ? 1 : 0) - (base && hasPloy(g, target.side, 'takeCover') ? 1 : 0) - (target.gongOn ? 1 : 0) - (hasGift(g, target, 'chitinous') ? 1 : 0) - wkSaveBonus(g, target) - sfConversion(g, op, target) - (coverN + coverC > 0 ? protectiveBonus(g, target) : 0)) + (deprecated(g, target, 'aggressor') ? 1 : 0)); // (Extra Armour: Wrecka Krew)
    return { pierce, defDice, base, coverN, coverC, skulk, save };
  };
  // Only a shared terrain feature forces a cover/obscuring choice. Independent features stack.
  let useObscured = !!vis.obscured, useCover = inCover;
  const coverChoice = useObscured && useCover && !!vis.defenceOptions?.length && !vis.defenceOptions.some(o => o.cover && o.obscured);
  if (coverChoice) {
    const critOn = hasTactic(g, target, 'hardy') || rtArmour(g, target) ? 5 : 6, devD = rules.devastating || 0;
    const ex = (ac, an, o) => expectedDamage(ac, an, o.defDice - o.coverN - o.coverC, o.save, critOn, o.coverN, o.coverC, dn, dc) + devD * ac;
    const att = a.crits + a.norms;
    const withCover = ex(a.crits, a.norms, defence(true, a.crits));
    const withObsc = ex(0, Math.max(0, att - 1), defence(false, 0));
    if (withCover < withObsc) useObscured = false; else useCover = false;
  }
  const blacksun = isXV(op) && op.side < 2 && g.equip?.[op.side]?.includes('xvBlacksun'); // Advanced Blacksun Filters: no success discarded for obscured
  if (useObscured) { a.post = blacksun ? (pool) => { for (const d of pool.dice) if (d.res === 'crit') { d.res = 'norm'; d.obsc = true; } pool.crits = 0; pool.norms = pool.dice.filter((d) => d.res === 'norm').length; } : obscure; tally(a); }
  else if (xvHolowave(g, op, target)) { a.post = (pool) => { const x = pool.dice.find((d) => d.res === 'norm') || pool.dice.find((d) => d.res === 'crit'); if (x) { x.res = 'miss'; x.obscDrop = true; } pool.crits = pool.dice.filter((d) => d.res === 'crit').length; pool.norms = pool.dice.filter((d) => d.res === 'norm').length; }; tally(a); } // Holowave Countermeasures (XV26)
  // Devastating x: each retained critical success inflicts x damage straight away, before any defence dice.
  // (x" Devastating also hits each other operative visible to and within x" of the target.)
  const before = target.wounds;
  let devDmg = 0;
  if (rules.devastating && a.crits > 0) {
    devDmg = resolveDice(target, Array(a.crits).fill(rules.devastating), g).dmg;
    log(g, { zh: `毀滅：${a.crits} 個暴擊立刻造成 ${devDmg} 傷害`, en: `Devastating: ${a.crits} crit(s) inflict ${devDmg} damage at once` }, `side${op.side}`);
    applyDamage(g, op, target, devDmg);
    if (rules.devSplash) {
      for (const o of g.ops.filter((x) => !x.dead && x !== target && !tpl(x).blastPadding && !corsairEquip(g, x, 'diuturnalMantles') && x.x > -50 && edgeDist(x, target) <= rules.devSplash && visibility(g, target, x).visible)) {
        const sp = resolveDice(o, Array(a.crits).fill(rules.devastating), g).dmg;
        log(g, { zh: `毀滅波及 ${opName(o, 'zh')}：${sp} 傷害`, en: `Devastating splashes ${opName(o, 'en')}: ${sp} damage` }, `side${op.side}`);
        applyDamage(g, op, o, sp);
      }
    }
    // Incapacitated by the Devastating damage: the sequence ends here, no defence dice are rolled.
    if (target.dead) {
      seq.d = { dice: [], crits: 0, norms: 0 }; seq.save = tpl(target).save; seq.defDice = 0; seq.coverN = 0; seq.coverC = 0;
      return {
        target: target.uid, rules, hit, atk, attack: a, save: tpl(target).save, defDice: 0, coverSaves: 0, coverCrit: 0,
        inCover: useCover, obscured: useObscured, coverOrObscured: coverChoice, saturated: false, skulk: 0, pierce: 0, defence: seq.d, dmg: devDmg, dev: devDmg, tox, resilient: [], poisoned: false, stunned: false,
        remC: a.crits, remN: a.norms, before, after: 0, killed: true,
      };
    }
  }
  sfSymbols(g, target, a); // Imperial Cult Symbols (Sanctifiers)
  // Sturdy (Hearthkyn firefight ploy): the attacker's retained crits become normal successes.
  if (a.crits > 0 && autoFF(g, target.side, 'sturdy')) {
    for (const x of a.dice) if (x.res === 'crit') { x.res = 'norm'; x.obsc = true; }
    a.norms += a.crits; a.crits = 0; a.post = null;
  }
  const { pierce, defDice, base, coverN, coverC, skulk, save } = defence(useCover, a.crits);
  // Indomitus: with two or more fails, discard one to retain another as a normal success (recomputed after a re-roll).
  const indomitus = hasPloy(g, target.side, 'indomitus') ? (pool) => {
    const misses = pool.dice.filter((x) => x.res === 'miss');
    if (misses.length >= 2) { misses[0].res = 'norm'; misses[0].indo = true; pool.norms++; }
  } : null;
  // The Emperor Protects (Zealot): re-roll any defence dice. Dig In! (order): one result, if cover saves can be retained.
  // Plagueridden Determination (Gellerpox): an Engage-order operative re-rolls one defence die.
  // Defence marker (Hearthkyn Tactician): within 3", re-roll one defence die.
  // Defence Order (Navy Breachers): within 3" of the marker, re-roll all defence dice of one result (as Dig In!).
  // Void Armour: against Blast / Torrent (not a sweeping profile), re-roll one defence die (two for the Grenadier).
  const voidArmour = (TEAM_MAP[target.team].voidArmour || tpl(target).blastPadding || tpl(target).rqVoidArmour) && (weapon.rules.blast || weapon.rules.torrent) && !/sweeping/i.test(weapon.name.en);
  // Protected by Fate (Sorcerer of Destiny): re-roll any defence dice.
  // Shielding (Trench Sweeper): re-roll any defence dice. Malevolent Grit (Blooded): re-roll one.
  const grit = TEAM_MAP[target.team].bloodedTokens && hasPloy(g, target.side, 'malevolentGrit') && (target.bloodToken || whollyIn(g, target, 1 - target.side));
  const defRules = { relentless: !!tpl(target).emperorProtects || psyOn(g, 'fate', target.side, target) || !!target.shieldingOn
      || (isGM(target) && hasPloy(g, target.side, 'augmentedEndurance') && goreOf(target) === 2),
    digIn: (base > 0 && hasOrder(g, target, 'digIn')) || navyOrderNear(g, target, 'defence') || (isSF(target) && hasPloy(g, target.side, 'sfProtects') && sfSermon(g, target)) // (The Emperor Protects: Sanctifiers)
      || (target.ready && isBlade(target) && hasPloy(g, target.side, 'forewarned')) // Forewarned (Blades of Khaine)
      || (target.side < 2 && isCC(target) && hasPloy(g, target.side, 'hypershielding') && matrixCovers(g, target.side, op, target)), // Hypershielding (Canoptek Circle)
    balanced: (hasPloy(g, target.side, 'plagueridden') && target.order === 'engage') || defenceMarker(g, target) || grit || inviolate(g, target)
      || (isGM(target) && hasPloy(g, target.side, 'augmentedEndurance') && goreOf(target) === 1) // Augmented Endurance (Goremongers): half tank one die, full any
      || (target.side < 2 && isCI(target) && target.order === 'engage' && hasPloy(g, target.side, 'wrathfulDetermination')) // Wrathful Determination
      || (isWK(target) && target.order === 'engage' && hasPloy(g, target.side, 'wkTuffGitz')) // Tuff Gitz (Wrecka Krew)
      || (base > 0 && scGuerrilla(g, target)) // Guerrilla Engagement (Scout Squad): in cover, more than 6" from the enemies that see it
      || (target.side < 2 && isCult(target) && target.wounds < target.maxW && hasPloy(g, target.side, 'exaltationPain')) // Exaltation in Pain
      || (target.side < 2 && isES(target) && living(g, target.side).some((l) => tpl(l).voltagheistArray && edgeDist(l, target) <= 4)) // Voltagheist Array (Lectro-Maester)
      || (base > 0 && TEAM_MAP[target.team].skillAtArms && hasPloy(g, target.side, 'engageFromCover')), // Engage From Cover (Kasrkin)
    rerollFails: voidArmour ? (tpl(target).voidGrenadier ? 2 : 1) : 0 };
  archonDefence(g, target, op, defRules);
  rvDefence(g, target, defRules); // Whipcord Emergence (Raveners)
  vdDefence(g, target, defRules); // Prismatic Blur (Void-dancer Troupe)
  aqDefence(g, op, target, defRules); // Eye Above (Tempestus Aquilons)
  corsairDefence(g, target, weapon, defRules);
  dwDefence(g, target, defRules);
  if (isMurderwing(target) && target.mwBoostTP === g.tp && hasPloy(g, target.side, 'mwNightmare')) defRules.balanced = true;
  // Irrefutable Jurisdiction (Inquisition ploy): within 3" of an objective, re-roll one defence die; contesting it, all of one result.
  if (isIA(target) && target.side < 2 && hasPloy(g, target.side, 'irrefutableJurisdiction') && (g.objectives || []).some((o) => dist(target, o) - radius(target) - OBJ_R <= 3)) { if (contesting2(g, target)) defRules.digIn = true; else defRules.balanced = true; }
  if (voxbroken(g, target) || hexorcised(g, target)) { defRules.relentless = false; defRules.digIn = false; defRules.balanced = false; defRules.rerollFails = 0; } // Voxbreak, Hexorcise
  // Wrought Defence (Hearthkyn): with one or no successes, one fail is retained as a normal success.
  const wrought = hasPloy(g, target.side, 'wroughtDefence') ? (pool) => {
    const miss = pool.dice.find((x) => x.res === 'miss');
    if (miss && pool.crits + pool.norms <= 1) { miss.res = 'norm'; miss.indo = true; pool.norms++; }
  } : null;
  const post = indomitus || wrought ? (pool) => { indomitus?.(pool); wrought?.(pool); } : null;
  if (rules.soulstrike) defRules.soulstrikeDef = true;
  const d = rollPool(defDice - coverN - coverC, rules.soulstrike ? aplNow(g, target) : save, hasTactic(g, target, 'hardy') || rtArmour(g, target) ? 5 : 6, defRules, chainPost(post, scryPost(g, target, 'protect'))); // (Scry: Protection)
  // Unstinting, Immovable (Dire Avenger Aspect Technique): two or more fails — discard one, retain another as a normal save.
  if (tpl(target).aspect === 'da' && d.dice.filter((x) => x.res === 'miss').length >= 2 && autoFF(g, target.side, 'avUnstinting', target)) {
    const m = d.dice.find((x) => x.res === 'miss'); m.res = 'norm'; m.indo = true; d.norms++; // (the other fail is the one discarded)
  }
  aqTrack(g, op, target, a); // Gunfight (Tempestus Aquilons): the attack dice discarded as fails
  pmCurse(g, op, target, d, tally); // Curse of Rot (Plague Marines): the shooter's ploy hits the 3s in the enemy's defence dice
  seq.d = d; seq.save = save; seq.defDice = defDice; seq.coverN = coverN; seq.coverC = coverC;
  yield { stage: 'defence', seq };
  // Fickle Fates (Legionaries): a ready Tzeentch operative that retains a critical save retains one fail as a normal save.
  if (markOf(target) === 'tzeentch' && target.ready && hasPloy(g, target.side, 'fickleFates') && d.crits > 0) { const x = d.dice.find((y) => y.res === 'miss'); if (x) { x.res = 'norm'; x.indo = true; d.norms++; } }
  // Transhuman Physiology (Angels / Phobos firefight ploy): one normal save is retained as a critical one,
  // when that could block a crit that would otherwise get through.
  if (d.norms > 0 && a.crits > d.crits + coverC && autoFFSpec(g, target.side, 'transhuman', target)) {
    const x = d.dice.find((y) => y.res === 'norm'); x.res = 'crit'; x.prom = true; d.norms--; d.crits++;
  }
  // War Gong: crits that get through inflict Normal Dmg instead (when that's better, or to keep a Frenzied Fellgor up).
  const wasFrenzy = !!target.frenzy;
  const gong = warGong(g, target) && (dn < dc || wasFrenzy);
  const dom = vdDomino(g, target, a, d, dn, gong ? dn : dc); // Domino Field (Void-dancer Troupe)
  let block = bestBlock(dom.ac, dom.an, dom.dcr + coverC, dom.dno + coverN, dn, gong ? dn : dc);
  // Survival Instincts (Ratlings firefight ploy, automatic): normal saves block a critical success, critical saves two successes — when it helps.
  if (isSmall(target) && target.side < 2) {
    const si = rtBlockSI(a.crits, a.norms, d.crits + coverC, d.norms + coverN, dn, gong ? dn : dc);
    if (si.dmg < block.dmg && autoFF(g, target.side, 'rtSurvival')) block = si;
  }
  if (gong) dc = dn;
  const dev = devDmg; // (already inflicted, straight after the attack dice)
  // Weavefield Crest (Theyn): once per battle, ignore the Normal Dmg of one attack die.
  const crest = block.remN > 0 && dn > 0 && (useCrest(g, target) || pfShield(g, target) || adIronHalo(g, target)); // (Shield Generator: MV4 Shield Drone; Iron Halo: Space Marine Captain)
  const normals = Array(Math.max(0, block.remN - (crest ? 1 : 0))).fill(dn);
  if (normals.length && corsairShield(g, target)) normals.shift();
  else if (normals.length && vsAgility(g, op, target)) normals.shift(); // Aerial Agility (Vespid Stingwings)
  else if (normals.length && target.side < 2 && isCC(target) && matrixCovers(g, target.side, op, target) && autoFF(g, target.side, 'shieldFlare')) normals.shift(); // Shield Flare
  // Just a Scratch (Kommandos) ignores one normal hit; All Is Dust (Rubric Marines) makes one deal 1.
  if (normals.length && dn > 0 && !tpl(target).kmSmall && autoFF(g, target.side, 'justScratch')) normals.pop();
  else if (normals.length && isWK(target) && !tpl(target).wkSquig && autoFF(g, target.side, 'wkJustScratch')) normals.pop(); // (Wrecka Krew: any Normal Dmg)
  else if (normals.length && dn > 0 && tpl(target).ncVisionary && ncPortent(g, target)) normals.pop(); // Portent (Nemesis Claw Visionary)
  else if (normals.length && dn > 0 && isSF(target) && autoFF(g, target.side, 'sfRosarius')) normals.pop(); // Rosarius (Sanctifiers)
  else if (normals.length && dn >= 2 && tpl(target).automata && autoFF(g, target.side, 'allIsDust')) normals[0] = 1;
  // Critical Shot (Phobos firefight ploy): +D3 damage with a critical success (once per action).
  const critShot = block.remC > 0 && ffOn(g, op, 'criticalShot') && !g.ffAtk.critShotDone ? d3() : 0;
  if (critShot) g.ffAtk.critShotDone = true;
  if (normals.length && normals[0] >= 3 && skillOn(g, target, 'iceInVeins')) normals[0]--; // Ice In Your Veins (Kasrkin)
  // Defenders of the Faith (Novitiates): contesting an objective, one normal success deals half (rounding up, min 2).
  if (normals.length && normals[0] > 2 && TEAM_MAP[target.team]?.actsOfFaith && hasPloy(g, target.side, 'defendersFaith') && contesting2(g, target)) normals[0] = Math.max(2, Math.ceil(normals[0] / 2));
  // Blazing Inferno (Novitiate firefight ploy): critical damage from the Ministorum flamer leaves a Blaze token.
  if (ffOn(g, op, 'blazingInferno') && weapon.id === 'ministorumFlamer' && block.remC > 0 && target.side < 2) target.blaze = op.side;
  // Unleash Daemon (4+ deals 1 less), else Disgusting Vigour (Nurgle) — never more than 1 off a die.
  for (let i = 0; i < normals.length; i++) { const a2 = daemonShell(target, normals[i]); normals[i] = a2 < normals[i] ? a2 : nurgleVigour(g, target, normals[i]); }
  if (weapon.rules.drag) dragTarget(g, op, target, block.remC + block.remN); // Drag (Impaler): pulled in before the damage
  const res = resolveDice(target, [...Array(block.remC).fill(daemonShell(target, dc)), ...normals, critShot].filter((x) => x > 0), g);
  const dmg = res.dmg + devDmg; // (reported with the Devastating damage dealt earlier)
  let killed = target.dead || applyDamage(g, op, target, res.dmg);
  sfShootBlaze(g, op, weapon, target, devDmg > 0 || (block.remC > 0 && res.dmg > 0)); // Blaze (Sanctifiers)
  rvPoisonHit(g, op, weapon, target, devDmg > 0 || (block.remC > 0 && res.dmg > 0)); rvShot(op, weapon); // Poison (Raveners)
  vdShootEnd(g, op, weapon, target, dmg > 0); // Humbling Cruelty (Void-dancer Death Jester)
  vsShootEnd(g, op, weapon, target, a.crits + a.norms > 0, block.remC > 0); // Neutron Fragment / Fallout / Overload (Vespid Stingwings)
  // Excess attack dice are excluded once the enemy's remaining wounds have been inflicted.
  if (res.dmg > 0) {
    let leftW = before - devDmg, damaging = 0;
    for (const amount of [...Array(block.remC).fill(dc), ...normals]) { if (leftW <= 0) break; if (amount > 0) { damaging++; leftW -= amount; } }
    mdFeast(g, op, target, damaging, autoFF);
  }
  if (killed && weapon.rules.stinger) stingerBurst(g, op, target);
  // Frenzy: shooting fells a Frenzied Fellgor with Critical Dmg, or Normal Dmg from two or more dice.
  if (wasFrenzy && ((block.remC > 0 && dc > 0 && !gong) || block.remN + (gong ? block.remC : 0) >= 2)) killed = frenzyDie(g, target, op);
  g.frenzyNow = null;
  const poisoned = poisonOnHit(g, op, target, rules, block.remC + block.remN > 0 ? dmg : 0);
  const stunned = stunOnCrit(g, rules, a.crits, target);
  // Mindburn (Sorcerer of Warpfire): damage from a critical success gives the target the token (moved from any previous target).
  if (rules.mindburn) {
    const burnt = block.remC > 0 && dmg > 0 && !target.dead;
    (g.mindburn ||= [null, null])[op.side] = burnt ? target.uid : null;
    if (burnt) log(g, { zh: `心靈灼燒：${opName(target, 'zh')} 武器命中變差 1，直到它下次啟動結束`, en: `Mindburn: ${opName(target, 'en')}'s weapons worsen their Hit by 1 until the end of its next activation` }, `side${op.side}`);
  }
  broodMark(g, op, target); // Crossfire: a Brood Brother's target that's still standing gains a token
  return {
    target: target.uid, rules, hit, atk, attack: a, save, defDice, coverSaves: coverN + coverC, coverCrit: coverC,
    inCover: useCover, obscured: useObscured, coverOrObscured: coverChoice, saturated: rules.saturate && useCover && !base, skulk, pierce, defence: d, dmg, dev, tox, resilient: res.rolls, poisoned, stunned,
    remC: block.remC, remN: block.remN, before, after: target.wounds, killed,
  };
}

/** Other targets hit by Torrent / Blast after the primary target. */
function secondaryTargets(g, op, weapon, primary) {
  const { torrent, blast, salvo } = weapon.rules;
  if (salvo) {
    // Salvo: a second valid target (the most wounded one).
    const second = foes(g, op).filter((t) => t !== primary && shootCheck(g, op, t, weapon, true).ok)
      .sort((a, b) => a.wounds - b.wounds)[0];
    const out = second ? [second] : [];
    // Salvo with Blast (Wrecka Boss Nob): then everyone caught in either blast, each shot once.
    if (blast) {
      for (const p of [primary, ...out]) {
        for (const t of g.ops.filter((x) => !x.dead && x !== op && x !== primary && !out.includes(x) && edgeDist(p, x) <= blast + 0.01 && visibility(g, p, x).visible)) out.push(t);
      }
    }
    return out;
  }
  if (torrent) {
    const ts = foes(g, op).filter((t) => t !== primary && edgeDist(primary, t) <= torrent + 0.01
      && shootCheck(g, op, t, weapon, true).ok);
    return weapon.rules.torrentMax ? ts.sort((a, b) => a.wounds - b.wounds).slice(0, weapon.rules.torrentMax) : ts;
  }
  if (blast) {
    // Any operative (friend or foe) visible to and within x of the primary target; Conceal doesn't matter.
    return g.ops.filter((t) => !t.dead && t !== primary && t !== op && edgeDist(primary, t) <= blast + 0.01
      && visibility(g, primary, t).visible);
  }
  return [];
}

/** Suppressing Fire: the shooter can't re-roll attack dice unless the target is the closest valid target. */
function suppressed(g, op, weapon, target) {
  if (!hasPloy(g, target.side, 'suppressingFire')) return false;
  // Ignore operatives with a Conceal order or that would be obscured.
  const cands = living(g, target.side).filter((t) => t.order !== 'conceal' && visibility(g, op, t).visible && !shotVisibility(g, op, t, weapon).obscured
    && shootCheck(g, op, t, weapon).ok);
  const closest = Math.min(...cands.map((t) => edgeDist(op, t)));
  return edgeDist(op, target) > closest + 0.01;
}

/**
 * Resolve a Shoot action all the way, with the computer's Command Re-roll decisions for every side
 * (used by the AI and tests). The interface steps through `shootFlow` instead so a human can decide.
 */
export function resolveShoot(g, op, weapon, target) {
  const it = shootFlow(g, op, weapon, target);
  let r = it.next();
  while (!r.done) {
    const { stage, seq } = r.value;
    const which = stage === 'attack' ? 'a' : 'd';
    const side = stage === 'attack' ? getOp(g, seq.op).side : getOp(g, seq.target).side;
    aiPain(g, getOp(g, which === 'a' ? seq.op : seq.target), seq, which, tally);
    const i = aiRerollChoice(g, side, seq, which);
    if (i >= 0) commandReroll(g, side, seq, which, i);
    const act = aiFaith(g, side, seq, which); // Acts of Faith (Novitiates)
    if (act) useFaith(g, side, seq, which, act, which === 'a' ? seq.op : seq.target);
    r = it.next();
  }
  return r.value;
}

/**
 * A free shot outside the normal flow (Boom!: a Bomb Squig exploding as it's incapacitated): each target in turn,
 * no cover, not obscured, and no re-roll decisions. The shot in progress (if any) is left as it was.
 */
export function forcedShot(g, op, weapon, targets, real = false) {
  const saved = { shotTargets: g.shotTargets, ffAtk: g.ffAtk, runesLost: g.runesLost, magnifyNow: g.magnifyNow, wkStart: g.wkStart };
  g.shotTargets = targets.map((t) => t.uid); g.ffAtk = null; g.runesLost = {}; g.magnifyNow = null;
  wkActionStart(g, op, 'shoot');
  const poisoned = new Set(g.ops.filter((o) => o.poison).map((o) => o.uid));
  for (const t of targets) {
    if (t.dead) continue;
    const it = shootSequence(g, op, weapon, t, real ? shotVisibility(g, op, t, weapon) : { visible: true, cover: false, obscured: false }, false, poisoned); // (real: with the cover and obscuring of a normal shot)
    let r = it.next();
    while (!r.done) r = it.next();
    log(g, { zh: `${opName(op, 'zh')} 的${weapon.name.zh}波及 ${opName(t, 'zh')}：${r.value.dmg} 傷害`, en: `${opName(op, 'en')}'s ${weapon.name.en} hits ${opName(t, 'en')}: ${r.value.dmg} damage` }, `side${op.side}`);
  }
  Object.assign(g, saved);
}

/** The Shoot action as a generator: yields after each dice roll (see shootSequence) and returns the result. */
export function* shootFlow(g, op, weapon, target) {
  g.spTvidOn = spTvid(g, op, target) ? op.uid : null; if (g.spTvidOn) spTvidUsed(g, op); // Tvid-feed Triangulation (Spectre Squad)
  if (sfDeclaim(g, op, 'shoot')) { spend(g, op, 'shoot', shootWeapon(g, op, weapon).ap); return { kind: 'sfDeclaim', attacker: op.uid, target: target.uid, weapon, action: 'shoot' }; } // Commanding Declamation (Sanctifier Confessor)
  pfShootStart(g, op, weapon, target); // Target Analysis Optic (Pathfinders)
  kfShootStart(g, op, weapon); // Piercing Shot / Toxin Shot (Farstalker Kinband)
  vdShootStart(g, op, weapon); // Shrieker Toxin Rounds (Void-dancer Troupe)
  vsShootStart(g, op, weapon, target); // Communion: a point for a target that isn't the closest
  ccPhaseStart(g, op, target); // Phase Shifter (Canoptek Circle)
  adShootStart(g, op, target, shotVisibility(g, op, target, weapon).obscured); // Auspex (Angels of Death)
  mwActionStart(g);
  wkActionStart(g, op, 'shoot'); // Wrecka Krew: Tanked Up, Wrecka Boss
  scNoteAttack(g, op); // Scout Squad: who attacked first this turning point (Emboldened Aspirant)
  weapon = scOculars(g, op, weapon); // Targeting Oculars equipment (Scout Squad)
  if (weapon.rules.wkExplosive) { op.wkExploded = true; (op.used ||= {})[weapon.id] = 1; } // (used now, so Boom! can't follow its own blast)
  mdShot(g, op, weapon);
  const painBefore = painSnapshot(g);
  archonBeforeAttack(g, op, 'shoot');
  if (!['haSplinterRifle', 'haSplinterPistol', 'haCannonF', 'haCannonS', 'haShardcarbine', 'haStinger'].includes(weapon.id)) { if (op.acted.refinedSequence) g.archonEq[op.side].refinedPoison--; op.acted.refinedSequence = false; }
  const ap = shootWeapon(g, op, weapon).ap;
  if (op.acted.barrage) op.acted.nextBarrageWeapon = weapon.id;
  if (op.acted.iaBar?.left) { op.acted.iaBar.left--; op.acted.iaBar.used.push(weapon.group); }
  g.dwAuspexTarget = target;
  const dwFreeScan = dwTriangulation(g, op.side, target);
  ffCommit(g, op, 'shoot', weapon, target);
  if (ffOn(g, op, 'dwAuspex')) { op.acted.dwAuspex = true; op.acted.dwAuspexFree = dwFreeScan; }
  g.dwAuspexTarget = null;
  weapon = dwApplyAmmo(g, op, weapon); // firefight ploys chosen for this Shoot are paid now
  if (weapon.technique) spendFF(g, op.side, weapon.technique); // Shriek-that-Kills
  if (weapon.rules.supportAsset) { (g.assetTP ||= [0, 0])[op.side] = g.tp; ((g.assetsUsed ||= [[], []])[op.side]).push(weapon.id); } // Privateer Support Asset used
  if (ffOn(g, op, 'avThousand')) weapon = { ...weapon, rules: { ...weapon.rules, torrent: 2, torrentMax: 1 } }; // Death of a Thousand Blades
  if (weapon.rules.wkPulsa) { // Pulsa rokkit (Rokkiteer): no attack sequence, it places the Pulsa marker
    const res = wkPulsaShot(g, op, weapon, target, ap, clampHit(weapon.hit + (hitWorse(g, op, weapon) ? 1 : 0) + (shokked(g, op) ? 1 : 0)), tally);
    g.ffAtk = null;
    return res;
  }
  if (ffOn(g, op, 'wkKaboom')) weapon = { ...weapon, rules: { ...weapon.rules, blast: (weapon.rules.blast || 0) + 1 } }; // Kaboom!: Blast +1"
  // Drill Rokkits (Wrecka Krew equipment, once per TP): a rokkit launcha with nobody else in the blast trades Blast for Piercing 1.
  if (weapon.group === 'wkRokkit' && !ffOn(g, op, 'wkKaboom') && hasEquip(g, op.side, 'wkDrill') && g.wkDrillTP?.[op.side] !== g.tp && !secondaryTargets(g, op, weapon, target).length) {
    (g.wkDrillTP ||= [0, 0])[op.side] = g.tp;
    const rules = { ...weapon.rules, piercing: 1 }; delete rules.blast;
    weapon = { ...weapon, rules };
    log(g, { zh: `${opName(op, 'zh')} 鑽地火箭：失去爆破、獲得穿甲 1`, en: `${opName(op, 'en')} Drill Rokkits: loses Blast, gains Piercing 1` }, `side${op.side}`);
  }
  if (ffOn(g, op, 'livingLightning')) { // Living Lightning: Blast 2" instead of 2" Devastating
    const rules = { ...weapon.rules, blast: 2 }; delete rules.devSplash;
    weapon = { ...weapon, rules };
  }
  // Revolting Technology (Gellerpox firefight ploy): the shooter's weapon gains Hot for this action.
  const revolt = !weapon.rules.hot && target.side < 2 && autoFF(g, target.side, 'revoltingTech');
  const relay = weapon.rules.detonate || weapon.rules.wkExplosive ? null : magnifyRelay(g, op, target, weapon);
  // (Mounted Exodite riders get no cover from Light terrain.)
  let vis = weapon.rules.detonate || weapon.rules.wkExplosive ? { visible: true, cover: false, obscured: false } : shotVisibility(g, relay || op, target, weapon, isMounted(target) ? { ignoreLight: true } : undefined);
  if (pmCloud(g, op, target)) vis = { ...vis, obscured: true }; // Cloud of Flies (Plague Marines)
  // Fated Shot (Leystalker upgrade, once per TP): its long rifle's target can't be obscured.
  if (vis.obscured && weapon.group === 'edRifle' && hasUp(op, 'fated') && op.fatedTP !== g.tp) { op.fatedTP = g.tp; vis = { ...vis, obscured: false }; log(g, { zh: '命定一擊：目標不能被遮蔽', en: 'Fated Shot: the target cannot be obscured' }, `side${op.side}`); }
  if (weapon.rules.aimed) op.acted.aimedUsed = true; // (Aimed: no more than 3" of movement after it)
  // Unquestioning Loyalty (Brood Brothers): a bodyguard takes the shot instead (in cover / obscured only if the Leader was).
  target = loyalSwap(g, op, xvSwap(g, pfSwap(g, sfSwap(g, holySwap(g, target, weapon), weapon), weapon), weapon), weapon); // (Holy Defender: Celestian Insidiant Abjuror; Saviour Protocols: XV26)
  xvShootStart(g, op, weapon, target); xvChaffStart(g, op, target); // XV26 Stealth Battlesuits: Focused Markerlight, Multitrackers, Ambush; Electrochaff Launcher
  if (kfQuickDraw(g, op, target)) { spend(g, op, 'shoot', ap); return { kind: 'sfDeclaim', attacker: op.uid, target: target.uid, weapon, action: 'shoot', title: { zh: '快拔', en: 'Quick Draw' }, text: { zh: '開火的特工被快拔搶先打倒，這次射擊取消。', en: 'The shooter was shot down by Quick Draw; the Shoot action is cancelled.' } }; } // Quick Draw (Kroot Pistolier)
  uprising(g, op, target); // Uprising: the target gains a Crossfire token as soon as it's selected
  g.magnifyNow = relay ? op.uid : null; // Magnify: Ceaseless until the end of the action
  if (relay) log(g, { zh: `${opName(op, 'zh')} 放大：借 ${opName(relay, 'zh')} 的視角射擊（無休）`, en: `${opName(op, 'en')} Magnify: shoots through ${opName(relay, 'en')} (Ceaseless)` }, `side${op.side}`);
  const others = secondaryTargets(g, op, weapon, target); // chosen before any damage is dealt
  wkKompetitive(g, op, [target, ...others]); // Kompetitive Streak (Tankbusta Gunner)
  // Sinuous Flux (Exodite ploy): shooting a fast Dragon Master from more than 6" — no attack re-rolls.
  const noReroll = suppressed(g, op, weapon, target) || (isEDM(target) && hasPloy(g, target.side, 'sinuousFlux') && speedOf(g, target) >= 4 && edgeDist(op, target) > 6);
  g.shotTargets = [target.uid, ...others.map((t) => t.uid)];
  const poisonedAtStart = new Set(g.ops.filter((o) => o.poison).map((o) => o.uid));
  g.runesLost = {}; // Runes of Khorne (Goremongers): at most 8 wounds lost per Shoot action
  const main = yield* shootSequence(g, op, weapon, target, vis, noReroll, poisonedAtStart);
  if (weapon.rules.banish) banish(g, op, target, main); // Dimensional Banishment (Tomb Crawler)
  // Inspirational Pyre (Cremator, once per TP): the hand flamer hurt an enemy without incapacitating it — inspire a friendly within 6".
  if (tpl(op).pyre && weapon.group === 'ciFlamer' && main?.dmg > 0 && !target.dead && op.pyreTP !== g.tp) {
    const t = pickInspire(g, op, 6);
    if (t) { op.pyreTP = g.tp; inspire(g, t, { zh: '激勵之火', en: 'Inspirational Pyre' }); }
  }
  spend(g, op, 'shoot', ap);
  // Crossfire (Wyrmblade): remember who shot this target this turning point.
  if (target.shotBy?.tp !== g.tp) target.shotBy = { tp: g.tp, uids: [] };
  target.shotBy.uids.push(op.uid);
  const h = weapon.rules.heavy; // the one move still allowed (Heavy (X only)), or 1 for none
  if (h && !tpl(op).bipodFree) op.acted.heavy = typeof h === 'string' && (op.acted.heavy == null || op.acted.heavy === h) ? h : 1; // (a Scout Heavy Gunner isn't restricted from moving after shooting)
  if (weapon.group === 'bow') op.energised = 0; // Energise lasts until the bow is shot
  op.acted.shotWith = weapon.group;
  rtShot(g, op, weapon); // Ratlings: remember a rifle was used (Shoot and Hide)
  if (weapon.group === 'gmSkewer') op.goreFuelOn = false; // (Gore-fuel lasts until the fleshskewer is used)
  if (count(op, 'shoot') === 1) op.acted.shotRapid = rapidWeapon(weapon); // (Rapid Fire: a second Shoot)
  op.acted.shotTarget = target.uid;
  if (astartesShot(weapon)) op.acted.shotBolt = true;
  if (weapon.rules.limited) (op.used ||= {})[weapon.id] = (op.used[weapon.id] || 0) + 1;
  if (weapon.rules.equipGrenade) g.eqUses[op.side][weapon.rules.equipGrenade]--; // the team's grenades
  (op.used ||= {}).shoot = (op.used.shoot || 0) + 1; // Concealed Position
  if (op.acted.free?.shoot) { op.acted.free.shoot = null; if (op.acted.ancestors) op.acted.free.fight = null; } // (The Ancestors Are Watching: a free Shoot OR Fight)
  const logShot = (t, s) => log(g, {
    zh: `${opName(op, 'zh')} 以${weapon.name.zh}（${weapon.name.en}）射擊 ${opName(t, 'zh')}：${s.dmg} 傷害`,
    en: `${opName(op, 'en')} shoots ${opName(t, 'en')} with ${weapon.name.en}: ${s.dmg} damage`,
  }, `side${op.side}`);
  logShot(target, main);
  const extra = [];
  for (const t of others) {
    if (t.dead) continue;
    // Torrent and Salvo targets use their own cover; Blast targets are in cover if the primary target was.
    const v = weapon.rules.blast ? vis : shotVisibility(g, op, t, weapon);
    const s = yield* shootSequence(g, op, weapon, t, v, noReroll, poisonedAtStart);
    logShot(t, s);
    extra.push(s);
  }
  g.runesLost = null;
  if (weapon.rules.bleed && main.dmg > 0 && !target.dead && target.side < 2) (target.bleed ||= [false, false])[op.side] = true; // Bleeding token (Inciter)
  ncTerror(g, op, weapon, getOp(g, main.target), main); for (const s of extra) ncTerror(g, op, weapon, getOp(g, s.target), s); // Terrorchem (Nemesis Claw Fearmonger)
  target.convictionNow = false;
  // Brazen Killer (Yaegir Bombast): a wroughtlock kill — each other enemy visible within 2" of it rolls a D6; above its APL, -1 APL.
  if (target.dead && weapon.id === 'hyWroughtlock' && tpl(op).brazenKiller) {
    for (const e of foes(g, op).filter((x) => x !== target && x.side < 2 && edgeDist(x, target) <= 2 && visibility(g, target, x).visible)) {
      const r = d6(), hit = r > aplNow(g, e);
      if (hit) changeApl(g, e, -1);
      log(g, { zh: `大膽殺手：${opName(e, 'zh')} 擲 ${r}${hit ? '，下次啟動 APL -1' : '，沒有效果'}`, en: `Brazen Killer: ${opName(e, 'en')} rolls ${r}${hit ? ' — -1 APL next activation' : ' — no effect'}` }, `side${op.side}`);
    }
  }
  // Hot: roll one D6 per action; below the Hit stat, the shooter takes twice the result.
  let hot = null;
  if ((weapon.rules.hot || revolt) && !op.dead) {
    const roll = d6();
    hot = { roll, dmg: roll < main.hit ? roll * 2 : 0 };
    if (hot.dmg) {
      log(g, { zh: `${opName(op, 'zh')} 武器過熱（擲 ${roll}）：自身受到 ${hot.dmg} 傷害`, en: `${opName(op, 'en')} overheats (rolled ${roll}): takes ${hot.dmg} damage` }, `side${op.side}`);
      hot.killed = applyDamage(g, op, op, hot.dmg);
    }
  }
  if (op.acted.darknessTarget === target.uid) op.acted.darknessUsed = true;
  archonAfterAction(g, op, painBefore);
  g.shotTargets = null;
  g.magnifyNow = null;
  op.shotTP = g.tp; // (Interstitial Command can't give a Shoot to one that already shot this turning point)
  pfShootEnd(g); // Target Analysis Optic ends with the action
  kfShootEnd(op);
  xvShootEnd(g, op); xvChaffEnd(g); // XV26 Stealth Battlesuits
  g.ccPhase = null;
  // Deathmarked: a Deathmark's surviving primary target gains a token; Deathmarks shooting it have Seek.
  if (tpl(op).deathmark && !target.dead && !(target.dmk?.[op.side])) {
    (target.dmk ||= {})[op.side] = true;
    log(g, { zh: `${opName(target, 'zh')} 獲得死亡標記（死亡標記射擊它時武器「搜尋」）`, en: `${opName(target, 'en')} gains a Deathmarked token (Deathmarks shooting it have Seek)` }, `side${op.side}`);
  }
  if (g.proxy?.uid === op.uid) endProxy(g); // Interstitial Command's free Shoot is done
  // Siphon Life (life siphon): heal a friendly for the dice that inflicted damage.
  if (weapon.rules.siphon && !op.dead) siphonLife(g, op, [...Array(main.remC).fill(true), ...Array(main.remN).fill(false)].slice(0, main.dmg > 0 ? 99 : 0));
  g.ffAtk = null;
  demolitionJob(g, op, target); // Demolition Job (Wrecka Krew)
  if (op.acted.contemptuous) op.acted.contemptUsed = true;
  corsairAfterAction(g, op);
  if (isVD(op) && (op.acted.vdRest || 0) > 0.5 && !op.acted.vdRestOn && count(op, 'reposition')) op.acted.vdRestOn = true; // Darting Salvo: the Reposition can go on after the Shoot
  aqAfterShoot(g, op); // Gunfight (Aquilon Gunfighter); Dynamic (Precursor)
  aqDynamic(g, op);
  dwAfterAction(g, op);
  faithRejuvenate(g); // Blessed Rejuvenation (Novitiates)
  sfMiracleMoves(g); // Miracle (Sanctifier Miraculist)
  for (const o of g.ops) o.medicShield = false;
  rtAfterEnemyAction(g, op, false); // Ratlings: Evade after an enemy action
  return { kind: 'shoot', attacker: op.uid, weapon, ap, ...main, extra, hot, suppressed: noReroll };
}

export function bestMelee(op) {
  const all = archonWeapons(op).filter((w) => w.type === 'melee');
  // (a Limited melee weapon that's used up — e.g. the Brood Brother Medic's gene-needler — is left out)
  const ws = all.filter((w) => !(w.rules.limited && (op.used?.[w.id] || 0) >= w.rules.limited));
  return (ws.length ? ws : all).sort((a, b) => avgDmg(b) - avgDmg(a))[0];
}

export function avgDmg(w, hitMod = 0) {
  const hit = clampHit(w.hit + hitMod);
  const crit = w.rules.lethal || 6;
  const pc = (7 - crit) / 6, ph = Math.max(0, (7 - hit) / 6 - pc);
  return w.atk * (pc * (w.dmg[1] + (w.rules.devastating || 0)) + ph * w.dmg[0]);
}

// ---------- melee ----------
// A fight lives in g.fight while it is being resolved, so a human player can choose
// Strike or Parry for each die. Both sides roll; the attacker resolves first, then they alternate.
const weaponById = (op, id) => archonWeapons(op).find((w) => w.id === id);
const other = (k) => (k === 'A' ? 'D' : 'A');
const left = (p) => p.c + p.n;

export function startFight(g, op, weapon, target) {
  if (sfDeclaim(g, op, 'fight')) { spend(g, op, 'fight'); return null; } // Commanding Declamation (Sanctifier Confessor): the Fight is cancelled, the AP isn't refunded
  const hatch = !isEngaged(g,op) && target && hatchwayFightAccess(g,op,target,radius(op),radius(target));
  if (g.map?.startsWith('tombworld-') && !fightTargets(g,op).includes(target)) return false;
  if (hatch) {
    g.hatchwayFight = [op.uid,target.uid];
    log(g,{zh:`${opName(op,'zh')} 經 ${hatch.component} 門口發動門間近戰（計入近戰動作）`,en:`${opName(op,'en')} starts a Hatchway Fight through ${hatch.component} (counts as a Fight)`},`side${op.side}`);
  }
  wkActionStart(g, op, 'fight'); // Wrecka Krew: Tanked Up, Wrecka Boss
  scNoteAttack(g, op); // Scout Squad: Emboldened Aspirant
  mwActionStart(g);
  g.runesLost = null; // (Runes of Khorne only count damage from a Shoot action)
  // Bad-tempered (Kroot Hound): an enemy fighting while the hound is a valid choice must fight the hound.
  const hound = engagedEnemies(g, op).find((e) => tpl(e).badTempered);
  if (hound && hound !== target && !tpl(target).badTempered) {
    log(g, { zh: `${opName(hound, 'zh')} 脾氣暴躁：${opName(op, 'zh')} 必須改打牠`, en: `${opName(hound, 'en')} Bad-tempered: ${opName(op, 'en')} must fight it instead` }, `side${hound.side}`);
    target = hound;
  }
  // Unquestioning Loyalty (Brood Brothers): a bodyguard is fought instead (treated as within control range).
  target = loyalSwap(g, op, sfSwap(g, holySwap(g, target, weapon), weapon), weapon); // (Holy Defender: Celestian Insidiant Abjuror)
  if (hatch) g.hatchwayFight = [op.uid,target.uid];
  uprising(g, op, target);
  const free = op.acted.free?.fight; // Savage Assault (an enemy uid), Stealth Attack ('stealth') or Swipe ('swipe')
  if (free === 'swipe') weapon = tpl(op).weapons.find((w) => w.rules.swipe); // the free Fight must use the swipe profile
  if (weapon.rules.swipe) (op.acted.swiped ||= []).push(target.uid);
  const painBefore = painSnapshot(g);
  archonBeforeAttack(g, op, 'fight'); archonBeforeAttack(g, target, 'fight');
  let dWeapon = bestMelee(target);
  const pbWeapon = pfPointBlank(g, op, target, dWeapon, avgDmg); // Point-Blank Fusillade (Pathfinders): retaliating with a ranged weapon
  if (pbWeapon) dWeapon = pbWeapon;
  ffCommit(g, op, 'fight', weapon, target); // firefight ploys chosen for this Fight are paid now
  // Mandiblasters (Striking Scorpions): at the start of the Roll Attack Dice step, 2 damage to the enemy.
  if (tpl(op).mandiblasters && target.side < 2) {
    log(g, { zh: `${opName(op, 'zh')} 下顎爆能器：${opName(target, 'zh')} 受到 2 傷害`, en: `${opName(op, 'en')} Mandiblasters: ${opName(target, 'en')} takes 2 damage` }, `side${op.side}`);
    applyDamage(g, op, target, 2); // (if that incapacitates it, the fight ends at once — see advanceFight)
  }
  if (tpl(op).digitalLasers && target.side < 2) { // Digital Lasers (Elucia Vhane): 1 damage
    log(g, { zh: `${opName(op, 'zh')} 數位雷射：${opName(target, 'zh')} 受到 1 傷害`, en: `${opName(op, 'en')} Digital Lasers: ${opName(target, 'en')} takes 1 damage` }, `side${op.side}`);
    applyDamage(g, op, target, 1);
  }
  dwDigital(g, op, target);
  const ar = effectiveRules(g, op, weapon, target);
  const dr = effectiveRules(g, target, dWeapon, op);
  // Rage (Goremonger Sanguavitae): +1 Atk on its melee weapons for this Fight. Gore-fuel is used up by the fleshskewer.
  if (op.acted.sangArm?.rage) { op.acted.sangArm.rage = false; ar.atkPlus = (ar.atkPlus || 0) + 1; ar.atkMax = 99; }
  for (const [o, w] of [[op, weapon], [target, dWeapon]]) if (w.group === 'gmSkewer') o.goreFuelOn = false;
  // Spectral Nimbus (Exodite Clanblade upgrade, once per TP): the opponent can't retain results below 6 as crits this sequence.
  for (const [me, foeRules] of [[op, dr], [target, ar]]) if (hasUp(me, 'nimbus') && me.nimbusTP !== g.tp) {
    me.nimbusTP = g.tp; delete foeRules.lethal; delete foeRules.rending; delete foeRules.severe;
    log(g, { zh: `${opName(me, 'zh')} 幽光環：對手只有擲出 6 才算暴擊`, en: `${opName(me, 'en')} Spectral Nimbus: the opponent's crits need a 6` }, `side${me.side}`);
  }
  // Tilting Shields (Angels of Death equipment): the opponent can't retain results below 6 as critical successes.
  for (const [me, foeRules] of [[op, dr], [target, ar]]) if (adTilting(g, me)) { delete foeRules.lethal; delete foeRules.rending; delete foeRules.severe; }
  // Rust Emanations (Gellerpox): a Nightmare Hulk fighting — the opponent can't retain results of 3.
  if (tpl(op).hulk && hasPloy(g, op.side, 'rustEmanations')) dr.no3 = true;
  // Blessings of Infection (Gellerpox): adjusts the fight dice of its operatives.
  const bless = (o) => (hasPloy(g, o.side, 'blessingsInfection') ? blessings : null);
  // Assist: another friendly operative within the enemy's control range improves the Hit stat by 1.
  // Brawler (Dôzr): enemies fighting it can't be assisted.
  // Devastating Onslaught (Legionary Butcher): enemies fighting it can't be assisted either.
  const assist = (me, foe) => !tpl(foe).brawler && !tpl(foe).noAssistVs && !hasGift(g, foe, 'barbed') && living(g, me.side).some((f) => f !== me && inEngagement(f, foe, g));
  const aAssist = assist(op, target), dAssist = assist(target, op);
  // Quicksilver Speed (Legionaries): against a Legionary that moved this TP, melee Hit is worsened by 1 (not with injured).
  const aHit = weapon.rules.fixedHit ? weapon.hit : clampHit(weapon.hit + (hitWorse(g, op, weapon) || quick(g, target) ? 1 : 0) + pfGravHit(g, op, weapon) + (shokked(g, op) ? 1 : 0) - (aAssist ? 1 : 0)); // (Shokkwave)
  // Banshee Mask (Howling Banshees): fighting, the enemy's melee Hit is worsened by 1 (not cumulative with injured).
  const dHit = dWeapon.rules.fixedHit ? dWeapon.hit : clampHit(dWeapon.hit + (hitWorse(g, target, dWeapon) || quick(g, op) || tpl(op).bansheeMask ? 1 : 0) + pfGravHit(g, target, dWeapon) + (shokked(g, target) ? 1 : 0) - (dAssist ? 1 : 0)); // (Shokkwave)
  // Cut-throats: +1 Atk to a maximum of 5.
  const atk = (w, r) => Math.max(1, (r.atkPlus ? Math.max(w.atk, Math.min(r.atkMax || 5, w.atk + r.atkPlus)) : w.atk) - (r.atkMinus || 0)); // (For Cadia!: max 4; atkMinus: Sanctification)
  // Whip Control (Herd-goad): -1 Atk on the melee weapons of a whipped enemy (to a minimum of 1).
  const whip = (o, n) => (n > 0 && (whipped(g, o) || declinedVs(g, o, o === op ? target : op)) ? Math.max(1, n - 1) : n);
  // Ambush (Fellgor ploy): when it fights after springing from Conceal, a normal becomes a crit (or a fail a normal).
  const ambush = TEAM_MAP[op.team].frenzy && hasPloy(g, op.side, 'ambushFG') && !op.frenzy && op.prevOrder === 'conceal' && op.order === 'engage';
  const ambushPost = (pool) => {
    const n = pool.dice.find((x) => x.res === 'norm'), m = pool.dice.find((x) => x.res === 'miss');
    if (n) { n.res = 'crit'; n.rend = true; pool.norms--; pool.crits++; } else if (m) { m.res = 'norm'; m.indo = true; pool.norms++; }
  };
  const aPost = ambush ? (bless(op) ? (p) => { bless(op)(p); ambushPost(p); } : ambushPost) : bless(op);
  const kinA = chainPost(chainPost(aPost, kinPost(g, op)), scryPost(g, op, 'guide')), kinD = chainPost(chainPost(bless(target), kinPost(g, target)), scryPost(g, target, 'guide')); // (Scry: Guidance) // (No Kin Left Behind)
  let aRoll = rollPool(whip(op, atk(weapon, ar)), aHit, ar.lethal || 6, ar, kinA);
  let dRoll = rollPool(whip(target, atk(dWeapon, dr)), dHit, dr.lethal || 6, dr, kinD);
  // Violent Temperament (Fellgor ploy): re-roll all the attack dice when fewer than two succeeded.
  const violent = (o, roll, w, r, hit, post) => (TEAM_MAP[o.team].frenzy && hasPloy(g, o.side, 'violentTemperament') && roll.crits + roll.norms < 2 && roll.dice.length >= 2
    ? (() => { const re = rollPool(whip(o, atk(w, r)), hit, r.lethal || 6, r, post); for (const d of re.dice) if (!d.auto) d.rr = true; return re; })() : roll);
  aRoll = violent(op, aRoll, weapon, ar, aHit, aPost);
  dRoll = violent(target, dRoll, dWeapon, dr, dHit, bless(target));
  archonPrey(g, op, target, aRoll);
  ncPrey(g, op, target, aRoll); ncPrey(g, target, op, dRoll); // Death to the False Emperor (Nemesis Claw)
  if (isDeathwatch(target)) archonPrey(g, target, op, dRoll);
  broodRerolls(g, op, target, aRoll); broodRerolls(g, target, op, dRoll); // (Brood Brothers, fighting or retaliating)
  claimBoost(g, op, target, aRoll); claimBoost(g, target, op, dRoll); // Stake Claim (Elucidian Starstriders)
  wkRoll(g, op, aRoll, target, tally); wkRoll(g, target, dRoll, op, tally); // Wrecka Rampage (fighting or retaliating)
  sfRoll(g, op, aRoll, tally); sfRoll(g, target, dRoll, tally); // Purity Seals (Sanctifiers)
  vdRoll(g, op, aRoll, tally); vdRoll(g, target, dRoll, tally); // Wraithbone Talisman (Void-dancer Troupe)
  pmCurse(g, op, target, dRoll, tally); pmCurse(g, target, op, aRoll, tally); // Curse of Rot (Plague Marines)
  adRoll(g, op, aRoll, tally); adRoll(g, target, dRoll, tally); // Purity Seals (Angels of Death)
  spend(g, op, 'fight');
  for (const [o, w] of [[op, weapon], [target, dWeapon]]) if (w.rules.limited) (o.used ||= {})[w.id] = (o.used[w.id] || 0) + 1; // Limited melee weapons
  if (free) { op.acted.free.fight = null; if (op.acted.ancestors && op.acted.free.shoot === 'any') op.acted.free.shoot = null; }
  // dueller: (Chapter Tactic) a normal success can block a critical success.
  // tox: Toxic bonus (foe poisoned at the start of the action); shock: Shock not used yet this sequence;
  // hardy: Cold-blood takes Normal Dmg from critical strikes; extraStrike: Stealth Attack.
  // a: the dice pool (re-rolled with Command Re-roll before any dice are resolved).
  const side = (o, foe, w, r, roll, hit) => ({
    uid: o.uid, w: w.id, c: roll.crits, n: roll.norms, brutal: !!r.brutal, dueller: hasTactic(g, o, 'dueller'), hit, dice: roll.dice, before: o.wounds,
    tox: (r.toxic && foe.poison ? 1 : 0) + (r.antiPsykerOn ? 1 : 0), poison: !!r.poison, shock: !!r.shock && !hasTactic(g, foe, 'resolute') && !tpl(foe).chemEnhanced && !tpl(foe).toxicBlessings, hardy: !!tpl(o).hardyCrit || !!tpl(o).brutish,
    a: roll, rerolled: {}, noReroll: { a: noRerollHere(g, o) || neurostatic(g, o) || broadcastNear(g, o) },
    // +1 damage on the first critical strike: Canticle of Destruction (Ruststalkers near the Princeps).
    critAll: inspCrit(o) + (tpl(o).mdWarrior && withinShadow(g, o) ? 1 : 0),
    critBonus: tpl(o).ruststalker && living(g, o.side).some((p) => tpl(p).canticleDestruction && edgeDist(p, o) <= 3) ? 1 : 0,
  });
  // Repress (Exaction Squad shields): retaliating with it, the defender resolves the first die.
  g.fight = { hatchway: hatch?.id || null, A: side(op, target, weapon, ar, aRoll, aHit), D: side(target, op, dWeapon, dr, dRoll, dHit), turn: dWeapon.rules.repress && !weapon.rules.repress ? 'D' : 'A', steps: [], done: false };
  if (op.mdFocusTarget === target.uid) op.mdFocusTarget = null;
  if (count(op, 'charge') && isMandrake(target) && withinShadow(g, target) && autoFF(g, target.side, 'mdBite')) g.fight.turn = 'D';
  g.fight.painBefore = painBefore;
  if (pbWeapon) { g.fight.D.noBlock = true; if (isPulse(pbWeapon) && target.ready && target.order === 'engage') g.fight.turn = 'D'; } // (no blocking; a ready Engage pulse-weapon retaliator resolves first)
  if (tpl(target).faolchuBond && target.ready && target.faolchuTP !== g.tp) { target.faolchuTP = g.tp; g.fight.turn = 'D'; }
  if (op.acted.darknessTarget === target.uid) op.acted.darknessUsed = true;
  g.fight.A.assist = aAssist; g.fight.D.assist = dAssist;
  if (free === 'stealth' || tpl(op).dwHeadtaker && op.acted.dwUnseen?.includes(target.uid)) g.fight.A.extraStrike = true;
  // ---- Firefight ploys ----
  if (ffOn(g, op, 'shockAssault')) g.fight.A.firstBonus = 1; // the first strike deals 1 more (max 7)
  if (ffOn(g, op, 'animalisticFury')) g.fight.A.critBonus += 1;
  if (dRoll.crits > 0 && autoFF(g, target.side, 'animalisticFury')) g.fight.D.critBonus += 1; // (retaliating)
  if (op.omniTP === g.tp && doctrina(g, op)?.mode === 'conqueror') g.fight.A.extraStrike = true; // Omnissiah's Imperative
  // For Cadia! (Kasrkin) / Blood for the Blood God (Legionaries, not Khorne): the first strike deals 1 more.
  if (skillOn(g, op, 'forCadia') || (TEAM_MAP[op.team].marksOfChaos && hasPloy(g, op.side, 'bloodGod') && markOf(op) !== 'khorne')) g.fight.A.firstBonus = 1;
  // Blood for the Blood God: Khorne operatives' melee weapons +1 to both Dmg (max 7).
  for (const [k, o] of [['A', op], ['D', target]]) if (markOf(o) === 'khorne' && hasPloy(g, o.side, 'bloodGod')) g.fight[k].dmgPlus = 1;
  // Speartip of the Clan (Exodite Clanblade upgrade, fighting): SPEED 4+ — its first normal strike +1; SPEED 7+ — +1 Normal Dmg.
  if (hasUp(op, 'speartip')) { const s = speedOf(g, op); if (s >= 7) g.fight.A.normPlus = 1; else if (s >= 4) g.fight.A.firstNorm = true; }
  // Souldrain (Canoptek Circle ploy): an enemy within the matrix, or fighting a Canoptek Circle operative within it.
  for (const [k, o, foe] of [['A', op, target], ['D', target, op]]) if (souldrained(g, o, foe)) g.fight[k].drain = true;
  if (tpl(target).viciousReflexes) g.fight.turn = 'D'; // Vicious Reflexes (Shrivetalon): it resolves first when retaliating
  if (rvHorror(g, target)) g.fight.turn = 'D'; // Subterranean Horror (Raveners)
  if (tpl(op).aqPrecursor || ffOn(g, op, 'vdMurder')) g.fight.A.extraStrike = true; // (Murderous Entrance: Void-dancer Troupe) // Vicious Knife Fighter (Aquilon Precursor): another die straight after its first
  if (tpl(target).aqPrecursor) g.fight.D.extraStrike = true;
  if (isAQ(target) && aqDetectedBlock(g, op, target)) g.fight.D.doubleOnce = true; // Eye Above (Aquilons): one block stops two successes
  if (isAQ(op) && aqDetectedBlock(g, target, op)) g.fight.A.doubleOnce = true;
  if (isSP(target) && target.side < 2 && (target.ready || target.order === 'conceal') && !target.acted?.spInterrupted && autoFF(g, target.side, 'spPrepared')) g.fight.D.doubleBlock = true; // Prepared Defence (Spectre Squad)
  if (rtLieInWait(g, target)) g.fight.turn = 'D'; // Lie in Wait (Ratling Hardbit): it resolves the first dice when retaliating beside terrain
  // Survival Instincts (Ratlings firefight ploy, automatic): a small Ratling fighting — normal blocks may stop a critical, critical blocks stop two.
  for (const [k, o] of [['A', op], ['D', target]]) if (isSmall(o) && o.side < 2 && ffReady(g, o.side, 'rtSurvival') && ffArmed(g, o.side, 'rtSurvival')) g.fight[k].si = true;
  // Savage Ambush (Kinband firefight ploy): a ready Kroot by terrain that's fought against strikes first.
  if (target.ready && g.terrain.some((t) => distPointRect(target, t) - radius(target) <= CONTROL) && autoFF(g, target.side, 'savageAmbush')) g.fight.turn = 'D';
  // Dirty Fighter (Nemesis Claw, retaliating): it resolves one success first — and no other this sequence.
  if (isNC(target) && dRoll.crits + dRoll.norms > 0 && autoFF(g, target.side, 'ncDirty')) { g.fight.turn = 'D'; g.fight.D.dirty = true; log(g, { zh: `卑鄙打法：${opName(target, 'zh')} 先結算一個成功`, en: `Dirty Fighter: ${opName(target, 'en')} resolves one success first` }, `side${target.side}`); }
  // Savage Assault: the first Fight of the activation may be followed by a free one against the same enemy.
  if (tpl(op).savageAssault && !op.acted.savageUsed) { op.acted.savageUsed = true; g.fight.savage = true; }
  stunOnCrit(g, ar, aRoll.crits, target);
  stunOnCrit(g, dr, dRoll.crits, op);
  // Vicious Duellist (Cut-skin): 1 damage to the enemy for each of its attack dice discarded as a fail.
  for (const [me, foe, foeRoll, k] of [[op, target, dRoll, 'A'], [target, op, aRoll, 'D']]) {
    if (!tpl(me).viciousDuellist) continue;
    const fails = foeRoll.dice.filter((d) => d.res === 'miss').length;
    if (!fails) continue;
    log(g, { zh: `${opName(me, 'zh')} 兇猛決鬥者：${opName(foe, 'zh')} ${fails} 顆失敗骰，受到 ${fails} 傷害`, en: `${opName(me, 'en')} Vicious Duellist: ${opName(foe, 'en')} failed ${fails} dice and takes ${fails} damage` }, `side${me.side}`);
    applyDamage(g, me, foe, fails);
    g.fight.duellist = { side: k, dmg: fails };
  }
  // Screaming Rustspikes (Gellerpox Techno-curse): an infected enemy with any failed attack dice takes 1 damage.
  for (const [foe, foeRoll, k, me] of [[target, dRoll, 'A', op], [op, aRoll, 'D', target]]) {
    if (foe.dead || TEAM_MAP[me.team].tacticSlots !== 1 || !cursed(g, foe, 'rustspikes') || !foeRoll.dice.some((d) => d.res === 'miss')) continue;
    log(g, { zh: `尖嘯鏽刺：${opName(foe, 'zh')} 有攻擊骰失敗，受到 1 傷害`, en: `Screaming Rustspikes: ${opName(foe, 'en')} failed attack dice and takes 1 damage` }, `side${1 - foe.side}`);
    applyDamage(g, null, foe, 1);
    g.fight.rust = [...(g.fight.rust || []), k === 'A' ? 'D' : 'A'];
  }
  // Command Re-roll window: the computer decides at once; a human side that can re-roll gets to choose
  // before any dice are resolved (fightRerollDone closes the window).
  g.fight.rrOpen = {};
  for (const k of ['A', 'D']) {
    const side = fightOp(g, k).side, holder = g.fight[k];
    if (isComputer(g, side)) {
      aiPain(g, fightOp(g, k), holder, 'a', tally); syncFightSide(holder);
      const i = aiRerollChoice(g, side, holder, 'a');
      if (i >= 0) { commandReroll(g, side, holder, 'a', i); syncFightSide(holder); }
      const act = aiFaith(g, side, holder, 'a'); // Acts of Faith (Novitiates)
      if (act) { useFaith(g, side, holder, 'a', act, holder.uid); syncFightSide(holder); }
    } else if (canCommandReroll(g, side, holder, 'a') || canFaith(g, side, holder, 'a') || painRerollValues(g, fightOp(g, k), holder, 'a').length) g.fight.rrOpen[k] = true;
  }
  // Novitiate Penitent (Absolution Through Destruction): after a Fight it didn't get for free, a free Fight follows.
  if (tpl(op).absolution && !free) op.acted.free = { ...(op.acted.free || {}), fight: 'any' };
  // Whip Into Frenzy (Exactor): the first of its two Fights makes the second free.
  if (op.acted.whip && !free && count(op, 'fight') === 1) op.acted.free = { ...(op.acted.free || {}), fight: op.acted.free?.fight || 'any' };
  if (g.fight.rrOpen.A || g.fight.rrOpen.D) return g.fight;
  g.fight.rrOpen = null;
  advanceFight(g);
  return g.fight;
}

const syncFightSide = (s) => { s.c = s.a.crits; s.n = s.a.norms; s.dice = s.a.dice; };
function syncFightSideFromCounts(s) { s.a.crits = s.c; s.a.norms = s.n; }

/** A human player's Act of Faith in the fight (before any dice are resolved). */
export function fightFaith(g, k, act) {
  const f = g.fight;
  if (!f?.rrOpen?.[k]) return false;
  const ok = useFaith(g, fightOp(g, k).side, f[k], 'a', act, f[k].uid);
  if (ok) syncFightSide(f[k]);
  return ok;
}

/** A human player's Command Re-roll of one die in the fight (before any dice are resolved). */
export function archonReroll(g, op, holder, which, value) { return painReroll(g, op, holder, which, value, tally); }
export function archonFightReroll(g, k, value) { if (!g.fight?.rrOpen?.[k]) return false; const ok = archonReroll(g, fightOp(g, k), g.fight[k], 'a', value); if (ok) syncFightSide(g.fight[k]); return ok; }
export function archonAutoReroll(g, op, holder, which) { aiPain(g, op, holder, which, tally); }

export function fightCommandReroll(g, k, index) {
  const f = g.fight;
  if (!f?.rrOpen?.[k]) return false;
  const ok = commandReroll(g, fightOp(g, k).side, f[k], 'a', index);
  if (ok) syncFightSide(f[k]);
  return ok;
}

/** Close the Command Re-roll window and start resolving the fight dice. */
export function fightRerollDone(g) {
  if (!g.fight?.rrOpen) return;
  g.fight.rrOpen = null;
  advanceFight(g);
}

export const fightOp = (g, k) => getOp(g, g.fight[k].uid);
export const fightWeapon = (g, k) => weaponById(fightOp(g, k), g.fight[k].w);
/** Which player (side 0/1) must choose next. */
export const fightChooser = (g) => fightOp(g, g.fight.turn).side;

/** Legal choices for the side whose turn it is. */
export function fightOptions(g) {
  const f = g.fight;
  if (!f.stanceDone) {
    f.stanceDone = true;
  for (const k of ['A', 'D']) if (tpl(fightOp(g, k)).bladedStance || tpl(fightOp(g, k)).dwAdaptiveSword || (hasUp(fightOp(g, k), 'bladed') && g.fight[k].w === 'edMoonblades')) { // (Bladed Stance upgrade: Exodite Clanblade with moonblades)
    const me = g.fight[k], foe = g.fight[k === 'A' ? 'D' : 'A'];
    if (me.c && (foe.c || foe.n)) { me.c--; if (foe.c) foe.c--; else foe.n--; }
    else if (me.n && foe.n && !foe.brutal) { me.n--; foe.n--; }
    syncFightSideFromCounts(me);
    syncFightSideFromCounts(foe);
  }
    advanceFight(g); // Stance may remove the last die or change whose turn it is.
  }
  if (f.done) return [];
  const k = f.turn, me = f[k], foe = f[other(k)];
  const w = fightWeapon(g, k), foeOp = fightOp(g, other(k));
  const opts = [];
  // Shock Assault (firefight ploy): the first strike deals 1 more (to a maximum of 7).
  const first = (d) => (me.firstBonus ? Math.max(d, Math.min(7, d + 1)) : d);
  // Blood for the Blood God (Khorne): +1; Souldrain (Canoptek Circle ploy): -1 to a minimum of 2.
  const plus = (d) => { const v = me.dmgPlus ? Math.max(d, Math.min(7, d + me.dmgPlus)) : d; return me.drain ? Math.max(Math.min(v, 2), v - 1) : v; };
  // normPlus / firstNorm: Speartip of the Clan (Exodite Clanblade).
  const normal = first(plus(normalDmg(w, foeOp, g, fightOp(g, k)) + (me.tox || 0) + (me.normPlus || 0) + (me.firstNorm && !me.firstNormUsed ? 1 : 0)));
  // Headtaker: the skullcleaver's Critical Dmg grows with each kill.
  // Canticle of Destruction / Animalistic Fury: more damage on the first critical strike of the sequence.
  const critD = first(plus(w.dmg[1]) + (me.tox || 0) + (w.rules.headtaker ? fightOp(g, k).headBonus || 0 : 0) + (me.critBonus && !me.critBonusUsed ? me.critBonus : 0) + (me.critAll || 0)); // (critAll: Inspired Strikes)
  if (me.c) opts.push({ id: 'strike-c', act: 'strike', die: 'c', dmg: foe.hardy ? Math.min(critD, normal) : critD });
  if (me.n) opts.push({ id: 'strike-n', act: 'strike', die: 'n', dmg: normal });
  // Parry: a crit cancels any success, a normal cancels a normal (not vs Brutal).
  if (me.c && foe.c) opts.push({ id: 'parry-c-c', act: 'parry', die: 'c', target: 'c' });
  if (me.c && foe.n) opts.push({ id: 'parry-c-n', act: 'parry', die: 'c', target: 'n' });
  if (me.n && foe.n && !foe.brutal) opts.push({ id: 'parry-n-n', act: 'parry', die: 'n', target: 'n' });
  if (me.n && foe.c && (me.dueller || me.si) && !foe.brutal) opts.push({ id: 'parry-n-c', act: 'parry', die: 'n', target: 'c' }); // (si: Survival Instincts)
  // A success doesn't have to be used: discard it without striking.
  if (me.n) opts.push({ id: 'decline-n', act: 'decline', die: 'n' });
  else if (me.c) opts.push({ id: 'decline-c', act: 'decline', die: 'c' });
  return me.noBlock ? opts.filter((o) => o.act !== 'parry') : opts; // (Point-Blank Fusillade: no blocking)
}

export function fightApply(g, optId) {
  const f = g.fight;
  if (f.rrOpen) fightRerollDone(g); // choosing a die to resolve closes the re-roll window
  if (f.done) return;
  const opt = fightOptions(g).find((o) => o.id === optId);
  if (!opt) return;
  const k = f.turn, me = f[k], foe = f[other(k)];
  if (opt.act === 'strike' && opt.die === 'n' && kmKunnin(g, f, k, me, fightOp(g, k))) { me.n--; me.c++; return fightApply(g, 'strike-c'); } // Kunnin' But Brutal (Kommandos): the first strike counts as a crit
  me[opt.die]--;
  if (opt.act === 'strike' && opt.die === 'n' && vdJest(g, fightOp(g, other(k)), foe, fightWeapon(g, k))) { f.steps.push({ side: k, act: 'parry', crit: false, blocked: false }); f.turn = other(k); advanceFight(g); return; } // Cegorach's Jest (Void-dancer Troupe)
  if (me.dirty) { me.dirty = false; me.c = 0; me.n = 0; } // Dirty Fighter: no other success is resolved this sequence
  if (mwHonour(g, fightOp(g, k), fightOp(g, other(k)), opt.die === 'c', autoFF)) { advanceFight(g); return; }
  if (opt.act === 'strike' && wkDetonate(g, f, fightOp(g, k), fightOp(g, other(k)), fightWeapon(g, k), opt.die === 'c')) { advanceFight(g); return; } // Detonate (Demolisha)
  if (opt.act === 'strike' && opt.die === 'c' && me.critBonus) me.critBonusUsed = true;
  if (opt.act === 'strike' && me.firstBonus) me.firstBonus = 0; // Shock Assault: only the first strike
  if (opt.act === 'strike' && opt.die === 'n' && me.firstNorm) me.firstNormUsed = true; // Speartip of the Clan: only the first normal strike
  if (opt.act === 'strike') {
    const meOp = fightOp(g, k), foeOp = fightOp(g, other(k));
    // Bruiser: once per turning point, ignore the damage from one normal success when fighting or retaliating.
    let shrug = opt.die === 'n' && (tpl(foeOp).bruiser || tpl(foeOp).devoted || tpl(foeOp).weathered) && foeOp.bruiserTP !== g.tp; // (Weathered: Death World Veteran) // (Devoted: Brood Brother Agitator)
    if (shrug) foeOp.bruiserTP = g.tp;
    if (!shrug && opt.die === 'n' && corsairShield(g, foeOp)) shrug = true;
    if (!shrug && opt.die === 'n' && useCrest(g, foeOp)) shrug = true; // Weavefield Crest (Theyn)
    if (!shrug && opt.die === 'n' && pfShield(g, foeOp)) shrug = true; // Shield Generator (MV4 Shield Drone)
    if (!shrug && opt.die === 'n' && adIronHalo(g, foeOp)) shrug = true; // Iron Halo (Space Marine Captain)
    if (!shrug && opt.die === 'n' && foeOp.side < 2 && isCC(foeOp) && inMatrix(g, foeOp.side, foeOp) && autoFF(g, foeOp.side, 'shieldFlare')) shrug = true; // Shield Flare (Canoptek Circle)
    if (!shrug && opt.die === 'n' && opt.dmg > 0 && !tpl(foeOp).kmSmall && autoFF(g, foeOp.side, 'justScratch')) shrug = true; // Just a Scratch (Kommandos)
    if (!shrug && opt.die === 'n' && isWK(foeOp) && !tpl(foeOp).wkSquig && autoFF(g, foeOp.side, 'wkJustScratch')) shrug = true; // Just a Scratch (Wrecka Krew)
    if (!shrug && opt.die === 'n' && tpl(foeOp).ncVisionary && ncPortent(g, foeOp)) shrug = true; // Portent (Nemesis Claw Visionary)
    if (!shrug && opt.die === 'n' && isSF(foeOp) && autoFF(g, foeOp.side, 'sfRosarius')) shrug = true; // Rosarius (Sanctifiers)
    // Brawler (Dôzr): Normal Dmg of 4 or more inflicts 1 less when it's fighting or retaliating.
    // Tough (Blooded Thug): Normal Dmg of 3 or more inflicts 1 less.
    // War Gong: a critical strike inflicts Normal Dmg instead (when lower, or to keep a Frenzied Fellgor up).
    const wasFrenzy = !!foeOp.frenzy;
    const normalHit = normalDmg(fightWeapon(g, k), foeOp, g, meOp) + (me.tox || 0);
    const gong = opt.die === 'c' && warGong(g, foeOp) && (normalHit < opt.dmg || wasFrenzy);
    const dmg0 = (gong ? normalHit : opt.dmg) + mwBoon(g, meOp), asNormal = opt.die === 'n' || gong;
    let amount = asNormal && ((tpl(foeOp).brawler && dmg0 >= 4) || ((tpl(foeOp).tough || bulwark(g, foeOp)) && dmg0 >= 3)) ? dmg0 - 1 : dmg0;
    amount = dwReduceDamage(g, foeOp, amount, asNormal, true);
    amount = wkReckless(foeOp, amount, asNormal); // Reckless Temperament (Demolisha)
    if (tpl(foeOp).ncTyrant && amount >= 3) amount--; // Tyrant of the Skinning Pits (Skinthief): fighting or retaliating, 3+ deals 1 less
    if (asNormal && amount >= 3 && isMurderwing(foeOp) && k === 'D' && hasPloy(g, foeOp.side, 'mwFear')) amount--;
    // Holy Resilience (Celestian Insidiants ploy): an inspiring friendly takes 1 less from Normal and Critical Dmg of 4+.
    if (amount >= 4 && foeOp.inspiring && isCI(foeOp) && hasPloy(g, foeOp.side, 'holyResilience')) amount--;
    if (amount >= 4 && sfSermon(g, foeOp)) amount--; // the Ministorum Sermon (Sanctifiers): Normal and Critical Dmg of 4+ deals 1 less
    amount = vsExo(g, foeOp, amount, asNormal); // Hardened Exoskeleton (Vespid Stingwings)
    amount = rvCarapace(foeOp, amount); // Reinforced Carapace (Raveners Wrecker)
    // Gory Tenacity (Goremongers ploy): the opponent's first strike on it this sequence is halved (rounding up, minimum 2).
    if (amount > 2 && !foe.tenacityUsed && isGM(foeOp) && foeOp.side < 2 && hasPloy(g, foeOp.side, 'goryTenacity')) { foe.tenacityUsed = true; amount = Math.max(2, Math.ceil(amount / 2)); }
    if (!shrug && opt.die === 'n' && amount >= 2 && tpl(foeOp).automata && autoFF(g, foeOp.side, 'allIsDust')) amount = 1; // All Is Dust (Rubric Marines)
    // Ice In Your Veins (Kasrkin): the first Normal Dmg of 3+ in the sequence deals 1 less.
    if (!shrug && asNormal && amount >= 3 && skillOn(g, foeOp, 'iceInVeins') && !foe.iceUsed) { foe.iceUsed = true; amount--; }
    // Unleash Daemon (4+ deals 1 less), else Disgusting Vigour (Nurgle, Normal Dmg 3+: 5+ = 1 less) — never more than 1 off.
    if (!shrug) { const a2 = daemonShell(foeOp, amount); amount = a2 < amount ? a2 : asNormal ? nurgleVigour(g, foeOp, amount) : amount; }
    const res = shrug ? { dmg: 0, rolls: [] } : resolveDice(foeOp, [amount], g); // Disgustingly Resilient
    if (!shrug) res.dmg += rvCrush(fightWeapon(g, k), foeOp); // Crush (Raveners Wrecker)
    if (!shrug && opt.die === 'c') res.dmg += vsVenom(g, meOp); // Vicious Venom (Vespid Stingwings)
    if (!shrug && meOp.acted?.spSilent && !me.silentUsed) { me.silentUsed = true; res.dmg += 3; me.silentDiscard = true; } // Silent Killers (Spectre Squad)
    // Shock: the first crit strike in the sequence also discards an unresolved enemy normal (else a crit).
    let shocked = null;
    if (opt.die === 'c' && me.shock) {
      me.shock = false;
      if (foe.n) { foe.n--; shocked = 'n'; } else if (foe.c) { foe.c--; shocked = 'c'; }
    }
    // Barbed (Chaos Cult Accursed Gift): its first strike also hurts each other enemy in its control range (1, or D3 for a Torment).
    if (!me.barbedUsed && hasGift(g, meOp, 'barbed')) {
      me.barbedUsed = true;
      for (const e of foes(g, meOp).filter((x) => x !== foeOp && x.side < 2 && edgeDist(x, meOp) <= CONTROL + 0.01)) applyDamage(g, meOp, e, tpl(meOp).torment ? d3() : 1);
    }
    // Faith & Fury (Celestian Insidiants ploy): after its first critical strike, D3 to each other enemy visible within 2".
    if (opt.die === 'c' && k === 'A' && !me.furyUsed && ffOn(g, meOp, 'faithFury')) {
      me.furyUsed = true;
      for (const e of foes(g, meOp).filter((x) => x !== foeOp && x.side < 2 && edgeDist(x, meOp) <= 2 && visibility(g, meOp, x).visible)) {
        const d = d3();
        log(g, { zh: `信仰與怒火：${opName(e, 'zh')} 受到 ${d} 傷害`, en: `Faith & Fury: ${opName(e, 'en')} takes ${d} damage` }, `side${meOp.side}`);
        applyDamage(g, meOp, e, d);
      }
    }
    if (opt.die === 'c' && fightWeapon(g, k).rules.flay && !me.flayUsed) { me.flayUsed = true; const pick = living(g, meOp.side).filter((x) => edgeDist(x, meOp) <= 6).sort((a, b) => (a.pain || 0) - (b.pain || 0))[0]; if (pick) gainPain(g, pick); }
    const mdContext = g.mdMeleeKill;
    g.mdMeleeKill = { uid: meOp.uid, id: fightWeapon(g, k).id };
    let killed = applyDamage(g, meOp, foeOp, res.dmg);
    g.mdMeleeKill = mdContext;
    if (res.dmg > 0) me.mdDamageDice = (me.mdDamageDice || 0) + 1;
    // Goremongers: Ritual blade (first damage this sequence fills the tank), Claim Skull (great chainaxe kill: +1CP once per TP), Bleeding tokens.
    if (res.dmg > 0 && fightWeapon(g, k).rules.ritual && !me.ritualUsed && !meOp.dead) { me.ritualUsed = true; goreUp(g, meOp, { zh: '儀式之刃', en: 'Ritual blade' }); }
    if (killed && fightWeapon(g, k).id === 'gmChainaxe' && tpl(meOp).claimSkull && meOp.skullTP !== g.tp) { meOp.skullTP = g.tp; g.cp[meOp.side]++; log(g, { zh: `${opName(meOp, 'zh')} 奪取顱骨：+1CP`, en: `${opName(meOp, 'en')} Claim Skull: +1CP` }, `side${meOp.side}`); }
    if (res.dmg > 0 && !killed && !foeOp.dead && fightWeapon(g, k).rules.bleed && foeOp.side < 2) (foeOp.bleed ||= [false, false])[meOp.side] = true;
    // Frenzy: a Frenzied Fellgor falls to a critical strike, or to a second normal one.
    if (wasFrenzy && !shrug) {
      if (!asNormal) killed = frenzyDie(g, foeOp, meOp);
      else if (++foeOp.frenzyHits >= 2) killed = frenzyDie(g, foeOp, meOp);
    }
    if (foeOp.convictionNow) { foeOp.convictionNow = false; f.A.c = f.A.n = f.D.c = f.D.n = 0; } // Outright Conviction: every remaining die is discarded
    // Gaining a Frenzy token discards all remaining attack dice of the fight.
    if (g.frenzyNow === foeOp.uid) { f.A.c = f.A.n = f.D.c = f.D.n = 0; g.frenzyNow = null; }
    if (me.silentDiscard) { me.c = 0; me.n = 0; me.silentDiscard = false; } // (Silent Killers: no other success resolves)
    poisonOnHit(g, meOp, foeOp, { poison: me.poison }, res.dmg);
    ncFightToken(g, meOp, fightWeapon(g, k), foeOp, opt.die === 'c', res.dmg); // Terrorchem (Nemesis Claw)
    sfFightBlaze(g, meOp, fightWeapon(g, k), foeOp, opt.die === 'c', res.dmg); // Blaze (Sanctifiers)
    rvPoisonHit(g, meOp, fightWeapon(g, k), foeOp, opt.die === 'c' && res.dmg > 0); // Poison (Raveners)
    rvAcidBlood(g, foeOp, meOp, res.dmg); // Acid Blood (Raveners)
    if (fightWeapon(g, k).rules.wkSmash && !killed) wkSmash(g, meOp, foeOp); // Smash (Krusha): knock the enemy back 1" and follow
    // Headtaker (Gorehorn): a kill heals D3 (no Frenzy token) and adds D3 to the skullcleaver's Critical Dmg (max 8).
    if (killed && fightWeapon(g, k).rules.headtaker) {
      const r = d3();
      if (!meOp.frenzy && !meOp.dead) meOp.wounds = Math.min(meOp.maxW, meOp.wounds + r);
      meOp.headBonus = Math.min(8 - fightWeapon(g, k).dmg[1], (meOp.headBonus || 0) + r);
    }
    if (killed) meOp.meleeKill = true; // Apoplectic Rejuvenation heals 6 for it
    // Horrifying Dismemberment (Shrivetalon): another enemy visible within 3" of it or the victim gets -1 APL.
    if (killed && tpl(meOp).dismember && !meOp.dead) {
      const v = living(g, foeOp.side).filter((e) => e !== foeOp && (edgeDist(e, meOp) <= 3 && visibility(g, meOp, e).visible || edgeDist(e, foeOp) <= 3 && (!isMurderwing(meOp) || visibility(g, foeOp, e).visible))).sort((x, y) => tpl(y).apl - tpl(x).apl)[0];
      if (v) { changeApl(g, v, -1); log(g, { zh: `恐怖肢解：${opName(v, 'zh')} 下次啟動 APL -1`, en: `Horrifying Dismemberment: ${opName(v, 'en')} gets -1 APL next activation` }, `side${meOp.side}`); }
    }
    // Stealth Attack: the first strike is followed straight away by another (before the opponent).
    // Tactual Hunter (Mangler): against an expended enemy, the first critical strike is followed by another.
    const tactual = opt.die === 'c' && fightWeapon(g, k).rules.tactualHunter && !foeOp.ready && !me.tactualUsed && !killed;
    if (tactual) me.tactualUsed = true;
    const again = (!!me.extraStrike || tactual) && left(me) > 0;
    me.extraStrike = false;
    f.steps.push({ side: k, act: 'strike', crit: opt.die === 'c', dmg: res.dmg, killed, resil: res.rolls[0], shocked, again, shrug });
    f.turn = again ? k : other(k);
    if (opt.die === 'c' && !killed && !foeOp.dead) vdCurtain(g, meOp, foeOp, f); // The Curtain Falls (Void-dancer Troupe)
    // Bruiser: incapacitated in the fight, it strikes back once with an unresolved success before it's removed.
    // Blood Offering (Butcher): the first critical strike in the sequence gains a Blooded token.
    if (opt.die === 'c' && fightWeapon(g, k).rules.bloodOffering && !me.offered) { me.offered = true; gainBlood(g, meOp.side, { zh: '血之獻祭', en: 'Blood Offering' }); }
    // Unholy Sustenance (Butcher): incapacitating the enemy in a fight regains D3 wounds.
    if (killed && tpl(meOp).unholySustenance && !meOp.dead) { const h = d3(); meOp.wounds = Math.min(meOp.maxW, meOp.wounds + h); }
    if (killed && (tpl(foeOp).bruiser || tpl(foeOp).fanatical || tpl(foeOp).brawler || tpl(foeOp).wretched || tpl(foeOp).irrepressible || tpl(foeOp).mwFrenzied) && left(foe) > 0 && !meOp.dead) {
      const w = fightWeapon(g, other(k)), crit = foe.c > 0;
      foe[crit ? 'c' : 'n']--;
      const dmg = crit ? w.dmg[1] + (foe.tox || 0) : normalDmg(w, meOp, g, foeOp) + (foe.tox || 0);
      const r2 = resolveDice(meOp, [dmg], g);
      const k2 = applyDamage(g, foeOp, meOp, r2.dmg);
      f.steps.push({ side: other(k), act: 'strike', crit, dmg: r2.dmg, killed: k2, lastBlow: true });
    } else if (killed && isCI(foeOp) && left(foe) > 0 && !meOp.dead && autoFF(g, foeOp.side, 'gloryMartyrs')) {
      // Glory to the Martyrs (Celestian Insidiants ploy): it strikes with an unresolved success before it's removed;
      // if that incapacitates the enemy, it becomes inspiring and Martyrdom applies.
      const w = fightWeapon(g, other(k)), crit = foe.c > 0;
      foe[crit ? 'c' : 'n']--;
      const dmg = crit ? w.dmg[1] + (foe.tox || 0) : normalDmg(w, meOp, g, foeOp) + (foe.tox || 0);
      const r2 = resolveDice(meOp, [dmg], g);
      const k2 = applyDamage(g, foeOp, meOp, r2.dmg);
      f.steps.push({ side: other(k), act: 'strike', crit, dmg: r2.dmg, killed: k2, lastBlow: true });
      if (k2 && !foeOp.inspiring) { foeOp.inspiring = true; martyrdom(g, foeOp); }
    } else if (killed && isBrood(foeOp) && !tpl(foeOp).alphaPredator && hasPloy(g, foeOp.side, 'cultDevotion') && left(foe) > 0 && !meOp.dead) {
      // Cult Devotion (Brood Brothers ploy): roll a D6 as an attack die — a hit strikes with a normal success, a crit with any.
      const w = fightWeapon(g, other(k)), r = d6(), crit = r >= (w.rules.lethal || 6);
      const die = crit && foe.c > 0 ? 'c' : r >= foe.hit && foe.n > 0 ? 'n' : null;
      log(g, { zh: `教派奉獻：${opName(foeOp, 'zh')} 擲 ${r}${die ? '，殘廢前再打一擊' : '，沒有效果'}`, en: `Cult Devotion: ${opName(foeOp, 'en')} rolls ${r}${die ? ' and strikes before it falls' : ' — no effect'}` }, `side${foeOp.side}`);
      if (die) {
        foe[die]--;
        const dmg = die === 'c' ? w.dmg[1] + (foe.tox || 0) : normalDmg(w, meOp, g, foeOp) + (foe.tox || 0);
        const r2 = resolveDice(meOp, [dmg], g);
        const k2 = applyDamage(g, foeOp, meOp, r2.dmg);
        f.steps.push({ side: other(k), act: 'strike', crit: die === 'c', dmg: r2.dmg, killed: k2, lastBlow: true });
      }
    }
  } else if (opt.act === 'decline') {
    f.steps.push({ side: k, act: 'decline', crit: opt.die === 'c' });
    f.turn = other(k);
  } else {
    foe[opt.target]--;
    // Survival Instincts (Ratlings firefight ploy): paid the first time it matters — a normal block stopping a critical success, or a
    // critical block with another success left to stop.
    if (me.si && !me.siPaid && ((opt.die === 'n' && opt.target === 'c' && !me.dueller) || (opt.die === 'c' && foe.c + foe.n > 0))) {
      me.siPaid = autoFF(g, fightOp(g, k).side, 'rtSurvival');
      if (!me.siPaid) me.si = false;
    }
    // Shield (Endurant's shield bash): each block cancels two unresolved successes.
    if (fightWeapon(g, k).rules.shield || tpl(fightOp(g, k)).rtBruteShield || (me.siPaid && opt.die === 'c') || me.doubleBlock || (me.doubleOnce && !me.doubleUsed && (me.doubleUsed = true))) { // (Brute shield: Bullgryn; Survival Instincts: Ratlings; Prepared Defence: Spectre Squad)
      const can = (t) => foe[t] > 0 && !(opt.die === 'n' && t === 'c' && !me.dueller); // a normal can only block a normal
      const t2 = can(opt.target) ? opt.target : can(opt.target === 'c' ? 'n' : 'c') ? (opt.target === 'c' ? 'n' : 'c') : null;
      if (t2) foe[t2]--;
    }
    f.steps.push({ side: k, act: 'parry', crit: opt.die === 'c', blocked: opt.target === 'c' });
    f.turn = other(k);
  }
  // Counterattack (Brood Brother Knife Fighter): each normal success its opponent resolves inflicts 1 damage on that opponent.
  const resolver = fightOp(g, k), knife = fightOp(g, other(k));
  if (opt.die === 'n' && opt.act !== 'decline' && tpl(knife).counterattack && !knife.dead && !resolver.dead) {
    log(g, { zh: `${opName(knife, 'zh')} 反擊刀法：${opName(resolver, 'zh')} 受到 1 傷害`, en: `${opName(knife, 'en')} Counterattack: ${opName(resolver, 'en')} takes 1 damage` }, `side${knife.side}`);
    applyDamage(g, knife, resolver, 1);
  }
  advanceFight(g);
}

/** Skip sides with no dice, auto-strike when the opponent has nothing left to parry, detect the end. */
function advanceFight(g) {
  const f = g.fight;
  if (fightOp(g, 'A').dead || fightOp(g, 'D').dead || (!left(f.A) && !left(f.D))) return finishFight(g);
  if (!left(f[f.turn])) f.turn = other(f.turn);
  if (left(f[other(f.turn)])) return; // a real choice remains
  // Opponent has no dice: a human still chooses (strike or hold back); the computer strikes (crits first).
  if (!isComputer(g, fightChooser(g))) return;
  fightApply(g, fightOptions(g)[0].id);
}

function finishFight(g) {
  const f = g.fight;
  if (f.done) return;
  f.done = true;
  g.ffAtk = null;
  faithRejuvenate(g); // Blessed Rejuvenation (Novitiates)
  const a = fightOp(g, 'A'), d = fightOp(g, 'D');
  archonAfterAction(g, a, f.painBefore || []);
  d.acted.toxinSequence = false;
  if (a.acted.contemptuous) a.acted.contemptUsed = true;
  corsairAfterAction(g, a);
  dwAfterAction(g, a);
  for (const [k, me, foe] of [['A', a, d], ['D', d, a]]) {
    if (me.dead) continue;
    const hits = f.steps.filter((s) => s.side === k && s.act === 'strike' && s.dmg > 0);
    // Soul Gorge (Chosen): it incapacitated the enemy or inflicted Critical Dmg — regains up to D3+1.
    if (tpl(me).soulGorge && (foe.dead || hits.some((s) => s.crit)) && me.wounds < me.maxW) {
      const before = me.wounds; me.wounds = Math.min(me.maxW, me.wounds + d3() + 1);
      log(g, { zh: `${opName(me, 'zh')} 靈魂吞噬：回復 ${me.wounds - before} 生命`, en: `${opName(me, 'en')} Soul Gorge: regains ${me.wounds - before} wounds` }, `side${me.side}`);
    }
    // Siphon Life (fell dagger): a friendly visible within 6" regains 1 per damaging strike (D3 for a critical one).
    if (fightWeapon(g, k).rules.siphon && hits.length) siphonLife(g, me, hits.map((s) => s.crit));
  }
  log(g, {
    zh: `${opName(a, 'zh')} 與 ${opName(d, 'zh')} 近戰：造成 ${f.D.before - d.wounds}，承受 ${f.A.before - a.wounds}`,
    en: `${opName(a, 'en')} fights ${opName(d, 'en')}: dealt ${f.D.before - d.wounds}, took ${f.A.before - a.wounds}`,
  }, `side${a.side}`);
  bladesAfterFight(g, a, d); // Strike and Fade / The Woe (Blades of Khaine)
  broodMark(g, a, d); // Crossfire (Brood Brothers): the enemy fought, if still standing, gains a token
  // Dat All You Got?: after fighting or retaliating, if still standing, inflict D3 damage on the enemy.
  for (const [me, foe] of [[a, d], [d, a]]) {
    if (!tpl(me).datAllYouGot || me.dead || foe.dead) continue;
    const dmg = d3();
    log(g, { zh: `${opName(me, 'zh')}「就這樣？」：${opName(foe, 'zh')} 受到 ${dmg} 傷害`, en: `${opName(me, 'en')} "Dat All You Got?": ${opName(foe, 'en')} takes ${dmg} damage` }, `side${me.side}`);
    applyDamage(g, me, foe, dmg);
    f.datAllYouGot = { side: me === a ? 'A' : 'D', dmg };
  }
  // Savage Brutality (Tzaangor Champion): after its first Fight each activation, a free Fight against any enemy.
  if (tpl(a).savageBrutality && g.active === a.uid && !a.acted.brutalityUsed && !a.dead && engagedEnemies(g, a).length) {
    a.acted.brutalityUsed = true;
    a.acted.free = { ...(a.acted.free || {}), fight: 'any' };
    f.savageNext = true;
  }
  // Swipe (Bloatspawn): a free Fight with the swipe profile against each other enemy in control range.
  if (fightWeapon(g, 'A').rules.swipe && !a.dead && engagedEnemies(g, a).some((e) => !a.acted.swiped?.includes(e.uid))) {
    a.acted.free = { ...(a.acted.free || {}), fight: 'swipe' };
    f.swipeNext = true;
  }
  // Savage Assault: if both are still standing, a free Fight against the same enemy.
  if (f.savage && !a.dead && !d.dead && inEngagement(a, d, g)) {
    a.acted.free = { ...(a.acted.free || {}), fight: d.uid };
    f.savageNext = true;
    log(g, { zh: `${opName(a, 'zh')} 野蠻突擊：可再對 ${opName(d, 'zh')} 免費近戰一次`, en: `${opName(a, 'en')} Savage Assault: may fight ${opName(d, 'en')} again for free` }, `side${a.side}`);
  }
  // Merciless Castigation (Sanctifier Persecutor): its first Fight each activation is followed by a free Fight against the same enemy.
  if (tpl(a).castigation && g.active === a.uid && !a.acted.castigationUsed && !a.dead && !d.dead && inEngagement(a, d)) {
    a.acted.castigationUsed = true;
    a.acted.free = { ...(a.acted.free || {}), fight: d.uid };
    f.savageNext = true;
    log(g, { zh: `${opName(a, 'zh')} 無情懲戒：可再對 ${opName(d, 'zh')} 免費近戰一次`, en: `${opName(a, 'en')} Merciless Castigation: may fight ${opName(d, 'en')} again for free` }, `side${a.side}`);
  }
  sfMiracleMoves(g); // Miracle (Sanctifier Miraculist): the free Dash or Fall Back
  for (const o of g.ops) o.medicShield = false;
}

/** Demolition Job (Wrecka Krew firefight ploy, automatic): after its Shoot / Fight, a Demolition marker on the target if an enemy is within 3" of it. */
function demolitionJob(g, op, target) {
  if (!isWK(op) || !target || op.side > 1 || !living(g, 1 - op.side).some((e) => dist(e, target) - radius(e) <= 3)) return;
  if (!autoFF(g, op.side, 'wkDemolition')) return;
  (g.markers ||= []).push({ id: g.markers.length, kind: 'demolition', owner: op.side, x: target.x, y: target.y, carriedBy: null });
  log(g, { zh: `拆除工作：在 ${opName(target, 'zh')} 身上放拆除標記`, en: `Demolition Job: a Demolition marker on ${opName(target, 'en')}` }, `side${op.side}`);
}

export function endFight(g) {
  g.hatchwayFight = null;
  if (g.fight) for (const [k, other] of [['A', 'D'], ['D', 'A']]) {
    mdFeast(g, fightOp(g, k), fightOp(g, other), g.fight[k].mdDamageDice || 0, autoFF);
  }
  // Obsessive Bloodlust (Goremonger Aspirant, once per TP): after its Fight, out of enemy control range — a free Charge of up to 2".
  const fa = g.fight && getOp(g, g.fight.A.uid);
  if (fa && !fa.dead && g.active === fa.uid && tpl(fa).obsessiveBloodlust && fa.bloodlustTP !== g.tp && !isEngaged(g, fa) && fa.order === 'engage') {
    fa.bloodlustTP = g.tp; fa.acted.free = { ...(fa.acted.free || {}), charge: 'bloodlust' };
    log(g, { zh: `${opName(fa, 'zh')} 執迷的血慾：可以免費衝鋒最多 2"`, en: `${opName(fa, 'en')} Obsessive Bloodlust: may make a free Charge of up to 2"` }, `side${fa.side}`);
  }
  if (fa && g.fight) demolitionJob(g, fa, getOp(g, g.fight.D.uid)); // Demolition Job (Wrecka Krew)
  if (fa) aqDynamic(g, fa); // Dynamic (Aquilon Precursor): a free Dash after a Fight
  g.fight = null;
  // Chaos Cult: a Devotee that incapacitated its enemy in the fight mutates now that the fight is over.
  for (const uid of g.mutateQueue || []) mutate(g, getOp(g, uid), { zh: '使敵人殘廢', en: 'incapacitated an enemy' });
  g.mutateQueue = null;
  if (fa) rtAfterEnemyAction(g, fa, false); // Ratlings: Evade after an enemy Fight
}

/** Computer choice for the current fight die. */
export function fightAutoChoice(g) {
  if (g.fight.rrOpen) fightRerollDone(g); // automatic play skips the human Command Re-roll window
  if (g.fight.done) return null;
  const opts = fightOptions(g);
  if (g.fight.done) return null;
  const f = g.fight, k = f.turn, me = f[k], foe = f[other(k)];
  const meOp = fightOp(g, k), foeOp = fightOp(g, other(k));
  const has = (id) => opts.find((o) => o.id === id);
  const killer = opts.filter((o) => o.act === 'strike' && o.dmg >= foeOp.wounds).sort((x, y) => x.dmg - y.dmg)[0];
  if (killer) return killer.id;
  const fw = fightWeapon(g, other(k));
  const threat = foe.c * fw.dmg[1] + foe.n * normalDmg(fw, meOp);
  if (threat >= meOp.wounds) {
    if (has('parry-n-c')) return 'parry-n-c';
    if (has('parry-c-c')) return 'parry-c-c';
    if (has('parry-n-n')) return 'parry-n-n';
    if (has('parry-c-n') && me.c > 1) return 'parry-c-n';
  }
  return (has('strike-c') || has('strike-n')).id;
}

/** Resolve a whole fight automatically (AI vs AI, simulations). */
export function resolveFight(g, op, weapon, target) {
  if (!startFight(g, op, weapon, target)) return null; // (refused, or cancelled by Commanding Declamation)
  while (!g.fight.done) fightApply(g, fightAutoChoice(g));
  const f = g.fight;
  endFight(g);
  return f;
}
