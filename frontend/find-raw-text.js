const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (dirPath.endsWith('.js') || dirPath.endsWith('.tsx') || dirPath.endsWith('.jsx')) {
            callback(path.join(dir, f));
        }
    });
}

function checkFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    try {
        const ast = babel.parseSync(code, {
            filename: filePath,
            presets: ['@babel/preset-react'],
            plugins: ['@babel/plugin-syntax-jsx']
        });

        babel.traverse(ast, {
            JSXText(path) {
                // check for weird characters
                const val = path.node.value;
                if (val.match(/[^\s]/) && path.parent.type === 'JSXElement' && path.parent.openingElement.name.name !== 'Text') {
                    console.log(`[Stray Text] ${filePath}:${path.node.loc.start.line} -> "${val.trim()}"`);
                }
            },
            JSXExpressionContainer(path) {
                let parent = path.parent;
                if (parent && parent.type === 'JSXElement') {
                    if (parent.openingElement.name.type === 'JSXIdentifier') {
                        const tagName = parent.openingElement.name.name;
                        if (tagName !== 'Text' && tagName !== 'TextInput') {
                            if (path.node.expression.type !== 'JSXEmptyExpression') {
                                console.log(`[Suspicious Expression] ${filePath}:${path.node.loc.start.line} -> inside <${tagName}> `);
                                console.log(code.split('\n')[path.node.loc.start.line - 1]);
                            }
                        }
                    }
                }
            }
        });

    } catch (err) { }
}

const targetDirs = [
    'h:/farmersApp/frontend/app',
    'h:/farmersApp/frontend/components'
];

targetDirs.forEach(dir => {
    walkDir(dir, checkFile);
});
