// let socket: WebSocket | null = null;

// export function getSocket(): WebSocket {
//   if (!socket) {
//     socket = new WebSocket("ws://localhost:8080");
//     socket.onopen = () => {
//       console.log("WebSocket connected");
//     };

//     socket.onmessage = (event) => {
//       console.log("Message received:", event.data);
//     };

//     socket.onclose = () => {
//       console.log("WebSocket closed");
//       socket = null; // allow reconnect on next getSocket()
//     };
//   }
//   return socket;
// }

import { useEffect, useState, useRef } from "react";

type UseWebSocketOptions = {
  url: string;
  onMessage?: (data: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
};

export function useWebSocket({
  url,
  onClose,
  onError,
  onMessage,
  onOpen,
}: UseWebSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      onOpen?.();
    };

    socket.onmessage = (message) => {
      setLastMessage(message.data);
      onMessage?.(message.data);
    };
    socket.onclose = () => {
      setConnected(false);
      onClose?.();
    };
    socket.onerror = (err: Event) => {
      onError?.(err);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [url]);
  const sendMessage = (message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("Websocket not open .Message not sent: ", message);
    }
  };

  return {
    socket: socketRef,
    connected,
    lastMessage,
    sendMessage,
  };
}
