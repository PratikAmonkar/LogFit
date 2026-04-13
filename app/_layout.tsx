import { useUserStore } from "@/store/userStore";
import { useTimerStore } from "@/store/userTimerStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initDatabase } from "../services/db";

import { RestTimerOverlay } from "@/components/RestTimerOverlay";
import { WorkoutTimer } from "@/components/WorkoutTimer";

export default function RootLayout() {
  const loadProfile = useUserStore((state) => state.loadProfile)
  const { tick, isWorkoutActive, isResting } = useTimerStore();
  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      await loadProfile()
    };
    setup();
  }, []);

  useEffect(() => {
    if (!isWorkoutActive && !isResting) return;
    console.log("Timer started because workout/rest is active!");
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => {
      console.log("Timer stopped!");
      clearInterval(interval);
    };
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

