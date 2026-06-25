import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, AlertTriangle, CheckCircle, Shield, Globe } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "../services/authService";
import PageLayout from "../components/layout/PageLayout";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppStore();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback State
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect target path
  const redirectPath = location.state?.from || "/dashboard";

  // Redirect immediately if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Handle local validation
  const validateForm = () => {
    setLocalError("");
    setSuccessMessage("");

    if (mode === "signin") {
      if (!email.trim()) {
        setLocalError("Email is required.");
        return false;
      }
      if (!password) {
        setLocalError("Password is required.");
        return false;
      }
    } else {
      if (!name.trim()) {
        setLocalError("Name is required.");
        return false;
      }
      if (!email.trim()) {
        setLocalError("Email is required.");
        return false;
      }
      if (!password) {
        setLocalError("Password is required.");
        return false;
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters.");
        return false;
      }
      if (!confirmPassword) {
        setLocalError("Please confirm your password.");
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return false;
      }
    }
    return true;
  };

  // Handle Email & Password Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setLocalError("");

    if (mode === "signin") {
      const result = await signInWithEmail({ email: email.trim(), password });
      if (result.ok) {
        navigate(redirectPath, { replace: true });
      } else {
        setLocalError(result.error);
        setSubmitting(false);
      }
    } else {
      const result = await signUpWithEmail({ name: name.trim(), email: email.trim(), password });
      if (result.ok) {
        setSuccessMessage("Account created successfully. Redirecting...");
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1200);
      } else {
        setLocalError(result.error);
        setSubmitting(false);
      }
    }
  };

  // Handle Google Sign In
  const handleGoogleAuth = async () => {
    setLocalError("");
    setSuccessMessage("");
    setSubmitting(true);

    const result = await signInWithGoogle();
    if (result.ok) {
      navigate(redirectPath, { replace: true });
    } else {
      setLocalError(result.error);
      setSubmitting(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setLocalError("");
    setSuccessMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <PageLayout noNav={true}>
      <div 
        id="auth-page-container"
        className="flex min-h-screen w-full bg-[#fcfbfa] font-sans text-slate-800"
      >
        {/* Left branding panel - Hidden on small screens */}
        <div 
          id="auth-branding-panel"
          className="hidden md:flex md:w-[42%] flex-col justify-between bg-gradient-to-br from-[#0a6e6b] to-[#044a48] p-12 border-r border-slate-200 text-white"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 3 C28 3 34 8 34 16 C34 25 20 37 20 37 C20 37 6 25 6 16 C6 8 12 3 20 3 Z" fill="#ffffff" />
              <circle cx="20" cy="14" r="4" fill="#0a6e6b" />
              <polygon points="16,15 24,15 20,24" fill="#0a6e6b" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              NagarNiti
            </span>
          </div>

          {/* Slogan */}
          <div className="my-auto max-w-sm text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-100 bg-white/10 px-3 py-1 rounded-full">
              Civic Command Center
            </span>
            <h1 className="text-4xl font-sans font-extrabold tracking-tight text-white mb-6 leading-tight mt-4">
              Empowering Citizen-Led Governance.
            </h1>
            <p className="text-sm text-teal-50/80 leading-relaxed">
              Log, track, and escalate hyperlocal civic reports. Our sequential multi-agent pipeline validates and scores urgency to draft professional escalations automatically.
            </p>
          </div>

          {/* Footer badge */}
          <div className="flex items-center gap-2 text-xs text-teal-100/70 font-mono">
            <Shield className="w-4 h-4 text-white" />
            <span>SECURE CITIZEN ACCESS PANEL</span>
          </div>
        </div>

        {/* Right authentication panel */}
        <div 
          id="auth-form-panel"
          className="w-full md:w-[58%] flex flex-col justify-center items-center px-6 py-12 md:px-16"
        >
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Header */}
            <div className="flex md:hidden items-center justify-center gap-3 mb-8">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 3 C28 3 34 8 34 16 C34 25 20 37 20 37 C20 37 6 25 6 16 C6 8 12 3 20 3 Z" fill="#0a6e6b" />
                <circle cx="20" cy="14" r="4" fill="#ffffff" />
                <polygon points="16,15 24,15 20,24" fill="#ffffff" />
              </svg>
              <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                NagarNiti
              </span>
            </div>

            {/* Intro text */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-900">
                {mode === "signin" ? "Sign in to NagarNiti" : "Create your Citizen Account"}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {mode === "signin" 
                  ? "Welcome back. Authenticate to access your civic dashboard." 
                  : "Join your local ward community to improve Pune's civic infrastructure."}
              </p>
            </div>

            {/* Error Display */}
            {localError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-left">
                  <span className="font-semibold block text-red-800">Authentication Alert</span>
                  <p className="mt-1 text-xs text-red-700 leading-normal">{localError}</p>
                </div>
              </motion.div>
            )}

            {/* Success Display */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-800 text-sm"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-left">
                  <span className="font-semibold block text-emerald-900">Success</span>
                  <p className="mt-0.5 text-xs text-emerald-800">{successMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Main authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {mode === "signup" && (
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="e.g. Anand Deshpande"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="auth-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="name@pune.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="auth-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-1">
                  <label htmlFor="auth-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={submitting}
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-teal-700/10 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Register Citizen Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={submitting}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-lg flex items-center justify-center gap-2.5 transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Mode toggle footer */}
            <p className="text-center text-sm text-slate-500 mt-6">
              {mode === "signin" ? (
                <>
                  New to NagarNiti?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="text-teal-700 hover:text-teal-800 font-bold cursor-pointer"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="text-teal-700 hover:text-teal-800 font-bold cursor-pointer"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
            
            <div className="pt-2 text-center">
              <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">
                ← Back to Homepage
              </Link>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
