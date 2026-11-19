// ═══════════════════════════════════════════════════════════════════════════
// MYSHELF — app.js
// Casca visual = "preview" (estante/cortiça/cartão de leitor).
// Motor = repositório (PocketBase + OAuth, Goodreads/BiblioReads, lookupISBN
// multi-fonte, sessões de leitura, scanner USB/BT, import/export).
// ═══════════════════════════════════════════════════════════════════════════

// ── DELEGAÇÃO DE EVENTOS (substitui todos os onclick inline) ───────────────
// Um único listener despacha cliques com base em data-action / data-id / data-arg.
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!e.target.closest('.account-wrap') || (el && el.closest('.account-menu') && el.dataset.action!=='setAmbiente')) closeAccountMenu();
  if (!el) return;
  const a = el.dataset.action;
  const id = el.dataset.id;
  const id2 = el.dataset.id2;
  const arg = el.dataset.arg;
  const idx = el.dataset.idx;
  switch(a){
    // Sem argumentos
    case 'applyBulkDelete': return applyBulkDelete();
    case 'applyBulkLib': return applyBulkLib();
    case 'applyBulkStatus': return applyBulkStatus();
    case 'closeCameraScan': return closeCameraScan();
    case 'closeModal': return closeModal();
    case 'confirmAdd': return confirmAdd();
    case 'confirmManualAdd': return confirmManualAdd();
    case 'copyShareLink': return copyShareLink();
    case 'createCollection': return createCollection();
    case 'createShareLink': return createShareLink();
    case 'exportCSV': return exportCSV();
    case 'focusScan': return focusScan();
    case 'gotoALer': return gotoALer();
    case 'gotoAdd': return gotoAdd();
    case 'loadJSON': return loadJSON();
    case 'logout': return logout();
    case 'manualQtyDec': return manualQtyDec();
    case 'manualQtyInc': return manualQtyInc();
    case 'openCameraScan': return openCameraScan();
    case 'openImport': return openImport();
    case 'openReadingPanel': return openReadingPanel();
    case 'pauseReadingSession': return pauseReadingSession();
    case 'runImport': return runImport();
    case 'runWishImport': return runWishImport();
    case 'saveJSON': return saveJSON();
    case 'saveNewWish': return saveNewWish();
    case 'toggleWishForm': return toggleWishForm();
    case 'toggleWishImport': return toggleWishImport();
    case 'saveReadingProgress': return saveReadingProgress();
    case 'searchIsbn': return searchIsbn();
    case 'searchTitulo': return searchTitulo();
    case 'stopReadingSession': return stopReadingSession(true);
    case 'toggleBulkMode': return toggleBulkMode();
    // ID único
    case 'abrirEnriquecimento': return abrirEnriquecimento(id);
    case 'advanceWish': return advanceWish(id);
    case 'confirmDelete': return confirmDelete(id);
    case 'deleteCollection': return deleteCollection(id);
    case 'deleteWish': return deleteWish(id);
    case 'doDelete': return doDelete(id);
    case 'handleReadingBtn': return handleReadingBtn(id);
    case 'openEditModal': return openEditModal(id);
    case 'openLendModal': return openLendModal(id);
    case 'openModal': return openModal(id);
    case 'returnBook': return returnBook(id);
    case 'revokeShareLink': return revokeShareLink(id);
    case 'setWishTab': return setWishTab(id);
    case 'toggleBulkSelect': return toggleBulkSelect(id);
    // Elemento + argumento
    case 'doLogin': return doLogin(e);
    case 'setAddMode': return setAddMode(el, arg);
    case 'setFilter': return setFilter(el, arg || '');
    case 'setNav': return setNav(el, arg);
    case 'toggleBt': return toggleBt(el);
    case 'toggleTheme': return toggleTheme(el);
    case 'toggleAccountMenu': return toggleAccountMenu();
    case 'setCatalogView': return setCatalogView(arg);
    case 'setShelfSort': return setShelfSort(arg);
    case 'setAmbiente': return setAmbiente(arg);
    // Argumento (sem elemento)
    case 'setLoanTab': return setLoanTab(arg);
    case 'calPrev': return calMove(-1);
    case 'calNext': return calMove(1);
    case 'editGoal': return editGoal();
    case 'saveGoal': return saveGoal();
    case 'openAdmin': return openAdmin();
    case 'gotoWishImport': return gotoWishImport();
    case 'adminSec': return setAdminSec(arg);
    case 'toggleInvite': return toggleInvite(el.dataset.id);
    case 'removeInvite': return removeInvite(el.dataset.id);
    case 'checkDone': return checkDone(arg);
    case 'runHealth': return runHealth();
    case 'updateReadingPages': return updateReadingPages(+arg);
    // Dois IDs
    case 'reopenLoan': return reopenLoan(id, id2);
    case 'returnLoan': return returnLoan(id, id2);
    // Índice numérico
    case 'confirmTituloAdd': return confirmTituloAdd(+idx);
  }
});
// Imagens com erro de carregamento: remove-as (substitui onerror="this.remove()")
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.remove(); }, true);

// Submits (substitui onsubmit inline) — data-onsubmit + data-id no <form>.
document.addEventListener('submit', e => {
  const el = e.target.closest('[data-onsubmit]');
  if (!el) return;
  const id = el.dataset.id;
  switch(el.dataset.onsubmit){
    case 'saveEdit': return saveEdit(e, id);
    case 'confirmLend': return confirmLend(e, id);
    case 'confirmEnrich': return confirmEnrich(e, id);
    case 'saveGoal': e.preventDefault(); return saveGoal();
    case 'sendInvite': e.preventDefault(); return sendInvite();
  }
});
// Input (substitui oninput inline) — data-oninput no elemento.
document.addEventListener('input', e => {
  const el = e.target.closest('[data-oninput]');
  if (!el) return;
  switch(el.dataset.oninput){
    case 'resetIsbnSearch': return resetIsbnSearch();
    case 'resetTituloSearch': return resetTituloSearch();
    case 'previewManualCover': return previewManualCover();
  }
});
// Enter a submeter (substitui onkeydown inline) — data-enter reaproveita as
// mesmas acções do dispatcher de clique acima.
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const el = e.target.closest('[data-enter]');
  if (!el) return;
  switch(el.dataset.enter){
    case 'searchIsbn': return searchIsbn();
    case 'searchTitulo': return searchTitulo();
    case 'createCollection': return createCollection();
  }
});

// ── CONFIG ─────────────────────────────────────────────────────────────────
const PB_URL = (location.protocol === 'http:' || location.protocol === 'https:')
  ? ''                            // mesmo domínio, Nginx faz proxy
  : 'http://localhost:8090';      // fallback dev offline (file://)
const PB_TIMEOUT = 2500;
const AUTH_REQUIRED = (location.protocol === 'http:' || location.protocol === 'https:');
// Scanner por câmara: só em browsers com BarcodeDetector nativo (Chrome/Edge Android
// e desktop). Sem polyfill/lib externa de propósito — sem isto, o botão fica oculto
// e continua a haver o leitor USB/Bluetooth.
const CAMERA_SCAN_SUPPORTED = ('BarcodeDetector' in window) && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

// ── AUTH STORE (token PocketBase, gestão manual) ───────────────────────────
const AUTH = {
  TOKEN_KEY:'pb_auth_token', USER_KEY:'pb_auth_user',
  STATE_KEY:'pb_oauth_state', VERIFIER_KEY:'pb_oauth_verifier',
  get token(){ return localStorage.getItem(this.TOKEN_KEY) || ''; },
  set token(v){ v ? localStorage.setItem(this.TOKEN_KEY, v) : localStorage.removeItem(this.TOKEN_KEY); },
  get user(){ try { return JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'); } catch { return null; } },
  set user(u){ u ? localStorage.setItem(this.USER_KEY, JSON.stringify(u)) : localStorage.removeItem(this.USER_KEY); },
  get isValid(){ return !!this.token && !!this.user; },
  clear(){ this.token=null; this.user=null; sessionStorage.removeItem(this.STATE_KEY); sessionStorage.removeItem(this.VERIFIER_KEY); },
  authHeader(){ return this.token ? { 'Authorization':`Bearer ${this.token}` } : {}; }
};

let usePocketBase = false;
let unsavedChanges = false;

// ── ESTADO EM MEMÓRIA (cache para render síncrono, como no preview) ────────
const STATE = { books:[], libs:[], wish:[], loans:[], share:null };
let activeFilter = '';
let bulkMode = false;
let bulkSelected = new Set();
let currentView  = 'catalogo';
let loanTab      = 'ativos';
let wishTab      = 'desejado';

// ═══════════════════════════════════════════════════════════════════════════
// DATA LAYER (PocketBase + fallback localStorage) — do repositório
// ═══════════════════════════════════════════════════════════════════════════
async function checkPB(){
  try{
    const ctrl=new AbortController();
    const tid=setTimeout(()=>ctrl.abort(),PB_TIMEOUT);
    const r=await fetch(`${PB_URL}/api/health`,{signal:ctrl.signal});
    clearTimeout(tid);
    if(r.ok){ usePocketBase=true; return true; }
  }catch(_){}
  usePocketBase=false; return false;
}

const PB={
  async req(method,path,body){
    const headers={'Content-Type':'application/json',...AUTH.authHeader()};
    const opts={method,headers,signal:AbortSignal.timeout(8000)};
    if(body) opts.body=JSON.stringify(body);
    const r=await fetch(`${PB_URL}/api/collections/${path}`,opts);
    if(r.status===401){ AUTH.clear(); if(AUTH_REQUIRED) location.reload(); }
    if(!r.ok) throw new Error(`PB ${r.status}`);
    return r.json();
  },
  async getAll(col){ const d=await PB.req('GET',`${col}/records?perPage=500&sort=-created`); return d.items||[]; },
  async create(col,data){ return PB.req('POST',`${col}/records`,data); },
  async update(col,id,data){ return PB.req('PATCH',`${col}/records/${id}`,data); },
  async remove(col,id){ await fetch(`${PB_URL}/api/collections/${col}/records/${id}`,{method:'DELETE',headers:AUTH.authHeader(),signal:AbortSignal.timeout(8000)}); }
};

const LOCAL={
  get(k){ try{ return JSON.parse(localStorage.getItem(k)||'[]'); }catch{ return []; }},
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); unsavedChanges=true; } catch(e){ if(e.name==='QuotaExceededError') showToast('Armazenamento cheio'); } },
  uid(){ return 'L'+Date.now()+Math.random().toString(36).slice(2,7); },
  getBooks(){ return LOCAL.get('books'); }, getLibs(){ return LOCAL.get('libs'); }, getWish(){ return LOCAL.get('wish'); }, getLoans(){ return LOCAL.get('loans'); },
  addBook(d){ const b=[...LOCAL.getBooks(),{...d,id:LOCAL.uid(),created:new Date().toISOString()}]; LOCAL.set('books',b); return b[b.length-1]; },
  updateBook(id,d){ LOCAL.set('books',LOCAL.getBooks().map(x=>x.id===id?{...x,...d,updated:new Date().toISOString()}:x)); },
  deleteBook(id){ LOCAL.set('books',LOCAL.getBooks().filter(x=>x.id!==id)); },
  addLib(d){ const b=[...LOCAL.getLibs(),{...d,id:LOCAL.uid()}]; LOCAL.set('libs',b); return b[b.length-1]; },
  updateLib(id,d){ LOCAL.set('libs',LOCAL.getLibs().map(x=>x.id===id?{...x,...d}:x)); },
  deleteLib(id){ LOCAL.set('libs',LOCAL.getLibs().filter(x=>x.id!==id)); },
  addWish(d){ const b=[...LOCAL.getWish(),{...d,id:LOCAL.uid()}]; LOCAL.set('wish',b); return b[b.length-1]; },
  updateWish(id,d){ LOCAL.set('wish',LOCAL.getWish().map(x=>x.id===id?{...x,...d}:x)); },
  deleteWish(id){ LOCAL.set('wish',LOCAL.getWish().filter(x=>x.id!==id)); },
  addLoan(d){ const b=[...LOCAL.getLoans(),{...d,id:LOCAL.uid(),created:new Date().toISOString()}]; LOCAL.set('loans',b); return b[b.length-1]; },
  updateLoan(id,d){ LOCAL.set('loans',LOCAL.getLoans().map(x=>x.id===id?{...x,...d,updated:new Date().toISOString()}:x)); },
};

// Carimba o dono (utilizador autenticado) nos registos criados na PocketBase.
// Em modo local (single-user) não carimba. Campos owner inexistentes no schema
// são ignorados pela PocketBase, por isso é seguro aplicar a todas as coleções.
function withOwner(d){ return (usePocketBase && AUTH.user && AUTH.user.id) ? Object.assign({}, d, {owner:AUTH.user.id}) : d; }

// Verdadeiro se a última criação (addBook/addWish) chegou mesmo ao PocketBase.
// Falso quando caiu para o fallback local — usado para o toast não mentir
// (ver saveToast()). Causa raiz do "os livros não estão a ser guardados":
// um erro do PocketBase (ex.: campo obrigatório em falta) era engolido em
// silêncio e a UI mostrava sempre "✓ adicionado", mesmo só a guardar local.
let lastSaveRemote=true;

// ── OFFLINE: cache de leitura + fila de sincronização (só para "books") ────
// Âmbito reduzido a livros de propósito — é o caso de uso real (adicionar um
// livro sem rede, ex. numa livraria). Coleções/wishlist/empréstimos continuam
// só de leitura offline (o pedido cai para LOCAL como já acontecia).
// "Rede indisponível" (guardar para sincronizar depois) é distinto de "o
// PocketBase respondeu com erro" (validação/permissões — repetir não resolve):
// PB.req lança Error('PB <status>') só no segundo caso.
function isNetworkError(e){ return !(e && e.message && e.message.startsWith('PB ')); }
function offRead(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch{ return []; } }
function offWrite(key,v){ try{ localStorage.setItem(key,JSON.stringify(v)); }catch(e){ if(e.name==='QuotaExceededError') showToast('Armazenamento cheio'); } }
const OFF_CACHE_KEY='biblio_offline_cache_books';
const OFF_OUTBOX_KEY='biblio_offline_outbox_books';
function isTempId(id){ return typeof id==='string' && id.startsWith('tmp_'); }
function newTempId(){ return 'tmp_'+Date.now()+Math.random().toString(36).slice(2,8); }
function outboxAdd(op){ const o=offRead(OFF_OUTBOX_KEY); o.push(op); offWrite(OFF_OUTBOX_KEY,o); }
// Aplica a fila pendente sobre a última lista real conhecida, para a estante
// mostrar sempre algo coerente (marcados com _pending, para a UI avisar).
function mergeOffline(remoteList){
  const outbox=offRead(OFF_OUTBOX_KEY);
  if(!outbox.length) return remoteList;
  let result=remoteList.slice();
  for(const op of outbox){
    if(op.type==='add') result.push(Object.assign({},op.data,{id:op.tempId,_pending:true}));
    else if(op.type==='update') result=result.map(b=>b.id===op.targetId?Object.assign({},b,op.data,{_pending:true}):b);
    else if(op.type==='delete') result=result.filter(b=>b.id!==op.targetId);
  }
  return result;
}
let offlineSyncing=false;
async function syncOfflineOutbox(){
  if(!usePocketBase || offlineSyncing) return;
  const outbox=offRead(OFF_OUTBOX_KEY);
  if(!outbox.length) return;
  offlineSyncing=true;
  const remaining=[]; let synced=0;
  for(const op of outbox){
    try{
      if(op.type==='add') await PB.create('books',op.data);
      else if(op.type==='update') await PB.update('books',op.targetId,op.data);
      else if(op.type==='delete') await PB.remove('books',op.targetId);
      synced++;
    }catch(e){
      if(isNetworkError(e)) remaining.push(op); // continua sem rede, tenta depois
      // erro de validação/permissão: descarta — repetir não ia resolver.
    }
  }
  offWrite(OFF_OUTBOX_KEY,remaining);
  offlineSyncing=false;
  if(synced){
    showToast(synced===1?'1 livro sincronizado com o servidor':synced+' livros sincronizados com o servidor');
    unsavedChanges=true; await loadAll(); if(currentView==='catalogo') buildShelves();
  }
}
window.addEventListener('online', ()=>{ syncOfflineOutbox(); });

const DB={
  async getBooks(){
    if(usePocketBase){
      try{
        const remote=await PB.getAll('books');
        offWrite(OFF_CACHE_KEY,remote);
        syncOfflineOutbox(); // não bloqueia a leitura; refresca a estante sozinho se sincronizar algo
        return mergeOffline(remote);
      }catch{ return mergeOffline(offRead(OFF_CACHE_KEY)); }
    }
    return LOCAL.getBooks();
  },
  // Coleções/wishlist/empréstimos: só cache de leitura offline (sem fila de
  // escrita — editar isto sem rede continua a cair no LOCAL como antes).
  async getLibs(){  if(usePocketBase){try{const r=await PB.getAll('libraries');offWrite('biblio_offline_cache_libs',r);return r;}catch{return offRead('biblio_offline_cache_libs');}} return LOCAL.getLibs(); },
  async getWish(){  if(usePocketBase){try{const r=await PB.getAll('wishlist');offWrite('biblio_offline_cache_wish',r);return r;}catch{return offRead('biblio_offline_cache_wish');}} return LOCAL.getWish(); },
  async getLoans(){ if(usePocketBase){try{const r=await PB.getAll('loans');offWrite('biblio_offline_cache_loans',r);return r;}catch{return offRead('biblio_offline_cache_loans');}} return LOCAL.getLoans(); },
  async addBook(d){
    const data={quantity:1,...d}; // "quantity" é obrigatório no PocketBase (migração add_quantity) — sem isto o create falhava sempre
    // Já tens este ISBN (mesmo pendente de sincronizar)? Soma à quantidade em vez de duplicar.
    if(data.isbn){
      const dup=STATE.books.find(b=>b.isbn&&b.isbn===data.isbn);
      if(dup){
        const quantity=(dup.quantity||1)+(data.quantity||1);
        await DB.updateBook(dup.id,{quantity});
        return Object.assign({},dup,{quantity,_merged:true});
      }
    }
    if(usePocketBase){
      const owned=withOwner(data);
      try{ const r=await PB.create('books',owned); lastSaveRemote=true; return r; }
      catch(e){
        if(isNetworkError(e)){
          // Sem rede (não é erro de validação): fica na fila, sincroniza quando voltar a rede.
          lastSaveRemote=false;
          const tempId=newTempId();
          outboxAdd({type:'add',tempId,data:owned});
          return Object.assign({},owned,{id:tempId,_pending:true});
        }
        console.warn('[DB] addBook falhou no PocketBase, a guardar só localmente:',e);
        lastSaveRemote=false; return LOCAL.addBook(data);
      }
    }
    lastSaveRemote=false; return LOCAL.addBook(data);
  },
  async updateBook(id,d){
    // Fase 4: regista a data de fim quando o livro passa a «lido» (sem apagar uma data já existente).
    // Se a PocketBase ainda não tiver o campo (migração por aplicar), o campo é simplesmente ignorado.
    if(d&&d.status==='lido'){
      const cur=byId(id);
      if(!cur||(cur.status!=='lido'&&!cur.finishedAt)) d=Object.assign({},d,{finishedAt:new Date().toISOString()});
    }
    if(isTempId(id)){
      // Ainda não existe no servidor: atualiza a própria operação 'add' pendente.
      const o=offRead(OFF_OUTBOX_KEY).map(op=>(op.type==='add'&&op.tempId===id)?Object.assign({},op,{data:Object.assign({},op.data,d)}):op);
      offWrite(OFF_OUTBOX_KEY,o);
      return;
    }
    if(usePocketBase){
      try{ return await PB.update('books',id,d); }
      catch(e){
        if(isNetworkError(e)){ outboxAdd({type:'update',targetId:id,data:d}); return; }
        return LOCAL.updateBook(id,d);
      }
    }
    return LOCAL.updateBook(id,d);
  },
  async deleteBook(id){
    if(isTempId(id)){
      offWrite(OFF_OUTBOX_KEY, offRead(OFF_OUTBOX_KEY).filter(op=>!(op.type==='add'&&op.tempId===id)));
      return;
    }
    if(usePocketBase){
      try{ await PB.remove('books',id); return; }
      catch(e){ if(isNetworkError(e)){ outboxAdd({type:'delete',targetId:id}); return; } }
      return;
    }
    LOCAL.deleteBook(id);
  },
  async addLib(d){ if(usePocketBase){try{return await PB.create('libraries',withOwner(d));}catch{return LOCAL.addLib(d);}} return LOCAL.addLib(d); },
  async updateLib(id,d){ if(usePocketBase){try{return await PB.update('libraries',id,d);}catch{return LOCAL.updateLib(id,d);}} return LOCAL.updateLib(id,d); },
  async deleteLib(id){ if(usePocketBase){try{await PB.remove('libraries',id);return;}catch{}} LOCAL.deleteLib(id); },
  async addWish(d){
    if(usePocketBase){
      try{ const r=await PB.create('wishlist',withOwner(d)); lastSaveRemote=true; return r; }
      catch(e){ console.warn('[DB] addWish falhou no PocketBase, a guardar só localmente:',e); lastSaveRemote=false; return LOCAL.addWish(d); }
    }
    lastSaveRemote=false; return LOCAL.addWish(d);
  },
  async updateWish(id,d){ if(usePocketBase){try{return await PB.update('wishlist',id,d);}catch{return LOCAL.updateWish(id,d);}} return LOCAL.updateWish(id,d); },
  async deleteWish(id){ if(usePocketBase){try{await PB.remove('wishlist',id);return;}catch{}} LOCAL.deleteWish(id); },
  async addLoan(d){ if(usePocketBase){try{return await PB.create('loans',withOwner(d));}catch{return LOCAL.addLoan(d);}} return LOCAL.addLoan(d); },
  async updateLoan(id,d){ if(usePocketBase){try{return await PB.update('loans',id,d);}catch{return LOCAL.updateLoan(id,d);}} return LOCAL.updateLoan(id,d); },
  // Link público de partilha da coleção (só existe com PocketBase — não faz
  // sentido em modo local/demo, não há servidor para responder ao link).
  async getMyShare(){ if(!usePocketBase) return null; try{ const l=await PB.getAll('shares'); return l[0]||null; }catch{ return null; } },
  async createShare(){ const token=crypto.randomUUID(); return PB.create('shares',withOwner({token,active:true})); },
  async deleteShare(id){ try{ await PB.remove('shares',id); }catch{} },
};

// ═══════════════════════════════════════════════════════════════════════════
// GOODREADS via BiblioReads (self-hosted) — do repositório
// ═══════════════════════════════════════════════════════════════════════════
const BIBLIOREADS_PROXY = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '') return 'http://localhost:3000';
  return '/api/goodreads';   // produção: Nginx encaminha para o BiblioReads
})();
let biblioReadsDisponivel = false;

async function verificarBiblioReads(){
  if (!BIBLIOREADS_PROXY) { biblioReadsDisponivel = false; return; }
  try {
    const controller = new AbortController();
    setTimeout(()=>controller.abort(), 3000);
    const r = await fetch(BIBLIOREADS_PROXY, { method:'HEAD', signal:controller.signal });
    biblioReadsDisponivel = r.ok || r.status === 405;
  } catch { biblioReadsDisponivel = false; }
}

