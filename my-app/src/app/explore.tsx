import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

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

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: '#C9ECF6' }]}
      contentInset={insets}
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
              <Pressable style={[styles.addButton, { backgroundColor: '#9bd0ec' }]} onPress={() => addTask('task')}>
                <ThemedText type="smallBold"  style={{ color: '#0F2B3A' }}>+ Task</ThemedText>
              </Pressable>
              <Pressable style={[styles.addButton, { backgroundColor: '#9bd0ec' }]} onPress={() => addTask('assignment')}>
                <ThemedText type="smallBold" style={{ color: '#0F2B3A' }}>+ Assignment</ThemedText>
              </Pressable>
              <Pressable style={[styles.addButton, { backgroundColor: '#9bd0ec' }]} onPress={() => addTask('exam')}>
                <ThemedText type="smallBold"  style={{ color: '#0F2B3A' }}>+ Exam</ThemedText>
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
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center' },
  container: { maxWidth: MaxContentWidth, flexGrow: 1, backgroundColor: '#C9ECF6'},
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
