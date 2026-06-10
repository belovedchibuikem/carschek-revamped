'use client';

import React, { useRef, useState } from 'react';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

type Props = {
  /** Object URL of an existing note, if any. */
  existingUrl: string | null;
  durationSec?: number;
  onSave: (blob: Blob, durationSec: number) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
};

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Compact record / play / delete control for a damage-entry voice note. */
export function VoiceNoteRecorder({ existingUrl, durationSec, onSave, onDelete }: Props) {
  const { state, elapsedSec, start, stop } = useVoiceRecorder();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  if (state === 'unsupported') return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  };

  if (state === 'recording') {
    return (
      <button
        type="button"
        onClick={async () => {
          const result = await stop();
          if (result) {
            await onSave(result.blob, result.durationSec);
            toast.success('Voice note saved');
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#C0392B] px-2.5 py-1 text-[10px] font-bold text-white animate-pulse"
      >
        <Square size={10} fill="currentColor" /> Stop · {fmt(elapsedSec)}
      </button>
    );
  }

  if (existingUrl) {
    return (
      <span className="inline-flex items-center gap-1">
        <audio ref={audioRef} src={existingUrl} onEnded={() => setPlaying(false)} className="hidden" />
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1A7A4A]/10 px-2.5 py-1 text-[10px] font-bold text-[#1A7A4A] hover:bg-[#1A7A4A]/20 transition-colors"
        >
          {playing ? <Pause size={10} /> : <Play size={10} />}
          Voice note{durationSec ? ` · ${fmt(durationSec)}` : ''}
        </button>
        <button
          type="button"
          onClick={async () => {
            audioRef.current?.pause();
            setPlaying(false);
            await onDelete();
            toast.message('Voice note removed');
          }}
          aria-label="Delete voice note"
          className="rounded-full p-1 text-[#9CA3AF] hover:bg-red-50 hover:text-[#C0392B] transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await start();
        if (!ok) toast.error('Microphone unavailable');
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-2.5 py-1 text-[10px] font-bold text-[#6B7280] hover:border-[#ff8a65] hover:text-[#ff5722] transition-colors"
    >
      <Mic size={10} /> Voice note
    </button>
  );
}
