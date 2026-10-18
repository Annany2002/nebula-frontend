import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface AuthPanelProps {
  icon?: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

const AuthPanel = ({
  icon,
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthPanelProps) => (
  <div className="auth-form-content">
    <div
      className={icon ? "auth-form-heading auth-form-heading-verification" : "auth-form-heading"}
    >
      {icon && (
        <div className="auth-verification-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h1 id="auth-heading">{title}</h1>
      <p>{description}</p>
    </div>
    {children}
    <p className="auth-switch">
      {footerText}{" "}
      <Link to={footerLinkHref}>
        {footerLinkText}
        <ArrowUpRight size={13} aria-hidden="true" />
      </Link>
    </p>
  </div>
);

export default AuthPanel;
