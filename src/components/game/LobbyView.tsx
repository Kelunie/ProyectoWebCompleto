import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GameState, GameActions } from '../../types/game';
import PlayersList from './PlayersList';
import { lobbyStyles as styles } from '../../styles/gameStyles';

interface Props {
  state: GameState;
  actions: GameActions;
  currentUserId: string;
}

export default function LobbyView({ state, actions, currentUserId }: Props) {
  const isHost = state.hostId === currentUserId;
  const playerCount = state.players.length;
  const MIN_PLAYERS = 5; // server minimum (rules: 8, test mode: 5)
  const canStart = playerCount >= MIN_PLAYERS;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sala de espera</Text>
      <Text style={styles.round}>
        Jugadores: {playerCount}/10{' '}
        {playerCount < MIN_PLAYERS ? `(mínimo ${MIN_PLAYERS})` : ''}
      </Text>
      <PlayersList players={state.players} />
      {isHost && (
        <TouchableOpacity
          style={[styles.button, !canStart && styles.buttonDisabled]}
          onPress={canStart ? actions.startGame : undefined}
          disabled={!canStart}
        >
          <Text style={styles.buttonText}>Comenzar juego</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
