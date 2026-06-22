import { callGemini } from '../integrations/gemini';
import { TOOLS, ToolName } from '../tools/registry';
import { getCalendarEvents, createCalendarEvent } from '../tools/calendar';
import { searchEmail, draftEmail } from '../tools/gmail';
import { getTask, updateTask, createAuditEntry } from '../memory/state';
import { config } from '../config';
import type { Content } from '@google/generative-ai';

const EXECUTOR_SYSTEM = `You are a deadline action executor. Given a task, use the available tools to produce a concrete artifact (email draft, calendar event, research summary). Think step by step. Always prefer drafting over sending. Always prefer creating over deleting. After producing an artifact, stop and return it as JSON in your text response.`;

const MAX_REACT_TURNS = 5;

interface AuditToolCall {
  name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

async function dispatchTool(
  userId: string,
  name: ToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case 'getCalendarEvents':
      return getCalendarEvents(userId, args as unknown as Parameters<typeof getCalendarEvents>[1]);

    case 'createCalendarEvent':
      return createCalendarEvent(userId, args as unknown as Parameters<typeof createCalendarEvent>[1]);

    case 'searchEmail':
      return searchEmail(userId, args.query as string, args.maxResults as number | undefined);

    case 'draftEmail':
      return draftEmail(userId, args as unknown as Parameters<typeof draftEmail>[1]);

    case 'searchWeb':
      // VERIFY: implement with Gemini grounding or a search API — stub for now
      return { results: [`Stub search result for: ${args.query}`] };

    default: {
      // Exhaustiveness guard — TypeScript narrows `name` to `never` here
      const _exhaustive: never = name;
      throw new Error(`Unknown tool: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Run the ReAct executor loop for a single task.
 * Stages the artifact as `awaiting_confirm` — never auto-commits (Tier 2 minimum).
 */
export async function executeTask(userId: string, taskId: string): Promise<void> {
  const task = await getTask(taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  if (task.userId !== userId) throw new Error('Unauthorized');

  await updateTask(taskId, { status: 'drafted' });

  const messages: Content[] = [
    {
      role: 'user',
      parts: [
        {
          text: `Execute this task: "${task.title}"
Description: ${task.description ?? 'none'}
Due: ${task.due}
Today: ${new Date().toISOString()}
Use tools as needed. Produce the artifact and return it as JSON.`,
        },
      ],
    },
  ];

  let artifact: Record<string, unknown> | null = null;
  const toolCallLog: AuditToolCall[] = [];

  // ReAct loop — capped at MAX_REACT_TURNS to prevent runaway
  for (let turn = 0; turn < MAX_REACT_TURNS; turn++) {
    const response = await callGemini({
      model: config.gemini.modelExecutor,
      systemInstruction: EXECUTOR_SYSTEM,
      messages,
      tools: TOOLS,
    });

    if (response.functionCalls.length === 0) {
      // Final text response — extract artifact
      if (response.text) {
        try {
          artifact = JSON.parse(response.text) as Record<string, unknown>;
        } catch {
          artifact = { summary: response.text };
        }
      }
      break;
    }

    // Execute each tool call returned in this turn
    const toolResults: Array<{ name: string; result: unknown }> = [];
    for (const fc of response.functionCalls) {
      const result = await dispatchTool(userId, fc.name as ToolName, fc.args);
      toolResults.push({ name: fc.name, result });
      toolCallLog.push({
        name: fc.name,
        input: fc.args,
        output: result as Record<string, unknown>,
      });
    }

    // Push model turn (with function call parts) back into the conversation
    messages.push({
      role: 'model',
      parts: response.functionCalls.map(fc => ({
        functionCall: fc,
      })) as unknown as Content['parts'],
    });

    // Push tool results as a user turn
    messages.push({
      role: 'user',
      parts: toolResults.map(tr => ({
        functionResponse: { name: tr.name, response: { result: tr.result } },
      })) as unknown as Content['parts'],
    });
  }

  // Stage for human confirmation — never auto-commit (Tier 2 minimum per safety model)
  await updateTask(taskId, {
    status: 'awaiting_confirm',
    artifact: artifact ?? { summary: 'Executor produced no artifact' },
  });

  await createAuditEntry({
    userId,
    actor: 'executor',
    action: `Executed task "${task.title}" — artifact staged for review`,
    goalId: task.goalId,
    taskId: task.id,
    toolCall:
      toolCallLog.length > 0 ? toolCallLog[toolCallLog.length - 1] : undefined,
    outcome: 'proposed',
  });
}
