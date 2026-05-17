import './App.css';
import AppRouter from './router/AppRouter';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <div className="App">
      <AppRouter />
      <Toaster />
    </div>
  );
}

export default App;
