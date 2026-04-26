import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { styles } from "../styles/homeStyles";
import logo from "../assets/logo.png";
import { getUserId } from "../utils/userId";
import { createRoom } from "../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");   // <-- new

  const handleContinue = async () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Por favor ingresa tu nombre");
      return;
    }
    setErrorMsg("");

    try {
      setLoading(true);
      const userId = await getUserId();
      const room = await createRoom(trimmed, userId);
      navigation.navigate("Game", {
        roomId: room.room_id,
        userId,
        name: trimmed,
      });
    } catch (error: any) {
      setErrorMsg(error.message || "No se pudo crear la sala");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Virus Game</Text>

      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errorMsg) setErrorMsg("");   // clear error on typing
        }}
        maxLength={20}
        autoCapitalize="words"
      />

      {/* Inline error instead of Alert */}
      {errorMsg !== "" && <Text style={styles.errorText}>{errorMsg}</Text>}

      <TouchableOpacity
        style={[styles.button, (!name.trim() || loading) && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!name.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear sala</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}