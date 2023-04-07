import React, { createContext, useContext, useMemo } from 'react'
import { WS_URL } from '../constant/Constant';

export const SocketContext = createContext();
export const useSocket = () => {
    return useContext(SocketContext);
}
export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => new WebSocket(`${WS_URL}/ws/video`), [])

    const sendJSON = (JSONdata) => {
        socket.send(JSON.stringify(JSONdata));
    }

    return (
        <SocketContext.Provider value={{socket, sendJSON}}>
            {children}
        </SocketContext.Provider>
    )
}
