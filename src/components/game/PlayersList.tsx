import React from "react";
import { View, Text } from "react-native";
import { Player } from "../../types/game";
import { playersListStyles as styles } from "../../styles/gameStyles";

interface Props {
  players: Player[];
}

export default function PlayersList({ players }: Props) {
  return (
    <View style={styles.container}>
      {players.map((player) => (
        <View key={player.id} style={styles.playerRow}>
          <Text style={[styles.name, !player.alive && styles.dead]}>
            {player.name} {player.isHost ? "(Host)" : ""}
          </Text>
          {player.role && <Text style={styles.role}>{player.role}</Text>}
        </View>
      ))}
    </View>
  );
}