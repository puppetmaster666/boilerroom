export type RootStackParamList = {
  NewGame: undefined;
  Main: undefined;
  Trade: undefined;
  Boiler: undefined;
  Protection: undefined;
  GameOver: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
