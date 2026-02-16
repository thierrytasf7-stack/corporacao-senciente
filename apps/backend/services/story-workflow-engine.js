/**
 * Story Workflow Engine
 * 
 * Motor de execução automática de stories via Aider
 * Implementa workflow em 6 steps com pausa para revisão humana
 * 
 * Fases:
 * 1. BACKLOG → Aguardando início
 * 2. PLANNING (Steps 1-3) → Automático via Aider
 * 3. REVIEW_PENDING → Pausa para revisão humana
 * 4. EXECUTION (Steps 4-6) → Automático via Aider
 * 5. DONE → Completo
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class StoryWorkflowEngine {
  constructor() {
    this.activeWorkflows = new Map();
    this.storiesDir = 'docs/stories';
    this.logsDir = 'logs/workflows';
    
    // Garantir que diretórios existem
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      if (!existsSync(this.storiesDir)) {
        await mkdir(this.storiesDir, { recursive: true });
      }
      if (!existsSync(this.logsDir)) {
        await mkdir(this.logsDir, { recursive: true });
      }
    } catch (error) {
      console.error('[Workflow] Error creating directories:', error);
    }
  }

  /**
   * Inicia workflow (Steps 1-3)
   */
  async startWorkflow(storyId) {
    console.log(`[Workflow] Starting workflow for story ${storyId}`);
    
    const story = await this.getStory(storyId);
    
    if (story.status !== 'backlog') {
      throw new Error(`Story must be in backlog status. Current: ${story.status}`);
    }
    
    // Atualiza estado
    story.status = 'planning';
    story.workflowState = {
      phase: 'planning',
      startedAt: new Date().toISOString(),
      pausedAt: null,
      resumedAt: null,
      completedAt: null,
      steps: {}
    };
    
    await this.saveStory(story);
    
    // Executa steps 1-3 em sequência
    try {
      await this.executeStep(story, 1); // Análise
      await this.executeStep(story, 2); // Design
      await this.executeStep(story, 3); // Implementação
      
      // Pausa para revisão
      story.status = 'review_pending';
      story.workflowState.phase = 'review_pending';
      story.workflowState.pausedAt = new Date().toISOString();
      story.currentStep = null;
      
      await this.saveStory(story);
      
      console.log(`[Workflow] Story ${storyId} paused for review`);
      return story;
      
    } catch (error) {
      console.error(`[Workflow] Error in planning phase:`, error);
      story.status = 'backlog';
      story.workflowState.phase = 'failed';
      await this.saveStory(story);
      throw error;
    }
  }

  /**
   * Continua workflow (Steps 4-6)
   */
  async continueWorkflow(storyId) {
    console.log(`[Workflow] Continuing workflow for story ${storyId}`);
    
    const story = await this.getStory(storyId);
    
    if (story.status !== 'review_pending') {
      throw new Error(`Story must be in review_pending status. Current: ${story.status}`);
    }
    
    // Atualiza estado
    story.status = 'execution';
    story.workflowState.phase = 'execution';
    story.workflowState.resumedAt = new Date().toISOString();
    
    await this.saveStory(story);
    
    // Executa steps 4-6 em sequência
    try {
      await this.executeStep(story, 4); // Testes
      await this.executeStep(story, 5); // Review IA
      await this.executeStep(story, 6); // Deploy
      
      // Finaliza
      story.status = 'done';
      story.workflowState.phase = 'done';
      story.workflowState.completedAt = new Date().toISOString();
      story.currentStep = null;
      
      await this.saveStory(story);
      
      console.log(`[Workflow] Story ${storyId} completed`);
      return story;
      
    } catch (error) {
      console.error(`[Workflow] Error in execution phase:`, error);
      story.status = 'review_pending';
      story.workflowState.phase = 'failed';
      await this.saveStory(story);
      throw error;
    }
  }

  /**
   * Executa um step via Aider
   */
  async executeStep(story, stepNumber) {
    const stepConfig = this.getStepConfig(stepNumber);
    
    console.log(`[Workflow] Executing step ${stepNumber}: ${stepConfig.name}`);
    
    story.currentStep = stepNumber;
    story.workflowState.steps[stepNumber] = {
      status: 'running',
      startedAt: new Date().toISOString(),
      completedAt: null,
      output: null,
      error: null
    };
    
    await this.saveStory(story);
    
    try {
      // Chama Aider
      const result = await this.callAider(story, stepConfig);
      
      story.workflowState.steps[stepNumber].status = 'completed';
      story.workflowState.steps[stepNumber].completedAt = new Date().toISOString();
      story.workflowState.steps[stepNumber].output = result.output;
      
      // Atualiza sessão Aider
      if (!story.aiderSession) {
        story.aiderSession = {
          sessionId: result.sessionId,
          model: result.model,
          filesModified: [],
          commits: [],
          logs: []
        };
      }
      
      story.aiderSession.filesModified.push(...result.filesModified);
      story.aiderSession.commits.push(...result.commits);
      story.aiderSession.logs.push(result.log);
      
      await this.saveStory(story);
      
      console.log(`[Workflow] Step ${stepNumber} completed successfully`);
      
    } catch (error) {
      console.error(`[Workflow] Step ${stepNumber} failed:`, error);
      
      story.workflowState.steps[stepNumber].status = 'failed';
      story.workflowState.steps[stepNumber].error = error.message;
      
      await this.saveStory(story);
      throw error;
    }
  }

  /**
   * Configuração de cada step
   */
  getStepConfig(stepNumber) {
    const configs = {
      1: {
        name: 'Análise de Requisitos',
        prompt: 'Analise os requisitos da story e crie um plano detalhado de implementação',
        model: 'deepseek/deepseek-v3',
        timeout: 300000 // 5 minutos
      },
      2: {
        name: 'Design Técnico',
        prompt: 'Crie o design técnico e arquitetura da solução baseado na análise',
        model: 'deepseek/deepseek-v3',
        timeout: 300000
      },
      3: {
        name: 'Implementação',
        prompt: 'Implemente a solução conforme o design técnico',
        model: 'google/gemini-2.0-flash-exp:free',
        timeout: 600000 // 10 minutos
      },
      4: {
        name: 'Testes Automatizados',
        prompt: 'Crie e execute testes automatizados para a implementação',
        model: 'google/gemini-2.0-flash-exp:free',
        timeout: 300000
      },
      5: {
        name: 'Code Review IA',
        prompt: 'Revise o código implementado e sugira melhorias',
        model: 'deepseek/deepseek-r1-distill-qwen-32b',
        timeout: 300000
      },
      6: {
        name: 'Deploy/Finalização',
        prompt: 'Finalize a implementação e prepare para deploy',
        model: 'google/gemini-2.0-flash-exp:free',
        timeout: 300000
      }
    };
    
    return configs[stepNumber];
  }

  /**
   * Chama Aider para executar step
   */
  async callAider(story, stepConfig) {
    const prompt = this.buildPrompt(story, stepConfig);
    
    // Salva prompt em arquivo para log
    const logFile = path.join(this.logsDir, `${story.id}-step-${story.currentStep}.log`);
    await writeFile(logFile, `Prompt:\n${prompt}\n\n`, 'utf-8');
    
    // Comando Aider
    const command = `aider --model ${stepConfig.model} --message "${prompt.replace(/"/g, '\\"')}" --yes`;
    
    console.log(`[Workflow] Running Aider with model ${stepConfig.model}`);
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: stepConfig.timeout,
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });
      
      // Salva output completo
      await writeFile(logFile, `\n\nOutput:\n${stdout}\n\nErrors:\n${stderr}`, { flag: 'a' });
      
      return {
        sessionId: `session-${Date.now()}`,
        model: stepConfig.model,
        output: stdout,
        filesModified: this.extractFilesFromOutput(stdout),
        commits: this.extractCommitsFromOutput(stdout),
        log: stdout
      };
      
    } catch (error) {
      // Salva erro
      await writeFile(logFile, `\n\nError:\n${error.message}`, { flag: 'a' });
      throw error;
    }
  }

  /**
   * Constrói prompt para Aider
   */
  buildPrompt(story, stepConfig) {
    return `
# Story: ${story.title}

## Description
${story.description}

## Category
${story.category}

## Complexity
${story.complexity}

## Priority
${story.priority}

## Acceptance Criteria
${story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Technical Notes
${story.technicalNotes || 'None'}

## Task
${stepConfig.prompt}

## Instructions
- Follow best practices
- Write clean, maintainable code
- Add comments where necessary
- Ensure all acceptance criteria are met
`.trim();
  }

  /**
   * Extrai arquivos modificados do output do Aider
   */
  extractFilesFromOutput(output) {
    const files = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Aider mostra arquivos modificados como "Modified: path/to/file"
      if (line.includes('Modified:') || line.includes('Created:')) {
        const match = line.match(/(?:Modified|Created):\s+(.+)/);
        if (match) {
          files.push(match[1].trim());
        }
      }
    }
    
    return files;
  }

  /**
   * Extrai commits do output do Aider
   */
  extractCommitsFromOutput(output) {
    const commits = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Aider mostra commits como "Commit: hash message"
      if (line.includes('Commit:')) {
        const match = line.match(/Commit:\s+(.+)/);
        if (match) {
          commits.push(match[1].trim());
        }
      }
    }
    
    return commits;
  }

  /**
   * Busca story do arquivo
   */
  async getStory(storyId) {
    const filePath = path.join(this.storiesDir, `${storyId}.json`);
    
    if (!existsSync(filePath)) {
      throw new Error(`Story ${storyId} not found`);
    }
    
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Salva story no arquivo
   */
  async saveStory(story) {
    const filePath = path.join(this.storiesDir, `${story.id}.json`);
    story.updatedAt = new Date().toISOString();
    await writeFile(filePath, JSON.stringify(story, null, 2), 'utf-8');
  }

  /**
   * Lista todas as stories
   */
  async listStories() {
    const { readdir } = await import('fs/promises');
    
    if (!existsSync(this.storiesDir)) {
      return [];
    }
    
    const files = await readdir(this.storiesDir);
    const stories = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const story = await this.getStory(file.replace('.json', ''));
          stories.push(story);
        } catch (error) {
          console.error(`[Workflow] Error loading story ${file}:`, error);
        }
      }
    }
    
    return stories;
  }
}

export default StoryWorkflowEngine;
