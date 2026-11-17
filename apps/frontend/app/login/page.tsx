"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import { Footer } from "@/components/footer";
import { staffAuthAPI, type AuthPurpose } from "@/lib/api";

type Mode = "signin" | "email" | "otp" | "password";

const getApiErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { error?: string } } })
      .response;
    return response?.data?.error || fallback;
  }
  return fallback;
};

const inputClass =
  "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all";
const primaryBtn =
  "w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("signin");
  const [purpose, setPurpose] = useState<AuthPurpose>("ACTIVATE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Only allow same-site relative redirects.
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/";

  const reset = (nextMode: Mode, nextPurpose?: AuthPurpose) => {
    setMode(nextMode);
    if (nextPurpose) setPurpose(nextPurpose);
    setError(null);
    setInfo(null);
    setOtp("");
    setPassword("");
    setConfirm("");
  };

  const run = async (fn: () => Promise<void>, fallback: string) => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await fn();
    } catch (err) {
      setError(getApiErrorMessage(err, fallback));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await staffAuthAPI.login(email, password);
      router.push(next);
    }, "Sign in failed");
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await staffAuthAPI.requestOtp(email, purpose);
      setMode("otp");
      setInfo(`We sent a 6-digit OTP to ${email.trim().toLowerCase()}.`);
    }, "Could not send OTP");
  };

  const handleResend = () =>
    run(async () => {
      await staffAuthAPI.requestOtp(email, purpose);
      setInfo("A new OTP has been sent.");
    }, "Could not resend OTP");

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await staffAuthAPI.verifyOtp(email, purpose, otp);
      setSetupToken(res.data.setupToken);
      setMode("password");
    }, "Could not verify OTP");
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    run(async () => {
      await staffAuthAPI.setPassword(setupToken, password);
      router.push(next);
    }, "Could not set password");
  };

  const title = {
    signin: "Staff Sign In",
    email: purpose === "ACTIVATE" ? "First Time Activation" : "Reset Password",
    otp: "Verify Your Email",
    password:
      purpose === "ACTIVATE" ? "Create Your Password" : "Choose a New Password",
  }[mode];

  const subtitle = {
    signin: "TPO Admin Portal - Gyan Ganga Group of Institutions",
    email:
      "Enter your whitelisted email and we will send you a verification OTP.",
    otp: info ?? "Enter the OTP sent to your email.",
    password:
      "Use at least 8 characters. You will use this to sign in from now on.",
  }[mode];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <Image
              src="/footerLogo.png"
              alt="Gyan Ganga Group of Institutions"
              width={180}
              height={100}
              priority
              className="mx-auto h-auto w-44"
            />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Training &amp; Placement Cell
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Gyan Ganga Institute of Technology &amp; Sciences, Jabalpur
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              <p className="text-slate-500 mt-2 text-sm">{subtitle}</p>
            </div>

            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
                <div className="flex justify-between text-sm pt-2">
                  <button
                    type="button"
                    onClick={() => reset("email", "ACTIVATE")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    First Time Activation
                  </button>
                  <button
                    type="button"
                    onClick={() => reset("email", "RESET")}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    Forgot password?
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center pt-4 border-t border-slate-200">
                  Recruiters and partners: please use the access link shared
                  with you by the TPO. Please contact the{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-blue-600 hover:text-blue-700 underline"
                  >
                    Training and Placement Officer (TPO)
                  </Link>{" "}
                  for assistance.
                </p>
              </form>
            )}

            {mode === "email" && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pl-11`}
                    required
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {loading ? "Sending..." : "Send OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => reset("signin")}
                  className="w-full text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to sign in
                </button>
              </form>
            )}

            {mode === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono`}
                  required
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={primaryBtn}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => reset("email")}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {mode === "password" && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="New password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pl-11`}
                    required
                  />
                </div>
                <input
                  type="password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                  required
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {loading ? "Saving..." : "Set Password & Continue"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Officially backed by the Training &amp; Placement Cell, Gyan Ganga.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
