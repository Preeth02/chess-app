"use client";
import { authClient } from "@lib/auth-client";
import { useWebSocket } from "@lib/useWebSocket";
import React, { useEffect } from "react";

const page = () => {
  const { connected, sendMessage, lastMessage } = useWebSocket({
    url: "ws://localhost:8080",
    onOpen: () => console.log("Websocket connected successfully"),
    onMessage: (message: string) =>
      console.log("Message from socket: ", message),
    onError: (err: Event) => console.log("Message from socket: ", err),
  });
  
  //   const { data :session} = await authClient.getSession();
  useEffect(() => {
    if (!connected) {
      sendMessage(JSON.stringify({ type: "sample" }));
    }
  }, [connected, sendMessage]);

  return <div>UMM</div>;
};

export default page;
