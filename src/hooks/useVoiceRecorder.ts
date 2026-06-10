'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceRecorderState = 'idle' | 'recording' | 'unsupported';

/**
 * Minimal MediaRecorder wrapper for short voice notes.
 * start() asks for mic permission; stop() resolves with the recorded blob.
 */
export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined')) {
      setState('unsupported');
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    if (state === 'recording') return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setElapsedSec(0);
      timerRef.current = window.setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 500);
      setState('recording');
      return true;
    } catch {
      setState('unsupported');
      return false;
    }
  }, [state]);

  const stop = useCallback((): Promise<{ blob: Blob; durationSec: number } | null> => {
    return new Promise(resolve => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }
      const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach(t => t.stop());
        recorderRef.current = null;
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setState('idle');
        setElapsedSec(0);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        resolve(blob.size > 0 ? { blob, durationSec } : null);
      };
      recorder.stop();
    });
  }, []);

  return { state, elapsedSec, start, stop };
}
