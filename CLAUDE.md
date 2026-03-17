# Project Context: Akeneo Kit Manager Extension

This repository is an Akeneo UI extension for managing Product Kits. It uses **TypeScript, React, and Vite**. The blueprint (role definitions) is stored as JSON in a `pim_catalog_textarea` attribute (temporary — see `TODO[TABLE_MIGRATION]`). Components are linked via the `KIT_CONTENT` association type.

---

## 1. UI — Akeneo Design System (DSM)

**All UI must use the Akeneo Design System.** Never use raw HTML elements, Tailwind utility classes, shadcn/ui, or custom CSS for anything the DSM covers. Reference: https://dsm.akeneo.com/

Import from `akeneo-design-system`. Key components in use:

| Need | Component | Key props |
|------|-----------|-----------|
| Buttons | `Button` | `level="primary\|secondary\|tertiary\|warning\|danger"`, `ghost`, `disabled` |
| Icon-only buttons | `IconButton` | `icon`, `title`, `ghost`, `level` |
| Tab navigation | `TabBar` + `TabBar.Tab` | `moreButtonTitle` (required); `isActive`, `onClick` |
| Section headers | `SectionTitle` + `SectionTitle.Title` | `sticky` |
| Alerts / help text | `Helper` | `level="info\|warning\|error\|success"`, `inline` |
| Data tables | `Table`, `Table.Header`, `Table.HeaderCell`, `Table.Body`, `Table.Row`, `Table.Cell`, `Table.ActionCell` | `isSelectable` |
| Status labels | `Badge` | `level` |
| Checkboxes | `Checkbox` | `checked` (boolean), `onChange` (receives boolean) |
| Search input | `Search` | `searchValue`, `onSearchChange`, `placeholder`, `title` |
| Dropdowns | `Dropdown`, `Dropdown.Overlay`, `Dropdown.ItemCollection`, `Dropdown.Item` | — |
| Notifications | `MessageBar` | `level`, `title`, `onClose` |

---

## 2. Logic & Self-Provisioning

- **Auto-Discovery:** On load, checks `PIM.custom_variables['kit_blueprint_attribute']` for the attribute code, then verifies the attribute exists via `PIM.api.attribute_v1.get()`.
- **Self-Provisioning:** If the attribute is missing, "Setup Kit Support" button:
  1. Creates a `pim_catalog_textarea` attribute (temporary — see `TODO[TABLE_MIGRATION]`)
  2. PATCHes the current product's family to include the attribute
- **The "Link":** Components associated via `KIT_CONTENT` association type, mapped to blueprint rows by matching the component product's `family` to the `family` field in each row.

### TODO[TABLE_MIGRATION]
`USE_TABLE_ATTRIBUTE = false` in `src/lib/kitApi.ts`. When the SDK team adds `table_configuration` to `AttributeCreateData` in `common/global.d.ts`, flip this flag to `true` to switch from JSON-in-textarea to a native `pim_catalog_table` attribute. All read/write code already handles both formats. Search `TODO[TABLE_MIGRATION]` across the repo for all touch points.

---

## 3. Technical Stack & SDK (`PIM.*`)

- **Context:** Product Tab — use `PIM.context.product.uuid` then `PIM.api.product_uuid_v1.get()`.
- **SDK preferred:** Use `PIM.api.*` methods for all operations. Only fall back to `PIM.api.external.call()` when the SDK doesn't support required fields (e.g. `table_configuration`).
- **Config:** `PIM.custom_variables['kit_blueprint_attribute']` — empty means Setup Mode.

---

## 4. Data Shapes

```typescript
interface KitBlueprintRow {
  id?: number;             // assigned by PIM on table attributes; omit on new rows
  role_code: string;       // e.g. "front_wheel"
  family: string;          // e.g. "wheels"
  required: boolean;
  sync_attributes: string; // comma-separated, trim() before use
}

interface KitComponent {
  role: KitBlueprintRow;
  product: Product | null; // associated product matching this role's family
}
```

Blueprint is stored as `JSON.stringify(KitBlueprintRow[])` in the textarea value until table attributes are supported.

---

## 5. API Interaction Patterns

- **Read product:** `PIM.api.product_uuid_v1.get({ uuid })`
- **Check attribute exists:** `PIM.api.attribute_v1.get({ code })` — throws on 404
- **Create attribute:** `PIM.api.attribute_v1.create({ data })` (textarea); `external.call()` for table type
- **Patch family:** `PIM.api.family_v1.get()` first (read existing attributes array), then `family_v1.patch()` — patching replaces the whole array, always merge
- **Save blueprint:** `PIM.api.product_uuid_v1.patch()` with `values`
- **Save associations:** `PIM.api.product_uuid_v1.patch()` with `associations.KIT_CONTENT.products`
- **Search products:** `PIM.api.product_uuid_v1.list({ search: { identifier: [{ operator: 'IN', value: [...] }] } })`

---

## 6. Common Pitfalls

- `sync_attributes` may have spaces around commas — always `.split(',').map(s => s.trim()).filter(Boolean)`
- `family_v1.patch()` replaces the entire `attributes` array — always GET first and merge
- `KIT_CONTENT` is hardcoded — if it doesn't exist in PIM, association saves silently fail; surface this clearly
- `PIM.context.product` only exists when position is `pim.product.tab`

---

## 7. Run Commands

```bash
npm install        # Setup
npm run dev        # Local development
make update-dev    # Deploy to PIM (Dev)
make update        # Deploy to PIM (Prod)
```
