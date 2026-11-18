import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, User } from "lucide-react";
import { GET, PUT } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { useAuth } from "@/hooks/useAuth";
import { profileUrl } from "@/lib/utils";
import type { UserInterface } from "@/lib/interface";

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:border-blue-500";
const readOnlyClass =
  "w-full rounded-lg border border-slate-200 bg-slate-100 text-slate-600 px-3 py-2.5 text-body-sm cursor-not-allowed";

const getErrorMessage = (err: unknown, fallback: string) =>
  err && typeof err === "object" && "message" in err
    ? String((err as { message: string }).message)
    : fallback;

/** Account settings (photo, name, email) for users without an agent profile, e.g. admins. */
export function AccountSettingsForm() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const applyUser = (data: UserInterface) => {
    setFullName(data.name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setProfilePhoto(data.profile || "");
    setProfileFile(null);
    setPhotoPreview("");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        applyUser(await GET<UserInterface>(API.AUTH.MY_PROFILE));
      } catch (err: unknown) {
        if (user) applyUser(user);
        setError(getErrorMessage(err, "Failed to load profile"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
    // Load once on mount; saving refreshes the form from the response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (file: File | undefined) => {
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setProfileFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSavedMsg("");

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone);
      if (profileFile) formData.append("profile", profileFile);

      const updated = await PUT<UserInterface>(API.AUTH.UPDATE_PROFILE, formData);
      updateUser(updated);
      applyUser(updated);
      setSavedMsg("Profile updated successfully.");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const avatarSrc = photoPreview || (profilePhoto ? profileUrl(profilePhoto) : "");

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 space-y-8"
    >
      <FormSection title="Profile Photo">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Profile"
              className="size-24 shrink-0 rounded-full object-cover border-2 border-neutral-200"
            />
          ) : (
            <div className="size-24 shrink-0 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center">
              <User className="text-neutral-400" size={32} />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-body-sm fw-medium text-neutral-700 mb-2">Profile photo</p>
            <p className="text-caption text-neutral-500 mb-3">JPG or PNG, recommended 400×400 px</p>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center gap-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 fw-medium px-4 py-2 rounded-lg text-body-sm cursor-pointer"
            >
              <Upload size={16} /> Change photo
            </button>
            <input
              ref={photoInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e.target.files?.[0])}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Personal Details">
        <FormField label="Full Name">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Full name"
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Phone Number">
            <input type="tel" readOnly value={phone} className={readOnlyClass} />
          </FormField>
          <FormField label="Email ID">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="admin@example.com"
            />
          </FormField>
        </div>
      </FormSection>

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

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSaving}
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
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-body fw-semibold text-neutral-800 border-b border-neutral-100 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-body-sm fw-medium text-neutral-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
