"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, SendHorizonal } from "lucide-react";
import { io } from "socket.io-client";

// Utility function to capitalize each word
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Utility function to format date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Utility function to format time without seconds and in 12-hour format
const formatTime = (timeStr) => {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

const ChatWindow = ({ selectedChat, handleBack }) => {
  const [messages, setMessages] = useState(selectedChat.message);
  const [newMessage, setNewMessage] = useState("");
  const [showAvailabilityFooter, setShowAvailabilityFooter] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false); // New state to avoid rapid re-renders

  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const footerRef = useRef(null); // Ref for availability footer
  const hasScrolledToBottom = useRef(false);

  useEffect(() => {
    // Establish socket connection
    socket.current = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

    // Listen for incoming messages
    socket.current.on("messageReceived", (data) => {
      if (
        data.artistId === selectedChat.artistId &&
        data.contact === selectedChat.clientContact
      ) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
        hasScrolledToBottom.current = false; // Set to false to scroll when new message is received
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.current.disconnect();
    };
  }, [selectedChat]);

  useEffect(() => {
    setMessages(selectedChat.message);
    const lastMessage = selectedChat.message[selectedChat.message.length - 1];
    if (
      lastMessage &&
      lastMessage.isSenderMe &&
      lastMessage.content.startsWith("Category")
    ) {
      setShowAvailabilityFooter(true);
    } else {
      setShowAvailabilityFooter(false);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!hasScrolledToBottom.current) {
      if (showAvailabilityFooter && footerRef.current) {
        footerRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
      hasScrolledToBottom.current = true; // Prevent future scrolling
    }

    // Check if the user is on mobile to prevent focusing the input
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      inputRef.current.focus(); // Only focus input if not on mobile
    }
  }, [messages, showAvailabilityFooter]);

  const formatMessageContent = (content) => {
    return content
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line, index) => {
        if (line.startsWith("Date: ")) {
          return (
            <p key={index}>
              {capitalizeWords(line.split(": ")[0])}:{" "}
              {formatDate(line.split(": ")[1])}
            </p>
          );
        }
        return <p key={index}>{capitalizeWords(line)}</p>;
      });
  };

  const handleSendMessage = async (response = null) => {
    let messageContent = newMessage.trim();
    if (response) {
      messageContent = response;
    }
    if (messageContent) {
      const messageData = {
        contact: selectedChat.clientContact,
        artistId: selectedChat.artistId,
        message: {
          content: messageContent,
          time: new Date().toISOString(),
          isSenderMe: false,
          isUnread: false,
        },
      };

      // Emit the message through Socket.io
      socket.current.emit("sendMessage", messageData);

      setMessages([
        ...messages,
        {
          content: messageContent,
          time: new Date().toISOString(),
          isSenderMe: false,
        },
      ]);
      setNewMessage("");
      setShowAvailabilityFooter(false); // Hide the availability footer after sending a response
      setIsProcessingResponse(false); // Reset processing flag
      hasScrolledToBottom.current = false; // Reset scroll flag to scroll when new message is sent
    }
  };

  const handleAvailabilityResponse = (response) => {
    if (!isProcessingResponse) {
      setIsProcessingResponse(true); // Prevent multiple responses being processed
      if (response === "Yes") {
        handleSendMessage(
          "Yes, I am available for the event. Kindly proceed with further booking steps."
        );
      } else {
        handleSendMessage("Sorry, I am not available on this date.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-300 flex items-center">
        <button className="md:hidden mr-2" onClick={handleBack}>
          <ChevronLeft />
        </button>
        <div className="flex items-center">
          <div>
            <h2 className="text-lg font-semibold pl-2">
              {selectedChat.clientId}
            </h2>
          </div>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${
              message.isSenderMe ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                message.isSenderMe
                  ? "bg-gray-300 text-black"
                  : " bg-primary text-white"
              }`}
            >
              <div>{formatMessageContent(message.content)}</div>
              <span className="block text-xs mt-1 text-right">
                {formatTime(message.time.$date || message.time)}
              </span>
            </div>
            {index === messages.length - 1 && (
              <div ref={messagesEndRef} /> // Attach ref to the last message
            )}
          </div>
        ))}
        {showAvailabilityFooter && (
          <div ref={footerRef} className="p-3 bg-gray-200 text-center">
            <p className="text-sm">Are You Available?</p>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded-lg mx-2"
              onClick={() => handleAvailabilityResponse("Yes")}
            >
              Yes
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-lg mx-2"
              onClick={() => handleAvailabilityResponse("No")}
            >
              No
            </button>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-300 flex items-center space-x-2">
        <input
          type="text"
          className="flex-grow p-2 border rounded-lg"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          ref={inputRef}
        />
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg"
          onClick={handleSendMessage}
        >
          <SendHorizonal />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
