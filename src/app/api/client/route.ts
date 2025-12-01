import { NextRequest, NextResponse } from 'next/server';

// POST /api/client - Crear un nuevo cliente //! SIN USAR
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Error interno del servidor',
    },
    { status: 500 }
  );
}
