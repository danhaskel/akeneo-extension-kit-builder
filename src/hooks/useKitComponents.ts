import { useState, useEffect } from 'react';
import type { KitBlueprintRow, KitComponent } from '../types/kit';
import { fetchProductsByIdentifiers, saveKitAssociations } from '../lib/kitApi';

interface UseKitComponentsResult {
  components: KitComponent[];
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  assignProduct: (roleCode: string, identifier: string) => void;
  removeProduct: (roleCode: string) => void;
  saveComponents: () => Promise<void>;
}

function getAssociatedIdentifiers(product: Product): string[] {
  const assoc = (product as any).associations?.KIT_CONTENT?.products ?? [];
  return assoc as string[];
}

export function useKitComponents(
  product: Product | null,
  rows: KitBlueprintRow[],
): UseKitComponentsResult {
  // Map of roleCode → product identifier (local state)
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [savedAssignments, setSavedAssignments] = useState<Record<string, string>>({});
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // On product/rows change, rebuild assignments by matching families
  useEffect(() => {
    if (!product || rows.length === 0) {
      setAssignments({});
      setSavedAssignments({});
      setFetchedProducts([]);
      return;
    }

    const identifiers = getAssociatedIdentifiers(product);
    if (identifiers.length === 0) {
      setAssignments({});
      setSavedAssignments({});
      setFetchedProducts([]);
      return;
    }

    fetchProductsByIdentifiers(identifiers).then((products) => {
      setFetchedProducts(products);

      const newAssignments: Record<string, string> = {};
      for (const row of rows) {
        const match = products.find(
          (p) => ((p as any).family as string) === row.family,
        );
        if (match) {
          newAssignments[row.role_code] = (match as any).identifier as string;
        }
      }
      setAssignments(newAssignments);
      setSavedAssignments(newAssignments);
    });
  }, [product, rows]);

  const isDirty = JSON.stringify(assignments) !== JSON.stringify(savedAssignments);

  // Build KitComponent[] from rows + assignments + fetchedProducts
  const components: KitComponent[] = rows.map((role) => {
    const identifier = assignments[role.role_code];
    const prod = identifier
      ? (fetchedProducts.find((p) => ((p as any).identifier as string) === identifier) ?? null)
      : null;
    return { role, product: prod };
  });

  function assignProduct(roleCode: string, identifier: string) {
    setAssignments((prev) => ({ ...prev, [roleCode]: identifier }));
  }

  function removeProduct(roleCode: string) {
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[roleCode];
      return next;
    });
  }

  async function saveComponents() {
    if (!product) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const identifiers = Object.values(assignments);
      await saveKitAssociations((product as any).uuid, identifiers);
      setSavedAssignments({ ...assignments });
    } catch (err: any) {
      setSaveError(err?.message ?? String(err));
    } finally {
      setIsSaving(false);
    }
  }

  return {
    components,
    isDirty,
    isSaving,
    saveError,
    assignProduct,
    removeProduct,
    saveComponents,
  };
}
