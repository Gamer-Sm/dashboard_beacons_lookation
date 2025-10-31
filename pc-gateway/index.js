// pc-gateway/index.js — SOLO para el beacon FSC-BP104D
const noble = require('@abandonware/noble');
const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const GATEWAY_ID = 'pc-windows-node';

// 🔐 datos de TU beacon
const TARGET_NAME = 'FSC-BP104D';
const TARGET_MAC = 'DC:0D:30:23:05:EF'; // en mayúsculas

// para no spamear DB si el beacon está gritando mucho
let lastSent = 0;
const SEND_INTERVAL_MS = 2000; // cada 2 segundos máximo

noble.on('stateChange', (state) => {
  console.log('🔵 Estado BLE:', state);
  if (state === 'poweredOn') {
    console.log('✅ Escaneando SOLO el beacon FSC-BP104D ...');
    noble.startScanning([], true);
  } else {
    console.log('⛔ BLE no disponible');
    noble.stopScanning();
  }
});

noble.on('discover', async (peripheral) => {
  const mac = (peripheral.address || peripheral.id || '').toUpperCase();
  const advName = peripheral.advertisement?.localName || '';
  const rssi = peripheral.rssi;

  // 1️⃣ filtrar por MAC o por nombre
  const isMyMac = mac === TARGET_MAC;
  const isMyName = advName === TARGET_NAME;

  if (!isMyMac && !isMyName) {
    // no es tu beacon → ignorar
    return;
  }

  // 2️⃣ mostrarlo bonito
  console.log('✅ TU BEACON DETECTADO');
  console.log('  🏷️ Nombre :', advName || TARGET_NAME);
  console.log('  🆔 MAC    :', mac);
  console.log('  📶 RSSI   :', rssi, 'dBm');
  console.log('---------------------------------');

  // 3️⃣ evitar mandar 1000 veces lo mismo
  const now = Date.now();
  if (now - lastSent < SEND_INTERVAL_MS) {
    return;
  }
  lastSent = now;

  // 4️⃣ enviar al backend
  const payload = {
    mac: mac,
    name: advName || TARGET_NAME,
    model: 'FSC-BP104D',       // lo ponemos fijo con el modelo real
    profile: 'BLE',
    rssi: rssi,
    battery: null,             // esto luego lo llenamos si logramos leerlo
    temperature: null,
    gateway: GATEWAY_ID,
    firmware: null,
  };

  try {
    await axios.post(`${API_BASE}/beacons/ingest`, payload);
    console.log('📤 Enviado al backend ✅');
  } catch (err) {
    console.error('❌ Error enviando al backend:', err.message);
  }
});
