import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money, dateOnly } from "@/lib/format";

export default async function FacturacionPage() {
  const gate = await requireModule("facturacion"); if (!gate.ok) redirect("/home");
  const [invoices, issuers, acceptedQuotes] = await Promise.all([
    prisma.invoice.findMany({ include: { client: true, issuer: true, quote: { include: { items: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.issuer.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.quote.findMany({ where: { invoice: null, status: { in: ["ACEPTADO", "ENVIADO", "VISTO"] } }, include: { client: true, items: true }, orderBy: { createdAt: "desc" } })
  ]);

  const totalPendiente = invoices.filter(i => i.status !== "PAGADA").reduce((acc, i) => acc + i.amount, 0);
  const totalPagado = invoices.filter(i => i.status === "PAGADA").reduce((acc, i) => acc + i.amount, 0);
  const missingIssuerData = issuers.filter(i => !i.taxId || !i.pointOfSale).length;

  return <div className="content-card billing-module">
    <div className="topbar">
      <div><h1 className="section-title">Facturación</h1><p className="muted">Gestión de facturas, emisoras, presupuestos aceptados y descarga de comprobantes en PDF.</p></div>
      <Link className="btn secondary" href="/emisoras">Configurar emisoras</Link>
    </div>

    <section className="grid three billing-summary">
      <div className="card"><h2>Crear factura</h2><p className="muted">Elegí el presupuesto, la emisora y el vencimiento para generar la factura.</p><form action="/api/invoices/from-quote" method="POST" className="stack-form"><label>Presupuesto</label><select name="quoteId" required>{acceptedQuotes.map(q => <option key={q.id} value={q.id}>{q.number} · {q.client.commercialName} · {money(q.total)}</option>)}</select><label>Emisora</label><select name="issuerId" required>{issuers.map(i => <option key={i.id} value={i.id}>{i.name} · {i.taxId || "CUIT pendiente"}</option>)}</select><label>Vencimiento</label><input name="dueDate" type="date" /><button disabled={!acceptedQuotes.length}>{acceptedQuotes.length ? "Generar factura" : "Sin presupuestos disponibles"}</button></form></div>
      <div className="card"><div className="topbar"><h2>Emisoras</h2><Link href="/emisoras" className="mini-link">Editar</Link></div><div className="issuer-list">{issuers.slice(0, 7).map(i => <div key={i.id} className="issuer-card"><b>{i.name}</b><span>{i.fiscalCondition} · PV {i.pointOfSale || "pendiente"}</span><span>CUIT: {i.taxId || "pendiente"}</span></div>)}</div></div>
      <div className="card"><h2>Resumen</h2><div className="info-list"><div><b>Facturas</b><span>{invoices.length}</span></div><div><b>Pendiente</b><span>{money(totalPendiente)}</span></div><div><b>Cobrado</b><span>{money(totalPagado)}</span></div><div><b>Emisoras incompletas</b><span>{missingIssuerData}</span></div></div></div>
    </section>

    <section className="card"><div className="topbar"><div><h2>Facturas emitidas</h2><p className="muted">Descargá cada factura con logo, cliente, emisora, servicios, descuentos y total.</p></div></div><table className="table"><thead><tr><th>Número</th><th>Cliente</th><th>Servicios</th><th>Emisora</th><th>Estado</th><th>Vence</th><th>Monto</th><th>Acciones</th></tr></thead><tbody>{invoices.map(i => <tr key={i.id}><td>{i.number}</td><td>{i.client.commercialName}</td><td>{i.quote?.items.map(x => x.description).join(", ") || "Servicios de marketing"}</td><td>{i.issuer?.name || "Sin emisora"}</td><td><span className="badge">{i.status}</span></td><td>{dateOnly(i.dueDate)}</td><td>{money(i.amount)}</td><td><a className="btn secondary small" href={`/api/invoices/${i.id}/pdf`}>Descargar factura</a></td></tr>)}</tbody></table></section>
  </div>;
}



