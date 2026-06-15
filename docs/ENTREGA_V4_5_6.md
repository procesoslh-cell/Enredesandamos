# En Redes Andamos ERP/CRM - V4.5 Entrega 6

Base: `en-redes-andamos-v4.5-entrega-5-clientes.zip`.

## Mejoras incluidas

### Clientes
- Corrección visual del popup de ficha 360° para evitar el temblor al abrir la ficha.
- Se elimina el desplazamiento por `hover transform` cuando el modal está abierto.
- Se mantiene buscador, paginación, tarjetas tipo contacto y edición en popup.

### Facturación
- Módulo menos demo y más operativo.
- Nuevo modelo `Issuer` para emisoras monotributistas.
- Las 7 socias se cargan como emisoras editables por base.
- Al facturar desde un presupuesto se puede seleccionar emisora.
- La factura guarda emisora, tipo, estado fiscal, vencimiento y monto.
- Botón `Descargar factura`.
- PDF de factura con:
  - logo,
  - cliente,
  - emisora,
  - servicios,
  - subtotal,
  - descuento,
  - total,
  - leyenda institucional.

### Presupuestos
- Botón `Descargar presupuesto`.
- PDF de presupuesto con logo, servicios, total y notas.
- Botón `Enviar por email` con `mailto:` al email del cliente.

## Instalación local

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

> Importante: esta entrega suma la dependencia `pdf-lib`, por eso hay que ejecutar `npm install` antes de probar los PDF.

## Pendiente futuro
- Administración visual de emisoras desde UI.
- Envío real de emails con adjunto PDF.
- Conexión integración fiscal real.
- Historial fiscal y estados de cobro.
