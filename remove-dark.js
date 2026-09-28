const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.next', 'dist'].includes(file)) {
                processDir(fullPath);
            }
        } else if (fullPath.match(/\.(tsx|jsx|ts|js|html|css)$/)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let orig = content;
            // Remove dark: classes
            content = content.replace(/\b\-\_\[\]\/]+\b/g, '');
            // Replace bg-white with bg-white
            content = content.replace(/\bbg-black\b/g, 'bg-white');
            // Replace text-white with text-slate-900 when the context is light, maybe safer to leave it unless it's a known dark mode issue, but let's replace text-white inside black bg?
            // Actually prompt says: remove all dark: tailwind classes and bg-white/bg-slate-50
            content = content.replace(/\bbg-gray-900\b/g, 'bg-slate-50');
            content = content.replace(/\bbg-slate-900\b/g, 'bg-slate-50');
            content = content.replace(/\bbg-zinc-900\b/g, 'bg-zinc-50');
            content = content.replace(/\bbg-neutral-900\b/g, 'bg-neutral-50');
            
            if (content !== orig) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated', fullPath);
            }
        }
    }
}
processDir('.');
