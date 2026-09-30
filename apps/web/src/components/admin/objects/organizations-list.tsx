import {
  Download,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { OrganizationDetailDialog } from "@/components/admin/objects/organization-detail-dialog";
import { OrganizationFormDialog } from "@/components/admin/objects/organization-form-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadOrganizationsExport } from "@/lib/api/exports";
import {
  useDeleteOrganization,
  useOrganizations,
} from "@/lib/api/organizations";
import type { Organization, OrganizationKind } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ALL = "__all__";

const KINDS: OrganizationKind[] = [
  "school",
  "mtt",
  "lyceum",
  "college",
  "university",
  "state_organization",
  "private_organization",
  "company",
  "other",
];

const KIND_LABEL_KEY: Record<OrganizationKind, string> = {
  school: "objectsOrganizationsList.kinds.school",
  mtt: "objectsOrganizationsList.kinds.mtt",
  lyceum: "objectsOrganizationsList.kinds.lyceum",
  college: "objectsOrganizationsList.kinds.college",
  university: "objectsOrganizationsList.kinds.university",
  state_organization: "objectsOrganizationsList.kinds.state_organization",
  private_organization: "objectsOrganizationsList.kinds.private_organization",
  company: "objectsOrganizationsList.kinds.company",
  other: "objectsOrganizationsList.kinds.other",
};

const KIND_SHORT_LABEL: Record<OrganizationKind, string> = {
  school: "Maktab",
  mtt: "MTT",
  lyceum: "Litsey",
  college: "Kollej",
  university: "OTM",
  state_organization: "Davlat tashk.",
  private_organization: "Xususiy tashk.",
  company: "Korxona",
  other: "Boshqa",
};

const KIND_BADGE_STYLE: Record<OrganizationKind, string> = {
  school: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  mtt: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  lyceum: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  college: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  university: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  state_organization: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  private_organization: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  company: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  other: "bg-muted text-muted-foreground border-border",
};

export function OrganizationsList() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [regionInput, setRegionInput] = useState("");
  const [kind, setKind] = useState<OrganizationKind | undefined>(undefined);
  const [exporting, setExporting] = useState(false);

  // Overview stats of all organizations in system
  const { data: allOrgsData } = useOrganizations({}, 1, 200);

  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    if (allOrgsData?.items) {
      for (const org of allOrgsData.items) {
        counts[org.kind] = (counts[org.kind] || 0) + 1;
      }
    }
    return counts;
  }, [allOrgsData?.items]);

  const search = useDebounce(searchInput, 300);
  const region = useDebounce(regionInput, 300);
  const { data, isPending, error } = useOrganizations({
    search: search || undefined,
    region: region || undefined,
    kind,
  }, 1, 100);

  const del = useDeleteOrganization();
  const [selected, setSelected] = useState<Organization | null>(null);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [creating, setCreating] = useState(false);

  const hasActiveFilters = Boolean(searchInput || regionInput || kind !== undefined);

  const handleClearFilters = () => {
    setSearchInput("");
    setRegionInput("");
    setKind(undefined);
  };

  const handleDelete = async (org: Organization) => {
    if (!confirm(t("objectsOrganizationsList.deleteConfirm", { name: org.name }))) return;
    try {
      await del.mutateAsync(org.id);
      toast.success(t("common.deleted"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadOrganizationsExport({
        search: search || undefined,
        region: region || undefined,
        kind,
      });
      toast.success("Excel fayl yuklab olindi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Turlar statistikasi va tezkor filtr badge'lari */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setKind(undefined)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border",
            kind === undefined
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card hover:bg-muted/70 text-muted-foreground hover:text-foreground border-border/80"
          )}
        >
          <span>{t("objectsOrganizationsList.allKinds")}</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
              kind === undefined
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {allOrgsData?.total ?? 0}
          </span>
        </button>

        {KINDS.map((k) => {
          const count = typeStats[k] || 0;
          const isSelected = kind === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setKind(isSelected ? undefined : k)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card hover:bg-muted/70 text-muted-foreground hover:text-foreground border-border/80"
              )}
            >
              <span>{KIND_SHORT_LABEL[k]}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : count > 0
                    ? "bg-primary/10 text-primary font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Filtrlar va harakatlar qatori */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] max-w-[260px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("objectsOrganizationsList.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 pr-7 text-xs sm:text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative min-w-[170px] max-w-[220px]">
          <MapPin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("objectsOrganizationsList.regionPlaceholder")}
            value={regionInput}
            onChange={(e) => setRegionInput(e.target.value)}
            className="pl-8 pr-7 text-xs sm:text-sm"
          />
          {regionInput && (
            <button
              type="button"
              onClick={() => setRegionInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select
          value={kind ?? ALL}
          onValueChange={(v) => setKind(v === ALL ? undefined : (v as OrganizationKind))}
        >
          <SelectTrigger className="w-[180px] sm:w-[220px] text-xs sm:text-sm">
            <SelectValue placeholder={t("objectsOrganizationsList.allKinds")} />
          </SelectTrigger>
          <SelectContent className="min-w-[240px]">
            <SelectItem value={ALL}>{t("objectsOrganizationsList.allKinds")}</SelectItem>
            {KINDS.map((k) => (
              <SelectItem key={k} value={k}>
                <div className="flex w-full items-center justify-between gap-3">
                  <span>{t(KIND_LABEL_KEY[k])}</span>
                  <span className="text-xs text-muted-foreground">({typeStats[k] || 0})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-xs sm:text-sm"
          >
            {t("common.clear")}
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || isPending}
            className="text-xs sm:text-sm gap-1.5"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>Excel yuklab olish</span>
          </Button>

          <Button onClick={() => setCreating(true)} className="text-xs sm:text-sm gap-1.5">
            <Plus className="h-4 w-4" />
            {t("objectsOrganizationsList.newOrganization")}
          </Button>
        </div>
      </div>

      {/* 3. Holatlar (Loading / Xatolik) */}
      {isPending && <TableSkeleton rows={5} columns={6} />}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* 4. Asosiy Jadval (Amaliyot turlari sahifasi uslubida) */}
      {data && (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45px]">№</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead className="w-[140px]">{t("objectsOrganizationsList.kindLabel")}</TableHead>
                <TableHead>{t("objectsOrganizationsList.columns.director")}</TableHead>
                <TableHead>{t("objectsOrganizationsList.columns.region")}</TableHead>
                <TableHead className="w-[130px]">{t("objectsOrganizationsList.columns.capacity")}</TableHead>
                <TableHead className="w-[90px]">{t("common.status")}</TableHead>
                <TableHead className="w-[120px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    {t("objectsOrganizationsList.emptyText")}
                  </TableCell>
                </TableRow>
              )}
              {data.items.map((o, idx) => (
                <TableRow
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{o.name}</div>
                    {o.legal_name && o.legal_name !== o.name ? (
                      <div className="text-xs text-muted-foreground line-clamp-1">{o.legal_name}</div>
                    ) : o.inn ? (
                      <div className="font-mono text-xs text-muted-foreground">INN: {o.inn}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium border ${KIND_BADGE_STYLE[o.kind] || ""}`}
                    >
                      {t(KIND_LABEL_KEY[o.kind])}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">{o.director_full_name}</div>
                    {o.director_position && (
                      <div className="text-xs text-muted-foreground">{o.director_position}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{o.region}</div>
                    {o.district && (
                      <div className="text-xs text-muted-foreground">{o.district}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span
                        className={
                          (o.assigned_students_count ?? 0) > 0
                            ? "font-semibold text-primary"
                            : "font-medium text-foreground"
                        }
                      >
                        {o.assigned_students_count ?? 0}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{o.capacity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {o.is_active ? (
                      <Badge variant="default" className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/20 text-xs">
                        {t("objectsOrganizationsList.activeBadge")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {t("objectsOrganizationsList.inactiveBadge")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Batafsil ko'rish"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(o);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title={t("common.edit")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(o);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title={t("common.delete")}
                        disabled={del.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(o);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 5. Modallar */}
      <OrganizationDetailDialog
        organization={selected}
        onClose={() => setSelected(null)}
        onEdit={(org) => setEditing(org)}
      />

      <OrganizationFormDialog
        open={creating || !!editing}
        existing={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}
