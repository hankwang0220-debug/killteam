import assert from 'node:assert/strict';
import { TEAMS } from '../js/data/teams.js';
import { EQUIPMENT_LIMIT, equipmentLimitFor, EQUIP_IDS, equipmentOptionsFor, cleanEquipment, newGame } from '../js/game.js';

assert.equal(EQUIPMENT_LIMIT,4);
for(const t of TEAMS.filter(t=>t.id !== 'npo')) {
  const options=equipmentOptionsFor(t.id), faction=options.filter(id=>!EQUIP_IDS.includes(id));
  const picks=[...faction.slice(0,2),...EQUIP_IDS.slice(0,5)];
  const g=newGame({teams:[t.id,'angels'],ai:null,equip:[picks,[]]});
  assert.equal(g.equip[0].length,t.id==='ratlings'?5:4,`${t.id}: combined cap is four (five for the Ratlings' Munitorum Contacts)`);
  assert.deepEqual(g.equip[0],picks.slice(0,t.id==='ratlings'?5:4));
  if(faction.length) assert(g.equip[0].includes(faction[0]),`${t.id}: faction options share the universal pool`);
  const ai=newGame({teams:['angels',t.id],ai:1,equip:[[]]});
  assert.equal(ai.equip[1].length,4,`${t.id}: AI respects the same cap`);
}
const faction=equipmentOptionsFor('deathwatch').filter(id=>!EQUIP_IDS.includes(id));
assert.deepEqual(cleanEquipment('deathwatch',[faction[0],faction[0],...EQUIP_IDS.slice(0,4)]),[faction[0],...EQUIP_IDS.slice(0,3)],'duplicates do not consume another slot');
assert.deepEqual(cleanEquipment('angels',[faction[0],...EQUIP_IDS.slice(0,4)]),EQUIP_IDS.slice(0,4),'changing teams removes foreign faction options before applying the cap');
assert.deepEqual(cleanEquipment('angels',['unknown',...EQUIP_IDS.slice(0,4)]),EQUIP_IDS.slice(0,4));
assert.deepEqual(cleanEquipment('angels',[]),[]);
assert.deepEqual(cleanEquipment('angels'),[]);
console.log('All teams: combined four-option faction/universal cap, runtime sanitization, team changes, unique picks and AI equipment passed.');
// Ratlings: the Fixer's Munitorum Contacts allows a fifth option.
assert.equal(equipmentLimitFor('ratlings'), 5);
assert.equal(equipmentLimitFor('angels'), 4);
assert.equal(cleanEquipment('ratlings', EQUIP_IDS.slice(0, 6)).length, 5);
console.log('Ratlings: five equipment options');
