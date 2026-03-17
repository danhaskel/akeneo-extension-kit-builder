# Akeneo Kit Manager Extension

A UI extension for Akeneo PIM that adds a **Kit Manager** tab to product pages. It lets you define a blueprint of component roles (using a Table Attribute) and associate specific SKUs into those slots (using an Association). Built with TypeScript, React, and Vite.

---

## Prerequisites — PIM Configuration Required Before Use

These items **must exist in your PIM instance** before the extension will work. The extension cannot create them automatically.

### 1. Association Type: `KIT_CONTENT`

Create this at **Settings → Association Types → Create**.

| Field | Value |
|-------|-------|
| Code | `KIT_CONTENT` |
| Label (en_US) | Kit Content |
| Type | One-to-many (default) |

> **Without this, saving kit components will silently fail.** The extension does not validate whether the association type exists at startup.

### 2. Akeneo Edition: Growth or Serenity

The self-provisioning step creates a **Table Attribute** (`pim_catalog_table`). This attribute type is only available on **Akeneo Growth Edition or higher**. If your instance is on the Essentials edition, setup will fail with a `422` error.

### 3. Admin API Token

The Bearer Token configured in `extension_configuration.json` must belong to a user with **Admin** privileges. Creating attributes and modifying family definitions requires elevated permissions. Non-admin tokens will receive a `403` error during setup.

---

## How It Works

### Blueprint (Table Attribute)

Each product that is a "kit" has a Table Attribute (e.g. `kit_blueprint`) that defines its **component roles**. Each row in the table describes one slot:

| Column | Description |
|--------|-------------|
| `role_code` | Unique identifier for this slot, e.g. `front_wheel` |
| `family` | The Akeneo family code that a component product must belong to, e.g. `wheels` |
| `required` | Whether this slot must be filled for the kit to be complete |
| `sync_attributes` | Comma-separated attribute codes to sync/export from the component, e.g. `weight,color,diameter` |

### Components (KIT_CONTENT Association)

When you assign a product to a slot in the **Components** tab, the extension saves it to the `KIT_CONTENT` association on the parent product. On load, it maps each associated product back to its blueprint role by matching the product's `family` against the `family` column in the table.

### Self-Provisioning

The first time you open the Kit Manager tab on a product, it checks whether the `kit_blueprint_attribute` (configured in `extension_configuration.json`) exists in that product's values. If not, it shows a **Setup Kit Support** button that:

1. Creates the Table Attribute with the correct column configuration via `POST /api/rest/v1/attributes`
2. Adds the attribute to the current product's family via `PATCH /api/rest/v1/families/{code}`

After setup completes the tab reloads and the Blueprint editor becomes available.

---

## Setup

### Step 1: Create the `KIT_CONTENT` association type in PIM

Settings → Association Types → Create → code: `KIT_CONTENT`

### Step 2: Copy and edit the sample configuration

```bash
cp extension_configuration.sample.json extension_configuration.json
```

Edit `extension_configuration.json`:

```json
{
  "position": "pim.product.tab",
  "name": "kit_manager",
  "type": "sdk_script",
  "file": "dist/app.js",
  "credentials": [
    {
      "code": "pim_api",
      "type": "Bearer Token",
      "value": "YOUR_BEARER_TOKEN_HERE"
    }
  ],
  "configuration": {
    "default_label": "Kit Manager",
    "labels": { "en_US": "Kit Manager" },
    "custom_variables": {
      "kit_blueprint_attribute": "kit_blueprint"
    }
  }
}
```

- `kit_blueprint_attribute`: the attribute code that will be created during setup. Change this only if `kit_blueprint` conflicts with an existing attribute.

> **Note:** `extension_configuration.json` is gitignored — never commit real credentials.

### Step 3: Deploy

```bash
npm install        # first time only
make update-dev    # deploy to dev PIM
make update        # deploy to production PIM
```

---

## Initializing the Extension (First Use)

1. Open any product in your PIM that belongs to a family you want to use as a kit.
2. Click the **Kit Manager** tab.
3. The extension checks for the `kit_blueprint` attribute on the product.
4. If missing, you'll see the setup screen listing prerequisites. Click **Setup Kit Support**.
5. The extension creates the Table Attribute and adds it to the current product's family.
6. The tab reloads automatically. The **Blueprint** editor is now available.
7. Add rows to define component roles (role code, family, required, sync attributes).
8. Click **Save Blueprint**.
9. Switch to the **Components** tab. Search for and assign products to each slot.
10. Click **Save Components**.

To enable kit management on products from *other families*, repeat steps 1–6 from a product in that family. The attribute already exists after the first setup; the extension will only add it to the new family.

---

## Development

```bash
npm install     # install dependencies
npm run dev     # start local dev server
make update-dev # build and deploy to dev PIM
make update     # build and deploy to production PIM
```

---

## Known Limitations

- **`KIT_CONTENT` must pre-exist** — the extension does not create this association type. Missing it causes component saves to fail silently.
- **Growth/Serenity edition required** — Table Attributes (`pim_catalog_table`) are not available on Essentials edition.
- **One blueprint per family** — the Table Attribute is shared across all products in a family. Changing a blueprint row affects all kits in that family. Per-product variation is expressed through the component assignments, not the blueprint definition.
- **Family matching** — components are matched to roles by `family` code. If a component product's family doesn't match any blueprint row, it will appear unassigned.
