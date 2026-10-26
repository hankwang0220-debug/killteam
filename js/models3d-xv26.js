// XV26 gallery silhouette based on GW's Dead Silence reveal photographs, 3 October 2025:
// https://www.warhammer-community.com/en-gb/articles/zhqmtpi6/wolf-scouts-and-stealth-battlesuits-fight-as-quietly-as-possible-in-kill-team-dead-silence/
// Integrated egg-shaped upper shell, one optic, black articulated limbs and forearm-mounted weapons.
export function createXV26Sculpts(h){
  const {THREE,V,mat,box,tbox,cyl,sph,limb,add,tz,aimY,aimZ}=h;
  let shellGeometry;
  function angularShell(material){
    if(!shellGeometry){
      // Keep the long integrated shell, with broad planar cheeks and a chamfered crown.
      const rings=[
        [.89,.065,.080,.045],[1.04,.150,.180,.025],[1.22,.187,.198,.015],
        [1.37,.145,.163,-.005],[1.455,.075,.090,-.018],[1.485,.035,.045,-.020],
      ];
      const points=rings.map(([y,rx,rz,z])=>Array.from({length:12},(_,i)=>{
        const angle=(i+.5)*Math.PI/6;return V(Math.sin(angle)*rx,y,z+Math.cos(angle)*rz);
      }));
      const positions=[],normals=[];
      const triangle=(a,b,c,normal)=>{
        for(const p of [a,b,c]){positions.push(p.x,p.y,p.z);normals.push(normal.x,normal.y,normal.z);}
      };
      for(let j=0;j<points.length-1;j++)for(let i=0;i<12;i++){
        const a=points[j][i],b=points[j][(i+1)%12],c=points[j+1][(i+1)%12],d=points[j+1][i];
        const normal=V().subVectors(b,a).cross(V().subVectors(d,a)).normalize();
        triangle(a,b,d,normal);triangle(b,c,d,normal);
      }
      for(const [j,normal]of [[0,V(0,-1,0)],[points.length-1,V(0,1,0)]]){
        const center=V(0,rings[j][0],rings[j][3]);
        for(let i=0;i<12;i++){
          const a=points[j][i],b=points[j][(i+1)%12];
          triangle(center,j===0?b:a,j===0?a:b,normal);
        }
      }
      shellGeometry=new THREE.BufferGeometry();
      shellGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      shellGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
      shellGeometry.computeBoundingSphere();
    }
    const mesh=new THREE.Mesh(shellGeometry,material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
  }
  function figure(op,L,picks){
    if(!L.refined||L.team!=='stealthSuits'||L.body!=='battlesuit')return null;
    const g=new THREE.Group(),n=L.name.toLowerCase();
    const white=mat(L.main,{metal:.12,rough:.72}),red=mat(L.trim,{metal:.12,rough:.75});
    const black=mat('#282e32',{metal:.25,rough:.80}),joint=mat('#424b50',{metal:.45,rough:.59});
    const seam=mat('#747a77',{rough:.85}),glass=mat('#388b9c',{metal:.22,rough:.24});
    function egg(r,m,x,y,z,sx,sy,sz){const o=sph(r,m,x,y,z);o.scale.set(sx,sy,sz);add(g,o);return o;}
    // Narrow black waist and pelvis are clearly exposed beneath the upper shell.
    add(g,tbox(.26,.31,.20,black,0,.91,-.015,.78),tbox(.28,.17,.19,black,0,.70,0,.83));
    add(g,tbox(.11,.13,.035,white,0,.70,.111,.50),tz(cyl(.039,.039,.018,red,0,.80,.125)));
    add(g,box(.008,.045,.009,white,0,.80,.138));
    // The head and torso form a continuous carapace. There is no separate neck or broad human chest.
    add(g,angularShell(white));
    add(g,tbox(.205,.29,.095,white,0,1.025,.170,.35));
    for(const s of [-1,1]){
      add(g,limb(V(s*.147,1.40,.045),V(s*.166,1.18,.116),.003,seam));
      add(g,limb(V(s*.080,1.14,.224),V(s*.033,.914,.214),.0025,seam));
      for(let i=0;i<3;i++)add(g,box(.028-i*.004,.008,.009,black,s*.045,1.065-i*.043,.224).rotateZ(-s*.30));
    }
    // One vertical optical assembly is recessed into a red bezel, as on the official models.
    add(g,tbox(.126,.164,.030,red,0,1.267,.198,.76),tbox(.083,.116,.023,black,0,1.267,.220,.77));
    add(g,tz(cyl(.029,.029,.014,joint,0,1.279,.239)),tz(cyl(.021,.021,.016,glass,0,1.279,.248)),
      sph(.006,mat('#c7e4e2',{rough:.24}),-.006,1.288,.258),tz(cyl(.009,.009,.012,glass,0,1.234,.242)));
    // Sloping shoulder shells sit below the top of the integrated central carapace.
    for(const s of [-1,1]){
      egg(.105,black,s*.224,1.135,-.005,1,.85,1.0);
      const pad=egg(.147,white,s*.263,1.147,.0,1.10,.66,1.07);pad.rotation.z=-s*.63;
      const badge=cyl(.026,.026,.008,seam,s*.282,1.202,.114);badge.rotation.x=Math.PI/2;add(g,badge);
      add(g,tz(cyl(.016,.016,.009,white,s*.282,1.202,.122)));
      for(let i=0;i<2;i++)add(g,sph(.005,joint,s*.260+(i-.5)*.050,1.143,.126));
    }
    if(/shas.vre/.test(n))add(g,tbox(.11,.055,.025,red,.228,1.216,.114,.70).rotateZ(-.28));
    // Dark thighs and shins with small plates and white split feet; avoid Marine-style boots and kneecaps.
    for(const s of [-1,1]){
      const hip=V(s*.112,.68,0),knee=V(s*.158,.397,s<0?.052:-.018),ankle=V(s*.163,.115,s<0?-.012:-.074);
      add(g,sph(.060,joint,hip.x,hip.y,hip.z),limb(hip,knee,.063,black,.050),sph(.053,joint,knee.x,knee.y,knee.z),limb(knee,ankle,.041,black,.030));
      add(g,tbox(.070,.11,.027,white,s*.166,.555,knee.z+.047,.67).rotateZ(-s*.08));
      add(g,tz(cyl(.031,.031,.020,joint,knee.x,knee.y,knee.z+.038)),tz(cyl(.019,.019,.023,black,knee.x,knee.y,knee.z+.050)));
      add(g,tbox(.045,.075,.027,seam,s*.181,.278,knee.z+.017,.68),tbox(.062,.055,.068,white,ankle.x,.104,ankle.z+.016,.75));
      for(const j of [-1,1])add(g,tbox(.050,.050,.13,white,ankle.x+j*.028,.039,ankle.z+.056,.75));
      add(g,box(.012,.023,.10,black,ankle.x,.043,ankle.z+.071));
    }
    // Primary cannon mounts to the right forearm, with the other arm operating a controller or equipment.
    const shoulderR=V(-.235,1.125,-.005),elbowR=V(-.288,.937,.064),wristR=V(-.304,.824,.169);
    add(g,limb(shoulderR,elbowR,.045,black,.036),sph(.037,joint,elbowR.x,elbowR.y,elbowR.z),limb(elbowR,wristR,.037,black,.030));
    add(g,aimY(tbox(.095,.15,.080,white,-.297,.885,.119,.76),wristR.clone().sub(elbowR)));
    if(picks.ranged){
      let weapon;
      if(/burst cannon/i.test(picks.ranged.n)){
        weapon=new THREE.Group();
        add(weapon,tz(cyl(.061,.057,.22,white,0,0,.07)),tz(cyl(.064,.064,.018,black,0,0,.185)),tz(cyl(.052,.052,.018,joint,0,0,.198)));
        for(let i=0;i<3;i++){
          const angle=i*Math.PI*2/3+Math.PI/2,x=Math.cos(angle)*.028,y=Math.sin(angle)*.028;
          add(weapon,tz(cyl(.018,.018,.023,joint,x,y,.211)),tz(cyl(.012,.012,.025,black,x,y,.220)));
        }
        add(weapon,tbox(.025,.08,.009,red,0,.023,.10,.8));
      }else{
        weapon=new THREE.Group();
        add(weapon,tbox(.105,.115,.20,white,0,0,.06,.78),tbox(.125,.135,.13,black,0,0,.217,.84));
        for(const s of [-1,1]){
          add(weapon,tz(cyl(.023,.023,.019,joint,s*.029,.018,.289)),tz(cyl(.015,.015,.022,darkMetal(),s*.029,.018,.299)));
          for(let i=0;i<4;i++)add(weapon,box(.007,.075,.012,glass,s*.065,0,.166+i*.026));
        }
        add(weapon,tbox(.025,.07,.009,red,0,.040,.085,.80));
      }
      weapon.position.set(-.305,.785,.190);weapon.scale.setScalar(1.40);aimZ(weapon,V(-.18,-.35,1));add(g,weapon);
    }
    const shoulderL=V(.235,1.125,-.005),elbowL=V(.300,.970,.010),handL=V(.267,1.008,.239);
    add(g,limb(shoulderL,elbowL,.045,black,.036),sph(.037,joint,elbowL.x,elbowL.y,elbowL.z),limb(elbowL,handL,.036,black,.026));
    add(g,aimY(tbox(.095,.145,.078,white,.285,.990,.134,.76),handL.clone().sub(elbowL)),tbox(.067,.052,.055,black,handL.x,handL.y,handL.z,.72));
    for(let i=-1;i<=1;i++)add(g,limb(V(handL.x+i*.018,handL.y-.025,handL.z+.017),V(handL.x+i*.018,handL.y-.053,handL.z+.039),.008,black,.005));
    // Paired narrow rear modules and restrained antennae are part of the compact suit, not a large jetpack.
    for(const s of [-1,1]){
      add(g,tbox(.105,.29,.085,white,s*.132,1.154,-.178,.79));
      for(let i=0;i<4;i++)add(g,box(.063,.010,.010,black,s*.132,1.245-i*.055,-.226));
      add(g,tz(cyl(.030,.030,.017,joint,s*.13,1.039,-.226)));
    }
    add(g,box(.012,.26,.035,red,-.095,1.473,-.158),box(.004,.21,.004,joint,.116,1.425,-.205));
    // The specialist equipment is kept on the forearm or belt to preserve the shared suit shell.
    if(/shas.vre|neutraliser/.test(n)){
      const sensor=tbox(.11,.060,.15,black,.284,1.046,.165,.80);sensor.rotation.z=-.12;add(g,sensor);
      for(let i=0;i<3;i++)add(g,box(.070,.008,.012,glass,.284,1.080,.123+i*.038));
    }
    if(/designator/.test(n)){
      add(g,tbox(.055,.060,.095,red,.270,1.043,.209,.75),tz(cyl(.018,.018,.019,glass,.270,1.043,.267)));
    }
    if(/liberator/.test(n)){
      add(g,cyl(.045,.045,.022,black,.219,.753,.073).rotateX(Math.PI/2),tz(cyl(.023,.023,.025,red,.219,.753,.093)));
    }
    if(/lodestar/.test(n)){
      add(g,tbox(.063,.095,.060,red,.209,.766,.040,.75),box(.004,.16,.004,joint,.210,.889,.035));
    }
    if(picks.ranged2){
      const holster=tbox(.054,.12,.038,black,-.197,.657,-.025,.76);holster.rotation.z=.18;add(g,holster);
    }
    g.userData.sculptKind='xv26';
    return g;
  }
  const darkMetal=()=>mat('#17242b',{metal:.45,rough:.48});
  return {figure};
}
