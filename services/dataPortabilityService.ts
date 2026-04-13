import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WorkoutRepository } from "./workoutRepository";

export const DataPortabilityService = {
    exportFullVault: async () => {
        try {
            const dbStats = await WorkoutRepository.getEverything();
            const allKeys = await AsyncStorage.getAllKeys();
            const settingsData = await AsyncStorage.multiGet(allKeys);
            const settingsObj = Object.fromEntries(settingsData);

            const vaultPayload = {
                version: "1.0.0",
                timeStamp: new Date().toISOString(),
                type: "FULL_VAULT",
                data: {
                    database: dbStats,
                    settings: settingsObj,
                }
            };
            const fileName = `LogFit_Vault_${Date.now()}.json`;
            const fileUri = Paths.cache.uri + fileName;

            const file = new File(fileUri);
            file.write(JSON.stringify(vaultPayload));

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            }
        } catch (error) {
            console.error("Export Vault Failed:", error);
            throw error;
        }
    },

    importFullVault: async (): Promise<boolean> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
            if (result.canceled) return false; // User cancelled — not an error

            const file = new File(result.assets[0].uri);
            const fileContent = await file.text();

            const vault = JSON.parse(fileContent);

            if (vault.type !== "FULL_VAULT") {
                throw new Error("Invalid backup file. Please select a valid LogFit Full Vault (.json) file.");
            }

            const settingsEntries = Object.entries(vault.data.settings);
            await AsyncStorage.multiSet(settingsEntries as [string, string][]);

            await WorkoutRepository.restoreFromBackup(vault.data.database);

            return true;
        } catch (error) {
            console.error("Import Vault Failed:", error);
            throw error;
        }
    },

    exportWorkoutsOnly: async () => {
        try {
            const workoutData = await WorkoutRepository.getWorkoutDataOnly();
            const payload = {
                version: "1.0.0",
                timeStamp: new Date().toISOString(),
                type: 'WORKOUT_PORTFOLIO',
                data: workoutData
            };
            const fileName = `LogFit_Workouts_${Date.now()}.json`;
            const fileUri = Paths.cache.uri + fileName;

            const file = new File(fileUri);
            file.write(JSON.stringify(payload));

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            }
        } catch (error) {
            console.error("Export Workouts Failed:", error);
            throw error;
        }
    },

    importWorkoutsOnly: async (): Promise<boolean> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
            if (result.canceled) return false; // User cancelled — not an error

            const file = new File(result.assets[0].uri);
            const fileContent = await file.text();

            const payload = JSON.parse(fileContent);

            if (payload.type !== "WORKOUT_PORTFOLIO") {
                throw new Error("Invalid file. Please select a valid LogFit Workout Portfolio (.json) file.");
            }

            await WorkoutRepository.restoreFromBackup(payload.data);

            return true;
        } catch (error) {
            console.error("Import Workouts Failed:", error);
            throw error;
        }
    }
};