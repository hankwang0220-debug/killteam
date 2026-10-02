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

## File structure

| File | Purpose |
|---|---|
| `js/data/teams.js` | Team, operative, weapon, and ploy data (**add or edit teams here**) |
| `js/game.js` | Game state, game flow, and the rules engine (line of sight, dice, combat) |
| `js/path.js` | A* pathfinding and movement validation |
| `js/ai.js` | Computer opponent |
| `js/board.js` | SVG board rendering |
| `js/main.js` | UI and interaction |
| `js/help.js` | Rules reference text |
| `sw.js` / `manifest.webmanifest` | PWA offline support and installation |

## Adding a team

Add an object to `TEAMS` in `js/data/teams.js` with `ops`, `ploys`, and `rule`. Weapons support the rule keys listed at the top of that file. Special team abilities are handled by the `effectiveRules()` function in `js/game.js` (or by a dedicated function).
