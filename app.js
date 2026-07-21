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
  function pins(){try{return JSON.parse(localStorage.getItem('geo_pins')||'[]');}catch(e){return[];}}
  function savePins(p){try{localStorage.setItem('geo_pins',JSON.stringify(p.slice(0,10)));}catch(e){}}
  var s=load(); var root=document.getElementById('app');
  var filter=localStorage.getItem('geo_filter')||'all';
  if(!s.kw.length){ s.kw=[{k:'맥 월페이퍼',st:'신규',t:Date.now(),note:''},{k:'사주 운세',st:'추적중',t:Date.now(),note:''},{k:'브라우저 게임',st:'상승',t:Date.now(),note:''}]; save(s); }
  function render(){
    var sc=0;try{sc=(JSON.parse(localStorage.getItem('geo_streak')||'{}').count)||0}catch(e){}
    var h=heat(s);
    var pn=pins();
    var list=s.kw.slice().reverse().filter(function(x){return filter==='all'||x.st===filter;});
    root.innerHTML='<div class="card"><div class="sub">키워드 '+s.kw.length+'개 · 🔥'+sc+'일 · 창 '+fomoLeft()
      +' · ↑'+(h['상승']||0)+' ↓'+(h['하락']||0)+' 신규'+(h['신규']||0)+' · 핀 '+pn.length+'</div>'
      +'<div class="row" style="flex-wrap:wrap;gap:6px;margin:8px 0">'
      +['all','신규','추적중','상승','하락'].map(function(f){
        return '<button class="sec" data-f="'+f+'" style="padding:6px 8px;font-size:12px'+(filter===f?';border-color:#e0b552':'')+'">'+(f==='all'?'전체':f)+'</button>';
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
        +(age!==''?' <small style="opacity:.5">'+age+'d</small>':'')+'</span>'
        +'<span>'
        +'<button class="sec" data-pin="'+real+'" style="padding:4px 8px;margin-right:4px">핀</button>'
        +'<button class="sec" data-cycle="'+real+'" style="padding:4px 8px;margin-right:4px">상태</button>'
        +'<button class="sec" data-i="'+real+'" style="padding:4px 8px">삭제</button></span></div>'
        +(x.note?'<div class="sub" style="margin-top:4px">'+String(x.note).replace(/</g,'&lt;')+'</div>':'')
        +'</div>';
    }).join(''):'<span class="sub">키워드 없음'+(filter!=='all'?' (필터: '+filter+')':'')+'</span>';
    Array.prototype.forEach.call(document.querySelectorAll('[data-f]'),function(b){
      b.onclick=function(){filter=b.getAttribute('data-f'); localStorage.setItem('geo_filter',filter); render();};
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
          s.kw.push({k:p[0].trim(),st:(p[1]||'추적중').trim(),note:(p[2]||'').trim(),t:Date.now()});
        });
        save(s); bumpStreak(); render(); try{legionTrack('activate',{import:1})}catch(e){}
      };
      root.appendChild(ib);
    }
    document.getElementById('add').onclick=function(){
      s.kw.push({k:document.getElementById('k').value||'keyword',st:document.getElementById('st').value,note:document.getElementById('note').value||'',t:Date.now()});
      save(s); bumpStreak(); render(); try{legionTrack('activate',{})}catch(e){}
    };
    var order=['신규','추적중','상승','하락'];
    document.querySelectorAll('[data-cycle]').forEach(function(b){
      b.onclick=function(){
        var ix=+b.dataset.cycle; var item=s.kw[ix]; if(!item)return;
        var oi=order.indexOf(item.st); item.st=order[(oi+1)%order.length]; item.t=Date.now();
        save(s); bumpStreak(); render();
        try{legionTrack('status_cycle',{st:item.st})}catch(e){}
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
    document.querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){
      s.kw.splice(+b.dataset.i,1); save(s);render();
    };});
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
