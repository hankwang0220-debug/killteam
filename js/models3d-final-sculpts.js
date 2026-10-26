// Dedicated display details for the final three teams. Requisitioned allies keep their own faction.
const revisions={stealthSuits:'stealth-suits-3',wolfScouts:'wolf-scouts-2',inquisitorialAgents:'inquisition-2'};
export function createFinalSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const dark=()=>mat('#252b30',{rough:.92}),iron=()=>mat('#90979a',{metal:.62,rough:.49});
  const leather=()=>mat('#655039',{rough:.96}),bone=()=>mat('#cfc3a5',{rough:.86});
  const fur=()=>mat('#777b75',{rough:1});
  function optic(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.27,r*1.27,r*.35,dark(),x,y,z)));
    const eye=sph(r,mat(color,{metal:.18,rough:.28}),x,y,z+r*.22);eye.scale.set(1,.52,.25);add(g,eye);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='wolfScouts'){B.tw*=1.03;B.head*=1.07;B.armR*=1.04;B.wk*=.96;}
    if(L.team==='inquisitorialAgents'){B.head*=1.06;B.tw*=.98;B.wk*=.96;}
  }
  function face(g,r,c){
    const skull=sph(r,c.skin,0,r*.04,-r*.12);skull.scale.set(.93,1.05,.88);add(g,skull);
    add(g,tbox(r*1.27,r*.61,r*.68,c.skin,0,-r*.55,r*.30,.71));
    for(const s of [-1,1]){
      optic(g,s*r*.34,r*.13,r*.81,r*.085,'#716c5b');
      add(g,tbox(r*.48,r*.12,r*.15,mat('#6e5c4b'),s*r*.35,r*.32,r*.72,.70).rotateZ(-s*.15));
    }
    add(g,tbox(r*.33,r*.29,r*.27,c.skin,0,-r*.03,r*.83,.70),box(r*.43,r*.05,r*.07,dark(),0,-r*.42,r*.85));
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='wolfScouts'&&L.body==='marine'){
      face(g,r,c);
      const beard=mat(/skjald/.test(n)?'#aaa99c':'#8c6842',{rough:1});
      add(g,tbox(r*1.19,r*.65,r*.37,beard,0,-r*.71,r*.57,.55));
      for(let i=-1;i<=1;i++)add(g,tbox(r*.13,r*.39,r*.10,mat('#655e50'),i*r*.28,-r*.72,r*.80,.65));
      for(const s of [-1,1]){
        add(g,tbox(r*.26,r*.83,r*.55,beard,s*r*.78,-r*.09,-r*.01,.67));
        add(g,limb(V(s*r*.74,r*.53,-r*.32),V(s*r*.95,-r*.73,-r*.48),r*.12,beard,r*.08),cyl(r*.13,r*.13,r*.16,c.trim,s*r*.94,-r*.60,-r*.46));
      }
      add(g,tbox(r*1.56,r*.31,r*1.35,beard,0,r*.85,-r*.22,.78));
      if(L.leader){
        const pelt=sph(r,fur(),0,r*.81,-r*.47);pelt.scale.set(1.07,.52,.86);add(g,pelt);
        for(const s of [-1,1])add(g,cone(r*.16,r*.42,fur(),s*r*.66,r*1.34,-r*.41,4));
      }
      if(/frosteye/.test(n))optic(g,-r*.78,r*.11,r*.66,r*.19,'#8eaaa9');
      if(/skjald/.test(n))for(const s of [-1,1])add(g,tbox(r*.29,r*1.60,r*.71,c.cloth,s*r*.93,r*.25,-r*.41,.72));
      return true;
    }
    if(L.team==='inquisitorialAgents'&&L.body==='guard'){
      if(/sister of silence/.test(n)){
        add(g,tbox(r*1.70,r*1.95,r*1.62,c.trim,0,0,-r*.12,.78),
          tbox(r*1.46,r*.29,r*.28,dark(),0,r*.17,r*.77,.75),
          tbox(r*1.13,r*.79,r*.38,c.trim,0,-r*.43,r*.70,.65));
        for(const s of [-1,1])optic(g,s*r*.34,r*.16,r*.94,r*.10,'#746b5a');
        for(let i=-1;i<=1;i++)add(g,box(r*.09,r*.33,r*.07,dark(),i*r*.23,-r*.44,r*.92));
        add(g,limb(V(0,r*1.05,-r*.18),V(0,r*1.20,-r*.92),r*.20,mat('#923c36'),r*.12),limb(V(0,r*1.20,-r*.92),V(0,-r*.28,-r*1.64),r*.12,mat('#923c36'),r*.025));
      }else{
        face(g,r,c);
        if(/autosavant/.test(n)){
          add(g,tbox(r*1.57,r*.48,r*.24,dark(),0,r*.17,r*.80,.77));
          for(const s of [-1,1])optic(g,s*r*.37,r*.15,r*.98,r*.16,'#88a49a');
          add(g,tbox(r*.25,r*1.44,r*.34,iron(),-r*.86,r*.07,-r*.12,.76));
        }else if(/mystic|hexorcist|enlightener|questkeeper/.test(n)){
          for(const s of [-1,1])add(g,tbox(r*.38,r*1.83,r*.85,c.cloth,s*r*.88,r*.17,-r*.29,.71));
          add(g,tbox(r*1.77,r*.34,r*1.47,c.cloth,0,r*.96,-r*.24,.75));
        }else{
          add(g,tbox(r*1.60,r*.32,r*1.35,mat('#4c3d34'),0,r*.84,-r*.18,.79));
          if(/interrogator/.test(n))optic(g,-r*.79,r*.10,r*.65,r*.18,'#b59666');
        }
        if(/penal/.test(n))add(g,tbox(r*.62,r*.26,r*.13,iron(),r*.41,r*.63,r*.68,.70));
      }
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=leather())=>add(upper,tbox(.07*k,.085*k,.045*k,color,x,y,z,.80),box(.05*k,.012*k,.05*k,iron(),x,y+.025*k,z));
    if(L.team==='wolfScouts'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.33,B.th*.38,.03*k,M.main,s*B.tw*.24,torsoY,f+.02*k,.74));
        pouch(s*B.tw*.38,hipY,f*.70);
        for(let i=0;i<4;i++){
          const x=s*(B.tw*.14+i*.045*k);
          add(upper,cone(.013*k,.055*k,fur(),x,shY-.02*k,-f*.6+i*.018*k,5).rotateZ(Math.PI));
        }
      }
      if(/fangbearer/.test(n))for(let i=-1;i<=1;i++)add(upper,cone(.016*k,.08*k,bone(),i*.055*k,torsoY,f+.065*k,5).rotateZ(Math.PI));
      if(/trapmaster/.test(n))for(const s of [-1,1])add(upper,cyl(.04*k,.04*k,.025*k,iron(),s*B.tw*.43,hipY,0).rotateX(Math.PI/2));
      if(/skjald/.test(n)){
        add(upper,tbox(.065*k,.10*k,.025*k,M.trim,0,torsoY,f+.05*k,.70));
        for(let i=-1;i<=1;i++)add(upper,sph(.012*k,bone(),i*.05*k,torsoY+B.th*.23,f+.04*k));
      }
      if(/hunter|frosteye/.test(n))add(upper,tbox(.14*k,.18*k,.10*k,leather(),0,torsoY,-f-.065*k,.78));
    }
    if(L.team==='inquisitorialAgents'){
      const silence=/sister of silence/.test(n);
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.30,B.th*.57,.023*k,silence?M.trim:M.main,s*B.tw*.28,torsoY,f+.02*k,.70).rotateZ(s*.10));
        pouch(s*B.tw*.38,hipY,f*.65);
      }
      if(/autosavant/.test(n)){
        add(upper,tbox(.17*k,.21*k,.10*k,iron(),0,torsoY,-f-.07*k,.75));
        for(let i=0;i<4;i++)add(upper,box(.12*k,.008*k,.012*k,dark(),0,torsoY+(.065-i*.04)*k,-f-.125*k));
      }
      if(/questkeeper|hexorcist/.test(n))add(upper,tbox(.11*k,.14*k,.05*k,mat('#8f7352'),B.tw*.50,hipY,0,.72));
      if(/death world|penal/.test(n))add(upper,limb(V(-B.tw*.34,shY,f),V(B.tw*.25,hipY,f+.03*k),.014*k,leather()));
      if(/pistolier/.test(n))for(const s of [-1,1])add(upper,tbox(.055*k,.13*k,.05*k,leather(),s*B.tw*.50,hipY*.85,0,.72));
      if(/mystic|enlightener/.test(n))for(let i=-1;i<=1;i++)add(upper,sph(.014*k,bone(),i*.05*k,torsoY+B.th*.20,f+.045*k));
    }
  }
  function finish(fig,L){
    if(!revision(L)||fig.userData.humanoid)return;
    if(L.team==='stealthSuits'&&L.body==='drone'){
      const shell=mat(L.main,{metal:.15,rough:.65});
      for(const s of [-1,1]){
        add(fig,tbox(.12,.028,.20,shell,s*.17,.80,.01,.78));
        for(let i=0;i<3;i++)add(fig,box(.055,.008,.009,dark(),s*.17,.82,-.05+i*.04));
      }
      optic(fig,0,.70,.28,.026,'#779fa8');
    }
    if(L.team==='wolfScouts'&&L.body==='beast'){
      const hide=mat('#a88a5a',{rough:1}),nose=dark();
      const eyes=new Map();
      fig.traverse(o=>{
        if(!o.isMesh||Array.isArray(o.material))return;
        const m=o.material;
        if(m.color?.getHex()===0xffd040&&m.emissive?.getHex()){
          if(!eyes.has(m)){const copy=m.clone();copy.color.set('#51422c');copy.emissive.set(0);eyes.set(m,copy);}
          o.material=eyes.get(m);
        }
      });
      add(fig,tbox(.12,.045,.20,hide,0,.84,.80,.72),tbox(.11,.018,.17,nose,0,.805,.81,.75),sph(.030,nose,0,.85,.925));
      for(const s of [-1,1]){
        for(let i=0;i<3;i++)add(fig,cone(.019,.10,fur(),s*(.10+i*.018),.76-i*.025,.48-i*.065,5).rotateZ(s*.5));
        optic(fig,s*.078,.913,.749,.010,'#a68d50');
        add(fig,sph(.004,nose,s*.078,.913,.758));
      }
    }
    if(L.team==='inquisitorialAgents'&&L.body==='skull'){
      add(fig,tbox(.17,.055,.12,mat('#88684c'),0,.68,.04,.75),tbox(.15,.018,.10,bone(),0,.716,.04,.75));
      for(const s of [-1,1])add(fig,limb(V(s*.06,.72,0),V(s*.10,.57,-.02),.006,iron()));
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='wolfScouts')add(g,tbox(.065,.025,.12,iron(),0,.075,-.03,.76));
    if(L.team==='inquisitorialAgents')for(const s of [-1,1])add(g,box(.012,.025,.09,mat(L.trim,{metal:.5}),s*.05,.02,-.025));
  }
  return {revision,proportions,head,body,finish,weapon};
}
