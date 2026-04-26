import React from "react";
import { View, Text, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { styles } from "../styles/roomsStyles";

type Props = NativeStackScreenProps<RootStackParamList, "Rooms">;

export default function RoomsScreen({ route, navigation }: Props) {
  const { name } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, {name}!</Text>
      <Text style={styles.subtext}>Room list goes here</Text>
      <Button
        title="Test Game Screen"
        onPress={() =>
          navigation.navigate("Game", {
            roomId: "test-room",
            userId: "test-user",
            name: name,
          })
        }
      />
    </View>
  );
}