class CronManager {
    constructor() {
        this.tasks = new Map();
        this.isPaused = false;
    }

    addTask(name, fn, intervalMs) {
        const taskId = setInterval(() => {
            if (!this.isPaused) {
                console.log(`[CRON] Executing: ${name}`);
                fn();
            }
        }, intervalMs);
        
        this.tasks.set(name, taskId);
    }

    pauseAll() {
        this.isPaused = true;
        console.warn("⏸️ SISTEMA EM REPOUSO: Todas as tarefas de fundo suspensas.");
    }

    resumeAll() {
        this.isPaused = false;
        console.log("▶️ SISTEMA EM VIGÍLIA: Retomando tarefas agendadas.");
    }

    stopTask(name) {
        if (this.tasks.has(name)) {
            clearInterval(this.tasks.get(name));
            this.tasks.delete(name);
        }
    }
}

export default CronManager;
