import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnimatedBackground from "../Register/AnimatedBackground";
import { forgotPassword } from "../../api/auth/client";

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    const form = event.currentTarget;

    try {
      const formData = new FormData(form);
      await forgotPassword(formData.get("email").trim());
      setSuccess(
        "If an account exists for that email, a password reset link has been sent. Check your inbox."
      );
      form.reset();
    } catch (requestError) {
      setError(
        requestError.message || "Unable to send a password reset email."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-black">
      <AnimatedBackground />
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Back to landing page"
        className="absolute left-6 top-6 z-20 flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-white transition hover:text-red-400"
      >
        <ArrowLeft size={26} strokeWidth={2} />
      </button>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-xl border border-white/15 bg-black/60 p-8 text-white shadow-2xl backdrop-blur-md"
        >
          <h1 className="text-2xl font-semibold">Forgot your password?</h1>
          <p className="mb-8 mt-2 text-sm text-gray-400">
            Enter your account email and we’ll send you a reset link.
          </p>

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
            className="mb-6 w-full border-b border-white/20 bg-transparent py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-red-500"
          />

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
            className="w-full cursor-pointer rounded-lg bg-red-500 py-3 font-medium transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
