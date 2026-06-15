import { prisma } from "@/lib/prisma";
import { buildCommercialPdf } from "@/lib/pdf";
import { dateOnly } from "@/lib/format";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id: Number(id) }, include: { client: true, items: true } });
  if (!quote) return new Response("Presupuesto no encontrado", { status: 404 });
  const discountLabel = quote.discountType === "PERCENT" ? `${quote.discountValue}%` : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(quote.discountValue || 0);
  const pdf = await buildCommercialPdf({
    title: "Presupuesto",
    number: quote.number,
    clientName: quote.client.commercialName,
    clientTaxId: quote.client.taxId,
    clientEmail: quote.client.email,
    issuerName: "En Redes Andamos",
    issuerCondition: "Propuesta comercial",
    status: quote.status,
    dateLabel: `Fecha: ${dateOnly(quote.createdAt)}`,
    dueLabel: quote.validUntil ? `Validez: ${dateOnly(quote.validUntil)}` : "Validez: a confirmar",
    subtotal: quote.subtotal,
    discountLabel,
    total: quote.total,
    notes: quote.notes,
    lines: quote.items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
    footer: "En Redes Andamos · Propuesta comercial"
  });
  return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${quote.number}-presupuesto.pdf"` } });
}

