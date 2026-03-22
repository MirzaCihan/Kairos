import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from './AuthContext';
import { getDateKey } from '../utils/taskUtils';
import { SAMPLE_TASKS, DEFAULT_SETTINGS } from '../data/defaultSegments';

const TaskContext = createContext(null);

// Convert DB snake_case row → JS camelCase task object
function rowToTask(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    category: row.category || 'personal',
    priority: row.priority || 'medium',
    startTime: row.start_time,
    endTime: row.end_time,
    date: row.date,
    recurrence: row.recurrence || 'none',
    recurrenceDays: row.recurrence_days || [],
  };
}

// Convert JS camelCase task → DB snake_case for insert/update
function taskToRow(task, userId) {
  return {
    id: task.id,
    user_id: userId,
    name: task.name,
    description: task.description || '',
    category: task.category || 'personal',
    priority: task.priority || 'medium',
    start_time: task.startTime,
    end_time: task.endTime,
    date: task.date,
    recurrence: task.recurrence || 'none',
    recurrence_days: task.recurrenceDays || [],
  };
}

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [completions, setCompletions] = useState({}); // { "taskId_dateKey": true }
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount / auth change
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);

      try {
        // 1. Load profile (settings & completions)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error loading profile:', profileError);
        }

        if (profileData) {
          const loadedSettings = profileData.settings?.app_settings || DEFAULT_SETTINGS;
          const loadedCompletions = profileData.settings?.completions || {};
          const isFirst = profileData.settings?.onboarding_complete !== true;
          setSettings(loadedSettings);
          setCompletions(loadedCompletions);
          setIsFirstRun(isFirst);
        } else {
          // New user — no profile row yet (trigger should have created it)
          setIsFirstRun(true);
        }

        // 2. Load tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (tasksError) {
          console.error('Error loading tasks:', tasksError);
        } else if (tasksData && tasksData.length > 0) {
          setTasks(tasksData.map(rowToTask));
        } else {
          // Brand new user — seed sample tasks
          const today = getDateKey(new Date());
          const sampleRows = SAMPLE_TASKS.map(t => taskToRow({ ...t, date: today }, user.id));
          const { error: seedError } = await supabase.from('tasks').insert(sampleRows);
          if (!seedError) {
            setTasks(SAMPLE_TASKS.map(t => ({ ...t, date: today })));
          }
        }
      } catch (err) {
        console.error('Unexpected error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Sync profile settings blob to Supabase
  const syncProfile = async (newSettings, newCompletions, newFirstRun) => {
    if (!user) return;
    const settingsBlob = {
      app_settings: newSettings,
      completions: newCompletions,
      onboarding_complete: !newFirstRun,
    };

    await supabase
      .from('profiles')
      .upsert({ id: user.id, settings: settingsBlob });
  };

  // ── CRUD Operations ──

  const addTask = async (task) => {
    setTasks(prev => [...prev, task]);
    const { error } = await supabase.from('tasks').insert(taskToRow(task, user.id));
    if (error) console.error('Error adding task:', error);
  };

  const updateTask = async (task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
    const row = taskToRow(task, user.id);
    delete row.user_id; // don't overwrite user_id
    const { error } = await supabase.from('tasks').update(row).eq('id', task.id);
    if (error) console.error('Error updating task:', error);
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('Error deleting task:', error);
  };

  const toggleComplete = async (taskId, dateKey) => {
    const key = `${taskId}_${dateKey}`;
    setCompletions(prev => {
      const newCompletions = { ...prev };
      if (newCompletions[key]) {
        delete newCompletions[key];
      } else {
        newCompletions[key] = true;
      }
      syncProfile(settings, newCompletions, isFirstRun);
      return newCompletions;
    });
  };

  const updateSettings = async (newSettingValues) => {
    const updated = { ...settings, ...newSettingValues };
    setSettings(updated);
    await syncProfile(updated, completions, isFirstRun);
  };

  const clearFirstRun = async () => {
    setIsFirstRun(false);
    await syncProfile(settings, completions, false);
  };

  const isCompleted = (taskId, dateKey) => !!completions[`${taskId}_${dateKey}`];

  const importData = (data) => {
    console.log('Import not supported in cloud version yet.');
  };

  const value = {
    tasks,
    settings,
    completions,
    isFirstRun,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    updateSettings,
    isCompleted,
    clearFirstRun,
    importData,
  };

  return (
    <TaskContext.Provider value={value}>
      {!loading ? children : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          gap: '20px',
          background: 'var(--color-bg-primary, #0a0a1a)',
        }}>
          <img
            src="/logo.png"
            alt="Kairos"
            style={{
              width: '72px',
              height: '72px',
              filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              animation: 'pulse 1.8s ease-in-out infinite',
            }}
          />
          <div style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.4rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #a855f7, #6c3ce1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Kairos
          </div>
          <div style={{
            width: '120px',
            height: '3px',
            borderRadius: '4px',
            background: 'rgba(168, 85, 247, 0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              height: '100%',
              width: '50%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #a855f7, #6c3ce1)',
              animation: 'shimmer 1.2s ease-in-out infinite alternate',
            }} />
          </div>
        </div>
      )}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}

export default TaskContext;
