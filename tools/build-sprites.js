// Generates pixel-art SVG sprites from text grids.
const fs = require('fs');
const path = require('path');

const PALETTE = {
  K: '#1b1b2f', // outline
  S: '#f2c29b', s: '#c98b6b', // skin
  H: '#6b3e26', h: '#4a2a19', // hair
  E: '#1b1b2f', // eyes
  A: '#8a9bb0', a: '#5b6b80', W: '#c8d4e0', // armor / steel
  Y: '#e8b83a', // gold
  B: '#7a4a22', b: '#5a3416', // leather
  P: '#3b4a6b', // pants
  F: '#3a2a1e', // boots
};

const SPRITES = {
  knight: [
    '.....KKKKKK.....',
    '....KhHHHHhK....',
    '....KHHHHHHK....',
    '....KHSSSSHK....',
    '....KSESSESK....',
    '....KSSSSSsK....',
    '....KsSSSSsK....',
    '.....KsSSsK.....',
    '...KKKaWWaKKK...',
    '..KWWAAWWAAWWK..',
    '.KAAKAAYYAAKAAK.',
    '.KAAKAAAAAAKAAK.',
    '.KaaKaAAAAaKaaK.',
    '.KSSKBBYYBBKSSK.',
    '.KKK.KaAAaK.KKK.',
    '.....KAaaAK.....',
    '....KPPPPPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '....KFFKKFFK....',
    '...KFFFKKFFFK...',
    '...KKKKKKKKKK...',
    '................',
  ],
  sword: [
    '...KK...',
    ...Array(13).fill('..KWAK..'),
    'KKKKKKKK',
    'KYYYYYYK',
    'KKKBBKKK',
    '..KBBK..',
    '..KBbK..',
    '..KBBK..',
    '..KbBK..',
    '..KYYK..',
    '..KKKK..',
    '........',
  ],
};

const out = path.join(__dirname, '..', 'assets', 'sprites');
for (const [name, rows] of Object.entries(SPRITES)) {
  const w = rows[0].length;
  rows.forEach((r, i) => {
    if (r.length !== w) throw new Error(`${name} row ${i} has width ${r.length}, expected ${w}`);
  });
  const rects = [];
  rows.forEach((r, y) => [...r].forEach((c, x) => {
    if (c === '.') return;
    if (!PALETTE[c]) throw new Error(`${name}: unknown color '${c}'`);
    rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${PALETTE[c]}"/>`);
  }));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${rows.length}" width="${w}" height="${rows.length}" shape-rendering="crispEdges">\n${rects.join('\n')}\n</svg>\n`;
  fs.writeFileSync(path.join(out, `${name}.svg`), svg);
  console.log(`wrote ${name}.svg (${w}x${rows.length})`);
}
