import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "fs/promises";
import { join } from "path";

export type PdfLine = { description: string; quantity: number; unitPrice: number; total: number };
export type CommercialPdfInput = {
  title: string;
  number: string;
  clientName: string;
  clientTaxId?: string | null;
  clientEmail?: string | null;
  issuerName?: string | null;
  issuerTaxId?: string | null;
  issuerCondition?: string | null;
  issuerPointOfSale?: string | null;
  issuerAddress?: string | null;
  status?: string | null;
  dateLabel: string;
  dueLabel?: string | null;
  subtotal: number;
  discountLabel?: string | null;
  total: number;
  notes?: string | null;
  lines: PdfLine[];
  footer?: string;
};

function money(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);
}

function safe(text?: string | null) {
  return String(text || "-");
}

async function tryEmbedLogo(pdf: PDFDocument) {
  try {
    const bytes = await readFile(join(process.cwd(), "public", "logo.png"));
    return await pdf.embedPng(bytes);
  } catch {
    return null;
  }
}

function drawText(page: any, text: string, opts: any) {
  page.drawText(String(text || "-").slice(0, opts.maxChars || 95), opts);
}

export async function buildCommercialPdf(input: CommercialPdfInput) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await tryEmbedLogo(pdf);
  const purple = rgb(0.49, 0.35, 0.59);
  const lime = rgb(0.79, 0.82, 0.42);
  const turquoise = rgb(0.35, 0.82, 0.79);
  const dark = rgb(0.23, 0.23, 0.23);
  const soft = rgb(0.96, 0.94, 0.97);
  const line = rgb(0.90, 0.87, 0.92);

  page.drawRectangle({ x: 0, y: 806, width: 595.28, height: 36, color: soft });
  page.drawRectangle({ x: 0, y: 806, width: 595.28, height: 6, color: lime });

  if (logo) {
    // El logo original es cuadrado y grande. Se encaja completo en un area segura para evitar recortes.
    const box = 92;
    const scale = Math.min(box / logo.width, box / logo.height);
    const width = logo.width * scale;
    const height = logo.height * scale;
    page.drawImage(logo, { x: 42 + (box - width) / 2, y: 697 + (box - height) / 2, width, height });
  } else {
    page.drawText("En Redes Andamos", { x: 42, y: 742, size: 18, font: bold, color: purple });
  }

  page.drawText(input.title, { x: 355, y: 756, size: 22, font: bold, color: purple });
  page.drawText(input.number, { x: 355, y: 732, size: 14, font: bold, color: dark });
  page.drawText(`Estado: ${safe(input.status)}`, { x: 355, y: 712, size: 10, font, color: dark });

  let y = 660;
  page.drawRectangle({ x: 42, y: y - 88, width: 238, height: 88, color: rgb(1, 1, 1), borderColor: line, borderWidth: 1 });
  page.drawText("Cliente", { x: 56, y: y - 20, size: 12, font: bold, color: purple });
  drawText(page, safe(input.clientName), { x: 56, y: y - 40, size: 11, font: bold, color: dark, maxChars: 34 });
  page.drawText(`CUIT: ${safe(input.clientTaxId)}`, { x: 56, y: y - 58, size: 9, font, color: dark });
  drawText(page, `Email: ${safe(input.clientEmail)}`, { x: 56, y: y - 74, size: 9, font, color: dark, maxChars: 38 });

  page.drawRectangle({ x: 315, y: y - 88, width: 238, height: 88, color: rgb(1, 1, 1), borderColor: line, borderWidth: 1 });
  page.drawText("Emisora", { x: 329, y: y - 20, size: 12, font: bold, color: purple });
  drawText(page, safe(input.issuerName || "En Redes Andamos"), { x: 329, y: y - 40, size: 11, font: bold, color: dark, maxChars: 34 });
  page.drawText(`CUIT: ${safe(input.issuerTaxId)}`, { x: 329, y: y - 58, size: 9, font, color: dark });
  drawText(page, `${safe(input.issuerCondition)} · PV ${safe(input.issuerPointOfSale)}`, { x: 329, y: y - 74, size: 9, font, color: dark, maxChars: 42 });

  y = 540;
  page.drawText(input.dateLabel, { x: 42, y, size: 10, font: bold, color: dark });
  if (input.dueLabel) page.drawText(input.dueLabel, { x: 355, y, size: 10, font: bold, color: dark });
  y -= 30;

  page.drawRectangle({ x: 42, y, width: 511, height: 26, color: purple });
  page.drawText("Detalle", { x: 56, y: y + 8, size: 10, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Cant.", { x: 358, y: y + 8, size: 10, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Precio", { x: 410, y: y + 8, size: 10, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Total", { x: 500, y: y + 8, size: 10, font: bold, color: rgb(1, 1, 1) });
  y -= 24;

  for (const item of input.lines.slice(0, 12)) {
    page.drawRectangle({ x: 42, y: y - 4, width: 511, height: 24, color: rgb(1, 1, 1), borderColor: line, borderWidth: 0.5 });
    drawText(page, item.description, { x: 56, y: y + 4, size: 9, font, color: dark, maxChars: 48 });
    page.drawText(String(item.quantity), { x: 372, y: y + 4, size: 9, font, color: dark });
    page.drawText(money(item.unitPrice), { x: 410, y: y + 4, size: 9, font, color: dark });
    page.drawText(money(item.total), { x: 496, y: y + 4, size: 9, font, color: dark });
    y -= 26;
  }

  y -= 14;
  page.drawRectangle({ x: 350, y: y - 78, width: 203, height: 88, color: soft });
  page.drawText("Subtotal", { x: 365, y: y - 10, size: 10, font: bold, color: dark });
  page.drawText(money(input.subtotal), { x: 470, y: y - 10, size: 10, font, color: dark });
  page.drawText("Descuento", { x: 365, y: y - 34, size: 10, font: bold, color: dark });
  page.drawText(safe(input.discountLabel), { x: 470, y: y - 34, size: 10, font, color: dark });
  page.drawRectangle({ x: 350, y: y - 78, width: 203, height: 30, color: turquoise });
  page.drawText("TOTAL", { x: 365, y: y - 67, size: 12, font: bold, color: dark });
  page.drawText(money(input.total), { x: 455, y: y - 67, size: 12, font: bold, color: dark });

  if (input.notes) {
    page.drawText("Notas", { x: 42, y: y - 12, size: 11, font: bold, color: purple });
    page.drawText(input.notes.slice(0, 280), { x: 42, y: y - 32, size: 9, font, color: dark, maxWidth: 270, lineHeight: 12 });
  }

  page.drawText(input.footer || "En Redes Andamos", { x: 42, y: 42, size: 8, font, color: rgb(0.45, 0.42, 0.48) });
  page.drawRectangle({ x: 42, y: 26, width: 511, height: 5, color: lime });
  return Buffer.from(await pdf.save());
}
