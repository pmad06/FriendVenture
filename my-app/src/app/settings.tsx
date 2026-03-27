import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, Text, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
    const theme = useTheme();

    const [pushNotifs, setPushNotifs] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: '#C9ECF6' }]}
            contentContainerStyle={styles.contentContainer}>

            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <ThemedText type="subtitle">Settings</ThemedText>
                </View>

                <View style={styles.sectionsWrapper}>

                    {/* Account */}
                    <ThemedText type="smallBold">ACCOUNT</ThemedText>
                    <View style={styles.inputWrapper}>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>Personal Info</ThemedText>
                            <TextInput 
                                style={styles.input}
                                onChangeText={setFirstName}
                                value={firstName}
                                placeholder="First Name"
                            />
                            <TextInput 
                                style={styles.input}
                                onChangeText={setLastName}
                                value={lastName}
                                placeholder="Last Name"
                            />
                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>Password & Security</ThemedText>
                             <TextInput 
                                style={styles.input}
                                onChangeText={setPassword}
                                value={password}
                                placeholder="Change your password"
                            />
                            <TouchableOpacity style={styles.button} onPress ={() => alert('button clicked')}>
                                <Text style={styles.text}>Reset Pasword</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </View>

                    {/* Notifications */}
                    <ThemedText type="smallBold">NOTIFICATIONS</ThemedText>
                    <ThemedView type="backgroundElement" style={styles.inputWrapper}>
                        <View style={[styles.taskItem, styles.rowBetween]}>
                            <ThemedText>Push Notifications</ThemedText>
                            <Switch value={pushNotifs} onValueChange={(newValue) =>{ if (newValue) alert('notifications enabled!') 
                                setPushNotifs(newValue)}} />
                        </View>
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

                </View>
            </View>
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
        backgroundColor: '#9bd0ec',
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
        backgroundColor: '#C9ECF6',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    text:{
        color: 'black',
        fontSize: 16,
    }
});
