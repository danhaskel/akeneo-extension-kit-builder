import { useState } from 'react';
import { TabBar, Helper, SectionTitle } from 'akeneo-design-system';
import './App.css';
import { useKitProduct } from './hooks/useKitProduct';
import { useKitBlueprint } from './hooks/useKitBlueprint';
import { useKitComponents } from './hooks/useKitComponents';
import { SetupView } from './components/ui/SetupView';
import { BlueprintTable } from './components/ui/BlueprintTable';
import { KitVisualizer } from './components/ui/KitVisualizer';

type ActiveTab = 'blueprint' | 'components';

function App() {
  const { status, errorMessage, currentProduct, blueprintAttrCode, reload } = useKitProduct();
  const [activeTab, setActiveTab] = useState<ActiveTab>('blueprint');

  const blueprint = useKitBlueprint(
    status === 'ready' ? currentProduct : null,
    blueprintAttrCode,
  );

  const components = useKitComponents(
    status === 'ready' ? currentProduct : null,
    blueprint.rows,
  );

  if (status === 'loading') {
    return (
      <div style={{ padding: '20px' }}>
        <Helper level="info">Loading product…</Helper>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ padding: '20px' }}>
        <Helper level="error">{errorMessage ?? 'An unexpected error occurred.'}</Helper>
      </div>
    );
  }

  if (status === 'setup_required' && currentProduct) {
    return (
      <SetupView
        product={currentProduct}
        blueprintAttrCode={blueprintAttrCode}
        onSetupComplete={reload}
      />
    );
  }

  if (status !== 'ready') return null;

  return (
    <div style={{ padding: '20px' }}>
      <SectionTitle sticky={0}>
        <SectionTitle.Title>Kit Manager</SectionTitle.Title>
        <SectionTitle.Spacer />
        {blueprint.isDirty && (
          <SectionTitle.Information>Blueprint has unsaved changes</SectionTitle.Information>
        )}
        {components.isDirty && (
          <SectionTitle.Information>Components have unsaved changes</SectionTitle.Information>
        )}
      </SectionTitle>

      <TabBar moreButtonTitle="More" sticky={44}>
        <TabBar.Tab isActive={activeTab === 'blueprint'} onClick={() => setActiveTab('blueprint')}>
          Blueprint
        </TabBar.Tab>
        <TabBar.Tab isActive={activeTab === 'components'} onClick={() => setActiveTab('components')}>
          Components
        </TabBar.Tab>
      </TabBar>

      <div style={{ marginTop: '20px' }}>
        {activeTab === 'blueprint' && (
          <BlueprintTable
            rows={blueprint.rows}
            isDirty={blueprint.isDirty}
            isSaving={blueprint.isSaving}
            saveError={blueprint.saveError}
            onAddRow={blueprint.addRow}
            onUpdateRow={blueprint.updateRow}
            onDeleteRow={blueprint.deleteRow}
            onSave={blueprint.saveBlueprint}
          />
        )}

        {activeTab === 'components' && (
          <KitVisualizer
            components={components.components}
            isDirty={components.isDirty}
            isSaving={components.isSaving}
            saveError={components.saveError}
            onAssign={components.assignProduct}
            onRemove={components.removeProduct}
            onSave={components.saveComponents}
          />
        )}
      </div>
    </div>
  );
}

export default App;
