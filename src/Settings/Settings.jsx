import React, { useState } from "react";
import SettingsHeader from "./components/SettingsHeader";
import SettingsSidebar from "./components/SettingsSidebar";
import SecurityPanel from "./components/SecurityPanel";
import NotificationsPanel from "./components/NotificationsPanel";
import PrivacyPanel from "./components/PrivacyPanel"; // Add this import
import Header from "../MainPage/Header";

const PANELS = {
  security: SecurityPanel,
  notifications: NotificationsPanel,
  privacy: PrivacyPanel, // Add this
};

export default function Settings() {
  const [active, setActive] = useState("security");
  const ActivePanel = PANELS[active] ?? SecurityPanel;

  return (
    <main className="h-screen pt-2">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <SettingsHeader title="Settings" />
        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
          <aside className="md:col-span-4 lg:col-span-3">
            <SettingsSidebar active={active} onChange={setActive} />
          </aside>
          <div className="md:col-span-8 lg:col-span-9">
            <ActivePanel />
          </div>
        </section>
      </div>
    </main>
  );
}
