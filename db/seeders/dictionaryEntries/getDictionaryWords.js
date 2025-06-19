import fs, { readFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

// XML SLO Lexicon can be downloaded here: https://www.clarin.si/repository/xmlui/handle/11356/1745

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchDictionaryTermHtml(term) {
  const response = await fetch(`https://www.fran.si/iskanje?View=1&Query=${term}`, {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      priority: 'u=0, i',
      'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      Referer: 'https://www.fran.si/iskanje?View=1&Query=marma',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: null,
    method: 'GET',
  });
  return response.text();
}

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
