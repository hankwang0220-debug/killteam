# Kill Team Tactics（殺戮小隊戰術模擬器）

A browser-based (PWA) Kill Team–style skirmish game. Two players can play on one device, or one player can play against the computer. The interface is available in Traditional Chinese and English.

> This is an unofficial fan project. The rules are a simplified version of Kill Team. The teams, names, and ability wording are original archetypes.

## Deathwatch

Deathwatch is selectable as a playable five-operative team using the linked official online datacards. Choose any five of its eleven specialists, with no duplicates and at most one GRAVIS operative. A Watch Sergeant is optional and grants a fifth equipment choice. Collector notes and Seek & Destroy / Security Tac Ops are included.

The implementation includes Veteran Astartes, selected Special Issue Ammunition, strategy and firefight ploys, all four faction equipment options and specialist abilities. Some optional rules follow the simulator's automatic handling: initial sword blocks, Digital Weapons, the Sergeant's first free ploys, failed-die anti-xenos re-rolls, pre-activation cuff cleansing and Guard interruptions. Guard automatically shoots the triggering enemy, or fights it when engaged. The Marksman's Close Quarters re-Guard applies only when a mission enables Close Quarters; current maps are flat, so the Headtaker's vertical movement rules have no effect. Current datacard text takes precedence over historical errata entries in the PDF.

Run the Deathwatch checks with `node tests/deathwatch.mjs`; they cover selection, costs, counteractions, ammo, abilities, equipment and complete battles with several rosters.

## Mandrakes

曼德拉（Mandrakes）已加入選隊與對戰，依使用者提供的 January 2026 官方 PDF 匯入六種特工、武器數值、四項策略計謀、四項交戰計謀與四項陣營裝備。預設九人為一名 Nightfiend、四名各不重複的專家與四名 Warrior；每個專家名額可改為 Warrior。一盒成軍／目前可購買的資訊依使用者提供，次要任務為 Recon / Infiltration。

Soulstrike uses the target's current APL for defence (results at most APL succeed, 1 critical, 6 fail), including re-rolls. Shadow Passage, portal travel, Umbral Entities, Balefire, Soul Harvest, Oubliex, Projection and the equipment are integrated with combat. Shadow is based on Heavy terrain and portal markers on the current flat maps; there is no Vantage/height simulation. Optional reactions use automatic recipients and destinations. Haunting Focus automatically marks the nearest enemy and interrupts only when the Dirgemaw can immediately attack it. Weave Darkness uses a visible operative's location as its smoke destination. These simulator choices are also described in the operative/ploy cards.

Run `node tests/mandrakes.mjs` to check official stats, roster replacements, Soulstrike versus Hardy, shadow saves/Piercing, teleport restrictions/portals, Balefire, Projection, smoke, Soul Harvest, Oubliex, terrain phasing, activation interruption and complete AI battles.

## Running it

You don't need to install Node.js. Start the static server with PowerShell:

```bash
powershell -ExecutionPolicy Bypass -File killteam/serve.ps1
```

Then open http://localhost:4100/. On a phone, use the browser's "Add to Home Screen" option to install it as an app; it also works offline.

## Features

