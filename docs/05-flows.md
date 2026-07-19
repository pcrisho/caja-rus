# Flujos UX — CajaRUS

## 1. Flujo de Venta Express (POS)

```mermaid
flowchart TD
    A["Abre la App"] --> B{"Pantalla principal<br/>(POS directo)"}
    B --> C["Escanea código de barras<br/>con cámara"]
    B --> D["Busca por nombre<br/>o voz (IA)"]

    C --> E{"Producto por<br/>unidad o peso?"}
    D --> E

    E -->|"Unidad"| F["Suma +1 al carrito"]
    E -->|"Peso (KG)"| G["Abre teclado numérico<br/>Ingresa peso (ej: 0.750)"]
    G --> H["Calcula precio proporcional<br/>en tiempo real"]

    F --> I["Muestra carrito"]
    H --> I

    I --> J["Ajusta cantidades<br/>con +/-"]
    J --> K["Selecciona método de pago<br/>(Yape / Plin / Efectivo / MIXED)"]
    K --> L["Presiona botón verde<br/>CONFIRMAR Y REGISTRAR"]

    L --> M{"Hay conexión?"}

    M -->|"Sí"| N["Server Action: createSale"]
    N --> O["Descuenta stock en BD"]
    O --> P["Actualiza NRUS Monthly"]
    P --> Q["Vibración háptica<br/>Limpia pantalla"]

    M -->|"No"| R["Guarda en cola local<br/>(Zustand + localStorage)"]
    R --> S["Muestra banner offline<br/>Ámbar"]
    S --> Q
```

### Wireframe Conceptual — Pantalla POS

```
+-----------------------------------------------------+
| [≡] CajaRUS                     ( Carrito: S/ 0.00 )|
+-----------------------------------------------------+
|                                                     |
|  [ [O] ESCANEAR CÓDIGO (Cámara) ]   Botón Gigante   |
|                                                     |
+-----------------------------------------------------+
| [🔍 Buscar producto por nombre...               ]   |
| [🎙️] Botón Micrófono (IA Agéntica)                |
+-----------------------------------------------------+
| LISTA DEL CARRITO                                   |
|                                                     |
|  Leche Gloria Azul 400g                             |
|  [ - ]  2 und  [ + ]                  S/ 9.00  [X] |
|                                                     |
|  Arroz Costeño (Granel)                             |
|  [ Peso: 1.500 kg ]                   S/ 6.75  [X] |
+-----------------------------------------------------+
| TOTAL A COBRAR: S/ 15.75                            |
|                                                     |
|  [ YAPE ]  [ PLIN ]  [ EFECTIVO ]  [ MIXED ]       |
|  * MIXED: permite dividir pago en múltiples         |
|    métodos (ej: S/ 10 Yape + S/ 5 Efectivo)        |
|                                                     |
|  [ 🟢 CONFIRMAR Y REGISTRAR VENTA ]  Botón XXL     |
+-----------------------------------------------------+
```

## 2. Flujo de Compra con OCR (IA)

```mermaid
flowchart TD
    A["Administrador abre módulo<br/>Registrar Compra"] --> B["Toma foto a la<br/>factura física"]
    B --> C["Sube imagen a<br/>Cloudflare R2"]
    C --> D["Server Action envía<br/>URL a Gemini API"]

    D --> E["IA Vision procesa<br/>imagen"]
    E --> F["Extrae datos estructurados<br/>(Zod validation)"]

    F --> G["Muestra pantalla de<br/>revisión humana"]
    G --> H{"Productos existen<br/>en catálogo?"}

    H -->|"Sí (fuzzy match)"| I["Marca en verde"]
    H -->|"No (nuevos)"| J["Marca en ámbar<br/>Boton: Asignar precio"]

    I --> K["Usuario confirma"]
    J --> K
    K --> L["Presiona Confirmar e Ingresar"]

    L --> M["Actualiza inventario<br/>(stock + costos)"]
    M --> N["Registra compra en<br/>historial financiero"]
    N --> O["Actualiza totalPurchases<br/>del NRUS mensual"]
```

### Wireframe Conceptual — Pantalla OCR

```
+-----------------------------------------------------+
| [←] Registrar Compra Proveedor                      |
+-----------------------------------------------------+
|                                                     |
|  +-----------------------------------------------+  |
|  |                                               |  |
|  |           [ 📷 TOMAR FOTO A FACTURA ]         |  |
|  |                                               |  |
|  +-----------------------------------------------+  |
|                                                     |
+-----------------------------------------------------+
| DETECCIÓN EN PROCESO (Validación por IA)           |
|                                                     |
|  RUC: 20100058623 (Alicorp S.A.A.)                  |
|  Base Imponible: S/ 406.78                          |
|  IGV (18%):     S/  73.22                          |
|  Total Factura: S/ 480.00                           |
|                                                     |
|  Productos Detectados:                              |
|  • Aceite Primor 1L -- 20 und @ S/ 7.50             |
|  • Fideos Don Vittorio 500g -- 50 und @ S/ 3.20     |
|                                                     |
|  [⚠️ 2 productos nuevos no registrados]             |
+-----------------------------------------------------+
| [ 🔄 Volver a tomar ]    [ 💾 Confirmar e Ingresar ]|
+-----------------------------------------------------+
```

