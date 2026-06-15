import { prisma } from "@/lib/prisma";import { redirect } from "next/navigation";import { revalidatePath } from "next/cache";export async function POST(req:Request){const f=await req.formData();const taskId=Number(f.get("taskId"));await prisma.taskAttachment.create({data:{taskId,name:String(f.get("name")||"Adjunto"),url:String(f.get("url")||""),type:String(f.get("type")||"LINK")}});revalidatePath(`/planner/tarea/${taskId}`);redirect(`/planner/tarea/${taskId}`)}



