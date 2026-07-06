import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Phone, Calendar, MapPin, Mail, Globe } from 'lucide-react';

const IdCardModal = ({ isOpen, onClose, profileData }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [libLoaded, setLibLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Robustly handle whether profileData is the direct object or an array
  const data = Array.isArray(profileData) ? profileData[0] : (profileData || {});

  // --- HTML2Canvas Loader ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.html2canvas) {
      setLibLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Reset image error state when data changes
  useEffect(() => {
    setImgError(false);
  }, [data?._id]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current || !window.html2canvas) return;
    setDownloading(true);

    try {
      // 1. Wait for images to load (logos etc)
      const images = cardRef.current.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; 
        });
      }));

      // 2. Generate Canvas
      const canvas = await window.html2canvas(cardRef.current, {
        useCORS: true,       
        allowTaint: true,   
        scale: 4, // High resolution
        backgroundColor: null, 
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
            const clonedCard = clonedDoc.getElementById('capture-target');
            if(clonedCard) {
                clonedCard.style.fontFeatureSettings = '"liga" 0';
                clonedCard.style.transform = 'none';
            }
        }
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      // Updated to use username for filename as well
      link.download = `${data?.user?.username || 'Member'}_ID_Card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download ID card:", err);
      alert("Download failed. Please check the console.");
    } finally {
      setDownloading(false);
    }
  };

  // --- Data Mapping ---
  // Updated: Prioritize username instead of display_name (nickname)
  const displayName = data?.user?.username || "Member Name";
  const memberId = data?.membership?.idno || "SIB-MEM";
  
  // Image Logic
  let avatarUrl = "https://via.placeholder.com/200?text=No+Image";
  const getBackendUrl = () => {
    try { return import.meta.env.VITE_BACKEND_SERVER; } catch (e) { return ""; }
  };

  if (data?.profile_image_url) {
    let rawUrl = "";
    if (data.profile_image_url.startsWith("http")) {
      rawUrl = data.profile_image_url;
    } else {
      rawUrl = `${getBackendUrl()}${data.profile_image_url}`;
    }
    const separator = rawUrl.includes('?') ? '&' : '?';
    avatarUrl = `${rawUrl}${separator}t=${new Date().getTime()}`;
  }

  // Details
  const phone = data?.company_phone || "N/A";
  const email = data?.company_email || data?.user?.email || "N/A";
  const address = data?.company_address || data?.personal_address || "Address not provided";
  const companyName = data?.company_name || "Company Name";
  const bloodGroup = data?.blood_group || "";
  const dob = data?.dob ? new Date(data.dob).toLocaleDateString() : "N/A";
  const weddingDate = data?.wedding_date ? new Date(data.wedding_date).toLocaleDateString() : "N/A";
  const vagaiyara = data?.vagai_category || "N/A";
  const kuladeivam = data?.kuladeivam || "N/A";

  let vertical = "General";
  if (data?.vertical_names && data.vertical_names.length > 0) {
    vertical = data.vertical_names.join(", ");
  }

  const chapterName = data?.chaptername || "SIB Chapter";
  const chapterCode = chapterName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();

  // --- STRICT INLINE STYLES ---
  const styles = {
    wrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '2rem',
      padding: '2rem',
      backgroundColor: '#f3f4f6',
      fontFamily: "'Inter', sans-serif"
    },
    card: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      width: '320px',
      height: '520px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      flexShrink: 0,
      boxSizing: 'border-box'
    },
    frontHeader: {
      height: '210px',
      backgroundColor: '#171717',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
      zIndex: 1
    },
    headerDecoration1: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '12rem',
      height: '12rem',
      borderRadius: '50%',
      transform: 'translate(2.5rem, -2.5rem)',
      backgroundColor: '#eab308', 
      opacity: 0.1, 
      filter: 'blur(40px)',
      zIndex: 0
    },
    headerTitle: {
      position: 'relative',
      zIndex: 10,
      fontWeight: 900,
      fontSize: '10px',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      marginTop: '0.3rem', // Reduced margin top
      color: 'rgba(255,255,255,0.9)',
      
    },
    logoContainer: {
      marginBottom: 'auto', // Pushes it away from the bottom (where profile overlaps)
      position: 'relative',
      zIndex: 10,
      width: '4.5rem', // Slightly smaller to ensure fit
      height: '4.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '8px'
    },
    goldLine: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '7px',
      backgroundColor: '#ca8a04',
      zIndex: 5,
    },
    profileContainer: {
      position: 'absolute',
      marginTop: '6rem',
      display: 'flex',
      justifyContent: 'center',
      zIndex: 20,
      width: '100%',
    },
    profileImageWrapper: {
      width: '128px',
      height: '128px',
      borderRadius: '16px',
      border: '4px solid #ffffff',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      
    },
    profileImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },
    bloodGroup: {
      position: 'absolute',
      bottom: '-6px',
      right: '-10px',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border: '2px solid #ffffff',
      backgroundColor: '#dc2626',
      zIndex: 30,
      color: '#ffffff',
      fontSize: '10px',
      fontWeight: 900,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      paddingBottom: '12px'
    },
    body: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '0.5rem',
      paddingLeft: '1.25rem',
      paddingRight: '1.25rem',
      paddingBottom: '1rem',
      textAlign: 'center',
      position: 'relative',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      zIndex: 5
    },
    memberId: {
      fontFamily: 'monospace',
      fontWeight: 'bold',
      fontSize: '14px',
      letterSpacing: '0.1em',
      borderBottom: '2px solid #fee2e2',
      paddingBottom: '0px',
      color: '#b91c1c',
      marginBottom: '-1px',
      display: 'inline-block'
    },
    name: {
      fontSize: '20px',
      fontWeight: 900,
      textTransform: 'uppercase',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      marginBottom: '8px',
      color: '#111827',
      width: '100%',
      textAlign: 'center',
      paddingBottom: '4px',
    },
    verticalPill: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      // FIX: Adjust padding to push text up visually (less padding top, more bottom)
      // or keep balanced but force line-height
      padding: '4px 16px 16px 16px', 
      borderRadius: '9999px',
      fontSize: '10px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '16px',
      backgroundColor: '#171717',
      color: '#ffffff',
      maxWidth: '90%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: '1.1' // Strict line height
    },
    detailsBox: {
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: '12px',
      borderRadius: '12px',
      border: '1px solid #f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    detailLabel: {
      fontSize: '8px',
      textTransform: 'uppercase',
      fontWeight: 800,
      letterSpacing: '0.1em',
      marginBottom: '2px',
      color: '#9ca3af',
      display: 'block'
    },
    detailValue: {
      fontWeight: 'bold',
      fontSize: '12px',
      lineHeight: 1.25,
      color: '#1f2937',
      margin: 0,

      
    },
    footer: {
      marginTop: 'auto',
      width: '100%',
      paddingTop: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    chapterCode: {
      fontSize: '30px',
      fontWeight: 900,
      lineHeight: 1,
      color: '#d1d5db',
      display: 'block'
    },
    backHeader: {
        height: '64px', 
        backgroundColor: '#171717', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingLeft: '24px', 
        paddingRight: '24px', 
        overflow: 'hidden' 
    },
    websiteFooter: {
        padding: '12px 24px', 
        backgroundColor: '#171717',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box'
    },
    // Icon Wrapper Helper for consistent alignment
    iconRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px'
        
    },
    // Helper for text next to icons to ensure it doesn't hang low
    iconText: {
        fontSize: '12px',
        fontWeight: 'bold', 
        color: '#1f2937',
        lineHeight: '1', // FORCE line height to match icon center
        display: 'block',
        marginTop: '2px' // Visual tweak for fonts that render high
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col my-auto">

        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Member ID Preview</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-8 bg-gray-100 flex justify-center items-start overflow-auto">
          
          {/* Main Capture Container */}
          <div ref={cardRef} id="capture-target" style={styles.wrapper}>
            
            {/* ================= CARD FRONT ================= */}
            <div style={styles.card}>
              
              <div style={styles.frontHeader}>
                 <div style={styles.headerDecoration1}></div>
                 
                 <h1 style={styles.headerTitle}>Sengunthar In Business</h1>

                 <div style={styles.logoContainer}>
                    <img src='../logo.webp' alt="SIB Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))' }} />
                 </div>
                 
                 <div style={styles.goldLine}></div>
              </div>

              <div style={styles.profileContainer}>
                 <div style={{ position: 'relative' }}>
                   <div style={styles.profileImageWrapper}>
                      <img 
                        src={imgError ? "https://via.placeholder.com/200?text=No+Image" : avatarUrl} 
                        alt="Profile" 
                        style={styles.profileImage}
                        crossOrigin="anonymous"
                        onError={() => setImgError(true)}
                      />
                   </div>
                   {bloodGroup && (
                     <div style={styles.bloodGroup}>
                       <span>{bloodGroup}</span>
                     </div>
                   )}
                 </div>
              </div>

              <div style={styles.body}>
                 <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                    <span style={styles.memberId}>{memberId}</span>
                 </div>

                 <h2 style={styles.name}>{displayName}</h2>

                 <span style={styles.verticalPill}>{vertical}</span>

                 <div style={styles.detailsBox}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                       <span style={styles.detailLabel}>Company</span>
                       <p style={styles.detailValue}>{companyName}</p>
                    </div>

                    <div style={{ width: '50%', height: '1px', backgroundColor: '#e5e7eb', margin: '0 auto' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                       <span style={styles.detailLabel}>Contact</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', backgroundColor: '#f9fafb', padding: '6px 12px', borderRadius: '6px', color: '#1f2937' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Phone size={12} color="#dc2626" />
                          </div>
                          <span style={{ paddingBottom: '14px', fontSize: '12px', letterSpacing: '0.025em', lineHeight: '1' }}>{phone}</span>
                       </div>
                    </div>
                 </div>

                 <div style={styles.footer}>
                    <div style={{ textAlign: 'left', paddingLeft: '4px' }}>
                       <span style={styles.detailLabel}>Chapter</span>
                       <span style={styles.chapterCode}>{chapterCode}</span>
                    </div>
                    <div style={{ opacity: 0.1, width: '40px', height: '40px', display: 'flex', alignItems: 'center' }}>
                       <img src="../logo.webp" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(100%)' }} />
                    </div>
                 </div>
              </div>
            </div>

            {/* ================= CARD BACK ================= */}
            <div style={styles.card}>
              
              {/* Back Header */}
              <div style={styles.backHeader}>
                 <div style={{ position: 'absolute', top: 0, right: '40px', width: '80px', height: '100%', backgroundColor: 'rgba(255,255,255,0.05)', transform: 'skewX(-20deg)' }}></div>
                 
                 <div style={{ position: 'relative', zIndex: 10 }}>
                    <h2 style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px', letterSpacing: '0.025em', margin: 0 }}>Details</h2>
                    <div style={{ height: '2px', width: '32px', backgroundColor: '#eab308', marginTop: '4px' }}></div>
                 </div>
                 
                 <div style={{ position: 'relative', zIndex: 10, width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src='../logo.webp' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 </div>
              </div>

              {/* Back Content */}
              <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', backgroundColor: '#ffffff' }}>
                 <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: styles.body.backgroundImage }}></div>

                 <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Vagaiyara */}
                    <div style={{ padding: '10px', borderRadius: '8px', border: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                       <span style={styles.detailLabel}>Vagaiyara</span>
                       <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', letterSpacing: '0.025em', color: '#1f2937' }}>{vagaiyara}</span>
                    </div>

                    {/* Kuladeivam */}
                    <div style={{ paddingLeft: '8px', borderLeft: '4px solid #eab308' }}>
                       <span style={styles.detailLabel}>Kuladeivam</span>
                       <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', lineHeight: 1.625, color: '#1f2937' }}>{kuladeivam}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', paddingTop: '8px' }}>
                       {/* DOB */}
                       <div>
                          <div style={styles.iconRow}>
                             <Calendar size={12} color="#dc2626" />
                             <span style={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#000000', lineHeight: 1, paddingBottom: '12px' }}>DOB</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', paddingLeft: '4px', color: '#1f2937', }}>{dob}</span>
                       </div>
                       {/* Wedding */}
                       <div>
                          <div style={styles.iconRow}>
                             <Calendar size={12} color="#dc2626" />
                             <span style={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#000000', lineHeight: 1, paddingBottom: '12px' }}>Wedding</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', paddingLeft: '4px', color: '#1f2937' }}>{weddingDate}</span>
                       </div>
                    </div>

                    {/* Email */}
                    <div style={{ paddingTop: '8px', borderTop: '1px dashed #e5e7eb' }}>
                       <div style={styles.iconRow}>
                          <Mail size={12} color="#9ca3af"  />
                          <span style={styles.detailLabel}>Email</span>
                       </div>
                       <span style={{ fontSize: '12px', fontWeight: 'bold', wordBreak: 'break-all', color: '#1f2937' }}>{email}</span>
                    </div>

                    {/* Address */}
                    <div>
                       <div style={{ ...styles.iconRow, marginBottom: '8px' }}>
                          <MapPin size={12} color="#dc2626" />
                          <span style={styles.detailLabel}>Address</span>
                       </div>
                       <p style={{ fontSize: '10px', lineHeight: 1.625, fontWeight: 500, padding: '8px', borderRadius: '4px', border: '1px solid #f3f4f6', backgroundColor: '#f9fafb', color: '#4b5563', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                          {address}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Back Footer */}
              <div style={styles.websiteFooter}>
                 <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Globe size={10} color="rgba(255,255,255,0.6)" />
                    </div>
                    <span style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: '1', marginTop: '1px' , paddingBottom: '12px'}}>www.senguntharinbusiness.com</span>
                 </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Close
          </button>
          <button 
            onClick={handleDownload}
            disabled={downloading || !libLoaded}
            className="flex-1 py-2.5 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {downloading ? "Generating..." : (
              <>
                <Download size={16} /> Download ID Card
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdCardModal;