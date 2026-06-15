import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money, dateOnly } from "@/lib/format";
import { createExpense } from "@/lib/actions";
export default async function GastosPage() {
  const gate = requireModule("gastos"); if (!gate.ok) redirect("/home");
  const [expenses, clients] = await Promise.all([prisma.expense.findMany({ include: { client: true, project: true }, orderBy: { date: "desc" } }), prisma.client.findMany()]);
  return <div className="content-card"><div className="topbar"><div><h1 className="section-title">Gastos</h1><p className="muted">Rentabilidad por cliente/proyecto.</p></div><span className="pill">Caja</span></div><form action={createExpense} className="card"><h2>Nuevo gasto</h2><div className="form-grid"><div><label>Cliente</label><select name="clientId"><option value="">General agencia</option>{clients.map(c => <option key={c.id} value={c.id}>{c.commercialName}</option>)}</select></div><div><label>Categoría</label><input name="category" required /></div><div><label>Monto</label><input name="amount" type="number" required /></div><div><label>Fecha</label><input name="date" type="date" /></div><div style={{gridColumn:"span 2"}}><label>Descripción</label><input name="description" required /></div></div><div className="form-actions"><button>Registrar gasto</button></div></form><table className="table"><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Cliente</th><th>Monto</th></tr></thead><tbody>{expenses.map(e => <tr key={e.id}><td>{dateOnly(e.date)}</td><td>{e.category}</td><td>{e.description}</td><td>{e.client?.commercialName || "Agencia"}</td><td>{money(e.amount)}</td></tr>)}</tbody></table></div>;
}

