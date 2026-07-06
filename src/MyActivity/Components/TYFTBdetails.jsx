import React, { useState } from 'react';
import { X, FileText, User, DollarSign, Calendar, Tag } from 'lucide-react';

const TYFTBSlipModal = ({
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
        payerBg: 'bg-blue-50',
        receiverBg: 'bg-green-50',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-gray-700',
        accent: 'bg-gray-700',
        button: 'bg-blue-600 hover:bg-blue-700',
        payerBg: 'bg-gray-700',
        receiverBg: 'bg-gray-700',
      }
    },
    yellow: {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-yellow-200',
        accent: 'bg-yellow-50',
        button: 'bg-yellow-500 hover:bg-yellow-600',
        payerBg: 'bg-yellow-50',
        receiverBg: 'bg-amber-50',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-yellow-700',
        accent: 'bg-yellow-900',
        button: 'bg-yellow-600 hover:bg-yellow-700',
        payerBg: 'bg-yellow-900',
        receiverBg: 'bg-amber-900',
      }
    },
    red: {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-red-200',
        accent: 'bg-red-50',
        button: 'bg-red-600 hover:bg-red-700',
        payerBg: 'bg-red-50',
        receiverBg: 'bg-pink-50',
      },
      dark: {
        bg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-red-700',
        accent: 'bg-red-900',
        button: 'bg-red-600 hover:bg-red-700',
        payerBg: 'bg-red-900',
        receiverBg: 'bg-pink-900',
      }
    }
  };

  const currentTheme = themeConfig[theme] || themeConfig.default;
  const colors = darkMode ? currentTheme.dark : currentTheme.light;

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

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    const num = parseFloat(amount);
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 rounded-lg shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${colors.bg} ${colors.text} ${colors.border} border`}
      >
        <div className={`flex items-center justify-between p-6 border-b ${colors.border} ${colors.accent}`}>
          <div className="flex items-center gap-3">
            <FileText className={`w-6 h-6 ${theme === 'yellow' ? 'text-yellow-600' : theme === 'red' ? 'text-red-600' : 'text-blue-600'}`} />
            <h2 className="text-xl font-bold">Business Transaction Slip</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${colors.button} text-white`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">SLIP ID</p>
            <p className="font-mono text-lg">{slipData?._id || 'N/A'}</p>
          </div>

          <div className={`rounded-lg p-4 mb-4 ${colors.payerBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5" />
              <h3 className="font-bold">FROM</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-semibold">{slipData?.payerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                <p className="font-mono text-sm">{slipData?.payer_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-4 mb-4 ${colors.receiverBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5" />
              <h3 className="font-bold">TO</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-semibold">{slipData?.receiverName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                <p className="font-mono text-sm">{slipData?.receiver_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-4 mb-4 border-2 ${colors.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold">Transaction Amount</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(slipData?.business_amount)}
            </p>
          </div>

          <div className={`rounded-lg p-4 mb-4 ${colors.accent}`}>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5" />
              <h3 className="font-bold">Business Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Business Type</p>
                <p className="font-semibold">{slipData?.business_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Referral Type</p>
                <p className="font-semibold">{slipData?.referral_type || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-sm leading-relaxed">
                {slipData?.business_description || 'No description provided'}
              </p>
            </div>
          </div>

          <div className={`rounded-lg p-4 grid grid-cols-2 gap-4 border ${colors.border}`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              </div>
              <p className="text-sm font-mono">{formatDate(slipData?.created_at)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Updated</p>
              </div>
              <p className="text-sm font-mono">{formatDate(slipData?.updated_at)}</p>
            </div>
          </div>

          {slipData?.referral_id && (
            <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Linked Referral ID</p>
              <p className="font-mono text-sm">{slipData.referral_id}</p>
            </div>
          )}
        </div>

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

export default TYFTBSlipModal;