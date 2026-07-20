try{localStorage.setItem('geo_checks',(+(localStorage.getItem('geo_checks')||0)+1));}catch(e){}

(function(){
  var K='geo_v1';
  function load(){try{return JSON.parse(localStorage.getItem(K)||'{"kw":[]}');}catch(e){return{kw:[]};}}
  function save(s){localStorage.setItem(K,JSON.stringify(s));}
  function dayKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
  function bumpStreak(){
    try{
      var st=JSON.parse(localStorage.getItem('geo_streak')||'{}');
      var t=dayKey();
      if(st.last===t) return st.count||0;
      var y=new Date(); y.setDate(y.getDate()-1);
      var yk=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();
      st.count=(st.last===yk)?(st.count||0)+1:1;
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
  var s=load(); var root=document.getElementById('app');
  if(!s.kw.length){ s.kw=[{k:'맥 월페이퍼',st:'신규',t:Date.now()},{k:'사주 운세',st:'추적중',t:Date.now()},{k:'브라우저 게임',st:'상승',t:Date.now()}]; save(s); /*emptySeed*/ }
  function render(){
    var sc=0;try{sc=(JSON.parse(localStorage.getItem('geo_streak')||'{}').count)||0}catch(e){}
    var h=heat(s);
    root.innerHTML='<div class="card"><div class="sub">키워드 '+s.kw.length+'개 · 🔥'+sc+'일'
      +' · 상승 '+ (h['상승']||0) +' · 하락 '+(h['하락']||0)+' · 신규 '+(h['신규']||0)+'</div>'
      +'<input id="k" placeholder="키워드"/><select id="st"><option>추적중</option><option>상승</option><option>하락</option><option>신규</option></select>'
      +'<button id="add">추가</button></div><div class="card" id="list"></div>';
    document.getElementById('list').innerHTML=s.kw.slice().reverse().map(function(x,idx){
      var tone=x.st==='상승'?'#4ade80':x.st==='하락'?'#f87171':x.st==='신규'?'#67e8f9':'#ece8f1';
      return '<div style="padding:8px 0;border-bottom:1px solid #2a2438;display:flex;justify-content:space-between;align-items:center">'
        +'<span><b>'+x.k+'</b> · <span style="color:'+tone+'">'+x.st+'</span></span>'
        +'<span><button class="sec" data-cycle="'+idx+'" style="padding:4px 8px;margin-right:4px">상태</button>'
        +'<button class="sec" data-i="'+idx+'" style="padding:4px 8px">삭제</button></span></div>';
    }).join('')||'<span class="sub">키워드 없음</span>';
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
          +'\n'+s.kw.map(function(x){return x.k+'|'+x.st}).join('\n')
          +'\nhttps://hosuman08-netizen.github.io/geo-radar/';
        if(navigator.clipboard)navigator.clipboard.writeText(text);
        try{legionTrack('share_peak',{})}catch(e){}
      };
      root.appendChild(b);
    }
    document.getElementById('add').onclick=function(){
      s.kw.push({k:document.getElementById('k').value||'keyword',st:document.getElementById('st').value,t:Date.now()});
      save(s); bumpStreak(); render(); try{legionTrack('activate',{})}catch(e){}
    };
    var order=['신규','추적중','상승','하락'];
    document.querySelectorAll('[data-cycle]').forEach(function(b){
      b.onclick=function(){
        var rev=s.kw.slice().reverse();
        var ix=+b.dataset.cycle;
        var item=rev[ix]; if(!item)return;
        var oi=order.indexOf(item.st); item.st=order[(oi+1)%order.length]; item.t=Date.now();
        s.kw=rev.reverse(); save(s); bumpStreak(); render();
        try{legionTrack('status_cycle',{st:item.st})}catch(e){}
      };
    });
    document.querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){
      var rev=s.kw.slice().reverse(); rev.splice(+b.dataset.i,1); s.kw=rev.reverse(); save(s);render();
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

/* LEGION_WAVE_24_pipe_ensure */ /* pipe already present wave 24 */
