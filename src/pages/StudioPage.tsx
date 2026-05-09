// Key changes to StudioPage.tsx:

// 1. Add import for AIStoryWizard and PanelCanvas
import { AIStoryWizard } from '../components/creator/AIStoryWizard';
import { PanelCanvas } from '../components/creator/PanelCanvas';

// 2. Add state for the wizard and panel canvas
const [showWizard, setShowWizard] = useState(false);
const [panels, setPanels] = useState<Panel[]>([]);

// 3. In the AI Generator tab, add a toggle between simple mode and wizard:
{activeTab === 'generate' && (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <Button onClick={() => setShowWizard(!showWizard)} variant="outline" className="gap-2">
        <Wand2 size={16} />
        {showWizard ? 'Simple Mode' : 'AI Story Wizard'}
      </Button>
    </div>
    
    {showWizard ? (
      <AIStoryWizard
        onStoryGenerated={(story) => {
          // Navigate to series tab
          setActiveTab('series');
        }}
        onSaveToSeries={(record) => {
          setSeriesList(prev => [record, ...prev]);
          showToast('Story saved to My Series!');
        }}
      />
    ) : (
      // ... existing simple generator UI ...
    )}
  </div>
)}

// 4. Replace the Panel Layout tab with PanelCanvas:
{activeTab === 'layout' && (
  <PanelCanvas
    panels={panels}
    onPanelsChange={setPanels}
    onAddPanel={addBlankPanel}
    onRemovePanel={removePanel}
    layout={currentPage.layout}
    onLayoutChange={(newLayout) => setCurrentPage(prev => ({ ...prev, layout: newLayout }))}
  />
)}
