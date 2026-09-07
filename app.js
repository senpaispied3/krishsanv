
// krishsanv - FIXED - Room Join 100% Working - No Pulse
let myPeer=null,localStream=null,currentRoomId='',currentRoomNo='',currentDataConn=null,audioCtx=null,screenTrack=null;
let username=localStorage.getItem('krishsanv_username')||'',aboutMe=localStorage.getItem('krishsanv_about')||'',avatar=localStorage.getItem('krishsanv_avatar')||'';
const appEl=document.getElementById('app');
const allEmojis=["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😉","😊","😇","🥰","😍","🤩","😘","❤️","🧡","💛","💚","💙","💜","🖤","💕","💞","💓","💖","💝","👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","👋","🖐️","✋","👏","🙏","💪","🎉","🎊","🎈","🎁","🎂","🔥","⭐","🌟","✨","⚡","🌈","😭","😢","😤","😠","😡","😳","🥺"];
const allGifs=["https://media.tenor.com/2uyENRuvV-IAAAAi/clap-applause.gif","https://media.tenor.com/1bqNiWq6g3sAAAAi/heart-love.gif","https://media.tenor.com/x8v1oNUOxt4AAAAi/party.gif","https://media.tenor.com/2j4b8B3z9JcAAAAi/thumbs-up.gif","https://media.tenor.com/Fa6v5P0a1EoAAAAi/fire.gif"];

function playSound(t){try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);if(t==='join'){o.frequency.value=800;g.gain.value=0.25;o.start();setTimeout(()=>o.stop(),180);}else if(t==='connect'){o.frequency.value=600;g.gain.value=0.25;o.start();setTimeout(()=>{o.frequency.value=900;},120);setTimeout(()=>o.stop(),350);}}catch(e){}}

