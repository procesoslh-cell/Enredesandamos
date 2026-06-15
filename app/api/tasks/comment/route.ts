import { prisma } from "@/lib/prisma";import { getSession } from "@/lib/auth";import { redirect } from "next/navigation";import { revalidatePath } from "next/cache";export async function POST(req:Request){const s=await getSession();const f=await req.formData();const taskId=Number(f.get("taskId"));const pr=String(f.get("progress")||"");await prisma.taskComment.create({data:{taskId,userId:s?.id,message:String(f.get("message")||""),progress:pr?Number(pr):null}});if(pr)await prisma.task.update({where:{id:taskId},data:{progress:Number(pr)}});revalidatePath(`/planner/tarea/${taskId}`);redirect(`/planner/tarea/${taskId}`)}



