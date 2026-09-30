import { useState, type FormEvent } from "react";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function PracticeSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/amaliyot?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/amaliyot");
    }
  }

  return (
    <form className={compact ? "search-form compact" : "search-form"} onSubmit={submit}>
      <div className="search-field">
        <Search size={20} />
        <input
          aria-label="Amaliyotni qidirish"
          placeholder="F.I.Sh. yoki amaliyot ID orqali qidirish..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg">
        Qidirish <ArrowRight />
      </Button>
    </form>
  );
}

export function FilterIcon() {
  return <SlidersHorizontal size={17} />;
}
