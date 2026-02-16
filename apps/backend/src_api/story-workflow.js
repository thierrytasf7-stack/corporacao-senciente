/**
 * API de Story Workflow
 * 
 * Endpoints para controle de workflow automático de stories
 * 
 * @module story-workflow
 * @version 1.0.0
 * @see {@link ../docs/API_STORIES.md} Documentação completa da API
 * 
 * Endpoints disponíveis:
 * - POST /api/stories - Cria nova story
 * - GET /api/stories - Lista stories (com filtros opcionais)
 * - GET /api/stories/:id - Detalhes de uma story
 * - PUT /api/stories/:id - Atualiza story
 * - DELETE /api/stories/:id - Deleta story
 * - POST /api/stories/:id/start - Inicia workflow (Steps 1-3)
 * - POST /api/stories/:id/continue - Continua workflow (Steps 4-6)
 * - GET /api/stories/:id/workflow-status - Status do workflow
 * 
 * @example
 * // Criar story
 * POST /api/stories
 * Body: { "title": "Feature X", "description": "Implementar X" }
 * 
 * @example
 * // Iniciar workflow
 * POST /api/stories/story-abc123/start
 */

import StoryWorkflowEngine from '../services/story-workflow-engine.js';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import path from 'path';

const engine = new StoryWorkflowEngine();

// Cache em memória para stories (otimização de performance)
let storiesCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5000; // 5 segundos

/**
 * Invalida cache de stories
 * Chamado após create, update, delete
 */
function invalidateCache() {
  storiesCache = null;
  cacheTimestamp = null;
}

/**
 * Retorna stories do cache ou carrega do disco
 * @returns {Promise<Array>} Lista de stories
 */
async function getCachedStories() {
  const now = Date.now();
  
  // Cache válido
  if (storiesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    return storiesCache;
  }
  
  // Cache expirado ou inexistente - recarregar
  storiesCache = await engine.listStories();
  cacheTimestamp = now;
  
  return storiesCache;
}

/**
 * POST /api/stories/:id/start
 * Inicia workflow automático (Steps 1-3)
 * 
 * @param {Object} req - Express request
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Story ID
 * @param {Object} res - Express response
 * @returns {Object} JSON response com story atualizada
 * 
 * @example
 * POST /api/stories/story-abc123/start
 * Response: {
 *   "success": true,
 *   "story": { "id": "story-abc123", "status": "review_pending", ... },
 *   "message": "Workflow started successfully"
 * }
 */
