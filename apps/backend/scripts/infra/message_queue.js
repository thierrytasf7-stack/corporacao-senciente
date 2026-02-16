#!/usr/bin/env node

/**
 * Message Queue - Sistema de Filas de Mensagens
 * Corporação Senciente - Fase 0.5
 *
 * Sistema de filas para comunicação assíncrona entre PCs
 * Suporte a Redis ou implementação em memória
 */

import { createClient as createRedisClient } from 'redis';

// Configurações
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_PREFIX = 'corporacao:queue';
const MAX_QUEUE_SIZE = 10000;
const MESSAGE_TTL = 3600; // 1 hora em segundos

class MessageQueue {
    constructor() {
        this.redis = null;
        this.inMemoryQueue = new Map();
        this.useRedis = false;
        this.subscribers = new Map();
    }

    /**
     * Inicializar conexão Redis
     */
    async initRedis() {
        try {
            this.redis = createRedisClient({ url: REDIS_URL });

            this.redis.on('error', (err) => {
                console.log('Redis não disponível, usando fila em memória:', err.message);
                this.useRedis = false;
            });

            this.redis.on('connect', () => {
                console.log('Conectado ao Redis para Message Queue');
                this.useRedis = true;
            });

            await this.redis.connect();
        } catch (error) {
            console.log('Redis não disponível, usando implementação em memória');
            this.useRedis = false;
        }
    }

    /**
     * Publicar mensagem na fila
     */
    async publish(queueName, message) {
        const queueKey = `${QUEUE_PREFIX}:${queueName}`;
        const messageWithMeta = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ttl: MESSAGE_TTL
        };

        if (this.useRedis) {
            try {
                await this.redis.lPush(queueKey, JSON.stringify(messageWithMeta));
                await this.redis.expire(queueKey, MESSAGE_TTL);

                // Limitar tamanho da fila
                await this.redis.lTrim(queueKey, 0, MAX_QUEUE_SIZE - 1);

                console.log(`📤 Mensagem publicada na fila Redis: ${queueName}`);
            } catch (error) {
                console.error('Erro ao publicar no Redis:', error);
                this.fallbackToMemory(queueName, messageWithMeta);
            }
        } else {
            this.fallbackToMemory(queueName, messageWithMeta);
        }

        // Notificar subscribers
        this.notifySubscribers(queueName, messageWithMeta);

