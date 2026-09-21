import { HTTPError } from "ky";
import { FileText, Loader2, Sparkles, Users, UserCheck, Building2, UserPlus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectEmpty } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAcademicYears, useGroups } from "@/lib/api/academic";
import { useAssignments } from "@/lib/api/assignments";
import { useContractTemplates } from "@/lib/api/contract-templates";
import { useCreateContract } from "@/lib/api/contracts";
import { useOrganizations } from "@/lib/api/organizations";
import { usePracticeTypes } from "@/lib/api/practice-types";
import { useStudents } from "@/lib/api/students";
import type { ContractTemplate, Student, UUID } from "@/lib/api/types";

const FALLBACK_TEMPLATES: { value: ContractTemplate; labelKey: string }[] = [
  { value: "4_plus_2", labelKey: "contractsContractFormDialog.templates.fourPlusTwo" },
  { value: "pedagogical", labelKey: "contractsContractFormDialog.templates.pedagogical" },
  { value: "qualifying", labelKey: "contractsContractFormDialog.templates.qualifying" },
  { value: "internship_production", labelKey: "contractsContractFormDialog.templates.production" },
  { value: "partnership", labelKey: "contractsContractFormDialog.templates.partnership" },
];

type Props = { open: boolean; onClose: () => void };

export function ContractFormDialog({ open, onClose }: Props) {
  const { t } = useTranslation();
  const create = useCreateContract();
  const contractTemplates = useContractTemplates();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templateRef, setTemplateRef] = useState<ContractTemplate>("4_plus_2");
  const [organizationId, setOrganizationId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [practiceTypeId, setPracticeTypeId] = useState("");
  const [bindingMode, setBindingMode] = useState<"assignments" | "students" | "groups" | "general">("assignments");
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<Set<string>>(new Set());
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Student Live Search state
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedStudentsMap, setSelectedStudentsMap] = useState<
    Map<string, { id: string; name: string; hemis_id: string; group?: string }>
  >(new Map());

  const organizations = useOrganizations({ is_active: true }, 1, 100);
  const academicYears = useAcademicYears();
  const practiceTypes = usePracticeTypes();
  const groupsQuery = useGroups({ academicYearId: academicYearId || undefined }, 1, 100);
  const studentsQuery = useStudents({ search: studentSearch.trim() || undefined }, 1, 50);

  // Active templates list
  const activeTemplates = useMemo(() => {
    if (!contractTemplates.data) return [];
    return contractTemplates.data.filter((t) => t.status === "active");
  }, [contractTemplates.data]);

  // Set default template when modal opens
  useEffect(() => {
    if (open) {
      if (activeTemplates.length > 0 && !selectedTemplateId) {
        const firstTpl = activeTemplates[0];
        if (firstTpl) {
          setSelectedTemplateId(firstTpl.id);
          if (firstTpl.practice_type_id) {
            setPracticeTypeId(firstTpl.practice_type_id);
          }
        }
      }
    }
  }, [open, activeTemplates, selectedTemplateId]);

  // Aktiv AY avtomatik
  useEffect(() => {
    if (open && !academicYearId && academicYears.data?.length) {
      const active = academicYears.data.find((ay) => ay.is_active);
      if (active) setAcademicYearId(active.id);
    }
  }, [open, academicYears.data, academicYearId]);

  // Currently selected template object
  const currentTemplate = useMemo(() => {
    return (contractTemplates.data ?? []).find((t) => t.id === selectedTemplateId);
  }, [contractTemplates.data, selectedTemplateId]);

  // Custom student input variables for current template
  const customVariables = useMemo(() => {
    if (!currentTemplate) return [];
    const vars = (currentTemplate as unknown as { variables?: Array<{ key: string; label: string; source: string }> }).variables;
    if (Array.isArray(vars)) {
      return vars.filter((v) => v.source === "student_input");
    }
    return [];
  }, [currentTemplate]);

  // Filter bo'yicha matching assignmentlar
  const assignmentFilters = useMemo(
    () => ({
      organization_id: organizationId || undefined,
      practice_type_id: practiceTypeId || undefined,
      academic_year_id: academicYearId || undefined,
    }),
    [organizationId, practiceTypeId, academicYearId],
  );
  const assignments = useAssignments(assignmentFilters, 1, 100);
  const canShowAssignments = !!organizationId && !!practiceTypeId && !!academicYearId;

  const handleTemplateChange = (val: string) => {
    setSelectedTemplateId(val);
    const found = (contractTemplates.data ?? []).find((t) => t.id === val);
    if (found?.practice_type_id) {
      setPracticeTypeId(found.practice_type_id);
    }
  };

  const resetAll = () => {
    setSelectedTemplateId("");
    setTemplateRef("4_plus_2");
    setOrganizationId("");
    setPracticeTypeId("");
    setBindingMode("assignments");
    setSelectedAssignmentIds(new Set());
    setSelectedGroupIds(new Set());
    setStudentSearch("");
    setSelectedStudentIds(new Set());
    setSelectedStudentsMap(new Map());
    setStartDate("");
    setEndDate("");
    setNotes("");
    setVariableValues({});
    create.reset();
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const toggleAssignment = (id: string) => {
    const next = new Set(selectedAssignmentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAssignmentIds(next);
  };

  const selectAllAssignments = () => {
    setSelectedAssignmentIds(new Set((assignments.data?.items ?? []).map((a) => a.id)));
  };

  const toggleGroup = (id: string) => {
    const next = new Set(selectedGroupIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGroupIds(next);
  };

  const toggleStudent = (st: Student) => {
    const nextIds = new Set(selectedStudentIds);
    const nextMap = new Map(selectedStudentsMap);
    if (nextIds.has(st.id)) {
      nextIds.delete(st.id);
      nextMap.delete(st.id);
    } else {
      nextIds.add(st.id);
      nextMap.set(st.id, {
        id: st.id,
        name: st.full_name,
        hemis_id: st.hemis_id,
        group: st.group_name ?? undefined,
      });
    }
    setSelectedStudentIds(nextIds);
    setSelectedStudentsMap(nextMap);
  };

  const selectAllStudentsOnPage = () => {
    const items = studentsQuery.data?.items ?? [];
    const nextIds = new Set(selectedStudentIds);
    const nextMap = new Map(selectedStudentsMap);
    items.forEach((st) => {
      nextIds.add(st.id);
      nextMap.set(st.id, {
        id: st.id,
        name: st.full_name,
        hemis_id: st.hemis_id,
        group: st.group_name ?? undefined,
      });
    });
    setSelectedStudentIds(nextIds);
    setSelectedStudentsMap(nextMap);
  };

  const removeStudent = (id: string) => {
    const nextIds = new Set(selectedStudentIds);
    const nextMap = new Map(selectedStudentsMap);
    nextIds.delete(id);
    nextMap.delete(id);
    setSelectedStudentIds(nextIds);
    setSelectedStudentsMap(nextMap);
  };

  // Submission validation: Assignment selected is NO LONGER mandatory!
  const canSubmit =
    (!!selectedTemplateId || !!templateRef) &&
    !!organizationId &&
    !!academicYearId &&
    !!practiceTypeId &&
    !!startDate &&
    !!endDate;

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({
        contract_template_id: (selectedTemplateId as UUID) || null,
        template_ref: templateRef,
        organization_id: organizationId as UUID,
        academic_year_id: academicYearId as UUID,
        practice_type_id: practiceTypeId as UUID,
        assignment_ids: bindingMode === "assignments" ? (Array.from(selectedAssignmentIds) as UUID[]) : [],
        student_ids: bindingMode === "students" ? (Array.from(selectedStudentIds) as UUID[]) : [],
        group_ids: bindingMode === "groups" ? (Array.from(selectedGroupIds) as UUID[]) : [],
        start_date: startDate,
        end_date: endDate,
        notes: notes || null,
        variable_values: Object.keys(variableValues).length > 0 ? variableValues : null,
      });
      toast.success(t("contractsContractFormDialog.createdToast"));
      handleClose();
    } catch (e) {
      toast.error(e instanceof HTTPError ? e.message : t("common.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t("contractsContractFormDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("contractsContractFormDialog.subtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template + AY */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1.5">
                <span>{t("contractsContractFormDialog.templateLabel")} *</span>
                {activeTemplates.length > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                    <Sparkles className="mr-1 h-3 w-3 text-amber-500" />
                    {activeTemplates.length} ta faol shablon
                  </Badge>
                )}
              </Label>
              <Select
                value={selectedTemplateId || (activeTemplates[0]?.id ?? templateRef)}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Shablonni tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {contractTemplates.isLoading ? (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      Shablonlar yuklanmoqda...
                    </div>
                  ) : activeTemplates.length > 0 ? (
                    activeTemplates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </SelectItem>
                    ))
                  ) : (
                    FALLBACK_TEMPLATES.map((tpl) => (
                      <SelectItem key={tpl.value} value={tpl.value}>
                        {t(tpl.labelKey)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("common.academicYear")} *</Label>
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("contractsContractFormDialog.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {(academicYears.data ?? []).length === 0 ? (
                    <SelectEmpty message={t("contractsContractFormDialog.noAcademicYears")} />
                  ) : (
                    (academicYears.data ?? []).map((ay) => (
                      <SelectItem key={ay.id} value={ay.id}>
                        {ay.name} {ay.is_active && t("common.activeSuffix").trim()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Organization + Practice type */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>{t("common.organization")} *</Label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("contractsContractFormDialog.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {(organizations.data?.items ?? []).length === 0 ? (
                    <SelectEmpty message={t("contractsContractFormDialog.noOrganizations")} />
                  ) : (
                    (organizations.data?.items ?? []).map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("common.practiceType")} *</Label>
              <Select value={practiceTypeId} onValueChange={setPracticeTypeId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("contractsContractFormDialog.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {(practiceTypes.data ?? []).map((pt) => (
                    <SelectItem key={pt.id} value={pt.id}>
                      {pt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dinamik maydonlar */}
          {customVariables.length > 0 && (
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shablon parametrlarini to'ldirish
              </Label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {customVariables.map((v) => (
                  <div key={v.key}>
                    <Label className="text-xs">{v.label}</Label>
                    <Input
                      placeholder={v.label}
                      value={variableValues[v.key] ?? ""}
                      onChange={(e) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          [v.key]: e.target.value,
                        }))
                      }
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Flexible Student/Group/Assignment Binding Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Shartnoma biriktirish obyektlari (Ixtiyoriy)</Label>
            </div>

            <Tabs value={bindingMode} onValueChange={(v) => setBindingMode(v as typeof bindingMode)}>
              <TabsList className="grid w-full grid-cols-4 text-xs">
                <TabsTrigger value="assignments" className="flex items-center gap-1 text-[11px] px-1">
                  <UserCheck className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Biriktirishlar bo'yicha</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-1 text-[11px] px-1">
                  <UserPlus className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate font-medium">Talabalar bo'yicha</span>
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex items-center gap-1 text-[11px] px-1">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Guruhlar bo'yicha</span>
                </TabsTrigger>
                <TabsTrigger value="general" className="flex items-center gap-1 text-[11px] px-1">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Umumiy shartnoma</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assignments" className="pt-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Mavjud amaliyot biriktirishlari:</span>
                  {canShowAssignments && (assignments.data?.items ?? []).length > 0 && (
                    <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={selectAllAssignments}>
                      {t("contractsContractFormDialog.selectAllWithCount", {
                        n: assignments.data?.items.length,
                      })}
                    </Button>
                  )}
                </div>

                {!canShowAssignments ? (
                  <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    Shartnoma tuzish uchun parametrlar tanlandi. Xohlasangiz biriktirishlarni tanlang yoki to'g'ridan-to'g'ri shartnoma tuzing.
                  </div>
                ) : (
                  <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                    {(assignments.data?.items ?? []).length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        Ushbu tashkilot uchun hali amaliyot biriktirishlari mavjud emas. Shartnomani baribir yaratishingiz mumkin.
                      </div>
                    ) : (
                      (assignments.data?.items ?? []).map((a) => (
                        <label
                          key={a.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAssignmentIds.has(a.id)}
                            onChange={() => toggleAssignment(a.id)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="flex-1 truncate font-medium">{a.student_full_name}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {a.student_hemis_id} · {a.student_group_name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}
                {selectedAssignmentIds.size > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Trans
                      i18nKey="contractsContractFormDialog.selectedCount"
                      values={{ n: selectedAssignmentIds.size }}
                      components={[<strong key="0" />]}
                    />
                  </p>
                )}
              </TabsContent>

              <TabsContent value="students" className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Talabalarni Live Search orqali qidirib tanlang:
                  </span>
                  {(studentsQuery.data?.items ?? []).length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={selectAllStudentsOnPage}
                    >
                      {t("contractsContractFormDialog.selectAllWithCount", {
                        n: studentsQuery.data?.items.length,
                      })}
                    </Button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Talaba F.I.SH yoki HEMIS ID orqali qidirish..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="h-8 pl-8 pr-8 text-xs"
                  />
                  {studentSearch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStudentSearch("")}
                      className="absolute right-1 top-1 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Selected Students Badges */}
                {selectedStudentIds.size > 0 && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-primary">
                      <span>Tanlangan talabalar ({selectedStudentIds.size} ta):</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStudentIds(new Set());
                          setSelectedStudentsMap(new Map());
                        }}
                        className="h-5 px-1 text-[10px] text-destructive hover:bg-destructive/10"
                      >
                        Tozalash
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {Array.from(selectedStudentsMap.values()).map((st) => (
                        <Badge
                          key={st.id}
                          variant="secondary"
                          className="flex items-center gap-1 text-[11px] py-0.5 px-2 bg-background border font-normal"
                        >
                          <span>{st.name}</span>
                          <span className="text-[10px] text-muted-foreground">({st.hemis_id})</span>
                          <button
                            type="button"
                            onClick={() => removeStudent(st.id)}
                            className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {studentsQuery.isLoading ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      <Loader2 className="mx-auto h-4 w-4 animate-spin mb-1" />
                      Talabalar yuklanmoqda...
                    </div>
                  ) : (studentsQuery.data?.items ?? []).length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      {studentSearch
                        ? "Qidiruv bo'yicha hech qanday talaba topilmadi"
                        : "Talabalar ro'yxati bo'sh"}
                    </div>
                  ) : (
                    (studentsQuery.data?.items ?? []).map((st) => (
                      <label
                        key={st.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.has(st.id)}
                          onChange={() => toggleStudent(st)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground truncate block">
                            {st.full_name}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate block">
                            HEMIS: {st.hemis_id} · {st.group_name || "Guruhsiz"}
                            {st.course ? ` · ${st.course}-kurs` : ""}
                            {st.direction_code ? ` · ${st.direction_code}` : ""}
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="groups" className="pt-2">
                <div className="mb-1.5 text-xs text-muted-foreground">
                  Shartnomani bevosita guruhlarga biriktirish (hali amaliyot biriktirilmagan talabalar uchun):
                </div>
                <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {(groupsQuery.data?.items ?? []).length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      Guruhlar topilmadi
                    </div>
                  ) : (
                    (groupsQuery.data?.items ?? []).map((g) => (
                      <label
                        key={g.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.has(g.id)}
                          onChange={() => toggleGroup(g.id)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="flex-1 truncate font-medium">{g.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {g.course}-kurs
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {selectedGroupIds.size > 0 && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    {selectedGroupIds.size} ta guruh tanlandi
                  </p>
                )}
              </TabsContent>

              <TabsContent value="general" className="pt-2">
                <Alert className="bg-primary/5 border-primary/20">
                  <Building2 className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-xs font-semibold">Tashkilot uchun umumiy shartnoma</AlertTitle>
                  <AlertDescription className="text-xs">
                    Shartnoma alohida talabalarsiz/biriktirishlarsiz tashkilot darajasida tuziladi. Talabalar keyinroq ham biriktirilishi mumkin.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="s">{t("contractsContractFormDialog.startDateLabel")} *</Label>
              <Input
                id="s"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="e">{t("contractsContractFormDialog.endDateLabel")} *</Label>
              <Input
                id="e"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="n">{t("common.note")}</Label>
            <Input
              id="n"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5"
              placeholder={t("contractsContractFormDialog.optionalPlaceholder")}
            />
          </div>

          {create.isError && (
            <Alert variant="destructive">
              <AlertTitle>{t("common.error")}</AlertTitle>
              <AlertDescription>
                {(create.error as Error).message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={create.isPending}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || create.isPending}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("contractsContractFormDialog.create")}{" "}
            {bindingMode === "assignments" && selectedAssignmentIds.size > 0 && (
              <span className="ml-1 opacity-80">({selectedAssignmentIds.size})</span>
            )}
            {bindingMode === "students" && selectedStudentIds.size > 0 && (
              <span className="ml-1 opacity-80">({selectedStudentIds.size} talaba)</span>
            )}
            {bindingMode === "groups" && selectedGroupIds.size > 0 && (
              <span className="ml-1 opacity-80">({selectedGroupIds.size} guruh)</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
