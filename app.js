
// krishsanv - Connected to Render Backend
// FIX 1: Auto close / reload rokne ke liye
window.addEventListener('beforeunload', (e) => {
  // Agar call chal rahi hai toh confirm pucho
  if (typeof isInCall !== 'undefined' && isInCall) {
    e.preventDefault();
    e.returnValue = 'Call chal rahi hai - band karna hai?';
  }
});

// FIX 2: Peer disconnect auto reconnect
let reconnectAttempts = 0;

function setupPeerFixes() {
  if(typeof peer !== 'undefined' && peer) {
    peer.on('disconnected', () => {
      console.log('Disconnected - reconnecting...');
      if(reconnectAttempts < 5) {
        setTimeout(() => {
          peer.reconnect();
          reconnectAttempts++;
        }, 1000);
      }
    });

    peer.on('close', () => {
      console.log('Connection closed');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err.type);
      // Site band mat karo - sirf error dikhao
      if(err.type === 'network' || err.type === 'server-error') {
        setTimeout(() => peer.reconnect(), 2000);
      }
    });
  }
}

// Page load pe setup karo
window.addEventListener('load', setupPeerFixes);

// FIX 3: Button se form submit rokna (auto band hone ka main reason)
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    if(!btn.type) btn.type = 'button'; // Auto type fix
  });

  // Form submit rokna
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Page reload rokega
      return false;
    });
  });
});
let currentRoomId = null;
let localStream = null;
let remoteStream = null;
let myPeer = null;
let currentCall = null;

const ROOM_ID_LENGTH = 8;

// RENDER BACKEND URL
const BACKEND_URL = 'https://krishsanv-backend.onrender.com';
const PEER_HOST = 'krishsanv-backend.onrender.com';

console.log('krishsanv - Connecting to Render Backend:', BACKEND_URL);

// Generate Room ID
function generateRoomId() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Show Room
function showRoomId(id) {
  const roomDisplay = document.getElementById('roomIdDisplay');
  const roomCode = document.getElementById('roomCode');
  if (roomDisplay && roomCode) {
    roomCode.textContent = id;
    roomDisplay.style.display = 'block';
  }
  currentRoomId = id;
  // Update URL for sharing
  const newUrl = window.location.origin + '?room=' + id;
  window.history.pushState({}, '', newUrl);
}

// Create Room
async function createRoom() {
  const roomId = generateRoomId();
  showRoomId(roomId);
  await startCall(roomId, true);
  
  // Save to backend
  try {
    fetch(BACKEND_URL + '/api/rooms', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({roomId: roomId, created: new Date()})
    });
  } catch(e) { console.log('Backend save optional'); }
  
  return roomId;
}

// Join Room - FIXED
async function joinRoom(roomIdInput) {
  let roomId = roomIdInput || document.getElementById('roomInput')?.value?.trim();
  
  if (!roomId || roomId.length < 4) {
    alert('Valid Room No dalo bhai!');
    return;
  }
  
  roomId = roomId.replace(/[^0-9]/g, '').substring(0, ROOM_ID_LENGTH);
  
  if (roomId.length < 4) {
    alert('Room No galat hai!');
    return;
  }
  
  showRoomId(roomId);
  await startCall(roomId, false);
}

// Start Call - CONNECTED TO RENDER
async function startCall(roomId, isCreator) {
  try {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) statusEl.textContent = 'Connecting to Render...';
    
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 }, 
      audio: true 
    });
    
    const localVideo = document.getElementById('localVideo');
    if (localVideo) {
      localVideo.srcObject = localStream;
    }
    
    // TRY Render Backend First, Fallback to PeerJS Cloud
    try {
      myPeer = new Peer(roomId, {
        host: PEER_HOST,
        port: 443,
        secure: true,
        path: '/peerjs',
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });
      console.log('Trying Render Peer Server...');
    } catch (e) {
      console.log('Render failed, using Cloud:', e);
      myPeer = new Peer(roomId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });
    }
    
    myPeer.on('open', (id) => {
      console.log('My Peer ID:', id);
      if (statusEl) statusEl.textContent = isCreator ? 'Room Created - Waiting...' : 'Joining...';
    });
    
    myPeer.on('call', async (call) => {
      console.log('Incoming call');
      currentCall = call;
      call.answer(localStream);
      
      call.on('stream', (stream) => {
        remoteStream = stream;
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
          remoteVideo.srcObject = stream;
          if (statusEl) statusEl.textContent = 'Connected ✅';
        }
      });
      
      call.on('close', () => {
        if (statusEl) statusEl.textContent = 'Call Ended';
      });
      
      call.on('error', (err) => {
        console.error('Call error:', err);
        if (statusEl) statusEl.textContent = 'Connection Error - Retrying...';
      });
    });
    
    myPeer.on('error', (err) => {
      console.error('Peer error:', err);
      // Fallback to Cloud if Render fails
      if (err.type === 'peer-unavailable' && !isCreator) {
        setTimeout(() => {
          console.log('Retrying...');
          if (statusEl) statusEl.textContent = 'Connecting...';
          const call = myPeer.call(roomId, localStream);
          handleOutgoingCall(call, statusEl);
        }, 1000);
      }
    });
    
    if (!isCreator) {
      setTimeout(() => {
        const call = myPeer.call(roomId, localStream);
        handleOutgoingCall(call, statusEl);
      }, 1000);
    }
    
  } catch (err) {
    console.error('Start call error:', err);
    alert('Camera/Mic permission do bhai! ' + err.message);
  }
}

function handleOutgoingCall(call, statusEl) {
  if (!call) return;
  currentCall = call;
  
  call.on('stream', (stream) => {
    remoteStream = stream;
    const remoteVideo = document.getElementById('remoteVideo');
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
      if (statusEl) statusEl.textContent = 'Connected ✅';
    }
  });
  
  call.on('close', () => {
    if (statusEl) statusEl.textContent = 'Call Ended';
  });
  
  call.on('error', (err) => {
    console.error('Outgoing call error:', err);
  });
}

// Auto join from URL
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get('room');
  if (roomFromUrl) {
    const input = document.getElementById('roomInput');
    if (input) input.value = roomFromUrl;
    setTimeout(() => joinRoom(roomFromUrl), 1000);
  }
});

// Expose globally
window.createRoom = createRoom;
window.joinRoom = joinRoom;
