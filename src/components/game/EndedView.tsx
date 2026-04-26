import React from "react";
import { View, Text } from "react-native";
import { GameState } from "../../types/game";
import { endedStyles as styles } from "../../styles/gameStyles";

interface Props {
  state: GameState;
}

export default function EndedView({ state }: Props) {
  const humanPlayers = state.players.filter((p) => p.alive).map((p) => p.name);
  const winnerTeam = state.winners?.[0] ?? "unknown";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego terminado</Text>
      <Text style={styles.winner}>
        Ganador: {winnerTeam === "human" ? "Humanos" : "Virus"}
      </Text>
      <Text style={styles.subtitle}>Sobrevivientes:</Text>
      {humanPlayers.map((name) => (
        <Text key={name} style={styles.player}>
          {name}
        </Text>
      ))}
    </View>
  );
}