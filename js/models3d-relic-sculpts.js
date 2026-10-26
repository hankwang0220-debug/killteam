// Optional gallery sculpts for legionaries, novices, servitors and Exodite riders.
const revisions={legionaries:'legionaries-2',novitiates:'novitiates-2',battleclade:'battleclade-2',exoditeDragonMasters:'exodites-3'};
export function createRelicSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const iron=()=>mat('#787a7d',{metal:.65,rough:.51});
  const dark=()=>mat('#29282c',{rough:.9});
  const bone=()=>mat('#d1c4a2',{rough:.86});
  function lens(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.3,r*1.3,r*.35,dark(),x,y,z)));
    const glass=sph(r,mat(color,{metal:.2,rough:.26}),x,y,z+r*.22);glass.scale.set(1,.55,.25);add(g,glass);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='legionaries'){B.tw*=1.07;B.td*=1.09;B.head*=1.05;B.armR*=1.06;}
    if(L.team==='novitiates'){B.tw*=.96;B.head*=1.05;B.wk*=.96;}
    if(L.team==='battleclade'){B.td*=L.servitor?1.18:1.03;B.armR*=L.servitor?1.14:1;B.head*=1.06;}
    if(L.team==='exoditeDragonMasters'){B.tw*=.96;B.head*=1.05;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='legionaries'){
      add(g,tbox(r*1.78,r*1.92,r*1.63,c.main,0,0,-r*.1,.78),
        tbox(r*1.58,r*.37,r*.27,dark(),0,r*.14,r*.78,.72));
      for(const s of [-1,1]){
        lens(g,s*r*.39,r*.13,r*.98,r*.14,'#a75a49');
        add(g,tbox(r*.65,r*.18,r*.29,c.trim,s*r*.43,r*.35,r*.69,.65).rotateZ(-s*.21),
          tbox(r*.36,r*.94,r*.46,c.trim,s*r*.88,-r*.17,r*.25,.72));
        const a=V(s*r*.78,r*.73,-r*.10),b=V(s*r*1.25,r*1.12,-r*.36),d=V(s*r*1.02,r*1.64,-r*.46);
        add(g,limb(a,b,r*.20,bone(),r*.13),limb(b,d,r*.13,bone(),r*.015));
      }
      add(g,tbox(r*.95,r*.80,r*.40,iron(),0,-r*.48,r*.70,.70));
      for(let i=-1;i<=1;i++)add(g,box(r*.10,r*.36,r*.08,dark(),i*r*.25,-r*.49,r*.95));
      if(/balefire/.test(n))add(g,tbox(r*.34,r*.55,r*.13,c.trim,0,r*.68,r*.74,.65));
      return true;
    }
    if(L.team==='novitiates'){
      const face=sph(r,c.skin,0,0,0);face.scale.set(.85,1.02,.86);add(g,face);
      add(g,tbox(r*1.03,r*.53,r*.53,c.skin,0,-r*.56,r*.32,.73));
      for(const s of [-1,1]){
        lens(g,s*r*.31,r*.10,r*.79,r*.085,'#655a4c');
        add(g,box(r*.43,r*.09,r*.09,mat('#6a5146'),s*r*.31,r*.27,r*.79).rotateZ(-s*.09));
        add(g,tbox(r*.35,r*1.50,r*.90,c.cloth,s*r*.88,r*.12,-r*.22,.78));
      }
      add(g,tbox(r*1.65,r*.35,r*1.37,c.cloth,0,r*.86,-r*.15,.85),
        tbox(r*1.34,r*.20,r*.24,dark(),0,r*.66,r*.63,.82),
        box(r*.38,r*.055,r*.07,mat('#986e63'),0,-r*.46,r*.83));
      if(/superior/.test(n))add(g,tbox(r*.22,r*.45,r*.06,iron(),0,r*.94,r*.59,.8));
      return true;
    }
    if(L.team==='battleclade'){
      add(g,tbox(r*1.62,r*1.84,r*1.46,c.skin,0,0,-r*.13,.82),
        tbox(r*1.19,r*.66,r*.45,dark(),0,-r*.49,r*.59,.76));
      add(g,tbox(r*.88,r*1.63,r*.13,iron(),-r*.40,r*.04,r*.66,.74));
      lens(g,-r*.37,r*.13,r*.87,r*.20,'#80a58c');lens(g,r*.35,r*.13,r*.83,r*.10,'#8e7767');
      for(let i=-1;i<=1;i++)add(g,box(r*.10,r*.28,r*.08,iron(),i*r*.25,-r*.49,r*.86));
      for(const s of [-1,1])add(g,tz(cyl(r*.20,r*.24,r*.28,iron(),s*r*.78,-r*.42,r*.28)));
      if(!L.servitor){
        for(const s of [-1,1])add(g,tbox(r*.42,r*1.83,r*.95,c.cloth,s*r*.90,r*.15,-r*.34,.7));
        add(g,tbox(r*1.85,r*.36,r*1.50,c.cloth,0,r*.93,-r*.25,.75));
      }else{
        add(g,tbox(r*.28,r*1.55,r*.13,c.trim,r*.46,r*.30,r*.66,.74));
        add(g,limb(V(-r*.82,r*.30,-r*.15),V(-r*1.15,r*.72,-r*.28),r*.09,dark()));
      }
      return true;
    }
    if(L.team==='exoditeDragonMasters'&&L.body==='eldar'){
      const helm=sph(r,c.main,0,r*.10,-r*.15);helm.scale.set(.85,1.18,.88);add(g,helm);
      add(g,tbox(r*.80,r*1.16,r*.32,bone(),0,-r*.24,r*.68,.60));
      for(const s of [-1,1]){
        lens(g,s*r*.32,r*.13,r*.83,r*.11,'#7ca89c');
        add(g,tbox(r*.30,r*.90,r*.22,c.trim,s*r*.76,-r*.13,r*.28,.65));
      }
      for(let i=0;i<3;i++)add(g,cone(r*.15,r*.55,c.trim,0,r*(1.20-i*.17),-r*(.18+i*.34),5).rotateX(-.45));
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=dark())=>add(upper,tbox(.07*k,.09*k,.045*k,color,x,y,z,.8),box(.05*k,.012*k,.05*k,iron(),x,y+.027*k,z));
    if(L.team==='legionaries'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.42,B.th*.41,.04*k,M.trim,s*B.tw*.24,torsoY,f+.02*k,.70),tbox(B.tw*.32,B.th*.30,.045*k,M.main,s*B.tw*.24,torsoY,f+.046*k,.73));
        add(upper,tbox(.15*k,.10*k,.17*k,M.trim,s*B.sx,shY+.03*k,0,.7),tbox(.12*k,.09*k,.14*k,M.main,s*B.sx,shY+.055*k,.008*k,.7));
        pouch(s*B.tw*.38,hipY,f*.80);
      }
      if(/butcher|shrivetalon/.test(n))for(let i=-1;i<=1;i++)add(upper,cone(.018*k,.055*k,bone(),i*.06*k,hipY*.77,f+.03*k,5).rotateZ(Math.PI));
      if(/anointed/.test(n))add(upper,limb(V(-B.sx,shY,0),V(-B.sx-.05*k,shY-.20*k,.08*k),.06*k,mat('#805c62'),.035*k));
      if(/icon|chosen|champion/.test(n))add(upper,tz(cyl(.05*k,.05*k,.02*k,M.trim,0,torsoY+B.th*.22,f+.08*k)));
    }
    if(L.team==='novitiates'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.36,B.th*.38,.025*k,M.main,s*B.tw*.23,torsoY,f+.018*k,.78));
        add(upper,limb(V(s*B.tw*.33,shY,f*.85),V(s*B.tw*.25,hipY,f),.012*k,dark()));
        pouch(s*B.tw*.39,hipY,f*.7,mat('#776452'));
        add(upper,box(.015*k,hipY*.62,.012*k,M.trim,s*B.tw*.25,hipY*.48,B.tw*.62));
      }
      add(upper,tz(cyl(.025*k,.025*k,.018*k,iron(),0,torsoY+B.th*.24,f+.045*k)));
      if(/hospitaller/.test(n))pouch(B.tw*.53,hipY,0,mat('#bdb7a6'));
      if(/dialogus/.test(n))add(upper,tz(cone(.055*k,.08*k,iron(),B.tw*.49,shY-.08*k,.03*k,12)));
      if(/purgatus/.test(n))for(const s of [-1,1])add(upper,cyl(.034*k,.034*k,.18*k,M.main,s*.055*k,torsoY,-f-.075*k));
      if(/reliquarius|pronatus|preceptor/.test(n))add(upper,tbox(.10*k,.13*k,.035*k,mat('#b9a474'),0,hipY*.77,f,.72));
    }
    if(L.team==='battleclade'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.37,B.th*.42,.035*k,iron(),s*B.tw*.25,torsoY,f+.02*k,.72));
        add(upper,limb(V(s*B.tw*.30,torsoY,-f),V(s*B.tw*.45,hipY,f*.65),.018*k,dark()));
        add(fig,box(.016*k,B.leg*.43,.02*k,iron(),s*B.tw*.32,B.leg*.30,(s===-1?.06:-.05)*k+B.legR*.85));
      }
      add(upper,tbox(.16*k,.24*k,.12*k,M.trim,0,torsoY,-f-.07*k,.73));
      for(let i=0;i<4;i++)add(upper,box(.12*k,.012*k,.015*k,dark(),0,torsoY+(.08-i*.05)*k,-f-.135*k));
      if(/technomedic/.test(n))pouch(B.tw*.52,hipY,0,mat('#b7b6aa'));
      if(/breacher/.test(n))add(upper,tbox(.18*k,.16*k,.17*k,iron(),-B.sx,shY-.04*k,0,.7));
      if(/technoarcheologist|underseer/.test(n))add(upper,box(.01*k,.40*k,.01*k,iron(),B.tw*.34,shY+.14*k,-f-.08*k));
    }
    if(L.team==='exoditeDragonMasters'){
      for(const s of [-1,1]){
        for(let i=0;i<3;i++)add(upper,tbox(B.tw*.30,.045*k,.025*k,M.main,s*B.tw*.23,torsoY+(.055-i*.047)*k,f+.025*k,.65));
        pouch(s*B.tw*.37,hipY,f*.65,mat('#765539'));
      }
      add(upper,tz(cyl(.026*k,.026*k,.025*k,M.trim,0,torsoY+B.th*.20,f+.05*k)));
      if(/stonesinger/.test(n))add(upper,sph(.022*k,mat('#719c96',{rough:.3}),0,torsoY,f+.07*k));
    }
  }
  // Dragon surface details are now built with their own anatomy in models3d-drakes.js.
  function finish(){}
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='legionaries')for(const s of [-1,1])add(g,box(.013,.035,.15,mat(L.trim,{metal:.55}),s*.054,.025,-.03));
    if(L.team==='novitiates')add(g,tbox(.045,.035,.06,iron(),0,.066,-.05,.7));
    if(L.team==='battleclade')add(g,tbox(.08,.05,.12,iron(),0,.06,-.05,.75));
  }
  return {revision,proportions,head,body,finish,weapon};
}
