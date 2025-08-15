import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiCheckCircle, FiHome } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

const About = () => {
  const stats = [
    { value: '500+', label: 'Happy Clients', icon: <FiUsers className="w-6 h-6" /> },
    { value: '10+', label: 'Years Experience', icon: <FiAward className="w-6 h-6" /> },
    { value: '100%', label: 'Satisfaction', icon: <FiCheckCircle className="w-6 h-6" /> },
    { value: '24/7', label: 'Support', icon: <FiHome className="w-6 h-6" /> },
  ];

  const features = [
    {
      title: "Luxury Home Services",
      description: "Premium solutions for discerning homeowners who expect nothing but the best.",
      icon: "✨"
    },
    {
      title: "Vetted Professionals",
      description: "Every service provider undergoes rigorous screening and training.",
      icon: "🔍"
    },
    {
      title: "Smart Scheduling",
      description: "Book at your convenience with our flexible appointment system.",
      icon: "⏱️"
    },
    {
      title: "Quality Guarantee",
      description: "We stand behind every service with our satisfaction promise.",
      icon: "✅"
    }
  ];

  return (
    <div className="bg-slate-900 text-slate-100 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-400/10 rounded-full mb-4">
              ABOUT HOMESERVICES
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Redefining Home Luxury
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Where exceptional service meets unparalleled elegance for your living spaces.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="glass-card p-8 rounded-3xl max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
                <p className="text-slate-400 mb-4">
                  Founded in 2012, HomeServices began with a simple vision: to bring luxury service standards to residential 
                  home care. What started as a small team of dedicated professionals has grown into the premier home services 
                  platform.
                </p>
                <p className="text-slate-400">
                  We combine traditional craftsmanship with innovative technology to deliver experiences that transform houses 
                  into dream homes.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-slate-400 mb-4">
                  To elevate everyday living through exceptional service, attention to detail, and a relentless pursuit of 
                  perfection in home care.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    Meet Our Team
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    View Services
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-xl text-center"
              >
                <div className="text-cyan-400 flex justify-center mb-3">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-300 bg-purple-400/10 rounded-full mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">HomeServices</span> Difference
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              What sets us apart in delivering premium home care experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="glass-card p-6 rounded-xl"
              >
                <div className="text-4xl mb-4 text-cyan-400">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 lg:p-12">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-400/10 rounded-full mb-4">
                  JOIN OUR TEAM
                </span>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Are You An <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Elite Service Provider</span>?
                </h2>
                <p className="text-slate-400 mb-6">
                  We're always looking for exceptional professionals to join our network of premium home service providers.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    Apply Now
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hidden lg:block"></div>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(10px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default About;