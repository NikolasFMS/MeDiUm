import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

registerSW({
  immediate: true,
  onNeedReload() {
    try {
      const saved = localStorage.getItem('medium_mansion_game_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.phase !== 'gameover') {
          return;
        }
      }
    } catch {}
    window.location.reload();
  },
});

createRoot(document.getElementById('root')!).render(<App />);
