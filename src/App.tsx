import { Header } from './components/Header';
import { ScheduleViewer } from './components/ScheduleViewer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1a0a2e] to-[#0f0520]">
      <Header />
      <div className="relative pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7c3aed]/10 to-[#7c3aed]/20 pointer-events-none"></div>
        <ScheduleViewer />
      </div>
    </div>
  );
}

export default App;
