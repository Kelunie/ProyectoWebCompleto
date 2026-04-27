import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GameState } from '../../types/game';
import { endedStyles as styles } from '../../styles/gameStyles';

interface Props {
  state: GameState;
  onGoHome: () => void;
}

export default function EndedView({ state, onGoHome }: Props) {
  const humanPlayers = state.players.filter(p => p.alive).map(p => p.name);
  const winnerText = state.winners?.[0] ?? 'Sin definir';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego terminado</Text>
      <Text style={styles.winner}>Ganador: {winnerText}</Text>
      <Text style={styles.subtitle}>Sobrevivientes:</Text>
      {humanPlayers.map(name => (
        <Text key={name} style={styles.player}>
          {name}
        </Text>
      ))}
      <TouchableOpacity style={styles.homeButton} onPress={onGoHome}>
        <Text style={styles.homeButtonText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}
