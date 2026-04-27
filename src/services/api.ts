import { API_BASE_URL } from '../config';

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
