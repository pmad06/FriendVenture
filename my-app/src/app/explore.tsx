import React, { useState, useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePet } from '@/context/pet-context';
import type { TaskType } from '@/context/pet-context';

type Task = {
  id: string;
  title: string;
  type: TaskType;
  deadline?: Date;
  completed: boolean;
  penalized: boolean; 
};

export default function TasksScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const { onComplete, onMissed } = usePet();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const tasksRef = useRef(tasks);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  //used to check if user missed the deadline for their assignments
  useEffect(() => {
    const check = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      //updates pet status if user failed to finish their assignment on time
      setTasks(prev => {
        let changed = false;
        const next = prev.map(task => {
          if (task.completed || task.penalized || !task.deadline) return task;
          const due = new Date(task.deadline);
          due.setHours(0, 0, 0, 0);
          if (due <= today) {
            onMissed(task.type);   
            changed = true;
            return { ...task, penalized: true };
          }
          return task;
        });
        return changed ? next : prev;
      });
    };

    check(); 
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []); 

  //calculates how many days are left until the assignment is due 
  const getCountdown = (deadline: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(deadline);
    due.setHours(0, 0, 0, 0);
    const diff = due.getTime() - now.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));

    if (days < 0)   return { label: 'Overdue',     color: '#9d3f3f' };
    if (days === 0) return { label: 'Due today',   color: '#a89543' };
    return             { label: `${days} day${days !== 1 ? 's' : ''} left`, color: '#66b966' };
  };

  //user can add their task 
  const addTask = (type: TaskType) => {
    if (inputText.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: inputText,
      type,
      deadline,
      completed: false,
      penalized: false,
    };
    setTasks(prev => [...prev, newTask]);
    setInputText('');
    setDeadline(undefined);
  };

  //checkbox so users can actually say if they completed their assignments or tasks
  //pet status and health changes based on what the user says
  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      if (!task.completed) {
        // Completing: reward
        onComplete(task.type);
        return { ...task, completed: true };
      } else {
        // Un-completing: penalize (take the reward back)
        onMissed(task.type);
        return { ...task, completed: false };
      }
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const platformStyle = Platform.select({
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  //users can associate their to do item with task assignment or exam 
  const renderTaskList = (type: TaskType) => {
    const filtered = tasks.filter(t => t.type === type);
    if (filtered.length === 0) {
      return <ThemedText type="small" style={styles.emptyText}>No {type}s yet!</ThemedText>;
    }
    return filtered.map(task => {
      const countdown = task.deadline ? getCountdown(task.deadline) : null;
      const isOverdue = task.penalized && !task.completed;
      return (
        <View key={task.id} style={[styles.taskItem, task.completed && styles.taskCompleted]}>
          <View style={styles.taskRow}>
            {/* Checkbox for the user */}
            <Pressable
              onPress={() => toggleComplete(task.id)}
              style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
              {task.completed && <ThemedText style={styles.checkmark}>✓</ThemedText>}
            </Pressable>

            <Pressable
              onPress={() => deleteTask(task.id)}
              style={styles.deleteButton}>
              <ThemedText style={styles.deleteText}>✕</ThemedText>
          </Pressable>

            <View style={{ flex: 1 }}>
              {/* strikes through name of task because user marked it as complete */}
              <ThemedText style={task.completed ? styles.taskTitleDone : undefined}>
                {task.title}
              </ThemedText>
              {task.deadline && countdown && (
                <View style={styles.deadlineRow}>
                  <ThemedText type="small" style={styles.deadlineDate}>
                    {task.deadline.toLocaleDateString()}
                  </ThemedText>
                  <ThemedText type="small" style={[styles.countdown, { color: countdown.color }]}>
                    {countdown.label}
                  </ThemedText>
                  {/* pet status got hit because user missed deadline*/}
                  {isOverdue && (
                    <ThemedText type="small" style={styles.penaltyBadge}>
                      *pet health hit
                    </ThemedText>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: '#C9ECF6' }]}
      contentInset={{ ...safeAreaInsets, bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three }}
      contentContainerStyle={[styles.contentContainer, platformStyle]}>

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <ThemedText type="subtitle" style={{ fontSize: 28, color: '#0F2B3A' }}>To-Do List</ThemedText>

          {/* input section for users like their text field and the date picker for deadline */}
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
              min={(() => {
                const d = new Date();
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              })()}
              value={deadline ? deadline.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                if (!e.target.value) {
                  setDeadline(undefined);
                  return;
                }
                const [year, month, day] = e.target.value.split('-').map(Number);
                setDeadline(new Date(year, month - 1, day)); // local time, not UTC
              }}
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
                color: '#000',
                width: '100%',
                outline: 'none',
              }}
            />
            {/* buttons to add to either task assignment or exam */}
            <View style={styles.buttonRow}>
              <Pressable style={styles.addButton} onPress={() => addTask('challenge')}>
                <ThemedText type="small" style={{ color: '#000' }}>+ Challenge</ThemedText>
                <ThemedText type="small" style={{ color: '#000', fontSize: 10}}> Go on a microadventure! Coffee with a friend, take a walk to the nearby park, etc.!</ThemedText>
              </Pressable>
              <Pressable style={styles.addButton} onPress={() => addTask('assignment')}>
                <ThemedText type="small" style={{ color: '#000' }}>+ Assignment</ThemedText>
                <ThemedText type="small" style={{ color: '#000', fontSize: 10}}> Finish your homework! Library or Cafe Hop!</ThemedText>
              </Pressable>
              <Pressable style={styles.addButton} onPress={() => addTask('exam')}>
                <ThemedText type="small" style={{ color: '#000' }}>+ Exam</ThemedText>
                <ThemedText type="small" style={{ color: '#000', fontSize: 10}}> Prepare for your upcoming exam! Check out a new lecture hall!</ThemedText>
              </Pressable>
              {/* added hobby button */}
              <Pressable style={styles.addButton} onPress={() => addTask('hobby')}>
                <ThemedText type="small" style={{ color: '#000' }}>+ Personal Hobbies</ThemedText>
                <ThemedText type="small" style={{ color: '#000', fontSize: 10}}> Try a new recipe, learn a musical instrument, or read a book!</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* used collapsible from the expo template */}
        <View style={styles.sectionsWrapper}>
          <View style={{ backgroundColor: '#9bd0ec' }}>
            <Collapsible title={`Challenges (${tasks.filter(t => t.type === 'challenge').length})`}>
              {renderTaskList('challenge')}
            </Collapsible>
          </View>
          <View style={{ backgroundColor: '#9bd0ec' }}>
            <Collapsible title={`Assignments (${tasks.filter(t => t.type === 'assignment').length})`}>
              {renderTaskList('assignment')}
            </Collapsible>
          </View>
          <View style={{ backgroundColor: '#9bd0ec' }}>
            <Collapsible title={`Exams (${tasks.filter(t => t.type === 'exam').length})`}>
              {renderTaskList('exam')}
            </Collapsible>
          </View>
          <View style={{ backgroundColor: '#9bd0ec' }}>
            <Collapsible title={`Hobbies (${tasks.filter(t => t.type === 'hobby').length})`}>
              {renderTaskList('hobby')}
            </Collapsible>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView:       { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center' },
  container: {
    maxWidth: 800, flexGrow: 1, backgroundColor: '#9bd0ec',
    borderWidth: 1, borderColor: '#0F2B3A', borderRadius: Spacing.three, minHeight: 800,
  },
  titleContainer: { gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.six },
  inputWrapper:   { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two, borderWidth: 1, borderColor: '#0F2B3A' },
  input:          { fontSize: 16, paddingVertical: Spacing.two },
  buttonRow:      { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', backgroundColor: 'transparent' },
  addButton:      { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: Spacing.two, backgroundColor: '#9bd0ec', alignItems: 'center', justifyContent: 'center' },
  sectionsWrapper:{ gap: Spacing.four, paddingHorizontal: Spacing.four },
  taskItem:       { paddingVertical: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.1)' },
  taskCompleted:  { opacity: 0.55 },
  taskRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#0F2B3A',
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#0F2B3A' },
  checkmark:       { color: '#fff', fontSize: 13, fontWeight: '700' },
  taskTitleDone:   { textDecorationLine: 'line-through', opacity: 0.6 },
  deadlineRow:     { flexDirection: 'row', gap: Spacing.two, alignItems: 'center', flexWrap: 'wrap' },
  deadlineDate:    { opacity: 0.6 },
  countdown:       { fontWeight: '600' },
  penaltyBadge:    { color: '#171426', fontWeight: '600' },
  emptyText:       { fontStyle: 'italic', opacity: 0.6 },
  deleteButton: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, justifyContent: 'center', alignItems: 'center'},
  deleteText:   { color: '#131732', fontSize: 16, fontWeight: '700' },
});
