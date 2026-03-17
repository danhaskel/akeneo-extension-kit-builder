import { useState } from 'react';
import {
  Badge,
  Button,
  Dropdown,
  Helper,
  IconButton,
  Search,
  SectionTitle,
} from 'akeneo-design-system';
import { CloseIcon, CopyIcon } from 'akeneo-design-system';
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  async function handleSearchChange(value: string) {
    setSearchValue(value);
    if (value.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    try {
      const results = await PIM.api.product_uuid_v1.list({
        search: { identifier: [{ operator: 'CONTAINS', value }] },
        limit: 10,
      } as any);
      const items = (results as any)?._embedded?.items ?? [];
      setSearchResults(items);
      setIsSearchOpen(items.length > 0);
    } catch {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }

  function handleSelect(p: any) {
    onAssign(p.identifier as string);
    setSearchValue('');
    setSearchResults([]);
    setIsSearchOpen(false);
  }

  function copyGraphQL() {
    if (!product) return;
    const fragment = buildSyncFragment(role.sync_attributes, (product as any).identifier as string);
    navigator.clipboard.writeText(fragment).catch(() => {});
  }

  return (
    <div style={{
      border: '1px solid #c7cbce',
      borderRadius: '4px',
      padding: '16px',
      background: '#fff',
    }}>
      {/* Slot header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {role.role_code || <em>unnamed</em>}
          </strong>
          <span style={{ color: '#67768a', fontSize: '11px' }}>
            family: {role.family || '—'}
          </span>
        </div>
        {role.required && (
          <Badge level="danger">Required</Badge>
        )}
      </div>

      {/* Assigned product */}
      {product ? (
        <div style={{
          background: '#f5f9fc',
          border: '1px solid #a1d4f0',
          borderRadius: '4px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>
              {(product as any).identifier as string}
            </span>
            <span style={{ color: '#67768a', fontSize: '11px', marginLeft: '8px' }}>
              {(product as any).family as string}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {role.sync_attributes && (
              <IconButton
                icon={<CopyIcon />}
                title="Copy GraphQL fragment"
                level="tertiary"
                ghost="borderless"
                size="small"
                onClick={copyGraphQL}
              />
            )}
            <IconButton
              icon={<CloseIcon />}
              title="Remove assignment"
              level="tertiary"
              ghost="borderless"
              size="small"
              onClick={onRemove}
            />
          </div>
        </div>
      ) : (
        /* Search for a product to assign */
        <Dropdown>
          <Search
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            placeholder="Search by identifier…"
            title="Search products"
          />
          {isSearchOpen && (
            <Dropdown.Overlay
              verticalPosition="down"
              onClose={() => setIsSearchOpen(false)}
            >
              <Dropdown.Header>
                <Dropdown.Title>Products</Dropdown.Title>
              </Dropdown.Header>
              <Dropdown.ItemCollection>
                {searchResults.map((p: any) => (
                  <Dropdown.Item key={p.uuid} onClick={() => handleSelect(p)}>
                    <strong>{p.identifier}</strong>
                    <span style={{ color: '#67768a', marginLeft: '8px', fontSize: '11px' }}>
                      {p.family}
                    </span>
                  </Dropdown.Item>
                ))}
              </Dropdown.ItemCollection>
            </Dropdown.Overlay>
          )}
        </Dropdown>
      )}

      {/* Sync attributes hint */}
      {role.sync_attributes && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#a1acb7' }}>
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
      <SectionTitle>
        <SectionTitle.Title>Kit Components</SectionTitle.Title>
        <SectionTitle.Spacer />
        <Button
          level="primary"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          size="small"
        >
          {isSaving ? 'Saving…' : 'Save Components'}
        </Button>
      </SectionTitle>

      {saveError && (
        <div style={{ marginTop: '12px' }}>
          <Helper level="error">{saveError}</Helper>
        </div>
      )}

      {components.length === 0 ? (
        <div style={{ marginTop: '16px' }}>
          <Helper level="info">
            No roles defined in the blueprint yet. Add roles in the Blueprint tab first.
          </Helper>
        </div>
      ) : (
        <div style={{
          marginTop: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
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
