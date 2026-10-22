// Second sculpt pass for the Kommandos preview. All dimensions use the existing inch-scale body frame.
// No rule data or base geometry is changed; other Ork teams retain their own armour and silhouettes.
export function createKommandoRefinements(h) {
  const {THREE,V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY,DARK,METAL}=h;
  const active=L=>L.refined&&L.team==='kommandos';
  const iron=()=>mat('#555d59',{metal:.48,rough:.65});
  const leather=()=>mat('#433b29',{rough:.95});
  const red=()=>mat('#92332b',{rough:.93});
  const bone=()=>mat('#dfd1a2',{rough:.76});
  function proportions(B,L){
    if(!active(L))return;
    if(L.grot){B.head*=1.12;B.tw*=.90;B.armR*=.91;return;}
    B.tw*=1.09;B.td*=1.10;B.sx*=1.08;B.head*=1.10;B.armR*=1.13;B.th*=.96;
  }
  function head(g,L,B,c){
    if(!active(L))return false;
    const r=B.head,skin=c.skin,deep=mat('#365d24',{rough:.93});
    const cranium=sph(r,skin,0,r*.08,-r*.13);cranium.scale.set(1.1,1,.91);
    add(g,cranium,tbox(r*(L.grot?1.45:2.04),r*.76,r*1.14,skin,0,-r*.52,r*.48,.80));
    for(const s of [-1,1]){
      // The sockets sit beneath the brow, with small pupils rather than glowing eyeballs.
      const socket=sph(r*.29,deep,s*r*.46,r*.19,r*.76);socket.scale.set(1,.63,.45);
      const eye=sph(r*.125,mat(L.grot?'#dbbc65':'#bd6b32',{rough:.65}),s*r*.45,r*.17,r*.88);eye.scale.set(1,.60,.34);
      const pupil=sph(r*.045,mat('#151b11',{rough:.8}),s*r*.45,r*.17,r*.921);pupil.scale.set(.65,1,.5);
      const brow=tbox(r*.85,r*.30,r*.46,skin,s*r*.47,r*.43,r*.69,.72);brow.rotation.z=-s*.18;
      add(g,socket,eye,pupil,brow,tbox(r*.57,r*.53,r*.49,skin,s*r*.76,-r*.13,r*.52,.7));
      const ear=aimY(cone(r*(L.grot?.35:.26),r*(L.grot?1.35:.86),skin,s*r*1.13,r*.08,-r*.12,4),V(s,.24,-.08));
      add(g,ear);
      if(!L.grot){
        const a=V(s*r*.63,-r*.52,r*1.02),b=V(s*r*.69,-r*.12,r*1.17);
        add(g,limb(a,b,r*.13,bone(),r*.09),aimY(cone(r*.09,r*.40,bone(),b.x-s*r*.025,b.y+r*.17,b.z+r*.025,8),V(-s*.15,1,.15)));
      }
    }
    add(g,tbox(r*1.54,r*.20,r*.18,deep,0,-r*.35,r*1.075,.85),
      tbox(r*(L.grot?.40:.58),r*.43,r*(L.grot?1.05:.54),skin,0,r*.02,r*(L.grot?.99:.82),.70));
    for(let i=-1;i<=1;i++)add(g,tbox(r*.19,r*.18,r*.10,bone(),i*r*.29,-r*.43,r*1.18,.72));
    if(L.leader&&!L.grot){
      const cap=sph(r*1.07,iron(),0,r*.54,-r*.25);cap.scale.set(1.05,.55,.93);add(g,cap);
      add(g,tbox(r*1.72,r*.17,r*.46,iron(),0,r*.65,r*.55,.84));
      for(const s of [-1,1])add(g,sph(r*.09,METAL(),s*r*.60,r*.69,r*.79));
    }else{
      const band=new THREE.Mesh(new THREE.TorusGeometry(r*1.04,r*.12,6,24),red());
      band.rotation.x=Math.PI/2-.12;band.position.set(0,r*.56,-r*.08);band.castShadow=true;add(g,band);
      add(g,tbox(r*.28,r*.72,r*.12,red(),r*.45,r*.15,-r*.98,.70).rotateZ(-.3),
        tbox(r*.25,r*.52,r*.12,red(),r*.68,r*.30,-r*.96,.75).rotateZ(.45));
    }
    return true;
  }
  function body(c){
    const {L,B,k,upper,fig,head,hipY,torsoY,shY,M}=c;if(!active(L))return;
    const front=B.td/2,back=-front;
    // Broader shoulders, a pronounced trapezius and an asymmetric salvaged shoulder plate.
    if(!L.grot)for(const s of [-1,1]){
      const muscle=sph(B.armR*1.7,M.skin,s*B.sx,shY-.02*k,.015*k);muscle.scale.set(1.12,.9,1.10);
      add(upper,muscle,limb(V(s*B.tw*.22,shY-.035*k,0),V(s*B.sx,shY+.025*k,-.01*k),B.armR*.68,M.skin));
    }
    const pouch=(x,y,z)=>{
      add(upper,tbox(.072*k,.085*k,.045*k,leather(),x,y,z,.85),box(.055*k,.012*k,.050*k,iron(),x,y+.024*k,z+.003*k));
    };
    if(!L.grot){
      for(const s of [-1,1])pouch(s*B.tw*.34,hipY+.045*k,front+.023*k);
      // Seams on the vest and visible boot cuffs, with a few deliberate scuffs rather than noisy textures.
      for(const s of [-1,1])add(upper,box(.012*k,B.th*.60,.016*k,leather(),s*B.tw*.30,torsoY,front+.03*k));
      for(const s of [-1,1]){
        const z=(s===-1?.06:-.05)*k;
        add(fig,tbox(B.legR*2.05,.045*k,B.legR*1.8,leather(),s*B.tw*.32,hipY*.21,z,.90));
      }
      for(let i=0;i<3;i++)add(upper,box(.035*k,.006*k,.009*k,mat('#787b64',{rough:.9}),B.tw*.16,torsoY+(.055-i*.035)*k,front+.039*k).rotateZ(-.25));
    }
    const n=L.name.toLowerCase();
    if(L.grot){
      // A small climbing pack and coiled rope keep the Grot visually distinct from the bigger fighters.
      add(upper,tbox(.14*k,.17*k,.07*k,leather(),0,torsoY,back-.055*k,.85));
      for(let i=0;i<4;i++){
        const coil=new THREE.Mesh(new THREE.TorusGeometry(.055*k,.009*k,5,18),mat('#a89362',{rough:1}));
        coil.position.set(0,torsoY+(i-1.5)*.015*k,back-.10*k);coil.castShadow=true;add(upper,coil);
      }
    }else if(/comms/.test(n)){
      for(const s of [-1,1])add(head,cyl(B.head*.32,B.head*.32,.035*k,iron(),s*B.head*.97,B.head*.08,-B.head*.12).rotateZ(Math.PI/2));
      add(head,limb(V(-B.head*.95,0,0),V(-B.head*.55,-B.head*.38,B.head*.88),.006*k,iron()));
      for(let i=0;i<4;i++)add(upper,box(.095*k,.008*k,.014*k,DARK(),0,torsoY+(.045-i*.025)*k,back-.115*k));
    }else if(/burna/.test(n)){
      for(const s of [-1,1])add(upper,box(.018*k,B.th*.84,.015*k,leather(),s*B.tw*.25,torsoY,front+.03*k));
      add(upper,limb(V(.07*k,torsoY,back-.13*k),V(B.sx*.85,shY-.16*k,.03*k),.014*k,DARK()));
    }else if(/dakka/.test(n)){
      for(let i=0;i<5;i++)add(upper,cyl(.012*k,.012*k,.065*k,mat('#ad8d45',{metal:.5,rough:.6}),(i-2)*.037*k,torsoY-.04*k,front+.045*k));
    }else if(/rokkit/.test(n)){
      for(const s of [-1,1])add(upper,box(.10*k,.025*k,.008*k,red(),s*.065*k,torsoY+.02*k,back-.105*k).rotateZ(s*.12));
    }else if(/breacha/.test(n)){
      add(upper,tbox(B.tw*.64,B.th*.60,.045*k,mat('#6b6444',{rough:.95}),0,torsoY,front+.025*k,.90));
      for(const s of [-1,1])add(upper,box(.018*k,B.th*.56,.012*k,iron(),s*B.tw*.20,torsoY,front+.054*k));
    }else if(/snipa/.test(n)){
      for(const s of [-1,1])for(let i=0;i<4;i++)add(upper,tbox(.045*k,.09*k,.012*k,mat(i%2?'#535d39':'#6c7047',{rough:1}),s*(B.tw*.24+i*.025*k),shY-.11*k-i*.03*k,back-.075*k,.55).rotateZ(s*.22));
    }else if(/slasha/.test(n)){
      for(const s of [-1,1])add(upper,tbox(.038*k,.14*k,.018*k,iron(),s*B.tw*.30,torsoY-.02*k,front+.052*k,.55).rotateZ(s*.18));
    }
  }
  function hand(fig,L,B,p,side){
    if(!active(L))return false;
    const r=B.armR,skin=mat(L.skin,{rough:.87});
    add(fig,tbox(r*2.05,r*1.65,r*1.95,skin,p.x,p.y,p.z,.85));
    for(let i=-1;i<=1;i++)add(fig,sph(r*.32,skin,p.x+i*r*.53,p.y+r*.61,p.z+r*.48));
    add(fig,tbox(r*.65,r*.95,r*.75,skin,p.x-side*r*.96,p.y-r*.08,p.z+r*.25,.75));
    return true;
  }
  function weapon(g,r,L){
    if(!active(L)||r.form==='bow')return;
    const small=r.form==='pistol',z=small?.045:.09,w=small?.035:.055;
    for(const s of [-1,1]){
      add(g,tbox(.008,.038,small?.065:.12,iron(),s*w,.025,z,.85));
      for(const end of [-1,1])add(g,sph(.005,mat('#aa9d80',{metal:.45,rough:.65}),s*(w+.005),.025,z+end*(small?.02:.04)));
    }
    add(g,box(.015,.012,small?.040:.070,red(),0,.053,z).rotateX(.05));
  }
  function finish(fig,L){
    if(!active(L)||L.body!=='squig')return;
    // Harness and a readable explosive casing, without changing the little creature's round silhouette.
    for(const s of [-1,1])add(fig,limb(V(s*.18,.49,-.08),V(s*.17,.23,.08),.018,leather()));
    add(fig,tbox(.15,.10,.13,iron(),0,.56,-.10,.85),box(.10,.025,.012,red(),0,.60,-.027));
    for(let i=-1;i<=1;i++)add(fig,box(.016,.007,.014,bone(),i*.025,.61,-.017));
  }
  return {active,proportions,head,body,hand,weapon,finish};
}
