export interface KitBlueprintRow {
  id?: number;             // integer assigned by PIM; omit on new rows
  role_code: string;
  family: string;
  required: boolean;
  sync_attributes: string; // comma-separated attribute codes, may have spaces
}

export interface KitComponent {
  role: KitBlueprintRow;
  product: Product | null; // SDK Product type from common/global.d.ts
}

export type KitAppStatus =
  | 'loading'          // initial product fetch in progress
  | 'setup_required'   // kit_blueprint_attribute missing from product values
  | 'provisioning'     // setup API calls in flight
  | 'ready'            // blueprint loaded, normal operation
  | 'error';           // unrecoverable error
