import { requireModule } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createCampaign } from "@/lib/actions";
export default async function OmnicanalPage() {
  const gate = await requireModule("omnicanal"); if (!gate.ok) redirect("/home");
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="content-card"><div className="topbar"><div><h1 className="section-title">Multicanal</h1><p className="muted">Promociones, ofertas, encuestas y futuras integraciones Meta/WhatsApp.</p></div><span className="pill">Marketing</span></div><form action={createCampaign} className="card"><h2>Nueva campaña</h2><div className="form-grid"><div><label>Nombre</label><input name="name" required /></div><div><label>Canal</label><select name="channel"><option>EMAIL</option><option>WHATSAPP</option><option>INSTAGRAM</option></select></div><div><label>Segmento</label><input name="segment" /></div><div style={{gridColumn:"span 3"}}><label>Asunto</label><input name="subject" /></div><div style={{gridColumn:"span 3"}}><label>Mensaje</label><textarea name="message" rows={4} required></textarea></div></div><div className="form-actions"><button>Crear campaña</button></div></form><div className="grid two">{campaigns.map(c => <div className="card" key={c.id}><h2>{c.name}</h2><p><strong>Canal:</strong> {c.channel}</p><p><strong>Segmento:</strong> {c.segment}</p><p>{c.message}</p><span className="badge">{c.status}</span></div>)}</div></div>;
}




