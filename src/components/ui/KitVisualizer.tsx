import React, { useState } from 'react';
import { Button } from './button';
import type { KitComponent } from '../../types/kit';
import { buildSyncFragment } from '../../lib/graphqlGen';

interface KitVisualizerProps {
  components: KitComponent[];
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  onAssign: (roleCode: string, identifier: string) => void;
  onRemove: (roleCode: string) => void;
  onSave: () => void;
}

function SlotCard({
  component,
  onAssign,
  onRemove,
}: {
  component: KitComponent;
  onAssign: (identifier: string) => void;
  onRemove: () => void;
}) {
  const { role, product } = component;
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(value: string) {
    setSearchValue(value);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await PIM.api.product_uuid_v1.list({
        search: {
          identifier: [{ operator: 'CONTAINS', value }],
        } as any,
        limit: 10,
      });
      setSearchResults((results as any)?._embedded?.items ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelect(p: Product) {
    onAssign((p as any).identifier as string);
    setSearchValue('');
    setSearchResults([]);
  }

  function copyGraphQL() {
    if (!product) return;
    const fragment = buildSyncFragment(
      role.sync_attributes,
      (product as any).identifier as string,
    );
    navigator.clipboard.writeText(fragment).catch(() => {});
  }

  return (
    <div className="border border-gray-200 rounded p-3 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-mono text-sm font-semibold text-gray-800">
            {role.role_code || <em className="text-gray-400">unnamed</em>}
          </span>
          <span className="ml-2 text-xs text-gray-500">family: {role.family || '—'}</span>
        </div>
        {role.required && (
          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
            Required
          </span>
        )}
      </div>

      {product ? (
        <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-green-800">
                {(product as any).identifier as string}
              </span>
              <span className="ml-2 text-xs text-green-600">
                {(product as any).family as string}
              </span>
            </div>
            <div className="flex gap-1">
              {role.sync_attributes && (
                <button
                  onClick={copyGraphQL}
                  className="text-xs text-gray-400 hover:text-gray-600 px-1"
                  title="Copy GraphQL fragment"
                >
                  {'{…}'}
                </button>
              )}
              <button
                onClick={onRemove}
                className="text-xs text-gray-400 hover:text-red-500"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="Search by identifier…"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {isSearching && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded shadow text-xs p-2 text-gray-500 z-10">
              Searching…
            </div>
          )}
          {searchResults.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded shadow z-10 max-h-40 overflow-y-auto">
              {searchResults.map((p) => (
                <li
                  key={(p as any).uuid as string}
                  className="px-2 py-1.5 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  onClick={() => handleSelect(p)}
                >
                  <span className="font-medium">{(p as any).identifier as string}</span>
                  <span className="ml-2 text-xs text-gray-400">{(p as any).family as string}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {role.sync_attributes && (
        <div className="mt-1.5 text-xs text-gray-400">
          Sync: {role.sync_attributes}
        </div>
      )}
    </div>
  );
}

export function KitVisualizer({
  components,
  isDirty,
  isSaving,
  saveError,
  onAssign,
  onRemove,
  onSave,
}: KitVisualizerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Kit Components</h3>
        <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
          {isSaving ? 'Saving…' : isDirty ? 'Save Components *' : 'Saved'}
        </Button>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {components.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No roles defined in the blueprint yet. Add roles in the Blueprint tab first.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {components.map((c) => (
            <SlotCard
              key={c.role.role_code}
              component={c}
              onAssign={(id) => onAssign(c.role.role_code, id)}
              onRemove={() => onRemove(c.role.role_code)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