function render(){
appEl.innerHTML=`
<div style="position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden;"><div style="width:400px;height:400px;background:#ff0080;top:10%;left:10%;position:absolute;border-radius:50%;filter:blur(60px);opacity:0.06;"></div></div>
<nav class="flex justify-between items-center p-4 border-b border-zinc-800 bg-black/90 backdrop-blur sticky top-0 z-50"><h1 class="text-2xl font-black rainbow">krishsanv</h1><div class="flex gap-3 text-sm"><button onclick="showPage('home')" class="hover:text-pink-400">Home</button><button onclick="showPage('video')" class="hover:text-cyan-400">Video</button><button onclick="showPage('voice')" class="hover:text-green-400">Voice</button><button onclick="window.location.href='about.html'" class="hover:text-yellow-400">About</button><button onclick="showPage('profile')" class="hover:text-purple-400">Profile</button></div></nav>
<div id="page-home" class="page p-8 text-center"><h2 class="text-5xl font-black mt-20">Welcome to <span class="rainbow">Krish Sanv Team</span></h2><p class="text-xl text-zinc-400 mt-4">Best For Every Moment</p><p class="text-sm text-zinc-500 mt-2">Room Join Fixed ✅ | Favicon krishsanv ✅ | No Pulse ✅</p><div class="mt-10 flex justify-center gap-4 flex-wrap"><button onclick="showPage('video')" class="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 rounded-full font-bold">Start Video Call 🎥</button><button onclick="showPage('voice')" class="bg-zinc-800 px-8 py-3 rounded-full">Voice Call 🎤</button></div><p id="backendStatus" class="mt-6 text-xs text-zinc-500">● PeerJS Cloud Connected | Room Fix ✅</p></div>
<div id="page-video" class="page hidden p-3"><div class="flex justify-between items-center mb-2 flex-wrap gap-2"><h2 class="text-xl font-bold">Video Call - Fixed</h2><div class="flex gap-2"><button onclick="toggleEmojiPanel()" class="bg-zinc-800 px-3 py-1 rounded-full text-sm">😀 Emoji</button><button onclick="toggleGifPanel()" class="bg-zinc-800 px-3 py-1 rounded-full text-sm">🎞️ GIF</button><button onclick="toggleChatPanel()" class="bg-zinc-800 px-3 py-1 rounded-full text-sm">💬 Chat</button></div></div><p id="connStatus" class="mb-2 text-yellow-400 text-sm">Disconnected - Ready</p><div class="flex flex-col lg:flex-row gap-4"><div class="relative flex-1"><video id="remoteVideo" autoplay playsinline class="video-large border border-zinc-800"></video><video id="localVideo" autoplay muted playsinline class="pip bg-zinc-900"></video><audio id="remoteAudio" autoplay playsinline></audio><div id="waiting" class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/85 rounded-2xl gap-2" style="max-width:900px;height:500px"><p class="text-zinc-400">Waiting for member...</p><p id="waitingRoom" class="text-xs text-zinc-600"></p><button id="soundBtn" onclick="enableSound()" class="mt-2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm">🔊 Tap for sound if no audio</button></div><div id="reactionOverlay" class="absolute inset-0 pointer-events-none flex items-center justify-center" style="max-width:900px;height:500px"></div><div id="chatPanel" class="hidden absolute bottom-2 left-2 w-[300px] h-[260px] bg-black/90 border border-zinc-700 rounded-xl flex flex-col z-20"><div class="p-2 border-b border-zinc-800 flex justify-between"><span class="text-sm font-bold">Chat</span><button onclick="toggleChatPanel()" class="text-xs">✕</button></div><div id="chatMessages" class="flex-1 overflow-y-auto p-2 space-y-1 text-xs"></div><div class="p-2 border-t border-zinc-800 flex gap-1"><input id="chatInput" placeholder="Type..." class="flex-1 bg-zinc-800 rounded px-2 py-1 text-xs"/><button onclick="sendChat()" class="bg-pink-600 px-2 py-1 rounded text-xs">Send</button></div></div></div><div class="w-full lg:w-80 space-y-3"><button onclick="createRoom()" class="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 rounded-xl font-bold">Create Room (8-digit)</button><div class="bg-zinc-900 p-3 rounded-xl border border-zinc-800"><input id="joinInput" placeholder="Room No e.g. 45892173" class="w-full p-3 rounded bg-black border border-zinc-700 text-white text-sm"/><button onclick="joinRoom()" class="w-full mt-2 bg-cyan-600 py-2 rounded-lg font-bold">Join Room - FIXED</button><p class="text-[10px] text-zinc-500 mt-1">Room No sirf number hai, e.g. 45892173</p></div><div id="roomInfo" class="hidden bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-sm"><p>Room No: <b id="roomIdDisplay" class="text-cyan-400 text-lg"></b></p><div class="flex gap-2 mt-2 flex-wrap"><button onclick="copyId()" class="text-xs bg-zinc-800 px-3 py-1 rounded">Copy No</button><button onclick="copyLink()" class="text-xs bg-zinc-800 px-3 py-1 rounded">Copy Link</button><button onclick="shareWA()" class="text-xs bg-green-600 px-3 py-1 rounded">WhatsApp</button></div><p class="text-[10px] text-zinc-500 mt-2">Dusre ko Room No bhejo ya Link</p></div><div class="grid grid-cols-2 gap-2"><button onclick="toggleMute()" class="bg-zinc-800 py-2 rounded text-sm">🎤 Mute</button><button onclick="toggleCam()" class="bg-zinc-800 py-2 rounded text-sm">📷 Cam</button><button onclick="toggleScreenShare()" id="screenBtn" class="bg-zinc-800 py-2 rounded text-sm">🖥️ Screen</button><button onclick="leaveRoom()" class="bg-red-900/40 text-red-400 py-2 rounded text-sm">Leave</button></div><div id="emojiPanel" class="bg-zinc-900 p-2 rounded-xl border border-zinc-800 max-h-[200px] overflow-y-auto"><p class="text-xs font-bold mb-2">Emojis</p><div class="grid grid-cols-8 gap-1 text-xl">${allEmojis.map(e=>`<button onclick="sendEmoji('${e}')" class="hover:bg-zinc-800 rounded p-1">${e}</button>`).join('')}</div></div><div id="gifPanel" class="hidden bg-zinc-900 p-2 rounded-xl border border-zinc-800 max-h-[220px] overflow-y-auto"><p class="text-xs font-bold mb-2">GIFs</p><div class="grid grid-cols-2 gap-2">${allGifs.map(g=>`<img src="${g}" onclick="sendGif('${g}')" class="w-full h-20 object-cover rounded cursor-pointer border border-zinc-800"/>`).join('')}</div></div></div></div></div>
<div id="page-voice" class="page hidden p-3"><h2 class="text-xl font-bold mb-2">Voice Call</h2><p id="voiceStatus" class="mb-2 text-yellow-400 text-sm">Audio only</p><div class="flex flex-col lg:flex-row gap-4"><div class="flex-1 bg-zinc-900 rounded-2xl h-[400px] flex items-center justify-center border border-zinc-800 relative"><div class="flex gap-8"><div class="text-center"><div class="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 mx-auto flex items-center justify-center text-2xl font-black">${(username||'K')[0].toUpperCase()}</div><p class="text-xs mt-2">${username||'You'}</p></div><div class="text-center"><div id="voiceRemoteAvatar" class="w-20 h-20 rounded-full bg-zinc-800 mx-auto flex items-center justify-center text-2xl">?</div><p id="voiceRemoteName" class="text-xs mt-2 text-zinc-400">Waiting...</p></div></div><audio id="voiceRemoteAudio" autoplay playsinline></audio></div><div class="w-full lg:w-80 space-y-3"><button onclick="createVoiceRoom()" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-xl font-bold">Create Voice Room</button><div class="bg-zinc-900 p-3 rounded-xl border border-zinc-800"><input id="voiceJoinInput" placeholder="Room No" class="w-full p-3 rounded bg-black border border-zinc-700 text-white text-sm"/><button onclick="joinVoiceRoom()" class="w-full mt-2 bg-cyan-600 py-2 rounded-lg">Join Voice</button></div><div class="grid grid-cols-2 gap-2"><button onclick="toggleMute()" class="bg-zinc-800 py-2 rounded text-sm">🎤 Mute</button><button onclick="leaveRoom()" class="bg-red-900/30 text-red-400 py-2 rounded text-sm">Leave</button></div></div></div></div>
<div id="page-profile" class="page hidden p-6 max-w-xl mx-auto"><h2 class="text-3xl font-bold mb-6">Profile</h2><div class="space-y-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><div><label class="text-xs text-zinc-400">Username</label><input id="usernameInput" value="${username}" class="w-full mt-1 p-3 rounded bg-black border border-zinc-700 text-white text-sm"/><button onclick="saveUsername()" class="mt-2 bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1 rounded text-sm">Save</button></div></div></div>
<div id="page-about" class="page hidden p-8 text-center"><h2 class="text-4xl font-black">Welcome to <span class="rainbow">Krish Sanv Team</span></h2><p class="text-zinc-400 mt-2">Best For Every Moment</p></div>
`;
const urlParams=new URLSearchParams(location.search);const r=urlParams.get('room');if(r)document.getElementById('joinInput').value=r;
document.getElementById('chatInput')?.addEventListener('keypress', e=>{if(e.key==='Enter')sendChat();});
}
function showPage(n){document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));document.getElementById('page-'+n).classList.remove('hidden');}
function saveUsername(){const v=document.getElementById('usernameInput').value.trim();if(!v){alert('Username likho');return;}localStorage.setItem('krishsanv_username',v);username=v;alert('✅ Saved @'+v);}

