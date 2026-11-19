import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, ShieldCheck, Upload, User, X, Loader2 } from "lucide-react";
import { GET, PUT } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { uploadOptionalFile } from "@/lib/upload";
import { useAuth } from "@/hooks/useAuth";
import { profileUrl, parseHasCompany } from "@/lib/utils";
import type { AgentInterface, BankInterface, UserInterface } from "@/lib/interface";
import { DocumentTypeUploadField } from "@/components/DocumentTypeUploadField";
import { AccountSettingsForm } from "./AccountSettingsForm";
import { WordLimitedTextarea } from "@/components/WordLimitedTextarea";
import { AiRefineButton } from "@/components/AiRefineButton";
import { AI_REQUEST_TIMEOUT_MS } from "@/lib/ai";
import { ABOUT_ME_MAX_WORDS, TEXT_INPUT_MAX_WORDS, countWords } from "@/lib/wordLimit";
import { BANK_DOCUMENT_TYPES, COMPANY_DOCUMENT_TYPES } from "@/lib/documentTypes";
import {
  fetchIfscDetails,
  isValidIfscFormat,
  type IfscDetails,
} from "@/lib/ifsc";

type IfscLookupStatus = "idle" | "loading" | "found" | "not_found" | "error";

const readOnlyClass = `
w-full rounded-lg border border-slate-200
bg-slate-100 text-slate-600
px-3 py-2 cursor-not-allowed
`;
const inputClass =  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:border-blue-500";

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

export default function AdminSettings() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminAccountSettings />;
  return <AgentSettings />;
}

function AdminAccountSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="fw-bold">Settings</h2>
        <p className="text-body-sm text-neutral-500">View and update your account details.</p>
      </div>
      <AccountSettingsForm />
    </div>
  );
}

