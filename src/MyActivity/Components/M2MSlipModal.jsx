import React, { useState } from 'react';
import { X, Users, MapPin, Calendar, FileText, MessageSquare } from 'lucide-react';

const M2MSlipModal = ({
  isOpen,
  onClose,
  slipData,
  darkMode = false,
  theme = 'default' // 'default', 'yellow', 'red'
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  // Theme color configurations
  const themeConfig = {
    default: {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-200',
        accent: 'bg-blue-50',
        button: 'bg-blue-600 hover:bg-blue-700',
        member1Bg: 'bg-blue-50',
        member2Bg: 'bg-indigo-50',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-gray-700',
        accent: 'bg-gray-700',
        button: 'bg-blue-600 hover:bg-blue-700',
        member1Bg: 'bg-gray-700',
        member2Bg: 'bg-gray-700',
      }
    },
    yellow: {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-yellow-200',
        accent: 'bg-yellow-50',
        button: 'bg-yellow-500 hover:bg-yellow-600',
        member1Bg: 'bg-yellow-50',
        member2Bg: 'bg-amber-50',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-yellow-700',
        accent: 'bg-yellow-900',
        button: 'bg-yellow-600 hover:bg-yellow-700',
        member1Bg: 'bg-yellow-900',
        member2Bg: 'bg-amber-900',
      }
    },
    red: {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-red-200',
        accent: 'bg-red-50',
        button: 'bg-red-600 hover:bg-red-700',
        member1Bg: 'bg-red-50',
        member2Bg: 'bg-pink-50',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-red-700',
        accent: 'bg-red-900',
        button: 'bg-red-600 hover:bg-red-700',
        member1Bg: 'bg-red-900',
        member2Bg: 'bg-pink-900',
      }
    }
  };

  const currentTheme = themeConfig[theme] || themeConfig.default;
  const colors = darkMode ? currentTheme.dark : currentTheme.light;

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle print
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 rounded-lg shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${colors.bg} ${colors.text} ${colors.border} border`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${colors.border} ${colors.accent}`}>
          <div className="flex items-center gap-3">
            <Users className={`w-6 h-6 ${theme === 'yellow' ? 'text-yellow-600' : theme === 'red' ? 'text-red-600' : 'text-blue-600'}`} />
            <h2 className="text-xl font-bold">One-to-One Meeting Slip</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${colors.button} text-white`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Meeting ID */}
          <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">MEETING ID</p>
            <p className="font-mono text-lg">{slipData?._id || 'N/A'}</p>
          </div>

          {/* Member 1 Section */}
          <div className={`rounded-lg p-4 mb-4 ${colors.member1Bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              <h3 className="font-bold">Member 1</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-semibold">{slipData?.member1Name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                <p className="font-mono text-sm">{slipData?.member1_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Member 2 Section */}
          <div className={`rounded-lg p-4 mb-4 ${colors.member2Bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              <h3 className="font-bold">Member 2</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-semibold">{slipData?.member2Name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                <p className="font-mono text-sm">{slipData?.member2_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Chapter Section */}
          <div className={`rounded-lg p-4 mb-4 ${colors.accent}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Chapter</p>
            <p className="font-semibold">{slipData?.chapterName || 'N/A'}</p>
            <p className="font-mono text-sm text-gray-600 dark:text-gray-300">{slipData?.chapter_id || ''}</p>
          </div>

          {/* Meeting Details */}
          <div className={`rounded-lg p-4 mb-4 border ${colors.border}`}>
            <div className="space-y-4">
              {/* Date */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Meeting Date & Time</p>
                </div>
                <p className="font-semibold">{formatDate(slipData?.meeting_date)}</p>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                </div>
                <p className="font-semibold">{slipData?.location || 'N/A'}</p>
              </div>

              {/* Discussion Points */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Discussion Points</p>
                </div>
                <p className="text-sm leading-relaxed">
                  {slipData?.discussion_points || 'No discussion points recorded'}
                </p>
              </div>
            </div>
          </div>

          {/* Created By */}
          <div className={`rounded-lg p-4 mb-4 ${colors.accent}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created By</p>
            <p className="font-mono text-sm">{slipData?.created_by || 'N/A'}</p>
          </div>

          {/* Timestamps */}
          <div className={`rounded-lg p-4 grid grid-cols-2 gap-4 border ${colors.border}`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              </div>
              <p className="text-sm font-mono">{formatDate(slipData?.createdAt)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Updated</p>
              </div>
              <p className="text-sm font-mono">{formatDate(slipData?.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 justify-end p-6 border-t ${colors.border} bg-gray-50 dark:bg-gray-900 rounded-b-lg`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`px-4 py-2 rounded-lg ${colors.button} text-white font-medium transition-all disabled:opacity-50 print:hidden`}
          >
            {isPrinting ? 'Printing...' : 'Print'}
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .fixed {
            position: static !important;
            background: white !important;
          }
        }
      `}</style>
    </>
  );
};

export default M2MSlipModal;