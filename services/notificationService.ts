import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldSetBadge: true,
    })
});

export const NotificationService = {
    async requestPermission() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.log('Failed to get push token for push notification!');
            return false;
        }
        return true;

    },

    async scheduleGymReminders(days: string, time: string) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        if (!days || !time) return;
        const dayMap: { [key: string]: number } = {
            'Sunday': 1, 'Monday': 2, 'Tuesday': 3, 'Wednesday': 4, 'Thursday': 5, 'Friday': 6, 'Saturday': 7
        };
        const [hours, minutes] = time.split(':').map(Number);
        const selectedDays = days.split(',');
        for (const day of selectedDays) {
            const weekDay = dayMap[day.trim()];
            if (weekDay) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "LogFit: Gym Time! 🏋️‍♂️",
                        body: "Time for your scheduled workout. Let's get moving!",
                        data: { type: 'gym_reminder' },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                        weekday: weekDay,
                        hour: hours,
                        minute: minutes,
                        repeats: true,
                    },

                });
            }
        }

    },

    async triggerStreakNotification(count: Number) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Incredible! 🔥",
                body: `You've hit a ${count}-day workout streak! Keep up the momentum!`,
                sound: true,
            },
            trigger: null,
        })
    },

    async scheduleUnfinishWorkoutNotification() {
        const id = "unfinished_workout_nudge";
        await Notifications.scheduleNotificationAsync({
            identifier: id,
            content: {
                title: "Still Working Out? 🧐",
                body: "Your workout hasn't been marked as complete yet. Don't forget to log your final sets!",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 2 * 60 * 60,
                repeats: false
            },
        });
    },

    async cancelUnfinishedWorkoutNotification() {
        await Notifications.cancelScheduledNotificationAsync("unfinished_workout_nudge")
    },

    async getPermissionStatus() {
        const { status } = await Notifications.getPermissionsAsync();
        return status;
    },

    async openAppSettings() {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings();
        }
    },
}