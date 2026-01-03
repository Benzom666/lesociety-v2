import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import withAuth from "../core/withAuth";
import LeSlogoWhite from "../assets/LeS logoWhite.png";
import HomePageLogo from "../assets/homeLogo.png";
import LeSlogoText from "../assets/img/LeSocietylogotext.png";
import Sun from "../assets/svg/sun.svg";
import Bottle from "../assets/svg/bottle.svg";
import Dine from "../assets/svg/dine.svg";
import Ticket from "../assets/svg/ticket.svg";
import Paint from "../assets/svg/paint.svg";
import Sport from "../assets/svg/sport.svg";
import Moon from "../assets/svg/moon.svg";
import Gentalman4 from "../assets/img/Gentalman_4.png";
import GentalmanHomePage from "../assets/homePage/iPhone 13 Pro-gentleman.png";
import Ladies4 from "../assets/img/Ladies4.png";
import LadiesHomePage from "../assets/homePage/iPhone 13 Pro-Ladies.png";
import Goal4 from "../assets/img/Goal4.png";
import Choice4 from "../assets/img/Choice4.png";
import Ladies from "../assets/img/Ladies.png";
import Goal from "../assets/img/Goal.png";
import Choice from "../assets/img/Choice.png";
import HomePageMainSection from "@/core/HomePageMainSection";
import HomePageCardSection from "@/core/HomePageCardSection";
import HomeFooter from "@/core/HomeFooter";
import { content } from "@/core/HomePageContent";
import HomePageMiddleNav from "@/core/HomePageMiddleNav";
import HomePageCardSectionMobile from "@/core/HomePageCardSectionMobile";
import useWindowSize from "utils/useWindowSize";
import Loader from "@/modules/Loader/Loader";
import NewHomePageMainSection from "@/core/NewHomePageMainSection";
import AccelerateToFutureOfDating from "@/core/AccelerateToFutureOfDating";

const style1 = {
  // opacity: "0.9",
  // backgroundColor: "#1A1A1A",
  opacity: "1",
  backgroundColor: "transparent",
};
const style2 = {
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
};
const styleBackground = {
  backgroundColor: "#000000",
};
function HomePage({ items }) {
  const { width } = useWindowSize();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  }, [loading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.document.body.style.backgroundColor = "#080808";
    }
  }, []);
  const desktop = width > 768;

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
      // also hide scrollbar for all browsers
      document.documentElement.style.overflow = "hidden";
    } else {
      // scroll to top

      document.body.style.overflow = "unset";
      // also unhide scrollbar for all browsers
      document.documentElement.style.overflow = "unset";
    }
  }, [loading]);

  return (
    <>
      <div className="inner-part-page auth-section home_page_style  new__home__page">
        {loading && (
          <div className="home__loader__layout">
            <div className="home__loader__section">
              <Loader />
            </div>
          </div>
        )}
        <div className="home-page-navbar">
          <nav className="navbar navbar-dark bg-#080808">
            <div className="LeSociety-Icon-White">
              <Image
                src={HomePageLogo}
                alt="ls-logo"
                height={260}
                width={279}
              />
            </div>
          </nav>
        </div>

        <NewHomePageMainSection
          title="LADIES"
          maincardImage={LadiesHomePage}
        ></NewHomePageMainSection>

        {!loading && <HomePageMiddleNav style={style1} styleText={style2} />}

        <NewHomePageMainSection
          title="GENTLEMEN"
          maincardImage={GentalmanHomePage}
        ></NewHomePageMainSection>

        <AccelerateToFutureOfDating />

        <HomeFooter logo={LeSlogoWhite} styleBackground={styleBackground} />
      </div>
    </>
  );
}
export default withAuth(HomePage);
// export default HomePage;
