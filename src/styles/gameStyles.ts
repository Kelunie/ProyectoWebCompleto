import { StyleSheet } from 'react-native';

export const lobbyStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f172a',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  round: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#22c55e',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  buttonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
});

export const discussionStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#0f172a',
  },
  header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  timer: {
    color: '#fbbf24',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export const votingStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#0f172a',
  },
  header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  timer: {
    color: '#fbbf24',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  playerRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
  },
  votedMark: {
    color: '#22c55e',
    fontSize: 20,
  },
  playerRowSelected: {
    backgroundColor: '#1d4ed8',
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  playerRowDisabled: {
    opacity: 0.5,
  },
  playerNameSelected: {
    color: '#bfdbfe',
    fontWeight: 'bold',
  },
  votedConfirm: {
    color: '#22c55e',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  advanceButton: {
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    alignItems: 'center',
  },
  advanceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export const secretStyles = StyleSheet.create({
  roleBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  roleValue: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: 'bold',
  },
  teamLabel: {
    color: '#fbbf24',
    fontSize: 14,
    marginTop: 6,
  },
});

export const resolutionStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  info: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#22c55e',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export const playersListStyles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  name: {
    color: '#fff',
    fontSize: 16,
  },
  dead: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  role: {
    color: '#fbbf24',
    fontSize: 14,
    marginLeft: 10,
  },
});

export const chatBoxStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    marginBottom: 10,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  sender: {
    color: '#fbbf24',
    fontWeight: 'bold',
    marginRight: 4,
  },
  text: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.8,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  blockedHint: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});

export const phaseRendererStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  error: {
    color: '#ef4444',
    fontSize: 18,
  },
});

export const endedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  winner: {
    color: '#fbbf24',
    fontSize: 22,
    marginBottom: 20,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 10,
  },
  player: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 3,
  },
  homeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 24,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
