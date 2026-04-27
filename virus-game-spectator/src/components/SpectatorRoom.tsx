import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSpectatorRoom } from '../hooks/useSpectatorRoom'
import type { ChatMessage, RoomActionLog, Player } from '../types/game'

function playerNameById(players: Player[], id?: string) {
  if (!id) return 'Sin dato'
  return players.find(p => p.id === id)?.name || id
}

function formatTime(ts: number) {
  const date = new Date(ts > 1e12 ? ts : ts * 1000)
  return date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
}

function renderActionText(action: RoomActionLog, players: Player[]) {
  const actor = action.player_name || playerNameById(players, action.player_id)
  const target = action.target_name || playerNameById(players, action.target_id)
  switch (action.type) {
    case 'vote': return `${actor} votó por ${target}`
    case 'terror_infect': return `${actor} intentó infectar a ${target}`
    case 'investigate': return `${actor} investigó a ${target}`
    case 'advance_phase': return `${actor} avanzó la fase`
    case 'start_game': return `${actor} inició la partida`
    default: return action.message || `${actor} realizó ${action.type}`
  }
}

export default function SpectatorRoom() {
  const { roomId } = useParams<{ roomId: string }>()
  const { state, chatLog, actionsLog, loading, syncing, error } = useSpectatorRoom(roomId!)

  // Local voting countdown (ticks every second)
  const [votingCountdown, setVotingCountdown] = useState(0)

  useEffect(() => {
    setVotingCountdown(state?.voting_remaining_seconds ?? 0)
  }, [state?.voting_remaining_seconds])

  useEffect(() => {
    if (votingCountdown <= 0) return
    const timer = setTimeout(() => {
      setVotingCountdown(c => Math.max(0, c - 1))
    }, 1000)
    return () => clearTimeout(timer)
  }, [votingCountdown])

  if (loading && !state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Cargando partida...</p>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error || 'No se pudo cargar la partida'}</div>
      </div>
    )
  }

  const alive = state.players.filter(p => p.alive)
  console.log('infectedPlayerIds raw:', state.infectedPlayerIds)
  const infected = (state.infectedPlayerIds || []).map(id => playerNameById(state.players, id))
  const hostName = playerNameById(state.players, state.hostId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      {/* Top navigation */}
      <header className="border-b border-white/5 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al listado
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">En vivo</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title & phase */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Partida {roomId?.slice(0, 8)}...
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 font-medium">
              {state.phase}
            </span>
            <span className="text-slate-400">Ronda {state.round}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">Host: {hostName}</span>
          </div>
          {syncing && <p className="text-blue-400 text-sm mt-2 animate-pulse">Sincronizando...</p>}
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Vivos</p>
            <p className="text-2xl font-bold text-white">{alive.length}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Infectados</p>
            <p className="text-2xl font-bold text-rose-400">{infected.length}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Vacuna</p>
            <p className="text-2xl font-bold text-emerald-400">{state.cure_progress}/3</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Votación</p>
            <p className="text-2xl font-bold text-yellow-400">
              {votingCountdown > 0 ? `${votingCountdown}s` : '—'}
            </p>
          </div>
        </div>

        {/* Main layout: players + chat & actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Players */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-3">Jugadores</h3>
            <div className="glass rounded-xl p-4 space-y-3 max-h-96 overflow-y-auto">
              {state.players.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${p.alive ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                      {p.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-slate-400">
                        {p.role || 'Rol oculto'} · {p.team === 'virus' ? 'Virus' : p.team === 'human' ? 'Humanos' : '?'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.alive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {p.alive ? 'Vivo' : 'Muerto'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Chat + Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chat */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Chat</h3>
              <div className="glass rounded-xl p-4 max-h-64 overflow-y-auto space-y-3">
                {chatLog.length === 0 ? (
                  <p className="text-slate-500 text-sm">Sin mensajes aún.</p>
                ) : (
                  chatLog.map(msg => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {msg.sender.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-white font-medium text-sm">{msg.sender.name}</span>
                          <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-0.5">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action log */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Historial de acciones</h3>
              <div className="glass rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                {actionsLog.length === 0 ? (
                  <p className="text-slate-500 text-sm">No hay acciones registradas.</p>
                ) : (
                  actionsLog.map(action => (
                    <div key={action.id} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-slate-300">{renderActionText(action, state.players)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatTime(action.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Winners / end message */}
        {state.ended && (
          <div className="mt-8 glass rounded-2xl p-6 text-center border border-yellow-400/20">
            <p className="text-xl font-bold text-yellow-400 mb-2">¡Juego terminado!</p>
            <p className="text-white">Ganador: {state.winners[0] || 'Sin definir'}</p>
          </div>
        )}
      </main>
    </div>
  )
}