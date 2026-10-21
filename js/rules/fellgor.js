// fellgor: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CHOICES, CONTROL, applyDamage, autoFF, canActivateOp, d3, edgeDist, foes, getOp, isEngaged, living, log, needChoice, opName, radius, spend, tpl, visibility } from '../game.js';
import { dist } from '../geometry.js';
import { bestStep, stepTo } from '../sanctifiers.js';

// ---------- Fellgor Ravagers (the rules added with the full roster) ----------
export const isFG = (op) => op?.team === 'fellgor';
/** Fellgor self actions: Sagacious (change order), Uncompromising Attack (free Fight + free autopistol Shoot), Cleaver Flurry. */
export function fgSelf(g, op, id) {
  if (id === 'fgSagacious') { op.order = op.order === 'conceal' ? 'engage' : 'conceal'; op.acted.fgSagacious = 1; log(g, { zh: `${opName(op, 'zh')} 睿智：改為${op.order === 'engage' ? '交戰' : '隱蔽'}指令`, en: `${opName(op, 'en')} Sagacious: now ${op.order === 'engage' ? 'Engage' : 'Conceal'}` }, `side${op.side}`); return true; }
  if (id === 'fgUncomp') {
    spend(g, op, id); op.acted.fgUncomp = true; op.acted.free = { ...(op.acted.free || {}), fight: 'any', shoot: 'any' };
    log(g, { zh: `${opName(op, 'zh')} 毫不妥協的攻擊：免費近戰一次、免費用自動手槍射擊一次（交戰中也能射擊控制範圍內的敵人）`, en: `${opName(op, 'en')} Uncompromising Attack: a free Fight and a free autopistol Shoot (it can shoot an enemy in its control range while engaged)` }, `side${op.side}`);
    return true;
  }
  if (id === 'fgFlurry') {
    spend(g, op, id); op.acted.fgFlurry = 1; op.acted.free = { ...(op.acted.free || {}), reposition: 'flurry' };
    log(g, { zh: `${opName(op, 'zh')} 劈刀亂舞：免費轉移（多 2"），經過的敵人控制範圍內各受 D3+1 傷害`, en: `${opName(op, 'en')} Cleaver Flurry: a free Reposition (2" further); each enemy it moved within control range of takes D3+1` }, `side${op.side}`);
    return true;
  }
  return false;
}
/** Cleaver Flurry: after the move, D3+1 to each enemy whose control range the path went through (in the order it reached them). */
export function fgFlurryHits(g, op, pts) {
  op.acted.fgFlurry = 2;
  const hit = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(dist(a, b) / 0.1));
    for (let k = 0; k <= n; k++) {
      const p = { x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n };
      for (const e of foes(g, op)) if (!hit.includes(e) && e.x > -50 && dist(p, e) - radius(op) - radius(e) <= CONTROL + 0.01) hit.push(e);
    }
  }
  for (const e of hit) { if (e.dead) continue; const dmg = d3() + 1; log(g, { zh: `劈刀亂舞：${opName(e, 'zh')} 受到 ${dmg} 傷害`, en: `Cleaver Flurry: ${opName(e, 'en')} takes ${dmg} damage` }, `side${op.side}`); applyDamage(g, op, e, dmg); }
}
/** Bloodsense (firefight ploy, automatic): a kill in its control range during its activation lets a nearby ready friend activate next. */
export function fgBloodsense(g, src, target) {
  if (!isFG(src) || src.side === target.side || g.active !== src.uid || src.counter || src.wcHerd || edgeDist(src, target) > CONTROL + 0.01) return;
  const next = living(g, src.side).filter((o) => o !== src && isFG(o) && canActivateOp(g, o) && edgeDist(o, target) <= 3 && visibility(g, target, o).visible).sort((a, b) => b.wounds - a.wounds)[0];
  if (next && autoFF(g, src.side, 'bloodsense')) { src.wcHerd = next.uid; log(g, { zh: `嗜血感知：${opName(next, 'zh')} 接著啟動`, en: `Bloodsense: ${opName(next, 'en')} activates next` }, `side${src.side}`); } // (the same chain as Mutant Herd)
}
/** Call the Attack (Ironhorn strategic gambit): a friendly within 6" and everyone within 2" of it make free Dashes. */
export function fgCallMovers(g, side, ctx) { const a = getOp(g, ctx.anchor); return a ? living(g, side).filter((o) => isFG(o) && o.x > -50 && !isEngaged(g, o) && (o === a || (edgeDist(o, a) <= 2 && visibility(g, a, o).visible))) : []; }
export function registerFellgorChoices() {
  const ironhorn = (g, side) => living(g, side).find((o) => tpl(o).callAttack && !o.frenzy && o.x > -50);
  CHOICES.fgCallAnchor = {
    kind: 'op', title: { zh: '號令進攻：選一名鐵角首領 6" 內看得到的友方（它和它 2" 內的友方免費衝刺）', en: 'Call the Attack: pick a friendly visible within 6" of the Ironhorn (it and friendlies within 2" of it make free Dashes)' },
    skippable: true, none: () => {},
    options: (g, side) => { const h = ironhorn(g, side); return h ? living(g, side).filter((o) => isFG(o) && o.x > -50 && (o === h || (edgeDist(o, h) <= 6 && visibility(g, h, o).visible))).map((o) => ({ value: o.uid })) : []; },
    auto: (g, side) => { const h = ironhorn(g, side); if (!h) return null; const c = living(g, side).filter((o) => isFG(o) && o.x > -50 && !isEngaged(g, o) && (o === h || (edgeDist(o, h) <= 6 && visibility(g, h, o).visible))); return c.sort((a, b) => fgCallMovers(g, side, { anchor: b.uid }).length - fgCallMovers(g, side, { anchor: a.uid }).length)[0]?.uid ?? null; },
    apply: (g, side, uid) => needChoice(g, side, 'fgCallMoves', { anchor: uid }),
  };
  CHOICES.fgCallMoves = {
    kind: 'move', title: { zh: '號令進攻：免費衝刺', en: 'Call the Attack: free Dashes' },
    movers: fgCallMovers, moveKind: () => 'dash', max: () => 3,
    autoAll(g, side, ctx) {
      for (const o of fgCallMovers(g, side, ctx)) {
        const es = foes(g, o).filter((e) => e.x > -50), near = (p) => Math.min(...es.map((e) => dist(e, p)));
        if (!es.length) return;
        const q = bestStep(g, o, 3, 'dash', (p) => (near(p) < near(o) ? -near(p) : null));
        if (q) { stepTo(g, o, q); log(g, { zh: `號令進攻：${opName(o, 'zh')} 免費衝刺`, en: `Call the Attack: ${opName(o, 'en')} makes a free Dash` }, `side${side}`); }
      }
    },
  };
}
