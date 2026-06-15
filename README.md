# En Redes Andamos ERP / CRM - V4.5 Entrega 2

Versión trabajada sobre `en-redes-andamos-v3-colaborativa.zip` como base visual y funcional. No es una reconstrucción desde cero.

## Incluye en esta entrega

- Login corregido: logo centrado, sin textos corporativos genéricos, caja de Inspiración del Día y banco inicial de 100 frases.
- Identidad visual oficial aplicada: lima `#C9D26A`, lila `#B28BC9`, turquesa `#59D1C9`, gris oscuro `#3A3A3A`, blanco `#FFFFFF`.
- Home compacto con KPIs ejecutivos y acceso a módulos.
- CRM Pipeline completo: Prospecto, Primer contacto, Reunión, Presupuesto, Negociación, Ganado, Perdido.
- Clientes 360°: datos generales, redes, archivos/accesos operativos, comercial y rentabilidad.
- Planner colaborativo reforzado: Pendiente, En curso, Revisión, Aprobado, Finalizado; filtros por cliente, responsable y estado; tareas con checklist/descripción, comentarios, adjuntos y avance.
- Retención: contratos de duración libre, semáforo de renovación y botón Crear propuesta de renovación.
- Presupuestos operativos: cliente, servicios, descuento, total, estados y PDF, email y portal.
- Facturación: vista con emisoras monotributistas configurables y comprobantes descargables.
- Corrección técnica: `daysUntil` agregado para resolver import roto de Retención.

## Cómo ejecutar

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Demo

- Admin: `admin@enredesandamos.com` / `Admin123!`
- Cliente: `cliente@soplodevida.com` / `Cliente123!`

## Nota técnica

En este paquete se mantiene SQLite y Prisma. La migración futura a PostgreSQL queda preparada a nivel de arquitectura, pero no se cambia el motor de base de datos en esta entrega.

## V4.5 Entrega 3 - MVP acceso Gmail + calendario operativo

Esta entrega toma como base oficial `en-redes-andamos-v4.5-entrega-2.zip` y suma una capa preparada para el MVP de reunión:

- Login real con Google/Gmail mediante OAuth 2.0 sin crear usuarios manualmente.
- Flujo de alta pendiente para colaboradoras y clientes.
- Panel `Usuarios y accesos` para aprobar, rechazar, suspender, asignar rol y vincular cliente.
- Roles ampliados: ADMIN, DIRECCION, PROJECT_MANAGER, COMMUNITY_MANAGER, FINANZAS, además de los roles existentes.
- Calendario operativo conectado con proyectos, tareas, contenido, clientes y responsables.
- Creación de eventos desde el módulo Calendario: reunión, publicación, entrega, revisión, vencimiento, facturación y recordatorios.
- Notificaciones automáticas cuando se asigna un evento o llega una solicitud de acceso.

### Configuración Google OAuth

1. Entrar a Google Cloud Console.
2. Crear un OAuth Client ID de tipo Web Application.
3. Agregar como Authorized redirect URI local:

```txt
http://localhost:3000/api/auth/google/callback
```

4. En producción, agregar también:

```txt
https://TU-DOMINIO.com/api/auth/google/callback
```

5. Copiar los valores en `.env`:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="tu-client-id"
GOOGLE_CLIENT_SECRET="tu-client-secret"
JWT_SECRET="un-secreto-largo"
DATABASE_URL="file:./dev.db"
```

### Flujo de uso recomendado

- Las chicas entran desde `Continuar con Gmail como colaboradora`.
- Los clientes entran desde `Continuar con Gmail como cliente`.
- La primera vez quedan pendientes.
- La administradora entra con el usuario demo/admin aprobado y va a `Usuarios`.
- Desde ahí asigna rol y aprueba.
- El próximo ingreso con Gmail ya entra al sistema o portal cliente.

### Comandos locales

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```


## V4.5 Entrega 4

Esta entrega parte de `en-redes-andamos-v4.5-entrega-3.zip` y suma las mejoras pedidas para probar en VS Code:

- Planner con jerarquía clara: **Proyecto → Tareas**.
- Nuevo bloque **Crear proyecto** dentro del planner.
- Filtros por cliente, proyecto, responsable y estado.
- Tarjetas de proyecto con resumen de tareas, etapas y avance promedio.
- Calendario mensual visual con selector de mes y año.
- Navegación: mes anterior, mes siguiente y hoy.
- Eventos y tareas en formato de **pegatinas** respetando la paleta de marca.
- Hover sobre cada pegatina con datos rápidos.
- Click en tareas del calendario para abrir la tarea del planner.
- Filtros del calendario por cliente, proyecto, responsable y tipo.

Para probar localmente:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## V4.5 Entrega 6

Incluye corrección del popup de Clientes, emisoras reales para facturación y descarga de PDF para facturas y presupuestos.

Nueva dependencia:

```bash
npm install
```

Luego ejecutar:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## V4.5 Entrega 7

Incluye mejoras finales para subir una versión online más limpia:

- Logo corregido en PDFs de presupuesto y factura.
- PDFs comerciales sin textos internos de desarrollo.
- Nuevo módulo **Emisoras** para configurar las socias que pueden facturar.
- Facturación con selección de emisora y descarga de factura.
- Presupuestos con descarga de PDF y envío por email.
- Limpieza de referencias internas visibles dentro de los módulos.

Si ven errores de Prisma después de actualizar, correr:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```
