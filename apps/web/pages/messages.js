import React, { useState, useEffect, useRef } from "react";
import HeaderLoggedIn from "core/loggedInHeader";
import Footer from "core/footer";
import { Inputs } from "../core";
import { Field, reduxForm } from "redux-form";
import validate from "modules/auth/forms/validate/validate";
import { IoIosSend, IoMdSearch } from "react-icons/io";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Image from "next/image";
import UserImg from "assets/img/userimg.jpg";
import UserImg2 from "assets/img/profile.png";
import UserImg3 from "assets/img/user-3.png";
import UserImg4 from "assets/img/user-4.png";
import NoImage from "assets/img/no-image.png";
import SubHeading from "@/core/SubHeading";
import Link from "next/link";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FiChevronRight } from "react-icons/fi";
import withAuth from "../core/withAuth";
// Socket.io removed
import { useDispatch, useSelector } from "react-redux";
import { apiRequest, dateCategory } from "utils/Utilities";
import { format } from "timeago.js";

import UserCardListForMessage from "./../core/UserCardListForMessage";
import { useRouter } from "next/router";
import useWindowSize from "utils/useWindowSize";
// TODO: Implement Supabase Realtime for chat messages
import NoConversationShowView from "@/modules/messages/NoConversationShowView";
import MessageMobileHeader from "./../core/MessageMobileHeader";
import MessageSend from "assets/Send.svg";
import MessageSend2 from "assets/message_send2.png";
import { logout } from "@/modules/auth/authActions";
import moment from "moment";
import StarIcon from "../assets/request star.png";

