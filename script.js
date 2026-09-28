const fs = require('fs');
const path = require('path');
function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.next', 'dist', '.git'].includes(file)) {
                processDir(fullPath);
            }
        } else if (fullPath.match(/\.(tsx|jsx|ts|js|html|css)$/)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let orig = content;
            
            content = content.replace(/\s\"\'\\}]+/g, '');
            content = content.replace(/\bbg-black\b/g, 'bg-white');
            content = content.replace(/\bbg-gray-900\b/g, 'bg-slate-50');
            content = content.replace(/\bbg-slate-900\b/g, 'bg-slate-50');
            content = content.replace(/\bbg-zinc-900\b/g, 'bg-zinc-50');
            content = content.replace(/\bbg-neutral-900\b/g, 'bg-neutral-50');
            
            if (file === 'globals.css') {
                content = content.replace(/\.dark\s*\{[\s\S]*?\}/, '');
            }
            
            if (content !== orig) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated', fullPath);
            }
        }
    }
}
processDir('.');
