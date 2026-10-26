// Refined Exodite mounts: lean articulated reptiles with sculpted jaws and overlapping scales.
export function createDrakeSculpts(h){
  const {THREE,V,mat,tbox,sph,cone,limb,add,aimY}=h;
  const active=L=>L.refined&&L.team==='exoditeDragonMasters';
  function drake(mounted){
    const g=new THREE.Group(),hide=mat('#426b3a',{rough:.9}),scale=mat('#304e32',{rough:.86}),
      light=mat('#899068',{rough:.94}),bone=mat('#c1b48d',{rough:.86}),shadow=mat('#202820',{rough:.96});
    const k=mounted?1: .73;
    const ellipsoid=(r,m,x,y,z,sx,sy,sz)=>{const o=sph(r,m,x,y,z);o.scale.set(sx,sy,sz);add(g,o);return o;};
    // A narrow ribcage, powerful hips and a forward-sloping neck replace the round belly.
    ellipsoid(.22,hide,0,.68,-.04,.78,.82,1.70);
    ellipsoid(.19,hide,0,.68,-.24,.92,.89,1.1);
    add(g,limb(V(0,.68,.22),V(0,.91,.48),.105,hide,.075),limb(V(0,.91,.48),V(0,1.04,.64),.075,hide,.060));
    // Flattened skull and tapered muzzle, with a visible separation between upper and lower jaws.
    ellipsoid(.105,hide,0,1.045,.67,.76,.64,1.30);
    add(g,tbox(.125,.070,.255,hide,0,1.035,.815,.64),
      tbox(.112,.012,.245,shadow,0,.993,.815,.68),tbox(.102,.035,.235,light,0,.969,.805,.67));
    for(const s of [-1,1]){
      ellipsoid(.025,shadow,s*.069,1.060,.705,.40,.78,1.1);
      ellipsoid(.014,mat('#b9a45c',{rough:.38}),s*.078,1.059,.710,.28,.73,.80);
      ellipsoid(.009,shadow,s*.082,1.059,.713,.25,.9,.35);
      add(g,limb(V(s*.063,1.084,.660),V(s*.068,1.085,.75),.013,scale,.009));
      ellipsoid(.008,shadow,s*.041,1.057,.915,.55,.38,1.0);
      for(let i=0;i<5;i++)add(g,cone(.0055,.020,bone,s*(.048-i*.002),.988,.735+i*.036,4).rotateZ(Math.PI));
      // Cheek scales and angular throat folds.
      for(let i=0;i<3;i++)add(g,tbox(.014,.024,.045,scale,s*.072,1.027-i*.019,.655+i*.023,.65).rotateZ(s*.22));
      for(let i=0;i<4;i++)add(g,limb(V(s*.032,.88+i*.025,.47+i*.025),V(s*.055,.88+i*.025,.47+i*.025),.005,light));
    }
    // S-curved tail tapers through multiple segments instead of ending as a straight cone.
    const tail=[V(0,.70,-.30),V(.025,.67,-.48),V(.08,.60,-.69),V(.14,.53,-.90),V(.23,.52,-1.10)];
    for(let i=0;i<tail.length-1;i++)add(g,limb(tail[i],tail[i+1],.070-i*.017,hide,Math.max(.004,.052-i*.017)));
    for(const s of [-1,1]){
      const hip=V(s*.15,.66,-.17),knee=V(s*.235,.40,.02),ankle=V(s*.20,.15,-.15),foot=V(s*.20,.035,.02);
      add(g,limb(hip,knee,.092,hide,.065),limb(knee,ankle,.044,hide,.025),limb(ankle,foot,.025,hide,.018));
      ellipsoid(.065,scale,s*.235,.40,.02,.8,1,.8);
      for(let j=-1;j<=1;j++){
        const a=V(s*.20+j*.028,.030,.025),b=V(s*.20+j*.045,.018,.16-Math.abs(j)*.025);
        add(g,limb(a,b,.012,hide,.007),aimY(cone(.009,.043,bone,b.x,b.y,b.z+.015,5),V(0,-.15,1)));
      }
      add(g,aimY(cone(.013,.07,bone,s*.20,.11,-.09,5),V(0,.65,1)));
      // Small forelimbs are held forward below the neck; the rider's legs remain distinct.
      if(mounted){
        add(g,limb(V(s*.105,.75,.23),V(s*.18,.61,.30),.024,hide,.016),limb(V(s*.18,.61,.30),V(s*.14,.60,.41),.016,hide,.009));
        for(let j=0;j<2;j++)add(g,aimY(cone(.006,.035,bone,s*(.13+j*.025),.60,.43,5),V(0,-.2,1)));
      }else{
        add(g,limb(V(s*.105,.72,.23),V(s*.19,.37,.27),.045,hide,.028),limb(V(s*.19,.37,.27),V(s*.18,.035,.40),.028,hide,.015));
        for(let j=-1;j<=1;j++)add(g,aimY(cone(.008,.045,bone,s*.18+j*.025,.025,.44,5),V(0,-.15,1)));
      }
      // Staggered plates follow the curved flanks, not a floating rectangular armour sheet.
      for(let row=0;row<5;row++)for(let i=0;i<9;i++){
        const z=.19-i*.052+(row%2)*.020,a=(row-2)*.32;
        const radius=Math.sqrt(Math.max(.05,1-((z+.04)/.374)**2));
        const x=s*.174*Math.cos(a)*radius,y=.68+.184*Math.sin(a)*radius;
        const scute=ellipsoid(.027,(i+row)%4?scale:hide,x,y,z,.28,.77,1.15);
        scute.rotation.z=s*a;
      }
      for(let i=0;i<4;i++)ellipsoid(.028,scale,s*.215,.57-i*.042,-.12+i*.025,.28,.85,1);
      for(let i=0;i<4;i++)add(g,tbox(.018,.042,.046,scale,s*(.205-i*.006),.29-i*.035,-.05-i*.025,.66));
    }
    for(let i=0;i<6;i++)add(g,tbox(.070,.014,.045,light,0,.534,.18-i*.065,.66));
    for(let i=0;i<7;i++){
      const z=.30-i*.12,y=i<3?.89:.85-(i-3)*.055;
      // Low ridge scutes leave the saddle clear and continue down the tail.
      if(z<-.28||z>.19)add(g,cone(.024,.070,scale,0,y,z,5).rotateX(-.35));
    }
    if(!mounted){
      g.scale.setScalar(k);g.userData.sculptKind='drakolithe';
    }
    return g;
  }
  return {
    mount:L=>active(L)&&L.body==='rider'?drake(true):null,
    figure:(op,L)=>active(L)&&L.body==='beast'?drake(false):null,
  };
}