function AgentSettings() {

  const [activeTab, setActiveTab] = useState<"profile" | "bank">("profile");


  return (
    <div className="space-y-6 max-w-3xl">

      <div>
        <h2 className="fw-bold">Settings</h2>
        <p className="text-body-sm text-neutral-500">
          View and update your travel partner profile.
        </p>
      </div>
      <div className="flex gap-2 border-b border-neutral-200 mb-6">
        {[
          { id: "profile", label: "Profile" },
          { id: "bank", label: "Bank Details" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 text-body-sm fw-semibold border-b-2 transition ${activeTab === tab.id
 ? "border-blue-600 text-blue-600"
 : "border-transparent text-neutral-500 hover:text-black"
 }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "profile" && (
        <ProfileForm />
      )}

      {activeTab === "bank" && (
        <BankDetailsForm />
      )}



    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-body fw-semibold text-neutral-800 border-b border-neutral-100 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-body-sm fw-medium text-neutral-700 mb-1.5">
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
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <p className="text-body-sm fw-medium text-neutral-700">{label}</p>
      {file ? (
        <div className="flex items-center justify-between gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-body-sm">
          <span className="truncate text-neutral-700">{file.name}</span>
          <button
            type="button"
            onClick={onClear}
            className="text-neutral-400 hover:text-red-500 shrink-0 cursor-pointer"
            aria-label={`Remove ${label}`}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer"
        >
          <Upload className="text-neutral-400 mb-2" size={20} />
          <span className="text-caption text-neutral-500">PDF, JPG or PNG</span>
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


function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
  const [dpPreview, setDpPreview] = useState<string | null>(null);
  const [dealsIn, setDealsIn] = useState<string[]>([]);
  const [verificationMethod, setVerificationMethod] = useState<
    "digilocker" | "upload" | null
  >(null);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [aadharDocument, setAadharDocument] = useState("");
  const [aadharDocumentBack, setAadharDocumentBack] = useState("");
  const [dlDocument, setDlDocument] = useState("");
  const [dlDocumentBack, setDlDocumentBack] = useState("");
  const [uploadDocType, setUploadDocType] = useState<"aadhaar" | "dl" | null>(
    null
  );
  const [aadharFrontFile, setAadharFrontFile] = useState<File | null>(null);
  const [aadharBackFile, setAadharBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);
  const [dlBackFile, setDlBackFile] = useState<File | null>(null);

  const dpInputRef = useRef<HTMLInputElement>(null);
  const aadharFrontInputRef = useRef<HTMLInputElement>(null);
  const aadharBackInputRef = useRef<HTMLInputElement>(null);
  const dlFrontInputRef = useRef<HTMLInputElement>(null);
  const dlBackInputRef = useRef<HTMLInputElement>(null);

  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [hasAgentProfile, setHasAgentProfile] = useState(false);

  const applyAgent = (agent: AgentInterface) => {
    setHasCompany(parseHasCompany(agent.has_company, agent.company_name));
    setCompanyName(agent.company_name || "");
    setCompanyDocumentType(agent.company_document_type || "");
    setCompanyDocumentFile(null);
    setExistingCompanyDocument(agent.company_document || null);
    setAboutMe(agent.about || "");
    setLocation(agent.location || "");
    setExperience(String(agent.experience ?? ""));
    setDealsIn(agent.deals_in || []);
    setVerificationMethod(agent.verification_method || null);
    setVerificationStatus(agent.verification_status || "pending");
    setAadharDocument(agent.aadhar_document || "");
    setAadharDocumentBack(agent.aadhar_document_back || "");
    setDlDocument(agent.dl_document || "");
    setDlDocumentBack(agent.dl_document_back || "");
    setHasAgentProfile(true);
  };

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

  const applyUser = (data: UserInterface) => {
    setFullName(data.name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setProfilePhoto(data.profile || "");
    setProfileFile(null);
    setDpPreview("");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await GET<UserInterface>(API.AUTH.MY_PROFILE);
        applyUser(data);

        try {
          const agent = await GET<AgentInterface>(API.AGENT.GET_MINE);
          applyAgent(agent);
        } catch {
          setHasAgentProfile(false);
        }
      } catch (err: unknown) {
        if (user) applyUser(user);
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to load profile";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    // Load once on mount only. Saving calls updateUser(), which changes `user`; re-fetching then
    // would race the agent update and put the old About Me (and other fields) back in the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSavedMsg("");

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

    if (!hasAgentProfile) {
      setError("No agent profile found. Complete registration first.");
      return;
    }

    const aadharComplete = !!aadharFrontFile && !!aadharBackFile;
    const dlComplete = !!dlFrontFile && !!dlBackFile;
    const hasAnyDocUpload =
      !!aadharFrontFile || !!aadharBackFile || !!dlFrontFile || !!dlBackFile;

    if (hasAnyDocUpload || uploadDocType) {
      if (!uploadDocType) {
        setError("Please choose Aadhaar or Driving Licence.");
        return;
      }
      if (uploadDocType === "aadhaar" && !aadharComplete) {
        setError("Please upload Aadhaar front and back photos.");
        return;
      }
      if (uploadDocType === "dl" && !dlComplete) {
        setError("Please upload Driving Licence front and back photos.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      const profilePath = await uploadOptionalFile(profileFile, "profile");
      if (profilePath) formData.append("profile", profilePath);

      const updated = await PUT<UserInterface>(API.AUTH.UPDATE_PROFILE, formData);
      updateUser(updated);
      applyUser(updated);

      const agentFormData = new FormData();
      agentFormData.append("has_company", String(hasCompany));
      if (hasCompany) {
        agentFormData.append("company_name", companyName.trim());
        if (companyDocumentType.trim()) {
          agentFormData.append("company_document_type", companyDocumentType.trim());
        }
        const companyDocumentPath = await uploadOptionalFile(companyDocumentFile, "agent-document");
        if (companyDocumentPath) {
          agentFormData.append("company_document", companyDocumentPath);
        }
      } else {
        agentFormData.append("company_name", "");
      }
      agentFormData.append("about", aboutMe.trim());
      agentFormData.append("location", location.trim());
      agentFormData.append("experience", String(experienceYears));
      agentFormData.append("deals_in", JSON.stringify(dealsIn));
      // ID documents go straight to S3; the form carries their paths.
      const idDocumentFiles: Record<string, File | null> =
        uploadDocType === "aadhaar"
          ? { aadhar: aadharFrontFile, aadhar_back: aadharBackFile }
          : uploadDocType === "dl"
            ? { dl: dlFrontFile, dl_back: dlBackFile }
            : {};
      for (const [field, file] of Object.entries(idDocumentFiles)) {
        const documentPath = await uploadOptionalFile(file, "agent-document");
        if (documentPath) agentFormData.append(field, documentPath);
      }
      if (
        (uploadDocType === "aadhaar" && aadharComplete) ||
        (uploadDocType === "dl" && dlComplete)
      ) {
        agentFormData.append("verification_method", "upload");
      }

      // The backend polishes About Me with AI while saving, so allow extra time.
      const updatedAgent = await PUT<AgentInterface>(API.AGENT.UPDATE_MINE, agentFormData, {
        timeout: AI_REQUEST_TIMEOUT_MS,
      });
      applyAgent(updatedAgent);
      setUploadDocType(null);
      setAadharFrontFile(null);
      setAadharBackFile(null);
      setDlFrontFile(null);
      setDlBackFile(null);

      setSavedMsg("Profile updated successfully.");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update profile";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSrc = dpPreview || (profilePhoto ? profileUrl(profilePhoto) : "");


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 space-y-8"
      >
        <Section title="Profile Photo">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="size-24 rounded-full object-cover border-2 border-neutral-200"
                />
              ) : (
                <div className="size-24 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center">
                  <User className="text-neutral-400" size={32} />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-body-sm fw-medium text-neutral-700 mb-2">
                Profile photo
              </p>
              <p className="text-caption text-neutral-500 mb-3">
                JPG or PNG, recommended 400×400 px
              </p>
              <button
                type="button"
                onClick={() => dpInputRef.current?.click()}
                className="inline-flex items-center gap-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 fw-medium px-4 py-2 rounded-lg text-body-sm cursor-pointer"
              >
                <Upload size={16} /> Change photo
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
          <Field label="Full Name">
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder="Full name"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Phone Number">
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
            <Field label="Email ID">
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

          <hr />

          <Section title="Professional Details">
            <Field label="Do you have a company?">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setHasCompany(true)}
                  disabled={!hasAgentProfile}
                  className={`px-4 py-2.5 rounded-lg text-body-sm fw-medium border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${hasCompany === true
 ? "bg-blue-50 border-blue-500 text-blue-700"
 : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
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
                  disabled={!hasAgentProfile}
                  className={`px-4 py-2.5 rounded-lg text-body-sm fw-medium border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${hasCompany === false
 ? "bg-blue-50 border-blue-500 text-blue-700"
 : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
 }`}
                >
                  No
                </button>
              </div>
            </Field>

            {hasCompany === true && (
              <>
                <Field label="Company Name">
                  <input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={inputClass}
                    placeholder="Wanderlust Tours Pvt. Ltd."
                    disabled={!hasAgentProfile}
                  />
                </Field>

                {hasAgentProfile && (
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
                )}
              </>
            )}

            <Field label="About Me">
              <WordLimitedTextarea
                required
                rows={4}
                maxWords={ABOUT_ME_MAX_WORDS}
                inputMaxWords={TEXT_INPUT_MAX_WORDS}
                overLimitHint={`Gemini will shorten it to ${ABOUT_ME_MAX_WORDS} words on save`}
                value={aboutMe}
                onChange={setAboutMe}
                action={
                  <AiRefineButton
                    text={aboutMe}
                    field="about_me"
                    onRefined={setAboutMe}
                    disabled={!hasAgentProfile}
                  />
                }
                className={inputClass}
                placeholder="Tell guests about yourself, your travel expertise, and what makes your packages unique..."
                disabled={!hasAgentProfile}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Location">
                <input
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                  placeholder="City, State, Country"
                  disabled={!hasAgentProfile}
                />
              </Field>
              <Field label="Experience (years)">
                <input
                  required
                  type="number"
                  min={0}
                  step={0.5}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 5"
                  disabled={!hasAgentProfile}
                />
              </Field>
            </div>

          </Section>

          <Section title="Deals In">
            <p className="text-body-sm text-neutral-500 -mt-2">
              Select the types of travel experiences you specialize in.
            </p>
            <div className="flex flex-wrap gap-2">
              {DEALS_IN.map((deal) => (
                <button
                  key={deal}
                  type="button"
                  onClick={() => toggleDeal(deal)}
                  disabled={!hasAgentProfile}
                  className={`px-3.5 py-2 rounded-lg text-body-sm fw-medium border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${dealsIn.includes(deal)
 ? "bg-blue-50 border-blue-500 text-blue-700"
 : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
 }`}
                >
                  {deal}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Personal Identity Verification">
            {verificationStatus === "verified" &&
              verificationMethod === "digilocker" ? (
              <div className="flex items-center gap-2 text-body-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircle2 size={18} />
                Verified via DigiLocker
              </div>
            ) : verificationMethod === "upload" ? (
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-2 text-body-sm rounded-lg px-4 py-3 border ${verificationStatus === "verified"
 ? "text-green-700 bg-green-50 border-green-200"
 : verificationStatus === "rejected"
 ? "text-red-700 bg-red-50 border-red-200"
 : "text-blue-700 bg-blue-50 border-blue-200"
 }`}
                >
                  <CheckCircle2 size={18} />

                  {verificationStatus === "verified"
                    ? "Documents verified"
                    : verificationStatus === "rejected"
                      ? "Documents were rejected. Please upload corrected documents below."
                      : "Documents submitted — pending review. You can upload replacements below."}
                </div>

                {(aadharDocument ||
                  aadharDocumentBack ||
                  dlDocument ||
                  dlDocumentBack) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm">
                      {aadharDocument && (
                        <a
                          href={profileUrl(aadharDocument)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Aadhaar front
                        </a>
                      )}
                      {aadharDocumentBack && (
                        <a
                          href={profileUrl(aadharDocumentBack)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Aadhaar back
                        </a>
                      )}
                      {dlDocument && (
                        <a
                          href={profileUrl(dlDocument)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Driving Licence front
                        </a>
                      )}
                      {dlDocumentBack && (
                        <a
                          href={profileUrl(dlDocumentBack)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Driving Licence back
                        </a>
                      )}
                    </div>
                  )}

                <p className="text-caption text-neutral-500">
                  To replace documents, choose Aadhaar or Driving Licence, then
                  upload front and back photos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => selectUploadDocType("aadhaar")}
                    className={`px-4 py-3 rounded-lg border text-body-sm fw-semibold text-left transition cursor-pointer ${uploadDocType === "aadhaar"
 ? "border-blue-500 bg-blue-50 text-blue-700"
 : "border-neutral-200 text-neutral-800 hover:border-blue-300"
 }`}
                  >
                    Aadhaar
                    <span className="block text-caption fw-regular text-neutral-500 mt-1">
                      Front and back photos required
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectUploadDocType("dl")}
                    className={`px-4 py-3 rounded-lg border text-body-sm fw-semibold text-left transition cursor-pointer ${uploadDocType === "dl"
 ? "border-blue-500 bg-blue-50 text-blue-700"
 : "border-neutral-200 text-neutral-800 hover:border-blue-300"
 }`}
                  >
                    Driving Licence
                    <span className="block text-caption fw-regular text-neutral-500 mt-1">
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
            ) : verificationStatus === "rejected" ? (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
                <ShieldCheck size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-sm fw-medium text-neutral-800">
                    Verification rejected
                  </p>
                  <p className="text-caption text-neutral-500 mt-1">
                    Please re-submit documents at{" "}
                    <a href="/agent-registration" className="text-blue-600 hover:underline">
                      /agent-registration
                    </a>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
                <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-sm fw-medium text-neutral-800">
                    Verification pending
                  </p>
                  <p className="text-caption text-neutral-500 mt-1">
                    Complete agent registration at{" "}
                    <a href="/agent-registration" className="text-blue-600 hover:underline">
                      /agent-registration
                    </a>{" "}
                    if you haven&apos;t submitted documents yet.
                  </p>
                </div>
              </div>
            )}
          </Section>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || !hasAgentProfile || dealsIn.length === 0 || hasCompany === null}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white fw-semibold px-6 py-2.5 rounded-lg text-body-sm cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </Section>
      </form>
      {savedMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-body-sm">
          {savedMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      {!hasAgentProfile && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-body-sm">
          No agent profile found.{" "}
          <a href="/agent-registration" className="text-blue-600 hover:underline fw-medium">
            Complete agent registration
          </a>{" "}
          to publish packages on the platform.
        </div>
      )}

    </>
  );
}

function BankDetailsForm() {
  const [accountHolder, setAccountHolder] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  const [bankDocumentType, setBankDocumentType] = useState("");
  const [bankDocumentFile, setBankDocumentFile] = useState<File | null>(null);
  const [existingBankDocument, setExistingBankDocument] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [ifscStatus, setIfscStatus] = useState<IfscLookupStatus>("idle");
  const [ifscDetails, setIfscDetails] = useState<IfscDetails | null>(null);
  const handleIfscChange = (value: string) => {
    setIfsc(value.toUpperCase().replace(/\s/g, "").slice(0, 11));
    // The previous lookup no longer matches the edited code.
    setIfscStatus("idle");
    setIfscDetails(null);
  };

  const handleFetchIfsc = async () => {
    if (!isValidIfscFormat(ifsc)) {
      setIfscStatus("not_found");
      return;
    }

    setIfscStatus("loading");
    setIfscDetails(null);
    try {
      const details = await fetchIfscDetails(ifsc);
      console.log("[IFSC lookup] Razorpay response:", details);

      if (!details) {
        setIfscStatus("not_found");
        return;
      }
      setIfscDetails(details);
      setBankName(details.BANK);
      setBankAddress(details.ADDRESS);
      setIfscStatus("found");
    } catch (err) {
      console.error("[IFSC lookup] failed:", err);
      setIfscStatus("error");
    }
  };

  const updateBankDetails = async () => {
    setError("");
    setSavedMsg("");

    if (ifsc && !isValidIfscFormat(ifsc)) {
      setError("Please enter a valid 11 character IFSC code (e.g. HDFC0001234).");
      return;
    }
    if (ifscStatus === "not_found") {
      setError("The IFSC code entered was not found. Please check and try again.");
      return;
    }

    if (bankDocumentType && !bankDocumentFile && !existingBankDocument) {
      setError("Please upload the bank document.");
      return;
    }
    if (bankDocumentFile && !bankDocumentType) {
      setError("Please select the bank document type.");
      return;
    }

    try {
      setIsSaving(true);

      const formData = new FormData();

      formData.append("account_holder", accountHolder);
      formData.append("account_name", accountName);
      formData.append("bank_name", bankName);
      formData.append("ifsc", ifsc);
      formData.append("bank_address", bankAddress);

      if (bankDocumentType) {
        formData.append("bank_document_type", bankDocumentType);
      }
      const bankDocumentPath = await uploadOptionalFile(bankDocumentFile, "bank-document");
      if (bankDocumentPath) {
        formData.append("bank_document", bankDocumentPath);
      }

      const res = await PUT<{ data?: BankInterface }>(API.BANK.UPDATE_BANK_DETAILS, formData);
      setBankDocumentFile(null);
      if (res?.data?.bank_document) setExistingBankDocument(res.data.bank_document);

      setSavedMsg("Bank details updated successfully.");
      setTimeout(() => setSavedMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Unable to update bank details."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fetchBankDetails = useCallback(async () => {
    try {
      const res = await GET<{ data?: BankInterface }>(API.BANK.GET_MY_DETAILS);
      const bank = res?.data;
      if (!bank) return;

      setAccountHolder(bank.account_holder || "");
      setAccountName(bank.account_name || "");
      setBankName(bank.bank_name || "");
      setIfsc(bank.ifsc || "");
      setBankAddress(bank.bank_address || "");
      setBankDocumentType(bank.bank_document_type || "");
      setExistingBankDocument(bank.bank_document || null);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchBankDetails();
    setIsLoading(false);
  }, [fetchBankDetails]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white border border-neutral-200 rounded-2xl shadow-xs">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 shadow-xs rounded-2xl p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-body-lg fw-bold text-neutral-900 tracking-tight">
          Payout & Banking Information
        </h2>
        <p className="text-body-sm text-neutral-500 mt-0.5">
          Provide your verified financial accounts for seamless payouts and earnings transfers.
        </p>
      </div>

      <hr className="border-neutral-100" />

      {savedMsg && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-body-sm fw-medium animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-body-sm fw-medium animate-fadeIn">
          <X className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Account Holder Name">
          <input
            className={inputClass}
            value={accountHolder}
            placeholder="Full name (as per bank account)"
            onChange={(e) => setAccountHolder(e.target.value)}
          />
        </Field>

        <Field label="Account Number">
          <input
            className={inputClass}
            value={accountName}
            placeholder="e.g. 0000123456789"
            onChange={(e) => setAccountName(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Bank Name">
          <input
            className={inputClass}
            value={bankName}
            placeholder="e.g. HDFC Bank"
            onChange={(e) => setBankName(e.target.value)}
          />
        </Field>

        <Field label="IFSC Code">
          <div className="relative">
            <input
              className={`${inputClass} pr-20`}
              value={ifsc}
              maxLength={11}
              placeholder="e.g. HDFC0001234"
              onChange={(e) => handleIfscChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleFetchIfsc();
                }
              }}
            />
            <button
              type="button"
              onClick={handleFetchIfsc}
              disabled={ifscStatus === "loading" || ifsc.length !== 11}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex min-w-16 items-center justify-center rounded-md px-3 py-1.5 text-body-sm fw-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all disabled:opacity-50 disabled:hover:bg-blue-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {ifscStatus === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Fetch</span>
              )}
            </button>
          </div>
         
          {ifscStatus === "not_found" && (
            <p className="mt-1.5 text-body-xs text-rose-600">Invalid IFSC code.</p>
          )}
          {ifscStatus === "error" && (
            <p className="mt-1.5 text-body-xs text-rose-600">
              Could not verify IFSC right now. You can enter the bank name manually.
            </p>
          )}
        </Field>
      </div>

      <Field label="Bank Address">
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          maxLength={500}
          value={bankAddress}
          placeholder="Auto-filled when you fetch the IFSC code"
          onChange={(e) => setBankAddress(e.target.value)}
        />
      </Field>

      <div className="pt-2">
        <DocumentTypeUploadField
          typeLabel="Bank Document Type"
          uploadLabel="Upload Bank Document"
          options={BANK_DOCUMENT_TYPES}
          documentType={bankDocumentType}
          onDocumentTypeChange={setBankDocumentType}
          file={bankDocumentFile}
          onFileChange={setBankDocumentFile}
          existingDocument={existingBankDocument}
          selectClassName={inputClass}
        />
      </div>

      <div className="pt-4 flex items-center justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={updateBankDetails}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white fw-semibold px-6 py-2.5 rounded-xl text-body-sm transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Details...</span>
            </>
          ) : (
            <span>Save Bank Details</span>
          )}
        </button>
      </div>
    </div>
  );
}