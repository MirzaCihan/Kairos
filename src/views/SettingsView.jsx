import { useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { DAY_TEMPLATES } from '../data/defaultSegments';
import { exportData, importData } from '../utils/storage';
import './SettingsView.css';

export default function SettingsView() {
  const { settings, updateSettings, dispatch } = useTaskContext();
  const fileInputRef = useRef(null);

  const handleTemplateChange = (templateKey) => {
    const template = DAY_TEMPLATES[templateKey];
    updateSettings({
      template: templateKey,
      dayStart: template.dayStart,
      dayEnd: template.dayEnd,
      granularity: template.granularity,
    });
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kairos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importData(data);
        dispatch({ type: 'IMPORT_DATA', payload: data });
        alert('Data imported successfully! Refresh the page to see changes.');
      } catch {
        alert('Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL tasks and data? This cannot be undone.')) {
      dispatch({ type: 'IMPORT_DATA', payload: { tasks: [], completions: {} } });
    }
  };

  return (
    <div className="settings-view">
      <div className="settings-view__header">
        <h1 className="settings-view__title">Settings</h1>
      </div>

      {/* Day Templates */}
      <div className="settings-view__section">
        <h2 className="settings-view__section-title">Day Templates</h2>
        <p className="settings-view__description" style={{ marginBottom: 'var(--space-md)' }}>
          Choose how your day is divided into time segments.
        </p>
        <div className="settings-view__templates">
          {Object.entries(DAY_TEMPLATES).map(([key, template]) => (
            <div
              key={key}
              className={`settings-view__template ${settings.template === key ? 'settings-view__template--active' : ''}`}
              onClick={() => handleTemplateChange(key)}
            >
              <div className="settings-view__template-name">{template.name}</div>
              <div className="settings-view__template-desc">{template.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Settings */}
      <div className="settings-view__section">
        <h2 className="settings-view__section-title">Custom Segment Settings</h2>

        <div className="settings-view__group">
          <label className="settings-view__label">Segment Length (minutes)</label>
          <select
            value={settings.granularity}
            onChange={e => updateSettings({ granularity: Number(e.target.value) })}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <div className="settings-view__group" style={{ flex: 1 }}>
            <label className="settings-view__label">Day Starts At</label>
            <select
              value={settings.dayStart}
              onChange={e => updateSettings({ dayStart: Number(e.target.value) })}
            >
              {Array.from({ length: 24 }, (_, i) => i * 60).map(mins => (
                <option key={mins} value={mins}>
                  {`${Math.floor(mins / 60).toString().padStart(2, '0')}:00`}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-view__group" style={{ flex: 1 }}>
            <label className="settings-view__label">Day Ends At</label>
            <select
              value={settings.dayEnd}
              onChange={e => updateSettings({ dayEnd: Number(e.target.value) })}
            >
              {Array.from({ length: 24 }, (_, i) => (i + 1) * 60).map(mins => (
                <option key={mins} value={mins}>
                  {`${Math.floor(mins / 60).toString().padStart(2, '0')}:00`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-view__section">
        <h2 className="settings-view__section-title">Data Management</h2>
        <div className="settings-view__data-actions">
          <button className="btn-secondary" onClick={handleExport}>
            📥 Export Data
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            📤 Import Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-view__danger">
        <div className="settings-view__danger-title">⚠️ Danger Zone</div>
        <div className="settings-view__danger-actions">
          <button className="settings-view__danger-btn" onClick={handleClearAll}>
            🗑️ Delete All Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
