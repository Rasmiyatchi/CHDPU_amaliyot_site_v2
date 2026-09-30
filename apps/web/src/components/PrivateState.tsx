import { AlertCircle, LockKeyhole, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function PrivateState({
  type,
  onRetry,
}: {
  type: "login" | "empty" | "error";
  onRetry?: () => void;
}) {
  if (type === "login") {
    return (
      <div className="private-state">
        <div className="state-icon">
          <LockKeyhole />
        </div>
        <h3>Tizimga kirish talab etiladi</h3>
        <p>
          Shaxsiy amaliyot yozuvlari va davomat ma’lumotlarini ko‘rish uchun avval platformadagi hisobingizga kiring.
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link to="/login">Platformaga kirish</Link>
        </Button>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="private-state">
        <div className="state-icon">
          <AlertCircle />
        </div>
        <h3>Ma’lumotlarni yuklab bo‘lmadi</h3>
        <p>Server bilan aloqa uzildi yoki so'rovda xatolik yuz berdi. Qayta urinib ko'ring.</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4">
            Qayta urinish
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="private-state">
      <div className="state-icon">
        <SearchX />
      </div>
      <h3>Ma’lumot topilmadi</h3>
      <p>Kiritilgan qidiruv mezonlariga mos keladigan amaliyot yozuvi topilmadi.</p>
    </div>
  );
}
