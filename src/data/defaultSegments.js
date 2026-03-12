// Predefined day segment templates
export const DAY_TEMPLATES = {
  default: {
    name: 'Standard Day',
    description: 'Balanced 30-minute segments from 6 AM to 11 PM',
    dayStart: 360,  // 6:00 AM
    dayEnd: 1380,   // 11:00 PM
    granularity: 30,
  },
  detailed: {
    name: 'Detailed Day',
    description: 'Precise 15-minute segments from 5 AM to midnight',
    dayStart: 300,  // 5:00 AM
    dayEnd: 1440,   // 12:00 AM
    granularity: 15,
  },
  relaxed: {
    name: 'Relaxed Day',
    description: 'Broad 1-hour segments from 7 AM to 10 PM',
    dayStart: 420,  // 7:00 AM
    dayEnd: 1320,   // 10:00 PM
    granularity: 60,
  },
  fullDay: {
    name: 'Full 24 Hours',
    description: 'Complete day coverage with 30-minute segments',
    dayStart: 0,    // 12:00 AM
    dayEnd: 1440,   // 12:00 AM
    granularity: 30,
  },
};

// Default settings
export const DEFAULT_SETTINGS = {
  template: 'default',
  dayStart: 360,
  dayEnd: 1380,
  granularity: 30,
  theme: 'dark',
  firstDayOfWeek: 1, // Monday
  showWeekends: true,
};

// Sample tasks for first-run experience
export const SAMPLE_TASKS = [
  {
    id: 'sample_1',
    name: 'Morning Routine',
    description: 'Wake up, freshen up, meditate',
    category: 'personal',
    priority: 'medium',
    startTime: 390,  // 6:30 AM
    endTime: 420,    // 7:00 AM
    recurrence: 'daily',
    completed: false,
  },
  {
    id: 'sample_2',
    name: 'Prepare Breakfast',
    description: 'Cook and enjoy a healthy breakfast',
    category: 'meal',
    priority: 'medium',
    startTime: 420,  // 7:00 AM
    endTime: 450,    // 7:30 AM
    recurrence: 'daily',
    completed: false,
  },
  {
    id: 'sample_3',
    name: 'Focused Work Block',
    description: 'Deep work session — no distractions',
    category: 'work',
    priority: 'high',
    startTime: 510,  // 8:30 AM
    endTime: 630,    // 10:30 AM
    recurrence: 'weekdays',
    completed: false,
  },
  {
    id: 'sample_4',
    name: 'Lunch Break',
    description: 'Take a proper break and eat',
    category: 'meal',
    priority: 'medium',
    startTime: 720,  // 12:00 PM
    endTime: 780,    // 1:00 PM
    recurrence: 'daily',
    completed: false,
  },
  {
    id: 'sample_5',
    name: 'Exercise Session',
    description: 'Gym, run, or home workout',
    category: 'exercise',
    priority: 'high',
    startTime: 1020, // 5:00 PM
    endTime: 1080,   // 6:00 PM
    recurrence: 'weekdays',
    completed: false,
  },
  {
    id: 'sample_6',
    name: 'Evening Reading',
    description: 'Read for personal growth',
    category: 'study',
    priority: 'low',
    startTime: 1260, // 9:00 PM
    endTime: 1320,   // 10:00 PM
    recurrence: 'daily',
    completed: false,
  },
];
