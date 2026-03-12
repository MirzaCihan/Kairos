import { useState } from 'react';
import MiniCalendar from './MiniCalendar';
import './Sidebar.css';

export default function Sidebar({
  currentView,
  onViewChange,
  selectedDate,
  onDateChange,
  onAddTask,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) {
  const navItems = [
    { id: 'daily', label: 'Today', icon: '📋' },
    { id: 'weekly', label: 'This Week', icon: '📅' },
    { id: 'timeline', label: 'Timeline', icon: '⏱️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {mobileOpen && (
        <div 
          className={`sidebar-overlay ${mobileOpen ? 'sidebar-overlay--visible' : ''}`}
          onClick={onCloseMobile}
        />
      )}
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          <img src="/logo.png" alt="Kairos" className="sidebar__logo-icon" />
          <div>
            <div className="sidebar__logo-text">Kairos</div>
            <div className="sidebar__logo-tagline">Master Your Day</div>
          </div>
        </div>

        {/* Quick Add */}
        <button className="sidebar__quick-add" onClick={onAddTask}>
          <span className="sidebar__quick-add-icon">+</span>
          <span>New Task</span>
        </button>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <div className="sidebar__nav-label">Views</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar__nav-item ${currentView === item.id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                onViewChange(item.id);
                onCloseMobile?.();
              }}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Mini Calendar */}
        <div className="sidebar__calendar-section">
          <MiniCalendar
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              onDateChange(date);
              onCloseMobile?.();
            }}
          />
        </div>

        {/* Collapse Toggle */}
        <button className="sidebar__toggle" onClick={onToggleCollapse}>
          <span>{collapsed ? '▶' : '◀'}</span>
        </button>
      </aside>
    </>
  );
}
