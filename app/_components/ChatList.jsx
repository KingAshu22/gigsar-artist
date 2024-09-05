"use client";

import React, { useEffect, useState } from "react";

// Helper function to truncate message content
const truncateMessage = (message, maxLength = 30) => {
  if (message.length > maxLength) {
    return message.substring(0, maxLength) + "...";
  }
  return message;
};

const formatTime = (timeStr) => {
  const date = new Date(timeStr);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() ===
    date.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-GB");
  }
};

const ChatList = ({ setSelectedChat, chats }) => {
  const getLastMessage = (messages) => {
    return messages[messages.length - 1];
  };

  // Sort chats based on the timestamp of the last message
  const sortedChats = [...chats].sort((a, b) => {
    const lastMessageA = getLastMessage(a.message);
    const lastMessageB = getLastMessage(b.message);
    const timeA = new Date(lastMessageA.time);
    const timeB = new Date(lastMessageB.time);
    return timeB - timeA; // Sort in descending order
  });

  return (
    <div className="bg-gray-100 border-r border-gray-300 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      <ul>
        {sortedChats.map((chat) => {
          const lastMessage = getLastMessage(chat.message);
          const isUnread = lastMessage.isUnread;
          const combinedName = `${chat.clientId}`;

          return (
            <li
              key={`${chat.artistId}-${chat.clientId}`}
              className="p-4 border-b border-gray-300 hover:bg-gray-200 cursor-pointer flex items-center"
              onClick={() => setSelectedChat(chat)}
            >
              <div className="flex-grow">
                <h3 className="text-md font-medium">{combinedName}</h3>
                <p className="text-sm text-gray-600">
                  {truncateMessage(lastMessage.content)}
                </p>
              </div>
              <div className="flex items-center">
                {isUnread && (
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                )}
                <span className="text-xs text-gray-400 pt-8">
                  {formatTime(lastMessage.time)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatList;
