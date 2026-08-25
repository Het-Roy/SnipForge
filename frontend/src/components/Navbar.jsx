import { useState, useContext, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const profileBtnRef = useRef(null);
  const dropdownRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  // Open dropdown at exact position below the trigger button
  const handleProfileToggle = () => {
    if (!profileOpen && profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setProfileOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside both trigger and dropdown
  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e) => {
      const clickedTrigger = profileBtnRef.current?.contains(e.target);
      const clickedDropdown = dropdownRef.current?.contains(e.target);
      if (!clickedTrigger && !clickedDropdown) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-bold tracking-tight transition-all duration-300 relative py-2 px-1 ${isActive
      ? "text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-indigo-500 after:rounded-full shadow-indigo-500/50"
      : "text-slate-400 hover:text-slate-200"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${isActive
      ? "text-white bg-indigo-600/10 border border-indigo-500/20"
      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
    }`;

  return (
    <nav className="sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* ── Brand ── */}
          <NavLink
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-all duration-300">
              <span className="text-indigo-500 font-mono text-xs font-black">
                {"SF"}
              </span>
            </div>
            <span className="text-white text-xl font-black tracking-tighter uppercase italic">
              Snip<span className="text-indigo-500">Forge</span>
            </span>
          </NavLink>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <NavLink to="/" className={navLinkClass} end>Library</NavLink>

                <div className="flex items-center gap-6 pl-6 border-l border-slate-800">
                  <NavLink
                    to="/create"
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-sm font-bold tracking-tight shadow-lg shadow-indigo-600/20"
                  >
                    Create New
                  </NavLink>

                  <div className="relative" ref={profileBtnRef}>
                    <div
                      onClick={handleProfileToggle}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity select-none cursor-pointer"
                    >
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-white leading-none mb-1">
                          {user.name || user.email?.split("@")[0] || "User"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Account
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-black text-sm">
                        {(user.name || "U")[0].toUpperCase()}
                      </div>
                    </div>

                    {/* Portal dropdown — rendered into document.body, immune to all clipping */}
                    {profileOpen && createPortal(
                      <div
                        ref={dropdownRef}
                        style={{
                          position: "fixed",
                          top: dropdownPos.top,
                          right: dropdownPos.right,
                          zIndex: 9999,
                        }}
                        className="w-48 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl"
                      >
                        <NavLink
                          to="/dashboard"
                          className="flex items-center px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-sm font-bold"
                          onClick={() => setProfileOpen(false)}
                        >
                          Dashboard
                        </NavLink>
                        <div className="h-px bg-slate-800 my-1 mx-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-sm font-bold"
                        >
                          Sign Out
                        </button>
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="text-sm font-bold tracking-tight text-slate-400 hover:text-white transition-colors"
                >
                  Log In
                </NavLink>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold tracking-tight hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Free Signup
                </Link>
              </>
            )}
          </div>

          {/* ── Hamburger (mobile) ── */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            className="md:hidden w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center items-center gap-1.5 hover:bg-slate-800 transition-all"
          >
            <span
              className={`block w-5 h-[2px] rounded-full bg-slate-400 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[8px]" : ""
                }`}
            />
            <span
              className={`block w-5 h-[2px] rounded-full bg-slate-400 transition-all duration-300 ${menuOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`block w-5 h-[2px] rounded-full bg-slate-400 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[8px]" : ""
                }`}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-slate-950 border-b border-slate-800 absolute w-full ${menuOpen ? "max-h-[400px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
          }`}
      >
        <div className="px-4 flex flex-col gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-4 px-4 py-4 mb-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
                  {(user.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold">{user.name || "User"}</p>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Member</p>
                </div>
              </div>

              <NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu} end>
                Library
              </NavLink>
              <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/create" className={mobileNavLinkClass} onClick={closeMenu}>
                Create New
              </NavLink>

              <div className="h-px bg-slate-800 my-4" />

              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/5 transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={mobileNavLinkClass}
                onClick={closeMenu}
              >
                Log In
              </NavLink>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-center mt-2 shadow-lg shadow-indigo-600/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
