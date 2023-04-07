import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import { VideoProvider } from "./providers/VideoProvider";
import { SocketProvider } from "./providers/SocketProvider";

function App() {
  return (
    <SocketProvider>
      <VideoProvider>
        <Routes>
          <Route path="/:myid" element={<Home />} />
          <Route path="/call/:id" element={<Home />} />
        </Routes>
      </VideoProvider>
    </SocketProvider>
  );
}

export default App;
