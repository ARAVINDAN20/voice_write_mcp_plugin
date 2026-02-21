/**
 * VoiceWrite Premium Overlay
 * 
 * Provides:
 * - Visual status indicator (Pulse animation)
 * - Mute control (Click / Alt+J)
 * - Audio playback engine
 */
export const OVERLAY_SCRIPT = `
(function() {
  if (window.voiceWriteInstalled) return;
  window.voiceWriteInstalled = true;

  // --- Configuration ---
  const CONFIG = {
    size: '56px',
    colorOn: 'rgba(255, 59, 48, 0.9)', // Apple Red
    colorSpeaking: 'rgba(255, 69, 58, 1)', // Bright Red
    colorOff: 'rgba(142, 142, 147, 0.6)', // Muted Gray
    position: { bottom: '24px', right: '24px' },
    zIndex: '2147483647'
  };

  // --- State ---
  window.voiceWriteMuted = false;
  window.voiceWriteSpeaking = false;

  // --- UI Creation ---
  
  // 1. Container
  const container = document.createElement('div');
  container.id = 'voicewrite-overlay';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: CONFIG.position.bottom,
    right: CONFIG.position.right,
    width: CONFIG.size,
    height: CONFIG.size,
    borderRadius: '50%',
    backgroundColor: CONFIG.colorOn,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    zIndex: CONFIG.zIndex,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
    userSelect: 'none'
  });

  // 2. Pulse Animation Style
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes voicewrite-pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(255, 59, 48, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
    }
    .voicewrite-speaking {
      animation: voicewrite-pulse 2s infinite;
      background-color: \${CONFIG.colorSpeaking} !important;
      transform: scale(1.05);
    }
    #voicewrite-tooltip {
      position: absolute;
      right: 70px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    #voicewrite-overlay:hover #voicewrite-tooltip {
      opacity: 1;
    }
  \`;
  document.head.appendChild(style);

  // 3. Icon (Speaker SVG)
  const icon = document.createElement('div');
  icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
  container.appendChild(icon);

  // 4. Tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'voicewrite-tooltip';
  tooltip.textContent = 'VoiceWrite (Alt+J)';
  container.appendChild(tooltip);

  document.body.appendChild(container);

  // --- Audio Player Logic ---
  window.playVoiceWriteAudio = async (base64Audio) => {
    console.log('[VoiceWrite] playVoiceWriteAudio called, muted:', window.voiceWriteMuted);
    
    if (window.voiceWriteMuted) {
      console.log('[VoiceWrite] Audio muted, skipping playback');
      return;
    }

    // Set Speaking State
    window.voiceWriteSpeaking = true;
    container.classList.add('voicewrite-speaking');
    console.log('[VoiceWrite] Starting audio playback...');

    try {
      // Edge TTS returns MP3, so use audio/mpeg
      const response = await fetch('data:audio/mpeg;base64,' + base64Audio);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      console.log('[VoiceWrite] Audio created, blob size:', blob.size, 'bytes');

      // Ensure playback
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('[VoiceWrite] ✅ Audio playing successfully'))
          .catch(error => {
            console.error('[VoiceWrite] ❌ Auto-play prevented:', error);
          });
      }

      audio.onended = () => {
        console.log('[VoiceWrite] ✅ Audio playback completed');
        URL.revokeObjectURL(url);
        window.voiceWriteSpeaking = false;
        container.classList.remove('voicewrite-speaking');
      };
      
      audio.onerror = (e) => {
        console.error('[VoiceWrite] ❌ Audio error:', e);
        window.voiceWriteSpeaking = false;
        container.classList.remove('voicewrite-speaking');
      };

      // Safety timeout in case onended fails
      setTimeout(() => {
         if (window.voiceWriteSpeaking) {
             console.log('[VoiceWrite] ⏰ Safety timeout triggered');
             window.voiceWriteSpeaking = false;
             container.classList.remove('voicewrite-speaking');
         }
      }, 15000);

    } catch (e) {
      console.error('[VoiceWrite] ❌ Playback Error:', e);
      window.voiceWriteSpeaking = false;
      container.classList.remove('voicewrite-speaking');
    }
  };

  // --- Interaction Logic ---
  function toggleMute() {
    window.voiceWriteMuted = !window.voiceWriteMuted;
    
    if (window.voiceWriteMuted) {
        container.style.backgroundColor = CONFIG.colorOff;
        container.style.transform = 'scale(0.9)';
        container.style.opacity = '0.7';
        icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
    } else {
        container.style.backgroundColor = CONFIG.colorOn;
        container.style.transform = 'scale(1)';
        container.style.opacity = '1';
        icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
    }
  }

  container.addEventListener('click', toggleMute);

  // --- Keyboard Shortcut (Alt + J) ---
  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'j' || e.key === 'J')) {
      toggleMute();
      e.preventDefault(); 
    }
  });

  console.log('[VoiceWrite] Premium Overlay Active.');
})();
`;
