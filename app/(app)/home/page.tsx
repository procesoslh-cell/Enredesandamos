import { ModuleGrid } from "@/components/module-grid";
import { StatCard } from "@/components/stat-card";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { money, daysUntil } from "@/lib/format";
import { phraseOfTheDay } from "@/lib/inspiration";

export default async function HomePage() {
  const session = getSession();
  const [clients, contracts, invoices, tasks, quotes, expenses] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIVO" } }),
    prisma.contract.findMany({ where: { status: "ACTIVO" }, select: { endDate: true } }),
    prisma.invoice.findMany({ select: { amount: true, createdAt: true } }),
    prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { not: "FINALIZADA" } } }),
    prisma.quote.count({ where: { status: { in: ["BORRADOR", "ENVIADO", "VISTO"] } } }),
    prisma.expense.findMany({ select: { amount: true } })
  ]);
  const soon = contracts.filter(c => daysUntil(c.endDate) <= 30).length;
  const revenue = invoices.reduce((acc, i) => acc + i.amount, 0);
  const costs = expenses.reduce((acc, e) => acc + e.amount, 0);
  return (
    <>
      <section className="home-hero compact">
        <img className="home-logo" src="/logo.png" alt="En Redes Andamos" />
        <div>
          <h1>Panel operativo</h1>
          <p>{session?.role} · V4.5 entrega núcleo</p>
        </div>
        <div className="home-inspiration">“{phraseOfTheDay()}”</div>
      </section>
      <section className="grid six home-kpis">
        <StatCard label="Clientes activos" value={clients} hint="fichas 360°" />
        <StatCard label="Contratos por vencer" value={soon} hint="≤ 30 días" />
        <StatCard label="Facturación" value={money(revenue)} hint="histórico demo" />
        <StatCard label="Proyectos atrasados" value={tasks} hint="tareas vencidas" />
        <StatCard label="Presupuestos pendientes" value={quotes} hint="sin aceptar" />
        <StatCard label="Rentabilidad" value={money(revenue - costs)} hint="ingresos - gastos" />
      </section>
      <ModuleGrid role={session?.role || ""} />
    </>
  );
}
