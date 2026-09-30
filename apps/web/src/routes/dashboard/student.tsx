import { CalendarDays, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AttendanceStatusBadge } from "@/components/admin/attendance/attendance-status-badge";
import { ArchiveCard } from "@/components/archive-card";
import { AttendanceCalendarCard } from "@/components/student/attendance-calendar-card";
import { StudentAcademicPanel } from "@/components/student/academic-panel";
import { StudentApplicationCard } from "@/components/student/application-card";
import { CheckInButton } from "@/components/student/check-in-button";
import { StudentDocumentsCard } from "@/components/student/documents-card";
import { FinalReportCard } from "@/components/student/final-report-card";
import { StudentInquiryCard } from "@/components/student/inquiry-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { dateLocale } from "@/i18n";
import { useTodayStatus } from "@/lib/api/attendance";
import { useMyAssignments } from "@/lib/api/assignments";
import { useAuthStore } from "@/stores/auth";

export function StudentDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: assignments, isPending: assignmentsPending } = useMyAssignments();

  // Hozircha 1-assignmentga fokus (active'lardan)
  const activeAssignment =
    assignments?.find((a) => a.status === "active" || a.status === "draft") ?? null;

  const { data: today } = useTodayStatus(activeAssignment?.id ?? null);

  const progressPercent = activeAssignment
    ? Math.min(
        100,
        Math.max(
          10,
          Math.round(
            ((Date.now() - new Date(activeAssignment.start_date).getTime()) /
              (new Date(activeAssignment.end_date).getTime() -
                new Date(activeAssignment.start_date).getTime())) *
              100,
          ) || 35,
        ),
      )
    : 0;

  return (
    <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 overflow-x-hidden">
      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        {/* Evolve Dash Welcome Banner */}
        <section className="dash-welcome">
          <div>
            <span>4+2 PEDAGOGIK AMALIYOT</span>
            <h2>{t("student.welcome", { name: user?.first_name })}</h2>
            <p>
              {activeAssignment
                ? `${activeAssignment.practice_type_name} · ${
                    activeAssignment.organization_name ??
                    activeAssignment.area_name
                  }`
                : t("student.notAssigned")}
            </p>
          </div>
          <div className="progress-score">
            <strong>
              {activeAssignment ? progressPercent : 0}
              <small>%</small>
            </strong>
            <span>{activeAssignment ? "JARAYONDA" : "BOSQICHDA"}</span>
          </div>
        </section>
        <div className="dash-progress mb-6 rounded-full overflow-hidden">
          <i style={{ width: `${activeAssignment ? progressPercent : 0}%` }} />
        </div>

        {activeAssignment && (
          <article className="dash-card status-card">
            <div className="card-title">
              <div>
                <span>AMALIYOT HOLATI</span>
                <h3>Joriy bosqich</h3>
              </div>
              <GraduationCap className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="status-steps">
              <div className="complete">
                <i><CheckCircle2 className="h-4 w-4" /></i>
                <span>Profil<h4>Tasdiqlangan</h4></span>
              </div>
              <div className="complete">
                <i><CheckCircle2 className="h-4 w-4" /></i>
                <span>Amaliyot joyi<h4>{activeAssignment.organization_name ?? activeAssignment.area_name ?? "Taqsimlangan"}</h4></span>
              </div>
              <div className="current">
                <i>03</i>
                <span>Topshiriqlar<h4>Jarayonda</h4></span>
              </div>
              <div>
                <i>04</i>
                <span>Natija<h4>Kutilmoqda</h4></span>
              </div>
            </div>
          </article>
        )}

        {assignmentsPending && (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!assignmentsPending && !activeAssignment && (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={CalendarDays}
                title={t("student.emptyTitle")}
                description={t("student.emptyDescription")}
              />
            </CardContent>
          </Card>
        )}

        {activeAssignment && (
          <>
            {/* Bugungi davomat (Check-in / Check-out) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("student.todayAttendance")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CheckInButton assignmentId={activeAssignment.id} today={today} />
                {today && (
                  <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{t("common.status")}:</span>
                    <AttendanceStatusBadge status={today.status} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* To'liq davomat va Taqvim (Kalendar + Statistika + Ro'yxat) */}
            <AttendanceCalendarCard assignment={activeAssignment} />

            {/* Amaliyot muddati */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("student.practicePeriod")}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">{t("student.startDate")}</div>
                  <div>{new Date(activeAssignment.start_date).toLocaleDateString(dateLocale())}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("student.endDate")}</div>
                  <div>{new Date(activeAssignment.end_date).toLocaleDateString(dateLocale())}</div>
                </div>
                {activeAssignment.supervisor_full_name && (
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">{t("student.supervisorLabel")}</div>
                    <div>{activeAssignment.supervisor_full_name}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic panel — tasks/journal/analyses */}
            <StudentAcademicPanel assignmentId={activeAssignment.id} />

            {/* Hujjatlarim — barcha attachments */}
            <StudentDocumentsCard assignmentId={activeAssignment.id} />

            {/* Yakuniy hisobot — arxivga yo'l */}
            <FinalReportCard assignmentId={activeAssignment.id} />

            {/* Yig'ma jild */}
            <ArchiveCard assignmentId={activeAssignment.id} />
          </>
        )}

        {/* Amaliyot arizalari — biriktirishdan mustaqil, har doim ko'rinadi */}
        <StudentApplicationCard />

        {/* Adminga murojaat (chat) */}
        <StudentInquiryCard />
      </div>
    </main>
  );
}
