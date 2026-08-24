const assert = require('assert');
const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const pageFiles = walk(path.join(__dirname, '..', 'pages'));
for (const wxmlPath of pageFiles.filter((file) => file.endsWith('.wxml'))) {
  const jsPath = wxmlPath.replace(/\.wxml$/, '.js');
  const wxml = fs.readFileSync(wxmlPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');
  const handlers = [...wxml.matchAll(/(?:bind|catch)(?:tap|input|confirm|change)="([A-Za-z_$][\w$]*)"/g)]
    .map((match) => match[1]);
  for (const handler of handlers) {
    assert(
      new RegExp(`\\b${handler}\\s*\\(`).test(js),
      `${path.relative(process.cwd(), wxmlPath)} 引用了未实现的方法 ${handler}`
    );
  }
}

const serviceText = walk(path.join(__dirname, '..', 'services'))
  .filter((file) => file.endsWith('.js'))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const frontendRoutes = new Set([...serviceText.matchAll(/['"](\/api\/[a-z/]+)['"]/g)].map((m) => m[1]));
const backendUrls = fs.readFileSync(
  path.join(__dirname, '..', '..', 'mushenmu-mall-server', 'wxcloudrun', 'urls.py'),
  'utf8'
);
const backendRoutes = new Set([...backendUrls.matchAll(/path\("(api\/[a-z/]+)"/g)].map((m) => `/${m[1]}`));
const missing = [...frontendRoutes].filter((route) => !backendRoutes.has(route));
assert.deepStrictEqual(missing, [], `后端缺少前端调用的路由: ${missing.join(', ')}`);

console.log(`static integration test passed (${frontendRoutes.size} routes)`);
