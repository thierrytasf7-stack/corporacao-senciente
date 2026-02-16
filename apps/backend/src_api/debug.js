
import fs from 'fs';
import path from 'path';

function listDir(dir, depth = 0) {
    if (depth > 3) return { name: dir, type: 'max_depth' };
    try {
        const files = fs.readdirSync(dir);
        return files.map(file => {
            const fullPath = path.join(dir, file);
            try {
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    return {
                        name: file,
                        type: 'dir',
                        children: listDir(fullPath, depth + 1)
                    };
                }
                return { name: file, type: 'file' };
            } catch (e) {
                return { name: file, error: e.message };
            }
        });
    } catch (e) {
        return { error: e.message };
    }
}

export async function getDebugFiles(req, res) {
    try {
        const cwd = process.cwd();
        const dirname = import.meta.dirname || path.dirname(new URL(import.meta.url).pathname);

        const structure = {
            cwd,
            dirname,
            files: listDir(cwd)
        };

        res.json(structure);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
