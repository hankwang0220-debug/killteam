# Remaining faction equipment

Implemented 18 previously missing teams (72 options), in addition to the existing faction equipment. Selection remains shared with universal equipment under the existing cap. The roster and equipment UI lists these under each team's faction equipment group.

## Rule sources

Read from the official PDFs already saved by the project monitor, baseline checked 2026-10-19. The current equipment cards in each PDF take precedence over the PDF's historical errata appendix. This matters for Neurocyclic Reserve Cells (once per turning point, 0AP), Stabilised Bolt Shells (includes Accurate 1), Kasrkin Relics (also melee), and Starstrider capacitor packs (includes relic laspistols).

| Team | Official PDF (displayed update date) |
|---|---|
| Blooded | [29/04/2026](https://assets.warhammer-community.com/eng_29-04_kill_team_team_rules_blooded-djvqgciu6s-zvnlalulmo.pdf) |
| Fellgor Ravagers | [26/08/2026](https://assets.warhammer-community.com/eng_fellgor_ravagers_online_rules-98ktzb7tza-d8lud7bdhh.pdf) |
| Exaction Squad | [17/06/2026](https://assets.warhammer-community.com/eng_17-06_kill_team_team_rules_exaction_squad_online_rules-w6tqairoed-qhpndqu8fq.pdf) |
| Hierotek Circle | [26/08/2026](https://assets.warhammer-community.com/eng_hierotek_circle_online_rules-df98wqycag-bek3q27dqk.pdf) |
| Hunter Clade | [28/01/2026](https://assets.warhammer-community.com/eng_28-01_kill_team_team_rules_hunter_clade-iw4pezoqcm-axjoncdqci.pdf) |
| Kasrkin | [29/04/2026](https://assets.warhammer-community.com/eng_29-04_kt_teamrules_kasrkin-9s2gsy4iq7-hexyjwjqrx.pdf) |
| Legionaries | [17/12/2025](https://assets.warhammer-community.com/eng_17-12_kt_legionaries_online_rules-wdpu85w6pv-8ndq4m5egw.pdf) |
| Novitiates | [26/08/2026](https://assets.warhammer-community.com/eng_novitiates_online_rules-b4a5xsy3fu-5twxaatuzc.pdf) |
| Battleclade | [26/08/2026](https://assets.warhammer-community.com/eng_battleclade_online_rules-crotgv4bz2-4lvylnxlku.pdf) |
| Exodite Dragon Masters | [22/07/2026](https://assets.warhammer-community.com/eng_22-07_kill_team_team_rules_exodite_dragon_masters-bfqzdncjqz-ijdqo65ctu.pdf) |
| Goremongers | [26/08/2026](https://assets.warhammer-community.com/eng_goremongers_online_rules-9ba5skdxij-r0u7lafcas.pdf) |
| Hernkyn Yaegirs | [26/08/2026](https://assets.warhammer-community.com/eng_hernkyn_yaegirs_online_rules-7vprxsaew8-0p1ctuqlni.pdf) |
| Elucidian Starstriders | [29/04/2026](https://assets.warhammer-community.com/eng_29-04_kill_team_team_rules_elucidian_starstriders-4c0hnv9gz9-4fuvbi96ce.pdf) |
| Chaos Cult | [17/12/2025](https://assets.warhammer-community.com/eng_17-12_kill_team_team_rules_chaos_cult-x4tsrknbaq-lc1rwd37iy.pdf) |
| Celestian Insidiants | [26/08/2026](https://assets.warhammer-community.com/eng_celestian_insidiants_online_rules-lqzptdkmld-qrehe4wai4.pdf) |
| Brood Brothers | [26/08/2026](https://assets.warhammer-community.com/eng_brood_brothers_online_rules-ztviivggwv-tdvilxxaue.pdf) |
| Blades of Khaine | [29/04/2026](https://assets.warhammer-community.com/eng_29-04_killl_team_team_rules_blades_of_khaine-p7jsqt6jno-y4kh2lus1f.pdf) |
| Inquisitorial Agents | [26/08/2026](https://assets.warhammer-community.com/eng_inquisitorial_agents_online_rules-wxk0cybqst-vpe1dopkcv.pdf) |

## Using the equipment

- Ammunition, thrown chain weapons, alternative servitor weapons and Magnification Conduits appear as labelled weapon profiles. The chosen profile consumes a shared charge only when the action starts. Loaded capacitor packs and crystal matrices remain active for the specified duration.
- Warded Armour, Chaos Talismans, Lookout, Rad Bombardment, Baleful Script and Covert Guises use the existing pending-choice panel. Optional gambits may be skipped. Covert Guises checks the whole base, movement allowance and the 3-inch deployment-zone limit.
- Extremis Mind-link appears as a zero-AP action at activation start. Select a legal leader/partner pair, then click between the linked operatives to interleave their actions. AP, orders and action history persist; the opponent acts after both finish.
- Rune of Prophecy appears in initiative controls as separate +D3 and -D3 buttons affecting your own roll.
- Auto-chastisers adds clearly labelled self-damage versions of Acts of Faith. Icon of Faith permits a second, different act once per turning point. Only actual Faith expenditure activates Sanctified Rounds.
- Totem/Cadaver markers use the existing deployment preview and confirmation flow. The cadaver is carryable by its own team's operatives. Totems block attack re-rolls and do not block defence re-rolls.
- Optional automatic reactions use the existing Strategy auto-ability switches. Existing simulator conventions still apply: automatic effects choose useful recipients, optional self-damage is used conservatively, and the maps remain flat (no Vantage terrain). For example, Gore Marks avoids risking a last-wound casualty, and Auto-flagellator avoids a potentially lethal self-infliction. On a flat map the Vantage modifier of Rad Bombardment is inapplicable.

## Validation

`node tests/faction-equipment.mjs` checks team ownership and selection, profiles, charge timing and refresh, excluded operatives, gambit choices, Faith payment/limits, the last Blast use, and interleaved activations.

`node tests/faction-equipment.mjs --battles` additionally runs a complete battle with all four new equipment options for each of the 18 teams. Existing equipment, Angels, Battleclade, choices, initiative, movement, sight, re-roll, Brood Brothers, Yaegirs, Inquisition, Exodites, Insidiants, Chaos Cult and Goremongers tests were also run.
