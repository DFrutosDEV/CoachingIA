import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SettingsForm } from "@/components/settings-options";

// Definimos el tipo del objeto que la promesa resolverá
type ParamsObject = {
  userType: "client" | "coach" | "admin" | "enterprise";
};

// Definimos que params es una promesa que resuelve a ParamsObject
interface SettingsPageProps {
  params: Promise<ParamsObject>; 
}

// El componente vuelve a ser async
export default async function SettingsPage({ params: paramsPromise }: SettingsPageProps) {
  // Usamos await para obtener el objeto params de la promesa
  const params = await paramsPromise; 
  const { userType } = params;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden md:block">
        <DashboardSidebar userType={userType} className="h-full" />
      </div>
      <div className="flex flex-col">
        <DashboardHeader userType={userType} />
        <main className="flex-1 p-6">
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