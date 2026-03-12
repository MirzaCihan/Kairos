import { createContext, useContext, useReducer, useEffect } from 'react';
import { save, load } from '../utils/storage';
import { getDateKey } from '../utils/taskUtils';
import { SAMPLE_TASKS, DEFAULT_SETTINGS } from '../data/defaultSegments';

const TaskContext = createContext(null);

// Initial state
function getInitialState() {
  const savedTasks = load('tasks');
  const savedSettings = load('settings');
  const savedCompletions = load('completions', {});
  const isFirstRun = !savedTasks;

  return {
    tasks: savedTasks || SAMPLE_TASKS.map(t => ({ ...t, date: getDateKey(new Date()) })),
    settings: savedSettings || { ...DEFAULT_SETTINGS },
    completions: savedCompletions, // { "taskId_dateKey": true }
    isFirstRun,
  };
}

// Reducer
function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      };

    case 'TOGGLE_COMPLETE': {
      const { taskId, dateKey } = action.payload;
      const key = `${taskId}_${dateKey}`;
      const newCompletions = { ...state.completions };
      if (newCompletions[key]) {
        delete newCompletions[key];
      } else {
        newCompletions[key] = true;
      }
      return {
        ...state,
        completions: newCompletions,
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'IMPORT_DATA':
      return {
        ...state,
        tasks: action.payload.tasks || state.tasks,
        settings: action.payload.settings || state.settings,
        completions: action.payload.completions || state.completions,
      };

    case 'CLEAR_FIRST_RUN':
      return {
        ...state,
        isFirstRun: false,
      };

    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, null, getInitialState);

  // Auto-save to localStorage on every state change
  useEffect(() => {
    save('tasks', state.tasks);
    save('settings', state.settings);
    save('completions', state.completions);
  }, [state.tasks, state.settings, state.completions]);

  const value = {
    tasks: state.tasks,
    settings: state.settings,
    completions: state.completions,
    isFirstRun: state.isFirstRun,
    dispatch,

    // Convenience methods
    addTask: (task) => dispatch({ type: 'ADD_TASK', payload: task }),
    updateTask: (task) => dispatch({ type: 'UPDATE_TASK', payload: task }),
    deleteTask: (id) => dispatch({ type: 'DELETE_TASK', payload: id }),
    toggleComplete: (taskId, dateKey) =>
      dispatch({ type: 'TOGGLE_COMPLETE', payload: { taskId, dateKey } }),
    updateSettings: (settings) =>
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    isCompleted: (taskId, dateKey) =>
      !!state.completions[`${taskId}_${dateKey}`],
    clearFirstRun: () => dispatch({ type: 'CLEAR_FIRST_RUN' }),
    importData: (data) => dispatch({ type: 'IMPORT_DATA', payload: data }),
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
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
