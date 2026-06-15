import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money, dateOnly, daysUntil } from "@/lib/format";

function renewalBadge(days: number) {
  if (days <= 15) return { cls: "badge retention-red", label: "Menos de 15 días" };
  if (days <= 30) return { cls: "badge retention-orange", label: "Menos de 30 días" };
  if (days <= 60) return { cls: "badge retention-orange", label: "Menos de 60 días" };
  return { cls: "badge retention-green", label: "Más de 60 días" };
}
function durationMonths(start: Date, end: Date) {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  return Math.max(months, 1);
}

export default async function Page() {
  const g = await requireModule("retencion"); if (!g.ok) redirect("/home");
  const [contracts, clients] = await Promise.all([
    prisma.contract.findMany({ include: { client: true }, orderBy: { endDate: "asc" } }),
    prisma.client.findMany({ orderBy: { commercialName: "asc" } })
  ]);
  const statuses = ["PENDIENTE", "SEGUIMIENTO", "RENOVADO", "NO_RENUEVA"];
  return <div className="content-card">
    <div className="topbar"><div><h1 className="section-title">Retención y contratos</h1><p className="muted">Contratos con duración libre. No se asumen ciclos fijos: cada cliente define inicio, fin, renovación y semáforo.</p></div><span className="pill">Renovaciones</span></div>
    <section className="grid three"><div className="card stat"><span>Contratos activos</span><strong>{contracts.filter(c => c.status === "ACTIVO").length}</strong><small>servicios vigentes</small></div><div className="card stat"><span>Vencen ≤ 30 días</span><strong>{contracts.filter(c => daysUntil(c.endDate) <= 30).length}</strong><small>crear propuesta</small></div><div className="card stat"><span>Valor mensual</span><strong>{money(contracts.reduce((a, c) => a + c.monthlyValue, 0))}</strong><small>MRR estimado</small></div></section>
    <form className="card" action="/api/contracts/create" method="POST"><h2>Nuevo contrato</h2><div className="form-grid"><div><label>Cliente</label><select name="clientId">{clients.map(c => <option key={c.id} value={c.id}>{c.commercialName}</option>)}</select></div><div><label>Nombre</label><input name="name" placeholder="Plan redes mensual" /></div><div><label>Valor mensual</label><input name="monthlyValue" type="number" /></div><div><label>Inicio</label><input name="startDate" type="date" required /></div><div><label>Fin</label><input name="endDate" type="date" required /></div><div><label>Estado renovación</label><select name="renewalStatus">{statuses.map(s => <option key={s}>{s}</option>)}</select></div><div><label>Nombre PDF</label><input name="contractPdfName" placeholder="Contrato.pdf" /></div><div style={{ gridColumn: "span 2" }}><label>URL del PDF</label><input name="contractPdfUrl" placeholder="https://drive.google.com/..." /></div><div style={{ gridColumn: "span 3" }}><label>Notas</label><textarea name="retentionNotes" rows={3} /></div></div><div className="form-actions"><button>Crear contrato</button></div></form>
    <div className="kanban retention-board">{statuses.map(st => <div className="column" key={st}><h3>{st}</h3>{contracts.filter(c => c.renewalStatus === st).map(c => { const d = daysUntil(c.endDate); const b = renewalBadge(d); return <div className="task-card" key={c.id}><strong>{c.client.commercialName}</strong><p>{c.name}</p><p className="mini">Inicio: {dateOnly(c.startDate)} · Fin: {dateOnly(c.endDate)}</p><p className="mini">Duración: {durationMonths(c.startDate, c.endDate)} meses · faltan {d} días</p><p><strong>{money(c.monthlyValue)}</strong>/mes</p>{c.contractPdfUrl ? <p><a className="btn secondary" href={c.contractPdfUrl} target="_blank">Ver contrato PDF</a></p> : null}<span className={b.cls}>{b.label}</span><a className="btn" style={{ marginTop: 12 }} href={`/presupuestos?clientId=${c.clientId}&renewalContract=${c.id}`}>Crear propuesta de renovación</a><form action="/api/contracts/update-status" method="POST" style={{ marginTop: 12 }}><input type="hidden" name="id" value={c.id} /><label>Estado</label><select name="renewalStatus" defaultValue={c.renewalStatus}>{statuses.map(s => <option key={s}>{s}</option>)}</select><label>Notas</label><textarea name="retentionNotes" defaultValue={c.retentionNotes || ""} rows={2} /><button style={{ marginTop: 8 }}>Actualizar</button></form></div>})}</div>)}</div>
  </div>;
}
