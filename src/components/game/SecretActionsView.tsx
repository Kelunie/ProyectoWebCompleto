import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GameState, GameActions } from "../../types/game";
import { discussionStyles as styles } from "../../styles/gameStyles";

interface Props {
  state: GameState;
  actions: GameActions;
}

export default function SecretActionsView({ state, actions }: Props) {
  const isHost = state.hostId === state.players[0]?.id;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fase de acciones secretas</Text>
      <Text style={styles.timer}>Tiempo: —</Text>
      {isHost && (
        <TouchableOpacity style={styles.button} onPress={actions.advancePhase}>
          <Text style={styles.buttonText}>Terminar fase</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}