import { Calendar, CheckCircle, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { AcademicYearFormDialog } from "@/components/admin/academic/academic-year-form-dialog";
import { AcademicYearList } from "@/components/admin/academic/academic-year-list";
import { Button } from "@/components/ui/button";
import { useAcademicYears, useGroups } from "@/lib/api/academic";

export function AcademicYearsPage() {
  const { t } = useTranslation();
  const { data: academicYears } = useAcademicYears();
  const { data: groups } = useGroups({}, 1, 1);
  const [creating, setCreating] = useState(false);

  const stats = useMemo(() => {
    const activeYear = academicYears?.find((y) => y.is_active);
    return {
      total: academicYears?.length ?? 0,
      active: activeYear?.name ?? "—",
      groups: groups?.total ?? 0,
    };
  }, [academicYears, groups]);

  return (
    <div className="container max-w-6xl py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/20">
              <Calendar className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("adminAcademic.tabs.academicYears")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("academicAcademicYearList.emptyDescription")}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("academicAcademicYearList.newYear")}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-medium uppercase tracking-wide">Jami</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-wide">Aktiv yil</span>
            </div>
            <p className="text-lg font-bold truncate">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("adminAcademic.tabs.groups")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.groups}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/admin/structure/groups">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              {t("adminAcademic.tabs.groups")} →
            </Button>
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4">
          <AcademicYearList />
        </div>
      </div>

      <AcademicYearFormDialog
        open={creating}
        existing={null}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
