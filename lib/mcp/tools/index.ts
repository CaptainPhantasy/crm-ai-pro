import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { crmTools, handleCrmTool } from './crm-tools'

export const allTools: Tool[] = [...crmTools]

// Create a set of all CRM tool names for efficient lookup
const crmToolNames = new Set(crmTools.map((tool) => tool.name))

export async function callTool(name: string, args: Record<string, unknown>, userId?: string) {
  if (crmToolNames.has(name)) {
    return handleCrmTool(name, args, userId)
  }
  throw new Error(`Unknown tool: ${name}`)
}

export function listTools(): Tool[] { return allTools }

