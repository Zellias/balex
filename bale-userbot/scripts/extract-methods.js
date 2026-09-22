/**
 * Bale Protobuf RPC Method Extractor
 * Extracts all 53 services and 636 methods along with their request & response schemas.
 */

const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

function parseSchemaFromCode(code, varName, methodIndex) {
  if (!varName) return { fields: [], defaultValues: {} };
  if (varName.includes('.')) {
    return { isExternal: true, externalVar: varName, fields: [], defaultValues: {} };
  }

  const escapeVar = varName.replace('$', '\\$');
  const regex = new RegExp(`(?:let|var|const|[,;])\\s*${escapeVar}\\s*=\\s*\\{\\s*encode\\(`, 'g');
  let match;
  let bestMatch = null;
  let minDistance = Infinity;
  while ((match = regex.exec(code)) !== null) {
    const dist = Math.abs(match.index - methodIndex);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = match;
    }
  }

  if (!bestMatch) return { fields: [], defaultValues: {} };

  const chunk = code.substring(bestMatch.index, bestMatch.index + 5000);

  // Default values from decode
  const defaultValues = {};
  const defMatch = chunk.match(/decode\s*\([^)]*\)\s*\{[\s\S]*?[a-zA-Z0-9_$]+\s*=\s*\{([^{}]*)\}/);
  if (defMatch) {
    const lines = defMatch[1].split(',');
    for (const l of lines) {
      const p = l.trim().split(':');
      if (p.length >= 2) {
        const k = p[0].trim();
        const v = p.slice(1).join(':').trim();
        defaultValues[k] = v;
      }
    }
  }

  const fields = [];
  const fieldMap = new Map();

  // Parse encode lines
  const encodeSub = chunk.substring(0, chunk.indexOf('decode('));
  if (encodeSub) {
    const primRegex = /r\.uint32\((\d+)\)\.(string|int64|int32|uint32|bool|double|bytes)\([a-zA-Z0-9_$]+\.([a-zA-Z0-9_$]+)\)/g;
    let pm;
    while ((pm = primRegex.exec(encodeSub)) !== null) {
      const tag = parseInt(pm[1]) >>> 3;
      const type = pm[2];
      const name = pm[3];
      if (!fieldMap.has(name)) {
        const item = { tag, name, type, isRepeated: false };
        fieldMap.set(name, item);
        fields.push(item);
      }
    }

    const msgRegex = /([a-zA-Z0-9_$.]+)\.encode\([a-zA-Z0-9_$]+\.([a-zA-Z0-9_$]+),\s*r\.uint32\((\d+)\)\.fork\(\)\)\.join\(\)/g;
    let mm;
    while ((mm = msgRegex.exec(encodeSub)) !== null) {
      const name = mm[2];
      const tag = parseInt(mm[3]) >>> 3;
      if (!fieldMap.has(name)) {
        const item = { tag, name, type: 'message', isRepeated: false };
        fieldMap.set(name, item);
        fields.push(item);
      }
    }
  }

  // Parse decode switch cases for any missing fields or repeated types
  const switchMatch = chunk.match(/switch\s*\([^{}]*?>>>\s*3\)\s*\{([\s\S]*?)\}\s*if\s*\(/);
  if (switchMatch) {
    const caseBlock = switchMatch[1];
    const caseRegex = /case\s+(\d+):[\s\S]*?(?:o|r|s|l|c|d|u|h|m|v|p)\.([a-zA-Z0-9_$]+)\s*(\.push\s*\([^)]+\)|=[\s\S]*?;)/g;
    let cm;
    while ((cm = caseRegex.exec(caseBlock)) !== null) {
      const tag = parseInt(cm[1]);
      const name = cm[2];
      const isPush = cm[3].startsWith('.push');
      let type = 'unknown';
      if (cm[3].includes('.int64()')) type = 'int64';
      else if (cm[3].includes('.int32()')) type = 'int32';
      else if (cm[3].includes('.uint32()')) type = 'uint32';
      else if (cm[3].includes('.string()')) type = 'string';
      else if (cm[3].includes('.bool()')) type = 'bool';
      else if (cm[3].includes('.bytes()')) type = 'bytes';
      else if (cm[3].includes('.decode(')) type = 'message';

      if (fieldMap.has(name)) {
        const item = fieldMap.get(name);
        if (isPush) item.isRepeated = true;
        if (item.type === 'unknown' && type !== 'unknown') item.type = type;
      } else {
        const item = { tag, name, type, isRepeated: isPush };
        fieldMap.set(name, item);
        fields.push(item);
      }
    }
  }

  // Fallback to defaultValues for any fields not matched by regex
  for (const [k, v] of Object.entries(defaultValues)) {
    if (!fieldMap.has(k)) {
      let guessedType = 'unknown';
      if (v === '""' || v === "''") guessedType = 'string';
      else if (v === '0' || v === '0n') guessedType = 'int32';
      else if (v === '"0"') guessedType = 'int64';
      else if (v === 'false' || v === 'true') guessedType = 'bool';
      else if (v === '[]') guessedType = 'array';
      const item = { tag: fields.length + 1, name: k, type: guessedType, isRepeated: v === '[]' };
      fieldMap.set(k, item);
      fields.push(item);
    }
  }

  return { fields, defaultValues };
}

