import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import AnimatedBackground from "../Register/AnimatedBackground";
import { verifyEmail } from "../../api/auth/client";

export default function VerifyEmail() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  const requestedToken = useRef(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token || requestedToken.current === token) return;
    requestedToken.current = token;

    verifyEmail(token)
      .then(() => {
        setResult({
          token,
          status: "success",
          message: "Your email address has been verified. You can now sign in.",
        });
      })
      .catch((error) => {
        setResult({
          token,
          status: "error",
          message: error.message || "Unable to verify your email address.",
        });
      });
  }, [token]);

  const status = !token
    ? {
        status: "error",
        message: "This verification link is missing its token.",
      }
    : result?.token === token
      ? result
      : { status: "loading", message: "Verifying your email address..." };

  const isSuccess = status.status === "success";
  const isError = status.status === "error";
  const StatusIcon = isSuccess
    ? CircleCheck
    : isError
      ? CircleAlert
      : LoaderCircle;

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black p-6 text-white">
      <AnimatedBackground />
      <section className="relative z-10 w-full max-w-md rounded-xl border border-white/15 bg-black/70 p-8 text-center shadow-2xl backdrop-blur-md">
        <StatusIcon
          aria-hidden="true"
          className={`mx-auto mb-5 h-12 w-12 ${
            isSuccess
              ? "text-green-400"
              : isError
                ? "text-red-400"
                : "animate-spin text-red-400"
          }`}
        />
        <h1 className="mb-3 text-2xl font-semibold">
          {isSuccess
            ? "Email verified"
            : isError
              ? "Verification unsuccessful"
              : "Verifying your email"}
        </h1>
        <p
          className={`text-sm ${
            isError ? "text-red-300" : "text-gray-300"
          }`}
          role={isError ? "alert" : "status"}
        >
          {status.message}
        </p>
        {status.status !== "loading" && (
          <Link
            to={isSuccess ? "/login" : "/get-started"}
            className="mt-7 inline-flex rounded-lg bg-red-500 px-6 py-3 font-medium transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {isSuccess ? "Sign in" : "Create an account"}
          </Link>
        )}
      </section>
    </main>
  );
}
