export const createPeerConnection = (socket, isBroadcaster, roomId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
  
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { 
          target: isBroadcaster ? roomId : socket.id,
          candidate: event.candidate 
        });
      }
    };
  
    return peerConnection;
  };
  
  export const startBroadcasting = async (socket, roomId, videoRef) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
  
    socket.emit('create-room', roomId);
  
    const peerConnection = createPeerConnection(socket, true, roomId);
  
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  
    socket.on('viewer-joined', async (viewerId) => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
  
      socket.emit('offer', { viewerId, offer });
    });
  
    socket.on('answer', async (answer) => {
      await peerConnection.setRemoteDescription(answer);
    });
  };
  
  export const joinStream = async (socket, roomId, videoRef) => {
    socket.emit('join-room', roomId);
  
    const peerConnection = createPeerConnection(socket, false, roomId);
  
    peerConnection.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
    };
  
    socket.on('offer', async (offer) => {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
  
      socket.emit('answer', { broadcasterId: roomId, answer });
    });
  
    socket.on('ice-candidate', async (candidate) => {
      await peerConnection.addIceCandidate(candidate);
    });
  };
  