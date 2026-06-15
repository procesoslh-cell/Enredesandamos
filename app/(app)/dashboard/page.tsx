import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/stat-card";
import { money } from "@/lib/format";

export default async function DashboardPage() {
  const gate = requireModule("dashboard"); if (!gate.ok) redirect("/home");
  const [clients, leads, quotes, expenses, projects, invoices, tasks] = await Promise.all([
    prisma.client.count(), prisma.lead.count(), prisma.quote.count(), prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.project.count(), prisma.invoice.findMany(), prisma.task.findMany({ where: { status: { not: "FINALIZADA" } } })
  ]);
  const revenue = invoices.filter(i => i.status !== "PAGADA").reduce((a, i) => a + i.amount, 0);
  return <div className="content-card">
    <div className="topbar"><div><h1 className="section-title">Tableros</h1><p className="muted">Indicadores generales.</p></div><span className="pill">KPIs</span></div>
    <section className="grid"><StatCard label="Clientes" value={clients}/><StatCard label="Prospectos" value={leads}/><StatCard label="Presupuestos" value={quotes}/><StatCard label="Proyectos" value={projects}/></section><br/>
    <section className="grid three"><div className="card"><h2>Pendiente</h2><h1>{money(revenue)}</h1></div><div className="card"><h2>Gastos</h2><h1>{money(expenses._sum.amount || 0)}</h1></div><div className="card"><h2>Tareas abiertas</h2><h1>{tasks.length}</h1></div></section>
  </div>;
}

