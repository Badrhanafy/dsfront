// src/components/ServiceDetails.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VanillaTilt from 'vanilla-tilt';
import { motion, AnimatePresence } from 'framer-motion';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    isLoggedIn && currentUser
      ? service?.ratings.find((r) => r.user_id === currentUser.id)
      : null;

  /* ---------------- tilt effect ---------------- */
  useEffect(() => {
    cardRefs.current.forEach((el) =>
      el &&
      VanillaTilt.init(el, { max: 5, speed: 300, glare: true, 'max-glare': 0.1 })
    );
  }, [service]);

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
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* --- sidebar --- */}
          <aside className="lg:col-span-1 lg:sticky lg:top-8 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                  <StarRating
                    rating={service.average_rating}
                    interactive={false}
                    size={18}
                  />
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
                <h3 className="font-medium mb-3">Contact Provider</h3>
                <form className="space-y-3">
                  <Input
                    placeholder="Your name"
                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-400"
                  />
                  <Textarea
                    placeholder="Your message"
                    rows={3}
                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-400"
                  />
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </aside>

          {/* --- main content --- */}
          <main className="lg:col-span-3 space-y-8">
            {/* service header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="glass-card rounded-2xl p-6">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {service.title}
                </h1>
                <p className="mt-2 text-slate-300">{service.description}</p>

                <div className="mt-4 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <StarRating rating={service.average_rating} interactive={false} />
                    <span className="text-sm text-slate-400">
                      {service.average_rating} ({service.total_ratings}
                      &nbsp;reviews)
                    </span>
                  </div>
                  <Badge className={'bg-yellow-700'} variant={service.is_available ? 'default' : 'secondary'}>
                    {service.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                  <Badge variant="outline" className={'text-yellow-400'}>{service.category}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Min&nbsp;duration:</span>{' '}
                    <span className="text-white font-medium">{Number(service.min_duration)} min</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* review section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
                  Reviews
                </h2>

                {/* add / edit form */}
                {(isLoggedIn && !userRating) || editingRating ? (
                  <div className="glass-card border border-slate-700 rounded-xl p-5 mb-6">
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
                          <Button
                            variant="outline"
                            onClick={() => setEditingRating(null)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isLoggedIn && userRating ? (
                  /* user’s own review */
                  <div className="glass-card border border-slate-700 rounded-xl p-5 mb-6">
                    <h3 className="font-semibold mb-3">Your Review</h3>
                    <div className="space-y-3">
                      <StarRating
                        rating={userRating.rating}
                        interactive={false}
                        size={20}
                      />
                      <p className="text-slate-300">{userRating.comment_text}</p>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditRating(userRating)}
                        >
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
                              <AlertDialogAction
                                onClick={() => handleDeleteRating(userRating.id)}
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
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
                  {service.ratings
                    .filter((r) => !editingRating || r.id !== editingRating.id)
                    .filter((r) => !userRating || r.id !== userRating.id)
                    .map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                              <span className="text-xs text-slate-400">
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
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      <style>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(10px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .glass-card:hover {
          border-color: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
};

export default ServiceDetails;