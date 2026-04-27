import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GameState, GameActions } from '../../types/game';
import { votingStyles as styles } from '../../styles/gameStyles';

interface Props {
  state: GameState;
  actions: GameActions;
  currentUserId: string;
}

export default function VotingView({ state, actions, currentUserId }: Props) {
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(state.voting_remaining_seconds);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvancedRoundRef = useRef<number | null>(null);

  const currentPlayer = state.players.find(
    player => player.id === currentUserId,
  );
  const canVote = Boolean(currentPlayer?.alive);
  const hasVoted = votedFor !== null;
  const isHost = state.hostId === currentUserId;
  const aliveTargets = state.players.filter(
    player => player.alive && player.id !== currentUserId,
  );
  const alivePlayerCount = state.players.filter(player => player.alive).length;
  const voteCount = Object.keys(state.votingResults || {}).length;
  const allAlivePlayersVoted =
    voteCount >= alivePlayerCount && alivePlayerCount > 0;

  // Sync countdown when server sends an updated value
  useEffect(() => {
    setCountdown(state.voting_remaining_seconds);
  }, [state.voting_remaining_seconds]);

  // Local countdown tick — decrements every second independently of server updates
  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(
      () => setCountdown(c => Math.max(0, c - 1)),
      1000,
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  useEffect(() => {
    if (!isHost || !allAlivePlayersVoted) return;
    if (autoAdvancedRoundRef.current === state.round) return;
    autoAdvancedRoundRef.current = state.round;
    actions.advancePhase();
  }, [actions, allAlivePlayersVoted, isHost, state.round]);

  const handleVote = (targetId: string) => {
    if (!canVote || hasVoted) return;
    setVotedFor(targetId);
    actions.vote(targetId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fase de votación</Text>
      <Text style={styles.timer}>
        {countdown > 0 ? `⏱ ${countdown}s restantes` : '⏰ Tiempo agotado'}
      </Text>
      <Text style={styles.timer}>
        Votos: {voteCount}/{alivePlayerCount}
      </Text>

      {!canVote && (
        <Text style={styles.timer}>Estás eliminado y no puedes votar.</Text>
      )}

      {canVote && hasVoted && (
        <Text style={styles.votedConfirm}>
          ✅ Votaste por{' '}
          {state.players.find(p => p.id === votedFor)?.name ?? votedFor}
        </Text>
      )}

      {countdown === 0 && isHost && (
        <TouchableOpacity
          style={styles.advanceButton}
          onPress={actions.advancePhase}
        >
          <Text style={styles.advanceButtonText}>
            Terminar votación y ver resultado
          </Text>
        </TouchableOpacity>
      )}

      {countdown > 0 && isHost && !allAlivePlayersVoted && (
        <TouchableOpacity
          style={styles.advanceButton}
          onPress={actions.advancePhase}
        >
          <Text style={styles.advanceButtonText}>Cerrar votación ahora</Text>
        </TouchableOpacity>
      )}

      {allAlivePlayersVoted && (
        <Text style={styles.votedConfirm}>
          Todos los jugadores vivos ya votaron. Avanzando a resultados...
        </Text>
      )}

      {aliveTargets.map(player => {
        const isSelected = votedFor === player.id;
        return (
          <TouchableOpacity
            key={player.id}
            style={[
              styles.playerRow,
              isSelected && styles.playerRowSelected,
              (hasVoted || !canVote) && styles.playerRowDisabled,
            ]}
            onPress={() => handleVote(player.id)}
            disabled={hasVoted || !canVote}
          >
            <Text
              style={[
                styles.playerName,
                isSelected && styles.playerNameSelected,
              ]}
            >
              {player.name}
            </Text>
            {isSelected && <Text style={styles.votedMark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
