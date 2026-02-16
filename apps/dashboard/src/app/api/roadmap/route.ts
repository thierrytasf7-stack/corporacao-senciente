import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { RoadmapItem, RoadmapPriority, RoadmapImpact, RoadmapEffort, StoryCategory } from '@/types';

// Get the project root path
function getProjectRoot(): string {
  if (process.env.AIOS_PROJECT_ROOT) {
    return process.env.AIOS_PROJECT_ROOT;
  }
  return path.resolve(process.cwd(), '..', '..');
}

// Parse frontmatter between --- markers (simple regex, no yaml lib)
function parseFrontmatter(content: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return meta;

  const lines = fmMatch[1].split(/\r?\n/);
  for (const line of lines) {
    const kv = line.match(/^(\w[\w\s-]*?):\s*(.+)$/);
    if (kv) {
      meta[kv[1].trim().toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return meta;
}

// Parse blockquote metadata: > **Field:** Value
function parseBlockquoteMetadata(content: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const regex = /^>\s*\*\*([^*:]+):?\*\*:?\s*(.+?)\r?$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    meta[match[1].trim().toLowerCase()] = match[2].trim();
  }
  return meta;
}

// Extract first heading
function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  if (!match) return null;
  // Remove story IDs like [STORY-20260212232213-3]
  return match[1].replace(/\[STORY-[^\]]+\]\s*/, '').trim();
}

// Extract first paragraph after heading as description
function extractDescription(content: string): string {
  // Try Objetivo section first
  const objMatch = content.match(/## Objetivo\r?\n\r?\n?([\s\S]*?)(?=\r?\n##|\r?\n---|\r?\n$)/i);
  if (objMatch) {
    return objMatch[1].trim().split(/\r?\n\r?\n/)[0].slice(0, 200);
  }

  // Try Contexto section
  const ctxMatch = content.match(/## Contexto\r?\n\r?\n?([\s\S]*?)(?=\r?\n##|\r?\n$)/i);
  if (ctxMatch) {
    return ctxMatch[1].trim().split(/\r?\n\r?\n/)[0].slice(0, 200);
  }

  // Fallback: first non-blockquote, non-heading paragraph
  const paragraphs = content
    .split(/\r?\n\r?\n/)
    .filter((p) => p.trim() && !p.startsWith('#') && !p.startsWith('>'));
  return paragraphs[0]?.trim().slice(0, 200) || '';
}

// Map story priority to roadmap priority
function mapPriority(value: string | undefined): RoadmapPriority {
  if (!value) return 'should_have';
  const lower = value.toLowerCase();

  if (lower === 'critical' || lower === 'alta' || lower === 'high' || lower.startsWith('p0') || lower.startsWith('p1')) {
    return 'must_have';
  }
  if (lower === 'medium' || lower === 'media' || lower.startsWith('p2')) {
    return 'should_have';
  }
  if (lower === 'low' || lower === 'baixa' || lower.startsWith('p3')) {
    return 'could_have';
  }
  return 'should_have';
}

// Map difficulty to impact/effort
function mapDifficultyToLevel(value: string | undefined): RoadmapImpact | RoadmapEffort {
  if (!value) return 'medium';
  const lower = value.toLowerCase();

  if (lower === 'high' || lower === 'complex' || lower === 'hard' || lower === 'alta') return 'high';
  if (lower === 'low' || lower === 'simple' || lower === 'easy' || lower === 'baixa') return 'low';
  return 'medium';
}

// Map tipo to category
function mapCategory(value: string | undefined): StoryCategory | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();

  if (lower === 'feature') return 'feature';
  if (lower === 'fix' || lower === 'bugfix' || lower === 'bug') return 'fix';
  if (lower === 'refactor' || lower === 'refactoring') return 'refactor';
  if (lower === 'docs' || lower === 'documentation') return 'docs';
  if (lower === 'security' || lower === 'optimization') return 'feature';
  return undefined;
}

// Extract tags from filename
function extractTagsFromFilename(filename: string): string[] {
  const tags: string[] = [];
  const base = path.basename(filename, '.md').toLowerCase();

  if (base.includes('security')) tags.push('security');
  if (base.includes('optimization')) tags.push('optimization');
  if (base.includes('feature')) tags.push('feature');
  if (base.includes('refactor')) tags.push('refactor');
  if (base.includes('genesis')) tags.push('genesis');

  return tags;
}

// Recursively find markdown files
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const skip = ['node_modules', 'archive', 'obsolete', 'archived', 'deprecated', 'completed'];
        if (!entry.name.startsWith('.') && !skip.includes(entry.name.toLowerCase())) {
          files.push(...(await findMarkdownFiles(fullPath)));
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        if (!['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'].includes(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  return files;
}

// Parse a story file into a RoadmapItem
function parseStoryToRoadmapItem(content: string, filePath: string): RoadmapItem | null {
  try {
    const frontmatter = parseFrontmatter(content);
    const blockquote = parseBlockquoteMetadata(content);

    // Merge metadata: frontmatter takes precedence, then blockquote
    const meta = { ...blockquote, ...frontmatter };

    const title = extractTitle(content) || meta.title || path.basename(filePath, '.md');
    const description = extractDescription(content);
    const id = path.basename(filePath, '.md');

    const priority = mapPriority(meta.prioridade || meta.priority);
    const difficulty = meta.dificuldade || meta.difficulty || meta.complexity;
    const impact = mapDifficultyToLevel(difficulty) as RoadmapImpact;
    const effort = mapDifficultyToLevel(difficulty) as RoadmapEffort;
    const category = mapCategory(meta.tipo || meta.type || meta.category);
    const tags = extractTagsFromFilename(filePath);

    // Extract story ID from title if available
    const storyIdMatch = content.match(/\[STORY-([^\]]+)\]/);
    const linkedStoryId = storyIdMatch ? `STORY-${storyIdMatch[1]}` : undefined;

    return {
      id,
      title,
      description: description || undefined,
      priority,
      impact,
      effort,
      category,
      tags: tags.length > 0 ? tags : undefined,
      linkedStoryId,
    };
  } catch (error) {
    console.error(`Error parsing roadmap item from ${filePath}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const projectRoot = getProjectRoot();
    const storiesDir = path.join(projectRoot, 'docs', 'stories');

    const markdownFiles = await findMarkdownFiles(storiesDir);

    if (markdownFiles.length === 0) {
      return NextResponse.json({
        items: [],
        source: 'filesystem',
        count: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    const items: RoadmapItem[] = [];

    for (const filePath of markdownFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const item = parseStoryToRoadmapItem(content, filePath);
        if (item) {
          items.push(item);
        }
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
      }
    }

    return NextResponse.json({
      items,
      source: 'filesystem',
      count: items.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/roadmap:', error);
    return NextResponse.json(
      {
        items: [],
        source: 'error',
        count: 0,
        lastUpdated: new Date().toISOString(),
        error: 'Failed to load roadmap items',
      },
      { status: 500 }
    );
  }
}
