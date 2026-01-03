import React, { useEffect, useState } from "react";
import Header from "core/header";
import Footer from "core/footer";
import useWindowSize from "../../utils/useWindowSize";
import withAuth from "@/core/withAuth";
import { apiRequest, apiURL } from "utils/Utilities";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import HeaderLoggedIn from "@/core/loggedInHeader";
import { getSupabaseClient } from "../../services/supabase-client-singleton";
import { logout } from "@/modules/auth/authActions";

const Notifications = () => {
  const [notifData, setNotifData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const dispatch = useDispatch();

  // Supabase Realtime: Subscribe to notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !user?._id) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Subscribe to notifications table changes
    const channel = supabase
      .channel('notifications-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user._id}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          // Refresh notifications list
          getNotificationList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?._id]);

  useEffect(() => {
    getConversations();
  }, []);

  const unReadedConversationLength = conversations?.filter(
    (c) =>
      c?.message &&
      !c.message?.read_date_time &&
      c?.message?.sender_id !== user?._id
  )?.length;

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

  const user = useSelector((state) => state.authReducer.user);
  const { width } = useWindowSize();

  const fetchNotifications = async () => {
    try {
      const params = {
        user_email: user.email,
        sort: "sent_time",
      };
      const { data } = await apiRequest({
        method: "GET",
        url: `notification`,
        params: params,
      });
      const notifss = data?.data?.notification.filter(
        (item) => item.type !== "notification"
      );
      setNotifData(notifss);
      setLoading(false);
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

  const readNotifications = async () => {
    try {
      const params1 = new URLSearchParams();
      params1.append("email", user.email);
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${user.token || ""}`,
        },
      };

      const url = `${`${apiURL}/api/v1`}/notification/read-all-notification`;
      const data = await axios.put(url, params1, config);
      console.log("Read all notifications ", data);
    } catch (err) {
      console.log("err here: ", err);
    }
  };

  useEffect(() => {
    readNotifications();
    fetchNotifications();
    //readNotifications()
  }, []);

  const getNotifTimeOrDate = (timestamp) => {
    let hr, min, days, ms;
    ms = Date.now() - new Date(timestamp);
    days = Math.floor(ms / (1000 * 3600 * 24));
    if (!days) {
      hr = Math.floor(ms / (1000 * 3600));
      min = Math.floor(ms / (1000 * 60));
      if (hr < 24 && min > 60) return hr + " hrs";
      else if (min < 60 && min > 0) return min + " mins";
      else return Math.floor(ms / 1000) + " secs";
    }
    return days + " days";
  };

  console.log("notif ", notifData);
  //const { width } = useWindowSize();
  if (loading) {
    return (
      <div className="date_details_desktop_loading-2">
        <Image
          src={require("../../assets/squareLogoNoBack.gif")}
          alt="loading..."
          className=""
          width={100}
          height={100}
        />
      </div>
    );
  } else {
    return (
      <div className="notifications">
        {/* <Header /> */}
        <HeaderLoggedIn
          fixed={width < 767}
          // isBlack={true}
          count={count}
          setCount={setCount}
          unReadedConversationLength={unReadedConversationLength}
        />
        <div
          className={
            notifData[0]
              ? "notification-wrapper"
              : "notification-wrapper no-notifWrap"
          }
        >
          <div className="main-header">
            <h1 className="header">{width > 767 && "Notifications"} </h1>
          </div>
          {notifData[0] ? (
            <ul>
              {notifData?.map((notifs) => (
                <li className="notif-items">
                  <p className="title">Le Society</p>
                  <p className="actions">Action Required</p>
                  <p className="msg">{notifs.message}</p>
                  <div className="notif-time">
                    <p className="timing">
                      {getNotifTimeOrDate(notifs.created_date)} ago
                    </p>
                    <div className="btn-container">
                      <button
                        className="edit-btn-verify"
                        onClick={() =>
                          router.push({
                            pathname: "/auth/profile",
                            query: {
                              edit: true,
                              type: notifs.type,
                              id: notifs._id,
                            },
                          })
                        }
                      >
                        Edit now
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-notif">
              You do not have any notifications at this time.
            </p>
          )}
        </div>
        <Footer />
      </div>
    );
  }
};

export default withAuth(Notifications);
