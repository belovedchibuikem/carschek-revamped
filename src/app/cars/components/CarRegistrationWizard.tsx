'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, User, Receipt, FileText, Check, ChevronRight, ChevronLeft, AlertTriangle, Upload, X, CheckCircle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const STEPS = [
  { label: 'Vehicle Details', icon: Car },
  { label: 'Seller Contact', icon: User },
  { label: 'Purchase Details', icon: Receipt },
  { label: 'Documents', icon: FileText },
];

const BRANDS = ['Toyota', 'Honda', 'Mercedes-Benz', 'Ford', 'Lexus', 'Hyundai', 'BMW', 'Audi', 'Kia', 'Nissan'];
const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
const COLOURS = ['White','Black','Silver','Grey','Blue','Red','Green','Brown','Gold','Beige','Orange','Yellow','Purple','Maroon','Navy','Pearl White'];
const DOCUMENTS = [
  { key: 'custom_clearance', name: 'Custom Clearance', required: true },
  { key: 'insurance_clearance', name: 'Insurance Clearance', required: true },
  { key: 'means_of_id', name: 'Means of Identification', required: true },
  { key: 'number_plate', name: 'Number Plate', required: true },
  { key: 'road_worthiness', name: 'Road Worthiness', required: true },
  { key: 'proof_of_ownership', name: 'Proof of Ownership', required: true },
  { key: 'plate_allocation', name: 'Plate Number Allocation', required: false },
  { key: 'purchase_receipt', name: 'Purchase Receipt', required: false },
];

interface DocUpload { file: File | null; comment: string; }

