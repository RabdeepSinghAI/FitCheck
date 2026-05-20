import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Member: undefined;
  Trainer: undefined;
  Admin: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
