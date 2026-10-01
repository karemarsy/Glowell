(function(){
'use strict';
var S=window.STORE||{};
document.documentElement.classList.add('js');
var introDone=false;
function endIntro(){if(introDone)return;introDone=true;var h=document.documentElement;h.classList.add('introrun');h.classList.remove('intro');setTimeout(function(){h.classList.remove('introrun')},2600)}
requestAnimationFrame(function(){requestAnimationFrame(endIntro)});
setTimeout(endIntro,1200);
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var NUM=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
var CUR=S.currency||'RWF';
var money=function(n){return NUM.format(Math.round(n))+' '+CUR};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};

/* ---------- data (edit store-config.js, not this) ---------- */
var P=S.products||[];
var BY={};P.forEach(function(p){BY[p.id]=p});
/* the hero shows products marked hero:true (all of them if none are marked) */
var H=P.filter(function(p){return p.hero});if(!H.length)H=P;
var PAIRS=(S.pairs||[]).filter(function(pr){return BY[pr.a]&&BY[pr.b]});
var DISC=S.pairDiscount||0;
var FREE=S.freeShipping||0;

/* ---------- colour + drawing helpers ---------- */
function hx(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function mix(a,b,t){var A=hx(a),B=hx(b);return '#'+A.map(function(v,i){return ('0'+Math.round(v+(B[i]-v)*t).toString(16)).slice(-2)}).join('')}
function cyl(id,c,d,l){d=d==null?.55:d;l=l==null?.28:l;
  return '<linearGradient id="'+id+'" x1="0" x2="1"><stop offset="0" stop-color="'+mix(c,'#000000',d)+'"/><stop offset=".15" stop-color="'+mix(c,'#000000',d*.33)+'"/><stop offset=".38" stop-color="'+mix(c,'#ffffff',l)+'"/><stop offset=".66" stop-color="'+c+'"/><stop offset="1" stop-color="'+mix(c,'#000000',d*1.05)+'"/></linearGradient>'}
var UID=0,MT=6.5; /* seconds per motion loop, keep in sync with --mt in styles.css */
var SANS='font-family="Manrope,Arial,sans-serif"',SERIF='font-family="Bodoni Moda,Georgia,serif"';
function label(x,y,w,h,p,ink,bar,bg){
  var cx=x+w/2,fs=Math.min(15,(w-12)/(p.l1.length*.56)),f2=Math.min(fs*.82,(w-12)/(p.l2.length*.5));
  var s='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2.5" fill="'+(bg||'#F8F4EC')+'"/>';
  if(bar)s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="5" fill="'+bar+'"/>';
  s+='<text x="'+cx+'" y="'+(y+(bar?19:15))+'" text-anchor="middle" '+SANS+' font-weight="700" font-size="4.6" letter-spacing="1.2" fill="'+ink+'" opacity=".85">'+(p.kind==='in'?'DIETARY SUPPLEMENT':'SKINCARE')+'</text>';
  s+='<text x="'+cx+'" y="'+(y+h*.52)+'" text-anchor="middle" '+SERIF+' font-weight="600" font-size="'+fs.toFixed(1)+'" fill="'+ink+'">'+esc(p.l1)+'</text>';
  s+='<text x="'+cx+'" y="'+(y+h*.52+fs*.95)+'" text-anchor="middle" '+SERIF+' font-style="italic" font-size="'+f2.toFixed(1)+'" fill="'+ink+'">'+esc(p.l2)+'</text>';
  s+='<rect x="'+(cx-10)+'" y="'+(y+h-19)+'" width="20" height=".7" fill="'+ink+'" opacity=".5"/>';
  s+='<text x="'+cx+'" y="'+(y+h-9)+'" text-anchor="middle" '+SANS+' font-size="5" letter-spacing=".7" fill="'+ink+'" opacity=".75">'+esc(p.size.toUpperCase())+'</text>';
  return s;
}
/* ---------- product motion pieces (hidden until a scene "plays") ---------- */
var DROP='<path d="M0 0C3 5 6 9 6 12.5A6 6 0 0 1-6 12.5C-6 9-3 5 0 0Z"/>';
function drop(x,y,c,cls){
  var open=cls.map(function(k){return '<g class="'+k+'">'}).join(''),close=cls.map(function(){return '</g>'}).join('');
  return '<g transform="translate('+x+','+y+')">'+open+'<g fill="'+c+'">'+DROP+'</g><ellipse cx="-2.2" cy="12" rx="1.4" ry="2.4" fill="#fff" opacity=".75"/>'+close+'</g>';
}
function splash(x,y,c,at){
  return '<g transform="translate('+x+','+y+')" style="--at:'+at+'s">'+
    '<ellipse class="m-pud" rx="9" ry="2" fill="'+c+'"/>'+
    '<ellipse class="m-rip" rx="16" ry="3.4" fill="none" stroke="'+c+'" stroke-width="1.8"/>'+
    '<ellipse class="m-rip m-rip2" rx="16" ry="3.4" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.1"/>'+
    '<circle class="m-sp" style="--sx:-10px;--sy:-12px" r="2.2" fill="'+c+'"/>'+
    '<circle class="m-sp" style="--sx:9px;--sy:-15px" r="1.8" fill="'+c+'"/>'+
    '<circle class="m-sp" style="--sx:2px;--sy:-9px" r="1" fill="'+c+'"/></g>';
}
var STAR='<path d="M0-7L1.5-1.5 7 0 1.5 1.5 0 7-1.5 1.5-7 0-1.5-1.5Z" fill="#fff"/>';
/* product art in a 200 x 300 box, resting on y = 284 */
function art(p,u){
  var d='',b='',g=u+'g',i,c;
  if(p.shape==='dropper'){
    c=mix(p.glass,'#FFC060',.35);
    d=cyl(g,p.glass,.6,.3)+cyl(u+'r','#2b2b2b',.7,.5)+cyl(u+'o','#C9A24A',.55,.45);
    b='<g class="m-drp">'+
        '<rect x="95" y="112" width="10" height="40" rx="5" fill="'+mix(p.glass,'#ffffff',.5)+'" opacity=".85"/><rect x="97" y="116" width="2" height="30" rx="1" fill="#fff" opacity=".6"/>'+
        '<g class="m-bulb"><rect x="80" y="12" width="40" height="78" rx="19" fill="url(#'+u+'r)"/><rect x="87" y="20" width="5" height="52" rx="2.5" fill="#fff" opacity=".18"/></g>'+
        '<rect x="74" y="86" width="52" height="30" rx="5" fill="url(#'+u+'o)"/><rect x="74" y="99" width="52" height="1" fill="#000" opacity=".25"/>'+
      '</g>'+
      '<rect x="84" y="114" width="32" height="14" fill="url(#'+g+')"/><rect x="46" y="124" width="108" height="160" rx="24" fill="url(#'+g+')"/>'+
      '<rect x="49" y="152" width="102" height="129" rx="21" fill="'+mix(p.glass,'#FFB347',.3)+'" opacity=".38"/>'+
      label(58,176,84,88,p,'#22170f')+
      '<rect x="51" y="136" width="6" height="130" rx="3" fill="#fff" opacity=".32"/><rect x="144" y="140" width="3" height="120" rx="1.5" fill="#fff" opacity=".2"/>'+
      splash(162,282,c,(MT*.52).toFixed(2))+drop(162,110,c,['m-fall']);
  }else if(p.shape==='jar'){
    var cr=p.cream||'#FFFDF8';
    d=cyl(g,'#F1ECE3',.38,.12)+cyl(u+'k','#1a1a1a',.7,.5)+cyl(u+'o','#C9A24A',.55,.45);
    b='<rect x="28" y="166" width="144" height="118" rx="18" fill="url(#'+g+')"/>'+
      '<rect x="32" y="156" width="136" height="14" rx="4" fill="url(#'+g+')"/><rect x="32" y="161" width="136" height="1" fill="#000" opacity=".12"/>'+
      '<g class="m-dome"><path d="M38 160C50 145 74 140 100 140S150 145 162 160Z" fill="'+cr+'"/>'+
        '<path d="M91 141C92 127 110 124 112 133C108 129 101 131 103 141Z" fill="'+cr+'"/>'+
        '<path d="M58 152C72 146 86 145 98 146" fill="none" stroke="'+mix(cr,'#000000',.1)+'" stroke-width="1.6" stroke-linecap="round"/><path d="M110 147C124 146 136 149 146 154" fill="none" stroke="'+mix(cr,'#000000',.1)+'" stroke-width="1.6" stroke-linecap="round"/></g>'+
      '<g class="m-lid"><rect x="24" y="124" width="152" height="46" rx="9" fill="url(#'+u+'k)"/><rect x="24" y="166" width="152" height="6" fill="url(#'+u+'o)"/>'+
        '<rect x="34" y="132" width="132" height="5" rx="2.5" fill="#fff" opacity=".14"/></g>'+
      '<text x="100" y="204" text-anchor="middle" '+SANS+' font-weight="700" font-size="5.5" letter-spacing="1.8" fill="#2a2622">SKINCARE</text>'+
      '<text x="100" y="231" text-anchor="middle" '+SERIF+' font-weight="600" font-size="22" fill="#2a2622">'+esc(p.l1)+'</text>'+
      '<text x="100" y="248" text-anchor="middle" '+SERIF+' font-style="italic" font-size="14" fill="#2a2622">'+esc(p.l2)+'</text>'+
      '<text x="100" y="270" text-anchor="middle" '+SANS+' font-size="5.6" letter-spacing=".8" fill="#2a2622" opacity=".7">'+esc(p.size.toUpperCase())+'</text>'+
      '<rect x="36" y="180" width="8" height="92" rx="4" fill="#fff" opacity=".7"/>'+
      [[62,128,0,.8],[138,122,1,1],[102,108,2,.6],[46,112,3,.55],[156,104,4,.7]].map(function(s){return '<g transform="translate('+s[0]+','+s[1]+') scale('+s[3]+')"><g class="m-spk" style="--i:'+s[2]+'">'+STAR+'</g></g>'}).join('');
  }else if(p.shape==='pump'){
    c=mix(p.glass,'#DCE8FF',.6);
    d=cyl(g,p.glass,.6,.3)+cyl(u+'s','#B9BDC4',.55,.5)+'<clipPath id="'+u+'lq"><rect x="57" y="132" width="86" height="149" rx="19"/></clipPath>';
    var bub='';[[70,3.6,3.8,0],[86,2.2,3.1,-1.1],[104,3,4.4,-2.6],[121,2,3.4,-.5],[131,3.2,4.1,-3.2],[96,1.8,2.9,-1.9]].forEach(function(q){
      bub+='<circle class="m-bub" cx="'+q[0]+'" cy="276" r="'+q[1]+'" fill="#fff" style="--d:'+q[2]+'s;--dl:'+q[3]+'s;--bx:'+(q[0]%2?3:-3)+'px"/>'});
    b='<g class="m-head"><rect x="93" y="46" width="14" height="36" fill="url(#'+u+'s)"/><rect x="72" y="26" width="56" height="24" rx="7" fill="url(#'+u+'s)"/><rect x="120" y="32" width="30" height="9" rx="4.5" fill="url(#'+u+'s)"/></g>'+
      '<rect x="76" y="78" width="48" height="26" rx="4" fill="url(#'+u+'s)"/><rect x="76" y="90" width="48" height="1" fill="#000" opacity=".25"/>'+
      '<rect x="54" y="98" width="92" height="186" rx="22" fill="url(#'+g+')"/><rect x="57" y="132" width="86" height="149" rx="19" fill="'+mix(p.glass,'#9CC0FF',.3)+'" opacity=".3"/>'+
      '<g clip-path="url(#'+u+'lq)">'+bub+'</g>'+
      label(64,164,72,92,p,'#14213f')+
      '<rect x="58" y="112" width="6" height="150" rx="3" fill="#fff" opacity=".32"/><rect x="138" y="116" width="3" height="140" rx="1.5" fill="#fff" opacity=".2"/>'+
      [[-2,-7],[5,-9],[8,-3],[3,4]].map(function(m){return '<g transform="translate(151,45)"><circle class="m-mist" r="1.1" fill="'+c+'" style="--mx:'+(m[0]*2)+'px;--my:'+(m[1]*1.6)+'px"/></g>'}).join('')+
      splash(199,282,c,(MT*.38).toFixed(2))+drop(153,40,c,['m-jx','m-jy']);
  }else if(p.shape==='tube'){
    d=cyl(g,p.glass,.35,.15)+cyl(u+'m',mix(p.glass,'#000000',.1),.4,.15)+cyl(u+'c',mix(p.b2,'#000000',.15),.6,.35);
    var rg='';for(i=0;i<13;i++){rg+='<rect x="'+(52+i*7.7).toFixed(1)+'" y="37" width="1" height="24" fill="#000" opacity=".12"/>'}
    var hits=[[133,42,108,4],[151,73,197,76],[162,114,200,142]];
    var sp='';for(i=0;i<8;i++){sp+='<rect x="-1.2" y="-21" width="2.4" height="6" rx="1.2" fill="#FFE7A0" transform="rotate('+(i*45)+')"/>'}
    b='<rect x="66" y="238" width="68" height="46" rx="7" fill="url(#'+u+'c)"/><rect x="66" y="251" width="68" height="1.2" fill="#000" opacity=".3"/>'+
      '<path d="M72 244C70 236 68 228 66 220L50 62H150L134 220C132 228 130 236 128 244Z" fill="url(#'+g+')"/>'+
      '<rect x="48" y="34" width="104" height="30" rx="3" fill="url(#'+u+'m)"/>'+rg+
      '<path d="M50.9 70H149.1L147.5 86H52.5Z" fill="'+p.b2+'"/>'+
      label(66,104,68,92,p,'#3a1d12',null,'none')+
      '<path d="M56 70H62L72 228H68Z" fill="#fff" opacity=".45"/>'+
      '<ellipse class="m-shd" cx="100" cy="160" rx="66" ry="136" fill="#fff" fill-opacity=".07" stroke="#fff" stroke-opacity=".75" stroke-width="1.5"/>'+
      hits.map(function(h,k){return '<line class="m-ray" pathLength="100" style="--i:'+k+'" x1="178" y1="24" x2="'+h[0]+'" y2="'+h[1]+'" stroke="#FFF1C2" stroke-width="2.4" stroke-linecap="round"/>'+
        '<line class="m-ref" pathLength="100" style="--i:'+k+'" x1="'+h[0]+'" y1="'+h[1]+'" x2="'+h[2]+'" y2="'+h[3]+'" stroke="#FFF1C2" stroke-width="2" stroke-linecap="round"/>'}).join('')+
      '<g transform="translate(178,24)"><g class="m-sun"><circle r="16" fill="#FFE7A0" opacity=".3"/><circle r="10" fill="#FFE08A"/><g class="m-sunr">'+sp+'</g></g></g>';
  }else{
    d=cyl(g,'#F2EEE8',.38,.1)+cyl(u+'w',mix(p.b1,'#000000',.12),.5,.3);
    var rid='';for(i=0;i<15;i++){rid+='<rect x="'+(48+i*7.4).toFixed(1)+'" y="96" width="1.2" height="42" fill="#000" opacity=".1"/>'}
    b='<rect x="54" y="122" width="92" height="20" rx="5" fill="url(#'+g+')"/><rect x="54" y="128" width="92" height="1.2" fill="#000" opacity=".12"/><rect x="54" y="133" width="92" height="1.2" fill="#000" opacity=".12"/>'+
      '<rect x="38" y="136" width="124" height="148" rx="18" fill="url(#'+g+')"/>'+
      '<g class="m-cap"><rect x="42" y="92" width="116" height="50" rx="8" fill="url(#'+u+'w)"/>'+rid+'</g>'+
      label(38,172,124,92,p,'#ffffff',null,p.b1)+
      '<rect x="44" y="144" width="7" height="128" rx="3.5" fill="#fff" opacity=".4"/>';
  }
  return '<defs>'+d+'</defs>'+b;
}
function capsule(u,n,x,y,rot,A,B){
  var c=u+'c'+n;
  return '<g transform="translate('+x+','+y+') rotate('+rot+')"><ellipse cx="0" cy="11" rx="26" ry="5" fill="#000" opacity=".28" filter="url(#'+u+'b)"/>'+
    '<g transform="translate(-24,-10) scale(1.1)"><clipPath id="'+c+'"><rect width="44" height="18" rx="9"/></clipPath><g clip-path="url(#'+c+')"><rect width="23" height="18" fill="'+A+'"/><rect x="22" width="22" height="18" fill="'+B+'"/><rect width="44" height="18" fill="url(#'+u+'s)"/></g><rect x="22" width="1.2" height="18" fill="#000" opacity=".18"/></g></g>';
}
function softgel(u,x,y,rot){
  return '<g transform="translate('+x+','+y+') rotate('+rot+')"><ellipse cx="0" cy="11" rx="22" ry="5" fill="#000" opacity=".28" filter="url(#'+u+'b)"/><ellipse rx="22" ry="13" fill="url(#'+u+'a)"/><ellipse cx="-6" cy="-5" rx="9" ry="3.4" fill="#fff" opacity=".55"/></g>';
}
/* capsules / softgels that pop out of the open bottle and land on the stand */
function pour(p,u){
  var ox=300,oy=278;
  var land=p.gel?[[300,534],[146,506],[352,522]]:[[292,533],[150,506],[455,502]];
  var ups=[-62,-48,-72],rots=p.gel?['200deg','-330deg','370deg']:['192deg','-340deg','380deg'];
  var sh='',fl='';
  land.forEach(function(L,i){
    var v='--i:'+i+';--dx:'+(L[0]-ox)+'px;--dy:'+(L[1]-oy)+'px;--up:'+ups[i]+'px;--rot:'+rots[i];
    sh+='<g transform="translate('+L[0]+','+(L[1]+11)+')" style="'+v+'"><ellipse class="m-psh" rx="'+(p.gel?22:26)+'" ry="5" fill="#000" filter="url(#'+u+'b)"/></g>';
    var shape=p.gel?'<ellipse rx="22" ry="13" fill="url(#'+u+'a)"/><ellipse cx="-6" cy="-5" rx="9" ry="3.4" fill="#fff" opacity=".55"/>':
      '<g transform="translate(-24,-10) scale(1.1)"><clipPath id="'+u+'f'+i+'"><rect width="44" height="18" rx="9"/></clipPath><g clip-path="url(#'+u+'f'+i+')"><rect width="23" height="18" fill="'+p.capA+'"/><rect x="22" width="22" height="18" fill="'+p.capB+'"/><rect width="44" height="18" fill="url(#'+u+'s)"/></g><rect x="22" width="1.2" height="18" fill="#000" opacity=".18"/></g>';
    fl+='<g transform="translate('+ox+','+oy+')" style="'+v+'"><g class="m-px"><g class="m-py"><g class="m-pr">'+shape+'</g></g></g></g>';
  });
  return sh+fl;
}
function photo(p,lazy){return '<img src="'+esc(p.image)+'" alt="'+esc(p.name)+'"'+(lazy?' loading="lazy"':'')+' decoding="async">'}
function scene(p,u){
  if(p.image)return photo(p,true);
  var pc=mix(p.b2,'#ffffff',.14),top=mix(p.b1,'#ffffff',.3);
  var s='<svg viewBox="0 0 600 620" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><defs>'+
    '<filter id="'+u+'b" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>'+
    cyl(u+'p',pc,.5,.22)+
    '<linearGradient id="'+u+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>'+
    '<radialGradient id="'+u+'a" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFD27A"/><stop offset=".6" stop-color="#E69A2E"/><stop offset="1" stop-color="#9A5A10"/></radialGradient>'+
    '</defs>'+
    '<ellipse cx="300" cy="586" rx="250" ry="24" fill="#000" opacity=".3" filter="url(#'+u+'b)"/>'+
    '<path d="M110 500 V560 A190 34 0 0 0 490 560 V500 Z" fill="url(#'+u+'p)"/>'+
    '<ellipse cx="300" cy="500" rx="190" ry="34" fill="'+top+'"/>'+
    '<ellipse cx="300" cy="500" rx="190" ry="34" fill="none" stroke="#fff" stroke-opacity=".35"/>'+
    '<ellipse cx="300" cy="504" rx="86" ry="11" fill="#000" opacity=".32" filter="url(#'+u+'b)"/>'+
    '<g transform="translate(155,91) scale(1.45)">'+art(p,u+'x')+'</g>';
  if(p.shape==='supp'){
    if(p.gel){s+=softgel(u,404,517,-14)+softgel(u,452,500,22)+softgel(u,196,522,10)}
    else{s+=capsule(u,1,408,518,-18,p.capA,p.capB)+capsule(u,2,362,531,24,p.capA,p.capB)+capsule(u,3,196,525,10,p.capA,p.capB)}
    s+=pour(p,u);
  }
  return s+'</svg>';
}
function thumb(p){return p.image?photo(p,true):'<svg viewBox="0 0 200 300" aria-hidden="true" focusable="false">'+art(p,'t'+(++UID))+'</svg>'}
function sceneU(p){return scene(p,'s'+(++UID))}
function vars(p){return '--b1:'+p.b1+';--b2:'+p.b2+';--fg:'+p.fg+';--on:'+p.on}

/* ---------- hero ---------- */
var hero=$('#top'),bks=$('#bks'),stage=$('#stage'),spot=$('#spot'),idx=$('#idx');
bks.innerHTML=H.map(function(p,i){return '<div class="bk'+(i===0?' on':'')+'" style="background:radial-gradient(90% 80% at 68% 46%,'+p.b1+','+p.b2+' 78%)"></div>'}).join('');
stage.innerHTML=H.map(function(p,i){return '<div class="sc'+(i===0?' on':'')+'">'+sceneU(p)+'</div>'}).join('');
function tabsFor(kind,label){
  if(!H.some(function(p){return p.kind===kind}))return '';
  return '<div class="grp"><span class="gl">'+label+'</span><div class="tabs">'+H.map(function(p,i){return p.kind===kind?'<button class="tab" role="tab" data-i="'+i+'" aria-selected="false"><span>'+esc(p.name)+'</span><span class="pg"></span></button>':''}).join('')+'</div></div>';
}
idx.innerHTML=tabsFor('out','Skincare')+tabsFor('in','Vitamins');
var heroIdx=0,zTop=1,auto=null;
function setSpot(p){$('#s-name').textContent=p.name;$('#s-meta').textContent=p.type+', '+p.size;$('#s-one').textContent=p.one;$('#s-price').textContent=money(p.price)}
function markTabs(i,run){
  $$('.tab',idx).forEach(function(t){
    var on=+t.dataset.i===i;t.setAttribute('aria-selected',on);t.classList.remove('run');
    if(on&&run){void t.offsetWidth;t.classList.add('run')}
  });
}
function setHero(i,run){
  if(i===heroIdx)return;
  var p=H[i];heroIdx=i;
  var bk=$$('.bk',bks)[i];bk.style.zIndex=++zTop;bk.classList.add('on');
  setTimeout(function(){$$('.bk',bks).forEach(function(b,k){if(k!==heroIdx)b.classList.remove('on')})},1400);
  $$('.sc',stage).forEach(function(s,k){s.classList.toggle('on',k===i)});
  playHero(i);
  hero.style.setProperty('--fg',p.fg);hero.style.setProperty('--on',p.on);
  spot.classList.add('sw');
  setTimeout(function(){setSpot(p);spot.classList.remove('sw')},reduce?0:340);
  markTabs(i,run);
}
/* product motion: the active hero scene plays once it has slid in;
   the outgoing one keeps playing until it has faded, so nothing snaps */
var playT;
function playHero(i){
  clearTimeout(playT);
  playT=setTimeout(function(){
    $$('.sc',stage).forEach(function(s,k){if(k===i)s.classList.add('play')});
    setTimeout(function(){$$('.sc',stage).forEach(function(s,k){if(k!==heroIdx)s.classList.remove('play')})},500);
  },reduce?0:700);
}
playHero(0);
if(H.length){
  setSpot(H[0]);hero.style.setProperty('--fg',H[0].fg);hero.style.setProperty('--on',H[0].on);
  markTabs(0,!reduce);
}
function startAuto(){stopAuto();if(reduce||H.length<2)return;auto=setInterval(function(){if(!document.hidden)setHero((heroIdx+1)%H.length,true)},6000)}
function stopAuto(){clearInterval(auto)}
startAuto();
idx.addEventListener('click',function(e){var t=e.target.closest('.tab');if(!t)return;stopAuto();setHero(+t.dataset.i,false);markTabs(+t.dataset.i,false)});
$('#hero-add').addEventListener('click',function(){add(H[heroIdx].id)});
$('#hero-more').addEventListener('click',function(){goPanel(H[heroIdx].id)});

/* studio light + parallax */
var glow=$('#glow'),gx=0,gy=0,tx=0,ty=0,px=0,py=0,sx=0,sy=0,heroVisible=true;
hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();tx=e.clientX-r.left;ty=e.clientY-r.top;px=(e.clientX/window.innerWidth-.5)*2;py=(e.clientY/window.innerHeight-.5)*2});
hero.addEventListener('pointerleave',function(){tx=hero.clientWidth*.68;ty=hero.clientHeight*.42;px=0;py=0});
if('IntersectionObserver' in window){new IntersectionObserver(function(en){heroVisible=en[0].isIntersecting}).observe(hero)}
function frame(){
  requestAnimationFrame(frame);
  if(!heroVisible||document.hidden)return;
  gx+=(tx-gx)*.06;gy+=(ty-gy)*.06;sx+=(px-sx)*.05;sy+=(py-sy)*.05;
  glow.style.transform='translate3d('+gx.toFixed(1)+'px,'+gy.toFixed(1)+'px,0)';
  stage.style.transform='translate3d('+(sx*-16).toFixed(1)+'px,'+(sy*-10).toFixed(1)+'px,0)';
}
if(!reduce){tx=hero.clientWidth*.68;ty=hero.clientHeight*.42;gx=tx;gy=ty;requestAnimationFrame(frame)}

