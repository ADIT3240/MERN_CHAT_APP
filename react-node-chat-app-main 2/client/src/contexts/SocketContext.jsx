import { SOCKET_HOST } from "@/lib/constants";
import { useAppStore } from "@/store";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      const socketInstance = io(SOCKET_HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
        transports: ['websocket', 'polling'],
        upgrade: true,
        secure: true,
        rejectUnauthorized: false // Only for development
      });

      socketInstance.on("connect", () => {
        console.log("Connected to socket server");
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      socket.current = socketInstance;

      const handleReceiveMessage = (message) => {
        // Access the latest state values
        const {
          selectedChatData: currentChatData,
          selectedChatType: currentChatType,
          addMessage,
          addContactInDMContacts,
        } = useAppStore.getState();

        if (
          currentChatType !== undefined &&
          (currentChatData._id === message.sender._id ||
            currentChatData._id === message.recipient._id)
        ) {
          addMessage(message);
        }
        addContactInDMContacts(message);
      };

      const handleReceiveChannelMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addChannelInChannelLists,
        } = useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }
        addChannelInChannelLists(message);
      };

      const addNewChannel = (channel) => {
        const { addChannel } = useAppStore.getState();
        addChannel(channel);
      };

      // Store references to the event handlers for cleanup
      const receiveMessageHandler = (message) => handleReceiveMessage(message);
      const receiveChannelMessageHandler = (message) => handleReceiveChannelMessage(message);
      const newChannelHandler = (channel) => addNewChannel(channel);

      // Add event listeners
      socket.current.on("receiveMessage", receiveMessageHandler);
      socket.current.on("recieve-channel-message", receiveChannelMessageHandler);
      socket.current.on("new-channel-added", newChannelHandler);

      // Cleanup function
      return () => {
        if (socket.current) {
          // Remove all event listeners
          socket.current.off("receiveMessage", receiveMessageHandler);
          socket.current.off("recieve-channel-message", receiveChannelMessageHandler);
          socket.current.off("new-channel-added", newChannelHandler);
          
          // Disconnect the socket
          socket.current.disconnect();
          socket.current = null;
          console.log("Socket disconnected and cleaned up");
        }
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