async function pesquisarGoodreadsPorISBN(query){
  if (!biblioReadsDisponivel || !query) return null;
  try {
    const controller = new AbortController();
    setTimeout(()=>controller.abort(), 6000);
    const queryURL = `https://www.goodreads.com/search?q=${encodeURIComponent(query)}`;
    const resposta = await fetch(`${BIBLIOREADS_PROXY}/api/search/books`, {
      method:'POST', headers:{ 'Content-Type':'application/json','Accept':'application/json' },
      body: JSON.stringify({ queryURL }), signal: controller.signal
    });
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    const primeiro = dados.result?.[0];
    if (!primeiro?.bookURL) return null;
    return `https://www.goodreads.com${primeiro.bookURL}`;
  } catch (err) { console.warn('Pesquisa Goodreads falhou:', err.message); return null; }
}

async function enriquecerComGoodreads(goodreadsUrl){
  if(!goodreadsUrl || typeof goodreadsUrl !== 'string') throw new Error('URL Goodreads inválido');
  const urlLimpo = goodreadsUrl.trim();
  if(!urlLimpo.match(/goodreads\.com\/(book|work)\/show\//)) throw new Error('Não é um URL de livro Goodreads válido.');
  const controller = new AbortController();
  const timeoutId = setTimeout(()=>controller.abort(), 8000);
  try{
    const resposta = await fetch(`${BIBLIOREADS_PROXY}/api/book-scraper`,{
      method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({queryURL: urlLimpo}), signal: controller.signal
    });
    clearTimeout(timeoutId);
    if(!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
    return normalizarDadosGoodreads(await resposta.json());
  }catch(err){
    clearTimeout(timeoutId);
    if(err.name === 'AbortError') throw new Error('Pedido demorou mais de 8 segundos');
    throw err;
  }
}

function normalizarDadosGoodreads(d){
  const parseNum=(s)=>{ if(s==null) return null; const n=parseInt(String(s).replace(/[^\d]/g,''),10); return isNaN(n)?null:n; };
  const parseDec=(s)=>{ if(s==null) return null; const n=parseFloat(s); return isNaN(n)?null:n; };
  const matchId=(d.scrapeURL||'').match(/\/show\/(\d+)/);
  const goodreadsId=matchId?matchId[1]:(d.legacyBookID||null);
  const autores=Array.isArray(d.author)?d.author:[];
  const autorPrincipal=autores.find(a=>a.role==='Author')?.name||autores[0]?.name||null;
  let paginas=null, formato=null;
  if(d.bookEdition){
    const m=d.bookEdition.match(/(\d+)\s*pages?/i); if(m) paginas=parseInt(m[1],10);
    const partes=d.bookEdition.split(',').map(s=>s.trim()); if(partes.length>1) formato=partes[partes.length-1];
  }
  return {
    goodreadsId: goodreadsId?String(goodreadsId):null,
    goodreadsUrl: d.scrapeURL||null,
    titulo: d.title||null, autorPrincipal,
    sinopse: d.desc||null, capa: d.cover||null,
    serie: d.series?{ nome:d.series, posicao:d.seriesPosition||null }:null,
    classificacao: parseDec(d.rating), numAvaliacoes: parseNum(d.ratingCount),
    numCriticas: parseNum(d.reviewsCount),
    generos: Array.isArray(d.genres)?d.genres:[],
    paginas, formato, editora: d.publisher||null, dataPublicacao: d.publishDate||null, idioma: d.language||null,
    distribuicaoEstrelas: d.reviewBreakdown?{
      1:parseNum(d.reviewBreakdown.rating1), 2:parseNum(d.reviewBreakdown.rating2),
      3:parseNum(d.reviewBreakdown.rating3), 4:parseNum(d.reviewBreakdown.rating4),
      5:parseNum(d.reviewBreakdown.rating5),
    }:null,
    enriquecidoEm: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PESQUISA ISBN multi-fonte (Goodreads → OpenLibrary → Google Books → PORBASE)
// ═══════════════════════════════════════════════════════════════════════════
async function lookupISBN(raw){
  const isbn=raw.replace(/[^0-9X]/gi,'');
  if(!isbn||isbn.length<10) return null;
  const extrairAno=(s)=>{ if(!s) return ''; const m=String(s).match(/\b(19|20)\d{2}\b/); return m?m[0]:''; };
  const enriquecerBasicos=async(dados)=>{
    if(!biblioReadsDisponivel||!dados) return dados;
    if(dados.goodreadsData) return dados;
    try{
      const query=`${dados.title||''} ${dados.author||''}`.trim(); if(!query) return dados;
      const url=await pesquisarGoodreadsPorISBN(query); if(!url) return dados;
      const enriched=await enriquecerComGoodreads(url);
      dados.goodreadsUrl=url; dados.goodreadsData=enriched; dados.goodreadsEnrichedAt=enriched.enriquecidoEm;
      if(!dados.cover&&enriched.capa) dados.cover=enriched.capa;
      if(!dados.pagesTotal&&enriched.paginas) dados.pagesTotal=enriched.paginas;
    }catch(err){ console.warn('Fallback Goodreads (título+autor) falhou:',err.message); }
    return dados;
  };
  if(biblioReadsDisponivel){
    try{
      const goodreadsUrl=await pesquisarGoodreadsPorISBN(isbn);
      if(goodreadsUrl){
        const e=await enriquecerComGoodreads(goodreadsUrl);
        return { isbn, title:e.titulo||'', author:e.autorPrincipal||'', publisher:e.editora||'',
          year:extrairAno(e.dataPublicacao), cover:e.capa||'', pagesTotal:e.paginas||null,
          goodreadsUrl, goodreadsData:e, goodreadsEnrichedAt:e.enriquecidoEm };
      }
    }catch(err){ console.warn('Goodreads por ISBN falhou:',err.message); }
  }
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),8000);
  try{
    const r1=await fetch(`https://openlibrary.org/search.json?isbn=${isbn}&fields=title,author_name,publisher,first_publish_year,cover_i,number_of_pages_median,language&limit=1`,{signal:ctrl.signal});
    const d1=await r1.json(); const bk=(d1.docs||[])[0];
    if(bk){
      clearTimeout(tid);
      const langCode=(bk.language||[])[0];
      const langMap={por:'PT',eng:'EN',fre:'FR',fra:'FR',spa:'ES',ger:'DE',deu:'DE',ita:'IT'};
      const dados={ isbn, title:bk.title||'', author:(bk.author_name||[]).join(', '),
        publisher:(bk.publisher||[])[0]||'', year:bk.first_publish_year?String(bk.first_publish_year):'',
        cover:bk.cover_i?`https://covers.openlibrary.org/b/id/${bk.cover_i}-L.jpg`:'',
        pagesTotal:bk.number_of_pages_median||null, lang:langMap[langCode]||'' };
      return await enriquecerBasicos(dados);
    }
  }catch{}
  try{
    const r2=await fetch(`/api/google-books?q=isbn:${isbn}`,{signal:ctrl.signal});
    const d2=await r2.json();
    if(d2.totalItems>0){
      clearTimeout(tid); const v=d2.items[0].volumeInfo;
      const dados={ isbn, title:v.title||'', author:(v.authors||[]).join(', '), publisher:v.publisher||'',
        year:v.publishedDate?extrairAno(v.publishedDate):'',
        cover:v.imageLinks?v.imageLinks.thumbnail.replace('http://','https://'):'' };
      return await enriquecerBasicos(dados);
    }
  }catch{}
  try{
    const bk=await lookupPorbase(isbn,ctrl.signal);
    if(bk){ clearTimeout(tid); return await enriquecerBasicos(bk); }
  }catch{}
  clearTimeout(tid); return null;
}

async function lookupPorbase(isbn,signal){
  const res=await fetch(`/api/porbase?id=${isbn}`,{signal});
  if(!res.ok) return null;
  const xml=await res.text();
  if(!xml||/Registo inexistente/i.test(xml)) return null;
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.getElementsByTagName('parsererror').length) return null;
  const all=t=>Array.from(doc.getElementsByTagName(t)).map(n=>(n.textContent||'').trim()).filter(Boolean);
  // A PORBASE marca o artigo a ignorar na ordenação com «?» (perde-se a marca
  // original): «?A ?menina do mar» → «A menina do mar». Um «?» no fim de uma
  // palavra («Quem sou eu?») fica.
  const semMarcas=s=>s.replace(/(^|\s)\?(?=[^\s?])/g,'$1');
  const titles=all('dc:title').map(semMarcas); if(!titles.length) return null;
  const pubs=all('dc:publisher'); const ids=all('dc:identifier');
  const img=ids.find(s=>/ImagesBN|rnod/i.test(s));
  const clean=s=>{let x=s.replace(/,\s*\d{3,4}\s*-\s*\d{0,4}\s*$/,'').trim();const m=x.match(/^([^,]+),\s*(.+)$/);return m?`${m[2]} ${m[1]}`.trim():x;};
  return { isbn, title:titles[0], author:all('dc:creator').map(clean).join(', '),
    publisher:pubs[0]||'', year:(all('dc:date')[0]||'').match(/\d{4}/)?.[0]||'',
    cover:img?img.replace(/^http:/,'https:'):'' };
}

async function searchByText(q){
  if(!q||q.length<3) return [];
  const ctrl=new AbortController(); setTimeout(()=>ctrl.abort(),8000);
  try{
    const r=await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8&fields=title,author_name,isbn,publisher,first_publish_year,cover_i`,{signal:ctrl.signal});
    const d=await r.json();
    return (d.docs||[]).map(doc=>({title:doc.title||'',author:(doc.author_name||[]).join(', '),isbn:doc.isbn?doc.isbn[0]:'',publisher:(doc.publisher||[])[0]||'',year:doc.first_publish_year?String(doc.first_publish_year):'',cover:doc.cover_i?`https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`:''}));
  }catch{
    try{
      const r2=await fetch(`/api/google-books?q=${encodeURIComponent(q)}&maxResults=8`);
      const d2=await r2.json();
      return (d2.items||[]).map(item=>{ const v=item.volumeInfo; return {title:v.title||'',author:(v.authors||[]).join(', '),isbn:v.industryIdentifiers?(v.industryIdentifiers[0]?.identifier||''):'',publisher:v.publisher||'',year:v.publishedDate?v.publishedDate.slice(0,4):'',cover:v.imageLinks?v.imageLinks.thumbnail.replace('http://','https://'):''} });
    }catch{}
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS gerais
// ═══════════════════════════════════════════════════════════════════════════
function $(id){ return document.getElementById(id); }
function escHtml(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s){ return escHtml(s).replace(/"/g,'&quot;'); }
function pct(b){ return b.pages && b.pagesRead ? Math.round(b.pagesRead/b.pages*100) : 0; }
function fmtDate(iso){ if(!iso) return ''; const p=String(iso).slice(0,10).split('-'); return p.length===3 ? `${p[2]}/${p[1]}/${p[0]}` : iso; }
function daysAgo(d){ if(!d) return 0; return Math.floor((Date.now()-new Date(d).getTime())/86400000); }
function parseTags(v){ if(!v) return []; if(Array.isArray(v)) return v; try{ return JSON.parse(v); }catch{ return String(v).split(',').map(s=>s.trim()).filter(Boolean); } }

let toastTimer=null;
function showToast(msg){
  let t=$('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; t.setAttribute('role','status'); t.setAttribute('aria-live','polite'); document.body.appendChild(t); }
  t.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
  t.querySelector('span').textContent=msg;
  void t.offsetWidth; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2600);
}

// Toast usado depois de um addBook/addWish — avisa quando a gravação caiu
// para o fallback local (usePocketBase=true não garante que o create passou).
function saveToast(msg,merged){ if(merged) msg='Já tinhas este livro — quantidade aumentada'; showToast(lastSaveRemote?msg:msg+' ⚠️ só local (falhou no servidor)'); }

// ── MAPEAMENTO repo→preview ────────────────────────────────────────────────
const COVER_COLORS=['navy','brown','terra','gold','burg','slate','moss','rust','plum','olive','teal','forest','steel','wine','indigo','rose','sage'];
function colorFor(b){
  const key=String(b.id||b.isbn||b.title||'');
  let h=0; for(let i=0;i<key.length;i++) h=(h*31+key.charCodeAt(i))>>>0;
  return COVER_COLORS[h%COVER_COLORS.length];
}
// Estado do repo (nao-lido/a-ler/lido) → prateleira do preview (para-ler/a-ler/lido)
function shelfStatus(b){ return b.status==='lido'?'lido' : b.status==='a-ler'?'a-ler' : 'para-ler'; }
// Goodreads do repo (contagens 1..5) → histograma do preview (percentagens 5→1)
function grFromBook(b){
  const g=b.goodreadsData; if(!g) return null;
  const avg=g.classificacao!=null?Number(g.classificacao):null;
  const reviews=g.numAvaliacoes!=null?Number(g.numAvaliacoes):0;
  let dist=null;
  if(g.distribuicaoEstrelas){
    const c=g.distribuicaoEstrelas;
    const tot=[1,2,3,4,5].reduce((s,k)=>s+(c[k]||0),0);
    if(tot>0) dist=[5,4,3,2,1].map(k=>Math.round((c[k]||0)/tot*100));
  }
  if(avg==null && !dist) return null;
  return { avg:avg!=null?avg:0, reviews, dist:dist||[0,0,0,0,0] };
}
// Normaliza um livro do repo para o formato que os renderizadores do preview esperam
function normBook(b){
  return Object.assign({}, b, {
    color: b.color || colorFor(b),
    pages: parseInt(b.pagesTotal||b.pages||0)||0,
    pagesRead: parseInt(b.pagesRead||0)||0,
    _shelf: shelfStatus(b),
    synopsis: (b.goodreadsData&&b.goodreadsData.sinopse) || b.synopsis || '',
    gr: b.gr || grFromBook(b),
    dateAdded: b.dateAdded || (b.goodreadsEnrichedAt ? fmtDate(b.goodreadsEnrichedAt) : (b.added?fmtDate(b.added):'')),
  });
}

// ── CACHE / RECARGA ────────────────────────────────────────────────────────
function byId(id){ return STATE.books.find(b=>b.id===id); }
async function loadAll(){
  let [books,libs,wish,loans,share]=await Promise.all([DB.getBooks(),DB.getLibs(),DB.getWish(),DB.getLoans(),DB.getMyShare()]);
  // Isolamento por utilizador: na PocketBase, mostra só os registos do dono.
  // 'books' e 'loans' têm campo owner no schema → filtram já. 'libraries' e
  // 'wishlist' só filtram depois de lhes adicionares o campo owner (ver nota).
  if(usePocketBase && AUTH.user && AUTH.user.id){
    const uid=AUTH.user.id;
    books = books.filter(b=>b.owner===uid);
    loans = loans.filter(l=>l.owner===uid);
    if(libs.some(x=>'owner' in x)) libs = libs.filter(x=>x.owner===uid);
    if(wish.some(x=>'owner' in x)) wish = wish.filter(x=>x.owner===uid);
  }
  STATE.books = books.map(normBook);
  STATE.share = share;
  STATE.libs  = libs;
  STATE.wish  = wish;
  STATE.loans = loans;
  refreshALerCount();
  renderFilterChips();
}
// Recarrega e volta a desenhar a vista actual
async function refresh(){ await loadAll(); rerender(); }
function rerender(){
  const fn = VIEWS[currentView] || buildShelves;
  fn();
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER — CATÁLOGO (estante de cortiça)
// ═══════════════════════════════════════════════════════════════════════════
const CATS=[
  {key:'a-ler',label:'A ler'},
  {key:'lido',label:'Lidos'},
  {key:'para-ler',label:'Para ler'},
];

function coverFace(b){
  const t=escHtml(b.title||''); const a=escHtml(b.author||'');
  const initial=escHtml((b.title||'?').trim().charAt(0).toUpperCase());
  const src=b.cover||'';
  const img=src?`<img class="cover-photo" src="${escAttr(src)}" alt="Capa de ${escAttr(b.title||'')}" loading="lazy">`:'';
  return `<div class="cover-face c-${b.color}">
      <div class="cover-fallback">
        <div class="cf-top"><span class="cf-mono">${initial}</span></div>
        <div class="cf-strip"><span class="cf-t">${t}</span><span class="cf-a">${a}</span></div>
      </div>${img}
    </div>`;
}
function bookItemHtml(b){
  const pipCls=b._shelf==='a-ler'?'pip-lendo':b._shelf==='lido'?'pip-lido':'pip-para';
  const progress=b._shelf==='a-ler'&&b.pagesRead?`<div class="cover-progress" style="width:${pct(b)}%"></div>`:'';
  const lent=b.lent?'<span class="cover-lent" title="Emprestado" aria-hidden="true"></span>':'';
  const qty=(b.quantity&&b.quantity>1)?`<span class="cover-qty" title="${b.quantity} exemplares" aria-label="${b.quantity} exemplares">×${b.quantity}</span>`:'';
  const pending=b._pending?'<span class="cover-pending" title="Por sincronizar (sem rede)" aria-label="Por sincronizar">⏳</span>':'';
  if(bulkMode){
    const checked=bulkSelected.has(b.id);
    return `<div class="cover-pin${checked?' cover-selected':''}" data-action="toggleBulkSelect" data-id="${b.id}" role="button" tabindex="0" aria-pressed="${checked}"
      aria-label="${escAttr(b.title||'')}, ${escAttr(b.author||'')}" title="${escAttr((b.title||'')+' — '+(b.author||''))}">
      <span class="cover-tack" aria-hidden="true"></span>
      ${coverFace(b)}
      <span class="cover-pip ${pipCls}" aria-hidden="true"></span>${progress}${lent}${qty}${pending}
      <span class="cover-check" aria-hidden="true">${checked?'✓':''}</span>
    </div>`;
  }
  return `<div class="cover-pin" data-action="openModal" data-id="${b.id}" role="button" tabindex="0"
    aria-label="${escAttr(b.title||'')}, ${escAttr(b.author||'')}" title="${escAttr((b.title||'')+' — '+(b.author||''))}">
    <span class="cover-tack" aria-hidden="true"></span>
    ${coverFace(b)}
    <span class="cover-pip ${pipCls}" aria-hidden="true"></span>${progress}${lent}${qty}${pending}
  </div>`;
}
function buildShelf(books,label,idx,active){
  const cells=books.length?books.map(bookItemHtml).join(''):`<div class="cork-empty">Nenhum livro nesta prateleira</div>`;
  const cls=['cork-section']; if(active) cls.push('is-active');
  const n=books.length;
  return `<section class="${cls.join(' ')}" style="animation-delay:${idx*0.08}s">
    <div class="board cork-wall">
      <div class="cork-tag"><h2 class="cork-tag-name">${label}</h2><span class="cork-tag-count">${n} ${n===1?'livro':'livros'}</span></div>
      <div class="cork-grid">${cells}</div>
    </div>
  </section>`;
}
function buildShelves(){
  currentView='catalogo';
  const q=($('search-input')?.value||'').toLowerCase();
  let all=STATE.books;
  if(q) all=all.filter(b=>(b.title||'').toLowerCase().includes(q)||(b.author||'').toLowerCase().includes(q)||(b.isbn||'').toLowerCase().includes(q));

  // Determinar conjunto + título conforme o filtro activo
  let filtered=all, title='Todos';
  if(activeFilter && activeFilter.indexOf('col:')===0){
    const libId=activeFilter.slice(4);
    const lib=STATE.libs.find(l=>l.id===libId);
    title=lib?((lib.icon?lib.icon+' ':'')+lib.name):'Coleção';
    filtered=all.filter(b=>b.library===libId);
  } else if(activeFilter){
    title=CATS.find(c=>c.key===activeFilter)?.label||'';
    filtered=all.filter(b=>b._shelf===activeFilter);
  }

  filtered=sortBooks(filtered);
  // Cabeçalho ÚNICO em todos os casos (incluindo "Todos")
  let html=`<div class="shelf-context"><h2 class="shelf-title">${escHtml(title)} <span class="shelf-count">· ${filtered.length} ${filtered.length===1?'livro':'livros'}</span></h2>
    <button type="button" class="bulk-toggle" data-action="toggleBulkMode">${bulkMode?'Cancelar seleção':'Selecionar'}</button>${catalogControls()}</div>`;
  if(!filtered.length){
    html+=`<div class="shelf-empty"><p class="shelf-empty-t">Esta prateleira ainda espera pelo primeiro livro.</p>
      <p>${activeFilter||q?'Nenhum livro corresponde a este filtro ou pesquisa.':'Adiciona o primeiro em «Adicionar».'}</p></div>`;
  } else if(catalogView==='estante'){
    html+=buildBookcase(filtered);
  } else {
    html+=buildShelf(filtered,title,0,true);
  }
  if(bulkMode) html+=bulkBarHtml();

  $('main').innerHTML='<h1 class="sr-only">A minha estante</h1>'+html;
  document.querySelectorAll('.cover-pin').forEach(el=>{
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); } });
  });
}
// ═══════════════════════════════════════════════════════════════════════════
// ESTANTE (Fase 3) — lombadas em prateleiras, com decoração por ambiente.
// A vista "Quadro" (cortiça, acima) continua disponível como alternativa.
// ═══════════════════════════════════════════════════════════════════════════
const lsGet=(k,d)=>{ try{ return localStorage.getItem(k)||d; }catch{ return d; } };
const lsSet=(k,v)=>{ try{ localStorage.setItem(k,v); }catch{} };
let catalogView = lsGet('catalogView','estante');   // 'estante' | 'quadro'
let shelfSort   = lsGet('shelfSort','nenhuma');     // 'nenhuma' | 'cor' | 'altura' | 'autor'
const COVER_HEX={navy:'#1c3358',sage:'#364f38',terra:'#7a3010',gold:'#6a4c10',burg:'#5a1522',slate:'#283848',moss:'#2e4a22',rust:'#6e2810',plum:'#401650',olive:'#3e4412',teal:'#143e46',brown:'#4a2e10',indigo:'#1e204a',rose:'#5e1828',forest:'#1a3a1a',wine:'#4a0e1c',steel:'#1e2a36'};
function hexHue(hex){
  const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn; if(!d) return 0;
  const h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4; return (h*60+360)%360;
}
function sortBooks(list){
  const surname=a=>(a||'').trim().split(/\s+/).pop()||'';
  if(shelfSort==='cor')    return [...list].sort((x,y)=>hexHue(COVER_HEX[x.color]||'#000')-hexHue(COVER_HEX[y.color]||'#000'));
  if(shelfSort==='altura') return [...list].sort((x,y)=>(y.pages||0)-(x.pages||0));
  if(shelfSort==='autor')  return [...list].sort((x,y)=>surname(x.author).localeCompare(surname(y.author),'pt'));
  return list;
}
function setCatalogView(v){ catalogView=(v==='quadro')?'quadro':'estante'; lsSet('catalogView',catalogView); buildShelves(); }
function setShelfSort(v){ shelfSort=['cor','altura','autor'].includes(v)?v:'nenhuma'; lsSet('shelfSort',shelfSort); buildShelves(); }
function shelfStatusLabel(b){ return b._shelf==='a-ler'?'A ler':b._shelf==='lido'?'Lido':'Para ler'; }
function shelfAria(b){
  return `${b.title||'Sem título'}, ${b.author||'autor desconhecido'} — ${shelfStatusLabel(b)}`
    +(b.quantity>1?`, ${b.quantity} exemplares`:'')+(b.lent?', emprestado':'')+(b._pending?', por sincronizar':'');
}
function spineHtml(b){
  const p=Math.min((b.pages||300)/1000,1);                     // sem nº de páginas → altura média
  const h=Math.round(176+p*68), w=Math.round(48+p*28);
  const sel=bulkMode&&bulkSelected.has(b.id);
  const act=bulkMode?'toggleBulkSelect':'openModal';
  const pip=b._shelf==='a-ler'?'pip-lendo':b._shelf==='lido'?'pip-lido':'pip-para';
  return `<div class="slot"><button type="button" class="spine c-${b.color||'navy'}${sel?' is-selected':''}" style="--h:${h};--w:${w}"
      data-action="${act}" data-id="${b.id}" ${bulkMode?`aria-pressed="${sel}"`:''} aria-label="${escAttr(shelfAria(b))}" title="${escAttr((b.title||'')+' — '+(b.author||''))}">
    ${b._shelf==='a-ler'?'<span class="spine-ribbon" aria-hidden="true"></span>':''}
    <span class="spine-band" aria-hidden="true"></span>
    <span class="spine-lbl" aria-hidden="true"><span>${escHtml(b.title||'Sem título')}</span></span>
    <span class="spine-pip ${pip}" aria-hidden="true"></span>
    ${b.quantity>1?`<span class="spine-badge spine-qty" aria-hidden="true">×${b.quantity}</span>`:''}
    ${b._pending?'<span class="spine-badge spine-pending" aria-hidden="true">⏳</span>':''}
    ${b.lent?'<span class="spine-lent" aria-hidden="true"></span>':''}
    ${sel?'<span class="spine-check" aria-hidden="true">✓</span>':''}
  </button></div>`;
}
function faceoutHtml(b){
  const act=bulkMode?'toggleBulkSelect':'openModal';
  const sel=bulkMode&&bulkSelected.has(b.id);
  return `<div class="slot"><button type="button" class="faceout${sel?' is-selected':''}" data-action="${act}" data-id="${b.id}"
      ${bulkMode?`aria-pressed="${sel}"`:''} aria-label="${escAttr(shelfAria(b))}" title="${escAttr((b.title||'')+' — '+(b.author||''))}">
    ${coverFace(b)}${b._pending?'<span class="spine-badge spine-pending" aria-hidden="true">⏳</span>':''}${sel?'<span class="spine-check" aria-hidden="true">✓</span>':''}
  </button></div>`;
}
const SHELF_DECOR=[
  `<svg class="deco" width="58" height="96" viewBox="0 0 58 96" aria-hidden="true"><path d="M29 60C20 40 6 38 4 22c10 2 20 12 25 30 3-22 10-40 24-48 0 18-10 34-22 52 6-12 16-18 26-18-4 12-14 18-28 22z" fill="#4f7a4a"/><path d="M12 60h34l-5 34H17z" fill="#b5653a"/><path d="M10 58h38v6H10z" fill="#9a5230"/></svg>`,
  `<svg class="deco" width="40" height="92" viewBox="0 0 40 92" aria-hidden="true"><ellipse cx="20" cy="18" rx="10" ry="16" fill="#ffcf73" opacity=".35"/><path d="M20 6c4 6 5 10 0 16-5-6-4-10 0-16z" fill="#ffb84d"/><rect x="11" y="24" width="18" height="60" rx="2" fill="#f4ead6"/><rect x="5" y="84" width="30" height="6" rx="2" fill="#a07a3a"/></svg>`,
  `<svg class="deco" width="74" height="78" viewBox="0 0 74 78" aria-hidden="true"><path d="M14 78c-8 0-10-10-4-16 2-14 8-24 18-28l-2-14 8 8h10l8-8-2 14c6 4 10 12 10 22 0 8-4 14-10 16 8-2 14 2 14 6H14z" fill="#2b221c"/><circle cx="36" cy="34" r="2" fill="#e8c35a"/><circle cx="46" cy="34" r="2" fill="#e8c35a"/></svg>`,
  `<svg class="deco" width="30" height="86" viewBox="0 0 30 86" aria-hidden="true"><path d="M2 86V30C2 12 28 12 28 30v56z" fill="#a8843f"/><path d="M6 86V34c0-12 18-12 18 0v52z" fill="#c9a24f"/></svg>`,
  `<svg class="deco" width="96" height="66" viewBox="0 0 96 66" aria-hidden="true"><rect x="4" y="44" width="88" height="20" rx="2" fill="#6b3030"/><rect x="10" y="26" width="76" height="18" rx="2" fill="#2f4f5e"/><rect x="2" y="10" width="84" height="16" rx="2" fill="#94591f"/><rect x="12" y="49" width="40" height="9" fill="#f6efdc"/><rect x="18" y="30" width="34" height="9" fill="#f6efdc"/><rect x="8" y="14" width="38" height="8" fill="#f6efdc"/></svg>`,
];
function buildBookcase(books){
  let html='',di=0;
  books.forEach((b,i)=>{
    if(i>0&&i%7===0){ html+=`<div class="slot slot-decor">${SHELF_DECOR[di%SHELF_DECOR.length]}</div>`; di++; }
    html+=(shelfSort==='nenhuma'&&!bulkMode&&i%9===4)?faceoutHtml(b):spineHtml(b);
  });
  html+=`<div class="slot slot-decor">${SHELF_DECOR[(di+1)%SHELF_DECOR.length]}</div>`;
  const lights=Array.from({length:18},(_,i)=>`<span style="left:${3+i*5.4}%;top:${12+Math.sin(i/17*Math.PI)*6}px;animation-delay:${(i%5)*.6}s"></span>`).join('');
  return `<div class="room"><div class="room-lights" aria-hidden="true">${lights}</div>
    <div class="bookcase"><div class="shelf-row">${html}</div></div>
    <div class="room-floor" aria-hidden="true"></div></div>`;
}
function catalogControls(){
  const seg=(items,cur,act)=>items.map(([v,l])=>`<button type="button" aria-pressed="${v===cur}" data-action="${act}" data-arg="${v}">${l}</button>`).join('');
  // No telemóvel ficam recolhidos atrás de «Ordenar e vista» (no computador estão sempre abertos)
  const wide=window.matchMedia&&matchMedia('(min-width:701px)').matches;
  const resumo=`${catalogView==='estante'?'Estante':'Quadro'} · ${{nenhuma:'Sem ordem',cor:'Cor',altura:'Altura',autor:'Autor'}[shelfSort]}`;
  return `<details class="cat-more" ${wide||catMoreOpen?'open':''}>
    <summary>Ordenar e vista <span class="cat-more-now">${resumo}</span></summary>
    <div class="cat-controls">
    <div class="cat-group" role="group" aria-label="Vista"><span class="cat-label">Vista</span><div class="cat-seg">${seg([['estante','Estante'],['quadro','Quadro']],catalogView,'setCatalogView')}</div></div>
    <div class="cat-group" role="group" aria-label="Ordenar"><span class="cat-label">Ordenar</span><div class="cat-seg">${seg([['nenhuma','Sem ordem'],['cor','Cor'],['altura','Altura'],['autor','Autor']],shelfSort,'setShelfSort')}</div></div>
  </div></details>`;
}
let catMoreOpen=false;   // lembra se ficou aberto no telemóvel enquanto se muda a ordem
document.addEventListener('toggle',e=>{ if(e.target.classList&&e.target.classList.contains('cat-more')) catMoreOpen=e.target.open; },true);
function bulkBarHtml(){
  const n=bulkSelected.size;
  const libOpts=STATE.libs.map(l=>`<option value="${l.id}">${escHtml((l.icon?l.icon+' ':'')+l.name)}</option>`).join('');
  return `<div class="bulk-bar" id="bulk-bar">
    <span class="bulk-count">${n} selecionado${n===1?'':'s'}</span>
    <select id="bulk-status" ${n?'':'disabled'}>
      <option value="">Mudar estado…</option>
      <option value="nao-lido">Por ler</option><option value="a-ler">A ler</option><option value="lido">Lido</option>
    </select>
    <button type="button" data-action="applyBulkStatus" ${n?'':'disabled'}>Aplicar</button>
    <select id="bulk-lib" ${n?'':'disabled'}>
      <option value="">Mudar coleção…</option>${libOpts}
    </select>
    <button type="button" data-action="applyBulkLib" ${n?'':'disabled'}>Aplicar</button>
    <button type="button" class="danger" data-action="applyBulkDelete" ${n?'':'disabled'}>Apagar</button>
  </div>`;
}
function toggleBulkMode(){
  bulkMode=!bulkMode; bulkSelected=new Set();
  buildShelves();
}
function toggleBulkSelect(id){
  if(bulkSelected.has(id)) bulkSelected.delete(id); else bulkSelected.add(id);
  buildShelves();
}
async function applyBulkStatus(){
  const status=$('bulk-status')?.value; if(!status||!bulkSelected.size) return;
  for(const id of bulkSelected) await DB.updateBook(id,{status});
  unsavedChanges=true; bulkMode=false; bulkSelected=new Set(); await loadAll(); buildShelves();
  showToast('Estado atualizado');
}
async function applyBulkLib(){
  const library=$('bulk-lib')?.value; if(!library||!bulkSelected.size) return;
  for(const id of bulkSelected) await DB.updateBook(id,{library});
  unsavedChanges=true; bulkMode=false; bulkSelected=new Set(); await loadAll(); buildShelves();
  showToast('Coleção atualizada');
}
async function applyBulkDelete(){
  if(!bulkSelected.size) return;
  if(!confirm(`Apagar ${bulkSelected.size} livro(s)? Não é possível desfazer.`)) return;
  for(const id of bulkSelected) await DB.deleteBook(id);
  unsavedChanges=true; bulkMode=false; bulkSelected=new Set(); await loadAll(); buildShelves();
  showToast('Livros apagados');
}
function setFilter(btn,status){
  if(currentView!=='catalogo'){   // vindo das Coleções («Ver na estante»)
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    const cat=document.querySelector('.nav-btn'); if(cat) cat.classList.add('active');
    currentView='catalogo'; const fb=document.querySelector('.filter-bar'); if(fb) fb.style.display='';
    window.scrollTo({top:0});
  }
  activeFilter=status;
  renderFilterChips();
  buildShelves();
}
// Reconstrói a barra de filtros: estados + uma chip por coleção
function renderFilterChips(){
  const bar=document.querySelector('.filter-bar'); if(!bar) return;
  const status=[['','Todos'],['a-ler','A ler'],['lido','Lidos'],['para-ler','Para ler']];
  let html=status.map(([k,l])=>`<button class="fchip${activeFilter===k?' active':''}" data-action="setFilter" data-arg="${k}">${l}</button>`).join('');
  if(STATE.libs.length){
    html+=`<span class="fchip-sep" aria-hidden="true"></span>`;
    html+=STATE.libs.map(l=>{
      const key='col:'+l.id;
      return `<button class="fchip fchip-col${activeFilter===key?' active':''}" data-action="setFilter" data-arg="${key}">${escHtml((l.icon?l.icon+' ':'')+l.name)}</button>`;
    }).join('');
  }
  bar.innerHTML=html;
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER — FICHA DO LIVRO (modal)
// ═══════════════════════════════════════════════════════════════════════════
function starHTML(n){ return Array.from({length:5},(_,i)=>`<span class="${i<n?'filled':''}">★</span>`).join(''); }
let lastFocusedEl=null;

function openModal(id){
  const b=byId(id); if(!b) return;
  const p=pct(b);
  const statusLabel=b._shelf==='a-ler'?'A ler':b._shelf==='lido'?'Lido':'Para ler';
  const badgeCls=b._shelf==='a-ler'?'mb-lendo':b._shelf==='lido'?'mb-lido':'mb-para';
  const GR_LABELS=['★★★★★','★★★★','★★★','★★','★'];
  const grRefresh=`<button type="button" class="gr-refresh" data-action="abrirEnriquecimento" data-id="${b.id}">${b.goodreadsData?'Atualizar':'Enriquecer'}</button>`;
  const grHTML=b.gr?`
    <div class="gr-block">
      <div class="gr-header"><span class="gr-title">Goodreads ${grRefresh}</span>
        <div class="gr-avg"><span class="gr-avg-num">${b.gr.avg?b.gr.avg.toFixed(2):'—'}</span><span class="gr-avg-sub">· ${Number(b.gr.reviews||0).toLocaleString('pt-PT')} avaliações</span></div>
      </div>
      ${b.gr.dist.map((d,i)=>`<div class="gr-row"><span class="gr-star-lbl">${GR_LABELS[i]}</span><div class="gr-bar-track"><div class="gr-bar-fill" style="width:${d}%"></div></div><span class="gr-bar-pct">${d}%</span></div>`).join('')}
    </div>`:'';
  // Sem dados Goodreads → linha discreta para enriquecer
  const enrichLine=(!b.goodreadsData)
    ? `<div class="enrich-line"><button type="button" class="gr-refresh" data-action="abrirEnriquecimento" data-id="${b.id}">Enriquecer com Goodreads</button></div>` : '';
  // Coleção / localização do livro
  const lib=STATE.libs.find(l=>l.id===b.library);
  const libLabel=lib?escHtml((lib.icon?lib.icon+' ':'')+lib.name):'—';
  const metaItems=[
    b.publisher?`<div><div class="meta-item-label">Editora</div><div class="meta-item-value">${escHtml(b.publisher)}</div></div>`:'',
    b.isbn?`<div><div class="meta-item-label">ISBN</div><div class="meta-item-value meta-item-mono">${escHtml(b.isbn)}</div></div>`:'',
    b.lang?`<div><div class="meta-item-label">Língua</div><div class="meta-item-value">${b.lang==='PT'?'Português':escHtml(b.lang)}</div></div>`:'',
    b.pages?`<div><div class="meta-item-label">Páginas</div><div class="meta-item-value">${Number(b.pages).toLocaleString('pt-PT')}</div></div>`:'',
    `<div><div class="meta-item-label">Coleção</div><div class="meta-item-value">${libLabel}</div></div>`,
    (b.quantity&&b.quantity>1)?`<div><div class="meta-item-label">Exemplares</div><div class="meta-item-value">${b.quantity}</div></div>`:'',
  ].filter(Boolean).join('');
  const metaHTML=metaItems?`<div class="modal-meta-grid">${metaItems}</div>`:'';
  const initial=escHtml((b.title||'?').charAt(0));
  const imgSrc=b.cover?`<img class="cover-photo" src="${escAttr(b.cover)}" alt="Capa de ${escAttr(b.title||'')}">`:'';

  // Sessão de leitura — junto ao progresso (não na fila de ações)
  const readingCta=b._shelf==='a-ler'
    ? `<button type="button" class="reading-cta" data-action="handleReadingBtn" data-id="${b.id}">▶ ${(readingState.active&&readingState.bookId===b.id)?'Continuar sessão de leitura':'Iniciar sessão de leitura'}</button>` : '';
  const returnBtn=b.lent?`<button type="button" class="btn-lend" data-action="returnBook" data-id="${b.id}">Devolver</button>`:'';

  $('modal-body').innerHTML=`
    <div class="modal-hero">
      <div class="modal-cover c-${b.color}">
        <div class="cover-front"><div class="cf-art"><span class="cf-initial">${initial}</span></div>
          <div class="cf-body"><div class="cf-title">${escHtml(b.title||'')}</div><div class="cf-author">${escHtml(b.author||'')}</div></div></div>
        ${imgSrc}
      </div>
      <div class="modal-meta">
        <span class="modal-badge ${badgeCls}">${statusLabel}</span>
        <h2 class="modal-title">${escHtml(b.title||'')}</h2>
        <div class="modal-author">${escHtml(b.author||'')}</div>
        ${b.rating?`<div class="modal-stars">${starHTML(b.rating)}</div>`:''}
      </div>
    </div>
    ${b.synopsis?`<p class="modal-sinopse">${escHtml(b.synopsis)}</p>`:''}
    ${b._shelf==='a-ler'&&b.pagesRead?`
    <div class="modal-progress"><div class="progress-label"><span>Progresso de leitura</span><span>${b.pagesRead} / ${b.pages} págs &mdash; ${p}%</span></div>
      <div class="progress-track"><div class="progress-bar" style="width:${p}%"></div></div></div>`:''}
    ${readingCta}
    ${metaHTML}
    ${grHTML}
    ${enrichLine}
    ${b.notes?`<div class="modal-section-label">As minhas notas</div><p class="modal-notes">${escHtml(b.notes)}</p>`:''}
    ${b.dateAdded?`<div class="modal-date">${b.goodreadsData?'Enriquecido':'Adicionado'} em ${escHtml(b.dateAdded)}</div>`:''}
    <div class="modal-actions">
      <button type="button" class="btn-edit" data-action="openEditModal" data-id="${b.id}">Editar</button>
      <button type="button" class="btn-lend" data-action="openLendModal" data-id="${b.id}">Emprestar</button>
      ${returnBtn}
      <button type="button" class="btn-delete" data-action="confirmDelete" data-id="${b.id}">Eliminar</button>
    </div>`;
  lastFocusedEl=document.activeElement;
  $('book-modal').classList.add('open'); $('backdrop').classList.add('open');
  document.body.style.overflow='hidden';
  const c=document.querySelector('#book-modal .modal-close-btn'); if(c) c.focus();
}
// A ficha tem sempre um nome para os leitores de ecrã: o primeiro título do
// conteúdo (livro, editar, emprestar, sessão de leitura…), ou «Ficha do livro».
function nameModal(){
  const m=$('book-modal'); if(!m) return;
  const h=m.querySelector('#modal-body h1, #modal-body h2, #modal-body h3, #modal-body .edit-head');
  if(h){ if(!h.id) h.id='book-modal-title'; m.setAttribute('aria-labelledby',h.id); m.removeAttribute('aria-label'); }
  else { m.removeAttribute('aria-labelledby'); m.setAttribute('aria-label','Ficha do livro'); }
}
if($('modal-body')) new MutationObserver(nameModal).observe($('modal-body'),{childList:true});
function closeModal(){
  $('book-modal').classList.remove('open'); $('backdrop').classList.remove('open');
  document.body.style.overflow='';
  if(lastFocusedEl&&typeof lastFocusedEl.focus==='function'){ lastFocusedEl.focus(); lastFocusedEl=null; }
}
function trapModalFocus(e){
  if(e.key!=='Tab') return;
  const modal=$('book-modal'); if(!modal.classList.contains('open')) return;
  const sel='button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
  const items=Array.prototype.filter.call(modal.querySelectorAll(sel),el=>!el.disabled&&el.offsetParent!==null);
  if(!items.length) return;
  const first=items[0],last=items[items.length-1];
  if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
}

// ── EDITAR (persiste na PocketBase) ────────────────────────────────────────
function openEditModal(id){
  const b=byId(id); if(!b) return;
  const statusOpts=[['a-ler','A ler'],['lido','Lido'],['para-ler','Para ler']]
    .map(([v,l])=>`<option value="${v}" ${b._shelf===v?'selected':''}>${l}</option>`).join('');
  const ratingOpts=[0,1,2,3,4,5].map(n=>`<option value="${n}" ${(+b.rating||0)===n?'selected':''}>${n===0?'Sem avaliação':'★'.repeat(n)}</option>`).join('');
  const libOpts=`<option value="">Sem coleção</option>`+STATE.libs.map(l=>`<option value="${l.id}" ${b.library===l.id?'selected':''}>${escHtml((l.icon?l.icon+' ':'')+l.name)}</option>`).join('');
  $('modal-body').innerHTML=`
    <div class="edit-head">Editar ficha</div>
    <form class="edit-form" data-onsubmit="saveEdit" data-id="${id}">
      <div class="efield"><label for="ed-title">Título</label><input id="ed-title" value="${escAttr(b.title)}" required></div>
      <div class="efield"><label for="ed-author">Autor</label><input id="ed-author" value="${escAttr(b.author||'')}"></div>
      <div class="efield-row">
        <div class="efield"><label for="ed-status">Estado</label><select id="ed-status">${statusOpts}</select></div>
        <div class="efield"><label for="ed-rating">Avaliação</label><select id="ed-rating">${ratingOpts}</select></div>
      </div>
      <div class="efield"><label for="ed-lib">Coleção / Localização</label><select id="ed-lib">${libOpts}</select></div>
      <div class="efield-row">
        <div class="efield"><label for="ed-pages">Páginas</label><input id="ed-pages" type="number" inputmode="numeric" min="0" value="${b.pages||''}"></div>
        <div class="efield"><label for="ed-read">Páginas lidas</label><input id="ed-read" type="number" inputmode="numeric" min="0" value="${b.pagesRead||''}"></div>
      </div>
      <div class="efield"><label for="ed-publisher">Editora</label><input id="ed-publisher" value="${escAttr(b.publisher||'')}"></div>
      <div class="efield"><label for="ed-qty">Exemplares</label><input id="ed-qty" type="number" inputmode="numeric" min="1" value="${b.quantity||1}"></div>
      <div class="efield"><label for="ed-notes">As minhas notas</label><textarea id="ed-notes" rows="3">${escHtml(b.notes||'')}</textarea></div>
      <div class="edit-actions">
        <button type="submit" class="btn-edit">Guardar alterações</button>
        <button type="button" class="btn-lend" data-action="openModal" data-id="${id}">Cancelar</button>
      </div>
    </form>`;
  const f=$('ed-title'); if(f) f.focus();
}
async function saveEdit(e,id){
  if(e&&e.preventDefault) e.preventDefault();
  const v=q=>($(q)?$(q).value:'');
  const shelf=v('ed-status');                 // a-ler | lido | para-ler
  const status=shelf==='para-ler'?'nao-lido':shelf;   // canónico do repo
  const data={
    title:v('ed-title').trim(),
    author:v('ed-author').trim(),
    status,
    rating:parseInt(v('ed-rating'),10)||0,
    pagesTotal:parseInt(v('ed-pages'),10)||0,
    pagesRead:parseInt(v('ed-read'),10)||0,
    publisher:v('ed-publisher').trim(),
    quantity:Math.max(1,parseInt(v('ed-qty'),10)||1),
    notes:v('ed-notes').trim(),
    library:v('ed-lib'),
  };
  if(!data.title){ const t=$('ed-title'); if(t) t.focus(); return; }
  await DB.updateBook(id,data); unsavedChanges=true;
  await loadAll();
  openModal(id);            // ficha actualizada
  showToast('Alterações guardadas');
}

// ── EMPRESTAR (livro + registo na coleção loans) ───────────────────────────
function openLendModal(id){
  const b=byId(id); if(!b) return;
  const dueIso=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
  const locOpts=(STATE.libs.length?STATE.libs.map(l=>l.name):['Casa'])
    .map(l=>`<option value="${escAttr(l)}">${escHtml(l)}</option>`).join('');
  $('modal-body').innerHTML=`
    <div class="edit-head">Emprestar livro</div>
    <p class="lend-book">&ldquo;${escHtml(b.title)}&rdquo; &middot; ${escHtml(b.author||'')}</p>
    <form class="edit-form" data-onsubmit="confirmLend" data-id="${id}">
      <div class="efield"><label for="ln-who">A quem</label><input id="ln-who" placeholder="Quem leva o livro" autocomplete="off" required></div>
      <div class="efield-row">
        <div class="efield"><label for="ln-loc">Sai de</label><select id="ln-loc">${locOpts}</select></div>
        <div class="efield"><label for="ln-due">Devolução prevista</label><input id="ln-due" type="date" value="${dueIso}" required></div>
      </div>
      <div class="edit-actions">
        <button type="submit" class="btn-edit">Confirmar empréstimo</button>
        <button type="button" class="btn-lend" data-action="openModal" data-id="${id}">Cancelar</button>
      </div>
    </form>`;
  const f=$('ln-who'); if(f) f.focus();
}
async function confirmLend(e,id){
  if(e&&e.preventDefault) e.preventDefault();
  const b=byId(id); if(!b) return;
  const who=($('ln-who')||{}).value||'';
  const dueIso=($('ln-due')||{}).value||'';
  if(!who.trim()){ const w=$('ln-who'); if(w) w.focus(); return; }
  const outIso=new Date().toISOString().slice(0,10);
  await DB.updateBook(id,{lent:true,lentTo:who.trim(),lentDate:outIso});
  try{ await DB.addLoan({book:id,who:who.trim(),lentDate:outIso,dueDate:dueIso,returnedDate:'',returned:false}); }catch(_){}
  unsavedChanges=true; await loadAll();
  $('modal-body').innerHTML=`
    <div class="lend-done">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
      <div class="lend-done-t">Empréstimo registado</div>
      <p class="lend-done-s">&ldquo;${escHtml(b.title)}&rdquo; está agora com <strong>${escHtml(who.trim())}</strong> &middot; devolução ${fmtDate(dueIso)}. Já aparece em <strong>Resumo &rsaquo; Emprestados</strong>.</p>
      <button type="button" class="btn-edit" data-action="closeModal">Concluir</button>
    </div>`;
  const d=document.querySelector('.lend-done .btn-edit'); if(d) d.focus();
}
async function returnBook(id){
  await DB.updateBook(id,{lent:false,lentTo:'',lentDate:''});
  try{ const open=(await DB.getLoans()).find(l=>l.book===id&&!l.returned);
       if(open) await DB.updateLoan(open.id,{returned:true,returnedDate:new Date().toISOString().slice(0,10)}); }catch(_){}
  unsavedChanges=true; await refresh(); closeModal(); showToast('Devolução registada');
}

// ── ELIMINAR (confirmação inline) ──────────────────────────────────────────
function confirmDelete(id){
  const wrap=document.querySelector('#book-modal .modal-actions'); if(!wrap) return;
  wrap.innerHTML=`<div class="del-confirm">
    <span class="del-q">Eliminar este livro da estante? Não dá para anular.</span>
    <div class="del-row">
      <button type="button" class="btn-delete" data-action="doDelete" data-id="${id}">Sim, eliminar</button>
      <button type="button" class="btn-lend" data-action="openModal" data-id="${id}">Cancelar</button>
    </div></div>`;
  const yes=wrap.querySelector('.btn-delete'); if(yes) yes.focus();
}
async function doDelete(id){
  await DB.deleteBook(id); unsavedChanges=true;
  await loadAll(); closeModal(); buildShelves(); showToast('Livro eliminado');
}

// ── ENRIQUECER COM GOODREADS (URL) ─────────────────────────────────────────
function abrirEnriquecimento(id){
  const b=byId(id); if(!b) return;
  $('modal-body').innerHTML=`
    <div class="edit-head">Enriquecer com Goodreads</div>
    <p class="lend-book">&ldquo;${escHtml(b.title)}&rdquo;</p>
    <form class="edit-form" data-onsubmit="confirmEnrich" data-id="${id}">
      <div class="efield"><label for="gr-url">URL do livro no Goodreads</label>
        <input id="gr-url" type="url" placeholder="https://www.goodreads.com/book/show/..." value="${escAttr(b.goodreadsUrl||'')}" required></div>
      <div id="gr-status" class="isbn-status" role="status" aria-live="polite"></div>
      <div class="edit-actions">
        <button type="submit" class="btn-edit">Importar dados</button>
        <button type="button" class="btn-lend" data-action="openModal" data-id="${id}">Cancelar</button>
      </div>
    </form>`;
  const f=$('gr-url'); if(f) f.focus();
}
async function confirmEnrich(e,id){
  if(e&&e.preventDefault) e.preventDefault();
  const url=($('gr-url')||{}).value||''; const st=$('gr-status');
  if(!url.trim()) return;
  if(st){ st.className='isbn-status is-loading'; st.innerHTML='<span class="isbn-spin"></span>A importar do Goodreads…'; }
  try{
    const dados=await enriquecerComGoodreads(url.trim());
    await DB.updateBook(id,{ goodreadsUrl:url.trim(), goodreadsData:dados, goodreadsEnrichedAt:dados.enriquecidoEm });
    unsavedChanges=true; await loadAll(); openModal(id); showToast('Livro enriquecido ✓');
  }catch(err){ if(st){ st.className='isbn-status is-error'; st.textContent='Erro: '+err.message; } }
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER — RESUMO (estatísticas + empréstimos)
// ═══════════════════════════════════════════════════════════════════════════
function boardWrap(kicker,title,sub,notesHtml){
  return `<section class="board-view"><div class="board-head"><div class="board-kicker">${kicker}</div><h1 class="board-title">${title}</h1><p class="board-sub">${sub}</p></div>
    <div class="board"><div class="pin-board">${notesHtml}</div></div></section>`;
}

// Constrói os objectos de empréstimo para a vista (junta loans + livros)
function buildLoanViews(){
  const today=new Date().toISOString().slice(0,10);
  const views=[];
  STATE.loans.forEach(l=>{
    const b=byId(l.book)||{};
    let state='on';
    if(l.returned) state='back';
    else if(l.dueDate && l.dueDate<today) state='late';
    views.push({ _loanId:l.id, _bookId:l.book, title:b.title||'—', author:b.author||'', color:b.color||'slate',
      who:l.who||'—', out:fmtDate(l.lentDate), due:fmtDate(l.dueDate||''), state });
  });
  // livros marcados como emprestados sem registo aberto em loans (legado)
  STATE.books.filter(b=>b.lent).forEach(b=>{
    if(views.some(v=>v._bookId===b.id&&v.state!=='back')) return;
    const late=b.lentDate&&daysAgo(b.lentDate)>30;
    views.push({ _loanId:null, _bookId:b.id, title:b.title, author:b.author||'', color:b.color,
      who:b.lentTo||'—', out:fmtDate(b.lentDate), due:'', state:late?'late':'on' });
  });
  return views;
}
function loanCardHtml(l){
  const isBack=l.state==='back', isLate=l.state==='late';
  const stampLabel=isBack?'DEVOLVIDO':isLate?'EM ATRASO':'EMPRESTADO';
  const stampSub=isBack?'returned':isLate?'overdue':'on loan';
  const stampCls=isBack?'back':isLate?'late':'';
  const pillCls=isBack?'pill-back':isLate?'pill-late':'pill-on';
  const pillTxt=isBack?'Devolvido':isLate?'Atrasado':'Em curso';
  const action=isBack
    ? `<button class="loan-return" type="button" data-action="reopenLoan" data-id="${l._loanId||''}" data-id2="${l._bookId}">Emprestar de novo</button>`
    : `<button class="loan-return" type="button" data-action="returnLoan" data-id="${l._loanId||''}" data-id2="${l._bookId}">Marcar devolvido</button>`;
  return `<div class="loan-card${isBack?' returned':''}">
    <span class="loan-stamp ${stampCls}">${stampLabel}<small>${stampSub}</small></span>
    <div class="loan-cover c-${l.color}">${escHtml((l.title[0]||'?'))}</div>
    <div class="loan-body">
      <div class="loan-strip">Empréstimo</div>
      <div class="loan-title">${escHtml(l.title)}</div>
      <div class="loan-author">${escHtml(l.author)}</div>
      <div class="loan-meta"><div><b>Com</b>${escHtml(l.who)}</div><div><b>Saiu</b>${escHtml(l.out)}</div><div><b>Devolução</b>${escHtml(l.due||'—')}</div></div>
      <div class="loan-foot"><span class="loan-pill ${pillCls}">${pillTxt}</span>${action}</div>
    </div></div>`;
}
function setLoanTab(tab){ loanTab=tab; renderResumo(); }
async function returnLoan(loanId,bookId){
  if(bookId) await DB.updateBook(bookId,{lent:false,lentTo:'',lentDate:''});
  if(loanId) await DB.updateLoan(loanId,{returned:true,returnedDate:new Date().toISOString().slice(0,10)});
  unsavedChanges=true; await loadAll(); renderResumo(); showToast('Devolução registada');
}
async function reopenLoan(loanId,bookId){
  let who=''; const l=STATE.loans.find(x=>x.id===loanId); if(l) who=l.who||'';
  const today=new Date().toISOString().slice(0,10);
  const due=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
  if(bookId) await DB.updateBook(bookId,{lent:true,lentTo:who,lentDate:today});
  try{ await DB.addLoan({book:bookId,who,lentDate:today,dueDate:due,returnedDate:'',returned:false}); }catch(_){}
  loanTab='ativos'; unsavedChanges=true; await loadAll(); renderResumo(); showToast('Empréstimo reaberto');
}

// ═══════════════════════════════════════════════════════════════════════════
// RESUMO (Fase 4) — calendário de capas e desafio anual
// O calendário lê as sessões do cronómetro (readingSessions). Em cada dia mostra
// o livro com mais tempo de leitura. O desafio conta os livros com finishedAt
// no ano corrente; a meta é users.readingGoal (ou localStorage sem PocketBase).
// ═══════════════════════════════════════════════════════════════════════════
const MESES_PT=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
let calOffset=0;            // 0 = mês atual, -1 = mês anterior…
let goalEditing=false;
function calMove(n){ calOffset=Math.min(0,calOffset+n); renderResumo(); }
function localDayKey(iso){ const d=new Date(iso); if(isNaN(d)) return ''; return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function readingByDay(){
  // { 'AAAA-M-D': { book, secs } } — fica o livro com mais tempo nesse dia
  const map={};
  STATE.books.forEach(b=>{
    parseTags(b.readingSessions||'[]').filter(Boolean).forEach(sx=>{
      const k=localDayKey(sx&&sx.date); if(!k) return;
      const secs=parseInt(sx.duration||0)||0;
      const acc=map[k]||(map[k]={best:null,bestSecs:-1,per:{}});
      acc.per[b.id]=(acc.per[b.id]||0)+secs;
      if(acc.per[b.id]>acc.bestSecs){ acc.best=b; acc.bestSecs=acc.per[b.id]; }
    });
  });
  return map;
}
function readingStreak(map){
  let n=0; const d=new Date();
  if(!map[localDayKey(d.toISOString())]) d.setDate(d.getDate()-1);   // hoje ainda pode vir a ler
  while(map[localDayKey(d.toISOString())]){ n++; d.setDate(d.getDate()-1); }
  return n;
}
function readingTimeOfDay(){
  const c={manhã:0,tarde:0,noite:0}; let tot=0;
  STATE.books.forEach(b=>parseTags(b.readingSessions||'[]').filter(Boolean).forEach(sx=>{
    const d=new Date(sx&&sx.date); if(isNaN(d)) return; const h=d.getHours();
    c[h>=6&&h<13?'manhã':h>=13&&h<19?'tarde':'noite']++; tot++;
  }));
  if(tot<5) return '';
  const [k]=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];
  return {manhã:'Lês sobretudo de manhã',tarde:'Lês sobretudo à tarde',noite:'Lês sobretudo à noite'}[k];
}
function getGoal(){
  const u=AUTH.user; const g=u&&parseInt(u.readingGoal||0);
  if(g) return g;
  try{ return parseInt(localStorage.getItem('readingGoal')||0)||0; }catch{ return 0; }
}
function editGoal(){ goalEditing=true; renderResumo(); setTimeout(()=>$('goal-input')?.focus(),0); }
async function saveGoal(){
  const v=Math.max(0,Math.min(1000,parseInt($('goal-input')?.value||0)||0));
  try{ localStorage.setItem('readingGoal',String(v)); }catch{}
  const u=AUTH.user;
  if(usePocketBase&&u&&u.id){
    try{
      const r=await fetch(`${PB_URL}/api/collections/users/records/${u.id}`,{method:'PATCH',headers:{'Content-Type':'application/json',...AUTH.authHeader()},body:JSON.stringify({readingGoal:v}),signal:AbortSignal.timeout(8000)});
      if(r.ok) AUTH.user=Object.assign({},u,{readingGoal:v});
    }catch(_){ /* fica guardado neste browser; tenta de novo na próxima vez */ }
  }
  goalEditing=false; renderResumo(); showToast(v?`Meta de ${v} livros guardada`:'Meta removida');
}
function calendarNoteHtml(map){
  const now=new Date(); const ref=new Date(now.getFullYear(),now.getMonth()+calOffset,1);
  const y=ref.getFullYear(), m=ref.getMonth(), days=new Date(y,m+1,0).getDate(), lead=(ref.getDay()+6)%7;
  const DOW=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  let cells=DOW.map(d=>`<div class="cal-dow" aria-hidden="true">${d.charAt(0)}</div>`).join('')+Array.from({length:lead},()=>'<div class="cal-blank" aria-hidden="true"></div>').join('');
  let lidos=0;
  for(let d=1;d<=days;d++){
    const k=`${y}-${m}-${d}`, hit=map[k], today=calOffset===0&&d===now.getDate();
    if(hit&&hit.best){
      lidos++; const b=hit.best;
      const img=b.cover?`<img src="${escAttr(b.cover)}" alt="" loading="lazy">`:`<span class="cal-ini">${escHtml((b.title||'?').trim().charAt(0).toUpperCase())}</span>`;
      cells+=`<div class="cal-day is-read c-${b.color||'navy'}${today?' is-today':''}" role="img" aria-label="${d} de ${MESES_PT[m]}: leste ${escAttr(b.title||'')}" title="${escAttr(b.title||'')}">${img}<span class="cal-n">${d}</span></div>`;
    } else {
      cells+=`<div class="cal-day${today?' is-today':''}" role="img" aria-label="${d} de ${MESES_PT[m]}: sem leitura registada"><span class="cal-n">${d}</span></div>`;
    }
  }
  const mes=MESES_PT[m].charAt(0).toUpperCase()+MESES_PT[m].slice(1);
  return `<div class="note note-cal">
    <div class="cal-head"><div class="note-title">${mes} de ${y}</div>
      <div class="cal-nav"><button type="button" class="cal-btn" data-action="calPrev" aria-label="Mês anterior">‹</button>
      <button type="button" class="cal-btn" data-action="calNext" aria-label="Mês seguinte" ${calOffset===0?'disabled':''}>›</button></div></div>
    <div class="cal-grid">${cells}</div>
    <p class="cal-legend"><strong class="num">${lidos}</strong> ${lidos===1?'dia':'dias'} com leitura. Cada capa é o livro que mais leste nesse dia.</p>
    ${Object.keys(map).length?'':'<p class="cal-legend">Usa o cronómetro de leitura na ficha de um livro e os dias começam a aparecer aqui.</p>'}
  </div>`;
}
function goalNoteHtml(map){
  const y=new Date().getFullYear(), goal=getGoal();
  const doneBooks=STATE.books.filter(b=>b._shelf==='lido'&&b.finishedAt&&new Date(b.finishedAt).getFullYear()===y);
  const semData=STATE.books.filter(b=>b._shelf==='lido'&&!b.finishedAt).length;
  const done=doneBooks.length, streak=readingStreak(map), quando=readingTimeOfDay();
  const thick=[...doneBooks].sort((a,b)=>(b.pages||0)-(a.pages||0))[0];
  const editor=`<form class="goal-form" data-onsubmit="saveGoal">
      <label for="goal-input">Quantos livros queres ler em ${y}?</label>
      <div class="goal-row"><input id="goal-input" type="number" min="0" max="1000" inputmode="numeric" value="${goal||''}" placeholder="Ex.: 24">
      <button type="button" class="goal-save" data-action="saveGoal">Guardar</button></div></form>`;
  const slots=goal?Array.from({length:Math.min(goal,60)},(_,i)=>{
      const b=doneBooks[i]; const h=60+((i*37)%35);
      return b?`<i class="c-${b.color||'navy'}" style="height:${h}%"></i>`:`<i class="goal-empty" style="height:${h}%"></i>`;
    }).join(''):'';
  return `<div class="note note-goal"><div class="note-title">Desafio ${y}</div>
    ${goal&&!goalEditing?`<p class="goal-num"><span class="nm-num">${done}</span> de ${goal} livros
        <button type="button" class="goal-edit" data-action="editGoal">Mudar meta</button></p>
      <div class="goal-shelf" role="img" aria-label="${done} de ${goal} livros lidos em ${y}">${slots}</div>`
      :(goalEditing||!goal?editor:'')}
    ${!goal&&!goalEditing?'':''}
    <ul class="goal-facts">
      ${goal?'':`<li>Já terminaste <strong class="num">${done}</strong> ${done===1?'livro':'livros'} em ${y}.</li>`}
      ${thick?`<li>O mais grosso: <strong>${escHtml(thick.title||'')}</strong>, <span class="num">${thick.pages}</span> páginas</li>`:''}
      ${streak?`<li>Sequência atual: <strong class="num">${streak} ${streak===1?'dia':'dias'}</strong> seguidos a ler</li>`:''}
      ${quando?`<li>${quando}</li>`:''}
      ${semData?`<li class="goal-note">${semData} ${semData===1?'livro lido não tem':'livros lidos não têm'} data de fim (terminados antes desta versão) e não ${semData===1?'conta':'contam'} para o desafio.</li>`:''}
    </ul></div>`;
}
function renderResumo(){
  currentView='stats';
  const B=STATE.books;
  const lidos=B.filter(b=>b._shelf==='lido').length;
  const aLer=B.filter(b=>b._shelf==='a-ler').length;
  const paraLer=B.filter(b=>b._shelf==='para-ler').length;
  const total=B.length;
  const pags=B.reduce((s,b)=>s+(b._shelf==='lido'?(b.pages||0):(b.pagesRead||0)),0);
  const rated=B.filter(b=>b.rating>0);
  const media=rated.length?(rated.reduce((s,b)=>s+b.rating,0)/rated.length):0;
  const byA={}; B.forEach(b=>{ if(b.author) byA[b.author]=(byA[b.author]||0)+1; });
  const topA=Object.entries(byA).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const dist=[0,0,0,0,0]; rated.forEach(b=>dist[5-b.rating]++);
  const maxBar=Math.max(lidos,aLer,paraLer,1), maxRt=Math.max(1,...dist);
  const bars=[['Lidos',lidos,'bar-lido'],['A ler',aLer,'bar-lendo'],['Para ler',paraLer,'bar-para']];
  const dayMap=readingByDay();
  const statsNotes=calendarNoteHtml(dayMap)+goalNoteHtml(dayMap)+`
    <div class="note"><div class="note-k">Resumo</div>
      <div class="note-metrics">
        <div><div class="nm-num">${lidos}</div><div class="nm-cap">Lidos</div></div>
        <div><div class="nm-num">${pags.toLocaleString('pt-PT')}</div><div class="nm-cap">Páginas</div></div>
        <div><div class="nm-num">${media.toFixed(1)}<span>/5</span></div><div class="nm-cap">Média</div></div>
        <div><div class="nm-num">${total}</div><div class="nm-cap">Total</div></div>
      </div></div>
    <div class="note"><div class="note-title">Por estado</div>
      ${bars.map(([l,n,c])=>`<div class="bar-row"><span class="bar-lbl">${l}</span><div class="bar-track"><div class="bar-fill ${c}" style="width:${Math.round(n/maxBar*100)}%"></div></div><span class="bar-val">${n}</span></div>`).join('')}</div>
    <div class="note"><div class="note-title">Avaliações que dei</div>
      ${dist.map((n,i)=>`<div class="rt-row"><span class="rt-star">${'★'.repeat(5-i)}</span><div class="rt-track"><div class="rt-fill" style="width:${Math.round(n/maxRt*100)}%"></div></div><span class="rt-n">${n}</span></div>`).join('')}</div>
    <div class="note"><div class="note-title">Autores presentes</div>
      ${topA.length?topA.map(([a,n])=>`<div class="author-row"><span class="author-name">${escHtml(a)}</span><span class="author-count">${n} ${n>1?'livros':'livro'}</span></div>`).join(''):'<div class="col-empty">Sem autores ainda</div>'}</div>`
    +(usePocketBase?shareCardHtml():'');

  const allLoans=buildLoanViews();
  const activeLoans=allLoans.filter(l=>l.state!=='back');
  const backLoans=allLoans.filter(l=>l.state==='back');
  const shown=loanTab==='devolvidos'?backLoans:activeLoans;
  const loanCards=shown.length?shown.map(loanCardHtml).join('')
    :`<div class="board-empty">${loanTab==='devolvidos'?'Ainda não devolveste nenhum livro.':'Sem livros emprestados de momento.'}</div>`;
  const loanToggle=`<div class="loan-subnav"><div class="seg" role="tablist">
    <button role="tab" aria-selected="${loanTab==='ativos'}" data-action="setLoanTab" data-arg="ativos">Ativos <span class="num">${activeLoans.length}</span></button>
    <button role="tab" aria-selected="${loanTab==='devolvidos'}" data-action="setLoanTab" data-arg="devolvidos">Devolvidos <span class="num">${backLoans.length}</span></button>
  </div></div>`;
  const loansBlock=loanToggle+`<div class="board"><div class="loan-grid">${loanCards}</div></div>`;

  $('main').innerHTML=`
    <section class="board-view">
      <div class="board-head"><div class="board-kicker">A minha leitura</div><h1 class="board-title">Resumo</h1>
        <p class="board-sub">Um retrato da tua leitura, mês a mês, e dos livros que andam fora de casa.</p></div>
      <div class="split-board">
        <div class="split-col"><div class="split-col-head"><div class="split-col-title">Estatísticas</div><div class="split-col-count">${total} livros</div></div>
          <div class="board"><div class="pin-board">${statsNotes}</div></div></div>
        <div class="split-col"><div class="split-col-head"><div class="split-col-title">Fora de casa</div><div class="split-col-count">${shown.length} ${shown.length===1?'livro':'livros'}</div></div>
          ${loansBlock}</div>
      </div></section>`;
}

// ── Link público de partilha da coleção ─────────────────────────────────────
function shareCardHtml(){
  const s=STATE.share;
  if(s){
    const url=`${location.origin}/c/${s.token}`;
    return `<div class="note" id="share-note"><div class="note-title">Partilhar a minha coleção</div>
      <p class="share-desc">Quem tiver este link vê título, autor, capa, coleção e estado — sem notas nem preços.</p>
      <div class="share-link-row">
        <input type="text" readonly value="${escAttr(url)}" id="share-link-input" aria-label="Link de partilha">
        <button type="button" data-action="copyShareLink">Copiar</button>
      </div>
      <button type="button" class="share-revoke" data-action="revokeShareLink" data-id="${s.id}">Desativar link</button>
    </div>`;
  }
  return `<div class="note" id="share-note"><div class="note-title">Partilhar a minha coleção</div>
    <p class="share-desc">Cria um link para mostrares a tua estante a quem quiseres — só título, autor, capa, coleção e estado.</p>
    <button type="button" data-action="createShareLink">Criar link</button>
  </div>`;
}
async function createShareLink(){
  await DB.createShare(); await loadAll(); renderResumo(); showToast('Link criado');
}
async function revokeShareLink(id){
  if(!confirm('Desativar o link? Quem o tiver deixa de conseguir ver a tua coleção.')) return;
  await DB.deleteShare(id); await loadAll(); renderResumo(); showToast('Link desativado');
}
function copyShareLink(){
  const input=$('share-link-input'); if(!input) return;
  input.select();
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(input.value).then(()=>showToast('Link copiado')).catch(()=>showToast('Seleciona e copia manualmente'));
  }else showToast('Seleciona e copia manualmente');
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER — COLEÇÕES (= bibliotecas do repo)
// ═══════════════════════════════════════════════════════════════════════════
function renderCollections(){
  currentView='colecoes';
  const notes=STATE.libs.map(lib=>{
    const books=STATE.books.filter(b=>b.library===lib.id);
    const lidos=books.filter(b=>b._shelf==='lido').length, aLer=books.filter(b=>b._shelf==='a-ler').length;
    // mini-prateleira: altura e largura pelas páginas, como na estante grande
    const spines=books.length
      ? books.slice(0,14).map(b=>{ const p=Math.min((b.pages||300)/1000,1); return `<i class="c-${b.color||'navy'}" style="height:${Math.round(52+p*44)}%;width:${Math.round(11+p*9)}px"></i>`; }).join('')
      : '';
    return `<div class="note note-col">
      <div class="col-shelf" aria-hidden="true">${spines||'<span class="col-shelf-empty">prateleira vazia</span>'}</div>
      <div class="note-title" style="margin-bottom:3px">${escHtml((lib.icon?lib.icon+' ':'')+lib.name)}</div>
      ${lib.desc?`<div class="col-desc">${escHtml(lib.desc)}</div>`:''}
      <div class="col-count"><strong class="num">${books.length}</strong> ${books.length===1?'livro':'livros'}${books.length?` · <span class="num">${lidos}</span> ${lidos===1?'lido':'lidos'}${aLer?` · <span class="num">${aLer}</span> a ler`:''}`:''}</div>
      <div class="col-actions">
        <button type="button" class="col-link" data-action="setFilter" data-arg="col:${lib.id}" data-goto="catalogo">Ver na estante</button>
        <button type="button" class="col-link col-del" data-action="deleteCollection" data-id="${lib.id}">Apagar</button>
      </div>
    </div>`;
  }).join('')+`<div class="note note-new note-col">
      <label for="new-col" class="note-title" style="margin-bottom:8px">Nova coleção</label>
      <input id="new-col" class="new-col-input" type="text" placeholder="Ex.: Casa de férias" data-enter="createCollection">
      <button type="button" class="new-col-btn" data-action="createCollection">Criar</button>
    </div>`;
  $('main').innerHTML=boardWrap('As tuas bibliotecas','Coleções',
    'Cada sítio onde guardas livros tem a sua prateleira. Coleção e localização são a mesma coisa.',notes);
}
async function deleteCollection(libId){
  const lib=STATE.libs.find(l=>l.id===libId); const n=STATE.books.filter(b=>b.library===libId).length;
  const msg=n?`Apagar «${lib?lib.name:'esta coleção'}»? Os ${n} ${n===1?'livro continua':'livros continuam'} na estante, mas ${n===1?'fica':'ficam'} sem coleção.`:`Apagar «${lib?lib.name:'esta coleção'}»?`;
  if(!confirm(msg)) return;
  await DB.deleteLib(libId); unsavedChanges=true; await loadAll(); renderCollections(); showToast('Coleção apagada');
}
async function createCollection(){
  const el=$('new-col'); const v=(el&&el.value||'').trim();
  if(!v){ if(el) el.focus(); return; }
  await DB.addLib({name:v,icon:'📚',desc:''}); unsavedChanges=true; await loadAll(); renderCollections();
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER — WISHLIST (desejado → comprado → adicionado)
// ═══════════════════════════════════════════════════════════════════════════
function renderWishlist(){
  currentView='wishlist';
  const tabs=[{id:'desejado',label:'Desejados'},{id:'comprado',label:'Comprados'},{id:'adicionado',label:'Já na estante'}];
  const counts=tabs.reduce((m,t)=>{ m[t.id]=STATE.wish.filter(w=>(w.status||'desejado')===t.id).length; return m; },{});
  const subnav=`<div class="wish-subnav"><div class="seg" role="tablist">${
    tabs.map(t=>`<button role="tab" aria-selected="${wishTab===t.id}" data-action="setWishTab" data-id="${t.id}">${t.label}<span class="num">${counts[t.id]}</span></button>`).join('')
  }</div></div>`;
  const filtered=STATE.wish.filter(w=>(w.status||'desejado')===wishTab);
  const stateMeta={ desejado:{next:'comprado',nextLabel:'Marcar como comprado'}, comprado:{next:'adicionado',nextLabel:'Arrumar na estante'}, adicionado:{next:null,nextLabel:null} };
  const cards=filtered.map(w=>{
    const color=colorFor(w);
    const m=stateMeta[wishTab];
    const advance=m.next
      ? `<button class="wish-advance" type="button" data-action="advanceWish" data-id="${w.id}">${m.nextLabel}</button>`
      : `<div class="wish-done">Já está na estante ✓</div>`;
    const prio=wishTab==='desejado'&&w.priority?`<span class="prio prio-${w.priority}">Prioridade ${({alta:'alta',media:'média',baixa:'baixa'})[w.priority]||escHtml(w.priority)}</span>`:'';
    const link=w.url?`<a class="wish-store" href="${escAttr(w.url)}" target="_blank" rel="noopener noreferrer">Ver na livraria ↗</a>`:'';
    return `<div class="note note-wish" style="width:222px">
      ${prio}
      <div class="wish-cover c-${color}">${escHtml((w.title||'?')[0])}</div>
      <div class="wish-title">${escHtml(w.title||'')}</div>
      <div class="wish-author">${escHtml(w.author||'')}</div>
      <div class="wish-foot">${link}</div>
      ${advance}
      <button type="button" class="col-link col-del wish-del" data-action="deleteWish" data-id="${w.id}" aria-label="Apagar ${escAttr(w.title||'este desejo')}">Apagar</button>
    </div>`;
  }).join('');
  const emptyTxt={ desejado:['Que livro andas a namorar?','Afixa-o aqui, para não te esqueceres dele.'], comprado:['Ainda nada a caminho.','Quando comprares um desejo, aparece aqui até chegar a casa.'], adicionado:['Ainda nenhum desejo chegou à estante.','Os livros que arrumares a partir da wishlist ficam registados aqui.'] }[wishTab];
  const body=filtered.length?cards:`<div class="note wish-empty-note"><div class="note-title">${emptyTxt[0]}</div><p>${emptyTxt[1]}</p>${wishTab==='desejado'?'<button type="button" class="wish-advance" data-action="toggleWishForm">Adicionar desejo</button>':''}</div>`;
  const subs={ desejado:'Os próximos candidatos a entrar na estante.', comprado:'Já comprados, à espera de chegar à biblioteca.', adicionado:'Já entraram para a estante.' };
  const prioOpts=[['','Sem prioridade'],['alta','Alta'],['media','Média'],['baixa','Baixa']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  const addForm=`<div class="wish-add-form hidden" id="wish-add-form">
    <div class="manual-form">
      <div class="efield"><label for="wish-title">Título *</label><input id="wish-title" type="text" placeholder="Ex.: A Metamorfose" required></div>
      <div class="efield"><label for="wish-author">Autor</label><input id="wish-author" type="text" placeholder="Ex.: Franz Kafka"></div>
      <div class="efield-row">
        <div class="efield"><label for="wish-isbn">ISBN (opcional)</label><input id="wish-isbn" type="text" inputmode="numeric" placeholder="978…"></div>
        <div class="efield"><label for="wish-prio">Prioridade</label><select id="wish-prio">${prioOpts}</select></div>
      </div>
      <div class="efield"><label for="wish-url">Link da livraria (opcional)</label><input id="wish-url" type="url" placeholder="https://www.wook.pt/livro/…"></div>
      <div class="efield"><label for="wish-notes">Notas</label><textarea id="wish-notes" rows="2" placeholder="Porquê este livro?"></textarea></div>
      <div id="wish-add-status" class="isbn-status" role="status" aria-live="polite"></div>
      <button type="button" class="scan-connect" style="border-radius:var(--radius);width:100%;justify-content:center" data-action="saveNewWish">Adicionar à wishlist</button>
    </div>
  </div>`;
  $('main').innerHTML=`<section class="board-view">
    <div class="board-head">
      <div class="wish-head-row"><div><div class="board-kicker">Para um dia destes</div><h1 class="board-title">Wishlist</h1></div>
        <div class="wish-head-actions"><button type="button" class="col-link" data-action="toggleWishImport">Colar uma lista</button>
        <button type="button" class="wish-add-toggle" data-action="toggleWishForm">+ Adicionar</button></div>
      </div>
      <p class="board-sub">${subs[wishTab]}</p>
    </div>
    ${addForm}
    <div class="wish-import-wrap" id="wish-import-wrap">
      <label class="scan-label" for="wish-import-text">Cola um título por linha (opcionalmente «Título — Autor»)</label>
      <textarea id="wish-import-text" class="wish-import-area" rows="6" placeholder="A Metamorfose — Franz Kafka&#10;O Processo — Franz Kafka&#10;O Castelo"></textarea>
      <div id="wish-import-status" class="isbn-status" role="status" aria-live="polite" style="margin-top:8px"></div>
      <button type="button" id="wish-import-btn" class="scan-connect" style="border-radius:var(--radius);margin-top:10px;width:100%;justify-content:center" data-action="runWishImport">Importar para a wishlist</button>
    </div>
    ${subnav}<div class="board"><div class="pin-board">${body}</div></div></section>`;
}
function setWishTab(tab){ wishTab=tab; renderWishlist(); }
function gotoWishImport(){
  const btn=Array.prototype.find.call(document.querySelectorAll('.nav-btn'),b=>/wishlist/i.test(b.textContent));
  setNav(btn,'wishlist'); toggleWishImport();
}
async function advanceWish(id){
  const w=STATE.wish.find(x=>x.id===id); if(!w) return;
  const flow={desejado:'comprado',comprado:'adicionado'};
  const next=flow[w.status||'desejado']; if(!next) return;
  if(next==='adicionado'){
    const libId=STATE.libs[0]?.id||'';
    try{ await DB.addBook({ title:w.title, author:w.author||'', cover:w.cover||'', library:libId, status:'nao-lido', added:new Date().toISOString() }); }catch(_){}
  }
  await DB.updateWish(id,{status:next}); unsavedChanges=true; wishTab=next; await loadAll(); renderWishlist();
}
async function deleteWish(id){
  const w=STATE.wish.find(x=>x.id===id);
  if(!confirm(`Apagar «${w&&w.title?w.title:'este desejo'}» da wishlist?`)) return;
  await DB.deleteWish(id); unsavedChanges=true; await loadAll(); renderWishlist();
}

// ── Formulário de adicionar à wishlist ────────────────────────────────────
function toggleWishForm(){
  const f=$('wish-add-form'); if(!f) return;
  f.classList.toggle('hidden');
  if(!f.classList.contains('hidden')){ const t=$('wish-title'); if(t) t.focus(); }
}
async function saveNewWish(){
  const title=($('wish-title')?.value||'').trim();
  if(!title){ const st=$('wish-add-status'); if(st){ st.className='isbn-status is-error'; st.textContent='O título é obrigatório.'; } $('wish-title')?.focus(); return; }
  const isbn=($('wish-isbn')?.value||'').replace(/[^0-9X]/gi,'');
  let cover='';
  // Tentar buscar capa se tiver ISBN ou título+autor
  if(isbn){
    try{ const d=await lookupISBN(isbn); if(d&&d.cover) cover=d.cover; }catch(_){}
  } else if(title){
    try{ const r=await searchByText(title+' '+($('wish-author')?.value||'')); if(r[0]&&r[0].cover) cover=r[0].cover; }catch(_){}
  }
  const wish={
    title,
    author:($('wish-author')?.value||'').trim(),
    isbn,
    priority:$('wish-prio')?.value||'',
    url:($('wish-url')?.value||'').trim(),
    notes:($('wish-notes')?.value||'').trim(),
    cover,
    status:'desejado',
    added:new Date().toISOString(),
  };
  await DB.addWish(wish);
  unsavedChanges=true; await loadAll();
  // Reset
  ['wish-title','wish-author','wish-isbn','wish-url','wish-notes'].forEach(id=>{ const el=$(id); if(el) el.value=''; });
  const sel=$('wish-prio'); if(sel) sel.selectedIndex=0;
  const st=$('wish-add-status'); if(st){ st.className='isbn-status is-done'; st.textContent='Adicionado à wishlist ✓'; }
  saveToast('Adicionado à wishlist');
  renderWishlist();
  // Reabrir o formulário (o render reconstrói o DOM)
  const f2=$('wish-add-form'); if(f2) f2.classList.remove('hidden');
  $('wish-title')?.focus();
}

// ── Importação de wishlist por texto (um título por linha) ────────────────
function toggleWishImport(){
  const wrap=$('wish-import-wrap'); if(!wrap) return;
  wrap.classList.toggle('open');
  if(wrap.classList.contains('open')){ const ta=$('wish-import-text'); if(ta) ta.focus(); }
}
async function runWishImport(){
  const ta=$('wish-import-text'), st=$('wish-import-status');
  if(!ta||!st) return;
  const raw=(ta.value||'').trim();
  if(!raw){ st.className='isbn-status is-error'; st.textContent='Cola pelo menos um título.'; return; }
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);
  if(!lines.length){ st.className='isbn-status is-error'; st.textContent='Nenhum título válido encontrado.'; return; }
  const btn=$('wish-import-btn'); if(btn){ btn.disabled=true; btn.textContent='A importar…'; }
  st.className='isbn-status is-loading'; st.innerHTML=`<span class="isbn-spin"></span>A importar ${lines.length} item(ns)…`;
  let ok=0, fail=0;
  for(const line of lines){
    // Aceita "Título — Autor" ou "Título - Autor" ou só "Título"
    const parts=line.split(/\s*[—–\-]\s*/);
    const title=parts[0]?.trim();
    const author=parts[1]?.trim()||'';
    if(!title){ fail++; continue; }
    let cover='';
    try{ const r=await searchByText((title+' '+author).trim()); if(r[0]&&r[0].cover) cover=r[0].cover; }catch(_){}
    try{
      await DB.addWish({ title, author, cover, status:'desejado', added:new Date().toISOString() });
      ok++;
    }catch(_){ fail++; }
    // Throttle para não sobrecarregar
    await new Promise(r=>setTimeout(r,150));
    st.innerHTML=`<span class="isbn-spin"></span>Importados ${ok} de ${lines.length}…`;
  }
  unsavedChanges=true; await loadAll();
  if(btn){ btn.disabled=false; btn.textContent='Importar para wishlist'; }
  st.className='isbn-status is-done';
  st.textContent=`Importação concluída: ${ok} adicionado(s)${fail?', '+fail+' erro(s)':''}.`;
  ta.value='';
  if(currentView==='wishlist'){ renderWishlist(); showToast(`${ok} ${ok===1?'desejo afixado':'desejos afixados'} na wishlist${fail?` · ${fail} com erro`:''}`); }
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER — ADICIONAR (scanner real + pesquisa real + import/export)
// ═══════════════════════════════════════════════════════════════════════════
let pendingBook=null;   // livro encontrado à espera de confirmação
let sessionAdded=[];

function renderAdd(){
  currentView='adicionar';
  $('main').innerHTML=`
  <section class="scan-view">
    <div class="view-head" style="margin-bottom:22px"><div class="view-kicker">Nova entrada</div><h1 class="view-title">Um livro novo para a estante</h1><p class="view-sub">Pelo código de barras, por pesquisa ou à mão.</p></div>

    <div class="scan-card">
      <div class="scan-card-head">
        <svg viewBox="0 0 24 24"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10h3l3 3v3a1 1 0 0 1-1 1h-5"/><line x1="6" y1="9" x2="6" y2="15"/><line x1="9" y1="9" x2="9" y2="15"/><line x1="12" y1="9" x2="12" y2="15"/></svg>
        Scanner por cabo (USB)<span class="sub">Liga e dispara</span>
      </div>
      <div class="scan-card-body">
        <div class="scan-zone" id="scan-zone-usb" tabindex="0" role="button" data-action="focusScan">
          <div class="scan-barcode">${'<i></i>'.repeat(15)}</div>
          <div class="scan-status" id="scan-usb-status">Pronto para scan</div>
          <div class="scan-hint">Clica aqui e aproxima o leitor de um código de barras</div>
        </div>
        <input type="text" id="scan-input" aria-label="ISBN scanner" autocomplete="off"
          style="position:absolute;left:-9999px;opacity:0;width:1px;height:1px">
      </div>
    </div>

    <div class="scan-card">
      <div class="scan-card-head">
        <svg viewBox="0 0 24 24"><path d="M6.5 6.5 17 17l-5 5V2l5 5L6.5 17.5"/></svg>
        Scanner Bluetooth<span class="sub" id="bt-state">Desligado</span>
      </div>
      <div class="scan-card-body"><button type="button" class="scan-connect" id="bt-btn" data-action="toggleBt">Ligar</button></div>
    </div>

    <div class="scan-card">
      <div class="scan-card-head">
        <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        Adicionar manualmente
      </div>
      <div class="scan-card-body">
        <div class="seg" role="tablist">
          <button role="tab" aria-selected="true" data-action="setAddMode" data-arg="isbn">ISBN</button>
          <button role="tab" aria-selected="false" data-action="setAddMode" data-arg="titulo">Pesquisa</button>
          <button role="tab" aria-selected="false" data-action="setAddMode" data-arg="manual">Manual</button>
        </div>
        <div id="add-mode-isbn">
          <label class="scan-label" for="add-isbn">ISBN ou código de barras</label>
          <div class="search-row">
            <input id="add-isbn" type="text" inputmode="numeric" placeholder="9789722…" aria-describedby="isbn-status" data-oninput="resetIsbnSearch" data-enter="searchIsbn">
            <button type="button" id="isbn-btn" class="scan-connect" style="border-radius:var(--radius)" data-action="searchIsbn">Pesquisar</button>
          </div>
          <div id="isbn-status" class="isbn-status" role="status" aria-live="polite"></div>
          <button type="button" id="cam-scan-btn" class="scan-connect" style="border-radius:var(--radius);margin-top:10px" ${CAMERA_SCAN_SUPPORTED?'':'hidden'} data-action="openCameraScan">📷 Ler com a câmara</button>
        </div>
        <div id="add-mode-titulo" hidden>
          <label class="scan-label" for="add-title">Título</label>
          <input id="add-title" class="add-line" type="text" placeholder="Ex.: Os Maias" data-oninput="resetTituloSearch" data-enter="searchTitulo">
          <label class="scan-label" for="add-author" style="margin-top:13px">Autor</label>
          <div class="search-row">
            <input id="add-author" type="text" placeholder="Ex.: Eça de Queirós" aria-describedby="titulo-status" data-oninput="resetTituloSearch" data-enter="searchTitulo">
            <button type="button" id="titulo-btn" class="scan-connect" style="border-radius:var(--radius)" data-action="searchTitulo">Procurar</button>
          </div>
          <div id="titulo-status" class="isbn-status" role="status" aria-live="polite"></div>
        </div>
        <div id="add-mode-manual" hidden>
          <div class="manual-form">
            <div class="efield"><label for="man-title">Título *</label><input id="man-title" type="text" placeholder="Ex.: Introdução à Psicologia Clínica" required></div>
            <div class="efield"><label for="man-author">Autor</label><input id="man-author" type="text" placeholder="Ex.: Julian Leff"></div>
            <div class="efield-row">
              <div class="efield"><label for="man-isbn">ISBN (opcional)</label><input id="man-isbn" type="text" inputmode="numeric" placeholder="978…"></div>
              <div class="efield"><label for="man-year">Ano</label><input id="man-year" type="text" inputmode="numeric" placeholder="2024" maxlength="4"></div>
            </div>
            <div class="efield"><label for="man-publisher">Editora</label><input id="man-publisher" type="text" placeholder="Ex.: Climepsi Editores"></div>
            <div class="efield"><label for="man-lib">Coleção / Localização</label><select id="man-lib"><option value="">Sem coleção</option></select></div>
            <div class="efield">
              <label>Quantidade</label>
              <div class="qty-row">
                <button type="button" class="qty-btn" data-action="manualQtyDec" aria-label="Diminuir quantidade">−</button>
                <span class="qty-val" id="man-qty">1</span>
                <button type="button" class="qty-btn" data-action="manualQtyInc" aria-label="Aumentar quantidade">+</button>
              </div>
            </div>
            <div class="efield">
              <label for="man-cover">URL da capa (opcional)</label>
              <div class="manual-cover-row">
                <div class="manual-cover-preview" id="man-cover-preview">📚</div>
                <div style="flex:1"><input id="man-cover" type="url" placeholder="https://… (cola o endereço da imagem)" data-oninput="previewManualCover"></div>
              </div>
            </div>
            <div class="efield"><label for="man-notes">Notas</label><textarea id="man-notes" rows="2" placeholder="Notas pessoais sobre este livro…"></textarea></div>
            <div id="man-status" class="isbn-status" role="status" aria-live="polite"></div>
            <button type="button" class="scan-connect" style="border-radius:var(--radius);width:100%;justify-content:center" data-action="confirmManualAdd">Arrumar na estante</button>
          </div>
        </div>
      </div>
    </div>

    <p class="io-moved">Exportar, importar e cópias de segurança estão agora no menu da tua conta, no canto superior direito. Para colar uma lista de desejos, vai à <button type="button" class="col-link" data-action="gotoWishImport">Wishlist</button></p>
  </section>`;
}
function focusScan(){ const i=$('scan-input'); if(i){ i.focus(); const s=$('scan-usb-status'); if(s) s.textContent='Pronto para scan'; } }

// alternar ISBN / Título+Autor
function setAddMode(btn,mode){
  btn.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected','false'));
  btn.setAttribute('aria-selected','true');
  const panels=['isbn','titulo','manual'];
  panels.forEach(p=>{ const el=$('add-mode-'+p); if(el) el.hidden=(p!==mode); });
  const focusMap={isbn:'add-isbn',titulo:'add-title',manual:'man-title'};
  const f=$(focusMap[mode]); if(f) f.focus();
  // Preencher o dropdown de coleções no formulário manual
  if(mode==='manual'){
    const sel=$('man-lib');
    if(sel && STATE.libs.length){
      sel.innerHTML='<option value="">Sem coleção</option>'+STATE.libs.map(l=>
        `<option value="${l.id}">${escHtml((l.icon?l.icon+' ':'')+l.name)}</option>`
      ).join('');
    }
  }
}

// ── ISBN: pesquisa real (lookupISBN) ───────────────────────────────────────
function resetIsbnSearch(){
  const s=$('isbn-status'); if(s){ s.className='isbn-status'; s.innerHTML=''; }
  const b=$('isbn-btn'); if(b){ b.disabled=false; b.textContent='Pesquisar'; }
  pendingBook=null;
}
async function searchIsbn(){
  const input=$('add-isbn'), status=$('isbn-status'), btn=$('isbn-btn');
  if(!input||!status||!btn) return;
  const raw=(input.value||'').replace(/[^0-9X]/gi,'');
  if(raw.length<10){ status.className='isbn-status is-error'; status.textContent='Introduz um ISBN válido (10 ou 13 dígitos).'; input.focus(); return; }
  btn.disabled=true; btn.textContent='A procurar…';
  status.className='isbn-status is-loading'; status.innerHTML='<span class="isbn-spin"></span>A procurar o livro…';
  const data=await lookupISBN(raw);
  btn.disabled=false; btn.textContent='Pesquisar';
  if(!data){ status.className='isbn-status is-error'; status.textContent='Livro não encontrado nas bases de dados.'; return; }
  pendingBook=data; showFound(status,data);
}
function showFound(statusEl,data){
  const initial=escHtml((data.title||'?').charAt(0).toUpperCase());
  const cover=data.cover?`<img src="${escAttr(data.cover)}" alt="" style="width:100%;height:100%;object-fit:cover">`:initial;
  statusEl.className='isbn-status';
  statusEl.innerHTML=`<div class="isbn-found">
    <span class="isbn-cover" aria-hidden="true">${cover}</span>
    <div class="isbn-found-body">
      <div class="isbn-found-title">${escHtml(data.title||'Livro encontrado')}</div>
      <div class="isbn-found-meta">${escHtml(data.author||'')}${data.goodreadsData?' · enriquecido Goodreads':''}</div>
    </div>
    <button type="button" class="isbn-add" data-action="confirmAdd">Adicionar à estante</button>
  </div>`;
}
async function confirmAdd(){
  if(!pendingBook) return;
  const libId=STATE.libs[0]?.id||'';
  const book=await DB.addBook({...pendingBook,library:libId,status:'nao-lido',added:new Date().toISOString()});
  unsavedChanges=true; await loadAll();
  const input=$('add-isbn'); if(input){ input.value=''; }
  const status=$('isbn-status'); if(status){ status.className='isbn-status is-done'; status.textContent='Adicionado à estante ✓ — pronto para o próximo.'; }
  pendingBook=null; saveToast('Livro adicionado',book&&book._merged);
  if(input) input.focus();   // volta o cursor à barra do ISBN para o próximo número
}

// ── Título/Autor: pesquisa real (searchByText) ─────────────────────────────
let tituloResults=[];
function resetTituloSearch(){
  const s=$('titulo-status'); if(s){ s.className='isbn-status'; s.innerHTML=''; }
  const b=$('titulo-btn'); if(b){ b.disabled=false; b.textContent='Procurar'; }
}
async function searchTitulo(){
  const ti=$('add-title'), au=$('add-author'), status=$('titulo-status'), btn=$('titulo-btn');
  if(!ti||!au||!status||!btn) return;
  const t=(ti.value||'').trim(), a=(au.value||'').trim();
  if(t.length<2){ status.className='isbn-status is-error'; status.textContent='Escreve o título do livro.'; ti.focus(); return; }
  btn.disabled=true; btn.textContent='A procurar…';
  status.className='isbn-status is-loading'; status.innerHTML='<span class="isbn-spin"></span>A procurar nas bases de dados…';
  tituloResults=await searchByText([t,a].filter(Boolean).join(' '));
  btn.disabled=false; btn.textContent='Procurar';
  if(!tituloResults.length){ status.className='isbn-status is-error'; status.textContent='Sem resultados.'; return; }
  status.className='isbn-status';
  status.innerHTML=tituloResults.map((r,i)=>{
    const initial=escHtml((r.title||'?').charAt(0).toUpperCase());
    const cover=r.cover?`<img src="${escAttr(r.cover)}" alt="" style="width:100%;height:100%;object-fit:cover">`:initial;
    return `<div class="isbn-found" style="margin-bottom:6px">
      <span class="isbn-cover" aria-hidden="true">${cover}</span>
      <div class="isbn-found-body"><div class="isbn-found-title">${escHtml(r.title)}</div><div class="isbn-found-meta">${escHtml(r.author||'')}${r.year?' · '+r.year:''}</div></div>
      <button type="button" class="isbn-add" data-action="confirmTituloAdd" data-idx="${i}">Adicionar</button></div>`;
  }).join('');
}
async function confirmTituloAdd(i){
  const r=tituloResults[i]; if(!r) return;
  const status=$('titulo-status');
  if(biblioReadsDisponivel&&r.title){
    try{ const url=await pesquisarGoodreadsPorISBN(`${r.title} ${r.author||''}`.trim());
      if(url){ const e=await enriquecerComGoodreads(url); r.goodreadsUrl=url; r.goodreadsData=e; r.goodreadsEnrichedAt=e.enriquecidoEm;
        if(!r.cover&&e.capa) r.cover=e.capa; if(!r.pagesTotal&&e.paginas) r.pagesTotal=e.paginas; } }catch(_){}
  }
  const libId=STATE.libs[0]?.id||'';
  const book=await DB.addBook({...r,library:libId,status:'nao-lido',added:new Date().toISOString()});
  unsavedChanges=true; await loadAll();
  const ti=$('add-title'), au=$('add-author');
  if(ti) ti.value=''; if(au) au.value='';
  if(status){ status.className='isbn-status is-done'; status.textContent='Adicionado à estante ✓ — pronto para o próximo.'; }
  saveToast('Livro adicionado',book&&book._merged);
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTRADA MANUAL (sem API) — formulário livre
// ═══════════════════════════════════════════════════════════════════════════
let manualQty=1;
function manualQtyInc(){ manualQty++; const el=$('man-qty'); if(el) el.textContent=manualQty; }
function manualQtyDec(){ if(manualQty>1) manualQty--; const el=$('man-qty'); if(el) el.textContent=manualQty; }
function previewManualCover(){
  const input=$('man-cover'), box=$('man-cover-preview');
  if(!input||!box) return;
  const url=(input.value||'').trim();
  if(url){
    box.textContent='';
    const img=document.createElement('img');
    img.src=url; img.alt='Pré-visualização da capa';
    img.addEventListener('error',()=>{ box.textContent='❌'; },{once:true});
    box.appendChild(img);
  } else box.textContent='📚';
}
async function confirmManualAdd(){
  const title=($('man-title')?.value||'').trim();
  if(!title){ const st=$('man-status'); if(st){ st.className='isbn-status is-error'; st.textContent='O título é obrigatório.'; } $('man-title')?.focus(); return; }
  const book={
    title,
    author:($('man-author')?.value||'').trim(),
    isbn:($('man-isbn')?.value||'').replace(/[^0-9X]/gi,''),
    publisher:($('man-publisher')?.value||'').trim(),
    year:($('man-year')?.value||'').trim(),
    library:$('man-lib')?.value||'',
    cover:($('man-cover')?.value||'').trim(),
    notes:($('man-notes')?.value||'').trim(),
    quantity:manualQty,
    status:'nao-lido',
    added:new Date().toISOString(),
  };
  const saved=await DB.addBook(book);
  unsavedChanges=true; await loadAll();
  // Reset do formulário
  ['man-title','man-author','man-isbn','man-year','man-publisher','man-cover','man-notes'].forEach(id=>{ const el=$(id); if(el) el.value=''; });
  manualQty=1; const qv=$('man-qty'); if(qv) qv.textContent='1';
  const box=$('man-cover-preview'); if(box) box.textContent='📚';
  const st=$('man-status'); if(st){ st.className='isbn-status is-done'; st.textContent='Adicionado à estante ✓ — pronto para o próximo.'; }
  saveToast('Livro adicionado',saved&&saved._merged);
  $('man-title')?.focus();
}

// ═══════════════════════════════════════════════════════════════════════════
// SCANNER — USB (Web Serial / leitor-teclado) + Bluetooth
// ═══════════════════════════════════════════════════════════════════════════
let btPort=null, btReader=null, btBuffer='';

async function procScan(raw){
  const isbn=raw.replace(/[^0-9X]/gi,'').slice(0,13);
  if(isbn.length<10) return;
  const st=$('scan-usb-status');
  const dup=STATE.books.find(b=>b.isbn===isbn);
  // Já está no catálogo: não precisa de nova pesquisa, só de somar 1 exemplar
  // (addBook trata a fusão — não reaproveitar dup como dados, para não repetir
  // a quantidade já existente).
  if(st) st.textContent=dup?'Já tens este — a somar exemplar…':'A procurar…';
  const data=dup?{isbn}:await lookupISBN(isbn);
  if(!data){ if(st) st.textContent='Não encontrado'; setTimeout(()=>{ if(st) st.textContent='Pronto para scan'; },1800); return; }
  const libId=STATE.libs[0]?.id||'';
  const book=await DB.addBook({...data,isbn,library:libId,status:'nao-lido',added:new Date().toISOString()});
  sessionAdded.unshift(book); unsavedChanges=true; await loadAll();
  if(st) st.textContent=(book&&book._merged?'Quantidade aumentada ✓ — ':'Adicionado ✓ — ')+((dup&&dup.title)||data.title||isbn);
  saveToast('Livro adicionado',book&&book._merged);
  setTimeout(()=>{ if(st) st.textContent='Pronto para scan'; },1800);
}
function toggleBt(btn){ if(btPort) disconnectBT(); else connectBT(btn); }
async function connectBT(btn){
  if(!navigator.serial){ showToast('Web Serial não suportado neste browser'); return; }
  try{
    btPort=await navigator.serial.requestPort();
    await btPort.open({baudRate:9600});
    btReader=btPort.readable.getReader();
    const s=$('bt-state'); if(s) s.textContent='Ligado';
    if(btn){ btn.textContent='Desligar'; btn.classList.add('on'); }
    readBT();
  }catch(e){ showToast('Erro BT: '+e.message); }
}
async function readBT(){
  const dec=new TextDecoder();
  try{
    while(true){
      const {value,done}=await btReader.read(); if(done) break;
      btBuffer+=dec.decode(value);
      if(btBuffer.includes('\n')||btBuffer.includes('\r')){ const isbn=btBuffer.replace(/\s/g,''); btBuffer=''; if(isbn) procScan(isbn); }
    }
  }catch{}
}
async function disconnectBT(){
  try{ if(btReader){ await btReader.cancel(); btReader=null; } if(btPort){ await btPort.close(); btPort=null; } }catch{}
  const s=$('bt-state'); if(s) s.textContent='Desligado';
  const b=$('bt-btn'); if(b){ b.textContent='Ligar'; b.classList.remove('on'); }
}

// ── Scanner por câmara do telemóvel (BarcodeDetector nativo) ───────────────
let camStream=null, camRAF=null;
async function openCameraScan(){
  if(!CAMERA_SCAN_SUPPORTED){ showToast('Câmara não suportada neste browser'); return; }
  const overlay=$('cam-scan'), video=$('cam-video'), status=$('cam-scan-status');
  if(!overlay||!video) return;
  try{ camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); }
  catch(e){ showToast('Sem acesso à câmara: '+e.message); return; }
  video.srcObject=camStream;
  overlay.classList.add('open');
  if(status) status.textContent='Aponta a câmara ao código de barras';
  const detector=new BarcodeDetector({formats:['ean_13']});
  const tick=async()=>{
    if(!camStream) return; // fechada entretanto
    try{
      const codes=await detector.detect(video);
      if(codes.length){ const isbn=codes[0].rawValue; closeCameraScan(); procScan(isbn); return; }
    }catch(_){}
    camRAF=requestAnimationFrame(tick);
  };
  camRAF=requestAnimationFrame(tick);
}
function closeCameraScan(){
  const overlay=$('cam-scan'), video=$('cam-video');
  if(overlay) overlay.classList.remove('open');
  if(camRAF){ cancelAnimationFrame(camRAF); camRAF=null; }
  if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; }
  if(video) video.srcObject=null;
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSÃO DE LEITURA — cronómetro flutuante + painel de progresso
// ═══════════════════════════════════════════════════════════════════════════
let readingState={ active:false, paused:false, bookId:null, bookTitle:'', bookCover:'', color:'slate',
  pagesStart:0, pagesCurrent:0, pagesTotal:0, elapsed:0, timerHandle:null };

function fmtTime(ms){ const s=Math.floor(ms/1000),m=Math.floor(s/60),h=Math.floor(m/60);
  return h>0?`${h}:${String(m%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

async function handleReadingBtn(bookId){
  if(readingState.active&&readingState.bookId===bookId){ openReadingPanel(); return; }
  if(readingState.active){ if(!confirm('Tens uma sessão activa noutro livro. Terminar e começar esta?')) return; await stopReadingSession(true); }
  const b=byId(bookId); if(b) startReadingSession(b);
}
function startReadingSession(book){
  Object.assign(readingState,{ active:true, paused:false, bookId:book.id, bookTitle:book.title||'', bookCover:book.cover||'', color:book.color||'slate',
    pagesStart:parseInt(book.pagesRead||0)||0, pagesCurrent:parseInt(book.pagesRead||0)||0, pagesTotal:parseInt(book.pages||book.pagesTotal||0)||0, elapsed:0 });
  localStorage.setItem('readingState',JSON.stringify({bookId:readingState.bookId,bookTitle:readingState.bookTitle,bookCover:readingState.bookCover,color:readingState.color,pagesStart:readingState.pagesStart,pagesCurrent:readingState.pagesCurrent,pagesTotal:readingState.pagesTotal}));
  startReadingTimer(); updateFloat(); $('reading-float').classList.add('visible');
  showToast('Sessão iniciada — '+book.title);
}
function startReadingTimer(){
  if(readingState.timerHandle) clearInterval(readingState.timerHandle);
  let last=Date.now();
  readingState.timerHandle=setInterval(()=>{ if(readingState.paused){ last=Date.now(); return; } const now=Date.now(); readingState.elapsed+=now-last; last=now; updateFloat(); updatePanel(); },1000);
}
function pauseReadingSession(){
  readingState.paused=!readingState.paused;
  const btn=$('rf-pause'); if(btn){ btn.textContent=readingState.paused?'▶':'⏸'; btn.setAttribute('aria-label',readingState.paused?'Retomar':'Pausar'); }
  showToast(readingState.paused?'Sessão em pausa':'Sessão retomada');
}
async function stopReadingSession(save){
  clearInterval(readingState.timerHandle);
  if(save&&readingState.bookId){
    const b=byId(readingState.bookId);
    const sessions=parseTags(b&&b.readingSessions||'[]').filter(Boolean);
    sessions.push({ date:new Date().toISOString(), duration:readingState.elapsed, pagesStart:readingState.pagesStart, pagesEnd:readingState.pagesCurrent });
    const upd={ pagesRead:readingState.pagesCurrent, pagesTotal:readingState.pagesTotal||(b&&b.pagesTotal)||0, readingSessions:JSON.stringify(sessions) };
    if(readingState.pagesTotal&&readingState.pagesCurrent>=readingState.pagesTotal){ upd.status='lido'; showToast('Livro terminado. Fica marcado como lido.'); }
    await DB.updateBook(readingState.bookId,upd); unsavedChanges=true; await loadAll();
  }
  Object.assign(readingState,{active:false,paused:false,bookId:null,elapsed:0});
  $('reading-float').classList.remove('visible'); localStorage.removeItem('readingState');
  if($('book-modal').classList.contains('open')) closeModal();
  rerender();
}
function updateFloat(){
  const el=$('reading-float'); if(!el||!readingState.active) return;
  const tEl=$('rf-timer'); if(tEl) tEl.textContent=fmtTime(readingState.elapsed);
  const titleEl=$('rf-title'); if(titleEl) titleEl.textContent=readingState.bookTitle;
  const cov=$('rf-cover');
  if(cov&&!cov.dataset.set){ cov.className='reading-float-cover c-'+readingState.color; cov.innerHTML=readingState.bookCover?`<img src="${escAttr(readingState.bookCover)}" alt="" style="width:100%;height:100%;object-fit:cover">`:escHtml((readingState.bookTitle||'?')[0]); cov.dataset.set='1'; }
  const p=readingState.pagesTotal?Math.round(readingState.pagesCurrent/readingState.pagesTotal*100):0;
  const fill=$('rf-progress-fill'); if(fill) fill.style.width=p+'%';
  const pg=$('rf-pg-current'); if(pg) pg.textContent='pág. '+readingState.pagesCurrent;
  const pp=$('rf-pg-pct'); if(pp) pp.textContent=p+'%';
}
function openReadingPanel(){
  openPanel(`
    <div class="edit-head">Sessão de leitura</div>
    <p class="lend-book">${escHtml(readingState.bookTitle)}</p>
    <div class="session-stats">
      <div class="session-stat"><div class="session-stat-num" id="rs-time">00:00</div><div class="session-stat-label">Tempo</div></div>
      <div class="session-stat"><div class="session-stat-num" id="rs-pages">0</div><div class="session-stat-label">Páginas</div></div>
      <div class="session-stat"><div class="session-stat-num" id="rs-pace">—</div><div class="session-stat-label">Pág/hora</div></div>
    </div>
    <label class="scan-label">Página onde estou agora</label>
    <div class="pages-input-wrap">
      <button class="pages-btn" data-action="updateReadingPages" data-arg="-1" aria-label="Diminuir">−</button>
      <div><div class="pages-display" id="pages-display">${readingState.pagesCurrent}</div><div class="pages-total">de ${readingState.pagesTotal||'—'} páginas</div></div>
      <button class="pages-btn" data-action="updateReadingPages" data-arg="1" aria-label="Aumentar">+</button>
    </div>
    <div class="edit-actions" style="margin-top:14px">
      <button type="button" class="btn-edit" data-action="saveReadingProgress">Guardar progresso</button>
      <button type="button" class="btn-delete" data-action="stopReadingSession">Terminar sessão</button>
    </div>`);
  updatePanel();
}
function updatePanel(){
  if(!$('book-modal').classList.contains('open')||!$('rs-time')) return;
  $('rs-time').textContent=fmtTime(readingState.elapsed);
  const read=Math.max(0,readingState.pagesCurrent-readingState.pagesStart);
  $('rs-pages').textContent=read;
  const hours=readingState.elapsed/3600000;
  $('rs-pace').textContent=hours>0.01?Math.round(read/hours):'—';
}
function updateReadingPages(d){
  readingState.pagesCurrent=Math.max(0,Math.min(readingState.pagesTotal||9999,readingState.pagesCurrent+d));
  const el=$('pages-display'); if(el) el.textContent=readingState.pagesCurrent;
  updateFloat(); updatePanel();
}
async function saveReadingProgress(){
  if(!readingState.bookId) return;
  await DB.updateBook(readingState.bookId,{pagesRead:readingState.pagesCurrent,pagesTotal:readingState.pagesTotal});
  unsavedChanges=true; await loadAll(); closeModal(); showToast('Progresso guardado');
}
function restoreReadingSession(){
  const saved=localStorage.getItem('readingState'); if(!saved) return;
  try{ const s=JSON.parse(saved); if(s.bookId){ Object.assign(readingState,s,{active:true,paused:true,elapsed:0}); updateFloat(); $('reading-float').classList.add('visible'); } }catch{}
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT / EXPORT / CÓPIA DE SEGURANÇA
// ═══════════════════════════════════════════════════════════════════════════
function openPanel(html){
  $('modal-body').innerHTML=html;
  lastFocusedEl=document.activeElement;
  $('book-modal').classList.add('open'); $('backdrop').classList.add('open'); document.body.style.overflow='hidden';
}
function exportCSV(){
  const B=STATE.books;
  const cols=['Título','Autor','Estado','Avaliação','Páginas','Páginas lidas','Editora','ISBN','Língua','Biblioteca','Adicionado'];
  const label=b=>b._shelf==='a-ler'?'A ler':b._shelf==='lido'?'Lido':'Para ler';
  const libName=id=>(STATE.libs.find(l=>l.id===id)||{}).name||'';
  const esc=v=>{ const s=String(v==null?'':v); return /[",\n;]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
  const rows=B.map(b=>[b.title,b.author,label(b),b.rating||'',b.pages||'',b.pagesRead||'',b.publisher||'',b.isbn||'',b.lang||'',libName(b.library),b.dateAdded||''].map(esc).join(','));
  const csv='\uFEFF'+cols.join(',')+'\n'+rows.join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='a-minha-estante-'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a); a.click(); a.remove();
  showToast('Estante exportada — '+B.length+' livros (CSV)');
}
async function saveJSON(){
  const [books,libs,wish]=await Promise.all([DB.getBooks(),DB.getLibs(),DB.getWish()]);
  const data={version:3,exported:new Date().toISOString(),books,libs,wish};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='biblioteca_'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); unsavedChanges=false; showToast('Cópia de segurança guardada');
}
function loadJSON(){ $('json-file-input').click(); }
async function handleJSONLoad(file){
  if(!file) return;
  try{
    if(file.size>20*1024*1024){ showToast('Ficheiro demasiado grande (max 20 MB)'); return; }
    const data=JSON.parse(await file.text());
    if(!data.books){ showToast('Ficheiro inválido'); return; }
    if(!confirm(`Carregar ${data.books.length} livros? Os dados actuais (locais) serão substituídos.`)) return;
    localStorage.setItem('books',JSON.stringify(data.books||[]));
    localStorage.setItem('libs',JSON.stringify(data.libs||[]));
    localStorage.setItem('wish',JSON.stringify(data.wish||[]));
    unsavedChanges=false; await refresh(); showToast('Dados restaurados');
  }catch(e){ showToast('Erro ao carregar: '+e.message); }
}
function openImport(){
  const libOpts=STATE.libs.map(l=>`<option value="${l.id}">${escHtml((l.icon?l.icon+' ':'')+l.name)}</option>`).join('');
  openPanel(`
    <div class="edit-head">Importar livros</div>
    <label class="scan-label" for="batch-isbns">Um ISBN por linha</label>
    <textarea id="batch-isbns" rows="6" placeholder="9789720040312&#10;9789722528237&#10;…" style="font-family:ui-monospace,monospace;font-size:.889rem;width:100%"></textarea>
    <label class="scan-label" for="batch-lib" style="margin-top:12px">Biblioteca de destino</label>
    <select id="batch-lib" style="width:100%">${libOpts||'<option value="">—</option>'}</select>
    <div id="batch-progress" style="display:none;margin-top:10px">
      <div class="progress-track"><div class="progress-bar" id="batch-bar" style="width:0%"></div></div>
      <p id="batch-status" class="isbn-status" aria-live="polite"></p>
    </div>
    <div class="edit-actions" style="margin-top:14px">
      <button type="button" class="btn-edit" data-action="runImport">Importar</button>
      <button type="button" class="btn-lend" data-action="closeModal">Fechar</button>
    </div>`);
}
async function runImport(){
  const txt=($('batch-isbns')||{}).value||'';
  const isbns=txt.split('\n').map(s=>s.trim().replace(/[^0-9X]/gi,'')).filter(s=>s.length>=10);
  if(!isbns.length){ showToast('Nenhum ISBN válido'); return; }
  const libId=($('batch-lib')||{}).value||'';
  const prog=$('batch-progress'), bar=$('batch-bar'), status=$('batch-status');
  if(prog) prog.style.display='block';
  let ok=0,err=0;
  for(let i=0;i<isbns.length;i++){
    try{ const data=await lookupISBN(isbns[i]);
      if(data){ await DB.addBook({...data,library:libId,status:'nao-lido',added:new Date().toISOString()}); ok++; } else err++;
    }catch{ err++; }
    if(bar) bar.style.width=Math.round((i+1)/isbns.length*100)+'%';
    if(status) status.textContent=`${i+1}/${isbns.length} — OK: ${ok} · Erros: ${err}`;
    await new Promise(r=>setTimeout(r,300));
  }
  unsavedChanges=true; await loadAll(); closeModal(); showToast(`Importados: ${ok} · Erros: ${err}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMINISTRAÇÃO (Fase 5) — só para quem está na coleção "admins".
// Mesmo que alguém force esta vista, a PocketBase recusa: as regras das
// coleções invites/users/admins é que protegem os dados, não o frontend.
// Cópias de segurança e registos ficam no painel /_/ (precisam de superutilizador).
// ═══════════════════════════════════════════════════════════════════════════
let isAdmin=false, adminSec='geral';
const ADMIN={ users:[], invites:[], admins:[], health:null, err:'' };
async function checkAdmin(){
  isAdmin=false;
  if(usePocketBase&&AUTH.user&&AUTH.user.id){
    try{ const d=await PB.req('GET',`admins/records?perPage=1&filter=${encodeURIComponent(`user="${AUTH.user.id}"`)}`); isAdmin=(d.items||[]).length>0; }catch(_){ isAdmin=false; }
  } else if(!usePocketBase){
    isAdmin=true;   // modo de demonstração: mostra a área com dados de exemplo
  }
  const it=$('am-admin'); if(it) it.hidden=!isAdmin;
}
function openAdmin(){
  closeAccountMenu();
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const fb=document.querySelector('.filter-bar'); if(fb) fb.style.display='none';
  currentView='admin'; renderAdmin(); loadAdminData(); window.scrollTo({top:0});
}
function setAdminSec(s){ adminSec=s; renderAdmin(); }
async function loadAdminData(){
  ADMIN.err='';
  if(!usePocketBase){
    ADMIN.users=[{id:'u1',email:'leitora@exemplo.pt',name:'Leitora',created:'2026-06-16'},{id:'u2',email:'convidado1@exemplo.pt',name:'Convidado 1',created:'2026-07-02'}];
    ADMIN.invites=[{id:'i1',email:'leitora@exemplo.pt',suspended:false},{id:'i2',email:'convidado1@exemplo.pt',suspended:false},{id:'i3',email:'convidado2@exemplo.pt',suspended:false,note:'Convite de 10/11'}];
    ADMIN.admins=[{user:'u1'}];
  } else {
    try{
      const [u,i,a]=await Promise.all([PB.getAll('users'),PB.getAll('invites'),PB.getAll('admins')]);
      ADMIN.users=u; ADMIN.invites=i; ADMIN.admins=a;
    }catch(e){ ADMIN.err='Não foi possível ler os utilizadores. A migração 1700000080 já foi aplicada no servidor?'; }
  }
  if(currentView==='admin') renderAdmin();
  if(!ADMIN.health) runHealth();
}
async function runHealth(){
  const probe=async(url)=>{ const t=performance.now();
    try{ const r=await fetch(url,{signal:AbortSignal.timeout(8000)}); return {ok:r.ok,ms:Math.round(performance.now()-t),code:r.status}; }
    catch(e){ return {ok:false,ms:Math.round(performance.now()-t),code:0}; } };
  ADMIN.health={running:true}; if(currentView==='admin') renderAdmin();
  if(!usePocketBase){ ADMIN.health={pb:{ok:true,ms:12},gb:{ok:true,ms:240},porbase:{ok:true,ms:610},gr:{ok:true,ms:4100}}; }
  else {
    const isbn='9789720046123';
    const [pb,gb,porbase,gr]=await Promise.all([probe(`${PB_URL}/api/health`),probe(`/api/google-books?q=isbn:${isbn}`),probe(`/api/porbase?id=${isbn}`),probe('/api/goodreads/')]);
    ADMIN.health={pb,gb,porbase,gr};
  }
  if(currentView==='admin') renderAdmin();
}
const ADMIN_CHECKS=[
  {id:'gbkey', t:'Restringir a chave do Google Books', p:'Na Google Cloud, limita a chave à Books API (e, se puderes, ao IP do servidor). A chave fica só no .env (GOOGLE_BOOKS_KEY), nunca no código.'},
  {id:'panel', t:'Proteger o painel /_/', p:'Põe o /_/ e o /api/admins atrás do Cloudflare Access (ou restringe por IP). O PocketBase 0.22 não limita tentativas de password.'},
  {id:'pwauth',t:'Desligar o login por email e password', p:'No painel: Collections → users → Options. Se só usas Google, deixa apenas o OAuth2.'},
  {id:'backup',t:'Fazer uma cópia de segurança', p:'No painel: Settings → Backups. Guarda uma cópia fora do servidor.'},
  {id:'share', t:'Testar o link público da estante', p:'Abre o teu link /c/… numa janela privada e confirma que só mostra título, autor, capa, coleção e estado.'},
];
function checkDone(id){ try{ const k='adminCheck:'+id; localStorage.getItem(k)?localStorage.removeItem(k):localStorage.setItem(k,new Date().toISOString().slice(0,10)); }catch{} renderAdmin(); }
function adminState(email){
  const inv=ADMIN.invites.find(i=>(i.email||'').toLowerCase()===(email||'').toLowerCase());
  return inv;
}
async function sendInvite(){
  const inp=$('inv-email'); const email=(inp?.value||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ showToast('Escreve um email válido'); inp?.focus(); return; }
  if(ADMIN.invites.some(i=>(i.email||'').toLowerCase()===email)){ showToast('Esse email já tem convite'); return; }
  if(usePocketBase){
    try{ await PB.create('invites',{email,note:`Convite de ${AUTH.user?.name||AUTH.user?.email||'admin'}`}); }
    catch(e){ showToast('Não foi possível criar o convite'); return; }
    await loadAdminData();
  } else { ADMIN.invites.push({id:'i'+Date.now(),email,suspended:false}); renderAdmin(); }
  showToast(`Convite criado. ${email} já pode entrar com Google.`);
}
async function toggleInvite(id){
  const inv=ADMIN.invites.find(i=>i.id===id); if(!inv) return;
  const suspended=!inv.suspended;
  if(suspended&&!confirm(`Suspender ${inv.email}? Deixa de conseguir entrar (a sessão atual termina quando expirar).`)) return;
  if(usePocketBase){ try{ await PB.update('invites',id,{suspended}); }catch(e){ showToast('Não foi possível alterar'); return; } await loadAdminData(); }
  else { inv.suspended=suspended; renderAdmin(); }
  showToast(suspended?'Conta suspensa':'Conta reativada');
}
async function removeInvite(id){
  const inv=ADMIN.invites.find(i=>i.id===id); if(!inv) return;
  if(!confirm(`Retirar o convite de ${inv.email}?`)) return;
  if(usePocketBase){ try{ await PB.remove('invites',id); }catch(e){ showToast('Não foi possível retirar'); return; } await loadAdminData(); }
  else { ADMIN.invites=ADMIN.invites.filter(i=>i.id!==id); renderAdmin(); }
  showToast('Convite retirado');
}
function renderAdmin(){
  currentView='admin';
  const pend=ADMIN_CHECKS.filter(c=>{ try{ return !localStorage.getItem('adminCheck:'+c.id); }catch{ return true; } }).length;
  const secs=[['geral','Visão geral'],['pessoas','Pessoas e convites'],['verificacoes','Verificações']];
  const nav=secs.map(([k,l])=>`<button type="button" class="adm-tab" data-action="adminSec" data-arg="${k}" ${adminSec===k?'aria-current="true"':''}>${l}${k==='verificacoes'&&pend?` <span class="adm-badge">${pend}</span>`:''}</button>`).join('');
  const st=(o,okTxt)=>!o?'<span class="adm-wait">A verificar…</span>':o.ok?`<span class="adm-ok">${okTxt} · <span class="num">${o.ms}</span> ms</span>`:`<span class="adm-bad">Sem resposta${o.code?` (${o.code})`:''}</span>`;
  let body='';
  if(adminSec==='geral'){
    const H=ADMIN.health||{};
    const slow=H.gr&&H.gr.ok&&H.gr.ms>3000;
    body=`<div class="adm-panel"><div class="adm-panel-head"><h2>Estado dos serviços</h2><button type="button" class="adm-link" data-action="runHealth">Verificar de novo</button></div>
      <div class="adm-tiles">
        <div class="adm-tile"><div class="adm-k">PocketBase</div>${st(H.pb,'A responder')}</div>
        <div class="adm-tile"><div class="adm-k">Google Books</div>${st(H.gb,'A responder')}</div>
        <div class="adm-tile"><div class="adm-k">PORBASE</div>${st(H.porbase,'A responder')}</div>
        <div class="adm-tile"><div class="adm-k">Goodreads (BiblioReads)</div>${slow?`<span class="adm-warn">Lento · <span class="num">${H.gr.ms}</span> ms</span>`:st(H.gr,'A responder')}</div>
      </div></div>
      <div class="adm-panel"><h2>Resumo</h2><ul class="adm-facts">
        <li><strong class="num">${ADMIN.users.length}</strong> ${ADMIN.users.length===1?'conta':'contas'} · <strong class="num">${ADMIN.invites.filter(i=>!i.suspended).length}</strong> convites ativos · <strong class="num">${ADMIN.invites.filter(i=>i.suspended).length}</strong> suspensos</li>
        <li><strong class="num">${STATE.books.length}</strong> livros na tua estante · <strong class="num">${STATE.libs.length}</strong> coleções</li>
        <li>Entrada: <strong>só por convite</strong>. Quem não tiver convite vê «Esta conta Google não foi convidada».</li>
      </ul></div>
      <div class="adm-panel"><h2>Painel do PocketBase</h2><p class="adm-hint">Cópias de segurança, registos e definições ficam no painel, com a conta de administrador do PocketBase.</p>
        <a class="adm-btn" href="/_/" target="_blank" rel="noopener">Abrir o painel</a></div>`;
  }
  if(adminSec==='pessoas'){
    const adminIds=new Set(ADMIN.admins.map(a=>a.user));
    const rows=ADMIN.invites.slice().sort((a,b)=>(a.email||'').localeCompare(b.email||'')).map(i=>{
      const u=ADMIN.users.find(x=>(x.email||'').toLowerCase()===(i.email||'').toLowerCase());
      const adm=u&&adminIds.has(u.id);
      const estado=adm?'<span class="adm-ok">Admin</span>':i.suspended?'<span class="adm-bad">Suspensa</span>':u?'<span class="adm-ok">Ativa</span>':'<span class="adm-warn">Convite por aceitar</span>';
      const acoes=adm?'':`${u?'':`<button type="button" class="adm-link" data-action="removeInvite" data-id="${i.id}">Retirar convite</button>`}<button type="button" class="adm-link" data-action="toggleInvite" data-id="${i.id}">${i.suspended?'Reativar':'Suspender'}</button>`;
      return `<tr><td><strong>${escHtml(u?.name||i.email.split('@')[0])}</strong><br><span class="adm-sub">${escHtml(i.email)}</span></td><td>${estado}</td><td class="num">${u?fmtDate(u.created):'—'}</td><td class="adm-actions">${acoes}</td></tr>`;
    }).join('');
    const orfas=ADMIN.users.filter(u=>!adminState(u.email)&&!adminIds.has(u.id));
    body=`<div class="adm-panel"><h2>Pessoas</h2><p class="adm-hint">Cada pessoa só vê a sua própria estante. Suspender impede novas entradas.</p>
      ${ADMIN.err?`<p class="adm-bad">${ADMIN.err}</p>`:''}
      <div class="adm-table-wrap"><table class="adm-table"><thead><tr><th scope="col">Pessoa</th><th scope="col">Estado</th><th scope="col">Conta criada</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead><tbody>${rows||'<tr><td colspan="4">Ainda sem convites.</td></tr>'}</tbody></table></div>
      ${orfas.length?`<p class="adm-warn" style="margin-top:12px">${orfas.length} ${orfas.length===1?'conta não tem':'contas não têm'} convite e não ${orfas.length===1?'consegue':'conseguem'} voltar a entrar: ${orfas.map(u=>escHtml(u.email)).join(', ')}.</p>`:''}
      </div>
      <div class="adm-panel"><h2>Convidar alguém</h2>
        <form class="adm-form" data-onsubmit="sendInvite"><label for="inv-email">Email da conta Google</label>
        <div class="adm-row"><input id="inv-email" type="email" required placeholder="nome@gmail.com" autocomplete="off"><button type="submit" class="adm-btn">Criar convite</button></div>
        <p class="adm-hint">A pessoa entra neste site com esta conta Google. Não é enviado nenhum email: avisa-a tu.</p></form></div>`;
  }
  if(adminSec==='verificacoes'){
    body=`<div class="adm-panel"><h2>Verificações</h2><p class="adm-hint">Coisas que ficaram por fazer. Marca-as quando estiverem feitas (fica guardado neste browser).</p>
      <ul class="adm-checks">${ADMIN_CHECKS.map(c=>{ let done=''; try{ done=localStorage.getItem('adminCheck:'+c.id)||''; }catch{}
        return `<li class="${done?'is-done':''}"><span class="${done?'adm-ok':'adm-warn'}">${done?'Feito':'Por fazer'}</span><div><strong>${c.t}</strong><p>${c.p}</p>${done?`<p class="adm-sub">Marcado a ${fmtDate(done)}</p>`:''}</div>
        <button type="button" class="adm-link" data-action="checkDone" data-arg="${c.id}">${done?'Desmarcar':'Marcar como feito'}</button></li>`; }).join('')}</ul></div>`;
  }
  $('main').innerHTML=`<section class="adm"><div class="adm-head"><div class="board-kicker">Só tu vês esta área</div><h1 class="board-title">Administração</h1></div>
    <nav class="adm-nav" aria-label="Secções da administração">${nav}</nav>${body}</section>`;
}
function showLoginNotice(msg){
  showToast(msg);
  const gate=document.querySelector('#login-gate .login-box');
  if(gate&&!$('login-notice')){ const p=document.createElement('p'); p.id='login-notice'; p.className='login-notice'; p.setAttribute('role','alert'); p.textContent=msg; gate.appendChild(p); }
  else if($('login-notice')) $('login-notice').textContent=msg;
}
// ═══════════════════════════════════════════════════════════════════════════
// NAVEGAÇÃO
// ═══════════════════════════════════════════════════════════════════════════
const VIEWS={ catalogo:buildShelves, stats:renderResumo, adicionar:renderAdd, colecoes:renderCollections, wishlist:renderWishlist, admin:renderAdmin };
function setNav(btn,view){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const v=view||'catalogo'; currentView=v;
  const fb=document.querySelector('.filter-bar'); if(fb) fb.style.display=(v==='catalogo')?'':'none';
  if(v==='catalogo') renderFilterChips();
  (VIEWS[v]||buildShelves)(); window.scrollTo({top:0});
}
function gotoAdd(){
  const addBtn=Array.prototype.find.call(document.querySelectorAll('.nav-btn'),b=>/adicionar/i.test(b.textContent));
  if(addBtn) setNav(addBtn,'adicionar'); else renderAdd();
}
function refreshALerCount(){ const el=$('aler-count'); if(el) el.textContent=STATE.books.filter(b=>b._shelf==='a-ler').length; }
function gotoALer(){
  const navBtns=document.querySelectorAll('.nav-btn'); navBtns.forEach(b=>b.classList.remove('active'));
  if(navBtns[0]) navBtns[0].classList.add('active'); currentView='catalogo';
  const fb=document.querySelector('.filter-bar'); if(fb) fb.style.display='';
  activeFilter='a-ler'; renderFilterChips(); buildShelves(); window.scrollTo({top:0});
}

// ═══════════════════════════════════════════════════════════════════════════
// AMBIENTES + TEMA (persistente em localStorage)
// "noturna" é o tema escuro: também liga data-theme="dark", por isso as regras
// escuras que já existiam continuam a funcionar. applyTheme/toggleTheme ficam
// por compatibilidade (o valor antigo 'theme'='dark' passa a "noturna").
// ═══════════════════════════════════════════════════════════════════════════
const AMBIENTES=[
  {id:'outono',  nome:'Outono acolhedor',  wall:'#efe2cc', wood:'#8a5a32'},
  {id:'noturna', nome:'Biblioteca noturna',wall:'#1d2f2a', wood:'#3e2716'},
  {id:'gabinete',nome:'Gabinete',          wall:'#dde3d2', wood:'#c9a678'},
  {id:'chuva',   nome:'Sótão de chuva',    wall:'#cfd8e0', wood:'#7d7266'},
];
function setAmbiente(id){
  if(!AMBIENTES.some(a=>a.id===id)) id='outono';
  const root=document.documentElement;
  root.setAttribute('data-ambiente',id);
  if(id==='noturna') root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
  try{ localStorage.setItem('ambiente',id); localStorage.removeItem('theme'); }catch{}
  renderAmbienteGrid();
}
function renderAmbienteGrid(){
  const g=$('amb-grid'); if(!g) return;
  const cur=document.documentElement.getAttribute('data-ambiente')||'outono';
  g.innerHTML=AMBIENTES.map(a=>`<button type="button" class="amb" aria-pressed="${a.id===cur}" data-action="setAmbiente" data-arg="${a.id}">
    <span class="sw" style="background:${a.wall};border-bottom:5px solid ${a.wood}" aria-hidden="true"><i style="height:20px;background:#7a3b2e"></i><i style="height:26px;background:#2f4f5e"></i><i style="height:18px;background:#9c6a22"></i><i style="height:24px;background:#3d5c40"></i></span>${a.nome}</button>`).join('');
}
function initAmbiente(){
  let id='';
  try{ id=localStorage.getItem('ambiente')||(localStorage.getItem('theme')==='dark'?'noturna':''); }catch{}
  if(!id) id=(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'noturna':'outono';
  setAmbiente(id);
}
function applyTheme(theme){ setAmbiente(theme==='dark'?'noturna':'outono'); }
function toggleTheme(){ setAmbiente(document.documentElement.getAttribute('data-ambiente')==='noturna'?'outono':'noturna'); }
function toggleAccountMenu(force){
  const m=$('account-menu'), b=$('top-reader'); if(!m||!b) return;
  const open=force===undefined?m.hidden:force;
  m.hidden=!open; b.setAttribute('aria-expanded',String(open));
  if(open) renderAmbienteGrid();
}
function closeAccountMenu(){ const m=$('account-menu'); if(m&&!m.hidden) toggleAccountMenu(false); }
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeAccountMenu(); });

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN — Google OAuth (PocketBase, PKCE) com fallback offline
// ═══════════════════════════════════════════════════════════════════════════
function showLoginScreen(){
  const gate=$('login-gate'); if(!gate) return;
  gate.classList.remove('hidden'); gate.setAttribute('aria-hidden','false');
  document.documentElement.style.overflow='hidden';
}
function hideLoginScreen(){
  const gate=$('login-gate'); if(!gate) return;
  gate.classList.add('hidden'); gate.setAttribute('aria-hidden','true');
  document.documentElement.style.overflow='';
}
function setReaderChip(name){
  const av=$('top-reader-av'), nm=$('top-reader-name'), chip=$('top-reader');
  const initial=(name||'M').trim().charAt(0).toUpperCase();
  if(av){ av.textContent=initial; av.style.background='var(--green-mid)'; }
  if(nm) nm.textContent=(name&&name.includes('@'))?name.split('@')[0]:(name||'Conta');
  if(chip) chip.hidden=false;
  const lo=$('am-logout'), ls=$('am-logout-sep'); if(lo) lo.hidden=false; if(ls) ls.hidden=false;
  checkAdmin();
}
// Entrada principal do gate (botão "Entrar com Google")
async function doLogin(e){
  if(e&&e.preventDefault) e.preventDefault();
  if(AUTH_REQUIRED&&usePocketBase){ return startGoogleLogin(); }
  // modo offline / demonstração (file://): entra com perfil local
  await enterApp('Visitante');
}
async function startGoogleLogin(){
  try{
    const r=await fetch(`${PB_URL}/api/collections/users/auth-methods`);
    const m=await r.json();
    const providers=m.authProviders||(m.oauth2&&m.oauth2.providers)||[];
    const google=providers.find(p=>p.name==='google');
    if(!google){ showToast('Google OAuth não está configurado na PocketBase'); return; }
    sessionStorage.setItem(AUTH.STATE_KEY,google.state);
    sessionStorage.setItem(AUTH.VERIFIER_KEY,google.codeVerifier);
    // Redirect full-page: o Google devolve o utilizador à raiz da SPA com ?code=.
    // A SPA detecta o code no boot e troca-o via PocketBase API.
    const REDIRECT=location.origin+'/';   // produção: o teu domínio · teste local: http://localhost:8080/
    const base=(google.authURL||google.authUrl||'').replace(/redirect_uri=[^&]*/,'redirect_uri='+encodeURIComponent(REDIRECT));
    location.href=base;
  }catch(err){ showToast('Erro a iniciar login: '+err.message); }
}
async function handleOAuthCallback(){
  const params=new URLSearchParams(location.search);
  const code=params.get('code'), state=params.get('state');
  if(!code||!state) return false;
  const savedState=sessionStorage.getItem(AUTH.STATE_KEY);
  const verifier=sessionStorage.getItem(AUTH.VERIFIER_KEY);
  if(!savedState||state!==savedState){ showToast('Falha de validação no login'); return false; }
  // Troca o code pelo token via endpoint real do PocketBase 0.22.
  // redirectUrl DEVE coincidir com o que foi enviado ao Google em startGoogleLogin().
  const redirectUrl=location.origin+'/';
  try{
    const r=await fetch(`${PB_URL}/api/collections/users/auth-with-oauth2`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({provider:'google',code,codeVerifier:verifier,redirectUrl})});
    if(!r.ok){
      let msg='HTTP '+r.status;
      try{ const j=await r.json(); if(j&&j.message) msg=j.message; }catch(_){}
      history.replaceState({},'',location.pathname);
      if(r.status===403){ showLoginNotice(msg); return false; }
      throw new Error(msg);
    }
    const data=await r.json();
    AUTH.token=data.token; AUTH.user=data.record;
    history.replaceState({},'',location.pathname);
    return true;
  }catch(err){ showToast('Erro no login Google: '+err.message); return false; }
}
function logout(){
  AUTH.clear();
  if(AUTH_REQUIRED){ location.reload(); return; }
  showLoginScreen();
  const lo=$('am-logout'), ls=$('am-logout-sep'); if(lo) lo.hidden=true; if(ls) ls.hidden=true;
}

function seedDefaultLibs(){
  if(STATE.libs.length) return;
  ['Sala','Escritório','Quarto'].forEach(name=>LOCAL.addLib({name,icon:'📚',desc:''}));
}

// Dados de DEMONSTRAÇÃO — iguais ao preview. Só carregam em modo offline
// (file:// ou PocketBase indisponível) quando a base local ainda está vazia.
// Em produção com PocketBase, NUNCA correm: vês os teus livros reais.
const DEMO_SEED = {
 "books": [
  {
   "id": "1",
   "isbn": "9789722522489",
   "title": "O Crime do Padre Amaro",
   "author": "Eça de Queirós",
   "publisher": "Bertrand Editora",
   "lang": "PT",
   "status": "a-ler",
   "pagesTotal": 528,
   "pagesRead": 185,
   "rating": 0,
   "synopsis": "Padre Amaro, um jovem seminarista, é enviado para a pequena cidade de Leiria, onde começa um caso amoroso com Amélia, filha de uma devota feligresa. Uma obra devastadora que expõe a hipocrisia e a corrupção moral da Igreja Católica portuguesa do século XIX.",
   "notes": "",
   "color": "navy",
   "gr": {
    "avg": 4.1,
    "reviews": 28400,
    "dist": [
     48,
     32,
     14,
     4,
     2
    ]
   },
   "dateAdded": "15/01/2026",
   "library": "lib1",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "2",
   "isbn": "9789722054881",
   "title": "A Montanha Mágica",
   "author": "Thomas Mann",
   "publisher": "D. Quixote",
   "lang": "PT",
   "status": "a-ler",
   "pagesTotal": 854,
   "pagesRead": 120,
   "rating": 0,
   "synopsis": "Hans Castorp visita o seu primo num sanatório nos Alpes suíços e acaba por ficar sete anos. A montanha torna-se uma metáfora da Europa pré-guerra — um mundo isolado onde se confrontam ideias filosóficas, políticas e existenciais.",
   "notes": "",
   "color": "brown",
   "gr": {
    "avg": 4,
    "reviews": 142000,
    "dist": [
     42,
     34,
     16,
     5,
     3
    ]
   },
   "dateAdded": "02/03/2026",
   "library": "lib3",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "3",
   "isbn": "9789722107501",
   "title": "Ensaio sobre a Cegueira",
   "author": "José Saramago",
   "publisher": "Caminho",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 352,
   "pagesRead": 0,
   "rating": 5,
   "synopsis": "Uma cidade é subitamente assolada por uma epidemia de cegueira branca. Uma mulher, única que mantém a visão, acompanha o marido ao quarentena onde assistirá ao colapso da civilização e à bestialidade humana.",
   "notes": "Devastador e belo. Uma parábola sobre a condição humana que não abandona a memória.",
   "color": "terra",
   "gr": {
    "avg": 4.1,
    "reviews": 386000,
    "dist": [
     47,
     31,
     14,
     5,
     3
    ]
   },
   "dateAdded": "18/06/2026",
   "library": "lib1",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "4",
   "isbn": "9789723713916",
   "title": "Mensagem",
   "author": "Fernando Pessoa",
   "publisher": "Assírio & Alvim",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 128,
   "pagesRead": 0,
   "rating": 5,
   "synopsis": "O único livro em português publicado em vida por Fernando Pessoa. Uma visão mítica e simbólica da história de Portugal, desde as origens até ao Quinto Império — uma meditação sobre o destino grandioso e a melancolia de uma nação.",
   "notes": "",
   "color": "gold",
   "gr": {
    "avg": 4.2,
    "reviews": 18700,
    "dist": [
     52,
     28,
     12,
     5,
     3
    ]
   },
   "dateAdded": "22/11/2025",
   "library": "lib3",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "5",
   "isbn": "9789720455351",
   "title": "Os Maias",
   "author": "Eça de Queirós",
   "publisher": "Porto Editora",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 680,
   "pagesRead": 0,
   "rating": 5,
   "synopsis": "A saga de três gerações da família Maia serve de pretexto para uma crónica impiedosa da sociedade lisboeta do século XIX: a sua frivolidade, provincianismo e estagnação moral. Considerado o romance mais completo do realismo português.",
   "notes": "A crónica perfeita da decadência da sociedade lisboeta oitocentista.",
   "color": "burg",
   "gr": {
    "avg": 4.2,
    "reviews": 22100,
    "dist": [
     54,
     28,
     12,
     4,
     2
    ]
   },
   "dateAdded": "10/09/2025",
   "library": "lib2",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "6",
   "isbn": "9789896411503",
   "title": "Crime e Castigo",
   "author": "Fiódor Dostoiévski",
   "publisher": "Relógio D'Água",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 671,
   "pagesRead": 0,
   "rating": 5,
   "synopsis": "Raskólnikov, um ex-estudante de São Petersburgo, comete um assassínio na convicção de ser um homem superior às leis morais comuns. O romance segue o seu colapso psicológico e a inevitável busca pela redenção.",
   "notes": "Raskolnikov é um dos personagens mais perturbadores e fascinantes de toda a literatura.",
   "color": "slate",
   "gr": {
    "avg": 4.3,
    "reviews": 728000,
    "dist": [
     56,
     27,
     11,
     4,
     2
    ]
   },
   "dateAdded": "05/07/2025",
   "library": "lib2",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "7",
   "isbn": "9789722111355",
   "title": "A Jangada de Pedra",
   "author": "José Saramago",
   "publisher": "Caminho",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 360,
   "pagesRead": 0,
   "rating": 4,
   "synopsis": "A Península Ibérica desprende-se subitamente da Europa e deriva pelo Atlântico. Cinco personagens percorrem este novo continente à deriva, numa alegoria sobre a identidade ibérica e a relação com a Europa.",
   "notes": "",
   "color": "moss",
   "gr": {
    "avg": 4,
    "reviews": 34200,
    "dist": [
     41,
     33,
     17,
     6,
     3
    ]
   },
   "dateAdded": "14/04/2025",
   "library": "lib3",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "8",
   "isbn": "9789723713084",
   "title": "O Processo",
   "author": "Franz Kafka",
   "publisher": "Assírio & Alvim",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 256,
   "pagesRead": 0,
   "rating": 4,
   "synopsis": "Josef K. é preso numa manhã sem razão aparente e processado por uma lei e tribunal que nunca chegará a conhecer. Uma obra sobre a alienação, a culpa e o absurdo das estruturas de poder modernas.",
   "notes": "A burocracia como pesadelo existencial. K. somos todos nós.",
   "color": "rust",
   "gr": {
    "avg": 4,
    "reviews": 412000,
    "dist": [
     43,
     31,
     16,
     6,
     4
    ]
   },
   "dateAdded": "28/02/2025",
   "library": "lib1",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "9",
   "isbn": "9789896414597",
   "title": "Em Busca do Tempo Perdido",
   "author": "Marcel Proust",
   "publisher": "Relógio D'Água",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 3031,
   "pagesRead": 0,
   "rating": 5,
   "synopsis": "A obra monumental de Proust, em sete volumes, é uma reflexão sobre a memória, o tempo, o amor e a arte. O narrador evoca a sua vida desde a infância em Combray até à alta sociedade parisiense do início do século XX.",
   "notes": "",
   "color": "plum",
   "gr": {
    "avg": 4.2,
    "reviews": 98400,
    "dist": [
     50,
     28,
     13,
     5,
     4
    ]
   },
   "dateAdded": "11/12/2024",
   "library": "lib2",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "10",
   "isbn": "9789721005099",
   "title": "A Náusea",
   "author": "Jean-Paul Sartre",
   "publisher": "Europa-América",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 256,
   "pagesRead": 0,
   "rating": 4,
   "synopsis": "Antoine Roquentin, historiador isolado numa cidade francesa, começa a sentir uma estranha repulsa pelas coisas e pela sua própria existência. O diário da sua náusea é o manifesto literário do existencialismo sartriano.",
   "notes": "",
   "color": "olive",
   "gr": {
    "avg": 3.9,
    "reviews": 178000,
    "dist": [
     38,
     33,
     18,
     7,
     4
    ]
   },
   "dateAdded": "03/10/2024",
   "library": "lib3",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "11",
   "isbn": "9789726083290",
   "title": "Admirável Mundo Novo",
   "author": "Aldous Huxley",
   "publisher": "Antígona",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 311,
   "pagesRead": 0,
   "rating": 4,
   "synopsis": "No século XXV, a humanidade vive num estado totalitário onde a felicidade é garantida pelo condicionamento genético e pelo consumo de soma. Uma distopia sobre o perigo de uma sociedade que troca a liberdade pelo conforto.",
   "notes": "Distopia mais assustadora que 1984 — não porque nos forçam, mas porque queremos.",
   "color": "teal",
   "gr": {
    "avg": 4,
    "reviews": 892000,
    "dist": [
     44,
     30,
     16,
     6,
     4
    ]
   },
   "dateAdded": "19/08/2024",
   "library": "lib3",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "12",
   "isbn": "9789724147024",
   "title": "O Senhor dos Anéis",
   "author": "J.R.R. Tolkien",
   "publisher": "ASA",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 1178,
   "pagesRead": 0,
   "rating": 5,
   "synopsis": "A Terra Média é ameaçada pelo Senhor das Trevas Sauron e o seu Um Anel. Frodo Boleiro e a sua Sociedade partem numa jornada épica para destruir o Anel nas Fendas da Perdição. A obra fundadora da fantasia épica moderna.",
   "notes": "",
   "color": "forest",
   "gr": {
    "avg": 4.5,
    "reviews": 1640000,
    "dist": [
     62,
     23,
     9,
     3,
     3
    ]
   },
   "dateAdded": "07/06/2024",
   "library": "lib3",
   "added": "",
   "lent": true,
   "lentTo": "Convidado 1",
   "lentDate": "2026-05-25"
  },
  {
   "id": "13",
   "isbn": "9789726088219",
   "title": "A Peste",
   "author": "Albert Camus",
   "publisher": "Livros do Brasil",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 308,
   "pagesRead": 0,
   "rating": 5,
   "synopsis": "Oran, uma cidade argelina, é isolada por uma epidemia de peste. O Dr. Rieux e os seus companheiros lutam contra a doença num romance alegórico sobre a resistência humana ao absurdo, ao mal e à morte.",
   "notes": "Releio cada vez que o mundo piora. Ou seja, regularmente.",
   "color": "steel",
   "gr": {
    "avg": 4.1,
    "reviews": 647000,
    "dist": [
     48,
     29,
     14,
     5,
     4
    ]
   },
   "dateAdded": "15/03/2024",
   "library": "lib3",
   "added": "",
   "lent": true,
   "lentTo": "Convidado 2",
   "lentDate": "2026-05-02"
  },
  {
   "id": "14",
   "isbn": "9789722050982",
   "title": "Ficciones",
   "author": "Jorge Luis Borges",
   "publisher": "Quetzal",
   "lang": "PT",
   "status": "lido",
   "pagesTotal": 208,
   "pagesRead": 0,
   "rating": 5,
   "synopsis": "Colecção de contos labirínticos que exploram bibliotecas infinitas, mapas do tamanho do mundo, livros de areia, e jardins de caminhos que se bifurcam. A obra que fundou a literatura fantástica sul-americana.",
   "notes": "",
   "color": "wine",
   "gr": {
    "avg": 4.5,
    "reviews": 212000,
    "dist": [
     61,
     23,
     10,
     3,
     3
    ]
   },
   "dateAdded": "02/01/2024",
   "library": "lib3",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "15",
   "isbn": "9789722048996",
   "title": "Moby Dick",
   "author": "Herman Melville",
   "publisher": "Dom Quixote",
   "lang": "PT",
   "status": "nao-lido",
   "pagesTotal": 720,
   "pagesRead": 0,
   "rating": 0,
   "synopsis": "O capitão Ahab lidera a tripulação do Pequod numa obsessiva perseguição à baleia branca que lhe arrancou a perna. Um épico sobre a obsessão, a natureza e os limites da razão humana.",
   "notes": "",
   "color": "navy",
   "gr": {
    "avg": 3.5,
    "reviews": 418000,
    "dist": [
     31,
     28,
     21,
     11,
     9
    ]
   },
   "dateAdded": "",
   "library": "",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "16",
   "isbn": "9789896417512",
   "title": "Dom Quixote",
   "author": "Miguel de Cervantes",
   "publisher": "Relógio D'Água",
   "lang": "PT",
   "status": "nao-lido",
   "pagesTotal": 1072,
   "pagesRead": 0,
   "rating": 0,
   "synopsis": "Dom Quixote de la Mancha, enlouquecido pela leitura de romances de cavalaria, parte com o seu escudeiro Sancho Pança em aventuras imaginárias. Considerado o primeiro romance moderno e um dos mais influentes da literatura universal.",
   "notes": "",
   "color": "terra",
   "gr": {
    "avg": 3.9,
    "reviews": 284000,
    "dist": [
     38,
     29,
     18,
     9,
     6
    ]
   },
   "dateAdded": "",
   "library": "",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "17",
   "isbn": "9789896413248",
   "title": "Ulisses",
   "author": "James Joyce",
   "publisher": "Relógio D'Água",
   "lang": "PT",
   "status": "nao-lido",
   "pagesTotal": 933,
   "pagesRead": 0,
   "rating": 0,
   "synopsis": "Um único dia em Dublin — 16 de Junho de 1904 — visto através da consciência de Leopold Bloom, Stephen Dedalus e Molly Bloom. Considerado o romance mais ambicioso e influente do século XX.",
   "notes": "O grande desafio.",
   "color": "indigo",
   "gr": {
    "avg": 3.7,
    "reviews": 192000,
    "dist": [
     35,
     27,
     19,
     10,
     9
    ]
   },
   "dateAdded": "",
   "library": "lib2",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "18",
   "isbn": "9789722049924",
   "title": "Cem Anos de Solidão",
   "author": "Gabriel García Márquez",
   "publisher": "Dom Quixote",
   "lang": "PT",
   "status": "nao-lido",
   "pagesTotal": 471,
   "pagesRead": 0,
   "rating": 0,
   "synopsis": "A saga da família Buendía ao longo de sete gerações em Macondo, uma cidade imaginária na Colômbia. A obra-prima do realismo mágico latino-americano.",
   "notes": "",
   "color": "moss",
   "gr": {
    "avg": 4.1,
    "reviews": 1120000,
    "dist": [
     48,
     27,
     14,
     6,
     5
    ]
   },
   "dateAdded": "",
   "library": "",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "19",
   "isbn": "9789722049023",
   "title": "A Insustentável Leveza do Ser",
   "author": "Milan Kundera",
   "publisher": "Dom Quixote",
   "lang": "PT",
   "status": "nao-lido",
   "pagesTotal": 309,
   "pagesRead": 0,
   "rating": 0,
   "synopsis": "Tomáš, Tereza, Sabina e Franz vivem as suas vidas em Praga e no exílio durante a ocupação soviética da Checoslováquia. Um romance filosófico sobre o peso e a leveza da existência, o amor e a liberdade.",
   "notes": "",
   "color": "rose",
   "gr": {
    "avg": 4.1,
    "reviews": 362000,
    "dist": [
     47,
     29,
     15,
     6,
     3
    ]
   },
   "dateAdded": "",
   "library": "",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "20",
   "isbn": "9789726083207",
   "title": "1984",
   "author": "George Orwell",
   "publisher": "Antígona",
   "lang": "PT",
   "status": "nao-lido",
   "pagesTotal": 328,
   "pagesRead": 0,
   "rating": 0,
   "synopsis": "Winston Smith vive num mundo totalitário governado pelo Grande Irmão, onde a história é reescrita e o pensamento independente é crime. A distopia definitiva sobre vigilância, propaganda e o esmagamento do indivíduo.",
   "notes": "",
   "color": "slate",
   "gr": {
    "avg": 4.2,
    "reviews": 4200000,
    "dist": [
     52,
     27,
     12,
     5,
     4
    ]
   },
   "dateAdded": "",
   "library": "",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "21",
   "isbn": "9789724147031",
   "title": "O Hobbit",
   "author": "J.R.R. Tolkien",
   "publisher": "ASA",
   "lang": "PT",
   "status": "nao-lido",
   "pagesTotal": 310,
   "pagesRead": 0,
   "rating": 0,
   "synopsis": "Bilbo Boleiro, um hobbit pacato, é convencido pelo feiticeiro Gandalf a juntar-se a treze anões numa aventura para recuperar o tesouro guardado pelo dragão Smaug na Montanha Solitária.",
   "notes": "",
   "color": "gold",
   "gr": {
    "avg": 4.3,
    "reviews": 1580000,
    "dist": [
     55,
     26,
     11,
     4,
     4
    ]
   },
   "dateAdded": "",
   "library": "",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  },
  {
   "id": "22",
   "isbn": "9789726088875",
   "title": "O Apanhador no Centeio",
   "author": "J.D. Salinger",
   "publisher": "Livros do Brasil",
   "lang": "PT",
   "status": "nao-lido",
   "pagesTotal": 277,
   "pagesRead": 0,
   "rating": 0,
   "synopsis": "Holden Caulfield, um adolescente revoltado, foge do seu internato e passa três dias em Nova Iorque, numa deambulação que é um dos mais autênticos retratos da alienação juvenil da literatura do século XX.",
   "notes": "",
   "color": "rust",
   "gr": {
    "avg": 3.8,
    "reviews": 2280000,
    "dist": [
     36,
     29,
     18,
     10,
     7
    ]
   },
   "dateAdded": "",
   "library": "",
   "added": "",
   "lent": false,
   "lentTo": "",
   "lentDate": ""
  }
 ],
 "libs": [
  {
   "id": "lib1",
   "name": "Escritório",
   "icon": "📚",
   "desc": ""
  },
  {
   "id": "lib2",
   "name": "Universidade",
   "icon": "📚",
   "desc": ""
  },
  {
   "id": "lib3",
   "name": "Casa",
   "icon": "📚",
   "desc": ""
  }
 ],
 "wish": [
  {
   "id": "wish1",
   "title": "Klara e o Sol",
   "author": "Kazuo Ishiguro",
   "priority": "alta",
   "status": "desejado",
   "url": "",
   "cover": "",
   "notes": "Bertrand · 18,80 €"
  },
  {
   "id": "wish2",
   "title": "O Conto da Aia",
   "author": "Margaret Atwood",
   "priority": "alta",
   "status": "desejado",
   "url": "",
   "cover": "",
   "notes": "Almedina · 15,50 €"
  },
  {
   "id": "wish3",
   "title": "A Casa dos Espíritos",
   "author": "Isabel Allende",
   "priority": "média",
   "status": "comprado",
   "url": "",
   "cover": "",
   "notes": "Wook · 19,90 €"
  },
  {
   "id": "wish4",
   "title": "O Nome do Vento",
   "author": "Patrick Rothfuss",
   "priority": "média",
   "status": "desejado",
   "url": "",
   "cover": "",
   "notes": "Wook · 21,90 €"
  },
  {
   "id": "wish5",
   "title": "Sapiens",
   "author": "Yuval Noah Harari",
   "priority": "baixa",
   "status": "adicionado",
   "url": "",
   "cover": "",
   "notes": "Fnac · 22,00 €"
  }
 ],
 "loans": [
  {
   "id": "loan1",
   "book": "12",
   "who": "Convidado 1",
   "lentDate": "2026-05-25",
   "dueDate": "2026-06-25",
   "returnedDate": "",
   "returned": false
  },
  {
   "id": "loan2",
   "book": "13",
   "who": "Convidado 2",
   "lentDate": "2026-05-02",
   "dueDate": "2026-06-02",
   "returnedDate": "",
   "returned": false
  },
  {
   "id": "loan3",
   "book": "6",
   "who": "Convidado 3",
   "lentDate": "2026-04-10",
   "dueDate": "2026-05-10",
   "returnedDate": "2026-04-10",
   "returned": true
  }
 ]
};
function seedDemoData(){
  localStorage.setItem('books', JSON.stringify(DEMO_SEED.books));
  localStorage.setItem('libs',  JSON.stringify(DEMO_SEED.libs));
  localStorage.setItem('wish',  JSON.stringify(DEMO_SEED.wish));
  localStorage.setItem('loans', JSON.stringify(DEMO_SEED.loans));
}

// ── Entrar na app (depois de autenticado / offline) ────────────────────────
async function enterApp(readerName){
  hideLoginScreen();
  setReaderChip(readerName||(AUTH.user&&(AUTH.user.name||AUTH.user.email))||'Conta');
  await loadAll();
  if(!usePocketBase && !STATE.books.length){ seedDemoData(); await loadAll(); }
  else if(!STATE.libs.length){ seedDefaultLibs(); await loadAll(); }
  buildShelves();
  restoreReadingSession();
}

// ═══════════════════════════════════════════════════════════════════════════
// ARRANQUE
// ═══════════════════════════════════════════════════════════════════════════
// ── Vista pública /c/<token> — estante partilhada, sem login ───────────────
// Pedido sem Authorization a /api/partilha/<token> (pb_hooks/partilha.pb.js).
// É o servidor que escolhe os campos: só título, autor, capa, coleção, estado
// e quantidade. Notas, preço, empréstimos e sessões nunca saem.
async function fetchPublicShare(token){
  const res=await fetch(`${PB_URL}/api/partilha/${encodeURIComponent(token)}`);
  if(!res.ok) throw new Error('share indisponível');
  const data=await res.json();
  return {books:data.books||[], libs:data.libs||[]};
}
function publicShareHtml(books,libs){
  const libName=id=>{ const l=libs.find(x=>x.id===id); return l?((l.icon?l.icon+' ':'')+l.name):''; };
  const statusLabel={lido:'Lido','a-ler':'A ler'};
  const cards=books.map(b=>{
    const st=statusLabel[b.status]||'Por ler';
    const lib=libName(b.library);
    const cover=b.cover?`<img src="${escAttr(b.cover)}" alt="" loading="lazy">`:`<div class="pub-cover-fallback">${escHtml((b.title||'?').charAt(0))}</div>`;
    return `<div class="pub-card">
      <div class="pub-cover">${cover}</div>
      <div class="pub-title">${escHtml(b.title||'')}</div>
      <div class="pub-author">${escHtml(b.author||'')}</div>
      <div class="pub-meta">${escHtml(lib)}${lib?' · ':''}${st}${b.quantity>1?' · ×'+b.quantity:''}</div>
    </div>`;
  }).join('');
  return `<main class="pub-shelf">
    <header class="pub-head"><h1>📚 Uma coleção partilhada</h1><p>${books.length} livro${books.length===1?'':'s'}</p></header>
    <div class="pub-grid">${cards||'<p class="pub-empty">Sem livros para mostrar.</p>'}</div>
  </main>`;
}
async function renderPublicShare(token){
  document.body.innerHTML='<main class="pub-shelf"><p class="pub-loading">A carregar…</p></main>';
  try{
    const {books,libs}=await fetchPublicShare(token);
    document.body.innerHTML=publicShareHtml(books,libs);
  }catch(e){
    document.body.innerHTML='<main class="pub-shelf"><p class="pub-empty">Este link não existe ou já não está ativo.</p></main>';
  }
}

// Computador (≥900px): o menu passa para o cabeçalho; no telemóvel e tablet
// volta à barra de madeira em baixo. É o mesmo elemento (os cliques usam
// data-action), só muda de sítio.
function placeNav(){
  const inner=document.querySelector('.nav-inner'), top=document.querySelector('.top-bar'), base=document.querySelector('.bottom-baseboard');
  if(!inner||!top||!base) return;
  const desk=window.matchMedia('(min-width:900px)').matches;
  if(desk&&inner.parentElement!==top) top.insertBefore(inner, top.querySelector('.search-wrap'));
  if(!desk&&inner.parentElement!==base) base.appendChild(inner);
  document.body.classList.toggle('nav-top',desk);
}
if(window.matchMedia) window.matchMedia('(min-width:900px)').addEventListener('change',placeNav);

(async function init(){
  // Rota pública de partilha: nem passa pelo login, é só leitura.
  const shareMatch=location.pathname.match(/^\/c\/([^/]+)/);
  if(shareMatch){ await renderPublicShare(decodeURIComponent(shareMatch[1])); return; }
  placeNav();

  // PWA: regista o service worker (necessário para "Adicionar ao ecrã principal")
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }

  // tema persistido
  initAmbiente();

  await checkPB();
  verificarBiblioReads();   // não bloqueia

  // listeners estáticos
  const search=$('search-input');
  if(search) search.addEventListener('input',()=>{
    if(currentView!=='catalogo'){
      document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
      const cat=document.querySelector('.nav-btn'); if(cat) cat.classList.add('active');
      const fb=document.querySelector('.filter-bar'); if(fb) fb.style.display='';
    }
    buildShelves();
  });
  document.addEventListener('keydown',e=>{
    if(e.target&&e.target.id==='scan-input'&&e.key==='Enter'){ e.preventDefault(); const v=e.target.value; e.target.value=''; if(v) procScan(v); return; }
    if(e.key==='Escape'){ closeModal(); closeCameraScan(); }
  });
  document.addEventListener('keydown',trapModalFocus,true);
  const jf=$('json-file-input');
  if(jf) jf.addEventListener('change',e=>{ const f=e.target.files[0]; e.target.value=''; handleJSONLoad(f); });
  window.addEventListener('beforeunload',e=>{ if(unsavedChanges&&!usePocketBase){ e.preventDefault(); e.returnValue=''; } });

  // fluxo de autenticação
  if(AUTH_REQUIRED&&usePocketBase){
    if(location.search.includes('code=')){ const ok=await handleOAuthCallback(); if(ok){ await enterApp(); return; } }
    if(AUTH.isValid){ await enterApp(); return; }
    showLoginScreen();   // espera pelo botão Google
  }else{
    // offline / file:// — mostra o gate (botão entra em modo demonstração)
    showLoginScreen();
  }
})();