- A 30"×22" killzone with heavy terrain (blocks movement and line of sight) and light terrain (provides cover)
- 4 Turning Points, an initiative roll, CP, and strategy ploys
- Alternating activations, Engage/Conceal orders, and APL-based actions
- Movement uses automatic pathfinding around obstacles and retains freely chosen legal endpoints while rounding up the total movement cost (moving 0.3 inches costs 1 inch; moving 1.3 inches costs 2). A move may pass through engagement range but cannot end inside it (except a Charge). Clicking too far stops at a legal endpoint within the allowance. An invalid landing shows the base outline, blocking terrain/operatives, and the clearance reason
- Shooting: visibility to any part of the target, cover (terrain within 1" of the target), heavy terrain obscuring, defence dice equal to the DEF stat, and save allocation that is optimised automatically
- Fighting: both sides roll, then players alternate choosing Strike or Parry for each die (the computer chooses for its own side)
- Weapon rules: Piercing, Piercing Crits, Lethal, Balanced, Ceaseless, Rending, Brutal, Heavy, Range
- Injured state, objective control (by total APL), objective VP, and kill VP
- Simple AI opponent, autosave, and a quick rules reference
- Replays: every step is recorded and can be reviewed step by step (log, dice, movement trails); the last 10 finished games are kept
- Measuring tool (right-click / Esc / left-click, or the 📏 button on touch screens)

Run `node tests/movement.mjs` to check base clearance, rounded movement costs, preview/confirmation consistency, wire costs, movement limits and complete AI battles. Distance-free placement abilities such as Shadow Passage retain their own destination rules; the measuring tool still measures fractional distances.

Every landing base must clear both Heavy and Light cover and all living operative bases, including friendly and enemy units. Ordinary movement checks the entire swept base footprint; flying and terrain-phasing abilities retain their traversal exceptions but require a clear landing. Deployment and NPO spawning never force an overlapping placement when space is unavailable, and mutations cannot enlarge a base into cover or another unit.

## File structure

| File | Purpose |
|---|---|
| `js/data/teams.js` | Team, operative, weapon, and ploy data (**add or edit teams here**) |
| `js/data/eldar.js` | Hand of the Archon and Corsair Voidscarred rosters, loadouts, equipment and collector notes |
| `js/archon.js` / `js/corsair.js` | Pain tokens, combat drugs, psychic actions, free actions and team reactions |
| `js/game.js` | Game state, game flow, and the rules engine (line of sight, dice, combat) |
| `js/path.js` | A* pathfinding and movement validation |
| `js/sight.js` | Flat-board model visibility and intervening base fans for cover and obscuring |
| `js/ai.js` | Computer opponent and NPO behaviours |
| `js/missions.js` | Missions: maps, drop zones, markers, NPO decks, mission actions and scoring |
| `js/board.js` | SVG board rendering |
| `js/replay.js` | Replay recording, playback state and the archive of finished games |
| `js/main.js` | UI and interaction |
| `js/help.js` | Rules reference text |
| `sw.js` / `manifest.webmanifest` | PWA offline support and installation |

## Adding a team

Murderwing (屠戮之翼) is defined in `js/data/murderwing.js`, with its runtime in `js/murderwing.js`. It fields a Chaos Lord and five operatives, allows repeated Raptors, and validates the combined two-operative plasma-pistol/meltagun/plasma-gun limit. The linked official PDF includes the August 2026 boosted Charge cap of 6 inches. Purchase and box notes follow the user-provided information.

This flat-board implementation treats a whole Reposition, Fall Back or Charge during an activation as a boost; Dash and counteraction moves remain ordinary movement. Paid boost actions automatically select a target when spare AP are available, prioritising operative abilities over Bladefins. Challenge selects the nearest enemy and grants Severe; Damnation automatically attempts the first eligible boon per action. Warp Fuel pursuit and Long Forgotten Honour select legal destinations automatically. There are no heights/Vantage floors or close-quarters rooms, so Murderous Descent and height-based ploy conditions are inactive; Warp Talons use ordinary deployment rather than optional warp reserve. Run `node tests/murderwing.mjs` for roster limits, loadouts, movement, boons, abilities, equipment, ploys and four seeded complete battles.

Add an object to `TEAMS` in `js/data/teams.js` with `ops`, `ploys`, and `rule`. Weapons support the rule keys listed at the top of that file. Special team abilities are handled by the `effectiveRules()` function in `js/game.js` (or by a dedicated function).

## Eldar teams

Hand of the Archon and Corsair Voidscarred (虛空之痕海盜) each field 9 operatives. Setup supports weapon choices, faction equipment, and Corsair warrior/heavy-gunner replacements. Official PDF links and the supplied purchase/rotation notes appear in team details; rotation does not prevent casual games in this simulator.

Optional reactions follow the simulator's automatic-selection convention: pain-token competition, combat-drug recipients, enemy marks, plunder moves, Hunter pursuit and One Step Ahead attacks may choose targets automatically. The Shade Runner's Slicing Attack checks the straight segment between its starting and ending positions. The roster picker offers one gunner or one heavy gunner; it does not offer every legal tabletop composition. These are simulator simplifications, so the linked official rules remain the reference for tabletop play.

Run `node tests/eldar.mjs` to verify loadouts, pain tokens, free actions, pistol barrages, Warp Fold and seeded AI battles for both teams.

Shooting geometry follows the explanations at [Can I Shoot It?](https://canishoot.it/rules/shooting/shoot): visibility is distinct from intervening base lines, cover uses intervening parts within 1 inch of the target, and obscuring uses Heavy parts more than 1 inch from both bases. Independent terrain benefits stack; the same feature offers a defensive choice. Run `node tests/sight.mjs` for these scenarios, including Seek versus Saturate.

This remains a flat-board approximation: model centres/silhouettes stand in for head visibility, heavy rectangles are opaque walls unless `blocksSight:false`, and shooter-base origins/target arcs are sampled. It does not simulate model heights, vantage or floors. The automatic defender choice remains a simulator convenience.
