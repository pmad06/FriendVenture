import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
    const theme = useTheme();

    const [pushNotifs, setPushNotifs] = useState(true);
    const [friendNotifs, setFriendNotifs] = useState(true);

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.contentContainer}>

            <ThemedView style={styles.container}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="subtitle">Settings</ThemedText>
                </ThemedView>

                <ThemedView style={styles.sectionsWrapper}>

                    {/* Account */}
                    <ThemedText type="smallBold">ACCOUNT</ThemedText>
                    <ThemedView type="backgroundElement" style={styles.inputWrapper}>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>👤  Personal Info</ThemedText>
                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>🔒  Password & Security</ThemedText>
                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>🚪  Log Out</ThemedText>
                        </Pressable>
                    </ThemedView>

                    {/* Notifications */}
                    <ThemedText type="smallBold">NOTIFICATIONS</ThemedText>
                    <ThemedView type="backgroundElement" style={styles.inputWrapper}>
                        <ThemedView style={[styles.taskItem, styles.rowBetween]}>
                            <ThemedText>🔔  Push Notifications</ThemedText>
                            <Switch value={pushNotifs} onValueChange={setPushNotifs} />
                        </ThemedView>
                        <ThemedView style={[styles.taskItem, styles.rowBetween]}>
                            <ThemedText>💌  Friend Requests</ThemedText>
                            <Switch value={friendNotifs} onValueChange={setFriendNotifs} />
                        </ThemedView>
                    </ThemedView>

                    {/* Pet & Game */}
                    <ThemedText type="smallBold">PET & GAME</ThemedText>
                    <ThemedView type="backgroundElement" style={styles.inputWrapper}>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>🐣  Pet Customization</ThemedText>
                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>🎯  Weekly Goals</ThemedText>
                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>📊  Weekly Summary</ThemedText>
                        </Pressable>
                    </ThemedView>

                    <ThemedText type="small" style={styles.emptyText}>FriendVenture v1.0.0</ThemedText>

                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: { flex: 1 },
    contentContainer: { flexDirection: 'row', justifyContent: 'center' },
    container: { maxWidth: MaxContentWidth, flexGrow: 1 },
    titleContainer: {
        gap: Spacing.three,
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.six,
    },
    inputWrapper: {
        padding: Spacing.three,
        borderRadius: Spacing.three,
        gap: Spacing.two,
    },
    sectionsWrapper: {
        gap: Spacing.four,
        paddingHorizontal: Spacing.four,
    },
    taskItem: {
        paddingVertical: Spacing.two,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyText: {
        fontStyle: 'italic',
        opacity: 0.6,
        textAlign: 'center',
    },
});
