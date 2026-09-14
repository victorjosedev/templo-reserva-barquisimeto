# 🚌 Sistema de Reserva de Asientos - Viaje al Santo Templo

Aplicación web completa e interactiva para la gestión y reserva de puestos de autobús para el viaje de Estaca al Templo (Caracas, Venezuela), con soporte para sus **9 barrios**, control de pagos móviles, boletos digitales y panel de administración.

---

## 🌟 Características Principales

### 1. Mapa de Asientos Interactivo de Autobús
- **Layout de Autobús Ejecutivo**: 48 asientos numerados con cabina de conductor, puerta delantera, pasillo central y fila trasera.
- **Estados por Color**:
  - 🟢 **Disponible**: Listo para seleccionar.
  - 🟡 **Apartado (En proceso / Revisión)**: Con temporizador activo o pago enviado en espera de validación.
  - 🔵 **Confirmado**: Pago verificado por la tesorería (asiento asegurado con borde dorado).
  - 🟣 **Tu selección activa**: Destacado con temporizador visual animado.
- **Bloqueo Temporal de 35 minutos**:
  - Al tocar un puesto libre, el sistema lo bloquea exclusivamente para el usuario durante 35 minutos para que realice la transferencia de Pago Móvil con calma.
  - Si no completa la reserva dentro del tiempo límite, el servidor libera automáticamente el puesto.
- **Formulario de Reserva**:
  - Nombre y apellido completo.
  - Cédula de identidad.
  - Barrio de pertenencia (selector con los 9 barrios de la estaca).
  - Teléfono / WhatsApp.
  - Número de referencia del Pago Móvil.
  - Adjuntar foto del comprobante (JPG, PNG, WEBP, PDF) con vista previa instantánea.
  - Observaciones adicionales.

### 2. Organización por Barrios
- Contiene los 9 barrios oficiales de la estaca:
  1. **Barrio Acarigua**
  2. **Barrio Araure**
  3. **Barrio Los Pinos**
  4. **Barrio Cabudare**
  5. **Barrio Sabana de Parra**
  6. **Barrio Nueva Segovia**
  7. **Barrio Concordia**
  8. **Barrio San Felipe**
  9. **Barrio La Concordia**
- **Filtro por Barrio en el Mapa**: Permite a cualquier líder de barrio aislar y ver exactamente cuántos y cuáles asientos tiene ocupados su gente.
- **Modo "Por Barrio"**: Colorea cada asiento reservado según el color distintivo de su barrio.
- **Métricas de ocupación territorial**: En el panel de líderes se muestra el porcentaje de asientos y total recaudado por cada barrio.

### 3. Boleto Digital y Notificaciones
- **Boleto de Abordaje**:
  - Estilo de pase de abordaje con código de reserva único (ej. `TMP-XXXXX`).
  - Código QR generado dinámicamente con los datos de control.
  - Botón de **Imprimir / Guardar en PDF** (`Ctrl+P` optimizado).
  - Botón de **Compartir en WhatsApp**: Genera un mensaje formateado listo para enviar al líder o guardarlo en el chat personal.
- **Módulo "Consultar mi Reserva"**:
  - Permite a cualquier miembro buscar su boleto ingresando su cédula, teléfono o código de reserva si extravía el comprobante.

### 4. Panel para la Presidencia y Tesorero
- **Acceso protegido por PIN**: PIN por defecto: **`7777`** (editable).
- **Métricas Financieras en Tiempo Real**:
  - Total asientos, Confirmados, En Revisión y Disponibles.
  - Total Recaudado en Dólares ($) y en Bolívares (Bs) a tasa oficial.
- **Verificación de Comprobantes**:
  - Visor de imagen en pantalla completa con zoom.
  - Botón de 1-clic: **Aprobar Pago** (marca Confirmado) o **Liberar Asiento**.
- **Exportación a Excel (.xlsx)**:
  - Descarga instantánea de archivo Excel con columnas organizadas: *N° Asiento, Pasajero, Cédula, Barrio, Teléfono, Referencia Pago Móvil, Monto USD, Monto Bs, Fecha y Enlace al Comprobante*.
- **Ajustes del Viaje**:
  - Modificar precio en USD, tasa de cambio en Bs, fecha, hora de salida y punto de encuentro directamente desde la pantalla.

### 5. Datos de Pago Móvil y Confianza
- Ficha visible con datos oficiales:
  - **Banco:** Banco de Venezuela (0102)
  - **Cédula / RIF:** V-18.452.981
  - **Teléfono:** 0414-5551234
  - **Titular:** Comité de Viaje al Templo - Estaca
- Botón **"Copiar Datos"** con 1 clic para evitar errores al transferir.
- Términos claros de reembolso, tiempos y políticas de viaje.

---

## 🚀 Cómo Iniciar la Aplicación

1. Abre una terminal en la carpeta del proyecto (`TEMPLO`):
   ```bash
   npm start
   ```
2. Abre tu navegador web en:
   ```
   http://localhost:5000
   ```

### Modo Desarrollo (Opcional):
Si deseas modificar el frontend con recarga en vivo de Vite:
- En una terminal: `npm start` (inicia el servidor backend en el puerto 5000)
- En otra terminal: `cd client && npm run dev` (inicia Vite en el puerto 3000 con proxy a la API)

---

## 🔒 Acceso de Administrador
- **Botón:** "Panel Líderes" en la esquina superior derecha.
- **PIN Inicial:** `7777`
