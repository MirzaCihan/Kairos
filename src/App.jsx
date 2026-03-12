import { useState, useCallback } from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import AnimatedBackground from './components/AnimatedBackground';
import Sidebar from './components/Sidebar';
import TaskModal from './components/TaskModal';
import DailyListView from './views/DailyListView';
import WeeklyCalendarView from './views/WeeklyCalendarView';
import DayTimelineView from './views/DayTimelineView';
import SettingsView from './views/SettingsView';
import { DAY_NAMES_SHORT, MONTH_NAMES_SHORT, getDateKey } from './utils/taskUtils';
import './App.css';

function AppContent() {
  const { isFirstRun, clearFirstRun, settings } = useTaskContext();
  const [currentView, setCurrentView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [prefillStartTime, setPrefillStartTime] = useState(null);

  const handleAddTask = useCallback((startTime) => {
    setEditingTask(null);
    setPrefillStartTime(startTime || null);
    setModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingTask(null);
    setPrefillStartTime(null);
  }, []);

  // Date navigation
  const navigateDate = (dir) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d);
  };

  const goToToday = () => setSelectedDate(new Date());

  // Format header date
  const formatHeaderDate = () => {
    const d = new Date(selectedDate);
    return `${DAY_NAMES_SHORT[d.getDay()]}, ${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}`;
  };

  const viewButtons = [
    { id: 'daily', label: '📋 List' },
    { id: 'weekly', label: '📅 Week' },
    { id: 'timeline', label: '⏱️ Timeline' },
  ];

  return (
    <>
      <AnimatedBackground />

      {/* Onboarding */}
      {isFirstRun && (
        <div className="app__onboarding-overlay">
          <div className="app__onboarding">
            <img src="/logo.png" alt="Kairos" className="app__onboarding-logo" />
            <h1>Welcome to Kairos</h1>
            <p>Your day, structured to perfection. Kairos helps you divide every moment into purposeful segments — from morning routines to deep work and everything in between.</p>

            <div className="app__onboarding-features">
              <div className="app__onboarding-feature">
                <span className="app__onboarding-feature-icon">📋</span>
                <span className="app__onboarding-feature-text">Divide your day into exact time segments for every task</span>
              </div>
              <div className="app__onboarding-feature">
                <span className="app__onboarding-feature-icon">🔄</span>
                <span className="app__onboarding-feature-text">Set recurring tasks for daily routines that repeat automatically</span>
              </div>
              <div className="app__onboarding-feature">
                <span className="app__onboarding-feature-icon">📅</span>
                <span className="app__onboarding-feature-text">View your schedule as a list, weekly calendar, or timeline</span>
              </div>
              <div className="app__onboarding-feature">
                <span className="app__onboarding-feature-icon">⏱️</span>
                <span className="app__onboarding-feature-text">Configure segment granularity: 15, 30, or 60-minute blocks</span>
              </div>
            </div>

            <button className="btn-primary" onClick={clearFirstRun} style={{ fontSize: 'var(--text-base)', padding: 'var(--space-md) var(--space-2xl)' }}>
              <span>Get Started</span>
            </button>
          </div>
        </div>
      )}

      <div className="app">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAddTask={() => handleAddTask()}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="app__main">
          {/* Header */}
          <header className="app__header">
            <div className="app__header-left">
              <button className="app__menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                ☰
              </button>

              {currentView !== 'settings' && (
                <div className="app__date-nav">
                  <button className="app__date-nav-btn" onClick={() => navigateDate(-1)}>◀</button>
                  <button className="app__date-today-btn" onClick={goToToday}>Today</button>
                  <span className="app__date-display">{formatHeaderDate()}</span>
                  <button className="app__date-nav-btn" onClick={() => navigateDate(1)}>▶</button>
                </div>
              )}
            </div>

            {currentView !== 'settings' && (
              <div className="app__view-switcher">
                {viewButtons.map(vb => (
                  <button
                    key={vb.id}
                    className={`app__view-btn ${currentView === vb.id ? 'app__view-btn--active' : ''}`}
                    onClick={() => setCurrentView(vb.id)}
                  >
                    {vb.label}
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="app__content">
            {currentView === 'daily' && (
              <DailyListView
                selectedDate={selectedDate}
                onEditTask={handleEditTask}
                onAddTask={() => handleAddTask()}
              />
            )}

            {currentView === 'weekly' && (
              <WeeklyCalendarView
                selectedDate={selectedDate}
                onEditTask={handleEditTask}
                onAddTask={(startTime) => handleAddTask(startTime)}
                onDateSelect={setSelectedDate}
              />
            )}

            {currentView === 'timeline' && (
              <DayTimelineView
                selectedDate={selectedDate}
                onEditTask={handleEditTask}
                onAddTask={(startTime) => handleAddTask(startTime)}
              />
            )}

            {currentView === 'settings' && <SettingsView />}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editTask={editingTask}
        selectedDate={selectedDate}
      />
    </>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
