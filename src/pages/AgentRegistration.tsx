import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Upload, User, X, ArrowLeft, Loader2, Sparkles, } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GET, POST, PUT } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { profileUrl, parseHasCompany } from "@/lib/utils";
import type { AgentInterface, UserInterface } from "@/lib/interface";
import { DocumentTypeUploadField } from "@/components/DocumentTypeUploadField";
import { WordLimitedTextarea } from "@/components/WordLimitedTextarea";
import { AiRefineButton } from "@/components/AiRefineButton";
import { AI_REQUEST_TIMEOUT_MS } from "@/lib/ai";
import { ABOUT_ME_MAX_WORDS, TEXT_INPUT_MAX_WORDS, countWords } from "@/lib/wordLimit";
import { COMPANY_DOCUMENT_TYPES } from "@/lib/documentTypes";
import { ROUTES } from "@/lib/routes";

const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-body-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

const readOnlyClass = `w-full rounded-lg border border-slate-200 bg-slate-100 text-slate-600 px-3 py-2 cursor-not-allowed`;

const DEALS_IN = [
  "Solo",
  "Couple",
  "Honeymoon",
  "Corporate",
  "Groups",
  "Family",
  "Adventure",
  "Luxury",
] as const;

export default function AgentRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, user, updateUser } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDigiLockerLoading, setIsDigiLockerLoading] = useState(false);
  const [existingAgentId, setExistingAgentId] = useState<number | null>(null);
  const [dpPreview, setDpPreview] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyDocumentType, setCompanyDocumentType] = useState("");
  const [companyDocumentFile, setCompanyDocumentFile] = useState<File | null>(null);
  const [existingCompanyDocument, setExistingCompanyDocument] = useState<string | null>(null);
  const [aboutMe, setAboutMe] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dealsIn, setDealsIn] = useState<string[]>([]);
  const [verificationMethod, setVerificationMethod] = useState<
    "digilocker" | "upload" | null
  >(null);
  const [digiLockerVerified, setDigiLockerVerified] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<"aadhaar" | "dl" | null>(
    null
  );
  const [aadharFrontFile, setAadharFrontFile] = useState<File | null>(null);
  const [aadharBackFile, setAadharBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);
  const [dlBackFile, setDlBackFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const dpInputRef = useRef<HTMLInputElement>(null);
  const aadharFrontInputRef = useRef<HTMLInputElement>(null);
  const aadharBackInputRef = useRef<HTMLInputElement>(null);
  const dlFrontInputRef = useRef<HTMLInputElement>(null);
  const dlBackInputRef = useRef<HTMLInputElement>(null);

  const selectUploadDocType = (type: "aadhaar" | "dl") => {
    setUploadDocType(type);
    setError("");
    if (type === "aadhaar") {
      setDlFrontFile(null);
      setDlBackFile(null);
    } else {
      setAadharFrontFile(null);
      setAadharBackFile(null);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await GET<UserInterface>(API.AUTH.MY_PROFILE);
        setFullName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone != null ? String(data.phone) : "");
        setProfilePhoto(data.profile || "");

        try {
          const agent = await GET<AgentInterface>(API.AGENT.GET_MINE);
          setExistingAgentId(agent.id);
          setHasCompany(parseHasCompany(agent.has_company, agent.company_name));
          setCompanyName(agent.company_name || "");
          setCompanyDocumentType(agent.company_document_type || "");
          setExistingCompanyDocument(agent.company_document || null);
          setAboutMe(agent.about || "");
          setLocation(agent.location || "");
          setExperience(String(agent.experience ?? ""));
          if (agent.deals_in?.length) setDealsIn(agent.deals_in);
        } catch {
          /* no agent profile yet */
        }
      } catch {
        if (user) {
          setFullName(user.name || "");
          setEmail(user.email || "");
          setPhone(user.phone != null ? String(user.phone) : "");
          setProfilePhoto(user.profile || "");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isLoggedIn, navigate, user]);

  useEffect(() => {
    const checkDigiLockerStatus = async () => {
      if (searchParams.get("digilocker") === "verified") {
        setDigiLockerVerified(true);
        setVerificationMethod("digilocker");
        setSearchParams({}, { replace: true });
        return;
      }

      try {
        const status = await GET<{ verified: boolean }>(API.DIGILOCKER.STATUS);
        if (status.verified) {
          setDigiLockerVerified(true);
          setVerificationMethod("digilocker");
        }
      } catch {
        /* ignore */
      }
    };

    if (isLoggedIn) {
      checkDigiLockerStatus();
    }
  }, [isLoggedIn, searchParams, setSearchParams]);

  useEffect(() => {
    return () => {
      if (dpPreview) URL.revokeObjectURL(dpPreview);
    };
  }, [dpPreview]);

  const toggleDeal = (deal: string) => {
    setDealsIn((prev) =>
      prev.includes(deal) ? prev.filter((d) => d !== deal) : [...prev, deal]
    );
  };

  const handleDpChange = (file: File | undefined) => {
    if (!file) return;
    if (dpPreview) URL.revokeObjectURL(dpPreview);
    setProfileFile(file);
    setDpPreview(URL.createObjectURL(file));
  };

  const handleDigiLockerVerify = async () => {
    setError("");
    const mobile = String(phone).replace(/\D/g, "");

    if (mobile.length < 10) {
      setError("Please enter a valid phone number before DigiLocker verification.");
      return;
    }

    setIsDigiLockerLoading(true);
    setVerificationMethod("digilocker");
    try {
      const data = await POST<{
        authUrl: string;
        recordId: string;
        state: string;
      }>(API.DIGILOCKER.INITIATE, { mobileNumber: mobile });

      if (!data.authUrl) {
        setError("Could not start DigiLocker verification. Please try again.");
        return;
      }

      window.location.href = data.authUrl;
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "DigiLocker verification failed. Please try again.";
      setError(message);
    } finally {
      setIsDigiLockerLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (dealsIn.length === 0) {
      setError("Please select at least one deal type.");
      return;
    }

    // Longer text is fine: the backend condenses it to ABOUT_ME_MAX_WORDS with AI while saving.
    if (countWords(aboutMe) > TEXT_INPUT_MAX_WORDS) {
      setError(`About Me must be ${TEXT_INPUT_MAX_WORDS} words or fewer.`);
      return;
    }

    const experienceYears = Number(experience);
    if (!experience || Number.isNaN(experienceYears) || experienceYears < 0) {
      setError("Please enter valid years of experience.");
      return;
    }

    if (hasCompany === null) {
      setError("Please indicate whether you have a company.");
      return;
    }

    if (hasCompany) {
      if (!companyName.trim()) {
        setError("Company name is required.");
        return;
      }
      if (companyDocumentFile && !companyDocumentType.trim()) {
        setError("Please select or enter the company document type.");
        return;
      }
      if (companyDocumentType && !companyDocumentFile && !existingCompanyDocument) {
        setError("Please upload the company document.");
        return;
      }
    }

    if (!verificationMethod) {
      setError("Please complete identity verification.");
      return;
    }

    if (verificationMethod === "upload") {
      if (!uploadDocType) {
        setError("Please choose Aadhaar or Driving Licence.");
        return;
      }
      if (uploadDocType === "aadhaar") {
        if (!aadharFrontFile || !aadharBackFile) {
          setError("Please upload Aadhaar front and back photos.");
          return;
        }
      } else if (!dlFrontFile || !dlBackFile) {
        setError("Please upload Driving Licence front and back photos.");
        return;
      }
    }

    if (verificationMethod === "digilocker" && !digiLockerVerified) {
      setError("Please complete DigiLocker verification before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      if (profileFile) formData.append("profile", profileFile);

      await PUT<UserInterface>(API.AUTH.UPDATE_PROFILE, formData);

      const agentFormData = new FormData();
      agentFormData.append("has_company", String(hasCompany));
      if (hasCompany) {
        agentFormData.append("company_name", companyName.trim());
        if (companyDocumentType.trim()) {
          agentFormData.append("company_document_type", companyDocumentType.trim());
        }
        if (companyDocumentFile) {
          agentFormData.append("company_document", companyDocumentFile);
        }
      } else {
        agentFormData.append("company_name", "");
      }
      agentFormData.append("about", aboutMe.trim());
      agentFormData.append("location", location.trim());
      agentFormData.append("experience", String(experienceYears));
      agentFormData.append("deals_in", JSON.stringify(dealsIn));
      agentFormData.append("verification_method", verificationMethod!);
      if (uploadDocType === "aadhaar") {
        if (aadharFrontFile) agentFormData.append("aadhar", aadharFrontFile);
        if (aadharBackFile) agentFormData.append("aadhar_back", aadharBackFile);
      }
      if (uploadDocType === "dl") {
        if (dlFrontFile) agentFormData.append("dl", dlFrontFile);
        if (dlBackFile) agentFormData.append("dl_back", dlBackFile);
      }

      // The backend polishes About Me with AI while saving, so allow extra time.
      const aiSaveConfig = { timeout: AI_REQUEST_TIMEOUT_MS };
      if (existingAgentId) {
        await PUT<AgentInterface>(API.AGENT.UPDATE_MINE, agentFormData, aiSaveConfig);
      } else {
        await POST<AgentInterface>(API.AGENT.CREATE, agentFormData, aiSaveConfig);
      }

      const refreshedUser = await GET<UserInterface>(API.AUTH.MY_PROFILE);
      updateUser(refreshedUser);

      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) return null;

  const avatarSrc =
    dpPreview || (profilePhoto ? profileUrl(profilePhoto) : "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <Link
          to={ROUTES.PARTNER}
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-primary transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Become an Agent
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-caption fw-bold tracking-widest uppercase mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Travel Partner
          </div>
          <h1 className="font-display fw-bold text-foreground">
            Agent Registration
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete your partner profile with personal details, experience, and
            identity verification to publish packages on the platform.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-8 md:p-10 text-center space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-body-lg fw-bold text-foreground">
              Registration Submitted!
            </h2>
            <p className="text-body-sm text-muted-foreground max-w-md mx-auto">
              Thank you for applying to become a travel partner. Our team will
              review your profile and get back to you within 2–3 business days.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground fw-semibold text-body-sm hover:opacity-90 transition cursor-pointer"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 md:p-8 space-y-8"
          >
            {error && (
              <div className="text-body-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Section title="Profile Photo">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative shrink-0">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={fullName || "Profile"}
                      className="size-24 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="size-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                      <User className="text-muted-foreground" size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-body-sm fw-medium text-foreground mb-1">
                    {profilePhoto || dpPreview ? "Profile photo" : "Upload profile photo"}
                  </p>
                  <p className="text-caption text-muted-foreground mb-3">
                    JPG or PNG, recommended 400×400 px
                  </p>
                  <button
                    type="button"
                    onClick={() => dpInputRef.current?.click()}
                    className="inline-flex items-center gap-2 border border-border hover:bg-muted text-foreground fw-medium px-4 py-2 rounded-xl text-body-sm cursor-pointer transition"
                  >
                    <Upload size={16} /> {profilePhoto || dpPreview ? "Change photo" : "Choose photo"}
                  </button>
                  <input
                    ref={dpInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleDpChange(e.target.files?.[0])}
                  />
                </div>
              </div>
            </Section>

            <Section title="Personal Details">
              <Field label="Full Name *">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="John Doe"
                />
              </Field>

              <Field label="Do you have a company? *">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setHasCompany(true)}
                    className={`px-4 py-2.5 rounded-xl text-body-sm fw-medium border transition cursor-pointer ${hasCompany === true
 ? "bg-primary/10 border-primary text-primary"
 : "border-border text-muted-foreground hover:border-primary/40"
 }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHasCompany(false);
                      setCompanyName("");
                      setCompanyDocumentType("");
                      setCompanyDocumentFile(null);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-body-sm fw-medium border transition cursor-pointer ${hasCompany === false
 ? "bg-primary/10 border-primary text-primary"
 : "border-border text-muted-foreground hover:border-primary/40"
 }`}
                  >
                    No
                  </button>
                </div>
              </Field>

              {hasCompany === true && (
                <>
                  <Field label="Company Name *">
                    <input
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={inputClass}
                      placeholder="Wanderlust Tours Pvt. Ltd."
                    />
                  </Field>

                  <DocumentTypeUploadField
                    typeLabel="Company Document Type"
                    uploadLabel="Upload Company Document"
                    options={COMPANY_DOCUMENT_TYPES}
                    documentType={companyDocumentType}
                    onDocumentTypeChange={setCompanyDocumentType}
                    file={companyDocumentFile}
                    onFileChange={setCompanyDocumentFile}
                    existingDocument={existingCompanyDocument}
                    selectClassName={inputClass}
                  />
                </>
              )}

              <Field label="About Me *">
                <WordLimitedTextarea
                  required
                  rows={4}
                  maxWords={ABOUT_ME_MAX_WORDS}
                  inputMaxWords={TEXT_INPUT_MAX_WORDS}
                  overLimitHint={`Gemini will shorten it to ${ABOUT_ME_MAX_WORDS} words on save`}
                  value={aboutMe}
                  onChange={setAboutMe}
                  action={
                    <AiRefineButton text={aboutMe} field="about_me" onRefined={setAboutMe} />
                  }
                  className={inputClass}
                  placeholder="Tell guests about yourself, your travel expertise, and what makes your packages unique..."
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Location *">
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass}
                    placeholder="City, State, Country"
                  />
                </Field>
                <Field label="Experience (years) *">
                  <input
                    required
                    type="number"
                    min={0}
                    step={0.5}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 5"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Phone Number *">
                  <input
                    required
                    readOnly
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={readOnlyClass}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="Email ID *">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="partner@example.com"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Deals In *">
              <p className="text-body-sm text-muted-foreground -mt-2">
                Select the types of travel experiences you specialize in.
              </p>
              <div className="flex flex-wrap gap-2">
                {DEALS_IN.map((deal) => (
                  <button
                    key={deal}
                    type="button"
                    onClick={() => toggleDeal(deal)}
                    className={`px-3.5 py-2 rounded-xl text-body-sm fw-medium border transition cursor-pointer ${dealsIn.includes(deal)
 ? "bg-primary/10 border-primary text-primary"
 : "border-border text-muted-foreground hover:border-primary/40"
 }`}
                  >
                    {deal}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Personal Identity Verification *">
              <p className="text-body-sm text-muted-foreground -mt-2">
                Verify your own identity as the person managing this account. This is
                separate from any company documents above. Choose one option.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleDigiLockerVerify}
                  disabled={isDigiLockerLoading || digiLockerVerified}
                  className={`flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition cursor-pointer disabled:opacity-60 ${verificationMethod === "digilocker"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={20}
                      className={
                        digiLockerVerified ? "text-green-600" : "text-primary"
                      }
                    />
                    <span className="fw-semibold text-body-sm text-foreground">
                      Instant verification with DigiLocker
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Securely share your Aadhaar through DigiLocker using the mobile
                    number linked to it. No file upload needed.
                  </p>
                  {isDigiLockerLoading && (
                    <span className="inline-flex items-center gap-1 text-caption fw-medium text-primary">
                      <Loader2 size={14} className="animate-spin" /> Redirecting to DigiLocker...
                    </span>
                  )}
                  {digiLockerVerified && !isDigiLockerLoading && (
                    <span className="inline-flex items-center gap-1 text-caption fw-medium text-green-700">
                      <CheckCircle2 size={14} /> Verified via DigiLocker
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("upload");
                    setDigiLockerVerified(false);
                    setUploadDocType(null);
                    setAadharFrontFile(null);
                    setAadharBackFile(null);
                    setDlFrontFile(null);
                    setDlBackFile(null);
                  }}
                  className={`flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition cursor-pointer ${verificationMethod === "upload"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Upload size={20} className="text-primary" />
                    <span className="fw-semibold text-body-sm text-foreground">
                      Upload a government ID
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Upload the front and back of your Aadhaar card or Driving
                    Licence. Our team will review it before verifying your profile.
                  </p>
                </button>
              </div>

              {verificationMethod === "upload" && (
                <div className="space-y-5 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => selectUploadDocType("aadhaar")}
                      className={`px-4 py-3 rounded-xl border text-body-sm fw-semibold text-left transition cursor-pointer ${uploadDocType === "aadhaar"
 ? "border-primary bg-primary/5 text-primary"
 : "border-border text-foreground hover:border-primary/40"
 }`}
                    >
                      Aadhaar
                      <span className="block text-caption fw-regular text-muted-foreground mt-1">
                        Front and back photos required
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectUploadDocType("dl")}
                      className={`px-4 py-3 rounded-xl border text-body-sm fw-semibold text-left transition cursor-pointer ${uploadDocType === "dl"
 ? "border-primary bg-primary/5 text-primary"
 : "border-border text-foreground hover:border-primary/40"
 }`}
                    >
                      Driving Licence
                      <span className="block text-caption fw-regular text-muted-foreground mt-1">
                        Front and back photos required
                      </span>
                    </button>
                  </div>

                  {uploadDocType === "aadhaar" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <DocumentUpload
                        label="Aadhaar Front *"
                        file={aadharFrontFile}
                        inputRef={aadharFrontInputRef}
                        onSelect={(file) => setAadharFrontFile(file)}
                        onClear={() => setAadharFrontFile(null)}
                      />
                      <DocumentUpload
                        label="Aadhaar Back *"
                        file={aadharBackFile}
                        inputRef={aadharBackInputRef}
                        onSelect={(file) => setAadharBackFile(file)}
                        onClear={() => setAadharBackFile(null)}
                      />
                    </div>
                  )}

                  {uploadDocType === "dl" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <DocumentUpload
                        label="Driving Licence Front *"
                        file={dlFrontFile}
                        inputRef={dlFrontInputRef}
                        onSelect={(file) => setDlFrontFile(file)}
                        onClear={() => setDlFrontFile(null)}
                      />
                      <DocumentUpload
                        label="Driving Licence Back *"
                        file={dlBackFile}
                        inputRef={dlBackInputRef}
                        onSelect={(file) => setDlBackFile(file)}
                        onClear={() => setDlBackFile(null)}
                      />
                    </div>
                  )}
                </div>
              )}
            </Section>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground fw-semibold px-6 py-3 rounded-xl text-body-sm cursor-pointer transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  existingAgentId ? "Update Registration" : "Submit Registration"
                )}
              </button>
              <Link
                to={ROUTES.PARTNER}
                className="inline-flex items-center justify-center border border-border hover:bg-muted text-foreground fw-semibold px-6 py-3 rounded-xl text-body-sm cursor-pointer transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-body fw-semibold text-foreground border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-body-sm fw-medium text-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function DocumentUpload({
  label,
  file,
  inputRef,
  onSelect,
  onClear,
}: {
  label: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <p className="text-body-sm fw-medium text-foreground">{label}</p>
      {file ? (
        <div className="flex items-center justify-between gap-2 bg-muted border border-border rounded-lg px-3 py-2 text-body-sm">
          <span className="truncate text-foreground">{file.name}</span>
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-red-500 shrink-0 cursor-pointer"
            aria-label={`Remove ${label}`}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-primary transition cursor-pointer"
        >
          <Upload className="text-muted-foreground mb-2" size={20} />
          <span className="text-caption text-muted-foreground">PDF, JPG or PNG</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onSelect(selected);
        }}
      />
    </div>
  );
}
