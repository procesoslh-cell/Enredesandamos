import { prisma } from "@/lib/prisma";
import { googleRedirectUri, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const accountType = url.searchParams.get("state") === "CLIENTE" ? "CLIENTE" : "COLABORADOR";
  if (!code) return Response.redirect(new URL("/login?error=google", req.url));

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code"
    })
  });

  if (!tokenRes.ok) return Response.redirect(new URL("/login?error=google_token", req.url));
  const tokenData = await tokenRes.json();
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  if (!profileRes.ok) return Response.redirect(new URL("/login?error=google_profile", req.url));
  const profile = await profileRes.json();

  const email = String(profile.email || "").toLowerCase();
  const name = String(profile.name || email);
  if (!email) return Response.redirect(new URL("/login?error=email", req.url));

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        googleId: String(profile.sub || ""),
        avatarUrl: String(profile.picture || ""),
        accountType,
        role: accountType === "CLIENTE" ? "CLIENTE" : "PENDIENTE",
        approvalStatus: "PENDIENTE",
        active: false
      }
    });
    await prisma.notification.create({ data: { title: "Nueva solicitud de acceso", message: `${name} (${email}) pidió acceso como ${accountType}.`, type: "USUARIOS", link: "/usuarios" } });
    return Response.redirect(new URL("/login?status=pending", req.url));
  }

  if (!user.googleId) {
    user = await prisma.user.update({ where: { id: user.id }, data: { googleId: String(profile.sub || ""), avatarUrl: String(profile.picture || ""), accountType } });
  }

  if (!user.active || user.approvalStatus !== "APROBADO") {
    return Response.redirect(new URL("/login?status=pending", req.url));
  }

  const session = { id: user.id, email: user.email, name: user.name, role: user.role, accountType: user.accountType, approvalStatus: user.approvalStatus, clientId: user.clientId };
  (await cookies()).set("era_token", signToken(session), { httpOnly: true, sameSite: "lax", path: "/" });
  return Response.redirect(new URL(user.role === "CLIENTE" ? "/portal-cliente" : "/home", req.url));
}



