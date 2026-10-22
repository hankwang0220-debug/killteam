// Team-specific second passes after the shared silhouette pass. Display-only; original miniatures stay intact.
const revisions={tauPathfinders:'pathfinders-2',plagueMarines:'plague-marines-2',farstalkers:'farstalkers-2',deathKorps:'death-korps-2'};
export function createTeamSculpts(h){
  const {THREE,V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY,DARK,METAL}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const leather=()=>mat('#615239',{rough:.95});
  const iron=()=>mat('#656b66',{metal:.50,rough:.62});
  const bone=()=>mat('#cdbd95',{rough:.80});
  const rust=()=>mat('#80512e',{metal:.22,rough:.95});
  function optic(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.22,r*1.22,r*.35,DARK(),x,y,z-r*.10)));
    const lens=sph(r,mat(color,{metal:.18,rough:.28}),x,y,z+r*.12);lens.scale.set(1,.72,.28);add(g,lens);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='tauPathfinders'){B.td*=1.06;B.head*=1.07;B.sx*=1.04;}
    if(L.team==='plagueMarines'){B.tw*=1.12;B.td*=1.16;B.legR*=1.10;B.armR*=1.08;B.th*=.97;}
    if(L.team==='farstalkers'){B.head*=1.08;B.armR*=.96;B.leg*=1.02;}
    if(L.team==='deathKorps'){B.head*=1.07;B.td*=1.04;B.tw*=.98;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head;
    if(L.team==='tauPathfinders'&&L.body==='tau'){
      add(g,tbox(r*1.9,r*1.75,r*1.85,c.main,0,r*.02,-r*.10,.85),
        tbox(r*1.72,r*.45,r*.30,DARK(),0,-r*.15,r*.86,.84),
        tbox(r*1.90,r*.24,r*.52,c.main,0,r*.26,r*.70,.90),
        tbox(r*1.3,r*.45,r*.48,c.main,0,-r*.64,r*.56,.75));
      optic(g,r*.33,-r*.13,r*1.025,r*.18,'#38a5b5');
      add(g,box(r*.13,r*.72,r*.18,c.trim,-r*.83,r*.72,-r*.28),
        box(r*.10,r*.10,r*.58,DARK(),0,r*.91,-r*.22));
      for(const s of [-1,1])add(g,tbox(r*.25,r*.80,r*.55,c.main,s*r*.90,-r*.12,r*.14,.80));
      return true;
    }
    if(L.team==='plagueMarines'&&L.body==='marine'){
      const dome=sph(r*1.04,c.main,0,r*.10,-r*.10);dome.scale.set(1.12,1.0,.92);add(g,dome);
      add(g,tbox(r*1.90,r*.85,r*.76,c.main,0,-r*.43,r*.57,.76),
        tbox(r*1.64,r*.27,r*.35,DARK(),0,r*.10,r*.84,.85));
      for(const s of [-1,1]){
        optic(g,s*r*.43,r*.04,r*1.0,r*.13,'#98b253');
        add(g,tz(cyl(r*.31,r*.37,r*.46,rust(),s*r*.79,-r*.42,r*.66)));
        for(let i=-1;i<=1;i++)add(g,box(r*.055,r*.34,r*.07,DARK(),s*r*.79+i*r*.12,-r*.42,r*.93));
      }
      add(g,tbox(r*.64,r*.54,r*.40,iron(),0,-r*.56,r*.94,.70));
      const horn=cone(r*.23,r*(L.psyker?1.7:1.18),bone(),-r*.20,r*(L.psyker?1.5:1.15),-r*.20,8);horn.rotation.z=-.25;add(g,horn);
      for(const [x,y,z]of [[-.55,.52,.63],[.28,.65,.55],[.68,-.15,.83]])add(g,sph(r*.10,rust(),x*r,y*r,z*r));
      if(L.leader)add(g,tbox(r*.26,r*.20,r*1.35,c.trim,0,r*1.05,-r*.14,.9));
      return true;
    }
    if(L.team==='farstalkers'&&L.body==='kroot'){
      const skull=sph(r,c.skin,0,r*.08,-r*.12);skull.scale.set(.87,1.08,.88);add(g,skull);
      // Two tapering beak halves and a thin mouth seam replace the spherical snout.
      add(g,tbox(r*.95,r*.55,r*1.12,bone(),0,-r*.09,r*.73,.62),
        aimY(cone(r*.28,r*.80,bone(),0,-r*.17,r*1.44,6),V(0,-.18,1)),
        tbox(r*.72,r*.16,r*.90,mat('#534939',{rough:.9}),0,-r*.40,r*.86,.65));
      for(const s of [-1,1]){
        optic(g,s*r*.56,r*.16,r*.61,r*.13,'#8d723b');
        add(g,tbox(r*.44,r*.18,r*.31,c.skin,s*r*.48,r*.37,r*.55,.7));
      }
      for(let i=-2;i<=2;i++){
        const a=V(i*r*.11,r*.53,-r*.40),b=V(i*r*.40,r*(1.27+(i%2===0?.12:0)),-r*1.18),end=V(i*r*.56,r*1.05,-r*1.95);
        const q=mat(i%2?'#935d35':L.cloth,{rough:.95});
        add(g,limb(a,b,r*.10,q,r*.075),limb(b,end,r*.075,q,r*.012));
      }
      return true;
    }
    if(L.team==='deathKorps'&&L.body==='guard'){
      const canvas=mat('#777364',{rough:1});
      add(g,tbox(r*1.62,r*1.86,r*1.42,canvas,0,-r*.05,0,.78),
        tbox(r*1.35,r*.72,r*.66,canvas,0,-r*.45,r*.64,.76));
      for(const s of [-1,1])optic(g,s*r*.40,-r*.02,r*.85,r*.22,'#485f60');
      add(g,tz(cyl(r*.31,r*.35,r*.43,iron(),0,-r*.70,r*.89)),
        box(r*.14,r*.42,r*.10,mat('#a4a18c',{rough:1}),0,-r*.09,r*.90));
      for(let i=-1;i<=1;i++)add(g,box(r*.055,r*.35,r*.055,DARK(),i*r*.15,-r*.70,r*1.12));
      if(L.peakedCap){
        add(g,cyl(r*1.06,r*.99,r*.46,c.main,0,r*.78,-r*.12,20),
          tbox(r*1.60,r*.12,r*1.16,DARK(),0,r*.57,r*.48,.86),
          box(r*.35,r*.17,r*.08,c.trim,0,r*.83,r*.92));
      }else{
        const helmet=sph(r*1.15,c.main,0,r*.47,-r*.22);helmet.scale.set(1.02,.72,1.02);add(g,helmet);
        add(g,tbox(r*1.97,r*.14,r*.50,c.main,0,r*.42,r*.73,.90),
          tbox(r*1.72,r*.54,r*.35,c.main,0,r*.08,-r*.99,.86));
      }
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,head,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const front=B.td/2,back=-front,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=leather())=>add(upper,tbox(.065*k,.085*k,.045*k,color,x,y,z,.86),box(.050*k,.013*k,.050*k,iron(),x,y+.022*k,z+.002*k));
    if(L.team==='tauPathfinders'){
      const white=mat(L.main,{metal:.12,rough:.61});
      add(upper,tbox(B.armR*2.8,B.armR*3.6,B.armR*1.7,white,B.sx+.012*k,shY-.018*k,.020*k,.8).rotateZ(.18));
      for(let i=0;i<2;i++)add(upper,box(.065*k,.008*k,.008*k,M.trim,B.sx+.012*k,shY+(.022-i*.028)*k,B.armR*.90));
      for(const s of [-1,1])pouch(s*B.tw*.40,hipY+.02*k,front+.012*k,mat('#383d3b',{rough:.95}));
      if(/medical/.test(n)){
        pouch(-B.tw*.45,torsoY-.08*k,front+.045*k,white);
        add(upper,box(.047*k,.012*k,.009*k,mat('#9e3833'),-B.tw*.45,torsoY-.075*k,front+.072*k));
      }else if(/grenadier/.test(n)){
        for(let i=0;i<3;i++)add(upper,cyl(.016*k,.018*k,.07*k,iron(),(i-1)*.045*k,torsoY-.04*k,front+.035*k));
      }else if(/controller/.test(n)){
        const p=fig.userData.hands?.L;
        if(p)add(fig,tbox(.070*k,.025*k,.080*k,DARK(),p.x,p.y+.04*k,p.z,.9),box(.048*k,.008*k,.045*k,mat('#3b8e94',{rough:.35}),p.x,p.y+.056*k,p.z));
      }else if(/transpectral|comms/.test(n)){
        for(const s of [-1,1])add(upper,cyl(.004*k,.006*k,.28*k,iron(),s*.065*k,shY+.10*k,back-.07*k));
      }else if(/marksman|rail/.test(n)){
        add(head,tz(cyl(B.head*.22,B.head*.26,B.head*.65,DARK(),-B.head*.81,B.head*.32,B.head*.49)));
      }else if(/ion/.test(n)){
        add(upper,cyl(.035*k,.035*k,.17*k,iron(),.07*k,torsoY,back-.07*k),box(.010*k,.10*k,.012*k,M.eye,.07*k,torsoY,back-.108*k));
      }
    }
    if(L.team==='plagueMarines'){
      const armour=mat(L.main,{metal:.20,rough:.80});
      for(const s of [-1,1]){
        add(upper,tbox(B.armR*3.7,B.armR*2.9,B.armR*3.9,armour,s*(B.sx+.012*k),shY+.018*k,0,.84));
        for(let i=0;i<3;i++)add(upper,sph(.010*k,rust(),s*(B.sx+.050*k),shY+(.035-i*.037)*k,.083*k));
        add(fig,tbox(B.legR*1.9,hipY*.32,.04*k,armour,s*B.tw*.32,hipY*.28,(s===-1?.06:-.05)*k+B.legR*.82,.8));
      }
      if(/bombardier/.test(n)){
        for(let i=0;i<3;i++)add(upper,cyl(.026*k,.030*k,.10*k,iron(),(i-1)*.065*k,hipY+.035*k,front+.055*k),sph(.014*k,rust(),(i-1)*.065*k,hipY+.095*k,front+.055*k));
      }else if(/heavy gunner/.test(n)){
        add(upper,cyl(.075*k,.075*k,.10*k,iron(),B.tw*.57,hipY+.04*k,0).rotateZ(Math.PI/2));
      }else if(/icon|champion/.test(n)){
        for(let i=0;i<4;i++)add(upper,sph(.013*k,iron(),-B.tw*.32,torsoY+(.03-i*.033)*k,front+.045*k));
        add(upper,cone(.036*k,.054*k,rust(),-B.tw*.32,torsoY-.12*k,front+.045*k).rotateX(Math.PI));
      }else if(/caster/.test(n)){
        for(const s of [-1,1])add(upper,tz(cyl(.016*k,.018*k,.08*k,mat('#81913e',{rough:.40}),s*B.tw*.36,hipY+.03*k,front+.055*k)));
      }else if(/fighter/.test(n)){
        add(upper,tbox(.09*k,.13*k,.03*k,rust(),B.tw*.33,torsoY-.02*k,front+.045*k,.75));
      }
    }
    if(L.team==='farstalkers'&&L.body==='kroot'){
      const hide=mat('#80684c',{rough:.98});
      add(upper,tbox(B.armR*2.7,B.armR*2.4,B.armR*2.8,hide,-B.sx-.007*k,shY+.01*k,0,.73));
      for(const s of [-1,1])add(upper,limb(V(s*B.tw*.23,torsoY+B.th*.28,front+.02*k),V(s*B.tw*.37,hipY+.03*k,front+.025*k),.009*k,leather()));
      if(/tracker/.test(n)){
        pouch(-B.tw*.38,hipY+.03*k,front+.035*k);
        add(upper,tbox(.11*k,.06*k,.06*k,hide,0,torsoY,back-.06*k,.85));
      }else if(/long-sight/.test(n)){
        add(head,tz(cyl(B.head*.23,B.head*.27,B.head*.66,iron(),-B.head*.73,B.head*.20,B.head*.60)));
      }else if(/bow-hunter/.test(n)){
        add(upper,cyl(.035*k,.035*k,.25*k,leather(),B.tw*.29,torsoY+.035*k,back-.06*k));
        for(let i=0;i<3;i++)add(upper,cyl(.004*k,.004*k,.13*k,bone(),B.tw*.29+(i-1)*.018*k,torsoY+.20*k,back-.06*k));
      }else if(/heavy gunner/.test(n)){
        add(upper,tbox(.14*k,.12*k,.08*k,hide,0,torsoY,back-.07*k,.85));
      }else if(/cold-blood/.test(n)){
        add(upper,tbox(B.tw*.40,B.th*.38,.024*k,iron(),-B.tw*.22,torsoY,front+.02*k,.72));
      }else if(/cut-skin|pistolier/.test(n)){
        for(const s of [-1,1])pouch(s*B.tw*.40,hipY+.035*k,front+.02*k);
      }else if(/kill-broker/.test(n)){
        for(const s of [-1,1])add(upper,cone(.015*k,.07*k,bone(),s*B.tw*.30,torsoY+.05*k,front+.05*k).rotateX(Math.PI));
      }
    }
    if(L.team==='deathKorps'){
      // A shaped double-breasted front and split coat hem give the greatcoat weight.
      const cloth=mat(L.main,{rough:.98});
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.39,hipY*.42,.025*k,cloth,s*B.tw*.21,hipY*.67,front*.83,.73));
        for(let i=0;i<3;i++)add(upper,sph(.0055*k,iron(),s*B.tw*.15,torsoY+(.075-i*.057)*k,front+.026*k));
      }
      add(upper,tbox(B.tw*.45,.055*k,.045*k,leather(),0,torsoY-.07*k,front+.04*k,.9));
      if(/medic/.test(n)){
        pouch(-B.tw*.43,hipY+.02*k,front+.04*k,mat('#d1c6a4',{rough:.95}));
        add(upper,box(.048*k,.016*k,.012*k,mat('#91423a'),-B.tw*.43,hipY+.025*k,front+.067*k));
      }else if(/sapper/.test(n)){
        for(let i=0;i<3;i++)add(upper,cyl(.015*k,.017*k,.105*k,mat('#6c6850',{rough:.85}),(i-1)*.037*k,torsoY-.03*k,front+.045*k));
      }else if(/vox/.test(n)){
        add(upper,tbox(.14*k,.16*k,.08*k,iron(),0,torsoY+.015*k,back-.075*k,.9));
        for(let i=0;i<4;i++)add(upper,box(.095*k,.009*k,.009*k,DARK(),0,torsoY+(.055-i*.028)*k,back-.12*k));
      }else if(/spotter/.test(n)){
        for(const s of [-1,1])add(upper,tz(cyl(.018*k,.022*k,.06*k,DARK(),s*.024*k,torsoY+.04*k,front+.06*k)));
      }else if(/sniper/.test(n)){
        add(upper,tbox(.13*k,.065*k,.07*k,leather(),0,torsoY+.05*k,back-.09*k,.82));
      }else if(/bruiser|veteran/.test(n)){
        add(upper,tbox(B.armR*2.6,B.armR*1.8,B.armR*2.8,iron(),-B.sx,shY+.025*k,0,.78));
      }else if(/zealot/.test(n)){
        add(upper,box(.024*k,.07*k,.006*k,mat('#d5c7a0',{rough:1}),B.tw*.30,torsoY+.02*k,front+.04*k));
      }
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    const n=r.n.toLowerCase();
    if(L.team==='tauPathfinders'){
      add(g,tbox(.045,.026,.055,mat(L.main,{metal:.12,rough:.60}),0,.047,.075,.86),box(.014,.010,.034,mat('#9d3932'),.026,.023,.065));
      if(r.form==='sniper')add(g,box(.008,.012,.10,iron(),0,.052,.19));
    }else if(L.team==='plagueMarines'){
      for(const s of [-1,1])add(g,tbox(.008,.033,.070,rust(),s*.032,.025,.060,.72),sph(.006,iron(),s*.038,.025,.065));
    }else if(L.team==='farstalkers'){
      if(r.form!=='bow')for(let i=0;i<3;i++)add(g,tz(cyl(.022,.022,.010,leather(),0,.018,.12+i*.018)));
      add(g,tbox(.012,.028,.065,bone(),-.029,.008,.045,.72));
    }else if(L.team==='deathKorps'&&/las|rifle|carbine/.test(n)){
      for(const s of [-1,1])add(g,box(.005,.018,.065,leather(),s*.022,.018,.08));
      add(g,box(.012,.009,.016,iron(),0,.050,.17));
    }
  }
  function finish(fig,L){
    if(!revision(L)||fig.userData.humanoid)return;
    if(L.team==='tauPathfinders'&&L.body==='drone'){
      const white=mat(L.main,{metal:.13,rough:.62});
      for(const s of [-1,1]){
        add(fig,tbox(.085,.035,.15,white,s*.20,.83,0,.86),box(.018,.009,.10,mat('#9a3932'),s*.20,.855,0));
      }
      optic(fig,0,.72,.28,.035,'#398a99');
      if(/recon/.test(L.name.toLowerCase()))for(const s of [-1,1])optic(fig,s*.075,.78,.26,.026,'#4e6970');
    }
    if(L.team==='farstalkers'&&L.body==='beast'){
      add(fig,tbox(.075,.05,.16,bone(),0,.515,.49,.68));
      for(const s of [-1,1])add(fig,tbox(.065,.02,.04,mat(L.skin,{rough:.95}),s*.047,.59,.45,.7).rotateZ(-s*.2));
      for(let i=0;i<3;i++)add(fig,limb(V(0,.52,.19-i*.08),V((i-1)*.035,.63,.12-i*.10),.010,mat('#994a38',{rough:1}),.002));
    }
  }
  return {revision,proportions,head,body,weapon,finish};
}
