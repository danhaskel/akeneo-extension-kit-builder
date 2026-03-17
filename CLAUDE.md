# Project Context: Akeneo Kit Manager Extension (Table-Driven)

This repository is an Akeneo UI extension for managing Product Kits. It uses **TypeScript, React, and Vite**. This version uses **Akeneo Table Attributes** as the "Blueprint" (the rules) and standard **Associations** for the "Components" (the instances).

---

## 1. Logic & Self-Provisioning
* **Auto-Discovery:** On load, the extension checks for a specific Table Attribute code (stored in `PIM.custom_variables['kit_blueprint_attribute']`).
* **Self-Provisioning:** If the attribute is missing, the extension provides a "Setup Kit Support" button. This triggers:
    1. `POST /api/rest/v1/attributes` to create a Table Attribute with columns: `role_code` (text), `family` (text), `required` (boolean), and `sync_attributes` (text).
    2. `PATCH /api/rest/v1/families/{current_family}` to add this attribute to the product's family.
* **The "Link":** Components are associated via the `KIT_CONTENT` association type. The extension maps these components to Table rows by matching the component's **Family** to the `family` column in the Table.

---

## 2. Technical Stack & Akeneo SDK (`PIM.*`)

### SDK Interaction
* **Context:** The extension runs as a **Product Tab**. Use `PIM.api.product_v1.get()` to retrieve the current product and its `identifier` and `family`.
* **CORS & Proxy:** Always use `PIM.api.external.call()` to interact with REST endpoints (Attributes, Families, Products) to avoid browser-side CORS blocks.
* **Persistent Config:** Use `PIM.custom_variables` for the attribute code. If the variable is empty, the extension is in "Setup Mode."

---

## 3. Data Shapes & Types

### The Table Blueprint
The Table attribute returns an array of objects.
```typescript
interface KitBlueprintRow {
    uuid: string;
    role_code: string;      // e.g., "front_wheel"
    family: string;         // e.g., "wheels"
    required: boolean;
    sync_attributes: string; // e.g., "weight,color,diameter"
}
Component Mapping
TypeScript
interface KitComponent {
    role: KitBlueprintRow;
    product: AkeneoProduct | null; // The associated product matching this role's family
}
4. UI Architecture
Component Breakdown
SetupView: Visible only when the Table Attribute is missing. Handles API calls to create and assign the Table.

BlueprintTable: A wrapper around the native Akeneo Table or a custom grid for defining roles.

KitVisualizer: A "Configuration" view where users see slots (based on the Table) and can search/associate SKUs.

GraphQLGen: Uses the sync_attributes column (comma-separated string) to build the dynamic query fragment.

5. API Interaction Patterns
Initialization Flow
Fetch currentProduct.

Check if PIM.custom_variables['kit_blueprint_attribute'] exists in currentProduct.values.

If yes: Fetch all associated products via /api/rest/v1/products?identifiers=....

If no: Prompt user to "Enable Kit Management."

Saving Data
Blueprint: Update the Table attribute via PATCH /api/rest/v1/products/{id}.

Associations: Update the KIT_CONTENT association via the same PATCH or the specific associations endpoint.

6. Common Pitfalls
Table Column Codes: Ensure the POST /api/rest/v1/attributes payload uses exact column codes that the extension expects (role_code, family, etc.).

Permissions: Creating attributes/updating families requires high-level permissions. Gracefully handle 403 errors if the current user is not an Admin.

Sync Attributes Formatting: Users might enter spaces in the sync_attributes list (e.g., "weight, color"). The GraphQL generator must .trim() these values.

7. Run Commands
Bash
npm install        # Setup
npm run dev        # Local development
make update-dev    # Deploy to PIM (Dev)
make update        # Deploy to PIM (Prod)

---

### One final detail for the thought exercise:
Since the extension is now "Self-Provisioning," we should consider what happens if two different kits use different "Sync Attributes." Because the Table is unique per product, this works perfectly! 

**Would you like me to draft a sample `extension_configuration.json` showing how to define that initial `custom_variable` for the attribute name?**