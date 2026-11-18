import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Headphones,
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { FaqSection } from "@/components/site/FaqSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POST } from "@/lib/request";
import { API } from "@/lib/endpoints";
import gaur from "@/assets/gaur.jpg";
import { contactText } from "@/lib/text";
import { SEO } from "@/components/SEO";
import { seoText } from "@/lib/text";
import { ROUTES } from "@/lib/routes";

const formCopy = contactText.form;
const errorCopy = contactText.errors;

const SUBJECT_OPTIONS = contactText.form.subjectOptions;

type SubjectOption = (typeof SUBJECT_OPTIONS)[number];

const OFFICE_ADDRESS = contactText.info.address;

const CONTACT_INFO = [
  {
    icon: Mail,
    title: contactText.info.emailTitle,
    value: contactText.info.emailValue,
    href: "mailto:support@mytraveltown.com",
  },
  {
    icon: Phone,
    title: contactText.info.phoneTitle,
    value: contactText.info.phoneValue,
    href: "tel:+919999319545",
  },
  {
    icon: MapPin,
    title: contactText.info.addressTitle,
    value: OFFICE_ADDRESS,
    href: "https://maps.google.com/?q=Gaur+City+Centre,+Greater+Noida+West,+Uttar+Pradesh+201318",
  },
] as const;

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    label: contactText.info.socialLabels.instagram,
    href: "https://instagram.com/mytraveltown",
  },
  {
    icon: Linkedin,
    label: contactText.info.socialLabels.linkedin,
    href: "https://linkedin.com/company/mytraveltown",
  },
  {
    icon: Facebook,
    label: contactText.info.socialLabels.facebook,
    href: "https://www.facebook.com/share/1bwDKitkuA/?mibextid=wwXIfr",
  },
] as const;

function buildCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export default function ContactPage() {
  const [captcha, setCaptcha] = useState(buildCaptcha);
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    email: string;
    subject: SubjectOption;
    message: string;
    captchaInput: string;
  }>({
    name: "",
    phone: "",
    email: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
    captchaInput: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const captchaLabel = useMemo(
    () => formCopy.captchaQuestion(captcha.a, captcha.b),
    [captcha.a, captcha.b]
  );

  const resetCaptcha = () => setCaptcha(buildCaptcha());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const handleSubjectChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      subject: value as SubjectOption,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.name.trim() || !form.phone.trim() || !form.subject) {
      setError(errorCopy.requiredFields);
      return;
    }

    if (form.phone.length !== 10) {
      setError(errorCopy.invalidPhone);
      return;
    }

    if (Number(form.captchaInput) !== captcha.answer) {
      setError(errorCopy.wrongCaptcha);
      resetCaptcha();
      setForm((prev) => ({ ...prev, captchaInput: "" }));
      return;
    }

    const messageBody = [
      form.email.trim() ? formCopy.emailPrefix(form.email.trim()) : "",
      form.message.trim() || formCopy.enquiryRegarding(form.subject),
    ]
      .filter(Boolean)
      .join("\n\n");

    if (messageBody.length > 255) {
      setError(errorCopy.messageTooLong);
      return;
    }

    setIsSubmitting(true);
    try {
      await POST(API.CONTACT.CREATE, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        email: form.email,
        message: messageBody,
      });
      setSuccess(true);
      setForm({
        name: "",
        phone: "",
        email: "",
        subject: SUBJECT_OPTIONS[0],
        message: "",
        captchaInput: "",
      });
      resetCaptcha();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : errorCopy.sendFailed;
      setError(message);
      resetCaptcha();
      setForm((prev) => ({ ...prev, captchaInput: "" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SEO
        title={seoText.contact.title}
        description={seoText.contact.description}
        canonical={ROUTES.CONTACT}
        appendSiteName={false}
      />
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-caption fw-bold tracking-widest uppercase mb-6">
          <Headphones className="h-3.5 w-3.5" />
          {contactText.hero.badge}
        </div>
        <h1 className="text-foreground tracking-tight">{contactText.hero.title}</h1>
        <p className="mt-4 text-muted-foreground text-body-lg max-w-3xl mx-auto">
          {contactText.hero.description}
        </p>
      </section>

      {/* Form + Contact Info */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 md:p-8">
            <h2 className="text-foreground mb-2">{formCopy.title}</h2>
            <p className="text-body-sm text-muted-foreground mb-6">{formCopy.subtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label={formCopy.nameLabel}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={formCopy.namePlaceholder}
                  required
                />
                <FormField
                  label={formCopy.phoneLabel}
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={formCopy.phonePlaceholder}
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  error={
                    form.phone.length > 0 && form.phone.length !== 10
                      ? errorCopy.phoneLength
                      : ""
                  }
                />
              </div>

              <FormField
                label={formCopy.emailLabel}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder={formCopy.emailPlaceholder}
              />

              <div>
                <label
                  htmlFor="subject"
                  className="block text-body-sm fw-semibold text-foreground mb-2"
                >
                  {formCopy.subjectLabel}
                </label>
                <Select value={form.subject} onValueChange={handleSubjectChange}>
                  <SelectTrigger
                    id="subject"
                    className="h-auto w-full gap-3 rounded-xl border-border bg-background px-4 py-3 text-body-sm shadow-none focus:ring-2 focus:ring-primary/30 focus:border-primary [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:opacity-70"
                  >
                    <SelectValue placeholder={formCopy.subjectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="rounded-xl border-border p-1 shadow-md"
                  >
                    {SUBJECT_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="cursor-pointer rounded-lg py-2.5 pl-4 pr-10 text-body-sm focus:bg-primary/10 focus:text-foreground"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="message" className="block text-body-sm fw-semibold text-foreground mb-2">
                  {formCopy.messageLabel}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  maxLength={255}
                  placeholder={formCopy.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-body-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="captchaInput"
                  className="block text-body-sm fw-semibold text-foreground mb-2"
                >
                  {formCopy.captchaLabel}
                </label>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-3 rounded-xl bg-muted text-body-sm font-mono fw-semibold shrink-0">
                    {captchaLabel}
                  </span>
                  <input
                    id="captchaInput"
                    name="captchaInput"
                    type="number"
                    value={form.captchaInput}
                    onChange={handleChange}
                    required
                    placeholder={formCopy.captchaPlaceholder}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      resetCaptcha();
                      setForm((prev) => ({ ...prev, captchaInput: "" }));
                    }}
                    className="text-caption text-primary fw-semibold hover:underline shrink-0"
                  >
                    {formCopy.captchaRefresh}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-body-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-body-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <Check className="h-4 w-4 shrink-0" />
                  {formCopy.success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground fw-semibold text-body-sm hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {formCopy.submitting}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {formCopy.submit}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 md:p-8 space-y-6">
              {CONTACT_INFO.map(({ icon: Icon, title, value, href }) => (
                <a
                  key={title}
                  href={href}
                  className="flex items-start gap-4 group"
                >
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-body-sm fw-bold text-foreground">{title}</p>
                    <p className="text-body-sm text-muted-foreground mt-0.5 group-hover:text-primary transition">
                      {value}
                    </p>
                  </div>
                </a>
              ))}

              <div className="pt-4 border-t border-border">
                <p className="text-body-sm fw-bold text-foreground mb-3">{contactText.info.followUs}</p>
                <div className="flex gap-3">
                  {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-64 md:h-72 shadow-[var(--shadow-card)]">
              <img
                src={gaur} alt={contactText.office.imageAlt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 rounded-md bg-primary text-primary-foreground text-caption fw-bold tracking-wider">
                  {contactText.office.brand}
                </span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-body-lg fw-bold">{contactText.office.title}</p>
                <p className="text-body-sm text-white/80 mt-1">
                  {OFFICE_ADDRESS}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection
        page="contact"
        eyebrow={contactText.faq.eyebrow}
        title={contactText.faq.title}
      />

      {/* Help Center CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 pt-10">
        <div className="rounded-2xl bg-primary p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-primary-foreground max-w-xl">
            <div className="inline-flex items-center gap-2 text-caption fw-bold tracking-widest uppercase opacity-90 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              {contactText.cta.badge}
            </div>
            <h3>{contactText.cta.title}</h3>
            <p className="text-body-sm text-primary-foreground/80 mt-2">
              {contactText.cta.description}
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-primary fw-semibold text-body-sm hover:bg-white/90 transition shrink-0 cursor-pointer"
          >
            {contactText.cta.buttonLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength,
  inputMode,
  pattern,
  error = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-body-sm fw-semibold text-foreground mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        pattern={pattern}
        className={`w-full px-4 py-3 rounded-xl border bg-background text-body-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${
          error ? "border-red-300" : "border-border"
        }`}
      />
      {error && <p className="mt-1.5 text-caption text-red-600">{error}</p>}
    </div>
  );
}
