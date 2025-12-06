export type RootStackParamList = {
  NewGame: undefined;
  Main: undefined;
  Trade: undefined;
  Boiler: undefined;
  Marks: undefined;
  Protection: undefined;
  GameOver: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
