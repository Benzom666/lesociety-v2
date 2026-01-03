import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CustomIcon } from "core/icon";
import UserImg from "assets/img/profile.png";
import SideBar from "./sidebar";
import useWindowSize from "utils/useWindowSize";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { useRouter } from "next/router";
import { apiRequest } from "utils/Utilities";
import io from "socket.io-client";
import SideBarPopup from "./sideBarPopup";
import Image from "next/image";
import close1 from "../assets/close1.png";
import LeSlogoWhite from "../assets/LeS logoWhite.png";
import LeSlogoText from "../assets/img/LeSocietylogotext.png";
//import Logo_Mob from "../assets/img/Logo_Mob.png";
import Logo_Mob$ from "../assets/img/LeSociety Icon White.png";
import Logo_Web from "../assets/img/Logo_Web.png";
import { logout } from "@/modules/auth/authActions";
// const socket = io(socketURL, {
//   autoConnect: true,
// });

export default function HeaderLoggedIn({
  fixed,
  isBlack,
  unReadedConversationLength,
  count,
  setCount,
  setLogoutLoading,
}) {
  // const socket = io(socketURL, {
  //   autoConnect: true,
  // });

  const [isActive, setActive] = useState(false);
  const width = useWindowSize();
  const router = useRouter();
  const user = useSelector((state) => state.authReducer.user);
  const [modalIsOpen, setIsOpen] = useState(false);

  const [notifData, setNotifdata] = useState(null);
  const dispatch = useDispatch();
  // const [count, setCount] = useState(0);

  useEffect(() => {
    if (modalIsOpen || isActive) {
      // stop scrolling page
      document.body.style.overflow = "hidden";
    } else {
      // allow scrolling page
      document.body.style.overflow = "unset";
    }
  }, [modalIsOpen, isActive]);

  // useEffect(() => {
  //   socket.auth = { user: "admin@getnada.com" };
  //   socket.connect();
  //   console.log("socket", socket.auth);
  //   socket.on("connect", () => {
  //     console.log("connected", socket.connected);
  //   });
  //   socket.on("disconnect", (reason) => {
  //     console.log("socket disconnected reason", reason);
  //   });
  //   console.log("socket Notif socket intiated called");
  // }, []);

  // useEffect(() => {
  //   socket.on("connect_error", () => {
  //     console.log("connect_error");
  //     socket.auth = { user: user };
  //     socket.connect();
  //   });
  // }, [!socket.connected]);

  // useEffect(() => {
  //   console.log("Notif socket connected", socket.connected);
  //   socket.on("connect", () => {
  //     console.log(socket.id);
  //   });
  //   socket.on(`push-notification-${user.email}`, (message) => {
  //     console.log("notif received", message);
  //     const unc = message?.notifications?.filter(
  //       (item) => item.status === 0 && item.type !== "notification"
  //     ).length;
  //     localStorage.setItem("unreadNotifCount", JSON.stringify(unc));
  //     setCount(unc);
  //   });
  // }, [socket.connected]);

  useEffect(() => {
    console.log("notiffff ", notifData);
    const unc = notifData?.filter(
      (item) => item.status === 0 && item.type !== "notification"
    ).length;
    console.log("count ", unc);
    localStorage.setItem("unreadNotifCount", JSON.stringify(unc));
    let unreadNotifCount;
    unreadNotifCount = localStorage?.getItem("unreadNotifCount");
    setCount && setCount(unreadNotifCount);
    console.log("unreadNotifCount ", unreadNotifCount);
  }, [notifData]);

  function toggleModal() {
    setIsOpen(!isBlack && !modalIsOpen);
  }

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
      setNotifdata(data?.data?.notification);
    } catch (err) {
      console.error("err", err);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        if (setLogoutLoading) {
          setLogoutLoading(true);
          setTimeout(() => {
            logout(router, dispatch);
            setLogoutLoading(false);
          }, 2000);
        } else {
          setTimeout(() => {
            logout(router, dispatch);
          }, 100);
        }
      }
      return err;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (modalIsOpen || isActive) {
      fetchNotifications();
    }
  }, [modalIsOpen, isActive]);

  const unReadMessagesLength = unReadedConversationLength
    ? unReadedConversationLength
    : 0;

  // console.log("unReadMessagesLength", unReadMessagesLength);
  const sidbarCloseOutsideClick = (event) => {
    const target = document.querySelector("#sidebar-header");
    const withinBoundaries = event.composedPath().includes(target);
    if (withinBoundaries) {
      setActive(false);
      document.body.classList.remove("open-sidebar");
    }
  };

  useEffect(() => {
    document.addEventListener("click", sidbarCloseOutsideClick);
  }, []);

  useEffect(() => {
    return () => {
      setActive(false);
      document.body.classList.remove("open-sidebar");
    };
  }, []);

  const toggleClass = () => {
    if (width?.width > 480) {
      toggleModal();
    } else {
      setActive(!isBlack && !isActive);
      document.body.classList.toggle("open-sidebar");
    }
  };

  return (
    <header
      style={
        fixed && width?.width > 500
          ? {
              position: "fixed",
              width: "100%",
              zIndex: "99",
              background: "black",
            }
          : fixed
          ? {
              position: "fixed",
              width: "100%",
              zIndex: "99",
            }
          : {}
      }
      className={`py-3 py-md-3 loggedin_user ${isBlack && "is-black-head"}`}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 col-2" style={{ paddingLeft: "1.5rem" }}>
            <div className="logo">
              <>
                <Link legacyBehavior href="/auth/login">
                  {/* <h3 className="d-md-none mb-0 st-logo">ST</h3> */}
                  <img
                    src={Logo_Mob$.src}
                    width="25px"
                    height="25px"
                    alt="Logo"
                    className=" d-md-none cursor-pointer"
                  />
                </Link>
                <Link legacyBehavior href="/auth/login">
                  {/* <img
                    src="/images/logo.svg"
                    width="159"
                    alt="Logo"
                    className="d-none d-md-block cursor-pointer" 
                  /> */}
                  <img
                    src={Logo_Web.src}
                    width="232"
                    alt="Logo"
                    className="d-none d-md-block cursor-pointer"
                  />
                </Link>
              </>
            </div>
          </div>
          <div className="col-md-8 col-10">
            <nav>
              <ul className="d-flex justify-content-end mb-0 align-items-center">
                <li>
                  <Link legacyBehavior href="/messages">
                    <button
                      id="message-icon"
                      className="message_link"
                      onClick={() => router.push("/messages")}
                      type="button"
                    >
                      <CustomIcon.Envelope color={"#fff"} size={20} />

                      {width?.width > 767 && (
                        <>
                          <Link legacyBehavior href="/messages">
                            <a className="forgot-passwrd">Messages</a>
                          </Link>
                        </>
                      )}
                      {unReadMessagesLength > 0 && (
                        <span className="top-bages">
                          {/* {unReadMessagesLength} */}
                        </span>
                      )}
                    </button>
                  </Link>
                </li>
                <li>
                  <div className="user-profile-details">
                    <figure
                      className={`user_img_header user_notification ${
                        modalIsOpen ? "invisible" : ""
                      } `}
                      onClick={toggleClass}
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      role="button"
                    >
                      <img
                        src={!_.isEmpty(user) ? user?.images[0] : UserImg}
                        alt="user image"
                        width={32}
                        height={32}
                      />
                      {count > 0 && <span className="top-bages"></span>}
                    </figure>
                  </div>
                </li>
              </ul>
              {width?.width > 480 ? (
                <SideBarPopup
                  isOpen={modalIsOpen}
                  toggle={toggleModal}
                  count={count}
                ></SideBarPopup>
              ) : (
                <div
                  id="sidebar-header"
                  className={
                    isActive ? "sidebar-nav open_nav_menu" : "sidebar-nav"
                  }
                >
                  <SideBar
                    isActive={isActive}
                    locationPopupModal={isBlack}
                    count={count}
                  />
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
