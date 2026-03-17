import React from 'react';
import { Button } from './button';
import type { KitBlueprintRow } from '../../types/kit';

interface BlueprintTableProps {
  rows: KitBlueprintRow[];
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  onAddRow: () => void;
  onUpdateRow: (index: number, updated: KitBlueprintRow) => void;
  onDeleteRow: (index: number) => void;
  onSave: () => void;
}

export function BlueprintTable({
  rows,
  isDirty,
  isSaving,
  saveError,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onSave,
}: BlueprintTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Kit Blueprint Roles</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onAddRow}>
            + Add Role
          </Button>
          <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving…' : isDirty ? 'Save Blueprint *' : 'Saved'}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No roles defined yet. Click "+ Add Role" to get started.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border border-gray-200 px-2 py-1 font-medium">Role Code</th>
                <th className="border border-gray-200 px-2 py-1 font-medium">Family</th>
                <th className="border border-gray-200 px-2 py-1 font-medium text-center">Required</th>
                <th className="border border-gray-200 px-2 py-1 font-medium">Sync Attributes</th>
                <th className="border border-gray-200 px-2 py-1 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-1 py-1">
                    <input
                      className="w-full px-1 py-0.5 text-sm border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                      value={row.role_code}
                      placeholder="e.g. front_wheel"
                      onChange={(e) =>
                        onUpdateRow(index, { ...row, role_code: e.target.value })
                      }
                    />
                  </td>
                  <td className="border border-gray-200 px-1 py-1">
                    <input
                      className="w-full px-1 py-0.5 text-sm border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                      value={row.family}
                      placeholder="e.g. wheels"
                      onChange={(e) =>
                        onUpdateRow(index, { ...row, family: e.target.value })
                      }
                    />
                  </td>
                  <td className="border border-gray-200 px-1 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={row.required}
                      onChange={(e) =>
                        onUpdateRow(index, { ...row, required: e.target.checked })
                      }
                    />
                  </td>
                  <td className="border border-gray-200 px-1 py-1">
                    <input
                      className="w-full px-1 py-0.5 text-sm border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                      value={row.sync_attributes}
                      placeholder="e.g. weight,color,diameter"
                      onChange={(e) =>
                        onUpdateRow(index, { ...row, sync_attributes: e.target.value })
                      }
                    />
                  </td>
                  <td className="border border-gray-200 px-1 py-1 text-center">
                    <button
                      onClick={() => onDeleteRow(index)}
                      className="text-gray-400 hover:text-red-500 text-xs leading-none"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
