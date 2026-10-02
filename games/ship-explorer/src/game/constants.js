export const GAME_WIDTH = 1400;
export const GAME_HEIGHT = 800;
export const FIXED_TIMESTEP = 1 / 60;
export const MAX_FRAME_DELTA = 0.1;
export const MAX_UPDATES_PER_FRAME = 8;

export const GAME_STATES = {
  BOOT: "boot",
  TITLE: "title",
  PLAYING: "playing",
  PAUSED: "paused",
  SETTINGS: "settings",
  GAME_OVER: "gameOver",
};

export const COLORS = {
  black: "#141b14",
  void: "#1f261e",
  panel: "#293326",
  panelDeep: "#111810",
  cyan: "#c1d99b",
  cyanDim: "#8ca474",
  teal: "#d5e4ba",
  tealDark: "#566d45",
  amber: "#c1d99b",
  amberDim: "#91a57b",
  orange: "#e94f2e",
  orangeHot: "#f16b42",
  orangeDim: "#8c492f",
  red: "#e94f2e",
  redDim: "#753d2b",
  heart: "#e94f2e",
  white: "#e5e8d8",
  muted: "#91a57b",
  blue: "#88a571",
  violet: "#566d45",
  violetBright: "#8ca474",
  magentaHot: "#a7c48a",
  lime: "#c1d99b",
  olive: "#91a57b",
};

export const FONT_FAMILY = '"Automatron", "Consolas", monospace';

export const PLAYFIELD = {
  left: 216,
  right: 1328,
  top: 92,
  bottom: 616,
};

export const BUBBLE_TYPES = [
  {
    id: "cyan",
    color: COLORS.cyan,
    dim: COLORS.cyanDim,
    points: 100,
    radius: [24, 42],
    life: [7.2, 9.4],
    speed: [6, 12],
    weight: 58,
  },
  {
    id: "amber",
    color: COLORS.orange,
    dim: COLORS.orangeDim,
    points: 160,
    radius: [22, 36],
    life: [5.8, 7.8],
    speed: [9, 15],
    weight: 28,
  },
  {
    id: "red",
    color: COLORS.orangeHot,
    dim: COLORS.redDim,
    points: 260,
    radius: [18, 30],
    life: [4.2, 6.4],
    speed: [12, 20],
    weight: 11,
  },
  {
    id: "core",
    color: COLORS.blue,
    dim: COLORS.tealDark,
    points: 420,
    radius: [32, 48],
    life: [4.8, 6.2],
    speed: [3, 8],
    weight: 3,
  },
];

export const GAME_RULES = {
  duration: 300,
  lives: 3,
  bubbleLimit: 18,
  bossBubblePenaltyLimit: 10,
  baseSpawnEvery: 0.92,
  minSpawnEvery: 0.32,
  comboWindow: 1,
  missPenalty: 1,
  dangerDrain: 1,
  shipSpeed: 10,
};
