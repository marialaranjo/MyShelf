/// <reference path="../pb_data/types.d.ts" />

// ── Proteção do painel /_/ (PocketBase 0.22) ────────────────────────────
// O PocketBase 0.22 não limita tentativas de password. Este hook corre
// dentro do próprio PocketBase, por isso protege o painel seja qual for o
// proxy (Nginx, Cloudflare ou nenhum):
//
//  1. Bloqueio por tentativas falhadas: 5 passwords erradas no login do
//     painel, a partir do mesmo IP, bloqueiam esse IP durante 15 minutos.
//     Um login certo limpa o contador desse IP.
//  2. Travão geral: 30 falhas no total (de qualquer IP) em 15 minutos
//     bloqueiam o login do painel para todos durante 15 minutos. Protege
//     contra quem troca de IP a cada tentativa.
//  3. Lista de IPs autorizados (opcional): com PB_ADMIN_ALLOW definido, o
//     painel (/_/) e a API dos administradores (/api/admins) só respondem
//     a esses IPs; para os outros, não existem (404).
//     Ex.: PB_ADMIN_ALLOW=192.168.1.0/24,203.0.113.7
//
// A app não é afetada: a área de Administração da app usa a coleção
// "admins" (/api/collections/admins), não estes endereços.
//
// IP real: atrás do Cloudflare usa-se o CF-Connecting-IP (o Cloudflare
// substitui-o sempre); sem Cloudflare, o X-Real-IP posto pelo Nginx.
// A lista de IPs autorizados só é de confiança quando TODO o tráfego passa
// pelo Cloudflare: quem chegasse ao Nginx por outro caminho podia inventar
// o CF-Connecting-IP. O bloqueio por tentativas tem o travão geral (2) para
// esse caso.
//
// Os contadores ficam em memória: reiniciar o PocketBase limpa os bloqueios.
//
// Nota: no PocketBase 0.22 cada handler corre isolado, por isso as
// funções auxiliares estão dentro do middleware e o estado partilhado
// fica em $app.store().

routerUse((next) => {
  return (c) => {
    const path = c.request().url.path || "";
    const isPanel = path === "/_" || path.indexOf("/_/") === 0 || path.indexOf("/api/admins") === 0;
    if (!isPanel) return next(c);

    const MAX_IP = 5, MAX_TOTAL = 30, WINDOW_MS = 15 * 60 * 1000, LOCK_MS = 15 * 60 * 1000;
    const now = Date.now();
    const h = c.request().header;
    const ip = String(h.get("CF-Connecting-IP") || h.get("X-Real-IP") || c.realIP() || "").trim();

    // ── 3) lista de IPs autorizados (só se PB_ADMIN_ALLOW estiver definido)
    const allow = String($os.getenv("PB_ADMIN_ALLOW") || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (allow.length) {
      const toNum = (a) => {
        const p = String(a).split(".");
        if (p.length !== 4) return null;
        let n = 0;
        for (const x of p) { const v = Number(x); if (!/^\d+$/.test(x) || v > 255) return null; n = n * 256 + v; }
        return n;
      };
      const ok = allow.some((rule) => {
        if (rule === ip) return true;
        const [base, bits] = rule.split("/");
        if (bits === undefined) return false;
        const b = Number(bits), ipN = toNum(ip), baseN = toNum(base);
        if (ipN === null || baseN === null || !(b >= 0 && b <= 32)) return false;
        const size = Math.pow(2, 32 - b);
        return Math.floor(ipN / size) === Math.floor(baseN / size);
      });
      if (!ok) throw new NotFoundError("Not found.");
    }

    // ── 1) e 2) só o login com password conta como tentativa
    const isLogin = c.request().method === "POST" && path === "/api/admins/auth-with-password";
    if (!isLogin) return next(c);

    const store = $app.store();
    const read = (k) => { try { const v = store.get(k); return v ? JSON.parse(v) : null; } catch (_) { return null; } };
    const keyIp = "painel:ip:" + ip, keyAll = "painel:total";
    const st = read(keyIp) || { n: 0, first: now, until: 0 };
    const all = read(keyAll) || { n: 0, first: now, until: 0 };

    if (st.until > now || all.until > now) {
      const min = Math.ceil((Math.max(st.until, all.until) - now) / 60000);
      throw new ApiError(429, "Demasiadas tentativas falhadas. Tenta de novo daqui a " + min + " min.");
    }

    try {
      next(c);
    } catch (err) {
      // password errada (ou outro erro): conta uma falha
      if (now - st.first > WINDOW_MS) { st.n = 0; st.first = now; }
      if (now - all.first > WINDOW_MS) { all.n = 0; all.first = now; }
      st.n++; all.n++;
      if (st.n >= MAX_IP) { st.until = now + LOCK_MS; st.n = 0; st.first = now; }
      if (all.n >= MAX_TOTAL) { all.until = now + LOCK_MS; all.n = 0; all.first = now; }
      store.set(keyIp, JSON.stringify(st));
      store.set(keyAll, JSON.stringify(all));
      throw err;
    }
    // login certo: limpa o contador deste IP
    store.remove(keyIp);
  };
});
