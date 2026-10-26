// Display-only sculpts: armoured enforcers, soldiers and two families of machine bodies.
const revisions={exaction:'exaction-2',hierotek:'hierotek-2',hunterClade:'hunter-clade-2',kasrkin:'kasrkin-2'};
export function createSpecialistSculpts(h){
  const {THREE,V,mat,box,tbox,cyl,sph,cone,limb,add,tz}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const iron=()=>mat('#747d83',{metal:.68,rough:.48});
  const black=()=>mat('#252b30',{rough:.88});
  const camoMaps=new Map();
  function camouflage(base){
    if(camoMaps.has(base))return camoMaps.get(base);
    const size=64,pixels=new Uint8Array(size*size*4);
    const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
    const palette=[rgb(base),rgb('#354934'),rgb('#655640'),rgb('#aaa17a')];
    // Wrapped, irregular islands give repeatable painted camouflage on every primitive's UVs.
    const islands=[[.15,.18,.23,.12,1],[.72,.64,.25,.14,1],[.40,.48,.18,.12,2],[.92,.22,.20,.13,2],[.20,.83,.16,.09,3],[.61,.13,.13,.07,3]];
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const u=x/size,v=y/size;let index=0;
      for(const [cx,cy,rx,ry,tone]of islands){
        const dx=Math.min(Math.abs(u-cx),1-Math.abs(u-cx))/rx;
        const dy=Math.min(Math.abs(v-cy),1-Math.abs(v-cy))/ry;
        if(dx*dx+dy*dy<1+.23*Math.sin(u*Math.PI*12+Math.sin(v*Math.PI*8))+.16*Math.cos(v*Math.PI*16))index=tone;
      }
      const offset=(y*size+x)*4;pixels.set([...palette[index],255],offset);
    }
    const texture=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);
    texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps=true;texture.needsUpdate=true;camoMaps.set(base,texture);return texture;
  }
  function paintCamouflage(fig,L){
    const painted=new Map(),targets=new Map([L.main,L.cloth].map(color=>[new THREE.Color(color).getHex(),color]));
    fig.traverse(o=>{
      if(!o.isMesh)return;
      const paint=m=>{
        const base=targets.get(m.color?.getHex());if(!base)return m;
        if(!painted.has(m)){
          const copy=m.clone();copy.color.set('#ffffff');copy.map=camouflage(base);copy.roughness=.88;copy.metalness=.06;
          painted.set(m,copy);
        }
        return painted.get(m);
      };
      o.material=Array.isArray(o.material)?o.material.map(paint):paint(o.material);
    });
  }
  function lens(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.28,r*1.28,r*.4,black(),x,y,z)));
    const glass=sph(r,mat(color,{metal:.18,rough:.25}),x,y,z+r*.24);glass.scale.set(1,.62,.25);add(g,glass);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='exaction'){B.tw*=1.08;B.td*=1.07;B.head*=1.06;B.armR*=1.04;}
    if(L.team==='kasrkin'){B.tw*=1.06;B.td*=1.08;B.head*=1.05;}
    if(L.team==='hierotek'){B.tw*=1.07;B.td*=.95;B.head*=1.08;B.armR*=.96;}
    if(L.team==='hunterClade'){B.tw*=.95;B.head*=1.07;B.legR*=.94;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='exaction'&&L.body==='guard'){
      add(g,tbox(r*1.88,r*1.92,r*1.62,c.main,0,0,-r*.12,.83),
        tbox(r*1.78,r*.38,r*.35,black(),0,r*.10,r*.77,.85),
        tbox(r*1.88,r*.24,r*.50,c.trim,0,r*.36,r*.66,.80));
      add(g,box(r*1.44,r*.11,r*.12,mat('#986b62',{metal:.22,rough:.25}),0,r*.10,r*1.0),
        tbox(r*1.48,r*.68,r*.42,black(),0,-r*.53,r*.66,.73));
      for(const s of [-1,1])add(g,tbox(r*.40,r*.92,r*.60,c.main,s*r*.88,-r*.22,r*.07,.7));
      for(let i=-1;i<=1;i++)add(g,box(r*.12,r*.29,r*.11,c.trim,i*r*.29,-r*.54,r*.93));
      add(g,tbox(r*.26,r*1.8,r*.10,c.trim,0,r*.42,-r*.65,.85));
      return true;
    }
    if(L.team==='kasrkin'&&L.body==='guard'){
      add(g,tbox(r*1.70,r*1.80,r*1.50,c.skin,0,-r*.04,-r*.10,.82));
      const cap=sph(r*1.12,c.main,0,r*.43,-r*.18);cap.scale.set(1,.72,1.04);add(g,cap);
      add(g,tbox(r*1.95,r*.22,r*.52,c.trim,0,r*.34,r*.56,.82),
        tbox(r*1.58,r*.46,r*.25,black(),0,r*.07,r*.77,.85));
      for(const s of [-1,1]){
        lens(g,s*r*.38,r*.08,r*.96,r*.17,'#a18d58');
        add(g,cyl(r*.27,r*.27,r*.24,c.main,s*r*.99,-r*.09,0).rotateZ(Math.PI/2));
      }
      add(g,tbox(r*.98,r*.60,r*.40,black(),0,-r*.49,r*.71,.76));
      for(let i=-1;i<=1;i++)add(g,box(r*.10,r*.26,r*.08,iron(),i*r*.23,-r*.49,r*.96));
      if(/sergeant/.test(n))add(g,box(r*.25,r*.08,r*.95,c.trim,0,r*1.08,-r*.14));
      return true;
    }
    if(L.team==='hierotek'&&L.body==='necron'){
      const skull=sph(r,c.main,0,r*.18,-r*.12);skull.scale.set(.97,1.04,.77);add(g,skull);
      add(g,tbox(r*1.24,r*.72,r*.64,c.main,0,-r*.53,r*.29,.72),
        tbox(r*1.53,r*.33,r*.24,black(),0,r*.04,r*.69,.7));
      for(const s of [-1,1]){
        add(g,tbox(r*.68,r*.16,r*.24,c.main,s*r*.42,r*.27,r*.68,.65).rotateZ(-s*.18));
        lens(g,s*r*.39,r*.06,r*.86,r*.12,'#67bc79');
        add(g,tbox(r*.30,r*.62,r*.25,c.main,s*r*.67,-r*.28,r*.52,.68));
      }
      for(let i=-2;i<=2;i++)add(g,box(r*.08,r*.27,r*.07,black(),i*r*.19,-r*.62,r*.65));
      if(/deathmark/.test(n))lens(g,0,r*.09,r*.99,r*.24,'#87c38b');
      if(/mancer|apprentek/.test(n)){
        for(const s of [-1,1])add(g,tbox(r*.30,r*1.65,r*.44,c.trim,s*r*.99,r*.28,-r*.19,.78));
        add(g,tbox(r*1.9,r*.18,r*.40,c.trim,0,r*1.16,-r*.19,.8));
      }
      return true;
    }
    if(L.team==='hunterClade'&&L.body==='skitarii'){
      const sicarian=/sicarian/.test(n),infiltrator=/infiltrator/.test(n),ranger=/ranger/.test(n);
      add(g,tbox(r*1.56,r*1.80,r*1.42,iron(),0,0,-r*.14,.80),
        tbox(r*1.27,r*.50,r*.37,black(),0,-r*.44,r*.61,.77));
      for(let i=-1;i<=1;i++)add(g,box(r*.10,r*.27,r*.08,iron(),i*r*.25,-r*.45,r*.85));
      if(infiltrator){
        add(g,cyl(r*.94,r*.82,r*.32,c.main,0,r*.74,-r*.10,12));
        for(let i=-1;i<=1;i++)lens(g,i*r*.43,r*.20,r*.81,r*.12,'#9aaf83');
        add(g,box(r*.08,r*1.35,r*.08,iron(),r*.66,r*1.32,-r*.26));
      }else{
        for(const s of [-1,1])lens(g,s*r*.38,r*.18,r*.80,r*(sicarian?.19:.15),'#87a696');
        if(ranger)for(const s of [-1,1])add(g,tbox(r*.40,r*1.75,r*.70,c.cloth,s*r*.85,r*.17,-r*.36,.74));
        else add(g,tbox(r*1.64,r*.26,r*1.27,c.main,0,r*.85,-r*.20,.83));
      }
      for(const s of [-1,1])add(g,tz(cyl(r*.23,r*.27,r*.35,iron(),s*r*.76,-r*.46,r*.40)));
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=black())=>add(upper,tbox(.07*k,.09*k,.045*k,color,x,y,z,.82),box(.05*k,.012*k,.05*k,iron(),x,y+.027*k,z));
    if(L.team==='exaction'||L.team==='kasrkin'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.41,B.th*.40,.04*k,M.trim,s*B.tw*.24,torsoY+B.th*.06,f+.02*k,.77),
          tbox(B.tw*.34,B.th*.31,.045*k,M.main,s*B.tw*.24,torsoY+B.th*.06,f+.045*k,.78));
        pouch(s*B.tw*.27,hipY,f+.03*k);
        add(fig,tbox(B.legR*1.55,B.leg*.27,.03*k,M.main,s*B.tw*.32,B.leg*.26,(s===-1?.06:-.05)*k+B.legR*.82,.80));
        add(upper,tbox(.11*k,.10*k,.12*k,M.main,s*B.sx,shY,0,.78));
      }
      if(L.team==='kasrkin'){
        add(upper,tbox(.18*k,.22*k,.11*k,M.main,0,torsoY,-f-.06*k,.82));
        for(const s of [-1,1])add(upper,limb(V(s*.065*k,torsoY-.06*k,-f-.10*k),V(s*B.tw*.50,hipY,f*.6),.014*k,black()));
        if(/medic/.test(n)){
          pouch(B.tw*.52,hipY,0,mat('#b8b8a0'));
          add(upper,box(.055*k,.013*k,.009*k,mat('#8a3f35'),B.tw*.52,hipY,.029*k),box(.013*k,.055*k,.009*k,mat('#8a3f35'),B.tw*.52,hipY,.029*k));
        }
        if(/demo/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.024*k,.024*k,.10*k,iron(),i*.06*k,torsoY,f+.10*k));
      }else{
        add(upper,tbox(.12*k,.14*k,.025*k,M.trim,0,torsoY+B.th*.10,f+.08*k,.70));
        if(/subductor/.test(n))add(upper,tbox(.14*k,.10*k,.13*k,iron(),-B.sx,shY-.08*k,0,.76));
        if(/leashmaster/.test(n))add(upper,cyl(.055*k,.055*k,.045*k,iron(),B.tw*.49,hipY,0));
        if(/chirurgant/.test(n))pouch(B.tw*.51,hipY,0,mat('#b6b5a9'));
      }
      if(/vox|recon|malocator|revelatum/.test(n)){
        add(upper,tbox(.12*k,.16*k,.08*k,iron(),B.tw*.30,torsoY,-f-.04*k,.8),box(.009*k,.42*k,.009*k,iron(),B.tw*.30,shY+.14*k,-f-.06*k));
      }
    }
    if(L.team==='hierotek'){
      for(let i=0;i<4;i++)for(const s of [-1,1])add(upper,tbox(B.tw*(.40-i*.045),.025*k,.028*k,iron(),s*B.tw*.24,torsoY+(.075-i*.05)*k,f+.025*k,.7).rotateZ(s*.12));
      add(upper,tz(cyl(.045*k,.045*k,.025*k,M.trim,0,torsoY+B.th*.23,f+.05*k)));
      for(let i=0;i<4;i++)add(upper,tbox(.06*k,.025*k,.025*k,M.trim,0,torsoY+(.07-i*.05)*k,-f-.025*k,.75));
      if(/immortal/.test(n))for(const s of [-1,1])add(upper,tbox(.15*k,.08*k,.14*k,M.main,s*B.sx,shY+.03*k,0,.72));
      if(/mancer|apprentek/.test(n))for(const s of [-1,1])for(let i=0;i<3;i++)add(upper,tbox(.07*k,.075*k,.025*k,i%2?M.main:M.trim,s*.065*k,hipY*(.82-i*.18),f*.70,.7));
    }
    if(L.team==='hunterClade'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.34,B.th*.42,.03*k,iron(),s*B.tw*.23,torsoY,f+.015*k,.76));
        pouch(s*B.tw*.38,hipY,f*.8);
        add(fig,box(.012*k,B.leg*.42,.015*k,iron(),s*B.tw*.32,B.leg*.28,(s===-1?.06:-.05)*k+B.legR*.86));
      }
      add(upper,tbox(.16*k,.22*k,.10*k,M.trim,0,torsoY,-f-.065*k,.75));
      for(const s of [-1,1])add(upper,cyl(.028*k,.028*k,.19*k,iron(),s*.065*k,torsoY,-f-.125*k));
      if(/surveyor|diktat/.test(n)){
        add(upper,box(.009*k,.44*k,.009*k,iron(),B.tw*.38,shY+.13*k,-f-.07*k));
        if(/surveyor/.test(n))add(upper,tz(cyl(.045*k,.045*k,.025*k,iron(),B.tw*.48,torsoY,f+.035*k)));
      }
    }
  }
  function finish(fig,L){
    if(!revision(L))return;
    if(L.team==='kasrkin')paintCamouflage(fig,L);
    if(fig.userData.humanoid)return;
    if(L.team==='exaction'&&L.body==='beast'){
      for(const s of [-1,1])add(fig,tbox(.08,.12,.32,iron(),s*.14,.31,0,.75));
      add(fig,tbox(.18,.08,.19,black(),0,.48,.22,.72));lens(fig,0,.47,.33,.028,'#a37b67');
    }
    if(L.team==='hierotek'&&L.body==='macrocyte'){
      add(fig,tbox(.16,.045,.14,iron(),0,.43,0,.72));
      for(const s of [-1,1])add(fig,limb(V(s*.05,.35,0),V(s*.15,.21,.09),.018,iron(),.009));
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='kasrkin'||L.team==='exaction')add(g,tbox(.07,.025,.17,iron(),0,.075,-.01,.82));
    if(L.team==='hunterClade')for(const s of [-1,1])add(g,box(.012,.03,.13,iron(),s*.052,.025,-.03));
    if(L.team==='hierotek')add(g,tz(cyl(.034,.034,.022,mat(L.trim,{metal:.6}),0,.025,-.17)));
  }
  return {revision,proportions,head,body,finish,weapon};
}
