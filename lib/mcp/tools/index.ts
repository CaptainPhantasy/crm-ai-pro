import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { crmTools, handleCrmTool } from './crm-tools'
import { yourTools, handleYourTool } from './your-tools'

export const allTools: Tool[] = [...crmTools, ...yourTools]

const handlers: Record<string, (name: string, args: Record<string, unknown>, userId?: string) => Promise<unknown>> = {
  // CRM Tools
  create_job: handleCrmTool,
  search_contacts: handleCrmTool,
  get_job: handleCrmTool,
  update_job_status: handleCrmTool,
  assign_tech: handleCrmTool,
  send_email: handleCrmTool,
  get_user_email: handleCrmTool,
  // Example tools
  your_tool: handleYourTool,
}

export async function callTool(name: string, args: Record<string, unknown>, userId?: string) {
  const handler = handlers[name]
  if (!handler) throw new Error(`No handler: ${name}`)
  return handler(name, args, userId)
}

export function listTools(): Tool[] { return allTools }