## 3. Flujo de Alertas NRUS (SUNAT)

```mermaid
flowchart LR
    A["Venta registrada"] --> B["Suma al totalSales<br/>del mes actual"]
    A2["Compra registrada"] --> B2["Suma al totalPurchases<br/>del mes actual"]

    B --> C{"max(totalSales,<br/>totalPurchases) > 0?"}
    B2 --> C

    C -->|"Sí"| D["Calcula L_mes = max(V, C)"]

    D --> E{"L_mes >= 85%<br/>de S/ 5,000?<br/>(S/ 4,250)"}
    E -->|"Sí"| F["Alerta Ámbar:<br/>Prepárese para<br/>Categoría 2"]

    D --> G{"L_mes > S/ 5,000?"}
    G -->|"Sí"| H["Cambia a Categoría 2<br/>Cuota: S/ 50/mes"]

    H --> I{"L_mes >= 85%<br/>de S/ 8,000?<br/>(S/ 6,800)"}
    I -->|"Sí"| J["Alerta Ámbar:<br/>Límite próximo"]

    H --> K{"L_mes > S/ 8,000?"}
    K -->|"Sí"| L["Incrementa contador<br/>consecutiveExcess"]

    L --> M{"consecutiveExcess<br/>>= 2 meses?"}
    M -->|"Sí"| N["🔴 EXCLUSIÓN NRUS<br/>Excedió 2 meses consecutivos<br/>Pasar a Régimen MYPE"]
    M -->|"No"| O["🔴 ALERTA CRÍTICA<br/>Excedió NRUS este mes"]

    E -->|"No"| P["Todo normal<br/>Categoría 1<br/>Cuota: S/ 20/mes"]
    G -->|"No"| P
    I -->|"No"| P
    K -->|"No"| P

    O --> Q{"Mes siguiente<br/>L_mes <= 8,000?"}
    Q -->|"Sí"| R["Resetea consecutiveExcess<br/>a 0"]
    Q -->|"No"| S["Incrementa consecutiveExcess<br/>(vuelve a evaluar)"]
    R --> P
    S --> M
```

## 4. Flujo de Devolución / Nota de Crédito

```mermaid
flowchart TD
    A["Cliente solicita<br/>devolución"] --> B["Cajero selecciona<br/>'Devolución' en POS"]

    B --> C["Busca venta original<br/>por código o DNI"]

    C --> D["Sistema muestra<br/>detalle de venta original"]
    D --> E["Cajero selecciona<br/>productos a devolver"]

    E --> F{"Productos en<br/>condiciones óptimas?"}
    F -->|"Sí"| G["Sistema calcula<br/>monto a reembolsar"]
    F -->|"No"| H["Rechazar devolución<br/>(registrar incidencia)"]

    G --> I["Selecciona método<br/>de reembolso<br/>(Efectivo / Yape / Plin)"]

    I --> J["Presiona CONFIRMAR<br/>DEVOLUCIÓN"]

    J --> K{"Hay conexión?"}

    K -->|"Sí"| L["Server Action: createReturn"]
    L --> M["Revierte stock en BD<br/>(incrementa inventario)"]
    M --> N["Crea Nota de Crédito<br/>asociada a venta original"]

    N --> O{"Venta original<br/>afectó NRUS?"}
    O -->|"Sí"| P["Resta monto devuelto<br/>de totalSales del mes"]
    O -->|"No"| Q["No impacta NRUS"]

    P --> R["Registra en<br/>historial de devoluciones"]
    Q --> R

    K -->|"No"| S["Guarda en cola local<br/>para sincronizar"]
    S --> T["Muestra banner offline"]
    T --> R

    R --> U["Vibración háptica<br/>Limpia pantalla"]
```

### Wireframe Conceptual — Devolución

```
+-----------------------------------------------------+
| [←] Devolución / Nota de Crédito                    |
+-----------------------------------------------------+
|                                                     |
|  🔍 Buscar venta original: [________________]      |
|                                                     |
|  Venta #1042 — 12/06/2026 — S/ 32.50                |
|  Cliente: María López                               |
|                                                     |
|  Productos originales:                              |
|  [✓] Leche Gloria 400g  x2     S/ 9.00             |
|  [✓] Arroz Costeño 1kg   x1     S/ 4.50             |
|  [ ] Fideos Don Vittorio x3     S/ 9.60             |
|                                                     |
+-----------------------------------------------------+
| Total a reembolsar: S/ 13.50                        |
|                                                     |
| Reembolsar vía: [ Efectivo ] [ Yape ] [ Plin ]     |
|                                                     |
|  [ 🔴 CONFIRMAR DEVOLUCIÓN Y NOTA DE CRÉDITO ]     |
+-----------------------------------------------------+
```

