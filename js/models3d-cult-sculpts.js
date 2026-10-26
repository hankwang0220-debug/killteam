// Optional faction sculpts for the display viewer; dimensions remain in model-local inches.
const revisions={warpcoven:'warpcoven-2',wyrmblade:'wyrmblade-2',blooded:'blooded-2',fellgor:'fellgor-2'};
export function createCultSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const iron=()=>mat('#777678',{metal:.55,rough:.65});
  const dark=()=>mat('#292a2d',{rough:.92});
  const bone=()=>mat('#c9bc99',{rough:.87});
  function lens(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.3,r*1.3,r*.35,dark(),x,y,z)));
    const glass=sph(r,mat(color,{metal:.15,rough:.28}),x,y,z+r*.23);glass.scale.set(1,.55,.25);add(g,glass);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='warpcoven'&&L.body==='marine'){B.tw*=1.05;B.td*=1.06;B.head*=1.04;}
    if(L.team==='wyrmblade'){B.tw*=.98;B.head*=1.06;B.wk*=.96;}
    if(L.team==='blooded'){B.td*=1.05;B.armR*=1.05;B.head*=1.05;}
    if(L.body==='gor'){B.tw*=1.08;B.head*=1.10;B.armR*=1.10;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='warpcoven'&&L.body==='marine'){
      add(g,tbox(r*1.72,r*1.94,r*1.64,c.main,0,0,-r*.12,.80),
        tbox(r*1.52,r*.40,r*.23,dark(),0,r*.08,r*.80,.85),
        tbox(r*.82,r*.80,r*.40,c.trim,0,-r*.45,r*.71,.75));
      for(const s of [-1,1]){
        lens(g,s*r*.38,r*.08,r*.97,r*.13,'#63b7b9');
        add(g,tbox(r*.38,r*1.7,r*.48,c.trim,s*r*.93,r*.29,-r*.16,.83));
      }
      // Banded fan crest has a broad silhouette rather than a single oversized spike.
      for(let i=-3;i<=3;i++){
        const y=r*(1.28-Math.abs(i)*.09);
        add(g,tbox(r*.30,r*.92,r*.36,i%2?c.main:c.trim,i*r*.31,y,-r*.34,.88));
      }
      if(/sorcerer/.test(n))add(g,sph(r*.16,c.trim,0,r*1.93,-r*.34));
      return true;
    }
    if(L.body==='gor'){
      const skin=sph(r,c.skin,0,0,-r*.13);skin.scale.set(1,1.05,.82);add(g,skin);
      const bird=L.team==='warpcoven';
      if(bird){
        add(g,aimY(cone(r*.47,r*1.16,bone(),0,-r*.24,r*.95,6),V(0,-.25,1)));
      }else{
        add(g,tbox(r*1.05,r*.80,r*.96,c.skin,0,-r*.42,r*.54,.70),
          tbox(r*.92,r*.24,r*.24,dark(),0,-r*.22,r*1.05,.8));
        for(const s of [-1,1])add(g,sph(r*.09,dark(),s*r*.24,-r*.19,r*1.17));
        add(g,cone(r*.30,r*.70,mat('#403c34',{rough:1}),0,-r*1.05,r*.30,5).rotateZ(Math.PI));
      }
      for(const s of [-1,1]){
        add(g,tbox(r*.67,r*.22,r*.31,c.skin,s*r*.48,r*.27,r*.60,.70).rotateZ(-s*.20));
        lens(g,s*r*.47,r*.10,r*.79,r*.11,bird?'#85b5bf':'#ad8b4d');
        const a=V(s*r*.73,r*.64,-r*.10),b=V(s*r*1.30,r*1.25,-r*.30),d=V(s*r*.91,r*1.75,-r*.48);
        add(g,limb(a,b,r*.24,bone(),r*.17),limb(b,d,r*.17,bone(),r*.025));
        add(g,limb(V(s*r*.70,0,0),V(s*r*1.35,-r*.12,-r*.22),r*.19,c.skin,r*.035));
      }
      if(/ironhorn/.test(n))add(g,tbox(r*.64,r*.70,r*.12,iron(),-r*.39,r*.13,r*.80,.7));
      return true;
    }
    if(L.team==='wyrmblade'&&L.body==='guard'){
      add(g,sph(r,c.skin,0,r*.08,-r*.07),tbox(r*1.35,r*.65,r*.90,c.skin,0,-r*.47,r*.30,.80));
      for(const s of [-1,1])lens(g,s*r*.38,r*.10,r*.86,r*.12,'#a5b39c');
      for(let i=-1;i<=1;i++)add(g,tbox(r*.16,r*.14,r*.70,c.skin,i*r*.29,r*.87,-r*.02,.7));
      if(/neophyte/.test(n)){
        add(g,tbox(r*1.9,r*.32,r*1.5,c.main,0,r*.84,-r*.12,.86),
          tbox(r*.60,r*.34,r*.30,iron(),0,r*.78,r*.82,.80));
        lens(g,0,r*.78,r*1.0,r*.16,'#b8ae71');
        add(g,tbox(r*.90,r*.42,r*.30,dark(),0,-r*.45,r*.87,.75));
      }
      if(/locus|sanctus/.test(n))for(const s of [-1,1])add(g,tbox(r*.44,r*1.8,r*.65,c.cloth,s*r*.90,r*.06,-r*.30,.7));
      return true;
    }
    if(L.team==='blooded'&&L.body==='guard'){
      add(g,tbox(r*1.72,r*1.85,r*1.6,c.skin,0,0,-r*.10,.80));
      const cap=sph(r*1.11,c.main,0,r*.44,-r*.18);cap.scale.set(1,.70,1);add(g,cap);
      for(const s of [-1,1])lens(g,s*r*.40,r*.08,r*.87,r*.16,'#a77b61');
      add(g,tbox(r*1.15,r*.76,r*.50,dark(),0,-r*.51,r*.66,.70));
      for(let i=-1;i<=1;i++)add(g,box(r*.10,r*.38,r*.12,iron(),i*r*.25,-r*.51,r*.96));
      add(g,tz(cyl(r*.28,r*.32,r*.28,iron(),r*.82,-r*.48,r*.55)));
      if(/chieftain|enforcer/.test(n))add(g,tbox(r*1.95,r*.17,r*1.65,c.trim,0,r*.83,r*.05,.80));
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z)=>add(upper,tbox(.07*k,.085*k,.045*k,mat('#655840',{rough:.95}),x,y,z,.82),box(.05*k,.012*k,.05*k,iron(),x,y+.025*k,z));
    if(L.team==='warpcoven'&&L.body==='marine'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.40,B.th*.42,.04*k,M.trim,s*B.tw*.25,torsoY,f+.025*k,.75),tbox(B.tw*.32,B.th*.30,.045*k,M.main,s*B.tw*.25,torsoY,f+.050*k,.75));
        add(upper,tbox(.13*k,.20*k,.025*k,M.cloth,s*.075*k,hipY*.72,f*.90,.74));
        for(let i=0;i<3;i++)add(upper,box(.10*k,.012*k,.028*k,M.trim,s*.075*k,hipY*.72+(.07-i*.065)*k,f*.90+.015*k));
      }
      if(/sorcerer/.test(n))for(let i=0;i<3;i++)add(upper,sph(.022*k,M.trim,(i-1)*.07*k,torsoY+B.th*.30,f+.06*k));
      if(/icon/.test(n))add(upper,tz(cyl(.055*k,.055*k,.025*k,M.trim,0,torsoY,f+.065*k)));
    }
    if(L.team==='wyrmblade'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.37,B.th*.36,.035*k,M.main,s*B.tw*.25,torsoY,f+.02*k,.78));
        add(upper,limb(V(s*B.tw*.33,shY,f*.85),V(s*B.tw*.25,hipY,f*1.08),.012*k,mat('#514736',{rough:.94})));
        pouch(s*B.tw*.37,hipY,f);
      }
      if(/gunner/.test(n)){
        add(upper,tbox(.17*k,.23*k,.12*k,iron(),0,torsoY,-f-.07*k,.80));
        for(const s of [-1,1])add(upper,cyl(.035*k,.035*k,.18*k,M.main,s*.065*k,torsoY,-f-.15*k));
      }
      if(/kelermorph/.test(n))for(const s of [-1,1])add(upper,tbox(.055*k,.16*k,.055*k,mat('#504534'),s*B.tw*.52,hipY*.78,0,.75));
      if(/sanctus/.test(n))for(let i=0;i<3;i++)pouch((i-1)*.065*k,torsoY-B.th*.22,f+.06*k);
    }
    if(L.team==='blooded'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.35,B.th*.36,.035*k,iron(),s*B.tw*.24,torsoY,f+.025*k,.67));
        pouch(s*B.tw*.35,hipY,f);
      }
      add(upper,limb(V(-B.tw*.34,shY,f),V(B.tw*.30,hipY,f+.04*k),.018*k,mat('#664f37',{rough:1})));
      if(/grenadier/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.025*k,.025*k,.10*k,M.trim,i*.065*k,torsoY,f+.09*k));
      if(/corpseman/.test(n))add(upper,tbox(.14*k,.13*k,.07*k,mat('#b2a78b'),B.tw*.51,hipY,.025*k,.8));
      if(/commsman/.test(n))add(upper,box(.012*k,.43*k,.012*k,iron(),B.tw*.38,shY+.14*k,-f));
      if(/ogryn/.test(n))for(const s of [-1,1])add(upper,tbox(.18*k,.13*k,.18*k,iron(),s*B.sx,shY,0,.7));
    }
    if(L.body==='gor'){
      for(const s of [-1,1]){
        add(upper,limb(V(s*B.tw*.34,shY,f*.85),V(s*B.tw*.22,hipY,f),.020*k,mat('#554331',{rough:1})));
        add(fig,tbox(B.legR*1.5,B.leg*.25,.025*k,iron(),s*B.tw*.32,B.leg*.24,(s===-1?.06:-.05)*k+B.legR*.8,.73));
        pouch(s*B.tw*.40,hipY,f*.8);
      }
      add(upper,tz(cyl(.04*k,.05*k,.025*k,iron(),0,torsoY,f+.04*k)));
      if(/shaman/.test(n))for(let i=-1;i<=1;i++)add(upper,cone(.025*k,.09*k,bone(),i*.055*k,torsoY+B.th*.22,f+.04*k,5).rotateZ(Math.PI));
      if(/toxhorn/.test(n))for(const s of [-1,1])add(upper,cyl(.035*k,.035*k,.14*k,mat('#74845c'),s*.065*k,torsoY,-f-.07*k));
      if(/deathknell/.test(n))add(upper,cone(.08*k,.12*k,iron(),0,torsoY,-f-.12*k,8).rotateZ(Math.PI));
      if(/mangler|gnarlscar/.test(n))add(upper,tbox(.11*k,.10*k,.13*k,iron(),-B.sx,shY-.10*k,0,.7));
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='warpcoven')for(const s of [-1,1])add(g,box(.012,.035,.17,mat(L.trim,{metal:.55}),s*.052,.03,-.02));
    if(L.team==='wyrmblade')add(g,tbox(.065,.04,.12,iron(),0,.075,-.04,.8));
    if(L.team==='blooded')add(g,tbox(.07,.055,.10,mat('#70523b',{rough:.9}),0,-.025,-.08,.75));
  }
  return {revision,proportions,head,body,weapon};
}
