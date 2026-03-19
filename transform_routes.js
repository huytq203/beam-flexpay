const fs = require('fs');

const path = 'src/routes.ts';
const backup = 'src/routes.ts.bak';

try {
    fs.copyFileSync(path, backup);
    console.log('Backup created');

    let content = fs.readFileSync(path, 'utf8');

    // Add lazy import
    if (content.includes("import { Children, createElement } from 'react'")) {
        content = content.replace("import { Children, createElement } from 'react'", "import { Children, createElement, lazy } from 'react'");
    } else if (!content.includes("lazy } from 'react'")) {
        content = "import { lazy } from 'react';\n" + content;
    }

    // Replace default imports: import Name from '@pages/...'
    content = content.replace(/^import\s+([a-zA-Z0-9_]+)\s+from\s+['"](@pages\/[^'"]+)['"]/gm, (match, name, modulePath) => {
        return `const ${name} = lazy(() => import('${modulePath}'))`;
    });

    // Replace named imports: import { Name1, Name2 } from '@pages/...'
    const reMultiline = /import\s+\{([^}]+)\}\s+from\s+['"](@pages\/[^'"]+)['"]/gm;
    content = content.replace(reMultiline, (match, namesStr, modulePath) => {
        const names = namesStr.split(',').map(n => n.trim()).filter(n => n);
        let output = '';
        names.forEach(name => {
            output += `const ${name} = lazy(() => import('${modulePath}').then(module => ({ default: module.${name} })))\n`;
        });
        return output.trim();
    });

    fs.writeFileSync(path, content, 'utf8');
    console.log('Transform complete!');
} catch (e) {
    console.error('Error during transform:', e);
}
