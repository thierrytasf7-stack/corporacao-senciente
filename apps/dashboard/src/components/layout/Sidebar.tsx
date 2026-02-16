'use client';

import { useUIStore } from '@/stores/ui-store';
import { SIDEBAR_ITEMS } from '@/types';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { DianaLogoInline } from '@/components/branding/DianaLogo';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, activeView, setActiveView, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const handleNavClick = (id: typeof activeView) => {
    setActiveView(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop - mobile only */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r bg-sidebar transition-luxury',
          // Desktop: normal flow
          'hidden md:flex',
          sidebarCollapsed ? 'w-16' : 'w-60',
          // Mobile: overlay drawer
          isMobileMenuOpen && 'fixed inset-y-0 left-0 z-40 flex w-60',
          className
        )}
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {/* Logo/Brand */}
        <div className="flex h-14 items-center border-b px-4" style={{ borderColor: 'var(--border-subtle)' }}>
          {sidebarCollapsed ? (
            <DianaLogoInline variant="icon" theme="dark" width={32} height={32} />
          ) : (
            <div className="flex items-center gap-3">
              <DianaLogoInline variant="icon" theme="dark" width={32} height={32} />
              <div className="flex flex-col">
                <span className="text-sm font-light tracking-wide" style={{ color: 'var(--accent-gold)' }}>DIANA</span>
                <span className="text-xs font-light" style={{ color: 'var(--text-tertiary)' }}>Corporação Senciente</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-refined">
          <ul className="space-y-0.5 px-2">
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                isCollapsed={sidebarCollapsed && !isMobileMenuOpen}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

interface SidebarNavItemProps {
  item: typeof SIDEBAR_ITEMS[number];
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

function SidebarNavItem({ item, isActive, isCollapsed, onClick }: SidebarNavItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'group relative flex w-full items-center gap-3 px-3 py-2 text-sm font-light',
          'transition-luxury',
          'focus-visible:outline-none focus-visible:ring-1',
          isCollapsed && 'justify-center px-2'
        )}
        style={{
          backgroundColor: isActive ? 'var(--accent-gold-bg)' : 'transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }
        }}
        title={isCollapsed ? `${item.label} (${item.shortcut})` : undefined}
      >
        {/* Icon */}
        {(() => {
          const IconComponent = iconMap[item.icon];
          return IconComponent ? (
            <IconComponent
              className="h-4 w-4 flex-shrink-0 transition-luxury"
              style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)' }}
            />
          ) : null;
        })()}

        {/* Label (hidden when collapsed) */}
        {!isCollapsed && <span className="flex-1 truncate text-left">{item.label}</span>}

        {/* Keyboard shortcut hint */}
        {!isCollapsed && item.shortcut && (
          <span
            className="ml-auto text-[9px] px-1.5 py-0.5 font-mono tracking-wide border"
            style={{
              borderColor: isActive ? 'var(--border-gold)' : 'var(--border-subtle)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
            }}
          >
            {item.shortcut}
          </span>
        )}

        {/* Active indicator - gold line */}
        {isActive && (
          <span
            className={cn(
              'absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2',
              isCollapsed && 'left-0'
            )}
            style={{ backgroundColor: 'var(--accent-gold)' }}
          />
        )}
      </button>
    </li>
  );
}
