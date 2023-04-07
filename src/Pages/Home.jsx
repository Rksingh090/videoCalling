import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSocket } from "../providers/SocketProvider";
import { useVideo } from "../providers/VideoProvider";

function Home() {
  const { myid } = useParams();
  const [onCall, setOnCall] = useState(false);
  const [URLParams, setURLPramams] = useSearchParams();
  const [room, setRoom] = useState("")

  const myVideoRef = useRef(null);
  const otherVideoRef = useRef(null);

  const { socket, sendJSON } = useSocket()
  const { peer, createOffer, createAnswer, setAnswer, localSDP, addIceCandidate } = useVideo()

  // start camera and push my video to myvideo srcObject 
  useEffect(() => {
    const getStreamAndAddTrack = async () => {
      // get stream 
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      // add track to peer  
      myVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    }
    getStreamAndAddTrack();
  }, [peer])


  // send new user 
  socket.onopen = (ev) => {
    sendJSON({
      type: "new-user",
      _id: myid
    })
  }


  const handleMessage = ({ data }) => {
    const jsondata = JSON.parse(data);
    switch (jsondata.type) {
      case "call":
        handleCallFromAUser(jsondata)
        break;
      case "get-ice":
        addIceCandidate(jsondata.candidate)
        break;
      case "offer":
        handleOffer(jsondata);
        break;
      case "answer":
        handleAnswer(jsondata);
        break;
      case "nego:offer":
        handleNegoOffer(jsondata);
        break;
      case "nego:answer":
        handleNegoAnswer(jsondata);
        break;
      default:
        break;
    }
  };

  const handleCallFromAUser = (jsondata) => {
    setRoom(jsondata.from);
    setOnCall(true)
  }

  const handleOffer = async (jsondata) => {
    const { sdp, from, to } = jsondata;
    const answer = await createAnswer(sdp);
    sendJSON({
      type: "answer",
      to: from,
      sdp: answer,
      from: to
    })
  };


  const handleAnswer = async (jsondata) => {
    const { sdp, from } = jsondata;
    console.log(sdp, from)

    await setAnswer(sdp);
  }

  const handleNegoOffer = async (jsondata) => {
    const { sdp } = jsondata;
    console.log("Nego offer", sdp);

    if (sdp === null) return;
    await setAnswer(sdp);
    sendJSON({
      type: "nego:answer",
      sdp: localSDP,
      to: room
    })
  }


  const handleNegoAnswer = async (jsondata) => {
    const { sdp } = jsondata;
    console.log("Nego answer", sdp);
    if (sdp === null) return;
    await setAnswer(sdp);
  }


  useEffect(() => {
    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage)
  }, [socket, handleMessage]);



  const handleNegotiation = () => {
    if (localSDP === null || localSDP === undefined) return;
    sendJSON({
      type: "nego:offer",
      sdp: localSDP,
      to: room
    });
  };


  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => peer.removeEventListener("negotiationneeded", handleNegotiation)
  }, [peer, handleNegotiation])

  const handleTrack = async (event) => {
    const [remoteStream] = event.streams;
    otherVideoRef.current.srcObject = remoteStream;
  }

  
  useEffect(() => {
    peer.addEventListener('track', handleTrack)
    return () => peer.removeEventListener('track', handleTrack)
  }, [peer, handleTrack])
  
  const handleIce = (ev) => {
    if(ev.candidate){
      console.log("candidate");
      sendJSON({
        type:"send-ice",
        to: room,
        from: myid,
        candidate: ev.candidate
      })
    }
  }

  useEffect(() => {
    peer.addEventListener('icecandidate', handleIce)
    return () => peer.removeEventListener('icecandidate', handleIce)
  }, [peer, handleIce])
  // my cs func 
  const handleRecieveCall = async () => {
    const offer = await createOffer();
    sendJSON({
      type: "offer",
      to: room,
      sdp: offer,
      from: myid
    })
  }

  return (
    <div>
      <video className="myVideo" ref={myVideoRef} autoPlay={true} playsInline={true} ></video>
      <video className="myVideo" ref={otherVideoRef} autoPlay={true} playsInline={true} ></video>

      {onCall && <button onClick={() => handleRecieveCall()}>Receive Call</button>}
      <br />
      <button onClick={() => sendJSON({type: "video-call", from: "sunny", to: "rishab"})}>Call to Rishab</button>
      <button onClick={() => sendJSON({type: "video-call", from: "rishab",  to: "sunny"})}>Call to Sunny</button>

    </div>
  );
}

export default Home;
