import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createLead, updateLeadStatus } from "@/lib/actions";
import { dateOnly } from "@/lib/format";

const columns = ["PROSPECTO", "PRIMER_CONTACTO", "REUNION", "PRESUPUESTO", "NEGOCIACION", "GANADO", "PERDIDO"];
const labels: Record<string, string> = {
  PROSPECTO: "Prospecto",
  PRIMER_CONTACTO: "Primer contacto",
  REUNION: "Reunión",
  PRESUPUESTO: "Presupuesto",
  NEGOCIACION: "Negociación",
  GANADO: "Ganado",
  PERDIDO: "Perdido"
};
const legacy: Record<string, string> = { NUEVO: "PROSPECTO", CONTACTADO: "PRIMER_CONTACTO" };

export default async function CRMPage() {
  const gate = await requireModule("crm");
  if (!gate.ok) redirect("/home");
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const normalized = leads.map(l => ({ ...l, status: legacy[l.status] || l.status }));
  return (
    <div className="content-card">
      <div className="topbar">
        <div>
          <h1 className="section-title">CRM Pipeline</h1>
          <p className="muted">Prospectos con actividades, historial y estructura preparada para drag & drop.</p>
        </div>
        <span className="pill">V4.5 comercial</span>
      </div>
      <form action={createLead} className="card">
        <h2>Nuevo prospecto</h2>
        <div className="form-grid">
          <div><label>Empresa</label><input name="company" required /></div>
          <div><label>Contacto</label><input name="contact" /></div>
          <div><label>Email</label><input name="email" type="email" /></div>
          <div><label>Teléfono</label><input name="phone" /></div>
          <div><label>Fuente</label><input name="source" placeholder="Instagram, referido, web..." /></div>
          <div><label>Etapa</label><select name="status" defaultValue="PROSPECTO">{columns.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></div>
        </div>
        <br />
        <label>Notas / próxima acción</label>
        <textarea name="notes" rows={3} placeholder="Ej: enviar propuesta de community + pauta Meta Ads" />
        <div className="form-actions"><button>Crear prospecto</button></div>
      </form>
      <div className="quote-status">{columns.map(c => <span key={c}>{labels[c]} · {normalized.filter(l => l.status === c).length}</span>)}</div>
      <div className="kanban crm-pipeline">
        {columns.map(col => (
          <div className="column" key={col}>
            <h3>{labels[col]}</h3>
            {normalized.filter(l => l.status === col).map(l => (
              <div className="lead-card" key={l.id}>
                <strong>{l.company}</strong>
                <p>{l.contact || "Sin contacto"}<br /><span className="mini">{l.email || l.phone || "Sin datos"}</span></p>
                <div className="timeline">
                  <div className="timeline-item"><b>Origen</b><br /><span className="mini">{l.source || "Manual"} · {dateOnly(l.createdAt)}</span></div>
                  <div className="timeline-item"><b>Actividad pendiente</b><br /><span className="mini">{l.notes || "Registrar próximo contacto."}</span></div>
                </div>
                <form action={updateLeadStatus}>
                  <input type="hidden" name="id" value={l.id} />
                  <select name="status" defaultValue={l.status}>{columns.map(s => <option key={s} value={s}>{labels[s]}</option>)}</select>
                  <button>OK</button>
                </form>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}



