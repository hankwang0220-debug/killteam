// Shot analyser for new players: walks through the core shooting checks (visible, intervening,
// cover, valid target, shooting into melee, range, obscured) for one shooter and one target, in plain
// words, with links to the matching Can I Shoot It? page. The core walk-through uses the plain
// terrain geometry; the final verdict always comes from the game's own shootCheck, so team rules,
// ploys, equipment and smoke that change the answer are flagged instead of being explained wrong.
import { flatSight, sightParts, sightBlockers } from './sight.js';
import { radius, edgeDist, inEngagement, isEngaged, living, shootCheck, visibility, weaponsFor } from './game.js';

const SITE = 'https://canishoot.it/';
export const CIS = {
  visibility: SITE + 'rules/basics/visibility',
  intervening: SITE + 'rules/basics/intervening',
  control: SITE + 'rules/basics/control-range',
  cover: SITE + 'rules/shooting/cover',
  obscured: SITE + 'rules/shooting/obscured',
  shoot: SITE + 'rules/shooting/shoot',
  mistakes: SITE + 'common-mistakes',
};

const T = (zh, en) => ({ zh, en });
const inch = (n) => `${Math.max(0, n).toFixed(1)}"`;

/** Ranged weapons the analyser can pick from (special set-up weapons left out). */
export const analyserWeapons = (g, op) => weaponsFor(g, op).filter((w) => w.type === 'ranged' && !w.rules.detonate && !w.rules.wkExplosive);

/**
 * Explain whether `a` can shoot `b` with `w`.
 * Returns { steps, verdict, geo } — steps: [{ id, state:'ok'|'bad'|'warn'|'info', title, text, link }],
 * verdict: { ok, cover, obscured, title, text }, geo: drawing data for the board.
 */
export function explainShot(g, a, b, w) {
  // An operative that hasn't activated yet picks its order when it does: judge it as if it picks Engage.
  const undecided = b.side !== a.side && a.order === 'conceal' && !w?.rules.silent
    && (g.phase !== 'firefight' || (a.ready && !(g.active === a.uid && a.orderSet)));
  // Likewise an operative that isn't the one activating has no AP right now: judge it as if it had some.
  const planning = g.phase !== 'firefight' || g.active !== a.uid;
  if (!undecided && !planning) return explain(g, a, b, w, false);
  const saved = { order: a.order, ap: a.ap };
  if (undecided) a.order = 'engage';
  if (planning) a.ap = Math.max(a.ap || 0, 9);
  try { return explain(g, a, b, w, undecided); } finally { a.order = saved.order; a.ap = saved.ap; }
}

