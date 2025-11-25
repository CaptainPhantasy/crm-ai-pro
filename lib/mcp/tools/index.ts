import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { crmTools, handleCrmTool } from './crm-tools'
import { yourTools, handleYourTool } from './your-tools'

export const allTools: Tool[] = [...crmTools, ...yourTools]

// Create a set of all CRM tool names for efficient lookup
const crmToolNames = new Set(crmTools.map((tool) => tool.name))
const yourToolNames = new Set(yourTools.map((tool) => tool.name))

export async function callTool(name: string, args: Record<string, unknown>, userId?: string) {
  // Route to appropriate handler based on tool type
  if (crmToolNames.has(name)) {
    return handleCrmTool(name, args, userId)
  }
  if (yourToolNames.has(name)) {
    return handleYourTool(name, args, userId)
  }
  throw new Error(`Unknown tool: ${name}`)
}

export function listTools(): Tool[] { return allTools }

