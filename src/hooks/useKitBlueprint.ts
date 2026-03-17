import { useState, useEffect } from 'react';
import type { KitBlueprintRow } from '../types/kit';
import { saveBlueprintRows } from '../lib/kitApi';

interface UseKitBlueprintResult {
  rows: KitBlueprintRow[];
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  addRow: () => void;
  updateRow: (index: number, updated: KitBlueprintRow) => void;
  deleteRow: (index: number) => void;
  saveBlueprint: () => Promise<void>;
}

function parseRows(product: Product, blueprintAttrCode: string): KitBlueprintRow[] {
  const values = (product as any).values ?? {};
  const entries: any[] = values[blueprintAttrCode] ?? [];
  const entry = entries.find((e: any) => !e.locale && !e.scope) ?? entries[0];
  const raw = entry?.data;
  if (!raw) return [];
  // TODO[TABLE_MIGRATION]: Table attribute returns an array directly.
  // Textarea stores a JSON string — handle both so migration requires no code change here.
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return raw as KitBlueprintRow[];
}

export function useKitBlueprint(
  product: Product | null,
  blueprintAttrCode: string,
): UseKitBlueprintResult {
  const [rows, setRows] = useState<KitBlueprintRow[]>([]);
  const [savedRows, setSavedRows] = useState<KitBlueprintRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!product || !blueprintAttrCode) return;
    const parsed = parseRows(product, blueprintAttrCode);
    setRows(parsed);
    setSavedRows(parsed);
  }, [product, blueprintAttrCode]);

  const isDirty = JSON.stringify(rows) !== JSON.stringify(savedRows);

  function addRow() {
    setRows((prev) => [
      ...prev,
      { role_code: '', family: '', required: false, sync_attributes: '' },
    ]);
  }

  function updateRow(index: number, updated: KitBlueprintRow) {
    setRows((prev) => prev.map((r, i) => (i === index ? updated : r)));
  }

  function deleteRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveBlueprint() {
    if (!product) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveBlueprintRows((product as any).uuid, blueprintAttrCode, rows);
      setSavedRows(rows);
    } catch (err: any) {
      setSaveError(err?.message ?? String(err));
    } finally {
      setIsSaving(false);
    }
  }

  return { rows, isDirty, isSaving, saveError, addRow, updateRow, deleteRow, saveBlueprint };
}
