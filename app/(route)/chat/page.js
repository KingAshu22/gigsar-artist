"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import ChatList from "@/app/_components/ChatList";
import ChatWindow from "@/app/_components/ChatWindow";
import getProfilePic from "@/app/helpers/profilePic";

const ArtistChat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [profilePics, setProfilePics] = useState({});
  const router = useRouter();
  const pathname = usePathname();
  const [artistId, setArtistId] = useState("");

  const getArtistId = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/artist/contact/+${localStorage.getItem(
        "mobile"
      )}`
    );

    setArtistId(response.data.linkid);
  };

  useEffect(() => {
    getArtistId();
  }, []);

  useEffect(() => {
    getArtistMessages();

    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

    socket.on("newMessage", (newMessageData) => {
      if (newMessageData.artistId === artistId) {
        updateChats(newMessageData);
      }
    });

    socket.on("messageReceived", (data) => {
      if (data.artistId === artistId) {
        setChats((prevChats) => {
          const chatExists = prevChats.find(
            (chat) =>
              chat.clientId === data.clientId && chat.artistId === data.artistId
          );

          if (chatExists) {
            return prevChats.map((chat) =>
              chat.clientId === data.clientId && chat.artistId === data.artistId
                ? {
                    ...chat,
                    message: [...chat.message, data.message],
                    lastMessage: data.message,
                  }
                : chat
            );
          } else {
            return [
              {
                artistId: data.artistId,
                clientId: data.clientId,
                message: [data.message],
                lastMessage: data.message,
              },
              ...prevChats,
            ];
          }
        });

        if (selectedChat && selectedChat.artistId === data.artistId) {
          setSelectedChat((prevSelectedChat) => ({
            ...prevSelectedChat,
            message: [...prevSelectedChat.message, data.message],
          }));
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedChat, artistId]);

  const getArtistMessages = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/artist-get-messages/${artistId}`
      );

      if (response.data) {
        const formattedChats = formatChats(response.data.artistMessages);
        setChats(formattedChats);
      }
    } catch (error) {
      console.error("Error fetching artist messages:", error);
    }
  };

  const formatChats = (artistMessages) => {
    const chatData = [];

    artistMessages.forEach((client) => {
      client.messages.forEach((messageGroup) => {
        const { artistId, message } = messageGroup;
        const lastMessage = message[message.length - 1];

        chatData.push({
          artistId,
          clientId: client.clientId,
          clientName: client.clientName,
          clientContact: client.clientContact,
          clientEmail: client.clientEmail,
          message,
          lastMessage,
        });
      });
    });

    return chatData.sort(
      (a, b) => new Date(b.lastMessage.time) - new Date(a.lastMessage.time)
    );
  };

  useEffect(() => {
    const fetchProfilePics = async () => {
      const picPromises = chats.map(async (chat) => {
        const { name, profilePic } = await getProfilePic(chat.artistId);
        return { artistId: chat.artistId, name, profilePic };
      });

      const pics = await Promise.all(picPromises);
      const picMap = pics.reduce((acc, { artistId, name, profilePic }) => {
        acc[artistId] = { name, profilePic };
        return acc;
      }, {});

      setProfilePics(picMap);
    };

    fetchProfilePics();
  }, [chats]);

  // Check if there's a clientId in the URL and set the selected chat
  useEffect(() => {
    const clientIdInPath = pathname.split("/chat/")[1];
    if (clientIdInPath) {
      const foundChat = chats.find((chat) => chat.clientId === clientIdInPath);
      if (foundChat) {
        setSelectedChat(foundChat);
      }
    }
  }, [pathname, chats]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    router.push(`/chat/${chat.clientId}`);
  };

  const handleBack = () => {
    setSelectedChat(null);
    router.push("/chat");
  };

  return (
    <div className="flex h-dvh">
      <div
        className={`w-full md:w-1/3 ${
          selectedChat ? "hidden md:block" : "block"
        }`}
      >
        <ChatList
          setSelectedChat={handleChatSelect}
          chats={chats}
          profilePics={profilePics}
        />
      </div>
      <div
        className={`w-full md:w-2/3 ${
          selectedChat ? "block" : "hidden md:block"
        }`}
      >
        {selectedChat && (
          <ChatWindow
            selectedChat={selectedChat}
            handleBack={handleBack}
            profilePic={profilePics[selectedChat.artistId]?.profilePic}
          />
        )}
      </div>
    </div>
  );
};

export default ArtistChat;
