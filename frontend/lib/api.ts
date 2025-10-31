// frontend/lib/api.ts
const API_BASE = "http://localhost:3001"; // 👈 TU BACKEND NEST

export type BeaconStatus = {
  mac: string;
  name: string | null;
  model: string | null;
  profile?: string | null;
  lastSeen: string | null;
  rssi: number | null;
  battery: number | null;
  temperature: number | null;
  gateway: string | null;
  location?: string | null;
  alias?: string | null;
  firmware?: string | null;
};

export async function getLatestBeacons(): Promise<BeaconStatus[]> {
  const res = await fetch(`${API_BASE}/beacons/status/latest`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("Error fetching beacons");
  }

  return res.json();
}
