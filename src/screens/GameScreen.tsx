import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useGameSocket } from '../hooks';
import PhaseRenderer from '../components/game/PhaseRenderer';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function GameScreen({ route, navigation }: Props) {
  const { roomId, userId, name, hostUserId } = route.params;
  const { state, actions, error } = useGameSocket(
    roomId,
    userId,
    name,
    hostUserId,
  );

  if (!state) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Conectando...</Text>
        {error && <Text style={styles.error}>Error: {error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.phaseText}>Fase: {state.phase}</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
      <PhaseRenderer
        state={state}
        actions={actions}
        currentUserId={userId}
        onGoHome={() => navigation.navigate('Home')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  phaseText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 10,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 5,
  },
});
