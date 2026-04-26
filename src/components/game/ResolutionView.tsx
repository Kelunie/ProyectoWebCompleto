import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GameState, GameActions } from "../../types/game";
import { resolutionStyles as styles } from "../../styles/gameStyles";

interface Props {
  state: GameState;
  actions: GameActions;
}

export default function ResolutionView({ state, actions }: Props) {
  const isHost = state.hostId === state.players[0]?.id;
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Resultado de la ronda</Text>
      {state.mostVotedPlayer && (
        <Text style={styles.info}>
          Más votado: {state.mostVotedPlayer.name}
        </Text>
      )}
      {state.infectedPlayerIds && state.infectedPlayerIds.length > 0 && (
        <Text style={styles.info}>
          Infectados:{" "}
          {state.infectedPlayerIds
            .map((id) => state.players.find((p) => p.id === id)?.name || id)
            .join(", ")}
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