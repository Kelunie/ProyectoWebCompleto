import { useState, useEffect, useRef, useCallback } from "react";
import { GameState, GameActions, Player, ChatMessage, GamePhase } from "../types/game";
import { WS_URL } from "../config";
import { normalizePhase } from "../utils/normalizePhase";

interface WSMessage {
  type: string;
  state?: any;
  message?: string;
}

export function useGameSocket(
  roomId: string,
  userId: string,
  name: string
): { state: GameState | null; actions: GameActions; error: string | null } {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "join",
          room_id: roomId,
          user_id: userId,
          name: name,
        })
      );
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);

        switch (data.type) {
          case "public_state":
            if (data.state) {
              const raw = data.state;

              const hostId: string =
                raw.host_user_id ?? raw.players?.[0]?.id ?? "";
             
              const players: Player[] = (raw.players as any[] || []).map(
                (p: any) => ({
                  id: p.id,
                  name: p.name,
                  alive: p.alive,
                  isHost: p.id === hostId,
                  role: p.role,
                  team: p.team,
                })
              );
            
              const chatHistory: ChatMessage[] = (raw.chat_history || []).map(
                (m: any) => {
                  const senderPlayer = players.find(
                    (player) => player.id === m.sender
                  );
                  return {
                    id: m.id ?? `${m.timestamp}-${m.sender}`,
                    sender: {
                      id: m.sender,
                      name: senderPlayer?.name ?? "Jugador",
                      isHost: senderPlayer?.isHost ?? false,
                      isAlive: senderPlayer?.alive ?? false,
                    },
                    text: m.text ?? m.message,
                    timestamp: m.timestamp ?? Date.now(),
                  };
                }
              );

              const normalised: GameState = {
                room_id: raw.room_id,
                session_id: raw.session_id,
                phase: normalizePhase(raw.phase ?? "lobby") as GamePhase,
                round: raw.round ?? 1,
                players,
                hostId,
                cure_progress: raw.cure_progress ?? 0,
                cure_unlocked: raw.cure_unlocked ?? false,
                voting_remaining_seconds: raw.voting_remaining_seconds ?? 0,
                chat_history: chatHistory,
                pairings: raw.pairings ?? [],
                current_turn_player_id: raw.current_turn_player_id ?? null,
                ended: raw.ended ?? false,
                winners: raw.winners ?? [],
                votingResults: raw.votingResults ?? raw.voting_results,
                mostVotedPlayer:
                  raw.mostVotedPlayer ?? raw.most_voted_player,
                infectedPlayerIds:
                  raw.infectedPlayerIds ?? raw.infected_player_ids,
              };

              setState(normalised);
            }
            break;

          case "info":
            break;

          case "error":
            setError(data.message || "Unknown server error");
            break;

          default:
            if (data.state) setState(data.state);
            break;
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    socket.onerror = () => {
      console.warn("WebSocket error for URL:", WS_URL);
    };

    socket.onclose = () => {
      reconnectTimeout.current = setTimeout(connect, 3000);
    };
  }, [roomId, userId, name]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  const send = useCallback((message: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const actions: GameActions = {
    startGame: () => send({ type: "start_game" }),
    sendChat: (message) => send({ type: "send_chat", message }),
    vote: (targetId) => send({ type: "vote", target_id: targetId }),
    advancePhase: () => send({ type: "advance_phase" }),
    terrorInfect: (targetId) =>
      send({ type: "terror_infect", target_id: targetId }),
    investigate: (targetId) =>
      send({ type: "investigate", target_id: targetId }),
  };

  return { state, actions, error };
}