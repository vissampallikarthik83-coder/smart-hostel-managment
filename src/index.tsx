import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const boot = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("HostelX Fatal: #root not found.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("HostelX: System Uplink Successful.");
  } catch (error) {
    console.error("HostelX Boot Failure:", error);
    rootElement.innerHTML = `
      <div style="background: #000; color: #ff3333; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Orbitron', sans-serif; text-align: center; padding: 20px;">
        <h1 style="font-size: 2rem; border-bottom: 2px solid #ff3333; padding-bottom: 10px; margin-bottom: 20px;">CRITICAL_BOOT_FAILURE</h1>
        <p style="font-family: monospace; max-width: 600px; opacity: 0.8;">
          ${error instanceof Error ? error.message : String(error)}
        </p>
        <button onclick="window.location.reload()" style="margin-top: 30px; background: #ff3333; color: #000; border: none; padding: 12px 24px; font-weight: bold; cursor: pointer; text-transform: uppercase;">Retry Sync</button>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}