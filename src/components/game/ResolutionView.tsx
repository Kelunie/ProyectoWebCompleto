import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GameState, GameActions } from '../../types/game';
import { resolutionStyles as styles } from '../../styles/gameStyles';

interface Props {
  state: GameState;
  actions: GameActions;
  currentUserId: string;
}

export default function ResolutionView({
  state,
  actions,
  currentUserId,
}: Props) {
  const isHost = state.hostId === currentUserId;
  const expelledPlayerName = state.mostVotedPlayer?.name;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Resultado de la ronda</Text>
      {expelledPlayerName ? (
        <Text style={styles.info}>
          Expulsado por votación: {expelledPlayerName}
        </Text>
      ) : (
        <Text style={styles.info}>No hubo expulsado en esta ronda.</Text>
      )}
      {state.infectedPlayerIds && state.infectedPlayerIds.length > 0 && (
        <Text style={styles.info}>
          Infectados:{' '}
          {state.infectedPlayerIds
            .map(id => state.players.find(p => p.id === id)?.name || id)
            .join(', ')}
        </Text>
      )}
      {isHost && (
        <TouchableOpacity style={styles.button} onPress={actions.advancePhase}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
