// ═══════════════════════════════════════════════════════
// SUPABASE
// ═══════════════════════════════════════════════════════
const SURL='https://evoewvoxfcmldrhcbmcj.supabase.co';
const SKEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2b2V3dm94ZmNtbGRyaGNibWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjI1ODYsImV4cCI6MjA5NDUzODU4Nn0.eAeIJnpGOKbjZbWdz5KAfa_3yp2tHaDV_ArjPoTVdx8';
const{createClient}=supabase;
const sb=createClient(SURL,SKEY);

// ═══════════════════════════════════════════════════════
// ESTADO GLOBAL
// ═══════════════════════════════════════════════════════
let U=null;
let ADMIN=false;
let cfg={};
let prods=[];
let carrito=[];
let filtroAct='todos';
let ordenAct=null;
let subcatAct=null;
let pedSec='pendiente';
let waCtx={};
let fpMode=null;
let progBlocks=[];
let advTel=null;
let cancelPedId=null;
let blkTpCallback=null;
// Login multi-paso
let loginTelActual=null;
let loginUsrActual=null;

// ═══════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════
function playOk(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),t=c.currentTime;[523.25,659.25,783.99].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t+i*.12);g.gain.linearRampToValueAtTime(.18,t+i*.12+.04);g.gain.linearRampToValueAtTime(0,t+i*.12+.22);o.connect(g);g.connect(c.destination);o.start(t+i*.12);o.stop(t+i*.12+.25);});}catch(e){}}
function playReady(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),t=c.currentTime;[880,1046.5].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t+i*.15);g.gain.linearRampToValueAtTime(.22,t+i*.15+.05);g.gain.linearRampToValueAtTime(0,t+i*.15+.28);o.connect(g);g.connect(c.destination);o.start(t+i*.15);o.stop(t+i*.15+.3);});}catch(e){}}

