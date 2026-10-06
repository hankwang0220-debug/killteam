# Kill Team Tactics（殺戮小隊戰術模擬器）

A browser-based (PWA) Kill Team–style skirmish game. Two players can play on one device, or one player can play against the computer. The interface is available in Traditional Chinese and English.

> This is an unofficial fan project. The rules are a simplified version of Kill Team. The teams, names, and ability wording are original archetypes.

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
- Movement uses automatic pathfinding around obstacles. A move may pass through engagement range but cannot end inside it (except a Charge). Clicking too far stops the move at the maximum distance
- Shooting: visibility to any part of the target, cover (terrain within 1" of the target), heavy terrain obscuring, defence dice equal to the DEF stat, and save allocation that is optimised automatically
- Fighting: both sides roll, then players alternate choosing Strike or Parry for each die (the computer chooses for its own side)
- Weapon rules: Piercing, Piercing Crits, Lethal, Balanced, Ceaseless, Rending, Brutal, Heavy, Range
- Injured state, objective control (by total APL), objective VP, and kill VP
- Simple AI opponent, autosave, and a quick rules reference
- Replays: every step is recorded and can be reviewed step by step (log, dice, movement trails); the last 10 finished games are kept
- Measuring tool (right-click / Esc / left-click, or the 📏 button on touch screens)

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

Add an object to `TEAMS` in `js/data/teams.js` with `ops`, `ploys`, and `rule`. Weapons support the rule keys listed at the top of that file. Special team abilities are handled by the `effectiveRules()` function in `js/game.js` (or by a dedicated function).

## Eldar teams

Hand of the Archon and Corsair Voidscarred (虛空之痕海盜) each field 9 operatives. Setup supports weapon choices, faction equipment, and Corsair warrior/heavy-gunner replacements. Official PDF links and the supplied purchase/rotation notes appear in team details; rotation does not prevent casual games in this simulator.

Optional reactions follow the simulator's automatic-selection convention: pain-token competition, combat-drug recipients, enemy marks, plunder moves, Hunter pursuit and One Step Ahead attacks may choose targets automatically. The Shade Runner's Slicing Attack checks the straight segment between its starting and ending positions. The roster picker offers one gunner or one heavy gunner; it does not offer every legal tabletop composition. These are simulator simplifications, so the linked official rules remain the reference for tabletop play.

Run `node tests/eldar.mjs` to verify loadouts, pain tokens, free actions, pistol barrages, Warp Fold and seeded AI battles for both teams.

Shooting geometry follows the explanations at [Can I Shoot It?](https://canishoot.it/rules/shooting/shoot): visibility is distinct from intervening base lines, cover uses intervening parts within 1 inch of the target, and obscuring uses Heavy parts more than 1 inch from both bases. Independent terrain benefits stack; the same feature offers a defensive choice. Run `node tests/sight.mjs` for these scenarios, including Seek versus Saturate.

This remains a flat-board approximation: model centres/silhouettes stand in for head visibility, heavy rectangles are opaque walls unless `blocksSight:false`, and shooter-base origins/target arcs are sampled. It does not simulate model heights, vantage or floors. The automatic defender choice remains a simulator convenience.
