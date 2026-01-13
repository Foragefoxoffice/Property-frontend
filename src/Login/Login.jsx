import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser } from "../Api/action";
import { CommonToaster } from "../Common/CommonToaster";
import { usePermissions } from "../Context/PermissionContext";
import { useFavorites } from "../Context/FavoritesContext";
import { useLanguage } from "../Language/LanguageContext";
import { translations } from "../Language/translations";

export default function Login() {
  const navigate = useNavigate();
  const { refreshPermissions } = usePermissions();
  const { fetchFavorites } = useFavorites();
  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(formData);
      if (res.data.success) {
        const user = res.data.user;
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", user?.name || "");
        localStorage.setItem("userRole", user?.role || "user");
        await refreshPermissions();
        await fetchFavorites();
        CommonToaster(t.loginSuccess, "success");

        // Redirect based on user role
        if (user?.role === "user") {
          navigate("/");
        } else {
          // Staff, Admin, or other roles go to dashboard
          navigate("/dashboard/lease");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.error || t.loginFailed
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f6f4ff] to-[#e5defc] relative overflow-hidden">
      {/* Subtle skyline background */}
      <div
        className="absolute bottom-0 left-0 w-full bg-cover bg-bottom bg-no-repeat h-120"
        style={{
          backgroundImage: "url('/images/login/bg.png')",
        }}
      />

      {/* Logo */}
      <div className="mb-16 text-center z-10">
        <img className="h-16" src="/images/login/logo.png" alt="" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-lg bg-white shadow-xl rounded-2xl px-8 py-10 border border-gray-100">
        <h2
          style={{ fontWeight: 800, fontSize: 36 }}
          className="text-center text-gray-800 mb-3"
        >
          {t.login}
        </h2>
        <p className="text-center text-[#000] text-md mb-8">
          {t.loginSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
              {t.emailAddress}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t.enterEmail}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t.enterPassword}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-red-500 text-sm bg-red-50 py-2 rounded-md border border-red-200">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer py-3 bg-[#41398B] hover:bg-[#41398be1] text-white font-semibold rounded-4xl shadow-md transition-all flex justify-center items-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} /> {t.loggingIn}
              </>
            ) : (
              t.loginButton
            )}
          </button>

          {/* Register Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {t.dontHaveAccount}{" "}
              <Link
                to="/register"
                className="text-[#4A3AFF] hover:text-[#41398B] font-semibold transition"
              >
                {t.registerHere}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
