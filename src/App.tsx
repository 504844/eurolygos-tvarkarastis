import { ScheduleViewer } from './components/ScheduleViewer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <ScheduleViewer />
      </div>
    </div>
  );
}

export default App;
