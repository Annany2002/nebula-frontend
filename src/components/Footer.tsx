import NebulaLogo from "@/assets/nebula-logo";
import { Link } from "react-router-dom";
import { docsUrl } from "@/lib/config";

const Footer = () => (
  <footer className="nbl-footer">
    <div className="nbl-container nbl-footer-meta">
      <div className="nbl-footer-legal">
        <Link to="/" aria-label="Nebula home">
          <NebulaLogo showText={false} />
        </Link>
        <span>© {new Date().getFullYear()} · MIT licensed.</span>
      </div>
      <nav className="nbl-footer-links" aria-label="Footer navigation">
        <a href="#features">Product</a>
        <a href="#code-demo">Developers</a>
        <a href={docsUrl} target="_blank" rel="noopener noreferrer">
          Docs
        </a>
        <a href="https://github.com/Annany2002/nebula-backend" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://x.com/annanyvishwaka1" target="_blank" rel="noreferrer">
          Twitter
        </a>
      </nav>
    </div>
    <div className="nbl-footer-wordmark" aria-hidden="true">
      nebula
    </div>
  </footer>
);

export default Footer;
