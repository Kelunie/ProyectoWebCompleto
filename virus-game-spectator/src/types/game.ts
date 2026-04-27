export interface Player {
  id: string;
  name: string;
  alive: boolean;
  isHost?: boolean;
  role?: string;
  team?: 'human' | 'virus';
}

export interface ChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    isHost: boolean;
    isAlive: boolean;
  };
  text: string;
  timestamp: number;
}

export interface RoomSummary {
  id: string;
  name: string;
  host_user_id: string;
  player_count: number;
  started: boolean;
}

export interface RoomActionLog {
  id: string;
  type: string;
  player_id?: string;
  player_name?: string;
  target_id?: string;
  target_name?: string;
  message?: string;
  timestamp: number;
}

export type GamePhase =
  | 'lobby'
  | 'secret_actions'
  | 'discussion'
  | 'voting'
  | 'resolution'
  | 'ended';

export interface GameState {
  room_id: string;
  session_id: string;
  phase: GamePhase;
  round: number;
  players: Player[];
  hostId: string;
  cure_progress: number;
  cure_unlocked: boolean;
  voting_remaining_seconds: number;
  chat_history: ChatMessage[];
  pairings: string[][];
  current_turn_player_id: string | null;
  ended: boolean;
  winners: string[];
  votingResults?: Record<string, string>;
  mostVotedPlayer?: Player;
  infectedPlayerIds?: string[];
}

export interface GameActions {
  startGame: () => void;
  sendChat: (message: string) => void;
  vote: (targetId: string) => void;
  advancePhase: () => void;
  terrorInfect: (targetId: string) => void;
  investigate: (targetId: string) => void;
}
