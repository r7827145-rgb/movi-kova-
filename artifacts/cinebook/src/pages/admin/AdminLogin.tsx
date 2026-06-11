import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { authenticate, setSession } from "@/lib/adminData";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const session = authenticate(username.trim(), password);
    if (session) {
      setSession(session);
      if (session.type === "theater") {
        setLocation("/admin/theater");
      } else {
        setLocation("/admin/dashboard");
      }
    } else {
      setErrorMsg("Invalid credentials. Check username and password.");
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(248,68,100,0.08) 0%, #0a0a0f 70%)" }}>
      <motion.div
        className="w-full max-w-sm glass-card p-8 rounded-2xl border border-white/8"
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="font-display font-bold text-2xl text-white mb-1 flex items-center justify-center gap-2">
            MOVI KOVA
            <div className="w-1.5 h-1.5 rounded-full bg-[#f84464]"></div>
          </div>
          <div className="text-xs text-[#f84464] font-bold tracking-widest uppercase mb-4">Admin Portal</div>
          <h1 className="text-base font-semibold text-white/80">Sign in to continue</h1>
          <p className="text-xs text-[#9e9e9e] mt-1">Admin or Theater credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="off"
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#f84464] transition-colors placeholder:text-gray-600"
              data-testid="input-admin-username"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="off"
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#f84464] transition-colors placeholder:text-gray-600"
              data-testid="input-admin-password"
            />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-[#f84464] text-xs text-center font-medium"
            >
              {errorMsg}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-white transition-opacity"
            style={{ background: "linear-gradient(135deg, #c62828 0%, #f84464 100%)" }}
            data-testid="button-admin-login"
          >
            Access Panel
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-600 mt-6">
          Admin: username <span className="text-gray-500">admin</span> · Theaters use their assigned credentials
        </p>
      </motion.div>
    </div>
  );
}
