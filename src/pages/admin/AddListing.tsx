import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { GET, POST, PUT, DELETE } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { profileUrl } from "@/lib/utils";
import { WordLimitedTextarea } from "@/components/WordLimitedTextarea";
import { AiRefineButton } from "@/components/AiRefineButton";
import { LOCATION_DESCRIPTION_MAX_WORDS, TEXT_INPUT_MAX_WORDS, countWords } from "@/lib/wordLimit";
import type { AgentInterface, PackageInterface, PackageMediaInterface } from "@/lib/interface";

type PackageType = "domestic" | "international";
type FlightOption = "included" | "excluded";
type TransferPoint = "railway" | "airport" | "both";

interface DayItinerary {
  description: string;
  activities: string[];
  activityCount: number;
  hotelStars: string;
  meals: string;
}

const emptyDay = (): DayItinerary => ({
  description: "",
  activities: [""],
  activityCount: 1,
  hotelStars: "3",
  meals: "",
});

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:border-blue-500";

const MEAL_OPTIONS = [
  "Breakfast only",
  "Dinner only",
  "Lunch only",
  "Breakfast & Lunch",
  "Breakfast, Lunch & Dinner",
  "Lunch & Dinner",
  "Breakfast & Dinner",
  "All meals included",
  "No meals included",
];

