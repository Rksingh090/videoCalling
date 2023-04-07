import React, { createContext, useContext, useMemo } from 'react'

export const SocketContext = createContext();
export const useSocket = () => {
    return useContext(SocketContext);
}
export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => new WebSocket("ws://192.168.1.4:4000/ws/video"), [])

    const sendJSON = (JSONdata) => {
        socket.send(JSON.stringify(JSONdata));
    }

    return (
        <SocketContext.Provider value={{socket, sendJSON}}>
            {children}
        </SocketContext.Provider>
    )
}
