import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Star, Phone, Mail, Briefcase, Calendar, CheckCircle, MapPin, ChevronRight } from 'lucide-react';
import VanillaTilt from 'vanilla-tilt';

const StarRating = ({ rating, setRating, interactive = true, size = 20 }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && setRating(i)}
          className="transition-transform hover:scale-125"
        >
          <Star
            size={size}
            className={`cursor-pointer transition-colors ${
              i <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-400'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function ProviderDetails() {
  const { providerid } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardRefs = useRef([]);

  /* contact form */
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSending, setContactSending] = useState(false);

  /* review form */
  const [reviewName, setReviewName] = useState('');
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSending, setReviewSending] = useState(false);

  /* reviews list (local) */
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProvider = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/providers/${providerid}`);
        if (!res.ok) throw new Error('Provider not found');
        const { data } = await res.json();
        setProvider(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [providerid]);

  // Initialize tilt effect
  useEffect(() => {
    cardRefs.current.forEach(el => el && VanillaTilt.init(el, { 
      max: 5, 
      speed: 300, 
      glare: true, 
      'max-glare': 0.1 
    }));
  }, [provider]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setContactSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setContactName('');
    setContactMsg('');
    setContactSending(false);
    alert('Message sent!');
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setReviews([...reviews, { 
      id: Date.now(), 
      name: reviewName, 
      stars: reviewStars, 
      text: reviewText,
      date: new Date().toLocaleDateString() 
    }]);
    setReviewName('');
    setReviewStars(0);
    setReviewText('');
    setReviewSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-32 w-32 rounded-full bg-slate-800" />
                  <Skeleton className="h-6 w-3/4 mt-4 bg-slate-800" />
                  <Skeleton className="h-4 w-1/2 mt-2 bg-slate-800" />
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/3 bg-slate-800" />
                      <Skeleton className="h-4 w-full bg-slate-800" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full bg-slate-800" />
                  <Skeleton className="h-24 w-full bg-slate-800" />
                  <Skeleton className="h-10 w-full bg-slate-800" />
                </div>
              </div>
            </div>
            
            {/* Main Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-10 w-1/4 bg-slate-800" />
              <Skeleton className="h-40 w-full bg-slate-800 rounded-xl" />
              
              <Skeleton className="h-10 w-1/4 bg-slate-800" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full bg-slate-800 rounded-xl" />
                ))}
              </div>
              
              <Skeleton className="h-10 w-1/4 bg-slate-800" />
              <div className="space-y-4">
                <Skeleton className="h-40 w-full bg-slate-800 rounded-xl" />
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full bg-slate-800 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 flex items-center justify-center">
        <div className="max-w-md glass-card p-6 rounded-2xl text-center">
          <div className="bg-red-500/20 border border-red-400/50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 text-red-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Fixed Sidebar - Provider Info */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 lg:h-[calc(100vh-6rem)]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl h-full flex flex-col"
            >
              <div className="p-6 flex flex-col items-center">
                <Avatar className="w-32 h-32 ring-4 ring-slate-800/50 shadow-lg mb-4">
                  <AvatarImage src={provider.profile?.avatar} />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                    {provider.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-center">{provider.name}</h2>
                <p className="text-cyan-400 text-center">{provider.profile?.profession}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={4.5} setRating={() => {}} interactive={false} />
                  <span className="text-sm text-slate-400">4.5 (24)</span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-grow">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">City</p>
                      <p className="text-white">{provider.profile?.city}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 mt-0.5 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">Phone</p>
                      <p className="text-white">{provider.profile?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 mt-0.5 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">Email</p>
                      <p className="text-white">{provider.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 mt-0.5 text-cyan-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">Experience</p>
                      <p className="text-white">{provider.profile?.years_of_experience} years</p>
                    </div>
                  </div>
                </div>

                {provider.profile?.is_approved && (
                  <div className="mt-4 flex items-center gap-2 bg-cyan-500/10 text-cyan-400 p-3 rounded-lg border border-cyan-400/20">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Verified Professional</span>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-800">
                <h3 className="font-medium text-slate-300 mb-3">Contact Directly</h3>
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-400"
                  />
                  <Textarea
                    placeholder="Your message"
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-400"
                  />
                  <Button
                    type="submit"
                    disabled={contactSending}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                  >
                    {contactSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Scrollable Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* About Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                    About Me
                  </h2>
                  <p className="text-slate-300">
                    {provider.profile?.bio || 'No bio available yet.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Services Section */}
            {provider.services?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
                      My Services
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {provider.services.map((service, i) => (
                        <motion.div
                          key={service.id}
                          ref={el => (cardRefs.current[i] = el)}
                          className="glass-card rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-400/30 transition-colors"
                          whileHover={{ y: -5 }}
                        >
                          <Link to={`/services/${service.id}`} className="block h-full p-5">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400">
                                {service.title}
                              </h3>
                              <Badge variant="outline" className="text-xs border-cyan-400/50 text-cyan-300">
                                {service.category}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-slate-400 mt-2 line-clamp-2">{service.description}</p>
                            
                            <div className="mt-4 flex items-center justify-between">
                              <div className="text-sm text-slate-300">
                                <span className="font-bold text-white">{service.min_duration || '--'}</span> min minimum
                              </div>
                              <div className="text-sm text-cyan-400 flex items-center">
                                Details <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
                    Client Reviews
                  </h2>
                  
                  {/* Add Review Form */}
                  <div className="glass-card p-5 rounded-xl border border-slate-700 mb-8">
                    <h3 className="font-medium text-white mb-4">Add Your Review</h3>
                    <form onSubmit={handleAddReview} className="space-y-4">
                      <Input
                        placeholder="Your name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        required
                        className="bg-slate-800/50 border-slate-700 focus:border-cyan-400"
                      />
                      <StarRating rating={reviewStars} setRating={setReviewStars} size={24} />
                      <Textarea
                        placeholder="Share your experience..."
                        rows={3}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        className="bg-slate-800/50 border-slate-700 focus:border-cyan-400"
                      />
                      <Button
                        type="submit"
                        disabled={reviewSending || !reviewName || !reviewText || reviewStars === 0}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        {reviewSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                      </Button>
                    </form>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      [...reviews].reverse().map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-card p-5 rounded-xl border border-slate-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-white">{review.name}</p>
                              <p className="text-xs text-slate-500 mt-1">{review.date}</p>
                            </div>
                            <StarRating rating={review.stars} setRating={() => {}} interactive={false} />
                          </div>
                          <p className="text-slate-300 mt-3">{review.text}</p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="glass-card p-8 text-center rounded-xl border border-slate-700">
                        <Star className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-1">No reviews yet</h3>
                        <p className="text-slate-400">Be the first to review this provider</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
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