export default function AddListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [agentVerificationStatus, setAgentVerificationStatus] = useState<
    AgentInterface["verification_status"] | null
  >(null);
  const [savedStatus, setSavedStatus] = useState<"draft" | "published">("published");
  const [existingMedia, setExistingMedia] = useState<PackageMediaInterface[]>([]);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [packageType, setPackageType] = useState<PackageType>("domestic");
  const [visaRequired, setVisaRequired] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [packageName, setPackageName] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [days, setDays] = useState(3);
  const [nights, setNights] = useState(2);
  const [price, setPrice] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [flightOption, setFlightOption] = useState<FlightOption>("excluded");
  const [cabToHotel, setCabToHotel] = useState(true);
  const [cabToHotelFrom, setCabToHotelFrom] = useState<TransferPoint>("both");
  const [cabFromHotel, setCabFromHotel] = useState(true);
  const [cabFromHotelTo, setCabFromHotelTo] = useState<TransferPoint>("both");
  const [dayItineraries, setDayItineraries] = useState<DayItinerary[]>([
    emptyDay(),
    emptyDay(),
    emptyDay(),
  ]);

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      setError("");
      try {
        try {
          const agent = await GET<AgentInterface>(API.AGENT.GET_MINE);
          setAgentVerificationStatus(agent.verification_status || "pending");
        } catch {
          setAgentVerificationStatus(null);
        }

        if (id) {
          const data = await GET<PackageInterface>(API.PACKAGE.GET_BY_ID(id));
          setPackageType(data.package_type);
          setVisaRequired(data.visa_required);
          setPackageName(data.package_name);
          setFromLocation(data.from_location);
          setToLocation(data.to_location);
          setDays(data.days);
          setNights(data.nights);
          setPrice(data.price != null ? String(data.price) : "");
          setLocationDescription(data.location_description || "");
          setFlightOption(data.flight_option);
          setCabToHotel(data.cab_to_hotel);
          setCabToHotelFrom(data.cab_to_hotel_from);
          setCabFromHotel(data.cab_from_hotel);
          setCabFromHotelTo(data.cab_from_hotel_to);
          setExistingMedia(data.media || []);

          if (data.itinerary?.length) {
            setDayItineraries(
              data.itinerary.map((day) => ({
                description: day.description || "",
                activities: day.activities?.length ? day.activities : [""],
                activityCount: day.activity_count ?? day.activities?.length ?? 1,
                hotelStars: String(day.hotel_stars ?? 3),
                meals: day.meals || "",
              }))
            );
          }
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to load package";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [id]);

  const publishBlocked = agentVerificationStatus === "pending" || agentVerificationStatus === "rejected";

  useEffect(() => {
    setDayItineraries((prev) => {
      if (days === prev.length) return prev;
      if (days > prev.length) {
        return [...prev, ...Array.from({ length: days - prev.length }, emptyDay)];
      }
      return prev.slice(0, days);
    });
  }, [days]);

  const updateDay = (index: number, patch: Partial<DayItinerary>) => {
    setDayItineraries((prev) =>
      prev.map((day, i) => (i === index ? { ...day, ...patch } : day))
    );
  };

  const addActivity = (dayIndex: number) => {
    setDayItineraries((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? { ...day, activities: [...day.activities, ""], activityCount: day.activities.length + 1 }
          : day
      )
    );
  };

  const updateActivity = (dayIndex: number, activityIndex: number, value: string) => {
    setDayItineraries((prev) =>
      prev.map((day, i) => {
        if (i !== dayIndex) return day;
        const activities = [...day.activities];
        activities[activityIndex] = value;
        return { ...day, activities };
      })
    );
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setDayItineraries((prev) =>
      prev.map((day, i) => {
        if (i !== dayIndex || day.activities.length <= 1) return day;
        const activities = day.activities.filter((_, j) => j !== activityIndex);
        return { ...day, activities, activityCount: activities.length };
      })
    );
  };

  const handleGalleryChange = (files: FileList | null) => {
    if (!files) return;
    setGalleryFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const buildFormData = (status: "draft" | "published") => {
    const formData = new FormData();
    formData.append("package_type", packageType);
    formData.append("visa_required", String(visaRequired));
    formData.append("package_name", packageName.trim());
    formData.append("from_location", fromLocation.trim());
    formData.append("to_location", toLocation.trim());
    formData.append("days", String(days));
    formData.append("nights", String(nights));
    if (price.trim()) formData.append("price", price.trim());
    formData.append("location_description", locationDescription.trim());
    formData.append("flight_option", flightOption);
    formData.append("cab_to_hotel", String(cabToHotel));
    formData.append("cab_to_hotel_from", cabToHotelFrom);
    formData.append("cab_from_hotel", String(cabFromHotel));
    formData.append("cab_from_hotel_to", cabFromHotelTo);
    formData.append("status", status);

    const itinerary = dayItineraries.map((day, index) => ({
      day_number: index + 1,
      description: day.description.trim(),
      activities: day.activities.map((a) => a.trim()).filter(Boolean),
      activity_count: day.activityCount,
      hotel_stars: Number(day.hotelStars),
      meals: day.meals,
    }));
    formData.append("itinerary", JSON.stringify(itinerary));

    galleryFiles.forEach((file) => {
      formData.append("gallery", file);
    });

    return formData;
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!id) return;
    setDeletingMediaId(mediaId);
    try {
      await DELETE(API.PACKAGE.DELETE_MEDIA(id, mediaId));
      setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to delete media";
      alert(message);
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setError("");
    setSubmitted(false);

    if (status === "published" && publishBlocked) {
      setError(
        "Publishing is disabled until your agent profile is verified by our team."
      );
      return;
    }

    if (!packageName.trim() || !fromLocation.trim() || !toLocation.trim()) {
      setError("Package name, from, and to locations are required.");
      return;
    }

    if (countWords(locationDescription) > LOCATION_DESCRIPTION_MAX_WORDS) {
      setError(
        `Location Description must be ${LOCATION_DESCRIPTION_MAX_WORDS} words or fewer. Use "Improve with AI" to shorten it.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = buildFormData(status);
      if (isEdit && id) {
        await PUT<PackageInterface>(API.PACKAGE.UPDATE(id), formData);
      } else {
        await POST<PackageInterface>(API.PACKAGE.CREATE, formData);
      }
      setSavedStatus(status);
      setSubmitted(true);
      setTimeout(() => navigate("/admin/mypackages"), 1500);
      if (isEdit) {
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to save package. Please try again.";
      setError(message);
    } finally {
      // setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="fw-bold">
          {isEdit ? "Edit Package / Itinerary" : "Create Package / Itinerary"}
        </h2>
        <p className="text-body-sm text-neutral-500">
          Travel Partner — add a domestic or international package with day-wise itinerary details.
        </p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-body-sm">
          Package {savedStatus === "published" ? "published" : "saved as draft"} successfully.
          {isEdit &&" Redirecting to My Packages..."}
        </div>
      )}

      {publishBlocked && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-body-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="mt-1 text-amber-700">
              {agentVerificationStatus === "rejected"
                ? "Your verification request was rejected. Please update your documents and complete verification before publishing packages."
                : "Your agent profile is under review. You can save packages as draft, but publishing is disabled until verification is complete."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit("published");
        }}
        className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 space-y-8"
      >
        {/* Package type */}
        <Section title="Package Type">
          <div className="flex flex-wrap gap-3">
            <ChoiceButton
              active={packageType === "domestic"}
              onClick={() => setPackageType("domestic")}
              label="Domestic"
            />
            <ChoiceButton
              active={packageType === "international"}
              onClick={() => setPackageType("international")}
              label="International"
            />
          </div>
          {packageType === "international" && (
            <label className="mt-4 flex items-center gap-2 text-body-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={visaRequired}
                onChange={(e) => setVisaRequired(e.target.checked)}
                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              Visa required for this package
            </label>
          )}
        </Section>

        {/* Media / Gallery */}
        <Section title="Media / Gallery">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-lg p-8 cursor-pointer hover:border-blue-500">
            <Upload className="text-neutral-400 mb-2" size={24} />
            <span className="text-body-sm text-neutral-600">Click to upload photos or videos</span>
            <span className="text-caption text-neutral-400 mt-1">Multiple files supported</span>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*"
              multiple
              onChange={(e) => handleGalleryChange(e.target.files)}
            />
          </label>
          {galleryFiles.length > 0 && (
            <ul className="mt-4 space-y-2">
              {galleryFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-body-sm"
                >
                  <span className="truncate text-neutral-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeGalleryFile(index)}
                    className="text-neutral-400 hover:text-red-500 shrink-0"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {existingMedia.length > 0 && (
            <div className="mt-4">
              <p className="text-body-sm fw-medium text-neutral-700 mb-2">Uploaded media</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingMedia.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50"
                  >
                    {item.media_type === "image" ? (
                      <img
                        src={profileUrl(item.file_path)}
                        alt="Package media"
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center text-caption text-neutral-500">
                        Video
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(item.id)}
                      disabled={deletingMediaId === item.id}
                      className="absolute top-1 right-1 size-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                      aria-label="Remove media"
                    >
                      {deletingMediaId === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Basic details */}
        <Section title="Package Details">
          <Field label="Package Name">
            <input
              required
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Bali Zen Retreat"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="From">
              <input
                required
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className={inputClass}
                placeholder="Departure city"
              />
            </Field>
            <Field label="To">
              <input
                required
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className={inputClass}
                placeholder="Destination city"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="No. of Days">
              <input
                required
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
                className={inputClass}
              />
            </Field>
            <Field label="No. of Nights">
              <input
                required
                type="number"
                min={0}
                value={nights}
                onChange={(e) => setNights(Math.max(0, Number(e.target.value) || 0))}
                className={inputClass}
              />
            </Field>
            <Field label="Price (₹)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
                placeholder="Package price"
              />
            </Field>
          </div>

          <Field label="Location Description">
            <WordLimitedTextarea
              rows={4}
              maxWords={LOCATION_DESCRIPTION_MAX_WORDS}
              inputMaxWords={TEXT_INPUT_MAX_WORDS}
              overLimitHint={`use "Improve with AI" to shorten to ${LOCATION_DESCRIPTION_MAX_WORDS}`}
              value={locationDescription}
              onChange={setLocationDescription}
              action={
                <AiRefineButton
                  text={locationDescription}
                  field="location_description"
                  onRefined={setLocationDescription}
                />
              }
              className={inputClass}
              placeholder="Describe the destination, highlights, and what makes this package special..."
            />
          </Field>
        </Section>

        {/* Transfers & flights */}
        <Section title="Transfers & Flights">
          <Field label="Flight">
            <div className="flex flex-wrap gap-3">
              <ChoiceButton
                active={flightOption === "included"}
                onClick={() => setFlightOption("included")}
                label="Included"
              />
              <ChoiceButton
                active={flightOption === "excluded"}
                onClick={() => setFlightOption("excluded")}
                label="Excluded"
              />
            </div>
          </Field>

          <div className="space-y-4 pt-2">
            <TransferField
              label="Cab transfer to hotel"
              sublabel="From Railway Station / Airport to Hotel"
              enabled={cabToHotel}
              onEnabledChange={setCabToHotel}
              point={cabToHotelFrom}
              onPointChange={setCabToHotelFrom}
            />
            <TransferField
              label="Cab transfer from hotel"
              sublabel="From Hotel to Railway Station / Airport"
              enabled={cabFromHotel}
              onEnabledChange={setCabFromHotel}
              point={cabFromHotelTo}
              onPointChange={setCabFromHotelTo}
            />
          </div>
        </Section>

        {/* Day-wise itinerary */}
        <Section title="Day-wise Itinerary">
          <p className="text-body-sm text-neutral-500 -mt-2">
            Add itinerary, activities, hotel, and meals for each day of the package.
          </p>

          <div className="space-y-6">
            {dayItineraries.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-4 bg-neutral-50/50"
              >
                <h3 className="fw-semibold text-neutral-800">Day {dayIndex + 1}</h3>

                <Field label="Itinerary Description">
                  <textarea
                    rows={3}
                    value={day.description}
                    onChange={(e) => updateDay(dayIndex, { description: e.target.value })}
                    className={inputClass}
                    placeholder="Describe the plan for this day..."
                  />
                </Field>

                <Field label="Activities">
                  <div className="space-y-2">
                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex gap-2">
                        <input
                          value={activity}
                          onChange={(e) => updateActivity(dayIndex, activityIndex, e.target.value)}
                          className={inputClass}
                          placeholder={`Activity ${activityIndex + 1}`}
                        />
                        {day.activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeActivity(dayIndex, activityIndex)}
                            className="shrink-0 p-2.5 border border-neutral-200 rounded-lg text-neutral-400 hover:text-red-500 hover:border-red-200"
                            aria-label="Remove activity"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addActivity(dayIndex)}
                      className="inline-flex items-center gap-1.5 text-body-sm fw-medium text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={16} /> Add activity
                    </button>
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="No. of Activities">
                    <input
                      type="number"
                      min={0}
                      value={day.activityCount}
                      onChange={(e) =>
                        updateDay(dayIndex, { activityCount: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Hotel (Star wise)">
                    <select
                      value={day.hotelStars}
                      onChange={(e) => updateDay(dayIndex, { hotelStars: e.target.value })}
                      className={inputClass}
                    >
                      <option value="1">Standard</option>
                      <option value="3">3 Star</option>
                      <option value="4">4 Star</option>
                      <option value="5">5 Star</option>
                    </select>
                  </Field>

                  <Field label="Meals Option">
                    <select
                      value={day.meals}
                      onChange={(e) => updateDay(dayIndex, { meals: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Select meals</option>
                      {MEAL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-body-sm">
            Package {savedStatus === "published" ? "published" : "saved as draft"} successfully.
            {isEdit &&" Redirecting to My Packages..."}
          </div>
        )}

        {publishBlocked && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-body-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="mt-1 text-amber-700">
                {agentVerificationStatus === "rejected"
                  ? "Your verification request was rejected. Please update your documents and complete verification before publishing packages."
                  : "Your agent profile is under review. You can save packages as draft, but publishing is disabled until verification is complete."}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || publishBlocked}
            title={
              publishBlocked
                ? "Publishing is disabled until your agent profile is verified"
                : undefined
            }
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white fw-semibold px-6 py-2.5 rounded-lg text-body-sm cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : isEdit ? (
              "Update & Publish"
            ) : (
              "Publish Package"
            )}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("draft")}
            className="inline-flex items-center justify-center gap-2 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 fw-semibold px-6 py-2.5 rounded-lg text-body-sm cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Draft"
            ) : (
              "Save as Draft"
            )}
          </button>
        </div>
      </form>
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
      <label className="block text-body-sm fw-medium text-neutral-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-body-sm fw-medium border transition ${active
 ? "bg-blue-50 border-blue-500 text-blue-700"
 : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
 }`}
    >
      {label}
    </button>
  );
}

function TransferField({
  label,
  sublabel,
  enabled,
  onEnabledChange,
  point,
  onPointChange,
}: {
  label: string;
  sublabel: string;
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  point: TransferPoint;
  onPointChange: (value: TransferPoint) => void;
}) {
  return (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
        />
        <span>
          <span className="block text-body-sm fw-medium text-neutral-700">{label}</span>
          <span className="block text-caption text-neutral-500">{sublabel}</span>
        </span>
      </label>
      {enabled && (
        <div className="pl-6 flex flex-wrap gap-2">
          {(
            [
              { value: "railway", label: "Railway Station" },
              { value: "airport", label: "Airport" },
              { value: "both", label: "Both" },
            ] as const
          ).map(({ value, label: optionLabel }) => (
            <ChoiceButton
              key={value}
              active={point === value}
              onClick={() => onPointChange(value)}
              label={optionLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
