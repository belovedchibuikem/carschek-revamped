'use client';
import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Camera, X, Mic, Check, Edit, AlertTriangle, Play, RotateCcw, Zap, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type CameraStep = 'idle' | 'capture' | 'analyzing' | 'results';
type VoiceStep = 'ready' | 'recording' | 'transcribing' | 'result' | 'error';
type DemoStep = 'idle' | 'camera' | 'analyzing' | 'ai-result' | 'voice-ready' | 'voice-recording' | 'voice-transcribing' | 'voice-result' | 'submitted';

// ─── AI Defect Detection Component ───────────────────────────────────────────
function AIDefectDetection() {
  const [step, setStep] = useState<CameraStep>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLabel, setAnalysisLabel] = useState('Detecting defects...');

  const startCapture = () => setStep('capture');

  const capturePhoto = () => {
    setStep('analyzing');
    setAnalysisProgress(0);
    setAnalysisLabel('Detecting defects...');

    const steps = [
      { delay: 600, progress: 35, label: 'Detecting defects...' },
      { delay: 1400, progress: 70, label: 'Classifying severity...' },
      { delay: 2200, progress: 100, label: 'Done' },
    ];

    steps.forEach(s => {
      setTimeout(() => {
        setAnalysisProgress(s.progress);
        setAnalysisLabel(s.label);
      }, s.delay);
    });

    setTimeout(() => setStep('results'), 2800);
  };

  const reset = () => {
    setStep('idle');
    setAnalysisProgress(0);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Feature 1 — AI Defect Detection</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Camera capture → AI analysis → Results with bounding box</p>
          </div>
          {step !== 'idle' && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1F2937] transition-colors">
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Phone Frame */}
      <div className="p-6 flex justify-center">
        <div className="w-72 bg-[#1F2937] rounded-[2.5rem] p-2 shadow-2xl">
          <div className="bg-black rounded-[2rem] overflow-hidden relative" style={{ height: 520 }}>

            {/* Step 0: Idle */}
            {step === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center bg-[#1F2937] p-6 text-center">
                <div className="w-16 h-16 bg-[#2E75B6]/20 rounded-2xl flex items-center justify-center mb-4">
                  <Camera size={32} className="text-[#2E75B6]" />
                </div>
                <p className="text-white font-semibold mb-2">Front Bumper</p>
                <p className="text-white/50 text-xs mb-6">Tap the camera icon to capture and analyse</p>
                <button onClick={startCapture} className="flex items-center gap-2 px-5 py-2.5 bg-[#2E75B6] text-white text-sm font-medium rounded-xl hover:bg-[#1E3A5F] transition-colors">
                  <Camera size={16} />
                  Open Camera
                </button>
              </div>
            )}

            {/* Step 1: Camera Capture */}
            {step === 'capture' && (
              <div className="h-full flex flex-col bg-black relative">
                {/* Cancel */}
                <button onClick={reset} className="absolute top-4 left-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                  <X size={16} className="text-white" />
                </button>

                {/* Camera viewfinder */}
                <div className="flex-1 relative flex items-center justify-center">
                  {/* Simulated camera feed */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center">
                    <div className="text-gray-400 text-xs">Camera Feed</div>
                  </div>
                  {/* Guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-dashed border-white/70 rounded-xl w-52 h-36 flex items-end justify-center pb-2">
                      <span className="text-white text-[10px] bg-black/50 px-2 py-0.5 rounded-full">Position the part within the frame</span>
                    </div>
                  </div>
                </div>

                {/* Capture Button */}
                <div className="flex items-center justify-center py-6 bg-black">
                  <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: AI Analysis */}
            {step === 'analyzing' && (
              <div className="h-full flex flex-col bg-black relative">
                {/* Photo (simulated) */}
                <div className="flex-1 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 relative">
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-[#2E75B6]/30 border-t-[#2E75B6] animate-spin" />
                      <Zap size={20} className="text-[#2E75B6] absolute inset-0 m-auto" />
                    </div>
                    <p className="text-white text-sm font-semibold">Carschek AI is analysing this photo...</p>

                    {/* Progress Steps */}
                    <div className="space-y-2 w-48">
                      {[
                        { label: 'Detecting defects...', threshold: 0 },
                        { label: 'Classifying severity...', threshold: 35 },
                        { label: 'Done', threshold: 70 },
                      ].map((s, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs transition-all ${analysisProgress >= s.threshold ? 'text-white' : 'text-white/30'}`}>
                          {analysisProgress >= s.threshold && analysisProgress >= (i === 2 ? 100 : s.threshold + 1) ? (
                            <CheckCircle size={14} className="text-[#1A7A4A] flex-shrink-0" />
                          ) : analysisProgress >= s.threshold ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#2E75B6] border-t-transparent animate-spin flex-shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 flex-shrink-0" />
                          )}
                          {s.label}
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E75B6] rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: AI Results */}
            {step === 'results' && (
              <div className="h-full flex flex-col bg-black">
                {/* Photo with bounding box */}
                <div className="relative flex-shrink-0" style={{ height: 200 }}>
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800" />
                  {/* Bounding box overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="border-2 border-red-500 rounded-lg w-28 h-16 relative">
                        <div className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                          Possible dent detected
                        </div>
                        {/* Corner markers */}
                        <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-red-400" />
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-red-400" />
                        <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-red-400" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-red-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Card */}
                <div className="flex-1 bg-white overflow-y-auto">
                  <div className="px-4 py-3 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-[#D35400]" />
                      <span className="text-sm font-bold text-[#1F2937]">AI Detected: 1 possible defect</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Detection Label */}
                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <p className="text-xs font-semibold text-[#C0392B] mb-1">Possible dent / body deformation</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-[#6B7280]">87% confidence</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#D35400] rounded-full" style={{ width: '87%' }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#6B7280]">Suggested severity:</span>
                        <span className="text-[10px] font-bold text-[#C0392B] bg-red-100 px-2 py-0.5 rounded-full">Major</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-[#6B7280] italic leading-relaxed">
                      "Minor dent and paint scratch on front bumper, right side approximately 15cm"
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors">
                        <Check size={14} />
                        ✓ Looks Right — Apply
                      </button>
                      <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2E75B6] text-white text-xs font-semibold rounded-xl hover:bg-[#1E3A5F] transition-colors">
                        <Edit size={14} />
                        ✏ Edit Before Applying
                      </button>
                      <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-xs font-medium rounded-xl hover:bg-[#F4F6F8] transition-colors">
                        <X size={14} />
                        ✗ AI is Wrong — Enter Manually
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Voice Note Component ─────────────────────────────────────────────────────
function VoiceNoteInput() {
  const [voiceStep, setVoiceStep] = useState<VoiceStep>('ready');
  const [timer, setTimer] = useState(0);
  const [bars, setBars] = useState([3, 5, 2, 7, 4, 6, 3, 5, 2, 4]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const barIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = () => {
    setVoiceStep('recording');
    setTimer(0);
    intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    barIntervalRef.current = setInterval(() => {
      setBars(Array.from({ length: 10 }, () => Math.floor(Math.random() * 8) + 1));
    }, 150);
  };

  const stopRecording = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (barIntervalRef.current) clearInterval(barIntervalRef.current);
    setVoiceStep('transcribing');
    setTimeout(() => setVoiceStep('result'), 2000);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (barIntervalRef.current) clearInterval(barIntervalRef.current);
    setVoiceStep('ready');
    setTimer(0);
  };

  const formatTime = (s: number) => `0:${s.toString().padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <h2 className="text-base font-bold text-[#1F2937]">Feature 2 — Voice Note Input</h2>
        <p className="text-xs text-[#6B7280] mt-0.5">Hold-to-record, waveform visualiser, and transcription states</p>
      </div>

      <div className="p-6 flex justify-center">
        <div className="w-72 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-6">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Defect Note</p>

          {/* Textarea */}
          <textarea
            className="w-full h-20 px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6] bg-white mb-4"
            placeholder="Describe the defect..."
            value={voiceStep === 'result' ? 'There is a crack on the front bumper approximately 10cm long on the right side' : ''}
            readOnly
          />

          {/* Voice States */}
          <div className="flex flex-col items-center gap-3">

            {/* Ready State */}
            {voiceStep === 'ready' && (
              <>
                <button
                  onMouseDown={startRecording}
                  onTouchStart={startRecording}
                  className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all active:scale-95"
                >
                  <Mic size={24} className="text-[#6B7280]" />
                </button>
                <p className="text-xs text-[#6B7280]">Hold to record</p>
              </>
            )}

            {/* Recording State */}
            {voiceStep === 'recording' && (
              <>
                <button
                  onMouseUp={stopRecording}
                  onTouchEnd={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse shadow-lg shadow-red-200"
                >
                  <Mic size={24} className="text-white" />
                </button>

                {/* Waveform */}
                <div className="flex items-center gap-0.5 h-8">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-red-400 rounded-full transition-all duration-100"
                      style={{ height: `${h * 4}px` }}
                    />
                  ))}
                </div>

                <p className="text-xs font-mono text-red-600 font-semibold">{formatTime(timer)} recording...</p>
                <p className="text-xs text-[#6B7280]">Release to stop</p>
              </>
            )}

            {/* Transcribing State */}
            {voiceStep === 'transcribing' && (
              <>
                <div className="w-16 h-16 rounded-full bg-[#2E75B6]/10 flex items-center justify-center">
                  <RefreshCw size={24} className="text-[#2E75B6] animate-spin" />
                </div>
                <p className="text-xs text-[#2E75B6] font-medium">Transcribing...</p>
              </>
            )}

            {/* Result State */}
            {voiceStep === 'result' && (
              <>
                <div className="w-full bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} className="text-[#1A7A4A]" />
                    <span className="text-xs font-semibold text-[#1A7A4A]">Transcribed with high confidence</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={reset} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border border-[#E5E7EB] rounded-xl hover:bg-[#F4F6F8] transition-colors text-[#374151]">
                    <RotateCcw size={12} />
                    Re-record
                  </button>
                  <button onClick={reset} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs bg-[#1E3A5F] text-white rounded-xl hover:bg-[#2E75B6] transition-colors font-medium">
                    <Check size={12} />
                    Use this
                  </button>
                </div>
              </>
            )}

            {/* Error State */}
            {voiceStep === 'error' && (
              <>
                <div className="w-full bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
                  <p className="text-xs text-amber-700">No speech detected. Try again in a quieter environment.</p>
                </div>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2 text-xs bg-[#1E3A5F] text-white rounded-xl hover:bg-[#2E75B6] transition-colors">
                  <RotateCcw size={12} />
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Combined Demo Flow ───────────────────────────────────────────────────────
function CombinedDemoFlow() {
  const [demoStep, setDemoStep] = useState<DemoStep>('idle');
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [waveBars, setWaveBars] = useState([3, 5, 2, 7, 4, 6, 3, 5, 2, 4]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDemo = () => {
    setDemoStep('camera');
  };

  const captureInDemo = () => {
    setDemoStep('analyzing');
    setAnalysisProgress(0);
    setTimeout(() => setAnalysisProgress(35), 600);
    setTimeout(() => setAnalysisProgress(70), 1400);
    setTimeout(() => setAnalysisProgress(100), 2200);
    setTimeout(() => setDemoStep('ai-result'), 2800);
  };

  const applyAI = () => {
    setDemoStep('voice-ready');
  };

  const startVoice = () => {
    setDemoStep('voice-recording');
    setVoiceTimer(0);
    timerRef.current = setInterval(() => setVoiceTimer(t => t + 1), 1000);
    waveRef.current = setInterval(() => {
      setWaveBars(Array.from({ length: 10 }, () => Math.floor(Math.random() * 8) + 1));
    }, 150);
    setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveRef.current) clearInterval(waveRef.current);
      setDemoStep('voice-transcribing');
      setTimeout(() => setDemoStep('voice-result'), 2000);
    }, 4000);
  };

  const submitDefect = () => {
    setDemoStep('submitted');
  };

  const resetDemo = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (waveRef.current) clearInterval(waveRef.current);
    setDemoStep('idle');
    setVoiceTimer(0);
    setAnalysisProgress(0);
  };

  const STEPS = [
    { key: 'camera', label: 'Capture Photo' },
    { key: 'analyzing', label: 'AI Analysis' },
    { key: 'ai-result', label: 'AI Results' },
    { key: 'voice-ready', label: 'Voice Note' },
    { key: 'voice-result', label: 'Transcribed' },
    { key: 'submitted', label: 'Submitted' },
  ];

  const currentStepIdx = STEPS.findIndex(s => demoStep.startsWith(s.key.split('-')[0]) || demoStep === s.key);

  return (
    <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E75B6] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Combined Demo Flow</h2>
            <p className="text-xs text-white/60 mt-0.5">Complete inspector flow: Photo → AI Detection → Voice Note → Submit</p>
          </div>
          {demoStep !== 'idle' && (
            <button onClick={resetDemo} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>

        {/* Progress Steps */}
        {demoStep !== 'idle' && (
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const isActive = demoStep.includes(s.key) || (s.key === 'camera' && demoStep === 'camera');
              const isDone = currentStepIdx > i;
              return (
                <React.Fragment key={s.key}>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                    isDone ? 'bg-white/20 text-white' : isActive ? 'bg-white text-[#1E3A5F]' : 'bg-white/10 text-white/40'
                  }`}>
                    {isDone && <Check size={10} />}
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <ArrowRight size={12} className="text-white/30 flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6 flex justify-center">
        {/* Idle */}
        {demoStep === 'idle' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Play size={36} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Start the Demo</h3>
            <p className="text-white/60 text-sm mb-6 max-w-xs">Watch a complete inspector flow from photo capture to defect submission.</p>
            <button onClick={runDemo} className="px-6 py-3 bg-white text-[#1E3A5F] font-semibold rounded-xl hover:bg-white/90 transition-colors">
              Begin Demo
            </button>
          </div>
        )}

        {/* Phone Frame for demo steps */}
        {demoStep !== 'idle' && (
          <div className="w-72 bg-[#1F2937] rounded-[2.5rem] p-2 shadow-2xl">
            <div className="bg-black rounded-[2rem] overflow-hidden" style={{ height: 520 }}>

              {/* Camera */}
              {demoStep === 'camera' && (
                <div className="h-full flex flex-col bg-black">
                  <button onClick={resetDemo} className="absolute top-4 left-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                    <X size={16} className="text-white" />
                  </button>
                  <div className="flex-1 relative bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center">
                    <div className="border-2 border-dashed border-white/70 rounded-xl w-52 h-36 flex items-end justify-center pb-2">
                      <span className="text-white text-[10px] bg-black/50 px-2 py-0.5 rounded-full">Position the part within the frame</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-6 bg-black">
                    <button onClick={captureInDemo} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* Analyzing */}
              {demoStep === 'analyzing' && (
                <div className="h-full flex flex-col bg-black">
                  <div className="flex-1 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 relative">
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-[#2E75B6]/30 border-t-[#2E75B6] animate-spin" />
                        <Zap size={20} className="text-[#2E75B6] absolute inset-0 m-auto" />
                      </div>
                      <p className="text-white text-sm font-semibold text-center px-4">Carschek AI is analysing this photo...</p>
                      <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2E75B6] rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }} />
                      </div>
                      <p className="text-white/60 text-xs">
                        {analysisProgress < 35 ? 'Detecting defects...' : analysisProgress < 70 ? 'Classifying severity...' : 'Done ✓'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Result */}
              {demoStep === 'ai-result' && (
                <div className="h-full flex flex-col bg-black">
                  <div className="relative flex-shrink-0" style={{ height: 180 }}>
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-red-500 rounded-lg w-28 h-16 relative">
                        <div className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">AI: Crack detected</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white overflow-y-auto">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-[#D35400]" />
                        <span className="text-xs font-bold text-[#1F2937]">AI Detected: 1 possible defect</span>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                        <p className="text-[10px] font-semibold text-[#C0392B]">Possible crack / surface damage</p>
                        <p className="text-[10px] text-[#6B7280] mt-1">87% confidence · Suggested: Major</p>
                      </div>
                      <p className="text-[10px] text-[#6B7280] italic">"Crack on front bumper, right side ~10cm"</p>
                      <button onClick={applyAI} className="w-full py-2.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors">
                        ✓ Looks Right — Apply & Add Voice Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Ready */}
              {demoStep === 'voice-ready' && (
                <div className="h-full bg-white flex flex-col p-5">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Add Voice Note</p>
                  <div className="bg-[#F9FAFB] rounded-xl p-3 mb-4 border border-[#E5E7EB]">
                    <p className="text-xs text-[#374151] italic">"Crack on front bumper, right side ~10cm"</p>
                    <p className="text-[10px] text-[#6B7280] mt-1">AI pre-filled · tap mic to add more detail</p>
                  </div>
                  <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                    <button onClick={startVoice} className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all">
                      <Mic size={24} className="text-[#6B7280]" />
                    </button>
                    <p className="text-xs text-[#6B7280]">Hold to record voice note</p>
                  </div>
                </div>
              )}

              {/* Voice Recording */}
              {demoStep === 'voice-recording' && (
                <div className="h-full bg-white flex flex-col items-center justify-center p-5 gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse shadow-lg shadow-red-200">
                    <Mic size={24} className="text-white" />
                  </div>
                  <div className="flex items-center gap-0.5 h-8">
                    {waveBars.map((h, i) => (
                      <div key={i} className="w-1.5 bg-red-400 rounded-full transition-all duration-100" style={{ height: `${h * 4}px` }} />
                    ))}
                  </div>
                  <p className="text-xs font-mono text-red-600 font-semibold">0:{voiceTimer.toString().padStart(2, '0')} recording...</p>
                  <p className="text-xs text-[#6B7280]">Auto-stops in {Math.max(0, 4 - voiceTimer)}s</p>
                </div>
              )}

              {/* Voice Transcribing */}
              {demoStep === 'voice-transcribing' && (
                <div className="h-full bg-white flex flex-col items-center justify-center p-5 gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#2E75B6]/10 flex items-center justify-center">
                    <RefreshCw size={24} className="text-[#2E75B6] animate-spin" />
                  </div>
                  <p className="text-sm text-[#2E75B6] font-medium">Transcribing...</p>
                </div>
              )}

              {/* Voice Result */}
              {demoStep === 'voice-result' && (
                <div className="h-full bg-white flex flex-col p-5">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Defect Note</p>
                  <div className="bg-[#F9FAFB] rounded-xl p-3 mb-3 border border-[#E5E7EB] flex-1">
                    <p className="text-xs text-[#1F2937] leading-relaxed">There is a crack on the front bumper approximately 10cm long on the right side</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2.5 border border-green-100 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-[#1A7A4A]" />
                      <span className="text-[10px] font-semibold text-[#1A7A4A]">Transcribed with high confidence</span>
                    </div>
                  </div>
                  <button onClick={submitDefect} className="w-full py-3 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#2E75B6] transition-colors">
                    Submit Defect
                  </button>
                </div>
              )}

              {/* Submitted */}
              {demoStep === 'submitted' && (
                <div className="h-full bg-white flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={40} className="text-[#1A7A4A]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1F2937] mb-2">Defect Submitted!</h3>
                  <p className="text-xs text-[#6B7280] mb-6">AI detection + voice note saved to inspection report.</p>
                  <button onClick={resetDemo} className="px-5 py-2.5 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#2E75B6] transition-colors">
                    Run Demo Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIInspectorToolsPage() {
  return (
    <AppLayout currentPath="/ai-inspector-tools">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">AI Inspector Tools</h1>
        <p className="text-sm text-[#6B7280] mt-1">Section 19 — AI Defect Detection (Claude Vision) + Voice Notes (Web Speech API)</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <AIDefectDetection />
        <VoiceNoteInput />
      </div>

      <CombinedDemoFlow />
    </AppLayout>
  );
}