export async function startStoryWorkflow(req, res) {
  try {
    const { id } = req.params;
    
    console.log(`[API] Starting workflow for story ${id}`);
    
    const story = await engine.startWorkflow(id);
    
    res.json({
      success: true,
      story,
      message: 'Workflow started successfully. Story is now in review_pending phase.'
    });
    
  } catch (error) {
    console.error(`[API] Error starting workflow:`, error);
    
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/stories/:id/continue
 * Continua workflow automático (Steps 4-6)
 * 
 * @param {Object} req - Express request
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Story ID
 * @param {Object} res - Express response
 * @returns {Object} JSON response com story concluída
 * 
 * @example
 * POST /api/stories/story-abc123/continue
 * Response: {
 *   "success": true,
 *   "story": { "id": "story-abc123", "status": "done", ... },
 *   "message": "Workflow completed successfully"
 * }
 */
export async function continueStoryWorkflow(req, res) {
  try {
    const { id } = req.params;
    
    console.log(`[API] Continuing workflow for story ${id}`);
    
    const story = await engine.continueWorkflow(id);
    
    res.json({
      success: true,
      story,
      message: 'Workflow completed successfully. Story is now done.'
    });
    
  } catch (error) {
    console.error(`[API] Error continuing workflow:`, error);
    
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/stories/:id/workflow-status
 * Retorna status atual do workflow
 * 
 * @param {Object} req - Express request
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Story ID
 * @param {Object} res - Express response
 * @returns {Object} JSON response com status do workflow
 * 
 * @example
 * GET /api/stories/story-abc123/workflow-status
 * Response: {
 *   "success": true,
 *   "workflowState": "awaiting_review",
 *   "currentStep": 3,
 *   "status": "review_pending"
 * }
 */
export async function getWorkflowStatus(req, res) {
  try {
    const { id } = req.params;
    
    const story = await engine.getStory(id);
    
    res.json({
      success: true,
      workflowState: story.workflowState || null,
      currentStep: story.currentStep || null,
      status: story.status,
      aiderSession: story.aiderSession || null
    });
    
  } catch (error) {
    console.error(`[API] Error getting workflow status:`, error);
    
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/stories
 * Cria nova story
 * 
 * @param {Object} req - Express request
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Título da story (obrigatório)
 * @param {string} req.body.description - Descrição da story (obrigatório)
 * @param {string} [req.body.category='feature'] - Categoria (feature, bug, task, etc.)
 * @param {string} [req.body.complexity='standard'] - Complexidade (simple, standard, complex)
 * @param {string} [req.body.priority='medium'] - Prioridade (low, medium, high, critical)
 * @param {string[]} [req.body.acceptanceCriteria=[]] - Critérios de aceitação
 * @param {string} [req.body.technicalNotes=''] - Notas técnicas
 * @param {Object} res - Express response
 * @returns {Object} JSON response com story criada
 * 
 * @example
 * POST /api/stories
 * Body: {
 *   "title": "Implementar autenticação",
 *   "description": "Sistema de login com JWT",
 *   "category": "feature",
 *   "priority": "high"
 * }
 * Response: {
 *   "success": true,
 *   "story": { "id": "story-abc123", ... }
 * }
 */
export async function createStory(req, res) {
  try {
    const {
      title,
      description,
      category = 'feature',
      complexity = 'standard',
      priority = 'medium',
      acceptanceCriteria = [],
      technicalNotes = ''
    } = req.body;
    
    // Validação
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }
    
    // Cria story
    const story = {
      id: `story-${randomUUID().slice(0, 8)}`,
      title,
      description,
      category,
      complexity,
      priority,
      status: 'backlog',
      currentStep: null,
      workflowState: null,
      aiderSession: null,
      acceptanceCriteria,
      technicalNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedAgent: null
    };
    
    await engine.saveStory(story);
    
    // Invalidar cache após criar story
    invalidateCache();
    
    console.log(`[API] Story created: ${story.id}`);
    
    res.json({
      success: true,
      story
    });
    
  } catch (error) {
    console.error(`[API] Error creating story:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/stories
 * Lista todas as stories com filtros opcionais
 * 
 * @param {Object} req - Express request
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.status] - Filtrar por status
 * @param {string} [req.query.category] - Filtrar por categoria
 * @param {string} [req.query.priority] - Filtrar por prioridade
 * @param {Object} res - Express response
 * @returns {Object} JSON response com lista de stories
 * 
 * @example
 * GET /api/stories?status=backlog&priority=high
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "total": 42
 * }
 */
export async function getStories(req, res) {
  try {
    const stories = await getCachedStories();
    
    // Filtros opcionais (otimizado: filtro único em vez de 3 iterações)
    const { status, category, priority } = req.query;
    
    let filtered = stories;
    
    // Aplicar todos os filtros em uma única iteração
    if (status || category || priority) {
      filtered = stories.filter(s => {
        if (status && s.status !== status) return false;
        if (category && s.category !== category) return false;
        if (priority && s.priority !== priority) return false;
        return true;
      });
    }
    
    res.json({
      success: true,
      data: filtered,  // Frontend espera "data", não "stories"
      total: filtered.length
    });
    
  } catch (error) {
    console.error(`[API] Error listing stories:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/stories/:id
 * Retorna detalhes de uma story
 * 
 * @param {Object} req - Express request
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Story ID
 * @param {Object} res - Express response
 * @returns {Object} JSON response com detalhes da story
 * 
 * @example
 * GET /api/stories/story-abc123
 * Response: {
 *   "success": true,
 *   "story": { "id": "story-abc123", ... }
 * }
 */
export async function getStory(req, res) {
  try {
    const { id } = req.params;
    
    const story = await engine.getStory(id);
    
    res.json({
      success: true,
      story
    });
    
  } catch (error) {
    console.error(`[API] Error getting story:`, error);
    
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * PUT /api/stories/:id
 * Atualiza uma story
 * 
 * @param {Object} req - Express request
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Story ID
 * @param {Object} req.body - Campos a atualizar
 * @param {Object} res - Express response
 * @returns {Object} JSON response com story atualizada
 * 
 * Campos atualizáveis:
 * - title, description, category, complexity, priority
 * - acceptanceCriteria, technicalNotes
 * 
 * @example
 * PUT /api/stories/story-abc123
 * Body: { "priority": "critical", "title": "Novo título" }
 * Response: {
 *   "success": true,
 *   "story": { "id": "story-abc123", ... }
 * }
 */
export async function updateStory(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const story = await engine.getStory(id);
    
    // Atualiza campos permitidos
    const allowedFields = [
      'title',
      'description',
      'category',
      'complexity',
      'priority',
      'acceptanceCriteria',
      'technicalNotes'
    ];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        story[field] = updates[field];
      }
    }
    
    await engine.saveStory(story);
    
    // Invalidar cache após atualizar story
    invalidateCache();
    
    console.log(`[API] Story updated: ${id}`);
    
    res.json({
      success: true,
      story
    });
    
  } catch (error) {
    console.error(`[API] Error updating story:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * DELETE /api/stories/:id
 * Deleta uma story
 * 
 * @param {Object} req - Express request
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Story ID
 * @param {Object} res - Express response
 * @returns {Object} JSON response confirmando deleção
 * 
 * @example
 * DELETE /api/stories/story-abc123
 * Response: {
 *   "success": true,
 *   "message": "Story deleted successfully"
 * }
 */
export async function deleteStory(req, res) {
  try {
    const { id } = req.params;
    
    const filePath = path.join('docs/stories', `${id}.json`);
    await unlink(filePath);
    
    // Invalidar cache após deletar story
    invalidateCache();
    
    console.log(`[API] Story deleted: ${id}`);
    
    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
    
  } catch (error) {
    console.error(`[API] Error deleting story:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
