import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  GameState,
  GameActions,
  Player,
  ChatMessage,
  GamePhase,
} from '../types/game';
import { WS_URL } from '../config';
import { normalizePhase } from '../utils/normalizePhase';
import { getPlayerRole } from '../services/api';

interface WSMessage {
  type: string;
  state?: any;
  message?: string;
  // joined event fields
  player_id?: string;
  role?: string;
  room_id?: string;
  team?: string;
}

/** Merges a new state snapshot with the previous one, preserving role/team/hostId
 *  that may not be re-sent on every public_state broadcast. */
function mergeWithPrev(next: GameState, prev: GameState | null): GameState {
  if (!prev) return next;
  return {
    ...next,
    // Never downgrade an established hostId to empty string
    hostId: next.hostId || prev.hostId,
    players: next.players.map(p => {
      const prevP = prev.players.find(pp => pp.id === p.id);
      return {
        ...p,
        // Keep role/team from previous state if server doesn't re-send them
        role: p.role ?? prevP?.role,
        team: p.team ?? prevP?.team,
      };
    }),
  };
}

/** Inject a locally-known role into the current player's entry in the state. */
function injectRole(
  state: GameState,
  userId: string,
  role: string | null,
): GameState {
  if (!role) return state;
  return {
    ...state,
    players: state.players.map(p => (p.id === userId ? { ...p, role } : p)),
  };
}

function normalizePairings(rawPairings: unknown): string[][] {
  if (!Array.isArray(rawPairings)) return [];

  return rawPairings
    .filter(group => Array.isArray(group))
    .map(group => (group as unknown[]).map(member => String(member)));
}

function normalizeMostVotedPlayer(
  raw: any,
  players: Player[],
): Player | undefined {
  const rawValue = raw.mostVotedPlayer ?? raw.most_voted_player;
  if (!rawValue) return undefined;

  if (typeof rawValue === 'string') {
    return players.find(player => player.id === rawValue);
  }

  if (typeof rawValue === 'object') {
    const candidateId = (rawValue as { id?: string }).id;
    if (candidateId) {
      return (
        players.find(player => player.id === candidateId) ?? {
          id: String((rawValue as { id: string }).id),
          name: String((rawValue as { name?: string }).name ?? 'Jugador'),
          alive: Boolean((rawValue as { alive?: boolean }).alive),
          isHost: Boolean((rawValue as { isHost?: boolean }).isHost),
          role: (rawValue as { role?: string }).role,
          team: (rawValue as { team?: 'human' | 'virus' }).team,
        }
      );
    }
  }

  return undefined;
}

export function normalizeIncomingState(
  raw: any,
  existingHostId = '',
): GameState {
  // PublicState from this server does NOT include host_user_id.
  // Use the already-known hostId (from nav params or previous state) rather
  // than falling back to players[0] which can shift when players join.
  const hostId: string =
    raw.host_user_id ?? (existingHostId || raw.players?.[0]?.id) ?? '';

  const normalizedPairings = normalizePairings(raw.pairings);
  const normalizedPhase = normalizePhase(raw.phase ?? 'lobby') as GamePhase;

  // The server initializes phase as SecretActions even before start_game.
  // Infer whether the game has truly started to avoid showing the wrong phase.
  const inferredStarted =
    raw.started === true ||
    normalizedPairings.length > 0 ||
    raw.current_turn_player_id != null ||
    (raw.round ?? 1) > 1;

  const effectivePhase: GamePhase =
    normalizedPhase === 'secret_actions' && !raw.ended && !inferredStarted
      ? 'lobby'
      : normalizedPhase;

  // PublicPlayer only has id/name/alive — role & team are NOT in PublicState.
  const players: Player[] = ((raw.players as any[]) || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    // Server only sets alive:false when a player dies; default is true.
    alive: p.alive ?? true,
    isHost: p.id === hostId,
    role: p.role,
    team: p.team,
  }));

  const chatHistory: ChatMessage[] = (raw.chat_history || []).map((m: any) => {
    const senderId = m.sender ?? m.player_id ?? '';
    const senderPlayer = players.find(player => player.id === senderId);

    return {
      id: m.id ?? `${m.timestamp ?? m.sent_at_unix}-${senderId}`,
      sender: {
        id: senderId,
        name: m.player_name ?? senderPlayer?.name ?? 'Jugador',
        isHost: senderPlayer?.isHost ?? false,
        isAlive: senderPlayer?.alive ?? false,
      },
      text: m.text ?? m.message ?? '',
      timestamp: m.timestamp ?? m.sent_at_unix ?? Date.now(),
    };
  });

  return {
    room_id: raw.room_id,
    session_id: raw.session_id,
    phase: effectivePhase,
    round: raw.round ?? 1,
    players,
    hostId,
    cure_progress: raw.cure_progress ?? 0,
    cure_unlocked: raw.cure_unlocked ?? false,
    voting_remaining_seconds: raw.voting_remaining_seconds ?? 0,
    chat_history: chatHistory,
    pairings: normalizedPairings,
    current_turn_player_id: raw.current_turn_player_id ?? null,
    ended: raw.ended ?? false,
    winners: raw.winners ?? [],
    // Some server versions send this field as "votes".
    votingResults: raw.votingResults ?? raw.voting_results ?? raw.votes ?? {},
    mostVotedPlayer: normalizeMostVotedPlayer(raw, players),
    infectedPlayerIds: raw.infectedPlayerIds ?? raw.infected_player_ids,
  };
}

