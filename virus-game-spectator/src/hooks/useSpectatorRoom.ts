import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WS_URL } from "../config";
import { getRoomActions, getRoomChat, getRoomState } from "../services/api";
import type { ChatMessage, GameState, RoomActionLog } from "../types/game";
import { normalizeIncomingState } from "./useGameSocket";

interface SpectatorWSMessage {
  type: string;
  state?: unknown;
  message?: string;
}

interface UseSpectatorRoomResult {
  state: GameState | null;
  actionsLog: RoomActionLog[];
  chatLog: ChatMessage[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
}

function mergeChatLogs(
  stateMessages: ChatMessage[],
  fetchedMessages: ChatMessage[],
) {
  const byId = new Map<string, ChatMessage>();

  for (const message of fetchedMessages) byId.set(message.id, message);
  for (const message of stateMessages) byId.set(message.id, message);

  return Array.from(byId.values()).sort((a, b) => a.timestamp - b.timestamp);
}

export function useSpectatorRoom(roomId: string): UseSpectatorRoomResult {
  const [state, setState] = useState<GameState | null>(null);
  const [actionsLog, setActionsLog] = useState<RoomActionLog[]>([]);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const unmountedRef = useRef(false);
  const hostIdRef = useRef("");
  const reconnectFnRef = useRef<(() => void) | null>(null);

  const applySnapshot = useCallback((rawState: unknown) => {
    const nextRawState =
      typeof rawState === "object" && rawState !== null && "state" in rawState
        ? ((rawState as { state?: unknown }).state ?? rawState)
        : rawState;

    setState((prev) => {
      const next = normalizeIncomingState(
        nextRawState,
        prev?.hostId || hostIdRef.current,
      );
      hostIdRef.current = next.hostId;
      return next;
    });
  }, []);

  const loadSnapshot = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);
      setSyncing(true);

      try {
        const [snapshot, roomActions, roomChat] = await Promise.all([
          getRoomState(roomId),
          getRoomActions(roomId).catch(() => []),
          getRoomChat(roomId).catch(() => []),
        ]);

        if (unmountedRef.current) return;

        applySnapshot(snapshot);
        setActionsLog(roomActions);
        setChatLog(roomChat);
        setError(null);
      } catch (err: unknown) {
        if (!unmountedRef.current) {
          setError(
            err instanceof Error ? err.message : "No se pudo cargar la partida",
          );
        }
      } finally {
        if (!unmountedRef.current) {
          setLoading(false);
          setSyncing(false);
        }
      }
    },
    [applySnapshot, roomId],
  );

  const scheduleReconnect = useCallback(() => {
    if (unmountedRef.current) return;

    reconnectAttemptRef.current += 1;
    const waitSeconds = Math.min(2 ** (reconnectAttemptRef.current - 1), 20);

    reconnectTimerRef.current = setTimeout(() => {
      loadSnapshot(false).finally(() => {
        if (!unmountedRef.current) reconnectFnRef.current?.();
      });
    }, waitSeconds * 1000);
  }, [loadSnapshot]);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptRef.current = 0;
      socket.send(
        JSON.stringify({
          type: "watch_room",
          room_id: roomId,
        }),
      );
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data: SpectatorWSMessage = JSON.parse(event.data);

        switch (data.type) {
          case "public_state":
            if (data.state) {
              const nextState = normalizeIncomingState(
                data.state,
                hostIdRef.current,
              );
              hostIdRef.current = nextState.hostId;
              setState(nextState);
              setChatLog((prev) => mergeChatLogs(nextState.chat_history, prev));
            }
            break;
          case "info":
            break;
          case "error":
            setError(data.message || "Error del servidor");
            break;
          default:
            break;
        }
      } catch {
        setError("No se pudo procesar una actualizacion en vivo");
      }
    };

    socket.onerror = () => {
      setError("Conexion inestable con el servidor en vivo");
    };

    socket.onclose = () => {
      if (unmountedRef.current) return;
      scheduleReconnect();
    };
  }, [roomId, scheduleReconnect]);

  useEffect(() => {
    reconnectFnRef.current = connect;
  }, [connect]);

  useEffect(() => {
    unmountedRef.current = false;
    queueMicrotask(() => {
      loadSnapshot(true).finally(() => {
        if (!unmountedRef.current) connect();
      });
    });

    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [connect, loadSnapshot]);

  const mergedChatLog = useMemo(
    () => mergeChatLogs(state?.chat_history || [], chatLog),
    [chatLog, state?.chat_history],
  );

  return {
    state,
    actionsLog,
    chatLog: mergedChatLog,
    loading,
    syncing,
    error,
  };
}
