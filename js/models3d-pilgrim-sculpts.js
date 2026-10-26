// Display sculpts for Primaris Marines, Ratlings and their allies, pilgrims and burrowing Tyranids.
const revisions={angels:'angels-2',ratlings:'ratlings-2',sanctifiers:'sanctifiers-2',raveners:'raveners-2'};
export function createPilgrimSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const dark=()=>mat('#272a30',{rough:.92}),iron=()=>mat('#888f94',{metal:.60,rough:.53});
  const leather=()=>mat('#65513a',{rough:.96}),bone=()=>mat('#cec4a9',{rough:.88});
  function optic(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.25,r*1.25,r*.35,dark(),x,y,z)));
    const eye=sph(r,mat(color,{metal:.15,rough:.30}),x,y,z+r*.22);eye.scale.set(1,.52,.25);add(g,eye);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='angels'){B.tw*=L.scout?.97:1.06;B.td*=1.08;B.head*=1.05;B.armR*=1.04;}
    if(L.team==='ratlings'){
      if(L.body==='ratling'){B.leg*=.84;B.tw*=1.08;B.head*=1.09;B.arm*=.90;}
      if(L.body==='ogryn'){B.tw*=1.07;B.td*=1.08;B.armR*=1.09;B.head*=1.10;}
    }
    if(L.team==='sanctifiers'){B.tw*=.98;B.head*=1.07;B.wk*=.95;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='angels'){
      add(g,tbox(r*1.78,r*1.93,r*1.62,c.main,0,0,-r*.12,.80),
        tbox(r*1.57,r*.38,r*.28,dark(),0,r*.16,r*.77,.76));
      for(const s of [-1,1]){
        optic(g,s*r*.38,r*.15,r*.96,r*.13,'#ae6356');
        add(g,tbox(r*.62,r*.17,r*.28,c.main,s*r*.42,r*.35,r*.70,.69).rotateZ(-s*.17),
          tbox(r*.32,r*.85,r*.47,c.main,s*r*.87,-r*.16,r*.21,.70));
      }
      add(g,tbox(r*.93,r*.72,r*.45,iron(),0,-r*.45,r*.69,.70));
      for(let i=-1;i<=1;i++)add(g,box(r*.10,r*.33,r*.08,dark(),i*r*.24,-r*.45,r*.95));
      if(L.leader)add(g,tbox(r*.24,r*1.5,r*.13,c.trim,0,r*.56,r*.68,.76));
      if(/heavy/.test(n))for(const s of [-1,1])add(g,tbox(r*.45,r*.48,r*.60,c.trim,s*r*.90,-r*.54,-r*.15,.75));
      if(/eliminator/.test(n)){
        for(const s of [-1,1])add(g,tbox(r*.35,r*1.80,r*.84,c.cloth,s*r*.90,r*.19,-r*.28,.72));
        optic(g,-r*.79,r*.06,r*.68,r*.20,'#7b9a7c');
      }
      return true;
    }
    if(L.team==='ratlings'&&['ratling','ogryn'].includes(L.body)){
      const ogryn=L.body==='ogryn';
      const skull=sph(r,c.skin,0,r*.05,-r*.12);skull.scale.set(ogryn?1.10:.94,1.05,.90);add(g,skull);
      add(g,tbox(r*(ogryn?1.88:1.28),r*.66,r*.76,c.skin,0,-r*.54,r*.35,.72));
      for(const s of [-1,1]){
        optic(g,s*r*.37,r*.12,r*.83,r*.085,ogryn?'#867456':'#706d56');
        add(g,tbox(r*.60,r*.19,r*.21,c.skin,s*r*.41,r*.32,r*.68,.66).rotateZ(-s*.12));
        if(!ogryn)add(g,sph(r*.23,c.skin,s*r*.91,-r*.02,-r*.02));
      }
      add(g,tbox(r*.39,r*.30,r*.34,c.skin,0,-r*.02,r*.89,.70),box(r*.50,r*.055,r*.07,dark(),0,-r*.43,r*.89));
      if(!ogryn){
        add(g,tbox(r*1.69,r*.38,r*1.42,mat('#564833'),0,r*.83,-r*.22,.78));
        for(const s of [-1,1])add(g,tbox(r*.23,r*.47,r*.53,mat('#564833'),s*r*.78,r*.46,-r*.31,.7));
        if(/sniper|sneak|big shot/.test(n))for(const s of [-1,1])add(g,tbox(r*.32,r*1.53,r*.78,c.cloth,s*r*.87,r*.30,-r*.38,.74));
      }else if(/bullgryn/.test(n)){
        add(g,tbox(r*2.15,r*.35,r*1.70,c.main,0,r*.87,-r*.12,.80),tbox(r*1.90,r*.18,r*.47,c.trim,0,r*.65,r*.59,.78));
      }
      return true;
    }
    if(L.team==='sanctifiers'){
      const face=sph(r,c.skin,0,r*.03,-r*.10);face.scale.set(.88,1.06,.88);add(g,face);
      add(g,tbox(r*1.18,r*.59,r*.65,c.skin,0,-r*.57,r*.31,.71));
      for(const s of [-1,1]){
        optic(g,s*r*.32,r*.13,r*.80,r*.08,'#756453');
        add(g,box(r*.45,r*.10,r*.12,mat('#796d5d'),s*r*.33,r*.31,r*.74).rotateZ(-s*.16));
        add(g,tbox(r*.39,r*1.85,r*.91,c.cloth,s*r*.87,r*.12,-r*.30,.72));
      }
      add(g,tbox(r*1.80,r*.36,r*1.46,c.cloth,0,r*.91,-r*.25,.74));
      if(/confessor|abbot|preacher/.test(n))add(g,tbox(r*1.12,r*.44,r*.28,mat('#a69d8c',{rough:1}),0,-r*.73,r*.53,.57));
      if(/assassin|persecutor/.test(n))add(g,tbox(r*1.32,r*.63,r*.29,dark(),0,-r*.37,r*.70,.71));
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=leather())=>add(upper,tbox(.07*k,.085*k,.045*k,color,x,y,z,.80),box(.05*k,.012*k,.05*k,iron(),x,y+.026*k,z));
    if(L.team==='angels'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.39,B.th*.40,.035*k,M.trim,s*B.tw*.24,torsoY,f+.02*k,.77),tbox(B.tw*.31,B.th*.30,.04*k,M.main,s*B.tw*.24,torsoY,f+.045*k,.77));
        add(fig,tbox(B.legR*1.6,B.leg*.29,.03*k,M.main,s*B.tw*.32,B.leg*.25,(s===-1?.06:-.05)*k+B.legR*.84,.78));
        pouch(s*B.tw*.38,hipY,f*.70);
      }
      if(/heavy/.test(n))for(const s of [-1,1])add(upper,tbox(.14*k,.12*k,.17*k,M.main,s*B.sx,shY+.02*k,0,.75));
      if(/grenadier/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.024*k,.024*k,.095*k,iron(),i*.06*k,torsoY,f+.085*k));
      if(/captain/.test(n))for(const s of [-1,1])add(upper,tbox(.06*k,.18*k,.025*k,M.cloth,s*.055*k,hipY*.74,f*.7,.68));
      if(/eliminator/.test(n))for(let i=-1;i<=1;i++)add(upper,tbox(.025*k,.10*k,.025*k,M.trim,i*.05*k,torsoY,f+.075*k,.70));
    }
    if(L.team==='ratlings'){
      if(L.body==='ratling'){
        for(const s of [-1,1]){
          add(upper,limb(V(s*B.tw*.35,shY,f*.85),V(s*B.tw*.22,hipY,f),.012*k,leather()));
          pouch(s*B.tw*.37,hipY,f*.70);
        }
        if(/bomber/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.022*k,.022*k,.08*k,iron(),i*.05*k,torsoY,f+.07*k));
        if(/spotter/.test(n))add(upper,tz(cyl(.033*k,.033*k,.06*k,iron(),B.tw*.40,torsoY,f+.025*k)));
        if(/vox-thief/.test(n))add(upper,tbox(.12*k,.15*k,.09*k,M.main,0,torsoY,-f-.09*k,.76),box(.008*k,.27*k,.008*k,iron(),B.tw*.28,shY+.08*k,-f-.10*k));
        if(/stashmaster|fixer/.test(n))for(const s of [-1,1])pouch(s*B.tw*.53,hipY,0);
      }else if(L.body==='ogryn'){
        for(const s of [-1,1]){
          add(upper,tbox(B.tw*.36,B.th*.42,.045*k,iron(),s*B.tw*.24,torsoY,f+.03*k,.68));
          add(upper,tbox(.18*k,.12*k,.19*k,M.main,s*B.sx,shY+.025*k,0,.68));
          pouch(s*B.tw*.38,hipY,f*.70);
          for(let i=0;i<3;i++)add(upper,sph(.012*k,M.trim,s*B.tw*.24+(i-1)*.065*k,torsoY+B.th*.12,f+.06*k));
        }
      }
    }
    if(L.team==='sanctifiers'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.27,B.th*.65,.022*k,M.cloth,s*B.tw*.32,torsoY,f+.02*k,.72).rotateZ(s*.14));
        pouch(s*B.tw*.39,hipY,f*.65);
        for(let i=0;i<4;i++)add(upper,sph(.008*k,mat('#6f5c43'),s*B.tw*.20,torsoY+(.09-i*.04)*k,f+.04*k));
      }
      add(upper,tbox(.07*k,.095*k,.025*k,M.trim,0,torsoY-B.th*.12,f+.045*k,.72));
      if(/salvationist/.test(n))pouch(B.tw*.52,hipY,0,bone());
      if(/reliquant|confessor/.test(n))add(upper,tbox(.12*k,.14*k,.065*k,mat('#a38b5d'),B.tw*.49,hipY,0,.72));
      if(/conflagrator|missionary/.test(n))for(const s of [-1,1])add(upper,cyl(.025*k,.025*k,.16*k,iron(),s*.06*k,torsoY,-f-.13*k));
    }
  }
  function finish(fig,L){
    if(!revision(L)||fig.userData.humanoid)return;
    if(L.team==='ratlings'&&L.body==='beast'){
      for(const s of [-1,1])add(fig,limb(V(s*.10,.43,.13),V(s*.12,.31,.01),.012,leather()),tbox(.018,.05,.07,iron(),s*.135,.38,.08,.75));
      add(fig,tbox(.10,.03,.15,dark(),0,.52,.46,.72),sph(.025,dark(),0,.535,.555));
    }
    if(L.team==='sanctifiers'&&L.body==='cherub'){
      add(fig,tbox(.10,.11,.055,bone(),0,.65,.125,.70));
      for(const s of [-1,1])add(fig,limb(V(s*.08,.72,0),V(s*.10,.60,.07),.006,iron()));
    }
    if(L.team==='raveners'){
      const plate=mat(L.main,{rough:.72}),flesh=mat(L.skin,{rough:.9}),edge=mat(L.trim,{rough:.82});
      const crest=sph(.12,plate,0,1.025,.16);crest.scale.set(.90,.60,1.65);add(fig,crest);
      add(fig,tbox(.14,.065,.20,plate,0,.970,.33,.63),tbox(.12,.014,.18,dark(),0,.928,.34,.66),tbox(.11,.035,.16,flesh,0,.907,.33,.63));
      for(const s of [-1,1]){
        optic(fig,s*.081,.985,.295,.014,'#b67463');
        for(let i=0;i<4;i++)add(fig,cone(.005,.020,edge,s*.046,.921,.28+i*.034,4).rotateZ(Math.PI));
        add(fig,limb(V(s*.065,.93,.33),V(s*.10,.89,.39),.015,flesh,.008));
        for(let i=0;i<4;i++)add(fig,tbox(.095,.035,.026,edge,s*.083,.86-i*.05,.245,.63).rotateZ(s*.20));
        // A third small limb pair makes the six-limbed anatomy readable beneath the weapon arms.
        add(fig,limb(V(s*.13,.66,.11),V(s*.22,.57,.21),.018,flesh,.013),limb(V(s*.22,.57,.21),V(s*.19,.55,.30),.013,flesh,.006));
        for(let i=0;i<2;i++)add(fig,aimY(cone(.006,.045,edge,s*(.18+i*.025),.55,.32,5),V(0,-.2,1)));
      }
      const tail=[V(.25,.06,-.60),V(-.25,.08,-.38),V(-.15,.12,.05),V(.05,.35,.10),V(0,.65,.12)];
      for(let i=1;i<tail.length;i++){
        const p=tail[i],previous=tail[i-1];
        for(let j=0;j<3;j++){
          const at=previous.clone().lerp(p,(j+1)/4);
          const shell=sph(.055+i*.017,plate,at.x,at.y+.025,at.z);shell.scale.set(1.08,.75,1.10);add(fig,shell);
        }
      }
      if(/venomspitter/.test(L.name.toLowerCase()))for(const s of [-1,1])add(fig,sph(.035,mat('#78866a'),s*.10,.73,.25));
      if(/prime|tremorscythe/.test(L.name.toLowerCase()))for(let i=0;i<3;i++)add(fig,tbox(.06,.018,.055,edge,0,1.075-i*.02,.11-i*.055,.65));
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='angels')add(g,tbox(.07,.025,.15,iron(),0,.075,-.03,.78));
    if(L.team==='ratlings')add(g,tbox(.055,.022,.13,leather(),0,.07,-.04,.76));
    if(L.team==='sanctifiers')add(g,tbox(.045,.03,.07,mat(L.trim,{metal:.5}),0,.067,-.045,.72));
  }
  return {revision,proportions,head,body,finish,weapon};
}