export function useGameSocket(
  roomId: string,
  userId: string,
  name: string,
  hostUserId = '',
): { state: GameState | null; actions: GameActions; error: string | null } {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmounted = useRef(false);
  const reconnectAttempts = useRef(0);
  const gameEndedRef = useRef(false);
  const lastAdvanceAtRef = useRef(0);

  // Role management: server sends role only in joined event (on reconnect) or via HTTP.
  const myRoleRef = useRef<string | null>(null);
  const roleFetchedRef = useRef(false);

  // Known host from navigation params — persists across public_state updates
  // because PublicState does not include host_user_id.
  const knownHostIdRef = useRef(hostUserId);

  const applyState = useCallback(
    (raw: any) => {
      setState(prev => {
        const next = normalizeIncomingState(
          raw,
          prev?.hostId || knownHostIdRef.current,
        );
        if (next.ended) gameEndedRef.current = true;

        // Detect game-start transition → fetch this player's actual role via HTTP.
        // The server assigns real roles only after start_game, not before.
        if (!roleFetchedRef.current) {
          const pairings = normalizePairings(raw.pairings);
          const gameStarted =
            pairings.length > 0 ||
            raw.current_turn_player_id != null ||
            (raw.round ?? 1) > 1;

          if (gameStarted) {
            roleFetchedRef.current = true;
            getPlayerRole(roomId, userId)
              .then(role => {
                if (!isUnmounted.current && role) {
                  myRoleRef.current = role.toLowerCase();
                  setState(s =>
                    s ? injectRole(s, userId, myRoleRef.current) : s,
                  );
                }
              })
              .catch(() => {});
          }
        }

        const merged = mergeWithPrev(next, prev);
        return injectRole(merged, userId, myRoleRef.current);
      });
    },
    [roomId, userId],
  );

  const connect = useCallback(() => {
    if (isUnmounted.current) return;

    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'join',
          room_id: roomId,
          user_id: userId,
          name: name,
        }),
      );
      reconnectAttempts.current = 0;
      setError(null);
    };

    socket.onmessage = event => {
      try {
        const data: WSMessage = JSON.parse(event.data);

        switch (data.type) {
          case 'public_state':
            if (data.state) applyState(data.state);
            break;

          // Some servers send private role/team info separately
          case 'private_state':
            if (data.state) applyState(data.state);
            break;

          case 'joined': {
            // The server sends `joined { player_id, role }` back to the socket.
            // Before game start: role is always "Citizen" (pre-game placeholder).
            // After game start + reconnect: role is the real assigned role.
            // Only capture our own role, and only when it's real.
            if (data.player_id === userId && data.role) {
              const normalRole = data.role.toLowerCase();
              // Update only when it's a non-default role OR game already started
              if (normalRole !== 'citizen' || roleFetchedRef.current) {
                myRoleRef.current = normalRole;
                roleFetchedRef.current = true;
                setState(s =>
                  s ? injectRole(s, userId, myRoleRef.current) : s,
                );
              }
            }
            break;
          }

          // Direct role assignment (non-standard, kept for flexibility)
          case 'role_assigned':
            if (data.role) {
              myRoleRef.current = data.role.toLowerCase();
              roleFetchedRef.current = true;
              setState(s => (s ? injectRole(s, userId, myRoleRef.current) : s));
            }
            break;

          case 'info':
            break;

          case 'error':
            setError(data.message || 'Unknown server error');
            break;

          default:
            if (data.state) applyState(data.state);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    socket.onerror = () => {
      setError('Error de conexion con el servidor');
      console.warn('WebSocket error for URL:', WS_URL);
    };

    socket.onclose = () => {
      if (isUnmounted.current) return;
      if (gameEndedRef.current) return;
      reconnectAttempts.current += 1;
      // Quick first retry; the socket may drop briefly on Render free tier
      const waitMs =
        reconnectAttempts.current === 1
          ? 500
          : Math.min(3000 * (reconnectAttempts.current - 1), 10000);
      reconnectTimeout.current = setTimeout(connect, waitMs);
    };
  }, [roomId, userId, name, applyState]);

  useEffect(() => {
    isUnmounted.current = false;
    connect();

    return () => {
      isUnmounted.current = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((message: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      setError('Conexion inestable, intentando reconectar...');
    }
  }, []);

  const safeAdvancePhase = useCallback(() => {
    const now = Date.now();
    // Avoid multiple rapid taps advancing more than one phase.
    if (now - lastAdvanceAtRef.current < 900) return;
    lastAdvanceAtRef.current = now;
    send({ type: 'advance_phase' });
  }, [send]);

  const actions: GameActions = {
    startGame: () => send({ type: 'start_game' }),
    sendChat: message => send({ type: 'send_chat', message }),
    vote: targetId => send({ type: 'vote', target_id: targetId }),
    advancePhase: safeAdvancePhase,
    terrorInfect: targetId =>
      send({ type: 'terror_infect', target_id: targetId }),
    investigate: targetId => send({ type: 'investigate', target_id: targetId }),
  };

  return { state, actions, error };
}