const Messages = (props) => {
  const {
    handleSubmit,
    invalid,
    previousPage,
    pristine,
    reset,
    submitting,
    touched,
  } = props;

  const [isActive, setActive] = useState(false);
  const user = useSelector((state) => state.authReducer.user);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState("");
  const scrollRef = useRef();
  const [chatModal, setChatModal] = useState(false);
  const [search, setSearch] = useState("");
  const { width } = useWindowSize();
  const mobile = width < 768;
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  // for notification
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.auth = { user: user };
    socket.connect();
    console.log("socket", socket.auth);
    socket.on("connect", () => {
      console.log("connected", socket.connected);
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

  // useEffect(() => {
  // setTimeout(() => {
  //   socket.close();
  // }, 10000);
  // }, []);

  useEffect(() => {
    getConversations();
  }, [user]);

  useEffect(
    () => {
      console.log("socket request Accept Event", socket.connected);
      socket.on(`requestAccept-${user?._id}`, (message) => {
        console.log("requestAccept message", message);
        getConversations();
      });
    },
    [
      // socket.connected
    ]
  );

  useEffect(
    () => {
      console.log("socket request message will", socket.connected);
      socket.on(`request-${user?._id}`, (message) => {
        console.log("reqested message", message);
        getConversations();
      });
    },
    [
      // socket.connected
    ]
  );

  const customFormat = (date, normalDate) => {
    const now = moment(); // Current date and time
    const diff = now.diff(date, "hours"); // Time difference in hours

    if (diff < 24) {
      return format(normalDate); // Use relative time format
    } else {
      return date.format("DD/MM/YYYY"); // Full date format: DD/MM/YYYY
    }
  };

  const getChatHistoryConversation = async (chatRoomId) => {
    console.log("chatRoomId", chatRoomId);
    try {
      const data = {
        chatRoomId: chatRoomId,
      };

      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-history`,
        params: data,
      });

      console.log("res", res);

      if (res?.data?.data?.chat?.length > 1) {
        const chat = res?.data?.data?.chat[0];
        console.log("first", chat);
        setConversations((prev) => {
          return prev.map((conversation) => {
            if (conversation._id === chat?.room_id) {
              console.log(
                "conversation._id === chat?.room_id",
                conversation._id === chat?.room_id
              );
              return {
                ...conversation,
                message: { ...chat },
              };
            } else {
              return conversation;
            }
          });
        });
      }
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

  useEffect(
    () => {
      console.log("socket receiver message will", socket.connected);
      socket.on(`recieve-${user?._id}`, (message) => {
        console.log("reciever message", message);
        if (message.message == "") {
          // getChatHistoryConversation(message?.room_id);
          // getConversations();
          // setConversations((prev) => {
          //   const index = prev.findIndex((item) => item._id === message?.room_id);
          //   prev[index].status = 1;
          //   return [...prev];
          // });
          return;
        } else {
          return setArrivalMessage({
            ...message,
            message: message.message,
            sender_id: message.sender_id,
            sent_time: Date.now(),
            room_id: message?.room_id,
            receiver_id: message?.receiver_id,
            _id: message?._id,
          });
        }
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
        getConversations();
      });
    }
  }, [socket.connected]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  useEffect(() => {
    if (currentChat) {
      setChatLoading(true);
      getChatHistory(currentChat);
    }
  }, [currentChat]);

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
          getConversations();
        }
      });
      // }
    },
    [
      // socket.connected
    ]
  );

  useEffect(() => {
    console.log("Notif socket connected", socket.connected);
    // socket.on("connect", () => {
    //   console.log(socket.id);
    // });
    socket.on(`push-notification-${user.email}`, (message) => {
      console.log("notif received", message);
      const unc = message?.notifications?.filter(
        (item) => item.status === 0 && item.type !== "notification"
      ).length;
      localStorage.setItem("unreadNotifCount", JSON.stringify(unc));
      setCount(unc);
    });
  }, [socket.connected]);
  // Fuctions

  //  show message time
  const showTime = (time) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const hours12 = hours % 12 || 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return hours12 + ":" + minutesStr + " " + ampm;
  };

  // if message is more 20 character then show only 20 character and add ...
  const showText = (text) => {
    if (text?.length > 20) {
      return text.substring(0, 20) + "...";
    } else {
      return text;
    }
  };

  const toggleChat = (currentChat) => {
    // setChatModal(true);
    router.push(`messages/${currentChat?._id}`);
  };

  const getConversations = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-list`,
      });
      // console.log("res", res.data?.data?.chatRooms);
      const conversations =
        res.data?.data?.chatRooms.length > 0
          ? res.data?.data?.chatRooms.filter((chat) => chat !== null)
          : [];
      setConversations(conversations);
      setLoading(false);
    } catch (err) {
      setLoading(false);
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
    // e.preventDefault();

    const data = {
      chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
      recieverId: currentChat?.user?.id ?? "",
      message: newMessage,
    };

    socket.connect();

    if (socket.connected) {
      setTimeout(() => {
        console.log(
          "socket.connected:->",
          socket.connected,
          " data ->",
          data,
          " active ->",
          socket.active,
          " disconnected ->",
          socket.disconnected,
          " id ->",
          socket.id,
          " connection ->",
          socket.connect()
        );

        socket.emit("sendMessage", data);
      }, 100);
    }
    setMessages((prev) => [
      ...prev,
      {
        message: newMessage,
        sender_id: user?._id,
        sent_time: Date.now(),
      },
    ]);
    setConversations((prev) => {
      return prev.map((conversation) => {
        if (conversation._id === currentChat?._id) {
          return {
            ...conversation,
            message: {
              sent_time: Date.now(),
              message: newMessage,
              sender_id: user?._id,
              receiver_id: currentChat?.user?.id,
              room_id: currentChat?.message?.room_id ?? conversation?._id,
            },
          };
        } else {
          return conversation;
        }
      });
    });
    // getChatHistory(currentChat);
    setNewMessage("");
  };

  const tabIndexChange = (index) => {
    setSelectedTabIndex(index);
    if (index === 1) {
      setCurrentChat();
    }
  };

  const getChatHistory = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id ?? currentChat?._id,
      };

      const res = await apiRequest({
        method: "GET",
        url: `chat/chatroom-history`,
        params: data,
      });
      setMessages(res.data?.data?.chat);
      setChatLoading(false);
    } catch (err) {
      setChatLoading(false);
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

  const blockChat = async (currentChat) => {
    try {
      const data = {
        chatRoomId: currentChat?.message?.room_id,
        recieverId: currentChat?.user?.id,
      };

      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/block`,
      });
      console.log("res", res);
      if (res?.data?.message === "Accepted!!") {
        setCurrentChat(
          (prev) =>
            prev && {
              ...prev,
              status: 2,
              blocked_by: {
                ...prev.blocked_by,
                _id: user?._id,
              },
            }
        );
      }
      getConversations();

      getChatHistory(currentChat);
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
        chatRoomId: currentChat?.message?.room_id,
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
      getChatHistory(currentChat);
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
        chatRoomId: currentChat?.message?.room_id,
        recieverId: currentChat?.user?.id,
      };
      console.log("deletechat data", data);

      const res = await apiRequest({
        data: data,
        method: "DELETE",
        url: `chat/chat-clear`,
      });
      console.log("res", res);
      setMessages([]);
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

  const sidbarCloseOutsideClick = (event) => {
    const target = document.querySelector("#action_dropdown");
    const withinBoundaries = event.composedPath().includes(target);
    if (withinBoundaries) {
      setActive(false);
      // document.body.classList.remove("open-sidebar");
    }
  };

  useEffect(() => {
    document.addEventListener("click", sidbarCloseOutsideClick);
  }, []);
  const toggleClass = () => {
    setActive(!isActive);
    // document.body.classList.toggle("open-sidebar");
  };
  const category = dateCategory.find(
    (item) =>
      item?.label === currentChat?.date_id?.standard_class_date ||
      item?.label === currentChat?.date_id?.middle_class_dates ||
      item?.label === currentChat?.date_id?.executive_class_dates
  );

  const conversationLength = conversations
    ?.filter(
      (c) =>
        (c.status == 1 || c.status == 2) &&
        c?.user?.user_name
          ?.toLowerCase()
          .trim()
          .includes(search.toLowerCase().trim())
    )
    .filter((c) =>
      search?.length > 0 ? !c.message || c.message : c.message
    )?.length;

  const requestedConversationLength = conversations?.filter(
    (c) => c.status == 0
  )?.length;

  const unReadedConversationLength = conversations?.filter(
    (c) =>
      c?.message &&
      !c.message?.read_date_time &&
      c?.message?.sender_id !== user?._id
  )?.length;

  // consoles
  // console.log("socket connected message", socket.connected);
  // console.log("conversationLength", conversationLength);
  // console.log("unReadedConversationLength", unReadedConversationLength);
  // console.log("socket", socket);
  // console.log("currentChat", currentChat);
  // console.log("arrivalMessage", arrivalMessage);
  // console.log("category", category);
  // console.log("conversation", conversations);
  // console.log("messages", messages);
  // console.log("arrivalMessage", arrivalMessage);

  const myLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 70}`;
  };

  return (
    <div
      className="inner-page"
      onClick={() => {
        if (isActive) {
          setActive(false);
        }
      }}
    >
      {mobile ? (
        <MessageMobileHeader />
      ) : (
        <HeaderLoggedIn
          unReadedConversationLength={unReadedConversationLength}
          count={count}
          setCount={setCount}
        />
      )}

      <div className="inner-part-page">
        <div className="">
          <form onSubmit={handleSubmit}>
            {/* <div className="pl-4 pr-4 message"> */}
            <div className="container message">
              <div className="row">
                <div className="col-md-4 col-lg-3 p-0">
                  <div className="message_sidebar_wrap">
                    <Field
                      name="search"
                      type="text"
                      component={Inputs.inputFieldWithIcon}
                      placeholder=" Search"
                      icon={<IoMdSearch size={20} />}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                    <Tabs
                      selectedIndex={selectedTabIndex}
                      onSelect={tabIndexChange}
                    >
                      {user?.gender === "female" ? (
                        <TabList>
                          <Tab>Conversations</Tab>
                          <Tab>
                            <UserCardListForMessage
                              conversations={conversations}
                              setConversations={setConversations}
                              getConversations={getConversations}
                              user={user}
                              setCurrentChat={setCurrentChat}
                              tabIndexChange={tabIndexChange}
                              selectedTabIndex={selectedTabIndex}
                              socket={socket}
                              toggleChat={toggleChat}
                              mobile={mobile}
                            />
                          </Tab>
                        </TabList>
                      ) : (
                        <TabList>
                          <Tab>Conversations</Tab>
                        </TabList>
                      )}
                      <TabPanel>
                        <div className="user-list-wrap">
                          <ul>
                            {loading ? (
                              mobile ? (
                                <div className="date_details_desktop_loading-2">
                                  <Image
                                    src={require("../assets/squareLogoNoBack.gif")}
                                    alt="loading..."
                                    className=""
                                    width={100}
                                    height={100}
                                  />
                                </div>
                              ) : (
                                ""
                              )
                            ) : conversations?.length > 0 ? (
                              conversations
                                .filter(
                                  (c) =>
                                    (c.status == 1 || c.status == 2) &&
                                    c?.user?.user_name
                                      ?.toLowerCase()
                                      .trim()
                                      .includes(search.toLowerCase().trim())
                                )
                                .filter((c) =>
                                  search?.length > 0
                                    ? !c.message || c.message
                                    : c.message
                                )?.length > 0 ? (
                                conversations
                                  .filter(
                                    (c) =>
                                      (c.status == 1 || c.status == 2) &&
                                      c?.user?.user_name
                                        ?.toLowerCase()
                                        .trim()
                                        .includes(search.toLowerCase().trim())
                                  )
                                  .filter((c) =>
                                    search?.length > 0
                                      ? !c.message || c.message
                                      : c.message
                                  )
                                  .sort((a, b) => {
                                    return (
                                      new Date(b?.message?.sent_time) -
                                      new Date(a?.message?.sent_time)
                                    );
                                  })
                                  ?.map((c) => {
                                    return (
                                      <li
                                        onClick={() => {
                                          setCurrentChat(c);
                                          if (mobile) {
                                            toggleChat(c);
                                          }
                                        }}
                                      >
                                        <div className="d-flex w-100">
                                          <figure className="user_img_header">
                                            <Image
                                              src={
                                                c.user?.images?.length > 0 &&
                                                c.user?.images
                                                  ? c.user?.images[0]
                                                  : (user?.images &&
                                                      user?.images[0]) ||
                                                    NoImage
                                              }
                                              loader={myLoader}
                                              priority={true}
                                              placeholder="blur"
                                              blurDataURL={
                                                c.user?.images?.length > 0 &&
                                                c.user?.images
                                                  ? c.user?.images[0]
                                                  : (user?.images &&
                                                      user?.images[0]) ||
                                                    NoImage
                                              }
                                              alt="user image"
                                              width={32}
                                              height={32}
                                            />
                                          </figure>
                                          <div className="w-100">
                                            <div className="user-details">
                                              <h3 className="user__detail__star">
                                                {c?.isSuperInterested && (
                                                  <Image
                                                    src={StarIcon}
                                                    height={20}
                                                    width={20}
                                                  />
                                                )}

                                                <span
                                                  className={
                                                    c?.isSuperInterested
                                                      ? "super__interested__username"
                                                      : ""
                                                  }
                                                >
                                                  {c?.user?.user_name ?? ""}
                                                </span>
                                              </h3>

                                              <span>
                                                {/* {c?.message &&
                                                  showTime(
                                                    c?.message?.sent_time
                                                  )} */}
                                                {c?.message &&
                                                  customFormat(
                                                    moment(
                                                      c?.message?.sent_time
                                                    ),
                                                    c?.message?.sent_time
                                                  )}
                                              </span>
                                            </div>
                                            {c?.message?.read_date_time ||
                                            c?.message?.sender_id ===
                                              user?._id ? (
                                              <div className="read">
                                                {showText(c?.message?.message)}
                                              </div>
                                            ) : (
                                              <div className="unread">
                                                {showText(c?.message?.message)}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {c?.message &&
                                        !c?.message?.read_date_time &&
                                        c?.message?.sender_id !== user?._id ? (
                                          <span className="unread_indicator"></span>
                                        ) : (
                                          <span className="read_indicator"></span>
                                        )}
                                      </li>
                                    );
                                  })
                              ) : mobile ? (
                                <div className="message-content-side">
                                  {conversationLength == 0 && (
                                    <NoConversationShowView />
                                  )}
                                </div>
                              ) : (
                                "No Conversation"
                              )
                            ) : mobile ? (
                              <div className="message-content-side">
                                {conversationLength == 0 && (
                                  <NoConversationShowView />
                                )}
                              </div>
                            ) : (
                              "No Conversation"
                            )}
                          </ul>
                        </div>
                      </TabPanel>
                      <TabPanel>
                        <div className="user-list-wrap">
                          <ul>
                            {loading
                              ? ""
                              : (conversations?.length == 0 ||
                                  conversations.filter(
                                    (c) =>
                                      c.status == 0 &&
                                      c.message?.sender_id !== user?._id
                                  )?.length == 0) &&
                                (mobile ? (
                                  <div className="message-content-side">
                                    {requestedConversationLength == 0 && (
                                      <NoConversationShowView request />
                                    )}
                                  </div>
                                ) : (
                                  "No Requests"
                                ))}
                          </ul>
                        </div>
                      </TabPanel>
                    </Tabs>
                  </div>
                </div>
                <div className="col-md-8 col-lg-9 p-0">
                  {!mobile && (
                    <div className="message-content-side">
                      {currentChat && currentChat?.status === 0 ? (
                        <>{/* <UserCardList currentChat={currentChat} /> */}</>
                      ) : currentChat &&
                        (currentChat?.status === 1 ||
                          currentChat?.status === 2) ? (
                        <div className="message-chat-wrap">
                          <div className="top-head">
                            <div
                              className="user-thumb"
                              onClick={() =>
                                router.push(
                                  `/user/user-profile/${currentChat?.user?.user_name}`
                                )
                              }
                            >
                              <figure
                                className="user_img_header"
                                onClick={() =>
                                  router.push(
                                    `/user/user-profile/${currentChat?.user?.user_name}`
                                  )
                                }
                              >
                                <Image
                                  src={
                                    currentChat?.user?.images?.length > 0 &&
                                    currentChat?.user?.images
                                      ? currentChat?.user?.images[0]
                                      : (user?.images && user?.images[0]) ||
                                        NoImage
                                  }
                                  alt="user image"
                                  width={32}
                                  height={32}
                                  onClick={() =>
                                    router.push(
                                      `/user/user-profile/${currentChat?.user?.user_name}`
                                    )
                                  }
                                />
                              </figure>

                              <span
                                className="user-details"
                                onClick={() =>
                                  router.push(
                                    `/user/user-profile/${currentChat?.user?.user_name}`
                                  )
                                }
                              >
                                <h3>{currentChat?.user?.user_name ?? ""}</h3>
                              </span>
                            </div>
                            <div className="user-details">
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
                                            onClick={() =>
                                              unblockChat(currentChat)
                                            }
                                          >
                                            <a>Unblock</a>
                                          </li>
                                        )
                                      ) : (
                                        <li
                                          onClick={() => blockChat(currentChat)}
                                        >
                                          <a>Block</a>
                                        </li>
                                      )}
                                      <li
                                        onClick={() => deleteChat(currentChat)}
                                      >
                                        <a>Delete Conversation</a>
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="chat_message_wrap">
                            <div className="message_list_wrap">
                              <ul className="chat_message_scroll">
                                {chatLoading ? (
                                  <div className="date_details_desktop_loading-2">
                                    <Image
                                      src={require("../assets/squareLogoNoBack.gif")}
                                      alt="loading..."
                                      className=""
                                      width={100}
                                      height={100}
                                    />
                                  </div>
                                ) : (
                                  messages.filter(
                                    (message) => message?.message !== ""
                                  ).length > 0 &&
                                  messages
                                    .filter(
                                      (message) => message?.message !== ""
                                    )
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
                                            <span
                                              className={` ${
                                                message.sender_id === user?._id
                                                  ? "message_time"
                                                  : "message_time_send"
                                              }`}
                                            >
                                              {customFormat(
                                                moment(message?.sent_time),
                                                message?.sent_time
                                              )}
                                            </span>
                                            <span className="message_text">
                                              {message?.message}
                                            </span>
                                          </div>
                                        </li>
                                      );
                                    })
                                )}
                              </ul>
                            </div>
                            {chatLoading ? (
                              ""
                            ) : currentChat?.status === 2 ? (
                              currentChat?.date_id?.is_blocked_by_admin ? (
                                <div className="text-center">
                                  Admin has removed this date.
                                </div>
                              ) : currentChat?.blocked_by?._id == user?._id ? (
                                <div className="text-center">
                                  {/* you have blocked this chat */}
                                  User has been blocked
                                </div>
                              ) : (
                                <div className="text-center">
                                  You have been blocked
                                </div>
                              )
                            ) : (
                              <div className="input_write_sec">
                                <input
                                  type="text"
                                  placeholder="Type your message here…"
                                  onChange={(e) =>
                                    setNewMessage(e.target.value)
                                  }
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
                                    newMessage.trim() !== "" && sendMessage
                                  }
                                  disabled={newMessage.trim() === ""}
                                >
                                  <Image
                                    src={
                                      !newMessage
                                        ? "https://secrettime-cdn.s3.eu-west-2.amazonaws.com/secret-time/uploads/message_send.png"
                                        : MessageSend2
                                    }
                                    alt="send-btn"
                                    width={25}
                                    height={25}
                                  />
                                </button>
                                {/* <div className="send_btn">
                                  {newMessage.trim() !== "" ? (
                                    <Image
                                      src={MessageSend2}
                                      alt="send-btn"
                                      onClick={
                                        newMessage.trim() !== "" && sendMessage
                                      }
                                    />
                                  ) : (
                                    <Image src={MessageSend} alt="send-btn" />
                                  )}
                                </div> */}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : loading ? (
                        <Image
                          src={require("../assets/squareLogoNoBack.gif")}
                          alt="loading..."
                          className=""
                          width={100}
                          height={100}
                        />
                      ) : (
                        ((selectedTabIndex == 0 && conversationLength == 0) ||
                          (selectedTabIndex == 1 &&
                            requestedConversationLength == 0)) && (
                          <NoConversationShowView
                            selectedTabIndex={selectedTabIndex}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default reduxForm({
  form: "Messages", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
})(withAuth(Messages));
