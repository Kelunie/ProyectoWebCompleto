import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GameState, GameActions } from "../../types/game";
import { votingStyles as styles } from "../../styles/gameStyles";

interface Props {
  state: GameState;
  actions: GameActions;
}

export default function VotingView({ state, actions }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fase de votación</Text>
      <Text style={styles.timer}>
        Tiempo: {state.voting_remaining_seconds}s
      </Text>
      {state.players.map((player) => (
        <TouchableOpacity
          key={player.id}
          style={styles.playerRow}
          onPress={() => actions.vote(player.id)}
        >
          <Text style={styles.playerName}>{player.name}</Text>
          {state.votingResults &&
            Object.values(state.votingResults).includes(player.id) && (
              <Text style={styles.votedMark}>✓</Text>
            )}
        </TouchableOpacity>
      ))}
    </View>
  );
}