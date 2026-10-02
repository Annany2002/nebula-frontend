import NebulaLogo from "@/assets/nebula-logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-white/5 relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NebulaLogo showText={false} />
            <span className="text-sm text-gray-400 dark:text-gray-500">
              &copy; {currentYear} Nebula. MIT License.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
            <a
              href="#features"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Features
            </a>
            <a
              href="#code-demo"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Code
            </a>
            <a
              href="https://github.com/Annany2002/nebula-frontend"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/annanyvishwaka1"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Large wordmark */}
      <div className="w-full select-none pointer-events-none overflow-hidden pb-0">
        <div
          className="text-[20vw] font-black tracking-tighter text-center leading-[0.72] lowercase text-gray-100 dark:text-white/[0.03]"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 90%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 90%)",
          }}
        >
          nebula
        </div>
      </div>
    </footer>
  );
};

export default Footer;
