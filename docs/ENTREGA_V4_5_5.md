# En Redes Andamos ERP/CRM - V4.5 Entrega 5

## Mejora aplicada: Clientes 360 como vista de contactos

Esta entrega toma como base la V4.5 Entrega 4 y mejora el modulo Clientes.

### Incluye

- Buscador por nombre comercial, razon social, CUIT, email o red social.
- Paginacion con limite de 20 clientes por vista.
- Contador visual tipo `1-20 / 100 clientes`.
- Tarjetas compactas estilo contacto, compactas y visuales.
- Boton `Nuevo cliente` en popup para no ocupar toda la pantalla.
- Boton `Abrir ficha` en cada cliente.
- Popup de ficha 360 con informacion general, redes, archivos, comercial y rentabilidad.
- Edicion de cliente dentro del popup.
- Nuevo campo `logoUrl` para guardar imagen liviana del contacto.

### Nota sobre imagenes

Para evitar peso innecesario en el sistema, esta version usa URL de imagen/logo optimizado. Recomendacion:

- PNG o WebP.
- Menos de 300 KB.
- Subir a Drive, CDN, storage o carpeta publica optimizada.

### Cambios tecnicos

- `Client.logoUrl` agregado en Prisma.
- `createClient` ahora guarda `logoUrl`.
- Nueva accion server `updateClient`.
- `/clientes` ahora usa busqueda, paginacion y popup.

### Ejecutar localmente

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```
