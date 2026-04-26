export type RootStackParamList = {
  Home: undefined;
  Rooms: { name: string };
  Game: { roomId: string; userId: string; name: string };
};