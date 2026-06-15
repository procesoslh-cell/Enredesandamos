import { prisma } from "@/lib/prisma";
import { buildCommercialPdf } from "@/lib/pdf";
import { dateOnly } from "@/lib/format";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: { client: true, issuer: true, quote: { include: { items: true } } }
  });
  if (!invoice) return new Response("Factura no encontrada", { status: 404 });
  const lines = invoice.quote?.items?.length
    ? invoice.quote.items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total }))
    : [{ description: "Servicios profesionales de marketing digital", quantity: 1, unitPrice: invoice.amount, total: invoice.amount }];
  const subtotal = invoice.quote?.subtotal || invoice.amount;
  const discountLabel = invoice.quote ? (invoice.quote.discountType === "PERCENT" ? `${invoice.quote.discountValue}%` : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(invoice.quote.discountValue || 0)) : "-";
  const pdf = await buildCommercialPdf({
    title: `Factura ${invoice.invoiceType || "C"}`,
    number: invoice.number,
    clientName: invoice.client.commercialName,
    clientTaxId: invoice.client.taxId,
    clientEmail: invoice.client.email,
    issuerName: invoice.issuer?.name,
    issuerTaxId: invoice.issuer?.taxId,
    issuerCondition: invoice.issuer?.fiscalCondition,
    issuerPointOfSale: invoice.issuer?.pointOfSale || invoice.pointOfSale,
    issuerAddress: invoice.issuer?.address,
    status: invoice.status,
    dateLabel: `Fecha: ${dateOnly(invoice.createdAt)}`,
    dueLabel: invoice.dueDate ? `Vencimiento: ${dateOnly(invoice.dueDate)}` : "Vencimiento: a confirmar",
    subtotal,
    discountLabel,
    total: invoice.amount,
    notes: invoice.notes || "",
    lines,
    footer: "En Redes Andamos · Factura"
  });
  return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${invoice.number}-factura.pdf"` } });
}
