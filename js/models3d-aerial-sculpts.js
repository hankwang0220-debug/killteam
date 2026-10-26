// Optional gallery sculpts for infiltrators, drop troops, masked performers and winged aliens.
const revisions={spectres:'spectres-2',aquilons:'aquilons-2',voidDancers:'void-dancers-2',vespids:'vespids-2'};
export function createAerialSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const dark=()=>mat('#252a2e',{rough:.93}),iron=()=>mat('#90979b',{metal:.62,rough:.49});
  const leather=()=>mat('#60513a',{rough:.96}),bone=()=>mat('#d7cfb9',{rough:.84});
  function optic(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.27,r*1.27,r*.35,dark(),x,y,z)));
    const eye=sph(r,mat(color,{metal:.16,rough:.29}),x,y,z+r*.22);eye.scale.set(1,.52,.26);add(g,eye);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='spectres'){B.tw*=.97;B.head*=1.06;B.wk*=.96;}
    if(L.team==='aquilons'){B.tw*=1.06;B.td*=1.08;B.head*=1.06;B.armR*=1.04;}
    if(L.team==='voidDancers'){B.tw*=.95;B.td*=.95;B.head*=1.06;B.wk*=.96;}
    if(L.team==='vespids'){B.tw*=1.05;B.td*=1.08;B.head*=1.09;B.armR*=1.05;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='spectres'){
      add(g,tbox(r*1.69,r*1.86,r*1.51,c.main,0,0,-r*.12,.80),
        tbox(r*1.58,r*.45,r*.29,dark(),0,r*.12,r*.73,.78),
        tbox(r*1.35,r*.70,r*.35,c.cloth,0,-r*.45,r*.65,.73));
      for(const s of [-1,1]){
        optic(g,s*r*.37,r*.11,r*.92,r*.15,'#7b936b');
        add(g,tbox(r*.31,r*1.65,r*.78,c.cloth,s*r*.86,r*.20,-r*.30,.74));
      }
      for(let i=-1;i<=1;i++)add(g,tbox(r*.14,r*.31,r*.07,dark(),i*r*.29,-r*.46,r*.85,.72));
      add(g,tbox(r*1.81,r*.32,r*1.48,c.cloth,0,r*.88,-r*.24,.77));
      return true;
    }
    if(L.team==='aquilons'){
      add(g,tbox(r*1.86,r*1.94,r*1.65,c.main,0,0,-r*.12,.81),
        tbox(r*1.63,r*.40,r*.30,dark(),0,r*.12,r*.80,.79),
        tbox(r*1.07,r*.76,r*.48,iron(),0,-r*.46,r*.67,.70));
      for(const s of [-1,1]){
        optic(g,s*r*.39,r*.11,r*.99,r*.13,'#ad6758');
        add(g,cyl(r*.26,r*.26,r*.24,c.trim,s*r*1.0,-r*.10,0).rotateZ(Math.PI/2));
      }
      for(let i=-1;i<=1;i++)add(g,box(r*.11,r*.34,r*.08,dark(),i*r*.25,-r*.46,r*.96));
      add(g,tbox(r*1.90,r*.20,r*.43,c.trim,0,r*.36,r*.65,.82));
      if(/marksman/.test(n))optic(g,-r*.80,r*.06,r*.68,r*.20,'#8e9976');
      return true;
    }
    if(L.team==='voidDancers'){
      const jester=/death jester/.test(n),seer=/shadowseer/.test(n);
      const skull=sph(r,c.main,0,r*.14,-r*.15);skull.scale.set(.85,1.15,.88);add(g,skull);
      if(seer){
        add(g,tbox(r*1.12,r*1.55,r*.39,mat('#c5d1d4',{metal:.85,rough:.18}),0,-r*.08,r*.65,.64));
        for(const s of [-1,1])add(g,tbox(r*.37,r*1.87,r*.85,c.cloth,s*r*.87,r*.20,-r*.26,.70));
        add(g,tbox(r*1.75,r*.34,r*1.45,c.cloth,0,r*.99,-r*.24,.75));
      }else{
        add(g,tbox(r*1.18,r*1.52,r*.42,bone(),0,-r*.09,r*.64,.65));
        for(const s of [-1,1]){
          const eye=sph(r*(jester?.17:.10),dark(),s*r*.31,r*.16,r*.90);eye.scale.set(1,.58,.22);add(g,eye);
          add(g,tbox(r*.08,r*.39,r*.055,dark(),s*r*.33,-r*.08,r*.88,.58).rotateZ(s*.16));
        }
        if(jester){
          for(let i=-2;i<=2;i++)add(g,box(r*.065,r*.25,r*.06,dark(),i*r*.18,-r*.50,r*.89));
          add(g,cone(r*.12,r*.22,dark(),0,-r*.10,r*.91,4).rotateZ(Math.PI));
        }else add(g,limb(V(-r*.27,-r*.36,r*.89),V(0,-r*.44,r*.91),r*.025,dark()),limb(V(0,-r*.44,r*.91),V(r*.27,-r*.33,r*.89),r*.025,dark()));
      }
      return true;
    }
    if(L.team==='vespids'&&L.body==='vespid'){
      const shell=sph(r,c.main,0,r*.12,-r*.14);shell.scale.set(1.06,1.03,.95);add(g,shell);
      for(const s of [-1,1]){
        const socket=sph(r*.41,dark(),s*r*.64,r*.17,r*.49);socket.scale.set(.80,1.05,.50);add(g,socket);
        const compound=sph(r*.33,mat('#694331',{rough:.43}),s*r*.72,r*.18,r*.64);compound.scale.set(.70,1.02,.52);add(g,compound);
        for(let i=0;i<3;i++)add(g,sph(r*.042,mat('#bb8b59',{rough:.46}),s*r*.82,r*(.34-i*.17),r*.78));
        add(g,limb(V(s*r*.35,-r*.37,r*.69),V(s*r*.63,-r*.64,r*.87),r*.13,c.main,r*.06),limb(V(s*r*.63,-r*.64,r*.87),V(s*r*.24,-r*.76,r*.94),r*.06,iron(),r*.012));
        const a=V(s*r*.42,r*.77,-r*.17),b=V(s*r*.73,r*1.26,-r*.40),d=V(s*r*.93,r*1.60,-r*.66);
        add(g,limb(a,b,r*.055,c.main,r*.04),limb(b,d,r*.04,c.main,r*.012));
      }
      add(g,tbox(r*.58,r*.59,r*.50,c.main,0,-r*.29,r*.69,.64));
      for(let i=0;i<3;i++)add(g,tbox(r*.74,r*.10,r*.36,mat('#a4481e'),0,r*(.76-i*.24),r*.10,.63));
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=leather())=>add(upper,tbox(.07*k,.085*k,.045*k,color,x,y,z,.80),box(.05*k,.012*k,.05*k,iron(),x,y+.026*k,z));
    if(L.team==='spectres'||L.team==='aquilons'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.37,B.th*.39,.03*k,M.trim,s*B.tw*.24,torsoY,f+.02*k,.76),tbox(B.tw*.29,B.th*.29,.035*k,M.main,s*B.tw*.24,torsoY,f+.044*k,.75));
        pouch(s*B.tw*.36,hipY,f*.70);
      }
      if(L.team==='spectres'){
        for(const s of [-1,1])for(let i=0;i<4;i++)add(upper,tbox(.025*k,(.10+i%2*.025)*k,.009*k,mat(i%2?'#596349':'#353e31',{rough:1}),s*(B.sx-i*.035*k),shY-.06*k,-f-.02*k,.58).rotateZ(s*.18));
        if(/medicae/.test(n))pouch(B.tw*.51,hipY,0,bone());
        if(/grenadier/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.022*k,.022*k,.085*k,iron(),i*.055*k,torsoY,f+.08*k));
        if(/loader/.test(n))for(const s of [-1,1])pouch(s*B.tw*.52,hipY,0,dark());
      }else{
        for(const s of [-1,1]){
          add(upper,limb(V(s*B.tw*.33,shY,f*.85),V(s*B.tw*.24,hipY,f),.013*k,dark()));
          add(fig,tbox(B.legR*1.55,B.leg*.27,.029*k,M.main,s*B.tw*.32,B.leg*.25,(s===-1?.06:-.05)*k+B.legR*.83,.77));
          add(upper,tbox(.07*k,.16*k,.05*k,M.trim,s*.095*k,torsoY,-f-.115*k,.73));
          for(let i=0;i<3;i++)add(upper,box(.045*k,.009*k,.012*k,dark(),s*.095*k,torsoY+(.05-i*.045)*k,-f-.145*k));
        }
        if(/grenadier/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.025*k,.025*k,.09*k,iron(),i*.06*k,torsoY,f+.085*k));
        if(/precursor/.test(n))add(upper,tbox(.09*k,.11*k,.035*k,M.trim,B.tw*.44,torsoY,f+.035*k,.72));
      }
      if(/vox|guide/.test(n))add(upper,box(.009*k,.33*k,.009*k,iron(),B.tw*.34,shY+.10*k,-f-.07*k));
    }
    if(L.team==='voidDancers'){
      const paintA=mat('#343749',{rough:.75}),paintB=mat('#d1b980',{rough:.77});
      // Staggered diamonds sit on the suit rather than adding bulky armour plates.
      for(const s of [-1,1])for(let row=0;row<4;row++)for(let col=0;col<2;col++){
        const x=s*(B.tw*.14+col*.035*k),y=torsoY+(.09-row*.052)*k+(col%2)*.025*k;
        add(upper,box(.023*k,.023*k,.006*k,(row+col)%2?paintA:paintB,x,y,f+.024*k).rotateZ(Math.PI/4));
      }
      for(const s of [-1,1]){
        pouch(s*B.tw*.36,hipY,f*.60);
        for(let i=0;i<3;i++)add(fig,box(.022*k,.022*k,.007*k,i%2?paintA:paintB,s*B.tw*.32,B.leg*(.28+i*.09),(s===-1?.06:-.05)*k+B.legR*.84).rotateZ(Math.PI/4));
      }
      if(/shadowseer/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.015*k,.015*k,.05*k,M.trim,i*.045*k,hipY,f*.85));
      if(/death jester/.test(n))add(upper,tbox(.11*k,.08*k,.05*k,bone(),B.tw*.44,hipY,0,.67));
    }
    if(L.team==='vespids'){
      const ridge=mat('#a44b20',{rough:.88});
      for(const s of [-1,1]){
        for(let i=0;i<4;i++)add(upper,tbox(B.tw*.34,.033*k,.028*k,i%2?ridge:M.main,s*B.tw*.23,torsoY+(.08-i*.047)*k,f+.016*k,.66));
        for(let i=0;i<3;i++)add(fig,tbox(B.legR*1.35,.025*k,.022*k,ridge,s*B.tw*.32,B.leg*(.25+i*.11),(s===-1?.06:-.05)*k+B.legR*.83,.65));
      }
      // Branching veins use the exact frame and root of the existing four membranes.
      const vein=mat('#a35b3a',{rough:.78});
      for(const s of [-1,1])for(const lo of [0,1]){
        const len=(lo?.42:.62)*k,wide=(lo?.09:.12)*k;
        const dir=(lo?V(s*.95,.4,-.7):V(s*.65,.9,-.75)).normalize();
        const root=V(s*.05*k,torsoY+B.th*.38-lo*.06*k,.07*k-B.td*.45);
        const across=V(s,0,0).addScaledVector(dir,-V(s,0,0).dot(dir)).normalize();
        for(let j=1;j<=3;j++)for(const edge of [-1,1]){
          const a=root.clone().addScaledVector(dir,len*j*.19),b=root.clone().addScaledVector(dir,len*(j*.19+.12)).addScaledVector(across,edge*wide*.36);
          add(fig,limb(a,b,.0018*k,vein,.0012*k));
        }
      }
      if(/longsting/.test(n))add(upper,tbox(.07*k,.10*k,.04*k,M.trim,B.tw*.43,torsoY,f+.01*k,.7));
      if(/skyblast/.test(n))for(const s of [-1,1])add(upper,cyl(.025*k,.025*k,.09*k,iron(),s*.045*k,hipY,f*.80));
      if(/swarmguard/.test(n))add(upper,tbox(.12*k,.15*k,.08*k,M.trim,0,torsoY,-f-.07*k,.75));
    }
  }
  function finish(fig,L){
    if(!revision(L)||fig.userData.humanoid)return;
    if(L.team==='spectres'&&L.body==='gadget'){
      add(fig,tbox(.17,.035,.19,iron(),0,.20,0,.75),box(.009,.23,.009,iron(),-.10,.31,-.12));
      optic(fig,0,.23,.16,.018,'#7e9b72');
    }
    if(L.team==='aquilons'&&L.body==='gadget'){
      add(fig,tbox(.23,.04,.20,iron(),0,.51,0,.76));
      for(const s of [-1,1])add(fig,tbox(.04,.10,.17,dark(),s*.125,.41,0,.7));
      optic(fig,0,.45,.15,.021,'#ac6c5e');
    }
    if(L.team==='vespids'&&L.body==='drone'){
      for(const s of [-1,1])add(fig,tbox(.10,.025,.16,mat('#e8e2d4',{rough:.65}),s*.17,.80,.03,.75));
      optic(fig,0,.70,.27,.025,'#77968c');
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='spectres'||L.team==='aquilons')add(g,tbox(.065,.025,.14,iron(),0,.074,-.03,.77));
    if(L.team==='voidDancers')for(const s of [-1,1])add(g,tbox(.012,.025,.08,mat(L.trim,{metal:.5}),s*.05,.02,-.025,.65));
    if(L.team==='vespids')add(g,tbox(.065,.025,.12,mat('#ded8c7',{rough:.65}),0,.075,-.02,.7));
  }
  return {revision,proportions,head,body,finish,weapon};
}
