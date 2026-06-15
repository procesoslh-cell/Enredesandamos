# Entrega V4.5.7 - Emisoras y PDFs comerciales

## Cambios principales

- Corrección del logo en los PDFs de presupuesto y factura.
- Rediseño de cabecera de PDF para evitar recortes.
- Limpieza de textos internos dentro de los módulos visibles.
- Nuevo módulo Emisoras para configurar las socias que facturan.
- Facturación permite seleccionar emisora y generar comprobante descargable.
- Presupuestos descargan PDF comercial limpio.
- Se mantienen acciones de enviar presupuesto por email.

## Módulo Emisoras

Campos incluidos:

- Nombre
- CUIT
- Condición fiscal
- Punto de venta
- Email
- Dirección fiscal
- Teléfono
- Tipo de factura predeterminado
- Observaciones internas
- Estado activo/inactivo

## Notas técnicas

Se agregaron campos al modelo `Issuer`. Ejecutar:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
