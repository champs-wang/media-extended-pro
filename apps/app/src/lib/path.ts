/**
 * Pure-JS path utilities — compatible with both desktop and mobile Obsidian.
 * Replaces the Node.js `path` module dependency for cross-platform support.
 */

const WIN_PATH_RE = /^[a-zA-Z]:[\\/]/;
const WIN_SEP_RE = /\\/g;

function isWindowsPath(p: string): boolean {
  return WIN_PATH_RE.test(p);
}

function normalizeSep(p: string): string {
  // Use forward slash internally, but detect windows paths
  return p.replace(WIN_SEP_RE, "/");
}

export const sep = "/";

export function join(...parts: string[]): string {
  let result = "";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const normalized = normalizeSep(part);
    if (!result) {
      result = normalized;
      continue;
    }
    if (result.endsWith("/")) {
      result += normalized.startsWith("/") ? normalized.slice(1) : normalized;
    } else {
      result += normalized.startsWith("/") ? normalized : "/" + normalized;
    }
  }
  return result;
}

export function basename(p: string, ext?: string): string {
  const normalized = normalizeSep(p);
  const lastSlash = normalized.lastIndexOf("/");
  let base = lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized;
  if (ext && base.endsWith(ext)) {
    base = base.slice(0, -ext.length);
  }
  return base || normalized;
}

export function dirname(p: string): string {
  const normalized = normalizeSep(p);
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash <= 0) {
    // root or no directory
    return normalized.startsWith("/") || isWindowsPath(normalized)
      ? normalized.slice(0, Math.max(1, lastSlash + 1))
      : ".";
  }
  return normalized.slice(0, lastSlash);
}

export function extname(p: string): string {
  const normalized = normalizeSep(p);
  const base = normalized.slice(normalized.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  return base.slice(dot);
}

export function relative(from: string, to: string): string {
  const fromNorm = normalizeSep(from).replace(/\/$/, "");
  const toNorm = normalizeSep(to);

  const fromParts = fromNorm.split("/");
  const toParts = toNorm.split("/");

  // Find common prefix
  let i = 0;
  while (
    i < fromParts.length &&
    i < toParts.length &&
    fromParts[i] === toParts[i]
  ) {
    i++;
  }

  const upCount = fromParts.length - i;
  const downParts = toParts.slice(i);

  if (upCount === 0 && downParts.length === 0) return "";
  const ups = Array(upCount).fill("..");
  return [...ups, ...downParts].join("/");
}

export function isAbsolute(p: string): boolean {
  const normalized = normalizeSep(p);
  return normalized.startsWith("/") || isWindowsPath(normalized);
}

export function resolve(...paths: string[]): string {
  let resolved = "";
  for (let i = paths.length - 1; i >= 0; i--) {
    const p = paths[i];
    if (!p) continue;
    resolved = join(p, resolved);
    if (isAbsolute(p)) break;
  }
  return normalizeSep(resolved);
}

export default {
  sep,
  join,
  basename,
  dirname,
  extname,
  relative,
  isAbsolute,
  resolve,
};
