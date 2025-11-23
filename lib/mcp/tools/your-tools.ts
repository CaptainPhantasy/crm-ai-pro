import type { Tool } from '@modelcontextprotocol/sdk/types.js'

export const yourTools: Tool[] = [{
  name: 'your_tool',
  description: 'Tool description',
  inputSchema: {
    type: 'object',
    properties: { param: { type: 'string', description: 'Param desc' } },
    required: ['param']
  }
}]

export async function handleYourTool(
  name: string, args: Record<string, unknown>, userId?: string
): Promise<unknown> {
  if (name === 'your_tool') {
    const { param } = args as { param: string }
    // Call your API or LLM orchestrator
    return { result: 'data' }
  }
  throw new Error(`Unknown tool: ${name}`)
}

