import NebulaLogo from "@/assets/nebula-logo";
import { ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-purple-200/30 dark:border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-md text-gray-700 dark:text-zinc-300 relative z-10 transition-colors overflow-hidden">
      <div className="container max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-200/30 dark:border-white/5">
          <div className="flex items-center gap-4">
            <NebulaLogo />
            <span className="text-xs text-gray-500 dark:text-zinc-500 border-l border-purple-200/40 dark:border-white/10 pl-4">
              © {currentYear} Nebula Project. MIT License.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600 dark:text-zinc-400 font-medium">
            <a
              href="#features"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#code-demo"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Code
            </a>
            <a
              href="https://nebula-api-docs.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors inline-flex items-center gap-1"
            >
              Docs <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <a
              href="https://github.com/Annany2002/nebula-backend"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors inline-flex items-center gap-1"
            >
              GitHub <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <a
              href="https://x.com/annanyvishwaka1"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Big Nebula Wordmark */}
      <div className="w-full select-none pointer-events-none overflow-hidden pt-2 pb-0">
        <div
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 85%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 85%)",
          }}
          className="text-[25vw] font-black tracking-tight text-center leading-[0.72] lowercase bg-clip-text text-transparent background-shine bg-[length:250%_100%] w-full"
        >
          nebula
        </div>
      </div>
    </footer>
  );
};

export default Footer;
