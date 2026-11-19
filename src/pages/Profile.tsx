import { useState, useEffect, useRef, useCallback } from "react";
import { encryptId } from "../lib/crypto";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, Mail, Phone, Calendar, Lock, Eye, EyeOff, MessageCircle, LayoutDashboard, Camera, Check, AlertCircle, LogOut, CalendarDays, Loader2, Users, FileText, KeyRound, Heart } from "lucide-react";
import { GET, PUT, POST } from "../lib/request";
import { API } from "../lib/endpoints";
import { uploadOptionalFile } from "@/lib/upload";
import { useAuth } from "../hooks/useAuth";
import { WishlistPackages } from "@/components/WishlistPackages";
import { BookingBalancePanel, hasPendingBalance } from "@/components/BookingBalancePanel";
import { formatINR, profileUrl, isGuestAccountEmail } from "@/lib/utils";
import { toPlainText } from "@/lib/description";
import type { BookingInterface, UserInterface } from "@/lib/interface";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { packagePath } from "@/lib/routes";

type Gender = "male" | "female" | "other" | "";

type ProfileSnapshot = {
  name: string;
  email: string;
  mobile: string;
  age: string;
  gender: Gender;
};

type OtpLoginResponse = {
  token: string;
  user: UserInterface & { password?: string };
};

