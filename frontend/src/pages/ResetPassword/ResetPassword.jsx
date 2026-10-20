import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react";
import AnimatedBackground from "../Register/AnimatedBackground";
import { resetPassword } from "../../api/auth/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = event.currentTarget;

    const formData = new FormData(form);
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(result?.message || "Your password has been reset.");
      form.reset();
    } catch (requestError) {
      setError(requestError.message || "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = Boolean(success);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-black">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <section className="w-full max-w-md rounded-xl border border-white/15 bg-black/60 p-8 text-white shadow-2xl backdrop-blur-md">
          {isComplete ? (
            <div className="text-center">
              <CircleCheck
                aria-hidden="true"
                className="mx-auto mb-5 h-12 w-12 text-green-400"
              />
              <h1 className="mb-3 text-2xl font-semibold">
                Password reset
              </h1>
              <p role="status" className="text-sm text-gray-300">
                {success}
              </p>
              <Link
                to="/login"
                className="mt-7 inline-flex rounded-lg bg-red-500 px-6 py-3 font-medium transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">Reset your password</h1>
              <p className="mb-8 mt-2 text-sm text-gray-400">
                Choose a new password with at least 8 characters.
              </p>

              {!token && (
                <p role="alert" className="mb-5 flex gap-2 text-sm text-red-400">
                  <CircleAlert
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0"
                  />
                  This password reset link is missing its token. Request a new
                  link to continue.
                </p>
              )}

              <form onSubmit={handleSubmit}>
                <label htmlFor="newPassword" className="mb-2 block text-sm">
                  New password
                </label>
                <div className="relative mb-6">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Enter a new password"
                    required
                    disabled={!token}
                    className="w-full border-b border-white/20 bg-transparent py-3 pr-11 text-white outline-none transition placeholder:text-gray-500 focus:border-red-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm"
                >
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Confirm your new password"
                  required
                  disabled={!token}
                  className="mb-6 w-full border-b border-white/20 bg-transparent py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-red-500 disabled:opacity-50"
                />

                {error && (
                  <p role="alert" className="mb-4 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!token || isSubmitting}
                  className="w-full cursor-pointer rounded-lg bg-red-500 py-3 font-medium transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Need a reset link?{" "}
                <Link
                  to="/forgot-password"
                  className="font-medium text-red-400 hover:text-red-300"
                >
                  Request one
                </Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
