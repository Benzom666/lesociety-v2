import React, { useRef, useState, useEffect } from "react";
import UserImg from "assets/img/profile.png";
import UserImg3 from "assets/img/user-3.png";
import UserImg4 from "assets/img/user-4.png";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { CustomIcon } from "core/icon";
import Modal from "react-modal";
import Link from "next/link";
import H5 from "./H5";
import { apiRequest, dateCategory } from "utils/Utilities";
import { IoIosClose } from "react-icons/io";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { HiLockOpen } from "react-icons/hi";
import { useRouter } from "next/router";
import userImageMain from "../assets/img/user2.jpg";
import ImageShow from "@/modules/ImageShow";
import MessageModal from "./MessageModal";
import { logout } from "@/modules/auth/authActions";
import verifiedIcon from "assets/Group 6.png";
import useWindowSize from "utils/useWindowSize";
import { HiBadgeCheck } from "react-icons/hi";
import StarIcon from "../assets/Star.png";
import ShowLessIcon from "../assets/show-less-icon.png";

const UserCardList = ({
  date,
  cardId,
  growDiv,
  dateId,
  openPopup,
  closePopup,
  isDesktopView,
  ref,
  loading,
  setLoader,
  alreadyMessagedFromUser,
  receiverData,
  setAlreadyMessagedFromUser,
}) => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [dateDetailsIsOpen, setDateDetailsIsOpen] = React.useState(false);
  const [dateMobileDetailsIsOpen, setMobileDateDetailsIsOpen] =
    React.useState(false);
  const [loader, setLoading] = useState(true);
  const [msgModal, setMsgModal] = React.useState(false);
  const [alreadyMessaged, setAlreadyMessaged] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const user = useSelector((state) => state.authReducer.user);
  const router = useRouter();
  const growRef = useRef(null);
  const { width } = useWindowSize();

  const logoTopPostion = width > 768 ? "100px" : "-100px";

  const isIPad = /iPad/.test(navigator.userAgent);

  const dispatch = useDispatch();

  const [mobileLoader, setMobileLoading] = useState(false);

  const handleMessageModal = () => {
    setMessageModal(!messageModal);
    // setDateDetailsIsOpen(false);
  };

  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }

  const category = dateCategory.find(
    (item) =>
      item?.label === date?.standard_class_date ||
      item?.label === date?.middle_class_dates ||
      item?.label === date?.executive_class_dates
  );

  useEffect(() => {
    if (
      (dateDetailsIsOpen || dateMobileDetailsIsOpen) &&
      user?.gender === "male"
    ) {
      setLoading(true);

      setMobileLoading(true);
      checkMessage();
    }
  }, [dateDetailsIsOpen, dateMobileDetailsIsOpen]);

  const checkMessage = async () => {
    try {
      const data = {
        recieverId: date?.user_data?.length > 0 ? date?.user_data[0]?._id : "",
        dateId: date?._id ?? "",
      };
      const res = await apiRequest({
        params: data,
        method: "GET",
        url: `chat/exist`,
      });
      setTimeout(() => {
        setLoading(false);
        setMobileLoading(false);
      }, 3000);
      if (res?.data?.message) {
        setAlreadyMessaged(true);
      }
    } catch (err) {
      setMobileLoading(false);
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

  async function toggleGrowDiv(id) {
    closePopup();

    let divElement = document.getElementById(id);
    if (divElement?.clientHeight) {
      divElement.style.height = 0;
    } else {
      divElement.style.height = growRef.current.clientHeight + "px";
    }
  }

  // destroy above toggleGrowDiv
  const destroyGrowDiv = (id) => {
    let divElement = document.getElementById(id);
    divElement.style.height = 0;
  };

  const toggle = () => setDateDetailsIsOpen(!dateDetailsIsOpen);
  const toggleMsgModal = () => setMsgModal(!msgModal);

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0",
  };
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "310px",
      background: "transparent",
      height: "100%",
    },
  };

  const messagedFromUserDone =
    alreadyMessagedFromUser && receiverData?._id === date?._id ? true : false;

  useEffect(() => {
    if (messagedFromUserDone) {
      setDateDetailsIsOpen(false);
      setMobileDateDetailsIsOpen(false);
      setMsgModal(false);
      destroyGrowDiv(cardId);
    }
  }, [messagedFromUserDone]);

  const myLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };

  // const onLoad = useCallback(() => {
  //   setSrc(src);
  // }, [src]);

  if (loader && dateDetailsIsOpen && user?.gender === "male") {
    return (
      <div className="date_card_wrap">
        <div className="date_details_desktop_loading">
          <Image
            src={require("../assets/squareLogoNoBack.gif")}
            alt="loading..."
            className=""
            width={100}
            height={100}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div
        style={{
          position: "relative",
        }}
      >
        {date?.user_data?.length > 0 &&
          !dateDetailsIsOpen &&
          date?.user_data[0]?.documents_verified && (
            <div
              class="gallery_verified_icon"
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                zIndex: "1",
              }}
            >
              {/* <Image
                src={verifiedIcon}
                alt="user image"
                width={25}
                height={25}
                loader={myLoader}
                priority={true}
                blurDataURL="https://img.freepik.com/premium-photo/black-stone-texture-dark-slate-background-top-view_88281-1206.jpg?w=2000"
                // className="gallery_verified_icon"
              /> */}
              <HiBadgeCheck color={"white"} size={25} />
            </div>
          )}

        <div className="date_card_wrap" ref={ref}>
          <figure
            className="user_img_date"
            onClick={
              isDesktopView
                ? !dateDetailsIsOpen && toggle
                : () => {
                    growDiv(cardId);
                    setMobileDateDetailsIsOpen(!dateMobileDetailsIsOpen);
                    setAlreadyMessagedFromUser(false);
                  }
            }
          >
            {!dateDetailsIsOpen ? (
              <>
                <Image
                  src={date?.user_data[0]?.images[0] ?? ""}
                  alt="user image"
                  width={500}
                  height={500}
                  loader={myLoader}
                  // onLoadingComplete={onLoad}
                  priority={true}
                  blurDataURL="https://img.freepik.com/premium-photo/black-stone-texture-dark-slate-background-top-view_88281-1206.jpg?w=2000"
                />

                {/* <ImageShow
                  alt="not fount"
                  width={500}
                  height={500}
                  // setLoading={setLoader}
                  src={date?.user_data[0]?.images[0] ?? ""}
                  placeholderImg={date?.user_data[0]?.images[0]}
                /> */}
                <div className="user-details">
                  <div className="user-top-sec">
                    <h5 className="">
                      <span>
                        {" "}
                        {date?.user_name},{" "}
                        <span className="user_age">
                          {date?.user_data[0]?.age || "-"}
                        </span>
                      </span>
                      {/* <span className="price_per_hour">
                        ${date?.price} / <small>{date?.date_length}</small>
                      </span> */}
                    </h5>
                  </div>
                  <div className="user_location">
                    <span className="d-flex align-items-start">
                      <span className="address-wrap">
                        <svg
                          width="12"
                          height="17"
                          viewBox="0 0 12 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M0.214355 5.46429C0.214355 6.36877 0.440493 7.26558 0.870389 8.06101L5.37983 16.2167C5.43986 16.3255 5.55425 16.3928 5.67864 16.3928C5.80303 16.3928 5.91743 16.3255 5.97746 16.2167L10.4886 8.05832C10.9168 7.26558 11.1429 6.36874 11.1429 5.46425C11.1429 2.45134 8.69159 0 5.67864 0C2.66569 0 0.214355 2.45134 0.214355 5.46429ZM2.94651 5.46429C2.94651 3.95781 4.17217 2.73216 5.67864 2.73216C7.18512 2.73216 8.41077 3.95781 8.41077 5.46429C8.41077 6.97076 7.18512 8.19641 5.67864 8.19641C4.17217 8.19641 2.94651 6.97076 2.94651 5.46429Z"
                            fill="#F24462"
                          />
                        </svg>
                        <span className="address px-1">
                          {date?.location}, {date?.province}
                        </span>
                      </span>
                      <div className="tag_wrap">
                        <ul>
                          <li style={{ display: "flex", alignItems: "center" }}>
                            <span>{category?.icon}</span>
                            {/* <span className="labelofcard-1">{category?.label}</span> */}
                            <span className="labelofCard-2">
                              {category?.label}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </span>
                    <div className="user__aspiration">
                      <span className="user__aspiration1">
                        {date?.user_data?.length > 0 &&
                          date?.user_data[0]?.aspirationName}
                      </span>
                      <span className="user__aspiration2">ASPIRING</span>
                    </div>
                  </div>
                </div>
              </>
            ) : msgModal ? (
              <div>
                <div id="message-popup" className={`message-popup`}>
                  <span onClick={toggle} className="close-button">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.9924 12.9926L1.00244 1.00006"
                        stroke="white"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12.9887 1.00534L1.00873 12.9853"
                        stroke="white"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="msg">
                    “If you’re not amazed by the stars then we can’t hang”
                  </p>
                  <div>
                    <input className="" placeholder="Type your message here…" />
                    <svg
                      onClick={toggleMsgModal}
                      className="icon-move-1"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.6048 0.407386C13.2546 0.0480202 12.7364 -0.0858618 12.2532 0.0550622L0.9856 3.33166C0.47579 3.4733 0.114443 3.87988 0.0171013 4.39639C-0.0823407 4.92205 0.265006 5.58935 0.718788 5.86838L4.24193 8.03376C4.60328 8.25573 5.06967 8.20008 5.36869 7.89845L9.40303 3.83901C9.6061 3.62762 9.94224 3.62762 10.1454 3.83901C10.3484 4.04336 10.3484 4.37455 10.1454 4.58594L6.104 8.64612C5.80426 8.94698 5.74826 9.41556 5.96883 9.77914L8.12154 13.3377C8.37361 13.7604 8.80782 14 9.28396 14C9.34003 14 9.40303 14 9.4591 13.9929C10.0053 13.9225 10.4395 13.5491 10.6005 13.0206L13.9409 1.76735C14.088 1.2882 13.9549 0.766759 13.6048 0.407386Z"
                        fill="#686868"
                      />
                    </svg>
                  </div>
                  <p className="tip">Tip: Maybe mention why you’re here.</p>
                </div>
              </div>
            ) : (
              <div
                className="date_details_desktop"
                //onClick={toggle}
              >
                <div>
                  <div onClick={toggle} className="less-txt">
                    Show less
                  </div>
                  <div>
                    <h4
                      style={{
                        fontWeight: "700",
                        letterSpacing: "0.066px",
                        marginTop: "20px",
                        marginBottom: "5px",
                      }}
                    >
                      Date Details
                    </h4>
                    <div className="date__detail__time__frame">
                      <span className="time__frame">Time Frame:</span>
                      <span className="time__value"> {date?.date_length}</span>
                    </div>
                    <div className="time__together">
                      (Estimated Time Together)
                    </div>
                    <div className="interested__only">
                      <span className="interested__span1">Interested?</span>
                      <span className="interested__span2">
                        Take her out on her choice of date experience.
                      </span>
                    </div>
                    <div className="super__interested__div">
                      <Image src={StarIcon} height={15} width={15} />

                      <span className="super__interested">
                        Super Interested?
                      </span>
                    </div>
                    <div className="support__aspirations__div">
                      <span className="support__aspirations">
                        Support Her Aspirations:
                      </span>
                      <span className="support__price"> ${date?.price}</span>
                    </div>
                    <div className="suggested__gift">(Suggested Gift)</div>
                    <div className="date__description__desktop">
                      <div
                        style={{
                          fontWeight: "300",
                          letterSpacing: "0.06px",
                          fontSize:
                            date?.date_details.length <= 350 ? "14px" : "12px",
                          // overflowY: "scroll",
                          // height:
                          //   date?.date_details.length <= 400 ? "auto" : "130px",
                        }}
                      >
                        {date?.date_details}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="button-wrapper">
                  {user?.gender === "male" && !alreadyMessaged && (
                    // <button
                    //   onClick={handleMessageModal}
                    //   // onClick={openPopup}
                    //   className="next"
                    // >
                    //   Message
                    // </button>
                    <MessageModal
                      date={date}
                      user={user}
                      alreadyMessaged={alreadyMessaged}
                      receiverData={receiverData}
                      closePopup={closePopup}
                      toggle={toggle}
                    />
                  )}
                  <button
                    type="button"
                    className="edit view__profile__btn"
                    onClick={() =>
                      router.push(`/user/user-profile/${date?.user_name}`)
                    }
                  >
                    {isIPad ? "Profile" : "View profile"}
                  </button>
                </div>
              </div>
            )}
          </figure>
          {!isDesktopView && (
            <div style={dateId !== cardId ? { height: 0 } : {}} id={cardId}>
              <div ref={growRef} className="date_details">
                {/* {
                mobileLoader ? (
                  <div className="">
                    <div className="d-flex justify-content-center">
                      <Image
                        src={require("../assets/squareLogoNoBack.gif")}
                        alt="loading..."
                        className=""
                        width={50}
                        height={50}
                      />
                    </div>
                  </div>
                ) : ( */}
                <>
                  <h4>Date Details</h4>
                  <div className="date__detail__time__frame">
                    <span className="time__frame">Time Frame:</span>
                    <span className="time__value"> {date?.date_length}</span>
                  </div>
                  <div className="time__together">
                    (Estimated Time Together)
                  </div>
                  <div className="interested__only">
                    <span className="interested__span1">Interested?</span>
                    <span className="interested__span2">
                      Take her out on her choice of date experience.
                    </span>
                  </div>
                  <div className="super__interested__div">
                    <Image src={StarIcon} height={15} width={15} />

                    <span className="super__interested">Super Interested?</span>
                  </div>
                  <div className="support__aspirations__div">
                    <span className="support__aspirations">
                      Support Her Aspirations:
                    </span>
                    <span className="support__price"> ${date?.price}</span>
                  </div>
                  <div className="suggested__gift">(Suggested Gift)</div>
                  <p>{date?.date_details}</p>
                  <div className="button-wrapper mt-3">
                    {mobileLoader && (
                      <div className="d-flex justify-content-center w-50 align-items-center">
                        <span className="spin-loader-button"></span>
                      </div>
                    )}
                    {!mobileLoader &&
                      user?.gender === "male" &&
                      !messagedFromUserDone &&
                      !alreadyMessaged && (
                        <button onClick={openPopup} className="next">
                          Message
                        </button>
                      )}
                    <button
                      type="button"
                      className="edit"
                      onClick={() =>
                        router.push(`/user/user-profile/${date?.user_name}`)
                      }
                    >
                      <a>View profile</a>
                    </button>
                  </div>
                  <div
                    onClick={() => {
                      growDiv(cardId);
                      setMobileDateDetailsIsOpen(!dateMobileDetailsIsOpen);
                      setAlreadyMessagedFromUser(false);
                    }}
                    className="mobile__less__txt"
                  >
                    <Image src={ShowLessIcon} height={10} width={10} />
                    <span>Show less</span>
                  </div>
                </>
                {/* )} */}
              </div>
            </div>
          )}
        </div>
        {!isDesktopView && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            className="intrested_model"
          >
            <div className="model_content">
              <IoIosClose
                size={25}
                className="close_btn"
                onClick={closeModal}
                color={"#A8A8A8"}
              />
              <H5>Clark Kent is</H5>
              <CustomIcon.IntrestedText color={"white"} size={140} />
              <Slider {...settings}>
                <div>
                  <figure>
                    <Image
                      src={UserImg}
                      alt="user image"
                      width={500}
                      height={600}
                    />
                    <span className="image_tagline">
                      “I want to reveal my secret. I am Superman.”
                    </span>
                  </figure>
                </div>
                <div>
                  <figure>
                    <Image
                      src={UserImg3}
                      alt="user image"
                      width={500}
                      height={600}
                    />
                    <span className="image_tagline">
                      “I want to reveal my secret. I am Superman.”
                    </span>
                  </figure>
                </div>
                <div>
                  <figure>
                    <Image
                      src={UserImg4}
                      alt="user image"
                      width={500}
                      height={600}
                    />
                    <span className="image_tagline">
                      “I want to reveal my secret. I am Superman.”
                    </span>
                  </figure>
                </div>
                <div>
                  <figure>
                    <Image
                      src={UserImg}
                      alt="user image"
                      width={500}
                      height={600}
                    />
                    <span className="image_tagline">
                      “I want to reveal my secret. I am Superman.”
                    </span>
                  </figure>
                </div>
              </Slider>
              <div className="d-flex align-items-center my-4 header_btn_wrap">
                <Link legacyBehavior href="/messages">
                  <a className="create-date">REPLY BACK</a>
                </Link>
              </div>
              <div className="my-4 bottom_content">
                <Link legacyBehavior href="/user/user-profile">
                  <a className="view_profile">
                    <HiLockOpen /> View Profile
                  </a>
                </Link>
                <p>Clark Kent has granted you the access to his profile</p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }
};

export default UserCardList;
