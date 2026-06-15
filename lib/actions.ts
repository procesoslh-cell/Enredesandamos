"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const str = (form: FormData, key: string) => String(form.get(key) || "").trim();
const num = (form: FormData, key: string) => Number(form.get(key) || 0);
const maybeDate = (value: string) => value ? new Date(value + "T00:00:00") : null;

export async function createLead(form: FormData) {
  await prisma.lead.create({ data: {
    company: str(form, "company"), contact: str(form, "contact"), email: str(form, "email"), phone: str(form, "phone"),
    source: str(form, "source"), status: str(form, "status") || "NUEVO", notes: str(form, "notes")
  }});
  revalidatePath("/crm"); redirect("/crm");
}

export async function updateLeadStatus(form: FormData) {
  await prisma.lead.update({ where: { id: num(form, "id") }, data: { status: str(form, "status") }});
  revalidatePath("/crm");
}

export async function createClient(form: FormData) {
  const client = await prisma.client.create({ data: {
    businessName: str(form, "businessName"), commercialName: str(form, "commercialName"),
    taxId: str(form, "taxId"), email: str(form, "email"), phone: str(form, "phone"), whatsapp: str(form, "whatsapp"),
    address: str(form, "address"), website: str(form, "website"), logoUrl: str(form, "logoUrl"), instagram: str(form, "instagram"), facebook: str(form, "facebook"),
    tiktok: str(form, "tiktok"), linkedin: str(form, "linkedin"), youtube: str(form, "youtube"),
    driveFolder: str(form, "driveFolder"), brandbookUrl: str(form, "brandbookUrl"), metaBusinessId: str(form, "metaBusinessId"),
    adAccountId: str(form, "adAccountId"), googleAnalytics: str(form, "googleAnalytics"), status: str(form, "status") || "ACTIVO"
  }});
  await prisma.notification.create({ data: { title: "Nuevo cliente creado", message: `Se creó la ficha de ${client.commercialName}.`, type: "CLIENTE", link: "/clientes" }});
  revalidatePath("/clientes"); redirect("/clientes");
}

