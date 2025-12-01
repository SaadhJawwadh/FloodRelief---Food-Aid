import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { extractFoodRequests, searchAndExtractFoodRequests } from './services/geminiService';
import { FoodRequest, UrgencyLevel } from './types';
import { SAMPLE_RAW_DATA } from './constants';
import RequestCard from './components/RequestCard';
import StatsBoard from './components/StatsBoard';
import RequestDetailsModal from './components/RequestDetailsModal';
import { 
  Waves, 
  Search, 
  RefreshCcw, 
  ClipboardList, 
  UtensilsCrossed,
  AlertTriangle,
  FileText,
  Globe,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  DownloadCloud,
  MapPin
} from 'lucide-react';

type SortField = 'urgency' | 'timestamp' | 'peopleCount' | 'location';
type SortDirection = 'asc' | 'desc';

const CACHE_KEY = 'flood_requests_cache';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<string>('');
  
  // Initialize state from local storage
  const [requests, setRequests] = useState<FoodRequest[]>(() => {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load cache:', error);
      return [];
    }
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSource, setLoadingSource] = useState<'manual' | 'web' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input'>('dashboard');

  // Sorting and Filtering State
  const [sortField, setSortField] = useState<SortField>('urgency');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [locationFilter, setLocationFilter] = useState<string>('');
  
  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<FoodRequest | null>(null);

  // Save to local storage whenever requests change
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(requests));
  }, [requests]);

  const handleExtract = useCallback(async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    
    setLoading(true);
    setLoadingSource('manual');
    setError(null);
    try {
      const data = await extractFoodRequests(textToProcess);
      setRequests(prev => [...data, ...prev]); // Prepend new items
      setActiveTab('dashboard');
      setRawData(''); // Clear input on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setLoadingSource(null);
    }
  }, []);

  const handleWebFetch = useCallback(async () => {
    setLoading(true);
    setLoadingSource('web');
    setError(null);
    try {
      const data = await searchAndExtractFoodRequests();
      setRequests(prev => [...data, ...prev]);
      setActiveTab('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch from web');
    } finally {
      setLoading(false);
      setLoadingSource(null);
    }
  }, []);

  const handleSampleData = () => {
    setRawData(SAMPLE_RAW_DATA);
    setActiveTab('input');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all saved requests? This cannot be undone.')) {
      setRequests([]);
      localStorage.removeItem(CACHE_KEY);
    }
  };

  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests];

    // Filter by location
    if (locationFilter.trim()) {
      const term = locationFilter.toLowerCase();
      result = result.filter(r => r.location.toLowerCase().includes(term));
    }

    // Sort
    return result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'urgency':
          const urgencyWeight = {
            [UrgencyLevel.CRITICAL]: 4,
            [UrgencyLevel.HIGH]: 3,
            [UrgencyLevel.MODERATE]: 2,
            [UrgencyLevel.LOW]: 1
          };
          comparison = urgencyWeight[a.urgency] - urgencyWeight[b.urgency];
          break;
        case 'peopleCount':
          comparison = a.peopleCount - b.peopleCount;
          break;
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'location':
          comparison = a.location.localeCompare(b.location);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [requests, sortField, sortDirection, locationFilter]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
        />
      )}

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">FloodRelief</h1>
                <span className="text-xs text-blue-600 font-medium">Food Distribution Coordinator</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('input')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'input' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Input Data
              </button>
              
              <div className="h-6 w-px bg-slate-200 mx-1"></div>

              <button
                onClick={handleWebFetch}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-white shadow-sm ${
                  loading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                 {loading && loadingSource === 'web' ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                 ) : (
                   <Globe className="w-4 h-4" />
                 )}
                 Fetch New Data
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Error */}
        {error && activeTab === 'dashboard' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 animate-fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Input Section */}
        {activeTab === 'input' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Process Incoming Requests</h2>
                  <p className="text-sm text-slate-500">Paste unstructured text from social media, emails, or websites.</p>
                </div>
                <button 
                  onClick={handleSampleData}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Load Sample Data
                </button>
              </div>
              
              <div className="p-6">
                <textarea
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder="Paste flood relief requests here (e.g., 'Urgent: 5 families stuck in Sylhet need rice...')"
                  className="w-full h-64 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm font-mono leading-relaxed"
                />
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setRawData('')}
                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => handleExtract(rawData)}
                    disabled={loading || !rawData.trim()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                      loading || !rawData.trim() 
                        ? 'bg-slate-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {loading && loadingSource === 'manual' ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Identify Food Requests
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Section */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Loading State for Web Fetch */}
            {loading && loadingSource === 'web' && (
               <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center animate-pulse">
                 <Globe className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-bounce" />
                 <h3 className="text-lg font-medium text-emerald-800">Scanning floodsupport.org...</h3>
                 <p className="text-emerald-600 text-sm">Searching specifically for food and water distribution needs.</p>
               </div>
            )}

            {/* Empty State */}
            {requests.length === 0 && !loading && (
               <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                 <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <UtensilsCrossed className="w-8 h-8 text-slate-400" />
                 </div>
                 <h3 className="text-lg font-medium text-slate-900">No Food Requests Found</h3>
                 <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                   Import data manually or fetch live requests from supported relief websites.
                 </p>
                 <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => setActiveTab('input')}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                      Input Manual Data
                    </button>
                    <button 
                        onClick={handleWebFetch}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <Globe className="w-4 h-4" />
                      Fetch New Data
                    </button>
                 </div>
               </div>
            )}

            {/* Stats */}
            {requests.length > 0 && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-500" />
                      Live Overview
                    </h2>
                    <span className="text-sm font-medium bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                      Total: {requests.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleWebFetch}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      Fetch More
                    </button>
                    <button 
                      onClick={handleClearData}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Data
                    </button>
                  </div>
                </div>
                
                <StatsBoard requests={requests} />
                
                {/* Sort & Filter Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-8 mb-4">
                  <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                    
                    <div className="min-w-[200px]">
                      <h2 className="text-lg font-bold text-slate-800">Request Feed</h2>
                      <div className="flex gap-3 text-xs mt-1">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Moderate</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                      {/* Filter By Location */}
                      <div className="relative w-full md:w-64">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Search className="h-4 w-4 text-slate-400" />
                         </div>
                         <input
                            type="text"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            placeholder="Filter by location..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                         />
                      </div>

                      <div className="h-auto w-px bg-slate-200 hidden md:block mx-1"></div>

                      {/* Sort Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                          <ArrowUpDown className="w-4 h-4" />
                          <span className="hidden sm:inline">Sort by:</span>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <select 
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value as SortField)}
                            className="w-full md:w-auto pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="urgency">Urgency</option>
                            <option value="timestamp">Date Recieved</option>
                            <option value="peopleCount">People Impacted</option>
                            <option value="location">Location Name</option>
                          </select>
                          
                          <button 
                            onClick={toggleSortDirection}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shrink-0"
                            title={sortDirection === 'asc' ? 'Ascending Order' : 'Descending Order'}
                          >
                            {sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedRequests.length > 0 ? (
                    filteredAndSortedRequests.map((req) => (
                      <RequestCard 
                        key={req.id} 
                        request={req} 
                        onViewDetails={setSelectedRequest}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                        <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-lg font-medium text-slate-600">No requests found</p>
                        <p className="text-sm">No results match your location filter "{locationFilter}"</p>
                        <button 
                          onClick={() => setLocationFilter('')}
                          className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          Clear filter
                        </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;