import { useState } from 'react';
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
    return <div className="p-6 text-sm text-gray-500">Loading product…</div>;
  }

  if (status === 'error') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          <strong>Error:</strong> {errorMessage}
        </div>
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
    <div className="p-4">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'blueprint'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('blueprint')}
        >
          Blueprint
          {blueprint.isDirty && <span className="ml-1 text-orange-400">●</span>}
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'components'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('components')}
        >
          Components
          {components.isDirty && <span className="ml-1 text-orange-400">●</span>}
        </button>
      </div>

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
  );
}

export default App;
