import { prisma } from "@/lib/prisma";import { redirect } from "next/navigation";import { revalidatePath } from "next/cache";export async function POST(req:Request){const f=await req.formData();const quoteId=Number(f.get("quoteId"));const q=await prisma.quote.update({where:{id:quoteId},data:{status:"ACEPTADO",acceptedAt:new Date()}});await prisma.notification.create({data:{title:"Propuesta aceptada",message:`El cliente aceptó ${q.number}.`,type:"VENTAS",link:"/presupuestos"}});revalidatePath("/portal-cliente");revalidatePath("/presupuestos");redirect("/portal-cliente")}



