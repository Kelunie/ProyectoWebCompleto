import React from "react";
import { View, Text } from "react-native";
import { GameState, GameActions } from "../../types/game";
import LobbyView from "./LobbyView";
import SecretActionsView from "./SecretActionsView";
import DiscussionView from "./DiscussionView";
import VotingView from "./VotingView";
import ResolutionView from "./ResolutionView";
import EndedView from "./EndedView";
import { phaseRendererStyles as styles } from "../../styles/gameStyles";

interface Props {
  state: GameState;
  actions: GameActions;
}

export default function PhaseRenderer({ state, actions }: Props) {
  switch (state.phase) {
    case "lobby":
      return <LobbyView state={state} actions={actions} />;
    case "secret_actions":
      return <SecretActionsView state={state} actions={actions} />;
    case "discussion":
      return <DiscussionView state={state} actions={actions} />;
    case "voting":
      return <VotingView state={state} actions={actions} />;
    case "resolution":
      return <ResolutionView state={state} actions={actions} />;
    case "ended":
      return <EndedView state={state} />;
    default:
      return (
        <View style={styles.container}>
          <Text style={styles.error}>Unknown phase: {state.phase}</Text>
        </View>
      );
  }
}