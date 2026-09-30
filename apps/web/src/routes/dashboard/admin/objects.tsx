import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { AreasList } from "@/components/admin/objects/areas-list";
import { OrganizationsList } from "@/components/admin/objects/organizations-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ObjectsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") === "areas" ? "areas" : "organizations";

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", value);
      return next;
    }, { replace: true });
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{t("adminObjects.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("adminObjects.subtitle")}
          </p>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="organizations">{t("adminObjects.tabOrganizations")}</TabsTrigger>
          <TabsTrigger value="areas">{t("adminObjects.tabAreas")}</TabsTrigger>
        </TabsList>
        <TabsContent value="organizations" className="mt-4">
          <OrganizationsList />
        </TabsContent>
        <TabsContent value="areas" className="mt-4">
          <AreasList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
