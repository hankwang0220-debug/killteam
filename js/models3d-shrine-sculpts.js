// Optional gallery sculpts for armoured Sisters, Canoptek machines, hybrids and Aspect Warriors.
const revisions={celestianInsidiants:'insidiants-2',canoptekCircle:'canoptek-2',broodBrothers:'brood-brothers-2',bladesOfKhaine:'blades-2'};
export function createShrineSculpts(h){
  const {V,mat,box,tbox,cyl,sph,cone,limb,add,tz}=h;
  const revision=L=>L.refined?revisions[L.team]:undefined;
  const dark=()=>mat('#24272c',{rough:.92}),iron=()=>mat('#8b9297',{metal:.65,rough:.49});
  const bone=()=>mat('#c8c3ac',{rough:.78});
  function optic(g,x,y,z,r,color){
    add(g,tz(cyl(r*1.25,r*1.25,r*.35,dark(),x,y,z)));
    const eye=sph(r,mat(color,{metal:.22,rough:.28}),x,y,z+r*.20);eye.scale.set(1,.52,.26);add(g,eye);
  }
  function proportions(B,L){
    if(!revision(L))return;
    if(L.team==='celestianInsidiants'){B.tw*=1.05;B.td*=1.08;B.head*=1.05;B.armR*=1.05;}
    if(L.team==='canoptekCircle'){B.head*=1.08;B.tw*=1.04;B.armR*=.96;}
    if(L.team==='broodBrothers'){B.head*=1.07;if(/patriarch/i.test(L.name)){B.tw*=1.13;B.td*=1.12;B.armR*=1.15;}}
    if(L.team==='bladesOfKhaine'){B.tw*=.96;B.head*=1.06;B.wk*=.97;}
  }
  function head(g,L,B,c){
    if(!revision(L))return false;
    const r=B.head,n=L.name.toLowerCase();
    if(L.team==='celestianInsidiants'){
      add(g,tbox(r*1.72,r*1.96,r*1.58,c.main,0,0,-r*.10,.80),
        tbox(r*1.54,r*.39,r*.28,dark(),0,r*.16,r*.77,.78),
        tbox(r*1.13,r*.72,r*.47,iron(),0,-r*.45,r*.66,.70));
      for(const s of [-1,1]){
        optic(g,s*r*.38,r*.14,r*.97,r*.13,'#ad645c');
        add(g,tbox(r*.34,r*1.22,r*.46,c.trim,s*r*.86,r*.01,r*.10,.72));
      }
      for(let i=-1;i<=1;i++)add(g,box(r*.09,r*.34,r*.08,dark(),i*r*.27,-r*.46,r*.93));
      add(g,tbox(r*.22,r*1.52,r*.15,c.trim,0,r*.60,r*.68,.75));
      return true;
    }
    if(L.team==='canoptekCircle'&&L.body==='necron'){
      const skull=sph(r,c.main,0,r*.16,-r*.16);skull.scale.set(.95,1.03,.79);add(g,skull);
      add(g,tbox(r*1.43,r*.35,r*.27,dark(),0,r*.12,r*.65,.72),
        tbox(r*1.14,r*.72,r*.55,c.main,0,-r*.50,r*.32,.70));
      for(const s of [-1,1]){
        optic(g,s*r*.36,r*.11,r*.84,r*.11,'#7abca5');
        add(g,tbox(r*.32,r*1.58,r*.42,c.trim,s*r*.97,r*.32,-r*.20,.75));
      }
      for(let i=-2;i<=2;i++)add(g,box(r*.07,r*.28,r*.07,dark(),i*r*.18,-r*.56,r*.63));
      return true;
    }
    if(L.team==='broodBrothers'){
      const patriarch=/patriarch/.test(n),bare=/patriarch|magus|primus/.test(n);
      const skin=sph(r,c.skin,0,r*.03,-r*.12);skin.scale.set(patriarch?1.10:.94,patriarch?1.16:1.04,.88);add(g,skin);
      add(g,tbox(r*(patriarch?1.56:1.22),r*.66,r*.85,c.skin,0,-r*.52,r*.36,.70));
      for(const s of [-1,1]){
        optic(g,s*r*.37,r*.12,r*.83,r*.10,'#91726a');
        add(g,tbox(r*.57,r*.20,r*.25,c.skin,s*r*.40,r*.32,r*.67,.67).rotateZ(-s*.15));
      }
      if(bare){
        for(let i=-2;i<=2;i++)add(g,tbox(r*.12,r*.12,r*.78,c.skin,i*r*.22,r*(.93-Math.abs(i)*.08),-r*.06,.72));
        if(patriarch){
          add(g,tbox(r*.90,r*.16,r*.13,dark(),0,-r*.41,r*.91,.68));
          for(let i=-2;i<=2;i++)add(g,cone(r*.055,r*.14,bone(),i*r*.18,-r*.47,r*.97,4).rotateZ(Math.PI));
        }
      }else{
        const cap=sph(r*1.09,c.main,0,r*.43,-r*.18);cap.scale.set(1,.72,1);add(g,cap);
        add(g,tbox(r*1.88,r*.20,r*.41,c.trim,0,r*.36,r*.58,.83));
      }
      return true;
    }
    if(L.team==='bladesOfKhaine'){
      const banshee=L.aspectKind==='banshee',scorpion=L.aspectKind==='scorpion';
      const cap=sph(r,c.main,0,r*.18,-r*.14);cap.scale.set(.88,1.27,.90);add(g,cap);
      add(g,tbox(r*.88,r*1.13,r*.34,banshee?bone():dark(),0,-r*.22,r*.68,.61));
      for(const s of [-1,1]){
        optic(g,s*r*.32,r*.16,r*.87,r*.11,'#b56d59');
        add(g,tbox(r*.27,r*.93,r*.24,c.trim,s*r*.76,-r*.18,r*.31,.66));
        if(scorpion)add(g,tz(cyl(r*.14,r*.18,r*.65,iron(),s*r*.72,-r*.40,r*.69)));
      }
      if(banshee){
        for(let i=-1;i<=1;i++)add(g,box(r*.09,r*.42,r*.08,dark(),i*r*.22,-r*.43,r*.91));
        for(const s of [-1,1])for(let i=0;i<3;i++)add(g,limb(V(s*r*.67,r*.88,-r*.27),V(s*r*(1.0+i*.16),r*(1.20-i*.24),-r*(.75+i*.20)),r*.10,mat('#9e493c',{rough:.94}),r*.02));
      }else if(!scorpion){
        for(let i=0;i<5;i++)add(g,tbox(r*.28,r*.65,r*.16,c.trim,0,r*(1.55-i*.08),-r*(.03+i*.28),.7));
      }else for(let i=0;i<3;i++)add(g,tbox(r*.26,r*.42,r*.18,c.trim,0,r*(1.27-i*.12),-r*(.25+i*.32),.70));
      return true;
    }
    return false;
  }
  function body(c){
    const {L,B,k,upper,fig,hipY,torsoY,shY,M}=c;if(!revision(L))return;
    const f=B.td/2,n=L.name.toLowerCase();
    const pouch=(x,y,z,color=dark())=>add(upper,tbox(.07*k,.09*k,.045*k,color,x,y,z,.80),box(.05*k,.012*k,.05*k,iron(),x,y+.025*k,z));
    if(L.team==='celestianInsidiants'){
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.38,B.th*.44,.03*k,M.trim,s*B.tw*.24,torsoY,f+.02*k,.75),tbox(B.tw*.30,B.th*.33,.035*k,M.main,s*B.tw*.24,torsoY,f+.045*k,.74));
        add(fig,tbox(B.legR*1.6,B.leg*.29,.03*k,M.main,s*B.tw*.32,B.leg*.25,(s===-1?.06:-.05)*k+B.legR*.83,.76));
        pouch(s*B.tw*.38,hipY,f*.70);
      }
      if(/abjuror/.test(n))add(upper,tbox(.12*k,.10*k,.13*k,M.trim,-B.sx,shY-.07*k,0,.70));
      if(/censor/.test(n))add(upper,limb(V(B.tw*.38,hipY,0),V(B.tw*.46,hipY*.62,.02*k),.006*k,iron()),sph(.035*k,M.trim,B.tw*.46,hipY*.59,.02*k));
      if(/denuncia/.test(n))add(upper,box(.01*k,.34*k,.01*k,iron(),B.tw*.33,shY+.12*k,-f-.06*k));
      if(/mortisanctus|reliquarius/.test(n))pouch(B.tw*.52,hipY,0,bone());
    }
    if(L.team==='canoptekCircle'){
      for(const s of [-1,1])for(let i=0;i<4;i++)add(upper,tbox(B.tw*(.37-i*.04),.024*k,.025*k,iron(),s*B.tw*.24,torsoY+(.075-i*.05)*k,f+.02*k,.70).rotateZ(s*.15));
      for(let i=0;i<4;i++)add(upper,tbox(.055*k,.026*k,.025*k,M.trim,0,torsoY+(.07-i*.05)*k,-f-.02*k,.72));
    }
    if(L.team==='broodBrothers'){
      const alien=/patriarch|magus|primus/.test(n);
      for(const s of [-1,1]){
        add(upper,tbox(B.tw*.36,B.th*.37,.03*k,alien?M.main:M.trim,s*B.tw*.24,torsoY,f+.025*k,.75));
        pouch(s*B.tw*.38,hipY,f*.75);
      }
      if(/medic/.test(n))pouch(B.tw*.51,hipY,0,mat('#bcb3a2'));
      if(/sapper/.test(n))for(let i=-1;i<=1;i++)add(upper,cyl(.024*k,.024*k,.10*k,iron(),i*.06*k,torsoY,f+.08*k));
      if(/vox/.test(n))add(upper,tbox(.15*k,.19*k,.10*k,M.main,0,torsoY,-f-.06*k,.8),box(.01*k,.41*k,.01*k,iron(),B.tw*.3,shY+.15*k,-f-.09*k));
      if(/patriarch/.test(n)){
        for(const s of [-1,1])for(let i=0;i<3;i++)add(upper,tbox(.075*k,.045*k,.03*k,M.main,s*B.tw*.31,torsoY+(.08-i*.065)*k,f+.05*k,.65));
        const tail=[V(0,hipY,-B.td*.42),V(.04*k,hipY*.58,-B.td*.85),V(.16*k,.10*k,-B.td*1.55),V(.28*k,.07*k,-B.td*1.8)];
        for(let i=0;i<3;i++)add(fig,limb(tail[i],tail[i+1],(.033-i*.009)*k,M.main,(.024-i*.009)*k));
      }
    }
    if(L.team==='bladesOfKhaine'){
      for(const s of [-1,1]){
        for(let i=0;i<3;i++)add(upper,tbox(B.tw*.31,.045*k,.025*k,M.main,s*B.tw*.24,torsoY+(.065-i*.05)*k,f+.025*k,.65));
        add(fig,tbox(B.legR*1.35,B.leg*.26,.022*k,M.main,s*B.tw*.32,B.leg*.26,(s===-1?.06:-.05)*k+B.legR*.83,.68));
      }
      add(upper,tz(cyl(.024*k,.032*k,.025*k,M.trim,0,torsoY+B.th*.24,f+.04*k)));
      if(L.aspectKind==='scorpion')for(const s of [-1,1])add(upper,tbox(.11*k,.07*k,.13*k,M.main,s*B.sx,shY,0,.7));
    }
  }
  function finish(fig,L){
    if(!revision(L)||L.team!=='canoptekCircle'||fig.userData.humanoid)return;
    const plate=mat(L.main,{metal:.65,rough:.48}),trim=mat(L.trim,{metal:.45,rough:.48});
    if(L.body==='crawler'){
      for(const s of [-1,1]){
        for(let i=0;i<3;i++){
          const z=.30-i*.30;
          add(fig,tbox(.13,.045,.20,plate,s*.20,.70,z,.72),sph(.053,trim,s*.55,.75,z+.05));
          add(fig,limb(V(s*.54,.70,z+.06),V(s*.65,.25,z+.09),.012,iron()));
        }
        add(fig,tbox(.09,.12,.035,dark(),s*.09,.72,.588,.73));optic(fig,s*.09,.73,.615,.022,'#74af9f');
        for(let i=0;i<3;i++)add(fig,box(.006,.060,.008,trim,s*(.065+i*.022),.64,.585));
      }
      if(/isolator/.test(L.name.toLowerCase()))add(fig,cyl(.035,.035,.18,trim,0,.88,.44));
    }else if(L.body==='macrocyte'){
      for(const s of [-1,1]){
        add(fig,tbox(.07,.035,.15,plate,s*.075,.785,-.01,.73));
        add(fig,limb(V(s*.10,.67,0),V(s*.19,.59,.13),.009,trim),sph(.023,trim,s*.19,.59,.13));
      }
      if(/reanimator/i.test(L.name))add(fig,tz(cyl(.035,.035,.08,trim,0,.65,.18)));
      if(/accelerator/i.test(L.name))add(fig,box(.012,.16,.012,trim,0,.81,-.07));
    }
  }
  function weapon(g,r,L){
    if(!revision(L))return;
    if(L.team==='celestianInsidiants')add(g,tbox(.055,.028,.09,iron(),0,.073,-.045,.75));
    if(L.team==='broodBrothers')add(g,tbox(.065,.03,.12,mat(L.trim,{rough:.8}),0,.063,-.04,.75));
    if(L.team==='bladesOfKhaine')for(const s of [-1,1])add(g,tbox(.012,.035,.10,mat(L.main,{rough:.65}),s*.05,.02,-.025,.65));
  }
  return {revision,proportions,head,body,finish,weapon};
}
