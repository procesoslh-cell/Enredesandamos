import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export async function POST() { (await cookies()).delete("era_token"); redirect("/login"); }