// ═══════════════════════════════════════════════════════
// UI UTILS
// ═══════════════════════════════════════════════════════
let tTimer;
function toast(msg,ms=2600){clearTimeout(tTimer);const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');tTimer=setTimeout(()=>t.classList.remove('show'),ms);}

function abrirOv(id){document.getElementById(id).classList.add('open');document.body.style.overflow='hidden';}
function cerrarOvById(id){document.getElementById(id).classList.remove('open');if(!document.querySelector('.ov.open'))document.body.style.overflow='';}
function cerrarOv(id,e){if(e.target===document.getElementById(id))cerrarOvById(id);}

function ld(id,on){const b=document.getElementById(id);if(!b)return;b.classList.toggle('ld',on);}

function confirm2(titulo,texto,lblOk,fn,danger=false){
  document.getElementById('confirm-content').innerHTML=`
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:1.15rem;font-weight:600;color:var(--cafe-dark);margin-bottom:6px">${titulo}</div>
      ${texto?`<p style="font-size:.87rem;color:var(--texto-s)">${texto}</p>`:''}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="cerrarOvById('ov-confirm')">Cancelar</button>
      <button class="btn ${danger?'btn-danger':'btn-primary'}" style="flex:2" id="ok-btn">${lblOk}</button>
    </div>`;
  document.getElementById('ok-btn').onclick=()=>{fn();cerrarOvById('ov-confirm');};
  abrirOv('ov-confirm');
}

// ═══════════════════════════════════════════════════════
// FORMATO
// ═══════════════════════════════════════════════════════
function fmtTel(i){let v=i.value.replace(/\D/g,'').slice(0,8);i.value=v.length>4?v.slice(0,4)+' '+v.slice(4):v;}
function fQ(n){return'Q'+Number(n).toFixed(2);}
function nowGT(){const d=new Date();d.setHours(d.getHours()-6);return d;}
function isoGT(){return nowGT().toISOString().replace('Z','-06:00');}
function fmtHora(iso){return new Date(iso).toLocaleTimeString('es-GT',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Guatemala'});}
function fmtFecha(iso){return new Date(iso).toLocaleDateString('es-GT',{day:'2-digit',month:'short',year:'numeric',timeZone:'America/Guatemala'});}
function fmtHoraMin(iso){return new Date(iso).toLocaleTimeString('es-GT',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Guatemala'});}
function txtHora(iso){const d=new Date(new Date(iso).getTime()+30*60000);return d.toLocaleTimeString('es-GT',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Guatemala'});}
function horaEst30(){const d=new Date();d.setMinutes(d.getMinutes()+30);return d.toLocaleTimeString('es-GT',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Guatemala'});}
function getAdvc(u){return Array.isArray(u.advertencias)?u.advertencias.length:0;}
function genId(){return String(Math.floor(1000+Math.random()*9000));}
function nlHtml(t){return(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>');}

const CAT_IC={Pan:'ti-bread','Pan dulce':'ti-croissant',Bebidas:'ti-bottle',Repostería:'ti-cake',Tienda:'ti-basket'};
const catIco=c=>CAT_IC[c]||'ti-shopping-bag';
function estadoBadge(e){const m={pendiente:'<span class="badge b-w">Recibida</span>',confirmado:'<span class="badge b-i">Confirmada</span>',listo:'<span class="badge b-ok">Lista</span>',entregado:'<span class="badge b-n">Entregada</span>',cancelado:'<span class="badge b-err">Cancelada</span>'};return m[e]||e;}

function horaEstimada(p){
  if(p.hora_recogida)return{hora:p.hora_recogida,custom:true};
  return{hora:txtHora(p.created_at),custom:false};
}

function prodEstaDisp(p){
  if(p.bloqueado)return false;
  if(!p.bloqueo_prog||!p.bloqueo_prog.length)return true;
  const now=nowGT();const dia=now.getDay();const hm=now.getHours()*60+now.getMinutes();
  for(const r of p.bloqueo_prog){
    if(r.tipo==='dias'&&r.dias&&r.dias.includes(dia))return false;
    if(r.tipo==='horas'&&r.desde&&r.hasta){
      const[dh,dm]=r.desde.split(':').map(Number);const[hh,hmm]=r.hasta.split(':').map(Number);
      if(hm>=dh*60+dm&&hm<=hh*60+hmm)return false;
    }
  }
  return true;
}

// ═══════════════════════════════════════════════════════
// BETA BANNER
// ═══════════════════════════════════════════════════════
(function(){const b=document.getElementById('beta-banner');if(localStorage.getItem('mdj_beta_ok')==='1')b.style.display='none';})();
function cerrarBeta(){document.getElementById('beta-banner').style.display='none';localStorage.setItem('mdj_beta_ok','1');}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',async()=>{
  await cargarCfg();
  await restaurarSesion();
  await cargarProductos();
  renderFiltros();
  actTerminos();
  initDrums();
  document.addEventListener('click',()=>{if(U&&!ADMIN)incr('clicks');},{passive:true});
});

// ═══════════════════════════════════════════════════════
// SESIÓN PERSISTENTE
// ═══════════════════════════════════════════════════════
async function restaurarSesion(){
  const rol=localStorage.getItem('mdj_rol');
  const tel=localStorage.getItem('mdj_tel');
  if(!tel)return;
  try{
    const{data,error}=await sb.from('usuarios').select('*').eq('telefono',tel).single();
    if(data&&!error){
      U=data;carrito=Array.isArray(data.carrito)?data.carrito:[];
      actuCarritoUI();
      await incr('visitas');
      await sb.from('usuarios').update({ultima_conexion:isoGT()}).eq('id',U.id);
      if(rol==='admin'&&data.rol==='admin'){ADMIN=true;setTimeout(()=>entrarAdmin(),100);}
    }else{limpiarSesion();}
  }catch(e){limpiarSesion();}
}
function limpiarSesion(){localStorage.removeItem('mdj_tel');localStorage.removeItem('mdj_rol');U=null;ADMIN=false;}

async function incr(campo){
  if(!U)return;
  try{
    const{data}=await sb.from('usuarios').select(campo).eq('id',U.id).single();
    if(data)await sb.from('usuarios').update({[campo]:(data[campo]||0)+1}).eq('id',U.id);
  }catch(e){}
}

// ═══════════════════════════════════════════════════════
// CONFIG GLOBAL
// ═══════════════════════════════════════════════════════
async function cargarCfg(){
  try{
    const{data}=await sb.from('configuracion').select('*');
    if(data)data.forEach(r=>{try{cfg[r.clave]=typeof r.valor==='string'?JSON.parse(r.valor):r.valor;}catch(e){cfg[r.clave]=r.valor;}});
  }catch(e){}
  cfg.telefono_tienda=cfg.telefono_tienda||'';
  cfg.terminos_extra=cfg.terminos_extra||'Una vez confirmada su orden, tiene 15 minutos para pasar a recogerla.';
  cfg.estados_info=cfg.estados_info||{pendiente:'Su orden fue recibida.',confirmado:'En preparación.',listo:'Lista para recoger.',entregado:'Completada.',cancelado:'Cancelada.'};
  cfg.funciones_bloqueadas=cfg.funciones_bloqueadas||{realizar_pedidos:false,hora_recogida:false,pedido_domicilio:false,nota_pedido:false};
}
async function saveCfg(k,v){try{await sb.from('configuracion').upsert({clave:k,valor:JSON.stringify(v),updated_at:isoGT()});}catch(e){}cfg[k]=v;}
function actTerminos(){const el=document.getElementById('terminos-txt');if(el)el.textContent=cfg.terminos_extra||'';}

// ═══════════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════════
async function cargarProductos(){
  try{const{data}=await sb.from('productos').select('*').order('nombre');if(data)prods=data;}catch(e){prods=[];}
  renderProductos();
}
function getCats(){return[...new Set(prods.map(p=>p.categoria))].sort();}
function getSubcats(cat){return[...new Set(prods.filter(p=>p.categoria===cat&&p.subcategoria).map(p=>p.subcategoria))].sort();}
function getAllSubcats(){return[...new Set(prods.filter(p=>p.subcategoria).map(p=>p.subcategoria))].sort();}

function renderFiltros(){
  const cont=document.getElementById('filtros-container');
  cont.querySelectorAll('[data-cat]').forEach(b=>b.remove());
  getCats().forEach(cat=>{
    const b=document.createElement('button');b.className='filtro-btn';b.setAttribute('data-cat',cat);
    b.innerHTML=`<i class="ti ${catIco(cat)}"></i> ${cat}`;b.onclick=function(){setFiltro(cat,this);};cont.appendChild(b);
  });
}

function setFiltro(cat,btn){
  filtroAct=cat;ordenAct=null;subcatAct=null;
  document.querySelectorAll('.filtro-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const bar=document.getElementById('subcat-bar');
  if(cat!=='todos'){
    const scs=getSubcats(cat);
    if(scs.length){
      bar.style.display='flex';
      bar.innerHTML=scs.map(s=>`<button class="scpill" onclick="setSubcat('${s}',this)">${s}</button>`).join('');
    }else{bar.style.display='none';}
  }else{bar.style.display='none';}
  renderProductos();
}
function setSubcat(sc,btn){subcatAct=sc;document.querySelectorAll('.scpill').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');renderProductos();}
function setOrden(o,btn){ordenAct=o;filtroAct='todos';subcatAct=null;document.querySelectorAll('.filtro-btn').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');document.getElementById('subcat-bar').style.display='none';renderProductos();}

function renderProductos(){
  const grid=document.getElementById('pgrid');
  const q=(document.getElementById('nav-search')||{}).value?.toLowerCase()||'';
  const favs=U?.favoritos||[];
  let ps=[...prods];
  if(filtroAct&&filtroAct!=='todos')ps=ps.filter(p=>p.categoria===filtroAct);
  if(subcatAct)ps=ps.filter(p=>p.subcategoria===subcatAct);
  if(q)ps=ps.filter(p=>p.nombre.toLowerCase().includes(q)||p.categoria.toLowerCase().includes(q)||(p.subcategoria||'').toLowerCase().includes(q));
  if(ordenAct==='precio-asc')ps.sort((a,b)=>a.precio-b.precio);
  if(ordenAct==='precio-desc')ps.sort((a,b)=>b.precio-a.precio);
  if(!ps.length){grid.innerHTML='<div class="empty" style="grid-column:1/-1"><i class="ti ti-search"></i><p>Sin resultados</p></div>';return;}
  grid.innerHTML=ps.map(p=>{
    const disp=prodEstaDisp(p);
    const fav=favs.includes(p.id);
    return`<div class="card pcard fin" onclick="verProd(${p.id})">
      <div class="pimg">
        ${p.imagen?`<img src="${p.imagen}" alt="${p.nombre}" onerror="this.parentNode.innerHTML='<i class=\\'ti ${catIco(p.categoria)} pimg-icon\\'></i>'">`:`<i class="ti ${catIco(p.categoria)} pimg-icon"></i>`}
        ${!disp?`<div class="ndov"><i class="ti ti-ban" style="font-size:1rem"></i>No disponible</div>`:''}
      </div>
      <div class="pinfo">
        <div class="pname">${p.nombre}${p.subcategoria?`<span style="font-size:.68rem;color:var(--texto-ms);margin-left:4px">${p.subcategoria}</span>`:''}</div>
        <div class="pprice">${fQ(p.precio)}</div>
        ${p.extra?`<div class="etag"><i class="ti ti-clock" style="font-size:.7rem"></i>${p.extra}</div>`:''}
      </div>
    </div>`;
  }).join('');
}

function verProd(id,ovId='ov-producto',contId='prod-det-content'){
  const p=prods.find(x=>x.id===id);if(!p)return;
  const disp=prodEstaDisp(p);
  const fav=(U?.favoritos||[]).includes(p.id);
  if(U&&!ADMIN)sbIncProd(id,'clicks_vista');
  document.getElementById(contId).innerHTML=`
    <div class="mhdr"><span class="mtitle">${p.nombre}</span><button class="closebtn" onclick="cerrarOvById('${ovId}')"><i class="ti ti-x"></i></button></div>
    <div style="text-align:center;margin-bottom:14px">
      <div style="width:110px;height:110px;border-radius:14px;background:var(--beige);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;overflow:hidden;position:relative">
        ${p.imagen?`<img src="${p.imagen}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.innerHTML='<i class=\\'ti ${catIco(p.categoria)}\\' style=\\'font-size:2.8rem;color:var(--cafe-light)\\'></i>'">`:`<i class="ti ${catIco(p.categoria)}" style="font-size:2.8rem;color:var(--cafe-light)"></i>`}
        ${!disp?'<div class="ndov" style="font-size:.7rem"><i class="ti ti-ban" style="font-size:1rem;display:block"></i>No disponible</div>':''}
      </div>
      <div style="font-size:1.25rem;font-weight:700;color:var(--cafe)">${fQ(p.precio)}</div>
      <span class="badge b-n" style="margin-top:4px">${p.categoria}${p.subcategoria?' · '+p.subcategoria:''}</span>
    </div>
    ${p.detalles?`<div style="margin-bottom:11px"><div class="stitle">Detalles</div><p style="font-size:.86rem;color:var(--texto-s);line-height:1.7">${nlHtml(p.detalles)}</p></div>`:''}
    ${p.extra?`<div style="margin-bottom:13px"><div class="stitle">Disponibilidad</div><div class="etag"><i class="ti ti-clock" style="font-size:.75rem"></i>${p.extra}</div></div>`:''}
    ${U&&!ADMIN?`<button class="fav-btn-det${fav?' active':''}" id="fav-btn-det-${p.id}" onclick="toggleFav(${p.id})"><i class="ti ti-heart${fav?'-filled':''}"></i> ${fav?'Quitar de favoritos':'Agregar a favoritos'}</button>`:''}
    ${disp&&!ADMIN?`<button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="agregarCarrito(${p.id});cerrarOvById('${ovId}')"><i class="ti ti-shopping-bag-plus"></i> Agregar al carrito</button>`:''}
  `;
  abrirOv(ovId);
}

async function sbIncProd(id,campo){
  try{
    const{data}=await sb.from('productos').select(campo).eq('id',id).single();
    if(data!==null)await sb.from('productos').update({[campo]:(data[campo]||0)+1}).eq('id',id);
  }catch(e){}
}

// ═══════════════════════════════════════════════════════
// FAVORITOS
// ═══════════════════════════════════════════════════════
async function toggleFav(id){
  if(!U){toast('Inicia sesión para guardar favoritos');return;}
  let favs=Array.isArray(U.favoritos)?[...U.favoritos]:[];
  const i=favs.indexOf(id);
  const nowFav=i<0; // true si se va a AGREGAR
  if(i>=0)favs.splice(i,1);else favs.push(id);
  U.favoritos=favs;

  // ── Actualizar el botón en el modal abierto instantáneamente ──
  const btn=document.getElementById('fav-btn-det-'+id);
  if(btn){
    btn.className='fav-btn-det'+(nowFav?' active':'');
    btn.innerHTML=`<i class="ti ti-heart${nowFav?'-filled':''}"></i> ${nowFav?'Quitar de favoritos':'Agregar a favoritos'}`;
  }

  try{await sb.from('usuarios').update({favoritos:favs,updated_at:isoGT()}).eq('id',U.id);}catch(e){}
  renderProductos();
}

function abrirFavoritos(){
  if(!U){toast('Inicia sesión para ver favoritos');return;}
  const favs=U.favoritos||[];const ps=prods.filter(p=>favs.includes(p.id));
  document.getElementById('fav-content').innerHTML=!ps.length
    ?'<div class="empty"><i class="ti ti-heart"></i><p>Sin favoritos aún.<br>Presiona un producto para añadirlo.</p></div>'
    :ps.map(p=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--borde);cursor:pointer" onclick="verProd(${p.id},'ov-prod-fav','prod-det-fav-content')">
        <div class="ci-img">${p.imagen?`<img src="${p.imagen}" onerror="this.parentNode.innerHTML='<i class=\\'ti ${catIco(p.categoria)}\\'></i>'">`:`<i class="ti ${catIco(p.categoria)}"></i>`}</div>
        <div style="flex:1"><div style="font-size:.88rem;font-weight:500">${p.nombre}</div><div style="font-size:.8rem;color:var(--cafe)">${fQ(p.precio)}</div></div>
        <i class="ti ti-chevron-right" style="color:var(--texto-ms)"></i>
      </div>`).join('');
  abrirOv('ov-favoritos');
}

// ═══════════════════════════════════════════════════════
// CARRITO
// ═══════════════════════════════════════════════════════
function agregarCarrito(id){
  if(U?.bloqueado){toast('Tu cuenta está bloqueada.');return;}
  const p=prods.find(x=>x.id===id);if(!p)return;
  if(!prodEstaDisp(p)){toast('Este producto no está disponible ahora.');return;}
  const ex=carrito.find(c=>c.id===id);
  if(ex)ex.cantidad++;else carrito.push({id:p.id,nombre:p.nombre,precio:p.precio,categoria:p.categoria,imagen:p.imagen||'',cantidad:1});
  actuCarritoUI();
  if(document.getElementById('ov-carrito').classList.contains('open'))renderCarritoModal();
  sincCarrito();
  sbIncProd(id,'clicks_carrito');
  toast(p.nombre+' agregado al carrito');
}
function quitarCarrito(id){const ex=carrito.find(c=>c.id===id);if(!ex)return;if(ex.cantidad>1)ex.cantidad--;else carrito=carrito.filter(c=>c.id!==id);actuCarritoUI();renderCarritoModal();sincCarrito();}
async function sincCarrito(){if(!U)return;try{await sb.from('usuarios').update({carrito,updated_at:isoGT()}).eq('id',U.id);}catch(e){}}

function actuCarritoUI(){
  const tot=carrito.reduce((s,c)=>s+c.precio*c.cantidad,0);
  const cnt=carrito.reduce((s,c)=>s+c.cantidad,0);
  const cc=document.getElementById('carrito-count');
  document.getElementById('fab-total').textContent=fQ(tot);
  if(cc){cc.style.display=cnt>0?'flex':'none';cc.textContent=cnt;}
  document.getElementById('fab').classList.toggle('hidden',cnt===0);
}
function abrirCarrito(){renderCarritoModal();abrirOv('ov-carrito');}
function renderCarritoModal(){
  const lista=document.getElementById('carrito-lista');const totEl=document.getElementById('carrito-total');const accEl=document.getElementById('carrito-acc');
  if(!carrito.length){lista.innerHTML='<div class="empty"><i class="ti ti-shopping-bag"></i><p>Su carrito está vacío</p></div>';totEl.innerHTML='';accEl.innerHTML='';return;}
  lista.innerHTML=carrito.map(c=>`<div class="ci">
    <div class="ci-img">${c.imagen?`<img src="${c.imagen}" onerror="this.parentNode.innerHTML='<i class=\\'ti ${catIco(c.categoria)}\\'></i>'">`:`<i class="ti ${catIco(c.categoria)}"></i>`}</div>
    <div class="ci-info"><div class="ci-name">${c.nombre}</div><div class="ci-price">${fQ(c.precio)} c/u</div></div>
    <div class="qctrl"><button class="qbtn" onclick="quitarCarrito(${c.id})">−</button><span class="qnum">${c.cantidad}</span><button class="qbtn" onclick="agregarCarrito(${c.id})">+</button></div>
  </div>`).join('');
  const tot=carrito.reduce((s,c)=>s+c.precio*c.cantidad,0);
  totEl.innerHTML=`<div class="divider"></div><div style="display:flex;justify-content:space-between;align-items:center"><span style="color:var(--texto-s)">Total</span><span style="font-size:1.15rem;font-weight:700;color:var(--cafe-dark)">${fQ(tot)}</span></div>`;
  accEl.innerHTML=`<button class="btn btn-primary" style="width:100%;margin-top:9px" onclick="irAConfirmar()"><i class="ti ti-arrow-right"></i> Continuar con la orden</button>`;
}

function irAConfirmar(){
  const fb=cfg.funciones_bloqueadas||{};
  if(!U){cerrarOvById('ov-carrito');toast('Por favor inicia sesión primero');setTimeout(()=>abrirLogin(),400);return;}
  if(U.bloqueado){cerrarOvById('ov-carrito');mostrarBloqueoMsg(U.msg_bloqueo);return;}
  if(fb.realizar_pedidos){cerrarOvById('ov-carrito');toast('Los pedidos en línea están temporalmente desactivados.');return;}
  cerrarOvById('ov-carrito');mostrarConfirmPed();
}

function mostrarBloqueoMsg(msg){
  document.getElementById('prod-det-content').innerHTML=`<div class="blk-bann"><i class="ti ti-lock"></i><div><p style="font-weight:600;margin-bottom:3px">Cuenta bloqueada</p><p>${msg||'No puedes realizar pedidos. Contáctanos para más información.'}</p></div></div><button class="btn" style="width:100%;margin-top:4px" onclick="cerrarOvById('ov-producto')"><i class="ti ti-x"></i> Cerrar</button>`;
  abrirOv('ov-producto');
}

function toggleTerminos(){const el=document.getElementById('terminos-x');const b=document.querySelector('.mas-btn');if(!el||!b)return;el.classList.toggle('vis');b.textContent=el.classList.contains('vis')?'Ocultar':'Mostrar términos completos';}

function mostrarConfirmPed(){
  actTerminos();
  const fb=cfg.funciones_bloqueadas||{};
  const tot=carrito.reduce((s,c)=>s+c.precio*c.cantidad,0);
  document.getElementById('resumen-ped').innerHTML=`<div style="background:var(--crema);border-radius:10px;padding:11px;border:1px solid var(--borde)">${carrito.map(c=>`<div style="display:flex;justify-content:space-between;font-size:.84rem;padding:3px 0"><span>${c.nombre} ×${c.cantidad}</span><span>${fQ(c.precio*c.cantidad)}</span></div>`).join('')}<div class="divider"></div><div style="display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:var(--cafe-dark)">${fQ(tot)}</span></div></div>`;
  const sn=document.getElementById('sect-nota');if(sn)sn.style.display=fb.nota_pedido?'none':'block';
  const sd=document.getElementById('sect-domicilio');if(sd)sd.style.display=fb.pedido_domicilio?'none':'block';
  const sh=document.getElementById('sect-hora');if(sh)sh.style.display=fb.hora_recogida?'none':'block';
  const notaEl=document.getElementById('nota-ped');if(notaEl)notaEl.value='';
  const chkD=document.getElementById('chk-dom');if(chkD){chkD.checked=false;document.getElementById('dom-fields').style.display='none';}
  if(U?.direccion&&document.getElementById('dom-dir'))document.getElementById('dom-dir').value=U.direccion;
  if(U?.maps_link&&document.getElementById('dom-maps'))document.getElementById('dom-maps').value=U.maps_link;
  const chkH=document.getElementById('chk-hora');if(chkH){chkH.checked=false;}
  document.getElementById('hora-pick-btn').style.display='none';
  document.getElementById('hora-default-txt').style.display='block';
  limpiarHora();
  const det=document.getElementById('terminos-x');const mb=document.querySelector('.mas-btn');
  if(det)det.classList.remove('vis');if(mb)mb.textContent='Mostrar términos completos';
  actualizarResumenEntrega();
  abrirOv('ov-confirm-ped');
}

// ── Resumen de entrega dinámico ──────────────────────
function actualizarResumenEntrega(){
  const el=document.getElementById('entrega-resumen');if(!el)return;
  const fb=cfg.funciones_bloqueadas||{};
  const isDom=!fb.pedido_domicilio&&(document.getElementById('chk-dom')?.checked);
  const tipoEntrega=isDom?'A domicilio 🚚':'Recoger en local 🏪';
  const horaChk=document.getElementById('chk-hora');
  const horaDisp=document.getElementById('hora-display');
  const horaCustom=!fb.hora_recogida&&horaChk?.checked&&horaDisp?.dataset?.hora;
  const horaLabel=horaCustom
    ?horaDisp.dataset.hora
    :`aprox. 30 min (${horaEst30()})`;
  el.innerHTML=`<div class="entrega-info">
    <div class="entrega-info-row"><span>Tipo de entrega:</span><span>${tipoEntrega}</span></div>
    <div class="entrega-info-row" style="margin-top:4px"><span>Hora de entrega:</span><span>${horaLabel}</span></div>
  </div>`;
}

function toggleDomicilio(){
  const c=document.getElementById('chk-dom');
  document.getElementById('dom-fields').style.display=c.checked?'block':'none';
  actualizarResumenEntrega();
}
function toggleHoraSection(){
  const c=document.getElementById('chk-hora');
  document.getElementById('hora-pick-btn').style.display=c.checked?'block':'none';
  document.getElementById('hora-default-txt').style.display=c.checked?'none':'block';
  if(!c.checked)limpiarHora();
  actualizarResumenEntrega();
}

async function confirmarPedido(){
  const fb=cfg.funciones_bloqueadas||{};
  const chkD=document.getElementById('chk-dom');
  const esDom=chkD&&chkD.checked&&!fb.pedido_domicilio;
  if(esDom){
    const dir=(document.getElementById('dom-dir')||{}).value?.trim();
    const maps=(document.getElementById('dom-maps')||{}).value?.trim();
    if(!dir||!maps){toast('Para domicilio, ingresa tu dirección y link de Google Maps');return;}
  }
  ld('btn-confirm-ped',true);
  try{
    const tot=carrito.reduce((s,c)=>s+c.precio*c.cantidad,0);
    const id=genId();
    const nota=!fb.nota_pedido?(document.getElementById('nota-ped')||{}).value?.trim()||'':'';
    const horaEl=document.getElementById('hora-display');
    const horaChk=document.getElementById('chk-hora');
    const hora=(!fb.hora_recogida&&horaChk&&horaChk.checked)?horaEl?.dataset?.hora||'':'';
    const dir=esDom?(document.getElementById('dom-dir')||{}).value?.trim()||'':'';
    const maps=esDom?(document.getElementById('dom-maps')||{}).value?.trim()||'':'';
    if(esDom&&dir&&(!U.direccion||!U.maps_link)){
      const upd={};if(!U.direccion&&dir)upd.direccion=dir;if(!U.maps_link&&maps)upd.maps_link=maps;
      if(Object.keys(upd).length){Object.assign(U,upd,{updated_at:isoGT()});await sb.from('usuarios').update({...upd,updated_at:isoGT()}).eq('id',U.id);}
    }
    const now=isoGT();
    const ped={id,usuario_id:U.id,usuario_tel:U.telefono,productos:carrito.map(c=>({id:c.id,nombre:c.nombre,precio:c.precio,cantidad:c.cantidad})),total:tot,estado:'pendiente',nota,hora_recogida:hora,es_domicilio:esDom,dir_domicilio:dir,maps_domicilio:maps,msg_cancelacion:'',historial_estados:[{estado:'pendiente',fecha:now}],created_at:now,updated_at:now};
    const{error}=await sb.from('pedidos').insert(ped);
    if(error)throw error;
    for(const c of carrito)await sbIncProd(c.id,'clicks_orden');
    carrito=[];await sb.from('usuarios').update({carrito:[],updated_at:isoGT()}).eq('id',U.id);
    actuCarritoUI();
    cerrarOvById('ov-confirm-ped');
    playOk();
    const tel=cfg.telefono_tienda||'';
    let msgWa=`¡Hola! He realizado una orden con el ID #${id}.`;
    if(esDom)msgWa+=` Solicito entrega a domicilio en: ${dir}.`;
    if(hora)msgWa+=` Hora de recogida: ${hora}.`;
    if(nota)msgWa+=` Nota: ${nota}.`;
    msgWa+=' Quedo atento a la confirmación. 😊';
    window.open(`https://wa.me/502${tel}?text=${encodeURIComponent(msgWa)}`,'_blank');
    document.getElementById('post-ped-info').innerHTML=buildPostPedHtml(ped);
    abrirOv('ov-post-ped');
  }catch(e){toast('Error al crear la orden: '+(e.message||e));}
  ld('btn-confirm-ped',false);
}

function buildPostPedHtml(p){
  return`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-weight:700;font-size:1.05rem;color:var(--cafe-dark)">#${p.id}</span>${estadoBadge(p.estado)}</div>
  ${p.hora_recogida?`<div style="font-size:.82rem;color:var(--inf);display:flex;align-items:center;gap:4px;margin-bottom:6px"><i class="ti ti-clock"></i>Recogida: <strong>${p.hora_recogida}</strong></div>`:'<div style="font-size:.82rem;color:var(--texto-ms);margin-bottom:6px">Recogida: Lo más rápido posible</div>'}
  ${p.es_domicilio?`<div style="font-size:.82rem;color:var(--ex);display:flex;align-items:center;gap:4px;margin-bottom:6px"><i class="ti ti-truck"></i>Entrega a domicilio</div>`:''}
  ${p.productos.map(pr=>`<div style="display:flex;justify-content:space-between;font-size:.83rem;padding:2px 0"><span>${pr.nombre} ×${pr.cantidad}</span><span>${fQ(pr.precio*pr.cantidad)}</span></div>`).join('')}
  <div class="divider"></div>
  <div style="display:flex;justify-content:space-between;font-weight:700;font-size:.9rem"><span>Total</span><span style="color:var(--cafe-dark)">${fQ(p.total)}</span></div>
  ${p.nota?`<div style="margin-top:8px;font-size:.8rem;color:var(--texto-s);border-top:1px solid var(--borde);padding-top:7px;display:flex;align-items:center;gap:4px"><i class="ti ti-note"></i>${p.nota}</div>`:''}`;
}

// ═══════════════════════════════════════════════════════
// TIME PICKER
// ═══════════════════════════════════════════════════════
const HORAS=[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
const MINS=[0,5,10,15,20,25,30,35,40,45,50,55];

function initDrums(){
  buildDrum('drum-h',HORAS);buildDrum('drum-m',MINS);
  buildDrum('drum-blk-h',HORAS);buildDrum('drum-blk-m',MINS);
}
function buildDrum(id,vals){
  const d=document.getElementById(id);if(!d)return;
  const pad='<div class="ditem" style="pointer-events:none"></div>';
  d.innerHTML=pad+vals.map(v=>`<div class="ditem" data-val="${v}">${String(v).padStart(2,'0')}</div>`).join('')+pad;
  d.addEventListener('scroll',()=>hilite(d),{passive:true});
  setTimeout(()=>{d.scrollTop=0;hilite(d);},80);
}
function hilite(d){const its=d.querySelectorAll('.ditem[data-val]');const c=d.scrollTop+60;its.forEach(it=>{const m=it.offsetTop+20;it.classList.toggle('sel',Math.abs(m-c)<22);});}
function getDrumVal(id){const d=document.getElementById(id);const its=d.querySelectorAll('.ditem[data-val]');const c=d.scrollTop+60;let best=null,bd=999;its.forEach(it=>{const m=it.offsetTop+20;const dv=Math.abs(m-c);if(dv<bd){bd=dv;best=it.dataset.val;}});return best;}

function abrirTimePicker(){abrirOv('ov-timepick');}
function confirmarHora(){
  const h=getDrumVal('drum-h');const m=getDrumVal('drum-m');if(!h)return;
  const str=`${String(h).padStart(2,'0')}:${String(m||0).padStart(2,'0')}`;
  const disp=document.getElementById('hora-display');
  if(disp){disp.textContent=str;disp.dataset.hora=str;disp.style.color='var(--texto)';}
  const clr=document.getElementById('hora-clear-btn');if(clr)clr.style.display='inline';
  cerrarOvById('ov-timepick');
  actualizarResumenEntrega();
}
function limpiarHora(){
  const disp=document.getElementById('hora-display');
  if(disp){disp.textContent='Toca para seleccionar hora';disp.dataset.hora='';disp.style.color='var(--texto-ms)';}
  const clr=document.getElementById('hora-clear-btn');if(clr)clr.style.display='none';
  actualizarResumenEntrega();
}

function abrirTpBlk(callback,titulo='Hora de bloqueo'){
  blkTpCallback=callback;
  document.getElementById('blk-tp-titulo').textContent=titulo;
  abrirOv('ov-timepick-blk');
}
function confirmarHoraBlk(){
  const h=getDrumVal('drum-blk-h');const m=getDrumVal('drum-blk-m');if(!h)return;
  const str=`${String(h).padStart(2,'0')}:${String(m||0).padStart(2,'0')}`;
  if(blkTpCallback)blkTpCallback(str);
  cerrarOvById('ov-timepick-blk');
}

// ═══════════════════════════════════════════════════════
// LOGIN — FLUJO MULTI-PASO
// ═══════════════════════════════════════════════════════
function abrirLogin(){
  if(U){abrirPerfil();return;}
  loginMostrarPaso('s1');
  const el=document.getElementById('lt');if(el)el.value='';
  abrirOv('ov-login');
}

function loginMostrarPaso(paso){
  ['login-s1','login-s2-nuevo','login-s2-admin','login-s3-pass'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='none';
  });
  const el=document.getElementById('login-'+paso);if(el)el.style.display='block';
}

async function loginVerificarTel(){
  const tel=document.getElementById('lt').value.replace(/\D/g,'');
  if(tel.length!==8){toast('El teléfono debe tener 8 dígitos');return;}
  ld('btn-login-tel',true);
  try{
    const{data:usr}=await sb.from('usuarios').select('*').eq('telefono',tel).maybeSingle();
    loginTelActual=tel;
    if(usr){
      loginUsrActual=usr;
      if(usr.rol==='admin'){
        loginMostrarPaso('s2-admin');
      }else{
        await completarLogin(usr,'user');
      }
    }else{
      loginUsrActual=null;
      const ln=document.getElementById('ln');if(ln)ln.value='';
      const la=document.getElementById('la');if(la)la.value='';
      loginMostrarPaso('s2-nuevo');
    }
  }catch(e){toast('Error: '+(e.message||e));}
  ld('btn-login-tel',false);
}

async function loginRegistrarNuevo(){
  const nombre=document.getElementById('ln').value.trim();
  const apellido=document.getElementById('la').value.trim();
  if(!nombre){toast('El nombre es obligatorio');return;}
  ld('btn-login-nuevo',true);
  try{
    const now=isoGT();
    const nu={nombre,apellido,telefono:loginTelActual,rol:'cliente',created_at:now,updated_at:now,ultima_conexion:now,advertencias:[],bloqueado:false,msg_bloqueo:'',favoritos:[],carrito:[],clicks:0,visitas:1};
    const{data:cr,error}=await sb.from('usuarios').insert(nu).select().single();
    if(error)throw error;
    toast('¡Bienvenido! Cuenta creada.');
    await completarLogin(cr,'user');
  }catch(e){toast('Error: '+(e.message||e));}
  ld('btn-login-nuevo',false);
}

async function loginComoUsuario(){
  await completarLogin(loginUsrActual,'user');
}

function loginComoAdmin(){
  const lp=document.getElementById('lp');if(lp)lp.value='';
  loginMostrarPaso('s3-pass');
}

async function loginConfirmarPass(){
  const pass=document.getElementById('lp').value;
  if(pass!=='Nico'){toast('Contraseña incorrecta');return;}
  ld('btn-login-pass',true);
  await completarLogin(loginUsrActual,'admin');
  ld('btn-login-pass',false);
}

async function completarLogin(usr,rol){
  U=usr;
  carrito=Array.isArray(usr.carrito)?usr.carrito:[];
  actuCarritoUI();
  localStorage.setItem('mdj_tel',usr.telefono);
  localStorage.setItem('mdj_rol',rol);
  try{
    await sb.from('usuarios').update({ultima_conexion:isoGT(),updated_at:isoGT()}).eq('id',U.id);
    await incr('visitas');
  }catch(e){}
  cerrarOvById('ov-login');
  renderFiltros();
  renderProductos();
  if(rol==='admin'){
    ADMIN=true;
    entrarAdmin();
  }else{
    ADMIN=false;
    toast('¡Bienvenido, '+usr.nombre+'!');
    abrirPerfil();
  }
}

// ─── Compatibilidad: la función hacerLogin ya no se usa ────────
function hacerLogin(){}

// ═══════════════════════════════════════════════════════
// PERFIL
// ═══════════════════════════════════════════════════════
function abrirPerfil(){if(!U){abrirLogin();return;}renderPerfil();abrirOv('ov-perfil');}

async function renderPerfil(){
  try{const{data}=await sb.from('usuarios').select('*').eq('id',U.id).single();if(data)U=data;}catch(e){}
  const advc=getAdvc(U);
  let peds=[];try{const{data}=await sb.from('pedidos').select('*').eq('usuario_tel',U.telefono).order('created_at',{ascending:false});if(data)peds=data;}catch(e){}
  const activas=peds.filter(p=>p.estado!=='entregado'&&p.estado!=='cancelado');
  const hist=peds.filter(p=>p.estado==='entregado'||p.estado==='cancelado');
  document.getElementById('perfil-content').innerHTML=`
    <div class="mhdr"><span class="mtitle">Mi perfil</span><button class="closebtn" onclick="cerrarOvById('ov-perfil')"><i class="ti ti-x"></i></button></div>
    <div style="text-align:center;padding:0 0 16px">
      <div class="pavatar">${U.nombre[0]}${U.apellido?U.apellido[0]:''}</div>
      <div class="pnombre">${U.nombre} ${U.apellido||''}</div>
      <div class="ptel"><i class="ti ti-phone" style="font-size:.88rem"></i>${U.telefono.slice(0,4)+' '+U.telefono.slice(4)}</div>
      <button class="btn btn-xs" style="margin-top:7px" onclick="editarPerfil()"><i class="ti ti-edit"></i> Editar perfil</button>
    </div>
    ${U.bloqueado?`<div class="blk-bann"><i class="ti ti-lock"></i><div><p style="font-weight:600;margin-bottom:2px">Cuenta bloqueada</p><p>${U.msg_bloqueo||'No puedes realizar pedidos.'}</p></div></div>`:''}
    ${advc>0?`<div style="display:flex;align-items:center;gap:7px;background:var(--pelbg);border-radius:8px;padding:8px 11px;margin-bottom:10px;font-size:.82rem;color:var(--pel);font-weight:600"><i class="ti ti-alert-triangle" style="font-size:1rem"></i> Tiene ${advc} advertencia${advc>1?'s':''} acumulada${advc>1?'s':''}</div>`:''}
    <div class="divider"></div>
    ${activas.length?`<div style="margin-bottom:14px"><div class="stitle">Órdenes activas (${activas.length})</div>${activas.map(p=>`<div style="margin-top:6px">${p.estado==='pendiente'?`<div class="edit-aviso" style="margin-bottom:4px"><i class="ti ti-pencil" style="font-size:.9rem"></i> #${p.id} — Aún puede modificarla</div>`:''}<div class="pmini" onclick="verDetPed('${p.id}')"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:1.05rem;font-weight:700;color:var(--cafe-dark)">#${p.id}</span>${estadoBadge(p.estado)}</div><div style="font-size:.8rem;color:var(--texto-s);margin-top:2px">${p.productos.length} producto(s) · ${fQ(p.total)}${p.hora_recogida?` · ${p.hora_recogida}`:' · Lo más rápido posible'}${p.es_domicilio?' · 🚚 Domicilio':''}</div></div></div>`).join('')}</div>`:''}
    <div class="stitle">Historial</div>
    ${hist.length?hist.map(p=>`<div class="pmini" style="margin-top:6px" onclick="verDetPed('${p.id}')"><div style="display:flex;justify-content:space-between"><span style="font-weight:700;color:var(--cafe-dark)">#${p.id}</span>${estadoBadge(p.estado)}</div><div style="font-size:.78rem;color:var(--texto-s);margin-top:2px">${fQ(p.total)} · ${fmtFecha(p.created_at)}</div></div>`).join(''):'<div class="empty" style="padding:18px 0"><i class="ti ti-clock"></i><p>Sin órdenes completadas</p></div>'}
    <div class="divider"></div>
    <button class="btn" style="width:100%" onclick="pedirCerrarSesion()"><i class="ti ti-logout"></i> Cerrar sesión</button>
  `;
}

function pedirCerrarSesion(){
  confirm2('¿Cerrar sesión?','Tendrá que ingresar nuevamente con su teléfono.','Cerrar sesión',()=>{
    limpiarSesion();carrito=[];actuCarritoUI();cerrarOvById('ov-perfil');renderFiltros();renderProductos();toast('Sesión cerrada');
  });
}

function editarPerfil(){
  document.getElementById('perfil-content').innerHTML=`
    <div class="mhdr"><button class="back-btn" onclick="renderPerfil()"><i class="ti ti-arrow-left"></i></button><span class="mtitle">Editar perfil</span><button class="closebtn" onclick="cerrarOvById('ov-perfil')"><i class="ti ti-x"></i></button></div>
    <div class="fg"><label>Nombre *</label><input type="text" id="en" value="${U.nombre}"></div>
    <div class="fg"><label>Apellido</label><input type="text" id="ea" value="${U.apellido||''}"></div>
    <div class="fg"><label>Dirección</label><input type="text" id="ed" value="${U.direccion||''}" placeholder="Ej: Zona 10, Calle Principal"></div>
    <div class="fg"><label>Link de Google Maps</label><input type="url" id="em" value="${U.maps_link||''}" placeholder="https://maps.google.com/…"></div>
    <button class="btn btn-primary" style="width:100%;margin-top:4px" id="btn-save-perfil" onclick="guardarPerfil()"><span class="lbl"><i class="ti ti-device-floppy"></i> Guardar</span><div class="bsp"></div></button>
  `;
}
async function guardarPerfil(){
  const n=document.getElementById('en').value.trim();if(!n){toast('El nombre es obligatorio');return;}
  ld('btn-save-perfil',true);
  try{
    const u={nombre:n,apellido:document.getElementById('ea').value.trim(),direccion:document.getElementById('ed').value.trim(),maps_link:document.getElementById('em').value.trim(),updated_at:isoGT()};
    await sb.from('usuarios').update(u).eq('id',U.id);Object.assign(U,u);
    toast('Perfil actualizado');renderPerfil();
  }catch(e){toast('Error: '+e.message);}
  ld('btn-save-perfil',false);
}

// ─── Detalle pedido usuario ───────────────────────────
async function verDetPed(pedId){
  let p=null;try{const{data}=await sb.from('pedidos').select('*').eq('id',pedId).single();p=data;}catch(e){}
  if(!p)return;
  const pE=p.estado==='pendiente';
  const pC=p.estado==='pendiente';
  const ei=(cfg.estados_info||{})[p.estado]||'';
  document.getElementById('det-ped-content').innerHTML=`
    <div class="mhdr"><span class="mtitle">Orden #${p.id}</span><button class="closebtn" onclick="cerrarOvById('ov-det-ped')"><i class="ti ti-x"></i></button></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div>${estadoBadge(p.estado)}</div>
      <div style="font-size:.78rem;color:var(--texto-ms)">${fmtFecha(p.created_at)}</div>
    </div>
    ${ei?`<div style="background:var(--beige-dark);border-radius:8px;padding:8px 11px;font-size:.8rem;color:var(--texto-s);margin-bottom:8px;display:flex;align-items:flex-start;gap:6px"><i class="ti ti-info-circle" style="flex-shrink:0;margin-top:1px;color:var(--cafe-light)"></i><span>${ei}</span></div>`:''}
    ${pE?'<div class="edit-aviso"><i class="ti ti-pencil" style="font-size:.9rem"></i> Aún puede modificar su orden</div>':''}
    ${p.hora_recogida?`<div style="font-size:.82rem;color:var(--inf);display:flex;align-items:center;gap:4px;margin:6px 0"><i class="ti ti-clock"></i>Recogida: <strong>${p.hora_recogida}</strong></div>`:'<div style="font-size:.82rem;color:var(--texto-ms);margin:4px 0">Recogida: Lo más rápido posible</div>'}
    ${p.es_domicilio?`<div style="font-size:.82rem;color:var(--ex);display:flex;align-items:center;gap:4px;margin-bottom:6px"><i class="ti ti-truck"></i>Domicilio${p.dir_domicilio?': '+p.dir_domicilio:''}</div>`:''}
    <div style="margin:10px 0">
      ${p.productos.map(pr=>`<div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--borde)">
        <div style="width:33px;height:33px;border-radius:7px;background:var(--beige);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="ti ${catIco(prods.find(x=>x.id===pr.id)?.categoria||'')}" style="font-size:1rem;color:var(--cafe-light)"></i></div>
        <div style="flex:1"><div style="font-size:.86rem;font-weight:500">${pr.nombre}</div><div style="font-size:.76rem;color:var(--texto-s)">${fQ(pr.precio)} × ${pr.cantidad}</div></div>
        <div style="font-weight:700;color:var(--cafe-dark);font-size:.88rem">${fQ(pr.precio*pr.cantidad)}</div>
        ${pE?`<div style="display:flex;gap:4px"><button class="qbtn" onclick="editCantPed('${p.id}',${pr.id},-1)">−</button><button class="qbtn" onclick="editCantPed('${p.id}',${pr.id},1)">+</button></div>`:''}
      </div>`).join('')}
      ${p.nota?`<div style="margin-top:8px;font-size:.82rem;color:var(--texto-s);display:flex;align-items:center;gap:5px"><i class="ti ti-note"></i>${p.nota}</div>`:''}
      <div style="display:flex;justify-content:space-between;font-weight:700;padding:10px 0"><span>Total</span><span style="color:var(--cafe-dark)">${fQ(p.total)}</span></div>
    </div>
    ${pC?`<button class="btn btn-danger" style="width:100%;margin-bottom:8px" onclick="pedirCancelarPed('${p.id}')"><i class="ti ti-x"></i> Cancelar esta orden</button>`:''}
    <button class="btn" style="width:100%" onclick="cerrarOvById('ov-det-ped')"><i class="ti ti-x"></i> Cerrar</button>
  `;
  abrirOv('ov-det-ped');
}

function pedirCancelarPed(pedId){cancelPedId=pedId;abrirOv('ov-cancel-confirm');}

async function ejecutarCancelPed(){
  if(!cancelPedId)return;
  ld('btn-do-cancel',true);
  try{
    const{data:ped}=await sb.from('pedidos').select('*').eq('id',cancelPedId).single();
    const hist=[...(ped?.historial_estados||[]),{estado:'cancelado',fecha:isoGT()}];
    await sb.from('pedidos').update({estado:'cancelado',historial_estados:hist,updated_at:isoGT()}).eq('id',cancelPedId);
    cerrarOvById('ov-cancel-confirm');cerrarOvById('ov-det-ped');
    document.getElementById('post-cancel-info').innerHTML=buildPostPedHtml({...ped,estado:'cancelado'});
    abrirOv('ov-post-cancel');
    renderPerfil();
    const tel=cfg.telefono_tienda||'';
    window.open(`https://wa.me/502${tel}?text=${encodeURIComponent('¡Hola! Me gustaría cancelar mi orden con el ID #'+cancelPedId+'. Por favor confirmen la cancelación. Gracias.')}`,'_blank');
  }catch(e){toast('Error: '+e.message);}
  ld('btn-do-cancel',false);
}
function ejecutarCancelPedido(){ejecutarCancelPed();}

async function editCantPed(pid,prodId,delta){
  try{
    const{data:p}=await sb.from('pedidos').select('*').eq('id',pid).single();
    if(!p||p.estado!=='pendiente')return;
    const ps=[...p.productos];const pr=ps.find(x=>x.id===prodId);if(!pr)return;
    pr.cantidad=Math.max(0,pr.cantidad+delta);
    const np=ps.filter(x=>x.cantidad>0);
    if(!np.length){await sb.from('pedidos').update({estado:'cancelado',updated_at:isoGT()}).eq('id',pid);cerrarOvById('ov-det-ped');renderPerfil();toast('Orden cancelada');return;}
    const nt=np.reduce((s,x)=>s+x.precio*x.cantidad,0);
    await sb.from('pedidos').update({productos:np,total:nt,updated_at:isoGT()}).eq('id',pid);
    verDetPed(pid);
  }catch(e){toast('Error: '+e.message);}
}

// ═══════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════
function entrarAdmin(){
  ADMIN=true;
  document.getElementById('page-tienda').classList.remove('active');
  document.getElementById('page-admin').classList.add('active');
  renderAdminPedidos();
}

function pedirCerrarAdmin(){
  confirm2('¿Salir del panel?','Volverá a la tienda y se cerrará la sesión admin.','Salir',()=>{
    ADMIN=false;limpiarSesion();
    document.getElementById('page-admin').classList.remove('active');
    document.getElementById('page-tienda').classList.add('active');
    U=null;carrito=[];actuCarritoUI();renderFiltros();renderProductos();
  });
}

function adminTab(v,btn){
  document.querySelectorAll('.atab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  document.querySelectorAll('.aview').forEach(vw=>vw.classList.remove('active'));document.getElementById('admin-'+v).classList.add('active');
  ({pedidos:renderAdminPedidos,historial:renderAdminHistorial,productos:renderAdminProductos,usuarios:renderAdminUsrs,config:renderAdminCfg})[v]?.();
}
function setPedSec(s,btn){pedSec=s;document.querySelectorAll('.ssb').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderListaPeds();}

async function renderAdminPedidos(){
  let all=[];try{const{data}=await sb.from('pedidos').select('*');if(data)all=data;}catch(e){}
  document.getElementById('admin-resum').innerHTML=`
    <div class="rcrd"><div class="rcrd-n">${all.filter(p=>p.estado==='pendiente').length}</div><div class="rcrd-l">Pendientes</div></div>
    <div class="rcrd"><div class="rcrd-n">${all.filter(p=>p.estado==='confirmado').length}</div><div class="rcrd-l">Confirmadas</div></div>
    <div class="rcrd"><div class="rcrd-n">${all.filter(p=>p.estado==='listo').length}</div><div class="rcrd-l">Listas</div></div>`;
  renderListaPeds();
}

async function renderListaPeds(){
  const lista=document.getElementById('admin-ped-lista');
  lista.innerHTML='<div class="ldwrap"><div class="sp"></div></div>';
  let peds=[];let usrs=[];
  try{const{data}=await sb.from('pedidos').select('*').eq('estado',pedSec).order('created_at',{ascending:true});if(data)peds=data;}catch(e){}
  try{const{data}=await sb.from('usuarios').select('id,nombre,apellido,telefono');if(data)usrs=data;}catch(e){}
  if(!peds.length){lista.innerHTML='<div class="empty"><i class="ti ti-clipboard-list"></i><p>Sin órdenes en esta sección</p></div>';return;}
  lista.innerHTML=peds.map(p=>{
    const u=usrs.find(x=>x.telefono===p.usuario_tel);
    const{hora,custom}=horaEstimada(p);
    return`<div class="apcard" onclick="verAdminPed('${p.id}')">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:7px">
          <span class="apid">#${p.id}</span>
          <span style="font-size:.83rem;color:var(--texto-s);font-weight:500">${u?u.nombre+' '+(u.apellido||''):'Cliente'}</span>
          ${p.es_domicilio?'<span class="badge b-ok" style="font-size:.65rem">Domicilio</span>':''}
        </div>
        <span style="font-weight:700;color:var(--cafe-dark)">${fQ(p.total)}</span>
      </div>
      <div style="font-size:.76rem;color:var(--texto-ms);display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
        <span><i class="ti ti-package" style="vertical-align:-2px"></i> ${p.productos.length} producto(s)</span>
        <span><i class="ti ti-clock" style="vertical-align:-2px"></i> ${fmtHora(p.created_at)}</span>
      </div>
      <span class="hchip ${custom?'hchip-cust':'hchip-def'}"><i class="ti ti-alarm" style="font-size:.8rem"></i> Entrega: ${hora}</span>
      ${p.nota?`<div style="font-size:.74rem;color:var(--texto-s);margin-top:6px;display:flex;align-items:center;gap:3px"><i class="ti ti-note" style="font-size:.8rem"></i>${p.nota}</div>`:''}
    </div>`;
  }).join('');
}

async function verAdminPed(pedId){
  let p=null;let usrs=[];
  try{const{data}=await sb.from('pedidos').select('*').eq('id',pedId).single();p=data;}catch(e){}
  if(!p)return;
  try{const{data}=await sb.from('usuarios').select('id,nombre,apellido,telefono');if(data)usrs=data;}catch(e){}
  const u=usrs.find(x=>x.telefono===p.usuario_tel);
  const esA=p.estado!=='entregado'&&p.estado!=='cancelado';
  const{hora,custom}=horaEstimada(p);
  document.getElementById('admin-ped-det').innerHTML=`
    <div class="mhdr">
      <div style="flex:1">
        <span class="apid">#${p.id}</span>
        <div style="margin-top:3px"><span class="hchip ${custom?'hchip-cust':'hchip-def'}"><i class="ti ti-alarm" style="font-size:.8rem"></i> Entrega: ${hora}</span></div>
      </div>
      ${estadoBadge(p.estado)}
      <button class="closebtn" style="margin-left:6px" onclick="cerrarOvById('ov-admin-ped')"><i class="ti ti-x"></i></button>
    </div>
    <div style="background:var(--crema);border-radius:10px;padding:11px;margin-bottom:12px;cursor:pointer;border:1px solid var(--borde)" onclick="verAdminUsr('${p.usuario_tel}')">
      <div style="display:flex;align-items:center;gap:9px">
        <div style="width:34px;height:34px;border-radius:50%;background:var(--beige-dark);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--cafe-dark);flex-shrink:0">${u?u.nombre[0]:'?'}</div>
        <div style="flex:1"><div style="font-size:.88rem;font-weight:500">${u?u.nombre+' '+(u.apellido||''):'Desconocido'}</div><div style="font-size:.78rem;color:var(--cafe);display:flex;align-items:center;gap:3px"><i class="ti ti-phone" style="font-size:.82rem"></i>${p.usuario_tel.slice(0,4)+' '+p.usuario_tel.slice(4)}</div></div>
        <i class="ti ti-chevron-right" style="color:var(--texto-ms)"></i>
      </div>
    </div>
    ${p.es_domicilio?`<div style="background:var(--exbg);border-radius:8px;padding:9px 12px;margin-bottom:10px;font-size:.84rem;color:var(--ex);display:flex;align-items:flex-start;gap:6px"><i class="ti ti-truck" style="font-size:1rem;flex-shrink:0"></i><div><strong>Domicilio:</strong> ${p.dir_domicilio||''}${p.maps_domicilio?`<br><a href="${p.maps_domicilio}" target="_blank" style="color:var(--ex);font-size:.78rem">Ver en Maps</a>`:''}</div></div>`:''}
    <div style="margin-bottom:12px">
      <div class="stitle" style="margin-bottom:6px">Productos — toca para ver detalles</div>
      ${p.productos.map(pr=>`<div class="aprow" onclick="verProd(${pr.id},'ov-admin-prod-det','admin-prod-det-cont')">
        ${esA?`<span class="qchip">${pr.cantidad}</span>`:`<span style="font-size:.82rem;color:var(--texto-ms);font-weight:600;flex-shrink:0">×${pr.cantidad}</span>`}
        <div style="flex:1"><div style="font-size:.88rem;font-weight:500">${pr.nombre}${pr.noDisponible?'<span class="badge b-err" style="margin-left:5px;font-size:.64rem">No disp.</span>':''}</div><div style="font-size:.76rem;color:var(--texto-s)">${fQ(pr.precio)} c/u · ${fQ(pr.precio*pr.cantidad)}</div></div>
        <i class="ti ti-info-circle aptap"></i>
      </div>`).join('')}
      ${p.nota?`<div style="margin-top:8px;font-size:.82rem;color:var(--texto-s);display:flex;align-items:flex-start;gap:5px;padding:6px 0 0"><i class="ti ti-note" style="flex-shrink:0;margin-top:1px"></i><span><strong>Nota:</strong> ${p.nota}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;font-weight:700;padding:9px 0"><span>Total</span><span style="color:var(--cafe-dark)">${fQ(p.total)}</span></div>
    </div>
    <div class="divider"></div>
    <div class="stitle" style="margin-bottom:8px">Acciones</div>
    ${renderAccAdmin(p)}
  `;
  abrirOv('ov-admin-ped');
}

function renderAccAdmin(p){
  let h='';
  if(p.estado==='listo')h+=`<button class="abtn" onclick="accEntregado('${p.id}')"><i class="ti ti-checks" style="color:var(--cafe)"></i> Marcar como entregada</button>`;
  if(p.estado==='pendiente')h+=`<button class="abtn" onclick="accConfirmar('${p.id}')"><i class="ti ti-circle-check" style="color:var(--inf)"></i> Confirmar orden recibida</button>`;
  if(p.estado!=='listo'&&p.estado!=='entregado'&&p.estado!=='cancelado')h+=`<button class="abtn" onclick="accListo('${p.id}')"><i class="ti ti-package-export" style="color:var(--ex)"></i> Orden lista para recoger</button>`;
  if(p.estado!=='entregado'&&p.estado!=='cancelado'){
    h+=`<button class="abtn" onclick="accNoDisp('${p.id}')"><i class="ti ti-package-off" style="color:var(--av)"></i> Productos no disponibles</button>`;
    h+=`<button class="abtn danger" onclick="accCancelar('${p.id}')"><i class="ti ti-x"></i> Cancelar orden</button>`;
  }
  return h;
}

async function cambiarEstado(pedId,nuevoE){
  const{data:ped}=await sb.from('pedidos').select('historial_estados').eq('id',pedId).single();
  const hist=[...(ped?.historial_estados||[]),{estado:nuevoE,fecha:isoGT()}];
  await sb.from('pedidos').update({estado:nuevoE,historial_estados:hist,updated_at:isoGT()}).eq('id',pedId);
}

async function accConfirmar(id){
  try{await cambiarEstado(id,'confirmado');cerrarOvById('ov-admin-ped');renderAdminPedidos();toast('Orden #'+id+' confirmada');}catch(e){toast('Error: '+e.message);}
}

async function accListo(id){
  let p=null;try{const{data}=await sb.from('pedidos').select('*').eq('id',id).single();p=data;}catch(e){}
  if(!p)return;
  waCtx={pedId:id,nuevoE:'listo'};
  let usrs=[];try{const{data}=await sb.from('usuarios').select('nombre,telefono');if(data)usrs=data;}catch(e){}
  const u=usrs.find(x=>x.telefono===p.usuario_tel);
  document.getElementById('wa-msg').value=`¡Hola, ${u?u.nombre:'cliente'}! Su orden #${p.id} está lista para recoger en el local. Recuerde que tiene 15 minutos para pasar. ¡Le esperamos! 🥐`;
  document.getElementById('wa-num').textContent=p.usuario_tel.slice(0,4)+' '+p.usuario_tel.slice(4);
  abrirOv('ov-wa');
}

async function accNoDisp(id){
  let p=null;try{const{data}=await sb.from('pedidos').select('*').eq('id',id).single();p=data;}catch(e){}
  if(!p)return;
  waCtx={pedId:id,nuevoE:null,noDispIds:[]};
  document.getElementById('nodisp-lista').innerHTML=p.productos.map(pr=>`<label class="pcheck"><input type="checkbox" value="${pr.id}" style="width:auto;margin:0;width:16px;height:16px;accent-color:var(--cafe)"><span style="font-size:.87rem">${pr.nombre}</span></label>`).join('');
  abrirOv('ov-nodisp');
}

async function armarMsgNoDisp(){
  const checks=document.querySelectorAll('#nodisp-lista input:checked');
  if(!checks.length){toast('Seleccione al menos un producto');return;}
  let p=null;try{const{data}=await sb.from('pedidos').select('*').eq('id',waCtx.pedId).single();p=data;}catch(e){}if(!p)return;
  let usrs=[];try{const{data}=await sb.from('usuarios').select('nombre,telefono');if(data)usrs=data;}catch(e){}
  const u=usrs.find(x=>x.telefono===p.usuario_tel);const nom=u?u.nombre:'cliente';
  const sel=Array.from(checks).map(c=>{const pr=p.productos.find(x=>x.id==c.value);return pr?.nombre||'';}).filter(Boolean);
  waCtx.noDispIds=Array.from(checks).map(c=>parseInt(c.value));
  const todos=waCtx.noDispIds.length===p.productos.length;
  if(todos){waCtx.nuevoE='cancelado';document.getElementById('wa-msg').value=`¡Hola, ${nom}! Lamentablemente ninguno de los productos de su orden #${p.id} está disponible:\n\n- ${sel.join('\n- ')}\n\nPor esta razón, su orden ha sido cancelada. Disculpe los inconvenientes.`;}
  else{waCtx.nuevoE=null;document.getElementById('wa-msg').value=`¡Hola, ${nom}! Algunos productos de su orden #${p.id} no están disponibles:\n\n- ${sel.join('\n- ')}\n\n¿Desea proceder con el resto o prefiere cancelarla?`;}
  document.getElementById('wa-num').textContent=p.usuario_tel.slice(0,4)+' '+p.usuario_tel.slice(4);
  cerrarOvById('ov-nodisp');abrirOv('ov-wa');
}

async function accCancelar(id){
  let p=null;try{const{data}=await sb.from('pedidos').select('*').eq('id',id).single();p=data;}catch(e){}if(!p)return;
  let usrs=[];try{const{data}=await sb.from('usuarios').select('nombre,telefono');if(data)usrs=data;}catch(e){}
  const u=usrs.find(x=>x.telefono===p.usuario_tel);const nom=u?u.nombre:'cliente';
  waCtx={pedId:id,nuevoE:'cancelado'};
  document.getElementById('wa-msg').value=`¡Hola, ${nom}! Lamentablemente su orden #${p.id} fue cancelada. Si tiene consultas, puede comunicarse con nosotros. Disculpe los inconvenientes.`;
  document.getElementById('wa-num').textContent=p.usuario_tel.slice(0,4)+' '+p.usuario_tel.slice(4);
  abrirOv('ov-wa');
}

async function accEntregado(id){
  try{await cambiarEstado(id,'entregado');cerrarOvById('ov-admin-ped');renderAdminPedidos();toast('Orden marcada como entregada');}catch(e){toast('Error: '+e.message);}
}

async function doEnvioWA(){
  ld('btn-wa-send',true);
  try{
    const msg=document.getElementById('wa-msg').value;
    if(waCtx.nuevoE)await cambiarEstado(waCtx.pedId,waCtx.nuevoE);
    if(waCtx.noDispIds?.length){
      const{data:ped}=await sb.from('pedidos').select('productos').eq('id',waCtx.pedId).single();
      if(ped){const ps=ped.productos.map(pr=>({...pr,noDisponible:waCtx.noDispIds.includes(pr.id)?true:pr.noDisponible}));await sb.from('pedidos').update({productos:ps,updated_at:isoGT()}).eq('id',waCtx.pedId);}
    }
    if(waCtx.nuevoE==='listo')playReady();
    const{data:ped}=await sb.from('pedidos').select('usuario_tel').eq('id',waCtx.pedId).single();
    if(ped)window.open(`https://wa.me/502${ped.usuario_tel}?text=${encodeURIComponent(msg)}`,'_blank');
    cerrarOvById('ov-wa');cerrarOvById('ov-admin-ped');renderAdminPedidos();toast('WhatsApp abierto · estado actualizado');
  }catch(e){toast('Error: '+e.message);}
  ld('btn-wa-send',false);
}

// ── ADMIN HISTORIAL ──────────────────────────────────
async function renderAdminHistorial(){
  const lista=document.getElementById('admin-hist-lista');
  const q=((document.getElementById('hist-search')||{}).value||'').toLowerCase().trim();
  lista.innerHTML='<div class="ldwrap"><div class="sp"></div></div>';
  let all=[];let usrs=[];
  try{const{data}=await sb.from('pedidos').select('*').order('created_at',{ascending:false});if(data)all=data;}catch(e){}
  try{const{data}=await sb.from('usuarios').select('id,nombre,apellido,telefono');if(data)usrs=data;}catch(e){}
  if(q)all=all.filter(p=>{const u=usrs.find(x=>x.telefono===p.usuario_tel);return p.id.toLowerCase().includes(q)||(u&&(u.nombre.toLowerCase().includes(q)||u.apellido?.toLowerCase().includes(q)))||p.usuario_tel.includes(q);});
  if(!all.length){lista.innerHTML='<div class="empty"><i class="ti ti-history"></i><p>'+(q?'Sin resultados':'Sin órdenes aún')+'</p></div>';return;}
  lista.innerHTML=`<p style="font-size:.78rem;color:var(--texto-ms);margin-bottom:10px">${all.length} orden(es)</p>`+all.map(p=>{
    const u=usrs.find(x=>x.telefono===p.usuario_tel);
    const{hora,custom}=horaEstimada(p);
    return`<div class="hitem" style="cursor:pointer" onclick="verAdminPed('${p.id}')">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><div style="display:flex;align-items:center;gap:7px"><span style="font-weight:700;color:var(--cafe-dark)">#${p.id}</span>${estadoBadge(p.estado)}</div><span style="font-weight:700;color:var(--cafe-dark)">${fQ(p.total)}</span></div>
      <div style="font-size:.81rem;font-weight:500;color:var(--texto-s);margin-bottom:3px">${u?u.nombre+' '+(u.apellido||''):'Cliente'}</div>
      <div style="font-size:.75rem;color:var(--texto-ms);margin-bottom:4px">${fmtFecha(p.created_at)} · ${fmtHora(p.created_at)}</div>
      <div>${p.productos.map(pr=>`<span style="font-size:.73rem;color:var(--texto-s)">${pr.nombre} ×${pr.cantidad}</span>`).join(' · ')}</div>
      ${p.nota?`<div style="font-size:.73rem;color:var(--texto-ms);margin-top:4px;display:flex;align-items:center;gap:3px"><i class="ti ti-note" style="font-size:.8rem"></i>${p.nota}</div>`:''}
    </div>`;
  }).join('');
}

// ── ADMIN PRODUCTOS ──────────────────────────────────
async function renderAdminProductos(){
  const lista=document.getElementById('admin-prod-lista');
  lista.innerHTML='<div class="ldwrap"><div class="sp"></div></div>';
  await cargarProductos();
  const q=((document.getElementById('admin-prod-search')||{}).value||'').toLowerCase().trim();
  let ps=[...prods];
  if(q)ps=ps.filter(p=>p.nombre.toLowerCase().includes(q)||p.categoria.toLowerCase().includes(q)||(p.subcategoria||'').toLowerCase().includes(q));
  // Bloqueados al inicio
  ps.sort((a,b)=>(b.bloqueado?1:0)-(a.bloqueado?1:0));
  if(!ps.length){lista.innerHTML='<div class="empty"><i class="ti ti-bread"></i><p>'+(q?'Sin resultados':'Sin productos aún')+'</p></div>';return;}
  lista.innerHTML=ps.map(p=>`
    <div class="apcard" style="display:flex;align-items:center;gap:10px">
      <div style="width:40px;height:40px;border-radius:9px;background:var(--beige);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">
        ${p.imagen?`<img src="${p.imagen}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.innerHTML='<i class=\\'ti ${catIco(p.categoria)}\\' style=\\'font-size:1.1rem;color:var(--cafe-light)\\'></i>'">`:`<i class="ti ${catIco(p.categoria)}" style="font-size:1.1rem;color:var(--cafe-light)"></i>`}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.87rem;font-weight:500">${p.nombre}${p.bloqueado?'<span class="badge b-err" style="margin-left:4px;font-size:.64rem">Bloqueado</span>':''}${!prodEstaDisp(p)&&!p.bloqueado?'<span class="badge b-w" style="margin-left:4px;font-size:.64rem">No disp. ahora</span>':''}</div>
        <div style="font-size:.76rem;color:var(--texto-s)">${p.categoria}${p.subcategoria?' · '+p.subcategoria:''} · ${fQ(p.precio)}</div>
        ${p.extra?`<div style="font-size:.7rem;color:var(--av);margin-top:1px;display:flex;align-items:center;gap:2px"><i class="ti ti-clock" style="font-size:.72rem"></i>${p.extra}</div>`:''}
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0">
        <button class="btn-icon" style="width:34px;height:34px;color:${p.bloqueado?'var(--pel)':'var(--cafe-light)'}" onclick="toggleBlqProd(${p.id})" title="${p.bloqueado?'Desbloquear':'Bloquear'}"><i class="ti ti-${p.bloqueado?'lock-open':'lock'}" style="font-size:.9rem"></i></button>
        <button class="btn-icon" style="width:34px;height:34px" onclick="abrirFormProd(${p.id})"><i class="ti ti-edit" style="font-size:.9rem"></i></button>
        <button class="btn-icon" style="width:34px;height:34px;color:var(--pel)" onclick="elimProd(${p.id})"><i class="ti ti-trash" style="font-size:.9rem"></i></button>
      </div>
    </div>`).join('');
}

async function toggleBlqProd(id){
  const p=prods.find(x=>x.id===id);if(!p)return;
  try{await sb.from('productos').update({bloqueado:!p.bloqueado,updated_at:isoGT()}).eq('id',id);toast(p.bloqueado?'Producto desbloqueado':'Producto bloqueado');renderAdminProductos();}catch(e){toast('Error: '+e.message);}
}

async function elimProd(id){
  const p=prods.find(x=>x.id===id);
  confirm2(
    '¿Eliminar producto?',
    `"${p?.nombre||'Este producto'}" se eliminará permanentemente. Esta acción no se puede deshacer.`,
    '<i class="ti ti-trash"></i> Eliminar',
    async()=>{
      try{
        const{error}=await sb.from('productos').delete().eq('id',id);
        if(error)throw error;
        toast('Producto eliminado');
        renderAdminProductos();
      }catch(e){toast('Error: '+e.message);}
    },
    true
  );
}

// ── DROPDOWNS CATEGORÍA / SUBCATEGORÍA ──────────────
let catDDOpen=false,subcatDDOpen=false;
function toggleCatDD(){catDDOpen=!catDDOpen;apDDState('cat',catDDOpen);if(catDDOpen){renderDDOpts('cat',getCats(),'cat-opts','fp-cat');document.getElementById('cat-new-inp').value='';}}
function toggleSubcatDD(){subcatDDOpen=!subcatDDOpen;apDDState('subcat',subcatDDOpen);if(subcatDDOpen){renderDDOpts('subcat',getAllSubcats(),'subcat-opts','fp-subcat');document.getElementById('subcat-new-inp').value='';}}

function apDDState(tipo,open){
  const btn=document.getElementById(tipo+'-btn');const list=document.getElementById(tipo+'-ddlist');
  btn.classList.toggle('open',open);list.classList.toggle('open',open);
}
function renderDDOpts(tipo,opts,optsDivId,hiddenId){
  const sel=document.getElementById(hiddenId).value;
  document.getElementById(optsDivId).innerHTML=(tipo==='subcat'?'<div class="cdi" onclick="selDD(\'subcat\',\'\',\'fp-subcat\',\'subcat-btn-txt\')">Sin sub-categoría</div>':'')+opts.map(c=>`<div class="cdi${c===sel?' sel':''}" onclick="selDD('${tipo}','${c}','fp-${tipo==='cat'?'cat':'subcat'}','${tipo}-btn-txt')">${c}</div>`).join('');
}
function selDD(tipo,val,hiddenId,btnTxtId){
  document.getElementById(hiddenId).value=val;
  document.getElementById(btnTxtId).textContent=val||'Sin sub-categoría';
  document.getElementById(btnTxtId).style.color=val?'var(--texto)':'var(--texto-ms)';
  apDDState(tipo,false);if(tipo==='cat')catDDOpen=false;else subcatDDOpen=false;
}
function crearCatNueva(tipo){
  const inp=document.getElementById(tipo==='cat'?'cat-new-inp':'subcat-new-inp');
  const v=inp.value.trim();if(!v)return;
  selDD(tipo,v,`fp-${tipo==='cat'?'cat':'subcat'}`,`${tipo}-btn-txt`);
  inp.value='';
}
document.addEventListener('click',e=>{
  if(catDDOpen&&!document.querySelector('.cdw')?.contains(e.target)){catDDOpen=false;apDDState('cat',false);}
  if(subcatDDOpen){const dds=document.querySelectorAll('.cdw');let inside=false;dds.forEach(d=>{if(d.contains(e.target))inside=true;});if(!inside){subcatDDOpen=false;apDDState('subcat',false);}}
});

// ── BLOQUEO PROGRAMADO ──────────────────────────────
function addProgBlock(tipo){
  if(tipo==='dias'&&progBlocks.some(r=>r.tipo==='dias')){toast('Ya existe una regla de días. Edítala o elimínala.');return;}
  progBlocks.push(tipo==='dias'?{tipo:'dias',dias:[]}:{tipo:'horas',desde:'09:00',hasta:'18:00'});
  renderPB();
}
function renderPB(){
  const c=document.getElementById('pb-lista');if(!c)return;
  const dias=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  c.innerHTML=progBlocks.map((r,i)=>`
    <div class="pb-row">
      ${r.tipo==='dias'?`<div style="flex:1"><div style="font-size:.78rem;color:var(--texto-s);margin-bottom:6px">Días bloqueados:</div><div style="display:flex;gap:4px;flex-wrap:wrap">${dias.map((d,di)=>`<button onclick="toggleDia(${i},${di})" style="padding:3px 7px;border-radius:6px;border:1.5px solid var(--bordeF);background:${(r.dias||[]).includes(di)?'var(--cafe)':'var(--blanco)'};color:${(r.dias||[]).includes(di)?'#fff':'var(--cafe)'};font-size:.75rem;cursor:pointer">${d}</button>`).join('')}</div></div>`
      :`<div style="flex:1">
          <div style="font-size:.78rem;color:var(--texto-s);margin-bottom:6px">Rango de horas:</div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:.82rem">Desde:</span>
            <button class="btn btn-sm" onclick="abrirTpBlk(h=>{ progBlocks[${i}].desde=h;renderPB(); },'Hora inicio')" style="min-width:70px">${r.desde}</button>
            <span style="font-size:.82rem">Hasta:</span>
            <button class="btn btn-sm" onclick="abrirTpBlk(h=>{ progBlocks[${i}].hasta=h;renderPB(); },'Hora fin')" style="min-width:70px">${r.hasta}</button>
          </div>
        </div>`}
      <button onclick="progBlocks.splice(${i},1);renderPB()" style="width:28px;height:28px;border-radius:50%;border:none;background:var(--pelbg);color:var(--pel);cursor:pointer;flex-shrink:0;font-size:1rem;display:flex;align-items:center;justify-content:center"><i class="ti ti-x"></i></button>
    </div>`).join('');
}
function toggleDia(ri,di){const r=progBlocks[ri];if(!r.dias)r.dias=[];const i=r.dias.indexOf(di);if(i>=0)r.dias.splice(i,1);else r.dias.push(di);renderPB();}

function abrirFormProd(id){
  fpMode=id;catDDOpen=false;subcatDDOpen=false;progBlocks=[];
  if(id){
    const p=prods.find(x=>x.id===id);if(!p)return;
    document.getElementById('fprod-titulo').textContent='Editar producto';
    document.getElementById('fp-id').value=id;document.getElementById('fp-nombre').value=p.nombre;
    document.getElementById('fp-cat').value=p.categoria;document.getElementById('cat-btn-txt').textContent=p.categoria;document.getElementById('cat-btn-txt').style.color='var(--texto)';
    document.getElementById('fp-subcat').value=p.subcategoria||'';document.getElementById('subcat-btn-txt').textContent=p.subcategoria||'Sin sub-categoría';document.getElementById('subcat-btn-txt').style.color=p.subcategoria?'var(--texto)':'var(--texto-ms)';
    document.getElementById('fp-precio').value=p.precio;document.getElementById('fp-imagen').value=p.imagen||'';
    document.getElementById('fp-detalles').value=p.detalles||'';document.getElementById('fp-extra').value=p.extra||'';
    progBlocks=Array.isArray(p.bloqueo_prog)?JSON.parse(JSON.stringify(p.bloqueo_prog)):[];
  }else{
    document.getElementById('fprod-titulo').textContent='Agregar producto';
    ['fp-id','fp-nombre','fp-cat','fp-subcat','fp-precio','fp-imagen','fp-detalles','fp-extra'].forEach(x=>{const el=document.getElementById(x);if(el)el.value='';});
    document.getElementById('cat-btn-txt').textContent='Seleccionar categoría';document.getElementById('cat-btn-txt').style.color='var(--texto-ms)';
    document.getElementById('subcat-btn-txt').textContent='Sin sub-categoría';document.getElementById('subcat-btn-txt').style.color='var(--texto-ms)';
  }
  apDDState('cat',false);apDDState('subcat',false);renderPB();
  abrirOv('ov-form-prod');
}

async function guardarProducto(){
  const n=document.getElementById('fp-nombre').value.trim();
  const c=document.getElementById('fp-cat').value.trim();
  const pr=parseFloat(document.getElementById('fp-precio').value);
  const sc=document.getElementById('fp-subcat').value.trim();
  const img=document.getElementById('fp-imagen').value.trim();
  const det=document.getElementById('fp-detalles').value;
  const ext=document.getElementById('fp-extra').value.trim();
  if(!n||!c||isNaN(pr)){toast('Complete los campos obligatorios');return;}
  ld('btn-save-prod',true);
  try{
    const datos={nombre:n,categoria:c,subcategoria:sc||null,precio:pr,imagen:img,detalles:det,extra:ext,bloqueo_prog:progBlocks,updated_at:isoGT()};
    if(fpMode){
      const{error}=await sb.from('productos').update(datos).eq('id',fpMode);
      if(error)throw error;
      toast('Producto actualizado');
    }else{
      datos.created_at=isoGT();datos.bloqueado=false;datos.clicks_vista=0;datos.clicks_carrito=0;datos.clicks_orden=0;
      const{error}=await sb.from('productos').insert(datos);
      if(error)throw error;
      toast('Producto agregado');
    }
    cerrarOvById('ov-form-prod');await renderAdminProductos();renderFiltros();
  }catch(e){toast('Error: '+e.message);}
  ld('btn-save-prod',false);
}

// ── ADMIN USUARIOS ───────────────────────────────────
async function renderAdminUsrs(){
  const lista=document.getElementById('admin-usr-lista');
  lista.innerHTML='<div class="ldwrap"><div class="sp"></div></div>';
  let usrs=[];try{const{data}=await sb.from('usuarios').select('*').order('created_at',{ascending:false});if(data)usrs=data;}catch(e){}
  lista.innerHTML=`<p style="font-size:.78rem;color:var(--texto-ms);margin-bottom:9px">${usrs.length} cliente(s)</p>`+usrs.map(u=>{
    const advc=getAdvc(u);const cl=u.bloqueado?'uav-b':advc>0?'uav-w':'';
    return`<div class="urow" onclick="verAdminUsr('${u.telefono}')">
      <div class="uav ${cl}">${u.nombre[0]}${u.apellido?u.apellido[0]:''}</div>
      <div style="flex:1"><div style="font-size:.87rem;font-weight:500;display:flex;align-items:center;gap:5px">${u.nombre} ${u.apellido||''}${u.bloqueado?'<i class="ti ti-lock" style="font-size:.85rem;color:var(--pel)"></i>':''}${u.rol==='admin'?'<span class="badge b-i" style="font-size:.62rem">Admin</span>':''}</div><div style="font-size:.76rem;color:var(--cafe);display:flex;align-items:center;gap:3px"><i class="ti ti-phone" style="font-size:.8rem"></i>${u.telefono.slice(0,4)+' '+u.telefono.slice(4)}</div></div>
      <div style="text-align:right"><div style="font-size:.7rem;color:var(--texto-ms)">${fmtFecha(u.created_at)}</div>${advc?`<span class="badge b-err" style="margin-top:2px"><i class="ti ti-alert-triangle" style="font-size:.72rem"></i>${advc}</span>`:''}</div>
    </div>`;
  }).join('');
}

async function verAdminUsr(tel){
  let u=null;let peds=[];
  try{const{data}=await sb.from('usuarios').select('*').eq('telefono',tel).single();u=data;}catch(e){}if(!u)return;
  try{const{data}=await sb.from('pedidos').select('*').eq('usuario_tel',tel).order('created_at',{ascending:false});if(data)peds=data;}catch(e){}
  const advc=getAdvc(u);const telId=tel.replace(/\s/g,'');
  document.getElementById('admin-usr-det').innerHTML=`
    <div class="mhdr"><span class="mtitle">${u.nombre} ${u.apellido||''}</span><button class="closebtn" onclick="cerrarOvById('ov-admin-usr')"><i class="ti ti-x"></i></button></div>
    <div style="text-align:center;padding:0 0 14px">
      <div class="pavatar">${u.nombre[0]}${u.apellido?u.apellido[0]:''}</div>
      <div class="pnombre">${u.nombre} ${u.apellido||''}</div>
      <div class="ptel"><i class="ti ti-phone" style="font-size:.88rem"></i>${u.telefono.slice(0,4)+' '+u.telefono.slice(4)}</div>
      ${u.rol==='admin'?'<span class="badge b-i" style="margin-top:5px">Admin</span>':''}
    </div>
    ${u.bloqueado?`<div class="blk-bann"><i class="ti ti-lock"></i><div><p style="font-weight:600;margin-bottom:2px">Cuenta bloqueada</p><p>${u.msg_bloqueo||'Sin mensaje.'}</p></div></div>`:''}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0">
      <div class="rcrd"><div class="rcrd-n">${peds.length}</div><div class="rcrd-l">Órdenes</div></div>
      <div class="rcrd"><div class="rcrd-n">${advc}</div><div class="rcrd-l">Advertencias</div></div>
      <div class="rcrd"><div class="rcrd-n">${u.visitas||0}</div><div class="rcrd-l">Visitas</div></div>
    </div>
    ${u.direccion?`<div style="font-size:.84rem;color:var(--texto-s);margin-bottom:3px;display:flex;align-items:center;gap:5px"><i class="ti ti-map-pin" style="font-size:.92rem"></i>${u.direccion}</div>`:''}
    ${u.maps_link?`<a href="${u.maps_link}" target="_blank" style="font-size:.8rem;color:var(--cafe);display:flex;align-items:center;gap:4px;margin-bottom:8px;text-decoration:none"><i class="ti ti-external-link" style="font-size:.88rem"></i>Ver en Google Maps</a>`:''}
    <div style="font-size:.72rem;color:var(--texto-ms);margin-bottom:8px">Registro: ${fmtFecha(u.created_at)} · Última conexión: ${u.ultima_conexion?fmtFecha(u.ultima_conexion):'N/A'} · Clicks: ${u.clicks||0}</div>
    <div class="divider"></div>
    <div class="stitle" style="margin-bottom:8px">Gestión de cuenta</div>
    <div style="display:flex;gap:6px;margin-bottom:8px">
      <button class="btn btn-sm btn-danger" onclick="abrirAdvNota('${tel}')" style="flex:1"><i class="ti ti-alert-triangle"></i> Agregar advertencia</button>
      ${advc>0?`<button class="btn btn-sm" onclick="quitarAdv('${tel}')" style="flex:1"><i class="ti ti-minus"></i> Quitar advertencia</button>`:''}
    </div>
    ${advc>0&&Array.isArray(u.advertencias)?`<div style="margin-bottom:10px"><div class="stitle" style="margin-bottom:6px">Notas de advertencias</div>${u.advertencias.map((a,i)=>`<div style="font-size:.8rem;color:var(--texto-s);padding:5px 8px;background:var(--avbg);border-radius:6px;margin-bottom:4px"><span style="font-weight:600;color:var(--av)">#${i+1}</span>${a.nota?' — '+a.nota:' (sin nota)'}</div>`).join('')}</div>`:''}
    ${u.bloqueado
      ?`<button class="abtn" onclick="pedirDesbloquear('${tel}')"><i class="ti ti-lock-open" style="color:var(--ex)"></i> Desbloquear cuenta</button>`
      :`<button class="abtn danger" onclick="abrirFrmBlq('${telId}')"><i class="ti ti-lock"></i> Bloquear cuenta</button>`}
    <div id="frm-blq-${telId}" style="display:none;border:1px solid var(--borde);border-radius:10px;padding:12px;margin-bottom:8px">
      <div class="fg" style="margin-bottom:8px"><label>Mensaje para el usuario</label><textarea id="msg-blq-${telId}" placeholder="Ej: Múltiples incumplimientos" rows="2">${u.msg_bloqueo||''}</textarea></div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm" style="flex:1" onclick="document.getElementById('frm-blq-${telId}').style.display='none'">Cancelar</button>
        <button class="btn btn-sm btn-danger" style="flex:2" id="btn-blq-${telId}" onclick="bloquearUsr('${tel}','${telId}')"><span class="lbl"><i class="ti ti-lock"></i> Confirmar bloqueo</span><div class="bsp"></div></button>
      </div>
    </div>
    <div class="divider"></div>
    <div class="stitle" style="margin-bottom:8px">Historial</div>
    ${peds.map(p=>`<div class="hitem"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700;color:var(--cafe-dark)">#${p.id}</span>${estadoBadge(p.estado)}</div><div style="font-size:.78rem;color:var(--texto-s);margin-top:2px">${fQ(p.total)} · ${fmtFecha(p.created_at)}</div><div style="margin-top:4px">${p.productos.map(pr=>`<span style="font-size:.73rem;color:var(--texto-s)">${pr.nombre} ×${pr.cantidad}</span>`).join(' · ')}</div></div>`).join('')||'<p style="font-size:.84rem;color:var(--texto-ms)">Sin órdenes</p>'}
  `;
  abrirOv('ov-admin-usr');
}

function abrirAdvNota(tel){advTel=tel;const i=document.getElementById('adv-nota');if(i)i.value='';abrirOv('ov-adv-nota');}
async function confirmarAdv(){
  const{data}=await sb.from('usuarios').select('advertencias').eq('telefono',advTel).single();
  const adv=Array.isArray(data?.advertencias)?[...data.advertencias]:[];
  const nota=(document.getElementById('adv-nota')||{}).value?.trim()||'';
  adv.push({nota,fecha:isoGT()});
  ld('btn-adv-ok',true);
  try{await sb.from('usuarios').update({advertencias:adv,updated_at:isoGT()}).eq('telefono',advTel);cerrarOvById('ov-adv-nota');toast('Advertencia agregada');verAdminUsr(advTel);}catch(e){toast('Error: '+e.message);}
  ld('btn-adv-ok',false);
}
async function quitarAdv(tel){
  const{data}=await sb.from('usuarios').select('advertencias').eq('telefono',tel).single();
  const adv=Array.isArray(data?.advertencias)?[...data.advertencias]:[];
  if(adv.length>0)adv.pop();
  try{await sb.from('usuarios').update({advertencias:adv,updated_at:isoGT()}).eq('telefono',tel);toast('Advertencia eliminada');verAdminUsr(tel);}catch(e){toast('Error: '+e.message);}
}
function abrirFrmBlq(telId){const f=document.getElementById('frm-blq-'+telId);if(f)f.style.display=f.style.display==='none'?'block':'none';}
async function bloquearUsr(tel,telId){
  const msg=(document.getElementById('msg-blq-'+telId)||{}).value?.trim()||'';
  ld('btn-blq-'+telId,true);
  try{await sb.from('usuarios').update({bloqueado:true,msg_bloqueo:msg,updated_at:isoGT()}).eq('telefono',tel);toast('Cuenta bloqueada');verAdminUsr(tel);}catch(e){toast('Error: '+e.message);}
  ld('btn-blq-'+telId,false);
}
function pedirDesbloquear(tel){
  confirm2('¿Desbloquear cuenta?','El usuario podrá volver a realizar pedidos.','Desbloquear',async()=>{
    try{await sb.from('usuarios').update({bloqueado:false,updated_at:isoGT()}).eq('telefono',tel);toast('Cuenta desbloqueada');verAdminUsr(tel);}catch(e){toast('Error: '+e.message);}
  });
}

// ── ADMIN CONFIG ─────────────────────────────────────
async function renderAdminCfg(){
  await cargarCfg();
  const fb=cfg.funciones_bloqueadas||{};
  document.getElementById('admin-cfg-content').innerHTML=`
    <div class="fg"><label>Teléfono de la tienda</label><input type="text" id="cfg-tel" value="${cfg.telefono_tienda||''}"></div>
    <div class="fg"><label>Términos adicionales</label><textarea id="cfg-term" rows="4">${cfg.terminos_extra||''}</textarea></div>
    <div class="divider"></div>
    <div class="stitle" style="margin-bottom:10px">Descripción de estados</div>
    ${['pendiente','confirmado','listo','entregado','cancelado'].map(k=>`<div class="fg"><label>${k}</label><input type="text" id="cfg-e-${k}" value="${(cfg.estados_info||{})[k]||''}"></div>`).join('')}
    <div class="divider"></div>
    <div class="stitle" style="margin-bottom:4px">Funciones de usuarios</div>
    <p style="font-size:.78rem;color:var(--texto-ms);margin-bottom:10px">Al activar, el usuario verá un mensaje y no podrá usar esa función.</p>
    ${[['realizar_pedidos','Realizar pedidos'],['hora_recogida','Hora de recogida'],['pedido_domicilio','Pedido a domicilio'],['nota_pedido','Nota para la panadería']].map(([k,l])=>`<div class="trow"><span class="tlbl">${l}</span><label class="tswitch"><input type="checkbox" id="tog-${k}" ${fb[k]?'checked':''} onchange="saveFnBlq('${k}',this.checked)"><span class="tslider"></span></label></div>`).join('')}
    <button class="btn btn-primary" style="width:100%;margin-top:14px" id="btn-save-cfg" onclick="guardarCfgAdmin()"><span class="lbl"><i class="ti ti-device-floppy"></i> Guardar configuración</span><div class="bsp"></div></button>
  `;
}

async function saveFnBlq(k,v){const fb={...(cfg.funciones_bloqueadas||{})};fb[k]=v;await saveCfg('funciones_bloqueadas',fb);}

async function guardarCfgAdmin(){
  ld('btn-save-cfg',true);
  try{
    const tel=document.getElementById('cfg-tel').value.replace(/\D/g,'');
    const term=document.getElementById('cfg-term').value;
    const estados={};['pendiente','confirmado','listo','entregado','cancelado'].forEach(k=>{const el=document.getElementById('cfg-e-'+k);if(el)estados[k]=el.value;});
    await saveCfg('telefono_tienda',tel);await saveCfg('terminos_extra',term);await saveCfg('estados_info',estados);
    actTerminos();toast('Configuración guardada');
  }catch(e){toast('Error: '+e.message);}
  ld('btn-save-cfg',false);
}
