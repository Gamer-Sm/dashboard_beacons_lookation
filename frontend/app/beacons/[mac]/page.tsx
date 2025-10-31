"use client";

import { useEffect, useState } from "react";

type Telemetry = {
  rssi: number | null;
  battery: number | null;
  temperature: number | null;
  gateway: string | null;
  createdAt: string;
  beacon: {
    mac: string;
    name: string;
    model: string;
  };
};

export default function BeaconDetail({ params }: { params: { mac: string } }) {
  const [data, setData] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `http://localhost:3000/beacons/${params.mac}/telemetry`,
      );
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    load();
  }, [params.mac]);

  const last = data[0];

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <a href="/" className="text-primary text-sm mb-4 inline-block">
        ← Volver al dashboard
      </a>

      {loading ? (
        <p>Cargando...</p>
      ) : !last ? (
        <p>No hay telemetría para este beacon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Identidad */}
          <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-2">
            <h1 className="text-lg font-semibold mb-2">{last.beacon.name}</h1>
            <p className="text-sm text-slate-500 mb-4">{last.beacon.mac}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Modelo / Fabricante</p>
                <p>{last.beacon.model || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Último gateway</p>
                <p>{last.gateway || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Última vez visto</p>
                <p>{new Date(last.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-slate-400 text-xs">RSSI actual</p>
            <p className="text-3xl font-bold">
              {last.rssi ? `${last.rssi} dBm` : "—"}
            </p>
            <p className="text-slate-400 text-xs mt-4">Batería</p>
            <p className="text-lg">{last.battery ? `${last.battery}%` : "—"}</p>
            <p className="text-slate-400 text-xs mt-4">Temperatura</p>
            <p className="text-lg">
              {last.temperature ? `${last.temperature} °C` : "—"}
            </p>
          </div>

          {/* Historial simple */}
          <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-3">
            <h2 className="font-semibold mb-2">Historial de telemetría</h2>
            <div className="max-h-72 overflow-y-auto">
              {data.map((t) => (
                <div
                  key={t.createdAt}
                  className="flex items-center justify-between border-b py-2 text-sm"
                >
                  <span>{new Date(t.createdAt).toLocaleTimeString()}</span>
                  <span>{t.rssi ? `${t.rssi} dBm` : "—"}</span>
                  <span>{t.gateway || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
