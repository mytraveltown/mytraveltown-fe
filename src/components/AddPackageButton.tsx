import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { layoutText } from "@/lib/text";

const ADD_PACKAGE_PATH = "/admin/add-listing";

type AddPackageButtonProps = {
  onClick?: () => void;
  className?: string;
};

/** Primary call to action for agents to create a new package. */
export function AddPackageButton({ onClick, className }: AddPackageButtonProps) {
  return (
    <Link
      to={ADD_PACKAGE_PATH}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden text-white fw-semibold",
        "bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500",
        "shadow-md shadow-orange-500/30 ring-1 ring-inset ring-white/20",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/40 hover:brightness-105",
        "active:translate-y-0 active:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2",
        "rounded-full px-4 py-2 text-body-sm",
        className
      )}
    >
      {/* Light sheen that sweeps across on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="relative flex size-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-90"
      >
        <Plus size={14} strokeWidth={2.5} />
      </span>
      <span className="relative">{layoutText.header.addPackage}</span>
    </Link>
  );
}
