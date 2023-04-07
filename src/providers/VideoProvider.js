import React, { createContext, useContext, useMemo, useState } from 'react'

export const VideoContext = createContext();


export const useVideo = () => {
  return useContext(VideoContext)
};

export const VideoProvider = ({ children }) => {
  const [localSDP, setLocalSDP] = useState(null);
  const [remoteSDP, setRemoteSDP] = useState(null);

  const peer = useMemo(() => new RTCPeerConnection({
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
      }
    ]
  }), []);

  const createOffer = async () => {
    const offer = await peer.createOffer({
      offerToReceiveVideo: true,
      iceRestart: true,
      offerToReceiveAudio: true
    });
    peer.setLocalDescription(offer);
    setLocalSDP(offer);
    return offer;
  }

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    setRemoteSDP(offer);
    
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer)
    setLocalSDP(answer)
    return answer;
  }

  const setAnswer = async (answer) => {
    await peer.setRemoteDescription(answer);
    setRemoteSDP(answer);
  }

  const addIceCandidate = async (candidate) => {
    console.log(candidate)
    await peer.addIceCandidate(new RTCIceCandidate(candidate))
  }

  return (
    <VideoContext.Provider value={{ peer, createOffer, createAnswer, localSDP, remoteSDP, setAnswer, addIceCandidate }} >
      {children}
    </VideoContext.Provider>
  )
}
