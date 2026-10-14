
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import { registerUser } from "../../api/auth/client";

export default function RegisterUser() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      await registerUser({
        fullName: formData.get("fullName"),
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      });
      setSuccess("Your account has been created successfully.");
    } catch (error) {
      setError(error.message || "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-black">
      <AnimatedBackground />

      {/* Back to landing page */}
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Back to landing page"
        className="absolute left-6 top-6 z-20 flex items-center gap-2
                   px-3 py-2 text-sm text-white transition cursor-pointer
                   hover:border-red-500 hover:text-red-400"
      >
        <ArrowLeft size={26} strokeWidth={2} />
      </button>

      {/* Registration form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <form
          className="w-full max-w-md rounded-xl border border-white/15
                     bg-black/60 p-8 text-white shadow-2xl backdrop-blur-md"
          onSubmit={handleSubmit}
        >
          <h1 className="mb-2 text-2xl font-semibold">
            Create New Account
          </h1>

          <p className="mb-8 text-sm text-gray-400">
            Join Stream and be part of a global community.
          </p>

          {/* Full name */}
          <label htmlFor="fullName" className="mb-2 block text-sm">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            required
            className="mb-6 w-full border-b border-white/20 bg-transparent
                       py-3 text-white outline-none transition
                       placeholder:text-gray-500 focus:border-red-500"
          />

          {/* Username */}
          <label htmlFor="username" className="mb-2 block text-sm">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            required
            className="mb-6 w-full border-b border-white/20 bg-transparent
                       py-3 text-white outline-none transition
                       placeholder:text-gray-500 focus:border-red-500"
          />

          {/* Email */}
          <label htmlFor="email" className="mb-2 block text-sm">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            className="mb-6 w-full border-b border-white/20 bg-transparent
                       py-3 text-white outline-none transition
                       placeholder:text-gray-500 focus:border-red-500"
          />

          {/* Password with show/hide button */}
          <label htmlFor="password" className="mb-2 block text-sm">
            Password
          </label>

          <div className="mb-8 flex items-center border-b border-white/20 transition focus-within:border-red-500">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              required
              minLength={8}
              className="w-full bg-transparent py-3 text-white
                         outline-none placeholder:text-gray-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="ml-2 rounded p-1 text-gray-400 transition
                         hover:text-white focus:outline-none cursor-pointer
                         focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p role="alert" className="mb-4 text-sm text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="mb-4 text-sm text-green-400">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-red-500 py-3 font-medium
                       transition hover:bg-red-600 disabled:cursor-not-allowed
                       disabled:opacity-60
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-red-400 focus-visible:ring-offset-2
                       focus-visible:ring-offset-black"
          >
            {isSubmitting ? "Creating Account..." : "Create Account →"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium text-red-400 hover:text-red-300 cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}
