import { Building, GraduationCap, Layers, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DepartmentFormDialog } from "@/components/admin/academic/department-form-dialog";
import { DepartmentList } from "@/components/admin/academic/department-list";
import { Button } from "@/components/ui/button";
import { useDepartments, useFaculties } from "@/lib/api/academic";

export function DepartmentsPage() {
  const { t } = useTranslation();
  const { data: faculties } = useFaculties(1, 200);
  const { data: allDepts } = useDepartments(undefined, 1, 200);
  const [creating, setCreating] = useState(false);

  const statsCards = useMemo(() => [
    {
      label: t("adminAcademic.tabs.faculties"),
      value: faculties?.total ?? 0,
      icon: Building,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("adminAcademic.tabs.departments"),
      value: allDepts?.total ?? 0,
      icon: Layers,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ], [faculties, allDepts, t]);

  return (
    <div className="container max-w-6xl py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
              <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("adminAcademic.tabs.departments")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("academicDepartmentList.emptyDescription")}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("academicDepartmentList.newDepartment")}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {statsCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/admin/structure/faculties">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Building className="h-3.5 w-3.5" />
              {t("adminAcademic.tabs.faculties")} →
            </Button>
          </Link>
          <Link to="/admin/structure/directions">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <GraduationCap className="h-3.5 w-3.5" />
              {t("adminAcademic.tabs.directions")} →
            </Button>
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4">
          <DepartmentList />
        </div>
      </div>

      <DepartmentFormDialog
        open={creating}
        existing={null}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
