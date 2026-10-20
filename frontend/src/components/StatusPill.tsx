import React from "react";

export type StatusPillType =
  | "PENDING"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "AUDITION_REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "DRAFT"
  | "PUBLISHED"
  | "ACTIVE"
  | "CLOSED"
  | "OPEN"
  | "RESOLVED"
  | "DISMISSED"
  | "SAG_AFTRA"
  | "EQUITY"
  | "NON_UNION"
  | "VERIFIED";

interface StatusPillProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = "sm",
  className = ""
}) => {
  const normalized = status.toUpperCase().replace(/[\s-]/g, "_");

  const getStyle = (): { bg: string; text: string; border: string; label: string } => {
    switch (normalized) {
      case "ACCEPTED":
      case "RESOLVED":
      case "PUBLISHED":
      case "ACTIVE":
      case "OPEN":
      case "VERIFIED":
        return {
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          border: "border-emerald-500/20",
          label: status.replace(/_/g, " ")
        };
      case "SHORTLISTED":
      case "SAG_AFTRA":
      case "EQUITY":
        return {
          bg: "bg-purple-500/10",
          text: "text-purple-300",
          border: "border-purple-500/20",
          label: status.replace(/_/g, " ")
        };
      case "AUDITION_REQUESTED":
      case "UNDER_REVIEW":
        return {
          bg: "bg-[#F7FFB8]/10",
          text: "text-[#F7FFB8]",
          border: "border-[#F7FFB8]/20",
          label: status.replace(/_/g, " ")
        };
      case "PENDING":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/20",
          label: "Pending"
        };
      case "REJECTED":
      case "DISMISSED":
      case "CLOSED":
        return {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/20",
          label: status.replace(/_/g, " ")
        };
      case "DRAFT":
      case "NON_UNION":
      default:
        return {
          bg: "bg-white/6",
          text: "text-[#B9B9BE]",
          border: "border-white/10",
          label: status.replace(/_/g, " ")
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border tracking-wide uppercase ${sizeClasses} ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 opacity-80 currentColor bg-current" />
      {style.label}
    </span>
  );
};
