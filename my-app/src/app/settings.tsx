import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@react-navigation/elements';

export default function SettingsScreen() {
    const theme = useTheme();

    const [pushNotifs, setPushNotifs] = useState(true);

    const [text, setText] = useState('');

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
                            <ThemedText>Personal Info</ThemedText>
                            <TextInput 
                                style={styles.input}
                                onChangeText={setText}
                                value={text}
                                placeholder="First Name"
                            />
                            <TextInput 
                                style={styles.input}
                                onChangeText={setText}
                                value={text}
                                placeholder="Last Name"
                            />
                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>Password & Security</ThemedText>
                             <TextInput 
                                style={styles.input}
                                onChangeText={setText}
                                value={text}
                                placeholder="Change your password"
                            />
                            <TouchableOpacity style={styles.button} onPress ={() => alert('button clicked')}>
                                <Text style={styles.text}>Reset Pasword</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </ThemedView>

                    {/* Notifications */}
                    <ThemedText type="smallBold">NOTIFICATIONS</ThemedText>
                    <ThemedView type="backgroundElement" style={styles.inputWrapper}>
                        <ThemedView style={[styles.taskItem, styles.rowBetween]}>
                            <ThemedText>Push Notifications</ThemedText>
                            <Switch value={pushNotifs} onValueChange={(newValue) =>{ if (newValue) alert('notifications enabled!') 
                                setPushNotifs(newValue)}} />
                        </ThemedView>
                    </ThemedView>

                    {/* Pet & Game */}
                    <ThemedText type="smallBold">PET & GAME</ThemedText>
                    <ThemedView type="backgroundElement" style={styles.inputWrapper}>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>Pet Customization</ThemedText>
                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>Weekly Goals</ThemedText>
                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>Weekly Summary</ThemedText>
                        </Pressable>
                    </ThemedView>

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
    input:{
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
    },
    button:{
        backgroundColor: '#f7f3f3',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    text:{
        color: 'black',
        fontSize: 16,
    }
});
