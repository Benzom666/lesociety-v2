import Link from "next/link";
import Image from "next/image";
import LeSlogoWhite from "../assets/LeS logoWhite.png";
import MaskGroup5 from "../assets/img/Mask Group 5.png";
import Facebook from "../assets/img/FB.png";
import Twitter from "../assets/img/Twitter (1).png";
import Insta from "../assets/img/Insta (1).png";
import Tiktok from "../assets/img/Tiktok (1).png";

export default function Footer(props) {
  console.log(props);
  return (
    <footer className="d-flex home-footer-main" style={props.styleBackground}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mx-0 home-footer">
          <div className="ls-logo-footer">
            <div
              className="ls-logo mb-0"
              style={{ width: "45px", margin: "auto" }}
            >
              <Image src={LeSlogoWhite} alt="ls-logo-footer" sizes={10} />
            </div>
            <p
              style={{
                color: "white",
                paddingTop: "10px",
                letterSpacing: "5.2px",
              }}
            >
              LE SOCIETY
            </p>
          </div>
          <div className="footer-icon-box">
            <div className="footer-icon">
              <img src={Facebook.src} alt="fb-img" />
              <img src={Twitter.src} alt="twiter-img" />
              <img src={Insta.src} alt="Insta-img" />
              <img src={Tiktok.src} alt="tiktok-img" />
              {/* <img src={MaskGroup5.src} alt='youtube-img'/> */}
            </div>
            <div className="footer-text">
              <div className="footer-text-1 mb-2 mt-3">
                <span>
                  <Link legacyBehavior href="/FAQ">FAQ </Link>
                </span>
                |
                <span>
                  <Link legacyBehavior href="/SafetyTips"> Safety Tips </Link>
                </span>
                |
                <span>
                  <Link legacyBehavior href="/TermOfUse"> Terms </Link>
                </span>
                |
                <span>
                  <Link legacyBehavior href="/PrivacyPolicies"> Privacy </Link>
                </span>
                {/* |
                <span>
                  <Link legacyBehavior href="/OurStory"> Our Story </Link>
                </span> */}
              </div>
              <div className="footer-text-2 mb-2 mt-3">
                <span>© 2023 Le Society | All Rights Reserved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
