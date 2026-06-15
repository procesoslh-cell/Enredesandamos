import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const f = await req.formData();
  const id = Number(f.get("id") || 0);
  const data: any = {
    name: String(f.get("name") || ""),
    taxId: String(f.get("taxId") || "") || null,
    address: String(f.get("address") || "") || null,
    fiscalCondition: String(f.get("fiscalCondition") || "Monotributo"),
    pointOfSale: String(f.get("pointOfSale") || "") || null,
    email: String(f.get("email") || "") || null,
    phone: String(f.get("phone") || "") || null,
    defaultInvoiceType: String(f.get("defaultInvoiceType") || "C"),
    notes: String(f.get("notes") || "") || null
  };
  if (id) await prisma.issuer.update({ where: { id }, data });
  else await prisma.issuer.create({ data });
  revalidatePath("/emisoras");
  revalidatePath("/facturacion");
  redirect("/emisoras");
}



