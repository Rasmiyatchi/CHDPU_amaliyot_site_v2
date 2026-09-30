import { Building, GraduationCap, Layers, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { FacultyFormDialog } from "@/components/admin/academic/faculty-form-dialog";
import { FacultyList } from "@/components/admin/academic/faculty-list";
import { Button } from "@/components/ui/button";
import { useDepartments, useDirections, useFaculties } from "@/lib/api/academic";

export function FacultiesPage() {
  const { t } = useTranslation();
  const { data: faculties } = useFaculties(1, 200);
  const { data: departments } = useDepartments(undefined, 1, 200);
  const { data: directions } = useDirections(undefined, 1, 200);
  const [creating, setCreating] = useState(false);

  const stats = useMemo(() => ({
    faculties: faculties?.total ?? 0,
    departments: departments?.total ?? 0,
    directions: directions?.total ?? 0,
  }), [faculties, departments, directions]);

  return (
    <div className="container max-w-6xl py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
              <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("adminAcademic.tabs.faculties")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("academicFacultyList.emptyDescription")}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("academicFacultyList.newFaculty")}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("adminAcademic.tabs.faculties")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.faculties}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Layers className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("adminAcademic.tabs.departments")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.departments}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <GraduationCap className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("adminAcademic.tabs.directions")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.directions}</p>
          </div>
        </div>

        {/* Quick nav to related pages */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/admin/structure/departments">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5" />
              {t("adminAcademic.tabs.departments")} →
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

      {/* Faculty List (reuse existing component without the button since we added it above) */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4">
          <FacultyList />
        </div>
      </div>

      <FacultyFormDialog
        open={creating}
        existing={null}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
