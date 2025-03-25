import React, { useEffect, useRef } from 'react';
import socket from '../socket';
import { useParams } from 'react-router-dom';

const Viewer = () => {
  const videoRef = useRef();
  const { roomId } = useParams();
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const queue = useRef([]);
  const isAppending = useRef(false); // To prevent multiple appends

  useEffect(() => {
    const videoElement = videoRef.current;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    const handleSourceOpen = () => {
      console.log('MediaSource opened');

      const mimeCodec = 'video/webm; codecs=vp8'; 
      
      if (mediaSource.sourceBuffers.length === 0) {
        const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
        sourceBufferRef.current = sourceBuffer;

        sourceBuffer.addEventListener('updateend', () => {
          isAppending.current = false;

          // Append remaining chunks from the queue
          if (queue.current.length > 0 && !sourceBuffer.updating) {
            appendNextChunk();
          }
        });
      }

      socket.on('watch-chunk', (chunk) => {
        console.log("39");
        if (mediaSource.readyState === 'open') {
          console.log("41");
          if (!sourceBufferRef.current.updating && !isAppending.current) {
            try {
              console.log('Appending chunk directly...');
              sourceBufferRef.current.appendBuffer(new Uint8Array(chunk));
              isAppending.current = true;
            } catch (error) {
              console.error('AppendBuffer error:', error);
              queue.current.push(new Uint8Array(chunk)); // Queue on error
            }
          } else {
            console.log('Queuing chunk...');
            queue.current.push(new Uint8Array(chunk));
          }
        }
      });
    };

    // Function to append next chunk from queue
    const appendNextChunk = () => {
      if (queue.current.length > 0 && !sourceBufferRef.current.updating) {
        const nextChunk = queue.current.shift();
        try {
          sourceBufferRef.current.appendBuffer(nextChunk);
          isAppending.current = true;
        } catch (error) {
          console.error('Failed to append chunk from queue:', error);
        }
      }
    };

    mediaSource.addEventListener('sourceopen', handleSourceOpen);

    videoElement.src = URL.createObjectURL(mediaSource);

    return () => {
      socket.off('watch-chunk');
      mediaSource.removeEventListener('sourceopen', handleSourceOpen);
      if (mediaSourceRef.current) {
        mediaSourceRef.current = null;
      }
    };
  }, [roomId]);

  return (
    <div>
      <h1>Watch Stream</h1>
      <video ref={videoRef} autoPlay playsInline controls />
    </div>
  );
};

export default Viewer;
