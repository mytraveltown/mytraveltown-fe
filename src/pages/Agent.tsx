import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Calendar,
  MessageSquare,
  Package,
  BookOpen,
  BadgeCheck,
  Loader2,
  Clock,
} from "lucide-react";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { formatDate, profileUrl } from "@/lib/utils";
import { toPlainText } from "@/lib/description";
import { FormattedText } from "@/components/FormattedText";
import type { AgentInterface, PackageInterface } from "@/lib/interface";
import { packagePath } from "@/lib/routes";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop";

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<AgentInterface | null>(null);
  const [packages, setPackages] = useState<PackageInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"packages" | "about">("packages");

  useEffect(() => {
    if (!id) return;

    const fetchAgent = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [agentData, packageData] = await Promise.all([
          GET<AgentInterface>(API.AGENT.GET_BY_ID(id)),
          GET<PackageInterface[]>(API.PACKAGE.GET_ALL, { agent_id: id }),
        ]);
        setAgent(agentData);
        setPackages(packageData);
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Agent not found";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 text-center">
        <p className="text-body-lg fw-semibold text-neutral-800">{error || "Agent not found"}</p>
        <Link to="/search" className="mt-4 text-blue-600 hover:underline text-body-sm fw-medium">
          Browse packages
        </Link>
      </div>
    );
  }

  const displayName = agent.company_name || agent.user_name || "Travel Partner";
  const avatarSrc = agent.user_profile ? profileUrl(agent.user_profile) : profileUrl("");
  const isVerified = agent.verification_status === "verified";
  const stats = [
    { val: String(packages.length), lbl: "Packages" },
    { val: `${agent.experience}`, lbl: "Yrs exp." },
    { val: String(agent.deals_in?.length || 0), lbl: "Specialties" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Profile hero card */}
        <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm mb-8 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-neutral-100 shadow-sm shrink-0 mx-auto sm:mx-0"
              />

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-headline fw-bold text-neutral-900 break-words min-w-0">
                    {displayName}
                  </h1>
                  {isVerified && (
                    <span className="inline-flex self-center sm:self-auto items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-caption fw-semibold shrink-0">
                      <BadgeCheck size={14} /> Verified Partner
                    </span>
                  )}
                </div>
                {agent.user_name && agent.company_name && (
                  <p className="mt-1 text-body-sm text-neutral-500">{agent.user_name}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-neutral-500 text-body-sm">
                  {agent.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} className="text-neutral-400" />
                      {agent.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={15} className="text-neutral-400" />
                    Partner since {formatDate(agent.created_at).split(",")[0]}
                  </span>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end gap-6 sm:gap-8 sm:pl-4 sm:border-l sm:border-neutral-100 shrink-0">
                {stats.map((s) => (
                  <div key={s.lbl} className="text-center min-w-[4.5rem]">
                    <div className="text-title fw-bold text-blue-600 tabular-nums">{s.val}</div>
                    <div className="text-caption fw-medium text-neutral-400 mt-0.5">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 px-6 md:px-8 py-5 bg-neutral-50/60">
            <h2 className="flex items-center gap-2 text-body-sm fw-semibold text-neutral-800 mb-2">
              <BookOpen size={16} className="text-blue-600" />
              About
            </h2>
            {agent.about?.trim() ? (
              <div className="space-y-3 text-neutral-600 leading-relaxed text-body-sm">
                <FormattedText text={agent.about} />
              </div>
            ) : (
              <p className="text-neutral-600 leading-relaxed text-body-sm">
                This travel partner hasn&apos;t added a bio yet.
              </p>
            )}
            {agent.deals_in?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {agent.deals_in.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-caption fw-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Tabs */}
        <section>
          <div className="flex gap-6 border-b border-neutral-200 mb-6 overflow-x-auto whitespace-nowrap">
            {[
              { id: "packages" as const, lbl: "Packages", icon: Package },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 border-b-2 fw-medium text-body-sm transition-colors ${
 activeTab === tab.id
 ? "border-blue-600 text-blue-600"
 : "border-transparent text-neutral-500 hover:text-neutral-800"
 }`}
              >
                <tab.icon size={16} /> {tab.lbl}
              </button>
            ))}
          </div>

          {activeTab === "packages" && (
            <>
              {packages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center text-neutral-500 text-body-sm">
                  No published packages yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <Link
                      key={pkg.id}
                      to={packagePath(pkg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <img
                        src={pkg.thumbnail ? profileUrl(pkg.thumbnail) : PLACEHOLDER_IMAGE}
                        alt={toPlainText(pkg.package_name)}
                        className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="p-5">
                        <span className="text-caption fw-bold uppercase text-neutral-400">
                          {pkg.package_type}
                        </span>
                        <h3 className="fw-bold text-body mt-1 mb-2 line-clamp-1">
                          {toPlainText(pkg.package_name)}
                        </h3>
                        <p className="text-neutral-600 text-body-sm flex items-center gap-1 mb-2">
                          <MapPin size={14} className="shrink-0" />
                          <span className="truncate">
                            {pkg.from_location} → {pkg.to_location}
                          </span>
                        </p>
                        <p className="text-caption text-neutral-500 flex items-center gap-1">
                          <Clock size={12} />
                          {pkg.days} days · {pkg.nights} nights
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

        </section>
      </main>
    </div>
  );
}