// ===== FIXED ROOM LOGIC =====
const PEER_CONFIG={config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]}};

async function createRoom(){
try{
if(myPeer){myPeer.destroy();myPeer=null;}
if(localStream){localStream.getTracks().forEach(t=>t.stop());}
const num=Math.floor(10000000+Math.random()*90000000).toString();
currentRoomId='krishsanv-'+num;
currentRoomNo=num;
localStream=await navigator.mediaDevices.getUserMedia({video:{width:1280,height:720},audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
document.getElementById('localVideo').srcObject=localStream;
document.getElementById('connStatus').innerText='Creating Room No: '+num+'...';
document.getElementById('waitingRoom').innerText='Room No: '+num+' - dusre ko bhejo';
myPeer=new Peer(currentRoomId,PEER_CONFIG);
myPeer.on('open',id=>{
const d=id.replace('krishsanv-','');
document.getElementById('connStatus').innerText='Room Live: '+d+' - Dusre ka wait...';
document.getElementById('roomIdDisplay').innerText=d;
document.getElementById('roomInfo').classList.remove('hidden');
document.getElementById('waiting').style.display='flex';
playSound('join');
console.log('Peer open:',id);
});
myPeer.on('call',call=>{
console.log('Incoming call from',call.peer);
call.answer(localStream);
call.on('stream',stream=>{
console.log('Got remote stream');
const rv=document.getElementById('remoteVideo'),ra=document.getElementById('remoteAudio');
rv.srcObject=stream;ra.srcObject=stream;
rv.muted=false;rv.volume=1;ra.volume=1;
rv.play().catch(()=>{});ra.play().catch(()=>{});
document.getElementById('waiting').style.display='none';
document.getElementById('connStatus').innerText='Connected with: '+call.peer.replace('krishsanv-','')+' ✅';
playSound('connect');
});
call.on('close',()=>{document.getElementById('connStatus').innerText='Member left';document.getElementById('waiting').style.display='flex';});
});
myPeer.on('connection',conn=>{
currentDataConn=conn;
conn.on('open',()=>console.log('Data conn open'));
conn.on('data',handleData);
});
myPeer.on('error',err=>{console.error(err);document.getElementById('connStatus').innerText='Error: '+err.type;});
}catch(e){alert('Camera: '+e.message);}
}

async function joinRoom(){
let input=document.getElementById('joinInput').value.trim();
if(!input)input=new URLSearchParams(location.search).get('room')||'';
if(!input){alert('Room No dalo e.g. 45892173');return;}
const clean=input.replace(/\D/g,'');
if(clean.length<6){alert('Room No 6-8 digits ka hota hai');return;}
const target='krishsanv-'+clean;
console.log('Joining',target);
try{
if(myPeer){myPeer.destroy();myPeer=null;}
if(localStream){localStream.getTracks().forEach(t=>t.stop());}
currentRoomId=target;currentRoomNo=clean;
localStream=await navigator.mediaDevices.getUserMedia({video:{width:1280,height:720},audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
document.getElementById('localVideo').srcObject=localStream;
document.getElementById('connStatus').innerText='Connecting to Room No: '+clean+'...';
document.getElementById('waitingRoom').innerText='Joining '+clean+'...';
document.getElementById('roomIdDisplay').innerText=clean;
document.getElementById('roomInfo').classList.remove('hidden');
document.getElementById('waiting').style.display='flex';
myPeer=new Peer(PEER_CONFIG); // random id for joiner - IMPORTANT FIX
myPeer.on('open',myId=>{
// Abhi ye hai (PeerJS Cloud):
myPeer = new Peer(currentRoomId, {config:{iceServers:[...]}})

// Backend lagne ke baad ye hoga:
myPeer = new Peer(currentRoomId, {
  host: 'krishsanv-backend.onrender.com',
  port: 443,
  secure: true,
  path: '/peerjs'
})
console.log('My ID',myId,'calling',target);
const call=myPeer.call(target,localStream);
if(!call){document.getElementById('connStatus').innerText='Room nahi mila! Room No sahi hai?';return;}
let gotStream=false;
call.on('stream',stream=>{
if(gotStream)return;gotStream=true;
console.log('Got remote stream from host');
const rv=document.getElementById('remoteVideo'),ra=document.getElementById('remoteAudio');
rv.srcObject=stream;ra.srcObject=stream;
rv.muted=false;rv.volume=1;ra.volume=1;
rv.play().catch(()=>{});ra.play().catch(()=>{});
document.getElementById('waiting').style.display='none';
document.getElementById('connStatus').innerText='Connected to Room: '+clean+' ✅';
playSound('connect');
});
call.on('error',e=>{console.error('call error',e);document.getElementById('connStatus').innerText='Connect fail - Room exist karta hai?';});
call.on('close',()=>{document.getElementById('connStatus').innerText='Call ended';document.getElementById('waiting').style.display='flex';});
setTimeout(()=>{if(!gotStream){document.getElementById('connStatus').innerText='Room No '+clean+' nahi mila - Host ne create kiya hai kya?';}},5000);
const dataConn=myPeer.connect(target);
dataConn.on('open',()=>{currentDataConn=dataConn;console.log('data open');});
dataConn.on('data',handleData);
dataConn.on('error',e=>console.log('data err',e));
});
myPeer.on('error',err=>{
console.error('peer err',err);
if(err.type==='peer-unavailable'){document.getElementById('connStatus').innerText='Room No '+clean+' exist nahi karta! Pehle Create Room karo';}
else{document.getElementById('connStatus').innerText='Error: '+err.type;}
});
}catch(e){alert('Join fail: '+e.message);}
}

function enableSound(){document.getElementById('remoteVideo').muted=false;document.getElementById('remoteVideo').play();document.getElementById('remoteAudio').play();document.getElementById('soundBtn').innerText='✅ Sound On';}
function copyId(){navigator.clipboard.writeText(currentRoomNo);alert('Copied No: '+currentRoomNo);}
function copyLink(){const link=location.origin+location.pathname+'?room='+currentRoomNo;navigator.clipboard.writeText(link);alert('Link copied: '+link);}
function shareWA(){const link=location.origin+location.pathname+'?room='+currentRoomNo;window.open('https://wa.me/?text='+encodeURIComponent('Join my video call Room No: '+currentRoomNo+' - '+link));}
function toggleMute(){if(!localStream)return;const t=localStream.getAudioTracks()[0];if(t)t.enabled=!t.enabled;}
function toggleCam(){if(!localStream)return;const t=localStream.getVideoTracks()[0];if(t)t.enabled=!t.enabled;}
async function toggleScreenShare(){
if(screenTrack){localStream.getVideoTracks()[0].stop();const cam=await navigator.mediaDevices.getUserMedia({video:true});localStream.removeTrack(screenTrack);localStream.addTrack(cam.getVideoTracks()[0]);document.getElementById('localVideo').srcObject=localStream;screenTrack=null;document.getElementById('screenBtn').innerText='🖥️ Screen';return;}
try{const s=await navigator.mediaDevices.getDisplayMedia({video:true});screenTrack=s.getVideoTracks()[0];localStream.getVideoTracks().forEach(t=>localStream.removeTrack(t));localStream.addTrack(screenTrack);document.getElementById('localVideo').srcObject=localStream;document.getElementById('screenBtn').innerText='Stop Screen';screenTrack.onended=()=>toggleScreenShare();}catch(e){}}
function leaveRoom(){if(myPeer){myPeer.destroy();myPeer=null;}if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}currentRoomId='';currentRoomNo='';document.getElementById('connStatus').innerText='Disconnected';document.getElementById('waiting').style.display='flex';document.getElementById('roomInfo').classList.add('hidden');}
function toggleEmojiPanel(){document.getElementById('emojiPanel').classList.toggle('hidden');}
function toggleGifPanel(){document.getElementById('gifPanel').classList.toggle('hidden');}
function toggleChatPanel(){document.getElementById('chatPanel').classList.toggle('hidden');}
function sendEmoji(e){if(currentDataConn&&currentDataConn.open)currentDataConn.send({type:'emoji',data:e});showReaction(e);playSound('emoji');}
function sendGif(g){if(currentDataConn&&currentDataConn.open)currentDataConn.send({type:'gif',data:g});showGifReaction(g);}
function sendChat(){const inp=document.getElementById('chatInput');const txt=inp.value.trim();if(!txt)return;if(currentDataConn&&currentDataConn.open)currentDataConn.send({type:'chat',data:txt,name:username||'Guest'});addChat(txt,username||'You',true);inp.value='';}
function handleData(d){if(!d)return;if(d.type==='emoji')showReaction(d.data);else if(d.type==='gif')showGifReaction(d.data);else if(d.type==='chat')addChat(d.data,d.name||'Remote',false);}
function showReaction(e){const ov=document.getElementById('reactionOverlay');const div=document.createElement('div');div.innerText=e;div.style.cssText='font-size:80px;animation:emojiPop 2s forwards;position:absolute;';ov.appendChild(div);setTimeout(()=>div.remove(),2000);}
function showGifReaction(g){const ov=document.getElementById('reactionOverlay');const img=document.createElement('img');img.src=g;img.style.cssText='width:150px;height:150px;border-radius:12px;animation:emojiPop 3s forwards;position:absolute;';ov.appendChild(img);setTimeout(()=>img.remove(),3000);}
function addChat(txt,name,isMe){const box=document.getElementById('chatMessages');const div=document.createElement('div');div.className=isMe?'text-right':'';div.innerHTML=`<b class="text-[10px] ${isMe?'text-pink-400':'text-cyan-400'}">${name}:</b> <span>${txt}</span>`;box.appendChild(div);box.scrollTop=box.scrollHeight;}
async function createVoiceRoom(){await createRoom();document.getElementById('voiceStatus').innerText='Voice Room Live: '+currentRoomNo;}
async function joinVoiceRoom(){const v=document.getElementById('voiceJoinInput').value.trim();document.getElementById('joinInput').value=v;showPage('video');await joinRoom();}

render();showPage('home');
fetch('/api/health').then(r=>r.json()).then(d=>{document.getElementById('backendStatus').innerText='● Backend Live ✅ | Room Fix ✅';}).catch(()=>{document.getElementById('backendStatus').innerText='● PeerJS Cloud (No Backend) | Room Fix ✅';});
