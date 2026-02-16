#!/usr/bin/env node
/**
 * Aider MCP Bridge - Diana Corporação Senciente
 * 
 * Bridge MCP para integração do Aider com AIOS Squads
 * Permite executar comandos Aider via MCP protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// Configuração
const AIDER_PATH = process.env.AIDER_PATH || 'aider';
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || process.cwd();
const SQUAD_CONTEXT_FILE = join(WORKSPACE_ROOT, '.squad_context.json');

/**
 * Servidor MCP para Aider
 */
class AiderMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'aider-bridge',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'aider_execute',
          description: 'Executa comando Aider com arquivos e prompt',
          inputSchema: {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: { type: 'string' },
                description: 'Lista de arquivos para o Aider processar',
              },
              prompt: {
                type: 'string',
                description: 'Prompt/instrução para o Aider',
              },
              model: {
                type: 'string',
                description: 'Modelo LLM a usar (opcional)',
                default: 'claude-sonnet-4',
              },
              auto_commit: {
                type: 'boolean',
                description: 'Auto-commit mudanças',
                default: true,
              },
            },
            required: ['files', 'prompt'],
          },
        },
        {
          name: 'aider_squad_execute',
          description: 'Executa tarefa usando squad context do Aider',
          inputSchema: {
            type: 'object',
            properties: {
              task_type: {
                type: 'string',
                enum: ['refactor', 'test', 'document', 'fix', 'feature'],
                description: 'Tipo de tarefa',
              },
              files: {
                type: 'array',
                items: { type: 'string' },
                description: 'Arquivos alvo',
              },
              description: {
                type: 'string',
                description: 'Descrição da tarefa',
              },
              squad_id: {
                type: 'string',
                description: 'ID do squad (opcional)',
              },
            },
            required: ['task_type', 'files', 'description'],
          },
        },
        {
          name: 'aider_status',
          description: 'Verifica status e configuração do Aider',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'aider_list_models',
          description: 'Lista modelos LLM disponíveis no Aider',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'squad_create_context',
          description: 'Cria contexto de squad para workspace',
          inputSchema: {
            type: 'object',
            properties: {
              squad_type: {
                type: 'string',
                enum: ['developer', 'qa', 'documentation', 'security'],
                description: 'Tipo de squad',
              },
              worker_id: {
                type: 'string',
                description: 'ID do worker',
              },
              tools: {
                type: 'array',
                items: { type: 'string' },
                description: 'Ferramentas disponíveis',
              },
            },
            required: ['squad_type', 'worker_id'],
          },
        },
      ],
    }));

    // Executar ferramenta
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'aider_execute':
            return await this.executeAider(args);
          
          case 'aider_squad_execute':
            return await this.executeSquadTask(args);
          
          case 'aider_status':
            return await this.getAiderStatus();
          
          case 'aider_list_models':
            return await this.listModels();
          
          case 'squad_create_context':
            return await this.createSquadContext(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Executa comando Aider
   */
  async executeAider(args) {
    const { files, prompt, model = 'claude-sonnet-4', auto_commit = true } = args;

    // Construir comando
    const filesArg = files.map(f => `"${f}"`).join(' ');
    const modelArg = model ? `--model ${model}` : '';
    const commitArg = auto_commit ? '--auto-commits' : '--no-auto-commits';
    const messageArg = `--message "${prompt.replace(/"/g, '\\"')}"`;

    const command = `${AIDER_PATH} ${filesArg} ${modelArg} ${commitArg} ${messageArg} --yes`;

    console.error(`[Aider MCP] Executing: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: WORKSPACE_ROOT,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              output: stdout,
              errors: stderr || null,
              files_modified: files,
              command: command,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message,
              stdout: error.stdout || '',
              stderr: error.stderr || '',
              command: command,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Executa tarefa usando squad context
   */
  async executeSquadTask(args) {
    const { task_type, files, description, squad_id } = args;

    // Carregar squad context se existir
    let squadContext = null;
    try {
      const contextData = await readFile(SQUAD_CONTEXT_FILE, 'utf-8');
      squadContext = JSON.parse(contextData);
    } catch (error) {
      console.error('[Aider MCP] No squad context found, creating default...');
    }

    // Construir prompt baseado no tipo de tarefa
    const prompts = {
      refactor: `Refatorar o código: ${description}. Manter funcionalidade, melhorar legibilidade e performance.`,
      test: `Criar testes unitários: ${description}. Cobrir casos principais e edge cases.`,
      document: `Adicionar documentação: ${description}. Incluir docstrings, type hints e comentários.`,
      fix: `Corrigir bug: ${description}. Identificar causa raiz e implementar solução robusta.`,
      feature: `Implementar feature: ${description}. Seguir padrões do projeto e adicionar testes.`,
    };

    const prompt = prompts[task_type] || description;

    // Executar via Aider
    return await this.executeAider({
      files,
      prompt,
      model: squadContext?.preferred_model || 'claude-sonnet-4',
      auto_commit: true,
    });
  }

  /**
   * Verifica status do Aider
   */
  async getAiderStatus() {
    try {
      const { stdout } = await execAsync(`${AIDER_PATH} --version`);
      
      // Verificar se há squad context
      let squadContext = null;
      try {
        const contextData = await readFile(SQUAD_CONTEXT_FILE, 'utf-8');
        squadContext = JSON.parse(contextData);
      } catch (error) {
        // Sem contexto
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              aider_installed: true,
              version: stdout.trim(),
              workspace_root: WORKSPACE_ROOT,
              squad_context: squadContext,
              aider_path: AIDER_PATH,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              aider_installed: false,
              error: error.message,
              suggestion: 'Install Aider: pip install aider-chat',
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Lista modelos disponíveis
   */
  async listModels() {
    try {
      const { stdout } = await execAsync(`${AIDER_PATH} --models`);
      
      return {
        content: [
          {
            type: 'text',
            text: stdout,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing models: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Cria contexto de squad
   */
  async createSquadContext(args) {
    const { squad_type, worker_id, tools = ['aider', 'git', 'python', 'typescript'] } = args;

    const context = {
      worker_id,
      squad_type,
      description: `Squad ${squad_type} - Worker ${worker_id}`,
      tools,
      preferred_model: 'claude-sonnet-4',
      auto_commit: true,
      created_at: new Date().toISOString(),
    };

    try {
      await writeFile(SQUAD_CONTEXT_FILE, JSON.stringify(context, null, 2));
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              context,
              file: SQUAD_CONTEXT_FILE,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating squad context: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[Aider MCP] Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[Aider MCP] Server running on stdio');
  }
}

// Iniciar servidor
const server = new AiderMCPServer();
server.run().catch((error) => {
  console.error('[Aider MCP] Fatal error:', error);
  process.exit(1);
});
