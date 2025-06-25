"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, ArrowRight } from "lucide-react"

export function PdaCard() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">Visualiza tu PDA</CardTitle>
        <CardDescription>
          Accede a tu PDA (Personal Development Analysis).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Visualiza tu PDA</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Descarga tu PDA</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Comparte tu PDA</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
} 