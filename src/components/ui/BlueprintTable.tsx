import {
  Button,
  Checkbox,
  Helper,
  IconButton,
  SectionTitle,
  Table,
} from 'akeneo-design-system';
import { PlusIcon, TrashIcon } from 'akeneo-design-system';
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
      <SectionTitle>
        <SectionTitle.Title>Blueprint Roles</SectionTitle.Title>
        <SectionTitle.Spacer />
        <Button level="tertiary" ghost onClick={onAddRow} size="small">
          <PlusIcon /> Add Role
        </Button>
        <Button
          level="primary"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          size="small"
        >
          {isSaving ? 'Saving…' : 'Save Blueprint'}
        </Button>
      </SectionTitle>

      {saveError && (
        <div style={{ marginTop: '12px' }}>
          <Helper level="error">{saveError}</Helper>
        </div>
      )}

      {rows.length === 0 ? (
        <div style={{ marginTop: '16px' }}>
          <Helper level="info">
            No roles defined yet. Click <strong>Add Role</strong> to get started.
          </Helper>
        </div>
      ) : (
        <Table style={{ marginTop: '16px' }}>
          <Table.Header>
            <Table.HeaderCell>Role Code</Table.HeaderCell>
            <Table.HeaderCell>Family</Table.HeaderCell>
            <Table.HeaderCell>Required</Table.HeaderCell>
            <Table.HeaderCell>Sync Attributes</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Header>
          <Table.Body>
            {rows.map((row, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <input
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', font: 'inherit' }}
                    value={row.role_code}
                    placeholder="e.g. front_wheel"
                    onChange={(e) => onUpdateRow(index, { ...row, role_code: e.target.value })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <input
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', font: 'inherit' }}
                    value={row.family}
                    placeholder="e.g. wheels"
                    onChange={(e) => onUpdateRow(index, { ...row, family: e.target.value })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Checkbox
                    checked={row.required}
                    onChange={(checked) => onUpdateRow(index, { ...row, required: checked })}
                  >
                    {''}
                  </Checkbox>
                </Table.Cell>
                <Table.Cell>
                  <input
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', font: 'inherit' }}
                    value={row.sync_attributes}
                    placeholder="e.g. weight,color,diameter"
                    onChange={(e) => onUpdateRow(index, { ...row, sync_attributes: e.target.value })}
                  />
                </Table.Cell>
                <Table.ActionCell>
                  <IconButton
                    icon={<TrashIcon />}
                    title="Remove row"
                    level="tertiary"
                    ghost="borderless"
                    onClick={() => onDeleteRow(index)}
                  />
                </Table.ActionCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}
