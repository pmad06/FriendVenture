import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { API_BASE_URL } from '@/constants/api';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, Text, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
    const theme = useTheme();
    // token is needed to authenticate every api call
    const { token } = useAuth();

    // local state for all editable fields
    const [pushNotifs, setPushNotifs] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // fetch profile on mount - [token] so it retries once the token loads from storage
    useEffect(() => {
        // don't fetch if not logged in yet
        if (!token) return;
        fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => {
            // ?? '' prevents setting null/undefined into a text input
            setFirstName(data.firstName ?? '');
            setLastName(data.lastName ?? '');
            setUsername(data.username ?? '');
            setPushNotifs(data.pushNotifications);
        });
    }, [token]);

    // saves name + username to the backend
    const saveProfile = async () => {
        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ firstName, lastName, username })
        });
        const data = await res.json();
        alert(res.ok ? 'Profile saved!' : data.error);
    };

    // Called when user presses Reset Password
    const changePassword = async () => {
        const res = await fetch(`${API_BASE_URL}/api/user/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        alert(res.ok ? 'Password changed!' : data.error);
    };

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
                            <TextInput
                                style={styles.input}
                                onChangeText={setUsername}
                                value={username}
                                placeholder="Username"
                                autoCapitalize="none"
                            />

                            <TouchableOpacity style={styles.button} onPress={saveProfile}>
                                <Text style={styles.text}>Save</Text>
                            </TouchableOpacity>

                        </Pressable>
                        <Pressable style={styles.taskItem}>
                            <ThemedText>Password & Security</ThemedText>
                             <TextInput
                                style={styles.input}
                                onChangeText={setCurrentPassword}
                                value={currentPassword}
                                placeholder="Current password"
                                secureTextEntry={true}
                            />
                            <TextInput
                                style={styles.input}
                                onChangeText={setNewPassword}
                                value={newPassword}
                                placeholder="New password"
                                secureTextEntry={true}
                            />
                            <TouchableOpacity style={styles.button} onPress ={changePassword}>
                                <Text style={styles.text}>Reset Password</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </View>

                    {/* Notifications */}
                    <ThemedText type="smallBold">NOTIFICATIONS</ThemedText>
                    <ThemedView type="backgroundElement" style={styles.inputWrapper}>
                        <View style={[styles.taskItem, styles.rowBetween]}>
                            <ThemedText>Push Notifications</ThemedText>
                                setPushNotifs(newValue);
                                await fetch(`${API_BASE_URL}/api/user/notifications`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ pushNotifications: newValue })
                                });
                            }} value={pushNotifs} />
                        </View>
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
        color: 'black',
        backgroundColor: 'white',
        // @ts-ignore
        WebkitBoxShadow: '0 0 0 1000px white inset',
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
