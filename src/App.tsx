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
        <p>Simple Kanban with drag-and-drop and local save. Local Storage 
           gets backed up to the Cloud server</p>
      </header>
      <ErrorBoundary>
        <Board />
      </ErrorBoundary>
      <footer className="footer">
        <small>Built with React, TypeScript, Zustand, and dnd-kit.
          Backed up to cloud server. PostgreSQL database. Runs on 
          privately built and hosted infrastructure. Database communication 
          protected through docker container via API.
        </small>
      </footer>
    </div>
  );
}
