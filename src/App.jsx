import { useState, useCallback, useEffect } from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './views/auth/LoginView';
import RegisterView from './views/auth/RegisterView';
import ForgotPasswordView from './views/auth/ForgotPasswordView';
import ResetPasswordView from './views/auth/ResetPasswordView';
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
  const { signOut } = useAuth();
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

      {/* Floating Logout Button */}
      <button
        className="app__logout-fab"
        onClick={() => signOut()}
        title="Log out"
      >
        <span>🚪</span>
        <span>Log out</span>
      </button>
    </>
  );
}

function AuthRouter() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login');

  // Detect password reset URL hash
  useEffect(() => {
    if (window.location.hash.includes('reset-password')) {
      setAuthView('reset-password');
    }
  }, []);

  // Still checking session
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        background: '#0a0a1a',
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
    );
  }

  // Authenticated → show the app
  if (user) {
    // If the user navigated to reset-password while logged in
    if (authView === 'reset-password') {
      return (
        <ResetPasswordView onNavigate={(view) => {
          if (view === 'app') setAuthView('app');
          else setAuthView(view);
        }} />
      );
    }

    return (
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    );
  }

  // Not authenticated → show auth views
  switch (authView) {
    case 'register':
      return <RegisterView onNavigate={setAuthView} />;
    case 'forgot-password':
      return <ForgotPasswordView onNavigate={setAuthView} />;
    case 'reset-password':
      return <ResetPasswordView onNavigate={setAuthView} />;
    case 'login':
    default:
      return <LoginView onNavigate={setAuthView} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  );
}
