import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function Topbar() {
  const session = getSession();
  const unread = session ? await prisma.notification.count({ where: { OR: [{ userId: session.id }, { userId: null }], read: false } }) : 0;
  return (
    <header className="topbar-app">
      <Link href="/home" className="home-link">← Módulos</Link>
      <div className="top-actions">
        <Link href="/notificaciones" className="notif">🔔 {unread}</Link>
        <span className="user-pill">{session?.name} · {session?.role}</span>
        <form action="/api/auth/logout" method="POST"><button className="ghost">Salir</button></form>
      </div>
    </header>
  );
}
