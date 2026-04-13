'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Wifi, WifiOff, RefreshCw, X, ChevronDown, ChevronUp, HardDrive, Info, AlertTriangle, Download, Smartphone, ClipboardList, Camera, Zap, Shield } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastStep = 'back-online' | 'syncing' | 'synced' | 'failed' | null;
type NetworkState = 'online' | 'offline';

// ─── Sync Queue Mock Data ─────────────────────────────────────────────────────
const SYNC_QUEUE = [
  { id: 'INS-1234', label: 'Inspection #1234 — Emeka Toyota Camry', items: 47, photos: 3, timestamp: '14 min ago' },
  { id: 'INS-1235', label: 'Inspection #1235 — Adaeze Honda Accord', items: 32, photos: 5, timestamp: '28 min ago' },
];

// ─── Component 1: Network Status Indicator ────────────────────────────────────
function NetworkStatusIndicator({ networkState, onToggle }: { networkState: NetworkState; onToggle: () => void }) {
  const isOnline = networkState === 'online';
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
        isOnline ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 animate-pulse'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
      {isOnline ? 'Online' : 'Offline — Saving locally'}
    </button>
  );
}

// ─── Component 2: Offline Banner ──────────────────────────────────────────────
function OfflineBanner({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  if (!visible) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <WifiOff size={16} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">You're offline.</span> All changes are being saved to your device. They'll sync automatically when you reconnect.
        </p>
      </div>
      <button onClick={onDismiss} className="p-1 hover:bg-amber-100 rounded-lg transition-colors flex-shrink-0">
        <X size={16} className="text-amber-600" />
      </button>
    </div>
  );
}

