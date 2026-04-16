import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import AppButton from './AppButton';

interface AppAlertProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    type?: 'warning' | 'error' | 'success' | 'info';
}

export default function AppAlert({
    visible,
    title,
    message,
    confirmText = 'Understood',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'info'
}: AppAlertProps) {
    const getIcon = () => {
        switch (type) {
            case 'warning': return { name: 'warning-outline', color: '#FF9500', bg: '#FFF9F2' };
            case 'error': return { name: 'alert-circle-outline', color: '#FF3B30', bg: '#FFF2F2' };
            case 'success': return { name: 'checkmark-circle-outline', color: '#4CD964', bg: '#F2FFF5' };
            default: return { name: 'information-circle-outline', color: '#5C4AE4', bg: '#F2F2FF' };
        }
    };

    const icon = getIcon();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

                <Animated.View entering={ZoomIn.duration(400)} style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
                        <Ionicons name={icon.name as any} size={42} color={icon.color} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    {onCancel ? (
                        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                            <AppButton
                                label={cancelText}
                                variant="secondary"
                                onPress={onCancel}
                                style={{ flex: 1 }}
                            />
                            <AppButton
                                label={confirmText}
                                onPress={onConfirm}
                                variant={type === 'error' ? 'danger' : 'primary'}
                                style={{ flex: 1 }}
                            />
                        </View>
                    ) : (
                        <AppButton
                            label={confirmText}
                            onPress={onConfirm}
                            style={{ width: '100%' }}
                        />
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
});
