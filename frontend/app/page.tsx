"use client";

import { useEffect, useMemo, useState } from "react";
import { getLatestBeacons, BeaconStatus } from "../lib/api";

const PRIMARY = "#0082FA";

function getStatus(lastSeen?: string | null) {
  if (!lastSeen) return "Offline";
  const last = new Date(lastSeen).getTime();
  const now = Date.now();
  const diff = (now - last) / 1000; // segundos

  if (diff <= 60) return "Online"; // visto hace ≤1 min
  if (diff <= 300) return "Warning"; // ≤5 min
  return "Offline";
}

export default function HomePage() {
  const [beacons, setBeacons] = useState<BeaconStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await getLatestBeacons();
      setBeacons(data);
    } catch (err) {
      console.error("Error cargando beacons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, []);

  const metrics = useMemo(() => {
    const total = beacons.length;
    let online = 0;
    let warning = 0;
    let offline = 0;

    beacons.forEach((b) => {
      const s = getStatus(b.lastSeen);
      if (s === "Online") online++;
      else if (s === "Warning") warning++;
      else offline++;
    });

    return { total, online, warning, offline };
  }, [beacons]);

  const lastSeenBeacon =
    beacons.length > 0
      ? [...beacons].sort(
          (a, b) =>
            new Date(b.lastSeen ?? 0).getTime() -
            new Date(a.lastSeen ?? 0).getTime(),
        )[0]
      : null;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* top bar */}
      <header className="sticky top-0 z-20 bg-slate-100/70 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              🛰️ Dashboard Beacons —{" "}
              <span className="text-[#0082FA]">Lookation</span>
            </h1>
            <p className="text-slate-500 text-sm">
              Monitorea tus FeasyBeacon en tiempo real: señal, batería y
              gateways.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-xl bg-[#0082FA] text-white text-sm font-semibold shadow hover:bg-[#0070d6] transition"
              onClick={() =>
                alert("Aquí luego abrimos el modal de registrar beacon ✨")
              }
            >
              + Registrar beacon
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-white text-slate-700 text-sm border border-slate-200 hover:bg-slate-50"
              onClick={fetchData}
            >
              ⟳ Actualizar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* métricas */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white/80 shadow-sm border border-slate-100 p-4 flex flex-col gap-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Beacons totales
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {metrics.total}
            </p>
            <p className="text-xs text-slate-500">
              Todos los dispositivos registrados en tu sistema
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 shadow-sm border border-emerald-100 p-4 flex flex-col gap-2">
            <p className="text-xs text-emerald-700 uppercase tracking-wide flex items-center gap-1">
              🟢 Online
            </p>
            <p className="text-3xl font-bold text-emerald-900">
              {metrics.online}
            </p>
            <p className="text-xs text-emerald-600">
              Vistos en el último minuto
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 shadow-sm border border-amber-100 p-4 flex flex-col gap-2">
            <p className="text-xs text-amber-700 uppercase tracking-wide flex items-center gap-1">
              🟡 Warning
            </p>
            <p className="text-3xl font-bold text-amber-900">
              {metrics.warning}
            </p>
            <p className="text-xs text-amber-600">Vistos hace 1–5 min</p>
          </div>

          <div className="rounded-2xl bg-rose-50 shadow-sm border border-rose-100 p-4 flex flex-col gap-2">
            <p className="text-xs text-rose-700 uppercase tracking-wide flex items-center gap-1">
              🔴 Offline
            </p>
            <p className="text-3xl font-bold text-rose-900">
              {metrics.offline}
            </p>
            <p className="text-xs text-rose-600">Sin reportes recientes</p>
          </div>
        </section>

        {/* último beacon visto */}
        {lastSeenBeacon ? (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-2 rounded-2xl bg-white shadow-sm border border-slate-100 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Último beacon visto
                </p>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  {lastSeenBeacon.name || "Sin nombre"}
                  <span className="text-xs font-medium text-slate-500">
                    {lastSeenBeacon.mac}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {lastSeenBeacon.lastSeen
                    ? new Date(lastSeenBeacon.lastSeen).toLocaleString()
                    : "—"}{" "}
                  · Gateway:{" "}
                  <span className="font-medium text-slate-700">
                    {lastSeenBeacon.gateway || "—"}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">RSSI</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {typeof lastSeenBeacon.rssi === "number"
                    ? `${lastSeenBeacon.rssi} dBm`
                    : "—"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#0082FA] to-sky-400 text-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-2">
                Salud del sistema
              </p>
              <p className="text-lg font-semibold mb-1">
                {metrics.offline === 0
                  ? "Todo operativo ✅"
                  : metrics.offline === 1
                  ? "1 beacon sin señal"
                  : `${metrics.offline} beacons sin señal`}
              </p>
              <p className="text-xs opacity-80">Se actualiza cada 5 segundos</p>
            </div>
          </section>
        ) : null}

        {/* tabla */}
        <section className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              📋 Beacons recientes
            </h2>
            <p className="text-xs text-slate-500">
              {beacons.length} dispositivo(s)
            </p>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-slate-500">Cargando...</p>
          ) : beacons.length === 0 ? (
            <p className="px-4 py-6 text-slate-500">
              No hay beacons registrados todavía.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    Nombre / Alias
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    MAC
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    Modelo
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    Perfil
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    RSSI
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    Última vez visto
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    Gateway
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 text-xs">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {beacons.map((b) => {
                  const status = getStatus(b.lastSeen);
                  return (
                    <tr
                      key={b.mac}
                      className="border-t border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {b.name || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {b.alias || "Sin alias"}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-800">
                        {b.mac}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {b.model || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {b.profile || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {typeof b.rssi === "number" ? `${b.rssi} dBm` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {b.lastSeen
                          ? new Date(b.lastSeen).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {status === "Online" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                            <span className="text-[10px]">●</span> Online
                          </span>
                        ) : status === "Warning" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs">
                            <span className="text-[10px]">●</span> Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-xs">
                            <span className="text-[10px]">●</span> Offline
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {b.gateway || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/beacons/${encodeURIComponent(b.mac)}`}
                          className="text-[#0082FA] text-xs hover:underline"
                        >
                          Ver detalle
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
