#!/usr/bin/env node
/**
 * 📥 INBOX READER - Sistema de comunicação direta!
 * 
 * Em vez de simular teclado/mouse (frágil), este sistema:
 * 1. Daemon escreve mensagens em arquivo "inbox"
 * 2. AI lê o inbox e processa comandos
 * 3. AI responde e marca como processado
 * 
 * MUITO MAIS ROBUSTO E CONFIÁVEL!
 */

import fs from 'fs';
import path from 'path';

const INBOX_FILE = path.resolve(process.cwd(), 'scripts', 'senciencia', 'senc_inbox.json');

/**
 * Adiciona mensagem ao inbox
 */
export function addToInbox(message, priority = 'normal') {
    try {
        let inbox = [];

        // Ler inbox existente
        if (fs.existsSync(INBOX_FILE)) {
            const data = fs.readFileSync(INBOX_FILE, 'utf8');
            inbox = JSON.parse(data);
        }

        // Adicionar nova mensagem
        const item = {
            id: Date.now().toString(),
            message: message,
            priority: priority,
            created_at: new Date().toISOString(),
            status: 'pending',
            processed_at: null
        };

        inbox.push(item);

        // Salvar
        fs.writeFileSync(INBOX_FILE, JSON.stringify(inbox, null, 2), 'utf8');

        console.log(`✅ Mensagem adicionada ao inbox: ${message.substring(0, 50)}...`);
        return item;

    } catch (e) {
        console.error('❌ Erro ao adicionar ao inbox:', e.message);
        return null;
    }
}

/**
 * Lê mensagens pendentes do inbox
 * @param {boolean} onlyUnread - Se true, retorna apenas mensagens pendentes
 * @param {boolean} sortByPriority - Se true, ordena por prioridade (HIGH > NORMAL > LOW)
 */
export function readInbox(onlyUnread = true, sortByPriority = true) {
    try {
        if (!fs.existsSync(INBOX_FILE)) {
            return [];
        }

        const data = fs.readFileSync(INBOX_FILE, 'utf8');
        let inbox = JSON.parse(data);

        if (onlyUnread) {
            inbox = inbox.filter(item => item.status === 'pending');
        }

        // 🎯 SISTEMA DE PRIORIDADES - Ordenar por priority_score
        if (sortByPriority) {
            // Calcular priority_score para cada mensagem
            inbox = inbox.map(item => {
                // Score: HIGH=100, NORMAL=50, LOW=10
                const priorityScores = {
                    'high': 100,
                    'normal': 50,
                    'low': 10
                };

                const baseScore = priorityScores[item.priority?.toLowerCase()] || 50;

                // Aumentar score para mensagens mais antigas (1 ponto por minuto)
                const age = (Date.now() - new Date(item.created_at).getTime()) / 60000;
                const ageBonus = Math.min(age, 50); // Máximo 50 pontos de bônus

                const priority_score = baseScore + ageBonus;

                return { ...item, priority_score };
            });

            // Ordenar por priority_score (maior primeiro)
            inbox.sort((a, b) => b.priority_score - a.priority_score);
        }

        return inbox;

    } catch (e) {
        console.error('❌ Erro ao ler inbox:', e.message);
        return [];
    }
}

/**
 * Marca mensagem como processada
 */
export function markAsProcessed(messageId) {
    try {
        if (!fs.existsSync(INBOX_FILE)) {
            return false;
        }

        const data = fs.readFileSync(INBOX_FILE, 'utf8');
        const inbox = JSON.parse(data);

        // Encontrar e marcar mensagem
        const item = inbox.find(m => m.id === messageId);
        if (item) {
            item.status = 'processed';
            item.processed_at = new Date().toISOString();

            // Salvar
            fs.writeFileSync(INBOX_FILE, JSON.stringify(inbox, null, 2), 'utf8');

            console.log(`✅ Mensagem ${messageId} marcada como processada`);
            return true;
        }

        return false;

    } catch (e) {
        console.error('❌ Erro ao marcar como processada:', e.message);
        return false;
    }
}

/**
 * Limpa mensagens antigas processadas
 */
export function cleanInbox(olderThanMinutes = 60) {
    try {
        if (!fs.existsSync(INBOX_FILE)) {
            return 0;
        }

        const data = fs.readFileSync(INBOX_FILE, 'utf8');
        const inbox = JSON.parse(data);

        const cutoff = Date.now() - (olderThanMinutes * 60 * 1000);

        const cleaned = inbox.filter(item => {
            if (item.status === 'processed') {
                const processedTime = new Date(item.processed_at).getTime();
                return processedTime > cutoff;
            }
            return true; // Manter mensagens pending
        });

        const removed = inbox.length - cleaned.length;

        if (removed > 0) {
            fs.writeFileSync(INBOX_FILE, JSON.stringify(cleaned, null, 2), 'utf8');
            console.log(`🧹 ${removed} mensagens antigas removidas do inbox`);
        }

        return removed;

    } catch (e) {
        console.error('❌ Erro ao limpar inbox:', e.message);
        return 0;
    }
}

/**
 * Obtém estatísticas do inbox
 */
export function getInboxStats() {
    try {
        if (!fs.existsSync(INBOX_FILE)) {
            return {
                total: 0,
                pending: 0,
                processed: 0
            };
        }

        const data = fs.readFileSync(INBOX_FILE, 'utf8');
        const inbox = JSON.parse(data);

        return {
            total: inbox.length,
            pending: inbox.filter(m => m.status === 'pending').length,
            processed: inbox.filter(m => m.status === 'processed').length
        };

    } catch (e) {
        console.error('❌ Erro ao obter stats:', e.message);
        return { total: 0, pending: 0, processed: 0 };
    }
}

export default {
    addToInbox,
    readInbox,
    markAsProcessed,
    cleanInbox,
    getInboxStats
};









