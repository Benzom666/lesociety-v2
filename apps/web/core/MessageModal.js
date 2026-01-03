import { Field, Form, Formik } from "formik";
import React, { useState, useRef, useEffect } from "react";
import { apiRequest } from "utils/Utilities";
import CustomInput from "Views/CustomInput";
import MessageSend from "assets/Send.svg";
import MessageSend2 from "assets/message_send2.png";
import * as Yup from "yup";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logout } from "@/modules/auth/authActions";
import StarIcon from "../assets/Star.png";
import StarBlankIcon from "../assets/Star_blank.png";
import MessageSend3 from "assets/message_new.svg";
import MessageSend4 from "assets/Path.svg";
import MessageSend5 from "assets/Send.svg";
import useWindowSize from "utils/useWindowSize";

function MessageModal({ user, date, toggle, userMessageNoModal, close }) {
  const [classPopup, setPopupClass] = React.useState("hide");
  const [receiverData, setReceiverData] = React.useState("");

  const [messageError, setMessageError] = React.useState("");
  const [textClass, setTextSlideClass] = React.useState("");
  const iconRef = useRef(null);

  const [isSuperInterested, setIsSuperInterested] = useState(false);

  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const [isIPadPro, setIsIPadPro] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isIPadPro =
        /Mac|iPod|iPad/.test(navigator.platform) &&
        navigator.maxTouchPoints > 1;
      setIsIPadPro(isIPadPro);
    };

    checkDevice();
  }, []);

  const router = useRouter();
  const dispatch = useDispatch();

  const { width } = useWindowSize();

  useEffect(() => {
    if (classPopup === "show") {
      initializeMoveIconPosition();
    }
  }, [classPopup]);

  const closePopup = () => {
    setPopupClass("hide");
  };

  const openPopup = (item) => {
    setPopupClass("show");
    setReceiverData(item);
  };

  const initializeMoveIconPosition = () => {
    const icon = document.querySelector(".icon-move");
    if (icon && iconRef.current) {
      const dummyIcon = iconRef.current;
      const dimension = dummyIcon.getBoundingClientRect();
      icon.style.left = `${dimension.left}px`;
      icon.style.top = `${dimension.top - 310}px`;
    }
  };

  const moveIcon = () => {
    setTextSlideClass("show");
    const element = document.querySelector(".icon-move");
    const target = document.getElementById("message-icon");
    if (target && element) {
      element.style.opacity = 1;
      const xT = target.offsetLeft;
      const yT = target.offsetTop;
      const xE = element.offsetLeft;
      const yE = element.offsetTop;
      // set elements position to their position for smooth animation
      element.style.left = xE + "px";
      element.style.top = yE + "px";
      // set their position to the target position
      // the animation is a simple css transition
      element.style.left = xT + 5 + "px";
      element.style.top = yT + 5 + "px";
      target.scrollIntoView();
    }
    setTimeout(() => {
      element.style.opacity = 0;
      closePopup();
      setTextSlideClass("");
      // reset elements position added by aakash prajapati
      element.style.left = "0px";
      element.style.top = "0px";
    }, 3000);
  };

  const handleUserMessageSubmit = async (values) => {
    // moveIcon();
    try {
      const data = {
        senderId: user?._id ?? "",
        recieverId: date?.user_data?.length > 0 ? date?.user_data[0]?._id : "",
        message: values.message ?? "",
        dateId: date?._id ?? "",
        isSuperInterested: false,
      };
      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/request`,
      });

      console.log("res", res);
      values.message = "";
      close();
    } catch (err) {
      setMessageError(err.response?.data?.message ?? "");
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
    return;
  };

  const handleSubmit = async (values) => {
    if (userMessageNoModal) {
      handleUserMessageSubmit(values);
      return;
    }

    moveIcon();
    console.log("values", values);
    try {
      const data = {
        senderId: user?._id ?? "",
        recieverId:
          receiverData?.user_data?.length > 0
            ? receiverData?.user_data[0]?._id
            : "",
        message: values.message ?? "",
        dateId: receiverData?._id ?? "",
        isSuperInterested: isSuperInterested,
      };
      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `chat/request`,
      });
      toggle();
      closePopup();
      console.log("res", res);
      values.message = "";
    } catch (err) {
      setMessageError(err.response?.data?.message ?? "");
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
    return;
  };

  return (
    <>
      {userMessageNoModal ? (
        <>
          <Formik
            initialValues={{
              message: "",
            }}
            validationSchema={Yup.object({
              message: Yup.string().required("Please enter your message"),
            })}
            onSubmit={(values) => {
              if (values.message?.trim() !== "") {
                handleSubmit(values);
              }
            }}
          >
            {(formProps) => {
              return (
                <Form>
                  <div className="user-message-popup">
                    <Field
                      className={`user-message-popup-input`}
                      placeholder="Type your message here…"
                      name="message"
                      id="message"
                      component={CustomInput}
                    />
                    <button
                      type="submit"
                      style={{
                        position: "absolute",
                        right: width > 767 ? "6%" : "10%",
                        bottom: "8%",
                        background: "transparent",
                        border: "none",
                      }}
                    >
                      <div
                        ref={iconRef}
                        style={{
                          background: "transparent",
                          border: "none",
                        }}
                      >
                        <Image
                          src={
                            formProps.values.message === ""
                              ? "https://secrettime-cdn.s3.eu-west-2.amazonaws.com/secret-time/uploads/message_send.png"
                              : MessageSend2
                          }
                          alt="send-btn"
                          onClick={() => {
                            handleSubmit(formProps.values);
                            formProps.resetForm();
                          }}
                          className="no-radius"
                          width={28}
                          height={28}
                        />
                      </div>
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </>
      ) : (
        <>
          <button
            onClick={() => openPopup(date)}
            className="next dangerous-btn"
          >
            Message
          </button>
          <div id="message-popup" className={`message-popup ${classPopup}`}>
            <span onClick={closePopup} className="close-button">
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
              "
              {receiverData?.user_data?.length > 0 &&
                receiverData?.user_data[0]?.tagline}
              "
            </p>
            <div
              className={`super__interested__star ${
                isSuperInterested ? "active" : ""
              }`}
              onClick={() => setIsSuperInterested(!isSuperInterested)}
            >
              <Image
                src={isSuperInterested ? StarIcon : StarBlankIcon}
                height={15}
                width={15}
              />

              <span className="super__interested">I’m Super Interested!</span>
            </div>
            <div>
              <Formik
                initialValues={{
                  message: "",
                }}
                validationSchema={Yup.object({
                  message: Yup.string().required("Please enter your message"),
                })}
                onSubmit={(values) => {
                  if (values.message?.trim() !== "") {
                    handleSubmit(values);
                  }
                }}
              >
                {(formProps) => {
                  return (
                    <Form className="w-100">
                      <div
                      // className="position-relative"
                      >
                        <Field
                          className={`position-relative ${textClass} ${
                            isSuperInterested
                              ? "is__super__interested__message__input"
                              : "message__modal__input"
                          }`}
                          placeholder="Type your message here…"
                          name="message"
                          id="message"
                          component={CustomInput}
                        />

                        {isSuperInterested && (
                          <div
                            style={{
                              position: "absolute",
                              left: "14%",
                              height: "50px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              src={StarIcon}
                              alt="star"
                              width={15}
                              height={15}
                              style={{
                                paddingTop: "10px !important",
                              }}
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          style={{
                            position: "absolute",
                            left: isIPadPro ? "73%" : "77%",
                            background: "transparent",
                            border: "none",
                            paddingBottom: "5px",
                            width: "auto",
                            borderRadius: "0",
                          }}
                          className="message-date-btn"
                        >
                          <div
                            ref={iconRef}
                            style={{
                              background: "transparent",
                              border: "none",
                            }}
                          >
                            {/* <Image
                              src={
                                formProps.values.message === ""
                                  ? "https://secrettime-cdn.s3.eu-west-2.amazonaws.com/secret-time/uploads/message_send.png"
                                  : MessageSend2
                              }
                              alt="send-btn"
                              type="submit"
                              onClick={() => {
                                handleSubmit(formProps.values);
                                formProps.resetForm();
                              }}
                              className="no-radius"
                              width={28}
                              height={28}
                            /> */}
                            <img
                              // src={
                              //   formProps.values.message === ""
                              //     ? "https://secrettime-cdn.s3.eu-west-2.amazonaws.com/secret-time/uploads/message_send.png"
                              //     : MessageSend2
                              // }
                              src={
                                formProps.values.message === ""
                                  ? "https://secrettime-cdn.s3.eu-west-2.amazonaws.com/secret-time/uploads/message_send.png"
                                  : "https://secrettime-cdn.s3.eu-west-2.amazonaws.com/secret-time/uploads/message_send2.png"
                              }
                              alt="send-btn"
                              onClick={() => {
                                handleSubmit(formProps.values);
                                formProps.resetForm();
                              }}
                              className="no-radius"
                              width={28}
                              height={28}
                            />
                          </div>
                        </button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
            <p className="tip">Tip: Maybe mention why you’re here.</p>
          </div>
        </>
      )}
    </>
  );
}

export default MessageModal;
