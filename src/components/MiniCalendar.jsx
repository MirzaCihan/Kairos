import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { getDateKey, isSameDay, isToday, getTasksForDate, MONTH_NAMES, DAY_NAMES_SHORT } from '../utils/taskUtils';
import './MiniCalendar.css';

export default function MiniCalendar({ selectedDate, onDateSelect }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const { tasks } = useTaskContext();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get calendar grid days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
  const totalDays = lastDay.getDate();

  const days = [];

  // Previous month days
  const prevLastDay = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevLastDay - i), otherMonth: true });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    days.push({ date: new Date(year, month, d), otherMonth: false });
  }

  // Next month days to fill grid
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), otherMonth: true });
  }

  const navigateMonth = (dir) => {
    setViewDate(new Date(year, month + dir, 1));
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar__header">
        <span className="mini-calendar__month">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="mini-calendar__nav">
          <button className="mini-calendar__nav-btn" onClick={() => navigateMonth(-1)}>◀</button>
          <button className="mini-calendar__nav-btn" onClick={() => navigateMonth(1)}>▶</button>
        </div>
      </div>

      <div className="mini-calendar__grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={`label-${i}`} className="mini-calendar__day-label">{d}</div>
        ))}

        {days.map(({ date, otherMonth }, i) => {
          const dayTasks = getTasksForDate(tasks, date);
          const isSelected = isSameDay(date, selectedDate);
          const today = isToday(date);

          let classNames = 'mini-calendar__day';
          if (otherMonth) classNames += ' mini-calendar__day--other-month';
          if (today) classNames += ' mini-calendar__day--today';
          if (isSelected) classNames += ' mini-calendar__day--selected';
          if (dayTasks.length > 0) classNames += ' mini-calendar__day--has-tasks';

          return (
            <button
              key={i}
              className={classNames}
              onClick={() => onDateSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
