import { createKommandoRefinements } from './models3d-kommandos.js';
// Dedicated gallery sculpts for Drukhari, Corsairs, shadow creatures and heavy Orks.
const revisions={handOfArchon:'archon-2',corsairVoidscarred:'corsairs-2',mandrakes:'mandrakes-2',wreckaKrew:'wreckas-2'};
export function createRaiderSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY}=h;
  const orks=createKommandoRefinements(h);
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const dark=()=>mat('#20262b',{rough:.92}),iron=()=>mat('#798084',{metal:.6,rough:.56});
  const leather=()=>mat('#554431',{rough:.96});
  function optic(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.3,r*1.3,r*.35,dark(),x,y,z)));
    const eye=sph(r,mat(color,{metal:.15,rough:.30}),x,y,z+r*.23);eye.scale.set(1,.52,.26);add(g,eye);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='handOfArchon'){B.tw*=.95;B.head*=1.06;B.armR*=.97;}
    if(L.team==='corsairVoidscarred'){B.tw*=.97;B.head*=1.06;B.wk*=.96;}
    if(L.team==='mandrakes'){B.tw*=.94;B.head*=1.07;B.td*=.95;B.armR*=1.05;}
    if(L.team==='wreckaKrew'&&L.body==='ork'){B.tw*=1.12;B.td*=1.13;B.sx*=1.09;B.head*=1.10;B.armR*=1.14;B.th*=.95;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='wreckaKrew'&&L.body==='ork'){
      orks.head(g,{...L,team:'kommandos'},B,c);
      add(g,tbox(r*1.96,r*.48,r*.18,iron(),0,-r*.63,r*1.22,.68));
      for(let i=-2;i<=2;i++)add(g,cone(r*.09,r*.30,mat('#b7ae91'),i*r*.30,-r*.28,r*1.28,4));
      for(const s of [-1,1])add(g,sph(r*.07,mat(L.trim),s*r*.78,-r*.65,r*1.33));
      return true;
    }
    if(L.team==='handOfArchon'){
      const cap=sph(r,c.main,0,r*.20,-r*.14);cap.scale.set(.86,1.34,.89);add(g,cap);
      add(g,tbox(r*1.13,r*1.16,r*.31,L.leader?c.trim:dark(),0,-r*.22,r*.69,.56));
      for(const s of [-1,1]){
        optic(g,s*r*.34,r*.21,r*.88,r*.11,'#8dac67');
        add(g,tbox(r*.30,r*.90,r*.30,c.trim,s*r*.76,-r*.18,r*.28,.60));
        add(g,limb(V(s*r*.73,r*.59,-r*.26),V(s*r*1.0,r*1.28,-r*.55),r*.09,c.trim,r*.012));
      }
      if(/disciple|elixicant/.test(n))for(const s of [-1,1])add(g,tz(cyl(r*.16,r*.20,r*.33,iron(),s*r*.55,-r*.48,r*.72)));
      return true;
    }
    if(L.team==='corsairVoidscarred'){
      const bare=/felarch|kurnathi|soul weaver|way seeker|duellist/.test(n);
      if(bare){
        const face=sph(r,c.skin,0,0,-r*.08);face.scale.set(.84,1.05,.86);add(g,face);
        add(g,tbox(r*1.08,r*.55,r*.58,c.skin,0,-r*.58,r*.29,.70));
        for(const s of [-1,1]){
          optic(g,s*r*.30,r*.12,r*.79,r*.08,'#756c5c');
          add(g,aimY(cone(r*.16,r*.64,c.skin,s*r*.88,r*.10,-r*.05,4),V(s,.25,-.15)));
          add(g,tbox(r*.31,r*1.35,r*.55,mat('#3a3336'),s*r*.74,r*.23,-r*.31,.68));
        }
        add(g,tbox(r*1.52,r*.32,r*1.31,mat('#3a3336'),0,r*.82,-r*.25,.82));
      }else{
        const helm=sph(r,c.main,0,r*.14,-r*.14);helm.scale.set(.89,1.23,.91);add(g,helm);
        add(g,tbox(r*.95,r*1.03,r*.29,bone(),0,-r*.20,r*.70,.60));
        for(const s of [-1,1])optic(g,s*r*.32,r*.16,r*.88,r*.105,'#709eaa');
      }
      if(/fate dealer|shade runner/.test(n))for(const s of [-1,1])add(g,tbox(r*.34,r*1.68,r*.75,c.cloth,s*r*.86,r*.17,-r*.35,.73));
      return true;
    }
    if(L.team==='mandrakes'){
      const skin=sph(r,c.skin,0,r*.06,-r*.11);skin.scale.set(.83,1.11,.88);add(g,skin);
      add(g,tbox(r*1.13,r*.57,r*.62,c.skin,0,-r*.57,r*.30,.64));
      for(const s of [-1,1]){
        optic(g,s*r*.32,r*.16,r*.81,r*.105,'#96b87b');
        add(g,tbox(r*.58,r*.17,r*.19,c.skin,s*r*.35,r*.36,r*.67,.63).rotateZ(-s*.23));
      }
      add(g,tbox(r*.77,r*.10,r*.08,dark(),0,-r*.43,r*.81,.66));
      for(let i=-2;i<=2;i++){
        const a=V(i*r*.28,r*.80,-r*.34),b=V(i*r*.34,r*1.18,-r*.75),d=V(i*r*.31,r*.62,-r*1.32);
        add(g,limb(a,b,r*.115,dark(),r*.075),limb(b,d,r*.075,dark(),r*.018));
      }
      if(/dirgemaw/.test(n))add(g,tbox(r*.68,r*.44,r*.12,dark(),0,-r*.41,r*.85,.65));
      return true;
    }
    return false;
  }
  const bone=()=>mat('#c9c3ac',{rough:.83});
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=leather())=>add(upper,tbox(.07*k,.085*k,.045*k,color,x,y,z,.79),box(.05*k,.012*k,.05*k,iron(),x,y+.026*k,z));
    if(L.team==='handOfArchon'||L.team==='corsairVoidscarred'){
      for(const s of [-1,1]){
        for(let i=0;i<3;i++)add(upper,tbox(B.tw*.31,.045*k,.025*k,M.main,s*B.tw*.24,torsoY+(.06-i*.049)*k,f+.025*k,.65));
        pouch(s*B.tw*.38,hipY,f*.70);
        add(fig,tbox(B.legR*1.35,B.leg*.25,.022*k,M.main,s*B.tw*.32,B.leg*.25,(s===-1?.06:-.05)*k+B.legR*.83,.67));
      }
      if(L.team==='handOfArchon'){
        if(/elixicant|disciple/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.014*k,.014*k,.075*k,mat('#70936a',{rough:.35}),i*.043*k,torsoY,f+.075*k));
        if(/assassin/.test(n))add(upper,tbox(.12*k,.10*k,.07*k,iron(),0,torsoY,-f-.06*k,.70));
        if(/duellist|flayer/.test(n))pouch(-B.tw*.48,hipY*.80,0);
      }else{
        for(const s of [-1,1])add(upper,tbox(.11*k,.05*k,.12*k,M.trim,s*B.sx,shY,.01*k,.72));
        if(/soul weaver|way seeker/.test(n))for(let i=-1;i<=1;i++)add(upper,sph(.015*k,bone(),i*.05*k,torsoY+B.th*.23,f+.045*k));
        if(/kurnite hunter/.test(n))pouch(B.tw*.51,hipY,0);
        if(/shade runner/.test(n))add(upper,tz(cyl(.036*k,.036*k,.024*k,M.trim,0,torsoY,-f-.10*k)));
      }
    }
    if(L.team==='mandrakes'){
      // Pale planes follow ribs and shoulders; a few narrow marks retain the existing shadow aesthetic.
      for(const s of [-1,1]){
        for(let i=0;i<3;i++)add(upper,tbox(B.tw*.25,.018*k,.012*k,M.skin,s*B.tw*.23,torsoY+(.06-i*.045)*k,f+.012*k,.65).rotateZ(s*.18));
        add(upper,limb(V(s*B.tw*.26,shY,f*.65),V(s*B.tw*.08,shY-.04*k,f),.008*k,M.skin));
        for(let i=0;i<3;i++)add(upper,tbox(.028*k,.007*k,.008*k,mat('#789e71'),s*B.tw*.26,torsoY+(.075-i*.045)*k,f+.025*k,.65).rotateZ(s*.40));
      }
      if(/shadeweaver|abyssal/.test(n))for(let i=0;i<3;i++)add(upper,tbox(.035*k,.12*k,.012*k,dark(),(i-1)*.07*k,hipY*.65,f*.6,.55).rotateZ((i-1)*.15));
      if(/chooser/.test(n))pouch(B.tw*.46,hipY*.82,0);
    }
    if(L.team==='wreckaKrew'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.40,B.th*.40,.04*k,iron(),s*B.tw*.24,torsoY,f+.025*k,.67));
        add(fig,tbox(B.legR*1.6,B.leg*.29,.035*k,iron(),s*B.tw*.32,B.leg*.24,(s===-1?.06:-.05)*k+B.legR*.86,.68));
        for(let i=0;i<3;i++)add(upper,sph(.008*k,M.trim,s*B.tw*.24+(i-1)*.04*k,torsoY+B.th*.12,f+.05*k));
        pouch(s*B.tw*.41,hipY,f*.70);
      }
      if(/krusha|fighter|demolisha/.test(n))add(upper,tbox(.15*k,.14*k,.15*k,M.trim,-B.sx,shY-.08*k,0,.65));
      if(/gunner|rokkiteer/.test(n))for(const s of [-1,1])add(upper,tbox(.08*k,.16*k,.04*k,M.trim,s*.07*k,torsoY,-f-.12*k,.68));
    }
  }
  function finish(fig,L){
    if(!revision(L)||L.team!=='wreckaKrew'||L.body!=='squig')return;
    const red=mat('#9a3c32',{rough:.9});
    add(fig,tbox(.17,.055,.20,iron(),0,.56,-.01,.73));
    for(const s of [-1,1]){
      add(fig,limb(V(s*.13,.51,-.02),V(s*.16,.31,.05),.012,leather()));
      add(fig,tbox(.10,.03,.06,red,s*.10,.49,.20,.68).rotateZ(-s*.18));
      for(let i=0;i<2;i++)add(fig,sph(.009,iron(),s*.075,.595,-.06+i*.09));
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='wreckaKrew'){
      add(g,tbox(.085,.035,.14,iron(),0,.09,-.03,.70));
      for(const s of [-1,1])add(g,sph(.009,mat(L.trim),s*.054,.035,-.07));
    }
    if(L.team==='handOfArchon'||L.team==='corsairVoidscarred')for(const s of [-1,1])add(g,tbox(.012,.03,.10,mat(L.trim,{metal:.5}),s*.05,.02,-.03,.65));
  }
  function hand(fig,L,B,at,side){return revision(L)&&L.team==='wreckaKrew'&&L.body==='ork'?orks.hand(fig,{...L,team:'kommandos'},B,at,side):false;}
  return {revision,proportions,head,body,finish,weapon,hand};
}
