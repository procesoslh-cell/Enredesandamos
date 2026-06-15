import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { createService } from "@/lib/actions";
export default async function ServiciosPage() {
  const gate = requireModule("servicios"); if (!gate.ok) redirect("/home");
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="content-card"><div className="topbar"><div><h1 className="section-title">Servicios</h1><p className="muted">Catálogo comercial.</p></div><span className="pill">Inventario</span></div>
  <form action={createService} className="card"><h2>Nuevo servicio</h2><div className="form-grid"><div><label>Código</label><input name="code" required /></div><div><label>Nombre</label><input name="name" required /></div><div><label>Precio</label><input name="price" type="number" required /></div><div><label>Impuesto %</label><input name="taxRate" type="number" defaultValue="0" /></div><div style={{gridColumn:"span 2"}}><label>Descripción</label><input name="description" /></div></div><div className="form-actions"><button>Crear servicio</button></div></form>
  <table className="table"><thead><tr><th>Código</th><th>Servicio</th><th>Descripción</th><th>Precio</th></tr></thead><tbody>{services.map(s => <tr key={s.id}><td>{s.code}</td><td><strong>{s.name}</strong></td><td>{s.description}</td><td>{money(s.price)}</td></tr>)}</tbody></table>
  </div>;
}

