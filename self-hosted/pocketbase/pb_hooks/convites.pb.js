/// <reference path="../pb_data/types.d.ts" />

// ════════════════════════════════════════════════════════════════════
//  Entrada só por convite (Fase 5)
//
//  - Login/registo com Google: só passa quem tiver um convite (coleção
//    "invites") não suspenso. Quem administra (coleção "admins") passa
//    sempre, para nunca ficar trancado fora.
//  - Instalação nova: enquanto a coleção "admins" estiver vazia, o primeiro
//    login com Google entra e fica como admin. Faz esse login logo a seguir
//    ao deploy, para ninguém se adiantar.
//  - Registo direto por email/password na API: mesma regra (fecha a porta
//    das traseiras). Pedidos feitos no painel /_/ (superutilizador) passam.
//
//  Nota PocketBase 0.22: cada handler corre isolado — não pode usar
//  funções ou variáveis declaradas fora dele, por isso a lógica repete-se.
// ════════════════════════════════════════════════════════════════════

onRecordBeforeAuthWithOAuth2Request((e) => {
  // 0) instalação nova (ainda sem admin): o primeiro login entra
  try {
    if ($app.dao().findRecordsByFilter("admins", "id != ''", "", 1, 0).length === 0) return;
  } catch (_) {}
  // 1) quem administra entra sempre
  if (e.record) {
    try {
      $app.dao().findFirstRecordByFilter("admins", "user = {:id}", { id: e.record.id });
      return;
    } catch (_) {}
  }
  // 2) os outros precisam de convite ativo
  let email = "";
  try { email = String(e.oAuth2User.email || ""); } catch (_) {}
  if (!email && e.record) { try { email = String(e.record.email() || ""); } catch (_) {} }
  email = email.trim().toLowerCase();

  let convite = null;
  if (email) {
    try { convite = $app.dao().findFirstRecordByFilter("invites", "email = {:email}", { email: email }); } catch (_) {}
  }
  if (!convite) {
    throw new ForbiddenError("Esta conta Google não foi convidada. Pede um convite a quem gere esta estante.");
  }
  if (convite.getBool("suspended")) {
    throw new ForbiddenError("Esta conta está suspensa. Fala com quem gere esta estante.");
  }
}, "users");

// Instalação nova: quem fez o primeiro login fica como admin.
onRecordAfterAuthWithOAuth2Request((e) => {
  try {
    if (!e.record) return;
    if ($app.dao().findRecordsByFilter("admins", "id != ''", "", 1, 0).length > 0) return;
    const admin = new Record($app.dao().findCollectionByNameOrId("admins"));
    admin.set("user", e.record.id);
    $app.dao().saveRecord(admin);
    const email = String(e.record.email() || "").trim().toLowerCase();
    if (email) {
      try { $app.dao().findFirstRecordByFilter("invites", "email = {:email}", { email: email }); }
      catch (_) {
        const inv = new Record($app.dao().findCollectionByNameOrId("invites"));
        inv.set("email", email); inv.set("suspended", false); inv.set("note", "Primeira conta (admin)");
        $app.dao().saveRecord(inv);
      }
    }
  } catch (_) {}
}, "users");

onRecordBeforeCreateRequest((e) => {
  // contas criadas no painel /_/ pelo superutilizador passam
  try {
    const info = $apis.requestInfo(e.httpContext);
    if (info && info.admin) return;
  } catch (_) {}

  let email = "";
  try { email = String(e.record.email() || "").trim().toLowerCase(); } catch (_) {}
  let convite = null;
  if (email) {
    try { convite = $app.dao().findFirstRecordByFilter("invites", "email = {:email}", { email: email }); } catch (_) {}
  }
  if (!convite || convite.getBool("suspended")) {
    throw new ForbiddenError("O registo só é possível com convite.");
  }
}, "users");

// Renovar a sessão (auth-refresh) segue a mesma regra do login: sem isto, uma
// conta suspensa continuava a entrar, porque a app renova a sessão sozinha.
// Quem administra passa sempre; os outros precisam de convite não suspenso.
onRecordBeforeAuthRefreshRequest((e) => {
  // instalação nova (ainda sem admin): não bloqueia
  try {
    if ($app.dao().findRecordsByFilter("admins", "id != ''", "", 1, 0).length === 0) return;
  } catch (_) {}
  if (e.record) {
    try {
      $app.dao().findFirstRecordByFilter("admins", "user = {:id}", { id: e.record.id });
      return;
    } catch (_) {}
  }
  let email = "";
  try { email = String(e.record.email() || "").trim().toLowerCase(); } catch (_) {}
  // Comparação sem maiúsculas/minúsculas: um convite antigo escrito com
  // maiúsculas não deve terminar a sessão de quem já tinha entrado.
  let convite = null;
  if (email) {
    try {
      const todos = $app.dao().findRecordsByFilter("invites", "email != ''", "", 1000, 0);
      for (const c of todos) {
        if (String(c.getString("email")).trim().toLowerCase() === email) { convite = c; break; }
      }
    } catch (_) {}
  }
  if (!convite) {
    throw new ForbiddenError("Esta conta já não tem convite. Fala com quem gere esta estante.");
  }
  if (convite.getBool("suspended")) {
    throw new ForbiddenError("Esta conta está suspensa. Fala com quem gere esta estante.");
  }
}, "users");
