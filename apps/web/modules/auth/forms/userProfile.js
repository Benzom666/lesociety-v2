import React, { useState } from "react";
import HeaderLoggedIn from "core/loggedInHeader";
import { useSelector, useDispatch } from "react-redux";
import { BiChevronLeft, BiTrashAlt, BiEditAlt } from "react-icons/bi";
import Image from "next/image";
import { HiBadgeCheck } from "react-icons/hi";
import { Field, reduxForm, initialize } from "redux-form";
import { Inputs } from "core";
import validate from "modules/auth/forms/validate/validate";
import H5 from "core/H5";
import SubHeading from "core/SubHeading";
import useWindowSize from "utils/useWindowSize";
import { CustomIcon } from "core/icon";
import Modal from "react-modal";
import Link from "next/link";
import TopBadgeCard from "../../../assets/img/TopCardBadge.png";
import moment from "moment";
import { logout, signupStep4 } from "../authActions";
import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  apiRequest,
  dateCategory,
  countriesCode,
  socketURL,
} from "utils/Utilities";
import SkeletonUserProfile from "@/modules/skeleton/user/SkeletonUserProfile";

import close1 from "../../../assets/close1.png";
import ProfileImageSlider from "./ProfileImageSlider";
import ImageSlider from "./ImageSlider";
import MessageModal from "@/core/MessageModal";
import io from "socket.io-client";
import { AUTHENTICATE_UPDATE } from "../actionConstants";

/** @type {any} */
export const socket = io(socketURL, {
  autoConnect: true,
});

