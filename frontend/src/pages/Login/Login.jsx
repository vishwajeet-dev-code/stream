import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import AnimatedBackground from "../Register/AnimatedBackground";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      await login({
        username: formData.get("username"),
        password: formData.get("password"),
      });
      const destination = location.state?.from;
      navigate(
        destination?.pathname
          ? `${destination.pathname}${destination.search || ""}${destination.hash || ""}`
          : "/home",
        { replace: true }
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Please try again.");
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

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-xl border border-white/15
                     bg-black/60 p-8 text-white shadow-2xl backdrop-blur-md"
        >
          <h1 className="text-2xl font-semibold">Sign in to Stream</h1>
          <p className="mb-8 mt-2 text-sm text-gray-400">
            Welcome back. Enter your account details to continue.
          </p>

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

          <label htmlFor="password" className="mb-2 block text-sm">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            className="mb-8 w-full border-b border-white/20 bg-transparent
                       py-3 text-white outline-none transition
                       placeholder:text-gray-500 focus:border-red-500"
          />

          {error && (
            <p role="alert" className="mb-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-red-500 py-3 font-medium
                       transition hover:bg-red-600 disabled:cursor-not-allowed
                       disabled:opacity-60 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-red-400
                       focus-visible:ring-offset-2 cursor-pointer
                       focus-visible:ring-offset-black"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/get-started"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default Login;
