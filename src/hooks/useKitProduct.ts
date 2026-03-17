import { useState, useEffect } from 'react';
import type { KitAppStatus } from '../types/kit';

export interface KitProductState {
  status: KitAppStatus;
  errorMessage: string | null;
  currentProduct: Product | null;
  blueprintAttrCode: string;
  /** Call to re-run the initialization (e.g. after setup completes) */
  reload: () => void;
}

export function useKitProduct(): KitProductState {
  const [status, setStatus] = useState<KitAppStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [tick, setTick] = useState(0);

  const blueprintAttrCode = String(PIM.custom_variables['kit_blueprint_attribute'] ?? '');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus('loading');
      setErrorMessage(null);

      try {
        // PIM.context is a union type; product is only present on Product Tab position
        const ctx = PIM.context as any;
        const uuid: string | undefined = ctx?.product?.uuid;

        if (!uuid) {
          throw new Error(
            'No product context found. Ensure this extension is deployed at position "pim.product.tab".',
          );
        }

        const product = await PIM.api.product_uuid_v1.get({ uuid });

        if (cancelled) return;
        setCurrentProduct(product as unknown as Product);

        // Check whether the blueprint attribute exists in PIM, not whether the
        // current product has a value for it — a freshly-provisioned product with
        // no blueprint rows saved yet will have no key in product.values.
        let attributeExists = false;
        if (blueprintAttrCode.length > 0) {
          try {
            await PIM.api.attribute_v1.get({ code: blueprintAttrCode });
            attributeExists = true;
          } catch {
            attributeExists = false;
          }
        }

        if (cancelled) return;
        setStatus(attributeExists ? 'ready' : 'setup_required');
      } catch (err: any) {
        if (cancelled) return;
        setErrorMessage(err?.message ?? String(err));
        setStatus('error');
      }
    }

    init();
    return () => { cancelled = true; };
  }, [tick, blueprintAttrCode]);

  return {
    status,
    errorMessage,
    currentProduct,
    blueprintAttrCode,
    reload: () => setTick((t) => t + 1),
  };
}
