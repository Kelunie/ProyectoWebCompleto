import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { GameState, GameActions } from '../../types/game';
import { getPlayerRole } from '../../services/api';
import {
  discussionStyles as styles,
  secretStyles,
} from '../../styles/gameStyles';

interface Props {
  state: GameState;
  actions: GameActions;
  currentUserId: string;
}

const ROLE_LABELS: Record<string, string> = {
  terrorist: '🦠 Terrorista',
  investigator: '🔍 Investigador',
  fanatic: '😈 Fanático',
  citizen: '👤 Ciudadano',
};

export default function SecretActionsView({
  state,
  actions,
  currentUserId,
}: Props) {
  const isHost = state.hostId === currentUserId;
  const currentPlayer = state.players.find(
    player => player.id === currentUserId,
  );
  const currentRole = currentPlayer?.role?.toLowerCase();
  const isTerrorist = currentRole === 'terrorist';
  const isInvestigator = currentRole === 'investigator';

  const [lastInfectedTarget, setLastInfectedTarget] = useState<string | null>(
    null,
  );
  const [lastInvestigatedTarget, setLastInvestigatedTarget] = useState<
    string | null
  >(null);
  const [infectedThisRound, setInfectedThisRound] = useState(false);
  const [investigatedThisRound, setInvestigatedThisRound] = useState(false);
  const [investigationFeedback, setInvestigationFeedback] = useState('');
  const [pendingInvestigatedTarget, setPendingInvestigatedTarget] = useState<
    string | null
  >(null);
  const [baselineCureProgress, setBaselineCureProgress] = useState(
    state.cure_progress,
  );
  const [targetRoles, setTargetRoles] = useState<Record<string, string>>({});
  const [rolesLoading, setRolesLoading] = useState(false);
  const lastRoundRef = useRef(state.round);

  useEffect(() => {
    if (state.round === lastRoundRef.current) return;
    lastRoundRef.current = state.round;
    setLastInfectedTarget(null);
    setLastInvestigatedTarget(null);
    setInfectedThisRound(false);
    setInvestigatedThisRound(false);
    setInvestigationFeedback('');
    setPendingInvestigatedTarget(null);
    setBaselineCureProgress(state.cure_progress);
  }, [state.cure_progress, state.round]);

  useEffect(() => {
    if (!pendingInvestigatedTarget) return;
    if (state.cure_progress > baselineCureProgress) {
      setInvestigationFeedback(
        `Investigaste a ${pendingInvestigatedTarget}: tenia el virus. Progreso +1.`,
      );
      setPendingInvestigatedTarget(null);
      return;
    }
    if (state.phase !== 'secret_actions') {
      setInvestigationFeedback(
        `Investigaste a ${pendingInvestigatedTarget}: no se detecto virus.`,
      );
      setPendingInvestigatedTarget(null);
    }
  }, [
    baselineCureProgress,
    pendingInvestigatedTarget,
    state.cure_progress,
    state.phase,
  ]);

  const infectedPlayerIdSet = useMemo(
    () => new Set(state.infectedPlayerIds || []),
    [state.infectedPlayerIds],
  );

  const infectedTargets = useMemo(
    () =>
      Array.from(infectedPlayerIdSet)
        .map(id => state.players.find(player => player.id === id)?.name || id)
        .join(', '),
    [infectedPlayerIdSet, state.players],
  );

  const infectionAlreadyChosen = infectedThisRound;

  // Only terrorists can infect — and only once per round.
  const canInfect =
    Boolean(currentPlayer?.alive) && isTerrorist && !infectionAlreadyChosen;
  const canInvestigate = currentPlayer?.alive && currentRole === 'investigator';
  const aliveTargets = state.players.filter(
    player => player.alive && player.id !== currentUserId,
  );
  const infectableCandidates = aliveTargets.filter(
    player => !infectedPlayerIdSet.has(player.id),
  );

  useEffect(() => {
    if (!isTerrorist || state.phase !== 'secret_actions') return;

    const missingRoleIds = infectableCandidates
      .map(player => player.id)
      .filter(playerId => {
        const knownRole =
          state.players.find(player => player.id === playerId)?.role ||
          targetRoles[playerId];
        return !knownRole;
      });

    if (missingRoleIds.length === 0) return;

    let cancelled = false;
    setRolesLoading(true);

    Promise.all(
      missingRoleIds.map(async playerId => {
        const role = await getPlayerRole(state.room_id, playerId);
        return { playerId, role: role?.toLowerCase() ?? '' };
      }),
    )
      .then(results => {
        if (cancelled) return;
        setTargetRoles(prev => {
          const next = { ...prev };
          for (const result of results) {
            if (result.role) next[result.playerId] = result.role;
          }
          return next;
        });
      })
      .finally(() => {
        if (!cancelled) setRolesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    isTerrorist,
    infectableCandidates,
    state.phase,
    state.players,
    state.room_id,
    targetRoles,
  ]);

  const infectableTargets = aliveTargets.filter(player => {
    if (infectedPlayerIdSet.has(player.id)) return false;
    const knownRole =
      player.role?.toLowerCase() || targetRoles[player.id]?.toLowerCase();
    // Strict rule: terrorists must never appear as infectable options.
    return Boolean(knownRole) && knownRole !== 'terrorist';
  });

  const unresolvedInfectableRoleCount = infectableCandidates.filter(player => {
    const knownRole =
      player.role?.toLowerCase() || targetRoles[player.id]?.toLowerCase();
    return !knownRole;
  }).length;

  const roleLabel = currentRole
    ? ROLE_LABELS[currentRole] ?? `🎭 ${currentPlayer?.role}`
    : '⏳ Asignando rol...';

  const handleInfect = (targetId: string) => {
    if (!canInfect) return;
    const targetName = state.players.find(
      player => player.id === targetId,
    )?.name;
    setLastInfectedTarget(targetName || targetId);
    setInfectedThisRound(true);
    actions.terrorInfect(targetId);
  };

  const handleInvestigate = (targetId: string) => {
    if (!isInvestigator || !currentPlayer?.alive || investigatedThisRound)
      return;
    const targetName = state.players.find(
      player => player.id === targetId,
    )?.name;
    setLastInvestigatedTarget(targetName || targetId);
    setInvestigatedThisRound(true);
    setPendingInvestigatedTarget(targetName || targetId);
    setBaselineCureProgress(state.cure_progress);
    setInvestigationFeedback(`Investigando a ${targetName || targetId}...`);
    actions.investigate(targetId);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Fase de acciones secretas</Text>

      {/* Role badge */}
      <View style={secretStyles.roleBadge}>
        <Text style={secretStyles.roleLabel}>Tu rol</Text>
        <Text style={secretStyles.roleValue}>{roleLabel}</Text>
        {currentPlayer?.team && (
          <Text style={secretStyles.teamLabel}>
            Equipo: {currentPlayer.team === 'virus' ? '🦠 Virus' : '🧬 Humanos'}
          </Text>
        )}
      </View>

      <Text style={styles.timer}>
        Progreso vacuna: {state.cure_progress}/3{' '}
        {state.cure_unlocked ? '(Desbloqueada)' : ''}
      </Text>

      {isTerrorist && infectionAlreadyChosen && (
        <Text style={styles.timer}>
          Ya usaste tu infección en esta ronda. No puedes infectar de nuevo.
        </Text>
      )}

      {isTerrorist && rolesLoading && unresolvedInfectableRoleCount > 0 && (
        <Text style={styles.timer}>
          Cargando roles de jugadores para validar objetivos...
        </Text>
      )}

      {isTerrorist &&
        !infectionAlreadyChosen &&
        infectableTargets.length === 0 && (
          <Text style={styles.timer}>
            No hay objetivos válidos para infectar esta ronda.
            {infectedTargets ? ` Infectados: ${infectedTargets}.` : ''}
          </Text>
        )}

      {isTerrorist && lastInfectedTarget && (
        <Text style={styles.timer}>
          Confirmado: intentaste infectar a {lastInfectedTarget}. Espera la
          siguiente ronda.
        </Text>
      )}

      {isInvestigator && lastInvestigatedTarget && (
        <Text style={styles.timer}>
          Ya investigaste a {lastInvestigatedTarget} en esta ronda.
        </Text>
      )}

      {isInvestigator && investigationFeedback !== '' && (
        <Text style={styles.timer}>{investigationFeedback}</Text>
      )}

      {canInfect && infectableTargets.length > 0 && (
        <>
          <Text style={styles.timer}>Elige a quien infectar:</Text>
          {infectableTargets.map(target => (
            <TouchableOpacity
              key={`infect-${target.id}`}
              style={styles.button}
              onPress={() => handleInfect(target.id)}
            >
              <Text style={styles.buttonText}>🦠 Infectar a {target.name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {Boolean(currentPlayer?.alive) &&
        isInvestigator &&
        !investigatedThisRound && (
          <>
            <Text style={styles.timer}>Elige a quien investigar:</Text>
            {aliveTargets.map(target => (
              <TouchableOpacity
                key={`investigate-${target.id}`}
                style={styles.button}
                onPress={() => handleInvestigate(target.id)}
              >
                <Text style={styles.buttonText}>
                  🔍 Investigar a {target.name}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

      {!canInfect && !canInvestigate && currentRole && (
        <Text style={styles.timer}>
          No tienes acciones en esta fase. Espera a que los demás actúen.
        </Text>
      )}

      {!currentRole && (
        <Text style={styles.timer}>Esperando asignación de rol...</Text>
      )}

      {isHost && (
        <TouchableOpacity style={styles.button} onPress={actions.advancePhase}>
          <Text style={styles.buttonText}>Terminar fase</Text>
        </TouchableOpacity>
      )}
      {!isHost && (
        <Text style={styles.timer}>
          Esperando que el host termine la fase...
        </Text>
      )}
    </ScrollView>
  );
}
