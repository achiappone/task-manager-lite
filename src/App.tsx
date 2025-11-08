import Board from "./components/Board";
import "./styles.css";
import { ErrorBoundary } from "./ErrorBoundary";
import { useCloudBackupLifecycle } from "./hooks/useCloudBackup";

export default function App() {
  useCloudBackupLifecycle();

  return (
    <div className="container">
      <header className="header">
        <h1>Task Manager</h1>
        <p>Simple Kanban with drag-and-drop and local save.</p>
      </header>
      <ErrorBoundary>
        <Board />
      </ErrorBoundary>
      <footer className="footer">
        <small>Built with React, TypeScript, Zustand, and dnd-kit.</small>
      </footer>
    </div>
  );
}