export default function CarRegistrationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState(false);

  // Step 1
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [transmission, setTransmission] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [colour, setColour] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');

  // Step 2
  const [contactType, setContactType] = useState('individual');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contactCity, setContactCity] = useState('');
  const [contactState, setContactState] = useState('');

  // Step 3
  const [purchaseChannel, setPurchaseChannel] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');

  // Step 4
  const [docs, setDocs] = useState<Record<string, DocUpload>>(
    Object.fromEntries(DOCUMENTS.map(d => [d.key, { file: null, comment: '' }]))
  );

  const uploadedCount = Object.values(docs).filter(d => d.file).length;

  const handleVinBlur = () => {
    if (vin.length === 17 && vin.toUpperCase().startsWith('JTDBE')) {
      setDuplicateAlert(true);
    }
  };

  const handleDocUpload = (key: string, file: File | null) => {
    setDocs(d => ({ ...d, [key]: { ...d[key], file } }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-[#1F2937]">Car Registered!</h2>
          <p className="text-[#6B7280] mt-1 text-lg font-semibold">CK-42</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => router.push('/cars/1')} className="flex flex-col items-center gap-2 p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#1E3A5F] hover:bg-[#F8FAFC] transition-all">
            <Car size={20} className="text-[#1E3A5F]" />
            <span className="text-xs font-semibold text-[#374151]">View Car Details</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#1E3A5F] hover:bg-[#F8FAFC] transition-all">
            <FileText size={20} className="text-purple-600" />
            <span className="text-xs font-semibold text-[#374151]">Link Inspection</span>
          </button>
          <button onClick={() => { setSubmitted(false); setStep(0); setBrand(''); setModel(''); setVin(''); setPlate(''); }} className="flex flex-col items-center gap-2 p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#1E3A5F] hover:bg-[#F8FAFC] transition-all">
            <Plus size={20} className="text-teal-600" />
            <span className="text-xs font-semibold text-[#374151]">Register Another</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h1 className="text-xl font-heading font-bold text-[#1F2937] mb-6">Register New Car</h1>
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-green-500 border-green-500' : active ? 'bg-[#1E3A5F] border-[#1E3A5F]' : 'bg-white border-[#D1D5DB]'}`}>
                    {done ? <Check size={16} className="text-white" /> : <Icon size={16} className={active ? 'text-white' : 'text-[#9CA3AF]'} />}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-[#1E3A5F]' : done ? 'text-green-600' : 'text-[#9CA3AF]'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${i < step ? 'bg-green-400' : 'bg-[#E5E7EB]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        {/* STEP 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-heading font-bold text-[#1F2937]">Vehicle Details</h2>
            {duplicateAlert && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">⚠ Potential Duplicate Detected</p>
                  <p className="text-sm text-amber-700 mt-0.5">A car with this VIN already exists: <strong>CK-41 — Toyota Camry 2011</strong></p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700">View Existing Car</button>
                    <button onClick={() => setDuplicateAlert(false)} className="px-3 py-1.5 border border-amber-300 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100">Continue Anyway</button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Brand *</label>
                  <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white">
                    <option value="">Select brand...</option>
                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Car Model *</label>
                  <select value={model} onChange={e => setModel(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white">
                    <option value="">Select model...</option>
                    {brand === 'Toyota' && ['Camry','Corolla','Highlander','RAV4','Prado'].map(m => <option key={m}>{m}</option>)}
                    {brand === 'Honda' && ['Accord','Civic','CR-V','Pilot','HR-V'].map(m => <option key={m}>{m}</option>)}
                    {!brand && <option disabled>Select a brand first</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Year *</label>
                  <select value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white">
                    <option value="">Select year...</option>
                    {Array.from({ length: 35 }, (_, i) => 2024 - i).map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Transmission *</label>
                  <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
                    {['Automatic','Manual','CVT'].map(t => (
                      <button key={t} onClick={() => setTransmission(t)} className={`flex-1 py-2 text-sm font-medium transition-all ${transmission === t ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#6B7280] hover:bg-[#F4F6F8]'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Body Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['Sedan','SUV','Hatchback','Pickup','Van','Other'].map(t => (
                      <button key={t} onClick={() => setBodyType(t)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${bodyType === t ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1E3A5F]'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Colour *</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOURS.map(c => (
                      <button key={c} onClick={() => setColour(c)} className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${colour === c ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1E3A5F]'}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Mileage (km) *</label>
                  <input value={mileage} onChange={e => setMileage(e.target.value)} placeholder="e.g. 45,000" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">VIN * <span className="text-[#9CA3AF] font-normal">(17 characters)</span></label>
                  <input value={vin} onChange={e => setVin(e.target.value.toUpperCase())} onBlur={handleVinBlur} placeholder="e.g. JTDBE32K913012345" maxLength={17} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                  <p className="text-[10px] text-[#9CA3AF] mt-1">{vin.length}/17 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Licence Plate *</label>
                  <input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="e.g. LSD260JE" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Engine Number</label>
                  <input value={engineNo} onChange={e => setEngineNo(e.target.value)} placeholder="Engine number" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Registered City</label>
                  <input value={regCity} onChange={e => setRegCity(e.target.value)} placeholder="City" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Registered State</label>
                  <select value={regState} onChange={e => setRegState(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white">
                    <option value="">Select state...</option>
                    {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-heading font-bold text-[#1F2937]">Seller Contact</h2>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">Contact Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {['individual','dealer','corporate'].map(t => (
                  <button key={t} onClick={() => setContactType(t)} className={`p-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${contactType === t ? 'border-[#1E3A5F] bg-[#EFF6FF] text-[#1E3A5F]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#1E3A5F]/40'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">First Name *</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Last Name *</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Phone *</label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-[#F4F6F8] border border-r-0 border-[#E5E7EB] rounded-l-lg text-sm text-[#6B7280]">+234</span>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="8012345678" maxLength={10} className="flex-1 px-3 py-2.5 border border-[#E5E7EB] rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">City</label>
                <input value={contactCity} onChange={e => setContactCity(e.target.value)} placeholder="City" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">State</label>
                <select value={contactState} onChange={e => setContactState(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white">
                  <option value="">Select state...</option>
                  {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-heading font-bold text-[#1F2937]">Purchase Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Purchase Channel *</label>
                  <select value={purchaseChannel} onChange={e => setPurchaseChannel(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white">
                    <option value="">Select channel...</option>
                    {['Auction','Market Place','Offline','B2B','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Purchase Date *</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Sales Person *</label>
                  <select className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white">
                    <option>Promise Ndem</option>
                    <option>Adaeze Mensah</option>
                    <option>Chidi Okafor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Location *</label>
                  <select value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white">
                    <option value="">Select location...</option>
                    {['Lagos','Abuja','Port Harcourt','Other'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Purchase Price (₦) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] font-semibold text-sm">₦</span>
                    <input value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="5,000,000" className="w-full pl-8 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Partner / Agent</label>
                  <input placeholder="Agent name (optional)" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Comment</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="Any additional notes..." className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] resize-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">Upload Documents</h2>
              <span className="text-sm text-[#6B7280]">{uploadedCount} of {DOCUMENTS.length} uploaded</span>
            </div>
            <div className="w-full bg-[#F4F6F8] rounded-full h-2">
              <div className="bg-[#1E3A5F] h-2 rounded-full transition-all" style={{ width: `${(uploadedCount / DOCUMENTS.length) * 100}%` }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOCUMENTS.map(doc => {
                const d = docs[doc.key];
                return (
                  <div key={doc.key} className="border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#1F2937]">{doc.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{doc.required ? 'Required' : 'Optional'}</span>
                    </div>
                    {d.file ? (
                      <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-600" />
                          <span className="text-xs font-medium text-green-700 truncate max-w-[140px]">{d.file.name}</span>
                        </div>
                        <button onClick={() => handleDocUpload(doc.key, null)} className="text-[#9CA3AF] hover:text-red-500"><X size={14} /></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#D1D5DB] rounded-lg cursor-pointer hover:border-[#1E3A5F] hover:bg-[#F8FAFC] transition-all">
                        <Upload size={18} className="text-[#9CA3AF]" />
                        <span className="text-xs text-[#6B7280]">Drag & drop or <span className="text-[#1E3A5F] font-semibold">Select File</span></span>
                        <input type="file" className="hidden" onChange={e => handleDocUpload(doc.key, e.target.files?.[0] ?? null)} />
                      </label>
                    )}
                    <textarea
                      value={d.comment}
                      onChange={e => setDocs(prev => ({ ...prev, [doc.key]: { ...prev[doc.key], comment: e.target.value } }))}
                      placeholder="Add note about this document..."
                      rows={2}
                      className="w-full px-2.5 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]/20 resize-none text-[#6B7280]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer */}
      <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#6B7280] font-medium">Step {step + 1} of {STEPS.length}</span>
          <button className="text-sm text-[#2E75B6] hover:underline font-medium">Save as Draft</button>
        </div>
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-lg hover:bg-[#F4F6F8] transition-all">
              <ChevronLeft size={15} /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all active:scale-[0.98]">
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-all active:scale-[0.98]">
              <CheckCircle size={15} /> Submit & Register Car
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Plus({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
