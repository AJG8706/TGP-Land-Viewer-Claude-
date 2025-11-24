import { MenuPanel } from './components/MenuPanel';
import { ViewerPanel } from './components/ViewerPanel';

function App() {
  return (
    <div className="flex h-screen w-screen bg-gray-900 overflow-hidden">
      {/* Menu Panel - 30% */}
      <div className="w-[30%] h-full border-r border-gray-700">
        <MenuPanel />
      </div>

      {/* Viewer Panel - 70% */}
      <div className="w-[70%] h-full">
        <ViewerPanel />
      </div>
    </div>
  );
}

export default App;
