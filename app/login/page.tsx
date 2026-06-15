import { phraseOfTheDay } from "@/lib/inspiration";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ status?: string; error?: string }> }) {
  const params = await searchParams;
  const phrase = phraseOfTheDay();
  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand-card">
          <img src="/logo.png" alt="En Redes Andamos" />
          <div className="inspiration-box">
            <span>Inspiración del día</span>
            <p>“{phrase}”</p>
          </div>
        </div>
        <div className="login-card">
          <h1>Ingresar</h1>
          <p className="muted">Acceso con Gmail para equipo y clientes. Las nuevas cuentas quedan pendientes hasta aprobación de administración.</p>
          {params?.status === "pending" && <div className="notice warning"><b>Solicitud recibida.</b><br />Tu cuenta quedó pendiente de aprobación. La administradora debe asignarte rol o vincularte a un cliente.</div>}
          {params?.error && <div className="notice danger">No pudimos completar el ingreso con Google. Revisá la configuración OAuth.</div>}
          <div className="google-login-stack">
            <a className="google-btn" href="/api/auth/google/start?type=COLABORADOR">Continuar con Gmail como colaboradora</a>
            <a className="google-btn secondary" href="/api/auth/google/start?type=CLIENTE">Continuar con Gmail como cliente</a>
          </div>
          <div className="divider"><span>o usar acceso demo local</span></div>
          <form action="/api/auth/login" method="POST">
            <label>Email</label>
            <input name="email" type="email" defaultValue="admin@enredesandamos.com" />
            <br />
            <br />
            <label>Contraseña</label>
            <input name="password" type="password" defaultValue="Admin123!" />
            <div className="demo-access">
              <strong>Demo</strong>
              <span>Admin: admin@enredesandamos.com / Admin123!</span>
              <span>Cliente: cliente@soplodevida.com / Cliente123!</span>
            </div>
            <button style={{ width: "100%" }}>Entrar</button>
          </form>
        </div>
      </section>
    </main>
  );
}
