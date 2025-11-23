import { listTools, callTool } from './tools/index'
import { listResources, readResource } from './resources/index'
import { listPrompts, getPrompt, getPromptTemplate } from './prompts/index'

export async function handleMCPRequest(request: {
  jsonrpc: '2.0', id?: string | number, method: string, params?: Record<string, unknown>
}, userId?: string) {
  const { id, method, params = {} } = request
  try {
    let result: unknown

    switch (method) {
      case 'tools/list':
        result = { tools: listTools() }
        break

      case 'tools/call': {
        const { name, arguments: args } = params as { name: string, arguments?: Record<string, unknown> }
        result = { content: [{ type: 'text', text: JSON.stringify(await callTool(name, args || {}, userId), null, 2) }] }
        break
      }

      case 'resources/list':
        result = { resources: listResources() }
        break

      case 'resources/read': {
        const { uri } = params as { uri: string }
        result = await readResource(uri)
        break
      }

      case 'prompts/list':
        result = { prompts: listPrompts() }
        break

      case 'prompts/get': {
        const { name, arguments: args } = params as { name: string, arguments?: Record<string, unknown> }
        const prompt = getPrompt(name)
        if (!prompt) throw new Error(`Prompt not found: ${name}`)
        let template = getPromptTemplate(name)
        if (args) {
          Object.entries(args).forEach(([k, v]) => {
            template = template.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v))
          })
        }
        result = { messages: [{ role: 'user', content: { type: 'text', text: template } }] }
        break
      }

      default:
        throw new Error(`Unknown method: ${method}`)
    }

    return { jsonrpc: '2.0' as const, id, result }
  } catch (error) {
    return {
      jsonrpc: '2.0' as const,
      id,
      error: { code: -32603, message: error instanceof Error ? error.message : 'Unknown error', data: error }
    }
  }
}

