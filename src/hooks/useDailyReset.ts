import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import dayjs from 'dayjs';
import { useAppStore } from '../stores';
import { appBlocker } from '../services/blockingManager';

export function useDailyReset() {
  const lastResetDate = useRef(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    const checkReset = () => {
      const today = dayjs().format('YYYY-MM-DD');
      if (today !== lastResetDate.current) {
        lastResetDate.current = today;
        useAppStore.getState().resetDaily();
        appBlocker.setUnlockedToday(false).catch(() => {});
      }
    };

    // Check on app state change (resume from background)
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkReset();
      }
    });

    // Also check periodically
    const interval = setInterval(checkReset, 60000); // every minute

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);
}
