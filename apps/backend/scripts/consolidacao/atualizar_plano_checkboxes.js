#!/usr/bin/env node
/**
 * Script para atualizar o plano com checkboxes e marcar progresso
 */

import fs from 'fs';
import path from 'path';

const planFile = path.resolve(process.cwd(), '.cursor', 'plans', 'reestruturação_completa_corporação_senciente_b4623469.plan.md');

let content = fs.readFileSync(planFile, 'utf8');

// Tasks completadas da Fase 1
const completedTasks = {
    '1.1.1.1': true, '1.1.1.2': true, '1.1.1.3': true, '1.1.1.4': true, '1.1.1.5': true, '1.1.1.6': true,
    '1.1.2.1': true, '1.1.2.2': true, '1.1.2.3': true, '1.1.2.4': true, '1.1.2.5': true, '1.1.2.6': true,
    '1.1.3.1': true, '1.1.3.2': true, '1.1.3.3': true, '1.1.3.4': true, '1.1.3.5': true, '1.1.3.6': true,
    '1.1.4.1': true, '1.1.4.2': true, '1.1.4.3': true, '1.1.4.4': true, '1.1.4.5': true,
    '1.2.1.1': true, '1.2.1.2': true, '1.2.1.3': true, '1.2.1.4': true, '1.2.1.5': true, '1.2.1.6': true, '1.2.1.7': true, '1.2.1.8': true,
    '1.2.2.1': true, '1.2.2.2': true, '1.2.2.3': true, '1.2.2.4': true, '1.2.2.5': true, '1.2.2.6': true,
    '1.2.3.1': true, '1.2.3.2': true, '1.2.3.3': true, '1.2.3.4': true, '1.2.3.5': true, '1.2.3.6': true, '1.2.3.7': true,
    '1.2.4.1': true, '1.2.4.2': true, '1.2.4.3': true, '1.2.4.4': true, '1.2.4.5': true, '1.2.4.6': true, '1.2.4.7': true, '1.2.4.8': true,
    '1.2.5.1': true, '1.2.5.2': true, '1.2.5.3': true, '1.2.5.4': true, '1.2.5.5': true, '1.2.5.6': true, '1.2.5.7': true, '1.2.5.8': true,
    // Fase 2 parcial
    '2.1.1.1': true, '2.1.1.2': true, '2.1.1.3': true, '2.1.1.4': true, '2.1.1.5': true, '2.1.1.6': true,
    '2.1.2.1': true, '2.1.2.2': true, '2.1.2.3': true, '2.1.2.4': true, '2.1.2.5': true, '2.1.2.6': true, '2.1.2.7': true,
    '2.1.3.1': true, '2.1.3.2': true, '2.1.3.3': true, '2.1.3.4': true, '2.1.3.5': false, '2.1.3.6': false,
    '2.2.1.1': true, '2.2.1.2': true, '2.2.1.3': true, '2.2.1.4': true, '2.2.1.5': true, '2.2.1.6': false, '2.2.1.7': true, '2.2.1.8': false, '2.2.1.9': false,
    '2.2.2.1': true, '2.2.2.2': true, '2.2.2.3': true, '2.2.2.4': true, '2.2.2.5': true, '2.2.2.6': true, '2.2.2.7': false, '2.2.2.8': false,
    '2.2.3.1': true, '2.2.3.2': true, '2.2.3.3': true, '2.2.3.4': true, '2.2.3.5': true, '2.2.3.6': false, '2.2.3.7': false,
    '2.2.4.1': true, '2.2.4.2': true, '2.2.4.3': true, '2.2.4.4': true, '2.2.4.5': true, '2.2.4.6': true, '2.2.4.7': true, '2.2.4.8': false, '2.2.4.9': false,
    '2.3.1.1': true, '2.3.1.2': true, '2.3.1.3': true, '2.3.1.4': false, '2.3.1.5': true, '2.3.1.6': true, '2.3.1.7': true,
    '2.3.1.8': false, '2.3.1.9': false, '2.3.1.10': false, '2.3.1.11': false, '2.3.1.12': false, '2.3.1.13': false, '2.3.1.14': false,
    '2.3.2.1': true, '2.3.2.2': false, '2.3.2.3': true, '2.3.2.4': true, '2.3.2.5': false,
    '2.3.2.6': false, '2.3.2.7': false, '2.3.2.8': false, '2.3.2.9': false, '2.3.2.10': true, '2.3.2.11': false, '2.3.2.12': true, '2.3.2.13': false, '2.3.2.14': false,
    '2.3.2.15': false, '2.3.2.16': false, '2.3.2.17': false,
    '2.4.1.1': true, '2.4.1.2': true, '2.4.1.3': true, '2.4.1.4': true, '2.4.1.5': false, '2.4.1.6': true, '2.4.1.7': false, '2.4.1.8': false,
};

// Função para adicionar checkbox a uma subtask
function addCheckbox(line, taskId) {
    // Se já tem checkbox, não adicionar
    if (line.match(/^-\s*\[[ x]\]/)) {
        return line;
    }

    // Se é uma subtask (começa com número)
    if (line.match(/^-\s*\d+\.\d+\.\d+\.\d+:/)) {
        const isCompleted = completedTasks[taskId] || false;
        const checkbox = isCompleted ? '[x]' : '[ ]';
        return line.replace(/^-\s*(\d+\.\d+\.\d+\.\d+:)/, `- ${checkbox} $1`);
    }

    return line;
}

// Processar linha por linha
const lines = content.split('\n');
let currentTaskId = null;
let newLines = [];
let inSubtasks = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Detectar início de subtasks
    if (line.includes('**Subtasks:**')) {
        inSubtasks = true;
        newLines.push(line);
        continue;
    }

    // Detectar fim de subtasks (próxima seção)
    if (inSubtasks && (line.match(/^####|^###|^##|^---/) || line.trim() === '' && i < lines.length - 1 && lines[i + 1].match(/^####|^###|^##/))) {
        inSubtasks = false;
    }

    // Extrair task ID de linha de subtask
    const taskMatch = line.match(/^-\s*(\d+\.\d+\.\d+\.\d+):/);
    if (taskMatch) {
        currentTaskId = taskMatch[1];
        line = addCheckbox(line, currentTaskId);
    }

    newLines.push(line);
}

content = newLines.join('\n');

// Adicionar checkboxes nas tasks principais também
content = content.replace(/^#### Task (\d+\.\d+\.\d+):/gm, (match, taskNum) => {
    // Verificar se todas subtasks estão completas
    const taskPrefix = taskNum + '.';
    const allSubtasks = Object.keys(completedTasks).filter(k => k.startsWith(taskPrefix));
    const completedSubtasks = allSubtasks.filter(k => completedTasks[k]);
    const isTaskComplete = allSubtasks.length > 0 && completedSubtasks.length === allSubtasks.length;

    return `#### Task ${taskNum}: ${isTaskComplete ? '✅' : '⏳'}`;
});

// Adicionar checkboxes nas seções principais
content = content.replace(/^### (\d+\.\d+)/gm, (match, sectionNum) => {
    const sectionPrefix = sectionNum + '.';
    const allTasks = Object.keys(completedTasks).filter(k => k.startsWith(sectionPrefix));
    const completedTasks_count = allTasks.filter(k => completedTasks[k]).length;
    const totalTasks = allTasks.length;
    const progress = totalTasks > 0 ? `(${completedTasks_count}/${totalTasks})` : '';

    return `### ${sectionNum} ${progress}`;
});

fs.writeFileSync(planFile, content, 'utf8');
console.log('✅ Plano atualizado com checkboxes!');





