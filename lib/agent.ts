/**
 * Gong Call Summary Agent
 *
 * This agent analyzes call transcripts using a Vercel Sandbox environment
 * and provides structured summaries with objections, tasks, and insights.
 *
 * Features:
 * - Sandbox-based file exploration
 * - Configurable prompts and output schema
 * - Structured output with Zod validation
 */

import { Output, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { Sandbox } from '@vercel/sandbox';
import ms from 'ms';
import { config, agentOutputSchema } from './config';
import { createAgentTools } from './tools';
import { generateFilesForSandbox, generateFileTree } from './sandbox-context';
import type { GongWebhookData } from './types';

/**
 * Input options for the agent
 */
const callOptionsSchema = z.object({
  webhookData: z.custom<GongWebhookData>(),
  sfdcAccountId: z.string().optional(),
});

/**
 * The Gong Call Summary Agent
 *
 * Uses ToolLoopAgent from the Vercel AI SDK to:
 * 1. Create a sandbox environment with call context
 * 2. Provide tools for exploring transcripts
 * 3. Generate structured summaries
 */
export const gongSummaryAgent = new ToolLoopAgent({
  model: config.model,

  // Provider-specific options for different AI models
  providerOptions: {
    anthropic: {
      thinkingConfig: {
        thinkingBudget: 10000,
        type: 'enabled',
      },
    },
    openai: {
      reasoningEffort: 'high',
    },
  },

  callOptionsSchema,

  prepareCall: async ({ options, ...settings }) => {
    // Create sandbox environment
    const sandbox = await Sandbox.create({
      timeout: ms(config.sandbox.timeout),
    });

    // Create directory structure
    await sandbox.mkDir('gong-calls');
    if (config.salesforce.enabled) {
      await sandbox.mkDir('salesforce');
    }

    // Generate and write context files to sandbox
    const files = await generateFilesForSandbox({
      webhookData: options.webhookData,
      sfdcAccountId: options.sfdcAccountId,
    });

    if (files.length > 0) {
      await sandbox.writeFiles(files);
    }

    // Generate file tree for the prompt
    const fileTree = generateFileTree(files);

    // Get call metadata for context
    const callMeta = options.webhookData.callData.metaData;
    const parties = options.webhookData.callData.parties || [];

    // Build the system instructions
    const instructions = `${config.systemPrompt}

## Call Context

**Call:** ${callMeta.title || 'Untitled Call'}
**Date:** ${callMeta.scheduled || callMeta.started || 'Unknown'}
**Duration:** ${callMeta.duration ? Math.round(callMeta.duration / 60) + ' minutes' : 'Unknown'}
**System:** ${callMeta.system || 'Unknown'}

**Participants:**
${parties.map((p) => `- ${p.name || 'Unknown'} (${p.affiliation || 'Unknown'})${p.title ? ` - ${p.title}` : ''}`).join('\n')}

## Filesystem Structure
\`\`\`
${fileTree}
\`\`\`

## Instructions

1. First, explore the call transcript using the executeCommand tool
2. Search for key topics, objections, and action items
3. Analyze how objections were handled
4. Generate a comprehensive summary

## Metadata
- Current date: ${new Date().toISOString()}
- Company: ${config.companyName}`;

    // Create tools with sandbox instance
    const tools = createAgentTools(sandbox);

    return {
      ...settings,
      instructions,
      tools,
      output: Output.object({
        schema: agentOutputSchema,
      }),
    };
  },
});

/**
 * Run the agent on a call transcript
 */
export async function runGongAgent(
  webhookData: GongWebhookData,
  sfdcAccountId?: string
): Promise<z.infer<typeof agentOutputSchema>> {
  const result = await gongSummaryAgent.generate({
    prompt: `Analyze this call transcript and provide a comprehensive summary.

Focus on:
1. Key discussion points and decisions
2. Any objections or concerns raised
3. Action items and next steps
4. Overall call assessment

Use the executeCommand tool to explore the transcript files before generating your summary.`,
    options: {
      webhookData,
      sfdcAccountId,
    },
  });

  return result.output as z.infer<typeof agentOutputSchema>;
}

