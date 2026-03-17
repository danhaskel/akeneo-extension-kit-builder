import React from 'react';
import { Button } from './button';
import { useKitSetup } from '../../hooks/useKitSetup';

interface SetupViewProps {
  product: Product;
  blueprintAttrCode: string;
  onSetupComplete: () => void;
}

export function SetupView({ product, blueprintAttrCode, onSetupComplete }: SetupViewProps) {
  const { isProvisioning, provisioningError, run } = useKitSetup(onSetupComplete);

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-lg font-semibold mb-2">Kit Management Not Yet Enabled</h2>
      <p className="text-sm text-gray-600 mb-4">
        This product does not have the Kit Blueprint attribute yet. Clicking{' '}
        <strong>Setup Kit Support</strong> will:
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
        <li>
          Create a Table attribute with code <code className="font-mono bg-gray-100 px-1 rounded">{blueprintAttrCode || 'kit_blueprint'}</code>
        </li>
        <li>
          Add this attribute to the <strong>{(product as any).family}</strong> family
        </li>
      </ul>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 text-sm text-amber-800">
        <strong>Prerequisites — must exist in PIM before setup:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>
            Association type with code <code className="font-mono bg-amber-100 px-1 rounded">KIT_CONTENT</code> (Settings &rarr; Association Types)
          </li>
          <li>Akeneo Growth or Serenity edition (required for Table Attributes)</li>
          <li>API token belongs to an Admin user</li>
        </ul>
      </div>

      {provisioningError && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
          {provisioningError}
        </div>
      )}

      <Button
        onClick={() => run(product, blueprintAttrCode || 'kit_blueprint')}
        disabled={isProvisioning}
      >
        {isProvisioning ? 'Setting up…' : 'Setup Kit Support'}
      </Button>
    </div>
  );
}
