try{localStorage.setItem('geo_checks',(+(localStorage.getItem('geo_checks')||0)+1));}catch(e){}

(function(){
  var K='geo_v1';
  function load(){try{return JSON.parse(localStorage.getItem(K)||'{"kw":[]}');}catch(e){return{kw:[]};}}
  function save(s){localStorage.setItem(K,JSON.stringify(s));}
  function dayKey(off){var d=new Date();d.setDate(d.getDate()+(off||0));return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
  function fomoLeft(){var e=new Date();e.setHours(24,0,0,0);var ms=Math.max(0,e-Date.now());return Math.floor(ms/3600000)+'h '+Math.floor((ms%3600000)/60000)+'m';}
  function bumpStreak(){
    try{
      var st=JSON.parse(localStorage.getItem('geo_streak')||'{}');
      var t=dayKey(0);
      if(st.last===t) return st.count||0;
      var y=dayKey(-1);
      st.count=(st.last===y)?(st.count||0)+1:1;
      st.last=t;
      localStorage.setItem('geo_streak',JSON.stringify(st));
      return st.count;
    }catch(e){return 0;}
  }
  function heat(s){
    var h={신규:0,추적중:0,상승:0,하락:0};
    (s.kw||[]).forEach(function(x){ if(h[x.st]!=null) h[x.st]++; else h[x.st]=1; });
    return h;
  }
  /* GOLD50 TOP1: 상태 히스토리 스파크. 로컬 {st,t}만 · 크롤/랭크 숫자 0 */
  var sparkOpen=-1;
  function toneOf(st){return st==='상승'?'#4ade80':st==='하락'?'#f87171':st==='신규'?'#67e8f9':'#8a8398';}
  function barH(st){return st==='상승'?22:st==='추적중'?14:st==='신규'?10:6;}
  function ensureHist(x){
    if(!x.hist||!x.hist.length) x.hist=[{st:x.st,t:x.t||Date.now()}];
    if(x.hist.length>14) x.hist=x.hist.slice(-14);
    return x.hist;
  }
  function pushHist(x, prev){
    if(!x.hist) x.hist=[];
    if(!x.hist.length) x.hist.push({st:prev!=null?prev:x.st,t:x.t||Date.now()});
    var last=x.hist[x.hist.length-1];
    if(!last||last.st!==x.st) x.hist.push({st:x.st,t:Date.now()});
    if(x.hist.length>14) x.hist=x.hist.slice(-14);
  }
  function sparkBars(x){
    var h=ensureHist(x).slice(-7);
    var html='';
    for(var i=0;i<7-h.length;i++) html+='<i style="display:inline-block;width:6px;height:4px;background:#2a2438;border-radius:1px;margin:0 1px"></i>';
    h.forEach(function(p){
      html+='<i title="'+p.st+'" style="display:inline-block;width:6px;height:'+barH(p.st)+'px;background:'+toneOf(p.st)+';border-radius:1px;margin:0 1px"></i>';
    });
    return '<span style="display:inline-flex;align-items:flex-end;height:22px" title="수동 상태 · 실측 랭크/크롤 아님">'+html+'</span>';
  }
  function pins(){try{return JSON.parse(localStorage.getItem('geo_pins')||'[]');}catch(e){return[];}}
  function savePins(p){try{localStorage.setItem('geo_pins',JSON.stringify(p.slice(0,10)));}catch(e){}}
  function priOf(x){return (x.pri==='P0'||x.pri==='P1'||x.pri==='P2')?x.pri:'P2';}
  function priRank(p){return p==='P0'?0:p==='P1'?1:2;}
  var s=load(); var root=document.getElementById('app');
  /* WAVE104: ours/comp 필터칩. 메모 유무만 · 크롤/점유율 숫자 0 */
  function hasMemo(v){return !!String(v||'').replace(/^\s+|\s+$/g,'');}
  var FILTERS=['all','pin','ours','comp','신규','추적중','상승','하락'];
  var filter=localStorage.getItem('geo_filter')||'all';
  if(FILTERS.indexOf(filter)<0) filter='all';
  /* WAVE131: 헤더 칩 탭=필터. 메모 유무만 · 크롤/점유율 숫자 0 */
  function hdrChip(f, lab, on){
    return '<button type="button" class="sec" data-f="'+f+'" style="padding:4px 8px;font-size:11px;border-radius:999px'+(on?';border-color:#e0b552;color:#e0b552':'')+'">'+lab+'</button>';
  }
  /* WAVE141: 같은 칩 재탭=전체. 필터 라벨만 · 크롤/점유율 숫자 0 */
  function chipRetap(cur, next){
    if(!next || FILTERS.indexOf(next)<0) return cur||'all';
    if(cur===next && next!=='all') return 'all';
    return next;
  }
  if(!s.kw.length){ s.kw=[{k:'맥 월페이퍼',st:'신규',t:Date.now(),note:'',hist:[{st:'신규',t:Date.now()}]},{k:'사주 운세',st:'추적중',t:Date.now(),note:'',hist:[{st:'추적중',t:Date.now()}]},{k:'브라우저 게임',st:'상승',t:Date.now(),note:'',hist:[{st:'상승',t:Date.now()}]}]; save(s); }
  (function(){var dirty=false;(s.kw||[]).forEach(function(x){if(!x.hist||!x.hist.length){x.hist=[{st:x.st,t:x.t||Date.now()}];dirty=true;}if(x.hist.length>14){x.hist=x.hist.slice(-14);dirty=true;}if(x.pri!=='P0'&&x.pri!=='P1'&&x.pri!=='P2'){x.pri='P2';dirty=true;}});if(dirty)save(s);})();
  function render(){
    var sc=0;try{sc=(JSON.parse(localStorage.getItem('geo_streak')||'{}').count)||0}catch(e){}
    var h=heat(s);
    var pn=pins();
    var p0n=s.kw.filter(function(x){return priOf(x)==='P0';}).length;
    var oursN=(s.kw||[]).filter(function(x){return hasMemo(x.ours);}).length;
    var compN=(s.kw||[]).filter(function(x){return hasMemo(x.comp);}).length;
    var list=s.kw.slice().filter(function(x){
      if(filter==='all') return true;
      if(filter==='pin') return pn.indexOf(x.k)>=0;
      if(filter==='ours') return hasMemo(x.ours);
      if(filter==='comp') return hasMemo(x.comp);
      return x.st===filter;
    }).sort(function(a,b){
      var ap=pn.indexOf(a.k)>=0?0:1, bp=pn.indexOf(b.k)>=0?0:1;
      if(ap!==bp) return ap-bp;
      var ar=priRank(priOf(a)), br=priRank(priOf(b));
      if(ar!==br) return ar-br;
      return (b.t||0)-(a.t||0);
    });
    root.innerHTML='<div class="card"><div class="sub">키워드 '+s.kw.length+'개 · 🔥'+sc+'일 · 창 '+fomoLeft()
      +' · ↑'+(h['상승']||0)+' ↓'+(h['하락']||0)+' 신규'+(h['신규']||0)+' · P0 '+p0n+' · 스파크=수동상태(크롤0)</div>'
      +'<div class="row" id="hdrChips" style="flex-wrap:wrap;gap:4px;margin:6px 0 0">'
      +hdrChip('pin','핀 '+pn.length,filter==='pin')
      +hdrChip('ours','ours '+oursN,filter==='ours')
      +hdrChip('comp','comp '+compN,filter==='comp')
      +'<span class="sub" style="margin:0">헤더칩=필터 · 재탭=전체 · 점유율/랭크 숫자 없음</span></div>'
      +'<div class="row" style="flex-wrap:wrap;gap:6px;margin:8px 0">'
      +['all','pin','ours','comp','신규','추적중','상승','하락'].map(function(f){
        var lab=f==='all'?'전체':f==='pin'?'핀 '+pn.length:f==='ours'?'ours '+oursN:f==='comp'?'comp '+compN:f;
        return '<button class="sec" data-f="'+f+'" style="padding:6px 8px;font-size:12px'+(filter===f?';border-color:#e0b552':'')+'">'+lab+'</button>';
      }).join('')+'</div>'
      +'<input id="k" placeholder="키워드"/><select id="st"><option>추적중</option><option>상승</option><option>하락</option><option>신규</option></select>'
      +'<input id="note" placeholder="메모 (선택)"/>'
      +'<button id="add">추가</button></div><div class="card" id="list"></div>';
    document.getElementById('list').innerHTML=list.length?list.map(function(x){
      var real=s.kw.indexOf(x);
      var tone=x.st==='상승'?'#4ade80':x.st==='하락'?'#f87171':x.st==='신규'?'#67e8f9':'#ece8f1';
      var pinned=pn.indexOf(x.k)>=0;
      var age=x.t?Math.max(0,Math.floor((Date.now()-x.t)/864e5)):'';
      return '<div style="padding:8px 0;border-bottom:1px solid #2a2438">'
        +'<div style="display:flex;justify-content:space-between;align-items:center">'
        +'<span>'+(pinned?'📌 ':'')+'<b>'+x.k+'</b> · <span style="color:'+tone+'">'+x.st+'</span>'
        +' <span class="chip" style="'+(priOf(x)==='P0'?'color:#e0b552':'')+'">'+priOf(x)+'</span>'
        +(age!==''?' <small style="opacity:.5">'+age+'d</small>':'')+'</span>'
        +'<span>'
        +'<button class="sec" data-pin="'+real+'" style="padding:4px 8px;margin-right:4px">핀</button>'
        +'<button class="sec" data-cycle="'+real+'" style="padding:4px 8px;margin-right:4px">상태</button>'
        +'<button class="sec" data-i="'+real+'" style="padding:4px 8px">삭제</button></span></div>'
        +(x.note?'<div class="sub" style="margin-top:4px">'+String(x.note).replace(/</g,'&lt;')+'</div>':'')
        +'<div class="row" style="gap:4px;margin-top:6px">'
        +'<input data-ours="'+real+'" placeholder="ours 메모" value="'+String(x.ours||'').replace(/"/g,'&quot;').replace(/</g,'&lt;')+'" style="flex:1;margin:0;padding:6px;font-size:11px"/>'
        +'<input data-comp="'+real+'" placeholder="comp 메모" value="'+String(x.comp||'').replace(/"/g,'&quot;').replace(/</g,'&lt;')+'" style="flex:1;margin:0;padding:6px;font-size:11px"/>'
        +'</div>'
        +'<div class="sub" style="margin:2px 0 0">ours|comp 메모만 · 점유율/랭크 숫자 없음</div>'
        +'<div class="row" style="flex-wrap:wrap;gap:4px;margin-top:6px">'+['P0','P1','P2'].map(function(p){
          var on=priOf(x)===p;
          return '<button type="button" class="sec" data-pri="'+real+'" data-pv="'+p+'" style="padding:4px 8px;font-size:11px;border-radius:999px'+(on?';border-color:#e0b552;color:#e0b552':'')+'">'+p+'</button>';
        }).join('')+'</div>'
        +'<div class="row" style="flex-wrap:wrap;gap:4px;margin-top:4px">'+['웹','AIO','Chat','네이버'].map(function(e){
          var on=(x.eng||'웹')===e;
          return '<button type="button" class="sec" data-eng="'+real+'" data-ev="'+e+'" style="padding:4px 8px;font-size:11px;border-radius:999px'+(on?';border-color:#67e8f9;color:#67e8f9':'')+'">'+e+'</button>';
        }).join('')+'</div>'
        +'<div data-spark="'+real+'" style="margin-top:6px;cursor:pointer;display:flex;align-items:flex-end;gap:8px;min-height:24px">'
        +sparkBars(x)
        +(sparkOpen===real
          ?'<span class="sub">'+ensureHist(x).slice(-7).map(function(p){return '<span style="color:'+toneOf(p.st)+'">'+p.st+'</span>';}).join(' → ')+'</span>'
          :'<span class="sub">상태 7칸 · 탭=라벨</span>')
        +'</div>'
        +'</div>';
    }).join(''):'<span class="sub">키워드 없음'+(filter==='pin'?' (핀 없음 · 필터 유지)':(filter==='ours'?' (ours 메모 없음 · 필터 유지)':(filter==='comp'?' (comp 메모 없음 · 필터 유지)':(filter!=='all'?' (필터: '+filter+')':''))))+'</span>';
    Array.prototype.forEach.call(document.querySelectorAll('[data-f]'),function(b){
      b.onclick=function(){
        filter=chipRetap(filter, b.getAttribute('data-f'));
        localStorage.setItem('geo_filter',filter);
        render();
      };
    });
    if(!document.getElementById('clearAll')){
      var c=document.createElement('button'); c.id='clearAll'; c.textContent='목록 비우기'; c.style.cssText='width:100%;margin-top:6px;padding:10px;border:0;border-radius:10px;background:#1c1826;color:#8a8398';
      c.onclick=function(){if(confirm('키워드 비울까?')){s.kw=[];save(s);render();}};
      root.appendChild(c);
    }
    if(!document.getElementById('exp')){
      var b=document.createElement('button');b.id='exp';b.textContent='주간 스냅 복사';
      b.style.cssText='width:100%;margin-top:8px;padding:10px;border:0;border-radius:10px;background:#1c1826;color:#ece8f1';
      b.onclick=function(){
        var hh=heat(s);
        var text='GEO Radar · n='+s.kw.length+' ↑'+(hh['상승']||0)+' ↓'+(hh['하락']||0)+' 신규'+(hh['신규']||0)
          +'\n'+s.kw.map(function(x){return x.k+'|'+x.st+(x.note?'|'+x.note:'')}).join('\n')
          +'\nhttps://hosuman08-netizen.github.io/geo-radar/';
        if(navigator.clipboard)navigator.clipboard.writeText(text);
        try{legionTrack('share_peak',{})}catch(e){}
      };
      root.appendChild(b);
    }
    if(!document.getElementById('imp')){
      var ib=document.createElement('button'); ib.id='imp'; ib.textContent='붙여넣기 가져오기 (k|st)';
      ib.style.cssText='width:100%;margin-top:8px;padding:10px;border:0;border-radius:10px;background:#1c1826;color:#ece8f1';
      ib.onclick=function(){
        var raw=prompt('한 줄에 keyword|상태 형식');
        if(!raw)return;
        raw.split('\n').forEach(function(line){
          var p=line.split('|'); if(!p[0])return;
          var st0=(p[1]||'추적중').trim(); var t0=Date.now();
          s.kw.push({k:p[0].trim(),st:st0,note:(p[2]||'').trim(),t:t0,hist:[{st:st0,t:t0}],pri:'P2'});
        });
        save(s); bumpStreak(); render(); try{legionTrack('activate',{import:1})}catch(e){}
      };
      root.appendChild(ib);
    }
    document.getElementById('add').onclick=function(){
      var stA=document.getElementById('st').value, tA=Date.now();
      s.kw.push({k:document.getElementById('k').value||'keyword',st:stA,note:document.getElementById('note').value||'',t:tA,hist:[{st:stA,t:tA}],pri:'P2'});
      save(s); bumpStreak(); render(); try{legionTrack('activate',{})}catch(e){}
    };
    var order=['신규','추적중','상승','하락'];
    document.querySelectorAll('[data-cycle]').forEach(function(b){
      b.onclick=function(){
        var ix=+b.dataset.cycle; var item=s.kw[ix]; if(!item)return;
        var prev=item.st; var oi=order.indexOf(item.st); item.st=order[(oi+1)%order.length]; item.t=Date.now();
        pushHist(item, prev);
        save(s); bumpStreak(); render();
        try{legionTrack('status_cycle',{st:item.st})}catch(e){}
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-pri]'),function(b){
      b.onclick=function(){
        var item=s.kw[+b.getAttribute('data-pri')]; if(!item)return;
        item.pri=b.getAttribute('data-pv');
        save(s); render();
        try{legionTrack('pri',{pri:item.pri})}catch(e){}
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-eng]'),function(b){
      b.onclick=function(){
        var item=s.kw[+b.getAttribute('data-eng')]; if(!item)return;
        item.eng=b.getAttribute('data-ev')||'웹';
        save(s); render();
      };
    });
    document.querySelectorAll('[data-pin]').forEach(function(b){
      b.onclick=function(){
        var item=s.kw[+b.dataset.pin]; if(!item)return;
        var p=pins(); var ix=p.indexOf(item.k);
        if(ix>=0) p.splice(ix,1); else p.unshift(item.k);
        savePins(p); render(); try{legionTrack('pin',{})}catch(e){}
      };
    });
    function clipMemo(v){return String(v||'').replace(/^\s+|\s+$/g,'').slice(0,80);}
    Array.prototype.forEach.call(document.querySelectorAll('[data-ours]'),function(inp){
      inp.onchange=function(){
        var item=s.kw[+inp.getAttribute('data-ours')]; if(!item)return;
        item.ours=clipMemo(inp.value);
        save(s); render();
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-comp]'),function(inp){
      inp.onchange=function(){
        var item=s.kw[+inp.getAttribute('data-comp')]; if(!item)return;
        item.comp=clipMemo(inp.value);
        save(s); render();
      };
    });
    document.querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){
      var ix=+b.dataset.i; s.kw.splice(ix,1); if(sparkOpen===ix) sparkOpen=-1; save(s);render();
    };});
    Array.prototype.forEach.call(document.querySelectorAll('[data-spark]'),function(el){
      el.onclick=function(){
        var i=+el.getAttribute('data-spark');
        sparkOpen=sparkOpen===i?-1:i;
        render();
      };
    });
  }
  try{legionTrack('session_start',{})}catch(e){}
  render();

  (function(){try{
    if(document.getElementById('moneyPipe'))return;
    var d=document.createElement('div');
    d.innerHTML='\n<div id="moneyPipe" style="margin-top:12px;padding:10px;border:1px solid #c5a46e44;border-radius:12px;background:#16121c;text-align:center;font-size:12px">\n  <div style="color:#e0b552;font-weight:700;margin-bottom:4px">💎 후원 · 파이프 (엔터 18+)</div>\n  <p style="opacity:.75;margin:0 0 6px">가상 체험 · 실결제 백엔드 없음 · 문의만</p>\n  <a style="color:#ece8f1;margin:0 6px" href="mailto:hoyashi95@gmail.com?subject=%5BLegion%5D%20support">☕ 후원 문의</a>\n  <a style="color:#e0b552;margin:0 6px" href="https://hosuman08-netizen.github.io/legion-hub/?utm_source=pipe&utm_medium=app">🎮 Arcade</a>\n</div>\n';
    var app=document.getElementById('app')||document.body;
    app.appendChild(d.firstElementChild||d);
    try{legionTrack('money_pipe_shown',{app:'auto'})}catch(e){}
  }catch(e){}})();

})();
