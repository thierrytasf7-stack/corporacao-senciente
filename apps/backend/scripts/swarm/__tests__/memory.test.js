#!/usr/bin/env node
/**
 * Testes para Memory (Memória Compartilhada)
 */

import { jest } from '@jest/globals';
import { getMemory } from '../memory.js';

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(() => ({
            insert: jest.fn(() => Promise.resolve({ error: null })),
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    order: jest.fn(() => ({
                        limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
                    }))
                }))
            })),
            rpc: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
    }))
}));

// Mock do embedding
jest.mock('../../utils/embedding.js', () => ({
    embed: jest.fn(() => Promise.resolve([0.1, 0.2, 0.3]))
}));

// Mock do logger
jest.mock('../../utils/logger.js', () => ({
    logger: {
        child: jest.fn(() => ({
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        }))
    }
}));

describe('Memory', () => {
    let memory;

    beforeEach(() => {
        memory = getMemory();
        jest.clearAllMocks();
    });

    describe('storeDecision', () => {
        test('deve armazenar decisão com sucesso', async () => {
            const result = await memory.storeDecision(
                'testAgent',
                'Test task',
                { action: 'create_file', path: 'test.js' },
                { success: true }
            );

            expect(result).toBe(true);
        });

        test('deve retornar false quando Supabase não está disponível', async () => {
            // Temporariamente remover supabase
            const originalSupabase = memory.supabase;
            memory.supabase = null;

            const result = await memory.storeDecision(
                'testAgent',
                'Test task',
                { action: 'create_file' }
            );

            expect(result).toBe(false);

            // Restaurar
            memory.supabase = originalSupabase;
        });
    });

    describe('getSimilarDecisions', () => {
        test('deve buscar decisões similares', async () => {
            const result = await memory.getSimilarDecisions('Test query', 5);

            expect(Array.isArray(result)).toBe(true);
        });

        test('deve retornar array vazio quando Supabase não está disponível', async () => {
            const originalSupabase = memory.supabase;
            memory.supabase = null;

            const result = await memory.getSimilarDecisions('Test query');

            expect(result).toEqual([]);

            memory.supabase = originalSupabase;
        });
    });

    describe('getAgentHistory', () => {
        test('deve buscar histórico do agente', async () => {
            const result = await memory.getAgentHistory('testAgent', 10);

            expect(Array.isArray(result)).toBe(true);
        });

        test('deve retornar array vazio quando Supabase não está disponível', async () => {
            const originalSupabase = memory.supabase;
            memory.supabase = null;

            const result = await memory.getAgentHistory('testAgent');

            expect(result).toEqual([]);

            memory.supabase = originalSupabase;
        });
    });

    describe('getKnowledge', () => {
        test('deve buscar conhecimento', async () => {
            const result = await memory.getKnowledge('Test query');

            expect(Array.isArray(result)).toBe(true);
        });

        test('deve usar cache quando disponível', async () => {
            // Primeiro chamada para popular cache
            await memory.getKnowledge('Test query');

            // Segunda chamada deve usar cache
            const result = await memory.getKnowledge('Test query');

            expect(Array.isArray(result)).toBe(true);
        });

        test('deve retornar array vazio quando Supabase não está disponível', async () => {
            const originalSupabase = memory.supabase;
            memory.supabase = null;

            const result = await memory.getKnowledge('Test query');

            expect(result).toEqual([]);

            memory.supabase = originalSupabase;
        });
    });

    describe('getKnowledgeLLB', () => {
        test('deve delegar para LangMem quando disponível', async () => {
            const result = await memory.getKnowledgeLLB('Test query');

            expect(Array.isArray(result)).toBe(true);
        });

        test('deve fazer fallback quando LangMem não está disponível', async () => {
            // Mock para simular erro no import
            const originalImport = global.import;
            global.import = jest.fn(() => Promise.reject(new Error('Module not found')));

            const result = await memory.getKnowledgeLLB('Test query');

            expect(Array.isArray(result)).toBe(true);

            // Restaurar
            global.import = originalImport;
        });
    });
});






