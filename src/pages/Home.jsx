/*  Home.jsx  –  Luxe Edition (Enhanced with 3D button effects) */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ------------- OPTIONAL LIBS ------------- */
import VanillaTilt from 'vanilla-tilt';
import AOS from 'aos';
import 'aos/dist/aos.css';

/* ------------- HELPERS ------------- */
const useMouseParallax = (ref, strength = 20) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * strength;
      const y = (clientY / innerHeight - 0.5) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [ref, strength]);
};

/* ------------- SKELETONS ------------- */
const ServiceSkeleton = () => (
  <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl h-72 animate-pulse" />
);
const ProviderSkeleton = () => (
  <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl h-80 animate-pulse" />
);

/* ------------- MAIN COMPONENT ------------- */
const Home = ({ isAuthenticated, user, onLogout }) => {
  const [data, setData] = useState({ services: [], providers: [] });
  const [loading, setLoading] = useState({ services: true, providers: true, all: true });
  const [error, setError] = useState({ services: null, providers: null });

  const heroRef = useRef(null);
  useMouseParallax(heroRef);

  /* ---------- DATA ---------- */
  const token = localStorage.getItem('access_token');
  const fetchServices = () =>
    axios
      .get('http://localhost:8000/api/services', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setData((p) => ({ ...p, services: r.data.data })))
      .catch((e) => setError((p) => ({ ...p, services: e.message })))
      .finally(() => setLoading((p) => ({ ...p, services: false, all: !p.providers })));

  const fetchProviders = () =>
    axios
      .get('http://localhost:8000/api/providers')
      .then((r) => setData((p) => ({ ...p, providers: r.data.data?.data || r.data.data || [] })))
      .catch((e) => setError((p) => ({ ...p, providers: e.message })))
      .finally(() => setLoading((p) => ({ ...p, providers: false, all: !p.services })));

  useEffect(() => {
    Promise.all([fetchServices(), fetchProviders()]);
    AOS.init({ duration: 800, once: true });
    return () => {};
  }, []);

  /* ---------- EFFECTS ---------- */
  const cardRefs = useRef([]);
  const buttonRefs = useRef([]);
  
  useEffect(() => {
    cardRefs.current.forEach((el) => el && VanillaTilt.init(el, { max: 10, speed: 300, glare: true, 'max-glare': 0.2 }));
    
    // Initialize 3D tilt for buttons
    buttonRefs.current.forEach((el) => {
      if (el) {
        VanillaTilt.init(el, {
          max: 15,
          speed: 300,
          glare: true,
          'max-glare': 0.2,
          perspective: 1000,
          scale: 1.05
        });
      }
    });
  }, [loading.services, loading.providers]);

  /* ---------- RENDER ---------- */
  return (
    <>
      {/* ------------- HERO (FIXED) ------------- */}
      <section
        className="fixed inset-0 w-full h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url("backg.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <svg className="absolute inset-0 w-full h-full opacity-20 z-0">
          <filter id="noise">
            <feTurbulence type="turbulence" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        <div ref={heroRef} className="relative z-10 text-center px-6 max-w-5xl mx-auto transition-transform">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Trusted</span> Home Services
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto">
            Connect with <span id="typed" className="font-semibold" />
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services" 
              ref={el => buttonRefs.current[0] = el}
              className="btn-3d px-8 py-4 rounded-xl bg-white text-slate-900 font-bold shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
              data-tilt
              data-tilt-perspective="1000"
            >
              <span className="relative z-10">Explore Services</span>
              <span className="btn-3d-gradient"></span>
            </Link>
            <Link 
              to="/providers" 
              ref={el => buttonRefs.current[1] = el}
              className="btn-3d px-8 py-4 rounded-xl border border-white/30 text-white font-bold hover:bg-white/10 transition-all duration-300"
              data-tilt
              data-tilt-perspective="1000"
            >
              <span className="relative z-10">Meet Pros</span>
              <span className="btn-3d-gradient"></span>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ------------- SCROLLABLE OVERLAY ------------- */}
      <div className="relative z-20 mt-[100vh] bg-slate-900">
        {/* subtle fade-in edge */}
        <div className="absolute -top-40 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-slate-900 pointer-events-none" />

        {/* ------------- SERVICES ------------- */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4" data-aos="fade-up">
              Popular <span className="text-cyan-400">Services</span>
            </h2>
            <p className="text-center text-slate-400 mb-14 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Discover premium home services curated for you.
            </p>

            {error.services && <p className="text-center text-red-400">{error.services}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading.services
                ? Array(4).fill(0).map((_, i) => <ServiceSkeleton key={i} />)
                : data.services.slice(0, 4).map((s, i) => (
                    <div
                      key={s.id}
                      ref={(el) => (cardRefs.current[i] = el)}
                      className="glass-card p-6 rounded-2xl flex flex-col h-full"
                      data-aos="zoom-in"
                      data-aos-delay={i * 100}
                    >
                      <div className="text-4xl mb-4">{s.icon || '🛠️'}</div>
                      <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                      <p className="text-slate-400 text-sm mb-auto">{s.description}</p>
                      <div className="mt-6 flex justify-between items-center">
                        <span className="text-sm bg-cyan-400/20 text-cyan-300 px-3 py-1 rounded-full">{s.category}</span>
                        <span className="font-bold text-lg">
                          {s.rate_type === 'hourly' ? `$${s.hourly_rate}/hr` : `$${s.fixed_rate}`}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>

            <div className="text-center mt-14" data-aos="fade-up">
              <Link to="/services" className="btn-3d px-8 py-3 border border-cyan-400 rounded-xl text-cyan-400 font-bold hover:bg-cyan-400 hover:text-slate-900 transition-all">
                View All Services
              </Link>
            </div>
          </div>
        </section>

        {/* ------------- PROVIDERS ------------- */}
        <section className="py-24 bg-slate-900/50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4" data-aos="fade-up">
              <span className='text-yellow-400'>Top</span> <span className="text-purple-400">Professionals</span>
            </h2>
            <p className="text-center text-slate-400 mb-14 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Verified experts ready to exceed your expectations.
            </p>

            {error.providers && <p className="text-center text-red-400">{error.providers}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading.providers
                ? Array(3).fill(0).map((_, i) => <ProviderSkeleton key={i} />)
                : data.providers.slice(0, 3).map((p, i) => (
                    <div
                      key={p.id}
                      ref={(el) => (cardRefs.current[i + 10] = el)}
                      className="glass-card p-6 rounded-2xl"
                      data-aos="fade-up"
                      data-aos-delay={i * 100}
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-3xl text-white">
                          {p.name?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <h4 className="font-bold text-xl">{p.name}</h4>
                          <p className="text-slate-400">{p.profession}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className={`w-5 h-5 ${j < Math.round(p.rating || 0) ? 'text-yellow-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-slate-400">({p.reviews_count || 0})</span>
                      </div>
                      {p.is_approved && (
                        <div className="inline-flex items-center bg-green-500/20 text-green-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </div>
                      )}
                      <Link to={`/providers/${p.id}`} className="block w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-center transition">
                        View Profile
                      </Link>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ------------- HOW IT WORKS ------------- */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-14" data-aos="fade-up">
            <span className='text-white'>3 Steps to</span> <span className="text-cyan-400">Perfection</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              {['Find a Service', 'Choose a Pro', 'Book & Relax'].map((t, i) => (
                <div key={i} className="text-center text-blue-200" data-aos="zoom-in" data-aos-delay={i * 100}>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-4xl font-bold text-white mb-4">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-2xl mb-2">{t}</h3>
                  <p className="text-slate-400">Seamlessly crafted experience.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------- CTA ------------- */}
        <section className="py-24 bg-gradient-to-r from-purple-600 to-cyan-400">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of delighted customers today.</p>
            <Link 
              to="/register" 
              className="btn-3d px-10 py-4 bg-white text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform"
              ref={el => buttonRefs.current[2] = el}
              data-tilt
              data-tilt-perspective="1000"
            >
              <span className="relative z-10">Join Now</span>
              <span className="btn-3d-gradient"></span>
            </Link>
          </div>
        </section>

        {/* ------------- FOOTER ------------- */}
        <footer className="bg-slate-900/50 py-12">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {['Services', 'Company', 'Support', 'Legal'].map((h) => (
                <div key={h}>
                  <h3 className="font-bold mb-4">{h}</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li>
                      <Link className="hover:text-white transition">Link</Link>
                    </li>
                    <li>
                      <Link className="hover:text-white transition">Link</Link>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} HomeService Luxe</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                {['facebook', 'twitter', 'instagram'].map((s) => (
                  <Link key={s} className="text-slate-400 hover:text-white transition">
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ------------- TYPED HEADLINE SCRIPT ------------- */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          import Typed from 'https://cdn.skypack.dev/typed.js@2.0.12';
          new Typed('#typed', {
            strings: ['plumbers', 'electricians', 'cleaners', 'handymen', 'painters', 'your next expert'],
            typeSpeed: 70,
            backSpeed: 70,
            loop: true,
          });
        `,
        }}
      />

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transform-style: preserve-3d;
        }
        
        .btn-3d {
          position: relative;
          overflow: hidden;
          transform-style: preserve-3d;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }
        
        .btn-3d-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0) 60%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .btn-3d:hover .btn-3d-gradient {
          opacity: 1;
        }
        
        .btn-3d:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.3);
        }
        
        /* Specific styles for the white button */
        .btn-3d.bg-white:hover {
          box-shadow: 0 15px 30px -5px rgba(74, 222, 255, 0.4);
        }
        
        /* Specific styles for the transparent button */
        .btn-3d.border-white\\/30:hover {
          box-shadow: 0 15px 30px -5px rgba(192, 132, 252, 0.4);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
        }
        
        /* Glow effect */
        .btn-3d::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          opacity: 0;
          box-shadow: 0 0 20px 5px rgba(74, 222, 255, 0.5);
          transition: opacity 0.3s ease;
        }
        
        .btn-3d:hover::after {
          opacity: 0.7;
        }
        
        .btn-3d.border-white\\/30::after {
          box-shadow: 0 0 20px 5px rgba(192, 132, 252, 0.5);
        }
      `}</style>
    </>
  );
};

export default Home;