import Link from "next/link";
import {
  Brain,
  FileText,
  MessageCircle,
  ShieldCheck,
  BarChart2,
  ClipboardList,
  Lightbulb,
  BookOpen,
} from "lucide-react";

const knowledgeLinks = [
  { label: "Reports", href: "/reports", icon: BarChart2 },
  { label: "Minutes", href: "/minutes", icon: ClipboardList },
  { label: "Surveys", href: "/surveys", icon: FileText },
  { label: "Initiatives", href: "/initiatives", icon: Lightbulb },
];

const supportLinks = [
  { label: "Ask AI", href: "/ask-ai", icon: MessageCircle },
  { label: "Policies", href: "/policy-acceptance", icon: ShieldCheck },
];

export function Footer() {
  return (
    <footer className="print:hidden" style={{ background: "#0a0f1e", color: "#94a3b8" }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors" style={{ background: "#2563eb" }}>
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">
                Blih Brain
              </span>
            </Link>
            <p className="text-sm leading-6 max-w-xs" style={{ color: "#64748b" }}>
              A central workspace for policies, reports, meeting records, and
              operational knowledge across BILIH.
            </p>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: "#1e293b" }}>
              <p className="text-xs flex items-center gap-2" style={{ color: "#475569" }}>
                <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: "#2563eb" }} />
                Keep information accurate and up to date.
              </p>
            </div>
          </div>

          {/* Knowledge links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 tracking-wide uppercase" style={{ letterSpacing: "0.06em", fontSize: "0.7rem" }}>
              Knowledge
            </h3>
            <ul className="space-y-3.5">
              {knowledgeLinks.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2.5 text-sm transition-colors hover:text-white group"
                    style={{ color: "#64748b" }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 transition-colors group-hover:text-blue-400" style={{ color: "#3b82f6" }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase" style={{ letterSpacing: "0.06em", fontSize: "0.7rem" }}>
              Help & Support
            </h3>
            <ul className="space-y-3.5">
              {supportLinks.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2.5 text-sm transition-colors hover:text-white group"
                    style={{ color: "#64748b" }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 transition-colors group-hover:text-blue-400" style={{ color: "#3b82f6" }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: "#1e293b", color: "#475569" }}
        >
          <span>© {new Date().getFullYear()} BILIH. Internal knowledge base. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
