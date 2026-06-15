import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dateOnly } from "@/lib/format";
import { createCalendarEvent } from "@/lib/actions";
import Link from "next/link";

const eventTypes = ["TAREA", "REUNION", "PUBLICACION", "ENTREGA", "REVISION", "VENCIMIENTO", "FACTURACION", "RECORDATORIO"];
const statuses = ["PLANIFICADO", "EN_PROCESO", "REQUIERE_REVISION", "FINALIZADO", "CANCELADO"];
const priorities = ["BAJA", "MEDIA", "ALTA", "URGENTE"];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}
function key(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function qs(year: number, month: number) { return `/calendario?year=${year}&month=${month + 1}`; }
function eventClass(type: string) { return `calendar-sticker ${type.toLowerCase()}`; }

type CalendarItem = { id: string; title: string; date: Date; type: string; status: string; responsible: string; client: string; project: string; priority: string; href?: string };

export default async function Page({ searchParams }: { searchParams?: Promise<{ year?: string; month?: string; clientId?: string; projectId?: string; responsibleId?: string; type?: string }> }) {
  const sp = await searchParams;
  const gate = await requireModule("calendario"); if (!gate.ok) redirect("/home");
  const now = new Date();
  const year = Number(sp?.year || now.getFullYear());
  const month = Math.max(0, Math.min(11, Number(sp?.month || now.getMonth() + 1) - 1));
  const selectedClient = Number(sp?.clientId || 0);
  const selectedProject = Number(sp?.projectId || 0);
  const selectedResponsible = Number(sp?.responsibleId || 0);
  const selectedType = sp?.type || "";
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 1);
  const [events, tasks, contentItems, clients, projects, users] = await Promise.all([
    prisma.calendarEvent.findMany({ where: { startDate: { gte: from, lt: to }, ...(selectedClient ? { clientId: selectedClient } : {}), ...(selectedProject ? { projectId: selectedProject } : {}), ...(selectedResponsible ? { responsibleId: selectedResponsible } : {}), ...(selectedType ? { eventType: selectedType } : {}) }, include: { client: true, project: true, task: true, responsible: true }, orderBy: { startDate: "asc" } }),
    prisma.task.findMany({ where: { dueDate: { gte: from, lt: to }, ...(selectedProject ? { projectId: selectedProject } : {}), ...(selectedResponsible ? { responsibleId: selectedResponsible } : {}) }, include: { project: { include: { client: true } }, responsible: true }, orderBy: { dueDate: "asc" } }),
    prisma.contentItem.findMany({ where: { publishDate: { gte: from, lt: to }, ...(selectedClient ? { clientId: selectedClient } : {}) }, include: { client: true }, orderBy: { publishDate: "asc" } }),
    prisma.client.findMany({ orderBy: { commercialName: "asc" } }),
    prisma.project.findMany({ include: { client: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true, approvalStatus: "APROBADO" }, orderBy: { name: "asc" } })
  ]);
  const taskEvents: CalendarItem[] = selectedType && selectedType !== "TAREA" ? [] : tasks.filter(t => !selectedClient || t.project.clientId === selectedClient).map(t => ({ id: `t-${t.id}`, title: t.title, date: t.dueDate!, type: "TAREA", status: t.status, responsible: t.responsible?.name || "Sin responsable", client: t.project.client.commercialName, project: t.project.name, priority: t.priority, href: `/planner/tarea/${t.id}` }));
  const contentEvents: CalendarItem[] = selectedType && !["PUBLICACION", "POST", "REEL", "STORY"].includes(selectedType) ? [] : contentItems.map(i => ({ id: `c-${i.id}`, title: i.title, date: i.publishDate, type: i.contentType || "PUBLICACION", status: i.status, responsible: "Contenido", client: i.client.commercialName, project: i.channel, priority: "MEDIA" }));
  const manualEvents: CalendarItem[] = events.map(e => ({ id: `e-${e.id}`, title: e.title, date: e.startDate, type: e.eventType, status: e.status, responsible: e.responsible?.name || "Sin responsable", client: e.client?.commercialName || "Interno", project: e.project?.name || e.description || "", priority: e.priority, href: e.taskId ? `/planner/tarea/${e.taskId}` : undefined }));
  const all = [...manualEvents, ...taskEvents, ...contentEvents].sort((a,b)=>a.date.getTime()-b.date.getTime());
  const grouped = all.reduce((acc, item) => { const k = key(item.date); (acc[k] ||= []).push(item); return acc; }, {} as Record<string, CalendarItem[]>);
  const days = monthMatrix(year, month);
  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  return <div className="content-card">
    <div className="topbar"><div><h1 className="section-title">Calendario operativo</h1><p className="muted">Calendario mensual visual conectado con proyectos, tareas, publicaciones, responsables y clientes.</p></div><span className="pill">{monthNames[month]} {year} · {all.length} hitos</span></div>
    <div className="calendar-board improved">
      <aside className="calendar-sidebar">
        <form action={createCalendarEvent} className="card"><h2>Crear evento</h2><div className="form-grid calendar-form-grid"><div><label>Título</label><input name="title" required placeholder="Ej: Revisión campaña" /></div><div><label>Tipo</label><select name="eventType">{eventTypes.map(x => <option key={x}>{x}</option>)}</select></div><div><label>Inicio</label><input name="startDate" type="date" required /></div><div><label>Fin</label><input name="endDate" type="date" /></div><div><label>Responsable</label><select name="responsibleId"><option value="">Sin responsable</option>{users.map(u => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}</select></div><div><label>Cliente</label><select name="clientId"><option value="">Interno</option>{clients.map(c => <option key={c.id} value={c.id}>{c.commercialName}</option>)}</select></div><div><label>Proyecto</label><select name="projectId"><option value="">Sin proyecto</option>{projects.map(p => <option key={p.id} value={p.id}>{p.client.commercialName} · {p.name}</option>)}</select></div><div><label>Estado</label><select name="status">{statuses.map(x => <option key={x}>{x}</option>)}</select></div><div><label>Prioridad</label><select name="priority">{priorities.map(x => <option key={x}>{x}</option>)}</select></div><div><label>Vincular tarea</label><select name="taskId"><option value="">Sin tarea</option>{tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div></div><label>Descripción / detalle</label><textarea name="description" rows={3} placeholder="Notas, links, objetivos o contexto." /><div className="form-actions"><button>Agregar al calendario</button></div></form>
        <form className="card compact-filter" action="/calendario"><h2>Filtros</h2><input type="hidden" name="year" value={year} /><input type="hidden" name="month" value={month + 1} /><label>Cliente</label><select name="clientId" defaultValue={selectedClient || ""}><option value="">Todos</option>{clients.map(c => <option key={c.id} value={c.id}>{c.commercialName}</option>)}</select><label>Proyecto</label><select name="projectId" defaultValue={selectedProject || ""}><option value="">Todos</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><label>Responsable</label><select name="responsibleId" defaultValue={selectedResponsible || ""}><option value="">Todas</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select><label>Tipo</label><select name="type" defaultValue={selectedType}><option value="">Todos</option>{eventTypes.map(x => <option key={x}>{x}</option>)}</select><div className="form-actions"><button>Filtrar</button></div></form>
      </aside>
      <section className="calendar-main card">
        <div className="calendar-toolbar"><Link className="btn secondary" href={qs(prev.getFullYear(), prev.getMonth())}>← Mes anterior</Link><div className="calendar-title"><strong>{monthNames[month]} {year}</strong><span>Vista mensual con pegatinas</span></div><Link className="btn secondary" href={qs(next.getFullYear(), next.getMonth())}>Mes siguiente →</Link><Link className="btn" href="/calendario">Hoy</Link></div>
        <div className="calendar-selectors"><form action="/calendario"><label>Mes</label><select name="month" defaultValue={month + 1}>{monthNames.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}</select><label>Año</label><input name="year" type="number" defaultValue={year} min="2024" max="2035" /><button>Ir</button></form></div>
        <div className="real-calendar">
          {weekDays.map(d => <div className="calendar-weekday" key={d}>{d}</div>)}
          {days.map(day => {
            const items = grouped[key(day)] || [];
            const inactive = day.getMonth() !== month;
            return <div key={day.toISOString()} className={`calendar-day ${inactive ? "inactive" : ""}`}>
              <div className="day-number">{day.getDate()}</div>
              <div className="stickers">{items.slice(0,4).map(e => {
                const content = <><span>{e.type}</span>{e.title}<small>{e.client} · {e.responsible}</small><em>{e.status} · {e.priority}</em></>;
                return e.href ? <Link key={e.id} className={eventClass(e.type)} title={`${e.title} | ${e.client} | ${e.responsible} | ${e.status}`} href={e.href}>{content}</Link> : <div key={e.id} className={eventClass(e.type)} title={`${e.title} | ${e.client} | ${e.responsible} | ${e.status}`}>{content}</div>;
              })}{items.length > 4 && <div className="more-stickers">+{items.length - 4} más</div>}</div>
            </div>;
          })}
        </div>
        <div className="calendar-legend"><span className="legend tarea">Tarea</span><span className="legend reunion">Reunión</span><span className="legend publicacion">Publicación</span><span className="legend entrega">Entrega</span><span className="legend vencimiento">Vencimiento</span></div>
      </section>
    </div>
  </div>;
}