// ─── Component 2: Sync Status Panel ──────────────────────────────────────────
function SyncStatusPanel({ networkState, onClose }: { networkState: NetworkState; onClose: () => void }) {
  const [explainerOpen, setExplainerOpen] = useState(false);
  const isOnline = networkState === 'online';
  const storageUsed = 23;
  const storageTotal = 100;

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-sm overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 flex items-center justify-between ${isOnline ? 'bg-green-50 border-b border-green-100' : 'bg-amber-50 border-b border-amber-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-100' : 'bg-amber-100'}`}>
            {isOnline ? <Wifi size={20} className="text-green-600" /> : <WifiOff size={20} className="text-amber-600" />}
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isOnline ? 'text-green-800' : 'text-amber-800'}`}>
              {isOnline ? 'Connected' : 'Offline Mode Active'}
            </h3>
            <p className="text-xs text-[#6B7280]">{SYNC_QUEUE.length} items pending sync</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
          <X size={16} className="text-[#6B7280]" />
        </button>
      </div>

      {/* Sync Queue */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Pending Sync</p>
        <div className="space-y-3">
          {SYNC_QUEUE.map(item => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
              <div className="w-8 h-8 bg-[#1E3A5F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardList size={16} className="text-[#1E3A5F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1F2937] truncate">{item.label}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-[#6B7280]">{item.items} items saved</span>
                  <span className="text-[10px] text-[#6B7280]">·</span>
                  <span className="text-[10px] text-[#6B7280] flex items-center gap-1"><Camera size={10} />{item.photos} photos</span>
                </div>
              </div>
              <span className="text-[10px] text-[#6B7280] flex-shrink-0">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <HardDrive size={13} className="text-[#6B7280]" />
            <span className="text-xs text-[#6B7280]">Local Storage</span>
          </div>
          <span className="text-xs font-medium text-[#374151]">{storageUsed}MB / {storageTotal}MB</span>
        </div>
        <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E75B6] rounded-full transition-all"
            style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
          />
        </div>
      </div>

      {/* Explainer */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setExplainerOpen(!explainerOpen)}
          className="w-full flex items-center justify-between text-xs text-[#2E75B6] font-medium py-2 hover:text-[#1E3A5F] transition-colors"
        >
          <span className="flex items-center gap-1.5"><Info size={13} />What happens when I reconnect?</span>
          {explainerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {explainerOpen && (
          <div className="bg-blue-50 rounded-xl p-3 mt-1">
            <p className="text-xs text-[#2E75B6] leading-relaxed">
              Your inspection data will automatically upload. If the same inspection was edited on another device, the most recent version will be kept.
            </p>
          </div>
        )}
      </div>

      {/* Sync Now Button */}
      <div className="px-5 pb-5">
        <button
          disabled={!isOnline}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isOnline
              ? 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <RefreshCw size={15} />
          Sync Now
        </button>
      </div>
    </div>
  );
}

// ─── Component 3: Reconnection Toast ─────────────────────────────────────────
function ReconnectionToastDemo() {
  const [toastStep, setToastStep] = useState<ToastStep>(null);
  const [running, setRunning] = useState(false);

  const runSequence = () => {
    if (running) return;
    setRunning(true);
    setToastStep('back-online');
    setTimeout(() => setToastStep('syncing'), 2000);
    setTimeout(() => setToastStep('synced'), 4500);
    setTimeout(() => { setToastStep(null); setRunning(false); }, 7500);
  };

  const runFailure = () => {
    setToastStep('failed');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h3 className="text-sm font-bold text-[#1F2937] mb-1">Reconnection Toast Sequence</h3>
      <p className="text-xs text-[#6B7280] mb-5">Simulates the 3-step toast flow when network is restored.</p>

      <div className="flex gap-3 mb-6">
        <button onClick={runSequence} disabled={running} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${running ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]'}`}>
          <Wifi size={14} />
          Simulate Reconnect
        </button>
        <button onClick={runFailure} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F4F6F8] transition-all">
          <AlertTriangle size={14} />
          Simulate Failure
        </button>
        <button onClick={() => { setToastStep(null); setRunning(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-all">
          <X size={14} />
          Clear
        </button>
      </div>

      {/* Toast Preview Area */}
      <div className="relative bg-[#F4F6F8] rounded-xl p-6 min-h-[120px] flex items-start justify-end">
        <p className="absolute inset-0 flex items-center justify-center text-xs text-[#6B7280]">Toast appears here (top-right)</p>

        {toastStep === 'back-online' && (
          <div className="relative z-10 flex items-center gap-3 bg-[#1A7A4A] text-white px-4 py-3 rounded-xl shadow-lg animate-slide-in-right">
            <span className="text-base">📶</span>
            <span className="text-sm font-semibold">Back online!</span>
          </div>
        )}
        {toastStep === 'syncing' && (
          <div className="relative z-10 flex items-center gap-3 bg-[#1E3A5F] text-white px-4 py-3 rounded-xl shadow-lg">
            <RefreshCw size={16} className="animate-spin flex-shrink-0" />
            <span className="text-sm font-semibold">Syncing 2 inspections...</span>
          </div>
        )}
        {toastStep === 'synced' && (
          <div className="relative z-10 flex items-center gap-3 bg-[#1A7A4A] text-white px-4 py-3 rounded-xl shadow-lg">
            <span className="text-base">✅</span>
            <span className="text-sm font-semibold">All data synced successfully</span>
          </div>
        )}
        {toastStep === 'failed' && (
          <div className="relative z-10 flex items-center gap-3 bg-[#D35400] text-white px-4 py-3 rounded-xl shadow-lg max-w-xs">
            <span className="text-base">⚠</span>
            <div>
              <p className="text-sm font-semibold">Sync failed for Inspection #1234.</p>
              <button className="text-xs underline mt-0.5">Tap to retry.</button>
            </div>
          </div>
        )}
      </div>

      {/* Steps Legend */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { step: 1, label: 'Back online!', color: 'bg-green-100 text-green-700', active: toastStep === 'back-online' },
          { step: 2, label: 'Syncing...', color: 'bg-blue-100 text-blue-700', active: toastStep === 'syncing' },
          { step: 3, label: 'All synced ✓', color: 'bg-green-100 text-green-700', active: toastStep === 'synced' },
        ].map(s => (
          <div key={s.step} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${s.active ? 'border-[#1E3A5F] bg-[#EEF2FF]' : 'border-[#E5E7EB]'}`}>
            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.step}</span>
            <span className="text-xs text-[#374151]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component 4: PWA Install Prompt ─────────────────────────────────────────
function PWAInstallPrompt({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-16 h-16 bg-[#1E3A5F] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Smartphone size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F2937]">Install Carschek Inspector</h3>
            <p className="text-sm text-[#6B7280] mt-1">Add to your home screen for the best offline experience</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-5 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1"><Shield size={12} className="text-[#1A7A4A]" />Works offline</span>
          <span className="flex items-center gap-1"><Download size={12} className="text-[#2E75B6]" />No app store</span>
          <span className="flex items-center gap-1"><Zap size={12} className="text-[#D35400]" />Auto-updates</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onDismiss} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl hover:bg-[#F4F6F8] transition-colors text-[#374151]">
            Not now
          </button>
          <button className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#1E3A5F] text-white rounded-xl hover:bg-[#2E75B6] transition-colors flex items-center justify-center gap-2">
            <Download size={15} />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component 5: Offline Onboarding Overlay ─────────────────────────────────
function OfflineOnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#1E3A5F]/95 flex items-center justify-center z-50 p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff size={36} className="text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You're now offline, but you can keep working</h2>
        <p className="text-white/60 text-sm mb-8">Your work is safe. Here's what's available offline:</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '✅', title: 'Inspections saved locally', desc: 'All your inspection data is stored on this device' },
            { icon: '📷', title: 'Photos on your device', desc: 'Photos are stored locally until you reconnect' },
            { icon: '🔄', title: 'Auto-sync on reconnect', desc: 'Everything uploads automatically when back online' },
          ].map((card, i) => (
            <div key={i} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-3">{card.icon}</div>
              <p className="text-xs font-semibold text-white mb-1">{card.title}</p>
              <p className="text-[10px] text-white/50 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <button onClick={onDismiss} className="px-8 py-3 bg-white text-[#1E3A5F] font-semibold rounded-xl hover:bg-white/90 transition-colors">
          Got it, let's go
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OfflinePWAPage() {
  const [networkState, setNetworkState] = useState<NetworkState>('online');
  const [showBanner, setShowBanner] = useState(false);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const toggleNetwork = () => {
    const newState = networkState === 'online' ? 'offline' : 'online';
    setNetworkState(newState);
    if (newState === 'offline') setShowBanner(true);
    else setShowBanner(false);
  };

  return (
    <AppLayout currentPath="/offline-pwa">
      {/* Offline Onboarding Overlay */}
      {showOnboarding && <OfflineOnboardingOverlay onDismiss={() => setShowOnboarding(false)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Offline Sync UI & PWA</h1>
        <p className="text-sm text-[#6B7280] mt-1">Section 18 — All offline experience components for the Carschek Inspector PWA.</p>
      </div>

      {/* Offline Banner Demo */}
      <OfflineBanner visible={showBanner && networkState === 'offline'} onDismiss={() => setShowBanner(false)} />

      {/* Component 1: Network Status Indicator */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Component 1 — Network Status Indicator</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Persistent header indicator. Toggle to simulate offline state.</p>
          </div>
          <button
            onClick={toggleNetwork}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              networkState === 'online' ?'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' :'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
            }`}
          >
            {networkState === 'online' ? <><WifiOff size={14} />Go Offline</> : <><Wifi size={14} />Go Online</>}
          </button>
        </div>

        <div className="bg-[#F4F6F8] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
              <Smartphone size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[#1F2937]">Carschek Header</span>
          </div>
          <NetworkStatusIndicator networkState={networkState} onToggle={() => setShowSyncPanel(true)} />
        </div>

        {networkState === 'offline' && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff size={14} className="text-amber-600" />
              <p className="text-xs text-amber-800 font-medium">You're offline. All changes are being saved to your device. They'll sync automatically when you reconnect.</p>
            </div>
            <button className="p-1 hover:bg-amber-100 rounded-lg transition-colors flex-shrink-0">
              <X size={14} className="text-amber-600" />
            </button>
          </div>
        )}
      </div>

      {/* Component 2: Sync Status Panel */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Component 2 — Sync Status Panel</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Popover/bottom sheet showing sync queue and storage usage.</p>
          </div>
          <button
            onClick={() => setShowSyncPanel(!showSyncPanel)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6] transition-all"
          >
            {showSyncPanel ? 'Hide Panel' : 'Show Panel'}
          </button>
        </div>
        {showSyncPanel && (
          <div className="flex justify-center">
            <SyncStatusPanel networkState={networkState} onClose={() => setShowSyncPanel(false)} />
          </div>
        )}
      </div>

      {/* Component 3: Reconnection Toast */}
      <div className="mb-6">
        <ReconnectionToastDemo />
      </div>

      {/* Component 4: PWA Install Prompt */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Component 4 — PWA Install Prompt</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Appears after 2nd visit on mobile. Custom card design.</p>
          </div>
          <button
            onClick={() => setShowPWAPrompt(!showPWAPrompt)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6] transition-all"
          >
            {showPWAPrompt ? 'Hide Prompt' : 'Show Prompt'}
          </button>
        </div>
        {showPWAPrompt && (
          <div className="flex justify-center">
            <PWAInstallPrompt onDismiss={() => setShowPWAPrompt(false)} />
          </div>
        )}
      </div>

      {/* Component 5: Offline Onboarding */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Component 5 — Offline Capability Onboarding</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Full-screen overlay shown first time offline mode activates.</p>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6] transition-all"
          >
            Show Overlay
          </button>
        </div>
        <div className="bg-[#1E3A5F]/10 rounded-xl p-4 text-center">
          <p className="text-sm text-[#6B7280]">Click "Show Overlay" to preview the full-screen offline onboarding experience.</p>
        </div>
      </div>
    </AppLayout>
  );
}
