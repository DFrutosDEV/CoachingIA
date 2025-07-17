"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import { Goal, Objective } from "@/types"

interface AIGoalsGeneratorProps {
  isOpen: boolean
  onClose: () => void
  objective: Objective
  onGoalsGenerated: (goals: Goal[]) => void
}

export function AIGoalsGenerator({ 
  isOpen, 
  onClose, 
  objective, 
  onGoalsGenerated 
}: AIGoalsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [numberOfGoals, setNumberOfGoals] = useState(5)
  const [aiStatus, setAiStatus] = useState<{
    currentProvider: { name: string; available: boolean; error?: string }
    availableProviders: Array<{ name: string; available: boolean; error?: string }>
    environment: string
  } | null>(null)
  const [generatedGoals, setGeneratedGoals] = useState<Goal[]>([])
  const [error, setError] = useState<string | null>(null)

  // Verificar estado de los proveedores de IA al abrir el modal
  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/generate-goals')
      const data = await response.json()
      
      setAiStatus({
        currentProvider: data.currentProvider,
        availableProviders: data.availableProviders || [],
        environment: data.environment
      })
    } catch (error) {
      setAiStatus({
        currentProvider: { name: 'Ninguno', available: false, error: 'Error de conexión' },
        availableProviders: [],
        environment: 'unknown'
      })
    }
  }

  const generateGoals = async () => {
    setIsGenerating(true)
    setError(null)
    setGeneratedGoals([])

    try {
      const response = await fetch('/api/ai/generate-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: objective.title, // Usar title como ID temporal
          numberOfGoals
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error generando objetivos')
      }

      setGeneratedGoals(data.goals)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAcceptGoals = () => {
    onGoalsGenerated(generatedGoals)
    onClose()
    setGeneratedGoals([])
    setError(null)
  }

  const handleClose = () => {
    onClose()
    setGeneratedGoals([])
    setError(null)
    setAiStatus(null)
  }

  // Verificar proveedores de IA cuando se abre el modal
  if (isOpen && !aiStatus) {
    checkAIStatus()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generar Objetivos con IA
          </DialogTitle>
        </DialogHeader>

                  <div className="space-y-4">
            {/* Estado de los Proveedores de IA */}
            {aiStatus && (
              <div className="space-y-3">
                {/* Proveedor Actual */}
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  {aiStatus.currentProvider.available ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {aiStatus.currentProvider.available 
                        ? `${aiStatus.currentProvider.name} disponible` 
                        : `${aiStatus.currentProvider.name} no disponible`
                      }
                    </p>
                    {aiStatus.currentProvider.error && (
                      <p className="text-xs text-muted-foreground">{aiStatus.currentProvider.error}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Entorno: {aiStatus.environment}
                    </p>
                  </div>
                  <Badge variant={aiStatus.currentProvider.available ? "active" : "inactive"}>
                    {aiStatus.currentProvider.available ? "Conectado" : "Desconectado"}
                  </Badge>
                </div>

                {/* Proveedores Disponibles */}
                {aiStatus.availableProviders.length > 0 && (
                  <div className="p-3 rounded-lg border bg-muted/50">
                    <p className="text-sm font-medium mb-2">Proveedores Disponibles:</p>
                    <div className="space-y-1">
                      {aiStatus.availableProviders.map((provider, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${provider.available ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>{provider.name}</span>
                          {!provider.available && provider.error && (
                            <span className="text-muted-foreground">({provider.error})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Información del objetivo */}
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-1">Objetivo Principal</h4>
            <p className="text-sm text-muted-foreground">{objective.title}</p>
          </div>

          {/* Configuración */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Número de objetivos a generar</label>
            <div className="flex gap-2">
              {[3, 5, 7, 10].map((num) => (
                <Button
                  key={num}
                  variant={numberOfGoals === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNumberOfGoals(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Botón de generación */}
          <Button
            onClick={generateGoals}
            disabled={!aiStatus?.currentProvider.available || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando objetivos...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar {numberOfGoals} objetivos
              </>
            )}
          </Button>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Objetivos generados */}
          {generatedGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Objetivos Generados</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {generatedGoals.map((goal, index) => (
                  <div key={goal._id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{goal.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Día: {goal.day}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAcceptGoals} className="flex-1">
                  Aceptar Objetivos
                </Button>
                <Button variant="outline" onClick={() => setGeneratedGoals([])}>
                  Regenerar
                </Button>
              </div>
            </div>
          )}

          {/* Instrucciones de configuración */}
          {aiStatus && !aiStatus.currentProvider.available && (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <h4 className="font-medium text-amber-800 mb-2">Configurar Proveedor de IA</h4>
              <ol className="text-sm text-amber-700 space-y-1">
                <li>1. Configura las variables de entorno en <code className="bg-amber-100 px-1 rounded">.env.local</code></li>
                <li>2. Obtén una API key del proveedor deseado (Hugging Face, Google AI, OpenAI)</li>
                <li>3. Establece <code className="bg-amber-100 px-1 rounded">AI_PROVIDER</code> en tu archivo .env</li>
                <li>4. Reinicia la aplicación</li>
                <li>5. Consulta <code className="bg-amber-100 px-1 rounded">ENV_EXAMPLE.md</code> para más detalles</li>
              </ol>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 