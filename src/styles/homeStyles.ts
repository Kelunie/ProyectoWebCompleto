import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0f172a",
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
    alignSelf: "center",
    resizeMode: "contain",
  },
  title: {
    fontSize: 32,
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  secondary: {
    backgroundColor: "#3b82f6",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
  color: "#ef4444",
  textAlign: "center",
  marginBottom: 15,
  fontSize: 16,
},
secondaryButton: {
  backgroundColor: "#3b82f6",
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
},
});