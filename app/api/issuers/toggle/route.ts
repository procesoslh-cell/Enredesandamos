import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const f = await req.formData();
  await prisma.issuer.update({ where: { id: Number(f.get("id")) }, data: { active: String(f.get("active")) === "true" } });
  revalidatePath("/emisoras");
  revalidatePath("/facturacion");
  redirect("/emisoras");
}
