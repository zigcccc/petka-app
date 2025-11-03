import fs, { readFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

import { fetchDictionaryTermHtml } from './utils.js';

// XML SLO Lexicon can be downloaded here: https://www.clarin.si/repository/xmlui/handle/11356/1745

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function isValidDictionaryTerm(term) {
  const legalChars = [
    'a',
    'b',
    'c',
    'č',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'r',
    's',
    'š',
    't',
    'u',
    'v',
    'z',
    'ž',
  ];
  const areAllTermCharsValid = term
    .split('')
    .map((char) => char.toLowerCase())
    .every((char) => legalChars.includes(char));

  if (!areAllTermCharsValid) {
    return false;
  }

  const html = await fetchDictionaryTermHtml(term);
  const $ = cheerio.load(html);
  const text = $('.fran-main-content .fran-left-content p').text();

  return !text.startsWith('Vaše iskanje ni bilo uspešno.') && !text.startsWith('Našli nismo nobene (pod)iztočnice.');
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

async function readAndParseXmlFiles(directoryPath) {
  const writeStream = createWriteStream(path.join(__dirname, 'output.jsonl'));
  const files = await fs.readdir(directoryPath);

  // Filter only `.xml` files
  const xmlFiles = files.filter((file) => file.toLowerCase().endsWith('.xml'));

  for (const file of xmlFiles) {
    const filePath = path.join(directoryPath, file);
    const xmlContent = await readFile(filePath, 'utf-8');
    const json = parser.parse(xmlContent);
    const words = json.lexicon.entry
      .filter((entry) => entry.head.grammar.category === 'noun')
      .map((entry) => entry.head)
      .filter((wordDefinition) => wordDefinition.headword.lemma.length === 5)
      .filter((wordDefinition) => wordDefinition.headword.lemma === wordDefinition.headword.lemma.toLowerCase())
      .map((wordDefinition) => ({
        word: wordDefinition.headword.lemma,
        frequency: wordDefinition.measureList.measure['#text'],
      }));

    words.forEach(async (item) => {
      const isValid = await isValidDictionaryTerm(item.word);
      if (isValid) {
        console.log(`Writing word: ${item.word} with frequency: ${item.frequency}`);
        writeStream.write(JSON.stringify(item) + '\n');
      } else {
        console.warn('Found illegal word: ', item.word);
      }
    });
  }

  writeStream.end(() => {
    console.log('Finished writing JSONL file.');
  });
}

readAndParseXmlFiles(path.join(__dirname, 'Sloleks.3.0'));
