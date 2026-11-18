import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Globe, ArrowRight, Loader2, Pencil, AlertCircle, Check, Smartphone, KeyRound, } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { POST } from "../lib/request";
import { API } from "../lib/endpoints";
import { useAuth } from "../hooks/useAuth";
import type { UserInterface } from "@/lib/interface";
import { canRoleReturnTo, getHomePathForRole, isStaffRole } from "@/lib/utils";
import loginImage from "@/assets/ready_to_travel.jpeg";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

type LoginResponse = {
    token: string;
    user: UserInterface & { password?: string };
};

type LoginMode = "password" | "otp";
type OtpStep = "identifier" | "verify";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string; search?: string } })?.from;

    const { login } = useAuth();

    const [loginMode, setLoginMode] = useState<LoginMode>("otp");
    const [otpStep, setOtpStep] = useState<OtpStep>("identifier");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [displayOtp, setDisplayOtp] = useState("");
    const [resendIn, setResendIn] = useState(0);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        if (resendIn <= 0) return;
        const timer = window.setInterval(() => {
            setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [resendIn]);

    const redirectAfterLogin = (role: UserInterface["role"]) => {
        if (isStaffRole(role)) {
            navigate(getHomePathForRole(role), { replace: true });
            return;
        }
        // Ignore a saved admin-panel path (e.g. left over from a previous admin session).
        const returnTo = from && canRoleReturnTo(role, from.pathname)
            ? `${from.pathname}${from.search || ""}`
            : getHomePathForRole(role);
        navigate(returnTo, { replace: true });
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (!email || !password) {
            setError("Please enter your email and password");
            return;
        }

        setIsLoading(true);

        try {
            const response = await POST<LoginResponse>(API.AUTH.LOGIN, {
                email,
                password,
            });
            const { token, user } = response;
            const { password: _, ...safeUser } = user;
            login(safeUser, token);
            redirectAfterLogin(safeUser.role);
        } catch (err: unknown) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as { message: string }).message)
                    : "Login failed. Please check your credentials and try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const sendOtp = async () => {
        setError("");
        setInfo("");

        if (!phone.trim()) {
            setError("Please enter your phone number");
            return;
        }

        const normalizedPhone = phone.replace(/\D/g, "");
        if (normalizedPhone.length != 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);

        try {
            const response = await POST<{
                message: string;
                channel: "phone";
                isNew?: boolean;
                expiresIn: number;
                debugOtp?: string;
            }>(API.AUTH.SEND_OTP, { phone: normalizedPhone });

            setOtpStep("verify");
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

    const handleOtpLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otpStep === "identifier") {
            await sendOtp();
            return;
        }

        setError("");
        setInfo("");

        if (otp.length !== 6) {
            setError("Please enter the 6-digit OTP");
            return;
        }

        setIsLoading(true);

        try {
            const response = await POST<LoginResponse>(API.AUTH.VERIFY_OTP, {
                phone: phone.replace(/\D/g, ""),
                otp,
            });
            const { token, user } = response;
            const { password: _, ...safeUser } = user;
            login(safeUser, token);
            redirectAfterLogin(safeUser.role);
        } catch (err: unknown) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as { message: string }).message)
                    : "Invalid OTP. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const switchLoginMode = (mode: LoginMode) => {
        setLoginMode(mode);
        setOtpStep("identifier");
        setError("");
        setInfo("");
        setOtp("");
        setDisplayOtp("");
    };

    const handleGoogleLogin = () => {
        console.log("Google Login");
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute -bottom-8 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

            <div
                className="hidden lg:flex lg:w-1/2 relative"
                style={{
                    backgroundImage: `url(${loginImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

                <div className="relative z-10 flex flex-col justify-between p-16 text-white h-full">
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <span className="text-body-lg">🌍</span>
                            <span className="text-body-sm fw-medium">Trusted by 50,000+ Travelers</span>
                        </div> */}

                        <h1 className="text-display fw-bold leading-tight">
                            Explore the
                            <br />
                            World With Us
                        </h1>

                        <p className="text-body-lg text-white/90 max-w-lg">
                            Discover incredible destinations, book amazing trips, and create unforgettable memories with MyTravelTown.
                        </p>

                        <div className="flex gap-4 pt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="text-body-sm">Verified Partners</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="text-body-sm">Best Prices</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="text-body-sm">24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-md">
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex lg:hidden items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="fw-bold text-slate-900">MyTravelTown</h2>
                        </div>

                        <h1 className="fw-bold text-slate-900">
                            Welcome To MTT
                        </h1>
                        <p className="text-slate-600 mt-2 text-body-lg">
                            Sign in to your account to continue exploring
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/20 bg-white/40 backdrop-blur-2xl shadow-2xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100/80">
                            <button
                                type="button"
                                onClick={() => switchLoginMode("otp")}
                                className={`py-2.5 rounded-lg text-body-sm fw-semibold transition ${loginMode === "otp"
 ? "bg-white text-slate-900 shadow-sm"
 : "text-slate-600 hover:text-slate-900"
 }`}
                            >
                                OTP Login
                            </button>
                            <button
                                type="button"
                                onClick={() => switchLoginMode("password")}
                                className={`py-2.5 rounded-lg text-body-sm fw-semibold transition ${loginMode === "password"
 ? "bg-white text-slate-900 shadow-sm"
 : "text-slate-600 hover:text-slate-900"
 }`}
                            >
                                Password
                            </button>
                        </div>

                        {loginMode === "password" ? (
                            <form onSubmit={handlePasswordLogin} className="space-y-5">
                                <div className="group">
                                    <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        Email Address
                                    </label>
                                    <div className={`relative transition-all duration-300 ${focusedField === "email" ? "transform scale-105" : ""}`}>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedField("email")}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                                        />
                                        {email && (
                                            <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                        )}
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-blue-600" />
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField("password")}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-body-sm flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span className="fw-medium">{error}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-body-sm fw-medium text-slate-700">Remember me</span>
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-body-sm fw-semibold text-blue-600 hover:text-blue-700 transition"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white fw-bold text-body-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleOtpLogin} className="space-y-5">
                                {otpStep === "identifier" ? (
                                    <div className="group">
                                        <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-blue-600" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="9876543210"
                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                                        />
                                        <p className="text-caption text-slate-500 mt-2">
                                            New here? Enter your phone number and we&apos;ll create a
                                            guest account automatically.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                                            <div>
                                                <p className="text-caption text-blue-600 fw-medium">
                                                    OTP sent to
                                                </p>

                                                <p className="text-body-lg fw-bold text-slate-900">
                                                    +91 {phone}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOtpStep("identifier");
                                                    setOtp("");
                                                    setDisplayOtp("");
                                                    setError("");
                                                    setInfo("");
                                                }}
                                                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-body-sm fw-semibold text-blue-600 hover:bg-blue-100 transition"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                            </button>
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
                                                <InputOTP
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(value) => {
                                                        setOtp(value.replace(/\D/g, ""));
                                                    }}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                >
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

                                        <div className="flex items-center justify-between text-body-sm">
                                            {/* <button
                                                type="button"
                                                onClick={() => {
                                                    setOtpStep("identifier");
                                                    setOtp("");
                                                    setDisplayOtp("");
                                                    setError("");
                                                    setInfo("");
                                                }}
                                                className="fw-semibold text-slate-600 hover:text-slate-900"
                                            >
                                                Change phone number
                                            </button> */}
                                            <button
                                                type="button"
                                                disabled={resendIn > 0 || isLoading}
                                                onClick={sendOtp}
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
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white fw-bold text-body-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{otpStep === "identifier" ? "Sending OTP..." : "Verifying..."}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{otpStep === "identifier" ? "Send OTP" : "Verify & Sign In"}</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-300"></div>
                            <span className="text-body-sm text-slate-600 fw-medium">or</span>
                            <div className="h-px flex-1 bg-slate-300"></div>
                        </div> */}

                        {/* <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white/60 hover:bg-white text-slate-900 fw-semibold transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm hover:shadow-md"
                        >
                            <FcGoogle size={24} />
                            <span>Continue with Google</span>
                        </button> */}
                    </div>

                    <p className="text-center text-caption text-slate-500 mt-6">
                        By signing in, you agree to our{" "}
                        <a href="/terms-and-conditions" className="text-blue-600 hover:underline">Terms</a>
                        {" "}and{" "}
                        <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  33% { transform: translate(30px, -50px) scale(1.1); }
                  66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                  animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                  animation-delay: 2s;
                }
                .animation-delay-4000 {
                  animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