/* ---------- shop rail ---------- */
var rail=$('#rail');
rail.innerHTML=P.map(function(p){
  return '<article class="pn" data-id="'+esc(p.id)+'" data-kind="'+p.kind+'" style="'+vars(p)+'"><div class="pin">'+
    '<div class="pv"><div class="pvs">'+sceneU(p)+'</div></div>'+
    '<div class="pi"><div class="pt"><h3>'+esc(p.name)+'</h3><span class="pp">'+money(p.price)+'</span></div>'+
    '<p class="pm">'+esc(p.type+', '+p.size)+'</p><p class="pd">'+esc(p.one)+'</p>'+
    '<dl><div><dt>Key ingredients</dt><dd>'+esc(p.ing)+'</dd></div><div><dt>How to use</dt><dd>'+esc(p.use)+'</dd></div></dl>'+
    '<button class="btn add">Add to bag</button></div></div></article>';
}).join('');
/* cards come alive only while they're on screen */
if('IntersectionObserver' in window&&!reduce){
  var cardObs=new IntersectionObserver(function(en){en.forEach(function(x){
    if(x.intersectionRatio>=.55)x.target.classList.add('play');
    else if(!x.isIntersecting)x.target.classList.remove('play');
  })},{threshold:[0,.55]});
  $$('.pn',rail).forEach(function(pn){cardObs.observe(pn)});
}
rail.addEventListener('click',function(e){var b=e.target.closest('.add');if(!b)return;add(b.closest('.pn').dataset.id)});
function setFilter(f){
  $$('#seg button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.f===f)});
  $$('.pn',rail).forEach(function(pn){
    var show=f==='all'||pn.dataset.kind===f;
    pn.classList.toggle('out',!show);
    $$('button',pn).forEach(function(b){b.tabIndex=show?0:-1});
  });
  rail.scrollTo({left:0,behavior:reduce?'auto':'smooth'});
}
$('#seg').addEventListener('click',function(e){var b=e.target.closest('button');if(b)setFilter(b.dataset.f)});
function step(dir){var pn=$('.pn:not(.out)',rail);if(!pn)return;rail.scrollBy({left:dir*(pn.offsetWidth+20),behavior:reduce?'auto':'smooth'})}
$('#prev').addEventListener('click',function(){step(-1)});
$('#next').addEventListener('click',function(){step(1)});
function goPanel(id){
  var pn=$$('.pn',rail).filter(function(x){return x.dataset.id===id})[0];
  if(!pn)return;
  if(pn.classList.contains('out'))setFilter('all');
  var sec=$('#shop');
  window.scrollTo({top:sec.getBoundingClientRect().top+window.scrollY-60,behavior:reduce?'auto':'smooth'});
  setTimeout(function(){
    var pad=parseFloat(getComputedStyle(rail).paddingLeft)||0;
    rail.scrollTo({left:pn.offsetLeft-pad,behavior:reduce?'auto':'smooth'});
  },reduce?0:450);
}
/* gentle parallax inside each panel as the rail moves */
var pTick=false;
function para(){
  pTick=false;
  var vw=window.innerWidth;
  $$('.pn:not(.out) .pvs',rail).forEach(function(el){
    var r=el.parentNode.getBoundingClientRect();
    var d=(r.left+r.width/2-vw/2)*-.07;
    d=Math.max(-36,Math.min(36,d));
    el.style.transform='translate3d('+d.toFixed(1)+'px,0,0)';
  });
}
function qpara(){if(!pTick&&!reduce){pTick=true;requestAnimationFrame(para)}}
rail.addEventListener('scroll',qpara,{passive:true});
window.addEventListener('resize',qpara);
para();

/* ---------- pairs ---------- */
var pairList=$('#pair-list');
if(!PAIRS.length){$('#pairs').hidden=true}
if(DISC>0)$('#pairs-lede').textContent+=' Save '+Math.round(DISC*100)+'% on every pair.';
pairList.innerHTML=PAIRS.map(function(pr,n){
  var A=BY[pr.a],B=BY[pr.b],sum=A.price+B.price;
  return '<div class="pair" data-n="'+n+'"><div class="tiles">'+
    '<div class="tile" style="--b1:'+A.b1+';--b2:'+A.b2+'">'+thumb(A)+'</div>'+
    '<div class="tile" style="--b1:'+B.b1+';--b2:'+B.b2+'">'+thumb(B)+'</div>'+
    '<span class="plus" aria-hidden="true">+</span></div>'+
    '<div class="pc"><h3>'+esc(pr.title)+'</h3><p>'+esc(pr.text)+'</p>'+
    '<p class="items">'+esc(A.name+', '+A.size+' and '+B.name+', '+B.size)+'</p>'+
    '<div class="pr"><span>'+money(sum*(1-DISC))+'</span>'+(DISC>0?'<s>'+money(sum)+'</s><small>Save '+money(sum*DISC)+'</small>':'')+'</div>'+
    '<button class="btn" data-n="'+n+'">Add both to bag</button></div></div>';
}).join('');
pairList.addEventListener('click',function(e){
  var b=e.target.closest('button[data-n]');if(!b)return;
  var pr=PAIRS[+b.dataset.n];add(pr.a,1,true);add(pr.b,1,true);toast('Added the pair to your bag',true);
});
if('IntersectionObserver' in window){
  var po=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');po.unobserve(x.target)}})},{threshold:.2});
  $$('.pair').forEach(function(el){po.observe(el)});
}else{$$('.pair').forEach(function(el){el.classList.add('in')})}

/* ---------- promise scroll fill ---------- */
var pEl=$('#promise');
pEl.innerHTML=pEl.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+esc(w)+'</span>'}).join(' ');
var wEls=$$('.w',pEl),wTick=false;
function fillWords(){
  wTick=false;if(reduce)return;
  var r=pEl.getBoundingClientRect(),vh=window.innerHeight;
  var prog=Math.max(0,Math.min(1,(vh*.85-r.top)/(vh*.4+r.height))),n=wEls.length;
  for(var i=0;i<n;i++){var v=Math.max(0,Math.min(1,prog*(n+3)-i));wEls[i].style.opacity=(.16+.84*v).toFixed(2)}
}
window.addEventListener('scroll',function(){if(!wTick){wTick=true;requestAnimationFrame(fillWords)}},{passive:true});
fillWords();

