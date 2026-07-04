/**
 * Mathematics Engine — Expression Parser
 * -----------------------------------------------------
 * Converts arbitrary user text into a resolved numeric or
 * complex value that becomes the new "reality constant" (π').
 *
 * mathjs is lazy-loaded (~630KB) so it never enters the initial
 * bundle — only once the user actually interacts with the input
 * console. A synchronous fast path handles plain numbers, simple
 * fractions, and Infinity without needing mathjs at all.
 */
export const REAL_PI = Math.PI;

let mathInstancePromise = null;
function getMath() {
  if (!mathInstancePromise) {
    mathInstancePromise = import('mathjs').then(({ create, all }) => create(all, {}));
  }
  return mathInstancePromise;
}

const SCOPE = {
  phi: (1 + Math.sqrt(5)) / 2, // golden ratio
  tau: 2 * Math.PI,
  pi: Math.PI,
};

const SIMPLE_NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)$/;
const SIMPLE_FRACTION = /^([+-]?\d+)\s*\/\s*(\d+)$/;

/**
 * @typedef {Object} ParsedConstant
 * @property {'real'|'complex'|'infinite'|'invalid'} kind
 * @property {number} [value]
 * @property {{re:number, im:number}} [complex]
 * @property {string} raw
 * @property {string} normalized
 * @property {number} deviation
 */

/**
 * Synchronous fast path — handles the overwhelming majority of inputs
 * (plain numbers, simple fractions, Infinity) without ever touching mathjs.
 * Returns null if the input needs the full symbolic parser.
 * @param {string} raw
 * @returns {ParsedConstant|null}
 */
export function tryFastParse(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: 'invalid', raw, normalized: '', deviation: NaN };

  const lower = trimmed.toLowerCase();
  if (['infinity', 'inf', '+infinity', '+inf'].includes(lower)) {
    return { kind: 'infinite', value: Infinity, raw, normalized: '+∞', deviation: Infinity };
  }
  if (['-infinity', '-inf'].includes(lower)) {
    return { kind: 'infinite', value: -Infinity, raw, normalized: '−∞', deviation: -Infinity };
  }

  if (SIMPLE_NUMBER.test(trimmed)) {
    return finalizeReal(parseFloat(trimmed), raw);
  }

  const fracMatch = trimmed.match(SIMPLE_FRACTION);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den !== 0) return finalizeReal(num / den, raw);
  }

  return null; // needs the full symbolic parser
}

/**
 * Full parse — resolves via the fast path first, then lazy-loads mathjs
 * for anything symbolic (named constants, functions, complex numbers).
 * @param {string} input
 * @returns {Promise<ParsedConstant>}
 */
export async function parseConstant(input) {
  const raw = (input ?? '').trim();
  const fast = tryFastParse(raw);
  if (fast) return fast;

  try {
    const math = await getMath();
    const node = math.parse(raw);
    const evaluated = node.evaluate(SCOPE);

    if (evaluated && typeof evaluated === 'object' && 're' in evaluated && 'im' in evaluated) {
      const re = evaluated.re;
      const im = evaluated.im;
      if (Math.abs(im) < 1e-12) return finalizeReal(re, raw);
      return {
        kind: 'complex',
        complex: { re, im },
        raw,
        normalized: `${trimNum(re)} ${im >= 0 ? '+' : '−'} ${trimNum(Math.abs(im))}i`,
        deviation: NaN,
      };
    }

    if (typeof evaluated === 'number') {
      if (!Number.isFinite(evaluated)) {
        return { kind: 'infinite', value: evaluated, raw, normalized: evaluated > 0 ? '+∞' : '−∞', deviation: evaluated };
      }
      return finalizeReal(evaluated, raw);
    }

    const asNum = math.number(evaluated);
    if (Number.isFinite(asNum)) return finalizeReal(asNum, raw);

    return { kind: 'invalid', raw, normalized: 'Unrecognized', deviation: NaN };
  } catch (err) {
    return { kind: 'invalid', raw, normalized: 'Could not parse expression', deviation: NaN, error: String(err.message || err) };
  }
}

function finalizeReal(value, raw) {
  return {
    kind: 'real',
    value,
    raw,
    normalized: trimNum(value),
    deviation: value / REAL_PI,
  };
}

function trimNum(n) {
  if (Object.is(n, -0)) n = 0;
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(6);
  return Number(n.toPrecision(10)).toString();
}

/** Quick presets shown as tappable chips in the input console. */
export const PRESETS = [
  { label: 'π (real)', value: 'pi' },
  { label: '22/7', value: '22/7' },
  { label: '2', value: '2' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '100', value: '100' },
  { label: 'e', value: 'e' },
  { label: 'φ (phi)', value: 'phi' },
  { label: 'τ (tau)', value: 'tau' },
  { label: '√2', value: 'sqrt(2)' },
  { label: '0.5', value: '0.5' },
  { label: '-π', value: '-pi' },
  { label: '2+3i', value: '2+3i' },
  { label: '∞', value: 'Infinity' },
];
