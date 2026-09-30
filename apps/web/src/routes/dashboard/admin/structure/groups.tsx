import { Calendar, GraduationCap, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { GroupFormDialog } from "@/components/admin/academic/group-form-dialog";
import { GroupList } from "@/components/admin/academic/group-list";
import { Button } from "@/components/ui/button";
import { useAcademicYears, useDirections, useGroups } from "@/lib/api/academic";

export function GroupsPage() {
  const { t } = useTranslation();
  const { data: groups } = useGroups({}, 1, 200);
  const { data: directions } = useDirections(undefined, 1, 200);
  const { data: academicYears } = useAcademicYears();
  const [creating, setCreating] = useState(false);

  const stats = useMemo(() => ({
    groups: groups?.total ?? 0,
    directions: directions?.total ?? 0,
    academicYears: academicYears?.length ?? 0,
  }), [groups, directions, academicYears]);

  return (
    <div className="container max-w-6xl py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("adminAcademic.tabs.groups")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("academicGroupList.emptyDescription")}
              </p>
            </div>
          </div>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("academicGroupList.newGroup")}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("adminAcademic.tabs.groups")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.groups}</p>
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
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("adminAcademic.tabs.academicYears")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.academicYears}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/admin/structure/directions">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <GraduationCap className="h-3.5 w-3.5" />
              {t("adminAcademic.tabs.directions")} →
            </Button>
          </Link>
          <Link to="/admin/structure/students">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              {t("adminAcademic.tabs.students")} →
            </Button>
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4">
          <GroupList />
        </div>
      </div>

      <GroupFormDialog
        open={creating}
        existing={null}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
