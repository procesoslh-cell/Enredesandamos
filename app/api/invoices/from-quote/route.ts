import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const form = await req.formData();
  const quoteId = Number(form.get("quoteId"));
  const issuerId = Number(form.get("issuerId") || 0) || null;
  const dueDateValue = String(form.get("dueDate") || "");
  const quote = await prisma.quote.findUnique({ where: { id: quoteId }, include: { invoice: true } });
  if (!quote) return Response.json({ error: "Presupuesto no encontrado" }, { status: 404 });
  const issuer = issuerId ? await prisma.issuer.findUnique({ where: { id: issuerId } }) : null;
  if (!quote.invoice) {
    const count = await prisma.invoice.count();
    await prisma.invoice.create({ data: {
      number: "F-" + String(count + 1).padStart(4, "0"),
      clientId: quote.clientId,
      quoteId: quote.id,
      issuerId,
      status: "PENDIENTE",
      fiscalStatus: "BORRADOR",
      invoiceType: (issuer as any)?.defaultInvoiceType || "C",
      pointOfSale: issuer?.pointOfSale || null,
      amount: quote.total,
      dueDate: dueDateValue ? new Date(dueDateValue + "T00:00:00") : new Date(Date.now()+7*24*60*60*1000)
    }});
    await prisma.quote.update({ where: { id: quote.id }, data: { status: "ACEPTADO" }});
    await prisma.notification.create({ data: { title: "Factura generada", message: `Se generó factura para ${quote.number}.`, type: "FINANZAS", link: "/facturacion" }});
  }
  revalidatePath("/presupuestos"); revalidatePath("/facturacion"); redirect("/facturacion");
}
