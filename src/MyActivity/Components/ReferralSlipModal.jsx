import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, FileText, Tag, Home, MessageSquare, AlertCircle } from 'lucide-react';

const ReferralSlipModal = ({
  isOpen,
  onClose,
  slipData,
  darkMode = false,
  theme = 'default'
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const themeConfig = {
    default: {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-200',
        accent: 'bg-blue-50',
        button: 'bg-blue-600 hover:bg-blue-700',
        referrerBg: 'bg-blue-50',
        refereeBg: 'bg-green-50',
        hotBadge: 'bg-red-100 text-red-800',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-gray-700',
        accent: 'bg-gray-700',
        button: 'bg-blue-600 hover:bg-blue-700',
        referrerBg: 'bg-gray-700',
        refereeBg: 'bg-gray-700',
        hotBadge: 'bg-red-900 text-red-200',
      }
    },
    yellow: {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-yellow-200',
        accent: 'bg-yellow-50',
        button: 'bg-yellow-500 hover:bg-yellow-600',
        referrerBg: 'bg-yellow-50',
        refereeBg: 'bg-amber-50',
        hotBadge: 'bg-orange-100 text-orange-800',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-yellow-700',
        accent: 'bg-yellow-900',
        button: 'bg-yellow-600 hover:bg-yellow-700',
        referrerBg: 'bg-yellow-900',
        refereeBg: 'bg-amber-900',
        hotBadge: 'bg-orange-900 text-orange-200',
      }
    },
    red: {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-red-200',
        accent: 'bg-red-50',
        button: 'bg-red-600 hover:bg-red-700',
        referrerBg: 'bg-red-50',
        refereeBg: 'bg-pink-50',
        hotBadge: 'bg-red-100 text-red-800',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-red-700',
        accent: 'bg-red-900',
        button: 'bg-red-600 hover:bg-red-700',
        referrerBg: 'bg-red-900',
        refereeBg: 'bg-pink-900',
        hotBadge: 'bg-red-900 text-red-200',
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

  // Get status badge color
  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'contacted': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'qualified': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'converted': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
            <UserPlus className={`w-6 h-6 ${theme === 'yellow' ? 'text-yellow-600' : theme === 'red' ? 'text-red-600' : 'text-blue-600'}`} />
            <h2 className="text-xl font-bold">Referral Slip</h2>
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
          {/* Referral ID & Status */}
          <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">REFERRAL ID</p>
            <p className="font-mono text-lg mb-3">{slipData?._id || 'N/A'}</p>
            <div className="flex gap-2 flex-wrap">
              {slipData?.referral_status && Array.isArray(slipData.referral_status) ? (
                slipData.referral_status.map((status, idx) => (
                  <span key={idx} className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                    {status}
                  </span>
                ))
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('pending')}`}>
                  {slipData?.referral_status || 'Pending'}
                </span>
              )}
            </div>
          </div>

          {/* Hot Status Badge */}
          {slipData?.hot && (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors.hotBadge}`}>
                  🔥 {slipData.hot}
                </span>
              </div>
            </div>
          )}

          {/* Referrer Section */}
          <div className={`rounded-lg p-4 mb-4 ${colors.referrerBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5" />
              <h3 className="font-bold">Referrer (Source)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-semibold">{slipData?.referrerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                <p className="font-mono text-sm">{slipData?.referrer_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Referee Section */}
          <div className={`rounded-lg p-4 mb-4 ${colors.refereeBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5" />
              <h3 className="font-bold">Referee (Contact)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-semibold">{slipData?.refereeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                <p className="font-mono text-sm">{slipData?.referee_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className={`rounded-lg p-4 mb-4 border ${colors.border}`}>
            <h3 className="font-bold mb-3">Contact Information</h3>
            <div className="space-y-3">
              {slipData?.contact_name && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contact Name</p>
                  <p className="font-semibold">{slipData.contact_name}</p>
                </div>
              )}

              {slipData?.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-semibold">{slipData.contact_phone}</p>
                  </div>
                </div>
              )}

              {slipData?.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-semibold break-all">{slipData.contact_email}</p>
                  </div>
                </div>
              )}

              {slipData?.contact_address && (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-semibold">{slipData.contact_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Referral Details */}
          <div className={`rounded-lg p-4 mb-4 ${colors.accent}`}>
            <h3 className="font-bold mb-3">Referral Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Referral Type</p>
                <p className="font-semibold">{slipData?.referral_type || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="text-sm leading-relaxed">
                  {slipData?.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Comments */}
          {slipData?.comments && (
            <div className={`rounded-lg p-4 mb-4 border ${colors.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Comments</p>
              </div>
              <p className="text-sm leading-relaxed">{slipData.comments}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className={`rounded-lg p-4 grid grid-cols-1 gap-4 border ${colors.border}`}>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created Date</p>
              <p className="text-sm font-mono">{formatDate(slipData?.created_at)}</p>
            </div>
            {slipData?.updatedAt && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Updated Date</p>
                <p className="text-sm font-mono">{formatDate(slipData?.updatedAt)}</p>
              </div>
            )}
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

export default ReferralSlipModal;