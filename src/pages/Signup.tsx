import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {Mail, Lock, User, Eye, EyeOff, Globe, ArrowRight, Loader2, AlertCircle, Check, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { POST } from "../lib/request";
import { API } from "../lib/endpoints";
import signupImage from "@/assets/grow_travel.jpeg";

export default function SignupPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const passwordStrength = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
    };
    const isStrongPassword = Object.values(passwordStrength).every(Boolean);
    const passwordStrengthCount = Object.values(passwordStrength).filter(Boolean).length;

    const getPasswordStrengthColor = () => {
        if (passwordStrengthCount === 0) return "bg-slate-300";
        if (passwordStrengthCount === 1) return "bg-red-500";
        if (passwordStrengthCount === 2) return "bg-orange-500";
        if (passwordStrengthCount === 3) return "bg-yellow-500";
        return "bg-green-500";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!isStrongPassword) {
            setError("Password is not strong enough");
            return;
        }

        if (!agreedToTerms) {
            setError("Please agree to the Terms of Service");
            return;
        }

        setIsLoading(true);
        try {
            await POST(API.AUTH.REGISTER, {
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: unknown) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as { message: string }).message)
                    : "Signup failed. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        console.log("Google Signup");
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute -bottom-8 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

            {/* Left Side - Image */}
            <div
                className="hidden lg:flex lg:w-1/2 relative"
                style={{
                    backgroundImage: `url(${signupImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

                <div className="relative z-10 flex flex-col justify-between p-16 text-white h-full">
                  
                    {/* Bottom */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <span className="text-body-lg">✨</span>
                            <span className="text-body-sm fw-medium">Join 50,000+ Happy Travelers</span>
                        </div>

                        <h1 className="text-display fw-bold leading-tight">
                            Start Your
                            <br />
                            Journey Today
                        </h1>

                        <p className="text-body-lg text-white/90 max-w-lg">
                            Create your account and unlock personalized travel recommendations, exclusive deals, and unforgettable adventures.
                        </p>

                        <div className="flex gap-4 pt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="text-body-sm">Instant Setup</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="text-body-sm">Safe & Secure</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="text-body-sm">Free Forever</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 text-center animate-in fade-in slide-in-from-top-2 duration-300 flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            <span className="fw-medium">Account created! Redirecting...</span>
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex lg:hidden items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="fw-bold text-slate-900">MyTravelTown</h2>
                        </div>

                        <h1 className="fw-bold text-slate-900">
                            Join MyTravelTown
                        </h1>
                        <p className="text-slate-600 mt-2 text-body-lg">
                            Create your account to start exploring amazing destinations
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 backdrop-blur-2xl shadow-2xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleSignup} className="space-y-5">

                            {/* Full Name Input */}
                            <div className="group">
                                <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    Full Name
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'fullName' ? 'transform scale-105' : ''}`}>
                                    <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none ${focusedField === 'fullName' ? 'opacity-100' : ''}`}
                                        style={{
                                            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent)',
                                        }}
                                    ></div>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('fullName')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                                    />
                                    {formData.fullName && (
                                        <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in fade-in" />
                                    )}
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="group">
                                <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    Email Address
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-105' : ''}`}>
                                    <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none ${focusedField === 'email' ? 'opacity-100' : ''}`}
                                        style={{
                                            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent)',
                                        }}
                                    ></div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                                    />
                                    {formData.email && (
                                        <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in fade-in" />
                                    )}
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-blue-600" />
                                    Password
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-105' : ''}`}>
                                    <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none ${focusedField === 'password' ? 'opacity-100' : ''}`}
                                        style={{
                                            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent)',
                                        }}
                                    ></div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Create a strong password"
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength */}
                                {formData.password && (
                                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {/* Strength Bar */}
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                                style={{ width: `${(passwordStrengthCount / 4) * 100}%` }}
                                            ></div>
                                        </div>

                                        {/* Strength Text */}
                                        <p className="text-caption fw-medium text-slate-600">
                                            {passwordStrengthCount === 0 && "Enter a password"}
                                            {passwordStrengthCount === 1 && "Weak password"}
                                            {passwordStrengthCount === 2 && "Fair password"}
                                            {passwordStrengthCount === 3 && "Good password"}
                                            {passwordStrengthCount === 4 && "Strong password"}
                                        </p>

                                        {/* Requirements */}
                                        <div className="space-y-1.5">
                                            <div className={`flex items-center gap-2 text-caption transition-colors duration-300 ${passwordStrength.length ? 'text-green-600' : 'text-slate-500'}`}>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${passwordStrength.length ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                    {passwordStrength.length && <Check className="w-3 h-3" />}
                                                </div>
                                                At least 8 characters
                                            </div>
                                            <div className={`flex items-center gap-2 text-caption transition-colors duration-300 ${passwordStrength.uppercase ? 'text-green-600' : 'text-slate-500'}`}>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${passwordStrength.uppercase ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                    {passwordStrength.uppercase && <Check className="w-3 h-3" />}
                                                </div>
                                                One uppercase letter
                                            </div>
                                            <div className={`flex items-center gap-2 text-caption transition-colors duration-300 ${passwordStrength.lowercase ? 'text-green-600' : 'text-slate-500'}`}>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${passwordStrength.lowercase ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                    {passwordStrength.lowercase && <Check className="w-3 h-3" />}
                                                </div>
                                                One lowercase letter
                                            </div>
                                            <div className={`flex items-center gap-2 text-caption transition-colors duration-300 ${passwordStrength.number ? 'text-green-600' : 'text-slate-500'}`}>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${passwordStrength.number ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                    {passwordStrength.number && <Check className="w-3 h-3" />}
                                                </div>
                                                One number
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Input */}
                            <div className="group">
                                <label className="block text-body-sm fw-semibold text-slate-900 mb-2.5 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-blue-600" />
                                    Confirm Password
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'transform scale-105' : ''}`}>
                                    <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none ${focusedField === 'confirmPassword' ? 'opacity-100' : ''}`}
                                        style={{
                                            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent)',
                                        }}
                                    ></div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('confirmPassword')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Confirm your password"
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <Check className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in fade-in" />
                                    )}
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-caption text-red-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Passwords do not match
                                    </p>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-body-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="fw-medium">{error}</span>
                                </div>
                            )}

                            {/* Terms Checkbox */}
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-body-sm text-slate-700 leading-relaxed">
                                    I agree to the{" "}
                                    <a href="#" className="text-blue-600 hover:text-blue-700 fw-semibold transition">Terms of Service</a>
                                    {" "}and{" "}
                                    <a href="#" className="text-blue-600 hover:text-blue-700 fw-semibold transition">Privacy Policy</a>
                                </span>
                            </label>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !agreedToTerms || !formData.fullName || !formData.email || !isStrongPassword}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white fw-bold text-body-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Creating account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span>Create Account</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-300"></div>
                            <span className="text-body-sm text-slate-600 fw-medium">or</span>
                            <div className="h-px flex-1 bg-slate-300"></div>
                        </div>

                        {/* Social Signup */}
                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white/60 hover:bg-white text-slate-900 fw-semibold transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm hover:shadow-md"
                        >
                            <FcGoogle size={24} />
                            <span>Sign up with Google</span>
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-body-sm text-slate-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 fw-bold transition"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-caption text-slate-500 mt-6">
                        By signing up, you agree to our{" "}
                        <a href="#" className="text-blue-600 hover:underline">Terms</a>
                        {" "}and{" "}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
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