/* ---------- footer contact ---------- */
var WA=String(S.whatsapp||'').replace(/\D/g,'');
if(WA){var fw=$('#f-wa');fw.href='https://wa.me/'+WA;fw.hidden=false}
if(S.email){var fm=$('#f-mail');fm.href='mailto:'+S.email;fm.textContent=S.email;fm.hidden=false}
$('#f-delivery').textContent=S.delivery?S.delivery+' ':'';

/* ---------- Netlify forms ---------- */
function postForm(name,data){
  var body=new URLSearchParams(Object.assign({'form-name':name},data)).toString();
  return fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body})
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r});
}
$('#news').addEventListener('submit',function(e){
  e.preventDefault();
  var f=e.target,btn=$('button',f);btn.disabled=true;
  postForm('newsletter',{email:f.elements.email.value,'bot-field':f.elements['bot-field'].value})
    .then(function(){toast('Murakoze! You\'re on the list.');f.reset()})
    .catch(function(){toast('Couldn\'t subscribe right now. Please try again.')})
    .then(function(){btn.disabled=false});
});

/* ---------- cart ---------- */
var cart=[];
try{cart=JSON.parse(localStorage.getItem('glowell-bag')||'[]').filter(function(l){return BY[l.id]&&l.q>0})}catch(e){cart=[]}
function saveCart(){try{localStorage.setItem('glowell-bag',JSON.stringify(cart))}catch(e){}}
function qtyOf(id){var l=cart.filter(function(x){return x.id===id})[0];return l?l.q:0}
function totals(){
  var sub=0,count=0,disc=0;
  cart.forEach(function(l){sub+=BY[l.id].price*l.q;count+=l.q});
  PAIRS.forEach(function(pr){var k=Math.min(qtyOf(pr.a),qtyOf(pr.b));disc+=k*(BY[pr.a].price+BY[pr.b].price)*DISC});
  disc=Math.round(disc);
  return{sub:sub,disc:disc,net:sub-disc,count:count};
}
function add(id,q,quiet){
  q=q||1;
  var l=cart.filter(function(x){return x.id===id})[0];
  if(l)l.q+=q;else cart.push({id:id,q:q});
  saveCart();renderCart();bump();
  if(!quiet)toast('Added '+BY[id].name+' to your bag',true);
}
function bump(){var el=$('#bag-count');if(reduce||!el.animate)return;el.animate([{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:420,easing:'ease-out'})}
function renderCart(){
  var t=totals();
  $('#bag-count').textContent=t.count;
  $('#bag-btn').setAttribute('aria-label','Open bag, '+t.count+' item'+(t.count===1?'':'s'));
  $('#lines').innerHTML=cart.map(function(l,i){
    var p=BY[l.id];
    return '<li class="line" style="--b1:'+p.b1+';--b2:'+p.b2+'"><div class="thumb">'+thumb(p)+'</div>'+
    '<div><b>'+esc(p.name)+'</b><small>'+esc(p.size)+', '+money(p.price)+' each</small>'+
    '<div class="qty"><button data-a="dec" data-i="'+i+'" aria-label="Fewer '+esc(p.name)+'">&minus;</button><span aria-live="polite">'+l.q+'</span><button data-a="inc" data-i="'+i+'" aria-label="More '+esc(p.name)+'">+</button></div></div>'+
    '<div class="lp">'+money(p.price*l.q)+'<button class="rm" data-a="rm" data-i="'+i+'">Remove</button></div></li>';
  }).join('');
  var has=cart.length>0;
  $('#lines').style.display=has?'':'none';
  $('#empty').style.display=has?'none':'';
  $('#tots').style.display=has?'':'none';
  $('#t-sub').textContent=money(t.sub);
  $('#t-disc-row').style.display=t.disc>0?'':'none';
  $('#t-disc').textContent='−'+money(t.disc);
  $('#t-total').textContent=money(t.net);
  $('.ship').hidden=!FREE;
  if(FREE){
    var left=FREE-t.net;
    $('#ship-msg').textContent=!has?'Free delivery on bags over '+money(FREE)+'.':left>0?'Add '+money(left)+' for free delivery.':'Free delivery unlocked.';
    $('#ship-fill').style.width=Math.min(100,t.net/FREE*100)+'%';
  }
}
$('#lines').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  var i=+b.dataset.i,l=cart[i];if(!l)return;
  if(b.dataset.a==='inc')l.q++;
  else if(b.dataset.a==='dec'){l.q--;if(l.q<1)cart.splice(i,1)}
  else cart.splice(i,1);
  saveCart();renderCart();
});

