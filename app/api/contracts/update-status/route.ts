import { prisma } from "@/lib/prisma";import { redirect } from "next/navigation";import { revalidatePath } from "next/cache";export async function POST(req:Request){const f=await req.formData();await prisma.contract.update({where:{id:Number(f.get("id"))},data:{renewalStatus:String(f.get("renewalStatus")),retentionNotes:String(f.get("retentionNotes")||"")}});revalidatePath("/retencion");redirect("/retencion")}



