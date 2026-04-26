import { StyleSheet } from "react-native";

export const roomsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  roomItem: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 10,
    marginBottom: 12,
  },
  roomName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  roomDetails: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
  },
  error: {
    color: "#ef4444",
    textAlign: "center",
    fontSize: 16,
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
});