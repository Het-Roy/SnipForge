import { memo, useState, useEffect, useCallback } from 'react';

const SearchBarComponent = ({ onSearch, initialSearch = '', initialLang = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);

  // Sync with initial props if they change
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSelectedLanguage(initialLang);
  }, [initialLang]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm, selectedLanguage);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedLanguage, onSearch]);

  const handleLanguageChange = useCallback((e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mb-12 animate-fade-in-soft">
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-600/5 blur-2xl rounded-3xl group-hover:bg-indigo-600/10 transition-all duration-700" />
        
        <div className="relative flex flex-col md:flex-row gap-4 p-2 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl group-hover:border-slate-700 transition-all">
          <div className="flex-1 relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] pointer-events-none">
              Search
            </div>
            <input
              type="text"
              placeholder="Logic, keywords, or functionality..."
              className="w-full bg-transparent pl-20 pr-6 py-4 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 px-2">
            <div className="h-8 w-[1px] bg-slate-800 hidden md:block" />
            <select
              className="bg-transparent text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] py-4 px-4 focus:outline-none cursor-pointer hover:text-white transition-colors appearance-none text-center min-w-[140px]"
              value={selectedLanguage}
              onChange={handleLanguageChange}
            >
              <option value="">All Languages</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchBar = memo(SearchBarComponent);

export default SearchBar;
