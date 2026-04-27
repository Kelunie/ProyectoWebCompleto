import { API_BASE_URL } from '../config';
import type { ChatMessage, RoomActionLog, RoomSummary } from '../types/game';

export async function createRoom(name: string, hostUserId: string) {
  const url = `${API_BASE_URL}/rooms`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, host_user_id: hostUserId }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to create room (${response.status}): ${text}`);
  }

  const data = JSON.parse(text);
  // Extract the room id from the nested response and add it at top level
  return {
    ...data,
    room_id: data.room?.id ?? data.room_id, // fallback if server changes
  };
}

export async function getOpenRooms() {
  const response = await fetch(`${API_BASE_URL}/rooms/open`);
  if (!response.ok) {
    throw new Error(`Failed to fetch rooms: ${response.status}`);
  }
  return response.json();
}

export async function getLiveRooms(): Promise<RoomSummary[]> {
  const response = await fetch(`${API_BASE_URL}/rooms/live`);
  if (!response.ok) {
    throw new Error(`Failed to fetch live rooms: ${response.status}`);
  }

  const data = await response.json();
  const rooms = Array.isArray(data) ? data : data.rooms;

  if (!Array.isArray(rooms)) return [];

  return rooms.map((room: any) => ({
    id: String(room.id ?? room.room_id ?? ''),
    name: String(room.name ?? room.room_name ?? 'Sala sin nombre'),
    host_user_id: String(room.host_user_id ?? room.hostId ?? ''),
    player_count: Number(room.player_count ?? room.players?.length ?? 0),
    started: Boolean(room.started ?? true),
  }));
}

export async function getRoomState(roomId: string) {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/state`);
  if (!response.ok) {
    throw new Error(`Failed to fetch room state: ${response.status}`);
  }
  return response.json();
}

export async function getRoomActions(roomId: string): Promise<RoomActionLog[]> {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/actions`);
  if (!response.ok) {
    throw new Error(`Failed to fetch room actions: ${response.status}`);
  }

  const data = await response.json();
  const actions = Array.isArray(data) ? data : data.actions;

  if (!Array.isArray(actions)) return [];

  return actions.map((action: any, index: number) => ({
    id: String(action.id ?? `${action.timestamp ?? index}-${action.type ?? 'action'}`),
    type: String(action.type ?? action.action_type ?? 'action'),
    player_id:
      action.player_id != null ? String(action.player_id) : undefined,
    player_name:
      action.player_name != null ? String(action.player_name) : undefined,
    target_id:
      action.target_id != null ? String(action.target_id) : undefined,
    target_name:
      action.target_name != null ? String(action.target_name) : undefined,
    message: action.message != null ? String(action.message) : undefined,
    timestamp: Number(action.timestamp ?? action.created_at_unix ?? Date.now()),
  }));
}

export async function getRoomChat(roomId: string): Promise<ChatMessage[]> {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/chat`);
  if (!response.ok) {
    throw new Error(`Failed to fetch room chat: ${response.status}`);
  }

  const data = await response.json();
  const messages = Array.isArray(data) ? data : data.chat_history ?? data.messages;

  if (!Array.isArray(messages)) return [];

  return messages.map((message: any, index: number) => ({
    id: String(
      message.id ??
        `${message.timestamp ?? message.sent_at_unix ?? index}-${message.sender ?? message.player_id ?? 'msg'}`,
    ),
    sender: {
      id: String(message.sender ?? message.player_id ?? ''),
      name: String(message.player_name ?? message.sender_name ?? 'Jugador'),
      isHost: Boolean(message.is_host ?? false),
      isAlive: Boolean(message.is_alive ?? true),
    },
    text: String(message.text ?? message.message ?? ''),
    timestamp: Number(message.timestamp ?? message.sent_at_unix ?? Date.now()),
  }));
}

/** Returns the player's role string (e.g. "Terrorist") or null on failure. */
export async function getPlayerRole(
  roomId: string,
  playerId: string,
): Promise<string | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/rooms/${roomId}/players/${playerId}/role`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    // Server returns: { "role": "Terrorist" }
    return typeof data.role === 'string' ? data.role : null;
  } catch {
    return null;
  }
}
