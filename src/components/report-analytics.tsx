'use client'; // Marcar como Client Component si usa hooks como useState o efectos

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "lucide-react"

const ChangeIcon = ({ positive }: { positive: boolean }) => {
  const Icon = positive ? ArrowUp : ArrowDown;
  return <Icon className={`ml-1 h-4 w-4`} />;
};

export function AnalyticsComponent({ analyticsData }: { analyticsData: any[] }) {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {analyticsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.metric}</CardDescription>
              <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center text-xs ${stat.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                <span>{stat.change}</span>
                <ChangeIcon positive={stat.positive} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>     
    </>
  );
}
