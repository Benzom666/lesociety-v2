import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CustomIcon } from "core/icon";
import UserImg from "assets/img/profile.png";
import Image from "next/image";
import SubHeading from "./SubHeading";
import H5 from "./H5";
import { HiBadgeCheck } from "react-icons/hi";
import { FiChevronRight } from "react-icons/fi";

import { useSelector, useDispatch } from "react-redux";
import { deAuthenticateAction, logout } from "../modules/auth/authActions";
import { useRouter } from "next/router";
import _ from "lodash";
import { BiTime } from "react-icons/bi";
import { reset } from "redux-form";
import { apiRequest } from "utils/Utilities";
// Socket.io removed
import { socket } from "pages/user/user-list"; // Will be null

export default function SideBar({ isActive, count }) {
  const user = useSelector((state) => state.authReducer.user);
  const formValue = useSelector((state) => state.form);
  const dispatch = useDispatch();
  const router = useRouter();
  const [documentUpoaded, setDocumentUpoaded] = useState(false);
  const [notifData, setNotifdata] = useState(null);
  // Compute memberSince on client only to avoid SSR/client locale mismatch
  const [memberSince, setMemberSince] = useState("");
  // const [count, setCount] = useState(0);
  // const socket = io(socketURL, {
  //   autoConnect: true,
  // });

  useEffect(() => {
    if (user?.selfie && user?.document) {
      setDocumentUpoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (user?.created_at) {
      const formatted = new Date(user.created_at)?.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      setMemberSince(formatted || "");
    }
  }, [user?.created_at]);

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
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  // useEffect(() => {
  //   if (isActive) {
  //     fetchNotifications();
  //   }
  // }, [isActive]);

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

  // useEffect(() => {
  //   console.log("notiffff ", notifData);
  //   const unc = notifData?.filter(
  //     (item) => item.status === 0 && item.type !== "notification"
  //   ).length;
  //   console.log("count ", unc);
  //   localStorage.setItem("unreadNotifCount", JSON.stringify(unc));
  //   let unreadNotifCount;
  //   unreadNotifCount = localStorage.getItem("unreadNotifCount");
  //   setCount(unreadNotifCount);
  //   console.log("unreadNotifCount ", unreadNotifCount);
  // }, [notifData]);

  return (
    <>
      <div className="sidebar_wrap">
        <div className="sidebar-content">
          <div className="user-card-sidebar">
            <div className="d-flex align-items-center mb-4">
              <figure className="mb-0 p-0">
                <img
                  src={!_.isEmpty(user) ? user?.images[0] : UserImg}
                  alt="user image"
                  width={50}
                  height={50}
                />
              </figure>
              <span className="userdetails">
                <H5 style={{ fontSize: "18px", letterSpacing: "0.09px" }}>
                  {user?.user_name || ""}
                </H5>
                <SubHeading title={`Member since ${memberSince}`} />
              </span>
            </div>
            <div className="d-flex align-items-center mb-0 header_btn_wrap">
              {router.asPath === "/user/user-profile" ? (
                <a className="cursor-pointer">View Profile</a>
              ) : (
                <Link legacyBehavior href="/user/user-profile">
                  <a>View Profile</a>
                </Link>
              )}
              <Link legacyBehavior href="/auth/profile?edit=true">
                <a>Edit Profile</a>
              </Link>
            </div>
          </div>
          <div className="verification_card_header text-center mb-3">
            <div className="mb-5">
              {/* <HiBadgeCheck color={"white"} size={50} /> */}
            </div>
            <div className="d-flex align-items-center mb-0 header_btn_wrap">
              <button
                type="button"
                style={{ marginTop: "-42px" }}
                className="d-flex align-items-center justify-content-center"
                onClick={() =>
                  !documentUpoaded && router.push("/verified-profile")
                }
              >
                <span className="pt-0">
                  {user?.documents_verified
                    ? "VERIFIED"
                    : !documentUpoaded
                    ? "VERIFY PROFILE"
                    : "PENDING"}
                </span>
                {user?.documents_verified ? (
                  <HiBadgeCheck
                    color={"white"}
                    size={25}
                    style={{ paddingLeft: "5px" }}
                  />
                ) : !documentUpoaded ? (
                  <HiBadgeCheck
                    color={"white"}
                    size={25}
                    style={{ paddingLeft: "5px" }}
                  />
                ) : (
                  <BiTime
                    color={"grey"}
                    size={25}
                    style={{ paddingLeft: "5px" }}
                  />
                )}
              </button>
            </div>
            <SubHeading title="Let them know you are real" />
          </div>
          {user?.gender === "female" && (
            <div className="verification_card_header text-center mb-2">
              {/* <div className="mb-2">
              <CustomIcon.ChampaignCaviar color={"#AFABAB"} size={50} />
            </div> */}
              {/* <SubHeading title="Stay ahead of the crowd" /> */}
              <div className="d-flex align-items-center mb-0 mt-3 header_btn_wrap">
                <button
                  onClick={() => router.push("/create-date/choose-city")}
                  type="button"
                  className="create-date"
                >
                  Create New Date
                </button>
              </div>
              <SubHeading title="Stay ahead of the crowd" />
            </div>
          )}
          <div className="user-card-sidebar sidebar-nav-link">
            <div className="sidebar_nav_links">
              <ul>
                <li>
                  <Link legacyBehavior href="/user/notifications">
                    <div>
                      <a>
                        Notification <FiChevronRight size={22} />{" "}
                      </a>
                      {count > 0 && (
                        <div class="notification-container">
                          <span class="notification-counter">{count}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/">
                    <a>
                      Setting <FiChevronRight size={22} />{" "}
                    </a>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/">
                    <a>
                      Privacy <FiChevronRight size={22} />
                    </a>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/">
                    <a>
                      Terms <FiChevronRight size={22} />
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bottom-footer-sidebar">
          <div className="d-flex align-items-center mb-0 header_btn_wrap log-btn">
            <button
              className="log-btn d-flex align-items-center justify-content-center "
              type="button"
              onClick={() => {
                logout(router, dispatch);
              }}
            >
              Log Out
            </button>
          </div>
          <SubHeading title="LeSociety. Copywrite 2023 " />
        </div>
      </div>
    </>
  );
}
