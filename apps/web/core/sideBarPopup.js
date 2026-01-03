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
import close1 from "../assets/close1.png";
import { reset, initialize } from "redux-form";
import classNames from "classnames";
import useWindowSize from "utils/useWindowSize";
import { apiRequest } from "utils/Utilities";
import io from "socket.io-client";
import { socket } from "pages/user/user-list";

function sideBarPopup({ isOpen, toggle, count }) {
  const width = useWindowSize();
  const user = useSelector((state) => state.authReducer.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [documentUpoaded, setDocumentUpoaded] = useState(false);
  const [notifData, setNotifdata] = useState(null);
  // const [count, setCount] = useState(0);
  // const socket = io(socketURL, {
  //   autoConnect: true,
  // });

  useEffect(() => {
    if (user?.selfie && user?.document) {
      setDocumentUpoaded(true);
    }
  }, [user]);

  // const fetchNotifications = async () => {
  //   try {
  //     const params = {
  //       user_email: user.email,
  //       sort: "sent_time",
  //     };
  //     const { data } = await apiRequest({
  //       method: "GET",
  //       url: `notification`,
  //       params: params,
  //     });
  //     setNotifdata(data?.data?.notification);
  //   } catch (err) {
  //     console.error("err", err);
  //   }
  // };

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  // useEffect(() => {
  //   if (isOpen) {
  //     fetchNotifications();
  //   }
  // }, [isOpen]);

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

  const memberSince = user?.created_at
    ? new Date(user?.created_at)?.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      className={classNames(
        `modal fade ${
          isOpen ? "show d-block modal-open modal-open-1" : "d-none"
        }`,
        width > 1399 && "modal-fade-1"
      )}
      id="sidebarPop"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
      //style={{ padding: "15px" }}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div
        className="modal-dialog modal-custom-dailog"
        style={{ marginTop: "47px" }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "black",
            width: "290px",
            //borderRadius: "10px",
          }}
        >
          <div
            className="modal-header p-0"
            style={{ borderBottom: "none", postion: "relative" }}
          >
            <button
              type="button"
              className="btn-close btn-custom"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={toggle}
            >
              <Image
                src={close1}
                alt="user image"
                width={52}
                height={52}
                // className="date-preview-img"
              />
            </button>
          </div>
          <div className="modal-body" style={{ height: `cal(100vh-25%)` }}>
            <div className="sidebar_wrap">
              <div
                className="user-card-sidebar"
                style={{ padding: " 20px 25px" }}
              >
                <div className="d-flex align-items-center mb-4">
                  <figure className="mb-0 p-0">
                    <img
                      src={!_.isEmpty(user) ? user?.images[0] : UserImg}
                      alt="user image"
                      width={40}
                      height={40}
                    />
                  </figure>
                  <span className="userdetails">
                    <H5>{user?.user_name || ""}</H5>
                    <SubHeading title={`Member since ${memberSince}`} />
                  </span>
                </div>
                <div className="d-flex align-items-center mb-0 header_btn_wrap">
                  {router.asPath === "/user/user-profile" ? (
                    <a className="cursor-pointer" onClick={toggle}>
                      View Profile
                    </a>
                  ) : (
                    <Link legacyBehavior href="/user/user-profile">
                      <a onClick={toggle}>View Profile</a>
                    </Link>
                  )}

                  <Link legacyBehavior href="/auth/profile?edit=true">
                    <a onClick={toggle}>Edit Profile</a>
                  </Link>
                </div>
              </div>
              <div className="verification_card_header text-center mb-3">
                <div className="d-flex align-items-center mb-0 header_btn_wrap">
                  <button
                    type="button"
                    className="d-flex align-items-center justify-content-center profile-btn"
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
                <div className="verification_card_header text-center mb-0">
                  {/* <div className="mb-1">
                                        <CustomIcon.ChampaignCaviar color={"#AFABAB"} size={50} />
                                    </div> */}
                  {/* <SubHeading title="Stay ahead of the crowd" /> */}
                  <div className="d-flex align-items-center mb-0 mt-1 header_btn_wrap">
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
              <div className="user-card-sidebar">
                <div
                  className="sidebar_nav_links "
                  style={{ marginTop: "50px", padding: "15px 15px 0px 15px" }}
                >
                  <ul>
                    <li>
                      <Link legacyBehavior href="/user/notifications">
                        <div style={{ cursor: "pointer" }}>
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
              <div
                className="bottom-footer-sidebar"
                style={{ position: "inherit" }}
              >
                <div className="d-flex align-items-center mb-0 header_btn_wrap log-btn login-btn">
                  <button
                    className="log-btn d-flex align-items-center justify-content-center"
                    type="button"
                    style={{ lineHeight: "3" }}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default sideBarPopup;

//calc(-0.5 * var(--bs-gutter-x))
