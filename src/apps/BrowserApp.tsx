import React, { useState, useEffect } from 'react';
import { Search, Globe, ChevronLeft, ChevronRight, RotateCcw, Home, X, Clock, ExternalLink, Bookmark } from 'lucide-react';

interface Tab {
  id: string;
  url: string;
  title: string;
  history: string[];
}

export const BrowserApp = () => {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('about:blank');
  const [history, setHistory] = useState<string[]>(['google.com', 'ravenport.edu/directory', 'wikipedia.org/wiki/Ravenport_University']);
  const [showHistory, setShowHistory] = useState(false);
  const [vin, setVin] = useState('');
  const [vinResult, setVinResult] = useState<any>(null);

  const navigateTo = (newUrl: string) => {
    let formattedUrl = newUrl.toLowerCase().trim();
    if (!formattedUrl.includes('.') && formattedUrl !== 'about:blank' && !formattedUrl.startsWith('http')) {
      // Treat as search
      formattedUrl = `google.com/search?q=${encodeURIComponent(newUrl)}`;
    }

    setCurrentUrl(formattedUrl);
    setUrl(formattedUrl === 'about:blank' ? '' : formattedUrl);

    // Do not add carinfo.com to history as requested
    if (formattedUrl !== 'about:blank' && !formattedUrl.includes('carinfo.com') && !history.includes(formattedUrl)) {
      setHistory(prev => [formattedUrl, ...prev.slice(0, 9)]);
    }
    setShowHistory(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      navigateTo(url.trim());
    }
  };

  const renderContent = () => {
    if (currentUrl === 'about:blank') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#1a1818]">
          <div className="w-20 h-20 bg-[#2a2522] rounded-3xl flex items-center justify-center mb-8 border border-[#3a3532] shadow-xl">
            <Globe size={40} className="text-[#5b8c6b]" />
          </div>

          <div className="w-full max-w-sm mb-12">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search or enter website"
                className="w-full bg-[#2a2522] rounded-2xl px-12 py-4 text-[#e8d8c8] outline-none border border-[#3a3532] shadow-inner focus:border-[#5b8c6b]/50 transition-colors"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49484]" size={20} />
            </form>
          </div>

          <div className="w-full max-w-sm grid grid-cols-4 gap-4">
            {[
              { name: 'Google', icon: 'G', color: '#4285F4', url: 'google.com' },
              { name: 'Wikipedia', icon: 'W', color: '#1a1818', url: 'wikipedia.org' },
              { name: 'Ravenport', icon: 'R', color: '#9c5b5b', url: 'ravenport.edu' },
              { name: 'YouTube', icon: 'Y', color: '#FF0000', url: 'youtube.com' }
            ].map(site => (
              <button
                key={site.name}
                onClick={() => navigateTo(site.url)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#2a2522] border border-[#3a3532] flex items-center justify-center text-xl font-bold transition-transform group-active:scale-95" style={{ color: site.color }}>
                  {site.icon}
                </div>
                <span className="text-[10px] text-[#a49484] font-medium">{site.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-12 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a49484]">Recent History</span>
              <button onClick={() => setHistory([])} className="text-[10px] text-[#5b8c6b] hover:underline">Clear</button>
            </div>
            <div className="space-y-2">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => navigateTo(h)}
                  className="w-full flex items-center gap-3 p-3 bg-[#2a2522]/50 hover:bg-[#2a2522] rounded-xl border border-[#3a3532]/30 transition-colors"
                >
                  <Clock size={14} className="text-[#a49484]" />
                  <span className="text-xs text-[#e8d8c8] truncate flex-1 text-left">{h}</span>
                  <ExternalLink size={12} className="text-[#a49484] opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Mock website views
    const isGoogle = currentUrl.includes('google.com');
    const isRavenport = currentUrl.includes('ravenport.edu');
    const isCarInfo = currentUrl.includes('carinfo.com');

    if (isCarInfo) {
      return (
        <div className="flex-1 bg-gray-50 overflow-y-auto text-black font-sans">
          <div className="bg-blue-900 p-4 text-white flex items-center gap-2 shadow-lg">
            <div className="bg-white p-1 rounded">
              <RotateCcw size={16} className="text-blue-900" />
            </div>
            <span className="font-black italic tracking-tighter text-xl">CARINFO.com</span>
            <div className="ml-auto flex gap-4 text-xs font-bold uppercase">
              <span>Decoder</span>
              <span>Values</span>
              <span>Reports</span>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-blue-900">Free VIN Decoder</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your 17-digit Vehicle Identification Number to get a detailed specification report.</p>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Enter 17-digit VIN..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-blue-900 uppercase tracking-widest font-mono text-sm"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  maxLength={17}
                />
                <button
                  onClick={() => {
                    // Mock VIN database
                    if (vin === '1HGCV1F12JA001234') {
                      setVinResult({
                        make: 'HONDA',
                        model: 'CIVIC TYPE-R',
                        year: '2023',
                        owner: 'Liam Keller',
                        address: '142 Oak St, Ravenport, CA',
                        status: 'Active',
                        plate: 'RVN-473'
                      });
                    } else if (vin === '4JGDA5HB1LA123456') {
                      setVinResult({
                        make: 'MERCEDES-BENZ',
                        model: 'GLE 350',
                        year: '2024',
                        owner: 'James Morrison',
                        address: '888 View Dr, Ravenport, CA',
                        status: 'Active',
                        plate: 'EXEC-01'
                      });
                    } else {
                      setVinResult({ error: 'VIN not found in North American database.' });
                    }
                  }}
                  className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 active:scale-[0.98] transition-all shadow-md"
                >
                  DECODE VIN
                </button>
              </div>
            </div>

            {vinResult && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Vehicle Report
                </div>
                <div className="p-6">
                  {vinResult.error ? (
                    <div className="text-red-500 font-bold text-center py-4">{vinResult.error}</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b pb-2">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase">Vehicle</div>
                          <div className="text-lg font-black text-blue-900">{vinResult.year} {vinResult.make}</div>
                          <div className="text-sm font-bold text-gray-600">{vinResult.model}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400 font-bold uppercase">Plate</div>
                          <div className="bg-yellow-100 border-2 border-black px-2 py-0.5 font-bold rounded shadow-sm">{vinResult.plate}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">Registered Owner</div>
                          <div className="text-sm font-bold">{vinResult.owner}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">Status</div>
                          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold inline-block">{vinResult.status}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-[10px] text-gray-400 font-bold uppercase">Registration Address</div>
                          <div className="text-sm font-medium">{vinResult.address}</div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-[10px] text-yellow-800 italic leading-snug">
                        Information provided by CARINFO is gathered from public records and insurance databases.
                        Data may have a latency of 24-48 hours.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-0 text-center text-[10px] text-gray-400">
            Powered by DMV-Connect and Axiom Data Services.
          </div>
        </div>
      );
    }

    if (isGoogle) {
      return (
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-4 flex flex-col items-center pt-20">
            <h1 className="text-4xl font-bold mb-8">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </h1>
            <div className="w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-full border border-gray-200 shadow-sm mb-8 text-black">
              <Search size={18} className="text-gray-400" />
              <span className="text-gray-600">{currentUrl.includes('q=') ? decodeURIComponent(currentUrl.split('q=')[1]) : 'Search...'}</span>
            </div>
            <div className="w-full space-y-6 px-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-5 bg-blue-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (isRavenport) {
      return (
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-0 flex flex-col items-stretch text-black">
            <div className="bg-[#9c5b5b] p-4 text-white font-bold flex justify-between items-center">
              <span>RAVENPORT UNIVERSITY</span>
              <Menu size={20} />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">Campus Directory</h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-100 rounded-lg shadow-sm">
                  <div className="font-bold">Security & Safety (RAS)</div>
                  <div className="text-sm text-gray-600 italic">North Campus Tower</div>
                  <div className="text-xs text-blue-600 mt-2">Emergency: 911</div>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg shadow-sm">
                  <div className="font-bold">Administrative Offices</div>
                  <div className="text-sm text-gray-600 italic">Founder's Hall</div>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg shadow-sm">
                  <div className="font-bold">Campus Library</div>
                  <div className="text-sm text-gray-600 italic">West Wing</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 mt-12 text-center text-xs text-gray-400 border-t border-gray-200">
              © 2026 Ravenport University. All Resident Monitoring in effect.
            </div>
          </div>
        </div>
      );
    }

    // Default Site Not Found for anything else
    return (
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Site Not Found</h2>
          <p className="text-gray-500 max-w-[240px]">The server at {currentUrl} could not be reached. It may be part of the restricted zone.</p>
          <button onClick={() => navigateTo('about:blank')} className="mt-8 text-blue-600 font-medium">Return home</button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] overflow-hidden">
      {/* Top Bar / Navigation */}
      <div className="px-4 py-3 bg-[#2a2522] border-b border-[#3a3532] shadow-md z-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-4 text-[#a49484]">
            <ChevronLeft
              size={22}
              className={`cursor-pointer ${currentUrl === 'about:blank' ? 'opacity-20' : 'hover:text-[#e8d8c8]'}`}
              onClick={() => navigateTo('about:blank')}
            />
            <ChevronRight size={22} className="opacity-20" />
            <RotateCcw
              size={18}
              className={`cursor-pointer ${currentUrl === 'about:blank' ? 'opacity-20' : 'hover:text-[#e8d8c8]'}`}
              onClick={() => navigateTo(currentUrl)}
            />
          </div>
          <div className="flex-1 bg-[#1a1818] rounded-xl px-4 py-2 flex items-center gap-2 border border-[#3a3532] group focus-within:border-[#5b8c6b]/50">
            {currentUrl === 'about:blank' ? <Search size={14} className="text-[#a49484]" /> : <Lock size={12} className="text-[#5b8c6b]" />}
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                className="w-full bg-transparent outline-none text-xs text-[#e8d8c8] placeholder-[#a49484]"
                placeholder="Search or enter website"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </form>
            {url && <X size={14} className="text-[#a49484] cursor-pointer" onClick={() => setUrl('')} />}
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {renderContent()}
      </div>

      {/* Toolbar */}
      <div className="px-8 py-3 bg-[#2a2522] border-t border-[#3a3532] flex justify-between items-center text-[#a49484] flex-shrink-0">
        <ChevronLeft
          size={24}
          className={`cursor-pointer ${currentUrl === 'about:blank' ? 'opacity-20' : 'hover:text-[#e8d8c8]'}`}
          onClick={() => navigateTo('about:blank')}
        />
        <ChevronRight size={24} className="opacity-20" />
        <div
          className="w-10 h-10 rounded-xl bg-[#1a1818] border border-[#3a3532] flex items-center justify-center cursor-pointer hover:border-[#5b8c6b]/50 group"
          onClick={() => navigateTo('about:blank')}
        >
          <Home size={20} className="group-hover:text-[#5b8c6b] transition-colors" />
        </div>
        <Bookmark size={22} className="cursor-pointer hover:text-[#e8d8c8]" />
        <div className="w-6 h-6 border-2 border-[#a49484] rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer hover:text-[#e8d8c8] hover:border-[#e8d8c8]">
          1
        </div>
      </div>
    </div>
  );
};

const Lock = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const Menu = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
