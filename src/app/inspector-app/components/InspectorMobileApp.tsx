'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Briefcase, Bell, User, ChevronLeft, Camera, CheckCircle, AlertTriangle, MapPin, Phone, Navigation, Clock, Star, Wifi, WifiOff, RefreshCw, Check, X, Plus, Trash2, RotateCcw, Zap, Edit3, Send, LogOut, Settings, Shield, Award, Eye, Car, Clipboard, BarChart2, Download, FileText, ChevronRight, Share2, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { useChat } from '@/lib/hooks/useChat';
import toast, { Toaster } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabName = 'Home' | 'Jobs' | 'Inspect' | 'Notifications' | 'Profile';
type JobStatus = 'Upcoming' | 'En Route' | 'In Progress' | 'Awaiting QA' | 'Completed';
type CheckResult = 'pass' | 'fail' | 'na' | null;
type Severity = 'Minor' | 'Major' | 'Critical' | null;
type InspectScreen =
  | 'job-list' | 'job-detail' | 'inspection-hub' | 'vehicle-photos' |'damage-photos' | 'checklist' | 'section-detail' | 'grading' | 'sync-review' | 'report-view';

interface Job {
  id: string;
  ckId: string;
  status: JobStatus;
  vehicle: string;
  year: number;
  plate: string;
  customer: string;
  phone: string;
  time: string;
  location: string;
  distance: string;
  priority: 'High' | 'Normal' | 'Low';
  inspectionType: string;
  synced?: boolean;
}

interface PhotoItem {
  id: string;
  name: string;
  captured: boolean;
  required: boolean;
  aiResult?: string;
}

interface DamagePhoto {
  id: string;
  label: string;
  comment: string;
  captured: boolean;
  severity?: 'Minor' | 'Major' | 'Critical';
  aiDescription?: string;
}

interface CheckItem {
  id: string;
  name: string;
  mode: 'paired' | 'single';
  leftResult?: CheckResult;
  rightResult?: CheckResult;
  singleResult?: CheckResult;
  severity?: Severity;
  note?: string;
  aiNote?: string;
}

interface InspectionSection {
  id: string;
  name: string;
  icon: string;
  items: CheckItem[];
  status: 'not-started' | 'in-progress' | 'complete';
}

interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  score: number | null;
  maxScore: number;
  note: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_JOBS: Job[] = [
  {
    id: 'job-1', ckId: 'CK-41', status: 'En Route',
    vehicle: 'Toyota Camry', year: 2019, plate: 'LSD 260 JE',
    customer: 'Adaeze Mensah', phone: '+234 801 234 5678',
    time: '10:30 AM', location: '45 Admiralty Way, Lekki Phase 1, Lagos',
    distance: '3.2 km', priority: 'High', inspectionType: 'Full Inspection',
  },
  {
    id: 'job-2', ckId: 'CK-42', status: 'Upcoming',
    vehicle: 'Honda Accord', year: 2020, plate: 'LND 891 KK',
    customer: 'Chidi Nwosu', phone: '+234 802 345 6789',
    time: '1:00 PM', location: '12 Ozumba Mbadiwe Ave, Victoria Island',
    distance: '8.1 km', priority: 'Normal', inspectionType: 'Pre-Purchase',
  },
  {
    id: 'job-3', ckId: 'CK-39', status: 'Completed',
    vehicle: 'Ford Ranger', year: 2018, plate: 'ABJ 445 FC',
    customer: 'Fatima Bello', phone: '+234 803 456 7890',
    time: '8:00 AM', location: '3 Wuse Zone 5, Abuja',
    distance: '—', priority: 'Normal', inspectionType: 'Full Inspection',
    synced: true,
  },
  {
    id: 'job-4', ckId: 'CK-40', status: 'Awaiting QA',
    vehicle: 'Mercedes-Benz C300', year: 2021, plate: 'KJA 234 AA',
    customer: 'Emeka Obi', phone: '+234 804 567 8901',
    time: '9:00 AM', location: '7 Bourdillon Road, Ikoyi',
    distance: '—', priority: 'High', inspectionType: 'Full Inspection',
    synced: false,
  },
];

const VEHICLE_PHOTOS: PhotoItem[] = [
  { id: 'vp1', name: 'Car Overview', captured: false, required: true },
  { id: 'vp2', name: 'Front View', captured: false, required: true },
  { id: 'vp3', name: 'Front Left', captured: false, required: true },
  { id: 'vp4', name: 'Front Right', captured: false, required: true },
  { id: 'vp5', name: 'Rear View', captured: false, required: true },
  { id: 'vp6', name: 'Rear Left', captured: false, required: true },
  { id: 'vp7', name: 'Rear Right', captured: false, required: true },
  { id: 'vp8', name: 'Interior Front', captured: false, required: true },
  { id: 'vp9', name: 'Interior Rear', captured: false, required: false },
  { id: 'vp10', name: 'Engine Bay', captured: false, required: true },
  { id: 'vp11', name: 'Tyre / Wheel', captured: false, required: false },
];

