import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLiveRooms, getOpenRooms } from "../services/api";
import type { RoomSummary } from "../types/game";

function extractRooms(data: unknown): RoomSummary[] {
  if (Array.isArray(data)) return data as RoomSummary[];

  if (typeof data === "object" && data !== null) {
    const record = data as { rooms?: unknown; data?: unknown };
    if (Array.isArray(record.rooms)) return record.rooms as RoomSummary[];
    if (Array.isArray(record.data)) return record.data as RoomSummary[];
  }

  return [];
}

function mergeUnique(a: RoomSummary[], b: RoomSummary[]): RoomSummary[] {
  const seen = new Set<string>();
  return [...a, ...b].filter((room) => {
    if (seen.has(room.id)) return false;
    seen.add(room.id);
    return true;
  });
}

export default function LiveRoomsList() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "live" | "open">("all");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const [liveData, openData] = await Promise.all([
        getLiveRooms().catch(() => []),
        getOpenRooms().catch(() => []),
      ]);
      const liveRooms = extractRooms(liveData);
      const openRooms = extractRooms(openData);
      setRooms(mergeUnique(liveRooms, openRooms));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar partidas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchRooms();
    });
  }, []);

  const filteredRooms = rooms.filter((room) => {
    if (activeTab === "live") return room.started;
    if (activeTab === "open") return !room.started;
    return true;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-cyan-400" />
            <h1 className="text-2xl font-bold bg-linear-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              Virus Game
            </h1>
          </div>
          <div className="text-slate-400 text-sm font-medium">
            Espectador en vivo
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-white">Salas</h2>
          <button
            onClick={fetchRooms}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors text-sm font-medium border border-white/10"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Recargar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "live", "open"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-violet-500/30 text-violet-300 border border-violet-400/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {tab === "all"
                ? "Todos"
                : tab === "live"
                  ? "En vivo"
                  : "Pendientes"}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Buscando partidas...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {!loading && !error && filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              No hay salas
            </h3>
            <p className="text-slate-400 max-w-md">
              {activeTab === "open"
                ? "No hay salas pendientes de comenzar."
                : activeTab === "live"
                  ? "No hay partidas en vivo en este momento."
                  : "No hay salas disponibles."}
            </p>
          </div>
        )}

        {!loading && filteredRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                to={`/room/${room.id}`}
                className="glass rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white truncate">
                    {room.name}
                  </h3>
                  {room.started ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      En vivo
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                      Pendiente
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {room.player_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                    ID: {room.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className="text-xs font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
                    Ver partida →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