function extractAll(workspaceRoot) {
  const jsFiles = walk(workspaceRoot);
  console.log(`Scanning ${jsFiles.length} JavaScript files...`);

  const servicesMap = new Map();

  for (const file of jsFiles) {
    if (file.includes('bale-userbot')) continue;

    const code = fs.readFileSync(file, 'utf8');

    // Find service definitions
    const serviceDefs = [];
    const sRegex = /(?:let|var|const|[,;])?\s*([A-Za-z0-9_$]+)\s*=\s*\{\s*serviceName:\s*["\x27]([^"\x27]+)["\x27]\s*\}/g;
    let sm;
    while ((sm = sRegex.exec(code)) !== null) {
      serviceDefs.push({
        varName: sm[1],
        serviceName: sm[2],
        index: sm.index
      });
    }

    // Match method descriptors
    const mRegex = /methodName:\s*["\x27]([A-Za-z0-9_$]+)["\x27]\s*,\s*service:\s*(?:([A-Za-z0-9_$]+)|\{\s*serviceName:\s*["\x27]([^"\x27]+)["\x27]\s*\})\s*,\s*requestStream:\s*(![01]|true|false)\s*,\s*responseStream:\s*(![01]|true|false)/g;
    let mm;
    while ((mm = mRegex.exec(code)) !== null) {
      const methodName = mm[1];
      const sVar = mm[2];
      const sInline = mm[3];
      const reqStream = mm[4] === '!0' || mm[4] === 'true';
      const resStream = mm[5] === '!0' || mm[5] === 'true';
      const mIndex = mm.index;

      let serviceName = sInline;
      if (!serviceName && sVar) {
        let closest = null;
        let minDistance = Infinity;
        for (const sd of serviceDefs) {
          if (sd.varName === sVar) {
            const dist = Math.abs(sd.index - mIndex);
            if (dist < minDistance) {
              minDistance = dist;
              closest = sd;
            }
          }
        }
        if (closest) {
          serviceName = closest.serviceName;
        } else {
          serviceName = sVar;
        }
      }

      if (!servicesMap.has(serviceName)) {
        servicesMap.set(serviceName, new Map());
      }
      const methods = servicesMap.get(serviceName);

      const sub = code.substring(mIndex, mIndex + 800);
      const reqTypeMatch = sub.match(/requestType:\s*\{\s*serializeBinary\(\)\s*\{\s*return\s+([A-Za-z0-9_$.]+)\.encode/);
      const resTypeMatch = sub.match(/responseType:\s*\{\s*deserializeBinary\([^)]*\)\s*\{\s*let\s+[A-Za-z0-9_$]+\s*=\s*([A-Za-z0-9_$.]+)\.decode/);

      const reqEncoder = reqTypeMatch ? reqTypeMatch[1] : null;
      const resDecoder = resTypeMatch ? resTypeMatch[1] : null;

      const requestSchema = parseSchemaFromCode(code, reqEncoder, mIndex);
      const responseSchema = parseSchemaFromCode(code, resDecoder, mIndex);

      methods.set(methodName, {
        methodName,
        serviceName,
        requestStream: reqStream,
        responseStream: resStream,
        requestEncoder: reqEncoder,
        responseDecoder: resDecoder,
        requestSchema,
        responseSchema,
        file: path.relative(workspaceRoot, file)
      });
    }
  }

  function toNamespace(sName) {
    const parts = sName.split('.');
    let base = parts[parts.length - 1];
    if (base.endsWith('Service') && base.length > 7) {
      base = base.substring(0, base.length - 7);
    }
    return base.charAt(0).toLowerCase() + base.slice(1);
  }

  const result = {
    metadata: {
      extractedAt: new Date().toISOString(),
      protocolVersion: 1,
      apiVersion: 171248,
      defaultEndpoint: {
        grpc: 'https://next-ws.bale.ai',
        ws: 'wss://next-ws.bale.ai/ws/',
        mavizWs: 'wss://maviz-ws.bale.ai/ws/'
      },
      totalServices: servicesMap.size,
      totalMethods: 0
    },
    services: {}
  };

  const sortedServices = [...servicesMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  for (const [sName, mmap] of sortedServices) {
    const methodsList = [...mmap.values()].sort((a, b) => a.methodName.localeCompare(b.methodName));
    result.metadata.totalMethods += methodsList.length;

    const ns = toNamespace(sName);
    result.services[sName] = {
      serviceName: sName,
      namespace: ns,
      methodCount: methodsList.length,
      methods: methodsList
    };
  }

  return result;
}

function generateMarkdown(catalog) {
  let md = `# Bale Protobuf RPC Services & Methods Catalog\n\n`;
  md += `> Automatically extracted from Bale Web Client bundles.\n`;
  md += `> **Total Services**: ${catalog.metadata.totalServices}  \n`;
  md += `> **Total Methods**: ${catalog.metadata.totalMethods}  \n`;
  md += `> **Protocol Version**: ${catalog.metadata.protocolVersion}  \n`;
  md += `> **API Version**: ${catalog.metadata.apiVersion}  \n\n`;

  md += `## Table of Contents\n\n`;
  for (const [sName, sData] of Object.entries(catalog.services)) {
    md += `- [${sName} (\`${sData.namespace}\` - ${sData.methodCount} methods)](#${sName.toLowerCase().replace(/[^a-z0-9]/g, '-')})\n`;
  }
  md += `\n---\n\n`;

  for (const [sName, sData] of Object.entries(catalog.services)) {
    md += `### ${sName}\n`;
    md += `Client Namespace: \`client.${sData.namespace}.<methodName>(params)\`\n\n`;
    md += `| # | Method | Parameters | Return Fields | Streams |\n`;
    md += `|---|--------|------------|---------------|---------|\n`;
    sData.methods.forEach((m, idx) => {
      const paramsStr = (m.requestSchema && m.requestSchema.fields && m.requestSchema.fields.length > 0)
        ? m.requestSchema.fields.map(f => `\`${f.name}${f.isRepeated ? '[]' : ''}\``).join(', ')
        : '*(none/empty)*';
      const returnsStr = (m.responseSchema && m.responseSchema.fields && m.responseSchema.fields.length > 0)
        ? m.responseSchema.fields.map(f => `\`${f.name}${f.isRepeated ? '[]' : ''}\``).join(', ')
        : '*(none/response)*';
      const streamStr = (m.requestStream || m.responseStream) ? `Req: ${m.requestStream}, Res: ${m.responseStream}` : 'Unary';

      md += `| ${idx + 1} | \`${m.methodName}\` | ${paramsStr} | ${returnsStr} | ${streamStr} |\n`;
    });
    md += `\n`;
  }

  return md;
}

if (require.main === module) {
  const workspaceRoot = path.resolve(__dirname, '../../');
  const targetDir = path.resolve(__dirname, '../src/generated');
  fs.mkdirSync(targetDir, { recursive: true });

  const catalog = extractAll(workspaceRoot);
  const jsonPath = path.join(targetDir, 'services.json');
  fs.writeFileSync(jsonPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Saved services catalog to ${jsonPath}`);
  console.log(`Total Services: ${catalog.metadata.totalServices}`);
  console.log(`Total Methods: ${catalog.metadata.totalMethods}`);

  const md = generateMarkdown(catalog);
  const mdPath = path.resolve(__dirname, '../SERVICES.md');
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log(`Saved Markdown documentation to ${mdPath}`);
}

module.exports = { extractAll, generateMarkdown };
