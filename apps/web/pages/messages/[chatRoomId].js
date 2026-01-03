import { useRouter } from "next/router";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiRequest, dateCategory } from "utils/Utilities";
// Socket.io removed
// import io from "socket.io-client";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { format } from "timeago.js";
import { IoIosSend, IoMdSearch } from "react-icons/io";
import Image from "next/image";
import withAuth from "@/core/withAuth";
import { socket } from "../user/user-list"; // Will be null
import NoImage from "assets/img/no-image.png";
import { IoIosArrowBack } from "react-icons/io";
import MessageSend from "assets/Send.svg";
import MessageSend2 from "assets/message_send2.png";
import { logout } from "@/modules/auth/authActions";

function ChatMessages({ ...props }) {
  const [currentChat, setCurrentChat] = React.useState(null);
  const user = useSelector((state) => state.authReducer.user);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState("");
  const [isActive, setActive] = useState(false);
  const router = useRouter();
  const scrollRef = useRef();
  const [chatLoading, setChatLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    socket.auth = { user: user };
    socket.connect();
    console.log("socket", socket.auth);
    socket.on("connect", () => {
      console.log("connected mobile", socket.connected);
    });
    socket.on("disconnect", (reason) => {
      console.log("socket disconnected reason", reason);
    });
    console.log("I am called");
  }, []);

  useEffect(() => {
    socket.on("connect_error", () => {
      console.log("connect_error");
      socket.auth = { user: user };
      socket.connect();
    });
  }, [!socket.connected]);

  useEffect(() => {
    if (router?.query?.chatRoomId) {
      setChatLoading(true);
      getChatHistory(router?.query?.chatRoomId);
      getConversations();
    }
    return () => {
      setChatLoading(false);
    };
  }, [router?.query]);

  useEffect(
    () => {
      // if (socket.connected) {
      console.log("socket request Accept Event", socket.connected);
      socket.on(`requestAccept-${user?._id}`, (message) => {
        console.log("requestAccept message", message);
        getConversations();
      });
      // }
    },
    [
      // socket.connected
    ]
  );

  useEffect(
    () => {
      // if (socket.connected) {
      console.log("socket request message mobile", socket.connected);
      socket.on(`request-${user?._id}`, (message) => {
        console.log("reqested message", message);
        getConversations();
      });
      // }
    },
    [
      // socket.connected
    ]
  );

  useEffect(
    () => {
      console.log("socket receiver message mobile", socket.connected);
      socket.on(`recieve-${user?._id}`, (message) => {
        console.log("reciever message", message);
        if (message.message == "") {
          return getConversations();
        }
        return setArrivalMessage({
          ...message,
          message: message.message,
          sender_id: message.sender_id,
          sent_time: Date.now(),
          room_id: message?.room_id,
          receiver_id: message?.receiver_id,
          _id: message?._id,
        });
      });
    },
    [
      // socket.connected
    ]
  );

  useEffect(() => {
    if (arrivalMessage && currentChat?._id === arrivalMessage?.room_id) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    if (arrivalMessage && conversations.length > 0) {
      console.log("coversation updated");
      const updatedConversations = conversations.map((conversation) => {
        if (
          conversation._id === arrivalMessage.room_id &&
          arrivalMessage?.message
        ) {
          return {
            ...conversation,
            message: arrivalMessage,
          };
        } else {
          return conversation;
        }
      });
      setConversations(updatedConversations);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    if (socket.connected) {
      socket.on(`requestBlock-${user?._id}`, (message) => {
        console.log("Blocked Chat", message);
        setCurrentChat((prev) => ({
          ...prev,
          status: message?.status,
        }));
      });
    }
  }, [socket.connected]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  useEffect(() => {
    if (currentChat && messages.length > 0 && socket.connected) {
      const messageData = messages[messages.length - 1];
      if (
        messageData?.sender_id !== user?._id &&
        !messageData?.read_date_time &&
        messageData?.room_id === currentChat?._id
      ) {
        // console.log("messageData", messageData);
        const data = {
          chatId: messageData?._id,
          recieverId: messageData?.receiver_id,
          senderId: messageData?.sender_id,
        };
        console.log("data", data);

        console.log("socket readMessage fired from chatRoom");
        socket.emit(`readMessage`, data);
        setConversations((prev) => {
          return prev.map((conversation) => {
            if (conversation._id === messageData?.room_id) {
              return {
                ...conversation,
                message: {
                  ...conversation.message,
                  read_date_time: Date.now(),
                },
              };
            } else {
              return conversation;
            }
          });
        });
      }
    }
  }, [messages, currentChat, socket.connected]);

  useEffect(() => {
    if (socket.connected) {
      console.log("socket read message called", socket.connected);
      socket.on(`readed-${user?._id}`, (message) => {
        console.log("message read", message);
        setConversations((prev) => {
          return prev.map((conversation) => {
            if (conversation?.message?._id === message?.id) {
              return {
                ...conversation,
                message: {
                  ...conversation.message,
                  read_date_time: Date.now(),
                },
              };
            } else {
              return conversation;
            }
          });
        });
      });
    }
  }, [socket.connected]);

  useEffect(
    () => {
      // if (socket.connected) {
      console.log("chat Room Cleared called", socket.connected);
      socket.on(`chatRoomCleared-${user?._id}`, (message) => {
        console.log("chatRoomCleared", message);
        if (message?.deleted) {
          setMessages([]);
          setArrivalMessage("");
          getConversations();
        }
      });
      // }
    },
    [
      // socket.connected
    ]
  );

  const toggleClass = () => {
    setActive(!isActive);
    // document.body.classList.toggle("open-sidebar");
  };

  const getChatHistory = async (chatRoomId) => {
    setChatLoading(true);
    try {
      const data = {
        chatRoomId: chatRoomId,
      };

      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-history`,
        params: data,
      });
      setMessages(res.data?.data?.chat);
    } catch (err) {
      console.log("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };
  const category = dateCategory.find(
    (item) =>
      item?.label === currentChat?.date_id?.standard_class_date ||
      item?.label === currentChat?.date_id?.middle_class_dates ||
      item?.label === currentChat?.date_id?.executive_class_dates
  );
  const getConversations = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-list`,
      });
      // console.log("res", res.data?.data?.chatRooms);
      const conversations =
        res.data?.data?.chatRooms.length > 0
          ? res.data?.data?.chatRooms.filter(
              (chat) => chat !== null && chat._id === router?.query?.chatRoomId
            )?.length > 0
            ? res.data?.data?.chatRooms.filter(
                (chat) =>
                  chat !== null && chat._id === router?.query?.chatRoomId
              )[0]
            : ""
          : "";
      setCurrentChat(conversations);
      setChatLoading(false);
    } catch (err) {
      console.log("err", err);
      setChatLoading(false);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  const blockChat = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
        recieverId: currentChat?.user?.id,
      };

      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/block`,
      });
      console.log("res", res);
      setCurrentChat((prev) => ({
        ...prev,
        status: res?.data?.data?.chatRoom?.status,
        blocked_by: {
          _id: user?._id,
        },
      }));
    } catch (err) {
      console.log("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  const unblockChat = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
        recieverId: currentChat?.user?.id,
      };

      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/unblock`,
      });
      console.log("res", res);
      if (res?.data?.message === "Accepted!!") {
        setCurrentChat(
          (prev) =>
            prev && {
              ...prev,
              status: 1,
            }
        );
      }
      getConversations();
      getChatHistory(currentChat?.message?.room_id);
    } catch (err) {
      console.log("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  const deleteChat = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
        recieverId: currentChat?.user?.id,
      };

      const res = await apiRequest({
        data: data,
        method: "DELETE",
        url: `chat/chat-clear`,
      });
      console.log("res", res);
      setMessages([]);
      setNewMessage("");
      setArrivalMessage("");
      getConversations();
    } catch (err) {
      console.log("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };
  const sendMessage = async (e) => {
    e.preventDefault();

    const data = {
      chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
      recieverId: currentChat?.user?.id ?? "",
      message: newMessage,
    };

    // console.log("socket.connected data", socket.connected, data);
    if (socket.connected) {
      setTimeout(() => {
        socket.emit("sendMessage", data);
      }, 500);
    }
    setMessages((prev) => [
      ...prev,
      {
        message: newMessage,
        sender_id: user?._id,
        sent_time: Date.now(),
      },
    ]);
    setNewMessage("");
  };

  // go to previous page
  const goBack = () => {
    router.back();
  };

  // console.log("currentChat", currentChat);
  console.log("socket connected message mobile", socket.connected);

  return (
    <div
      className="inner-page"
      onClick={() => {
        if (isActive) {
          setActive(false);
        }
      }}
    >
      <div className="inner-part-page">
        <div className="">
          <div className="message h-100">
            <div className="message-content-side">
              {currentChat &&
                (currentChat?.status === 1 || currentChat?.status === 2) && (
                  <div className="message-chat-wrap">
                    <div className="top-head message-header-dates">
                      <div className="user-thumb user-thumb-data">
                        <span onClick={goBack}>
                          <IoIosArrowBack
                            size={20}
                            color={"rgba(255, 255, 255, 0.7)"}
                            className="user-thumb-data-icon"
                          />
                        </span>
                        <div
                          className="d-flex me-auto"
                          onClick={() =>
                            router.push(
                              `/user/user-profile/${currentChat?.user?.user_name}`
                            )
                          }
                        >
                          <figure className="user_img_header">
                            <Image
                              src={
                                currentChat?.user?.images?.length > 0 &&
                                currentChat?.user?.images
                                  ? currentChat?.user?.images[0]
                                  : (user?.images && user?.images[0]) || NoImage
                              }
                              alt="user image"
                              width={32}
                              height={32}
                            />
                          </figure>
                          <span className="user-details">
                            <h3>{currentChat?.user?.user_name ?? ""}</h3>
                          </span>
                        </div>
                        <div className="">
                          <div className="action_btn_list">
                            <span onClick={toggleClass}>
                              <BiDotsHorizontalRounded
                                size={35}
                                color={"rgba(255, 255, 255, 0.7)"}
                              />
                            </span>
                            {isActive && (
                              <div
                                className="dropdown-list"
                                id="action_dropdown"
                              >
                                <ul>
                                  {currentChat?.status === 2 ? (
                                    currentChat?.blocked_by?._id ==
                                      user?._id && (
                                      <li
                                        onClick={() => unblockChat(currentChat)}
                                      >
                                        <a>Unblock</a>
                                      </li>
                                    )
                                  ) : (
                                    <li onClick={() => blockChat(currentChat)}>
                                      <a>Block</a>
                                    </li>
                                  )}
                                  <li onClick={() => deleteChat(currentChat)}>
                                    <a>Delete Conversation</a>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="message-header-dates-data">
                        <div className="tag_wrap">
                          <ul>
                            <li>
                              <span>{category?.icon}</span>
                              <span>{category?.label}</span>
                            </li>
                          </ul>
                        </div>
                        <h4 className="price_per_hour">
                          ${currentChat?.date_id?.price} /{" "}
                          <span>{currentChat?.date_id?.date_length}</span>
                        </h4>
                      </div>
                    </div>
                    <div className="chat_message_wrap">
                      <div className="message_list_wrap">
                        <ul className="chat_message_scroll">
                          {messages &&
                            messages.length > 0 &&
                            messages?.filter(
                              (message) => message?.message !== ""
                            ).length > 0 &&
                            messages
                              .filter((message) => message?.message !== "")
                              .map((message, index) => {
                                return (
                                  <li
                                    className={
                                      message.sender_id === user?._id
                                        ? "send"
                                        : "receive"
                                    }
                                    key={index}
                                    ref={scrollRef}
                                  >
                                    <div
                                      className={`message_content ${
                                        message.sender_id === user?._id
                                          ? "message_content_send"
                                          : "message_content_receive"
                                      }`}
                                    >
                                      <span className="message_time">
                                        {format(message?.sent_time)}
                                      </span>
                                      <span className="message_text">
                                        {message?.message}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                        </ul>
                      </div>
                      {currentChat?.status === 2 ? (
                        currentChat?.date_id?.is_blocked_by_admin ? (
                          <div className="text-center">
                            Admin has removed this date.
                          </div>
                        ) : currentChat?.blocked_by?._id == user?._id ? (
                          <div className="text-center">
                            User has been blocked
                          </div>
                        ) : (
                          <div className="text-center">
                            You have been blocked
                          </div>
                        )
                      ) : (
                        <div className="input_write_sec_message">
                          <div className="input_write_sec_message_mobile">
                            <input
                              type="text"
                              placeholder="Type your message here…"
                              onChange={(e) => setNewMessage(e.target.value)}
                              value={newMessage}
                              onKeyPress={(event) => {
                                event.key === "Enter" &&
                                  newMessage.trim() !== "" &&
                                  sendMessage(event);
                              }}
                            />
                            <button
                              type="button"
                              className="send_btn"
                              onClick={
                                newMessage.trim() !== ""
                                  ? sendMessage
                                  : undefined
                              }
                              disabled={newMessage.trim() === ""}
                              style={{
                                background: "transparent",
                              }}
                            >
                              {/* <IoIosSend
                                size={25}
                                color={
                                  newMessage.trim() === ""
                                    ? "#686868"
                                    : "#F24462"
                                }
                              /> */}
                              <Image
                                src={
                                  newMessage === "" ? MessageSend : MessageSend2
                                }
                                alt="send-btn"
                                width={25}
                                height={25}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ChatMessages);
