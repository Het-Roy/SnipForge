import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full border-t border-slate-900 bg-slate-950 py-20">
      <div className="container-page">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Snip<span className="text-indigo-500">Forge</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
              The premium repository for modern developers. Store, discover, and share production-ready code with ease and security.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6">Library</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-slate-500 text-sm font-bold hover:text-indigo-400 transition-colors">Explore</Link>
              </li>
              <li>
                <Link to="/create" className="text-slate-500 text-sm font-bold hover:text-indigo-400 transition-colors">Forge New</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-500 text-sm font-bold hover:text-indigo-400 transition-colors">Documentation</Link>
              </li>
            </ul>
          </div>

          {/* Social / Legal */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6">Network</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-slate-500 text-sm font-bold hover:text-indigo-400 transition-colors">GitHub</a>
              </li>
              <li>
                <a href="#" className="text-slate-500 text-sm font-bold hover:text-indigo-400 transition-colors">Twitter</a>
              </li>
              <li>
                <a href="#" className="text-slate-500 text-sm font-bold hover:text-indigo-400 transition-colors">Discord</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            &copy; {currentYear} SnipForge Global. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-all">Privacy</Link>
            <Link to="/terms" className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-all">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
