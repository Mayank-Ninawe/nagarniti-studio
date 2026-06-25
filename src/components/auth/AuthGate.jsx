import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { observeAuthState } from "../../services/authService";
import { motion } from "motion/react";

export default function AuthGate({ children }) {
  const { setUser, authLoading, setAuthLoading } = useAppStore();

  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  if (authLoading) {
    return (
      <div 
        id="auth-loading-gate"
        className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-50"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mb-6"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold font-sans tracking-wide text-emerald-400 mb-1">
            NagarNiti
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            SECURELY LOADING SYSTEM STATE...
          </p>
        </motion.div>
      </div>
    );
  }

  return children;
}
