/**
 * Genera el icono del mod a partir de texturas OFICIALES de Minecraft.
 * Sin IA generativa: la silueta es diamond_chestplate.png del juego y las paletas
 * salen de las texturas de armadura vanilla (oro, hierro, cuero).
 *
 * La mitad izquierda reproduce el bug: la forma correcta pintada con los colores de
 * otra armadura y con huecos, que es exactamente lo que se ve en juego.
 *
 * Uso:  node tools/generar-icono.js <ruta a diamond_chestplate.png> [salida.png]
 *   La textura se saca del jar de Minecraft:
 *   assets/minecraft/textures/item/diamond_chestplate.png
 */
const { decode, encode } = require('./png.js');

const src = process.argv[2] || 'diamond_chestplate.png';
const out = process.argv[3] || 'icon.png';

const item = decode(src);
const N = 16, F = 32, SIZE = N * F;
const BG = [22, 24, 28, 255];

// paletas reales de las texturas de armadura vanilla, ordenadas por luminancia
const ORO    = [[0x8a,0x5e,0x18],[0xd3,0x96,0x32],[0xe0,0xb2,0x30],[0xf5,0xb8,0x1c],[0xfe,0xff,0xbd]];
const HIERRO = [[0x6b,0x6b,0x6b],[0x99,0x99,0x99],[0xb7,0xb7,0xb7],[0xc2,0xc2,0xc2],[0xff,0xff,0xff]];
const CUERO  = [[0x4a,0x30,0x1c],[0x7a,0x50,0x2c],[0x99,0x66,0x38],[0xb0,0x7a,0x44],[0xc9,0x96,0x5a]];

const lum = c => (c[0]*0.299 + c[1]*0.587 + c[2]*0.114) / 255;

encode(SIZE, SIZE, (px, py) => {
  const x = Math.floor(px / F), y = Math.floor(py / F);
  const base = item.px(x, y);
  if (base[3] <= 8) return BG;                    // fuera de la silueta
  if (x >= N / 2) return base;                    // derecha: la armadura correcta
  if ((x * 7 + y * 5) % 13 === 0) return BG;      // huecos, como los del bug
  const pal = [ORO, HIERRO, CUERO][(y + Math.floor(x / 2)) % 3];
  const c = pal[Math.min(pal.length - 1, Math.floor(lum(base) * pal.length))];
  return [c[0], c[1], c[2], 255];
}, out);

console.log('icono generado en', out);
