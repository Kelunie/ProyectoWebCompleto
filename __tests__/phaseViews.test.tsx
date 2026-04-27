import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import SecretActionsView from '../src/components/game/SecretActionsView';
import VotingView from '../src/components/game/VotingView';
import { GameActions, GameState } from '../src/types/game';

function baseState(): GameState {
  return {
    room_id: 'room-1',
    session_id: 'session-1',
    phase: 'secret_actions',
    round: 1,
    players: [
      {
        id: 'u1',
        name: 'Terror',
        alive: true,
        role: 'Terrorist',
        team: 'virus',
      },
      { id: 'u2', name: 'Ana', alive: true, role: 'Citizen', team: 'human' },
      { id: 'u3', name: 'Luis', alive: false, role: 'Citizen', team: 'human' },
    ],
    hostId: 'host-x',
    cure_progress: 0,
    cure_unlocked: false,
    voting_remaining_seconds: 30,
    chat_history: [],
    pairings: [],
    current_turn_player_id: null,
    ended: false,
    winners: [],
    votingResults: {},
    infectedPlayerIds: [],
  };
}

function baseActions(overrides?: Partial<GameActions>): GameActions {
  return {
    startGame: jest.fn(),
    sendChat: jest.fn(),
    vote: jest.fn(),
    advancePhase: jest.fn(),
    terrorInfect: jest.fn(),
    investigate: jest.fn(),
    ...overrides,
  };
}

describe('phase views', () => {
  it('shows infect action for terrorist and triggers action', async () => {
    const actions = baseActions();
    const state = baseState();
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SecretActionsView
          state={state}
          actions={actions}
          currentUserId="u1"
        />,
      );
    });

    const buttons = tree.root.findAllByType(TouchableOpacity);
    expect(buttons.length).toBeGreaterThan(0);

    ReactTestRenderer.act(() => {
      buttons[0].props.onPress();
    });

    expect(actions.terrorInfect).toHaveBeenCalledWith('u2');
  });

  it('does not allow dead player to vote', async () => {
    const vote = jest.fn();
    const actions = baseActions({ vote });
    const state = baseState();
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <VotingView state={state} actions={actions} currentUserId="u3" />,
      );
    });

    const buttons = tree.root.findAllByType(TouchableOpacity);
    expect(buttons.length).toBeGreaterThan(0);

    ReactTestRenderer.act(() => {
      buttons[0].props.onPress();
    });

    expect(vote).not.toHaveBeenCalled();
  });
});
