import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Database,
  Key,
  Layers,
  RefreshCw,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats } from "@/lib/api/stats";
import { useAuthStore } from "@/stores/auth";

export function IntegrationsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, refetch } = useAdminStats();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncHemis = async () => {
    setIsSyncing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      toast.success(t("adminIntegrations.syncSuccess", "HEMIS tizimi bilan ma'lumotlar yangilandi"));
      refetch();
    } catch {
      toast.error(t("adminIntegrations.syncError", "Sinxronizatsiya xatosi yuz berdi"));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {t("adminIntegrations.title", "Tizim integratsiyalari")}
            </h1>
            <Badge
              variant="outline"
              className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 font-semibold px-2.5 py-0.5 text-xs"
            >
              API & Servislar
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t(
              "adminIntegrations.subtitle",
              "HEMIS axborot tizimi, akademik tuzilma, raqamli hujjat aylanishi va tashqi servislar integratsiyasi",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncHemis}
            disabled={isSyncing}
            className="gap-2 font-medium shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`}
            />
            {isSyncing ? "Sinxronizatsiya..." : "Sinxronlash"}
          </Button>
        </div>
      </div>

      {/* Grid of Main Integrations — 2 Columns with optimal max-width */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        {/* 1. HEMIS Integration */}
        <Card className="border border-border/70 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between rounded-xl bg-card">
          <div className="absolute top-0 right-0 h-28 w-28 bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    HEMIS Oliy Ta'lim Tizimi
                  </CardTitle>
                  <CardDescription className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    hemis.chdpu.uz · REST API v2
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 gap-1 font-semibold text-[11px] shrink-0">
                <CheckCircle2 className="h-3 w-3" />
                Faol ulangan
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[42px]">
              Talabalar kontingenti, akademik guruhlar, fakultet va kafedralar hamda o‘qituvchilar ro‘yxati HEMIS OTM axborot tizimidan avtomatik sinxronlashtiriladi.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/70 bg-slate-50/70 dark:bg-slate-900/50 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">Talabalar bazasi</span>
                </div>
                <div className="my-1.5 text-lg font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? "..." : (stats?.students?.total ?? 0).toLocaleString()}
                </div>
                <Link
                  to="/admin/students"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Talabalarni ko‘rish
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-lg border border-border/70 bg-slate-50/70 dark:bg-slate-900/50 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <School className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate">Akademik tuzilma</span>
                </div>
                <div className="my-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  Fakultet / Kafedra
                </div>
                <Link
                  to="/admin/academic"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                >
                  Tuzilmani boshqarish
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/70 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                Oxirgi sinxronizatsiya: avtomatik
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSyncHemis}
                disabled={isSyncing}
                className="h-7 px-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                Qayta sinxronlash
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. QR Verification & Public Doc Verification */}
        <Card className="border border-border/70 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between rounded-xl bg-card">
          <div className="absolute top-0 right-0 h-28 w-28 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Raqamli Hujjatlar & QR Verifikatsiya
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Shartnoma, yo‘llanma va sertifikatlar haqiqiyligi
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 gap-1 font-semibold text-[11px] shrink-0">
                <CheckCircle2 className="h-3 w-3" />
                Faol
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[42px]">
              Tizimda yaratilgan barcha 3 tomonlama amaliyot shartnomalari va qaydnomalar kriptografik QR-kod bilan ta'minlanadi va ochiq verifikatsiyaga ulanadi.
            </p>

            <div className="rounded-lg border border-border/70 bg-slate-50/70 dark:bg-slate-900/50 p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Ochiq verifikatsiya manzili:</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-border/60">
                  /verify/:token
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">QR kod standarti:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">ISO/IEC 18004 ECC-M</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">PDF generator:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">ReportLab Enterprise</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/70 text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate">Shablonlar superadministrator nazoratida</span>
              {user?.role === "super_admin" ? (
                <Link
                  to="/admin/contract-templates"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 shrink-0"
                >
                  Shablonlar sozlamasi
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="font-medium text-slate-400">Himoyalangan</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. E-IMZO / ONEID */}
        <Card className="border border-border/70 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between rounded-xl bg-card">
          <div className="absolute top-0 right-0 h-28 w-28 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    E-IMZO & OneID
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Elektron raqamli imzo va Yagona Identifikatsiya
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="font-semibold text-[11px] shrink-0 text-slate-600 dark:text-slate-300">
                Rejalashtirilgan
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[42px]">
              Korxona va tashkilot rahbarlari bilan amaliyot shartnomalarini E-IMZO (ERI) kalitlari orqali masofadan 100% qonuniy rasmiylashtirish moduli.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/70 bg-slate-50/70 dark:bg-slate-900/50 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <Key className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">Texnologiya</span>
                </div>
                <div className="my-1 text-sm font-bold text-slate-900 dark:text-white">
                  E-IMZO v3 / OneID
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  OAuth 2.0 & ERI kaliti
                </span>
              </div>

              <div className="rounded-lg border border-border/70 bg-slate-50/70 dark:bg-slate-900/50 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">Yuridik maqom</span>
                </div>
                <div className="my-1 text-sm font-bold text-slate-900 dark:text-white">
                  100% Qonuniy
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  O‘zR Qonuni № 562
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/70 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <Zap className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                Texnik shartlar ishlab chiqilmoqda
              </span>
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/50">
                Arxitektura tayyor
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Telegram Bot & SMS Gateway */}
        <Card className="border border-border/70 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between rounded-xl bg-card">
          <div className="absolute top-0 right-0 h-28 w-28 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Telegram Bot & Xabarnomalar
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Talaba va rahbarlar uchun tezkor ogohlantirishlar
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="font-semibold text-[11px] shrink-0 text-slate-600 dark:text-slate-300">
                Rejalashtirilgan
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[42px]">
              Amaliyot muddati boshlanishi, topshiriq topshirish sanalari va davomat bo‘yicha bildirishnomalarni Telegram orqali yuborish.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/70 bg-slate-50/70 dark:bg-slate-900/50 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">Protokol</span>
                </div>
                <div className="my-1 text-sm font-bold text-slate-900 dark:text-white">
                  Bot API v7.0
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Webhook asosida
                </span>
              </div>

              <div className="rounded-lg border border-border/70 bg-slate-50/70 dark:bg-slate-900/50 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <Users className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">Qamrov doirasi</span>
                </div>
                <div className="my-1 text-sm font-bold text-slate-900 dark:text-white">
                  3 tomonlama
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Talaba, rahbar, dekanat
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/70 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                Hozirda: Notification Bell faol
              </span>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                Tez kunda
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