## 5. Flujo de Cierre de Caja

```mermaid
flowchart TD
    A["Cajero inicia cierre<br/>al final del turno"] --> B["Sistema calcula<br/>expectedAmount<br/>(total ventas en efectivo)"]

    B --> C["Muestra resumen<br/>de ventas del turno:<br/>• Total ventas<br/>• Cantidad de transacciones<br/>• Desglose por método de pago"]

    C --> D["Cajero ingresa<br/>countedAmount<br/>(conteo físico de billetes/monedas)"]

    D --> E["Sistema calcula<br/>diferencia =<br/>countedAmount - expectedAmount"]

    E --> F{"diferencia == 0?"}

    F -->|"Sí"| G["✅ Cierre exitoso<br/>Registra cierre<br/>Limpia arqueo"]

    F -->|"No"| H["⚠️ Diferencia detectada:<br/>S/ {diferencia}"]

    H --> I["Sistema muestra alerta<br/>y solicita confirmación"]

    I --> J["Cajero confirma<br/>con observaciones"]

    J --> K["Registra diferencia<br/>en auditoría<br/>(cashRegisterLog)"]

    K --> L["Notifica a supervisor<br/>(si diferencia > umbral)"]

    L --> M["Cierre registrado<br/>con incidencia"]
```

### Wireframe Conceptual — Cierre de Caja

```
+-----------------------------------------------------+
| [←] Cierre de Caja — Turno: Mañana                  |
+-----------------------------------------------------+
|  RESUMEN DEL TURNO                                  |
|  • Total ventas:              S/ 1,250.00           |
|  • Transacciones:             32                     |
|  • Efectivo:                  S/   850.00           |
|  • Yape:                      S/   250.00           |
|  • Plin:                      S/   100.00           |
|  • MIXED:                     S/    50.00           |
+-----------------------------------------------------+
|  ARQUEO DE EFECTIVO                                 |
|                                                     |
|  Expected (sistema):     S/   850.00                |
|  Counted (físico):       [ S/ ________ ]            |
|                                                     |
|  Diferencia:             S/     0.00                |
|                                                     |
+-----------------------------------------------------+
|                         [ 💾 CONFIRMAR CIERRE ]    |
+-----------------------------------------------------+
```

## 6. Flujo de Múltiples Métodos de Pago (MIXED)

```mermaid
flowchart TD
    A["Carrito con productos<br/>agregados"] --> B["Cajero presiona<br/>MIXED"]

    B --> C["Se abre panel<br/>de split de pago"]

    C --> D["Ingresa monto para<br/>primer método<br/>(ej: Yape: S/ 10.00)"]

    D --> E["Selecciona segundo<br/>método para el saldo<br/>(ej: Efectivo: S/ 5.00)"]

    E --> F{"Saldo cubierto<br/>completamente?"}

    F -->|"Sí"| G["Muestra resumen MIXED:<br/>• Yape: S/ 10.00<br/>• Efectivo: S/ 5.00"]

    F -->|"No"| H["Agrega otro método<br/>hasta cubrir el total"]

    H --> I{"Más de 3 métodos?"}
    I -->|"Sí"| J["Alerta: máximo<br/>3 métodos por venta"]
    I -->|"No"| D

    G --> K["Presiona CONFIRMAR"]
    K --> L["Server Action: createSale<br/>con array de payments"]

    L --> M["Cada payment se registra<br/>con su propio método<br/>y monto"]

    M --> N["NRUS: totalSales<br/>se suma completo<br/>(independiente del split)"]

    N --> O["Vibración háptica<br/>Limpia pantalla"]
```

### Wireframe Conceptual — Split MIXED

```
+-----------------------------------------------------+
| [←] Dividir pago — Total: S/ 15.75                  |
+-----------------------------------------------------+
|                                                     |
|  Monto pendiente: S/ 15.75                          |
|                                                     |
|  +-------------------------------------------------+|
|  | Método 1: [ Yape ▼ ]   Monto: [ S/ 10.00 ]    ||
|  | [✓] Pagado                                       ||
|  +-------------------------------------------------+|
|  +-------------------------------------------------+|
|  | Método 2: [ Efectivo ▼ ] Monto: [ S/  5.75 ]  ||
|  | [✓] Pagado                                       ||
|  +-------------------------------------------------+|
|                                                     |
|  [ + Agregar método ]  (máx. 3)                    |
|                                                     |
+-----------------------------------------------------+
|  Resumen: Yape S/10.00 + Efectivo S/5.75 = S/15.75 |
|                         [ 🟢 CONFIRMAR VENTA ]     |
+-----------------------------------------------------+
```
