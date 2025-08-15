import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Search, Filter, X, MapPin, Award, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProvidersMap from '@/components/ProvidersMap';
import VanillaTilt from 'vanilla-tilt';
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);

  /* ---------- data fetch ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providersRes, servicesRes] = await Promise.all([
          axios.get('http://localhost:8000/api/providers'),
          axios.get('http://localhost:8000/api/services')
        ]);

        const processed = (providersRes.data.data?.data || providersRes.data.data || []).map(p => ({
          ...p,
          avatar: p.profile?.avatar?.startsWith('http') 
            ? p.profile.avatar 
            : p.profile?.avatar 
              ? `http://localhost:8000/storage/${p.profile.avatar}`
              : '/default-avatar.jpg',
          profession: p.profile?.profession || 'Professional',
          location: p.profile?.location || 'Unknown location',
          years_of_experience: p.profile?.years_of_experience || 0,
          is_approved: p.profile?.is_approved || false,
          services: p.services?.map(s => s.category) || []
        }));
        
        setProviders(processed);
        setServices([...new Set((servicesRes.data.data?.data || servicesRes.data.data || []).map(s => s.category))]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ---------- refs for tilt ---------- */
  const cardRefs = useRef([]);
  useEffect(() => {
    cardRefs.current.forEach(el => el && VanillaTilt.init(el, { max: 8, speed: 300, glare: true, 'max-glare': 0.2 }));
    return () => {
      cardRefs.current.forEach(el => el?.vanillaTilt?.destroy());
    };
  }, [providers]);

  /* ---------- filters ---------- */
  const toggleCategory = cat =>
    setSelectedCategories(prev => (prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]));
  const toggleRating = r => setSelectedRating(prev => (prev === r ? null : r));
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedRating(null);
  };

  const filtered = providers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       p.profession.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategories.length === 0 || 
                    selectedCategories.some(c => p.services?.includes(c));
    const matchRating = !selectedRating || (p.rating || 0) >= selectedRating;
    return matchSearch && matchCat && matchRating;
  });

  /* ---------- skeleton ---------- */
  const ProviderSkeleton = () => (
    <Card className="glass-card p-5">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mt-4" />
      <Skeleton className="h-10 w-full mt-4 rounded-lg" />
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.section 
          initial={{ opacity: 0, y: -30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-12">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Premium</span> Providers
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Discover vetted professionals ready to elevate your home experience.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search + Filter Bar */}
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name, profession or location..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-cyan-400"
                >
                  <Filter className="w-4 h-4" /> 
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>

              {/* Expandable Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-slate-700 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-slate-300">Service Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {services.map(cat => (
                            <Badge
                              key={cat}
                              variant={selectedCategories.includes(cat) ? 'default' : 'outline'}
                              onClick={() => toggleCategory(cat)}
                              className={`cursor-pointer transition ${selectedCategories.includes(cat) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'hover:bg-slate-700'}`}
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-slate-300">Minimum Rating</h4>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(r => (
                            <button
                              key={r}
                              onClick={() => toggleRating(r)}
                              className={`flex items-center px-3 py-1 rounded-full border transition ${selectedRating === r
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                  : 'border-slate-600 hover:bg-slate-700'
                                }`}
                            >
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="ml-1 text-sm">{r}+</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={clearFilters} 
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          Clear all filters
                        </Button>
                        <div className="text-xs text-slate-500">
                          {selectedCategories.length > 0 || selectedRating ? `${filtered.length} results` : ''}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">
                Showing {filtered.length} of {providers.length} professionals
              </div>
              <div className="text-xs text-slate-500">
                Sorted by: <span className="text-cyan-400">Best Match</span>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => <ProviderSkeleton key={i} />)}
              </div>
            ) : filtered.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    ref={el => (cardRefs.current[i] = el)}
                    className={`glass-card rounded-2xl overflow-hidden flex flex-col p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-400/30 ${activeProvider === p.id ? 'ring-2 ring-cyan-400' : ''}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setActiveProvider(p.id)}
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Avatar with status */}
                      <div className="flex-shrink-0 flex justify-center">
                        <motion.div
                          whileHover={{ rotate: 7 }}
                          className="relative w-20 h-20 md:w-24 md:h-24"
                        >
                          <Avatar className="w-full h-full">
                            <AvatarImage src={p.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                              {p.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {p.is_approved && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Core info */}
                      <div className="flex-1 text-center md:text-left space-y-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">{p.name}</h3>
                          <p className="text-sm text-cyan-300 font-light tracking-wide">{p.profession}</p>
                        </div>

                        {/* Location */}
                        <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span>{p.location}</span>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-center md:justify-start gap-4 text-xs">
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4" />
                            {(p.rating || 0).toFixed(1)}
                          </span>
                          <span className="text-slate-400">{p.reviews_count || 0} reviews</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {p.years_of_experience} yrs exp
                          </span>
                        </div>

                        {/* Service tags */}
                        <div className="mt-2 flex flex-wrap gap-1 justify-center md:justify-start">
                          {p.services?.slice(0, 4).map((s, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-[10px] md:text-xs border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                            >
                              {s}
                            </Badge>
                          ))}
                          {p.services?.length > 4 && (
                            <Badge variant="outline" className="text-[10px] md:text-xs border-slate-600 text-slate-400">
                              +{p.services.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CTA and price */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-slate-300">
                        <span className="text-lg font-bold text-white">${p.hourly_rate || '--'}</span>/hour
                      </div>
                      <Link 
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full px-5 py-2 text-sm"
                        to={`/providers/${p.id}`}
                      >
                        Book Now
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center rounded-2xl">
                <Search className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">No providers found</h3>
                <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
                <Button variant="outline" onClick={clearFilters} className="text-cyan-400 hover:text-cyan-300">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Right Map */}
          <div className="lg:col-span-1 sticky top-24 h-[calc(100vh-120px)]">
            <div className="glass-card h-full rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Provider Locations
                </h3>
                <div className="text-xs text-slate-400">
                  {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                </div>
              </div>
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <svg className="w-12 h-12 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <div className="flex-1">
                  <ProvidersMap 
                    providers={filtered} 
                    activeProvider={activeProvider}
                    onMarkerClick={setActiveProvider}
                  />
                </div>
              )}
              {/* Map Legend */}
              <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
                <div className="text-center items-center justify-between text-xs text-slate-400">
                  in this map only approved and verified Service providers can be located
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(10px) saturate(120%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .glass-card:hover {
          border-color: rgba(255,255,255,0.12);
        }
      `}</style>
    </div>
  );
}