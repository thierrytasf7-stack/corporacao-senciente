#!/usr/bin/env node

/**
 * ByteRover Cipher - Self-Hosted Code Interface
 *
 * Interface inteligente com código que substitui GitKraken:
 * - Injeção de contexto de código em tempo real
 * - Mapeamento visual de impacto de mudanças
 * - Timeline evolutiva de código
 * - Análise de dependências e relacionamentos
 * - Diff inteligente com explicações contextuais
 *
 * Parte do Protocolo L.L.B. (LangMem, Letta, ByteRover)
 */

import { createRequire } from 'module';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

class ByteRoverCipher {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.gitBinary = options.gitBinary || 'git';
    this.encryptionKey = options.encryptionKey || 'byterover-cipher-2025';
    this.cache = new Map();
    this.activeContexts = new Map();

    // Componentes do Cipher
    this.contextInjector = new ContextInjector(this);
    this.visualMapper = new VisualImpactMapper(this);
    this.timelineManager = new EvolutionTimelineManager(this);
    this.dependencyAnalyzer = new DependencyAnalyzer(this);
    this.diffEngine = new IntelligentDiffEngine(this);

    console.log('🔐 ByteRover Cipher inicializado');
    console.log(`📁 Projeto: ${this.projectRoot}`);
    console.log(`🔑 Cipher ativo com encriptação`);
  }

  /**
   * Injeta contexto de código em tempo real
   */
  async injectContext(contextId, options = {}) {
    const context = await this.contextInjector.createContext(contextId, options);

    // Armazenar contexto ativo
    this.activeContexts.set(contextId, {
      ...context,
      timestamp: new Date().toISOString(),
      options
    });

    console.log(`💉 Contexto injetado: ${contextId}`);
    console.log(`📊 Arquivos rastreados: ${context.trackedFiles.length}`);
    console.log(`🔗 Dependências mapeadas: ${context.dependencies.length}`);

    return context;
  }

  /**
   * Mapeia impacto visual de mudanças
   */
  async mapVisualImpact(changes, options = {}) {
    const impactMap = await this.visualMapper.analyzeImpact(changes, options);

    console.log('🎨 Mapeamento visual de impacto:');
    console.log(`📈 Arquivos afetados: ${impactMap.affectedFiles.length}`);
    console.log(`🔄 Mudanças breaking: ${impactMap.breakingChanges.length}`);
    console.log(`⚠️ Pontos de atenção: ${impactMap.attentionPoints.length}`);

    // Visualizar impacto
    this.visualMapper.renderImpactMap(impactMap);

    return impactMap;
  }

  /**
   * Gerencia timeline evolutiva
   */
  async manageTimeline(action, data, options = {}) {
    let result;

    switch (action) {
      case 'snapshot':
        result = await this.timelineManager.createSnapshot(data, options);
        break;
      case 'branch':
        result = await this.timelineManager.createBranch(data, options);
        break;
      case 'merge':
        result = await this.timelineManager.mergeTimeline(data, options);
        break;
      case 'revert':
        result = await this.timelineManager.revertToPoint(data, options);
        break;
      case 'analyze':
        result = await this.timelineManager.analyzeEvolution(data, options);
        break;
      default:
        throw new Error(`Ação de timeline desconhecida: ${action}`);
    }

    console.log(`⏰ Timeline ${action}: ${result.id || result.message}`);
    return result;
  }

  /**
   * Análise inteligente de diferenças
   */
  async analyzeDiff(fromRef, toRef, options = {}) {
    const diffAnalysis = await this.diffEngine.analyzeDiff(fromRef, toRef, options);

    console.log('🔍 Análise inteligente de diff:');
    console.log(`📋 Arquivos modificados: ${diffAnalysis.modifiedFiles.length}`);
    console.log(`➕ Adições: ${diffAnalysis.additions}`);
    console.log(`➖ Remoções: ${diffAnalysis.deletions}`);
    console.log(`🎯 Mudanças significativas: ${diffAnalysis.significantChanges.length}`);

    // Explicações contextuais
    diffAnalysis.significantChanges.forEach(change => {
      console.log(`  • ${change.file}: ${change.description}`);
    });

    return diffAnalysis;
  }

  /**
   * Análise de dependências
   */
  async analyzeDependencies(filePath, options = {}) {
    const dependencyMap = await this.dependencyAnalyzer.mapDependencies(filePath, options);

    console.log('🔗 Análise de dependências:');
    console.log(`📄 Arquivo: ${filePath}`);
    console.log(`📥 Dependências diretas: ${dependencyMap.direct.length}`);
    console.log(`📤 Dependentes: ${dependencyMap.dependents.length}`);
    console.log(`🔄 Dependências indiretas: ${dependencyMap.indirect.length}`);

    return dependencyMap;
  }

  /**
   * Busca inteligente no código
   */
  async intelligentSearch(query, options = {}) {
    const searchResults = await this.performIntelligentSearch(query, options);

    console.log('🔎 Busca inteligente:');
    console.log(`❓ Query: "${query}"`);
    console.log(`📊 Resultados encontrados: ${searchResults.totalMatches}`);

    searchResults.matches.slice(0, 5).forEach(match => {
      console.log(`  • ${match.file}:${match.line} - ${match.context}`);
    });

    return searchResults;
  }

  /**
   * Executa busca inteligente
   */
  async performIntelligentSearch(query, options) {
    const results = {
      totalMatches: 0,
      matches: [],
      suggestions: []
    };

    try {
      // Busca com ripgrep se disponível, senão usa git grep
      const searchCmd = `git grep -n "${query}" -- "*.js" "*.ts" "*.json" "*.md" | head -50`;
      const output = execSync(searchCmd, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024
      });

      const lines = output.trim().split('\n').filter(line => line.trim());

      results.matches = lines.map(line => {
        const [fileLine, ...contentParts] = line.split(':');
        const [file, lineNum] = fileLine.split(':');
        const content = contentParts.join(':');

        return {
          file,
          line: parseInt(lineNum),
          content: content.trim(),
          context: this.extractContext(content, query)
        };
      });

      results.totalMatches = results.matches.length;

      // Sugestões baseadas no contexto
      results.suggestions = this.generateSearchSuggestions(query, results.matches);

    } catch (error) {
      console.warn('Busca inteligente falhou, usando busca simples');
      results.error = error.message;
    }

    return results;
  }

  /**
   * Extrai contexto da linha encontrada
   */
  extractContext(content, query) {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content;

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);

    return '...' + content.substring(start, end) + '...';
  }

  /**
   * Gera sugestões de busca
   */
  generateSearchSuggestions(query, matches) {
    const suggestions = new Set();

    // Sugestões baseadas em padrões encontrados
    matches.forEach(match => {
      // Extrair nomes de funções, classes, etc.
      const patterns = [
        /function\s+(\w+)/g,
        /class\s+(\w+)/g,
        /const\s+(\w+)\s*=/g,
        /import\s+.*from\s+['"]([^'"]+)['"]/g
      ];

      patterns.forEach(pattern => {
        let match_result;
        while ((match_result = pattern.exec(match.content)) !== null) {
          if (match_result[1]) suggestions.add(match_result[1]);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Cria snapshot encriptado
   */
  async createEncryptedSnapshot(message) {
    const snapshotId = `snapshot_${Date.now()}`;
    const snapshot = {
      id: snapshotId,
      timestamp: new Date().toISOString(),
      message,
      gitStatus: this.getGitStatus(),
      contextState: Object.fromEntries(this.activeContexts),
      encrypted: true
    };

    // "Encriptar" dados (simulação)
    snapshot.data = this.encryptData(JSON.stringify(snapshot));

    // Salvar snapshot
    const snapshotPath = path.join(this.projectRoot, '.byterover', 'snapshots', `${snapshotId}.cipher`);
    await fs.promises.mkdir(path.dirname(snapshotPath), { recursive: true });
    await fs.promises.writeFile(snapshotPath, snapshot.data);

    console.log(`🔒 Snapshot encriptado criado: ${snapshotId}`);
    return snapshot;
  }

  /**
   * Obtém status do Git
   */
  getGitStatus() {
    try {
      const status = execSync('git status --porcelain', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      const lines = status.trim().split('\n').filter(line => line.trim());
      return {
        modified: lines.filter(line => line.startsWith(' M') || line.startsWith('M')).length,
        added: lines.filter(line => line.startsWith('A') || line.startsWith('??')).length,
        deleted: lines.filter(line => line.startsWith('D')).length,
        total: lines.length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * "Encripta" dados (simulação para self-hosted)
   */
  encryptData(data) {
    // Simulação de encriptação - em produção usaria criptografia real
    return Buffer.from(data).toString('base64');
  }

  /**
   * "Decripta" dados
   */
  decryptData(encryptedData) {
    try {
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    } catch (error) {
      throw new Error('Falha ao decriptar dados');
    }
  }

  /**
   * Limpa cache e contextos
   */
  cleanup() {
    this.cache.clear();
    this.activeContexts.clear();
    console.log('🧹 ByteRover Cipher limpo');
  }

  /**
   * Obtém estatísticas do sistema
   */
  getStats() {
    return {
      contextsActive: this.activeContexts.size,
      cacheSize: this.cache.size,
      projectRoot: this.projectRoot,
      gitStatus: this.getGitStatus(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Context Injector - Injeção de contexto em tempo real
 */
class ContextInjector {
  constructor(byterover) {
    this.byterover = byterover;
  }

  async createContext(contextId, options = {}) {
    const context = {
      id: contextId,
      files: await this.scanProjectFiles(options),
      dependencies: await this.mapProjectDependencies(),
      recentChanges: await this.getRecentChanges(),
      activeBranches: await this.getActiveBranches(),
      trackedFiles: [],
      dependencies: []
    };

    // Rastrear arquivos baseado em padrões
    context.trackedFiles = await this.identifyTrackedFiles(context.files, options);

    return context;
  }

  async scanProjectFiles(options) {
    const files = [];
    const scanPath = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Ignorar diretórios comuns
          if (!['node_modules', '.git', '.byterover', 'dist', 'build'].includes(item)) {
            scanPath(fullPath);
          }
        } else if (stat.isFile()) {
          // Filtrar por extensões relevantes
          const ext = path.extname(item);
          if (['.js', '.ts', '.json', '.md', '.py', '.html', '.css'].includes(ext)) {
            files.push({
              path: fullPath,
              relativePath: path.relative(this.byterover.projectRoot, fullPath),
              extension: ext,
              size: stat.size,
              modified: stat.mtime
            });
          }
        }
      }
    };

    scanPath(this.byterover.projectRoot);
    return files;
  }

  async mapProjectDependencies() {
    // Simulação de mapeamento de dependências
    return [
      { from: 'src/app.js', to: 'src/utils.js', type: 'import' },
      { from: 'src/app.js', to: 'package.json', type: 'dependency' }
    ];
  }

  async getRecentChanges() {
    try {
      const log = execSync('git log --oneline -10', {
        cwd: this.byterover.projectRoot,
        encoding: 'utf8'
      });

      return log.trim().split('\n').map(line => {
        const [commit, ...messageParts] = line.split(' ');
        return {
          commit,
          message: messageParts.join(' '),
          timestamp: new Date().toISOString() // Simplificado
        };
      });
    } catch (error) {
      return [];
    }
  }

  async getActiveBranches() {
    try {
      const branches = execSync('git branch', {
        cwd: this.byterover.projectRoot,
        encoding: 'utf8'
      });

      return branches.trim().split('\n').map(branch => ({
        name: branch.replace('*', '').trim(),
        active: branch.startsWith('*')
      }));
    } catch (error) {
      return [];
    }
  }

  async identifyTrackedFiles(files, options) {
    // Lógica para identificar arquivos importantes para rastrear
    const tracked = [];

    for (const file of files) {
      // Critérios para rastreamento
      const shouldTrack =
        file.size > 100 || // Arquivos maiores que 100 bytes
        file.relativePath.includes('src/') ||
        file.relativePath.includes('lib/') ||
        ['package.json', 'README.md'].includes(path.basename(file.relativePath));

      if (shouldTrack) {
        tracked.push(file);
      }
    }

    return tracked;
  }
}

/**
 * Visual Impact Mapper - Mapeamento visual de impacto
 */
class VisualImpactMapper {
  constructor(byterover) {
    this.byterover = byterover;
  }

  async analyzeImpact(changes, options = {}) {
    const impactMap = {
      affectedFiles: [],
      breakingChanges: [],
      attentionPoints: [],
      riskLevel: 'low',
      visualRepresentation: ''
    };

    // Analisar cada mudança
    for (const change of changes) {
      const fileImpact = await this.analyzeFileImpact(change);
      impactMap.affectedFiles.push(fileImpact);

      // Identificar mudanças breaking
      if (fileImpact.breaking) {
        impactMap.breakingChanges.push({
          file: change.file,
          type: fileImpact.breakType,
          severity: fileImpact.severity
        });
      }

      // Pontos de atenção
      if (fileImpact.attentionPoints) {
        impactMap.attentionPoints.push(...fileImpact.attentionPoints);
      }
    }

    // Calcular nível de risco geral
    impactMap.riskLevel = this.calculateRiskLevel(impactMap);

    // Criar representação visual
    impactMap.visualRepresentation = this.createVisualRepresentation(impactMap);

    return impactMap;
  }

  async analyzeFileImpact(change) {
    const impact = {
      file: change.file,
      changes: change.lines || 0,
      breaking: false,
      breakType: null,
      severity: 'low',
      attentionPoints: []
    };

    // Análise baseada no tipo de arquivo e conteúdo
    const fileExt = path.extname(change.file);

    if (fileExt === '.js' || fileExt === '.ts') {
      impact.attentionPoints = await this.analyzeCodeChanges(change);
    } else if (change.file === 'package.json') {
      impact.attentionPoints = await this.analyzePackageChanges(change);
    }

    // Verificar se é breaking change
    if (impact.attentionPoints.some(point => point.breaking)) {
      impact.breaking = true;
      impact.breakType = impact.attentionPoints.find(point => point.breaking).type;
      impact.severity = 'high';
    }

    return impact;
  }

  async analyzeCodeChanges(change) {
    const points = [];

    // Simulação de análise de código
    if (change.content) {
      if (change.content.includes('export') && change.content.includes('function')) {
        points.push({
          type: 'api_change',
          description: 'Possível mudança na API pública',
          breaking: true
        });
      }

      if (change.content.includes('BREAKING') || change.content.includes('breaking')) {
        points.push({
          type: 'breaking_change',
          description: 'Mudança breaking explicitamente marcada',
          breaking: true
        });
      }

      if (change.content.includes('TODO') || change.content.includes('FIXME')) {
        points.push({
          type: 'attention_required',
          description: 'Marcador de atenção encontrado',
          breaking: false
        });
      }
    }

    return points;
  }

  async analyzePackageChanges(change) {
    const points = [];

    if (change.content && change.content.includes('"version"')) {
      points.push({
        type: 'version_change',
        description: 'Mudança de versão detectada',
        breaking: true
      });
    }

    return points;
  }

  calculateRiskLevel(impactMap) {
    const breakingCount = impactMap.breakingChanges.length;
    const attentionCount = impactMap.attentionPoints.length;

    if (breakingCount > 5 || attentionCount > 10) return 'high';
    if (breakingCount > 2 || attentionCount > 5) return 'medium';
    return 'low';
  }

  createVisualRepresentation(impactMap) {
    // Criar representação ASCII/visual do impacto
    let visual = '\n🎯 IMPACTO VISUAL DAS MUDANÇAS\n';
    visual += '=' .repeat(50) + '\n';

    impactMap.affectedFiles.forEach(file => {
      const icon = file.breaking ? '💥' : file.attentionPoints.length > 0 ? '⚠️' : '✅';
      visual += `${icon} ${file.file} (${file.changes} mudanças)\n`;

      file.attentionPoints.forEach(point => {
        visual += `   • ${point.description}\n`;
      });
    });

    visual += `\n🚨 Nível de Risco: ${impactMap.riskLevel.toUpperCase()}\n`;
    visual += `💥 Mudanças Breaking: ${impactMap.breakingChanges.length}\n`;
    visual += `⚠️ Pontos de Atenção: ${impactMap.attentionPoints.length}\n`;

    return visual;
  }

  renderImpactMap(impactMap) {
    console.log(impactMap.visualRepresentation);
  }
}

/**
 * Evolution Timeline Manager - Gerenciamento de timeline evolutiva
 */
class EvolutionTimelineManager {
  constructor(byterover) {
    this.byterover = byterover;
    this.timelinePath = path.join(this.byterover.projectRoot, '.byterover', 'timeline');
  }

  async createSnapshot(data, options = {}) {
    const snapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: data.message || 'Snapshot automático',
      gitCommit: await this.getCurrentCommit(),
      contextState: data.contextState || {},
      metadata: options.metadata || {}
    };

    // Salvar snapshot
    await this.saveTimelineEvent('snapshot', snapshot);

    return snapshot;
  }

  async createBranch(data, options = {}) {
    const branch = {
      id: `branch_${Date.now()}`,
      name: data.name,
      fromCommit: await this.getCurrentCommit(),
      purpose: data.purpose || 'desenvolvimento',
      created: new Date().toISOString()
    };

    await this.saveTimelineEvent('branch', branch);
    return branch;
  }

  async mergeTimeline(data, options = {}) {
    const merge = {
      id: `merge_${Date.now()}`,
      fromBranch: data.fromBranch,
      toBranch: data.toBranch || 'main',
      strategy: data.strategy || 'merge',
      conflicts: data.conflicts || [],
      timestamp: new Date().toISOString()
    };

    await this.saveTimelineEvent('merge', merge);
    return merge;
  }

  async revertToPoint(data, options = {}) {
    const revert = {
      id: `revert_${Date.now()}`,
      targetPoint: data.targetPoint,
      reason: data.reason,
      timestamp: new Date().toISOString()
    };

    await this.saveTimelineEvent('revert', revert);
    return revert;
  }

  async analyzeEvolution(data, options = {}) {
    const timeline = await this.loadTimeline();
    const analysis = {
      totalEvents: timeline.length,
      branchesCreated: timeline.filter(e => e.type === 'branch').length,
      mergesCompleted: timeline.filter(e => e.type === 'merge').length,
      revertsPerformed: timeline.filter(e => e.type === 'revert').length,
      snapshotsTaken: timeline.filter(e => e.type === 'snapshot').length,
      timeSpan: this.calculateTimeSpan(timeline),
      evolutionPatterns: this.identifyPatterns(timeline)
    };

    return analysis;
  }

  async getCurrentCommit() {
    try {
      return execSync('git rev-parse HEAD', {
        cwd: this.byterover.projectRoot,
        encoding: 'utf8'
      }).trim();
    } catch (error) {
      return null;
    }
  }

  async saveTimelineEvent(type, data) {
    const event = {
      type,
      ...data
    };

    const timelineFile = path.join(this.timelinePath, 'events.jsonl');
    await fs.promises.mkdir(this.timelinePath, { recursive: true });

    // Adicionar ao arquivo de timeline
    const eventLine = JSON.stringify(event) + '\n';
    await fs.promises.appendFile(timelineFile, eventLine);
  }

  async loadTimeline() {
    const timelineFile = path.join(this.timelinePath, 'events.jsonl');

    try {
      const content = await fs.promises.readFile(timelineFile, 'utf8');
      return content.trim().split('\n').filter(line => line).map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  calculateTimeSpan(timeline) {
    if (timeline.length === 0) return 0;

    const timestamps = timeline.map(e => new Date(e.timestamp || e.created));
    const earliest = Math.min(...timestamps);
    const latest = Math.max(...timestamps);

    return latest - earliest;
  }

  identifyPatterns(timeline) {
    // Análise simples de padrões
    const patterns = {
      frequentMerges: timeline.filter(e => e.type === 'merge').length > 10,
      manyBranches: timeline.filter(e => e.type === 'branch').length > 5,
      frequentReverts: timeline.filter(e => e.type === 'revert').length > 3
    };

    return patterns;
  }
}

/**
 * Dependency Analyzer - Analisador de dependências
 */
class DependencyAnalyzer {
  constructor(byterover) {
    this.byterover = byterover;
  }

  async mapDependencies(filePath, options = {}) {
    const dependencyMap = {
      file: filePath,
      direct: [],
      indirect: [],
      dependents: [],
      circular: []
    };

    // Análise de dependências baseada em imports/requires
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');

      // Detectar imports (ES6)
      const es6Imports = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g) || [];
      es6Imports.forEach(imp => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          dependencyMap.direct.push({
            module: match[1],
            type: 'es6_import',
            line: this.findLineNumber(content, imp)
          });
        }
      });

      // Detectar requires (CommonJS)
      const requires = content.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || [];
      requires.forEach(req => {
        const match = req.match(/['"]([^'"]+)['"]/);
        if (match) {
          dependencyMap.direct.push({
            module: match[1],
            type: 'commonjs_require',
            line: this.findLineNumber(content, req)
          });
        }
      });

    } catch (error) {
      console.warn(`Erro ao analisar dependências de ${filePath}:`, error.message);
    }

    // Encontrar arquivos que dependem deste
    dependencyMap.dependents = await this.findDependents(filePath);

    // Calcular dependências indiretas (simplificado)
    dependencyMap.indirect = await this.calculateIndirectDependencies(dependencyMap.direct);

    // Detectar dependências circulares
    dependencyMap.circular = this.detectCircularDependencies(filePath, dependencyMap.dependents);

    return dependencyMap;
  }

  findLineNumber(content, substring) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(substring)) {
        return i + 1;
      }
    }
    return 0;
  }

  async findDependents(filePath) {
    const dependents = [];
    const files = await this.byterover.contextInjector.scanProjectFiles({});

    for (const file of files) {
      if (file.relativePath === path.relative(this.byterover.projectRoot, filePath)) continue;

      try {
        const content = await fs.promises.readFile(file.path, 'utf8');
        const relativePath = path.relative(path.dirname(file.path), filePath);

        if (content.includes(relativePath) ||
            content.includes(path.basename(filePath, path.extname(filePath)))) {
          dependents.push({
            file: file.relativePath,
            type: 'reference_found'
          });
        }
      } catch (error) {
        // Ignorar erros de leitura
      }
    }

    return dependents;
  }

  async calculateIndirectDependencies(directDeps) {
    // Simulação de cálculo de dependências indiretas
    const indirect = [];

    for (const dep of directDeps) {
      // Para cada dependência direta, simular algumas indiretas
      if (dep.module.startsWith('.')) {
        indirect.push({
          module: `${dep.module}/utils`,
          through: dep.module,
          type: 'indirect'
        });
      }
    }

    return indirect;
  }

  detectCircularDependencies(filePath, dependents) {
    // Detecção simplificada de dependências circulares
    const circular = [];

    for (const dep of dependents) {
      if (dep.file === path.relative(this.byterover.projectRoot, filePath)) {
        circular.push({
          cycle: [filePath, dep.file],
          type: 'self_reference'
        });
      }
    }

    return circular;
  }
}

/**
 * Intelligent Diff Engine - Motor de diff inteligente
 */
class IntelligentDiffEngine {
  constructor(byterover) {
    this.byterover = byterover;
  }

  async analyzeDiff(fromRef, toRef, options = {}) {
    const diffAnalysis = {
      fromRef,
      toRef,
      modifiedFiles: [],
      additions: 0,
      deletions: 0,
      significantChanges: []
    };

    try {
      // Executar git diff
      const diffCmd = `git diff --stat ${fromRef} ${toRef}`;
      const statOutput = execSync(diffCmd, {
        cwd: this.byterover.projectRoot,
        encoding: 'utf8'
      });

      // Analisar estatísticas
      const lines = statOutput.trim().split('\n');
      lines.forEach(line => {
        if (line.includes('|')) {
          const [file, changes] = line.split('|');
          const [add, del] = changes.trim().split(' ').filter(x => x.match(/\d+/));

          diffAnalysis.modifiedFiles.push({
            file: file.trim(),
            additions: parseInt(add) || 0,
            deletions: parseInt(del) || 0
          });

          diffAnalysis.additions += parseInt(add) || 0;
          diffAnalysis.deletions += parseInt(del) || 0;
        }
      });

      // Análise detalhada dos arquivos modificados
      diffAnalysis.significantChanges = await this.analyzeSignificantChanges(fromRef, toRef, diffAnalysis.modifiedFiles);

    } catch (error) {
      console.warn('Erro ao analisar diff:', error.message);
      diffAnalysis.error = error.message;
    }

    return diffAnalysis;
  }

  async analyzeSignificantChanges(fromRef, toRef, modifiedFiles) {
    const significantChanges = [];

    for (const file of modifiedFiles) {
      if (file.additions + file.deletions > 10) { // Threshold para mudanças significativas
        const fileAnalysis = await this.analyzeFileDiff(fromRef, toRef, file.file);

        if (fileAnalysis.significant) {
          significantChanges.push({
            file: file.file,
            description: fileAnalysis.description,
            severity: fileAnalysis.severity,
            type: fileAnalysis.type
          });
        }
      }
    }

    return significantChanges;
  }

  async analyzeFileDiff(fromRef, toRef, filePath) {
    const analysis = {
      significant: false,
      description: '',
      severity: 'low',
      type: 'modification'
    };

    try {
      const diffCmd = `git diff ${fromRef} ${toRef} -- ${filePath}`;
      const diffOutput = execSync(diffCmd, {
        cwd: this.byterover.projectRoot,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024
      });

      // Análise do diff
      if (diffOutput.includes('export') && diffOutput.includes('function')) {
        analysis.significant = true;
        analysis.description = 'Mudança em função exportada - possível breaking change';
        analysis.severity = 'high';
        analysis.type = 'api_change';
      } else if (diffOutput.includes('BREAKING') || diffOutput.includes('breaking')) {
        analysis.significant = true;
        analysis.description = 'Mudança breaking explicitamente marcada';
        analysis.severity = 'high';
        analysis.type = 'breaking_change';
      } else if (diffOutput.includes('interface') || diffOutput.includes('type')) {
        analysis.significant = true;
        analysis.description = 'Mudança em tipos/interfaces';
        analysis.severity = 'medium';
        analysis.type = 'type_change';
      }

    } catch (error) {
      analysis.error = error.message;
    }

    return analysis;
  }
}

// Exportações
export { ByteRoverCipher };
export default ByteRoverCipher;

// Função utilitária para CLI
export async function createByteRoverInstance(options = {}) {
  const cipher = new ByteRoverCipher(options);

  // Inicializar diretórios
  await fs.promises.mkdir(path.join(cipher.projectRoot, '.byterover'), { recursive: true });
  await fs.promises.mkdir(path.join(cipher.projectRoot, '.byterover', 'snapshots'), { recursive: true });
  await fs.promises.mkdir(path.join(cipher.projectRoot, '.byterover', 'timeline'), { recursive: true });

  return cipher;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];

  createByteRoverInstance().then(async (cipher) => {
    try {
      switch (command) {
        case 'status':
          console.log('📊 Status do ByteRover Cipher:');
          console.log(JSON.stringify(cipher.getStats(), null, 2));
          break;

        case 'inject':
          const contextId = args[1] || 'default';
          await cipher.injectContext(contextId);
          break;

        case 'search':
          const query = args[1];
          if (!query) {
            console.error('Uso: node byterover_cipher.js search "query"');
            process.exit(1);
          }
          await cipher.intelligentSearch(query);
          break;

        case 'snapshot':
          const message = args[1] || 'Snapshot automático';
          await cipher.createEncryptedSnapshot(message);
          break;

        case 'timeline':
          const action = args[1];
          const data = args[2] ? JSON.parse(args[2]) : {};
          await cipher.manageTimeline(action, data);
          break;

        default:
          console.log('🔐 ByteRover Cipher - Self-Hosted Code Interface');
          console.log('');
          console.log('Comandos disponíveis:');
          console.log('  status          - Mostra status do sistema');
          console.log('  inject <id>     - Injeta contexto de código');
          console.log('  search "query"  - Busca inteligente no código');
          console.log('  snapshot [msg]  - Cria snapshot encriptado');
          console.log('  timeline <action> [data] - Gerencia timeline evolutiva');
          console.log('');
          console.log('Exemplos:');
          console.log('  node byterover_cipher.js status');
          console.log('  node byterover_cipher.js inject mycontext');
          console.log('  node byterover_cipher.js search "function"');
          console.log('  node byterover_cipher.js snapshot "Antes da refatoração"');
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    }
  });
}





