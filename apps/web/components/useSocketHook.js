import { useRef } from "react";

// TODO: Replace with Supabase Realtime channel subscriptions
// See: apps/web/services/supabase-chat.js

const useSocket = () => {
  const socketRef = useRef();
  socketRef.current = null;
  return socketRef.current;
};

export default useSocket;
