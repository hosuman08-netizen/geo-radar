
(function(){
  var K='geo_v1';
  function load(){try{return JSON.parse(localStorage.getItem(K)||'{"kw":[]}');}catch(e){return{kw:[]};}}
  function save(s){localStorage.setItem(K,JSON.stringify(s));}
  var s=load(); var root=document.getElementById('app');
  function render(){
    root.innerHTML='<div class="card"><input id="k" placeholder="키워드"/><select id="st"><option>추적중</option><option>상승</option><option>하락</option><option>신규</option></select><button id="add">추가</button></div><div class="card" id="list"></div>';
    document.getElementById('list').innerHTML=s.kw.slice().reverse().map(function(x,idx){
      return '<div style="padding:8px 0;border-bottom:1px solid #2a2438;display:flex;justify-content:space-between"><span><b>'+x.k+'</b> · '+x.st+'</span><button class="sec" data-i="'+idx+'" style="padding:4px 8px">삭제</button></div>';
    }).join('')||'<span class="sub">키워드 없음</span>';
    if(!document.getElementById('exp')){var b=document.createElement('button');b.id='exp';b.textContent='키워드 복사';b.style.cssText='width:100%;margin-top:8px;padding:10px;border:0;border-radius:10px;background:#1c1826;color:#ece8f1';b.onclick=function(){var text=s.kw.map(function(x){return x.k+'|'+x.st}).join('\n');if(navigator.clipboard)navigator.clipboard.writeText(text);try{legionTrack('share_peak',{})}catch(e){}};root.appendChild(b);}
    document.getElementById('add').onclick=function(){s.kw.push({k:document.getElementById('k').value||'keyword',st:document.getElementById('st').value});save(s);render();try{legionTrack('activate',{})}catch(e){}};
    document.querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){s.kw.splice(s.kw.length-1-+b.dataset.i,1);/* simpler: filter by rebuild */ 
      var rev=s.kw.slice().reverse(); rev.splice(+b.dataset.i,1); s.kw=rev.reverse(); save(s);render();
    };});
  }
  try{legionTrack('session_start',{})}catch(e){}
  render();
})();
