// Gera src/appHtml.ts a partir de web/app.html (rode depois de trocar o app.html)
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'web', 'app.html'), 'utf8');
fs.mkdirSync(path.join(__dirname, '..', 'src'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'src', 'appHtml.ts'),
  '// Arquivo gerado por scripts/gerar-html.js. Não edite à mão.\nconst html: string = ' + JSON.stringify(html) + ';\nexport default html;\n');
console.log('src/appHtml.ts gerado (' + Math.round(html.length / 1024) + ' KB)');
