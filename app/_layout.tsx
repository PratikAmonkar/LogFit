import { useUserStore } from "@/store/userStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initDatabase } from "../services/db";

export default function RootLayout() {
  const loadProfile = useUserStore((state) => state.loadProfile)
  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      // await seedDatabase();
      await loadProfile()
    };
    setup();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

