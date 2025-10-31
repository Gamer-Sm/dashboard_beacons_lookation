// pc-gateway/scan.js
// Escaner BLE "limpio" estilo Python: escanea N segundos y luego muestra.
const noble = require('@abandonware/noble');

const SCAN_TIME_MS = 11000; // 8 segundos
const devices = new Map(); // mac -> info

function getManufacturerInfo(peripheral) {
  const md = peripheral.advertisement?.manufacturerData;
  if (!md) return null;
  const ascii = md.toString('utf8').replace(/[^\x20-\x7E]/g, '').trim();
  return ascii && ascii.length > 3 ? ascii : md.toString('hex');
}

function chooseBestName(localName, manu) {
  // prioridad: manufacturer legible > localName > "Dispositivo BLE"
  if (manu && manu.length > 3) return manu;
  if (localName && localName.length > 1) return localName;
  return 'Dispositivo BLE';
}

noble.on('stateChange', (state) => {
  console.log('🔵 Estado BLE:', state);
  if (state === 'poweredOn') {
    console.log(`✅ Escaneando durante ${SCAN_TIME_MS / 1000} segundos...\n`);
    noble.startScanning([], true);

    // después de X segundos paramos y mostramos
    setTimeout(() => {
      noble.stopScanning();
      console.log('\n⏹ Escaneo terminado. Dispositivos detectados:\n');

      // pasamos a array
      const list = Array.from(devices.values());

      if (list.length === 0) {
        console.log('⚠️ No se detectaron dispositivos. Acerca tu beacon.');
        return;
      }

      // 1. ordenar por RSSI (más cercano primero)
      list.sort((a, b) => b.rssi - a.rssi);

      // 2. mostrar solo los que tienen nombre o fabricante
      list.forEach((d, idx) => {
        console.log(`📡 #${idx + 1}`);
        console.log('  🏷️ Nombre     :', d.name);
        console.log('  🆔 MAC        :', d.mac);
        console.log('  📶 RSSI       :', d.rssi, 'dBm');
        console.log('  🏭 Fabricante :', d.manufacturer || 'no enviado');
        console.log('----------------------------------------------');
      });

      console.log('\n👉 Ahora dime cuál de esos es TU beacon y lo filtramos.\n');
    }, SCAN_TIME_MS);
  } else {
    console.log('⛔ BLE no disponible');
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  const mac = (peripheral.address || peripheral.id || 'desconocido').toUpperCase();
  const rssi = peripheral.rssi;
  const manu = getManufacturerInfo(peripheral);
  const localName = peripheral.advertisement?.localName;
  const name = chooseBestName(localName, manu);

  // 🔐 filtro rápido: si el RSSI es muy bajo, lo ignoramos (lejos / otro piso)
  if (typeof rssi === 'number' && rssi < -90) {
    return;
  }

  // guardamos/actualizamos
  devices.set(mac, {
    mac,
    name,
    rssi,
    manufacturer: manu,
  });
});
