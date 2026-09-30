import L from "leaflet";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  GraduationCap,
  MapPin,
  TrendingUp,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizations } from "@/lib/api/organizations";
import { downloadStatsPdfReport, useAdminStats, useSuperAdminStats } from "@/lib/api/stats";
import { useAuthStore } from "@/stores/auth";

// Leaflet marker default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl,
  shadowUrl,
});

const DEFAULT_MAP_CENTER = { lat: 41.468, lng: 69.582 }; // Chirchiq markazi
const DEFAULT_MAP_ZOOM = 11;

const VALID_TABS = [
  "overview",
  "practices",
  "attendance",
  "tasks",
  "supervisors",
  "objects",
  "issues",
  "map",
  "analytics",
] as const;

type MonitoringTab = (typeof VALID_TABS)[number];

export function MonitoringPage() {
  const { t } = useTranslation();
  const { tab: paramTab } = useParams<{ tab?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "super_admin";

  const adminStats = useAdminStats();
  const superAdminStats = useSuperAdminStats();
  const stats = isSuperAdmin ? superAdminStats.data : adminStats.data;

  const { data: orgsData } = useOrganizations({}, 1, 100);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Active tabni route param yoki query param orqali aniqlash
  const activeTab: MonitoringTab = useMemo(() => {
    if (paramTab && VALID_TABS.includes(paramTab as MonitoringTab)) {
      return paramTab as MonitoringTab;
    }
    const qTab = searchParams.get("tab");
    if (qTab && VALID_TABS.includes(qTab as MonitoringTab)) {
      return qTab as MonitoringTab;
    }
    return "overview";
  }, [paramTab, searchParams]);

  const handleTabChange = (val: string) => {
    if (paramTab) {
      navigate(`/admin/monitoring/${val}`);
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", val);
        return next;
      });
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadStatsPdfReport();
      toast.success(t("adminIndex.downloadedPdfToast", "Statistika hisoboti (PDF) yuklandi"));
    } catch (e: any) {
      toast.error(e?.message || "PDF yuklab olishda xatolik");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Koordinatasi mavjud bo'lgan obyektlar
  const geoOrganizations = useMemo(() => {
    return (orgsData?.items ?? []).filter(
      (o) => o.geo_lat != null && o.geo_lng != null && !isNaN(Number(o.geo_lat)) && !isNaN(Number(o.geo_lng)),
    );
  }, [orgsData]);

  // Muammoli va diqqat talab holatlar ro'yxati
  const issuesList = useMemo(() => {
    if (!stats) return [];
    const list: Array<{
      id: string;
      title: string;
      description: string;
      severity: "high" | "medium" | "low";
      actionUrl: string;
      actionText: string;
    }> = [];

    // 0. Amaliyotga biriktirilmagan talabalar
    const unassignedCount = stats.students?.unassigned ?? 0;
    if (unassignedCount > 0) {
      list.push({
        id: "unassigned-students",
        title: "Amaliyotga biriktirilmagan talabalar",
        description: `${unassignedCount} nafar talaba hali birorta ham amaliyot o'tash joyiga biriktirilmagan`,
        severity: "high",
        actionUrl: "/admin/assignments",
        actionText: "Biriktirishga o'tish",
      });
    }

    // 1. Sig'imi to'lib ketgan yoki 80%+ ga yetgan obyektlar
    stats.capacity_alerts?.forEach((alert) => {
      list.push({
        id: `capacity-${alert.kind}-${alert.id}`,
        title: `${alert.kind === "organization" ? "Tashkilot" : "Rahbar"}: ${alert.name}`,
        description: `Sig'im to'lganlik darajasi: ${alert.percent}% (${alert.used} / ${alert.capacity} o'rin band)`,
        severity: alert.severity === "full" ? "high" : "medium",
        actionUrl: alert.kind === "organization" ? "/admin/objects" : "/admin/supervisors",
        actionText: "Ko'rib chiqish",
      });
    });

    // 2. Kutilayotgan tekshiruvlar (submitted reviews)
    if (stats.pending_reviews?.total > 0) {
      list.push({
        id: "pending-reviews",
        title: "Kutilayotgan topshiriq va kundalik tekshiruvlari",
        description: `${stats.pending_reviews.total} ta talaba ishi (vazifalar: ${stats.pending_reviews.tasks}, kundaliklar: ${stats.pending_reviews.journals}) tekshirish uchun navbatda`,
        severity: stats.pending_reviews.total > 20 ? "high" : "medium",
        actionUrl: "/admin/task-templates",
        actionText: "Topshiriqlarga o'tish",
      });
    }

    // 3. Imzolanmagan / qoralama shartnomalar
    const draftContracts = stats.contracts?.by_status?.draft ?? 0;
    if (draftContracts > 0) {
      list.push({
        id: "draft-contracts",
        title: "Tasdiqlanmagan qoralama shartnomalar",
        description: `${draftContracts} ta shartnoma qoralama holatda turibdi va ikki tomonlama imzolanmagan`,
        severity: "medium",
        actionUrl: "/admin/contracts",
        actionText: "Shartnomalarni tekshirish",
      });
    }

    return list;
  }, [stats]);

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <BarChart3 className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">Monitoring Markazi</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Amaliyot jarayonlari, davomat dinamikasi, obyektlar sig'imi va real vaqtdagi ko'rsatkichlar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloadingPdf} className="gap-2 text-xs font-semibold">
            <Download className="h-3.5 w-3.5" />
            {downloadingPdf ? "Tayyorlanmoqda..." : "Tahliliy hisobot (PDF)"}
          </Button>
          <Button asChild size="sm" className="gap-2 text-xs font-semibold">
            <Link to="/admin/assignments">
              Biriktirishlar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs bar */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="h-auto flex-wrap p-1 bg-slate-900/50 border border-slate-800 rounded-lg">
          <TabsTrigger value="overview" className="text-xs py-1.5 px-3">
            Umumiy holat
          </TabsTrigger>
          <TabsTrigger value="practices" className="text-xs py-1.5 px-3">
            Amaliyotlar
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs py-1.5 px-3">
            Davomat
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs py-1.5 px-3">
            Topshiriqlar
          </TabsTrigger>
          <TabsTrigger value="supervisors" className="text-xs py-1.5 px-3">
            Rahbarlar
          </TabsTrigger>
          <TabsTrigger value="objects" className="text-xs py-1.5 px-3">
            Obyektlar
          </TabsTrigger>
          <TabsTrigger value="issues" className="text-xs py-1.5 px-3 gap-1.5">
            Muammolar
            {issuesList.length > 0 && (
              <Badge variant="destructive" className="h-4 px-1 text-[9px] font-bold">
                {issuesList.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="map" className="text-xs py-1.5 px-3">
            Xarita
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs py-1.5 px-3">
            Tahlil
          </TabsTrigger>
        </TabsList>

        {/* 1. UMUMIY HOLAT (Overview) */}
        <TabsContent value="overview" className="space-y-6 m-0">
          {/* Biriktirilmagan talabalar bo'yicha ogohlantirish (Widget) */}
          {(stats?.students?.unassigned ?? 0) > 0 && (
            <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        Amaliyotga biriktirilmagan talabalar mavjud!
                      </h3>
                      <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold text-xs">
                        {stats?.students?.unassigned} nafar
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                      Tizimdagi jami <b>{stats?.students?.total ?? 0}</b> nafar talabadan <b className="text-amber-600 dark:text-amber-400">{stats?.students?.unassigned} nafari</b> hali birorta ham amaliyot o'tash joyiga biriktirilmagan.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs gap-1.5 shadow-sm">
                    <Link to="/admin/assignments">
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Talabalarni biriktirish</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-amber-500/30 text-xs gap-1.5">
                    <Link to="/admin/structure/students?has_assignment=false">
                      <span>Ro'yxatni ko'rish</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* KPI Strip */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="Jami talabalar"
              value={stats?.students?.total ?? 0}
              icon={Users}
              accent="primary"
              hint="Tizimda ro'yxatdan o'tgan"
            />
            <StatCard
              label="Biriktirilmagan"
              value={stats?.students?.unassigned ?? 0}
              icon={UserX}
              accent={(stats?.students?.unassigned ?? 0) > 0 ? "warning" : "success"}
              hint={(stats?.students?.unassigned ?? 0) > 0 ? "Amaliyotga biriktirilmagan" : "Barchasi biriktirilgan"}
            />
            <StatCard
              label="Faol amaliyotlar"
              value={stats?.assignments?.by_status?.active ?? 0}
              icon={GraduationCap}
              accent="info"
              hint="Joriy o'quv davrida"
            />
            <StatCard
              label="Davomat ko'rsatkichi"
              value={`${stats?.attendance_30d?.green_percent ?? 0}%`}
              icon={CalendarCheck}
              accent={(stats?.attendance_30d?.green_percent ?? 0) >= 80 ? "success" : "warning"}
              hint="Oxirgi 30 kunlik natija"
            />
            <StatCard
              label="Topshiriqlar ijrosi"
              value={stats?.tasks?.total ?? 0}
              icon={FileCheck2}
              accent="primary"
              hint={`Topshirilgan: ${stats?.tasks?.by_status?.submitted ?? 0}`}
            />
            <StatCard
              label="Diqqat talab holatlar"
              value={issuesList.length}
              icon={AlertTriangle}
              accent={issuesList.length > 0 ? "destructive" : "success"}
              hint={issuesList.length > 0 ? "Ko'rib chiqish tavsiya etiladi" : "Muammolar aniqlanmadi"}
            />
          </div>

          {/* Practice Types Overview & Quick Statuses */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Practice Progress */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">Amaliyot turlari bo'yicha ko'rsatkichlar</CardTitle>
                    <CardDescription className="text-xs">4+2 va malakaviy amaliyot turlari ijrosi</CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link to="/admin/practice-types">Barchasi</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.practice_types && stats.practice_types.length > 0 ? (
                  stats.practice_types.map((pt) => {
                    const total = pt.total || 1;
                    const percent = Math.round(((pt.active + pt.completed) / total) * 100);
                    return (
                      <div key={pt.id} className="space-y-1.5 rounded-lg border border-border/60 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">
                            {pt.name} <span className="font-normal text-muted-foreground">({pt.code})</span>
                          </span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{percent}%</span>
                        </div>
                        <Progress value={percent} className="h-1.5" />
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                          <span>Faol: <b className="text-foreground">{pt.active}</b></span>
                          <span>Tugallangan: <b className="text-foreground">{pt.completed}</b></span>
                          <span>Qoralama: <b className="text-foreground">{pt.draft}</b></span>
                          <span>Jami: <b className="text-foreground">{pt.total}</b></span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center">Amaliyot turlari ma'lumoti mavjud emas</p>
                )}
              </CardContent>
            </Card>

            {/* Right Col: Quick alerts & Pending Reviews */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Kutilayotgan tekshiruvlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Topshiriqlar (vazifalar):</span>
                    <b className="font-mono">{stats?.pending_reviews?.tasks ?? 0} ta</b>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Kundalik yozuvlari:</span>
                    <b className="font-mono">{stats?.pending_reviews?.journals ?? 0} ta</b>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Dars tahlillari:</span>
                    <b className="font-mono">{stats?.pending_reviews?.analyses ?? 0} ta</b>
                  </div>
                  <div className="flex justify-between pt-1 font-semibold text-foreground">
                    <span>Jami ko'rikda:</span>
                    <Badge variant="outline" className="font-mono">
                      {stats?.pending_reviews?.total ?? 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-400" />
                    Hamkorlik va Shartnomalar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Hamkor tashkilotlar:</span>
                    <b className="font-mono">{stats?.organizations ?? 0} ta</b>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Amaliyot rahbarlari:</span>
                    <b className="font-mono">{stats?.supervisors ?? 0} nafar</b>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Imzolangan shartnomalar:</span>
                    <b className="font-mono text-emerald-500">
                      {stats?.contracts?.by_status?.active ?? 0} ta
                    </b>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Kutilayotgan / qoralama:</span>
                    <b className="font-mono text-amber-500">
                      {(stats?.contracts?.by_status?.draft ?? 0) + (stats?.contracts?.by_status?.generated ?? 0)} ta
                    </b>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 2. AMALIYOTLAR (Practices) */}
        <TabsContent value="practices" className="space-y-4 m-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Amaliyotlar holati va turlari</CardTitle>
              <CardDescription className="text-xs">
                O'quv yili davomida talabalar biriktirilgan amaliyot turlari bo'yicha to'liq statistika
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs text-muted-foreground">Jami biriktirishlar</span>
                  <div className="mt-1 text-2xl font-black">{stats?.assignments?.total ?? 0}</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Faol amaliyotda</span>
                  <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats?.assignments?.by_status?.active ?? 0}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Tayyorgarlikda (qoralama)</span>
                  <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                    {stats?.assignments?.by_status?.draft ?? 0}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Yakunlangan</span>
                  <div className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
                    {stats?.assignments?.by_status?.completed ?? 0}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild size="sm" className="gap-2 text-xs">
                  <Link to="/admin/assignments">
                    Barcha biriktirishlarni boshqarish <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. DAVOMAT (Attendance) */}
        <TabsContent value="attendance" className="space-y-4 m-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Davomat monitoringi (Oxirgi 30 kun)</CardTitle>
                  <CardDescription className="text-xs">
                    Talabalarning amaliyot joyiga belgilangan kunlarda kelishi va GPS qaydlari
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
                  <Link to="/admin/attendance">
                    Davomat jadvaliga o'tish <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <span className="text-xs font-semibold text-emerald-500">Kelgan (Tasdiqlangan)</span>
                  <div className="mt-2 text-3xl font-black text-emerald-500">
                    {stats?.attendance_30d?.green ?? 0}
                  </div>
                </div>
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center">
                  <span className="text-xs font-semibold text-rose-500">Kelmagan (Sababsiz)</span>
                  <div className="mt-2 text-3xl font-black text-rose-500">
                    {stats?.attendance_30d?.red ?? 0}
                  </div>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                  <span className="text-xs font-semibold text-amber-500">Kutilmoqda</span>
                  <div className="mt-2 text-3xl font-black text-amber-500">
                    {stats?.attendance_30d?.pending ?? 0}
                  </div>
                </div>
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 text-center">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Umumiy davomat ko'rsatkichi</span>
                  <div className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    {stats?.attendance_30d?.green_percent ?? 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. TOPSHIRIQLAR (Tasks) */}
        <TabsContent value="tasks" className="space-y-4 m-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Topshiriqlar ijrosi va baholash</CardTitle>
                  <CardDescription className="text-xs">
                    4+2 dasturi asosida berilgan vazifalar va hisobotlar holati
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link to="/admin/task-templates">Topshiriq shablonlari</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <span className="text-xs text-muted-foreground">Jami berilgan vazifalar</span>
                  <div className="mt-1 text-2xl font-black">{stats?.tasks?.total ?? 0}</div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Kutilayotgan ishlar</span>
                  <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {stats?.pending_reviews?.total ?? 0}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Qabul qilingan</span>
                  <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats?.tasks?.by_status?.approved ?? 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. RAHBARLAR (Supervisors) */}
        <TabsContent value="supervisors" className="space-y-4 m-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Rahbarlar monitoringi va yuklamasi</CardTitle>
                  <CardDescription className="text-xs">
                    Amaliyot rahbarlarining biriktirilgan talabalar soni va sig'im darajasi
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link to="/admin/supervisors">Rahbarlar ro'yxati</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Tizimda jami <b>{stats?.supervisors ?? 0} nafar</b> amaliyot rahbari faoliyat ko'rsatmoqda.
              </div>

              {stats?.capacity_alerts?.filter((a) => a.kind === "supervisor").length ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-500">Yuklamasi 80% dan oshgan rahbarlar:</span>
                  {stats.capacity_alerts
                    .filter((a) => a.kind === "supervisor")
                    .map((sup) => (
                      <div
                        key={sup.id}
                        className="flex items-center justify-between rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs"
                      >
                        <span className="font-semibold">{sup.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {sup.used} / {sup.capacity} talaba
                          </span>
                          <Badge variant={sup.severity === "full" ? "destructive" : "outline"}>
                            {sup.percent}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-500 py-3">
                  Barcha rahbarlarning talaba yuklamasi me'yorda va sig'im limitidan oshmagan.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. OBYEKTLAR (Objects) */}
        <TabsContent value="objects" className="space-y-4 m-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Amaliyot obyektlari va tashkilotlar sig'imi</CardTitle>
                  <CardDescription className="text-xs">
                    Maktab, MTT va korxonalarning qabul qilish quvvati va talabalar bandligi
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link to="/admin/objects">Obyektlar katalogi</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Jami tasdiqlangan hamkor tashkilotlar soni: <b>{stats?.organizations ?? 0} ta</b>
              </div>

              {stats?.capacity_alerts?.filter((a) => a.kind === "organization").length ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-500">Sig'imi to'lib borayotgan obyektlar:</span>
                  {stats.capacity_alerts
                    .filter((a) => a.kind === "organization")
                    .map((org) => (
                      <div
                        key={org.id}
                        className="flex items-center justify-between rounded-md border border-border p-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-semibold">{org.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {org.used} / {org.capacity} o'rin
                          </span>
                          <Badge variant={org.severity === "full" ? "destructive" : "secondary"}>
                            {org.percent}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-500 py-3">Obyektlar sig'imida ortiqcha to'lib ketish kuzatilmadi.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. MUAMMOLAR (Issues & Bottlenecks) */}
        <TabsContent value="issues" className="space-y-4 m-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Diqqat talab muammolar va to'siqlar
              </CardTitle>
              <CardDescription className="text-xs">
                To'lib ketgan obyektlar, kutilayotgan tekshiruvlar va tasdiqlanmagan shartnomalar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {issuesList.length > 0 ? (
                issuesList.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-3.5 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={issue.severity === "high" ? "destructive" : "outline"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {issue.severity === "high" ? "Yuqori" : "O'rta"}
                        </Badge>
                        <span className="font-bold text-sm text-foreground">{issue.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.description}</p>
                    </div>
                    <Button asChild size="sm" variant="secondary" className="shrink-0 text-xs">
                      <Link to={issue.actionUrl}>{issue.actionText}</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="Barchasi joyida!"
                  description="Hozirgi vaqtda tizimda kritik muammo yoki to'siqlar aniqlanmadi."
                  compact
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. XARITA (Map) */}
        <TabsContent value="map" className="space-y-4 m-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    Amaliyot obyektlari xaritasi
                  </CardTitle>
                  <CardDescription className="text-xs">
                    GPS koordinatasi kiritilgan maktablar, muassasalar va hududlarning xaritadagi joylashuvi
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {geoOrganizations.length} ta joylashuv
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[480px] w-full rounded-xl overflow-hidden border border-border">
                <MapContainer
                  center={[DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
                  zoom={DEFAULT_MAP_ZOOM}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {geoOrganizations.map((org) => (
                    <Marker key={org.id} position={[Number(org.geo_lat), Number(org.geo_lng)]}>
                      <Popup>
                        <div className="p-1 space-y-1">
                          <b className="font-bold text-sm block">{org.name}</b>
                          <div className="text-xs text-slate-600">{org.address_line || org.region}</div>
                          <div className="text-xs font-semibold text-indigo-600">
                            Sig'im: {org.capacity} talaba
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {geoOrganizations.length === 0 && (
                <p className="text-xs text-amber-500 text-center py-2">
                  Hozircha obyektlarning GPS koordinatalari kiritilmagan. Obyektlar bo'limida koordinatalarni qo'shing.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 9. TAHLIL (Analytics & Export) */}
        <TabsContent value="analytics" className="space-y-4 m-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Akademik va institutsional tahlil</CardTitle>
              <CardDescription className="text-xs">
                O'quv yillari, semestrlar va yo'nalishlar bo'yicha yakuniy statistik tahlil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/70 p-4 space-y-3 bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Rasmiy tahliliy hisobot (PDF)</h3>
                    <p className="text-xs text-muted-foreground">
                      Chirchiq davlat pedagogika universiteti amaliyot platformasi bo'yicha to'liq statistik ma'lumotnoma
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={handleDownloadPdf} disabled={downloadingPdf} className="gap-2 text-xs font-bold">
                    <Download className="h-4 w-4" />
                    {downloadingPdf ? "Hujjat shakllanmoqda..." : "Statistika hisoboti (PDF)"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
