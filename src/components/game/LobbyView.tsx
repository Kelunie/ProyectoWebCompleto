import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GameState, GameActions } from "../../types/game";
import PlayersList from "./PlayersList";
import { lobbyStyles as styles } from "../../styles/gameStyles";

interface Props {
  state: GameState;
  actions: GameActions;
}

export default function LobbyView({ state, actions }: Props) {
  const isHost = state.hostId === state.players[0]?.id;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sala de espera</Text>
      <Text style={styles.round}>Ronda {state.round}</Text>
      <PlayersList players={state.players} />
      {isHost && (
        <TouchableOpacity style={styles.button} onPress={actions.startGame}>
          <Text style={styles.buttonText}>Comenzar juego</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}