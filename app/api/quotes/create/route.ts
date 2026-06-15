import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function POST(req: Request) {
  const form = await req.formData();
  const clientId = Number(form.get("clientId"));
  const serviceIds = form.getAll("serviceIds").map(Number).filter(Boolean);
  const discountType = String(form.get("discountType") || "PERCENT");
  const discountValue = Number(form.get("discountValue") || 0);
  const notes = String(form.get("notes") || "");
  const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
  const subtotal = services.reduce((acc, s) => acc + s.price, 0);
  const discount = discountType === "AMOUNT" ? discountValue : subtotal * (discountValue / 100);
  const total = Math.max(subtotal - discount, 0);
  const count = await prisma.quote.count();
  const quote = await prisma.quote.create({ data: { number: "P-" + String(count + 1).padStart(4, "0"), clientId, status: "BORRADOR", subtotal, discountType, discountValue, total, notes }});
  for (const s of services) await prisma.quoteItem.create({ data: { quoteId: quote.id, serviceId: s.id, description: s.name, quantity: 1, unitPrice: s.price, total: s.price }});
  await prisma.notification.create({ data: { title: "Presupuesto creado", message: `Se creó ${quote.number}.`, type: "VENTAS", link: "/presupuestos" }});
  revalidatePath("/presupuestos"); redirect("/presupuestos");
}



