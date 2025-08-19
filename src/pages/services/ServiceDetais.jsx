// src/components/ServiceDetails.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VanillaTilt from 'vanilla-tilt';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2, X, MessageCircle } from 'lucide-react';
import {
  Loader2,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

/* shadcn ui */
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/* reusable star component (glass style) */
const StarRating = ({ rating, setRating, interactive = true, size = 20 }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && setRating(i)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={`cursor-pointer transition-colors ${
              i <= (hover || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-slate-500'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// WhatsApp Floating Button Component
const WhatsAppFloat = ({ phoneNumber }) => {
  if (!phoneNumber) return null;
  
  // Format phone number for WhatsApp URL (remove any non-digit characters)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedPhone}`;
  
  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 bg-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: [0, -10, 0] // Floating animation
      }}
      transition={{ 
        duration: 0.5,
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2,
          ease: "easeInOut"
        },
        hover: {
          scale: 1.1,
          transition: { duration: 0.2 }
        }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MessageCircle size={28} className="fill-white" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
        <MessageCircle size={12} />
      </span>
    </motion.a>
  );
};

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlreadyRatedAlert, setShowAlreadyRatedAlert] = useState(false);
  const alertTimerRef = useRef(null);
  
  /* review form */
  const [newRating, setNewRating] = useState({ rating: 5, comment: '' });
  const [editingRating, setEditingRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /* auth */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  /* tilt */
  const cardRefs = useRef([]);

  /* scroll animation */
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  /* ---------------- business logic (unchanged) ---------------- */
  useEffect(() => {
    const t = localStorage.getItem('access_token');
    if (t) {
      setIsLoggedIn(true);
      setCurrentUser({ id: 1, name: 'Current User' });
    }
  }, []);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8000/api/services/${id}`);
        setService(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch service details');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleRatingChange = (value) =>
    setNewRating((prev) => ({ ...prev, rating: value }));
  const handleCommentChange = (e) =>
    setNewRating((prev) => ({ ...prev, comment: e.target.value }));

  const handleSubmitRating = async () => {
    if (!isLoggedIn) {
      setSubmitError('You must be logged in to submit a rating');
      return;
    }
    
    // Check if user has already rated this service (and not editing)
    if (userRating && !editingRating) {
      setShowAlreadyRatedAlert(true);
      
      // Clear any existing timer
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
      
      // Auto-dismiss after 4 seconds
      alertTimerRef.current = setTimeout(() => {
        setShowAlreadyRatedAlert(false);
      }, 4000);
      
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const endpoint = editingRating
        ? `http://localhost:8000/api/ratings/${editingRating.id}`
        : `http://localhost:8000/api/services/${id}/ratings`;
      const method = editingRating ? 'put' : 'post';
      const body = { rating: newRating.rating, comment_text: newRating.comment };

      const { data } = await axios[method](endpoint, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });

      if (editingRating) {
        setService((s) => ({
          ...s,
          ratings: s.ratings.map((r) => (r.id === editingRating.id ? data.data : r)),
        }));
      } else {
        setService((s) => ({
          ...s,
          ratings: [...s.ratings, data.data],
          average_rating:
            (s.average_rating * s.ratings.length + newRating.rating) /
            (s.ratings.length + 1),
          total_ratings: s.total_ratings + 1,
        }));
      }
      setNewRating({ rating: 5, comment: '' });
      setEditingRating(null);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRating = (rating) => {
    setEditingRating(rating);
    setNewRating({ rating: rating.rating, comment: rating.comment || '' });
  };

  const handleDeleteRating = async (ratingId) => {
    try {
      await axios.delete(`http://localhost:8000/api/ratings/${ratingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      const removed = service.ratings.find((r) => r.id === ratingId);
      const filtered = service.ratings.filter((r) => r.id !== ratingId);
      setService((s) => ({
        ...s,
        ratings: filtered,
        average_rating:
          filtered.length > 0
            ? ((s.average_rating * s.ratings.length - removed.rating) /
                (s.ratings.length - 1))
            : 0,
        total_ratings: s.total_ratings - 1,
      }));
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to delete rating');
    }
  };

  const userRating =
    isLoggedIn && currentUser && service
      ? service.ratings.find((r) => r.user_id === currentUser.id)
      : null;

  /* ---------------- tilt effect ---------------- */
  useEffect(() => {
    cardRefs.current.forEach((el) =>
      el &&
      VanillaTilt.init(el, { max: 5, speed: 300, glare: true, 'max-glare': 0.1 })
    );
   
  }, [service]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, []);

  /* ---------------- skeleton ---------------- */
  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-32 w-32 rounded-full bg-slate-800" />
                  <Skeleton className="h-6 w-3/4 mt-4 bg-slate-800" />
                  <Skeleton className="h-4 w-1/2 mt-2 bg-slate-800" />
                </div>
                <Skeleton className="h-40 w-full bg-slate-800 rounded-xl" />
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-10 w-1/4 bg-slate-800" />
              <Skeleton className="h-40 w-full bg-slate-800 rounded-xl" />
              <Skeleton className="h-10 w-1/4 bg-slate-800" />
              <Skeleton className="h-40 w-full bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center max-w-sm">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            Retry
          </Button>
        </div>
      </div>
    );

  /* ---------------- render ---------------- */
  return (
    <div className="min-h-screen  bg-slate-900 text-slate-100">
      <div className="max-w-7xl  mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ---------- LEFT / SCROLLABLE ---------- */}
        <main className="mt-20 lg:col-span-3 overflow-y-auto h-screen lg:h-auto pb-20">
          {/* hero image + overlay */}
          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative rounded-b-2xl lg:rounded-2xl overflow-hidden"
          >
            <img
              src={`http://localhost:8000/storage/${service.image}` || 'https://via.placeholder.com/1200x600'}
              alt={service.title}
              className="w-full h-72 md:h-96 object-cover"
            />
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/50 to-black/80" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-2xl"
              >
                {service.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 max-w-2xl text-sm md:text-base text-slate-200 drop-shadow-md"
              >
                {service.description}
              </motion.p>

              {/* meta row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex items-center gap-4 flex-wrap"
              >
                <div className="flex items-center gap-2">
                  <StarRating rating={service.average_rating} interactive={false} />
                  <span className="text-sm text-slate-300">
                    {service.average_rating} · {service.total_ratings} reviews
                  </span>
                </div>
                <Badge
                  variant={service.is_available ? 'default' : 'secondary'}
                  className={service.is_available ? 'bg-green-600' : 'bg-red-600'}
                >
                  {service.is_available ? 'Available' : 'Unavailable'}
                </Badge>
                <Badge variant="outline" className="text-yellow-400">
                  {service.category}
                </Badge>
              </motion.div>
            </div>
          </motion.div>

          {/* reviews section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 px-4 md:px-6"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Reviews
            </h2>

            {/* add / edit form */}
            {(isLoggedIn && !userRating) || editingRating ? (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card border border-slate-700 rounded-xl p-5 mb-6"
              >
                <h3 className="font-semibold mb-4">
                  {editingRating ? 'Edit Your Review' : 'Add Your Review'}
                </h3>
                <div className="space-y-4">
                  <StarRating
                    rating={newRating.rating}
                    setRating={handleRatingChange}
                    size={22}
                  />
                  <Textarea
                    rows={4}
                    value={newRating.comment}
                    onChange={handleCommentChange}
                    placeholder="Tell others about your experience..."
                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-400"
                  />
                  {submitError && (
                    <p className="text-sm text-red-400">{submitError}</p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmitRating}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Submit'
                      )}
                    </Button>
                    {editingRating && (
                      <Button variant="outline" onClick={() => setEditingRating(null)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : isLoggedIn && userRating ? (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card border border-slate-700 rounded-xl p-5 mb-6"
              >
                <h3 className="font-semibold mb-3">Your Review</h3>
                <div className="space-y-3">
                  <StarRating
                    rating={userRating.rating}
                    interactive={false}
                    size={20}
                  />
                  <p className="text-slate-300">{userRating.comment_text}</p>
                  <div className="flex gap-3">
                    <Button size="sm" variant="secondary" onClick={() => handleEditRating(userRating)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete review?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRating(userRating.id)}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card border border-slate-700 rounded-xl p-6 mb-6 text-center">
                <p className="text-slate-400">
                  <a href="/login" className="text-cyan-400 underline">
                    Log in
                  </a>{' '}
                  to leave a review.
                </p>
              </div>
            )}

            {/* other reviews */}
            <div className="space-y-4">
              <AnimatePresence>
                {service.ratings
                  .filter((r) => !editingRating || r.id !== editingRating.id)
                  .filter((r) => !userRating || r.id !== userRating.id)
                  .map((r) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="glass-card border border-slate-700 rounded-xl p-5"
                    >
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={r.user?.profile?.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500">
                            {r.user?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{r.user?.name}</p>
                            <span className="text-xs text-yellow-500">
                              {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-1">
                            <StarRating rating={r.rating} interactive={false} />
                          </div>
                          <p className="mt-2 text-slate-300">{r.comment}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        {/* ---------- RIGHT / FIXED ---------- */}
        <aside className="lg:col-span-1 mt-8 lg:sticky lg:top-0 lg:h-screen lg:pt-8 px-4 md:px-0">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4 ring-4 ring-slate-800/50 shadow-lg">
                <AvatarImage src={service.user?.profile?.avatar} />
                <AvatarFallback className="text-4xl bg-gradient-to-r from-cyan-500 to-purple-500">
                  {service.user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{service.user?.name}</h2>
              <p className="text-cyan-400">{service.user?.profile?.profession}</p>

              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={service.average_rating} interactive={false} size={18} />
                <span className="text-sm text-slate-400">
                  {service.average_rating} ({service.total_ratings})
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { icon: MapPin, label: 'City', value: service.user?.profile?.city },
                { icon: Phone, label: 'Phone', value: service.user?.profile?.phone },
                { icon: Mail, label: 'Email', value: service.user?.email },
              ].map(
                ({ icon: Icon, label, value }) =>
                  value && (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 text-cyan-400" />
                      <div>
                        <p className="text-sm text-slate-400">{label}</p>
                        <p className="text-white">{value}</p>
                      </div>
                    </div>
                  )
              )}
            </div>

            <div className="mt-6 border-t border-slate-800 pt-6">
              <h3 className="font-medium mb-3">Website Log</h3>
              <div className="glass-card p-4 rounded-xl text-sm text-slate-300 space-y-2">
                <p>&copy; 2026 Home Services </p>
                <small>All reights Are Reserved !</small>
                
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
      
      {/* WhatsApp Floating Button */}
      <WhatsAppFloat phoneNumber={service?.user?.profile?.phone} />
      
      {/* Already-rated alert */}
      <AnimatePresence>
        {showAlreadyRatedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAlreadyRatedAlert(false);
              if (alertTimerRef.current) {
                clearTimeout(alertTimerRef.current);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="glass-card w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-400 mb-4" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Already Rated</h2>
              <p className="text-sm text-slate-300 mb-4">
                You have already submitted a review for this service.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowAlreadyRatedAlert(false);
                  if (alertTimerRef.current) {
                    clearTimeout(alertTimerRef.current);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md bg-cyan-500/20 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              >
                <X size={16} /> Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetails;