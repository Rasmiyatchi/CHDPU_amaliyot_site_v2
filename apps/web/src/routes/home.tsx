import {
  ArrowRight,
  ArrowUpRight,
  Check,
  GraduationCap,
  School,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DashboardPreview } from "@/components/DashboardPreview";
import { PracticeSearch } from "@/components/PracticeSearch";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { landingPathFor } from "@/lib/routing";
import { useAuthStore } from "@/stores/auth";

const stats = [
  ["4,000+", "TALABALAR"],
  ["08", "AMALIYOT TURLARI"],
  ["43+", "TOPSHIRIQLAR"],
  ["04", "FOYDALANUVCHI ROLLARI"],
];

const steps = [
  ["01", "Profil", "Talaba ma’lumotlari tasdiqlanadi."],
  ["02", "Amaliyot joyi", "Hamkor maktab bilan biriktiriladi."],
  ["03", "Topshiriqlar", "Reja asosida vazifalar bajariladi."],
  ["04", "Davomat", "Amaliyot kunlari qayd etiladi."],
  ["05", "Natija", "Yakuniy hisobot va baho."],
];

const roles = [
  {
    n: "01",
    t: "TALABA",
    i: GraduationCap,
    c: ["Profil", "Topshiriqlar", "Davomat", "Amaliyot holati"],
  },
  {
    n: "02",
    t: "AMALIYOT RAHBARI",
    i: UserRoundCheck,
    c: ["Talabalarni kuzatish", "Topshiriqlar", "Davomat", "Monitoring"],
  },
  {
    n: "03",
    t: "FAKULTET",
    i: School,
    c: ["Guruhlar", "Monitoring", "Statistika", "Hisobot"],
  },
  {
    n: "04",
    t: "AMALIYOT BO‘LIMI",
    i: ShieldCheck,
    c: ["Jarayon nazorati", "Tashkilotlar", "Tahlil", "Boshqaruv"],
  },
];

export function Home() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-spot" />
          <div className="container mx-auto px-4 hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">
                <span /> CHDPU · 4+2 AMALIYOT TIZIMI
              </div>
              <h1>
                <span className="hero-number">
                  <i>4</i>
                  <b>+</b>
                  <i>2</i>
                </span>
                <span>
                  DIGITAL
                  <br />
                  PRACTICE
                </span>
              </h1>
              <p>
                Chirchiq davlat pedagogika universiteti talabalari amaliyot
                jarayonini boshqarish, topshiriqlar va natijalarni nazorat qilish
                uchun yagona raqamli platforma.
              </p>
              <div className="hero-actions">
                {user ? (
                  <Button asChild size="lg">
                    <Link to={landingPathFor(user.role)}>
                      {t("common.myDashboard", "Kabinetime o'tish")} <ArrowUpRight />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link to="/login">
                      Platformaga kirish <ArrowUpRight />
                    </Link>
                  </Button>
                )}
                <Button asChild size="lg" variant="outline">
                  <Link to="/amaliyot">
                    Amaliyotni izlash <Search />
                  </Link>
                </Button>
              </div>
              <div className="hero-note">
                <span>
                  <Check /> Xavfsiz kirish
                </span>
                <span>
                  <Check /> Real vaqtda kuzatuv
                </span>
              </div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* Quick Search Band */}
        <section className="search-band">
          <div className="container mx-auto px-4 search-card">
            <div>
              <span className="section-index">01 / QIDIRUV</span>
              <h2>Amaliyotingizni toping</h2>
              <p>Talaba F.I.Sh. yoki shaxsiy amaliyot ID raqami orqali</p>
            </div>
            <PracticeSearch compact />
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container mx-auto px-4">
            <div className="section-heading">
              <div>
                <span className="section-index">02 / NAMUNAVIY KO‘RSATKICHLAR</span>
                <h2>
                  AMALIYOT
                  <br />
                  <em>PLATFORMASI</em>
                </h2>
              </div>
              <p>
                Nazariya va real pedagogik tajribani yagona raqamli muhitda
                birlashtiramiz.
              </p>
            </div>
            <div className="stats-row">
              {stats.map(([n, l], i) => (
                <div className="stat" key={l}>
                  <small>0{i + 1}</small>
                  <strong>{n}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Timeline */}
        <section className="journey">
          <div className="container mx-auto px-4">
            <span className="section-index light">03 / JARAYON</span>
            <div className="section-heading dark">
              <h2>
                Amaliyot qanday
                <br />
                <em>ishlaydi?</em>
              </h2>
              <p>
                Biriktirishdan yakuniy natijagacha — har bir bosqich aniq, shaffof
                va nazoratda.
              </p>
            </div>
            <div className="timeline">
              {steps.map((s, i) => (
                <div className="timeline-step" key={s[0]}>
                  <div className="timeline-dot">
                    <span>{i === 0 ? <Check size={15} /> : s[0]}</span>
                  </div>
                  <h3>{s[1]}</h3>
                  <p>{s[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ecosystem Roles */}
        <section className="ecosystem">
          <div className="container mx-auto px-4">
            <div className="section-heading">
              <div>
                <span className="section-index">04 / EKOTIZIM</span>
                <h2>
                  Har bir rol uchun
                  <br />
                  <em>aniq imkoniyat</em>
                </h2>
              </div>
              <p>Talabadan boshqaruvgacha yagona, bog‘langan akademik ekotizim.</p>
            </div>
            <div className="role-grid">
              {roles.map((r) => (
                <article className="role-card" key={r.t}>
                  <div className="role-top">
                    <span>{r.n}</span>
                    <r.i />
                  </div>
                  <h3>{r.t}</h3>
                  <ul>
                    {r.c.map((x) => (
                      <li key={x}>
                        <Check size={15} />
                        {x}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login"
                    aria-label={`${r.t} sifatida kirish`}
                  >
                    <ArrowUpRight />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Campus Photo Banner */}
        <section className="campus-section">
          <img
            src="/chdpu-campus.jpg"
            alt="Chirchiq davlat pedagogika universiteti binosi"
            onError={(e) => {
              // Fallback image if needed
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="campus-overlay" />
          <div className="campus-content">
            <span className="section-index light">
              CHIRCHIQ DAVLAT PEDAGOGIKA UNIVERSITETI
            </span>
            <h2>
              TA’LIM.
              <br />
              TAJRIBA.
              <br />
              <em>AMALIYOT.</em>
            </h2>
            <p>
              Kelajak pedagoglarini real maktab muhiti, raqamli nazorat va
              tajribali ustozlar bilan bog‘laymiz.
            </p>
            <Button asChild variant="secondary">
              <a
                href="https://cspu.uz/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                Universitet haqida <ArrowUpRight />
              </a>
            </Button>
          </div>
        </section>

        {/* CTA Band */}
        <section className="cta-band">
          <div className="container mx-auto px-4 cta-inner">
            <div>
              <span className="section-index">RAQAMLI AMALIYOT</span>
              <h2>
                Amaliyot jarayonini
                <br />
                bugun boshlang.
              </h2>
            </div>
            {user ? (
              <Button asChild size="lg">
                <Link to={landingPathFor(user.role)}>
                  Kabinetime o'tish <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/login">
                  Platformaga kirish <ArrowRight />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
