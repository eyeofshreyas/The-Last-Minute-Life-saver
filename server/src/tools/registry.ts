import { SchemaType } from '@google/generative-ai';
import type { Tool } from '@google/generative-ai';

export const TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'getCalendarEvents',
        description: 'Fetch upcoming Google Calendar events for the user',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            maxResults: { type: SchemaType.INTEGER, description: 'Max events to return (default 10)' },
            timeMin: { type: SchemaType.STRING, description: 'ISO 8601 start time filter' },
            timeMax: { type: SchemaType.STRING, description: 'ISO 8601 end time filter' },
          },
          required: [],
        },
      },
      {
        name: 'createCalendarEvent',
        description: 'Create a new Google Calendar event (requires Tier 2 confirmation)',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            start: { type: SchemaType.STRING, description: 'ISO 8601 datetime' },
            end: { type: SchemaType.STRING, description: 'ISO 8601 datetime' },
          },
          required: ['summary', 'start', 'end'],
        },
      },
      {
        name: 'searchEmail',
        description: 'Search Gmail messages matching a query',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: { type: SchemaType.STRING, description: 'Gmail search query (e.g. "from:hr@company.com")' },
            maxResults: { type: SchemaType.INTEGER },
          },
          required: ['query'],
        },
      },
      {
        name: 'draftEmail',
        description: 'Create a Gmail draft (does NOT send — requires Tier 2 confirmation to send)',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            to: { type: SchemaType.STRING },
            subject: { type: SchemaType.STRING },
            body: { type: SchemaType.STRING, description: 'Plain text email body' },
          },
          required: ['to', 'subject', 'body'],
        },
      },
      {
        name: 'searchWeb',
        description: 'Search the web for factual information to ground the plan',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: { type: SchemaType.STRING },
          },
          required: ['query'],
        },
      },
    ],
  },
];

export type ToolName =
  | 'getCalendarEvents'
  | 'createCalendarEvent'
  | 'searchEmail'
  | 'draftEmail'
  | 'searchWeb';
