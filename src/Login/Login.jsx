import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
  Twitter,
  Chrome,
} from "lucide-react";
import { loginUser } from "../Api/action";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await loginUser(formData);
      if (res.data.success) {
        setSuccess("Login successful! Redirecting...");
        localStorage.setItem("token", res.data.token);
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Login failed! Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <h2 className="mt-8 text-3xl font-extrabold text-gray-900 text-center lg:text-center">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center lg:text-center">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Start your free trial
            </Link>
          </p>

          {/* Form */}
          <div className="mt-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium">{success}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm shadow-md hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-5 h-5" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to your account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 relative flex items-center">
              <div className="flex-grow border-t border-gray-300" />
              <span className="px-3 text-gray-500 bg-white text-sm">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            {/* Social Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex justify-center items-center gap-2 py-2.5 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <Chrome className="w-5 h-5 text-red-500" />
                Google
              </button>

              <button
                type="button"
                className="flex justify-center items-center gap-2 py-2.5 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <Twitter className="w-5 h-5 text-sky-500" />
                Twitter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center max-w-lg space-y-6">
          <div className="w-24 h-24 mx-auto bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-bold">
            Secure Access to Your Digital World
          </h3>
          <p className="text-blue-100 text-lg leading-relaxed">
            Join thousands of professionals who trust our platform to manage
            their workflow securely and efficiently.
          </p>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm"></div>
        <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-white/30 rounded-full backdrop-blur-sm"></div>
      </div>
    </div>
  );
}
