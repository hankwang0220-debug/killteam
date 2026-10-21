// Optional sculpt pass. Original meshes, faction colours, silhouettes and physical bases stay available.
// Profiles follow the operative's body, including allies, pets and machines within mixed rosters.
export function createRefinements(h) {
  const { THREE,V,mat,box,tbox,cyl,sph,cone,limb,add,tz,DARK,METAL }=h;
  const profiles={
    marine:{leg:1.06,legR:1.17,tw:1.09,th:.89,td:1.12,head:1.12,sx:1.075,armR:1.12,wk:.864},
    guard:{leg:1.04,legR:1.08,tw:1.04,th:.96,head:1.02,wk:.90},
    sister:{leg:1.05,tw:.97,th:.96,head:1.04,armR:1.06,wk:.91},
    eldar:{leg:1.055,tw:.94,td:.96,head:1.04,wk:.90},
    tau:{leg:1.04,legR:1.07,tw:1.03,th:.95,head:1.03,wk:.92},
    battlesuit:{legR:1.13,tw:1.10,td:1.08,head:1.10,armR:1.08,wk:.92},
    kroot:{leg:1.03,tw:.97,head:1.06,armR:1.05,wk:.91},
    ork:{legR:1.12,tw:1.07,td:1.08,head:1.06,armR:1.10,wk:.92},
    votann:{legR:1.12,tw:1.06,head:1.05,armR:1.08,wk:.90},
    ratling:{legR:1.08,th:.95,head:1.03,wk:.88},
    ogryn:{legR:1.08,th:.96,head:1.15,armR:1.07,wk:.90},
    necron:{leg:1.035,tw:.95,th:.97,head:1.08,armR:1.06,wk:.92},
    skitarii:{leg:1.035,head:1.04,armR:1.06,wk:.90},
    gor:{legR:1.08,tw:1.04,head:1.07,armR:1.06,wk:.92},
    vespid:{legR:1.08,tw:1.04,head:1.04,wk:.92},
  };
  function proportions(B,L){
    if(!L.refined)return;
    const p=profiles[L.body]||profiles.guard;
    for(const [key,gain]of Object.entries(p))B[key]*=gain;
    if(L.scout||L.phobos){B.tw*=.95;B.armR*=.96;}
    if(L.servitor){B.td*=1.12;B.armR*=1.12;}
  }
  function body(c){
    const {L,B,k,upper,head,fig,hipY,torsoY,shY,M}=c;
    if(!L.refined)return;
    const front=B.td/2, r=B.head;
    const edge=mat(L.trim,{metal:.42,rough:.54}), shadow=mat('#24272c',{rough:.85});
    const plate=mat(L.main,{metal:.18,rough:.63});
    if(['guard','sister','ratling','ogryn','skitarii'].includes(L.body)||L.scout){
      // Upper lids and cheek planes keep bare faces expressive without replacing caps, masks or hoods.
      if(!L.hood&&!L.gasmask&&!L.mask&&!L.visor&&!L.servitor){
        for(const s of [-1,1]){
          add(head,box(r*.46,r*.12,r*.16,mat(L.hair||'#59473e',{rough:.95}),s*r*.37,r*.29,r*.86));
          add(head,tbox(r*.38,r*.30,r*.16,M.skin,s*r*.53,-r*.2,r*.77,.75));
        }
        add(head,box(r*.40,r*.055,r*.07,mat('#805d50',{rough:1}),0,-r*.48,r*.91));
      }
      if(L.carapace||L.helmet){
        add(head,tbox(r*1.85,r*.20,r*.42,plate,0,r*.30,r*.72,.90));
        for(const s of [-1,1])add(head,tz(cyl(r*.22,r*.25,r*.22,edge,s*r*1.03,-r*.05,0)));
      }
      if(L.gasmask)for(const s of [-1,1]){
        add(head,tz(cyl(r*.25,r*.25,r*.10,shadow,s*r*.40,-r*.10,r*1.0)));
        const optic=sph(r*.18,M.eye,s*r*.40,-r*.10,r*1.07);optic.scale.set(1,.55,.3);add(head,optic);
        add(head,tz(cyl(r*.24,r*.28,r*.15,edge,s*r*.73,-r*.48,r*.64)));
        for(let i=-1;i<=1;i++)add(head,box(r*.045,r*.28,r*.045,shadow,s*r*.73+i*r*.1,-r*.48,r*.73));
      }
      if(L.carapace||L.body==='sister'||L.servitor){
        for(const s of [-1,1])add(upper,tbox(B.tw*.36,B.th*.34,.035*k,plate,s*B.tw*.24,torsoY+B.th*.18,front+.018*k,.80));
      }
      if(L.coat||L.robe){
        for(const s of [-1,1])add(upper,limb(V(s*B.tw*.25,hipY*.44,front*.55),V(s*B.tw*.20,hipY*.90,front*.65),.008*k,mat(L.cloth,{rough:1})));
      }
    }
    if(L.body==='marine'){
      // Greaves with flat fronts read as armour instead of round tubes. Preserve chaos horns and chapter kit.
      for(const s of [-1,1])add(fig,tbox(B.legR*1.6,B.leg*.27,.035*k,plate,s*B.tw*.32,B.leg*.24,(s===-1?.06:-.05)*k+B.legR*.78,.82));
      if(L.chaos)for(const s of [-1,1])add(upper,tbox(B.tw*.35,B.th*.22,.018*k,edge,s*B.tw*.23,torsoY+B.th*.22,front+.025*k,.65));
    }
    if(L.body==='eldar'){
      if(!L.mandrake){
        add(head,tbox(r*.56,r*.9,r*.20,shadow,0,-r*.10,r*.98,.55));
        for(const s of [-1,1])add(head,box(r*.48,r*.11,r*.12,M.eye,s*r*.38,r*.13,r*.98).rotateZ(-s*.25));
        for(const s of [-1,1])add(upper,tbox(B.tw*.32,B.th*.52,.025*k,plate,s*B.tw*.22,torsoY,front+.008*k,.5));
      }else{
        for(const s of [-1,1])for(let i=0;i<3;i++)add(upper,box(.035*k,.009*k,.009*k,M.eye,s*B.tw*.25,torsoY+(.07-i*.045)*k,front+.012*k).rotateZ(s*.3));
      }
    }
    if(['tau','battlesuit','votann'].includes(L.body)){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.36,B.th*.42,.03*k,plate,s*B.tw*.23,torsoY+B.th*.16,front+.025*k,.86));
        for(let i=0;i<3;i++)add(upper,box(.025*k,.008*k,.009*k,shadow,s*B.tw*.27,torsoY+(.07-i*.024)*k,front+.044*k));
      }
      if(L.body==='battlesuit')add(head,tbox(r*1.9,r*.30,r*.30,plate,0,r*.38,r*.55,.92));
    }
    if(L.body==='necron'||L.body==='skitarii'){
      // Exposed pistons, sockets and thin ribs rather than wider flesh-like limbs.
      for(const s of [-1,1]){
        add(fig,limb(V(s*B.tw*.30,hipY*.18,-.015*k),V(s*B.tw*.27,hipY*.45,-.015*k),.012*k,METAL()));
        add(upper,tz(cyl(.021*k,.024*k,.018*k,shadow,s*B.tw*.29,torsoY+.055*k,front+.025*k)));
      }
      if(L.body==='necron'){
        add(head,tbox(r*1.2,r*.55,r*.32,plate,0,-r*.6,r*.57,.62));
        for(let i=-1;i<=1;i++)add(head,box(r*.08,r*.3,r*.06,shadow,i*r*.25,-r*.5,r*.76));
      }
    }
    if(['ork','gor','kroot'].includes(L.body)){
      if(L.body==='ork'){
        for(const s of [-1,1]){
          add(head,tbox(r*.64,r*.22,r*.26,M.skin,s*r*.40,r*.36,r*.80,.75).rotateZ(-s*.18));
          add(head,cone(r*.12,r*.62,mat('#e4d8b7',{rough:.68}),s*r*.62,-r*.20,r*1.12));
        }
        add(head,tbox(r*1.55,r*.25,r*.22,shadow,0,-r*.44,r*1.03,.83));
      }
      for(const s of [-1,1])add(upper,tbox(B.tw*.27,B.th*.30,.026*k,mat(L.cloth,{rough:1}),s*B.tw*.31,hipY+.06*k,front+.025*k,.8));
      if(L.body==='kroot')for(const s of [-1,1])add(head,box(r*.50,r*.14,r*.25,M.skin,s*r*.42,r*.34,r*.65).rotateZ(-s*.2));
      if(L.body==='gor')for(const s of [-1,1])add(head,tbox(r*.48,r*.2,r*.22,M.skin,s*r*.40,r*.38,r*.72,.7));
    }
    if(L.body==='vespid'){
      for(const s of [-1,1])for(let i=0;i<3;i++)add(upper,tbox(B.tw*.45,.035*k,.035*k,plate,s*B.tw*.22,torsoY+(.08-i*.06)*k,front,.65));
    }
  }
  function finish(fig,L){
    if(!L.refined||fig.userData.humanoid)return;
    const plate=mat(L.main,{metal:['drone','crawler','macrocyte','gadget'].includes(L.body)?.45:.08,rough:.58});
    const edge=mat(L.trim,{metal:.4,rough:.55}), dark=DARK(), bone=mat('#e4d8be',{rough:.75});
    switch(L.body){
      case 'drone':
        for(const s of [-1,1]){
          add(fig,tbox(.15,.035,.22,plate,s*.21,.80,0,.84));
          for(let i=0;i<3;i++)add(fig,box(.07,.008,.008,dark,s*.21,.823,-.06+i*.045));
        }break;
      case 'beast':{
        const k=/wolf/i.test(L.name)?1.6:/drakolithe/i.test(L.name)?1.3:1;
        for(const s of [-1,1])add(fig,limb(V(s*.09*k,.44*k,.21*k),V(s*.12*k,.36*k,.07*k),.014*k,edge));
        for(let i=0;i<4;i++)add(fig,cone(.018*k,.06*k,plate,0,.49*k,.12*k-i*.09*k));
        break;}
      case 'squig':
        for(const s of [-1,1])add(fig,tbox(.12,.028,.06,plate,s*.1,.49,.19,.8).rotateZ(-s*.20));break;
      case 'skull':
        for(const s of [-1,1])add(fig,box(.06,.015,.025,bone,s*.05,.835,.125));
        for(let i=-1;i<=1;i++)add(fig,box(.012,.04,.018,dark,i*.03,.70,.115));break;
      case 'cherub':
        for(const s of [-1,1])for(let i=0;i<3;i++)add(fig,limb(V(s*.12,.82,-.10),V(s*(.20+i*.02),.85-i*.045,-.13),.012,bone,.004));break;
      case 'gadget':
        add(fig,tbox(.13,.035,.12,plate,0,/servo-sentry/i.test(L.name)?.48:.20,.01,.8));break;
      case 'macrocyte':
        for(const s of [-1,1])add(fig,tbox(.09,.045,.12,plate,s*.08,/plasmacyte/i.test(L.name)?.57:.68,0,.8));break;
      case 'crawler':
        for(let i=0;i<3;i++)add(fig,tbox(.40,.06,.16,plate,0,.76,-.2+i*.18,.78));break;
      case 'ravener':
        // Paired chitin ridges follow the already curved tail; keep each specialist's claws intact.
        for(const s of [-1,1])for(let i=0;i<3;i++)add(fig,tbox(.08,.06,.17,plate,s*.15,.40+i*.1,-.2+i*.10,.65));break;
      case 'rider':
        for(const s of [-1,1])add(fig,tbox(.12,.10,.26,edge,s*.19,.90,-.1,.85));break;
    }
    // Add a sculpted surface response without changing shared materials on the original figures.
    const copies=new Map();
    fig.traverse(o=>{if(!o.isMesh)return;const refine=m=>{
      if(!copies.has(m)){
        const copy=m.clone();
        if(!m.transparent&&!m.emissive?.getHex()){
          copy.roughness=Math.max(.48,Math.min(.95,m.roughness+.10));copy.metalness=Math.min(m.metalness,.6);
        }
        copies.set(m,copy);
      }return copies.get(m);
    };o.material=Array.isArray(o.material)?o.material.map(refine):refine(o.material);});
  }
  return {proportions,body,finish};
}
