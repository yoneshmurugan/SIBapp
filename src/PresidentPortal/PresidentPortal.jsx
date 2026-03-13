import React, { useState } from 'react'
import Header from '../MainPage/Header'
import AlertSystem from './AlertSystem'
import EventManagement from './EventManagement'
import Hero from './Hero'
import MemberRenewalManagement from './MemberRenewalManagement'
import CreateMemberForm from './components/CreateUser'
import MemberRoleManagement from './components/MemberRole'


function PresidentPortal() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen w-full transition-colors duration-300 pb-[calc(env(safe-area-inset-bottom)_+_1rem)]">
      
      {/* Set to top-0 */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-md">
        <Header />
      </div>

      {/* Replaced pt-20 with our dynamic calc() margin */}
      <div className="mt-[calc(env(safe-area-inset-top)_+_90px)] w-full px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full">
              <CreateMemberForm />
            </div>
            <div className="w-full">
              <MemberRoleManagement />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full">
              <MemberRenewalManagement refreshTrigger={refreshTrigger} />
            </div>
            <div className="w-full">
              <AlertSystem onAlertSent={handleRefresh} />
            </div>
          </div>
          <Hero onRefresh={handleRefresh} />
          <EventManagement refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}

export default PresidentPortal