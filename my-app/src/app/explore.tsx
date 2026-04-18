import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
//import 'react-datepicker/dist/react-datepicker.css';


type Task = {
  id: string;
  title: string;
  type: 'task' | 'assignment' | 'exam';
  deadline?: Date;
};

export default function TasksScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const getCountdown = (deadline: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Overdue', color: '#e05252' };
    if (days === 0) return { label: 'Due today', color: '#e09a52' };
    return { label: `${days} day${days !== 1 ? 's' : ''} left`, color: '#2a7fa5' };
  };

  const addTask = (type: Task['type']) => {
    if (inputText.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: inputText,
      type,
      deadline,
    };
    setTasks([...tasks, newTask]);
    setInputText('');
    setDeadline(undefined);
  };

  const platformStyle = Platform.select({
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  const renderTaskList = (type: Task['type']) => {
    const filtered = tasks.filter(t => t.type === type);
    if (filtered.length === 0) {
      return <ThemedText type="small" style={styles.emptyText}>No {type}s yet!</ThemedText>;
    }
    return filtered.map(task => {
      const countdown = task.deadline ? getCountdown(task.deadline) : null;
      return (
        <View key={task.id} style={styles.taskItem}>
          <ThemedText>{task.title}</ThemedText>
          {task.deadline && countdown && (
            <View style={styles.deadlineRow}>
              <ThemedText type="small" style={styles.deadlineDate}>
                {task.deadline.toLocaleDateString()}
              </ThemedText>
              <ThemedText type="small" style={[styles.countdown, { color: countdown.color }]}>
                {countdown.label}
              </ThemedText>
            </View>
          )}
        </View>
      );
    });
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: '#C9ECF6' }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, platformStyle]}>

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <ThemedText type="subtitle" style={{ fontSize: 28, color: '#0F2B3A' }}>To-Do List</ThemedText>

          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { color: '#000' }]}
              placeholder="Add to your to-do list!"
              placeholderTextColor="#000"
              value={inputText}
              onChangeText={setInputText}
            />
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={deadline ? deadline.toISOString().split('T')[0] : ''}
              onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value) : undefined)}
              style={{
                fontSize: 16,
                paddingTop: 9,
                paddingBottom: 9,
                borderBottom: '1px solid #000',
                borderTop: '1px solid #000',
                borderLeft: '1px solid #000',
                borderRight: '1px solid #000',
                borderRadius: Spacing.two,
                background: 'transparent',
                color: '#0F2B3A',
                width: '100%',
                outline: 'none',
              }}
            />
            <View style={styles.buttonRow}>
              <Pressable style={[styles.addButton, { backgroundColor: '#9bd0ec' }]} onPress={() => addTask('task')}>
                <ThemedText type="small" style={{ color: '#000' }}>+ Task</ThemedText>
              </Pressable>
              <Pressable style={[styles.addButton, { backgroundColor: '#9bd0ec' }]} onPress={() => addTask('assignment')}>
                <ThemedText type="small" style={{ color: '#000' }}>+ Assignment</ThemedText>
              </Pressable>
              <Pressable style={[styles.addButton, { backgroundColor: '#9bd0ec' }]} onPress={() => addTask('exam')}>
                <ThemedText type="small" style={{ color: '#000' }}>+ Exam</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.sectionsWrapper}>
          <View style={{ backgroundColor: '#C9ECF6' }}>
            <Collapsible title={`Tasks (${tasks.filter(t => t.type === 'task').length})`}>
              {renderTaskList('task')}
            </Collapsible>
          </View>

          <View style={{ backgroundColor: '#C9ECF6' }}>
            <Collapsible title={`Assignments (${tasks.filter(t => t.type === 'assignment').length})`}>
              {renderTaskList('assignment')}
            </Collapsible>
          </View>

          <View style={{ backgroundColor: '#C9ECF6' }}>
            <Collapsible title={`Exams (${tasks.filter(t => t.type === 'exam').length})`}>
              {renderTaskList('exam')}
            </Collapsible>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center' },
  container: { 
    maxWidth: MaxContentWidth, 
    flexGrow: 1, 
    backgroundColor: '#C9ECF6',
    borderWidth: 1,
    borderColor: '#0F2B3A',
    borderRadius: Spacing.three,
    minHeight: 600,
  },
  titleContainer: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  inputWrapper: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: '#0F2B3A',
  },
  input: {
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
  },
  addButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    backgroundColor: '#0F2B3A',
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
    gap: 2,
  },
  deadlineRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  deadlineDate: {
    opacity: 0.6,
  },
  countdown: {
    fontWeight: '600',
  },
  emptyText: {
    fontStyle: 'italic',
    opacity: 0.6,
  },
});
