import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SettingsForm } from "@/components/settings-options";

type ParamsObject = {
  userType: "client" | "coach" | "admin" | "enterprise";
};

interface SettingsPageProps {
  params: Promise<ParamsObject>; 
}

export default async function SettingsPage({ params: paramsPromise }: SettingsPageProps) {
  const params = await paramsPromise; 
  const { userType } = params;

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType={userType} className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType={userType} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Configuración</h1>
              <p className="text-muted-foreground">Ajusta la configuración de tu cuenta para el perfil de {userType}.</p>
            </div>
            <SettingsForm userType={userType} />
          </div>
        </main>
      </div>
    </div>
  );
} 