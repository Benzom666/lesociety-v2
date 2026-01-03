import Createdates from "modules/date/Createdates";
import HeaderLoggedIn from "@/core/loggedInHeader";
import Footer from "core/footer";
import useWindowSize from "/utils/useWindowSize";
import withAuth from "../../core/withAuth";

function Step1({ dispatch, ...props }) {
  const { width } = useWindowSize();

  return (
    <div className="inner-page">
      {/* {width > 767 && <HeaderLoggedIn />} */}
      <div className="inner-part-page">
        <div className="auth-section create-date-wrap">
          <Createdates />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default withAuth(Step1);
