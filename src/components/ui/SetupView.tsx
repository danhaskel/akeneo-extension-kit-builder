import { Button, Helper, SectionTitle } from 'akeneo-design-system';
import { useKitSetup } from '../../hooks/useKitSetup';

interface SetupViewProps {
  product: Product;
  blueprintAttrCode: string;
  onSetupComplete: () => void;
}

export function SetupView({ product, blueprintAttrCode, onSetupComplete }: SetupViewProps) {
  const { isProvisioning, provisioningError, run } = useKitSetup(onSetupComplete);
  const attrCode = blueprintAttrCode || 'kit_blueprint';

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <SectionTitle>
        <SectionTitle.Title>Kit Management Not Yet Enabled</SectionTitle.Title>
      </SectionTitle>

      <div style={{ marginTop: '16px' }}>
        <Helper level="info">
          Clicking <strong>Setup Kit Support</strong> will create a{' '}
          <code>{attrCode}</code> attribute and add it to the{' '}
          <strong>{(product as any).family}</strong> family.
        </Helper>
      </div>

      <div style={{ marginTop: '12px' }}>
        <Helper level="warning">
          <strong>Before running setup, confirm the following exist in PIM:</strong>
          <br />• Association type with code <code>KIT_CONTENT</code> (Settings → Association Types)
          <br />• Akeneo Growth or Serenity edition (required for future Table Attribute support)
          <br />• API token belongs to an Admin user (required to create attributes and modify families)
        </Helper>
      </div>

      {provisioningError && (
        <div style={{ marginTop: '12px' }}>
          <Helper level="error">{provisioningError}</Helper>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Button
          level="primary"
          onClick={() => run(product, attrCode)}
          disabled={isProvisioning}
        >
          {isProvisioning ? 'Setting up…' : 'Setup Kit Support'}
        </Button>
      </div>
    </div>
  );
}
