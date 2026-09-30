import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { PrivateState } from "@/components/PrivateState";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

interface Practice {
  id: string;
  school_name: string;
  district: string;
  practice_type: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  progress: number;
}

export function AmaliyotPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState(initialQuery);
  const [district, setDistrict] = useState("");
  const [school, setSchool] = useState("");
  const [rows] = useState<Practice[]>([]);
  const [searched, setSearched] = useState(Boolean(initialQuery));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <section className="page-intro container mx-auto px-4">
          <span className="section-index">AMALIYOT REYESTRI</span>
          <h1>
            Amaliyotingizni
            <br />
            <em>toping.</em>
          </h1>
          <p>
            Shaxsiy amaliyot yozuvlari va jarayon holatini ushbu bo'lim orqali
            xavfsiz qidirishingiz mumkin.
          </p>
        </section>

        <section className="container mx-auto px-4 search-workspace">
          <form onSubmit={handleSearch}>
            <div className="workspace-search">
              <Search />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="F.I.Sh. yoki amaliyot ID raqami"
                aria-label="F.I.Sh. yoki amaliyot ID"
              />
              <Button type="submit">Qidirish</Button>
            </div>
            <div className="filters">
              <span>
                <SlidersHorizontal /> FILTERLAR
              </span>
              <label>
                Tuman
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Masalan, Chirchiq"
                />
              </label>
              <label>
                Maktab
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Maktab nomi yoki raqami"
                />
              </label>
            </div>
          </form>
        </section>

        <section className="container mx-auto px-4 result-area">
          {!user ? (
            <PrivateState type="login" />
          ) : rows.length ? (
            <div className="result-list">
              {rows.map((r) => (
                <article key={r.id}>
                  <div>
                    <small>{r.practice_type}</small>
                    <h2>{r.school_name}</h2>
                    <p>
                      <MapPin />
                      {r.district}
                    </p>
                  </div>
                  <div>
                    <small>JARAYON</small>
                    <strong>{r.progress}%</strong>
                    <div className="result-progress">
                      <i style={{ width: `${r.progress}%` }} />
                    </div>
                  </div>
                  <div>
                    <small>HOLATI</small>
                    <span className="result-status">{r.status}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : searched ? (
            <PrivateState type="empty" />
          ) : (
            <div className="result-prompt">
              <CalendarDays />
              <h2>Qidiruvga tayyor</h2>
              <p>
                Ma’lumotlarni ko‘rish uchun filtrlarni kiriting hamda “Qidirish”
                tugmasini bosing.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
