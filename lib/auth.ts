import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  accountType?: string;
  approvalStatus?: string;
  clientId?: number | null;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-cambiar";

export function signToken(payload: SessionUser) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("era_token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export function canAccess(role: string, module: string) {
  const rules: Record<string, string[]> = {
    SUPER_ADMIN: ["*"],
    ADMIN: ["*"],
    DIRECCION: ["*"],
    DIRECTORA_CUENTAS: ["home", "dashboard", "crm", "clientes", "servicios", "presupuestos", "facturacion", "emisoras", "gastos", "planner", "retencion", "omnicanal", "notificaciones", "calendario", "usuarios"],
    PROJECT_MANAGER: ["home", "dashboard", "clientes", "planner", "calendario", "notificaciones"],
    DISENADORA: ["home", "planner", "notificaciones", "calendario"],
    COPYWRITER: ["home", "planner", "notificaciones", "calendario"],
    COMMUNITY_MANAGER: ["home", "planner", "calendario", "notificaciones", "omnicanal"],
    ADS_MANAGER: ["home", "planner", "omnicanal", "notificaciones", "calendario", "dashboard"],
    FINANZAS: ["home", "clientes", "presupuestos", "facturacion", "emisoras", "gastos", "dashboard", "notificaciones", "calendario"],
    CLIENTE: ["home", "portal-cliente", "notificaciones"],
  };

  return rules[role]?.includes("*") || rules[role]?.includes(module);
}

export async function requireModule(module: string) {
  const session = await getSession();

  if (!session || session.approvalStatus === "PENDIENTE") {
    return { ok: false, session: null };
  }

  return { ok: canAccess(session.role, module), session };
}

export function googleRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}
