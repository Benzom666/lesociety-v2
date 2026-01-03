import { useEffect, useRef } from "react";
// Socket.io removed - this hook is deprecated
// import io from "socket.io-client";

const useSocket = () => {
  const socketRef = useRef();

  // Socket.io removed - return null
  socketRef.current = null;

  return socketRef.current;
};

export default useSocket;
