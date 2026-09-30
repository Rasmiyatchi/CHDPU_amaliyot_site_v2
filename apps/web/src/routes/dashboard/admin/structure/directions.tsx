import { Building, Compass, GraduationCap, Layers, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DirectionFormDialog } from "@/components/admin/academic/direction-form-dialog";
import { DirectionList } from "@/components/admin/academic/direction-list";
import { Button } from "@/components/ui/button";
import { useDirections, useFaculties } from "@/lib/api/academic";

export function DirectionsPage() {
  const { t } = useTranslation();
  const { data: faculties } = useFaculties(1, 200);
  const { data: directions } = useDirections(undefined, 1, 200);
  const [creating, setCreating] = useState(false);

  const stats = useMemo(() => ({
    faculties: faculties?.total ?? 0,
    directions: directions?.total ?? 0,
  }), [faculties, directions]);

  return (
    <div className="container max-w-6xl py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Compass className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("adminAcademic.tabs.directions")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("academicDirectionList.emptyHint")}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("academicDirectionList.newDirection")}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
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
              <GraduationCap className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("adminAcademic.tabs.directions")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.directions}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/admin/structure/faculties">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Building className="h-3.5 w-3.5" />
              {t("adminAcademic.tabs.faculties")} →
            </Button>
          </Link>
          <Link to="/admin/structure/groups">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5" />
              {t("adminAcademic.tabs.groups")} →
            </Button>
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4">
          <DirectionList />
        </div>
      </div>

      <DirectionFormDialog
        open={creating}
        existing={null}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
