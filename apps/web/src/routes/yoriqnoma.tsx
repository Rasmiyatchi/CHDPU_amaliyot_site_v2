import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";

const guides: Array<{
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}> = [
  {
    icon: UserCheck,
    number: "01",
    title: "Profilni tasdiqlang",
    description:
      "Shaxsiy va akademik ma’lumotlaringiz to‘g‘riligini platformada tekshiring.",
  },
  {
    icon: ClipboardCheck,
    number: "02",
    title: "Topshiriqlarni bajaring",
    description:
      "Amaliyot rejasidagi haftalik vazifalarni belgilangan muddatda yuboring.",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Davomatni qayd eting",
    description:
      "Amaliyot kunlarida ishtirokingiz va maktabdagi davomatingizni platformada kuzating.",
  },
  {
    icon: FileCheck2,
    number: "04",
    title: "Hisobotni yakunlang",
    description:
      "Natijalarni rahbar bilan birgalikda tekshirib, yakuniy bahoni oling.",
  },
];

export function YoriqnomaPage() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <section className="page-intro container mx-auto px-4">
          <span className="section-index">FOYDALANISH YO‘RIQNOMASI</span>
          <h1>
            Amaliyot —<br />
            <em>qadam-baqadam.</em>
          </h1>
          <p>
            Platformadagi asosiy jarayonlar va talabaning amaliyot bosqichlari qisqa hamda aniq ko'rsatilgan.
          </p>
        </section>

        <section className="container mx-auto px-4 guide-grid">
          {guides.map(({ icon: Icon, number, title, description }) => (
            <article key={number}>
              <span>{number}</span>
              <Icon />
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className="container mx-auto px-4 guide-cta">
          <div>
            <h2>Jarayonni boshlashga tayyormisiz?</h2>
            <p>Shaxsiy kabinetingizga kirib, amaliyot holatingizni tekshiring.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/login">
              Platformaga kirish <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
