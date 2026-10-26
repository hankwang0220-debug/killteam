// Four opt-in Marine sculpt families; original models, weapons and bases remain available.
const revisions={deathwatch:'deathwatch-2',murderwing:'murderwing-2',nemesisClaw:'nemesis-claw-2',scoutSquad:'scouts-2'};
export function createVeteranSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const dark=()=>mat('#26292f',{rough:.90}),iron=()=>mat('#a1a8af',{metal:.65,rough:.48});
  const leather=()=>mat('#5d503d',{rough:.96}),bone=()=>mat('#c8c1a9',{rough:.84});
  function optic(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.25,r*1.25,r*.35,dark(),x,y,z)));
    const eye=sph(r,mat(color,{metal:.18,rough:.28}),x,y,z+r*.22);eye.scale.set(1,.48,.26);add(g,eye);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='deathwatch'){B.tw*=1.07;B.td*=1.10;B.head*=1.05;B.armR*=1.06;}
    if(L.team==='murderwing'){B.tw*=.98;B.td*=1.03;B.head*=1.06;B.wk*=.97;}
    if(L.team==='nemesisClaw'){B.tw*=1.04;B.td*=1.06;B.head*=1.06;}
    if(L.team==='scoutSquad'){B.tw*=.95;B.td*=.95;B.head*=1.07;B.armR*=.95;B.wk*=.95;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='scoutSquad'){
      const skull=sph(r,c.skin,0,r*.02,-r*.12);skull.scale.set(.93,1.04,.87);add(g,skull);
      add(g,tbox(r*1.31,r*.62,r*.67,c.skin,0,-r*.55,r*.30,.72));
      for(const s of [-1,1]){
        optic(g,s*r*.34,r*.12,r*.81,r*.085,'#6b716a');
        add(g,box(r*.46,r*.12,r*.12,mat('#55473c'),s*r*.34,r*.30,r*.74).rotateZ(-s*.12));
        add(g,cyl(r*.20,r*.20,r*.20,c.trim,s*r*.93,-r*.02,0).rotateZ(Math.PI/2));
      }
      const hair=mat('#4a4036',{rough:1});
      add(g,tbox(r*1.66,r*.33,r*1.37,hair,0,r*.83,-r*.16,.83));
      for(const s of [-1,1])add(g,tbox(r*.20,r*.52,r*.54,hair,s*r*.79,r*.46,-r*.30,.73));
      if(/sniper|hunter/.test(n)){
        add(g,tbox(r*1.36,r*.46,r*.27,dark(),0,-r*.35,r*.69,.74));
        for(const s of [-1,1])add(g,tbox(r*.32,r*1.50,r*.73,c.cloth,s*r*.87,r*.32,-r*.34,.73));
      }
      add(g,limb(V(r*.93,-r*.10,0),V(r*.56,-r*.43,r*.77),r*.035,dark()));
      return true;
    }
    add(g,tbox(r*1.78,r*1.93,r*1.62,c.main,0,0,-r*.13,.79),
      tbox(r*1.60,r*.39,r*.28,dark(),0,r*.17,r*.77,.75));
    for(const s of [-1,1]){
      optic(g,s*r*.38,r*.16,r*.96,r*.13,L.team==='nemesisClaw'?'#a0a6bc':'#ae6055');
      add(g,tbox(r*.62,r*.18,r*.28,c.trim,s*r*.41,r*.36,r*.69,.68).rotateZ(-s*.18),
        tbox(r*.33,r*.90,r*.46,c.trim,s*r*.87,-r*.16,r*.19,.69));
    }
    if(L.team==='deathwatch'){
      add(g,tbox(r*.94,r*.73,r*.45,iron(),0,-r*.46,r*.69,.70),
        tbox(r*.23,r*1.53,r*.15,c.trim,0,r*.56,r*.68,.78));
      for(let i=-1;i<=1;i++)add(g,box(r*.10,r*.33,r*.08,dark(),i*r*.24,-r*.45,r*.96));
      if(/marksman/.test(n))optic(g,r*.78,r*.07,r*.65,r*.20,'#a99769');
    }
    if(L.team==='murderwing'){
      add(g,aimY(cone(r*.40,r*.85,c.main,0,-r*.28,r*1.03,6),V(0,-.15,1)));
      for(const s of [-1,1]){
        add(g,tz(cyl(r*.22,r*.26,r*.35,iron(),s*r*.57,-r*.46,r*.64)));
        add(g,limb(V(s*r*.76,r*.71,-r*.20),V(s*r*1.04,r*1.38,-r*.56),r*.13,c.trim,r*.015));
      }
      for(let i=-1;i<=1;i++)add(g,box(r*.07,r*.25,r*.07,dark(),i*r*.18,-r*.39,r*.95));
      if(/warp talon|curseclaw/.test(n))for(const s of [-1,1])add(g,cone(r*.10,r*.41,bone(),s*r*.44,-r*.59,r*.84,5).rotateZ(Math.PI));
    }
    if(L.team==='nemesisClaw'){
      add(g,tbox(r*1.19,r*.81,r*.42,bone(),0,-r*.46,r*.68,.68));
      for(let i=-2;i<=2;i++)add(g,box(r*.065,r*.28,r*.07,dark(),i*r*.19,-r*.50,r*.95));
      // Ribbed helmet fins read as small bat wings instead of broad flat ears.
      for(const s of [-1,1])for(let i=0;i<3;i++){
        const a=V(s*r*.81,r*.42-i*r*.12,-r*.15),b=V(s*r*(1.50-i*.15),r*(1.23-i*.35),-r*.34);
        add(g,limb(a,b,r*.12,c.main,r*.025));
        if(i<2)add(g,tbox(r*.35,r*.35,r*.08,c.main,s*r*(1.10-i*.08),r*(.82-i*.32),-r*.28,.55).rotateZ(s*.35));
      }
    }
    return true;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase(),scout=L.team==='scoutSquad';
    const pouch=(x,y,z,color=leather())=>add(upper,tbox(.075*k,.085*k,.045*k,color,x,y,z,.80),box(.055*k,.012*k,.05*k,iron(),x,y+.025*k,z));
    for(const s of [-1,1]){
      add(upper,tbox(B.tw*.39,B.th*.40,.035*k,scout?M.main:M.trim,s*B.tw*.24,torsoY,f+.022*k,.75),
        tbox(B.tw*.31,B.th*.30,.04*k,M.main,s*B.tw*.24,torsoY,f+.046*k,.77));
      pouch(s*B.tw*.38,hipY,f*.70);
      add(fig,tbox(B.legR*1.5,B.leg*.26,.028*k,M.main,s*B.tw*.32,B.leg*.25,(s===-1?.06:-.05)*k+B.legR*.82,.76));
    }
    if(L.team==='deathwatch'){
      add(upper,tbox(.15*k,.10*k,.16*k,iron(),-B.sx,shY+.04*k,0,.72));
      for(let i=0;i<3;i++)add(upper,box(.10*k,.008*k,.01*k,dark(),-B.sx,shY+(.072-i*.018)*k,.083*k));
      for(const s of [-1,1])add(upper,tbox(.055*k,.15*k,.03*k,M.cloth,s*.055*k,hipY*.74,f*.70,.7));
      if(/aegis|breacher/.test(n))add(upper,tbox(.15*k,.13*k,.15*k,iron(),-B.sx,shY-.09*k,0,.70));
      if(/demolisher|bombard/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.026*k,.026*k,.10*k,iron(),i*.065*k,torsoY,f+.10*k));
      if(/disruptor/.test(n))add(upper,tbox(.14*k,.16*k,.09*k,iron(),0,torsoY,-f-.08*k,.7));
    }
    if(L.team==='murderwing'){
      for(const s of [-1,1]){
        add(upper,tbox(.13*k,.08*k,.15*k,M.trim,s*B.sx,shY+.03*k,0,.65));
        add(upper,cyl(.036*k,.045*k,.16*k,dark(),s*.13*k,torsoY+B.th*.25,-f-.10*k));
        for(let i=0;i<3;i++)add(upper,box(.012*k,.012*k,.09*k,M.trim,s*.13*k,torsoY+B.th*.25+(.05-i*.035)*k,-f-.10*k));
      }
      if(/shrieker/.test(n))add(upper,tz(cone(.06*k,.08*k,iron(),B.tw*.36,shY-.09*k,f+.04*k,12)));
      if(/skysear/.test(n))for(const s of [-1,1])add(upper,cyl(.035*k,.035*k,.19*k,M.trim,s*.055*k,torsoY,-f-.13*k));
      if(/huntmaster/.test(n))pouch(B.tw*.52,hipY,0);
    }
    if(L.team==='nemesisClaw'){
      const bolt=mat('#9caec3',{rough:.70});
      for(const s of [-1,1]){
        const path=[V(s*B.tw*.20,torsoY+.09*k,f+.068*k),V(s*B.tw*.31,torsoY+.035*k,f+.068*k),V(s*B.tw*.22,torsoY+.01*k,f+.068*k),V(s*B.tw*.33,torsoY-.075*k,f+.068*k)];
        for(let i=0;i<3;i++)add(upper,limb(path[i],path[i+1],.004*k,bolt));
      }
      if(/ventrilokar/.test(n)){
        add(upper,tbox(.12*k,.14*k,.08*k,dark(),0,torsoY,-f-.08*k,.72),box(.010*k,.35*k,.010*k,iron(),B.tw*.30,shY+.10*k,-f-.09*k));
      }
      if(/fearmonger/.test(n))for(const s of [-1,1])pouch(s*B.tw*.50,hipY,0,mat('#667450'));
      if(/screecher|skinthief/.test(n))pouch(-B.tw*.48,hipY*.78,0);
    }
    if(scout){
      for(const s of [-1,1]){
        add(upper,limb(V(s*B.tw*.34,shY,f*.85),V(s*B.tw*.24,hipY,f),.013*k,leather()));
        pouch(s*B.tw*.25,torsoY-B.th*.20,f+.073*k);
      }
      add(upper,tbox(.16*k,.20*k,.11*k,leather(),0,torsoY,-f-.06*k,.8));
      if(/tracker/.test(n)){
        add(upper,tbox(.09*k,.10*k,.035*k,M.trim,B.tw*.44,torsoY,f+.035*k,.72));
        add(upper,box(.008*k,.27*k,.008*k,iron(),B.tw*.34,shY+.08*k,-f-.06*k));
      }
      if(/sniper/.test(n))for(let i=-1;i<=1;i++)add(upper,tbox(.025*k,.10*k,.025*k,M.trim,i*.055*k,torsoY,f+.09*k,.70));
      if(/heavy gunner/.test(n))pouch(B.tw*.52,hipY,0,dark());
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    const plate=L.team==='deathwatch'?iron():mat(L.trim,{metal:.5,rough:.55});
    add(g,tbox(.07,.026,.14,plate,0,.075,-.03,.77));
    if(L.team==='deathwatch')for(const s of [-1,1])add(g,box(.01,.026,.09,plate,s*.052,.02,-.02));
    if(L.team==='scoutSquad')add(g,tbox(.055,.045,.06,dark(),0,.102,-.06,.75));
  }
  return {revision,proportions,head,body,weapon};
}
