import { normalizeIncomingState } from '../src/hooks/useGameSocket';

describe('normalizeIncomingState', () => {
  it('normalizes pairings and resolves most voted player from id', () => {
    const raw = {
      room_id: 'room-1',
      session_id: 'session-1',
      phase: 'SecretActions',
      round: 2,
      host_user_id: 'host-1',
      players: [
        {
          id: 'host-1',
          name: 'Host',
          alive: true,
          role: 'Terrorist',
          team: 'virus',
        },
        {
          id: 'u2',
          name: 'Ana',
          alive: true,
          role: 'Investigator',
          team: 'human',
        },
      ],
      chat_history: [
        {
          id: 'chat-1',
          player_id: 'u2',
          player_name: 'Ana',
          message: 'hola',
          sent_at_unix: 123,
        },
      ],
      pairings: [['host-1', 'u2']],
      ended: false,
      winners: [],
      voting_results: { 'host-1': 'u2' },
      most_voted_player: 'u2',
      infected_player_ids: ['u2'],
    };

    const state = normalizeIncomingState(raw);

    expect(state.phase).toBe('secret_actions');
    expect(state.pairings).toEqual([['host-1', 'u2']]);
    expect(state.mostVotedPlayer?.id).toBe('u2');
    expect(state.chat_history[0].sender.name).toBe('Ana');
    expect(state.infectedPlayerIds).toEqual(['u2']);
  });

  it('keeps lobby phase when backend sends secret_actions before start', () => {
    const raw = {
      room_id: 'room-2',
      session_id: 'session-2',
      phase: 'SecretActions',
      round: 1,
      host_user_id: 'host-1',
      players: [
        { id: 'host-1', name: 'Host', alive: true },
        { id: 'u2', name: 'Ana', alive: true },
      ],
      pairings: [],
      current_turn_player_id: null,
      started: false,
      ended: false,
      winners: [],
      chat_history: [],
    };

    const state = normalizeIncomingState(raw);
    expect(state.phase).toBe('lobby');
  });
});
