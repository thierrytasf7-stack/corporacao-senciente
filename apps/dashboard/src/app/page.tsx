'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { StoryDetailModal } from '@/components/stories';
import { FAB, HelpFAB } from '@/components/ui/fab';
import { useStories } from '@/hooks/use-stories';
import type { Story, SidebarView } from '@/types';

// Componentes pesados com lazy loading (named exports precisam de wrapper)
const LazyKanbanBoard = lazy(() => import('@/components/kanban').then(m => ({ default: m.KanbanBoard })));
const LazyAgentMonitor = lazy(() => import('@/components/agents').then(m => ({ default: m.AgentMonitor })));
const LazySettingsPanel = lazy(() => import('@/components/settings').then(m => ({ default: m.SettingsPanel })));
const LazyTerminalGrid = lazy(() => import('@/components/terminals').then(m => ({ default: m.TerminalGrid })));
const LazyGitHubPanel = lazy(() => import('@/components/github').then(m => ({ default: m.GitHubPanel })));
const LazyRoadmapView = lazy(() => import('@/components/roadmap').then(m => ({ default: m.RoadmapView })));
const LazyInsightsPanel = lazy(() => import('@/components/insights').then(m => ({ default: m.InsightsPanel })));
const LazyContextPanel = lazy(() => import('@/components/context').then(m => ({ default: m.ContextPanel })));
const LazyMonitorPanel = lazy(() => import('@/components/monitor').then(m => ({ default: m.MonitorPanel })));
const LazyWorkerPanel = lazy(() => import('@/components/workers').then(m => ({ default: m.WorkerPanel })));

export default function Home() {
  const { activeView } = useUIStore();
  const { isLoading, refresh } = useStories();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleStoryClick = useCallback((story: Story) => {
    setSelectedStory(story);
    setModalOpen(true);
  }, []);

  const handleNewStory = useCallback(() => {
    // TODO: Open new story modal
    console.log('Create new story');
  }, []);

  // Show FAB on views that support creation
  const showFAB = activeView === 'kanban' || activeView === 'roadmap';

  return (
    <div className="h-full relative">
      <ViewContent
        view={activeView}
        onStoryClick={handleStoryClick}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      <StoryDetailModal
        story={selectedStory}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Floating Action Buttons */}
      {showFAB && (
        <FAB
          icon="plus"
          label={activeView === 'roadmap' ? 'New Feature' : 'New Story'}
          onClick={handleNewStory}
          position="bottom-left"
        />
      )}
      <HelpFAB />
    </div>
  );
}

interface ViewContentProps {
  view: SidebarView;
  onStoryClick: (story: Story) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

function ViewContent({ view, onStoryClick, onRefresh, isLoading }: ViewContentProps) {
  const renderComponent = () => {
    switch (view) {
      case 'kanban':
        return (
          <LazyKanbanBoard
            onStoryClick={onStoryClick}
            onRefresh={onRefresh}
            isLoading={isLoading}
            className="h-full"
          />
        );

      case 'agents':
        return <LazyAgentMonitor />;

      case 'settings':
        return <LazySettingsPanel />;

      case 'terminals':
        return <LazyTerminalGrid />;

      case 'roadmap':
        return <LazyRoadmapView />;

      case 'github':
        return <LazyGitHubPanel />;

      case 'insights':
        return <LazyInsightsPanel />;

      case 'context':
        return <LazyContextPanel />;

      case 'monitor':
        return <LazyMonitorPanel className="h-full" />;

      case 'workers':
        return <LazyWorkerPanel />;

      default:
        return <PlaceholderView title={view} description="Coming soon" />;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderComponent()}
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium text-foreground capitalize">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
