import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dateOnly } from "@/lib/format";
export default async function NotificacionesPage() {
  const gate = await requireModule("notificaciones"); if (!gate.ok) redirect("/home");
  const session = gate.session;
  const notifications = await prisma.notification.findMany({ where: { OR: [{ userId: session.id }, { userId: null }] }, orderBy: { createdAt: "desc" } });
  return <div className="content-card"><div className="topbar"><div><h1 className="section-title">Alertas</h1><p className="muted">Centro de notificaciones internas.</p></div><span className="pill">{notifications.filter(n => !n.read).length} sin leer</span></div>{notifications.map(n => <div className="card" key={n.id}><div className="topbar"><div><h2>{n.title}</h2><p>{n.message}</p><span className="mini">{dateOnly(n.createdAt)} · {n.type}</span></div><span className="badge">{n.read ? "LEÍDA" : "NUEVA"}</span></div></div>)}</div>;
}




