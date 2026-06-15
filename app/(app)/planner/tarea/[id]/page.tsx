import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dateOnly } from "@/lib/format";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const gate = await requireModule("planner");

  if (!gate.ok) {
    redirect("/home");
  }

  const resolvedParams = await params;

  const task = await prisma.task.findUnique({
    where: { id: Number(resolvedParams.id) },
    include: {
      project: { include: { client: true } },
      stage: true,
      responsible: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      attachments: true,
    },
  });

  if (!task) {
    redirect("/planner");
  }

  return (
    <div className="content-card">
      <div className="topbar">
        <div>
          <h1 className="section-title">{task.title}</h1>
          <p className="muted">
            {task.project.client.commercialName} · {task.project.name} ·{" "}
            {task.stage?.name || "Sin etapa"}
          </p>
        </div>

        <Link className="btn secondary" href="/planner">
          Volver
        </Link>
      </div>

      <section className="grid two">
        <div className="card">
          <h2>Actualizar tarea</h2>

          <form action="/api/tasks/update" method="POST">
            <input type="hidden" name="id" value={task.id} />

            <label>Estado</label>
            <select name="status" defaultValue={task.status}>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_CURSO">En curso</option>
              <option value="REVISION">Revisión</option>
              <option value="APROBADO">Aprobado</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>

            <br />
            <br />

            <label>Avance %</label>
            <input name="progress" type="number" defaultValue={task.progress} />

            <div className="form-actions">
              <button>Guardar avance</button>
            </div>
          </form>

          <br />

          <div className="progress">
            <span style={{ width: `${task.progress}%` }} />
          </div>

          <p>
            Responsable: <strong>{task.responsible?.name || "-"}</strong>
          </p>
          <p>Vence: {dateOnly(task.dueDate)}</p>
          <p>{task.description}</p>
        </div>

        <div className="card">
          <h2>Adjuntar entrega</h2>

          <form action="/api/tasks/attachment" method="POST">
            <input type="hidden" name="taskId" value={task.id} />

            <label>Nombre</label>
            <input name="name" placeholder="Diseño feed final.pdf" />

            <br />
            <br />

            <label>URL archivo</label>
            <input name="url" placeholder="Link Drive, PDF, imagen..." />

            <br />
            <br />

            <label>Tipo</label>
            <select name="type">
              <option>PDF</option>
              <option>IMAGEN</option>
              <option>LINK</option>
              <option>DOC</option>
            </select>

            <div className="form-actions">
              <button>Adjuntar</button>
            </div>
          </form>
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <h2>Registrar avance/comentario</h2>

          <form action="/api/tasks/comment" method="POST">
            <input type="hidden" name="taskId" value={task.id} />

            <label>Comentario</label>
            <textarea name="message" rows={4} required />

            <br />
            <br />

            <label>Avance opcional %</label>
            <input name="progress" type="number" />

            <div className="form-actions">
              <button>Publicar</button>
            </div>
          </form>

          <h3>Historial</h3>

          {task.comments.map((comment) => (
            <div className="task-card" key={comment.id}>
              <strong>{comment.user?.name || "Sistema"}</strong>
              <p>{comment.message}</p>
              <span className="mini">
                {dateOnly(comment.createdAt)}{" "}
                {comment.progress !== null ? `· avance ${comment.progress}%` : ""}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Adjuntos</h2>

          {task.attachments.map((attachment) => (
            <div className="task-card" key={attachment.id}>
              <strong>{attachment.name}</strong>
              <p>{attachment.type}</p>
              <a className="btn secondary" href={attachment.url} target="_blank">
                Abrir archivo
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