/* ---------- drawer views: bag -> checkout -> done ---------- */
var drawer=$('#drawer'),scrim=$('#scrim'),app=$('#app'),lastFocus=null,view='bag';
var TITLES={bag:'Your bag',co:'Checkout',done:'Order placed'};
function showView(v){
  view=v;
  ['bag','co','done'].forEach(function(k){$('#v-'+k).hidden=k!==v});
  $('#dr-title').textContent=TITLES[v];
}
function openDrawer(){
  lastFocus=document.activeElement;
  drawer.removeAttribute('inert');drawer.classList.add('open');scrim.classList.add('on');app.setAttribute('inert','');
  hideToast();setTimeout(function(){$('#dr-close').focus()},60);
}
function closeDrawer(){
  drawer.classList.remove('open');scrim.classList.remove('on');app.removeAttribute('inert');drawer.setAttribute('inert','');
  if(view==='done')setTimeout(function(){showView('bag')},650);
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
$('#bag-btn').addEventListener('click',openDrawer);
$('#dr-close').addEventListener('click',closeDrawer);
$('#d-close').addEventListener('click',closeDrawer);
scrim.addEventListener('click',closeDrawer);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawer.classList.contains('open'))closeDrawer()});

var co=$('#v-co'),F=co.elements;
if(WA)$('#co-wa').hidden=false;
$('#checkout').addEventListener('click',function(){
  if(!cart.length)return;
  var t=totals();
  $('#co-sum').innerHTML=cart.map(function(l){var p=BY[l.id];return '<li><span>'+l.q+' × '+esc(p.name)+'</span><span>'+money(p.price*l.q)+'</span></li>'}).join('')+
    (t.disc>0?'<li><span>Pair discount</span><span>−'+money(t.disc)+'</span></li>':'')+
    '<li class="t"><span>Total</span><span>'+money(t.net)+'</span></li>';
  showView('co');
  setTimeout(function(){F.name.focus()},60);
});
$('#co-back').addEventListener('click',function(){showView('bag')});

