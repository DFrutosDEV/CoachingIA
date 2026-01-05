'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@mui/material';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SurveyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [rating, setRating] = useState<'excellent' | 'so-so' | 'bad' | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token non valido o mancante. Controlla il link nell\'email.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Token non valido o mancante.');
      return;
    }

    if (!rating) {
      toast.error('Per favore, seleziona una valutazione');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/goals/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Errore durante l\'invio della risposta');
      }

      setSubmitted(true);
      toast.success('Grazie! La tua risposta è stata inviata con successo.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Link Non Valido
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Grazie! 🙏
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La tua risposta è stata inviata con successo. Il tuo feedback è molto importante per noi!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Puoi chiudere questa pagina.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Come è andata la tua sfida? 🎯
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Condividi la tua esperienza con noi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Domanda 1: Rating */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Com'è andata l'applicazione della sfida oggi?
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setRating('excellent')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${rating === 'excellent'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-400 bg-white dark:bg-gray-700'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${rating === 'excellent'
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-400'
                    }`}>
                    {rating === 'excellent' && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🟢</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Benissimo!
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      L'ho applicata con successo e mi sono sentito/a a mio agio.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRating('so-so')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${rating === 'so-so'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400 bg-white dark:bg-gray-700'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${rating === 'so-so'
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-gray-400'
                    }`}>
                    {rating === 'so-so' && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🟡</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Così così...
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ci ho provato, ma ho incontrato qualche difficoltà o non sono del tutto soddisfatto/a.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRating('bad')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${rating === 'bad'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-red-400 bg-white dark:bg-gray-700'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${rating === 'bad'
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-400'
                    }`}>
                    {rating === 'bad' && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔴</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Male
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Non sono riuscito/a ad applicarla o mi sono sentito/a molto a disagio.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Domanda 2: Comment */}
            <div>
              <label
                htmlFor="comment"
                className="block text-lg font-semibold text-gray-900 dark:text-white mb-4"
              >
                2. C'è qualcosa in particolare che vuoi raccontarmi?
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Scrivi qui il tuo commento (opzionale)..."
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {comment.length}/1000 caratteri
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !rating}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                  },
                }}
              >
                {loading ? 'Invio in corso...' : 'Invia Risposta'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

