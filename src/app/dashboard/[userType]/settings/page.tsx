import { SettingsClient } from "./settings-client";

type ParamsObject = {
  userType: "client" | "coach" | "admin" | "enterprise";
};

interface SettingsPageProps {
  params: Promise<ParamsObject>; 
}

export default async function SettingsPage({ params: paramsPromise }: SettingsPageProps) {
  const params = await paramsPromise; 
  const { userType } = params;

  return <SettingsClient userType={userType} />;
} 