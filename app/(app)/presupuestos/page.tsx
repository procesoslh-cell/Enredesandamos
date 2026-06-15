import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money, dateOnly } from "@/lib/format";

const quoteStates = ["BORRADOR", "ENVIADO", "VISTO", "ACEPTADO", "RECHAZADO", "FACTURADO"];

export default async function PresupuestosPage({ searchParams }: { searchParams?: { clientId?: string } }) {
  const gate = await requireModule("presupuestos"); if (!gate.ok) redirect("/home");
  const defaultClient = Number(searchParams?.clientId || 0);
  const [quotes, clients, services] = await Promise.all([
    prisma.quote.findMany({ include: { client: true, items: true, invoice: true }, orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ orderBy: { commercialName: "asc" } }),
    prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);
  return <div className="content-card"><div className="topbar"><div><h1 className="section-title">Presupuestos</h1><p className="muted">Armá propuestas comerciales con cliente, servicios, descuentos, PDF y envío por email.</p></div><span className="pill">Propuestas</span></div>
  <div className="quote-status">{quoteStates.map(st => <span key={st}>{st} · {quotes.filter(q => q.status === st || (st === "FACTURADO" && q.invoice)).length}</span>)}</div>
  <form action="/api/quotes/create" method="POST" className="card quote-builder"><div><h2>Nuevo presupuesto</h2><label>Cliente</label><select name="clientId" required defaultValue={defaultClient || undefined}>{clients.map(c => <option key={c.id} value={c.id}>{c.commercialName}</option>)}</select><br/><br/><label>Servicios</label><div className="grid two">{services.map(s => <label key={s.id} className="card" style={{margin:0}}><input type="checkbox" name="serviceIds" value={s.id} style={{width:"auto"}} /> <strong>{s.name}</strong><br/><span className="mini">{s.code} · {money(s.price)}</span><p className="mini">{s.description}</p></label>)}</div></div><div><h2>Condiciones</h2><label>Tipo descuento</label><select name="discountType"><option value="PERCENT">Porcentaje</option><option value="AMOUNT">Monto fijo</option></select><br/><br/><label>Valor descuento</label><input name="discountValue" type="number" defaultValue="0" /><br/><br/><label>Notas para el cliente</label><textarea name="notes" rows={5} placeholder="Alcance, tiempos de trabajo, condiciones de pago..." /><div className="totals"><b>Salida comercial</b><p>PDF descargable · email al cliente · facturación posterior</p></div><div className="form-actions"><button>Crear presupuesto</button></div></div></form>
  {quotes.map(q => <div className="card" key={q.id}><div className="topbar"><div><h2>{q.number} · {q.client.commercialName}</h2><p className="muted">Creado: {dateOnly(q.createdAt)} · válido hasta {dateOnly(q.validUntil)}</p></div><span className="badge">{q.invoice ? "FACTURADO" : q.status}</span></div><table className="table"><thead><tr><th>Servicio</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>{q.items.map(i => <tr key={i.id}><td>{i.description}</td><td>{i.quantity}</td><td>{money(i.unitPrice)}</td><td>{money(i.total)}</td></tr>)}</tbody></table><div className="totals"><p>Subtotal: <strong>{money(q.subtotal)}</strong></p><p>Descuento: <strong>{q.discountType === "PERCENT" ? q.discountValue + "%" : money(q.discountValue)}</strong></p><h3>Total: {money(q.total)}</h3><p className="mini">{q.notes}</p></div><form action="/api/invoices/from-quote" method="POST" style={{display:"inline-flex", marginRight:8}}><input type="hidden" name="quoteId" value={q.id} /><button>{q.invoice ? "Factura creada" : "Aceptar y facturar"}</button></form><a className="btn secondary" href={`/api/quotes/${q.id}/pdf`}>Descargar presupuesto</a><a className="btn secondary" style={{marginLeft:8}} href={`mailto:${q.client.email || ""}?subject=Presupuesto ${q.number} - En Redes Andamos&body=Hola, te compartimos el presupuesto ${q.number}.`}>Enviar por email</a></div>)}
  </div>;
}
