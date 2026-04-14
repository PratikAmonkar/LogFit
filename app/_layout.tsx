import { RestTimerOverlay } from "@/components/RestTimerOverlay";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import { useUserStore } from "@/store/userStore";
import { useTimerStore } from "@/store/userTimerStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initDatabase } from "../services/db";

export default function RootLayout() {
  const loadProfile = useUserStore((state) => state.loadProfile);
  const { tick, isWorkoutActive, isResting, hydrateFromStorage, syncElapsed } = useTimerStore();

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      await loadProfile();
      await hydrateFromStorage();
    };
    setup();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          syncElapsed();
        }
        appState.current = nextState;
      }
    );
    return () => subscription.remove();
  }, [syncElapsed]);


  useEffect(() => {
    if (!isWorkoutActive && !isResting) return;
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutActive, isResting, tick]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
        <WorkoutTimer />
        <RestTimerOverlay />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
