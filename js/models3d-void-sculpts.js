// Dedicated display sculpts for void crews, prospectors, covert Marines and the Gellerpox crew.
const revisions={gellerpox:'gellerpox-2',hearthkyn:'hearthkyn-2',navyBreachers:'navy-breachers-2',phobos:'phobos-2'};
export function createVoidTeamSculpts(h){
  const {THREE,V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY,DARK,METAL}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const iron=()=>mat('#656c72',{metal:.55,rough:.60});
  const rubber=()=>mat('#292f32',{rough:.95});
  const leather=()=>mat('#5c4e36',{rough:.95});
  function optic(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.2,r*1.2,r*.34,rubber(),x,y,z-r*.12)));
    const eye=sph(r,mat(color,{metal:.20,rough:.30}),x,y,z+r*.10);eye.scale.set(1,.66,.28);add(g,eye);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='gellerpox'){B.tw*=L.bloated?1.12:1.04;B.td*=1.12;B.head*=1.12;B.armR*=1.08;}
    if(L.team==='hearthkyn'){B.tw*=1.10;B.td*=1.10;B.legR*=1.07;B.head*=1.06;B.th*=.94;}
    if(L.team==='navyBreachers'){B.tw*=1.08;B.td*=1.12;B.armR*=1.06;B.head*=1.08;}
    if(L.team==='phobos'){B.tw*=.94;B.td*=.94;B.head*=1.04;B.wk*=.97;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;const r=B.head;
    if(L.team==='gellerpox'&&L.body==='guard'){
      const skull=sph(r,c.skin,0,r*.08,-r*.10);skull.scale.set(L.bloated?1.18:1.03,1.03,.90);add(g,skull);
      add(g,tbox(r*1.6,r*.70,r*.84,c.skin,0,-r*.48,r*.40,.73),tbox(r*1.38,r*.20,r*.17,rubber(),0,-r*.33,r*.91,.75));
      for(const s of [-1,1]){
        add(g,tbox(r*.60,r*.23,r*.35,c.skin,s*r*.43,r*.40,r*.69,.7).rotateZ(-s*.16));
        optic(g,s*r*.42,r*.17,r*.83,r*(L.daemon?.18:.12),L.daemon?'#a86499':'#9b9a50');
      }
      for(let i=-1;i<=1;i++)add(g,tbox(r*.14,r*.14,r*.09,mat('#d1c398',{rough:.9}),i*r*.27,-r*.37,r*1.02,.7));
      if(L.bloated){
        add(g,tbox(r*.82,r*.90,r*.12,iron(),-r*.48,r*.02,r*.80,.78));
        for(const y of [-.3,.3])add(g,sph(r*.07,METAL(),-r*.72,y*r,r*.91));
      }else if(L.daemon){
        for(const s of [-1,1])add(g,aimY(cone(r*.18,r*.90,mat('#78714c'),s*r*.76,r*.85,-r*.12,6),V(s*.3,1,-.2)));
      }
      return true;
    }
    if(L.team==='hearthkyn'&&L.body==='votann'){
      add(g,tbox(r*1.88,r*1.80,r*1.65,c.skin,0,-r*.06,0,.87),
        tbox(r*1.45,r*.55,r*.40,mat('#a6a095',{rough:.95}),0,-r*.72,r*.56,.65));
      const cap=sph(r*1.16,c.main,0,r*.42,-r*.17);cap.scale.set(1,.76,1.04);add(g,cap);
      add(g,tbox(r*1.92,r*.30,r*.30,rubber(),0,r*.10,r*.83,.9),
        tbox(r*1.7,r*.19,r*.44,c.main,0,r*.36,r*.69,.9));
      for(const s of [-1,1]){
        optic(g,s*r*.38,r*.05,r*1.02,r*.14,'#4e96a4');
        add(g,cyl(r*.29,r*.29,r*.27,iron(),s*r*1.05,-r*.10,0).rotateZ(Math.PI/2));
      }
      for(let i=-1;i<=1;i++)add(g,box(r*.12,r*.24,r*.08,rubber(),i*r*.24,-r*.62,r*.83));
      return true;
    }
    if(L.team==='navyBreachers'&&L.body==='guard'){
      add(g,tbox(r*1.80,r*1.92,r*1.60,c.main,0,0,-r*.08,.88),
        tbox(r*1.65,r*.70,r*.34,rubber(),0,r*.06,r*.77,.85));
      const glass=tbox(r*1.40,r*.45,r*.13,mat('#6a999f',{metal:.15,rough:.26}),0,r*.10,r*.99,.88);add(g,glass);
      add(g,tbox(r*1.52,r*.46,r*.45,iron(),0,-r*.57,r*.64,.82),
        box(r*.55,r*.12,r*.10,rubber(),0,-r*.55,r*.91));
      for(const s of [-1,1])add(g,cyl(r*.30,r*.30,r*.28,iron(),s*r*.98,-r*.18,0).rotateZ(Math.PI/2));
      return true;
    }
    if(L.team==='phobos'&&L.body==='marine'){
      add(g,tbox(r*1.80,r*1.90,r*1.60,c.main,0,0,-r*.10,.82),
        tbox(r*1.60,r*.40,r*.30,rubber(),0,r*.08,r*.80,.85),
        tbox(r*1.48,r*.22,r*.42,c.main,0,r*.30,r*.69,.85));
      const reiver=/reiver/i.test(L.name),incursor=/incursor/i.test(L.name);
      if(incursor){
        for(let i=-1;i<=1;i++)optic(g,i*r*.40,r*.08,r*.98,r*.12,'#639a79');
      }else for(const s of [-1,1])optic(g,s*r*.38,r*.06,r*.99,r*.13,'#ad5544');
      add(g,tbox(r*(reiver?1.36:.95),r*.76,r*.42,reiver?mat('#c7c8bc',{rough:.70}):rubber(),0,-r*.52,r*.70,.68));
      for(let i=-1;i<=1;i++)add(g,box(r*.09,r*.28,r*.08,rubber(),i*r*.27,-r*.56,r*.96));
      if(!reiver)add(g,tz(cyl(r*.18,r*.22,r*.55,iron(),r*.83,-r*.26,r*.49)));
      if(L.leader)add(g,box(r*.22,r*.10,r*1.15,c.trim,0,r*.96,-r*.10));
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,head,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const front=B.td/2,back=-front,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=leather())=>add(upper,tbox(.07*k,.08*k,.045*k,color,x,y,z,.87),box(.052*k,.012*k,.050*k,iron(),x,y+.023*k,z+.002*k));
    if(L.team==='gellerpox'){
      const patch=mat('#79694e',{rough:.96});
      for(let i=0;i<3;i++)add(upper,tbox(B.tw*.28,B.th*.19,.02*k,patch,(i-1)*B.tw*.25,torsoY-(i%2)*.06*k,front+.018*k,.74).rotateZ((i-1)*.12));
      if(L.bloated){
        add(upper,tbox(B.tw*.40,B.th*.32,.04*k,iron(),-B.tw*.26,torsoY+.055*k,front+.02*k,.7));
        for(const s of [-1,1])add(upper,sph(.014*k,mat('#837448',{metal:.25,rough:.85}),-B.tw*.26+s*.045*k,torsoY+.08*k,front+.05*k));
        const len=/lumberghast/.test(n)?.21:.14;
        add(upper,tbox(B.armR*2.7,len*k,B.armR*2.6,patch,B.sx,shY-.02*k,0,.72));
      }
      if(/vulgrar/.test(n))for(const s of [-1,1])add(upper,cyl(.035*k,.04*k,.17*k,iron(),s*.085*k,torsoY+.12*k,back-.09*k));
      if(/fleshscreamer/.test(n))add(head,tbox(B.head*.8,B.head*.45,.012*k,rubber(),0,-B.head*.50,B.head*.96,.65));
      if(/mutant/.test(n))pouch(-B.tw*.36,hipY+.02*k,front+.025*k);
    }
    if(L.team==='hearthkyn'){
      const armour=mat(L.main,{metal:.2,rough:.65});
      for(const s of [-1,1]){
        add(upper,tbox(B.armR*3.25,B.armR*2.8,B.armR*3.4,armour,s*(B.sx+.008*k),shY+.015*k,0,.88));
        add(fig,tbox(B.legR*1.9,hipY*.27,.03*k,armour,s*B.tw*.31,hipY*.30,.07*k,.82));
      }
      if(/medic/.test(n))pouch(-B.tw*.45,hipY+.025*k,front+.03*k,mat('#d9d4bf',{rough:.9}));
      else if(/grenadier/.test(n))for(let i=0;i<3;i++)add(upper,cyl(.018*k,.020*k,.075*k,iron(),(i-1)*.05*k,torsoY-.045*k,front+.045*k));
      else if(/lugger/.test(n))for(const s of [-1,1])add(upper,box(.018*k,B.th*.85,.014*k,rubber(),s*B.tw*.26,torsoY,back-.205*k));
      else if(/kinlynk|kognit|lok/.test(n)){
        add(upper,tbox(.085*k,.065*k,.055*k,iron(),B.sx,shY+.04*k,.025*k,.86));
        optic(upper,B.sx,shY+.05*k,.065*k,.014*k,'#438d97');
      }else if(/dôzr|dozr/.test(n))for(const s of [-1,1])add(upper,tbox(.065*k,.035*k,.065*k,iron(),s*B.sx,shY+.08*k,.025*k,.8));
      else if(/gunner/.test(n))pouch(B.tw*.45,hipY+.03*k,front+.01*k,rubber());
    }
    if(L.team==='navyBreachers'){
      const armour=mat(L.main,{metal:.24,rough:.65});
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.39,B.th*.44,.03*k,armour,s*B.tw*.22,torsoY+.04*k,front+.03*k,.84));
        add(upper,limb(V(s*.06*k,torsoY+.12*k,back-.08*k),V(s*.09*k,shY-.05*k,.04*k),.012*k,rubber()));
      }
      if(/endurant/.test(n))for(const s of [-1,1])add(upper,tbox(B.armR*3.5,B.armR*2.5,B.armR*3.4,iron(),s*B.sx,shY+.02*k,0,.85));
      else if(/hatchcutter|axejack/.test(n)){
        pouch(-B.tw*.40,hipY+.025*k,front+.035*k,iron());
        for(let i=0;i<3;i++)add(upper,box(.012*k,.07*k,.018*k,iron(),B.tw*.33+i*.018*k,torsoY-.04*k,front+.035*k));
      }else if(/surveyor|jammer/.test(n)){
        add(upper,tbox(.10*k,.07*k,.055*k,rubber(),-B.sx,shY+.01*k,.02*k,.85));
        optic(upper,-B.sx,shY+.01*k,.055*k,.018*k,'#52979c');
      }else if(/grenadier/.test(n))for(let i=0;i<3;i++)add(upper,cyl(.020*k,.020*k,.075*k,iron(),(i-1)*.05*k,hipY+.04*k,front+.05*k));
      else if(L.leader)add(upper,box(.07*k,.018*k,.012*k,M.trim,-B.tw*.22,torsoY+.10*k,front+.05*k));
    }
    if(L.team==='phobos'){
      const armour=mat(L.main,{metal:.17,rough:.71});
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.34,B.th*.31,.020*k,armour,s*B.tw*.24,torsoY+.05*k,front+.015*k,.76));
        pouch(s*B.tw*.42,hipY+.025*k,front+.015*k,rubber());
      }
      if(/helix/.test(n))pouch(-B.tw*.43,torsoY-.08*k,front+.045*k,mat('#d8d8cf',{rough:.9}));
      else if(/saboteur|minelayer/.test(n))for(let i=0;i<2;i++)add(upper,tbox(.055*k,.07*k,.035*k,iron(),(i?1:-1)*B.tw*.24,torsoY-.075*k,front+.05*k,.86));
      else if(/commsman|voxbreaker/.test(n))for(const s of [-1,1])add(upper,cyl(.004*k,.006*k,.24*k,iron(),s*.07*k,shY+.10*k,back-.075*k));
      else if(/marksman/.test(n))add(head,tz(cyl(B.head*.18,B.head*.22,B.head*.60,rubber(),-B.head*.80,B.head*.30,B.head*.55)));
      else if(/veteran/.test(n))add(upper,tbox(.065*k,.08*k,.014*k,iron(),-B.tw*.24,torsoY+.055*k,front+.03*k,.78));
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='phobos')add(g,tbox(.04,.018,.09,rubber(),0,.059,.075,.88),box(.007,.008,.065,iron(),0,.071,.075));
    if(L.team==='navyBreachers')for(const s of [-1,1])add(g,tbox(.006,.025,.065,iron(),s*.028,.021,.07,.84));
    if(L.team==='hearthkyn')add(g,tbox(.035,.026,.055,mat(L.main,{metal:.2,rough:.65}),0,.047,.07,.85));
    if(L.team==='gellerpox')add(g,tbox(.008,.023,.045,mat('#846344',{rough:.95}),.03,.018,.06,.70));
  }
  function figure(op,L){
    if(!revision(L)||L.team!=='gellerpox')return null;
    const n=L.name.toLowerCase(),g=new THREE.Group(),shell=mat('#6e7850',{rough:.83}),skin=mat('#a79b78',{rough:.93});
    if(/cursemite/.test(n)){
      const back=sph(.13,shell,0,.14,0);back.scale.set(1,.72,1.25);add(g,back,sph(.075,skin,0,.12,.14));
      for(const s of [-1,1])for(let i=0;i<3;i++){
        const a=V(s*.08,.13,.08-i*.08),b=V(s*.19,.11,.11-i*.09),end=V(s*.24,.02,.15-i*.12);
        add(g,limb(a,b,.014,shell,.010),limb(b,end,.010,shell,.003));
      }
      for(const s of [-1,1])add(g,aimY(cone(.015,.08,skin,s*.045,.10,.20,6),V(-s*.25,0,1)));
      g.userData.sculptKind='cursemite';return g;
    }
    if(/eyestinger/.test(n)){
      for(let i=0;i<3;i++){
        const x=(i-1)*.17,z=i%2?.10:-.06,y=.20+i*.045;
        add(g,cyl(.003,.003,y,mat('#9cb0a8',{opacity:.35}),x,y/2,z),sph(.055,shell,x,y,z),sph(.040,skin,x,y,z+.06));
        for(const s of [-1,1]){
          const wing=sph(.07,mat('#c4c9b2',{opacity:.48,rough:.8}),x+s*.06,y+.035,z-.02);wing.scale.set(1.35,.12,.65);add(g,wing);
        }
      }
      g.userData.sculptKind='eyestinger-swarm';return g;
    }
    if(/sludge.grub/.test(n)){
      for(let i=0;i<7;i++){
        const a=i*.32,p=sph(.075-i*.004,i%2?shell:skin,Math.sin(a)*.09,.075,.21-i*.06);p.scale.set(1,.83,1.15);add(g,p);
      }
      for(const s of [-1,1])add(g,limb(V(s*.035,.11,.22),V(s*.06,.18,.28),.009,shell,.003));
      g.userData.sculptKind='sludge-grub';return g;
    }
    return null;
  }
  function finish(fig,L){
    if(!revision(L)||fig.userData.humanoid||fig.userData.sculptKind)return;
    if(L.team==='navyBreachers'&&L.body==='gadget'){
      add(fig,tbox(.20,.045,.20,iron(),0,.205,0,.87));
      for(const s of [-1,1])add(fig,box(.014,.012,.20,mat('#b6a479'),s*.085,.23,0));
    }
    if(L.team==='navyBreachers'&&L.body==='skull'){
      add(fig,tbox(.12,.04,.08,iron(),0,.93,-.025,.80));optic(fig,.05,.80,.15,.025,'#a8774d');
    }
  }
  return {revision,proportions,head,body,weapon,figure,finish};
}
