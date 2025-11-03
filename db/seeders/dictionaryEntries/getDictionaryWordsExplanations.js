import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

import { fetchDictionaryTermHtml } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readJsonlFile(path) {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const result = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    result.push(JSON.parse(line));
  }

  return result;
}

const data = await readJsonlFile(path.join(__dirname, 'output_with_usage.jsonl'));

async function processEntries() {
  const map = {};

  for (const entry of data) {
    console.log(`Processing entry "${entry.word}"...`);
    const dictTermHtml = await fetchDictionaryTermHtml(entry.word);
    const $ = cheerio.load(dictTermHtml);
    const explanation = $(
      '.fran-main-content .fran-left-content .results .entry .entry-content [data-group="explanation "]'
    )
      .text()
      .trim();

    map[entry.word] = explanation;
  }

  fs.writeFileSync('output_with_explanation.json', JSON.stringify(map, null, 2));
}

processEntries();
