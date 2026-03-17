import { useState } from 'react';
import { createBlueprintAttribute, addAttributeToFamily } from '../lib/kitApi';

interface UseKitSetupResult {
  isProvisioning: boolean;
  provisioningError: string | null;
  run: (product: Product, blueprintAttrCode: string) => Promise<void>;
}

export function useKitSetup(onSuccess: () => void): UseKitSetupResult {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningError, setProvisioningError] = useState<string | null>(null);

  async function run(product: Product, blueprintAttrCode: string) {
    setIsProvisioning(true);
    setProvisioningError(null);

    try {
      await createBlueprintAttribute(blueprintAttrCode);

      const familyCode = (product as any).family as string;
      if (familyCode) {
        await addAttributeToFamily(familyCode, blueprintAttrCode);
      }

      onSuccess();
    } catch (err: any) {
      const message = err?.message ?? String(err);
      if (message.includes('403')) {
        setProvisioningError(
          'Permission denied (403). The API token must belong to an Admin user to create attributes and modify families.',
        );
      } else {
        setProvisioningError(message);
      }
    } finally {
      setIsProvisioning(false);
    }
  }

  return { isProvisioning, provisioningError, run };
}
