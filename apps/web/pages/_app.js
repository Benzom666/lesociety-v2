import React from "react";
import App from "next/app";
import Head from "next/head";
import { createWrapper } from "next-redux-wrapper";
import createStore from "engine";
import "bootstrap/dist/css/bootstrap.css";
import "react-rangeslider/lib/index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  loadFromLocalStorage,
  removeSessionStorage,
} from "utils/sessionStorage";

import Router from "next/router";
import Loader from "@/modules/Loader/Loader";

import "styles/style.scss";
import { removeCookie } from "utils/cookie";
import LanscapeDecline from "@/core/LanscapeDecline";

class MyApp extends App {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      history: [],
      screenSize: undefined, // Initialize as undefined to match SSR
    };
  }

  getCurrentDimension = () => {
    if (typeof window !== "undefined") {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
  };

  componentDidMount() {
    const { asPath } = this.props.router;

    // Set actual screen size after mount (client-only)
    this.setState({ screenSize: this.getCurrentDimension() });

    // lets add initial route to `history`
    this.setState((prevState) => ({ history: [...prevState.history, asPath] }));
    Router.events.on("routeChangeStart", (url) => {
      this.setState({ isLoading: true });
      // console.log("I am Loading...");
    });
    Router.events.on("routeChangeComplete", (url) => {
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 2000);
      // console.log("I am Loaded...");
    });

    // hide all console logs and errors
    if (process.env.NODE_ENV === "production") {
      console.log = console.error = console.warn = function () {};
    }
    document.body.style.overflow = "unset";
    window.addEventListener("resize", this.updateDimension);
    
    // Load from localStorage (client-only)
    if (typeof window !== 'undefined') {
      loadFromLocalStorage();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimension);
  }

  updateDimension = () => {
    this.setState({ screenSize: this.getCurrentDimension() });
  };

  componentDidUpdate() {
    const { history } = this.state;
    const { asPath } = this.props.router;

    // if current route (`asPath`) does not equal
    // the latest item in the history,
    // it is changed so lets save it
    if (history[history.length - 1] !== asPath) {
      this.setState((prevState) => ({
        history: [...prevState.history, asPath],
      }));
    }
    if (process.env.NODE_ENV === "production") {
      console.log = console.error = console.warn = function () {};
    }
    document.body.style.overflow = "unset";
  }

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx });
    }
    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    const { asPath } = this.props.router;
    const accessToken = typeof window !== 'undefined' ? loadFromLocalStorage() : undefined;

    const lsLoader =
      (this.state.isLoading &&
        asPath !== "/user/user-profile" &&
        asPath !== "/auth/profile?edit=true" &&
        asPath !== "/auth/profile" &&
        asPath !== "/user/user-list" &&
        !asPath.includes("/user/user-profile/")) ||
      (this.state.isLoading && !accessToken);

    const islandScapeInMobile =
      this.state.screenSize?.width < 1181 &&
      this.state.screenSize?.width > this.state.screenSize?.height;

    if (islandScapeInMobile) {
      return <LanscapeDecline />;
    }

    return (
      <>
        <Head>
          <title>Le Society</title>
          <link rel="icon" href="/favicon.svg" />
          <link
            href="https://fonts.googleapis.com/css?family=Pacifico"
            rel="stylesheet"
          />
          <meta
            name="viewport"
            content="width=device-width, minimum-scale=1.0, maximum-scale = 1.0, user-scalable = no"
          />
        </Head>
        {lsLoader ? (
          <Loader />
        ) : (
          <Component
            {...pageProps}
            history={this.state.history}
            isLoading={this.state.isLoading}
          />
        )}

        <ToastContainer />
      </>
    );
  }
}

const wrapper = createWrapper(createStore);
export default wrapper.withRedux(MyApp);

