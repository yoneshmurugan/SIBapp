import React, { useState } from "react";
import SettingsHeader from "./components/SettingsHeader";
import SettingsSidebar from "./components/SettingsSidebar";
import SecurityPanel from "./components/SecurityPanel";
import SessionsPanel from "./components/SessionsPanel";
import MembershipBadgePanel from "./components/MembershipBadgePanel";
import Header from "../MainPage/Header";

const PANELS = {
  security: SecurityPanel,
  sessions: SessionsPanel,
  membership: MembershipBadgePanel,
};

export default function Settings() {
  const [active, setActive] = useState("security");
  const ActivePanel = PANELS[active] ?? SecurityPanel;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16 transition-colors">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <SettingsHeader title="Account Settings" />
        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
          <aside className="md:col-span-4 lg:col-span-3">
            <SettingsSidebar active={active} onChange={setActive} />
          </aside>
          <div className="md:col-span-8 lg:col-span-9">
            <ActivePanel onNavigateToPassword={() => setActive("security")} />
          </div>
        </section>
      </div>
    </main>
  );
}
