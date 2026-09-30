import { HTTPError } from "ky";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  User,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { MaintenanceScreen } from "@/components/maintenance-screen";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { usePublicSettings } from "@/lib/api/system-settings";
import { login } from "@/lib/auth-api";
import { landingPathFor } from "@/lib/routing";
import { useAuthStore } from "@/stores/auth";

export function Login() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (user) {
    if (user.must_change_password) {
      return <Navigate to="/change-password" replace />;
    }
    return <Navigate to={landingPathFor(user.role)} replace />;
  }

  if (settings?.maintenance_mode) {
    return (
      <MaintenanceScreen
        message={settings.maintenance_message}
        siteName={settings.site_name}
      />
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const u = await login(username.trim(), password);
      toast.success(t("auth.login.welcome", { name: u.full_name }));
      if (u.must_change_password) {
        navigate("/change-password", { replace: true });
      } else {
        navigate(landingPathFor(u.role), { replace: true });
      }
    } catch (err) {
      const msg =
        err instanceof HTTPError
          ? "Login yoki parol noto‘g‘ri."
          : t("common.unexpectedError", "Kirishda xatolik yuz berdi.");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* Left side — Evolve Brand panel */}
      <section className="login-brand">
        <div className="login-grid" />
        <div className="flex items-center justify-between">
          <Link to="/" className="back-link">
            <ArrowLeft /> Bosh sahifaga
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="login-brand-copy">
          <img src="/chdpu-logo.png" alt="CHDPU" />
          <span className="login-kicker">4+2 RAQAMLI AMALIYOT</span>
          <h1>
            Ta’limni tajriba
            <br />
            bilan <em>bog‘laymiz.</em>
          </h1>
          <p>
            Chirchiq davlat pedagogika universiteti talabalari, rahbarlari va
            fakultetlari uchun yagona professional akademik muhit.
          </p>
        </div>

        <div className="login-metric">
          <strong>4+2</strong>
          <span>
            NAZARIYA
            <br />+ AMALIYOT
          </span>
        </div>
      </section>

      {/* Right side — Form panel */}
      <section className="login-panel relative">
        <div className="absolute top-4 right-4 hidden lg:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="login-box">
          <span className="section-index">XAVFSIZ KIRISH</span>
          <h2>Platformaga kirish</h2>
          <p>Shaxsiy kabinetingizga davom etish uchun ma'lumotlarni kiriting.</p>

          <form onSubmit={handleSubmit}>
            <label>
              Logik / Elektron manzil / Telefon
              <div>
                <User />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="masalan, talaba123 yoki email"
                  autoComplete="username"
                />
              </div>
            </label>

            <label>
              Parol
              <div>
                <LockKeyhole />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolingiz"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"
                  }
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>

            {errorMsg && (
              <p className="form-message" role="status">
                {errorMsg}
              </p>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "Tekshirilmoqda…" : "Kirish"} <ArrowRight />
            </Button>
          </form>

          <small className="secure-note">
            <LockKeyhole /> Ma’lumotlaringiz maxfiy va xavfsiz himoyalangan
          </small>
        </div>
      </section>
    </main>
  );
}
