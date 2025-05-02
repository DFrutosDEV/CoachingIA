import { EnterpriseCard } from "./enterprise-card";

const enterprises = [
  {
    id: "1",
    name: "Empresa Alfa",
    VAT: "12345678901",
    codigoFiscal: "123456789",
    status: "Activo",
    cantidadCoaches: 1,
    cantidadClientes: 10,
  },
  {
    id: "2",
    name: "Empresa Beta",
    VAT: "09876543210",
    codigoFiscal: "098765432",
    status: "Inactivo",
    cantidadCoaches: 2,
    cantidadClientes: 20,
  },
  {
    id: "3",
    name: "Empresa Gamma",
    VAT: "11223344556",
    codigoFiscal: "112233445",
    status: "Activo",
    cantidadCoaches: 3,
    cantidadClientes: 30,
  },
]

export function EnterprisesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {enterprises.map((enterprise) => (
        <EnterpriseCard
          key={enterprise.id}
          name={enterprise.name}
          VAT={enterprise.VAT}
          codigoFiscal={enterprise.codigoFiscal}
          cantidadCoaches={enterprise.cantidadCoaches}
          cantidadClientes={enterprise.cantidadClientes}
          status={enterprise.status}
        />
      ))}
    </div>
  )
}
