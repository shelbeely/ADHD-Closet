/**
 * A2A Protocol Endpoint - Task Execution
 * 
 * POST /api/a2a/execute
 * 
 * This endpoint handles A2A task execution requests from other agents.
 */

import { NextRequest, NextResponse } from 'next/server';
import { twinStyleAgent } from '@/app/lib/a2a/agent';
import { z } from 'zod';

// Request validation schema
const A2AExecuteRequestSchema = z.object({
  taskId: z.string(),
  skillName: z.string(),
  input: z.any(),
  context: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validationResult = A2AExecuteRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { taskId, skillName, input, context } = validationResult.data;

    console.log(`A2A Task Request: ${taskId} - ${skillName}`);

    // Execute the skill
    const output = await twinStyleAgent.executeSkill(skillName, input, context);

    // Return success response
    return NextResponse.json({
      taskId,
      status: 'completed',
      output,
    });

  } catch (error) {
    console.error('A2A Task Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      {
        taskId: request.headers.get('x-task-id') || 'unknown',
        status: 'failed',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Task-Id',
    },
  });
}