function explain(g, a, b, w, assumeEngage) {
  const ra = radius(a), rb = radius(b), gap = edgeDist(a, b);
  const steps = [];
  const add = (id, state, title, text, link) => steps.push({ id, state, title, text, link });
  const base = flatSight(g.terrain, a, b, ra, rb, {});
  const geo = { a: { x: a.x, y: a.y, r: ra }, b: { x: b.x, y: b.y, r: rb }, visible: base.visible };

  if (b.side === a.side) {
    add('side', 'bad', T('同一方', 'Same side'), T('只能射擊敵方特工。請點一名敵人當目標。', 'You can only shoot enemy operatives. Tap an enemy as the target.'), CIS.shoot);
    return { steps, verdict: { ok: false, title: T('不能射擊', 'Can\'t shoot'), text: T('目標是友方。', 'The target is friendly.') }, geo };
  }

  // 1. The shooter itself.
  if (assumeEngage) add('order', 'info', T('射手還沒啟動（目前 ◐ 隱蔽）', 'Shooter hasn\'t activated yet (◐ Conceal now)'),
    T('指令是在特工啟動時才選的。以下假設它啟動時選 ⚔ 交戰——隱蔽指令不能射擊（無聲武器除外）。', 'Orders are picked when an operative activates. Below assumes it picks ⚔ Engage — a Concealed operative can\'t Shoot (except with Silent weapons).'), CIS.mistakes);
  else if (a.order === 'conceal') {
    add('order', w?.rules.silent ? 'ok' : 'bad', T('射手的指令：◐ 隱蔽', 'Shooter\'s order: ◐ Conceal'),
      w?.rules.silent ? T('隱蔽指令下只能用「無聲」武器射擊——這把武器是無聲的，可以。', 'On Conceal only Silent weapons can Shoot — this one is Silent, so it can.')
        : T('隱蔽指令的特工不能執行射擊（無聲武器除外）。指令是在啟動開始時選的，要射擊就得在啟動時選 ⚔ 交戰。', 'A Concealed operative can\'t Shoot (except with Silent weapons). Orders are picked when it activates: choose ⚔ Engage to shoot.'), CIS.mistakes);
  } else add('order', 'ok', T('射手的指令：⚔ 交戰', 'Shooter\'s order: ⚔ Engage'), T('交戰指令可以射擊。', 'An Engaged operative can Shoot.'), CIS.shoot);
  if (isEngaged(g, a)) add('engaged', 'bad', T('射手正在近戰中', 'Shooter is in melee'),
    T('射手在敵人的控制範圍（1"）內，通常不能射擊，要先撤退或近戰。', 'The shooter is within an enemy\'s control range (1"): normally it can\'t Shoot — Fall Back or Fight first.'), CIS.control);

  // 2. Visible.
  if (!base.visible) {
    geo.blockers = sightBlockers(g.terrain, a, b);
    add('visible', 'bad', T('看不見目標', 'Target not visible'),
      T('從射手頭部看過去，目標整個模型都被實心的重型地形擋住。只要能看到模型任何一部分（底座不算）就算可見；本遊戲是平面棋盤，以實心重型牆代表擋住視線。', 'Looking from the shooter\'s head, the whole target model is hidden behind solid heavy terrain. Seeing any part of the model (not the base) is enough; on this flat board, solid heavy walls stand in for blocked sight.'), CIS.visibility);
  } else add('visible', 'ok', T('看得見目標', 'Target visible'),
    T('射手能看到目標模型的一部分（看到一點點就夠，底座不算）。', 'The shooter can see part of the target model (a sliver is enough; the base doesn\'t count).'), CIS.visibility);

  let cover = false, obscured = false;
  if (base.visible) {
    // 3. Intervening — from the origin point the shooter would pick (the best one for the attacker).
    const sp = sightParts(g.terrain, base.origin, a, b, ra, rb);
    geo.origin = base.origin; geo.cone = sp.cone; geo.parts = sp.parts.map((p) => ({ poly: p.poly, kind: p.t.kind, nearTarget: p.nearTarget, farBoth: p.farBoth }));
    const moved = Math.hypot(base.origin.x - a.x, base.origin.y - a.y) > 1e-6;
    const kinds = [...new Set(sp.parts.map((p) => p.t.kind))];
    const kindName = (k) => (k === 'heavy' ? T('重型', 'heavy') : T('輕型', 'light'));
    add('intervening', sp.parts.length ? 'info' : 'ok', T('介於其間的地形', 'Intervening terrain'),
      sp.parts.length
        ? T(`從射手底座${moved ? '邊緣' : '中心'}的一點（白點）畫線到目標底座朝向射手的半邊（扇形區），有 ${sp.parts.length} 塊地形（${kinds.map((k) => kindName(k).zh).join('、')}）被線穿過，算「介於其間」。射手可以挑底座上任何一點來畫線，程式已幫你挑對射手最有利的一點。`,
          `Lines from one point of the shooter's base (${moved ? 'its edge' : 'its centre'}, white dot) to the half of the target's base facing it (the fan) cross ${sp.parts.length} terrain piece(s) (${kinds.map((k) => kindName(k).en).join(', ')}): they are intervening. The shooter may pick any point of its base; the best one for the attacker is used.`)
        : T(`射手從底座${moved ? '邊緣' : '中心'}的一點（白點）畫線，可以完全繞過地形——沒有地形介於其間，是乾淨的射擊。`, `From one point of its base (${moved ? 'its edge' : 'its centre'}, white dot) the shooter's lines miss all terrain — nothing intervenes, a clear shot.`), CIS.intervening);

    // 4. Cover.
    const near1 = sp.parts.filter((p) => p.nearTarget);
    if (sp.close && near1.length) add('cover', 'info', T('掩護：2" 內無效', 'Cover: cancelled within 2"'),
      T(`介於其間的地形在目標 1" 內，但雙方底座只距離 ${inch(gap)}（2" 以內），所以目標不算在掩護中。靠近到 2" 內就能取消敵人的掩護。`, `Intervening terrain is within 1" of the target, but the bases are only ${inch(gap)} apart (within 2"), so the target isn't in cover. Getting within 2" cancels cover.`), CIS.cover);
    else if (near1.length) { cover = true; add('cover', 'warn', T('目標在掩護中', 'Target is in cover'),
      T('介於其間的地形有一部分在目標底座 1" 內 → 目標「在掩護中」。被射擊時防守方可以不擲、直接保留 1 顆普通成功（掩護豁免）。', 'Part of the intervening terrain is within 1" of the target\'s base, so it is in cover: when shot, the defender may keep one normal save without rolling it.'), CIS.cover); }
    else add('cover', 'ok', T('目標不在掩護中', 'Target not in cover'),
      sp.parts.length ? T('介於其間的地形都離目標超過 1"，所以不算掩護。注意：目標旁邊有地形不代表有掩護，要看那塊地形有沒有擋在射線上。', 'The intervening terrain is all more than 1" from the target, so no cover. Terrain next to the target only counts if it is in the way of this shot.')
        : T('沒有地形擋在射線上，就算目標緊貼著地形也沒有掩護——射手繞過去了。', 'Nothing is in the way of the lines, so no cover — even if the target hugs terrain, the shooter got around it.'), CIS.cover);

    // 7 (computed now). Obscured.
    const far = sp.parts.filter((p) => p.farBoth && p.t.kind === 'heavy');
    const heavyNear = sp.parts.filter((p) => p.t.kind === 'heavy' && !p.farBoth);
    obscured = far.length > 0;
    geo.rings = obscured || heavyNear.length;
    const obscuredText = obscured
      ? T('有重型地形介於其間，而且那部分距離射手與目標的底座都超過 1"（看虛線圈）→ 目標「被遮擋」：攻擊方的暴擊都變普通成功，再棄掉 1 顆成功。', 'Intervening heavy terrain has a part more than 1" from both bases (see the dashed rings): the target is obscured — the attacker\'s crits become normal successes, then one success is discarded.')
      : heavyNear.length ? T('雖然有重型地形介於其間，但它在射手或目標的 1" 內（虛線圈），所以不算遮擋。貼近重型地形射擊或躲在它旁邊，就能避免遮擋。', 'Heavy terrain intervenes, but within 1" of the shooter or target (dashed rings), so it doesn\'t obscure. Shooting from right next to heavy terrain, or hiding right behind it, avoids obscuring.')
        : T('沒有重型地形介於其間，不會被遮擋（輕型地形只提供掩護，不會遮擋）。', 'No heavy terrain intervenes, so nothing obscures (light terrain only gives cover).');
    const both = cover && obscured && base.defenceOptions.length > 1;
    const obscuredStep = [obscured ? 'warn' : 'ok', obscured ? T('目標被遮擋', 'Target is obscured') : T('沒有遮擋', 'Not obscured'),
      both ? T(obscuredText.zh + ' 同一塊地形同時給掩護與遮擋時只能擇一（程式幫防守方選較有利的）；不同地形則兩者都有。', obscuredText.en + ' One terrain piece giving both cover and obscuring means the defender picks one (chosen for them); different pieces give both.') : obscuredText];

    // 5. Valid target (orders).
    const coverForTarget = cover;
    if (b.order === 'conceal') {
      if (coverForTarget) add('valid', 'bad', T('目標：◐ 隱蔽＋掩護 → 不是有效目標', 'Target: ◐ Concealed + in cover → not a valid target'),
        T('隱蔽指令的特工只要在掩護中就不能被選為目標——這就是隱蔽的最大好處。想射它：換個角度讓地形不再介於其間、靠近到 2" 內，或等它改成交戰指令。', 'A Concealed operative in cover can\'t be picked as a target — that is the whole point of Conceal. To shoot it: change angle so the terrain no longer intervenes, get within 2", or wait for it to go Engaged.'), CIS.shoot);
      else add('valid', 'ok', T('目標：◐ 隱蔽，但沒有掩護', 'Target: ◐ Concealed, but not in cover'),
        T('隱蔽的特工沒有掩護時仍是有效目標（看得見即可）。', 'A Concealed operative without cover is still a valid target (it just has to be visible).'), CIS.shoot);
    } else add('valid', 'ok', T('目標：⚔ 交戰 → 有效目標', 'Target: ⚔ Engaged → valid target'),
      T(`交戰指令的特工只要看得見就是有效目標；掩護不會讓它無法被選，${cover ? '只會給它一顆掩護豁免。' : '它目前也沒有掩護。'}`, `An Engaged operative is a valid target as long as it is visible; cover doesn't stop it being picked${cover ? ', it only grants a cover save.' : ' (and it has none here).'}`), CIS.shoot);

    // 6. Shooting into melee.
    const friends = living(g, a.side).filter((f) => f !== a && inEngagement(f, b, g));
    if (friends.length) add('melee', 'bad', T('不能射入近戰', 'No shooting into melee'),
      T('有友方特工在目標的控制範圍（1"）內，一般不能選它為射擊目標。少數隊伍能力（例如無情效率）可以例外。', 'A friendly operative is within the target\'s control range (1"), so it normally can\'t be picked. A few team rules override this.'), CIS.mistakes);

    // Range.
    const rng = w?.rules.range;
    if (rng != null) add('range', gap <= rng + 0.01 ? 'ok' : 'bad', T(`射程 ${rng}"`, `Range ${rng}"`),
      gap <= rng + 0.01 ? T(`底座邊緣距離 ${inch(gap)}，在射程內。`, `Base-to-base distance ${inch(gap)}: in range.`) : T(`底座邊緣距離 ${inch(gap)}，超出這把武器的 ${rng}" 射程。`, `Base-to-base distance ${inch(gap)}: beyond this weapon's ${rng}" range.`), null);
    else add('range', 'ok', T('射程', 'Range'), T(`這把武器沒有射程限制（距離 ${inch(gap)}）。`, `This weapon has no range limit (distance ${inch(gap)}).`), null);

    add('obscured', ...obscuredStep, CIS.obscured);
    if (w?.rules.seek || w?.rules.seekLight) add('seek', 'info', T('武器規則：搜尋', 'Weapon rule: Seek'),
      w.rules.seek ? T('「搜尋」：選目標時忽略所有地形掩護，所以隱蔽的特工躲在掩護後也能被選中。', 'Seek: cover is ignored when picking targets, so Concealed operatives behind cover can still be picked.')
        : T('「輕型搜尋」：選目標時忽略輕型地形的掩護。', 'Seek Light: light-terrain cover is ignored when picking targets.'), CIS.shoot);
    if (w?.rules.saturate && cover) add('saturate', 'info', T('武器規則：飽和', 'Weapon rule: Saturate'),
      T('「飽和」：目標仍算在掩護中（選目標時照算），但防守方不能保留掩護豁免。', 'Saturate: the target still counts as in cover for picking targets, but can\'t keep the cover save.'), CIS.cover);
  }

  // Final word: the game's own rules (team abilities, ploys, equipment, smoke…).
  const real = w ? shootCheck(g, a, b, w) : { ok: false };
  const coreBad = steps.some((s) => s.state === 'bad');
  if (!w) add('weapon', 'bad', T('沒有遠程武器', 'No ranged weapon'), T('這名特工沒有可以射擊的遠程武器。', 'This operative has no ranged weapon to shoot.'), null);
  const smoked = base.visible && (g.smoke?.length > 0) && visibility(g, a, b).obscured && !obscured;
  if (smoked) add('smoke', 'warn', T('煙霧', 'Smoke'), T('射手或目標在煙霧中（距離超過 2"）：目標被遮擋。', 'The shooter or target is in smoke (more than 2" apart): the target is obscured.'), CIS.obscured);
  let special = null;
  if (w && real.ok === coreBad) special = real.ok
    ? T('雖然一般規則不允許，但隊伍能力、計謀或裝備讓這次射擊可以進行。', 'The core rules say no, but a team ability, ploy or equipment lets this shot happen.')
    : T('一般規則允許，但隊伍能力、計謀、裝備或本次啟動已做過的動作讓這次射擊無法進行（例如武器限用、重型武器移動過、目標的隱匿能力）。', 'The core rules allow it, but a team ability, ploy, equipment or something done this activation stops it (e.g. a Limited weapon, a Heavy weapon after moving, the target\'s stealth ability).');
  else if (w && real.ok && (!!real.cover !== cover || !!real.obscured !== (obscured || smoked))) special = T('隊伍能力或計謀改變了掩護／遮擋（例如無視遮擋的光學瞄具、隱身裝置）。最後擲骰以下方結果為準。', 'A team ability or ploy changes cover / obscuring (e.g. optics that ignore obscuring, stealth fields). The dice use the result below.');
  if (special) add('special', 'warn', T('特殊規則', 'Special rules'), special, null);

  const ok = !!real.ok;
  const verdict = ok
    ? { ok, cover: !!real.cover, obscured: !!real.obscured, title: T('可以射擊', 'Can shoot'),
      text: real.cover && real.obscured ? T('目標有掩護也被遮擋。', 'The target is in cover and obscured.') : real.cover ? T('目標有掩護（保留 1 顆豁免）。', 'The target is in cover (keeps one save).') : real.obscured ? T('目標被遮擋（暴擊變普通，再棄 1 顆成功）。', 'The target is obscured (crits become normal, one success discarded).') : T('乾淨的射擊：沒有掩護也沒有遮擋。', 'A clean shot: no cover, not obscured.') }
    : { ok, title: T('不能射擊', 'Can\'t shoot'), text: (steps.find((s) => s.state === 'bad') || steps.find((s) => s.id === 'special'))?.title || T('這不是合法目標。', 'Not a legal target.') };
  return { steps, verdict, geo };
}
