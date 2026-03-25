<<<<<<< HEAD
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

=======
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
>>>>>>> 1d5b211d4249bfe9d39022807dd9b1860c972099
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

<<<<<<< HEAD
type Task = {
  id: string;
  title: string;
  type: 'task' | 'assignment' | 'exam';
}

export default function TasksScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');

=======
export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
>>>>>>> 1d5b211d4249bfe9d39022807dd9b1860c972099
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
<<<<<<< HEAD

  const addTask = (type: Task['type']) => {
    if (inputText.trim() === '') return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: inputText,
      type,
    };
    setTasks([...tasks, newTask]);
    setInputText('');
  };

  const platformStyle = Platform.select({
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four}
  });

  const renderTaskList = (type: Task['type']) => {
    const filtered = tasks.filter(t => t.type === type);
    if (filtered.length === 0) {
      return <ThemedText type="small" style={styles.emptyText}>No {type}s yet!</ThemedText>;
    }
    return filtered.map(task => (
      <ThemedView key={task.id} style={styles.taskItem}>
        <ThemedText>{task.title}</ThemedText>
      </ThemedView>
    ));
  };

=======
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

>>>>>>> 1d5b211d4249bfe9d39022807dd9b1860c972099
  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
<<<<<<< HEAD
      contentContainerStyle={[styles.contentContainer, platformStyle]}>
      
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">My Study Planner</ThemedText>
          
          {/* Input Area */}
          <ThemedView type="backgroundElement" style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
            />
            <ThemedView style={styles.buttonRow}>
              <Pressable style={styles.addButton} onPress={() => addTask('task')}>
                <ThemedText type="smallBold">+ Task</ThemedText>
              </Pressable>
              <Pressable style={[styles.addButton, { backgroundColor: '#4A90E2' }]} onPress={() => addTask('assignment')}>
                <ThemedText type="smallBold" style={{ color: '#fff' }}>+ Assignment</ThemedText>
              </Pressable>
              <Pressable style={[styles.addButton, { backgroundColor: '#E94E77' }]} onPress={() => addTask('exam')}>
                <ThemedText type="smallBold" style={{ color: '#fff' }}>+ Exam</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title={`Tasks (${tasks.filter(t => t.type === 'task').length})`}>
             {renderTaskList('task')}
          </Collapsible>

          <Collapsible title={`Assignments (${tasks.filter(t => t.type === 'assignment').length})`}>
             {renderTaskList('assignment')}
          </Collapsible>

          <Collapsible title={`Exams (${tasks.filter(t => t.type === 'exam').length})`}>
             {renderTaskList('exam')}
          </Collapsible>
        </ThemedView>
=======
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Explore</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            This starter app includes example{'\n'}code to help you get started.
          </ThemedText>

          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.linkButton}>
                <ThemedText type="link">Expo documentation</ThemedText>
                <SymbolView
                  tintColor={theme.text}
                  name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
                  size={12}
                />
              </ThemedView>
            </Pressable>
          </ExternalLink>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title="File-based routing">
            <ThemedText type="small">
              This app has two screens: <ThemedText type="code">src/app/(tabs)/index.tsx</ThemedText> and{' '}
              <ThemedText type="code">src/app/(tabs)/explore.tsx</ThemedText>
            </ThemedText>
            <ThemedText type="small">
              The layout file in <ThemedText type="code">src/app/_layout.tsx</ThemedText> sets up
              the tab navigator.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Android, iOS, and web support">
            <ThemedView type="backgroundElement" style={styles.collapsibleContent}>
              <ThemedText type="small">
                You can open this project on Android, iOS, and the web. To open the web version,
                press <ThemedText type="smallBold">w</ThemedText> in the terminal running this
                project.
              </ThemedText>
              <Image
                source={require('@/assets/images/tutorial-web.png')}
                style={styles.imageTutorial}
              />
            </ThemedView>
          </Collapsible>

          <Collapsible title="Images">
            <ThemedText type="small">
              For static images, you can use the <ThemedText type="code">@2x</ThemedText> and{' '}
              <ThemedText type="code">@3x</ThemedText> suffixes to provide files for different
              screen densities.
            </ThemedText>
            <Image source={require('@/assets/images/react-logo.png')} style={styles.imageReact} />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Light and dark mode components">
            <ThemedText type="small">
              This template has light and dark mode support. The{' '}
              <ThemedText type="code">useColorScheme()</ThemedText> hook lets you inspect what the
              user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Animations">
            <ThemedText type="small">
              This template includes an example of an animated component. The{' '}
              <ThemedText type="code">src/components/ui/collapsible.tsx</ThemedText> component uses
              the powerful <ThemedText type="code">react-native-reanimated</ThemedText> library to
              animate opening this hint.
            </ThemedText>
          </Collapsible>
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
>>>>>>> 1d5b211d4249bfe9d39022807dd9b1860c972099
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
<<<<<<< HEAD
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  inputWrapper: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    fontSize: 16,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  addButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyText: {
    fontStyle: 'italic',
    opacity: 0.6,
  }
});
=======
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: { textAlign: 'center' },
  pressed: { opacity: 0.7 },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: { alignItems: 'center' },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: { width: 100, height: 100, alignSelf: 'center' },
});
>>>>>>> 1d5b211d4249bfe9d39022807dd9b1860c972099
