import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createUser, updateUserAccess } from "@/lib/actions";
const roles = ["SUPER_ADMIN", "ADMIN", "DIRECCION", "DIRECTORA_CUENTAS", "PROJECT_MANAGER", "DISENADORA", "COPYWRITER", "COMMUNITY_MANAGER", "ADS_MANAGER", "FINANZAS", "CLIENTE"];
export default async function UsuariosPage() {
  const gate = requireModule("usuarios"); if (!gate.ok) redirect("/home");
  const [users, clients] = await Promise.all([
    prisma.user.findMany({ include: { client: true }, orderBy: [{ approvalStatus: "asc" }, { createdAt: "desc" }] }),
    prisma.client.findMany({ orderBy: { commercialName: "asc" } })
  ]);
  const pending = users.filter(u => u.approvalStatus === "PENDIENTE");
  return <div className="content-card">
    <div className="topbar"><div><h1 className="section-title">Usuarios y accesos</h1><p className="muted">Google login + aprobación manual. Las colaboradoras y clientes piden acceso con Gmail y quedan pendientes hasta asignar rol.</p></div><span className="pill">{pending.length} pendientes</span></div>
    <section className="card"><h2>Solicitudes pendientes</h2>{pending.length === 0 ? <p className="muted">No hay solicitudes nuevas.</p> : <div className="calendar-list">{pending.map(u => <div className="calendar-event-card" key={u.id}><header><div><b>{u.name}</b><div className="muted">{u.email} · {u.accountType}</div></div><span className="badge">Pendiente</span></header><form action={updateUserAccess} className="role-form"><input type="hidden" name="userId" value={u.id} /><div><label>Rol</label><select name="role" defaultValue={u.accountType === "CLIENTE" ? "CLIENTE" : "PROJECT_MANAGER"}>{roles.map(r => <option key={r}>{r}</option>)}</select></div><div><label>Cliente vinculado</label><select name="clientId" defaultValue=""><option value="">Sin cliente</option>{clients.map(c => <option key={c.id} value={c.id}>{c.commercialName}</option>)}</select></div><div><label>Acción</label><select name="action"><option>APROBAR</option><option>RECHAZAR</option><option>SUSPENDER</option></select></div><button>Guardar acceso</button></form></div>)}</div>}</section>
    <form action={createUser} className="card"><h2>Alta manual de emergencia</h2><p className="muted">Se mantiene para demo o contingencia. Para uso real, preferir Gmail.</p><div className="form-grid"><div><label>Nombre</label><input name="name" required /></div><div><label>Email</label><input name="email" type="email" required /></div><div><label>Contraseña</label><input name="password" type="password" defaultValue="Usuario123!" /></div><div><label>Rol</label><select name="role">{roles.map(r => <option key={r}>{r}</option>)}</select></div></div><div className="form-actions"><button>Crear usuario aprobado</button></div></form>
    <table className="table"><thead><tr><th>Nombre</th><th>Email</th><th>Tipo</th><th>Rol</th><th>Cliente</th><th>Estado</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.accountType}</td><td><span className="badge">{u.role}</span></td><td>{u.client?.commercialName || "-"}</td><td>{u.active ? "Aprobado" : u.approvalStatus}</td></tr>)}</tbody></table>
  </div>;
}