function buildOrder(){
  var t=totals(),id='GW-'+Date.now().toString(36).slice(-5).toUpperCase();
  var items=cart.map(function(l){var p=BY[l.id];return l.q+' x '+p.name+' ('+p.size+') = '+money(p.price*l.q)}).join('\n');
  var o={
    'order-id':id,items:items,total:money(t.net),amount:Math.round(t.net),
    name:F.name.value.trim(),phone:F.phone.value.trim(),address:F.address.value.trim(),
    email:F.email.value.trim(),notes:F.notes.value.trim(),'bot-field':F['bot-field'].value
  };
  o.text='New order '+id+' from '+(S.name||'the shop')+'\n\n'+items+
    (t.disc>0?'\nPair discount: -'+money(t.disc):'')+
    '\nTOTAL: '+o.total+'\n\nName: '+o.name+'\nPhone: '+o.phone+'\nAddress: '+o.address+
    (o.email?'\nEmail: '+o.email:'')+(o.notes?'\nNote: '+o.notes:'');
  return o;
}
function record(o){
  var d={};['order-id','items','total','name','phone','address','email','notes','bot-field'].forEach(function(k){d[k]=o[k]});
  return postForm('order',d);
}
function finish(o){
  cart=[];saveCart();renderCart();co.reset();
  $('#d-msg').textContent='Thank you, '+o.name.split(' ')[0]+'. We\'ll call '+o.phone+' to confirm your delivery.';
  $('#d-id').textContent='Order '+o['order-id']+' · '+o.total;
  var mm=$('#d-momo');
  var mb=$('#d-momo-btn'),num=String(S.momoNumber||'').replace(/\D/g,''),code=String(S.momoCode||'').replace(/\D/g,''),ussd='';
  var who=S.momoName?' ('+S.momoName+')':'';
  if(code){ussd='*182*8*1*'+code+'*'+o.amount+'#';mm.textContent='Pay '+o.total+' with MoMo Pay code '+code+who+'. Dial '+ussd+' or pay cash on delivery.'}
  else if(num){ussd='*182*1*1*'+num+'*'+o.amount+'#';mm.textContent='Send '+o.total+' by MoMo to '+num+who+'. Dial '+ussd+' or pay cash on delivery.'}
  mm.hidden=!ussd;mb.hidden=!ussd;
  if(ussd)mb.href='tel:'+ussd.replace(/#/g,'%23');
  var pay=$('#d-pay');
  if(S.paymentLink){pay.href=S.paymentLink;pay.hidden=false}else pay.hidden=true;
  showView('done');
}
co.addEventListener('submit',function(e){
  e.preventDefault();
  if(!cart.length)return;
  var o=buildOrder(),btn=$('#co-place');
  btn.disabled=true;btn.textContent='Sending…';
  record(o).then(function(){finish(o)})
    .catch(function(){toast(WA?'Couldn\'t send the order. Try "Order on WhatsApp".':'Couldn\'t send the order. Please try again.')})
    .then(function(){btn.disabled=false;btn.textContent='Place order'});
});
$('#co-wa').addEventListener('click',function(){
  if(!cart.length||!co.reportValidity())return;
  var o=buildOrder();
  window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(o.text),'_blank','noopener');
  record(o).catch(function(){});  // also keep a copy in Netlify, best effort
  finish(o);
});

/* ---------- toast ---------- */
var toastEl=$('#toast'),toastT;
function toast(msg,withAction){
  $('#toast-msg').textContent=msg;$('#toast-act').hidden=!withAction;
  toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(hideToast,3400);
}
function hideToast(){toastEl.classList.remove('on')}
$('#toast-act').addEventListener('click',function(){showView('bag');openDrawer()});

renderCart();
})();
