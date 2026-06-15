import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase();
  const password = String(form.get("password") || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || user.approvalStatus !== "APROBADO" || !user.passwordHash) return Response.json({ error: "Usuario inválido o pendiente" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return Response.json({ error: "Contraseña inválida" }, { status: 401 });
  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role, accountType: user.accountType, approvalStatus: user.approvalStatus, clientId: user.clientId });
  (await cookies()).set("era_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(user.role === "CLIENTE" ? "/portal-cliente" : "/home");
}



