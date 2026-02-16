'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useProjectsStore } from '@/stores/projects-store';
import { Sidebar } from './Sidebar';
import { ProjectTabs } from './ProjectTabs';
import { StatusBar } from './StatusBar';
import { DianaLogoInline } from '@/components/branding/DianaLogo';
import type { Project } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Prevent hydration mismatch from persisted stores
  const [mounted, setMounted] = useState(false);

  const { toggleSidebar, setMobileMenuOpen } = useUIStore();
  const {
    projects,
    activeProjectId,
    addProject,
    removeProject,
    setActiveProject,
    reorderProjects,
    closeOtherProjects,
    closeAllProjects,
  } = useProjectsStore();

  // Mark as mounted after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut for sidebar toggle: `[`
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for `[` key without modifiers
      if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const handleProjectAdd = () => {
    // TODO: Open project picker dialog
    const newProject: Project = {
      id: `${Date.now()}`,
      name: `project-${projects.length + 1}`,
      path: '/path/to/new/project',
    };
    addProject(newProject);
  };

  const handleReorder = (newProjects: Project[]) => {
    // Find what changed and call reorderProjects
    const oldIndex = projects.findIndex(
      (p, i) => p.id !== newProjects[i]?.id
    );
    if (oldIndex === -1) return;

    const movedProject = projects[oldIndex];
    const newIndex = newProjects.findIndex((p) => p.id === movedProject.id);
    reorderProjects(oldIndex, newIndex);
  };

  // Show minimal shell during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground">
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-auto p-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Main container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header with hamburger */}
          <div
            className="flex h-14 items-center gap-3 border-b px-4 md:hidden"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
          >
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center p-1.5 transition-luxury"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <DianaLogoInline variant="icon" theme="dark" width={24} height={24} />
              <span className="text-sm font-light tracking-wide" style={{ color: 'var(--accent-gold)' }}>DIANA</span>
            </div>
          </div>

          {/* Project Tabs */}
          <ProjectTabs
            projects={projects}
            activeProjectId={activeProjectId}
            onProjectSelect={setActiveProject}
            onProjectClose={removeProject}
            onProjectAdd={handleProjectAdd}
            onReorder={handleReorder}
            onCloseOthers={closeOtherProjects}
            onCloseAll={closeAllProjects}
          />

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
