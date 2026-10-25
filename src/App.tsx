import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './pages/DashboardView';
import { ScreensView } from './pages/ScreensView';
import { LayoutBuilderView } from './pages/LayoutBuilderView';
import { MediaLibraryView } from './pages/MediaLibraryView';
import { SchedulerView } from './pages/SchedulerView';
import { LogsView } from './pages/LogsView';
import { PlayerSimulatorView } from './pages/PlayerSimulatorView';
import { SettingsView } from './pages/SettingsView';
import { IAMView } from './pages/IAMView';
import { LoginView } from './pages/LoginView';
import { CRMView } from './pages/CRMView';
import { PairScreenModal } from './components/PairScreenModal';
import { EmergencyModal } from './components/EmergencyModal';
import { RemoteControlModal } from './components/RemoteControlModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Screen, UserAccount } from './types';
import { storageService } from './services/storage';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(storageService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [remoteScreen, setRemoteScreen] = useState<Screen | null>(null);
  const [simulatorTargetScreenId, setSimulatorTargetScreenId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const updateAuth = () => {
      setCurrentUser(storageService.getCurrentUser());
    };
    return storageService.subscribe(updateAuth);
  }, []);

  const handleOpenPlayerSimulator = (screenId?: string) => {
    if (screenId) {
      setSimulatorTargetScreenId(screenId);
    }
    setCurrentTab('player');
  };

  const handleSelectScreenForRemote = (screen: Screen) => {
    setRemoteScreen(screen);
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
  };

  // If user is not logged in, show Login Screen (Slide 4 Alo360)
  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenPairModal={() => setIsPairModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenPlayerSimulator={() => handleOpenPlayerSimulator()}
        onOpenChangePasswordModal={() => setIsChangePasswordOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectScreenForRemote={handleSelectScreenForRemote}
              onOpenPairModal={() => setIsPairModalOpen(true)}
              onOpenPlayerSimulator={() => handleOpenPlayerSimulator()}
            />
          )}

          {currentTab === 'screens' && (
            <ScreensView
              onSelectScreenForRemote={handleSelectScreenForRemote}
              onOpenPairModal={() => setIsPairModalOpen(true)}
              onOpenPlayerSimulator={handleOpenPlayerSimulator}
            />
          )}

          {currentTab === 'layouts' && <LayoutBuilderView />}

          {currentTab === 'media' && <MediaLibraryView />}

          {currentTab === 'schedules' && <SchedulerView />}

          {currentTab === 'logs' && <LogsView />}

          {currentTab === 'player' && (
            <PlayerSimulatorView initialScreenId={simulatorTargetScreenId} />
          )}

          {currentTab === 'iam' && <IAMView />}

          {currentTab === 'crm' && <CRMView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <PairScreenModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        onSuccess={() => {
          setCurrentTab('screens');
        }}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      <RemoteControlModal
        screen={remoteScreen}
        isOpen={Boolean(remoteScreen)}
        onClose={() => setRemoteScreen(null)}
        onUpdate={() => {
          if (remoteScreen) {
            const updated = storageService.getScreenById(remoteScreen.id);
            if (updated) setRemoteScreen(updated);
          }
        }}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};
export default App;
