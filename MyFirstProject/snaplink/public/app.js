// Main application script for SnapLink PWA

document.addEventListener('DOMContentLoaded', () => {
  console.log('SnapLink PWA initialized');
  
  // Check if running in Capacitor
  const isCapacitor = window.Capacitor && window.Capacitor.isNative;
  console.log('Running in Capacitor:', isCapacitor);
  
  // Initialize UI
  initializeUI();
  
  // Register service worker for PWA functionality
  registerServiceWorker();
});

function initializeUI() {
  const root = document.getElementById('root');
  
  // Replace loading screen with app UI
  setTimeout(() => {
    root.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>SnapLink</h1>
          <div class="camera-button">📷</div>
        </header>
        
        <main class="app-content">
          <section class="widgets-section">
            <h2>Live Widgets</h2>
            <div class="widgets-grid">
              <div class="widget-item">
                <div class="widget-placeholder">Friend 1</div>
                <div class="widget-time">Just now</div>
              </div>
              <div class="widget-item">
                <div class="widget-placeholder">Friend 2</div>
                <div class="widget-time">5m ago</div>
              </div>
            </div>
          </section>
          
          <section class="challenge-section">
            <div class="challenge-card">
              <h3>Daily Challenge</h3>
              <p>What's your workspace looking like today?</p>
              <button class="challenge-button">Respond Now</button>
            </div>
          </section>
          
          <section class="snaps-section">
            <h2>Recent Snaps</h2>
            <div class="snap-card">
              <div class="snap-header">
                <div class="snap-avatar"></div>
                <div class="snap-user-info">
                  <div class="snap-username">Sarah</div>
                  <div class="snap-timestamp">30m ago</div>
                </div>
              </div>
              <div class="snap-content">
                <div class="snap-placeholder">Photo content</div>
              </div>
              <div class="snap-footer">
                <div class="expiration-tag">Disappears soon</div>
                <div class="reaction-count">2 👍</div>
              </div>
            </div>
          </section>
        </main>
        
        <footer class="app-footer">
          <div class="tab-item active">
            <div class="tab-icon">🏠</div>
            <div class="tab-label">Home</div>
          </div>
          <div class="tab-item">
            <div class="tab-icon">👥</div>
            <div class="tab-label">Friends</div>
          </div>
          <div class="tab-item">
            <div class="tab-icon">👤</div>
            <div class="tab-label">Profile</div>
          </div>
        </footer>
      </div>
    `;
    
    // Add event listeners
    document.querySelector('.camera-button').addEventListener('click', () => {
      alert('Camera functionality would open here');
    });
    
    document.querySelector('.challenge-button').addEventListener('click', () => {
      alert('Challenge response would open here');
    });
    
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        alert(`Navigating to ${tab.querySelector('.tab-label').textContent} tab`);
      });
    });
  }, 1000);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
}
