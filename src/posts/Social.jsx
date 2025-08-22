import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Image as ImageIcon, Users, Sparkles, Camera, Share2, X, CheckCircle2 } from 'lucide-react';
import MyPosts from './MyPosts'; // Import the MyPosts component

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const alertTimerRef = React.useRef(null);
 
  useEffect(() => {
    fetchPosts();
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, []);

  const showAlert = (message) => {
    setAlertMessage(message);
    setShowSuccessAlert(true);
    
    // Clear any existing timer
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
    }
    
    // Auto-dismiss after 4 seconds
    alertTimerRef.current = setTimeout(() => {
      setShowSuccessAlert(false);
    }, 4000);
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const { data } = await axios.get('http://localhost:8000/api/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(data.data);
    } catch {
      setError('Could not load posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300 text-lg font-light">Loading your feed...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="glass-card p-8 rounded-2xl text-center max-w-sm">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-cyan-600 hover:to-purple-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Luxury Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-800/30 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Elite Community
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">more than {posts.length} posts</span>
            </div>
          </div>
          
          {/* Luxury Tab Navigation */}
          <div className="flex space-x-1 bg-slate-800/20 rounded-full p-1 backdrop-blur-sm border border-slate-700/50">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'feed' 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
              onClick={() => setActiveTab('feed')}
            >
              Community Feed
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'my-posts' 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
              onClick={() => setActiveTab('my-posts')}
            >
              My Posts
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Two Columns */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fixed Publish Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <PublishPost onSuccess={fetchPosts} showAlert={showAlert} />
            </div>
          </div>
          
          {/* Scrollable Posts Section with Hidden Scrollbar - UPDATED WITH CONDITIONAL RENDERING */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' ? (
              <div className="space-y-6 max-h-screen overflow-y-auto pr-2 scrollbar-hide">
                <AnimatePresence>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onUpdate={fetchPosts} showAlert={showAlert} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <MyPosts showAlert={showAlert} />
            )}
          </div>
        </div>
      </div>
      
      {/* Success Alert */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="glass-card w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-cyan-500/30 bg-slate-800/90 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="flex items-center"
              >
                <CheckCircle2 className="h-6 w-6 text-green-400 mr-3" />
                <div>
                  <h2 className="text-lg font-bold text-white">{alertMessage}</h2>
                </div>
                <button
                  onClick={() => {
                    setShowSuccessAlert(false);
                    if (alertTimerRef.current) {
                      clearTimeout(alertTimerRef.current);
                    }
                  }}
                  className="ml-auto text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ... rest of your component (PublishPost, PostCard, etc.) remains the same ...

/* ---------- Publish Post ---------- */
const PublishPost = ({ onSuccess, showAlert }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const form = new FormData();
    form.append('title', title);
    form.append('content', content);
    if (image) form.append('image', image);

    try {
      await axios.post('http://localhost:8000/api/posts', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle(''); setContent(''); setImage(null);
      showAlert('Post published successfully!');
      onSuccess();
    } catch {
      alert('Could not publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card border border-slate-700 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">S</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Share your thoughts</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Give your post a captivating title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
          required
        />
        
        <textarea
          placeholder="What's inspiring you today? Share your story..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none"
          required
        />
        
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-full cursor-pointer hover:bg-slate-700/50 transition-all duration-300 text-slate-400 hover:text-white text-sm">
            <Camera className="w-4 h-4" />
            <span>{image ? image.name : 'Add Image'}</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])} 
              className="sr-only" 
            />
          </label>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

/* ---------- Post Card ---------- */
const PostCard = ({ post, onUpdate, showAlert }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isReacting, setIsReacting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [liked, setLiked] = useState(false);

  const likePost = async () => {
    setIsReacting(true);
    const token = localStorage.getItem('access_token');
    try {
      await axios.post(
        `http://localhost:8000/api/posts/${post.id}/react`,
        { type: 'like' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!liked);
      onUpdate();
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsCommenting(true);
    const token = localStorage.getItem('access_token');
    try {
      await axios.post(
        `http://localhost:8000/api/posts/${post.id}/comments`,
        { content: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      showAlert('Comment added successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="glass-card border border-slate-700 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500"
    >
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">
              {post.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-white truncate">
              {post.user?.name || 'Anonymous User'}
            </h4>
            <p className="text-slate-400 text-sm">
              {formatTime(post.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <h3 className="text-xl font-bold text-white mb-3 leading-tight">
          {post.title}
        </h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          {post.content}
        </p>
        {post.image && (
          <div className="rounded-2xl overflow-hidden bg-slate-800/50">
            <img
              src={`http://localhost:8000/storage/${post.image}`}
              alt="post"
              className="w-full h-64 object-cover"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="px-6 py-3 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-4">
            {post.reactions?.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-current" />
                </div>
                <span>{post.reactions.length}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="hover:text-white transition-colors duration-200"
          >
            {post.comments?.length || 0} comments
          </button>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-slate-700">
        <div className="flex items-center space-x-1">
          <button 
            onClick={likePost}
            disabled={isReacting}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
              liked 
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-400/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Like</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/30 transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/30 transition-all duration-300">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-slate-700 bg-slate-800/30">
          {/* Comment Form */}
          <div className="p-6 pb-4">
            <form onSubmit={addComment} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">Y</span>
              </div>
              <div className="flex-1 space-y-3">
                <input
                  placeholder="Write a thoughtful comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-sm"
                />
                <button 
                  type="submit"
                  disabled={isCommenting || !comment.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:shadow-cyan-500/30 transition-all duration-300"
                >
                  {isCommenting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          {post.comments?.length > 0 && (
            <div className="px-6 pb-6 space-y-4">
              {post.comments.map(c => (
                <div key={c.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {c.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 bg-slate-800/50 rounded-xl p-4">
                    <h5 className="text-white font-semibold text-sm mb-1">
                      {c.user?.name || 'Anonymous'}
                    </h5>
                    <p className="text-slate-300 text-sm leading-relaxed mb-2">
                      {c.content}
                    </p>
                    <span className="text-slate-500 text-xs">
                      {formatTime(c.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// CSS for hiding scrollbar
const scrollbarHideCSS = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
  
  .glass-card {
    background: rgba(30, 41, 59, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
`;

// Add the CSS to the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarHideCSS;
  document.head.appendChild(style);
}

export default Social;