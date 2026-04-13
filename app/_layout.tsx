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

  // ── App startup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      await loadProfile();
      // Restore timer if app was killed while a workout was active
      await hydrateFromStorage();
    };
    setup();
  }, []);

  // ── Foreground re-entry: instantly sync elapsed to real wall-clock time ──
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          // App just came back to foreground — snap the timer to real time
          syncElapsed();
        }
        appState.current = nextState;
      }
    );
    return () => subscription.remove();
  }, [syncElapsed]);

  // ── 1-second interval drives re-renders ──────────────────────────────────
  // (workoutElapsed is already computed from wall-clock in tick(), so the
  //  interval only matters for keeping the UI updating smoothly)
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

        {/* Global Components */}
        <WorkoutTimer />
        <RestTimerOverlay />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
