import React from "react";
import Image from "next/image";
import Link from "next/link";
import LeSlogoBlack from "../../assets/LeS logo Black.png";
import LeSlogoText from "../../assets/LeSociety Logo Black.png";
import useWindowSize from "utils/useWindowSize";

function FooterHeader() {
  const { width } = useWindowSize();

  return (
    <div className="footer__header">
      <div className="LeSociety-Icon-Black d-flex">
        <div className="ls-logo">
          <Image src={LeSlogoBlack} alt="ls-logo" sizes={10} />
        </div>
        {width > 768 && (
          <div className="ls-text">
            <Image
              className="leSocitey-heading"
              src={LeSlogoText}
              sizes={100}
            />
          </div>
        )}
      </div>

      <div>
        <Link legacyBehavior href="/auth/login">
          <button className="login__button">Log In</button>
        </Link>
        <Link legacyBehavior href="/">
          <button className="home__button">Home</button>
        </Link>
      </div>
    </div>
  );
}

export default FooterHeader;
