type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Merges class names, dropping falsy values. No dependency on clsx/tailwind-merge —
 * variants in this app are chosen with plain ternaries rather than merged
 * conflicting utilities, so a minimal join covers every existing use case.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(" ");
}
