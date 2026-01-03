import React from "react";
import NoImage from "assets/img/no-image.png";
import SubHeading from "@/core/SubHeading";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import useWindowSize from "utils/useWindowSize";
import { Inputs } from "core";

function NoConversationShowView({ request, selectedTabIndex }) {
  const user = useSelector((state) => state.authReducer.user);
  const { width } = useWindowSize();
  const mobile = width < 768;

  const loading = false;

  const requestMessage =
    request || selectedTabIndex === 1 ? "requests" : "messages";

  return !mobile ? (
    <div className="no-message-card">
      <figure>
        <Image src={NoImage} alt="NoImage" width={205} height={140} />
      </figure>
      <h3>Sorry, no {requestMessage} yet</h3>
      <SubHeading
        title={
          user?.gender === "male"
            ? "Find a girl you like and lock in your first date!"
            : "Stay ahead of the crowd by creating more dates."
        }
      />
      <div className="d-flex align-items-center my-4 header_btn_wrap">
        <Link
          href={
            user?.gender === "male"
              ? "/user/user-list"
              : "/create-date/choose-city"
          }
        >
          <a className="create-date">
            {user?.gender === "male" ? "View Gallery" : "Create Date"}
          </a>
        </Link>
      </div>
    </div>
  ) : (
    <div className="no-message-card-mobile">
      <div>
        <div className="image">
          <Image src={NoImage} alt="NoImage" width={205} height={140} />

          <div className="sorry">
            <h3>Sorry, no {requestMessage} yet</h3>
            {user?.gender === "male" ? (
              <p>Find a girl you like and lock in your first date!</p>
            ) : (
              <p>Stay ahead of the crowd by creating more dates.</p>
            )}
          </div>
        </div>

        <div
          className="header_btn_wrap"
          style={{
            position: "fixed",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            background: "black",
            width: "100%",
            zIndex: "1000",
            padding: "0",
            margin: "0",
          }}
        >
          <Link
            href={
              user?.gender === "male"
                ? "/user/user-list"
                : "/create-date/choose-city"
            }
          >
            <a className="create-date">
              {user?.gender === "male" ? "View Gallery" : "Create Date"}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NoConversationShowView;
