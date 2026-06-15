import { googleRedirectUri } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const accountType = url.searchParams.get("type") === "CLIENTE" ? "CLIENTE" : "COLABORADOR";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return Response.json({ error: "Falta GOOGLE_CLIENT_ID en .env" }, { status: 500 });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state: accountType
  });

  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}



