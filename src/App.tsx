import React, { useState, useEffect } from 'react';
import { Brand, Post, DirectorAlert } from './types.ts';
import { loadStoredData, saveStoredData } from './lib/storage.ts';
import { Header } from './components/Header.tsx';
import { Sidebar, NAV_ITEMS } from './components/Sidebar.tsx';
import { WorkspaceView } from './components/WorkspaceView.tsx';
import { VoicesView } from './components/VoicesView.tsx';
import { StudioView } from './components/StudioView.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { AuditsView } from './components/AuditsView.tsx';
import { TrendsView } from './components/TrendsView.tsx';
import { RepurposerView } from './components/RepurposerView.tsx';
import { RepliesView } from './components/RepliesView.tsx';
import { InsightsView } from './components/InsightsView.tsx';
import { SmmAssistantDrawer } from './components/SmmAssistantDrawer.tsx';
import { Bot } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState(() => loadStoredData());
  const [currentTab, setCurrentTab] = useState<string>('workspace');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [studioPreFillTopic, setStudioPreFillTopic] = useState<string>('');

  // Persist state changes
  useEffect(() => {
    saveStoredData(appState);
  }, [appState]);

  const activeBrand =
    appState.brands.find((b) => b.id === appState.activeBrandId) ||
    appState.brands[0] ||
    null;

  // Filter alerts by active brand or global
  const clientAlerts = (appState.alerts || []).filter(
    (a) => !a.brandId || !activeBrand || a.brandId === activeBrand.id
  );
  const replyAlerts = clientAlerts.filter((a) => a.type === 'reply');
  const auditAlerts = clientAlerts.filter((a) => a.type === 'audit_task');
  const totalAlertCount = clientAlerts.length;

  function handleSelectBrand(brandId: string) {
    setAppState((prev) => ({
      ...prev,
      activeBrandId: brandId,
    }));
  }

  function handleSaveBrand(brandToSave: Brand) {
    setAppState((prev) => {
      const exists = prev.brands.some((b) => b.id === brandToSave.id);
      const updatedBrands = exists
        ? prev.brands.map((b) => (b.id === brandToSave.id ? brandToSave : b))
        : [...prev.brands, brandToSave];
      return {
        ...prev,
        brands: updatedBrands,
        activeBrandId: brandToSave.id,
      };
    });
  }

  function handleDeleteBrand(brandId: string) {
    setAppState((prev) => {
      const remainingBrands = prev.brands.filter((b) => b.id !== brandId);
      const remainingPosts = prev.posts.filter((p) => p.brandId !== brandId);
      const remainingAlerts = (prev.alerts || []).filter((a) => a.brandId !== brandId);
      return {
        ...prev,
        brands: remainingBrands,
        posts: remainingPosts,
        alerts: remainingAlerts,
        activeBrandId: remainingBrands[0]?.id || '',
      };
    });
  }

  function handleSavePost(savedPost: Post) {
    setAppState((prev) => {
      const exists = prev.posts.some((p) => p.id === savedPost.id);
      const updatedPosts = exists
        ? prev.posts.map((p) => (p.id === savedPost.id ? savedPost : p))
        : [...prev.posts, savedPost];
      return {
        ...prev,
        posts: updatedPosts,
      };
    });
  }

  function handleDeletePost(postId: string) {
    setAppState((prev) => ({
      ...prev,
      posts: prev.posts.filter((p) => p.id !== postId),
    }));
  }

  function handleAddPosts(newPosts: Omit<Post, 'id'>[]) {
    const formatted = newPosts.map((p) => ({
      ...p,
      id: 'p-' + Math.random().toString(36).slice(2, 9),
    }));
    setAppState((prev) => ({
      ...prev,
      posts: [...prev.posts, ...formatted],
    }));
  }

  function handleAddSinglePost(newPost: Omit<Post, 'id'>) {
    const postWithId: Post = {
      ...newPost,
      id: 'p-' + Math.random().toString(36).slice(2, 9),
    };
    setAppState((prev) => ({
      ...prev,
      posts: [...prev.posts, postWithId],
    }));
  }

  function handleUpdateBrandAuditScore(brandId: string, score: number) {
    setAppState((prev) => ({
      ...prev,
      brands: prev.brands.map((b) =>
        b.id === brandId
          ? {
              ...b,
              auditScore: score,
              lastAuditDate: new Date().toISOString().split('T')[0],
            }
          : b
      ),
    }));
  }

  function handleImportBrands(imported: Brand[]) {
    setAppState((prev) => ({
      ...prev,
      brands: imported,
      activeBrandId: imported[0]?.id || '',
    }));
  }

  function handlePreFillStudio(topic: string) {
    setStudioPreFillTopic(topic);
    setCurrentTab('studio');
  }

  // Alerts & Notifications Handlers
  function handleAddAlerts(newAlerts: Omit<DirectorAlert, 'id' | 'timestamp'>[]) {
    const formatted: DirectorAlert[] = newAlerts.map((a) => ({
      ...a,
      id: 'alt-' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    }));
    setAppState((prev) => {
      const existing = prev.alerts || [];
      // Deduplicate by title & type & brandId to avoid cluttering
      const nonDuplicates = formatted.filter(
        (fa) =>
          !existing.some(
            (ea) =>
              ea.title === fa.title &&
              ea.type === fa.type &&
              ea.brandId === fa.brandId
          )
      );
      return {
        ...prev,
        alerts: [...existing, ...nonDuplicates],
      };
    });
  }

  function handleAddSingleAlert(newAlert: Omit<DirectorAlert, 'id' | 'timestamp'>) {
    handleAddAlerts([newAlert]);
  }

  function handleDismissAlert(alertId: string) {
    setAppState((prev) => ({
      ...prev,
      alerts: (prev.alerts || []).filter((a) => a.id !== alertId),
    }));
  }

  function handleResolveAlert(alertId: string) {
    setAppState((prev) => ({
      ...prev,
      alerts: (prev.alerts || []).filter((a) => a.id !== alertId),
    }));
  }

  function handleClearAllAlerts() {
    setAppState((prev) => ({
      ...prev,
      alerts: (prev.alerts || []).filter(
        (a) => a.brandId && activeBrand && a.brandId !== activeBrand.id
      ),
    }));
  }

  function handleMarkAlertsRead() {
    setAppState((prev) => ({
      ...prev,
      alerts: (prev.alerts || []).map((a) =>
        !a.brandId || !activeBrand || a.brandId === activeBrand.id
          ? { ...a, isRead: true }
          : a
      ),
    }));
  }

  return (
    <div className="min-h-screen bg-[#EAEFEA] flex flex-col md:flex-row font-sans selection:bg-[#E8B422]/40 selection:text-[#14273A]">
      {/* Desktop Navigation Rail */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          brands={appState.brands}
          activeBrand={activeBrand}
          onSelectBrand={handleSelectBrand}
          onNewBrand={() => {
            setCurrentTab('brands');
          }}
          onOpenAssistant={() => setAssistantOpen(true)}
          alertCount={totalAlertCount}
          replyCount={replyAlerts.length}
          auditCount={auditAlerts.length}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header with Brand Switcher */}
        <Header
          brands={appState.brands}
          activeBrand={activeBrand}
          onSelectBrand={handleSelectBrand}
          onNewBrand={() => setCurrentTab('brands')}
          onOpenAssistant={() => setAssistantOpen(true)}
          onNavigateTab={setCurrentTab}
          currentTab={currentTab}
          posts={appState.posts}
          alertCount={totalAlertCount}
          replyCount={replyAlerts.length}
          auditCount={auditAlerts.length}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'workspace' && (
            <WorkspaceView
              brands={appState.brands}
              posts={appState.posts}
              activeBrand={activeBrand}
              onSelectBrand={handleSelectBrand}
              onNavigateTab={setCurrentTab}
              onNewBrand={() => setCurrentTab('brands')}
            />
          )}

          {currentTab === 'brands' && (
            <VoicesView
              brands={appState.brands}
              activeBrand={activeBrand}
              onSaveBrand={handleSaveBrand}
              onDeleteBrand={handleDeleteBrand}
              onSelectBrand={handleSelectBrand}
              onNavigateTab={setCurrentTab}
              onImportBrands={handleImportBrands}
            />
          )}

          {currentTab === 'studio' && (
            <StudioView
              brand={activeBrand}
              onAddPostToCalendar={handleAddSinglePost}
              onNavigateTab={setCurrentTab}
              preFillTopic={studioPreFillTopic}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              brand={activeBrand}
              posts={appState.posts}
              onSavePost={handleSavePost}
              onDeletePost={handleDeletePost}
              onAddPosts={handleAddPosts}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'audits' && (
            <AuditsView
              brand={activeBrand}
              onUpdateBrandAuditScore={handleUpdateBrandAuditScore}
              onAddPostToCalendar={handleAddSinglePost}
              onAddPostsToCalendar={handleAddPosts}
              onSaveBrand={handleSaveBrand}
              onNavigateTab={setCurrentTab}
              onPreFillStudioTopic={handlePreFillStudio}
              onAddAlerts={handleAddAlerts}
              activeAlerts={clientAlerts}
            />
          )}

          {currentTab === 'trends' && (
            <TrendsView
              brand={activeBrand}
              onNavigateTab={setCurrentTab}
              onPreFillStudioTopic={handlePreFillStudio}
            />
          )}

          {currentTab === 'repurpose' && (
            <RepurposerView
              brand={activeBrand}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'replies' && (
            <RepliesView
              brand={activeBrand}
              onNavigateTab={setCurrentTab}
              onAddAlerts={handleAddAlerts}
              activeAlerts={clientAlerts}
            />
          )}

          {currentTab === 'insights' && (
            <InsightsView
              brand={activeBrand}
              onAddPostToCalendar={handleAddSinglePost}
              onNavigateTab={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Mobile Responsive Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#14273A] text-white border-t border-white/20 flex overflow-x-auto py-1 px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isRepliesWithAlerts = item.id === 'replies' && replyAlerts.length > 0;
          const isAuditsWithAlerts = item.id === 'audits' && auditAlerts.length > 0;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex-1 min-w-[58px] py-2 flex flex-col items-center justify-center text-[10px] transition relative ${
                isActive
                  ? 'text-[#E8B422] font-bold border-t-2 border-[#E8B422]'
                  : 'text-white/70 hover:text-white border-t-2 border-transparent'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4 mb-0.5" />
                {isRepliesWithAlerts && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#1E6F78] text-white text-[8px] font-bold rounded-full">
                    {replyAlerts.length}
                  </span>
                )}
                {isAuditsWithAlerts && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#D9432B] text-white text-[8px] font-bold rounded-full">
                    {auditAlerts.length}
                  </span>
                )}
              </div>
              <span className="truncate max-w-[54px]">{item.label}</span>
            </button>
          );
        })}

        {/* Mobile SMM Director Trigger */}
        <button
          onClick={() => setAssistantOpen(true)}
          className="flex-1 min-w-[58px] py-2 flex flex-col items-center justify-center text-[10px] text-white/80 hover:text-white transition relative"
        >
          <div className="relative">
            <Bot className="w-4 h-4 mb-0.5 text-[#E8B422]" />
            {totalAlertCount > 0 && (
              <span className="absolute -top-1 -right-2.5 px-1 py-0.2 bg-[#D9432B] text-white text-[8px] font-extrabold rounded-full animate-pulse">
                {totalAlertCount}
              </span>
            )}
          </div>
          <span className="truncate max-w-[54px]">Director</span>
        </button>
      </nav>

      {/* SMM Director AI Assistant Drawer */}
      <SmmAssistantDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        brand={activeBrand}
        alerts={clientAlerts}
        onDismissAlert={handleDismissAlert}
        onResolveAlert={handleResolveAlert}
        onClearAllAlerts={handleClearAllAlerts}
        onMarkAllRead={handleMarkAlertsRead}
        onAddAlert={handleAddSingleAlert}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          setAssistantOpen(false);
        }}
      />
    </div>
  );
}
