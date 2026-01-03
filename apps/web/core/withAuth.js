import React from "react";
import { useRouter } from "next/router";
import { loadFromLocalStorage } from "utils/sessionStorage";

const withAuth = (WrappedComponent) => {
  return (props) => {
    // checks whether we are on client / browser or server.
    if (typeof window !== "undefined") {
      const Router = useRouter();

      if (Router.asPath === "/") {
        return <WrappedComponent {...props} />;
      }

      // const accessToken = getCookie("auth");
      const accessToken = loadFromLocalStorage();

      // If there is no access token we redirect to "/" page.
      if (!accessToken) {
        // Router.replace("/auth/login");
        Router.replace("/");
        return null;
      }
      if (accessToken?.isLoggedIn) {
        const userLogin = accessToken?.user;

        if (userLogin?.status !== 2) {
          if (
            Router?.asPath?.includes("/user") ||
            Router?.asPath?.includes("/create-date") ||
            Router?.asPath?.includes("/messages") ||
            Router?.asPath?.includes("/chat") ||
            Router?.asPath?.includes("/future-date") ||
            // Router?.asPath?.includes("/home") ||
            Router?.asPath?.includes("/howItWork") ||
            Router?.asPath?.includes("/payment") ||
            Router?.asPath?.includes("/verified-profile")
          ) {
            Router.back();
            return null;
          }
        }

        if (
          userLogin?.status === 2 &&
          userLogin?.verified_screen_shown === true
        ) {
          if (
            Router?.asPath !== "/auth/update-profile" &&
            (Router?.asPath?.includes("/auth") ||
              Router?.asPath?.includes("/user/verified"))
          ) {
            Router.replace("/user/user-list");
            return null;
          }
        }
      }

      // If this is an accessToken we just render the component that was passed with all its props

      return <WrappedComponent {...props} />;
    }

    // If we are on server, return null
    return null;
  };
};

export default withAuth;
