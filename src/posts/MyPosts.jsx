import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Share2, Edit, Trash2, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const MyPosts = ({ showAlert }) => {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      if (!userData.id) {
        setError('User information not available. Please log in again.');
        setLoading(false);
        return;
      }

      // Use the clean endpoint without query parameters
      const { data } = await axios.get(`http://localhost:8000/api/users/${userData.id}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle different API response structures
      const posts = data.data || data || [];
      setMyPosts(Array.isArray(posts) ? posts : []);
      
    } catch (err) {
      console.error('Error fetching user posts:', err);
      
      if (err.response?.status === 404) {
        setError('The user posts endpoint was not found. Please contact support.');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view these posts.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Could not load your posts. Please try again later.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    fetchMyPosts();
  };

  const handleEdit = (post) => {
    setEditingPost(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdatePost = async (postId) => {
    if (!editTitle.trim() || !editContent.trim()) {
      showAlert('Please provide both title and content for your post');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      await axios.put(`http://localhost:8000/api/posts/${postId}`, {
        title: editTitle,
        content: editContent
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state
      setMyPosts(posts => posts.map(post => 
        post.id === postId 
          ? { ...post, title: editTitle, content: editContent, updated_at: new Date().toISOString() }
          : post
      ));
      
      showAlert('Post updated successfully!');
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating post:', err);
      showAlert('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      
      await axios.delete(`http://localhost:8000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove from local state
      setMyPosts(posts => posts.filter(post => post.id !== postId));
      showAlert('Post deleted successfully!');
    } catch (err) {
      console.error('Error deleting post:', err);
      showAlert('Failed to delete post. Please try again.');
    }
  };

  const likePost = async (postId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      await axios.post(
        `http://localhost:8000/api/posts/${postId}/react`,
        { type: 'like' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh posts to get updated like count
      fetchMyPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      showAlert('Failed to like post. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatTime(timestamp);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300 text-lg font-light">Loading your posts...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="glass-card p-8 rounded-2xl text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Unable to load posts</h3>
        <p className="text-slate-300 mb-6">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-cyan-600 hover:to-purple-600 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-700 text-slate-300 px-6 py-2 rounded-full hover:bg-slate-600 transition-all"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            My Posts
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              {myPosts.length} {myPosts.length === 1 ? 'post' : 'posts'}
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
              title="Refresh posts"
            >
              {refreshing ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {myPosts.length === 0 ? (
          <div className="glass-card border border-slate-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No posts yet</h3>
            <p className="text-slate-400 mb-6">You haven't created any posts yet. Share your thoughts with the community!</p>
            <button
              onClick={() => window.scrollTo(0, 0)}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-cyan-600 hover:to-purple-600 transition-all"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {myPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="glass-card border border-slate-700 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500"
                >
                  {/* Post Header with Actions */}
                  <div className="p-6 pb-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {post.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">
                            {post.user?.name || 'You'}
                          </h4>
                          <p className="text-slate-400 text-sm flex items-center gap-2">
                            <span>{formatTime(post.created_at)}</span>
                            {post.updated_at && post.updated_at !== post.created_at && (
                              <span className="text-xs text-slate-500">(edited)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Edit post"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    {editingPost === post.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                          placeholder="Post title"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none"
                          placeholder="Post content"
                        />
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleUpdatePost(post.id)}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white text-sm font-medium disabled:opacity-50 transition-all duration-300"
                          >
                            {isSubmitting ? 'Updating...' : 'Update'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-slate-700 rounded-full text-slate-300 text-sm font-medium hover:bg-slate-600 transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
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
                      </>
                    )}
                  </div>

                  {/* Post Stats and Actions */}
                  {editingPost !== post.id && (
                    <>
                      <div className="px-6 py-3 border-t border-slate-700">
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <div className="flex items-center space-x-4">
                            {post.reactions?.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                  <Heart className="w-3 h-3 text-white fill-current" />
                                </div>
                                <span>{post.reactions.length} likes</span>
                              </div>
                            )}
                            {post.comments?.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.comments.length} comments</span>
                              </div>
                            )}
                          </div>
                          {post.updated_at && post.updated_at !== post.created_at && (
                            <span className="text-xs text-slate-500">
                              Edited {formatRelativeTime(post.updated_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-6 py-4 border-t border-slate-700">
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => likePost(post.id)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/30 transition-all duration-300"
                          >
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-medium">Like</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/30 transition-all duration-300">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Comment</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/30 transition-all duration-300">
                            <Share2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Share</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;