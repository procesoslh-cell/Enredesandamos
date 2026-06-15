import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient, updateClient } from "@/lib/actions";
import { money } from "@/lib/format";

const PAGE_SIZE = 20;

type PageProps = {
  searchParams?: Promise<{ q?: string; page?: string }>;
};

function safePage(value?: string) {
  const parsed = Number(value || "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "ER";
}

function ClientForm({ client }: { client?: any }) {
  const action = client ? updateClient : createClient;
  return (
    <form action={action} className="client-edit-form">
      {client ? <input type="hidden" name="id" defaultValue={client.id} /> : null}
      <div className="form-grid">
        <div><label>Razón social</label><input name="businessName" required defaultValue={client?.businessName || ""} /></div>
        <div><label>Nombre comercial</label><input name="commercialName" required defaultValue={client?.commercialName || ""} /></div>
        <div><label>CUIT</label><input name="taxId" defaultValue={client?.taxId || ""} /></div>
        <div><label>Email</label><input name="email" type="email" defaultValue={client?.email || ""} /></div>
        <div><label>Teléfono</label><input name="phone" defaultValue={client?.phone || ""} /></div>
        <div><label>WhatsApp</label><input name="whatsapp" defaultValue={client?.whatsapp || ""} /></div>
        <div><label>Dirección</label><input name="address" defaultValue={client?.address || ""} /></div>
        <div><label>Web</label><input name="website" defaultValue={client?.website || ""} /></div>
        <div><label>Logo / imagen liviana PNG o WebP</label><input name="logoUrl" placeholder="URL del logo optimizado" defaultValue={client?.logoUrl || ""} /></div>
        <div><label>Estado</label><select name="status" defaultValue={client?.status || "ACTIVO"}><option>ACTIVO</option><option>PAUSADO</option><option>INACTIVO</option></select></div>
        <div><label>Instagram</label><input name="instagram" defaultValue={client?.instagram || ""} /></div>
        <div><label>Facebook</label><input name="facebook" defaultValue={client?.facebook || ""} /></div>
        <div><label>TikTok</label><input name="tiktok" defaultValue={client?.tiktok || ""} /></div>
        <div><label>LinkedIn</label><input name="linkedin" defaultValue={client?.linkedin || ""} /></div>
        <div><label>YouTube</label><input name="youtube" defaultValue={client?.youtube || ""} /></div>
        <div><label>Carpeta Drive</label><input name="driveFolder" defaultValue={client?.driveFolder || ""} /></div>
        <div><label>Brandbook</label><input name="brandbookUrl" defaultValue={client?.brandbookUrl || ""} /></div>
        <div><label>Meta Business ID</label><input name="metaBusinessId" defaultValue={client?.metaBusinessId || ""} /></div>
        <div><label>Google Analytics</label><input name="googleAnalytics" defaultValue={client?.googleAnalytics || ""} /></div>
      </div>
      <div className="form-actions"><button>{client ? "Guardar cambios" : "Crear ficha 360°"}</button></div>
    </form>
  );
}

export default async function Page({ searchParams }: PageProps) {
  const gate = await requireModule("clientes");
  if (!g.ok) redirect("/home");

  const params = await searchParams;
  const q = (params?.q || "").trim();
  const page = safePage(params?.page);
  const where = q ? {
    OR: [
      { commercialName: { contains: q } },
      { businessName: { contains: q } },
      { taxId: { contains: q } },
      { email: { contains: q } },
      { instagram: { contains: q } }
    ]
  } : {};

  const [totalClients, clients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      include: { contracts: true, quotes: true, invoices: true, expenses: true, projects: true },
      orderBy: { commercialName: "asc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE
    })
  ]);
  const totalPages = Math.max(1, Math.ceil(totalClients / PAGE_SIZE));
  const from = totalClients ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, totalClients);
  const querySuffix = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <div className="content-card clients-module">
      <div className="topbar"><div><h1 className="section-title">Clientes 360°</h1><p className="muted">Buscador, fichas compactas, edición rápida, imagen de contacto y rentabilidad.</p></div><span className="pill">Vista contacto</span></div>

      <div className="client-toolbar card">
        <form className="client-search" action="/clientes">
          <input name="q" placeholder="Buscar por cliente, CUIT, email o red social..." defaultValue={q} />
          <button>Buscar</button>
          {q ? <a className="btn secondary" href="/clientes">Limpiar</a> : null}
        </form>
        <div className="client-counter"><b>{from}-{to}</b> / {totalClients} clientes</div>
        <details className="client-popup create-popup">
          <summary className="btn">Nuevo cliente</summary>
          <div className="popup-panel wide">
            <div className="popup-head"><h2>Nueva ficha de cliente</h2><span>Logo recomendado: PNG/WebP optimizado, menor a 300 KB.</span></div>
            <ClientForm />
          </div>
        </details>
      </div>

      <section className="client-card-grid">
        {clients.map(c => {
          const revenue = c.invoices.reduce((acc, i) => acc + i.amount, 0);
          const costs = c.expenses.reduce((acc, e) => acc + e.amount, 0);
          const image = c.logoUrl;
          return <article className="client-contact-card" key={c.id}>
            <div className="client-avatar">
              {image ? <img src={image} alt={`Logo ${c.commercialName}`} loading="lazy" /> : <span>{initials(c.commercialName)}</span>}
            </div>
            <div className="client-card-body">
              <div className="client-card-title"><h2>{c.commercialName}</h2><span className="badge">{c.status}</span></div>
              <p className="muted">{c.businessName} · {c.taxId || "CUIT sin cargar"}</p>
              <div className="client-mini-list">
                <span>✉ {c.email || "Email sin cargar"}</span>
                <span>☎ {c.phone || c.whatsapp || "Teléfono sin cargar"}</span>
                <span>📍 {c.address || "Dirección sin cargar"}</span>
                <span>◎ {c.instagram || c.website || "Red/Web sin cargar"}</span>
              </div>
              <div className="client-tags">
                <span>{c.projects.length} proyectos</span><span>{c.quotes.length} presup.</span><span>{c.contracts.length} contratos</span><span>{money(revenue - costs)}</span>
              </div>
              <details className="client-popup">
                <summary className="btn secondary">Abrir ficha</summary>
                <div className="popup-panel wide">
                  <div className="popup-head"><div><h2>{c.commercialName}</h2><p>{c.businessName} · {c.taxId || "CUIT sin cargar"}</p></div><span className="badge">{c.status}</span></div>
                  <div className="client-popup-grid">
                    <div className="client-360 compact">
                      <div className="info-list">
                        <h3>General</h3><div><b>Email</b><span>{c.email || "-"}</span></div><div><b>Teléfono</b><span>{c.phone || "-"}</span></div><div><b>WhatsApp</b><span>{c.whatsapp || "-"}</span></div><div><b>Dirección</b><span>{c.address || "-"}</span></div>
                        <h3>Redes</h3><div><b>Instagram</b><span>{c.instagram || "-"}</span></div><div><b>Facebook</b><span>{c.facebook || "-"}</span></div><div><b>TikTok</b><span>{c.tiktok || "-"}</span></div><div><b>LinkedIn</b><span>{c.linkedin || "-"}</span></div><div><b>YouTube</b><span>{c.youtube || "-"}</span></div>
                      </div>
                      <div className="info-list">
                        <h3>Archivos y accesos</h3><div><b>Drive</b><span>{c.driveFolder ? <a href={c.driveFolder} target="_blank">Abrir</a> : "-"}</span></div><div><b>Brandbook</b><span>{c.brandbookUrl ? <a href={c.brandbookUrl} target="_blank">Abrir</a> : "-"}</span></div><div><b>Meta Business</b><span>{c.metaBusinessId || "-"}</span></div><div><b>Analytics</b><span>{c.googleAnalytics || "-"}</span></div>
                        <h3>Comercial</h3><div><b>Presupuestos</b><span>{c.quotes.length}</span></div><div><b>Facturas</b><span>{c.invoices.length}</span></div><div><b>Proyectos</b><span>{c.projects.length}</span></div><div><b>Contratos</b><span>{c.contracts.length}</span></div>
                        <h3>Rentabilidad</h3><div><b>Facturación</b><span>{money(revenue)}</span></div><div><b>Gastos</b><span>{money(costs)}</span></div><div><b>Margen</b><span>{money(revenue - costs)}</span></div>
                      </div>
                    </div>
                    <div className="client-edit-box"><h3>Editar ficha</h3><ClientForm client={c} /></div>
                  </div>
                </div>
              </details>
            </div>
          </article>;
        })}
      </section>

      <div className="pagination card">
        <a className={`btn secondary ${page <= 1 ? "disabled" : ""}`} href={`/clientes?page=${Math.max(1, page - 1)}${querySuffix}`}>‹ Anterior</a>
        <span>Página {page} de {totalPages}</span>
        <a className={`btn secondary ${page >= totalPages ? "disabled" : ""}`} href={`/clientes?page=${Math.min(totalPages, page + 1)}${querySuffix}`}>Siguiente ›</a>
      </div>
    </div>
  );
}
