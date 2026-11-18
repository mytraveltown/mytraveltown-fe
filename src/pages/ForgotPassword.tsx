import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Phone,
  Smartphone,
} from "lucide-react";
import { POST } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { useAuth } from "@/hooks/useAuth";
import type { UserInterface } from "@/lib/interface";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type ResetStep = "phone" | "reset";
type ResetLoginResponse = {
  token: string;
  user: UserInterface & { password?: string };
  message: string;
};

const blobStyles = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
`;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<ResetStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [displayOtp, setDisplayOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const normalizedPhone = phone.replace(/\D/g, "");

  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const isStrongPassword = Object.values(passwordStrength).every(Boolean);

  const sendResetOtp = async () => {
    setError("");
    setInfo("");

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (normalizedPhone.length != 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await POST<{
        message: string;
        expiresIn: number;
        debugOtp?: string;
      }>(API.AUTH.SEND_RESET_OTP, { phone: normalizedPhone });

      setStep("reset");
      setOtp("");
      setResendIn(60);
      setInfo(response.message);
      setDisplayOtp(response.debugOtp || "");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to send OTP. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "phone") {
      await sendResetOtp();
      return;
    }

    setError("");
    setInfo("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isStrongPassword) {
      setError("Password must be at least 8 characters with upper, lower, and a number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await POST<ResetLoginResponse>(API.AUTH.RESET_PASSWORD_OTP, {
        phone: normalizedPhone,
        otp,
        newPassword: password,
      });

      const { token, user } = response;
      const { password: _, ...safeUser } = user;
      login(safeUser, token);
      navigate("/");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to reset password. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute -bottom-8 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      <div
        className="hidden lg:flex lg:w-1/2 relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2000')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-16 text-white h-full">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="text-body-lg">🔒</span>
              <span className="text-body-sm fw-medium">Secure phone verification</span>
            </div>
            <h1 className="text-display fw-bold leading-tight">
              Reset Your
              <br />
              Password
            </h1>
            <p className="text-body-lg text-white/90 max-w-lg">
              Verify your phone with OTP, set a new password, and sign in instantly.
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              {["Phone OTP", "New Password", "Auto Login"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-body-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {(["phone", "reset"] as ResetStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      step === s || (step === "reset" && s === "phone")
                        ? "bg-blue-600"
                        : "bg-slate-200"
                    }`}
                  />
                  {i === 0 && <div className="w-2" />}
                </div>
              ))}
            </div>
            <h1 className="fw-bold text-slate-900">
              {step === "phone" ? "Forgot Password?" : "Set New Password"}
            </h1>
            <p className="text-slate-600 mt-2 text-body-lg">
              {step === "phone"
                ? "Enter your registered phone number to receive an OTP"
                : "Enter OTP and choose a new password"}
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/40 backdrop-blur-2xl shadow-2xl p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === "phone" ? (
                <div className="group">
                  <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Phone Number
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      focusedField === "phone" ? "transform scale-[1.02]" : ""
                    }`}
                  >
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="9876543210"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                    />
                    {normalizedPhone.length == 10 && (
                      <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-caption text-slate-500 mt-2">
                    OTP will be sent only if an account exists with this phone number.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-body-sm text-blue-800 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 shrink-0" />
                    OTP sent to {phone}
                  </div>

                  {displayOtp && (
                    <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-4 text-center">
                      <p className="text-caption fw-semibold uppercase tracking-wide text-amber-800">
                        Your OTP (shown until SMS is enabled)
                      </p>
                      <p className="mt-2 text-headline fw-bold tracking-code text-amber-900 font-mono">
                        {displayOtp}
                      </p>
                      <button
                        type="button"
                        onClick={() => setOtp(displayOtp)}
                        className="mt-3 text-body-sm fw-semibold text-amber-800 hover:text-amber-950 underline"
                      >
                        Auto-fill OTP
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-body-sm fw-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-blue-600" />
                      Enter OTP
                    </label>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={(value) => {setOtp(value.replace(/\D/g, ""));}}>
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="h-12 w-11 text-body-lg bg-white/80"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 chars, upper, lower, number"
                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-body-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setPassword("");
                        setConfirmPassword("");
                        setDisplayOtp("");
                        setError("");
                        setInfo("");
                      }}
                      className="fw-semibold text-slate-600 hover:text-slate-900"
                    >
                      Change phone
                    </button>
                    <button
                      type="button"
                      disabled={resendIn > 0 || isLoading}
                      onClick={sendResetOtp}
                      className="fw-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400"
                    >
                      {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-body-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="fw-medium">{error}</span>
                </div>
              )}

              {info && !error && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 text-body-sm">
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (step === "phone" && normalizedPhone.length < 10)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white fw-bold text-body-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{step === "phone" ? "Sending OTP..." : "Resetting..."}</span>
                  </>
                ) : (
                  <>
                    <span>{step === "phone" ? "Send OTP" : "Reset Password & Login"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white/60 hover:bg-white text-slate-900 fw-semibold transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </button>
          </div>
        </div>
      </div>

      <style>{blobStyles}</style>
    </div>
  );
}
