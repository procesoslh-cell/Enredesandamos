import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dateOnly } from "@/lib/format";
import { createProject } from "@/lib/actions";
import Link from "next/link";

const statuses = ["PENDIENTE", "EN_CURSO", "REVISION", "APROBADO", "FINALIZADO"];
const statusLabel: Record<string, string> = { PENDIENTE: "Pendiente", EN_CURSO: "En curso", REVISION: "Revisión", APROBADO: "Aprobado", FINALIZADO: "Finalizado", LISTA: "Pendiente", EN_PROCESO: "En curso", FINALIZADA: "Finalizado" };
const normalize = (s: string) => ({ LISTA: "PENDIENTE", EN_PROCESO: "EN_CURSO", FINALIZADA: "FINALIZADO", BLOQUEADA: "PENDIENTE" } as Record<string, string>)[s] || s;

export default async function Page({ searchParams }: { searchParams?: Promise<{ clientId?: string; responsibleId?: string; status?: string; projectId?: string }> }) {
  const sp = await searchParams;
  const g = requireModule("planner");
  if (!g.ok) redirect("/home");
  const selectedClient = Number(sp?.clientId || 0);
  const selectedResponsible = Number(sp?.responsibleId || 0);
  const selectedProject = Number(sp?.projectId || 0);
  const selectedStatus = sp?.status || "";
  const [projects, clients, users] = await Promise.all([
    prisma.project.findMany({
      where: { ...(selectedClient ? { clientId: selectedClient } : {}), ...(selectedProject ? { id: selectedProject } : {}) },
      include: { client: true, stages: { orderBy: { order: "asc" } }, tasks: { include: { responsible: true, stage: true, comments: true, attachments: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.client.findMany({ orderBy: { commercialName: "asc" } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);
  const allProjects = await prisma.project.findMany({ include: { client: true }, orderBy: { name: "asc" } });
  const stages = projects.flatMap(p => p.stages.map(s => ({ ...s, projectName: p.name })));
  const filteredProjects = projects.map(p => ({
    ...p,
    tasks: p.tasks.filter(t => (!selectedResponsible || t.responsibleId === selectedResponsible) && (!selectedStatus || normalize(t.status) === selectedStatus))
  }));
  return (
    <div className="content-card">
      <div className="topbar">
        <div>
          <h1 className="section-title">Planner colaborativo</h1>
          <p className="muted">Primero creás un proyecto y después organizás sus tareas por responsables, avances, comentarios, adjuntos y fechas.</p>
        </div>
        <div className="planner-header-actions"><Link className="btn secondary" href="/calendario">Ver calendario</Link><span className="pill">Proyecto → Tareas</span></div>
      </div>

      <form className="card filters" action="/planner">
        <div><label>Cliente</label><select name="clientId" defaultValue={selectedClient || ""}><option value="">Todos</option>{clients.map(c => <option key={c.id} value={c.id}>{c.commercialName}</option>)}</select></div>
        <div><label>Proyecto</label><select name="projectId" defaultValue={selectedProject || ""}><option value="">Todos</option>{allProjects.map(p => <option key={p.id} value={p.id}>{p.client.commercialName} · {p.name}</option>)}</select></div>
        <div><label>Responsable</label><select name="responsibleId" defaultValue={selectedResponsible || ""}><option value="">Todas</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
        <div><label>Estado</label><select name="status" defaultValue={selectedStatus}><option value="">Todos</option>{statuses.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}</select></div>
        <button>Filtrar</button><Link className="btn secondary" href="/planner">Limpiar</Link>
      </form>

      <section className="planner-layout enhanced">
        <aside className="planner-sidebar">
          <form className="card project-form" action={createProject}>
            <div className="form-title-row"><h2>Nuevo proyecto</h2><span className="badge">Base</span></div>
            <label>Cliente</label><select name="clientId" required><option value="">Seleccionar cliente</option>{clients.map(c => <option key={c.id} value={c.id}>{c.commercialName}</option>)}</select><br /><br />
            <label>Nombre del proyecto</label><input name="name" required placeholder="Ej: Campaña invierno 2026" /><br /><br />
            <label>Servicio / campaña</label><input name="serviceType" placeholder="Meta Ads + Redes / Branding / Web" /><br /><br />
            <div className="form-grid two"><div><label>Inicio</label><input name="startDate" type="date" /></div><div><label>Fin</label><input name="endDate" type="date" /></div></div>
            <p className="mini">Al crearlo, el sistema genera etapas base: Brief, Estrategia, Copy, Diseño, Aprobación y Publicación.</p>
            <div className="form-actions"><button>Crear proyecto</button></div>
          </form>

          <form className="card" action="/api/tasks/create" method="POST">
            <div className="form-title-row"><h2>Nueva tarea</h2><span className="pill">Dentro de un proyecto</span></div>
            <label>Proyecto</label><select name="projectId" required>{allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><br /><br />
            <label>Etapa</label><select name="stageId"><option value="">Sin etapa</option>{stages.map(s => <option key={s.id} value={s.id}>{s.projectName} · {s.name}</option>)}</select><br /><br />
            <label>Tarea</label><input name="title" required /><br /><br />
            <label>Responsable</label><select name="responsibleId"><option value="">Sin asignar</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select><br /><br />
            <div className="form-grid two"><div><label>Estado</label><select name="status"><option value="PENDIENTE">Pendiente</option><option value="EN_CURSO">En curso</option><option value="REVISION">Revisión</option><option value="APROBADO">Aprobado</option><option value="FINALIZADO">Finalizado</option></select></div><div><label>Avance %</label><input name="progress" type="number" defaultValue="0" /></div></div><br />
            <label>Vence</label><input name="dueDate" type="date" /><br /><br />
            <label>Checklist / descripción</label><textarea name="description" rows={4} placeholder={"- Brief aprobado\n- Diseño feed\n- Copy\n- Revisión cliente"} />
            <div className="form-actions"><button>Crear tarea</button></div>
          </form>
        </aside>

        <div className="project-stack">{filteredProjects.map(p => <div className="card project-card" key={p.id}>
          <div className="topbar"><div><h2>{p.name}</h2><p className="muted">{p.client.commercialName} · {p.serviceType || "Sin servicio"} · {dateOnly(p.startDate)} → {dateOnly(p.endDate)}</p></div><span className="badge">{p.status}</span></div>
          <div className="project-summary"><span><b>{p.tasks.length}</b> tareas</span><span><b>{p.stages.length}</b> etapas</span><span><b>{Math.round((p.tasks.reduce((a,t)=>a+t.progress,0)/(p.tasks.length || 1)))}</b>% avance medio</span></div>
          <div className="task-board">{statuses.map(st => <div className="column" key={st}><h3>{statusLabel[st]}</h3>{p.tasks.filter(t => normalize(t.status) === st).map(t => <div className="task-card" key={t.id}><Link href={`/planner/tarea/${t.id}`}><strong>{t.title}</strong></Link><p className="mini">{t.stage?.name || "Sin etapa"} · {t.responsible?.name || "Sin responsable"}</p><div className="progress"><span style={{ width: `${t.progress}%` }} /></div><p className="mini">Avance {t.progress}% · vence {dateOnly(t.dueDate)}</p><p className="mini">{t.comments.length} comentarios · {t.attachments.length} adjuntos</p><Link className="btn secondary" href={`/planner/tarea/${t.id}`}>Abrir tarea</Link></div>)}</div>)}</div>
        </div>)}</div>
      </section>
    </div>
  );
}
