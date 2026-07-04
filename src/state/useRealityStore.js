import { create } from 'zustand';
import { REAL_PI, parseConstant, tryFastParse } from '../engines/math/parser.js';
import { realityMeters } from '../engines/math/formulas.js';
import { EXHIBITS } from '../data/exhibitRegistry.js';

const STORAGE_KEY = 'project-pi:achievements';

function loadAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveAchievements(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

function readPiFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('pi');
  } catch {
    return null;
  }
}

const INITIAL_PARSED = {
  kind: 'real', value: REAL_PI, raw: 'pi', normalized: REAL_PI.toFixed(10), deviation: 1,
};

export const useRealityStore = create((set, get) => ({
  parsed: INITIAL_PARSED,
  rawInput: readPiFromUrl() ?? 'pi',
  hasSimulated: false,
  isParsing: false,
  simulateCount: 0,
  visitedExhibits: new Set(),
  unlockedAchievements: loadAchievements(),
  toastQueue: [],

  setInput: (raw) => set({ rawInput: raw }),

  simulate: async (rawOverride) => {
    const raw = rawOverride ?? get().rawInput;

    const fast = tryFastParse(raw);
    const finish = (parsed) => {
      set((s) => ({
        parsed, rawInput: raw, hasSimulated: true, isParsing: false,
        simulateCount: s.simulateCount + 1,
      }));
      get()._checkAchievements(parsed, raw);
    };

    if (fast) {
      finish(fast);
      return fast;
    }

    set({ isParsing: true });
    const parsed = await parseConstant(raw);
    finish(parsed);
    return parsed;
  },

  visitExhibit: (id) => {
    const visited = new Set(get().visitedExhibits);
    visited.add(id);
    set({ visitedExhibits: visited });
    if (visited.size >= EXHIBITS.length) {
      get()._unlock(['explorer']);
    }
  },

  _unlock: (ids) => {
    const unlocked = new Set(get().unlockedAchievements);
    const toUnlock = [];
    for (const id of ids) {
      if (!unlocked.has(id)) {
        unlocked.add(id);
        toUnlock.push(id);
      }
    }
    if (toUnlock.length) {
      saveAchievements(unlocked);
      set({ unlockedAchievements: unlocked, toastQueue: [...get().toastQueue, ...toUnlock] });
    }
  },

  unlockAchievement: (id) => get()._unlock([id]),

  _checkAchievements: (parsed, raw) => {
    const toUnlock = [];
    const lower = (raw ?? '').toLowerCase().trim();

    if (parsed.kind === 'real') {
      if (parsed.value === 2) toUnlock.push('circle-assassin');
      if (Math.abs(parsed.value) < 1e-9) toUnlock.push('flatliner');
      if (parsed.value < 0) toUnlock.push('negative-thinker');
      if (Math.abs(parsed.value - REAL_PI) < 1e-6) toUnlock.push('purist');
      if (parsed.value >= 100) toUnlock.push('reality-destroyer');
      if (parsed.value >= 1e6) toUnlock.push('universe-builder');
      if (lower.includes('3.14')) toUnlock.push('pi-day');
    }
    if (lower === '22/7') toUnlock.push('rational-thinker');
    if (lower === 'phi') toUnlock.push('golden-child');
    if (lower === 'tau') toUnlock.push('time-traveler');
    if (lower === 'e') toUnlock.push('euler-fan');
    if (parsed.kind === 'complex') toUnlock.push('impossible-mathematician');
    if (parsed.kind === 'infinite') toUnlock.push('physics-breaker');
    if (get().simulateCount + 1 >= 10) toUnlock.push('dedicated');

    get()._unlock(toUnlock);
  },

  dismissToast: () => set((s) => ({ toastQueue: s.toastQueue.slice(1) })),

  meters: () => {
    const p = get().parsed;
    if (p.kind === 'real') return realityMeters(p.value);
    if (p.kind === 'infinite') return realityMeters(Infinity);
    return realityMeters(NaN);
  },
}));

export const ACHIEVEMENTS = {
  'circle-assassin': { title: 'Circle Assassin', desc: 'Set π = 2. Circles never stood a chance.' },
  'flatliner': { title: 'Flatliner', desc: 'Reduced π to zero. Geometry has left the chat.' },
  'negative-thinker': { title: 'Negative Thinker', desc: 'Tried a negative π. Bold.' },
  'purist': { title: 'Purist', desc: 'Returned π to its true value.' },
  'reality-destroyer': { title: 'Reality Destroyer', desc: 'Pushed π past 100.' },
  'universe-builder': { title: 'Universe Builder', desc: 'Set π to a million or more.' },
  'impossible-mathematician': { title: 'Impossible Mathematician', desc: 'Entered a complex value for π.' },
  'physics-breaker': { title: 'Physics Breaker', desc: 'Set π to infinity.' },
  'pi-day': { title: 'Pi Day', desc: 'Typed something starting 3.14. Nice.' },
  'rational-thinker': { title: 'Rational Thinker', desc: 'Tried the classic approximation, 22/7.' },
  'golden-child': { title: 'Golden Child', desc: 'Set π to the golden ratio, φ.' },
  'time-traveler': { title: 'Time Traveler', desc: 'Set π to τ — a full turn in one constant.' },
  'euler-fan': { title: "Euler's №1 Fan", desc: 'Set π to e. A different kind of transcendental.' },
  'dedicated': { title: 'Dedicated Researcher', desc: 'Ran 10 simulations. The museum appreciates you.', hidden: true },
  'explorer': { title: 'Museum Explorer', desc: 'Visited every exhibit in the building.', hidden: true },
  'tour-guide': { title: 'Tour Complete', desc: 'Rode the Guided Tour from real π back to real π.', hidden: true },
};
