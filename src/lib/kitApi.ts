import type { KitBlueprintRow } from '../types/kit';

/**
 * Creates the Kit Blueprint Table attribute in PIM.
 * Handles "already exists" gracefully.
 */
export async function createBlueprintAttribute(attributeCode: string): Promise<void> {
  try {
    await PIM.api.attribute_v1.create({
      data: {
        code: attributeCode,
        type: 'pim_catalog_table',
        group: 'other',
        labels: { en_US: 'Kit Blueprint' },
        table_configuration: [
          {
            code: 'role_code',
            data_type: 'text',
            labels: { en_US: 'Role Code' },
            is_required_for_completeness: true,
          },
          {
            code: 'family',
            data_type: 'text',
            labels: { en_US: 'Family' },
          },
          {
            code: 'required',
            data_type: 'boolean',
            labels: { en_US: 'Required' },
          },
          {
            code: 'sync_attributes',
            data_type: 'text',
            labels: { en_US: 'Sync Attributes' },
          },
        ],
      },
    });
  } catch (err: any) {
    // 422 = attribute already exists — treat as success
    const msg = String(err?.message ?? err);
    if (!msg.includes('422') && !msg.toLowerCase().includes('already')) {
      throw err;
    }
  }
}

/**
 * Adds the blueprint attribute to a family.
 * Reads the family first to avoid clobbering existing attributes.
 */
export async function addAttributeToFamily(
  familyCode: string,
  attributeCode: string,
): Promise<void> {
  const family = await PIM.api.family_v1.get({ code: familyCode });
  const existing: string[] = (family as any).attributes ?? [];

  if (existing.includes(attributeCode)) return;

  await PIM.api.family_v1.patch({
    code: familyCode,
    data: { attributes: [...existing, attributeCode] } as any,
  });
}

/**
 * Fetches a list of products by their identifiers.
 */
export async function fetchProductsByIdentifiers(identifiers: string[]): Promise<any[]> {
  if (identifiers.length === 0) return [];

  const result = await PIM.api.product_uuid_v1.list({
    search: { identifier: [{ operator: 'IN', value: identifiers }] },
    limit: Math.min(identifiers.length, 100),
  } as any);

  return (result as any)?._embedded?.items ?? [];
}

/**
 * Saves blueprint rows to the product's Table attribute value.
 */
export async function saveBlueprintRows(
  productUuid: string,
  blueprintAttrCode: string,
  rows: KitBlueprintRow[],
): Promise<void> {
  await PIM.api.product_uuid_v1.patch({
    uuid: productUuid,
    data: {
      values: {
        [blueprintAttrCode]: [{ locale: null, scope: null, data: rows }],
      },
    } as any,
  });
}

/**
 * Saves the KIT_CONTENT association products list.
 */
export async function saveKitAssociations(
  productUuid: string,
  identifiers: string[],
): Promise<void> {
  await PIM.api.product_uuid_v1.patch({
    uuid: productUuid,
    data: {
      associations: {
        KIT_CONTENT: { products: identifiers },
      },
    } as any,
  });
}
