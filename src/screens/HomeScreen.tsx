import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { styles } from '../styles/homeStyles';
import logo from '../assets/logo.png';
import { getUserId } from '../utils/userId';
import { createRoom } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateRoom = async () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Por favor ingresa tu nombre');
      return;
    }
    setErrorMsg('');

    try {
      setLoading(true);
      const userId = await getUserId();
      const room = await createRoom(`Sala de ${trimmed}`, userId);
      navigation.navigate('Game', {
        roomId: room.room_id,
        userId,
        name: trimmed,
        hostUserId: userId,
      });
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudo crear la sala');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Por favor ingresa tu nombre');
      return;
    }
    setErrorMsg('');
    navigation.navigate('Rooms', { name: trimmed });
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
        onChangeText={text => {
          setName(text);
          if (errorMsg) setErrorMsg('');
        }}
        maxLength={20}
        autoCapitalize="words"
      />

      {errorMsg !== '' && <Text style={styles.errorText}>{errorMsg}</Text>}

      <TouchableOpacity
        style={[
          styles.button,
          (!name.trim() || loading) && styles.buttonDisabled,
        ]}
        onPress={handleCreateRoom}
        disabled={!name.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear sala</Text>
        )}
      </TouchableOpacity>

      {/* New button: navigate to room list */}
      <TouchableOpacity
        style={[
          styles.secondaryButton,
          (!name.trim() || loading) && styles.buttonDisabled,
        ]}
        onPress={handleJoinRoom}
        disabled={!name.trim() || loading}
      >
        <Text style={styles.buttonText}>Unirse a sala</Text>
      </TouchableOpacity>
    </View>
  );
}
