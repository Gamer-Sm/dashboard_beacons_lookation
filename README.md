# 🛰️ Dashboard Beacons — Lookation

Sistema de monitoreo BLE (Bluetooth Low Energy) para detectar, registrar y visualizar en tiempo real la señal y estado de beacons físicos, integrando backend (NestJS), gateway BLE (Node.js) y frontend (Next.js).

---

## 📘 Descripción General

**Dashboard Beacons Lookation** es una solución modular que conecta un dispositivo con Bluetooth (PC o Raspberry Pi) con una API NestJS y un panel visual en Next.js.

Permite:
- Escanear dispositivos BLE cercanos.
- Detectar automáticamente tu beacon físico.
- Enviar lecturas (RSSI, nombre, MAC, gateway) al backend.
- Mostrar en el panel web su estado (🟢 Online, 🟡 Warning, 🔴 Offline) en tiempo real.

---

## ⚙️ Tecnologías Utilizadas

| Tecnología | Rol | Descripción |
|-------------|-----|--------------|
| **NestJS** | Backend principal | API REST modular con TypeORM |
| **MySQL** | Base de datos | Almacenamiento de beacons y telemetría |
| **TypeORM** | ORM | Manejo de entidades y relaciones |
| **Axios** | Comunicación | Envío de lecturas desde el gateway BLE |
| **@abandonware/noble** | BLE Gateway | Escaneo de beacons vía Bluetooth |
| **Next.js + TailwindCSS** | Frontend | Dashboard interactivo con métricas en tiempo real |

---

## 🧩 Estructura del Proyecto

```
dashboard_beacons_lookation/
│
├── backend/            → API NestJS (Puerto 3001)
│   ├── src/modules/beacons/
│   │   ├── beacons.controller.ts
│   │   ├── beacons.service.ts
│   │   └── entities/
│   └── ...
│
├── pc-gateway/         → Script Node.js que escanea el beacon BLE real
│   └── index.js
│
└── frontend/           → Dashboard Next.js (Puerto 3000)
    ├── app/page.tsx
    └── lib/api.ts
```

---

## 🚀 Guía de Ejecución

### 🐬 1. Iniciar Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
- Escucha en `http://localhost:3001`
- Configura `.env` con tus credenciales MySQL:
  ```bash
  DB_HOST=localhost
  DB_PORT=3306
  DB_USERNAME=root
  DB_PASSWORD=toor
  DB_NAME=dashboard_beacons_db
  ```

Rutas disponibles:
- `POST /beacons/ingest` → Recibe lecturas BLE
- `GET /beacons` → Lista de beacons
- `GET /beacons/status/latest` → Últimos vistos con estado

---

### 💻 2. Iniciar Gateway BLE (Node.js)
Este módulo usa **@abandonware/noble** para escanear tu beacon y enviar datos al backend.

#### Requisitos:
- Node v18 (usando `nvm use 18`)
- Python 3.x instalado
- Bluetooth activado

```bash
cd pc-gateway
npm install
node index.js
```

👉 Este script:
- Escanea cada 5 segundos.
- Detecta solo tu beacon (`DC:0D:30:23:05:EF`).
- Envía sus lecturas (RSSI, nombre, gateway, etc.) al backend.

Salida esperada:
```
🔍 Buscando SOLO tu beacon...
📡 TU BEACON: FSC-BP104D (DC:0D:30:23:05:EF) RSSI=-42 dBm
✅ Enviado al backend: DC:0D:30:23:05:EF FSC-BP104D
```

---

### 🌐 3. Iniciar Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Abre en tu navegador:
👉 **http://localhost:3000**

Verás tu dashboard con:
- Métricas en tiempo real (total, online, offline).
- Tabla de beacons detectados.
- Estado automático según última lectura.

---

## 💡 Lógica de Estados

| Estado | Condición | Color |
|--------|------------|--------|
| 🟢 Online | Última lectura ≤ 60 segundos | Verde |
| 🟡 Warning | Última lectura entre 1–5 min | Amarillo |
| 🔴 Offline | Más de 5 min sin verse | Rojo |

---

## 📊 Panel de Control

El dashboard muestra:
- Total de beacons registrados
- Conteo por estado
- Último beacon visto
- Salud del sistema
- Tabla detallada con:  
  **Nombre / MAC / Modelo / Perfil / RSSI / Último visto / Estado / Gateway**

---

## 📦 Ejemplo de flujo en tiempo real

1. El **gateway (PC)** detecta tu beacon cada 5 segundos.  
2. Envía lecturas al **backend (NestJS)** vía `/beacons/ingest`.  
3. El **frontend (Next.js)** actualiza el estado y señal en tiempo real.  

🔁 Si apagas el beacon, tras unos minutos el dashboard lo marcará como **Offline** automáticamente.

---

## 🧠 Próximos pasos

- [ ] Agregar historial de telemetría por beacon.
- [ ] Mostrar gráficos RSSI / voltaje.
- [ ] Permitir cambiar alias y ubicación lógica desde el dashboard.
- [ ] Soporte multi-gateway (RPi + PC + móviles).

---

## 🛠️ Troubleshooting

| Error | Causa | Solución |
|--------|--------|-----------|
| `Cannot POST /beacons/ingest` | Ruta mal configurada | Usa `http://localhost:3001/beacons/ingest` |
| `EADDRINUSE 3001` | Puerto ocupado | Cierra procesos previos o cambia puerto en `.env` |
| `No devices found` | Beacon apagado o fuera de rango | Acércalo o reinicia el BLE |
| `node-gyp` error | Falta Python o Visual Studio Build Tools | Instala ambos antes de `npm install` |

---

## 🎨 Color principal

- **Primario:** `#0082FA`
- **Secundario:** `#F1F5F9` (fondo)
- **Tipografía:** Inter / sans-serif
- **Estilo:** Minimalista, moderno y limpio

---

## 📸 Vista previa

> Panel de monitoreo de beacons BLE en tiempo real.

![preview](https://github.com/Gamer-Sm/dashboard_beacons_lookation/assets/preview-dashboard.png)

---

## 🔗 Puertos del sistema

| Componente | Puerto | Descripción |
|-------------|--------|--------------|
| **Backend (NestJS)** | 3001 | API y conexión DB |
| **Frontend (Next.js)** | 3000 | Dashboard visual |
| **Gateway BLE (Node)** | — | Envío de datos BLE |

---

## 🧾 Licencia

Proyecto desarrollado como parte de **Lookation — Mujeres Digitales 2025**, bajo fines educativos y de demostración tecnológica BLE.
