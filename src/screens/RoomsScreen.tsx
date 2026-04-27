import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getOpenRooms } from '../services/api';
import { getUserId } from '../utils/userId';
import { roomsScreenStyles as styles } from '../styles/roomsScreenStyles'; // see step 4
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Rooms'>;

interface RoomInfo {
  id: string;
  name: string;
  host_user_id: string;
  player_count: number;
  started: boolean;
}

export default function RoomsScreen({ route, navigation }: Props) {
  const { name } = route.params;
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOpenRooms();
      setRooms(data.rooms || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar salas');
    } finally {
      setLoading(false);
    }
  };

  // Reload list when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchRooms();
    }, []),
  );

  const handleJoin = async (item: RoomInfo) => {
    try {
      const userId = await getUserId();
      navigation.navigate('Game', {
        roomId: item.id,
        userId,
        name,
        hostUserId: item.host_user_id,
      });
    } catch {
      // fallback
      const userId = 'user-' + Math.random().toString(36).substring(7);
      navigation.navigate('Game', {
        roomId: item.id,
        userId,
        name,
        hostUserId: item.host_user_id,
      });
    }
  };

  const renderItem = ({ item }: { item: RoomInfo }) => (
    <TouchableOpacity style={styles.roomItem} onPress={() => handleJoin(item)}>
      <Text style={styles.roomName}>{item.name}</Text>
      <Text style={styles.roomDetails}>
        Jugadores: {item.player_count}{' '}
        {item.started ? '⏳ En juego' : '🟢 Abierta'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salas abiertas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : rooms.length === 0 ? (
        <Text style={styles.empty}>No hay salas disponibles</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}
