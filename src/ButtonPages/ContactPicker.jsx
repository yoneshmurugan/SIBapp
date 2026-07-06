import { useState, useEffect, useMemo } from 'react';
import { X, Search, User, Phone, Check } from 'lucide-react';
import { Contacts } from '@capacitor-community/contacts';

const ContactPicker = ({ isOpen, onClose, onSelect }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("ContactPicker: Requesting permissions...");
      const perm = await Contacts.requestPermissions();
      console.log("ContactPicker: Permission status:", perm.contacts);
      
      if (perm.contacts !== 'granted') {
        setError("Contact permission is required. Please enable it in Settings.");
        setLoading(false);
        return;
      }

      console.log("ContactPicker: Fetching contacts...");
      // Pass an explicit projection to avoid null pointer in Java plugin
      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true
        }
      });
      console.log("ContactPicker: Fetch result received. Count:", result.contacts?.length);
      
      if (!result.contacts || result.contacts.length === 0) {
        setError("No contacts found in your phonebook.");
        setLoading(false);
        return;
      }

      // Format with multiple fallbacks for different plugin versions/OS
      const formatted = result.contacts
        .map(c => {
          const name = c.name?.display || c.displayName || c.name?.given || "Unknown";
          const phone = c.phones?.[0]?.number || "";
          const id = c.contactId || c.id || Math.random().toString();
          return { id, name, phone };
        })
        .filter(c => c.phone)
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log("ContactPicker: Formatted contacts count:", formatted.length);
      setContacts(formatted);
    } catch (err) {
      console.error("ContactPicker Error:", err);
      setError("Error: " + (err.message || "Unable to read contacts"));
      // Also show an alert for immediate feedback on the device
      alert("Phonebook Error: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const q = searchTerm.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q)
    );
  }, [contacts, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Contact</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pick a contact from your phonebook</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-transparent focus:border-amber-400 focus:ring-0 rounded-xl text-sm transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">Reading phonebook...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
              <p className="text-red-500 font-semibold mb-2">{error}</p>
              <button 
                onClick={fetchContacts}
                className="text-xs text-amber-600 font-bold uppercase tracking-widest"
              >
                Try Again
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-sm">No contacts found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => onSelect(contact)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone size={12} />
                      {contact.phone}
                    </p>
                  </div>
                  <Check className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPicker;
