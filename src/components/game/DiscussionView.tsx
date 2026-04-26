import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GameState, GameActions } from "../../types/game";
import PlayersList from "./PlayersList";
import ChatBox from "./ChatBox";
import { discussionStyles as styles } from "../../styles/gameStyles";

interface Props {
  state: GameState;
  actions: GameActions;
}

export default function DiscussionView({ state, actions }: Props) {
  const isHost = state.hostId === state.players[0]?.id;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fase de discusión</Text>
      <Text style={styles.timer}>Tiempo: —</Text>
      <PlayersList players={state.players} />
      <ChatBox messages={state.chat_history} onSend={actions.sendChat} />
      {isHost && (
        <TouchableOpacity style={styles.button} onPress={actions.advancePhase}>
          <Text style={styles.buttonText}>Terminar discusión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}