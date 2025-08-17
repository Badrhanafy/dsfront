// ServiceCreateForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { FiCheckCircle, FiImage, FiClock, FiTag, FiEdit3 } from 'react-icons/fi';

const ServiceCreateForm = () => {
  /* ---------- state ---------- */
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    min_duration: 30,
    is_available: true,
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /* ---------- image preview ---------- */
  useEffect(() => {
    if (!form.image) return setPreview(null);
    const url = URL.createObjectURL(form.image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) return setError('Max 2 MB');
    setForm((f) => ({ ...f, image: file }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    const body = new FormData();
    
    // Append all fields except is_available
    Object.keys(form).forEach((key) => {
      if (key !== 'is_available') {
        body.append(key, form[key]);
      }
    });
    
    // Convert boolean to 1/0 for Laravel
    body.append('is_available', form.is_available ? '1' : '0');
    
    const response = await axios.post('http://localhost:8000/api/services', body, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 6000);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create service');
    console.error('Error details:', err.response?.data);
  } finally {
    setLoading(false);
  }
};

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black font-sans">
      {success && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex  flex-col lg:flex-row h-full min-h-screen"
      >
        {/* ========== LEFT: FORM ========== */}
        <section className="w-full mt-12 lg:w-3/5 bg-slate-800/40 backdrop-blur-xl border-r border-slate-700/40 p-6 md:p-10 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-2">
              Create New Service
            </h1>
            <p className="text-sm text-slate-400 mb-8">
              Fill the form and publish in seconds.
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 bg-rose-900/40 border border-rose-500/50 text-rose-200 px-4 py-2 rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                icon={<FiEdit3 />}
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Royal Spa Package"
                required
              />

              <TextArea
                icon={<FiEdit3 />}
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the service…"
                rows={3}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  icon={<FiTag />}
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Beauty"
                  required
                />
                <Input
                  icon={<FiClock />}
                  label="Duration (min)"
                  type="number"
                  name="min_duration"
                  value={form.min_duration}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    form.is_available ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    layout
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    animate={{ x: form.is_available ? 24 : 0 }}
                  />
                </div>
                <span className="text-slate-300">Available for booking</span>
              </label>

              {/* IMAGE */}
              <label className="block">
                <span className="text-slate-300 mb-2 block">Service Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                  id="image-upload"
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center justify-center w-full h-36 border-2 border-dashed border-slate-600 rounded-xl bg-slate-700/30 cursor-pointer hover:border-amber-500 transition"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <FiImage size={32} className="mx-auto mb-1" />
                      <span className="text-xs">Click to upload (max 2 MB)</span>
                    </div>
                  )}
                </motion.div>
              </label>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-900 font-bold rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition disabled:opacity-50"
              >
                {loading ? 'Publishing…' : 'Publish Service'}
              </motion.button>
            </form>
          </div>
        </section>

        {/* ========== RIGHT: PREVIEW / SUMMARY ========== */}
        <section className="w-full lg:w-2/5 flex flex-col items-center justify-center p-6 md:p-10 bg-black/30">
          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Live Preview</h2>

            <AnimatePresence>
              {preview ? (
                <motion.img
                  key="img"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  src={preview}
                  alt="preview"
                  className="w-full h-56 object-cover rounded-2xl shadow-2xl ring-1 ring-amber-500/30"
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-56 flex items-center justify-center rounded-2xl bg-slate-800/50 text-slate-500"
                >
                  <FiImage size={48} />
                </motion.div>
              )}
            </AnimatePresence>

            <ul className="mt-6 space-y-2 text-left text-sm text-slate-300">
              <li><span className="text-amber-400 font-semibold">Title:</span> {form.title || '—'}</li>
              <li><span className="text-amber-400 font-semibold">Category:</span> {form.category || '—'}</li>
              <li><span className="text-amber-400 font-semibold">Duration:</span> {form.min_duration} min</li>
              <li>
                <span className="text-amber-400 font-semibold">Status:</span>{' '}
                {form.is_available ? 'Available' : 'Hidden'}
              </li>
            </ul>
          </div>
        </section>
      </motion.main>
    </div>
  );
};

/* ---------- reusable glass inputs ---------- */
const Input = ({ icon, label, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <div className="flex items-center bg-slate-700/40 border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 transition">
      <span className="pl-4 text-amber-400">{icon}</span>
      <input {...rest} className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-400 outline-none" />
    </div>
  </div>
);

const TextArea = ({ icon, label, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <div className="flex items-start bg-slate-700/40 border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 transition">
      <span className="pl-4 pt-3 text-amber-400">{icon}</span>
      <textarea {...rest} className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-400 outline-none resize-none" />
    </div>
  </div>
);

export default ServiceCreateForm;