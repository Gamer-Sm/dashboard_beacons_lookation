// pc-gateway/index.js
const noble = require("@abandonware/noble");
const axios = require("axios");

// 👇 si en tu Nest NO tienes app.setGlobalPrefix('api'), déjalo así
const API_BASE = "http://localhost:3001";
// si SÍ tienes prefix, cambia a:
// const API_BASE = "http://localhost:3001/api";

// 👇 TU beacon
const TARGET_MAC = "dc:0d:30:23:05:ef"; // en minúscula para comparar
const TARGET_NAME = "FSC-BP104D";

const SCAN_INTERVAL_MS = 5000;
let lastSentByMac = {};

async function sendToBackend(payload) {
  const url = `${API_BASE}/beacons/ingest`;
  try {
    await axios.post(url, payload);
    console.log("✅ Enviado al backend:", payload.mac, payload.name);
  } catch (err) {
    console.error(
      "❌ Error enviando al backend:",
      err.response?.status,
      err.response?.data || err.message
    );
  }
}

function isTarget(peripheral) {
  const mac = (peripheral.address || "").toLowerCase();
  const name =
    peripheral.advertisement && peripheral.advertisement.localName
      ? peripheral.advertisement.localName
      : "";

  return mac === TARGET_MAC || name === TARGET_NAME;
}

function scanOnce() {
  return new Promise((resolve, reject) => {
    console.log("🔍 Buscando SOLO tu beacon...");

    noble.on("discover", async (peripheral) => {
      if (!isTarget(peripheral)) {
        // ignoramos TODO lo demás
        return;
      }

      const mac = peripheral.address.toUpperCase();
      const name =
        peripheral.advertisement && peripheral.advertisement.localName
          ? peripheral.advertisement.localName
          : "Desconocido";
      const rssi = peripheral.rssi;

      console.log(`📡 TU BEACON: ${name} (${mac}) RSSI=${rssi} dBm`);

      // anti-spam: no mandes cada milisegundo
      const now = Date.now();
      if (lastSentByMac[mac] && now - lastSentByMac[mac] < 3000) {
        return;
      }
      lastSentByMac[mac] = now;

      const payload = {
        mac,
        name,
        model: name,
        profile: "BLE",
        rssi,
        battery: null,
        gateway: "pc-windows-node",
        firmware: null,
      };

      await sendToBackend(payload);
    });

    noble.startScanning([], true, (err) => {
      if (err) {
        console.error("❌ Error al iniciar escaneo:", err);
        return reject(err);
      }
    });

    setTimeout(() => {
      noble.stopScanning();
      noble.removeAllListeners("discover");
      console.log("🛑 Fin del escaneo.\n");
      resolve(true);
    }, 3000);
  });
}

async function loop() {
  try {
    await scanOnce();
  } catch (e) {
    console.error("⚠️ Error en el escaneo:", e.message);
  } finally {
    setTimeout(loop, SCAN_INTERVAL_MS);
  }
}

noble.on("stateChange", (state) => {
  if (state === "poweredOn") {
    console.log("✅ Bluetooth listo. Empezando ciclo...");
    loop();
  } else {
    console.log("⚠️ Bluetooth no está prendido:", state);
    noble.stopScanning();
  }
});
