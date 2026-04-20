import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import { verifyToken } from '@/lib/auth-jwt';
import { GOAL_SURVEY_COMMENT_MAX_LENGTH } from '@/lib/constants/goal';

type SurveyStatus =
  | 'ready'
  | 'missing_token'
  | 'invalid_token'
  | 'goal_not_found'
  | 'goal_not_completed'
  | 'already_answered';

function normalizeComment(comment: unknown) {
  if (typeof comment !== 'string') {
    return '';
  }

  return comment.trim();
}

async function getSurveyGoal(token: string) {
  const decoded = verifyToken(token) as { goalId: string } | null;

  if (!decoded?.goalId) {
    return {
      status: 'invalid_token' as SurveyStatus,
      httpStatus: 401,
    };
  }

  const goal = await Goal.findById(decoded.goalId);

  if (!goal) {
    return {
      status: 'goal_not_found' as SurveyStatus,
      httpStatus: 404,
      goalId: decoded.goalId,
    };
  }

  if (!goal.isCompleted) {
    return {
      status: 'goal_not_completed' as SurveyStatus,
      httpStatus: 400,
      goalId: goal._id.toString(),
      goal,
    };
  }

  if (goal.surveyRating) {
    return {
      status: 'already_answered' as SurveyStatus,
      httpStatus: 409,
      goalId: goal._id.toString(),
      goal,
    };
  }

  return {
    status: 'ready' as SurveyStatus,
    httpStatus: 200,
    goalId: goal._id.toString(),
    goal,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      console.info('[survey][email-link]', {
        result: 'missing_token',
      });
      return NextResponse.json(
        {
          success: false,
          status: 'missing_token',
        },
        { status: 400 }
      );
    }

    const surveyGoal = await getSurveyGoal(token);

    if (surveyGoal.status !== 'ready') {
      console.info('[survey][email-link]', {
        goalId: surveyGoal.goalId ?? null,
        result: surveyGoal.status,
      });
      return NextResponse.json(
        {
          success: false,
          status: surveyGoal.status,
        },
        { status: surveyGoal.httpStatus }
      );
    }

    console.info('[survey][email-link]', {
      goalId: surveyGoal.goalId,
      result: 'ready',
    });

    return NextResponse.json({
      success: true,
      status: 'ready',
      goal: {
        id: surveyGoal.goalId,
        description: surveyGoal.goal.description,
      },
    });
  } catch (error) {
    console.error('[survey][email-link]', {
      result: 'server_error',
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    });

    return NextResponse.json(
      {
        success: false,
        status: 'server_error',
      },
      { status: 500 }
    );
  }
}


// POST /api/goals/survey - Guardar la encuesta de un cliente
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { token, rating, comment } = body;

    // Validar que el token esté presente
    if (!token) {
      console.info('[survey][email-link]', {
        result: 'missing_token',
      });
      return NextResponse.json(
        {
          success: false,
          status: 'missing_token',
        },
        { status: 400 }
      );
    }

    // Validar que el rating esté presente y sea válido
    if (!rating || !['excellent', 'so-so', 'bad'].includes(rating)) {
      console.info('[survey][email-link]', {
        result: 'invalid_rating',
      });
      return NextResponse.json(
        {
          success: false,
          status: 'invalid_rating',
        },
        { status: 400 }
      );
    }

    const surveyGoal = await getSurveyGoal(token);

    if (surveyGoal.status !== 'ready') {
      console.info('[survey][email-link]', {
        goalId: surveyGoal.goalId ?? null,
        result: surveyGoal.status,
      });
      return NextResponse.json(
        {
          success: false,
          status: surveyGoal.status,
        },
        { status: surveyGoal.httpStatus }
      );
    }

    const normalizedComment = normalizeComment(comment);
    const goalId = surveyGoal.goalId;

    if (normalizedComment.length > GOAL_SURVEY_COMMENT_MAX_LENGTH) {
      console.info('[survey][email-link]', {
        goalId,
        result: 'comment_too_long',
      });
      return NextResponse.json(
        {
          success: false,
          status: 'invalid_comment',
        },
        { status: 400 }
      );
    }

    const updatedGoal = await Goal.findOneAndUpdate(
      {
        _id: goalId,
        $or: [{ surveyRating: { $exists: false } }, { surveyRating: null }],
      },
      {
        $set: {
          surveyRating: rating,
          surveyComment: normalizedComment,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedGoal) {
      console.info('[survey][email-link]', {
        goalId,
        result: 'already_answered',
      });
      return NextResponse.json(
        {
          success: false,
          status: 'already_answered',
        },
        { status: 409 }
      );
    }

    console.info('[survey][email-link]', {
      goalId,
      result: 'saved',
      rating,
    });

    return NextResponse.json({
      success: true,
      status: 'saved',
    });
  } catch (error) {
    console.error('[survey][email-link]', {
      result: 'server_error',
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    });

    return NextResponse.json(
      {
        success: false,
        status: 'server_error',
      },
      { status: 500 }
    );
  }
}

