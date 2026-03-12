// Generate a unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Format minutes since midnight to HH:MM string
export function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Parse HH:MM string to minutes since midnight
export function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Format minutes to display string like "8:00 AM"
export function formatTimeDisplay(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

// Get duration string
export function formatDuration(startMin, endMin) {
  const diff = endMin - startMin;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Get date string YYYY-MM-DD
export function getDateKey(date) {
  const d = new Date(date);
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

// Get start of week (Monday)
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Get array of 7 days starting from a date
export function getWeekDays(startDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

// Check if two dates are the same day
export function isSameDay(d1, d2) {
  return getDateKey(d1) === getDateKey(d2);
}

// Check if date is today
export function isToday(date) {
  return isSameDay(date, new Date());
}

// Get tasks for a specific date, including expanded recurring tasks
export function getTasksForDate(tasks, date) {
  const dateKey = getDateKey(date);
  const dayOfWeek = new Date(date).getDay(); // 0=Sun, 1=Mon, ...

  return tasks.filter(task => {
    // One-time task for this date
    if (!task.recurrence || task.recurrence === 'none') {
      return task.date === dateKey;
    }

    // Check if the task's start date is on or before this date
    const taskStart = new Date(task.date);
    const targetDate = new Date(dateKey);
    if (targetDate < taskStart) return false;

    // Recurring task
    switch (task.recurrence) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekends':
        return dayOfWeek === 0 || dayOfWeek === 6;
      case 'weekly':
        return new Date(task.date).getDay() === dayOfWeek;
      case 'custom':
        return task.recurrenceDays && task.recurrenceDays.includes(dayOfWeek);
      default:
        return task.date === dateKey;
    }
  }).map(task => ({
    ...task,
    _displayDate: dateKey,
    _isRecurring: task.recurrence && task.recurrence !== 'none'
  })).sort((a, b) => a.startTime - b.startTime);
}

// Check if a time segment is occupied
export function isSegmentOccupied(tasks, date, startTime, endTime, excludeTaskId) {
  const dayTasks = getTasksForDate(tasks, date).filter(t => t.id !== excludeTaskId);
  return dayTasks.some(task =>
    (startTime < task.endTime && endTime > task.startTime)
  );
}

// Get the current time in minutes since midnight
export function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Generate time slots based on granularity
export function generateTimeSlots(dayStart, dayEnd, granularity) {
  const slots = [];
  for (let t = dayStart; t < dayEnd; t += granularity) {
    slots.push({
      start: t,
      end: Math.min(t + granularity, dayEnd),
      label: formatTimeDisplay(t)
    });
  }
  return slots;
}

// Day names
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Category definitions
export const CATEGORIES = [
  { id: 'work', name: 'Work', color: '#3B82F6', icon: '💼' },
  { id: 'personal', name: 'Personal', color: '#A855F7', icon: '👤' },
  { id: 'health', name: 'Health', color: '#2DD4BF', icon: '💚' },
  { id: 'meal', name: 'Meal', color: '#F4A835', icon: '🍽️' },
  { id: 'exercise', name: 'Exercise', color: '#FF6B6B', icon: '🏃' },
  { id: 'study', name: 'Study', color: '#6366F1', icon: '📚' },
  { id: 'social', name: 'Social', color: '#EC4899', icon: '👥' },
  { id: 'rest', name: 'Rest', color: '#8B5CF6', icon: '😴' },
  { id: 'errands', name: 'Errands', color: '#F97316', icon: '🛒' },
  { id: 'creative', name: 'Creative', color: '#14B8A6', icon: '🎨' },
];

// Priority definitions
export const PRIORITIES = [
  { id: 'low', name: 'Low', color: '#2DD4BF' },
  { id: 'medium', name: 'Medium', color: '#F4A835' },
  { id: 'high', name: 'High', color: '#FF6B6B' },
];
