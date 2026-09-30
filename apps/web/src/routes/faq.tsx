import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Accordion, type AccordionItemProps } from "@/components/ui/accordion";

const faqs: AccordionItemProps[] = [
  {
    id: "item-0",
    number: "01",
    question: "4+2 amaliyot tizimi nima?",
    answer:
      "Haftaning to‘rt kuni universitetda nazariy ta’lim, ikki kuni esa biriktirilgan maktab va ta'lim muassasalarida amaliy tajriba bilan bog‘langan zamonaviy pedagogik o‘quv modeli.",
  },
  {
    id: "item-1",
    number: "02",
    question: "Platformaga kimlar kira oladi?",
    answer:
      "CHDPU talabalari, amaliyot rahbarlari, kafedra hamda fakultet mas'ullari va amaliyot bo‘limi xodimlari o‘zlariga ajratilgan rolik ruxsatlar bilan kirishadi.",
  },
  {
    id: "item-2",
    number: "03",
    question: "Amaliyot ma’lumotim ko‘rinmasa nima qilaman?",
    answer:
      "Avval hisobingizga to‘g‘ri profil orqali kirganingizni tekshiring. Biriktirish hali yakunlanmagan bo‘lsa, fakultet amaliyot mas'uliga murojaat qiling.",
  },
  {
    id: "item-3",
    number: "04",
    question: "Davomat va topshiriqlar qanday nazorat qilinadi?",
    answer:
      "Davomat amaliyot kunlari geo-joylashuv yoki mas'ul rahbar tasdiqlashi orqali qayd etiladi. Topshiriqlar platformaga yuklanadi va baholanadi.",
  },
  {
    id: "item-4",
    number: "05",
    question: "Parolimni unutdim, qanday tiklayman?",
    answer:
      "Kirish sahifasidagi parolni tiklash tugmasidan foydalaning yoki fakultet tizim administratoriga murojaat qiling.",
  },
];

export function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <section className="page-intro container mx-auto px-4">
          <span className="section-index">YORDAM MARKAZI</span>
          <h1>
            Savollarga
            <br />
            <em>aniq javoblar.</em>
          </h1>
          <p>CHDPU 4+2 amaliyot platformasi va amaliyot jarayoniga oid ko'p beriladigan savollar.</p>
        </section>

        <section className="container mx-auto px-4">
          <Accordion items={faqs} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