function UserProfile({ preview, editHandle }) {
  const { width } = useWindowSize();
  const [loading, setLoading] = React.useState(false);
  const [dateModalOpen, dateSetIsOpen] = React.useState(false);
  const [userDetail, setUserDetail] = React.useState("");
  const [userDates, setUserDates] = React.useState([]);
  const [pagination, setPagination] = React.useState({});
  const [selectedDate, setSelectedDate] = React.useState("");
  const user = useSelector((state) => state.authReducer.user);
  const [pageLoading, setPageLoading] = useState(true);
  const [dateloading, setDateloading] = useState(true);
  const [page, setPage] = useState(1);
  const [alreadyMessaged, setAlreadyMessaged] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  const [viewFullPage, setViewFullPage] = useState(false);
  const [slideShowIndex, setSlideShowIndex] = useState(0);
  const [ladiesShow, setLadiesShow] = useState(false);

  const [image1Loading, setImage1Loading] = useState(true);
  const [image2Loading, setImage2Loading] = useState(true);
  const [image3Loading, setImage3Loading] = useState(true);
  const [image4Loading, setImage4Loading] = useState(true);

  // for notification
  const [count, setCount] = useState(0);

  const checkIpad =
    width > 768 && width < 1366 && width !== 1024 && width !== 768;

  useEffect(() => {
    socket.auth = { user: user };
    socket.connect();
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("disconnect", (reason) => {
      console.log("socket disconnected reason", reason);
    });
  }, [!socket.connected]);

  socket.on(
    "connect_error",
    () => {
      console.log("connect_error");
      socket.auth = { user: user };
      socket.connect();
    },
    [!socket.connected]
  );

  useEffect(() => {
    if (user?.token) {
      getConversations();
    }
  }, [user?.token]);

  useEffect(() => {
    socket.on(`request-${user?._id}`, (message) => {
      console.log("reqested message header", message);
      getConversations();
    });
  }, [socket.connected]);

  useEffect(() => {
    socket.on(`recieve-${user?._id}`, (message) => {
      console.log("recieve message header", message);
      getConversations();
    });
  }, [socket.connected]);

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

  useEffect(() => {
    if (viewFullPage || dateModalOpen) {
      // stop scrolling page
      document.body.style.overflow = "hidden";
    } else {
      // allow scrolling page
      document.body.style.overflow = "unset";
    }
  }, [viewFullPage, dateModalOpen]);

  const dispatch = useDispatch();
  const router = useRouter();
  const selectedDateCategory = dateCategory.find(
    (item) =>
      item?.label === selectedDate?.standard_class_date ||
      item?.label === selectedDate?.middle_class_dates ||
      item?.label === selectedDate?.executive_class_dates
  );
  // console.log(userDates);
  // console.log(loading);
  const convertToFeet = (cmValue) => (cmValue * 0.0328084).toPrecision(2);

  const toFeet = (n) => {
    var realFeet = (n * 0.3937) / 12;
    var feet = Math.floor(realFeet);
    var inches = Math.round((realFeet - feet) * 12);
    return feet + "'" + inches;
  };

  useEffect(() => {
    if (dateModalOpen && user?.gender === "male") {
      setMessageLoading(true);
      checkMessage();
    }
  }, [dateModalOpen]);

  const checkMessage = async () => {
    try {
      const data = {
        recieverId:
          selectedDate?.user_data?.length > 0
            ? selectedDate?.user_data[0]?._id
            : "",
        dateId: selectedDate?._id ?? "",
      };
      const res = await apiRequest({
        params: data,
        method: "GET",
        url: `chat/exist`,
      });
      setTimeout(() => {
        setMessageLoading(false);
      }, 10);
      if (res?.data?.message) {
        setAlreadyMessaged(true);
      }
    } catch (err) {
      setMessageLoading(false);
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

  function dateModalIsOpen() {
    dateSetIsOpen(true);
  }
  function dateCloseModal() {
    dateSetIsOpen(false);
    setSelectedDate("");
    setAlreadyMessaged(false);
  }

  const fetchDates = async (params) => {
    setLoading(true);
    try {
      const res = await apiRequest({
        url: "date",
        params: params,
      });
      // console.log("res", res);
      setUserDates(res?.data?.data?.dates);
      setPagination(res?.data?.data?.pagination);
      setDateloading(false);
      setLoading(false);
    } catch (err) {
      console.log("err", err);
      setUserDates([]);
      setDateloading(false);
      setLoading(false);
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!" &&
        user?.token
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  const fetchUserDetails = async (userName) => {
    try {
      const res = await apiRequest({
        url: `user/user-by-name?user_name=${userName}`,
      });
      if (res?.data?.data?.user) {
        setUserDetail(res?.data?.data?.user);
      }
    } catch (e) {
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

  useEffect(() => {
    if (router?.query?.userName && user?.token) {
      fetchUserDetails(router?.query?.userName);
      const params = {
        current_page: page,
        per_page: 1000,
        user_name: router?.query?.userName,
      };
      fetchDates(params);
    }
    return () => {
      setUserDetail("");
      setUserDates([]);
    };
  }, [router?.query, user?.token]);

  useEffect(() => {
    if (
      user?.gender === "female" &&
      user?.user_name &&
      !router?.query?.userName
    ) {
      const params = {
        current_page: page,
        per_page: 1000,
        user_name: user?.user_name,
      };
      fetchDates(params);
    }
    return () => {
      setUserDetail("");
      setUserDates([]);
    };
  }, []);

  const onSubmit = () => {
    dispatch(
      signupStep4(
        { email: user?.email, step_completed: 4 },
        setLoading,
        handleUpdateRoutePage
      )
    );
  };

  const editDate = () => {
    const country = Object.keys(countriesCode).find(
      (key) =>
        countriesCode[key]?.toLowerCase() ===
        selectedDate.country_code?.toLowerCase()
    );
    // dispatch(
    //   initialize("ChooseCity", {
    //     enter_country: { label: country, value: selectedDate.country_code },
    //     enter_city: {
    //       name: selectedDate?.location,
    //       country: [
    //         {
    //           short_code: selectedDate.country_code,
    //           text: country,
    //         },
    //       ],
    //       label: selectedDate?.location,
    //     },
    //   })
    // );
    dispatch(
      initialize("ChooseCity", {
        enter_country: {
          label: country,
          value: selectedDate.country_code,
        },
        enter_city: {
          name: selectedDate?.location,
          country: [
            {
              short_code: selectedDate.country_code,
              text: country,
            },
          ],
          label: selectedDate?.location + ", " + selectedDate?.province,
          province: [{ short_code: selectedDate?.province?.toUpperCase() }],
        },
      })
    );
    dispatch(
      initialize("CreateStepOne", {
        search_type: selectedDateCategory,
        dateId: selectedDate?._id,
      })
    );
    dispatch(initialize("CreateStepTwo", { education: selectedDate?.price }));
    dispatch(
      initialize("CreateStepThree", { education: selectedDate?.date_length })
    );
    dispatch(
      initialize("CreateStepFour", {
        date_description: selectedDate?.date_details,
      })
    );
    router.push("/create-date/date-event?new_edit=true");
  };

  const deleteDate = async () => {
    try {
      const res = await apiRequest({
        data: {
          ids: selectedDate?._id,
        },
        method: "DELETE",
        url: "date/delete-by-ids",
      });
      if (res?.data?.data) {
        const params = {
          current_page: page,
          per_page: 1000,
          user_name: user?.user_name,
        };
        fetchDates(params);
        dateCloseModal();
      }
    } catch (e) {
      console.log(e);
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

  const handleUpdateRoutePage = () => {
    console.log("handleUpdateRoutePage called");
    if (router?.query?.edit)
      return router.push({
        pathname: "/auth/update-profile",
      });
    else {
      return null;
    }
  };

  const getUpdatedUserDetails = async () => {
    // setLoading(true);
    try {
      const res = await apiRequest({
        method: "GET",
        url: `user/user-by-name?user_name=${user?.user_name}`,
      });
      dispatch({
        type: AUTHENTICATE_UPDATE,
        payload: { ...res.data?.data?.user },
      });
    } catch (err) {
      console.log("err", err);

      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        // setTimeout(() => {
        //   logout(router, dispatch);
        // }, 100);
      }
      return err;
    }
  };

  useEffect(() => {
    getUpdatedUserDetails();
  }, []);

  // useEffect(() => {
  //   if (router?.query?.edit && user?.step_completed === 4) {
  //     router.push({
  //       pathname: "/auth/update-profile",
  //     });
  //   }
  // }, [user, router?.query?.edit]);

  const nextPage = () => {
    const params = {
      current_page: page + 1,
      per_page: 2,
      user_name: user?.user_name,
    };
    setPage(page + 1);
    fetchDates(params);
  };

  const prevPage = () => {
    const params = {
      current_page: page - 1,
      per_page: 2,
      user_name: user?.user_name,
    };
    setPage(page - 1);
    fetchDates(params);
  };

  const faltuImage =
    "https://img.freepik.com/premium-photo/black-stone-texture-dark-slate-background-top-view_88281-1206.jpg?w=2000";

  const userImageProfile =
    userDetail?.images?.length > 0
      ? userDetail?.images[0]
      : user?.un_verified_images?.length > 0 && router.query?.edit
      ? user?.un_verified_images[0]
      : (user?.images && user?.images[0]) || faltuImage;

  const userImage1 =
    userDetail?.images?.length > 0
      ? userDetail?.images[1]
      : user?.un_verified_images?.length > 0 && router.query?.edit
      ? user?.un_verified_images[1]
      : (user?.images && user?.images[1]) || faltuImage;

  const userImage2 =
    userDetail?.images?.length > 0
      ? userDetail?.images[2]
      : user?.un_verified_images?.length > 0 && router.query?.edit
      ? user?.un_verified_images[2]
      : (user?.images && user?.images[2]) || faltuImage;

  const userImage3 =
    userDetail?.images?.length > 0
      ? userDetail?.images[3]
      : user?.un_verified_images?.length > 0 && router.query?.edit
      ? user?.un_verified_images[3]
      : (user?.images && user?.images[3]) || faltuImage;

  const userTagline =
    userDetail?.tagline ||
    (router.query?.edit && user?.un_verified_tagline
      ? user?.un_verified_tagline
      : user?.tagline);

  const userDescription =
    userDetail?.description ||
    (router.query?.edit && user?.un_verified_description
      ? user?.un_verified_description
      : user?.description);

  const documentVerified = userDetail
    ? userDetail?.documents_verified
    : user?.documents_verified;

  const slides =
    slideShowIndex === 0
      ? [
          { url: userImageProfile },
          { url: userImage1 },
          { url: userImage2 },
          { url: userImage3 },
        ]
      : slideShowIndex === 1
      ? [
          { url: userImage1 },
          { url: userImage2 },
          { url: userImage3 },
          { url: userImageProfile },
        ]
      : slideShowIndex === 2
      ? [
          { url: userImage2 },
          { url: userImage3 },
          { url: userImageProfile },
          { url: userImage1 },
        ]
      : [
          { url: userImage3 },
          { url: userImageProfile },
          { url: userImage1 },
          { url: userImage2 },
        ];

  useEffect(() => {
    if (
      userImageProfile &&
      userImage1 &&
      userImage2 &&
      userImage3 &&
      (!dateloading ||
        (user?.gender === "male" && router?.query?.userName && userDetail) ||
        (user?.gender === "male" && !router?.query?.userName))
    ) {
      setTimeout(() => {
        setPageLoading(false);
      }, 2000);
    }
  }, [userImageProfile, userImage1, userImage2, userImage3, dateloading]);

  const myLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 50}`;
  };

  const containerStyles = {
    position: "relative",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, 0%)",
    maxWidth: "40%",
    height: "100vh",
  };

  console.log("userDetail", userDetail);

  const [isTouchHover, setIsTouchHover] = useState({});

  const handleTouchStart = (touchIndex) => {
    setIsTouchHover({
      ...isTouchHover,
      [touchIndex]: true,
    });
  };

  const handleTouchEnd = (touchIndex) => {
    setIsTouchHover({
      ...isTouchHover,
      [touchIndex]: false,
    });
  };

  if (pageLoading) {
    return <SkeletonUserProfile preview={preview} />;
  } else {
    return (
      <div className="inner-page">
        {!preview && (
          <HeaderLoggedIn
            fixed={width < 767}
            count={count}
            setCount={setCount}
            unReadedConversationLength={unReadedConversationLength}
          />
        )}
        <div className="inner-part-page">
          <div
            className={`top-spase pb-0 pt-5-lg-4 pb-5-lg-4 ${
              preview ? "space-top" : ""
            }`}
          >
            <div className="container user_profile_page">
              <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                  <div className="row pt-2 pt-md-5">
                    <div className="col-xl-4 col-lg-5 col-md-12 col-12">
                      {width > 991 && (
                        <figure className="user_img_profile">
                          <div className="big-image">
                            <label>
                              <div className="pos-relative">
                                {viewFullPage && (
                                  <div
                                    className={viewFullPage ? "overlay" : ""}
                                  >
                                    <div
                                      className={
                                        viewFullPage
                                          ? "closebtn"
                                          : "image-display-none"
                                      }
                                      onClick={() => setViewFullPage(false)}
                                    >
                                      <Image
                                        src={close1}
                                        alt="user image"
                                        width={30}
                                        height={30}
                                      />
                                    </div>
                                    <div
                                      // style={viewFullPage && containerStyles}
                                      className={
                                        viewFullPage
                                          ? "overlay-content"
                                          : "image-display-none"
                                      }
                                    >
                                      <ImageSlider
                                        slides={slides}
                                        viewFullPage={viewFullPage}
                                      />
                                    </div>
                                  </div>
                                )}
                                <Image
                                  src={userImageProfile}
                                  loader={myLoader}
                                  priority={true}
                                  alt="user image"
                                  width={270}
                                  height={checkIpad ? 300 : 270}
                                  placeholder="blur"
                                  blurDataURL={userImageProfile}
                                  onClick={() => {
                                    setViewFullPage(true);
                                    setSlideShowIndex(0);
                                  }}
                                />

                                {documentVerified && (
                                  <span className="verified_check_tag">
                                    <HiBadgeCheck color={"white"} size={20} />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </label>
                          </div>
                        </figure>
                      )}
                    </div>
                    <div className="col-xl-8 col-lg-7 col-md-12 col-12 padd0-responsive">
                      <div className="userdetails resposnive-data-profile">
                        <h4>
                          {userDetail?.user_name || user?.user_name},{" "}
                          <span>{userDetail?.age || user?.age}</span>
                        </h4>

                        {width < 991 && (
                          <div className="text-center">
                            <svg
                              className="left-space"
                              width="60"
                              height="2"
                              viewBox="0 0 95 2"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.110596 1.36728H94.3167"
                                stroke="url(#paint0_linear)"
                              ></path>
                              <defs>
                                <linearGradient
                                  id="paint0_linear"
                                  x1="105.948"
                                  y1="-1.61543"
                                  x2="8.2769"
                                  y2="-1.61543"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop
                                    stop-color="#FA789B"
                                    stop-opacity="0.01"
                                  ></stop>
                                  <stop
                                    offset="0.489981"
                                    stop-color="#F02D4E"
                                  ></stop>
                                  <stop
                                    offset="1"
                                    stop-color="#F24362"
                                    stop-opacity="0.01"
                                  ></stop>
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        )}
                        <div className="selct-wrap-sort mx-3">
                          <span className="city-txt">
                            {userDetail?.location || user?.location},{" "}
                          </span>
                          <span className="state-txt">
                            {userDetail?.province || user?.province}
                          </span>
                        </div>
                        <div className="user-images-wrap mt-3 mt-lg-4 user_img_profile">
                          <figure className="user_img_profile show-responsive_div pt-2 pt-lg-3">
                            <div className="big-image">
                              <label>
                                <>
                                  <div className="pos-relative">
                                    {/* <img
                                      src={
                                        // userDetail?.images
                                        //   ? userDetail?.images[0]
                                        //   : user?.images && user?.images[0]
                                        userImageProfile
                                      }
                                      alt="user image"
                                      width="350"
                                      height="350"
                                    /> */}
                                    {viewFullPage && (
                                      <div
                                        className={
                                          viewFullPage ? "overlay" : ""
                                        }
                                      >
                                        <div
                                          className={
                                            viewFullPage
                                              ? "closebtn"
                                              : "image-display-none"
                                          }
                                          onClick={() => setViewFullPage(false)}
                                        >
                                          <Image
                                            src={close1}
                                            alt="user image"
                                            width={30}
                                            height={30}
                                          />
                                        </div>
                                        <div
                                          // style={viewFullPage && containerStyles}
                                          className={
                                            viewFullPage
                                              ? "overlay-content"
                                              : "image-display-none"
                                          }
                                        >
                                          <ImageSlider
                                            slides={slides}
                                            viewFullPage={viewFullPage}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <Image
                                      src={userImageProfile}
                                      loader={myLoader}
                                      priority={true}
                                      alt="user image"
                                      width={350}
                                      height={350}
                                      placeholder="blur"
                                      blurDataURL={userImageProfile}
                                      onClick={() => {
                                        setViewFullPage(true);
                                        setSlideShowIndex(0);
                                      }}
                                    />
                                    {/* <ImageShow
                                      alt="user image"
                                      width={350}
                                      height={350}
                                      src={userImageProfile}
                                    /> */}
                                    {user?.documents_verified && (
                                      <span className="verified_check_tag">
                                        <HiBadgeCheck
                                          color={"white"}
                                          size={20}
                                        />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                </>
                              </label>
                            </div>
                          </figure>
                          {width > 991 && <SubHeading title="Photos" />}
                          <div className="image_wrap_slider pt-3 pb-4">
                            <figure>
                              {viewFullPage && (
                                <div className={viewFullPage ? "overlay" : ""}>
                                  <div
                                    className={
                                      viewFullPage
                                        ? "closebtn"
                                        : "image-display-none"
                                    }
                                    onClick={() => setViewFullPage(false)}
                                  >
                                    <Image
                                      src={close1}
                                      alt="user image"
                                      width={30}
                                      height={30}
                                    />
                                  </div>
                                  <div
                                    className={
                                      viewFullPage
                                        ? "overlay-content"
                                        : "image-display-none"
                                    }
                                  >
                                    <ImageSlider slides={slides} />
                                  </div>
                                </div>
                              )}
                              <Image
                                src={userImage1}
                                loader={myLoader}
                                priority={true}
                                alt="user image"
                                width={160}
                                height={150}
                                placeholder="blur"
                                blurDataURL={userImage1}
                                onClick={() => {
                                  setViewFullPage(true);
                                  setSlideShowIndex(1);
                                }}
                                className="cursor-pointer"
                              />
                              {/* <ImageShow
                                alt="user image"
                                width={160}
                                height={150}
                                src={userImage1}
                              /> */}
                            </figure>
                            <figure>
                              {viewFullPage && (
                                <div className={viewFullPage ? "overlay" : ""}>
                                  <div
                                    className={
                                      viewFullPage
                                        ? "closebtn"
                                        : "image-display-none"
                                    }
                                    onClick={() => setViewFullPage(false)}
                                  >
                                    <Image
                                      src={close1}
                                      alt="user image"
                                      width={30}
                                      height={30}
                                    />
                                  </div>
                                  <div
                                    className={
                                      viewFullPage
                                        ? "overlay-content"
                                        : "image-display-none"
                                    }
                                  >
                                    <ImageSlider slides={slides} />
                                  </div>
                                </div>
                              )}
                              <Image
                                src={userImage2}
                                loader={myLoader}
                                priority={true}
                                alt="user image"
                                width={160}
                                height={150}
                                placeholder="blur"
                                blurDataURL={userImage2}
                                onClick={() => {
                                  setViewFullPage(true);
                                  setSlideShowIndex(2);
                                }}
                                className="cursor-pointer"
                              />
                              {/* <ImageShow
                                alt="user image"
                                width={160}
                                height={150}
                                src={userImage2}
                              /> */}
                            </figure>
                            <figure>
                              {viewFullPage && (
                                <div className={viewFullPage ? "overlay" : ""}>
                                  <div
                                    className={
                                      viewFullPage
                                        ? "closebtn"
                                        : "image-display-none"
                                    }
                                    onClick={() => setViewFullPage(false)}
                                  >
                                    <Image
                                      src={close1}
                                      alt="user image"
                                      width={30}
                                      height={30}
                                    />
                                  </div>
                                  <div
                                    className={
                                      viewFullPage
                                        ? "overlay-content"
                                        : "image-display-none"
                                    }
                                  >
                                    <ImageSlider slides={slides} />
                                  </div>
                                </div>
                              )}
                              <Image
                                src={userImage3}
                                loader={myLoader}
                                priority={true}
                                alt="user image"
                                width={160}
                                height={150}
                                placeholder="blur"
                                blurDataURL={userImage3}
                                onClick={() => {
                                  setViewFullPage(true);
                                  setSlideShowIndex(3);
                                }}
                                className="cursor-pointer"
                              />
                              {/* <ImageShow
                                alt="user image"
                                width={160}
                                height={150}
                                src={userImage3}
                              /> */}
                            </figure>
                          </div>
                          <>
                            <h4 className="mb-5 mt-4 text-center tagline-font  word-break: break-word">
                              “{userTagline}”
                              {/* { userDetail?.tagline || user?.tagline } */}
                            </h4>

                            {!preview &&
                              // user?.gender === "female" &&
                              ((router?.query?.userName &&
                                userDetail?.gender === "female") ||
                                (router?.pathname === "/user/user-profile" &&
                                  user?.gender === "female")) && (
                                <>
                                  <SubHeading title="Available Experiences" />
                                  <div className="verification_card_header text-center mb-5 mt-4">
                                    <div
                                      className={
                                        userDates?.length > 0 &&
                                        userDates.filter(
                                          (item) => item?.date_status === true
                                        )?.length === 1
                                          ? "available-dates-box1"
                                          : "available-dates-box"
                                      }
                                    >
                                      {/* {userDates.length > 0 && page > 1 && (
                                      <div
                                        className="pagination-wrapper"
                                        onClick={prevPage}
                                      >
                                        <AiOutlineLeft className="pagination-icon" />
                                      </div>
                                    )} */}
                                      {loading ? (
                                        <div className="w-100 d-flex justify-content-center align-items-center">
                                          <span className="date-spin-loader-button"></span>
                                        </div>
                                      ) : userDates?.length > 0 &&
                                        userDates.filter(
                                          (item) => item?.date_status === true
                                        )?.length > 0 ? (
                                        userDates
                                          .filter(
                                            (item) => item?.date_status === true
                                          )
                                          .map((date, touchIndex) => {
                                            const category = dateCategory.find(
                                              (item) =>
                                                item?.label ===
                                                  date?.standard_class_date ||
                                                item?.label ===
                                                  date?.middle_class_dates ||
                                                item?.label ===
                                                  date?.executive_class_dates
                                            );
                                            return (
                                              <div
                                                className={`availabe_card_inner ${
                                                  isTouchHover[touchIndex]
                                                    ? "hover"
                                                    : ""
                                                }`}
                                                onClick={() => {
                                                  if (
                                                    !router?.query?.userName ||
                                                    router?.query?.userName ===
                                                      user?.user_name ||
                                                    user?.gender === "male"
                                                  ) {
                                                    setSelectedDate(date);
                                                    dateModalIsOpen();
                                                  } else {
                                                    if (
                                                      user?.gender === "female"
                                                    ) {
                                                      setLadiesShow(true);
                                                    }
                                                  }
                                                }}
                                                onTouchStart={() =>
                                                  handleTouchStart(touchIndex)
                                                }
                                                onTouchEnd={() =>
                                                  handleTouchEnd(touchIndex)
                                                }
                                              >
                                                <ul className="date_list">
                                                  <li>
                                                    <span
                                                      className="icon_wrap"
                                                      style={{
                                                        height: "40px",
                                                        width: "40px",
                                                      }}
                                                    >
                                                      {category?.icon}
                                                    </span>
                                                    <p
                                                      style={{
                                                        fontFamily: "Helvetica",
                                                        fontSize: "14px",
                                                        fontWeight: "300",
                                                        letterSpacing: "0.06px",
                                                        whiteSpace: "pre-wrap",
                                                        width: "6rem",
                                                        // borderRadius: "11px",
                                                      }}
                                                    >
                                                      {category?.label}
                                                    </p>
                                                  </li>
                                                  <span className="top-card_tag">
                                                    <span className="top-badge"></span>
                                                    <div className="price-card-name">
                                                      <span className="date-price-card">
                                                        ${date?.price}
                                                      </span>
                                                      <span className="hour">
                                                        <span>
                                                          {date?.date_length.replace(
                                                            "H",
                                                            ""
                                                          )}
                                                          H
                                                        </span>
                                                      </span>
                                                    </div>
                                                  </span>
                                                </ul>
                                              </div>
                                            );
                                          })
                                      ) : null}
                                      {/* {userDates.length > 0 &&
                                      pagination?.total_pages > page && (
                                        <div
                                          className="pagination-wrapper p-0"
                                          onClick={nextPage}
                                        >
                                          <AiOutlineRight
                                            className="pagination-icon"
                                            onClick={nextPage}
                                          />
                                        </div>
                                      )} */}
                                    </div>
                                    {(router?.query?.userName ===
                                      user?.user_name ||
                                      router?.pathname ===
                                        "/user/user-profile") &&
                                      (!userDates?.length ? (
                                        <div className="d-flex flex-column justify-content-center align-items-center header_btn_wrap w-100 date-block-section">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              router.push(
                                                "/create-date/choose-city"
                                              )
                                            }
                                            className={
                                              width > 1024
                                                ? "create-date w-50"
                                                : "create-date w-75"
                                            }
                                            style={{
                                              height: "50px",
                                              fontSize: "16px",
                                              fontWeight: "400",
                                              letterSpacing: "0.06px",
                                              //paddingTop: "5px",
                                              margin: "0px auto",
                                              marginTop: "10px",
                                            }}
                                          >
                                            Create New Date
                                          </button>
                                          <p className="date-text-1">
                                            Your dates are stored here
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="d-flex align-items-center mb-0 mt-4 header_btn_wrap w-100 justify-content-center">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              router.push(
                                                "/create-date/choose-city"
                                              )
                                            }
                                            className={
                                              width > 1024
                                                ? "create-date w-50"
                                                : "create-date w-75"
                                            }
                                            style={{
                                              height: "50px",
                                              fontSize: "14px",
                                              fontWeight: "400",
                                            }}
                                          >
                                            Create New Date
                                          </button>
                                        </div>
                                      ))}

                                    <Modal
                                      isOpen={dateModalOpen}
                                      onRequestClose={dateCloseModal}
                                      // style= {customStyles}
                                      className="date-selected-modal"
                                    >
                                      {messageLoading ? (
                                        <div className="user-message-loader">
                                          <Image
                                            src={require("../../../assets/squareLogoNoBack.gif")}
                                            alt="loading..."
                                            className=""
                                            width={100}
                                            height={100}
                                          />
                                        </div>
                                      ) : (
                                        <>
                                          <div className="model_content verification_card_header mb-3">
                                            <SubHeading title="Available Experiences" />
                                            <div className="availabe_card_inner date_border_red">
                                              <ul className="date_list">
                                                {selectedDate ? (
                                                  <>
                                                    <li>
                                                      <span className="icon_wrap">
                                                        {
                                                          selectedDateCategory?.icon
                                                        }
                                                      </span>
                                                      <p>
                                                        {
                                                          selectedDateCategory?.label
                                                        }
                                                      </p>
                                                    </li>
                                                    {/* <span className="top-card_tag">
                                                <span className="top-badge"></span>{" "}
                                                ${selectedDate?.price}
                                              </span>
                                              <span className="bottom_price_tag">
                                                <h2>
                                                  <sup>H</sup>{" "}
                                                  {selectedDate?.date_length.replace(
                                                    "H",
                                                    ""
                                                  )}
                                                </h2>
                                              </span> */}
                                                    <span className="top-card_tag">
                                                      <span className="top-badge"></span>
                                                      <div className="price-card-name">
                                                        <span>
                                                          ${selectedDate?.price}
                                                        </span>
                                                        <span className="hour">
                                                          <span>
                                                            {selectedDate?.date_length.replace(
                                                              "H",
                                                              ""
                                                            )}
                                                            H
                                                          </span>
                                                        </span>
                                                      </div>
                                                    </span>
                                                  </>
                                                ) : null}
                                              </ul>
                                            </div>
                                          </div>
                                          {user?.gender === "male" ? (
                                            <div className="date_details_desktop mt-4 pt-4">
                                              {alreadyMessaged ? (
                                                <div className="user-message-loader already-messaged">
                                                  Already Requested
                                                </div>
                                              ) : (
                                                <div className="verification_card_header">
                                                  <div className="">
                                                    <h4
                                                      style={{
                                                        fontWeight: "700",
                                                        letterSpacing:
                                                          "0.066px",
                                                      }}
                                                    >
                                                      Date Details
                                                    </h4>
                                                    <p
                                                      style={{
                                                        fontWeight: "300",
                                                        letterSpacing: "0.06px",
                                                        paddingTop: "1.1rem",
                                                      }}
                                                    >
                                                      {
                                                        selectedDate?.date_details
                                                      }
                                                    </p>
                                                  </div>
                                                  {/* <div className=""> */}
                                                  <MessageModal
                                                    date={selectedDate}
                                                    user={user}
                                                    userMessageNoModal={true}
                                                    close={() =>
                                                      dateSetIsOpen(false)
                                                    }
                                                  />
                                                  {/* </div> */}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="model_content verification_card_header">
                                              <div className="availabe_card_inner px-4">
                                                <ul className="date_action_model">
                                                  <li onClick={dateCloseModal}>
                                                    <BiChevronLeft
                                                      size={25}
                                                      color={"white"}
                                                    />
                                                    <span>Go back</span>
                                                  </li>
                                                  <li onClick={editDate}>
                                                    <BiEditAlt
                                                      size={20}
                                                      color={"white"}
                                                    />
                                                    <span>Edit</span>
                                                  </li>
                                                  <li onClick={deleteDate}>
                                                    <BiTrashAlt
                                                      size={20}
                                                      color={"white"}
                                                    />
                                                    <span>Delete</span>
                                                  </li>
                                                </ul>
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </Modal>
                                    {ladiesShow && (
                                      <div className="already-messaged">
                                        Ladies are not able to request dates
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                          </>
                          <SubHeading title="About me" />
                          <div className="image_wrap_slider about_me_card">
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                <H5>
                                  {userDetail?.body_type || user?.body_type}
                                </H5>
                                <p>Body Type</p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                {user?.max_education?.length > 15 ? (
                                  <h5
                                    className="education-font-1"
                                    style={{ wordBreak: "unset" }}
                                  >
                                    {userDetail?.max_education ||
                                      user?.max_education}
                                  </h5>
                                ) : (
                                  <h5
                                    className="education-font"
                                    style={{ wordBreak: "unset" }}
                                  >
                                    {userDetail?.max_education ||
                                      user?.max_education}
                                  </h5>
                                )}
                                <p>Education </p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                <H5>
                                  {toFeet(userDetail?.height || user?.height)}
                                </H5>
                                <p>Height</p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                <H5>
                                  {userDetail?.is_smoker || user?.is_smoker}
                                </H5>
                                <p>Smoker</p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                <H5>
                                  {userDetail?.ethnicity || user?.ethnicity}
                                </H5>
                                <p>Ethnicity</p>
                              </div>
                            </div>
                            <div className="about_me_card_inner">
                              <div className="inner-box-me">
                                {user?.occupation?.length > 15 ? (
                                  <h5
                                    className="administrat-font-1"
                                    style={{ wordBreak: "unset" }}
                                  >
                                    {userDetail?.occupation || user?.occupation}
                                  </h5>
                                ) : (
                                  <h5
                                    className="administrat-font"
                                    style={{ wordBreak: "unset" }}
                                  >
                                    {userDetail?.occupation || user?.occupation}
                                  </h5>
                                )}
                                <p>Occupation </p>
                              </div>
                            </div>
                          </div>
                          <div className="more_content pt-3">
                            <div className="text-left-more">
                              <h6 className=" text-left-more more-about">
                                More about{" "}
                                <span>
                                  {userDetail?.user_name || user?.user_name}
                                </span>
                              </h6>
                              <svg
                                className="d-none"
                                width="60"
                                height="2"
                                viewBox="0 0 95 2"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.110596 1.36728H94.3167"
                                  stroke="url(#paint0_linear)"
                                ></path>
                                <defs>
                                  <linearGradient
                                    id="paint0_linear"
                                    x1="105.948"
                                    y1="-1.61543"
                                    x2="8.2769"
                                    y2="-1.61543"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop
                                      stop-color="#FA789B"
                                      stop-opacity="0.01"
                                    ></stop>
                                    <stop
                                      offset="0.489981"
                                      stop-color="#F02D4E"
                                    ></stop>
                                    <stop
                                      offset="1"
                                      stop-color="#F24362"
                                      stop-opacity="0.01"
                                    ></stop>
                                  </linearGradient>
                                </defs>
                              </svg>
                              <p className="">
                                {userDescription}
                                {/* {user?.description} */}
                              </p>
                              {preview && (
                                <div className="button-wrapper profile-btn">
                                  <button
                                    type="button"
                                    className="edit"
                                    onClick={editHandle}
                                  >
                                    <a>Edit</a>
                                  </button>
                                  <button className="next" onClick={onSubmit}>
                                    {loading ? (
                                      <span className="spin-loader-button"></span>
                                    ) : (
                                      "Finish"
                                    )}
                                  </button>
                                </div>
                              )}
                              <div className="member-since">
                                <p>
                                  Member since{" "}
                                  {moment(
                                    userDetail?.created_at || user?.created_at
                                  ).format("MMM YYYY")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default reduxForm({
  form: "UserProfile", // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
})(UserProfile);
