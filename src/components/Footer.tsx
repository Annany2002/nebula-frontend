import NebulaLogo from "@/assets/nebula-logo";
import { Twitter, Github, Linkedin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Interactive Code", href: "#code-demo" },
        { label: "Architecture", href: "#use-cases" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Developers",
      links: [
        { label: "API Documentation", href: "https://nebula-api-docs.vercel.app/" },
        { label: "Go Core Repository", href: "https://github.com/Annany2002/nebula-backend" },
        { label: "Frontend Repository", href: "https://github.com/Annany2002/nebula-frontend" },
        { label: "Docker Quickstart", href: "https://github.com/Annany2002/nebula-backend#docker" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "SQLite Isolation", href: "#features" },
        { label: "JWT Security", href: "#features" },
        { label: "Self-Hosting", href: "#faq" },
        {
          label: "License (MIT)",
          href: "https://github.com/Annany2002/nebula-backend/blob/main/LICENSE",
        },
      ],
    },
  ];

  return (
    <footer className="border-t border-purple-200/30 dark:border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-md text-gray-700 dark:text-zinc-300 relative z-10 transition-colors">
      <div className="container max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <NebulaLogo className="mb-5" />
            <p className="text-sm text-gray-600 dark:text-zinc-400 max-w-sm leading-relaxed mb-6">
              Nebula is the open-source backend engine pairing isolated per-tenant SQLite storage
              with high-concurrency Go services. Zero cloud sprawl, instant REST APIs.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 dark:bg-green-950/40 border border-green-500/30 dark:border-green-800/40 text-[11px] font-medium text-green-700 dark:text-green-400 mb-6">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="https://github.com/Annany2002/nebula-backend"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 border border-purple-200/30 dark:border-white/10 dark:bg-white/5 dark:hover:bg-purple-900/40 text-gray-700 hover:text-purple-600 dark:text-zinc-300 dark:hover:text-purple-400 transition-colors"
              >
                <Github size={16} />
              </a>
              <a
                href="https://x.com/annanyvishwaka1"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="p-2 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 border border-purple-200/30 dark:border-white/10 dark:bg-white/5 dark:hover:bg-purple-900/40 text-gray-700 hover:text-purple-600 dark:text-zinc-300 dark:hover:text-purple-400 transition-colors"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://www.linkedin.com/in/annany-vishwakarma-29b727232"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 border border-purple-200/30 dark:border-white/10 dark:bg-white/5 dark:hover:bg-purple-900/40 text-gray-700 hover:text-purple-600 dark:text-zinc-300 dark:hover:text-purple-400 transition-colors"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-xs">
                {section.links.map((link, j) => (
                  <li key={j}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="text-gray-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-purple-100/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-zinc-400">
          <p>© {currentYear} Nebula Project. MIT Open Source License.</p>
          <div className="flex items-center space-x-6">
            <Link to="/sign-in" className="hover:text-purple-600 dark:hover:text-purple-400">
              Sign In
            </Link>
            <Link to="/sign-up" className="hover:text-purple-600 dark:hover:text-purple-400">
              Create Account
            </Link>
            <a
              href="https://nebula-api-docs.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
