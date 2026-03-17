# Project Context: Akeneo Kit Manager Extension

This repository is an Akeneo UI extension designed to model and manage product "Kits" (bundles). It is implemented using **TypeScript, React, and Vite**. The extension provides a specialized interface for defining kit blueprints, assigning components to functional roles based on Family, and generating optimized GraphQL queries for headless consumers.

---

## 1. Data Modeling & Logic

### The "Family-Based Role" Model
* **The Blueprint (`kit_blueprint`):** A custom Text Area attribute (storing JSON) on the Kit Product. This is the "Schema" of the kit.
    * **Structure:** `{"roles": [{"role_code": string, "family": string, "label": string, "required": boolean, "sync_attributes": string[]}]}`
* **Associations:** All kit components are linked via a single standard Association Type (e.g., `KIT_CONTENT`).
* **Role Mapping:** The UI extension maps an associated product to a "Role" in the blueprint by matching the product's **Family** to the `family` defined in the role.

### Logic Constraints
* **Validation:** A component can only be assigned to a Role if its Family matches the Role's definition.
* **Multiplicity:** If a kit requires two items of the same Family (e.g., "Front Tire" and "Rear Tire"), the `role_code` serves as the unique identifier to distinguish them.

---

## 2. Technical Stack & Akeneo SDK (`PIM.*`)

### SDK Interaction
* **Source of Truth:** Always consult `common/global.d.ts` for the `PIM.*` global type definitions.
* **API Calls:**
    * `PIM.api.product_v1.get(identifier)`: To fetch the Kit and its blueprint.
    * `PIM.api.external.call()`: **Crucial.** Use this to proxy requests through the Akeneo backend to avoid CORS issues when fetching component metadata from the REST API.
* **Configuration:** Custom variables like `pim_host` are accessed via `PIM.custom_variables['pim_host']`.

### Architecture
* **Entry Point:** The extension is registered as a **Product Tab** in `extension_configuration.json`.
* **State Management:** Use a lightweight state (e.g., React Context or Zustand) to track the "Draft" state of a kit before saving.
* **Component Strategy:**
    * `BlueprintDesigner`: Interface for Admin users to define Roles and `sync_attributes`.
    * `KitConfigurator`: Interface for Enriched users to pick specific SKUs for defined Roles.
    * `GraphQLGenerator`: A utility tab that creates a query string based on the active Blueprint.

---

## 3. Coding Standards

### TypeScript
* **Strict Typing:** Define interfaces for `KitBlueprint`, `KitRole`, and `AkeneoProduct`. Avoid `any`.
* **Discriminated Unions:** Use for handling different states of a kit component (e.g., `Empty`, `Valid`, `InvalidFamily`).

### API Patterns
* **Batch Fetching:** Never fetch 10 components in 10 separate calls. Use the `identifiers` filter: `/api/rest/v1/products?identifiers=SKU1,SKU2,SKU3`.
* **Immutability:** When updating the Blueprint JSON, treat the existing attribute value as immutable and return a new object.

### Styling (Tailwind)
* Use Tailwind CSS for all layouts.
* Ensure components are responsive within the PIM's iframe context (usually max-width ~1200px).
* Follow Akeneo's "Design System" colors (Grape, Anthracite, etc.) to ensure the UI feels native.

---

## 4. Workflows & API Interaction

### Loading a Kit
1.  Fetch the Kit Product.
2.  Parse the `kit_blueprint` JSON.
3.  Identify associated SKUs in the `KIT_CONTENT` association.
4.  Fetch those SKUs in **one batch call** to get their `family` and `values`.
5.  Cross-reference the family codes with the Blueprint roles to populate the UI.

### The GraphQL Generator Logic
1.  Iterate through `blueprint.roles`.
2.  For each role, extract the `sync_attributes` array.
3.  Construct a GraphQL fragment or nested query that requests those specific attributes for the associated products.
4.  Display the resulting string in a syntax-highlighted code block.

---

## 5. Common Pitfalls

* **Association Limits:** Akeneo REST API paginates associations. If a kit has >100 components, you must handle pagination in the fetch logic.
* **Permission Errors:** Always wrap `PIM.api` calls in try/catch blocks. If a user doesn't have permissions for a component's family, the API will return a 403.
* **Stale Data:** If a component is deleted from the PIM, the Association remains but the Product fetch will fail. Handle "Orphaned Associations" gracefully.

---

## 6. Project Terminology

* **Blueprint:** The master rule-set for a Kit (stored in JSON).
* **Role:** A functional "slot" in the kit (e.g., "Handlebars").
* **Sync Attributes:** The specific data points (Price, Weight, Color) that the Kit "borrows" from its components for the API output.
* **Extension SDK:** The `PIM.*` javascript bridge provided by Akeneo.

---

## 7. Run Commands

```bash
# Install dependencies
npm install

# Local Dev with HMR
npm run dev

# Deploy Dev Build to PIM
make update-dev

# Deploy Production Build to PIM
make update