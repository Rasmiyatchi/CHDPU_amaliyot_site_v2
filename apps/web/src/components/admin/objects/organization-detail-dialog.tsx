import {
  Building2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Users,
  Wifi,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
import type { Organization, OrganizationKind } from "@/lib/api/types";

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

const DAY_NAMES = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value ?? <span className="font-normal text-muted-foreground">—</span>}</dd>
    </div>
  );
}

type Props = {
  organization: Organization | null;
  onClose: () => void;
  onEdit?: (org: Organization) => void;
};

export function OrganizationDetailDialog({ organization, onClose, onEdit }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!organization} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {organization && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-semibold">{organization.name}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${KIND_BADGE_STYLE[organization.kind] || ""}`}
                    >
                      {t(KIND_LABEL_KEY[organization.kind])}
                    </Badge>
                    {organization.is_active ? (
                      <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-600 text-white">
                        {t("objectsOrganizationsList.activeBadge")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {t("objectsOrganizationsList.inactiveBadge")}
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogTitle>
              {organization.legal_name && organization.legal_name !== organization.name && (
                <DialogDescription className="text-xs">
                  {organization.legal_name}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Asosiy ma'lumotlar va Rahbariyat */}
              <section className="space-y-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Asosiy ma'lumotlar va rekvizitlar
                </h3>
                <div className="rounded-lg border border-border/80 bg-card p-3.5">
                  <dl className="space-y-2">
                    <Row
                      label="Rahbar"
                      value={
                        <div>
                          <div>{organization.director_full_name}</div>
                          {organization.director_position && (
                            <div className="text-xs font-normal text-muted-foreground">
                              {organization.director_position}
                            </div>
                          )}
                        </div>
                      }
                    />
                    {organization.inn && (
                      <Row
                        label="INN / STIR"
                        value={<span className="font-mono">{organization.inn}</span>}
                      />
                    )}
                    {organization.bank_name && (
                      <Row
                        label="Bank nomi"
                        value={organization.bank_name}
                      />
                    )}
                    {organization.bank_account && (
                      <Row
                        label="Hisob raqami (H/R)"
                        value={<span className="font-mono text-xs">{organization.bank_account}</span>}
                      />
                    )}
                    {organization.bank_mfo && (
                      <Row
                        label="MFO"
                        value={<span className="font-mono text-xs">{organization.bank_mfo}</span>}
                      />
                    )}
                  </dl>
                </div>
              </section>

              {/* Aloqa va Manzil */}
              <section className="space-y-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  Aloqa va joylashuv
                </h3>
                <div className="rounded-lg border border-border/80 bg-card p-3.5">
                  <dl className="space-y-2">
                    <Row
                      label="Telefon"
                      value={
                        organization.phone ? (
                          <a
                            href={`tel:${organization.phone}`}
                            className="inline-flex items-center gap-1.5 text-primary hover:underline font-mono"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {organization.phone}
                          </a>
                        ) : null
                      }
                    />
                    {organization.email && (
                      <Row
                        label="Email"
                        value={
                          <a
                            href={`mailto:${organization.email}`}
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {organization.email}
                          </a>
                        }
                      />
                    )}
                    {organization.website && (
                      <Row
                        label="Veb-sayt"
                        value={
                          <a
                            href={organization.website.startsWith("http") ? organization.website : `https://${organization.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            {organization.website}
                          </a>
                        }
                      />
                    )}
                    <Row
                      label="Hudud"
                      value={
                        <span>
                          {organization.region}
                          {organization.district ? `, ${organization.district}` : ""}
                        </span>
                      }
                    />
                    <Row
                      label="Manzil"
                      value={organization.address_line}
                    />
                    {(organization.geo_lat != null && organization.geo_lng != null) && (
                      <Row
                        label="Geolokatsiya"
                        value={
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {Number(organization.geo_lat).toFixed(5)}, {Number(organization.geo_lng).toFixed(5)}
                            </span>
                            {organization.geo_radius_m ? (
                              <Badge variant="secondary" className="text-xs">
                                Radius: {organization.geo_radius_m}m
                              </Badge>
                            ) : null}
                          </div>
                        }
                      />
                    )}
                  </dl>
                </div>
              </section>

              {/* Sig'im va Ish tartibi */}
              <section className="space-y-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Sig'im va amaliyot sharoitlari
                </h3>
                <div className="rounded-lg border border-border/80 bg-card p-3.5">
                  <dl className="space-y-2">
                    <Row
                      label="Sig'imi (kvota)"
                      value={
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{organization.capacity} ta talaba</span>
                          <span className="text-xs text-muted-foreground">
                            (Hozirda biriktirilgan:{" "}
                            <span className="font-semibold text-primary">
                              {organization.assigned_students_count ?? 0}
                            </span>
                            )
                          </span>
                        </div>
                      }
                    />
                    {organization.work_days && organization.work_days.length > 0 && (
                      <Row
                        label="Ish kunlari"
                        value={
                          <div className="flex flex-wrap gap-1">
                            {organization.work_days.map((d) => (
                              <Badge key={d} variant="secondary" className="text-xs">
                                {DAY_NAMES[d - 1] ?? d}
                              </Badge>
                            ))}
                          </div>
                        }
                      />
                    )}
                    {organization.wifi_ssids && organization.wifi_ssids.length > 0 && (
                      <Row
                        label="Wi-Fi tarmoqlari"
                        value={
                          <div className="flex flex-wrap gap-1">
                            {organization.wifi_ssids.map((ssid) => (
                              <Badge key={ssid} variant="outline" className="font-mono text-xs">
                                <Wifi className="mr-1 h-3 w-3" />
                                {ssid}
                              </Badge>
                            ))}
                          </div>
                        }
                      />
                    )}
                    {organization.notes && (
                      <Row
                        label="Qo'shimcha izoh"
                        value={<span className="font-normal text-muted-foreground">{organization.notes}</span>}
                      />
                    )}
                  </dl>
                </div>
              </section>
            </div>

            <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit(organization);
                  }}
                  className="gap-1.5"
                >
                  <Pencil className="h-4 w-4" />
                  <span>{t("common.edit")}</span>
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={onClose}>
                {t("common.close")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
