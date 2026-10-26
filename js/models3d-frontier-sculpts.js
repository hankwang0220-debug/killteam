// Gallery-only faction details for frontier scouts, a Rogue Trader's retinue and cultists.
const revisions={goremongers:'goremongers-2',hernkynYaegirs:'yaegirs-3',elucidianStarstriders:'starstriders-2',chaosCult:'chaos-cult-2'};
export function createFrontierSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const iron=()=>mat('#787779',{metal:.55,rough:.56});
  const dark=()=>mat('#29292c',{rough:.94});
  const leather=()=>mat('#62503c',{rough:.96});
  const bone=()=>mat('#c9bb99',{rough:.90});
  function lens(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.25,r*1.25,r*.35,dark(),x,y,z)));
    const eye=sph(r,mat(color,{metal:.12,rough:.32}),x,y,z+r*.2);eye.scale.set(1,.57,.25);add(g,eye);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='goremongers'){B.tw*=1.06;B.armR*=1.10;B.head*=1.06;}
    if(L.team==='hernkynYaegirs'){
      B.leg*=.78;B.tw*=1.16;B.td*=1.12;B.head*=1.06;B.th*=.93;B.sx*=1.10;B.arm*=.84;
    }
    if(L.team==='elucidianStarstriders'){B.tw*=.98;B.head*=1.04;B.wk*=.96;}
    if(L.team==='chaosCult'){B.head*=1.08;B.armR*=L.bloated?1.16:1.03;B.td*=L.bloated?1.12:1;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='goremongers'){
      add(g,tbox(r*1.72,r*1.93,r*1.48,c.skin,0,0,-r*.12,.78),
        tbox(r*1.50,r*.80,r*.36,c.trim,0,-r*.42,r*.69,.70));
      for(const s of [-1,1]){
        add(g,tbox(r*.64,r*.19,r*.25,c.main,s*r*.40,r*.34,r*.69,.68).rotateZ(-s*.21));
        lens(g,s*r*.39,r*.14,r*.84,r*.10,'#a48264');
        add(g,limb(V(s*r*.73,r*.55,-r*.16),V(s*r*1.12,r*1.20,-r*.26),r*.15,bone(),r*.025));
      }
      for(let i=-1;i<=1;i++)add(g,box(r*.10,r*.39,r*.08,dark(),i*r*.30,-r*.43,r*.92));
      return true;
    }
    if(L.team==='hernkynYaegirs'){
      add(g,tbox(r*1.83,r*1.83,r*1.52,c.skin,0,-r*.02,-r*.06,.83));
      const beard=mat(L.hair||'#b26c38',{rough:1});
      add(g,tbox(r*1.45,r*.77,r*.45,beard,0,-r*.59,r*.57,.60));
      for(let i=-1;i<=1;i++)add(g,box(r*.12,r*.46,r*.08,mat('#7c4e31'),i*r*.30,-r*.63,r*.83));
      for(const s of [-1,1]){
        lens(g,s*r*.37,r*.10,r*.80,r*.10,'#5c665c');
        add(g,tbox(r*.60,r*.20,r*.20,beard,s*r*.38,r*.30,r*.68,.73),
          tbox(r*.27,r*.77,r*.46,beard,s*r*.79,-r*.24,r*.08,.68));
      }
      add(g,tbox(r*1.90,r*.42,r*1.42,c.main,0,r*.82,-r*.13,.86),
        tbox(r*1.61,r*.21,r*.40,c.trim,0,r*.59,r*.67,.85));
      if(/tracker|riflekyn/.test(n))lens(g,r*.82,r*.14,r*.71,r*.22,'#749085');
      return true;
    }
    if(L.team==='elucidianStarstriders'&&L.body==='guard'){
      const skull=sph(r,c.skin,0,0,-r*.08);skull.scale.set(.88,1.03,.88);add(g,skull);
      add(g,tbox(r*1.14,r*.55,r*.65,c.skin,0,-r*.55,r*.32,.73));
      for(const s of [-1,1]){
        lens(g,s*r*.33,r*.12,r*.79,r*.085,'#65594b');
        add(g,box(r*.43,r*.09,r*.09,mat('#574438'),s*r*.34,r*.32,r*.72).rotateZ(-s*.13));
      }
      if(/voidmaster|voidsman/.test(n)){
        add(g,tbox(r*1.95,r*.48,r*1.58,c.main,0,r*.86,-r*.14,.84),
          tbox(r*1.81,r*.15,r*.56,c.trim,0,r*.60,r*.58,.83));
      }else if(/vhane/.test(n)){
        const hair=mat('#65432c',{rough:1});
        for(const s of [-1,1])add(g,tbox(r*.45,r*1.50,r*.67,hair,s*r*.78,-r*.12,-r*.20,.70));
        add(g,tbox(r*1.72,r*.45,r*1.48,hair,0,r*.79,-r*.20,.83));
      }else if(/executioner/.test(n)){
        add(g,tbox(r*1.57,r*.64,r*.29,dark(),0,-r*.36,r*.70,.75));
        for(const s of [-1,1])add(g,tbox(r*.40,r*1.92,r*.91,c.cloth,s*r*.87,r*.15,-r*.31,.74));
      }else{
        add(g,tbox(r*.66,r*1.37,r*.15,iron(),-r*.42,r*.13,r*.69,.75));
        lens(g,-r*.39,r*.15,r*.86,r*.18,'#819e92');
      }
      return true;
    }
    if(L.team==='chaosCult'){
      const mutant=/mutant|torment/.test(n);
      const skull=sph(r,c.skin,0,r*.03,-r*.15);skull.scale.set(mutant?1.12:.89,1.04,.88);add(g,skull);
      add(g,tbox(r*(mutant?1.57:1.14),r*.68,r*.84,c.skin,0,-r*.53,r*.37,.70));
      for(const s of [-1,1]){
        add(g,tbox(r*.64,r*.19,r*.23,c.skin,s*r*.42,r*.33,r*.68,.67).rotateZ(-s*.23));
        lens(g,s*r*.39,r*.13,r*.83,r*.10,mutant?'#9c8955':'#756354');
      }
      add(g,tbox(r*.84,r*.10,r*.10,dark(),0,-r*.47,r*.86,.70));
      if(mutant){
        for(const s of [-1,1])add(g,limb(V(s*r*.70,r*.65,-r*.18),V(s*r*1.13,r*1.32,-r*.40),r*.19,bone(),r*.02));
        for(let i=-1;i<=1;i++)add(g,cone(r*.065,r*.15,bone(),i*r*.24,-r*.49,r*.93,4).rotateZ(Math.PI));
      }else{
        for(const s of [-1,1])add(g,tbox(r*.43,r*1.85,r*.92,c.cloth,s*r*.87,r*.10,-r*.30,.70));
        add(g,tbox(r*1.83,r*.38,r*1.48,c.cloth,0,r*.91,-r*.25,.74));
      }
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=leather())=>add(upper,tbox(.07*k,.09*k,.045*k,color,x,y,z,.80),box(.05*k,.012*k,.05*k,iron(),x,y+.028*k,z));
    if(L.team==='goremongers'){
      for(const s of [-1,1]){
        add(upper,limb(V(s*B.tw*.34,shY,f),V(-s*B.tw*.22,hipY,f+.025*k),.014*k,leather()));
        add(upper,tbox(.13*k,.08*k,.13*k,M.trim,s*B.sx,shY+.02*k,0,.68));
        pouch(s*B.tw*.36,hipY,f*.75);
        add(fig,tbox(B.legR*1.35,B.leg*.23,.025*k,M.trim,s*B.tw*.32,B.leg*.25,(s===-1?.06:-.05)*k+B.legR*.82,.67));
      }
      if(/skullclaimer/.test(n))add(upper,sph(.034*k,bone(),B.tw*.47,hipY*.74,.015*k));
      if(/inciter|herald/.test(n))add(upper,tz(cyl(.04*k,.04*k,.02*k,M.trim,0,torsoY,f+.055*k)));
      if(/stalker/.test(n))for(let i=-1;i<=1;i++)add(upper,tbox(.025*k,.09*k,.025*k,iron(),i*.04*k,hipY*.88,f+.055*k,.65));
    }
    if(L.team==='hernkynYaegirs'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.34,B.th*.70,.04*k,M.cloth,s*B.tw*.32,torsoY,f+.01*k,.80).rotateZ(s*.13));
        add(upper,tbox(.12*k,.05*k,.12*k,mat('#b4a28b',{rough:1}),s*B.tw*.40,shY-.03*k,0,.78));
        pouch(s*B.tw*.32,hipY,f+.045*k);
      }
      add(upper,tbox(.21*k,.24*k,.12*k,leather(),0,torsoY,-f-.075*k,.82),cyl(.045*k,.045*k,.23*k,M.cloth,0,torsoY+.13*k,-f-.11*k).rotateZ(Math.PI/2));
      if(/bombast|ironbraek/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.025*k,.025*k,.095*k,iron(),i*.06*k,torsoY,f+.085*k));
      if(/tracker/.test(n))add(upper,tz(cyl(.045*k,.045*k,.025*k,iron(),B.tw*.49,torsoY,f)));
      if(/bladekyn/.test(n))pouch(-B.tw*.48,hipY*.80,0);
    }
    if(L.team==='elucidianStarstriders'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.29,B.th*.61,.025*k,M.main,s*B.tw*.29,torsoY,f+.015*k,.68).rotateZ(s*.15));
        pouch(s*B.tw*.37,hipY,f*.70);
        for(let i=0;i<3;i++)add(upper,sph(.008*k,M.trim,s*B.tw*.19,torsoY+(.065-i*.06)*k,f+.045*k));
      }
      if(/vhane|voidmaster/.test(n))for(const s of [-1,1]){
        add(upper,tbox(.12*k,.04*k,.12*k,M.trim,s*B.sx,shY+.03*k,0,.73));
        for(let i=0;i<3;i++)add(upper,box(.009*k,.045*k,.009*k,M.trim,s*B.sx+(i-1)*.027*k,shY, .064*k));
      }
      if(/rejuvenat/.test(n))pouch(B.tw*.53,hipY,0,mat('#c0baa5'));
      if(/lectro/.test(n)){
        add(upper,tbox(.14*k,.19*k,.10*k,iron(),0,torsoY,-f-.06*k,.80));
        for(const s of [-1,1])add(upper,cyl(.02*k,.02*k,.26*k,M.trim,s*.06*k,shY,-f-.08*k));
      }
    }
    if(L.team==='chaosCult'){
      const mutant=/mutant|torment/.test(n);
      for(const s of [-1,1]){
        add(upper,limb(V(s*B.tw*.35,shY,f),V(-s*B.tw*.25,hipY,f+.02*k),.013*k,leather()));
        pouch(s*B.tw*.38,hipY,f*.7);
      }
      if(mutant){
        const flesh=mat('#94766b',{rough:.94});
        add(upper,tbox(B.tw*.43,B.th*.51,.055*k,flesh,-B.tw*.24,torsoY,f+.03*k,.65));
        for(let i=0;i<4;i++)add(upper,aimY(cone(.022*k,.09*k,bone(),B.tw*.36,shY-.03*k-i*.06*k,-.02*k,5),V(.5,.7,-.3)));
        if(/torment/.test(n)){
          const a=V(-B.tw*.38,torsoY,-f),b=V(-B.tw*.75,shY+.11*k,-f-.10*k),d=V(-B.tw*.85,torsoY+.03*k,-f-.22*k);
          add(upper,limb(a,b,.045*k,flesh,.032*k),limb(b,d,.032*k,flesh,.007*k));
        }
      }else if(/demagogue|iconarch/.test(n))add(upper,tz(cyl(.045*k,.045*k,.025*k,M.trim,0,torsoY,f+.05*k)));
      if(/mindwitch/.test(n))for(let i=-1;i<=1;i++)add(upper,sph(.014*k,bone(),i*.045*k,torsoY+B.th*.22,f+.05*k));
    }
  }
  function finish(fig,L){
    if(!revision(L)||L.team!=='elucidianStarstriders'||L.body!=='beast')return;
    const fur=mat('#786147',{rough:1}),black=dark();
    // Long jaw, nose, ears and a leather harness follow the existing Canid's anatomy.
    add(fig,tbox(.09,.025,.15,fur,0,.525,.48,.7),tbox(.085,.018,.12,black,0,.494,.49,.75),sph(.026,black,0,.525,.565));
    for(const s of [-1,1]){
      add(fig,aimY(cone(.030,.11,fur,s*.06,.62,.34,4),V(s*.30,1,-.30)));
      add(fig,limb(V(s*.10,.43,.13),V(s*.12,.31,.02),.014,leather()),tbox(.018,.05,.07,iron(),s*.14,.38,.08,.75));
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='hernkynYaegirs')add(g,tbox(.07,.025,.16,iron(),0,.075,-.03,.82));
    if(L.team==='elucidianStarstriders')for(const s of [-1,1])add(g,box(.012,.026,.11,mat(L.trim,{metal:.55}),s*.05,.02,-.03));
  }
  return {revision,proportions,head,body,finish,weapon};
}