const bookingStatusStyle: Record<BookingInterface["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function formatTravelDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day:"numeric",
    month: "short",
    year:"numeric",
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn, user: authUser, logout, updateUser, login } = useAuth();

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"profile" | "password" | "booking" | "wishlist">(
    searchParams.get("tab") === "wishlist" ? "wishlist" : "profile"
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [profile, setProfile] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [initialProfile, setInitialProfile] = useState<ProfileSnapshot>({
    name: "",
    email: "",
    mobile: "",
    age: "",
    gender: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(true);
  const [otpInfo, setOtpInfo] = useState("");
  const [otpError, setOtpError] = useState("");
  const [displayOtp, setDisplayOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const digitsOnly = (value: string) => value.replace(/\D/g, "");
  const normalizeMobileInput = (value: string) => digitsOnly(value).slice(0, 10);
  const normalizeStoredMobile = (value: string) => {
    const digits = digitsOnly(value);
    if (digits.length > 10) return digits.slice(-10);
    return digits;
  };

  const applyProfile = (data: UserInterface) => {
    const nextName = data.name || "";
    const nextEmail = data.email || "";
    const nextMobile = data.phone != null ? normalizeStoredMobile(String(data.phone)) : "";
    const nextAge = data.age != null && data.age !== "" ? String(data.age) : "";
    const nextGender = (data.gender as Gender) || "";

    setName(nextName);
    setEmail(nextEmail);
    setMobile(nextMobile);
    setAge(nextAge);
    setGender(nextGender);
    setProfile(data.profile || "");
    setProfileFile(null);
    setProfilePreview("");
    setInitialProfile({
      name: nextName,
      email: nextEmail,
      mobile: nextMobile,
      age: nextAge,
      gender: nextGender,
    });
    setOtp("");
    setOtpSent(false);
    setMobileVerified(true);
    setOtpInfo("");
    setOtpError("");
    setDisplayOtp("");
    setResendIn(0);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await GET<UserInterface>(API.AUTH.MY_PROFILE);
        applyProfile(response);
      } catch (err: unknown) {
        if (authUser) {
          applyProfile(authUser);
        }
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to load profile";
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, navigate, authUser]);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const data = await GET<BookingInterface[]>(API.BOOKING.GET_MINE);
      setBookings(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load bookings";
      setBookingsError(message);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || tab !== "booking") return;
    fetchBookings();
  }, [isLoggedIn, tab, fetchBookings]);

  const handleBalancePaid = useCallback((bookingId: number) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, balance_status: "paid", balance_payment_mode: "platform" }
          : b
      )
    );
  }, []);

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const handleMobileChange = (value: string) => {
    const nextMobile = normalizeMobileInput(value);
    setMobile(nextMobile);
    setSaveError("");
    setOtpError("");
    setOtpInfo("");

    if (nextMobile === initialProfile.mobile) {
      setMobileVerified(true);
      setOtpSent(false);
      setOtp("");
      setDisplayOtp("");
      return;
    }

    setMobileVerified(false);
    setOtpSent(false);
    setOtp("");
    setDisplayOtp("");
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be under 5MB");
      return;
    }

    setPhotoError("");
    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const avatarSrc = profilePreview || (profile ? profileUrl(profile) : "");

  // Password fields
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  const passwordStrength = {
    length: newPwd.length >= 8,
    uppercase: /[A-Z]/.test(newPwd),
    lowercase: /[a-z]/.test(newPwd),
    number: /[0-9]/.test(newPwd),
  };
  const passwordStrengthCount = Object.values(passwordStrength).filter(Boolean).length;
  const isGuestUser = isGuestAccountEmail(email);

  const mobileChanged = mobile !== initialProfile.mobile;
  const isMobileValid = mobile.length === 10;
  const hasFormChanges =
    name !== initialProfile.name ||
    email !== initialProfile.email ||
    mobileChanged ||
    age !== initialProfile.age ||
    gender !== initialProfile.gender ||
    !!profileFile;
  const canSave =
    hasFormChanges &&
    isMobileValid &&
    (!mobileChanged || mobileVerified) &&
    !isSaving;

  const sendMobileOtp = async () => {
    setOtpError("");
    setOtpInfo("");
    setSaveError("");

    if (!isMobileValid) {
      setOtpError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await POST<{
        message: string;
        expiresIn: number;
        debugOtp?: string;
      }>(API.AUTH.PHONE_UPDATE, { phone: mobile });

      setOtpSent(true);
      setOtp("");
      setMobileVerified(false);
      setResendIn(60);
      setOtpInfo(response.message || "OTP sent successfully");
      setDisplayOtp(response.debugOtp || "");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to send OTP. Please try again.";
      setOtpError(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyMobileOtp = async () => {
    setOtpError("");
    setOtpInfo("");
    setSaveError("");

    if (!isMobileValid) {
      setOtpError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await POST<OtpLoginResponse>(API.AUTH.PHONE_UPDATE_VERIFY, {
        phone: mobile,
        otp,
      });

      if (authUser?.id != null && response.user?.id != null && response.user.id !== authUser.id) {
        setOtpError("This mobile number is linked to another account");
        setMobileVerified(false);
        return;
      }

      const { password: _, ...safeUser } = response.user;
      login(safeUser, response.token);
      setMobileVerified(true);
      setOtpInfo("Mobile number verified successfully");
      setDisplayOtp("");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Invalid OTP. Please try again.";
      setOtpError(message);
      setMobileVerified(false);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg("");
    setSaveError("");

    if (!isMobileValid) {
      setSaveError("Mobile number must be exactly 10 digits");
      return;
    }

    if (mobileChanged && !mobileVerified) {
      setSaveError("Please verify your mobile number with OTP before saving");
      return;
    }

    if (!hasFormChanges) {
      setSaveError("No changes to save");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", mobile);
      if (age) formData.append("age", age);
      if (gender) formData.append("gender", gender);
      const profilePath = await uploadOptionalFile(profileFile, "profile");
      if (profilePath) formData.append("profile", profilePath);

      const updated = await PUT<UserInterface>(API.AUTH.UPDATE_PROFILE, formData);
      applyProfile(updated);
      updateUser(updated);
      setSavedMsg("Profile saved successfully");
      setTimeout(() => setSavedMsg(""), 2500);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to save profile";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");

    if (!isGuestUser && !currentPwd) {
      setPwdErr("Please enter your current password");
      return;
    }

    if (!newPwd || !confirmPwd) {
      setPwdErr("Please fill all password fields");
      return;
    }

    if (newPwd.length < 8) {
      setPwdErr("New password must be at least 8 characters");
      return;
    }

    if (!passwordStrength.uppercase || !passwordStrength.lowercase || !passwordStrength.number) {
      setPwdErr("Password must contain uppercase, lowercase, and numbers");
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdErr("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await POST(API.AUTH.CHANGE_PASSWORD, {
        ...(isGuestUser ? {} : { oldPassword: currentPwd }),
        newPassword: newPwd,
      });
      setPwdMsg(isGuestUser ? "Password set successfully" : "Password updated successfully");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setShowCur(false);
      setShowNew(false);
      setShowConfirm(false);
      setTimeout(() => setPwdMsg(""), 2500);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update password";
      setPwdErr(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden [box-shadow:var(--shadow-card)]">
          <div className="h-24 sm:h-28 bg-gradient-to-r from-brand to-primary" aria-hidden="true" />
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 px-5 sm:px-8 pb-6">
            {/* Avatar Section */}
            <div className="shrink-0 mx-auto md:mx-0 flex flex-col items-center md:items-start -mt-12 sm:-mt-14">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                <div className="h-full w-full rounded-full bg-brand ring-4 ring-card flex items-center justify-center text-brand-foreground text-headline fw-bold shadow-md overflow-hidden">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    name.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0.5 right-0.5 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition z-10"
                  aria-label="Change photo"
                >
                  <Camera className="h-4 w-4 text-primary" />
                </button>
              </div>
              {photoError && (
                <p className="mt-2 text-caption text-red-600 text-center">{photoError}</p>
              )}
              {profileFile && !photoError && (
                <p className="mt-2 text-caption text-primary text-center">
                  Photo selected — save to upload
                </p>
              )}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1 text-center md:text-left md:pt-4">
              <h2 className="text-title fw-bold text-foreground break-words">{name}</h2>
              <p className="text-body-sm text-muted-foreground mt-1 flex items-center gap-2 justify-center md:justify-start break-all">
                <Mail className="h-4 w-4 shrink-0" /> {email}
              </p>
              {(gender || age) && (
                <div className="mt-2.5 flex flex-wrap gap-2 justify-center md:justify-start">
                  {gender && (
                    <span className="rounded-full bg-soft px-2.5 py-0.5 text-caption fw-medium text-brand capitalize">
                      {gender}
                    </span>
                  )}
                  {age && (
                    <span className="rounded-full bg-soft px-2.5 py-0.5 text-caption fw-medium text-brand">
                      {age} years old
                    </span>
                  )}
                </div>
              )}
              {loadError && (
                <p className="text-caption text-amber-600 mt-2">{loadError}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0 md:pt-4">
              {authUser?.role === "agent" && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Agent Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full bg-card border border-border text-foreground text-body-sm fw-medium hover:bg-muted transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-1 bg-card rounded-2xl sm:rounded-full border border-border p-1 w-full md:w-fit [box-shadow:var(--shadow-card)]">
          <TabBtn
            active={tab === "profile"}
            onClick={() => setTab("profile")}
            icon={<User className="h-4 w-4" />}
          >
            Profile Details
          </TabBtn>
          <TabBtn
            active={tab === "password"}
            onClick={() => setTab("password")}
            icon={<Lock className="h-4 w-4" />}
          >
            Security
          </TabBtn>
          <TabBtn
            active={tab === "booking"}
            onClick={() => setTab("booking")}
            icon={<CalendarDays className="h-4 w-4" />}
          >
            Bookings
          </TabBtn>
          <TabBtn
            active={tab === "wishlist"}
            onClick={() => setTab("wishlist")}
            icon={<Heart className="h-4 w-4" />}
          >
            Wishlist
          </TabBtn>
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <form
            onSubmit={handleSave}
            className="mt-6 bg-card rounded-2xl border border-border p-5 sm:p-8 [box-shadow:var(--shadow-card)] animate-in fade-in space-y-5 sm:space-y-6"
          >
            <div className="border-b border-border pb-5">
              <h2 className="text-title fw-bold text-foreground">Personal Details</h2>
              <p className="text-body-sm text-muted-foreground mt-1">Keep your contact information up to date.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field
                icon={<User className="h-4 w-4" />}
                label="Full Name"
                value={name}
                onChange={setName}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField ==="name"}
                placeholder="Your name"
              />
              <Field
                icon={<Mail className="h-4 w-4" />}
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === "email"}
                placeholder="you@example.com"
              />
              <div className="space-y-2">
                <label className="block group">
                  <span className="text-body-sm fw-medium text-foreground block mb-1.5">
                    Mobile Number
                  </span>
                  <div
                    className={`flex items-center gap-3 px-3.5 h-11 rounded-xl border bg-card transition ${focusedField === "mobile"
                      ? "border-primary ring-4 ring-primary/10"
                      : mobile.length > 0 && !isMobileValid
                        ? "border-destructive/50"
                        : "border-input hover:border-primary/40"
                      }`}
                  >
                    <span
                      className={`transition-colors duration-300 ${focusedField === "mobile" ? "text-primary" : "text-muted-foreground"
                        }`}
                    >
                      <Phone className="h-4 w-4" />
                    </span>
                    <span className="text-body-sm fw-semibold text-muted-foreground">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      onFocus={() => setFocusedField("mobile")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="9876543210"
                      className="flex-1 bg-transparent outline-none text-body-sm text-foreground placeholder:text-muted-foreground/70"
                    />
                    {mobileVerified && isMobileValid && !mobileChanged && (
                      <span
                        className="shrink-0 inline-flex items-center gap-1 text-caption fw-semibold text-green-600"
                        title="Saved"
                      >
                        <Check className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Saved</span>
                      </span>
                    )}
                    {mobileVerified && mobileChanged && (
                      <span className="inline-flex items-center gap-1 text-caption fw-semibold text-green-600">
                        <Check className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                </label>

                {mobile.length > 0 && !isMobileValid && (
                  <p className="text-caption text-red-600">Mobile number must be exactly 10 digits</p>
                )}

                {mobileChanged && (
                  <div className="rounded-xl border border-primary/20 bg-soft p-4 space-y-4">
                    <p className="text-body-sm text-foreground">
                      Verify your new mobile number with OTP before saving.
                    </p>

                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={sendMobileOtp}
                        disabled={!isMobileValid || isSendingOtp}
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {isSendingOtp ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                        {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        {displayOtp && (
                          <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-center">
                            <p className="text-caption fw-semibold uppercase tracking-wide text-amber-800">
                              Your OTP (shown until SMS is enabled)
                            </p>
                            <p className="mt-2 text-title fw-bold tracking-code text-amber-900 font-mono">
                              {displayOtp}
                            </p>
                            <button
                              type="button"
                              onClick={() => setOtp(displayOtp)}
                              className="mt-2 text-body-sm fw-semibold text-amber-800 hover:text-amber-950 underline"
                            >
                              Auto-fill OTP
                            </button>
                          </div>
                        )}

                        <div>
                          <label className="block text-body-sm fw-semibold text-foreground mb-3 flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-primary" />
                            Enter OTP
                          </label>
                          <div className="flex justify-center sm:justify-start">
                            <InputOTP
                              maxLength={6}
                              value={otp}
                              onChange={(value) => setOtp(value.replace(/\D/g, ""))}
                              inputMode="numeric"
                              pattern="[0-9]*"
                            >
                              <InputOTPGroup>
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                  <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="h-10 w-9 sm:h-11 sm:w-10 text-body-lg bg-white"
                                  />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={verifyMobileOtp}
                            disabled={otp.length !== 6 || isVerifyingOtp || mobileVerified}
                            className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {isVerifyingOtp ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            {mobileVerified
                              ? "Verified"
                              : isVerifyingOtp
                                ? "Verifying..."
                                : "Verify OTP"}
                          </button>
                          <button
                            type="button"
                            disabled={resendIn > 0 || isSendingOtp || mobileVerified}
                            onClick={sendMobileOtp}
                            className="text-body-sm fw-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                          >
                            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                          </button>
                        </div>
                      </div>
                    )}

                    {otpError && (
                      <div className="flex items-center gap-2 text-body-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {otpError}
                      </div>
                    )}
                    {otpInfo && !otpError && (
                      <div className="flex items-center gap-2 text-body-sm text-green-700">
                        <Check className="h-4 w-4 shrink-0" />
                        {otpInfo}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Field
                icon={<Calendar className="h-4 w-4" />}
                label="Age"
                type="number"
                value={age}
                onChange={setAge}
                onFocus={() => setFocusedField("age")}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === "age"}
                placeholder="e.g. 28"
              />

              {/* Gender Selection */}
              <div className="md:col-span-2">
                <label className="text-body-sm fw-medium text-foreground block mb-1.5">
                  Gender
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["male", "female", "other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      aria-pressed={gender === g}
                      className={`inline-flex items-center gap-1.5 h-10 px-5 rounded-full border text-body-sm fw-medium capitalize transition ${gender === g
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-card text-foreground hover:bg-muted"
                        }`}
                    >
                      {gender === g && <Check className="h-3.5 w-3.5" />}
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {saveError && (
              <div className="animate-in fade-in slide-in-from-top-2 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <span className="text-body-sm fw-medium text-destructive">{saveError}</span>
              </div>
            )}

            {/* Success Message */}
            {savedMsg && (
              <div className="animate-in fade-in slide-in-from-top-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-body-sm fw-medium text-emerald-700">{savedMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 border-t border-border pt-5">
              {!hasFormChanges && (
                <p className="text-caption text-muted-foreground">Make a change to enable save</p>
              )}
              {hasFormChanges && !isMobileValid && (
                <p className="text-caption text-red-600">Enter a valid 10-digit mobile number to save</p>
              )}
              {hasFormChanges && isMobileValid && mobileChanged && !mobileVerified && (
                <p className="text-caption text-amber-600">Verify mobile OTP to enable save</p>
              )}
              <button
                type="submit"
                disabled={!canSave}
                className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground fw-semibold text-body-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                                <span className="flex items-center gap-2">
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {tab === "password" && (
          <form
            onSubmit={handleChangePassword}
            className="mt-6 w-full max-w-2xl bg-card rounded-2xl border border-border p-5 sm:p-8 [box-shadow:var(--shadow-card)] animate-in fade-in space-y-5 sm:space-y-6"
          >
            <div className="border-b border-border pb-5">
              <h2 className="text-title fw-bold text-foreground">
                {isGuestUser ? "Set Password" : "Security Settings"}
              </h2>
              <p className="text-body-sm text-muted-foreground mt-1">Use a strong password you don&apos;t use elsewhere.</p>
            </div>

            {isGuestUser && (
              <div className="p-4 rounded-xl bg-soft border border-primary/20 text-body-sm text-foreground">
                You signed in with OTP as a guest. Set a password here to also log in with email
                and password later.
              </div>
            )}

            {!isGuestUser && (
              <PasswordField
                label="Current Password"
                value={currentPwd}
                onChange={setCurrentPwd}
                onFocus={() => setFocusedField("current")}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === "current"}
                show={showCur}
                onToggle={() => setShowCur((v) => !v)}
              />
            )}

            {/* New Password */}
            <div>
              <PasswordField
                label="New Password"
                value={newPwd}
                onChange={setNewPwd}
                onFocus={() => setFocusedField("new")}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField ==="new"}
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
              />

              {/* Password Strength Indicator */}
              {newPwd && (
                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                  {/* Strength Bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrengthCount === 0
                        ? "bg-slate-300"
                        : passwordStrengthCount === 1
                          ? "bg-red-500"
                          : passwordStrengthCount === 2
                            ? "bg-orange-500"
                            : passwordStrengthCount === 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      style={{ width: `${(passwordStrengthCount / 4) * 100}%` }}
                    ></div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <p className="text-caption fw-semibold text-muted-foreground">Password requirements:</p>
                    <div className="space-y-1.5">
                      {[
                        { label: "At least 8 characters", met: passwordStrength.length },
                        { label: "One uppercase letter", met: passwordStrength.uppercase },
                        { label: "One lowercase letter", met: passwordStrength.lowercase },
                        { label: "One number", met: passwordStrength.number },
                      ].map((req) => (
                        <div
                          key={req.label}
                          className={`flex items-center gap-2 text-caption transition-colors duration-300 ${req.met ? "text-green-600" : "text-muted-foreground"
 }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${req.met ? "bg-green-100" : "bg-muted"
                              }`}
                          >
                            {req.met && <Check className="w-3 h-3 text-green-600" />}
                          </div>
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <PasswordField
              label="Confirm New Password"
              value={confirmPwd}
              onChange={setConfirmPwd}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
              isFocused={focusedField === "confirm"}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />

            {/* Password Match Status */}
            {confirmPwd && newPwd !== confirmPwd && (
              <div className="animate-in fade-in slide-in-from-top-2 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <span className="text-body-sm fw-medium text-destructive">Passwords do not match</span>
              </div>
            )}

            {/* Error Message */}
            {pwdErr && (
              <div className="animate-in fade-in slide-in-from-top-2 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <span className="text-body-sm fw-medium text-destructive">{pwdErr}</span>
              </div>
            )}

            {/* Success Message */}
            {pwdMsg && (
              <div className="animate-in fade-in slide-in-from-top-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-body-sm fw-medium text-emerald-700">{pwdMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-stretch sm:justify-end border-t border-border pt-5">
              <button
                type="submit"
                disabled={
                  isChangingPassword ||
                  (!isGuestUser && !currentPwd) ||
                  !newPwd ||
                  !confirmPwd ||
                  newPwd !== confirmPwd
                }
                className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground fw-semibold text-body-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                                <span className="flex items-center gap-2">
                  {isChangingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {isChangingPassword ? "Updating..." : isGuestUser ? "Set Password" : "Update Password"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Wishlist Tab */}
        {tab === "wishlist" && (
          <div className="mt-6 bg-card rounded-2xl border border-border p-5 sm:p-8 [box-shadow:var(--shadow-card)] animate-in fade-in">
            <h2 className="text-title fw-bold text-foreground">My Wishlist</h2>
            <p className="text-body-sm text-muted-foreground mt-1 mb-5 sm:mb-6">Packages you have saved for later</p>
            <WishlistPackages />
          </div>
        )}

        {/* Bookings Tab */}
        {tab === "booking" && (
          <div className="mt-6 bg-card rounded-2xl border border-border p-5 sm:p-8 [box-shadow:var(--shadow-card)] animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
              <div>
                <h2 className="text-title fw-bold text-foreground">
                  Booking History
                </h2>
                <p className="text-body-sm text-muted-foreground mt-1">
                  View all your travel bookings
                </p>
              </div>
            </div>

            {bookingsError && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {bookingsError}
              </div>
            )}

            {bookingsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-body-lg fw-semibold text-foreground">
                  No Bookings Found
                </h3>
                <p className="text-muted-foreground mt-2">
                  Your booking history will appear here after you book a package.
                </p>
                <Link
                  to="/search"
                  className="inline-flex items-center mt-6 h-10 px-6 rounded-full bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 transition"
                >
                  Browse Packages
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-card rounded-2xl border border-border p-4 sm:p-5 hover:border-primary/30 hover:[box-shadow:var(--shadow-card)] transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="fw-bold text-body-lg text-foreground break-words">
                          {booking.package_name ? toPlainText(booking.package_name) : `Package #${booking.package_id}`}
                        </h3>

                        <div className="flex flex-wrap gap-4 mt-2 text-body-sm text-muted-foreground">
                          <span>
                            Booking ID:
                            <span className="fw-medium text-foreground ml-1">
                              #{booking.id}
                            </span>
                          </span>

                          <span>
                            Travel Date:
                            <span className="fw-medium text-foreground ml-1">
                              {formatTravelDate(booking.travel_date)}
                            </span>
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {booking.guests} guest{booking.guests === 1 ? "" : "s"}
                          </span>
                        </div>

                        {booking.agent_company && (
                          <p className="text-caption text-muted-foreground mt-2">
                            Agent: {booking.agent_company}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-row flex-wrap items-center justify-between md:flex-col md:items-end gap-2">
                        <span className="text-body-lg fw-bold text-brand">
                          {booking.amount != null ? formatINR(booking.amount) : "Quote on request"}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-caption fw-semibold capitalize ${bookingStatusStyle[booking.status] || bookingStatusStyle.pending
 }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                      <Link
                        to={packagePath({ id: booking.package_id, slug: booking.package_slug })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full sm:w-auto justify-center items-center h-9 px-4 rounded-full bg-primary text-primary-foreground text-body-sm fw-medium hover:opacity-90 transition"
                      >
                        View Package
                      </Link>
                      <Link
                        to={`/booking/${encryptId(booking.id)}/invoice`}
                        className="inline-flex w-full sm:w-auto justify-center items-center gap-2 h-9 px-4 rounded-full border border-border text-body-sm fw-medium text-foreground hover:bg-muted transition"
                      >
                        <FileText className="h-4 w-4" />
                        Invoice
                      </Link>
                      {booking.status === "confirmed" && (
                        <a
                          href={`https://wa.me/91${booking.agent_mobile}?text=${encodeURIComponent(
                            [
                              `Hello ${booking.agent_company},`,
                              "Your booking has been confirmed.",
                              `Invoice: ${window.location.origin}/booking/${encryptId(booking.id)}/invoice`,
                              "Thank you."
                            ].join("\n")
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full sm:w-auto justify-center items-center gap-2 h-9 px-4 rounded-full bg-green-600 text-white text-body-sm fw-medium hover:bg-green-700 transition"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp Invoice
                        </a>
                      )}
                    </div>

                    {hasPendingBalance(booking) && (
                      <BookingBalancePanel booking={booking} onPaid={handleBalancePaid} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-pressed={active}
      className={`min-w-0 w-full md:w-auto justify-center px-3 sm:px-5 h-9 text-body-sm fw-medium rounded-xl sm:rounded-full transition flex items-center gap-1.5 sm:gap-2 ${active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  isFocused,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block group">
      <span className="text-body-sm fw-medium text-foreground block mb-1.5">
        {label}
      </span>
      <div
        className={`flex items-center gap-3 px-3.5 h-11 rounded-xl border bg-card transition ${isFocused
          ? "border-primary ring-4 ring-primary/10"
          : "border-input hover:border-primary/40"
          }`}
      >
        <span
          className={`transition-colors duration-300 ${isFocused ? "text-primary" : "text-muted-foreground"
            }`}
        >
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-body-sm text-foreground placeholder:text-muted-foreground/70"
        />
      </div>
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  isFocused,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block group">
      <span className="text-body-sm fw-medium text-foreground block mb-1.5">
        {label}
      </span>
      <div
        className={`flex items-center gap-3 px-3.5 h-11 rounded-xl border bg-card transition ${isFocused
          ? "border-primary ring-4 ring-primary/10"
          : "border-input hover:border-primary/40"
          }`}
      >
        <Lock
          className={`w-4 h-4 transition-colors duration-300 ${isFocused ? "text-primary" : "text-muted-foreground"
            }`}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="••••••••"
          className="flex-1 bg-transparent outline-none text-body-sm text-foreground placeholder:text-muted-foreground/70"
        />
        <button
          type="button"
          onClick={onToggle}
          className={`transition-colors duration-300 cursor-pointer ${isFocused ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </label>
  );
}