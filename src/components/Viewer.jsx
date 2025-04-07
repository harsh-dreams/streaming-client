import React, { useEffect, useRef } from 'react';
import socket from '../socket';

const VideoViewer = () => {
  const videoRef = useRef(null);
  const currentUrlRef = useRef(null);

  useEffect(() => {
    const handleChunk = (chunk) => {
      // Clean up old blob URL
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }

      const blob = new Blob([chunk], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      currentUrlRef.current = url;

      const video = videoRef.current;
      if (video) {
        video.src = url;
        video.load(); // Important
        video.play(); // Try to autoplay
      }
    };

    socket.on('watch-chunk', handleChunk);

    return () => {
      socket.off('watch-chunk', handleChunk);
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
      }
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} controls width="640" height="360" />
    </div>
  );
};

export default VideoViewer;
