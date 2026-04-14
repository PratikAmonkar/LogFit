import { UserProfile, UserRepository } from "@/services/userRepository";
import Constants from 'expo-constants';
import { create } from 'zustand';


interface UserState {
    data: UserProfile | null;
    isLoading: boolean;
    version: string;

    loadProfile: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
    data: null,
    isLoading: true,
    version: Constants.expoConfig?.version ?? "",
    loadProfile: async () => {
        set({ isLoading: true })
        try {
            const data = await UserRepository.getProfile();
            set({ data: data, isLoading: false })
        } catch (error) {
            console.error('Failed to load profile into store:', error);
            set({ isLoading: false })
        }
    },
    updateProfile: async (updates) => {
        set({ isLoading: true })
        try {
            await UserRepository.saveProfile(updates);
            const freshData = await UserRepository.getProfile();
            set({ data: freshData, isLoading: false })
        } catch (error) {
            console.error('Failed to update profile into store:', error);
            set({ isLoading: false })
        }
    },
}))