        return messageWithMeta.id;
    }

    /**
     * Fallback para implementação em memória
     */
    fallbackToMemory(queueName, message) {
        if (!this.inMemoryQueue.has(queueName)) {
            this.inMemoryQueue.set(queueName, []);
        }

        const queue = this.inMemoryQueue.get(queueName);
        queue.push(message);

        // Limitar tamanho da fila
        if (queue.length > MAX_QUEUE_SIZE) {
            queue.splice(0, queue.length - MAX_QUEUE_SIZE);
        }

        console.log(`📤 Mensagem publicada na fila memória: ${queueName}`);
    }

    /**
     * Consumir mensagem da fila
     */
    async consume(queueName, timeout = 30000) {
        const queueKey = `${QUEUE_PREFIX}:${queueName}`;

        if (this.useRedis) {
            try {
                const result = await this.redis.brPop(queueKey, timeout / 1000);
                if (result) {
                    const message = JSON.parse(result.element);
                    console.log(`📥 Mensagem consumida do Redis: ${queueName}`);
                    return message;
                }
            } catch (error) {
                console.error('Erro ao consumir do Redis:', error);
            }
        }

        // Fallback para memória
        const queue = this.inMemoryQueue.get(queueName);
        if (queue && queue.length > 0) {
            const message = queue.shift();
            console.log(`📥 Mensagem consumida da memória: ${queueName}`);
            return message;
        }

        return null;
    }

    /**
     * Inspecionar fila (ver mensagens sem consumir)
     */
    async peek(queueName, count = 10) {
        const queueKey = `${QUEUE_PREFIX}:${queueName}`;

        if (this.useRedis) {
            try {
                const messages = await this.redis.lRange(queueKey, 0, count - 1);
                return messages.map(msg => JSON.parse(msg));
            } catch (error) {
                console.error('Erro ao inspecionar Redis:', error);
            }
        }

        // Fallback para memória
        const queue = this.inMemoryQueue.get(queueName);
        if (queue) {
            return queue.slice(0, count);
        }

        return [];
    }

    /**
     * Obter tamanho da fila
     */
    async size(queueName) {
        const queueKey = `${QUEUE_PREFIX}:${queueName}`;

        if (this.useRedis) {
            try {
                return await this.redis.lLen(queueKey);
            } catch (error) {
                console.error('Erro ao obter tamanho do Redis:', error);
            }
        }

        // Fallback para memória
        const queue = this.inMemoryQueue.get(queueName);
        return queue ? queue.length : 0;
    }

    /**
     * Limpar fila
     */
    async clear(queueName) {
        const queueKey = `${QUEUE_PREFIX}:${queueName}`;

        if (this.useRedis) {
            try {
                await this.redis.del(queueKey);
                console.log(`🧹 Fila Redis limpa: ${queueName}`);
            } catch (error) {
                console.error('Erro ao limpar Redis:', error);
            }
        }

        // Limpar memória
        this.inMemoryQueue.delete(queueName);
        console.log(`🧹 Fila memória limpa: ${queueName}`);
    }

    /**
     * Inscrever-se em fila para notificações
     */
    subscribe(queueName, callback) {
        if (!this.subscribers.has(queueName)) {
            this.subscribers.set(queueName, []);
        }

        this.subscribers.get(queueName).push(callback);
        console.log(`📡 Subscriber adicionado para fila: ${queueName}`);
    }

    /**
     * Notificar subscribers
     */
    notifySubscribers(queueName, message) {
        const subscribers = this.subscribers.get(queueName);
        if (subscribers) {
            subscribers.forEach(callback => {
                try {
                    callback(message);
                } catch (error) {
                    console.error('Erro em subscriber:', error);
                }
            });
        }
    }

    /**
     * Publicar mensagem para PC específico
     */
    async sendToPC(targetPC, message) {
        const queueName = `pc:${targetPC}`;
        return await this.publish(queueName, message);
    }

    /**
     * Publicar mensagem para especialização
     */
    async sendToSpecialization(specialization, message) {
        const queueName = `specialization:${specialization}`;
        return await this.publish(queueName, message);
    }

    /**
     * Broadcast para todos os PCs
     */
    async broadcast(message) {
        const queueName = 'broadcast:all';
        return await this.publish(queueName, message);
    }

    /**
     * Agendar mensagem para execução futura
     */
    async schedule(queueName, message, delayMs) {
        setTimeout(async () => {
            await this.publish(queueName, {
                ...message,
                scheduled_execution: new Date().toISOString(),
                original_schedule_time: new Date(Date.now() - delayMs).toISOString()
            });
        }, delayMs);

        console.log(`⏰ Mensagem agendada para ${queueName} em ${delayMs}ms`);
    }

    /**
     * Obter estatísticas das filas
     */
    async getStats() {
        const stats = {
            redis_available: this.useRedis,
            memory_queues: this.inMemoryQueue.size,
            subscribers: this.subscribers.size,
            queues: {}
        };

        // Estatísticas das filas
        if (this.useRedis) {
            try {
                const keys = await this.redis.keys(`${QUEUE_PREFIX}:*`);
                for (const key of keys) {
                    const queueName = key.replace(`${QUEUE_PREFIX}:`, '');
                    const size = await this.redis.lLen(key);
                    stats.queues[queueName] = { size, backend: 'redis' };
                }
            } catch (error) {
                console.error('Erro ao obter stats do Redis:', error);
            }
        }

        // Estatísticas das filas em memória
        for (const [queueName, queue] of this.inMemoryQueue) {
            if (!stats.queues[queueName]) {
                stats.queues[queueName] = { size: queue.length, backend: 'memory' };
            }
        }

        return stats;
    }

    /**
     * Limpar mensagens expiradas (implementação em memória)
     */
    cleanupExpiredMessages() {
        const now = Date.now();

        for (const [queueName, queue] of this.inMemoryQueue) {
            // Filtrar mensagens não expiradas
            const validMessages = queue.filter(msg => {
                const messageTime = new Date(msg.timestamp).getTime();
                return (now - messageTime) < (MESSAGE_TTL * 1000);
            });

            this.inMemoryQueue.set(queueName, validMessages);
        }
    }

    /**
     * Iniciar limpeza automática
     */
    startCleanup() {
        setInterval(() => {
            this.cleanupExpiredMessages();
        }, 300000); // A cada 5 minutos

        console.log('🧹 Limpeza automática de mensagens iniciada');
    }

    /**
     * Fechar conexões
     */
    async close() {
        if (this.redis) {
            await this.redis.quit();
        }
        console.log('🔌 Message Queue fechada');
    }

    /**
     * Inicializar
     */
    async init() {
        console.log('📨 Inicializando Message Queue...');

        await this.initRedis();
        this.startCleanup();

        console.log('✅ Message Queue inicializada');
        console.log(`📊 Backend: ${this.useRedis ? 'Redis' : 'Memória'}`);
    }
}

// CLI Interface
async function main() {
    const queue = new MessageQueue();
    await queue.init();

    const command = process.argv[2];
    const queueName = process.argv[3];

    switch (command) {
        case 'publish':
            const message = JSON.parse(process.argv[4] || '{}');
            const id = await queue.publish(queueName, message);
            console.log(`Mensagem publicada com ID: ${id}`);
            break;

        case 'consume':
            const consumed = await queue.consume(queueName, 5000);
            if (consumed) {
                console.log('Mensagem consumida:', JSON.stringify(consumed, null, 2));
            } else {
                console.log('Nenhuma mensagem disponível');
            }
            break;

        case 'peek':
            const messages = await queue.peek(queueName);
            console.log(`Mensagens na fila ${queueName}:`);
            messages.forEach((msg, i) => {
                console.log(`${i + 1}. ${JSON.stringify(msg)}`);
            });
            break;

        case 'stats':
            const stats = await queue.getStats();
            console.log('Estatísticas da Message Queue:');
            console.log(JSON.stringify(stats, null, 2));
            break;

        case 'clear':
            await queue.clear(queueName);
            console.log(`Fila ${queueName} limpa`);
            break;

        default:
            console.log('Comandos disponíveis:');
            console.log('  publish <queue> <message-json> - Publicar mensagem');
            console.log('  consume <queue> - Consumir mensagem');
            console.log('  peek <queue> - Ver mensagens na fila');
            console.log('  stats - Estatísticas das filas');
            console.log('  clear <queue> - Limpar fila');
            console.log('');
            console.log('Filas especiais:');
            console.log('  pc:<hostname> - Mensagens para PC específico');
            console.log('  specialization:<type> - Mensagens para especialização');
            console.log('  broadcast:all - Broadcast para todos');
    }

    await queue.close();
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
}

export default MessageQueue;






