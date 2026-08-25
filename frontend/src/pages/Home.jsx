import { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SnippetList from '../components/SnippetList';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const scrollTicking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollTicking.current) {
        scrollTicking.current = true;
        window.requestAnimationFrame(() => {
          const shouldBeScrolled = window.scrollY > 50;
          setScrolled((prev) => (prev === shouldBeScrolled ? prev : shouldBeScrolled));
          scrollTicking.current = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToExplore = () => {
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-950">
      {/* ── DYNAMIC BACKGROUND ELEMENTS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/5 blur-[150px] rounded-full" />
      </div>

      {/* ── HERO SECTION ── */}
      {!user && (
        <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center py-20">
          <div className="animate-fade-in group">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-400 mb-8 uppercase tracking-widest">
              Professional Code Repository
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] lg:max-w-4xl mx-auto">
              Code faster. <br />
              <span className="text-indigo-500">
                Ship earlier.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-12 leading-relaxed font-medium">
              The premium hub for reusable code. Store your logic privately or share it with the world. Built for developers who value speed and quality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg mx-auto mb-16">
              <Link to="/signup" className="px-8 py-4 bg-indigo-600 rounded-2xl text-white font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group-hover:shadow-indigo-500/40">
                Get Started
              </Link>
              <button 
                onClick={handleScrollToExplore} 
                className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 font-bold text-lg hover:bg-slate-800 transition-all active:scale-95 group-hover:border-indigo-500/40"
              >
                Explore Library
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── EXPLORE SECTION ── */}
      <section id="explore" className={`relative z-10 w-full transition-all duration-1000 ${scrolled || user ? 'opacity-100' : 'opacity-80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
              Explore Snippets
            </h2>
            <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full mb-6" />
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              Browse thousands of production-ready snippets made with care by the developer community.
            </p>
          </div>
          
          <div className="relative">
            <SnippetList mode="explore" title="" showSearch={true} />
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      {!user && (
        <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Secure Storage', desc: 'Private repository for your mission-critical code blocks and reusable logic.' },
              { title: 'Fast Discovery', desc: 'Find exactly what you need with advanced search and language filtering.' },
              { title: 'One-Click Use', desc: 'Instantly copy and integrate snippets into your project without friction.' }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-500 font-black text-lg mb-8 group-hover:border-indigo-500/50 transition-all">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA SECTION ── */}
      {!user && (
        <section className="relative z-10 py-32 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter">
              Build your personal <br /> library today.
            </h2>
            <Link to="/signup" className="inline-block px-10 py-4 bg-white text-slate-950 font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
              Create Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

