import { HTTPError } from "ky";
import { Check, Layers, Loader2, Save, School, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";

import { CredentialsSection } from "@/components/admin/credentials-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useFaculties } from "@/lib/api/academic";
import {
  useCreateAdmin,
  useUpdateAdmin,
  useUpdateAdminCredentials,
} from "@/lib/api/admins";
import type { Admin } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const PERMISSION_MODULES = [
  {
    id: "structure",
    name: "Akademik tuzilma",
    desc: "Fakultetlar, kafedralar, yo'nalishlar, guruhlar va talabalar boshqaruvi",
  },
  {
    id: "practice",
    name: "Amaliyot jarayonlari",
    desc: "Amaliyot turlari, talabalarni biriktirish, davomat va yakuniy baholar",
  },
  {
    id: "contracts",
    name: "Shartnomalar va arizalar",
    desc: "Talabalarning amaliyot arizalari va 3 tomonlama shartnomalarni tasdiqlash",
  },
  {
    id: "supervisors",
    name: "Rahbarlar (Supervizorlar)",
    desc: "Universitet va tashkilot rahbarlarini biriktirish va boshqarish",
  },
  {
    id: "partners",
    name: "Hamkorlar va Tashkilotlar",
    desc: "Maktablar, MTT, kasb-hunar maktablari va korxonalar bazasi",
  },
  {
    id: "monitoring",
    name: "Monitoring markazi",
    desc: "Amaliyot jarayonlarini kuzatish, xaritalar va statistik ko'rsatkichlar",
  },
  {
    id: "inquiries",
    name: "Murojaatlar",
    desc: "Talabalar va rahbarlardan kelgan murojaat va arizalar bilan ishlash",
  },
  {
    id: "system",
    name: "Tizim sozlamalari",
    desc: "Tizim konfiguratsiyasi, integratsiyalar va audit loglarini ko'rish",
  },
];

type Props = {
  open: boolean;
  existing: Admin | null;
  onClose: () => void;
};

export function AdminFormDialog({ open, existing, onClose }: Props) {
  const { t } = useTranslation();
  const create = useCreateAdmin();
  const update = useUpdateAdmin();
  const updateCreds = useUpdateAdminCredentials();
  const { data: facultiesData } = useFaculties(1, 100);
  const faculties = facultiesData?.items ?? [];

  const isEdit = !!existing;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [isActive, setIsActive] = useState(true);
  const [facultyId, setFacultyId] = useState<string>("ALL");
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (open && existing) {
      setUsername(existing.username);
      setPassword("");
      setFirstName(existing.first_name);
      setLastName(existing.last_name);
      setMiddleName(existing.middle_name ?? "");
      setEmail(existing.email ?? "");
      setPhone(existing.phone ?? "");
      setRole(existing.role);
      setIsActive(existing.is_active);
      setFacultyId(existing.faculty_id || "ALL");
      setPermissions(existing.permissions || []);
    } else if (open) {
      setUsername("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setMiddleName("");
      setEmail("");
      setPhone("");
      setRole("admin");
      setIsActive(true);
      setFacultyId("ALL");
      // Standart holatda barcha amaliy modullar tanlangan bo'ladi
      setPermissions(PERMISSION_MODULES.map((m) => m.id));
    }
  }, [open, existing]);

  const togglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const selectAllPermissions = () => {
    setPermissions(PERMISSION_MODULES.map((m) => m.id));
  };

  const clearAllPermissions = () => {
    setPermissions([]);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t("adminsAdminFormDialog.nameRequired"));
      return;
    }

    const basePayload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      middle_name: middleName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      role,
      faculty_id: role === "admin" && facultyId !== "ALL" ? facultyId : null,
      permissions: role === "admin" ? permissions : [],
    };

    try {
      if (isEdit && existing) {
        await update.mutateAsync({
          id: existing.id,
          data: { ...basePayload, is_active: isActive },
        });
        toast.success(t("common.updated"));
      } else {
        if (username.trim().length < 3 || password.length < 4) {
          toast.error(t("adminsAdminFormDialog.credentialsRequired"));
          return;
        }
        await create.mutateAsync({
          ...basePayload,
          username: username.trim(),
          password,
        });
        toast.success(t("adminsAdminFormDialog.adminCreated"));
      }
      onClose();
    } catch (e) {
      toast.error(e instanceof HTTPError ? e.message : t("common.error"));
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {isEdit
              ? t("adminsAdminFormDialog.editTitle")
              : t("adminsAdminFormDialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("adminsAdminFormDialog.editDescription")
              : t("adminsAdminFormDialog.createDescription")}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="adm-username">{t("adminsAdminFormDialog.username")} *</Label>
                <Input
                  id="adm-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                />
              </div>
              <div>
                <Label htmlFor="adm-password">{t("adminsAdminFormDialog.password")} *</Label>
                <Input
                  id="adm-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="adm-last">{t("adminsAdminFormDialog.lastName")} *</Label>
            <Input
              id="adm-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="adm-first">{t("adminsAdminFormDialog.firstName")} *</Label>
            <Input
              id="adm-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="adm-middle">{t("adminsAdminFormDialog.middleName")}</Label>
            <Input
              id="adm-middle"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="adm-email">{t("adminsAdminFormDialog.email")}</Label>
            <Input
              id="adm-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="adm-phone">{t("adminsAdminFormDialog.phone")}</Label>
            <Input
              id="adm-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="adm-role">{t("adminsAdminFormDialog.role")} *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "super_admin")}>
              <SelectTrigger id="adm-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t("adminsAdminFormDialog.roleAdmin")}</SelectItem>
                <SelectItem value="super_admin">
                  {t("adminsAdminFormDialog.roleSuperAdmin")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isEdit && (
            <div>
              <Label htmlFor="adm-active">{t("common.status")}</Label>
              <Select
                value={isActive ? "true" : "false"}
                onValueChange={(v) => setIsActive(v === "true")}
              >
                <SelectTrigger id="adm-active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t("adminsAdminFormDialog.active")}</SelectItem>
                  <SelectItem value="false">{t("adminsAdminFormDialog.blocked")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {role === "super_admin" ? (
          <Alert className="border-amber-500/20 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/20">
            <AlertDescription className="text-xs text-amber-900 dark:text-amber-200">
              <Trans
                i18nKey="adminsAdminFormDialog.superAdminWarning"
                components={[<strong key="0" />]}
              />
              <span className="block mt-1 font-medium">
                Super administrator barcha fakultetlar va modullarga cheklovsiz to'liq kirish huquqiga ega.
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Separator />

            {/* Fakultet biriktirish (Scoping) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-primary" />
                <Label htmlFor="adm-faculty" className="text-sm font-semibold">
                  Fakultet bo'yicha biriktirish (Data Scoping)
                </Label>
              </div>
              <Select value={facultyId} onValueChange={setFacultyId}>
                <SelectTrigger id="adm-faculty" className="w-full">
                  <SelectValue placeholder="Fakultetni tanlang" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="ALL">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Barcha fakultetlar (Umumiy administrator)
                    </span>
                  </SelectItem>
                  {faculties.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} {f.code ? `(${f.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {facultyId === "ALL" ? (
                  "Ushbu administrator barcha fakultet talabalari va guruhlarini ko'ra oladi."
                ) : (
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    DIQQAT: Ushbu administrator faqat tanlangan fakultetga tegishli talabalar, guruhlar va ma'lumotlarni ko'ra oladi va boshqaradi.
                  </span>
                )}
              </p>
            </div>

            <Separator />

            {/* Funksional ruxsatlar (Permissions) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">
                    Funksional ruxsatlar (Modul darajasida)
                  </Label>
                  <Badge variant="secondary" className="text-[11px] font-mono">
                    {permissions.length} / {PERMISSION_MODULES.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={selectAllPermissions}
                  >
                    Barchasini tanlash
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={clearAllPermissions}
                  >
                    Tozalash
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {PERMISSION_MODULES.map((mod) => {
                  const checked = permissions.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => togglePermission(mod.id)}
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-all",
                        checked
                          ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-xs"
                          : "border-border/60 hover:border-border hover:bg-muted/40",
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {checked ? (
                          <div className="flex h-4 w-4 items-center justify-center rounded bg-primary text-primary-foreground">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded border border-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-foreground">
                          {mod.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                          {mod.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {permissions.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Ogohlantirish: Hech qanday ruxsat belgilanmadi. Admin faqat boshqaruv panelining bosh sahifasini ko'ra oladi.
                </p>
              )}
            </div>
          </>
        )}

        {isEdit && existing && (
          <>
            <Separator />
            <CredentialsSection
              currentUsername={existing.username}
              isPending={updateCreds.isPending}
              onSave={(payload) =>
                updateCreds.mutateAsync({ id: existing.id, data: payload })
              }
            />
          </>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            {isEdit ? t("common.save") : t("adminsAdminFormDialog.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
