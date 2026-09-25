import type { SpriteDef } from "./Sprite";

const person = { h: "var(--hair)", s: "var(--skin)", t: "var(--shirt)", p: "var(--pants)", k: "#1a1c24" };

export const PERSON_A: SpriteDef = {
  palette: person,
  rows: ["..hh..", ".hhhh.", ".hssh.", "..ss..", ".tttt.", "t.tt.t", "s.tt.s", "..pp..", ".p..p.", ".p..p.", "kk..kk"],
};
export const PERSON_B: SpriteDef = {
  palette: person,
  rows: ["..hh..", ".hhhh.", ".hssh.", "..ss..", ".tttt.", ".tttt.", ".stts.", "..pp..", "..pp..", "..pp..", "..kk.."],
};
export const WORKER: SpriteDef = {
  palette: person,
  rows: ["..hh..", ".hhhh.", ".hssh.", "..ss..", ".tttt.", "tttttt", "s.tt.s", "..pp..", "..pp..", ".k..k."],
};

export const DESK: SpriteDef = {
  palette: { k: "#2a2f3d", s: "var(--screen-c)", d: "#8a5a34", e: "#5b3a20" },
  rows: [
    ".....kkkkkk.....",
    ".....kssssk.....",
    ".....kssssk.....",
    ".....kkkkkk.....",
    ".......kk.......",
    "dddddddddddddddd",
    ".e............e.",
    ".e............e.",
    ".e............e.",
    ".e............e.",
  ],
};

export const SHELF: SpriteDef = {
  palette: { b: "#7a5230", "1": "#d94848", "2": "#3d7bd9", "3": "#e0b53c" },
  rows: [
    "bbbbbbbbbb",
    "b12.31.23b",
    "b12.31.23b",
    "b12331223b",
    "bbbbbbbbbb",
    "b3.21.132b",
    "b3121.132b",
    "b31213132b",
    "bbbbbbbbbb",
    "b........b",
    "bbbbbbbbbb",
  ],
};

export const COOLER: SpriteDef = {
  palette: { w: "#cfeaf8", c: "#7fc8f8", g: "#b8bcc8", r: "#d94848", b: "#3d7bd9" },
  rows: [".wwww.", ".cccc.", ".cccc.", ".cccc.", "..ww..", "gggggg", "g.rb.g", "gggggg", "g....g", "g....g", "gggggg"],
};

export const PLANT: SpriteDef = {
  palette: { g: "#3fa45b", l: "#6fd48a", p: "#b0643a" },
  rows: ["..l.g..", ".glg.g.", "g.gglg.", ".gl.ggl", "..ggg..", "...g...", ".ppppp.", ".ppppp.", "..ppp..", "..ppp.."],
};

export const CAR: SpriteDef = {
  palette: { b: "var(--car)", w: "#bfe3ff", y: "#ffe28a", r: "#ff5a5a", k: "#111", g: "#777" },
  rows: [
    "......bbbbbbb.......",
    ".....bwwwbwwwb......",
    "....bwwwwbwwwwb.....",
    "bbbbbbbbbbbbbbbbbbby",
    "bbbbbbbbbbbbbbbbbbbb",
    "rbbbbbbbbbbbbbbbbbbb",
    "bbbkkkbbbbbbbbkkkbbb",
    "...kgk........kgk...",
  ],
};

export const MOON: SpriteDef = {
  palette: { m: "#f4efd8", c: "#d8d0b0" },
  rows: [
    "....mmm....",
    "..mmmmmmm..",
    ".mmmmmmcmm.",
    ".mmcmmmmmm.",
    "mmmmmmmmmmm",
    "mmmmmmmccmm",
    "mmcmmmmccmm",
    ".mmmmmmmmm.",
    ".mmmmcmmmm.",
    "..mmmmmmm..",
    "....mmm....",
  ],
};

export const CLOUD: SpriteDef = {
  palette: { c: "#34407e", d: "#27306399" },
  rows: [
    "........cccc........",
    ".....ccccccccc......",
    "...cccccccccccccc...",
    ".ccccccccccccccccccc",
    "cccccccccccccccccccc",
    ".dddddddddddddddddd.",
  ],
};

export const BLIMP: SpriteDef = {
  palette: { g: "#8a93a8", l: "#aab2c4", f: "#5e667a", k: "#3a3f4f" },
  rows: [
    "........llllllllllllll........",
    "....llllllllllllllllllllll....",
    "..gggggggggggggggggggggggggg.f",
    ".gggggggggggggggggggggggggggff",
    "gggggggggggggggggggggggggggggf",
    "gggggggggggggggggggggggggggggf",
    ".gggggggggggggggggggggggggggff",
    "..gggggggggggggggggggggggggg.f",
    "....gggggggggggggggggggggg....",
    "............kkkkkk............",
  ],
};

export const PLANE: SpriteDef = {
  palette: { w: "#c9ced9", d: "#8a93a8", r: "#ff5a5a" },
  rows: ["....w........", "....ww.......", "dwwwwwwwwwwwr", ".dwwwwwwwwww.", "....ww.......", "....w........"],
};

export const BIRD_A: SpriteDef = { palette: { b: "#0b0f26" }, rows: ["b...b", ".b.b.", "..b.."] };
export const BIRD_B: SpriteDef = { palette: { b: "#0b0f26" }, rows: [".....", "bb.bb", "..b.."] };

export const CHECK: SpriteDef = {
  palette: { k: "#1a1c24" },
  rows: ["......k", ".....kk", "k...kk.", "kk.kk..", ".kkk...", "..k...."],
};

export const REACTOR: SpriteDef = {
  palette: { g: "#9aa0ad", o: "var(--core)", w: "#ffffffaa" },
  rows: [
    "...ggggg...",
    "..g.....g..",
    ".g.ooooo.g.",
    "g.oowoooo.g",
    "g.owooooo.g",
    "g.ooooooo.g",
    "g.ooooooo.g",
    "g.ooooooo.g",
    ".g.ooooo.g.",
    "..g.....g..",
    "...ggggg...",
  ],
};

export const CABINET: SpriteDef = {
  palette: {
    k: "#3a3f4f", g: "#9aa0ad", l: "#b8bcc8", h: "#2a2f3d", y: "#e3b866",
    "1": "#ffd35a", "2": "#5fd3f3", "3": "#ff7a7a", "4": "#6fe39a",
  },
  rows: [
    "..1..2.3..4.",
    ".y1yy2y3yy4.",
    "kkkkkkkkkkkk",
    "kllllllllllk",
    "kgggghhggggk",
    "kggggggggggk",
    "kkkkkkkkkkkk",
    "kllllllllllk",
    "kgggghhggggk",
    "kggggggggggk",
    "kkkkkkkkkkkk",
    "kllllllllllk",
    "kgggghhggggk",
    "kggggggggggk",
    "kkkkkkkkkkkk",
  ],
};
