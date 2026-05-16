import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, X } from "lucide-react";
import { loginUser } from "../Api/action";
import { CommonToaster } from "../Common/CommonToaster";
import { usePermissions } from "../Context/PermissionContext";
import { useFavorites } from "../Context/FavoritesContext";
import { useLanguage } from "../Language/LanguageContext";
import { translations } from "../Language/translations";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const navigate = useNavigate();
  const { refreshPermissions, getFirstAccessiblePath } = usePermissions();
  const { fetchFavorites } = useFavorites();
  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Check for error in URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("error") === "inactive") {
      setError("Your account has been deactivated or deleted. Please contact admin.");
    }
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });



  const handleLogin = async (data) => {
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(data);
      if (res.data.success) {
        const user = res.data.user;
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", user?._id || user?.id || "");
        localStorage.setItem("userName", user?.name || "");
        localStorage.setItem("userRole", user?.role || "user");
        const newPermissions = await refreshPermissions();
        await fetchFavorites();
        CommonToaster(t.loginSuccess, "success");

        // Redirect all users to profile/dashboard page to show their details
        const firstPath = getFirstAccessiblePath(newPermissions);
        navigate(firstPath || "/dashboard/profile");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || t.loginFailed
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(formData);
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f6f4ff] to-[#e5defc] relative overflow-hidden">
      <LanguageSwitcher />
      {/* Subtle skyline background */}
      <div
        className="absolute bottom-0 left-0 w-full bg-contain bg-bottom bg-no-repeat h-120"
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
          {t.staffLogin}
        </h2>
        <p className="text-center text-[#000] text-md mb-8">
          {t.staffLoginSubtitle}
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
            <div className="flex justify-end mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-[#4A3AFF] hover:underline"
              >
                {t.forgotPassword}
              </Link>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-red-500 text-xs bg-red-50 py-2 rounded-md border border-red-200">
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

        </form>
      </div>
    </div>
  );
}