export async function updateClient(form: FormData) {
  const id = num(form, "id");
  await prisma.client.update({ where: { id }, data: {
    businessName: str(form, "businessName"), commercialName: str(form, "commercialName"),
    taxId: str(form, "taxId"), email: str(form, "email"), phone: str(form, "phone"), whatsapp: str(form, "whatsapp"),
    address: str(form, "address"), website: str(form, "website"), logoUrl: str(form, "logoUrl"),
    instagram: str(form, "instagram"), facebook: str(form, "facebook"), tiktok: str(form, "tiktok"),
    linkedin: str(form, "linkedin"), youtube: str(form, "youtube"), driveFolder: str(form, "driveFolder"),
    brandbookUrl: str(form, "brandbookUrl"), metaBusinessId: str(form, "metaBusinessId"),
    adAccountId: str(form, "adAccountId"), googleAnalytics: str(form, "googleAnalytics"), status: str(form, "status") || "ACTIVO"
  }});
  await prisma.notification.create({ data: { title: "Cliente actualizado", message: `Se actualizó la ficha de ${str(form, "commercialName")}.`, type: "CLIENTE", link: "/clientes" }});
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function createService(form: FormData) {
  await prisma.service.create({ data: { code: str(form, "code"), name: str(form, "name"), description: str(form, "description"), price: num(form, "price"), taxRate: num(form, "taxRate"), active: true }});
  revalidatePath("/servicios"); redirect("/servicios");
}

export async function createExpense(form: FormData) {
  const clientId = num(form, "clientId");
  await prisma.expense.create({ data: { clientId: clientId || null, category: str(form, "category"), description: str(form, "description"), amount: num(form, "amount"), date: maybeDate(str(form, "date")) || new Date() }});
  revalidatePath("/gastos"); redirect("/gastos");
}

export async function createUser(form: FormData) {
  const passwordHash = await bcrypt.hash(str(form, "password") || "Usuario123!", 10);
  await prisma.user.create({ data: { name: str(form, "name"), email: str(form, "email"), passwordHash, role: str(form, "role") || "DIRECTORA_CUENTAS", accountType: str(form, "role") === "CLIENTE" ? "CLIENTE" : "COLABORADOR", approvalStatus: "APROBADO", active: true, approvedAt: new Date() }});
  revalidatePath("/usuarios"); redirect("/usuarios");
}

export async function createProject(form: FormData) {
  const project = await prisma.project.create({ data: {
    clientId: num(form, "clientId"), name: str(form, "name"), serviceType: str(form, "serviceType"),
    startDate: maybeDate(str(form, "startDate")) || new Date(), endDate: maybeDate(str(form, "endDate")), status: "ACTIVO"
  }});
  const stageNames = ["Brief", "Estrategia", "Copy", "Diseño", "Aprobación", "Publicación"];
  for (let i = 0; i < stageNames.length; i++) {
    await prisma.stage.create({ data: { projectId: project.id, name: stageNames[i], startDate: new Date(Date.now()+i*2*24*60*60*1000), endDate: new Date(Date.now()+(i*2+2)*24*60*60*1000), order: i + 1 }});
  }
  await prisma.notification.create({ data: { title: "Proyecto creado", message: `Se creó el proyecto ${project.name} con etapas base.`, type: "PROYECTO", link: "/planner" }});
  revalidatePath("/planner"); redirect("/planner");
}

export async function createTask(form: FormData) {
  const responsibleId = num(form, "responsibleId");
  const stageId = num(form, "stageId");
  const task = await prisma.task.create({ data: {
    projectId: num(form, "projectId"), stageId: stageId || null, responsibleId: responsibleId || null,
    title: str(form, "title"), description: str(form, "description"), status: str(form, "status") || "PENDIENTE", dueDate: maybeDate(str(form, "dueDate"))
  }});
  if (responsibleId) await prisma.notification.create({ data: { userId: responsibleId, title: "Nueva tarea asignada", message: `Te asignaron: ${task.title}`, type: "TAREA", link: "/planner" }});
  revalidatePath("/planner"); redirect("/planner");
}

export async function createCampaign(form: FormData) {
  await prisma.campaign.create({ data: { name: str(form, "name"), channel: str(form, "channel"), segment: str(form, "segment"), subject: str(form, "subject"), message: str(form, "message"), status: "BORRADOR" }});
  revalidatePath("/omnicanal"); redirect("/omnicanal");
}

export async function updateUserAccess(form: FormData) {
  const userId = num(form, "userId");
  const role = str(form, "role") || "PENDIENTE";
  const clientId = num(form, "clientId");
  const action = str(form, "action") || "APROBAR";
  const approvalStatus = action === "RECHAZAR" ? "RECHAZADO" : action === "SUSPENDER" ? "SUSPENDIDO" : "APROBADO";
  await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      clientId: clientId || null,
      approvalStatus,
      active: approvalStatus === "APROBADO",
      approvedAt: approvalStatus === "APROBADO" ? new Date() : null
    }
  });
  await prisma.notification.create({ data: { userId, title: "Acceso actualizado", message: `Tu usuario fue actualizado a estado ${approvalStatus}.`, type: "USUARIOS", link: "/home" } });
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function createCalendarEvent(form: FormData) {
  const responsibleId = num(form, "responsibleId");
  const clientId = num(form, "clientId");
  const projectId = num(form, "projectId");
  const taskId = num(form, "taskId");
  const event = await prisma.calendarEvent.create({ data: {
    title: str(form, "title"),
    description: str(form, "description"),
    eventType: str(form, "eventType") || "TAREA",
    status: str(form, "status") || "PLANIFICADO",
    priority: str(form, "priority") || "MEDIA",
    startDate: maybeDate(str(form, "startDate")) || new Date(),
    endDate: maybeDate(str(form, "endDate")),
    allDay: true,
    responsibleId: responsibleId || null,
    clientId: clientId || null,
    projectId: projectId || null,
    taskId: taskId || null
  }});
  if (responsibleId) await prisma.notification.create({ data: { userId: responsibleId, title: "Nuevo evento asignado", message: `Tenés un evento en calendario: ${event.title}`, type: "CALENDARIO", link: "/calendario" } });
  revalidatePath("/calendario");
  redirect("/calendario");
}
