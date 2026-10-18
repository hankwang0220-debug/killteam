# Kill Team Tactics（殺戮小隊戰術模擬器）

A browser-based (PWA) Kill Team–style skirmish game. Two players can play on one device, or one player can play against the computer. The interface is available in Traditional Chinese and English.

> This is an unofficial fan project. The rules are a simplified version of Kill Team. The teams, names, and ability wording are original archetypes.

## Deathwatch

Deathwatch is selectable as a playable five-operative team using the linked official online datacards. Choose any five of its eleven specialists, with no duplicates and at most one GRAVIS operative. A Watch Sergeant is optional; faction and universal equipment share a four-option cap in this simulator. Collector notes and Seek & Destroy / Security Tac Ops are included.

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
- Room to make mistakes: a player's automatic firefight ploys start switched off (tick them, or "All on", in the Strategy phase; a setup option turns them all on from the start), and automatic "you can" equipment (every team's once-per-TP / once-per-battle faction equipment, e.g. Purity Seals, Lucky Round, Toxin Shot, Target Analysis Optic) and the XV26 / Wolf Scouts abilities start off too, each with its own tick box in the Strategy phase. The computer uses its own. Ploys and gambits that pick something are picked by the player: an operative, a marker, an option, a point (tap the board), or free moves (pick each operative and tap where it goes; "Done" when finished) — with a "let the computer pick" button. The turn passes once the pick is made. Balanced (from weapon rules, ploys or abilities, attack or defence dice) is the player's own free re-roll: the dice window shows "⚖ 可平衡" and the first die tapped is re-rolled for free (after that, taps are Command Re-rolls); the computer still uses it automatically. The same goes for the defence re-rolls "re-roll every die of one result" (Dig In!, Defence Order, The Emperor Protects, Forewarned, Hypershielding: pick the result) and Void Armour (tap up to its number of dice). Attacks resolved without a dice window (guard interrupts, Counterattack, forced shots) still use these automatically. Ceaseless (無休: pick a result, every die showing it is re-rolled) and Relentless (毫不留情: tick any dice, then re-roll them) work the same way in the shoot and fight dice windows.
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

