/**
 * Builds a GraphQL query fragment for syncing component attributes.
 * The sync_attributes field is a comma-separated list that may contain spaces.
 */
export function buildSyncFragment(
  syncAttributes: string,
  productIdentifier: string,
): string {
  const fields = syncAttributes
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (fields.length === 0) return '';

  const fieldLines = fields.map((f) => `      ${f} { data locale scope }`).join('\n');

  return `
  product(identifier: "${productIdentifier}") {
    identifier
    family { code }
    values {
${fieldLines}
    }
  }`.trim();
}
