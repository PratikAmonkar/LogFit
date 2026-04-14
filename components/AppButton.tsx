import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

type AppButtonProps = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    backgroundColor?: string;
    textColor?: string;
    style?: ViewStyle;
    buttonStyle?: ViewStyle;
    textStyle?: TextStyle;
    entering?: typeof FadeIn | any;
};

export default function AppButton({
    label,
    onPress,
    disabled = false,
    loading = false,
    variant = 'primary',
    backgroundColor,
    textColor,
    style,
    buttonStyle,
    textStyle,
    entering = FadeInDown.duration(400),
}: AppButtonProps) {
    return (
        <Animated.View entering={entering} style={style}>
            <Pressable
                onPress={onPress}
                disabled={disabled || loading}
                style={[
                    styles.button,
                    variant === 'secondary' && styles.secondary,
                    variant === 'danger' && styles.danger,
                    (disabled || loading) && styles.disabled,
                    backgroundColor ? { backgroundColor } : undefined,
                    buttonStyle,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={variant === 'secondary' ? '#5C4AE4' : '#fff'} />
                ) : (
                    <Text
                        style={[
                            styles.text,
                            variant === 'secondary' && styles.textSecondary,
                            textColor ? { color: textColor } : undefined,
                            textStyle,
                        ]}
                    >
                        {label}
                    </Text>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#5C4AE4',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6.0,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#5C4AE4',
    },
    danger: {
        backgroundColor: '#E84545',
    },
    disabled: {
        opacity: 0.45,
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    textSecondary: {
        color: '#5C4AE4',
    },
});
