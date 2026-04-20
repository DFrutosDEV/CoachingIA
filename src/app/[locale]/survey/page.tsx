'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@mui/material';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  GOAL_SURVEY_COMMENT_MAX_LENGTH,
  GOAL_SURVEY_TOKEN_VALIDITY_DAYS,
} from '@/lib/constants/goal';

type Rating = 'excellent' | 'so-so' | 'bad';
type SurveyState =
  | 'checking'
  | 'ready'
  | 'submitted'
  | 'invalid'
  | 'already_answered';

function messageForSurveyStatus(
  pageT: (key: string, values?: Record<string, number | string>) => string,
  status: string | undefined
) {
  switch (status) {
    case 'missing_token':
      return pageT('errors.missingToken');
    case 'invalid_token':
      return pageT('errors.invalidToken', {
        days: GOAL_SURVEY_TOKEN_VALIDITY_DAYS,
      });
    case 'goal_not_found':
      return pageT('errors.goalNotFound');
    case 'goal_not_completed':
      return pageT('errors.goalNotCompleted');
    case 'invalid_rating':
      return pageT('errors.invalidRating');
    case 'invalid_comment':
      return pageT('errors.commentTooLong', {
        max: GOAL_SURVEY_COMMENT_MAX_LENGTH,
      });
    case 'server_error':
      return pageT('errors.serverError');
    default:
      return pageT('errors.invalidLink');
  }
}

export default function SurveyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const pageT = useTranslations('common.surveyPage');
  const surveyT = useTranslations('common.dashboard.clientTasks.survey');

  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [surveyState, setSurveyState] = useState<SurveyState>('checking');
  const [error, setError] = useState<string | null>(null);
  const [goalDescription, setGoalDescription] = useState('');

  useEffect(() => {
    const validateSurveyLink = async () => {
      if (!token) {
        setError(pageT('errors.missingToken'));
        setSurveyState('invalid');
        return;
      }

      try {
        setError(null);
        setSurveyState('checking');

        const response = await fetch(
          `/api/goals/survey?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setGoalDescription(data.goal?.description ?? '');
          setSurveyState('ready');
          return;
        }

        if (data.status === 'already_answered') {
          setSurveyState('already_answered');
          setError(pageT('states.alreadyAnswered.message'));
          return;
        }

        setError(messageForSurveyStatus(pageT, data.status));
        setSurveyState('invalid');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : pageT('errors.unknown');
        setError(errorMessage);
        setSurveyState('invalid');
      }
    };

    validateSurveyLink();
  }, [pageT, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(pageT('errors.missingToken'));
      return;
    }

    if (surveyState !== 'ready') {
      return;
    }

    if (!rating) {
      toast.error(pageT('errors.missingRating'));
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
        if (data.status === 'already_answered') {
          const msg = pageT('states.alreadyAnswered.message');
          setSurveyState('already_answered');
          setError(msg);
          toast.error(msg);
          return;
        }

        throw new Error(messageForSurveyStatus(pageT, data.status));
      }

      setSurveyState('submitted');
      toast.success(pageT('states.submitted.toast'));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : pageT('errors.unknown');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (surveyState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4">
        <div className="max-w-md w-full rounded-lg border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[hsl(var(--foreground))] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">{pageT('states.checking.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            {pageT('states.checking.description')}
          </p>
        </div>
      </div>
    );
  }

  if (surveyState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4">
        <div className="max-w-md w-full rounded-lg border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{pageT('states.invalid.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">{error}</p>
        </div>
      </div>
    );
  }

  if (surveyState === 'already_answered') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4">
        <div className="max-w-md w-full rounded-lg border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {pageT('states.alreadyAnswered.title')}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            {error || pageT('states.alreadyAnswered.message')}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {pageT('states.closePage')}
          </p>
        </div>
      </div>
    );
  }

  if (surveyState === 'submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4">
        <div className="max-w-md w-full rounded-lg border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {pageT('states.submitted.title')}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            {pageT('states.submitted.description')}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {pageT('states.closePage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {pageT('form.title')}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              {pageT('form.subtitle')}
            </p>
            {goalDescription && (
              <p className="mt-4 text-sm rounded-lg border bg-[hsl(var(--background))] px-4 py-3 text-[hsl(var(--muted-foreground))]">
                {goalDescription}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Domanda 1: Rating */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                {pageT('form.ratingLabel')}
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setRating('excellent')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${rating === 'excellent'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-green-400 hover:bg-[hsl(var(--accent))]'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${rating === 'excellent'
                      ? 'border-green-500 bg-green-500'
                      : 'border-[hsl(var(--muted-foreground))]'
                    }`}>
                    {rating === 'excellent' && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{surveyT('options.excellent.emoji')}</span>
                      <span className="font-semibold">
                        {surveyT('options.excellent.label')}
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      {surveyT('options.excellent.description')}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRating('so-so')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${rating === 'so-so'
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-yellow-400 hover:bg-[hsl(var(--accent))]'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${rating === 'so-so'
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-[hsl(var(--muted-foreground))]'
                    }`}>
                    {rating === 'so-so' && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{surveyT('options.so-so.emoji')}</span>
                      <span className="font-semibold">
                        {surveyT('options.so-so.label')}
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      {surveyT('options.so-so.description')}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRating('bad')}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${rating === 'bad'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-red-400 hover:bg-[hsl(var(--accent))]'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${rating === 'bad'
                      ? 'border-red-500 bg-red-500'
                      : 'border-[hsl(var(--muted-foreground))]'
                    }`}>
                    {rating === 'bad' && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{surveyT('options.bad.emoji')}</span>
                      <span className="font-semibold">
                        {surveyT('options.bad.label')}
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      {surveyT('options.bad.description')}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Domanda 2: Comment */}
            <div>
              <label
                htmlFor="comment"
                className="block text-lg font-semibold mb-4"
              >
                {pageT('form.commentLabel')}
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                maxLength={GOAL_SURVEY_COMMENT_MAX_LENGTH}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border border-[hsl(var(--input))] placeholder:text-[hsl(var(--muted-foreground))]"
                placeholder={surveyT('commentPlaceholder')}
              />
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                {pageT('form.characterCount', {
                  count: comment.length,
                  max: GOAL_SURVEY_COMMENT_MAX_LENGTH,
                })}
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
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
                {loading ? pageT('form.submitting') : pageT('form.submitButton')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