const INITIAL_SECTIONS: InspectionSection[] = [
  {
    id: 's1', name: 'Body Frame', icon: '🚗', status: 'not-started',
    items: [
      { id: 'bf1', name: 'Front Rail', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'bf2', name: 'Rear Rail', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'bf3', name: 'Roof Panel', mode: 'single', singleResult: null },
      { id: 'bf4', name: 'Hood / Bonnet', mode: 'single', singleResult: null },
      { id: 'bf5', name: 'Front Bumper', mode: 'single', singleResult: null },
      { id: 'bf6', name: 'Rear Bumper', mode: 'single', singleResult: null },
      { id: 'bf7', name: 'Door Sill', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'bf8', name: 'A-Pillar', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's2', name: 'Engine Bay', icon: '⚙️', status: 'not-started',
    items: [
      { id: 'eb1', name: 'Engine Oil Level', mode: 'single', singleResult: null },
      { id: 'eb2', name: 'Coolant Level', mode: 'single', singleResult: null },
      { id: 'eb3', name: 'Valve Cover Seal', mode: 'single', singleResult: null },
      { id: 'eb4', name: 'Timing Belt / Chain', mode: 'single', singleResult: null },
      { id: 'eb5', name: 'Air Filter', mode: 'single', singleResult: null },
      { id: 'eb6', name: 'Battery Terminals', mode: 'single', singleResult: null },
    ],
  },
  {
    id: 's3', name: 'Transmission', icon: '🔧', status: 'not-started',
    items: [
      { id: 'tr1', name: 'Fluid Level', mode: 'single', singleResult: null },
      { id: 'tr2', name: 'Gear Shift Response', mode: 'single', singleResult: null },
      { id: 'tr3', name: 'Clutch (if manual)', mode: 'single', singleResult: null },
      { id: 'tr4', name: 'Driveshaft / CV Joints', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's4', name: 'Suspension', icon: '🔩', status: 'not-started',
    items: [
      { id: 'su1', name: 'Shock Absorbers', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'su2', name: 'Control Arms', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'su3', name: 'Tie Rods', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'su4', name: 'Sway Bar Links', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's5', name: 'Brakes', icon: '🛑', status: 'not-started',
    items: [
      { id: 'br1', name: 'Brake Pads', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'br2', name: 'Brake Discs', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'br3', name: 'Brake Fluid Level', mode: 'single', singleResult: null },
      { id: 'br4', name: 'Handbrake Function', mode: 'single', singleResult: null },
    ],
  },
  {
    id: 's6', name: 'Tyres', icon: '⭕', status: 'not-started',
    items: [
      { id: 'ty1', name: 'Tread Depth (Front)', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'ty2', name: 'Tread Depth (Rear)', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'ty3', name: 'Spare Tyre', mode: 'single', singleResult: null },
    ],
  },
  {
    id: 's7', name: 'Lights', icon: '💡', status: 'not-started',
    items: [
      { id: 'li1', name: 'Headlights', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'li2', name: 'Tail Lights', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'li3', name: 'Indicators', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'li4', name: 'Reverse Lights', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's8', name: 'Interior', icon: '🪑', status: 'not-started',
    items: [
      { id: 'in1', name: 'Dashboard / Instrument Cluster', mode: 'single', singleResult: null },
      { id: 'in2', name: 'Seat Condition', mode: 'single', singleResult: null },
      { id: 'in3', name: 'Seatbelts', mode: 'single', singleResult: null },
      { id: 'in4', name: 'Airbag Indicator', mode: 'single', singleResult: null },
      { id: 'in5', name: 'Central Locking', mode: 'single', singleResult: null },
      { id: 'in6', name: 'Window Regulators', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's9', name: 'Electrical', icon: '⚡', status: 'not-started',
    items: [
      { id: 'el1', name: 'Alternator Output', mode: 'single', singleResult: null },
      { id: 'el2', name: 'Battery Charge', mode: 'single', singleResult: null },
      { id: 'el3', name: 'Infotainment System', mode: 'single', singleResult: null },
      { id: 'el4', name: 'Horn', mode: 'single', singleResult: null },
    ],
  },
  {
    id: 's10', name: 'AC System', icon: '❄️', status: 'not-started',
    items: [
      { id: 'ac1', name: 'Cooling Performance', mode: 'single', singleResult: null },
      { id: 'ac2', name: 'Compressor Noise', mode: 'single', singleResult: null },
      { id: 'ac3', name: 'Cabin Filter', mode: 'single', singleResult: null },
    ],
  },
];

const GRADE_CATEGORIES: GradeCategory[] = [
  { id: 'gc1', name: 'Body & Exterior', weight: 25, score: null, maxScore: 25, note: '' },
  { id: 'gc2', name: 'Engine & Mechanical', weight: 30, score: null, maxScore: 30, note: '' },
  { id: 'gc3', name: 'Interior & Comfort', weight: 20, score: null, maxScore: 20, note: '' },
  { id: 'gc4', name: 'Electrical Systems', weight: 15, score: null, maxScore: 15, note: '' },
  { id: 'gc5', name: 'Tyres & Brakes', weight: 10, score: null, maxScore: 10, note: '' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getJobStatusStyle(status: JobStatus) {
  const map: Record<JobStatus, string> = {
    Upcoming: 'bg-[#1E3A5F] text-white',
    'En Route': 'bg-purple-600 text-white',
    'In Progress': 'bg-amber-500 text-white',
    'Awaiting QA': 'bg-teal-600 text-white',
    Completed: 'bg-[#1A7A4A] text-white',
  };
  return map[status];
}

function getPriorityStyle(priority: 'High' | 'Normal' | 'Low') {
  if (priority === 'High') return 'text-red-600 bg-red-50';
  if (priority === 'Low') return 'text-gray-500 bg-gray-100';
  return 'text-blue-600 bg-blue-50';
}

function getScoreColor(score: number) {
  if (score >= 80) return '#1A7A4A';
  if (score >= 60) return '#D35400';
  return '#C0392B';
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Below Average';
  return 'Poor';
}

function calculateCarschekScore(sections: InspectionSection[]): number {
  const sectionWeights: Record<string, number> = {
    's2': 20, 's1': 15, 's9': 10, 's4': 10, 's5': 10,
    's3': 8, 's6': 7, 's7': 5, 's8': 8, 's10': 7,
  };
  let totalWeight = 0;
  let weightedScore = 0;
  sections.forEach(section => {
    const weight = sectionWeights[section.id] || 5;
    const allItems = section.items.flatMap(item => {
      if (item.mode === 'paired') return [item.leftResult, item.rightResult];
      return [item.singleResult];
    }).filter(r => r !== null);
    if (allItems.length === 0) return;
    const passCount = allItems.filter(r => r === 'pass').length;
    const sectionScore = (passCount / allItems.length) * 100;
    weightedScore += sectionScore * weight;
    totalWeight += weight;
  });
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

// ─── AI Defect Analysis Hook ──────────────────────────────────────────────────
function useGeminiDefectAnalysis() {
  const { response, isLoading, error, sendMessage } = useChat('GEMINI', 'gemini/gemini-2.5-flash', false);

  useEffect(() => {
    if (error) toast.error('AI analysis failed: ' + error.message);
  }, [error]);

  const analyzeDefect = useCallback((itemName: string, sectionName: string, note: string) => {
    sendMessage([
      {
        role: 'system',
        content: `You are a Nigerian automotive inspection AI assistant for Carschek. 
        Analyze vehicle defects and provide concise, professional assessments. 
        Always respond in JSON format with: severity (Minor/Major/Critical), 
        description (1-2 sentences), recommendation (brief action needed).`
      },
      {
        role: 'user',
        content: `Vehicle inspection defect found:
        Section: ${sectionName}
        Component: ${itemName}
        Inspector note: ${note || 'No additional note'}
        
        Provide severity assessment and recommendation in JSON format.`
      }
    ], { temperature: 0.3, max_tokens: 200 });
  }, [sendMessage]);

  const analyzeReport = useCallback((sections: InspectionSection[], vehicleInfo: string) => {
    const defects = sections.flatMap(s =>
      s.items.filter(i => {
        const hasFail = i.mode === 'paired'
          ? (i.leftResult === 'fail' || i.rightResult === 'fail')
          : i.singleResult === 'fail';
        return hasFail;
      }).map(i => `${s.name}: ${i.name} (${i.severity || 'unrated'}) - ${i.note || 'no note'}`)
    );

    sendMessage([
      {
        role: 'system',
        content: `You are a Carschek automotive inspection AI. Generate a professional inspection summary for Nigerian car buyers. Be concise and clear.`
      },
      {
        role: 'user',
        content: `Vehicle: ${vehicleInfo}
        
        Defects found (${defects.length} total):
        ${defects.slice(0, 10).join('\n')}
        
        Write a 3-4 sentence professional inspection summary highlighting key findings and overall vehicle condition. Include a recommendation (Buy / Buy with caution / Avoid).`
      }
    ], { temperature: 0.5, max_tokens: 300 });
  }, [sendMessage]);

  return { response, isLoading, analyzeDefect, analyzeReport };
}

// ─── AI Chat Assistant ────────────────────────────────────────────────────────
function AIAssistantPanel({ onClose, currentSection }: { onClose: () => void; currentSection?: string }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: `Hi! I'm your Carschek AI assistant powered by Gemini. I can help you with inspection guidance${currentSection ? ` for the ${currentSection} section` : ''}, defect identification, and report writing. What do you need help with?` }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { response, isLoading, error, sendMessage } = useChat('GEMINI', 'gemini/gemini-2.5-flash', true);
  const [lastResponse, setLastResponse] = useState('');

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (response && !isLoading && response !== lastResponse) {
      setLastResponse(response);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.content === '...') {
          return [...prev.slice(0, -1), { role: 'assistant', content: response }];
        }
        return prev;
      });
    }
  }, [response, isLoading, lastResponse]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: '...' }]);

    const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    sendMessage([
      {
        role: 'system',
        content: `You are a Carschek automotive inspection AI assistant. You help Nigerian vehicle inspectors with:
        - Inspection guidance and best practices
        - Defect identification and severity assessment  
        - Report writing assistance
        - Vehicle-specific knowledge
        ${currentSection ? `Currently inspecting: ${currentSection} section.` : ''}
        Be concise, professional, and practical. Use Nigerian automotive context where relevant.`
      },
      ...history.filter(m => m.content !== '...'),
      { role: 'user', content: userMsg }
    ], { temperature: 0.7, max_tokens: 400 });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-lg" style={{ height: '75vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#2E75B6] to-[#1E3A5F] rounded-xl flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Carschek AI</p>
              <p className="text-[10px] text-green-600 font-medium">Powered by Gemini · Online</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ height: 'calc(75vh - 130px)' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' ?'bg-[#1E3A5F] text-white rounded-br-sm' :'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.content === '...' && isLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about this inspection..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ active, onChange, isOnline }: {
  active: TabName;
  onChange: (t: TabName) => void;
  isOnline: boolean;
}) {
  const items: { icon: React.ElementType; label: TabName; badge?: number }[] = [
    { icon: Home, label: 'Home' },
    { icon: Briefcase, label: 'Jobs', badge: 2 },
    { icon: Clipboard, label: 'Inspect' },
    { icon: Bell, label: 'Notifications', badge: 3 },
    { icon: User, label: 'Profile' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      <div className="flex items-center justify-between px-2 max-w-lg mx-auto">
        {items.map(item => (
          <button key={item.label} onClick={() => onChange(item.label)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative transition-all active:scale-95 ${active === item.label ? 'text-[#1E3A5F]' : 'text-gray-400'}`}>
            <div className="relative">
              <item.icon size={22} strokeWidth={active === item.label ? 2.5 : 1.8} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${active === item.label ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            {active === item.label && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#1E3A5F] rounded-full" />}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center pb-1">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          {isOnline ? 'Online' : 'Offline — data saved locally'}
        </div>
      </div>
    </nav>
  );
}

// ─── Mobile Header ────────────────────────────────────────────────────────────
function MobileHeader({ title, subtitle, onBack, rightAction }: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 pb-3 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3 pt-3">
        {onBack && (
          <button onClick={onBack}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 active:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 text-base leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {rightAction}
      </div>
    </div>
  );
}

// ─── Camera Capture with AI ───────────────────────────────────────────────────
function AICameraCapture({
  label, onCaptureDone, onCancel, enableAI = false,
}: {
  label: string;
  onCaptureDone: (aiResult?: { description: string; severity: string }) => void;
  onCancel: () => void;
  enableAI?: boolean;
}) {
  const [step, setStep] = useState<'capture' | 'analyzing' | 'results'>('capture');
  const [progress, setProgress] = useState(0);
  const { response, isLoading, error, sendMessage } = useChat('GEMINI', 'gemini/gemini-2.5-flash', false);
  const [aiResult, setAiResult] = useState<{ description: string; severity: string } | null>(null);

  useEffect(() => {
    if (error) toast.error('AI analysis failed');
  }, [error]);

  useEffect(() => {
    if (response && !isLoading && step === 'analyzing') {
      try {
        const parsed = JSON.parse(response);
        setAiResult({ description: parsed.description || response, severity: parsed.severity || 'Minor' });
      } catch {
        setAiResult({ description: response, severity: 'Minor' });
      }
      setStep('results');
    }
  }, [response, isLoading, step]);

  const capturePhoto = () => {
    if (enableAI) {
      setStep('analyzing');
      setProgress(0);
      const timings = [{ d: 600, p: 35 }, { d: 1400, p: 70 }, { d: 2200, p: 100 }];
      timings.forEach(t => setTimeout(() => setProgress(t.p), t.d));

      sendMessage([
        { role: 'system', content: 'You are a vehicle damage detection AI. Respond ONLY with valid JSON.' },
        {
          role: 'user',
          content: `Analyze a photo of vehicle component: "${label}". 
          Provide a realistic defect assessment as JSON: 
          {"severity": "Minor|Major|Critical", "description": "brief description", "confidence": 85}`
        }
      ], { temperature: 0.3, max_tokens: 150 });
    } else {
      onCaptureDone();
    }
  };

  if (step === 'capture') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 pt-10 pb-3">
          <button onClick={onCancel} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
          <p className="text-white text-sm font-semibold">{label}</p>
          {enableAI ? (
            <div className="flex items-center gap-1 bg-[#2E75B6]/80 px-2 py-1 rounded-full">
              <Zap size={10} className="text-white" />
              <span className="text-white text-[10px] font-medium">Gemini AI</span>
            </div>
          ) : <div className="w-9" />}
        </div>
        <div className="flex-1 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-dashed border-white/60 rounded-xl w-56 h-40 flex items-end justify-center pb-2">
              <span className="text-white text-[10px] bg-black/50 px-2 py-0.5 rounded-full">Position within frame</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-8 bg-black">
          <button onClick={capturePhoto} style={{ width: 72, height: 72 }}
            className="rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center gap-5">
        <div className="bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 w-full h-48 flex items-center justify-center">
          <div className="text-gray-400 text-xs">Captured Photo</div>
        </div>
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#2E75B6]/30 border-t-[#2E75B6] animate-spin" />
          <Zap size={18} className="text-[#2E75B6] absolute inset-0 m-auto" />
        </div>
        <p className="text-white text-sm font-semibold">Gemini AI is analysing...</p>
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#2E75B6] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="relative flex-shrink-0 h-48">
          <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-red-500 rounded-lg w-28 h-16 relative">
              <div className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                {aiResult?.severity || 'Minor'} defect detected
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Zap size={15} className="text-[#2E75B6]" />
            <span className="text-sm font-bold text-gray-900">Gemini AI Analysis</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-[#C0392B] bg-red-100 px-2 py-0.5 rounded-full">
                  {aiResult?.severity || 'Minor'}
                </span>
                <span className="text-[10px] text-gray-500">AI Detected</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{aiResult?.description || 'Defect detected'}</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => onCaptureDone(aiResult || undefined)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-xl">
                <Check size={13} /> Apply AI Result
              </button>
              <button onClick={() => onCaptureDone()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2E75B6] text-white text-xs font-semibold rounded-xl">
                <Edit3 size={13} /> Enter Manually
              </button>
              <button onClick={onCancel}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-xl">
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Screen: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ onNavigate, isOnline }: { onNavigate: (tab: TabName) => void; isOnline: boolean }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });
  const activeJob = MOCK_JOBS.find(j => j.status === 'En Route' || j.status === 'In Progress');

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <div className="bg-[#1E3A5F] px-5 pt-12 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-200 text-xs font-medium mb-1">{dateStr}</p>
            <h2 className="text-white text-xl font-bold leading-tight">Good morning,<br />Emeka 👋</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="w-10 h-10 rounded-full bg-[#2E75B6] flex items-center justify-center text-white font-bold text-sm">EO</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Today', value: '2' }, { label: 'Done', value: '1' },
            { label: 'Sync', value: '1' }, { label: 'Rating', value: '4.9' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-2.5 text-center">
              <p className="text-white font-bold text-lg leading-none">{s.value}</p>
              <p className="text-blue-200 text-[9px] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {activeJob && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold">ACTIVE JOB</span>
              </div>
              <span className="text-purple-200 text-xs font-mono">{activeJob.ckId}</span>
            </div>
            <div className="p-4">
              <p className="font-bold text-gray-900 text-base">{activeJob.vehicle} {activeJob.year}</p>
              <p className="text-gray-500 text-xs mt-0.5 mb-3">{activeJob.plate} · {activeJob.inspectionType}</p>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                <MapPin size={12} className="text-[#1E3A5F]" />
                <span className="truncate">{activeJob.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                <Clock size={12} className="text-[#1E3A5F]" />
                <span>{activeJob.time} · {activeJob.distance}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onNavigate('Jobs')}
                  className="flex-1 bg-[#1E3A5F] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <Clipboard size={13} /> Start Inspection
                </button>
                <a href={`tel:${activeJob.phone}`} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                  <Phone size={16} className="text-gray-600" />
                </a>
                <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                  <Navigation size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <WifiOff size={20} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-amber-800 text-sm">You're offline</p>
              <p className="text-amber-600 text-xs mt-0.5">All inspection data is saved locally. Will sync when online.</p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Camera, label: 'Capture Photos', sub: 'Vehicle & damage', color: '#2E75B6', bg: '#EFF6FF', tab: 'Inspect' as TabName },
              { icon: Clipboard, label: 'Fill Checklist', sub: '10 sections', color: '#1A7A4A', bg: '#F0FDF4', tab: 'Inspect' as TabName },
              { icon: Star, label: 'Grade Car', sub: 'Score & submit', color: '#7C3AED', bg: '#F5F3FF', tab: 'Inspect' as TabName },
              { icon: RefreshCw, label: 'Sync Reports', sub: '1 pending', color: '#D35400', bg: '#FFF7ED', tab: 'Jobs' as TabName },
            ].map(action => (
              <button key={action.label} onClick={() => onNavigate(action.tab)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: action.bg }}>
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <p className="font-bold text-gray-900 text-sm">{action.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{action.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E75B6] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">Gemini AI Assistant</p>
            <p className="text-blue-200 text-xs mt-0.5">Get help with defect analysis & reports</p>
          </div>
          <button onClick={() => onNavigate('Inspect')}
            className="bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
            Open
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Jobs List ────────────────────────────────────────────────────────
function JobsScreen({ onStartInspection }: { onStartInspection: (job: Job) => void }) {
  const [filter, setFilter] = useState<'All' | JobStatus>('All');
  const filters: ('All' | JobStatus)[] = ['All', 'En Route', 'Upcoming', 'In Progress', 'Awaiting QA', 'Completed'];
  const filtered = filter === 'All' ? MOCK_JOBS : MOCK_JOBS.filter(j => j.status === filter);

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <MobileHeader title="My Jobs" subtitle={`${MOCK_JOBS.length} total assignments`} />
      <div className="px-4 py-3 overflow-x-auto flex gap-2 border-b border-gray-100 bg-white" style={{ scrollbarWidth: 'none' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-600'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="px-4 py-4 space-y-3">
        {filtered.map(job => (
          <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1E3A5F] bg-[#EFF6FF] px-2 py-0.5 rounded-lg">{job.ckId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityStyle(job.priority)}`}>{job.priority}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getJobStatusStyle(job.status)}`}>{job.status}</span>
              </div>
              <p className="font-bold text-gray-900 text-base">{job.vehicle} {job.year}</p>
              <p className="text-gray-500 text-xs mt-0.5 mb-3">{job.plate} · {job.inspectionType}</p>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <User size={12} className="text-gray-400" /><span>{job.customer}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <MapPin size={12} className="text-gray-400" /><span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Clock size={12} className="text-gray-400" /><span>{job.time}</span>
                  {job.distance !== '—' && <><span className="text-gray-300">·</span><span>{job.distance} away</span></>}
                </div>
              </div>
              {job.status === 'Awaiting QA' && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-medium ${job.synced ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {job.synced ? <CheckCircle size={13} /> : <RefreshCw size={13} />}
                  {job.synced ? 'Synced with admin dashboard' : 'Pending sync to admin dashboard'}
                </div>
              )}
              <div className="flex gap-2">
                {(job.status === 'En Route' || job.status === 'Upcoming' || job.status === 'In Progress') && (
                  <button onClick={() => onStartInspection(job)}
                    className="flex-1 bg-[#1E3A5F] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <Clipboard size={13} />
                    {job.status === 'In Progress' ? 'Continue Inspection' : 'Start Inspection'}
                  </button>
                )}
                {job.status === 'Awaiting QA' && !job.synced && (
                  <button onClick={() => toast.success('Syncing report...')}
                    className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <RefreshCw size={13} /> Sync Now
                  </button>
                )}
                {job.status === 'Completed' && (
                  <button className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Eye size={13} /> View Report
                  </button>
                )}
                <a href={`tel:${job.phone}`} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0">
                  <Phone size={16} className="text-gray-600" />
                </a>
                {job.distance !== '—' && (
                  <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0">
                    <Navigation size={16} className="text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Inspection Hub ───────────────────────────────────────────────────
function InspectionHub({ job, onBack, onGoTo, sections, vehiclePhotos, damagePhotos, grades }: {
  job: Job;
  onBack: () => void;
  onGoTo: (screen: InspectScreen) => void;
  sections: InspectionSection[];
  vehiclePhotos: PhotoItem[];
  damagePhotos: DamagePhoto[];
  grades: GradeCategory[];
}) {
  const [elapsed, setElapsed] = useState(0);
  const completedSections = sections.filter(s => s.status === 'complete').length;
  const capturedPhotos = vehiclePhotos.filter(p => p.captured).length;
  const allGraded = grades.every(g => g.score !== null);
  const score = calculateCarschekScore(sections);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const hubItems = [
    {
      key: 'vehicle-photos' as InspectScreen, icon: Camera, label: 'Vehicle Photos',
      sub: `${capturedPhotos} / ${vehiclePhotos.length} captured`,
      done: capturedPhotos === vehiclePhotos.length, required: true,
    },
    {
      key: 'checklist' as InspectScreen, icon: Clipboard, label: 'Inspection Checklist',
      sub: `${completedSections} / ${sections.length} sections`,
      done: completedSections === sections.length, required: true,
    },
    {
      key: 'damage-photos' as InspectScreen, icon: AlertTriangle, label: 'Damage Photos',
      sub: `${damagePhotos.length} photo${damagePhotos.length !== 1 ? 's' : ''} added`,
      done: damagePhotos.length > 0, required: false,
    },
    {
      key: 'grading' as InspectScreen, icon: Star, label: 'Grade Car',
      sub: allGraded ? `Score: ${score}/100` : 'Score & finalize',
      done: allGraded, required: true,
    },
    {
      key: 'sync-review' as InspectScreen, icon: Send, label: 'Review & Submit',
      sub: 'Submit to admin dashboard', done: false, required: true,
    },
  ];

  const requiredDone = hubItems.filter(i => i.required).filter(i => i.done).length;
  const totalRequired = hubItems.filter(i => i.required).length;

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <MobileHeader
        title="Inspection Hub"
        subtitle={`${job.ckId} · ${job.vehicle} ${job.year}`}
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
            <Clock size={13} className="text-amber-600" />
            <span className="text-amber-700 text-xs font-bold font-mono">{formatTime(elapsed)}</span>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-900">Overall Progress</p>
            <span className="text-xs font-bold text-[#1E3A5F]">{requiredDone}/{totalRequired} required</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#1E3A5F] rounded-full transition-all" style={{ width: `${(requiredDone / totalRequired) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{completedSections}</p>
              <p className="text-[10px] text-gray-500">Sections Done</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: getScoreColor(score) }}>{score}</p>
              <p className="text-[10px] text-gray-500">Current Score</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{sections.flatMap(s => s.items).filter(i => {
                const hasFail = i.mode === 'paired' ? (i.leftResult === 'fail' || i.rightResult === 'fail') : i.singleResult === 'fail';
                return hasFail;
              }).length}</p>
              <p className="text-[10px] text-gray-500">Defects Found</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {hubItems.map(item => (
            <button key={item.key} onClick={() => onGoTo(item.key)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-100' : 'bg-[#EFF6FF]'}`}>
                <item.icon size={22} className={item.done ? 'text-[#1A7A4A]' : 'text-[#1E3A5F]'} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
              </div>
              <div className="flex items-center gap-2">
                {!item.required && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>}
                {item.done ? (
                  <div className="w-6 h-6 bg-[#1A7A4A] rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                ) : (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Vehicle Photos ───────────────────────────────────────────────────
function VehiclePhotosScreen({ photos, onUpdate, onBack, onComplete }: {
  photos: PhotoItem[];
  onUpdate: (photos: PhotoItem[]) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [activeCapture, setActiveCapture] = useState<string | null>(null);
  const captured = photos.filter(p => p.captured).length;

  const handleCaptureDone = (id: string) => {
    onUpdate(photos.map(p => p.id === id ? { ...p, captured: true } : p));
    setActiveCapture(null);
    toast.success('Photo captured');
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {activeCapture && (
        <AICameraCapture
          label={photos.find(p => p.id === activeCapture)?.name || ''}
          onCaptureDone={() => handleCaptureDone(activeCapture)}
          onCancel={() => setActiveCapture(null)}
          enableAI={false}
        />
      )}
      <MobileHeader
        title="Vehicle Photos"
        subtitle={`${captured} / ${photos.length} captured`}
        onBack={onBack}
      />
      <div className="px-4 py-4">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-[#2E75B6] rounded-full transition-all" style={{ width: `${(captured / photos.length) * 100}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, idx) => (
            <div key={photo.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${photo.captured ? 'border-[#1A7A4A]' : 'border-gray-200'}`}>
              <div className={`h-24 flex items-center justify-center relative ${photo.captured ? 'bg-green-50' : 'bg-gray-50'}`}>
                {photo.captured ? (
                  <>
                    <CheckCircle size={28} className="text-[#1A7A4A]" />
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#1A7A4A] rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera size={24} className="text-gray-400 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400">Tap to capture</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 w-5 h-5 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">{idx + 1}</span>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-gray-900 leading-tight mb-2">{photo.name}</p>
                {photo.captured ? (
                  <button onClick={() => { onUpdate(photos.map(p => p.id === photo.id ? { ...p, captured: false } : p)); }}
                    className="w-full py-1.5 border border-gray-200 rounded-lg text-[10px] font-medium text-gray-500 flex items-center justify-center gap-1">
                    <RotateCcw size={10} /> Retake
                  </button>
                ) : (
                  <button onClick={() => setActiveCapture(photo.id)}
                    className="w-full py-1.5 bg-[#1E3A5F] rounded-lg text-[10px] font-semibold text-white flex items-center justify-center gap-1.5">
                    <Camera size={10} /> Capture
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <button onClick={onComplete}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${captured >= photos.filter(p => p.required).length ? 'bg-[#1A7A4A] text-white' : 'bg-gray-100 text-gray-500'}`}>
          {captured >= photos.filter(p => p.required).length ? 'Section Complete ✓' : `${photos.filter(p => p.required).length - captured} required photos remaining`}
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Checklist Overview ───────────────────────────────────────────────
function ChecklistScreen({ sections, onSelectSection, onBack }: {
  sections: InspectionSection[];
  onSelectSection: (id: string) => void;
  onBack: () => void;
}) {
  const completed = sections.filter(s => s.status === 'complete').length;

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <MobileHeader
        title="Inspection Checklist"
        subtitle={`${completed} / ${sections.length} sections complete`}
        onBack={onBack}
      />
      <div className="px-4 py-4 space-y-2">
        {sections.map(section => {
          const totalItems = section.items.flatMap(i => i.mode === 'paired' ? [i.leftResult, i.rightResult] : [i.singleResult]);
          const actioned = totalItems.filter(r => r !== null).length;
          const fails = section.items.filter(i => i.mode === 'paired' ? (i.leftResult === 'fail' || i.rightResult === 'fail') : i.singleResult === 'fail').length;

          return (
            <button key={section.id} onClick={() => onSelectSection(section.id)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                section.status === 'complete' ? 'bg-green-100' :
                section.status === 'in-progress' ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                {section.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900 text-sm">{section.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{actioned}/{totalItems.length} items · {fails > 0 ? `${fails} fail${fails !== 1 ? 's' : ''}` : 'No fails'}</p>
                {actioned > 0 && (
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-[#1E3A5F] rounded-full" style={{ width: `${(actioned / totalItems.length) * 100}%` }} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {fails > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{fails}</span>
                )}
                {section.status === 'complete' ? (
                  <div className="w-6 h-6 bg-[#1A7A4A] rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                ) : (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen: Section Detail ───────────────────────────────────────────────────
function SectionDetailScreen({ section, onUpdate, onBack, onComplete }: {
  section: InspectionSection;
  onUpdate: (section: InspectionSection) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [expandedFail, setExpandedFail] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiAnalysisItem, setAiAnalysisItem] = useState<string | null>(null);
  const { analyzeDefect, response: aiResponse, isLoading: aiLoading } = useGeminiDefectAnalysis();
  const [savedIndicator, setSavedIndicator] = useState(false);

  const updateItem = (itemId: string, updates: Partial<CheckItem>) => {
    const updated = {
      ...section,
      items: section.items.map(i => i.id === itemId ? { ...i, ...updates } : i),
    };
    onUpdate(updated);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  };

  const handleResult = (itemId: string, side: 'left' | 'right' | 'single', result: CheckResult) => {
    const item = section.items.find(i => i.id === itemId);
    if (!item) return;
    if (side === 'left') updateItem(itemId, { leftResult: result });
    else if (side === 'right') updateItem(itemId, { rightResult: result });
    else updateItem(itemId, { singleResult: result });

    const isFail = result === 'fail';
    if (isFail) {
      setExpandedFail(itemId);
    } else if (expandedFail === itemId) {
      const otherFail = side === 'left' ? item.rightResult === 'fail' : side === 'right' ? item.leftResult === 'fail' : false;
      if (!otherFail) setExpandedFail(null);
    }
  };

  const handleAIAnalyze = (item: CheckItem) => {
    setAiAnalysisItem(item.id);
    analyzeDefect(item.name, section.name, item.note || '');
  };

  useEffect(() => {
    if (aiResponse && !aiLoading && aiAnalysisItem) {
      try {
        const parsed = JSON.parse(aiResponse);
        updateItem(aiAnalysisItem, {
          severity: parsed.severity as Severity,
          aiNote: parsed.description,
          note: parsed.description,
        });
        toast.success('AI analysis applied');
      } catch {
        updateItem(aiAnalysisItem, { aiNote: aiResponse });
      }
      setAiAnalysisItem(null);
    }
  }, [aiResponse, aiLoading]);

  const allActioned = section.items.every(i => {
    if (i.mode === 'paired') return i.leftResult !== null && i.rightResult !== null;
    return i.singleResult !== null;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {showAI && <AIAssistantPanel onClose={() => setShowAI(false)} currentSection={section.name} />}

      <MobileHeader
        title={`${section.icon} ${section.name}`}
        subtitle={`${section.items.length} items to inspect`}
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-2">
            {savedIndicator && (
              <span className="text-[10px] text-green-600 font-medium">💾 Saved</span>
            )}
            <button onClick={() => setShowAI(true)}
              className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
              <Zap size={16} className="text-[#2E75B6]" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-3">
        {section.items.map(item => {
          const hasFail = item.mode === 'paired'
            ? (item.leftResult === 'fail' || item.rightResult === 'fail')
            : item.singleResult === 'fail';
          const isExpanded = expandedFail === item.id;

          return (
            <div key={item.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${hasFail ? 'border-red-200' : 'border-gray-100'}`}>
              <div className="p-4">
                <p className="font-semibold text-gray-900 text-sm mb-3">{item.name}</p>

                {item.mode === 'paired' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {(['left', 'right'] as const).map(side => {
                      const result = side === 'left' ? item.leftResult : item.rightResult;
                      return (
                        <div key={side}>
                          <p className="text-[10px] text-gray-400 font-medium mb-1.5 uppercase">{side === 'left' ? 'Left' : 'Right'}</p>
                          <div className="flex gap-1.5">
                            {(['pass', 'fail', 'na'] as CheckResult[]).map(r => (
                              <button key={r!} onClick={() => handleResult(item.id, side, r)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                                  result === r
                                    ? r === 'pass' ? 'bg-[#1A7A4A] text-white' : r === 'fail' ? 'bg-[#C0392B] text-white' : 'bg-gray-500 text-white'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                {r === 'pass' ? '✓' : r === 'fail' ? '✗' : 'N/A'}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {(['pass', 'fail', 'na'] as CheckResult[]).map(r => (
                      <button key={r!} onClick={() => handleResult(item.id, 'single', r)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          item.singleResult === r
                            ? r === 'pass' ? 'bg-[#1A7A4A] text-white' : r === 'fail' ? 'bg-[#C0392B] text-white' : 'bg-gray-500 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                        {r === 'pass' ? '✓ Pass' : r === 'fail' ? '✗ Fail' : 'N/A'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {hasFail && isExpanded && (
                <div className="border-t border-red-100 bg-red-50 p-4 space-y-3">
                  <p className="text-xs font-bold text-red-700">Defect Details</p>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1.5">Severity</p>
                    <div className="flex gap-2">
                      {(['Minor', 'Major', 'Critical'] as const).map(sev => (
                        <button key={sev} onClick={() => updateItem(item.id, { severity: sev })}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                            item.severity === sev
                              ? sev === 'Minor' ? 'bg-amber-500 text-white' : sev === 'Major' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white' :'bg-white border border-gray-200 text-gray-600'
                          }`}>
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1.5">Note</p>
                    <textarea
                      value={item.note || ''}
                      onChange={e => updateItem(item.id, { note: e.target.value })}
                      placeholder="Describe the defect..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={() => handleAIAnalyze(item)}
                    disabled={aiLoading && aiAnalysisItem === item.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-xs font-semibold disabled:opacity-60">
                    {aiLoading && aiAnalysisItem === item.id ? (
                      <><Loader size={13} className="animate-spin" /> Gemini AI Analysing...</>
                    ) : (
                      <><Zap size={13} /> Analyse with Gemini AI</>
                    )}
                  </button>
                  {item.aiNote && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-blue-700 mb-1">AI Recommendation</p>
                      <p className="text-[11px] text-blue-800 leading-relaxed">{item.aiNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <button onClick={onComplete} disabled={!allActioned}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${allActioned ? 'bg-[#1A7A4A] text-white' : 'bg-gray-100 text-gray-400'}`}>
          {allActioned ? 'Section Complete ✓' : 'Complete all items to continue'}
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Damage Photos ────────────────────────────────────────────────────
function DamagePhotosScreen({ photos, onUpdate, onBack, onComplete }: {
  photos: DamagePhoto[];
  onUpdate: (photos: DamagePhoto[]) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [activeCapture, setActiveCapture] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const addPhoto = () => {
    if (!newLabel.trim()) return;
    const id = `dp${Date.now()}`;
    const updated = [...photos, { id, label: newLabel.trim(), comment: '', captured: false }];
    onUpdate(updated);
    setNewLabel('');
    setShowAddModal(false);
    setActiveCapture(id);
  };

  const handleCaptureDone = (id: string, aiResult?: { description: string; severity: string }) => {
    onUpdate(photos.map(p => p.id === id ? {
      ...p, captured: true,
      severity: aiResult?.severity as DamagePhoto['severity'],
      aiDescription: aiResult?.description,
      comment: aiResult?.description || p.comment,
    } : p));
    setActiveCapture(null);
    if (aiResult) toast.success(`AI detected: ${aiResult.severity} defect`);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {activeCapture && (
        <AICameraCapture
          label={photos.find(p => p.id === activeCapture)?.label || 'Damage Photo'}
          onCaptureDone={result => handleCaptureDone(activeCapture, result)}
          onCancel={() => setActiveCapture(null)}
          enableAI={true}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6">
            <p className="font-bold text-gray-900 text-base mb-4">Add Damage Photo</p>
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="e.g. Front bumper scratch"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={addPhoto} disabled={!newLabel.trim()} className="flex-1 py-3 bg-[#C0392B] text-white rounded-xl text-sm font-bold disabled:opacity-50">Add & Capture</button>
            </div>
          </div>
        </div>
      )}

      <MobileHeader
        title="Damage Photos"
        subtitle={`${photos.length} photo${photos.length !== 1 ? 's' : ''} · AI-powered`}
        onBack={onBack}
        rightAction={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-[#C0392B] text-white px-3 py-2 rounded-xl text-xs font-bold">
            <Plus size={13} /> Add
          </button>
        }
      />

      <div className="px-4 py-4 space-y-3">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Camera size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">No damage photos yet</p>
            <p className="text-xs text-gray-400 mb-5">Tap "Add" to capture defect photos with Gemini AI analysis</p>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-3 bg-[#C0392B] text-white rounded-2xl text-sm font-semibold">
              <Plus size={15} /> Add Damage Photo
            </button>
          </div>
        ) : (
          photos.map((photo, idx) => (
            <div key={photo.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${photo.captured ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3 p-3">
                <div className={`w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center relative ${photo.captured ? 'bg-red-50' : 'bg-gray-50'}`}>
                  {photo.captured ? <AlertTriangle size={24} className="text-[#D35400]" /> : <Camera size={20} className="text-gray-400" />}
                  <div className="absolute bottom-1 left-1 bg-[#1E3A5F] text-white text-[8px] font-bold px-1 rounded">#{idx + 1}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{photo.label}</p>
                    <button onClick={() => onUpdate(photos.filter(p => p.id !== photo.id))} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {photo.severity && (
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      photo.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                      photo.severity === 'Major' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {photo.severity} · AI Detected
                    </span>
                  )}
                  {photo.comment && <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{photo.comment}</p>}
                </div>
              </div>
              <div className="px-3 pb-3">
                {!photo.captured ? (
                  <button onClick={() => setActiveCapture(photo.id)}
                    className="w-full py-2 bg-[#C0392B] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Camera size={12} /> Capture + Gemini AI Scan
                  </button>
                ) : (
                  <button onClick={() => setActiveCapture(photo.id)}
                    className="w-full py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5">
                    <RotateCcw size={12} /> Retake
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <button onClick={onComplete} className="w-full py-3.5 bg-[#1A7A4A] text-white rounded-2xl text-sm font-bold">
          Done with Damage Photos ✓
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Grading ─────────────────────────────────────────────────────────
function GradingScreen({ grades, onUpdate, sections, onBack, onComplete }: {
  grades: GradeCategory[];
  onUpdate: (grades: GradeCategory[]) => void;
  sections: InspectionSection[];
  onBack: () => void;
  onComplete: () => void;
}) {
  const totalScore = grades.reduce((sum, g) => sum + (g.score || 0), 0);
  const maxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);
  const checklistScore = calculateCarschekScore(sections);

  const updateGrade = (id: string, score: number | null, note: string) => {
    onUpdate(grades.map(g => g.id === id ? { ...g, score, note } : g));
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <MobileHeader title="Grade Car" subtitle="Assign scores per category" onBack={onBack} />

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={getScoreColor(percentage)} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: getScoreColor(percentage) }}>{percentage}</span>
              <span className="text-[10px] text-gray-500">/ 100</span>
            </div>
          </div>
          <p className="font-bold text-gray-900 text-base">{getScoreLabel(percentage)}</p>
          <p className="text-xs text-gray-500 mt-1">Checklist score: {checklistScore}/100</p>
        </div>

        {grades.map(grade => (
          <div key={grade.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-gray-900 text-sm">{grade.name}</p>
                <p className="text-[10px] text-gray-400">Weight: {grade.weight}%</p>
              </div>
              <span className="text-lg font-bold" style={{ color: grade.score !== null ? getScoreColor((grade.score / grade.maxScore) * 100) : '#9CA3AF' }}>
                {grade.score !== null ? `${grade.score}/${grade.maxScore}` : '—'}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {Array.from({ length: grade.maxScore + 1 }, (_, i) => i).map(score => (
                <button key={score} onClick={() => updateGrade(grade.id, score, grade.note)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    grade.score === score
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {score}
                </button>
              ))}
            </div>
            <input
              value={grade.note}
              onChange={e => updateGrade(grade.id, grade.score, e.target.value)}
              placeholder="Add note (optional)"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>
        ))}
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <button onClick={onComplete} disabled={grades.some(g => g.score === null)}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${grades.every(g => g.score !== null) ? 'bg-[#1A7A4A] text-white' : 'bg-gray-100 text-gray-400'}`}>
          {grades.every(g => g.score !== null) ? 'Grading Complete ✓' : 'Score all categories to continue'}
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Review & Submit ──────────────────────────────────────────────────
function ReviewScreen({ job, sections, vehiclePhotos, damagePhotos, grades, onBack, onSubmit }: {
  job: Job;
  sections: InspectionSection[];
  vehiclePhotos: PhotoItem[];
  damagePhotos: DamagePhoto[];
  grades: GradeCategory[];
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [showAI, setShowAI] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { analyzeReport, response: aiResponse, isLoading: aiLoading } = useGeminiDefectAnalysis();
  const score = calculateCarschekScore(sections);
  const defects = sections.flatMap(s => s.items.filter(i => {
    return i.mode === 'paired' ? (i.leftResult === 'fail' || i.rightResult === 'fail') : i.singleResult === 'fail';
  }));

  useEffect(() => {
    if (aiResponse && !aiLoading) setAiSummary(aiResponse);
  }, [aiResponse, aiLoading]);

  const handleGenerateSummary = () => {
    analyzeReport(sections, `${job.vehicle} ${job.year} (${job.plate})`);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Report submitted successfully!');
      onSubmit();
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {showAI && <AIAssistantPanel onClose={() => setShowAI(false)} />}

      <MobileHeader title="Review & Submit" subtitle="Final inspection summary" onBack={onBack} />

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={getScoreColor(score)} strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold" style={{ color: getScoreColor(score) }}>{score}</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{getScoreLabel(score)}</p>
              <p className="text-gray-500 text-sm">Carschek Score</p>
              <p className="text-xs text-gray-400 mt-1">{job.vehicle} {job.year}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Photos', value: vehiclePhotos.filter(p => p.captured).length, icon: Camera, color: '#2E75B6' },
            { label: 'Defects', value: defects.length, icon: AlertTriangle, color: '#C0392B' },
            { label: 'Damage', value: damagePhotos.length, icon: AlertCircle, color: '#D35400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
              <stat.icon size={20} className="mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {defects.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-900 text-sm">Defects Found ({defects.length})</p>
            </div>
            <div className="divide-y divide-gray-50">
              {defects.slice(0, 5).map(item => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    item.severity === 'Critical' ? 'bg-red-500' : item.severity === 'Major' ? 'bg-orange-500' : 'bg-amber-400'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    {item.note && <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>}
                  </div>
                  {item.severity && (
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      item.severity === 'Critical' ? 'bg-red-100 text-red-700' : item.severity === 'Major' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                    }`}>{item.severity}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-900 text-sm">AI Report Summary</p>
            <button onClick={handleGenerateSummary} disabled={aiLoading}
              className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#2E75B6] px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-60">
              {aiLoading ? <Loader size={12} className="animate-spin" /> : <Zap size={12} />}
              {aiLoading ? 'Generating...' : 'Generate with Gemini'}
            </button>
          </div>
          {aiSummary ? (
            <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Click "Generate with Gemini" to create an AI-powered inspection summary.</p>
          )}
        </div>

        <div className="space-y-3">
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 bg-[#1E3A5F] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70">
            {submitting ? <><Loader size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Report to Admin</>}
          </button>
          <button onClick={() => toast.success('Report saved locally. Will submit when online.')}
            className="w-full py-3.5 border border-gray-200 text-gray-600 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2">
            <Download size={15} /> Save & Submit When Online
          </button>
          <div className="flex gap-3">
            <button onClick={() => { if (navigator.share) { navigator.share({ title: `Carschek Report - ${job.ckId}`, text: `Inspection report for ${job.vehicle} ${job.year}` }); } else { toast.success('Link copied!'); } }}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5">
              <Share2 size={14} /> Share
            </button>
            <button onClick={() => setShowAI(true)}
              className="flex-1 py-3 bg-[#EFF6FF] text-[#1E3A5F] rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5">
              <Zap size={14} /> AI Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Notifications ────────────────────────────────────────────────────
function NotificationsScreen() {
  const notifications = [
    { id: 1, type: 'order', title: 'New Job Assigned', desc: 'CK-43 Honda Civic 2022 — 3:00 PM today', time: '5 min ago', read: false },
    { id: 2, type: 'report', title: 'Report Approved', desc: 'CK-39 Ford Ranger — QA approved', time: '2 hrs ago', read: false },
    { id: 3, type: 'payment', title: 'Payment Received', desc: '₦15,000 for 3 inspections this week', time: 'Yesterday', read: true },
    { id: 4, type: 'system', title: 'App Updated', desc: 'Carschek Inspector v2.1 — Gemini AI enabled', time: '2 days ago', read: true },
  ];

  const [items, setItems] = useState(notifications);

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <MobileHeader
        title="Notifications"
        subtitle={`${items.filter(n => !n.read).length} unread`}
        rightAction={
          <button onClick={() => setItems(items.map(n => ({ ...n, read: true })))}
            className="text-xs text-[#2E75B6] font-semibold">
            Mark all read
          </button>
        }
      />
      <div className="divide-y divide-gray-50">
        {items.map(n => (
          <button key={n.id} onClick={() => setItems(items.map(i => i.id === n.id ? { ...i, read: true } : i))}
            className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              n.type === 'order' ? 'bg-[#EFF6FF]' : n.type === 'report' ? 'bg-green-100' : n.type === 'payment' ? 'bg-purple-100' : 'bg-gray-100'
            }`}>
              {n.type === 'order' ? <Briefcase size={18} className="text-[#1E3A5F]" /> :
               n.type === 'report' ? <FileText size={18} className="text-[#1A7A4A]" /> :
               n.type === 'payment' ? <TrendingUp size={18} className="text-purple-600" /> :
               <Bell size={18} className="text-gray-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-tight ${n.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
              <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
            </div>
            {!n.read && <div className="w-2 h-2 bg-[#2E75B6] rounded-full mt-2 flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Profile ──────────────────────────────────────────────────────────
function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const stats = [
    { label: 'Total Jobs', value: '127' }, { label: 'This Month', value: '14' },
    { label: 'Avg Score', value: '78' }, { label: 'Rating', value: '4.9' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <div className="bg-[#1E3A5F] px-5 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#2E75B6] flex items-center justify-center text-white font-bold text-xl">EO</div>
          <div>
            <p className="text-white font-bold text-lg">Emeka Okonkwo</p>
            <p className="text-blue-200 text-sm">Senior Inspector</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-300 text-xs font-medium">Active</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {stats.map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white font-bold text-base">{s.value}</p>
              <p className="text-blue-200 text-[9px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { icon: Shield, label: 'Certifications', sub: '3 active certifications', color: '#1A7A4A' },
            { icon: Award, label: 'Achievements', sub: '12 badges earned', color: '#D35400' },
            { icon: BarChart2, label: 'Performance', sub: 'View detailed stats', color: '#2E75B6' },
            { icon: Settings, label: 'Settings', sub: 'App preferences', color: '#6B7280' },
          ].map((item, i, arr) => (
            <button key={item.label} className={`w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E75B6] rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Zap size={20} className="text-white" />
            <div>
              <p className="text-white font-bold text-sm">Gemini AI Enabled</p>
              <p className="text-blue-200 text-xs">Powering defect analysis & report generation</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white text-xs font-medium">AI Features Active:</p>
            <div className="mt-2 space-y-1">
              {['Defect detection & severity', 'Report summary generation', 'Inspection guidance chat', 'Voice note transcription'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={11} className="text-green-400" />
                  <span className="text-blue-100 text-[11px]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-[#C0392B] rounded-2xl text-sm font-bold border border-red-100">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Main Inspector Mobile App ────────────────────────────────────────────────
export default function InspectorMobileApp() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [inspectScreen, setInspectScreen] = useState<InspectScreen>('job-list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  // Inspection state
  const [sections, setSections] = useState<InspectionSection[]>(INITIAL_SECTIONS);
  const [vehiclePhotos, setVehiclePhotos] = useState<PhotoItem[]>(VEHICLE_PHOTOS);
  const [damagePhotos, setDamagePhotos] = useState<DamagePhoto[]>([]);
  const [grades, setGrades] = useState<GradeCategory[]>(GRADE_CATEGORIES);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      toast('You are offline. Data saved locally.', { icon: '📶' });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleStartInspection = (job: Job) => {
    setSelectedJob(job);
    setActiveTab('Inspect');
    setInspectScreen('inspection-hub');
  };

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'Inspect' && inspectScreen === 'job-list') {
      setInspectScreen('job-list');
    }
  };

  const updateSection = (updated: InspectionSection) => {
    setSections(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const completeSection = (sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, status: 'complete' } : s));
    setInspectScreen('checklist');
    toast.success('Section completed!');
  };

  const renderInspectContent = () => {
    if (inspectScreen === 'job-list') {
      return <JobsScreen onStartInspection={handleStartInspection} />;
    }
    if (!selectedJob) return <JobsScreen onStartInspection={handleStartInspection} />;

    if (inspectScreen === 'inspection-hub') {
      return (
        <InspectionHub
          job={selectedJob}
          onBack={() => { setInspectScreen('job-list'); setActiveTab('Jobs'); }}
          onGoTo={setInspectScreen}
          sections={sections}
          vehiclePhotos={vehiclePhotos}
          damagePhotos={damagePhotos}
          grades={grades}
        />
      );
    }
    if (inspectScreen === 'vehicle-photos') {
      return (
        <VehiclePhotosScreen
          photos={vehiclePhotos}
          onUpdate={setVehiclePhotos}
          onBack={() => setInspectScreen('inspection-hub')}
          onComplete={() => { setInspectScreen('inspection-hub'); toast.success('Vehicle photos complete!'); }}
        />
      );
    }
    if (inspectScreen === 'checklist') {
      return (
        <ChecklistScreen
          sections={sections}
          onSelectSection={id => { setSelectedSectionId(id); setInspectScreen('section-detail'); }}
          onBack={() => setInspectScreen('inspection-hub')}
        />
      );
    }
    if (inspectScreen === 'section-detail' && selectedSectionId) {
      const section = sections.find(s => s.id === selectedSectionId);
      if (!section) return null;
      return (
        <SectionDetailScreen
          section={section}
          onUpdate={updateSection}
          onBack={() => setInspectScreen('checklist')}
          onComplete={() => completeSection(selectedSectionId)}
        />
      );
    }
    if (inspectScreen === 'damage-photos') {
      return (
        <DamagePhotosScreen
          photos={damagePhotos}
          onUpdate={setDamagePhotos}
          onBack={() => setInspectScreen('inspection-hub')}
          onComplete={() => { setInspectScreen('inspection-hub'); toast.success('Damage photos saved!'); }}
        />
      );
    }
    if (inspectScreen === 'grading') {
      return (
        <GradingScreen
          grades={grades}
          onUpdate={setGrades}
          sections={sections}
          onBack={() => setInspectScreen('inspection-hub')}
          onComplete={() => { setInspectScreen('inspection-hub'); toast.success('Grading complete!'); }}
        />
      );
    }
    if (inspectScreen === 'sync-review') {
      return (
        <ReviewScreen
          job={selectedJob}
          sections={sections}
          vehiclePhotos={vehiclePhotos}
          damagePhotos={damagePhotos}
          grades={grades}
          onBack={() => setInspectScreen('inspection-hub')}
          onSubmit={() => { setInspectScreen('job-list'); setActiveTab('Jobs'); }}
        />
      );
    }
    return null;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <HomeScreen onNavigate={handleTabChange} isOnline={isOnline} />;
      case 'Jobs': return <JobsScreen onStartInspection={handleStartInspection} />;
      case 'Inspect': return renderInspectContent();
      case 'Notifications': return <NotificationsScreen />;
      case 'Profile': return <ProfileScreen onLogout={() => toast('Signed out')} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col" style={{ maxWidth: 430, margin: '0 auto', position: 'relative' }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '13px', fontWeight: '600', borderRadius: '12px' },
        }}
      />

      {showOfflineBanner && !isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between z-40">
          <div className="flex items-center gap-2">
            <WifiOff size={14} />
            <span className="text-xs font-semibold">Offline — data saved to device</span>
          </div>
          <button onClick={() => setShowOfflineBanner(false)} className="text-white/80">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>

      <BottomNav active={activeTab} onChange={handleTabChange} isOnline={isOnline} />
    </div>
  );
}
