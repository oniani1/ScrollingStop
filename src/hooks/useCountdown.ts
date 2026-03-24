import { useState, useEffect, useRef, useCallback } from 'react';

export function useCountdown(totalSeconds: number, autoStart: boolean = false) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setRemaining(totalSeconds);
    setIsRunning(true);
  }, [totalSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    stop();
    setRemaining(totalSeconds);
  }, [stop, totalSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return { remaining, minutes, seconds, formatted, progress, isRunning, isComplete: remaining === 0, start, stop, reset };
}
