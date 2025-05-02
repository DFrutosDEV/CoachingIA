import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EnterpriseCardProps {
  name: string;
  VAT: string;
  codigoFiscal: string;
  status: string;
  cantidadCoaches: number;
  cantidadClientes: number;
}

export function EnterpriseCard({ name, VAT, codigoFiscal, status, cantidadCoaches, cantidadClientes }: EnterpriseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>VAT: {VAT}</CardDescription>
        <CardDescription>Código Fiscal: {codigoFiscal}</CardDescription>
        <CardDescription>Cantidad de Coaches: {cantidadCoaches} | Cantidad de Clientes: {cantidadClientes}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant={status === "Activo" ? "active" : "inactive"}>
          {status}
        </Badge>
      </CardContent>
    </Card>
  )
} 