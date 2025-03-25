import React, { useEffect, useRef, useState } from 'react';
import socket from '../socket';
import { useParams } from 'react-router-dom';


const Broadcast = () => {
  const videoRef = useRef();
  const {roomId}= useParams();
  const [started, setStarted]=useState(false);
  const [stop,setStop]=useState(false);

let stream;
 
useEffect(()=>{

  let mediaRecorder;

  const initial=async()=>{
   stream = await navigator.mediaDevices.getUserMedia({  
    video: true,  
    audio: true,  
  });  
  videoRef.current.srcObject = stream; 
}


  const startStream = async() => {
     stream = await navigator.mediaDevices.getUserMedia({  
        video: true,  
        audio: true,  
      });  
      videoRef.current.srcObject = stream; 

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          socket.emit('stream-chunk', {
            roomId,
            chunk: event.data,
          });
        }
      };

      mediaRecorder.start(500); 


  };
  initial();
  if(started){
  startStream();
  }

  const stopStreaming = () => {
    mediaRecorder?.stop();
  };

  if(stop){
    stopStreaming();
  };
},[roomId,started]);


  return (
    <div>
      <h1>Broadcast Room</h1>
      <video ref={videoRef} autoPlay playsInline muted />
      <button onClick={()=>setStarted(true)}>Start Stream</button>
    </div>
  );
};


export default Broadcast;
