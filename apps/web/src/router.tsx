import { createBrowserRouter } from "react-router-dom";

import { AdminLayout } from "@/components/admin/admin-layout";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { AcademicPage } from "@/routes/dashboard/admin/academic";
import { AdminsPage } from "@/routes/dashboard/admin/admins";
import { AssignmentsPage } from "@/routes/dashboard/admin/assignments";
import { AttendancePage } from "@/routes/dashboard/admin/attendance";
import { AuditLogPage } from "@/routes/dashboard/admin/audit-log";
import { ContractsPage } from "@/routes/dashboard/admin/contracts";
import { DocumentsPage } from "@/routes/dashboard/admin/documents";
import { AdminHome } from "@/routes/dashboard/admin/index";
import { ObjectsPage } from "@/routes/dashboard/admin/objects";
import { PracticeTypesPage } from "@/routes/dashboard/admin/practice-types";
import { ApplicationsPage } from "@/routes/dashboard/admin/applications";
import { ContractTemplatesPage } from "@/routes/dashboard/admin/contract-templates";
import { ContractTemplateEditorPage } from "@/routes/dashboard/admin/contract-template-editor";
import { InquiriesPage } from "@/routes/dashboard/admin/inquiries";
import { IntegrationsPage } from "@/routes/dashboard/admin/integrations";
import { MonitoringPage } from "@/routes/dashboard/admin/monitoring";
import { RecordsPage } from "@/routes/dashboard/admin/records";
import { ReportsPage } from "@/routes/dashboard/admin/reports";
import { StudentsPage } from "@/routes/dashboard/admin/students";
import { SupervisorsPage } from "@/routes/dashboard/admin/supervisors";
import { SystemSettingsPage } from "@/routes/dashboard/admin/system-settings";
import { TaskTemplatesPage } from "@/routes/dashboard/admin/task-templates";
// Structure pages (alohida to'liq sahifalar)
import { FacultiesPage } from "@/routes/dashboard/admin/structure/faculties";
import { DepartmentsPage } from "@/routes/dashboard/admin/structure/departments";
import { DirectionsPage } from "@/routes/dashboard/admin/structure/directions";
import { GroupsPage } from "@/routes/dashboard/admin/structure/groups";
import { AcademicYearsPage } from "@/routes/dashboard/admin/structure/academic-years";
import { StructureStudentsPage } from "@/routes/dashboard/admin/structure/students";
import { StudentDashboard } from "@/routes/dashboard/student";
import { SupervisorDashboard } from "@/routes/dashboard/supervisor";
import {
  SupervisorProgramsPage,
  SupervisorRegulationsPage,
} from "@/routes/dashboard/supervisor/documents";
import { SupervisorStudentsPage } from "@/routes/dashboard/supervisor/students";
import { AmaliyotPage } from "@/routes/amaliyot";
import { ChangePasswordPage } from "@/routes/change-password";
import { FaqPage } from "@/routes/faq";
import { Home } from "@/routes/home";
import { Login } from "@/routes/login";
import { NotFound } from "@/routes/not-found";
import { Protected } from "@/routes/protected";
import { RescuePage } from "@/routes/rescue";
import { RootLayout } from "@/routes/root-layout";
import { VerifyPage } from "@/routes/verify";
import { YoriqnomaPage } from "@/routes/yoriqnoma";

export const router = createBrowserRouter([
  // Admin — sidebar layout
  {
    element: <Protected allowed={["super_admin", "admin"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, Component: AdminHome },

          // Structure (Akademik tuzilma)
          {
            element: <Protected permission="structure" />,
            children: [
              { path: "academic", Component: AcademicPage },
              { path: "students", Component: StudentsPage },
              { path: "structure/faculties", Component: FacultiesPage },
              { path: "structure/departments", Component: DepartmentsPage },
              { path: "structure/directions", Component: DirectionsPage },
              { path: "structure/groups", Component: GroupsPage },
              { path: "structure/academic-years", Component: AcademicYearsPage },
              { path: "structure/students", Component: StructureStudentsPage },
            ],
          },

          // Practice (Amaliyot jarayonlari)
          {
            element: <Protected permission="practice" />,
            children: [
              { path: "practice-types", Component: PracticeTypesPage },
              { path: "assignments", Component: AssignmentsPage },
              { path: "attendance", Component: AttendancePage },
              { path: "task-templates", Component: TaskTemplatesPage },
              { path: "documents", Component: DocumentsPage },
              { path: "reports", Component: ReportsPage },
              { path: "records", Component: RecordsPage },
            ],
          },

          // Contracts & Applications (Shartnomalar va arizalar)
          {
            element: <Protected allowedPermissions={["contracts", "practice"]} />,
            children: [
              { path: "contracts", Component: ContractsPage },
              { path: "applications", Component: ApplicationsPage },
            ],
          },

          // Supervisors (Rahbarlar)
          {
            element: <Protected permission="supervisors" />,
            children: [
              { path: "supervisors", Component: SupervisorsPage },
            ],
          },

          // Partners / Organizations / Areas (Hamkorlar)
          {
            element: <Protected permission="partners" />,
            children: [
              { path: "objects", Component: ObjectsPage },
            ],
          },

          // Monitoring
          {
            element: <Protected permission="monitoring" />,
            children: [
              { path: "monitoring", Component: MonitoringPage },
              { path: "monitoring/:tab", Component: MonitoringPage },
            ],
          },

          // Inquiries (Murojaatlar)
          {
            element: <Protected permission="inquiries" />,
            children: [
              { path: "inquiries", Component: InquiriesPage },
            ],
          },

          // System settings (Tizim sozlamalari)
          {
            element: <Protected permission="system" />,
            children: [
              { path: "integrations", Component: IntegrationsPage },
            ],
          },

          {
            element: <Protected allowed={["super_admin"]} />,
            children: [
              { path: "contract-templates", Component: ContractTemplatesPage },
              { path: "contract-templates/:id/edit", Component: ContractTemplateEditorPage },
              { path: "admins", Component: AdminsPage },
              { path: "audit-log", Component: AuditLogPage },
              { path: "system-settings", Component: SystemSettingsPage },
            ],
          },
        ],
      },
    ],
  },

  // Public QR verify — auth yo'q, layout yo'q
  { path: "/verify/:token", Component: VerifyPage },

  // Super Admin rescue — MaintenanceGuard'siz, faqat super_admin uchun
  { path: "/rescue", Component: RescuePage },

  // Force change password — must_change_password=true bo'lganda
  { path: "/change-password", Component: ChangePasswordPage },

  // Supervisor — sidebar layout
  {
    element: <Protected allowed={["supervisor"]} />,
    children: [
      {
        path: "/supervisor",
        element: <SupervisorLayout />,
        children: [
          { index: true, Component: SupervisorDashboard },
          { path: "regulations", Component: SupervisorRegulationsPage },
          { path: "programs", Component: SupervisorProgramsPage },
          { path: "students", Component: SupervisorStudentsPage },
          { path: "attendance", Component: SupervisorDashboard },
          { path: "tasks", Component: SupervisorDashboard },
        ],
      },
    ],
  },

  // Public + boshqa rollar (student hozircha RootLayout'da)
  {
    element: <RootLayout />,
    children: [
      { index: true, Component: Home },
      { path: "amaliyot", Component: AmaliyotPage },
      { path: "yoriqnoma", Component: YoriqnomaPage },
      { path: "faq", Component: FaqPage },
      { path: "login", Component: Login },
      {
        element: <Protected allowed={["student"]} />,
        children: [{ path: "student", Component: StudentDashboard }],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
