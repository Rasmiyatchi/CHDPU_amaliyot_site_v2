import { useState } from "react";
import { ArrowUpRight, LogOut, Menu, User, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ProfileDialog } from "@/components/profile-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-api";
import { landingPathFor } from "@/lib/routing";
import { useAuthStore } from "@/stores/auth";

export function SiteHeader() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: t("common.home", "Bosh sahifa") },
    { to: "/amaliyot", label: t("common.practiceSearch", "Amaliyot") },
    { to: "/yoriqnoma", label: t("common.guide", "Yo‘riqnoma") },
    { to: "/faq", label: t("common.faq", "FAQ") },
  ];

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <img src="/chdpu-logo.png" alt="CHDPU" className="brand-img" />
            <span className="brand-divider" />
            <span className="brand-label">
              AMALIYOT
              <span>RAQAMLI PLATFORMA</span>
            </span>
          </Link>

          <nav
            className={open ? "nav-links open" : "nav-links"}
            aria-label="Asosiy navigatsiya"
          >
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={location.pathname === item.to ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 font-semibold"
                  onClick={() => setProfileOpen(true)}
                >
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden sm:inline">{user.first_name}</span>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="header-login"
                >
                  <Link to={landingPathFor(user.role)}>
                    {t("common.myDashboard", "Kabinetime o'tish")} <ArrowUpRight />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-500 hover:text-red-600"
                  onClick={handleLogout}
                  title="Chiqish"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button asChild className="header-login">
                <Link to="/login">
                  {t("common.login", "Platformaga kirish")} <ArrowUpRight />
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="menu-toggle"
              aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      {user && (
        <ProfileDialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="container mx-auto px-4 footer-inner">
        <div>
          <div className="footer-name">
            CHDPU<span> / </span>4+2 AMALIYOT
          </div>
          <p>
            Chirchiq davlat pedagogika universiteti
            <br />
            Raqamli amaliyot boshqaruv platformasi
          </p>
        </div>
        <div className="footer-links">
          <Link to="/">{t("common.home", "Bosh sahifa")}</Link>
          <Link to="/amaliyot">{t("common.practiceSearch", "Amaliyot")}</Link>
          <Link to="/yoriqnoma">{t("common.guide", "Yo‘riqnoma")}</Link>
          <Link to="/faq">FAQ</Link>
          <a
            href="https://cspu.uz/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1"
          >
            Universitet <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4 footer-bottom">
        <span>© {new Date().getFullYear()} CHDPU. Barcha huquqlar himoyalangan.</span>
        <span>CHIRCHIQ · O‘ZBEKISTON</span>
      </div>
    </footer>
  );
}