Every landing base must clear both Heavy and Light cover and all living operative bases, including friendly and enemy units. Ordinary movement can pass through friendly operatives but never enemy ones (Kill Team 2024); crossing Heavy or Light cover is a climb (at least 2", which covers a 2" climb, plus the climb above 2" and the drop beyond 2"; default heights unless a map gives them: Light 2", Heavy Barricade 3", other Heavy 2.6"), the base must land clear and outside enemy control range after each climb, and it can never stop on cover; flying and terrain-phasing abilities retain their traversal exceptions but require a clear landing. Deployment and NPO spawning never force an overlapping placement when space is unavailable, and mutations cannot enlarge a base into cover or another unit.

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

## Wrecka Krew

Wrecka Krew (破壞專隊) is defined in `js/data/wrecka.js`, with its runtime in `js/wrecka.js` (June '26 online rules). The team is a Boss Nob, two Bomb Squigs and five operatives (only Fighters and Gunners repeat). Implemented: Wrecka Rampage (Wrecka points are gained from retained 6s and spent automatically on fails, up to 2 per roll), Tanked Up, Wrecka Boss, Stoopid / Explosive / Boom! / Expendable Bomb Squigs, Salvo with Blast, Detonate, Smash, Reckless Temperament, Armoured Up, Kompetitive Streak, the Pulsa rokkit and Shokkwave, Break Stuff, all four strategy ploys, all four firefight ploys and all four faction equipment options. 2D simplifications: the Pulsa marker is placed on the target enemy, and a Breach marker lets operatives within 1" move through parts of that terrain no more than 1" thick without climbing. Run `node tests/wrecka.mjs`.

## Nemesis Claw

Nemesis Claw (復仇之爪, Night Lords) is defined in `js/data/nightlords.js`, with its runtime in `js/nightlords.js` (June '26 online rules and errata). The team is a Visionary plus five operatives from a list (each once, except Warriors). Every weapon choice is its own operative template, so each slot's dropdown picks the operative and its weapons together; the Visionary's four weapon options are a separate dropdown. Implemented: Astartes (two Shoots or Fights; a bolt pistol, boltgun or scoped bolt pistol for at least one of two Shoots, so the heavy bolter and missile launcher don't count), In Midnight Clad, Prescience (Foreboding, Portent, Premonition), Terrorchem and Poison Objective, Screecher, Appetite for Cruelty, Flay Them Alive, Tyrant of the Skinning Pits, Icon Bearer, Disconcerting Mimicry, Cruel Tormenter, all four strategy ploys, all four firefight ploys and all four faction equipment options. 2D simplifications: no heights or Vantage terrain (In Midnight Clad and Return to Darkness only look at Heavy terrain); Return to Darkness picks the friendly and the destination automatically, and "not closer to enemy operatives" means not closer to its nearest enemy; Mimicry's free Dash destination is chosen by the game; Flayed Skin stops weapon-rule re-rolls of 1 but not a Command Re-roll. Run `node tests/nemesisclaw.mjs`.

The setup screen now starts with a "① Choose your operatives and weapons" block for each player (before tactics and equipment), and the roster card shows who actually takes the field and with which weapons.

## Scout Squad

Scout Squad (偵察小隊) is defined in `js/data/scouts.js`, with its runtime in `js/scouts.js` (April '26 errata). The team is a Sergeant plus eight operatives from a list (each once, except Warriors); every weapon choice is its own operative template, so each slot's dropdown picks the operative and its weapons, and the Sergeant's three weapon options are a separate dropdown. Implemented: Astartes for the Sergeant only (an Astartes shotgun counts as a bolt weapon, the heavy bolter doesn't), Guidance and Experience, Heavy Weapon Bipod (a Heavy Gunner isn't restricted from moving after shooting), Grapnel Launcher / Grapnel Assault, Camo Cloak, Optics, Auspex Scan (with Optics a Sniper also gets Seek Light), Track Enemy, Adaptive Equipment, all of Forward Scouting, all four strategy ploys, all four firefight ploys and all four faction equipment options. Forward Scouting is chosen in setup (up to six, each up to its own maximum) and resolved automatically once deployment ends; Tactical Manoeuvre and Diversion are strategic gambits chosen in the Strategy phase. 2D simplifications: no heights or Accessible terrain; the game picks where Trip Alarm and Booby Trap markers go, which operatives are redeployed or repositioned, which operative Guidance and Experience, Adaptable Training and Stealth Relocation affect, and which enemy gets the Target token; Targeting Oculars is used automatically on the first two Shoots each turning point; a Booby Trap stops the enemy at the first point where its control range reaches the marker. Run `node tests/scoutsquad.mjs`.

## Ratlings

Ratlings (萊特林) are defined in `js/data/ratlings.js`, with the runtime in `js/ratlings.js` (April '26 errata). The Fixer plus ten picks (each once, except Snipers, Ogryns and Bullgryns; at most three Ogryns and Bullgryns together) — every weapon choice is its own operative template, so each slot's dropdown picks the operative and its weapons; the Fixer's two rifles are loadouts. Three ploys cost 0CP for the whole battle (one fewer for each Ogryn or Bullgryn), chosen in setup. Implemented: Scarper, Target Designation (strategic gambit), Munitorum Contacts (the simulator uses a combined four-option equipment cap), Early Warning, Evade, Tripwires and Mines, Slingshot (tap the destination), Grappling Hook, Hunter / Lie in Wait, Spotter (Spot), Vox-thief (Intercept), Light-fingered, Well Stocked, Bayonet Charge, brute shields, Survival Instincts, all other strategy and firefight ploys and the four equipment options. 2D simplifications: Scarper, Early Warning and Evade are taken automatically (the best free Dash for the Ratling), no heights or Accessible terrain. Run `node tests/ratlings.mjs`.

## Sanctifiers

Sanctifiers (淨化者) are defined in `js/data/sanctifiers.js`, with the runtime in `js/sanctifiers.js` (errata February '26). The Confessor and the Cherub are always taken; nine more come from the list (each once, except Preachers — up to four; each Missionary entry is one option, and the two braziers of holy fire can't both be taken). Every weapon choice is its own operative template, so each slot's dropdown picks the operative and its weapons. Implemented: Blaze tokens (D3 on activation, then the owner removes the token — automatically a D6 3+, or -1 APL when nearly dead), the Ministorum Sermon (the Confessor is the orator while he lives; a new one is picked automatically, or with the gambit dropdown, afterwards; Sermon damage reduction, activation-long benefit), Commanding Declamation (automatic, for Shoot / Fight / Charge), Fly and Incentivise (Cherub), Bladed Stance, Trained Assassin, Merciless Castigation, Fanatical Retribution, Twin Torrent (a Salvo-style second target), Null Skull, Disciplinarian, Miracle (with its free Dash / Fall Back), Wreathe in Fire (own action), Spread the Word, Holy Relic, Defend the Faith, Cult Icon, Imperial Cult Devotion (a free Shoot, automatic), Conversion Field, Medikit, all eight ploys and all four faction equipment options (Sanctification Orbs with Doused tokens, Imperial Cult Symbols, Purity Seals, Ecclesiarchy Texts). The rules PDF lists Confessor + Cherub + 9 = 11 operatives. 2D simplifications: no heights, and the Miraculist's Wreathe in Fire uses every enemy within 1" of it. Run `node tests/sanctifiers.mjs`.

## Faction rework: firefight ploys, equipment and weapon options

Death Korps, Farstalker Kinband, Kommandos, Plague Marines, Angels of Death, Tau Pathfinders and Canoptek Circle gained their firefight ploys, the four faction equipment options and the optional weapons / roster slots from the official team-rules PDFs (each in `js/<team>.js` + `js/data/<team>.js`, with a test in `tests/<team>.mjs`). Highlights: Pathfinders' drones, Saviour Protocols and Recon Sweep; Plague Marines' Cloud of Flies and Nurglings; Kommandos' Breach, Smoke Grenade and Grappling Hook; Kinband Gather, Quick Draw and Bound; Death Korps' orders, free ploys and Gas Bombardment. Simplifications (chosen automatically): Sanctifier Declamation / Blaze removal, Recon Sweep edge, Cloud placement, Krump 'Em!, Death Korps order choice and gas placement, Adaptive Tactics pick; not done: the Angels Captain's Heroic Leader second bullet and the Kommandos' "Breach during Charge/Reposition at 1 less AP".

Canoptek Circle: obelisk nodes are placed (turning point 1) and moved (up to 3" each, later turning points) by hand in the Strategy phase (an "Auto" button keeps the old automatic placement); Nodal Response (use or change a strategy ploy), Animate Obelisk Nodes (6" of node moves instead of an activation) and the equipment Nanoscarab Caskets, Phase Shifter, Matrix Manipulator (automatic) and Awakened Obelisk Nodes.

Setup: the roll-off winner now chooses which edge of the killzone is their drop zone before equipment and operatives are placed (the computer keeps its zone). Universal equipment gained the Portable Barricade (Light, Protective; Move With Barricade carries it, but it still gives cover when not connected) and the Breaching Charge (once per battle any friendly can Breach for 1AP). Approved Ops missions also have a Primary Op (Crit / Tac / Kill, picked in secret in the first Strategy phase, after deployment, and revealed at the end): its VP count 1.5x rounded up; for Kill Op it is (kill-grade VP + 1 for the higher grade) x1.5. Run `tests/universal.mjs`.

## Raveners

Raveners (蛇蟲) are defined in `js/data/raveners.js`, with the runtime in `js/raveners.js` (errata August '26). The Prime is always taken; four more come from the list (Felltalon, Tremorscythe, Venomspitter, Wrecker once each, Warriors repeat). Implemented: the TUNNEL (marker 0 placed at the start of the battle, the next numbered markers placed by hand or with Auto as a strategic gambit; an operative is on it when its base touches a marker or the strip between consecutive ones), going underground (the first two are set up normally, the rest underground — by a button, or automatically for the computer — and every operative still underground at the end is incapacitated), the Burrow action (on the tunnel it goes underground; underground it is placed on the tunnel by tapping the board; Move -2" afterwards; a free Burrow when counteracting), Predatory Instincts (two Fights, counteract with any order), Poison tokens, Toxic Lunge, Distend Dorsal Sac, Instinctive Behaviour, Reinforced Carapace and Crush, Neuropredatory Crest (no re-rolls, +1AP, control 1 lower), Synaptic Link, Hypersensory Hunter, Subterranean Ambush (automatic), all eight ploys and all four equipment options (Heightened Senses is a button in the initiative cards). Simplifications: the Tunnel markers are drawn 2" across; Tunnel marker 0 is placed automatically; the Ambush is automatic and the Tremorscythe fights once (twice if it was ready) rather than choosing between shooting and fighting; a counteracting Raveners's order change isn't offered; Writhe Out of Sight picks its Ravener automatically. Run `tests/raveners.mjs`.

## Spectre Squad and Tempestus Aquilons

Spectre Squad (魅影小隊, `js/spectres.js` + `js/data/spectres.js`) and Tempestus Aquilons (風暴天鷹, `js/aquilons.js` + `js/data/aquilons.js`) follow the August '26 rules PDFs. Spectre Squad: Elite Fieldcraft (Fieldcraft points each Ready step, 2 with a Vox-operator; after an enemy Engage-order action a ready Spectre takes a free Shoot — automatic, switchable with the firefight-ploy toggle; Cool-Headed, Issue Mission, Sharp Reactions), the Vox-relay Beacon (set up anywhere in the territory), Camo Cloaks, Medic!, Medikit, Signal, Loader / Weapons Team / Weapon Assist, Suppressive Fire, the Grenadier's grenades and Melta Mine, all eight ploys and all four equipment options (Prepared Killzone gives a fifth option, an Ammo Cache or terrain, only with a Guide). Not done: Scout Terrain's climb / hatch discounts, Dash and Reposition interruptions, Prepared Defence's first option, Medic!'s free Dash. Tempestus Aquilons: Drop Insertion (a whole third set up above with a Drop marker, landing from above by tapping the board, markers moved in TP1/TP2, one removed in TP2/TP3, still above after TP2 = incapacitated, a forced landing if more than half would stay above after TP1), Rapid Insertion, Gunfight, Dynamic, Vicious Knife Fighter, the Servo-sentry, the Tempestus Veteran, Command, all eight ploys and all four equipment options. Not done: Sniper's Vantage and Grav-chute (no heights in 2D). Run `tests/spectres.mjs` and `tests/aquilons.mjs`.

## Void-dancer Troupe

Void-dancer Troupe (虛空舞者劇團, `js/voiddancers.js` + `js/data/voiddancers.js`, June '26). The Lead Player (one ranged and one melee option) and seven picks (Death Jester and Shadowseer once each, Players repeat; at most one fusion pistol and one neuro disruptor) — every weapon combination is its own template. Implemented: Saedath (allegory and Pivotal Role picked in the first Strategy phase, an Accolade granted each later TP and when the performance is completed), Lead the Performance, Harlequin's Panoply (Piercing worsened when no crit is retained), Luck of the Laughing God, Humbling Cruelty, Mirror of Minds, Fog of Dreams, all eight ploys and all four equipment options. Simplifications: the performance's extra Accolade goes to the best candidate automatically; The Curtain Falls is automatic and off by default; Domino Field and Cegorach's Jest are automatic; climbing as 2" has no effect in 2D. Run `tests/voiddancers.mjs`.

## Vespid Stingwings

Vespid Stingwings (胡蜂尖翼, `js/vespids.js` + `js/data/vespids.js`, August '26). Communion points (交融點數: D3 each Ready step, +1 with the Oversight Drone; Neurostimulant) restrict shooting to the closest enemy within 8", Charges to the closest reachable enemy, and make Pick Up / mission actions cost a point; a point re-rolls an attack die (spent automatically when two or more are left). FLY (every Vespid is set up again within its move), Neutron Charge, Neutron Fragment tokens (they stack), Neutron Fallout markers (placed by the Skyblast's shot whether it hits or not, they stay all battle, D3 to an enemy within 2" once in each of its activations — never during a counteraction), Communion Helm, Commune (picked at set-up), the Oversight Drone, Ghost Rig and Camouflaged, Skytorch Assault, Warrior Instincts, all ploys and all four equipment options. D3 damage from Fragments, Fallout, Venom and Overload can't be re-rolled and is shown as the D6 it came from (1-2 = 1, 3-4 = 2, 5-6 = 3). Not done: Ocelli (heights), the Helm's free mission action for a friendly; the computer doesn't use Skytorch Assault. Run `tests/vespids.mjs`.

## XV26 Stealth Battlesuits

XV26 Stealth Battlesuits (XV26 隱形戰鬥服, `js/stealthsuits.js` + `js/data/stealthsuits.js`, August '26). Stealth Fields (Concealed: invisible to enemies more than 3" away, Fall Back 1AP cheaper), Kauyon (Accurate 1/2/3 by where the enemy is; For the Greater Good), Markerlight (Severe against marked enemies), Focused Markerlight, the drones (Drone Controller gambit lifts their limits), the Lodestar's Electrochaff Launcher and Homing Beacon, the Neutraliser's Multispectrum Sensor Package and System Jam, Covert Protocols, the Gun Drone's Photon Grenade Launcher, the Liberator's grenades and EMP bomb, all ploys and all four equipment options. Every weapon choice is its own template; at most two fusion blasters. Simplified: the Sensor Package only switches orders (no free Dash), Retro-Thrusters has no enemy follow-up, the Ambush marker and Jammers marker are placed automatically, Bonds of Unity always ignores the injured Hit penalty, Engage Jet Pack frees every climb in that activation, Multitrackers always gives Torrent 2". Run `tests/stealthsuits.mjs`.

## Wolf Scouts

Wolf Scouts (狼偵查小隊, `js/wolfscouts.js` + `js/data/wolfscouts.js`, August '26). The Elemental Storm (a strategic gambit places the Storm marker by tapping the board; wholly within 6" is within the storm; Concealed Charges ending there), Hunting Astartes (two Shoots or two Fights, +1AP for plasma twice, never two PSYCHIC weapons, counteracting on any order and changing order in the storm), Lupine Guile, Grizzled Veteran, Spiritual Chirurgy, Healing Balms, Storm-veiled Execution (Guard), Hunter's Senses, Tempest's Fury, Fierce Temperament, Cast the Runes, Call the Storm, the Haywire Mine, the Fenrisian Wolf and Pounce, all ploys and all four equipment options. Call the Storm moves the marker to any tapped point; the Haywire Mine stops the move where it goes off. Simplified: Counterattack and Savage Fighters are automatic (Counterattack can be switched off like other automatic ploys), and the Counterattack fight is resolved automatically; the computer only Pounces to Charge. Run `tests/wolfscouts.mjs`.

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

## Tombworld（墓穴世界）地圖

首頁地圖按鈕及 `#tombworld` 可開啟 Approved Ops 2025 的 01–06 六張排列。對戰設定可選 28″ × 24″ 墓穴世界地圖（4″ 網格），含部署區、三個目標點及兩個 1AP 傳送台；棋盤尺寸亦保存於回放。這是圖卡排列的平面近似，牆段端點按棋盤調整，實體組裝請參考地形實測卡。艙門預設關閉，開門／關門各 1AP、B2 有洞口、A1 保持完整；對戰可各花 1AP 開關門；破牆仍只在組件預覽中提供。傳送要求整個底座位於台內、未交戰，並自動選擇另一端的合法空位。詳見 [地形與模擬器條件](docs/tombworld.md)。

驗證：`node tests/tombworld.mjs`、`node tests/tombworld-maps.mjs`。

墓穴世界地圖現在標示門／洞口與 +1″ 過門成本（使用者設定）；路徑分段不重複收費，往返會再次收費。未交戰且底座接觸開啟門口時，可執行 1AP「門間近戰」，攻擊另一側距門口 2″ 內的敵人；計入 Fight 次數並只在動作期間視為交戰。實牆阻斷控制範圍且不能攀越。驗證：`node tests/tombworld-doors.mjs`。

開門與關門各固定花費 1AP，新對戰門預設關閉；門號、狀態、阻擋地形與回放同步更新。驗證：`node tests/tombworld-hatches.mjs`。

所有隊伍的陣營裝備與通用裝備合計最多四項；選隊介面、開局資料與 AI 使用同一上限。死亡守望及萊特林亦依此設定為四項。切換隊伍時保留適用的通用裝備，移除原隊伍限定裝備；重複項目不重複計數。驗證：`node tests/equipment.mjs`。

3D models (3D 模型) are built procedurally in `js/models3d.js` and shown on the home screen's 3D Models page (`js/viewer3d.js`; three.js r160 is bundled in `js/vendor/` under its MIT licence and loaded only when the page opens, so it works offline). Every team has its own body style (power armour, guardsman, eldar, ork, necron, tau, kroot, votann, ratling, beastman, ravener, drakesteed rider, drones, hounds, squigs, ...) and colours; operatives are told apart mainly by the weapons they hold, chosen from their datacard weapons (main ranged and melee weapon, recognised by name), plus role props (leader cape or crest, vox antenna, medic pack, icon banner). Weapon loadouts can be switched in the viewer. Models use inches and stand on their real base size, ready for a later 3D board.

The 3D page also has Maps and Equipment tabs (`js/terrain3d.js`). Maps shows every killzone in 3D — the default map, Decaying Generatorium, Negotiation and Tomb World 01–06 — built from the same terrain rectangles the 2D game uses: ruined walls and machinery for Heavy terrain, barricades and rubble for Light, Tomb World walls with end pillars, hatchways (a button opens or closes them all) with lintels, sarcophagus light cover and teleport pads, plus objectives and drop zones. Heights follow the climbing rules (Light 2", Heavy 2.6", Heavy Barricade 3", or a piece's own `height`). Equipment shows the light, heavy and portable barricades, razor wire, the universal-equipment ladder, the ammo cache, mines, the comms device, the objective marker and the Tomb World parts. The ladder is a model only; the game doesn't use ladders yet.
