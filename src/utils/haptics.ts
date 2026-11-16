const HAPTICS_STORAGE_KEY = 'medium_mansion_haptics_v1';

class HapticManager {
  private enabled: boolean;

  constructor() {
    this.enabled = true;
    try {
      const saved = localStorage.getItem(HAPTICS_STORAGE_KEY);
      if (saved === 'false') {
        this.enabled = false;
      }
    } catch {}
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem(HAPTICS_STORAGE_KEY, String(this.enabled));
    } catch {}
    if (this.enabled) {
      this.tap();
    }
    return this.enabled;
  }

  private vibrate(pattern: number | number[]) {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch {}
  }

  public tap() {
    this.vibrate(10);
  }

  public select() {
    this.vibrate(15);
  }

  public unlock() {
    this.vibrate([15, 30, 22]);
  }

  public success() {
    this.vibrate([20, 45, 40]);
  }

  public error() {
    this.vibrate([45, 35, 65]);
  }

  public timerEnd() {
    this.vibrate([40, 60, 40, 60, 70]);
  }
}

export const haptics = new HapticManager();
