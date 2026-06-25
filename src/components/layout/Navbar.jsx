import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Menu, ShieldAlert, User, X } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { signOutUser } from "../../services/authService";

function getInitials(user) {
  if (!user) return "U";
  if (user.displayName?.trim()) return user.displayName.trim()[0].toUpperCase();
  if (user.email?.trim()) return user.email.trim()[0].toUpperCase();
  return "U";
}

function getPrimaryLinks(user, isAdmin) {
  const links = [
    { name: "Home", path: "/" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];

  if (user) {
    links.splice(1, 0, { name: "Dashboard", path: "/dashboard" });
    links.splice(2, 0, { name: "Report", path: "/report" });
    links.push({ name: "Profile", path: "/profile" });

    if (isAdmin) {
      links.push({ name: "Admin", path: "/admin" });
    }
  }

  return links;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, authLoading } = useAppStore();

  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin =
    !!user &&
    (user.email === "admin@nagarniti.org" || user.email?.endsWith("@nagarniti.org"));

  const navLinks = useMemo(() => getPrimaryLinks(user, isAdmin), [user, isAdmin]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isDrawerOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    const result = await signOutUser();
    if (result?.ok) {
      setIsDrawerOpen(false);
      navigate("/");
    }
  };

  return (
    <nav
      id="main-navbar"
      className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`}
      aria-label="Primary navigation"
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" aria-label="Go to NagarNiti home">
          <span className="navbar-logo-wrapper" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="40" height="40" rx="12" fill="currentColor" opacity="0.12" />
              <path
                d="M20 8.75c-4.97 0-9 4.03-9 9 0 5.57 7.03 12.67 8.38 13.9a.9.9 0 0 0 1.24 0C21.97 30.42 29 23.32 29 17.75c0-4.97-4.03-9-9-9Zm0 11.5a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z"
                fill="currentColor"
              />
            </svg>
          </span>

          <span className="navbar-brand-text">
            <span className="navbar-brand-name">
              Nagar<span style={{ color: "var(--color-primary)" }}>Niti</span>
            </span>
            <span className="navbar-brand-tag">Civic coordination layer</span>
          </span>
        </Link>

        <div className="navbar-menu-desktop">
          <div className="navbar-links-desktop">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  isActive ? "navbar-link navbar-link-active" : "navbar-link"
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions">
            {authLoading ? (
              <div
                aria-label="Loading authentication state"
                style={{
                  width: "1.2rem",
                  height: "1.2rem",
                  borderRadius: "999px",
                  border: "2px solid var(--color-primary-light)",
                  borderTopColor: "var(--color-primary)",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            ) : user ? (
              <>
                <Link to="/profile" className="navbar-user-chip" aria-label="Open profile">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      referrerPolicy="no-referrer"
                      style={{
                        width: "1.9rem",
                        height: "1.9rem",
                        borderRadius: "999px",
                        objectFit: "cover",
                        border: "1px solid rgba(11, 107, 105, 0.12)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      style={{
                        width: "1.9rem",
                        height: "1.9rem",
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--color-primary-light)",
                        color: "var(--color-primary)",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(user)}
                    </span>
                  )}

                  <span className="navbar-user-text">
                    {user.displayName?.split(" ")[0] || "Profile"}
                  </span>
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="btn btn-outline btn-sm" aria-label="Open admin panel">
                    <ShieldAlert size={14} />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn btn-primary btn-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          className="navbar-hamburger"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isDrawerOpen}
          aria-controls="mobile-nav-drawer"
        >
          <Menu size={18} />
        </button>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.button
              type="button"
              className="navbar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close navigation overlay"
            />

            <motion.aside
              id="mobile-nav-drawer"
              className="navbar-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Mobile navigation menu"
            >
              <div className="navbar-drawer-header">
                <div>
                  <div className="navbar-drawer-title">Navigation</div>
                  <div className="navbar-drawer-subtitle">NagarNiti civic workspace</div>
                </div>

                <button
                  type="button"
                  className="navbar-drawer-close"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="navbar-drawer-links">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === "/"}
                    className={({ isActive }) =>
                      isActive
                        ? "navbar-drawer-link navbar-drawer-link-active"
                        : "navbar-drawer-link"
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>

              <div className="navbar-drawer-actions">
                {authLoading ? (
                  <div className="state-card">Checking account status…</div>
                ) : user ? (
                  <>
                    <div
                      className="state-card"
                      style={{
                        display: "flex",
                        gap: "0.875rem",
                        alignItems: "center",
                      }}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          referrerPolicy="no-referrer"
                          style={{
                            width: "2.75rem",
                            height: "2.75rem",
                            borderRadius: "999px",
                            objectFit: "cover",
                            border: "1px solid rgba(11, 107, 105, 0.12)",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          style={{
                            width: "2.75rem",
                            height: "2.75rem",
                            borderRadius: "999px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--color-primary-light)",
                            color: "var(--color-primary)",
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(user)}
                        </span>
                      )}

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--color-text)",
                            lineHeight: 1.2,
                          }}
                        >
                          {user.displayName || "Citizen"}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <Link to="/profile" className="btn btn-outline btn-block">
                      <User size={16} />
                      <span>Open Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="btn btn-soft btn-block">
                        <ShieldAlert size={16} />
                        <span>Open Admin Panel</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-ghost btn-block"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="btn btn-primary btn-block">
                    Sign In / Sign Up
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}