const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
async function upsertUser(name,email,password,role,extra={}){const passwordHash=await bcrypt.hash(password,10);return prisma.user.upsert({where:{email},update:{approvalStatus:"APROBADO",active:true,role,...extra},create:{name,email,passwordHash,role,accountType:role==="CLIENTE"?"CLIENTE":"COLABORADOR",approvalStatus:"APROBADO",active:true,approvedAt:new Date(),...extra}})}
async function main(){
 const admin=await upsertUser("Admin En Redes","admin@enredesandamos.com","Admin123!","SUPER_ADMIN");
 const dir=await upsertUser("Directora de Cuentas","cuentas@enredesandamos.com","Cuentas123!","DIRECTORA_CUENTAS");
 const dis=await upsertUser("Diseñadora Demo","diseno@enredesandamos.com","Diseno123!","DISENADORA");
 const copy=await upsertUser("Copywriter Demo","copy@enredesandamos.com","Copy123!","COPYWRITER");
 const cliUser=await upsertUser("Cliente Demo","cliente@soplodevida.com","Cliente123!","CLIENTE");

 const issuerSeeds=[
  {name:"Socia 1",taxId:"CUIT pendiente",address:"Buenos Aires",fiscalCondition:"Monotributo",pointOfSale:"0001",email:"socia1@enredesandamos.com"},
  {name:"Socia 2",taxId:"CUIT pendiente",address:"Buenos Aires",fiscalCondition:"Monotributo",pointOfSale:"0002",email:"socia2@enredesandamos.com"},
  {name:"Socia 3",taxId:"CUIT pendiente",address:"Buenos Aires",fiscalCondition:"Monotributo",pointOfSale:"0003",email:"socia3@enredesandamos.com"},
  {name:"Socia 4",taxId:"CUIT pendiente",address:"Buenos Aires",fiscalCondition:"Monotributo",pointOfSale:"0004",email:"socia4@enredesandamos.com"},
  {name:"Socia 5",taxId:"CUIT pendiente",address:"Buenos Aires",fiscalCondition:"Monotributo",pointOfSale:"0005",email:"socia5@enredesandamos.com"},
  {name:"Socia 6",taxId:"CUIT pendiente",address:"Buenos Aires",fiscalCondition:"Monotributo",pointOfSale:"0006",email:"socia6@enredesandamos.com"},
  {name:"Socia 7",taxId:"CUIT pendiente",address:"Buenos Aires",fiscalCondition:"Monotributo",pointOfSale:"0007",email:"socia7@enredesandamos.com"}
 ];
 if(await prisma.issuer.count()===0){for(const issuer of issuerSeeds) await prisma.issuer.create({data:issuer});}
 const firstIssuer=await prisma.issuer.findFirst({orderBy:{id:"asc"}});
 const c1=await prisma.client.upsert({where:{id:1},update:{},create:{businessName:"Soplo de Vida SRL",commercialName:"Soplo de Vida",email:"contacto@soplodevida.com",whatsapp:"+54 9 11 5555-5555",instagram:"@soplodevida",website:"https://soplodevida.com",brandbookUrl:"https://drive.google.com",metaBusinessId:"BM-123456",adAccountId:"act_123456"}});
 const c2=await prisma.client.upsert({where:{id:2},update:{},create:{businessName:"Nubika SAS",commercialName:"Nubika",email:"hola@nubika.com",instagram:"@nubika"}});
 await prisma.user.update({where:{id:cliUser.id},data:{clientId:c1.id}});
 if(await prisma.contract.count()===0){await prisma.contract.createMany({data:[{clientId:c1.id,name:"Plan Redes + Ads",startDate:new Date(),endDate:new Date(Date.now()+120*86400000),monthlyValue:270000,renewalStatus:"PENDIENTE",contractPdfName:"Contrato Soplo de Vida.pdf",contractPdfUrl:"https://drive.google.com",retentionNotes:"Contactar 20 días antes del vencimiento."},{clientId:c2.id,name:"Plan Branding",startDate:new Date(Date.now()-45*86400000),endDate:new Date(Date.now()+45*86400000),monthlyValue:220000,renewalStatus:"SEGUIMIENTO",contractPdfName:"Contrato Nubika.pdf",contractPdfUrl:"https://drive.google.com",retentionNotes:"Cliente interesado en sumar pauta."}]})}
 if(await prisma.lead.count()===0)await prisma.lead.createMany({data:[{company:"Nubika",contact:"Magui",email:"magui@nubika.com",source:"Instagram",status:"PRESUPUESTO",notes:"Interesada en branding y redes."},{company:"Estudio Mora",contact:"Mora",email:"hola@estudiomora.com",source:"Referido",status:"REUNION"},{company:"Casa Terra",contact:"Sofia",email:"sofia@casaterra.com",source:"Web",status:"CONTACTADO"},{company:"Tienda Aura",contact:"Luli",email:"hola@aura.com",source:"Instagram",status:"NUEVO"}]});
 for(const s of [{code:"CM-001",name:"Community Management",description:"Gestión mensual de redes sociales.",price:150000},{code:"ADS-001",name:"Gestión Meta Ads",description:"Administración y optimización de campañas.",price:120000},{code:"BR-001",name:"Branding Integral",description:"Identidad visual, brandbook y aplicaciones.",price:300000},{code:"WEB-001",name:"Landing Page",description:"Diseño y desarrollo de landing page.",price:250000}]) await prisma.service.upsert({where:{code:s.code},update:{},create:s});
 const quote=await prisma.quote.upsert({where:{number:"P-0001"},update:{},create:{number:"P-0001",clientId:c1.id,status:"ENVIADO",subtotal:270000,discountType:"PERCENT",discountValue:10,total:243000,notes:"Promo de lanzamiento para cliente nuevo."}});
 if(await prisma.quoteItem.count({where:{quoteId:quote.id}})===0)await prisma.quoteItem.createMany({data:[{quoteId:quote.id,description:"Community Management",quantity:1,unitPrice:150000,total:150000},{quoteId:quote.id,description:"Gestión Meta Ads",quantity:1,unitPrice:120000,total:120000}]});
 await prisma.invoice.upsert({where:{number:"F-0001"},update:{issuerId:firstIssuer?.id || null,fiscalStatus:"BORRADOR",invoiceType:"C"},create:{number:"F-0001",clientId:c1.id,quoteId:quote.id,issuerId:firstIssuer?.id || null,status:"PENDIENTE",fiscalStatus:"BORRADOR",invoiceType:"C",amount:243000,dueDate:new Date(Date.now()+7*86400000)}});
 if(await prisma.expense.count()===0)await prisma.expense.createMany({data:[{clientId:c1.id,category:"Software",description:"Canva Pro",amount:12000},{clientId:c1.id,category:"Freelancer",description:"Diseño extra para campaña",amount:45000}]});
 if(await prisma.project.count()===0){const p=await prisma.project.create({data:{clientId:c1.id,name:"Lanzamiento campaña invierno",serviceType:"Meta Ads + Redes",startDate:new Date(),endDate:new Date(Date.now()+21*86400000)}});let stages=[];for(const [i,n] of ["Brief","Estrategia","Copy","Diseño","Aprobación","Publicación"].entries()){stages.push(await prisma.stage.create({data:{projectId:p.id,name:n,startDate:new Date(Date.now()+i*2*86400000),endDate:new Date(Date.now()+(i*2+2)*86400000),order:i+1}}))}const t1=await prisma.task.create({data:{projectId:p.id,stageId:stages[0].id,title:"Relevar objetivos del cliente",status:"FINALIZADA",progress:100,responsibleId:dir.id,dueDate:new Date(Date.now()+86400000)}});const t2=await prisma.task.create({data:{projectId:p.id,stageId:stages[2].id,title:"Redactar copys de campaña",status:"EN_PROCESO",progress:45,responsibleId:copy.id,dueDate:new Date(Date.now()+5*86400000)}});await prisma.task.create({data:{projectId:p.id,stageId:stages[3].id,title:"Diseñar piezas para feed e historias",status:"LISTA",progress:10,responsibleId:dis.id,dueDate:new Date(Date.now()+8*86400000),dependsOnId:t2.id}});await prisma.taskComment.createMany({data:[{taskId:t1.id,userId:dir.id,message:"Brief relevado y objetivos cargados.",progress:100},{taskId:t2.id,userId:copy.id,message:"Avance de copys principales. Falta ajustar CTA.",progress:45}]});await prisma.taskAttachment.create({data:{taskId:t2.id,name:"Documento de copys",url:"https://drive.google.com",type:"DOC"}})}
 if(await prisma.contentItem.count()===0)await prisma.contentItem.createMany({data:[{clientId:c1.id,title:"Post lanzamiento campaña",channel:"Instagram",contentType:"Feed",publishDate:new Date(Date.now()+3*86400000),status:"PLANIFICADO",notes:"Diseño pendiente"},{clientId:c1.id,title:"Reel tips del producto",channel:"Instagram",contentType:"Reel",publishDate:new Date(Date.now()+8*86400000),status:"EN_PROCESO",notes:"Guion en revisión"}]});
 if(await prisma.campaign.count()===0)await prisma.campaign.create({data:{name:"Promo branding junio",channel:"EMAIL",segment:"Clientes activos",subject:"Impulsá tu marca este mes",message:"Tenemos una promoción especial para renovar la identidad de tu marca.",status:"BORRADOR"}});
 if(await prisma.calendarEvent.count()===0){
  const project=await prisma.project.findFirst({include:{tasks:true}});
  await prisma.calendarEvent.createMany({data:[
   {title:"Reunión interna de planificación",eventType:"REUNION",status:"PLANIFICADO",priority:"ALTA",startDate:new Date(Date.now()+86400000),endDate:new Date(Date.now()+86400000),responsibleId:dir.id,clientId:c1.id,projectId:project?.id},
   {title:"Entrega de piezas iniciales",eventType:"ENTREGA",status:"PLANIFICADO",priority:"URGENTE",startDate:new Date(Date.now()+4*86400000),responsibleId:dis.id,clientId:c1.id,projectId:project?.id,taskId:project?.tasks?.[0]?.id},
   {title:"Revisión pauta Meta Ads",eventType:"REVISION",status:"PLANIFICADO",priority:"MEDIA",startDate:new Date(Date.now()+6*86400000),responsibleId:admin.id,clientId:c1.id,projectId:project?.id}
  ]})
 }

 if(await prisma.notification.count()===0)await prisma.notification.createMany({data:[{userId:admin.id,title:"Factura pendiente",message:"La factura F-0001 vence en 7 días.",type:"FINANZAS",link:"/facturacion"},{userId:dir.id,title:"Contrato en seguimiento",message:"Nubika vence en 45 días. Trabajar renovación.",type:"RETENCION",link:"/retencion"},{userId:dis.id,title:"Tarea asignada",message:"Diseñar piezas para feed e historias.",type:"TAREA",link:"/planner"},{userId:cliUser.id,title:"Presupuesto enviado",message:"Tenés un presupuesto disponible para revisar.",type:"CLIENTE",link:"/portal-cliente"}]});
 console.log("Seed listo. Admin: admin@enredesandamos.com / Admin123!")
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(async()=>prisma.$disconnect());
