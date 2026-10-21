// exaction: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CHOICES, CONTROL, autoFF, avgDmg, canActivateOp, edgeDist, engagedEnemies, ffArmed, ffReady, forcedShot, inEngagement, isEngaged, living, log, needChoice, opName, shootCheck, shootWeapon, tpl, weaponsFor } from '../game.js';
import { EX_PATTERNS } from '../data/exaction.js';

// ---------- Exaction Squad (the rules added with the full roster) ----------
/** Attack Patterns (R-VR Cyber-mastiff): two of Aggressive / Swift / Defensive (Aggressive + Swift until picked in TP1). */
export const exPattern = (op, id) => !!tpl(op).attackPatterns && (op.patterns || ['aggressive', 'swift']).includes(id);
export const EX_PAIRS = [['aggressive', 'swift'], ['aggressive', 'defensive'], ['swift', 'defensive']];
/** Brutal Backup: other friendlies within control range of an enemy that is within this operative's control range. */
export const exBackups = (g, op) => living(g, op.side).filter((f) => f !== op && f.team === 'exaction' && engagedEnemies(g, op).some((e) => inEngagement(f, e, g))).sort((a, b) => b.wounds - a.wounds);
export const exPairName = (p) => ({ zh: p.map((id) => EX_PATTERNS[id].name.zh).join('＋'), en: p.map((id) => EX_PATTERNS[id].name.en).join(' + ') });
/** Exaction self actions: R-VR Command (change one Attack Pattern), Handler (the Cyber-mastiff activates with it, here straight after). */
export function exSelf(g, op, id) {
  if (id === 'exRvr') { op.acted.exRvr = 1; needChoice(g, op.side, 'exPatterns', { rvr: true }); return true; }
  if (id === 'exHandler') {
    const m = living(g, op.side).find((o) => tpl(o).attackPatterns && canActivateOp(g, o));
    if (!m) return false;
    op.acted.exHandler = 1; op.wcHerd = m.uid; // (the same chain as Mutant Herd: it activates when this one is expended)
    log(g, { zh: `馴犬師：${opName(m, 'zh')} 跟著一起啟動（這裡在它之後）`, en: `Handler: ${opName(m, 'en')} activates with it (here, straight after)` }, `side${op.side}`);
    return true;
  }
  return false;
}
/** Exact Punishment (firefight ploy, automatic): a friendly shot from within 6" and still standing shoots back at that enemy. */
export function exPunish(g, shooter, target) {
  if (!target || target.dead || target.side > 1 || shooter.side === target.side || shooter.dead || target.team !== 'exaction' || edgeDist(shooter, target) > 6) return;
  if (!ffReady(g, target.side, 'exactPunishment') || !ffArmed(g, target.side, 'exactPunishment') || isEngaged(g, target)) return;
  const keep = { ap: target.ap, acted: target.acted }; target.ap = 1; target.acted = {};
  const w = weaponsFor(g, target).filter((x) => x.type === 'ranged' && shootWeapon(g, target, x).ok && shootCheck(g, target, shooter, x).ok).sort((a, b) => avgDmg(b) - avgDmg(a))[0];
  target.ap = keep.ap; target.acted = keep.acted;
  if (!w || !autoFF(g, target.side, 'exactPunishment')) return;
  log(g, { zh: `精確懲處：${opName(target, 'zh')} 對 ${opName(shooter, 'zh')} 還擊`, en: `Exact Punishment: ${opName(target, 'en')} shoots back at ${opName(shooter, 'en')}` }, `side${target.side}`);
  forcedShot(g, target, w, [shooter], true);
}
export function registerExactionChoices() {
  CHOICES.exPatterns = {
    kind: 'option', title: { zh: '攻擊模式：機械獒犬的兩種模式', en: 'Attack Pattern: the Cyber-mastiff\'s two patterns' },
    options: () => EX_PAIRS.map((p) => ({ value: p.join('+'), label: exPairName(p) })),
    // The computer keeps Aggressive + Swift, or Defensive in place of Swift once the mastiff is in a fight.
    auto: (g, side) => { const m = living(g, side).find((o) => tpl(o).attackPatterns); return m && isEngaged(g, m) ? 'aggressive+defensive' : 'aggressive+swift'; },
    apply(g, side, v) {
      for (const m of living(g, side).filter((o) => tpl(o).attackPatterns)) m.patterns = v.split('+');
      log(g, { zh: `攻擊模式：${exPairName(v.split('+')).zh}`, en: `Attack Pattern: ${exPairName(v.split('+')).en}` }, `side${side}`);
    },
  };
}

// ---------- Exaction Squad ----------
/** Nuncio-aquila: an enemy within 3" of the Proctor-exactant (it carries the marker in this version). */
export const nuncioNear = (g, op) => op.side < 2 && living(g, 1 - op.side).some((p) => tpl(p).nuncio && edgeDist(p, op) <= 3);
/** Scrapcode Overload (Hunter Clade firefight ploy): an enemy within 3" of that Infiltrator (marker control only). */
export const scrapNear = (g, op) => op.side < 2 && living(g, 1 - op.side).some((p) => g.scrapcode?.[p.side] === p.uid && edgeDist(p, op) <= 3);
/** Apprehend: the Cyber-mastiff holds this enemy while it stays within its control range. */
export const apprehended = (g, op) => op.side < 2 && living(g, 1 - op.side).some((m) => m.apprehend === op.uid && edgeDist(m, op) <= CONTROL + 0.01);
/** Apprehend / Castigator's Arrest (the only enemy in the Castigator's control range): can't Fall Back. */
export const arrested = (g, op) => apprehended(g, op)
  || (op.side < 2 && living(g, 1 - op.side).some((c) => tpl(c).arrest && edgeDist(c, op) <= CONTROL + 0.01 && engagedEnemies(g, c).length === 1));
