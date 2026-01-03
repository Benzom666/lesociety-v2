import Head from "next/head";
import { connect, useSelector } from "react-redux";
import Login from "modules/auth/forms/login";
import HomePage from "./home";
import React from "react";

function Home({ dispatch }) {
  //   const user = useSelector((state) => state.authReducer.user);

  //   console.log('user', user)
  return (
    <React.Fragment>
      <Head>
        <title>Le Society</title>
        <link rel="icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <HomePage />
    </React.Fragment>
  );
}

export default Home;
