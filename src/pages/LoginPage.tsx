import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, Eye, EyeOff, Loader2,
  Key, Mail, Sparkles
} from "lucide-react";
import { authApi } from "../api/client";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      const { access_token } = await authApi.login({ email, password });
      localStorage.setItem("admin_token", access_token);
      toast.success("Welcome back! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={clsx(
              "absolute w-2 h-2 bg-primary/20 rounded-full",
              "animate-float",
              i === 0 && "top-1/4 left-1/4",
              i === 1 && "top-3/4 right-1/4",
              i === 2 && "top-1/3 right-1/3",
              i === 3 && "bottom-1/3 left-1/3",
              i === 4 && "top-2/3 left-2/3",
              i === 5 && "bottom-1/4 right-1/4"
            )}
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>

      <div
        className={clsx(
          "w-full max-w-md transition-all duration-700 transform",
          mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        )}
      >
        {/* Logo and header */}
        <div className="text-center mb-8 relative">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30 group hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10 text-white group-hover:rotate-12 transition-transform" />
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-warning animate-bounce" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-sm text-text-secondary mt-2 flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-primary" />
            Property Management Dashboard
            <span className="w-1 h-1 rounded-full bg-primary" />
          </p>
        </div>

        {/* Form card */}
        <div className="relative group">
          {/* Card glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-surface/80 backdrop-blur-xl rounded-2xl border border-grey-light/50 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <div className="relative group/input">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@propmanager.com"
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-grey-light/50 bg-background/50 text-sm text-text-primary placeholder-grey/50 focus:outline-none focus:border-primary/50 focus:bg-surface focus:shadow-lg transition-all"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey group-focus-within/input:text-primary transition-colors" />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" />
                  Password
                </label>
                <div className="relative group/input">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pl-11 pr-11 rounded-xl border border-grey-light/50 bg-background/50 text-sm text-text-primary placeholder-grey/50 focus:outline-none focus:border-primary/50 focus:bg-surface focus:shadow-lg transition-all"
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey group-focus-within/input:text-primary transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-primary transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-grey-light text-primary focus:ring-primary/20" />
                  <span className="text-text-secondary group-hover:text-primary transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-primary hover:text-primary-dark font-medium transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  "w-full bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3.5 rounded-xl text-sm",
                  "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5",
                  "transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                  "relative overflow-hidden group/btn"
                )}
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <Sparkles className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Stats preview */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: "Properties", value: "2.5k+" },
            { label: "Users", value: "850+" },
            { label: "Active", value: "24/7" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-surface/50 backdrop-blur-sm rounded-xl border border-grey-light/50 p-3 text-center hover:bg-surface/80 transition-all group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-lg font-bold text-primary group-hover:scale-110 transition-transform">
                {stat.value}
              </p>
              <p className="text-[10px] text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add animation keyframes to index.css */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}