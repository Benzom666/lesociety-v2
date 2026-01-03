import React, { useState, useEffect } from "react";
import { reduxForm, reset } from "redux-form";
import { useSelector, useDispatch } from "react-redux";
import validate from "modules/auth/forms/validate/validate";
import useWindowSize from "utils/useWindowSize";
import { IoIosClose } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/router";
import UserCardDetail from "@/core/UserCardDetail";
import ConfirmDate from "./../../modules/date/confirmDate";
import { apiRequest } from "utils/Utilities";
import SkeletonDatesPreview from "../skeleton/Dates/SkeletonDatesPreview";

const DatePreview = (props) => {
  const { handleSubmit, invalid, pristine, submitting, onClose } = props;
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state?.authReducer.user);
  const cityState = useSelector((state) => state?.form?.ChooseCity?.values);
  const dateSuggestion = useSelector(
    (state) => state?.form?.CreateStepOne?.values
  );
  const priceState = useSelector((state) => state?.form?.CreateStepTwo?.values);
  const timeState = useSelector(
    (state) => state?.form?.CreateStepThree?.values
  );
  const dateDescription = useSelector(
    (state) => state?.form?.CreateStepFour?.values
  );
  const selectedDateData = useSelector(
    (state) => state?.form?.CreateStepOne?.values
  );
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [loader, setLoader] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (user?.images?.length > 0 && user?.images[0]) {
        setPageLoading(false);
      }
    }, 2000);
  }, []);

  const toggle = () => setConfirmPopup(!confirmPopup);

  const previousPage = () => {
    router.asPath.includes("drafted")
      ? router.push("/user/user-list")
      : router.query?.new_edit
      ? props.setPage(3)
      : router.back();
  };

  const postDate = async () => {
    setLoader(true);
    const data = {
      date_status: true,
    };
    try {
      const res = await apiRequest({
        method: "POST",
        url: `/date/update-draft-status`,
        data: data,
      });
      setLoader(false);
      router.push(
        {
          pathname: "/user/user-list",
          query: {
            city: cityState?.enter_city?.name,
            country: cityState.enter_country?.value,
            province: cityState?.enter_city?.province[0]?.short_code?.split(
              "-"
            )[1]
              ? cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
              : cityState?.enter_city?.province[0]?.short_code,
          },
        },
        "/user/user-list"
      );
      dispatch(reset("ChooseCity"));
      dispatch(reset("CreateStepOne"));
      dispatch(reset("CreateStepTwo"));
      dispatch(reset("CreateStepThree"));
      dispatch(reset("CreateStepFour"));
    } catch (e) {
      setLoader(false);
    }
  };

  const updateDate = async () => {
    setLoader(true);
    const data = {
      user_name: user?.user_name,
      date_id: selectedDateData?.dateId,
      date_details: dateDescription?.date_description,
    };
    try {
      const res = await apiRequest({
        method: "POST",
        url: `/date/update`,
        data: data,
      });
      setLoader(false);
      router.push(
        {
          pathname: "/user/user-list",
          query: {
            city: cityState?.enter_city?.name,
            country: cityState.enter_country?.value,
            province: cityState?.enter_city?.province[0]?.short_code?.split(
              "-"
            )[1]
              ? cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
              : cityState?.enter_city?.province[0]?.short_code,
          },
        },
        "/user/user-list"
      );
      dispatch(reset("ChooseCity"));
      dispatch(reset("CreateStepOne"));
      dispatch(reset("CreateStepTwo"));
      dispatch(reset("CreateStepThree"));
      dispatch(reset("CreateStepFour"));
    } catch (e) {
      setLoader(false);
    }
  };

  if (pageLoading) {
    return <SkeletonDatesPreview />;
  }

  return (
    <>
      {!confirmPopup ? (
        <>
          <div
            onClick={toggle}
            className="w-15 d-none d-sm-block cursor-pointer text-end pe-5"
          >
            <IoIosClose
              className="mouse-point"
              size={33}
              //style={{ color: " rgba(255, 255, 255, 0.5)" }}
              onClick={toggle}
            />
          </div>
          <div className="inner_container">
            <div className=" d-md-none justify-content-between align-items-center login-text mb-0 d-flex">
              <a onClick={previousPage}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-chevron-left"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </a>
              <h6 className="m-0 text-white-50">CREATE A NEW DATE</h6>
              <div onClick={toggle} className="w-15 cursor-pointer">
                <IoIosClose
                  className="mouse-point"
                  size={33}
                  style={{ color: " rgba(255, 255, 255, 0.5)" }}
                  onClick={toggle}
                />
              </div>
            </div>
            {/* {width < 768 && <h6 className="m-3 text-center">Date Preview</h6>} */}
            {width < 430 ? (
              <div
                className="step-wraps"
                //  style={{ marginLeft: '16px' }}
              >
                <ul>
                  <li className="complete active">
                    <span></span>
                  </li>
                  <li className=" complete active">
                    <span></span>
                  </li>
                  <li className="complete active">
                    <span></span>
                  </li>
                  <li className=" complete active">
                    <span></span>
                  </li>
                  <li className=" complete active">
                    <span></span>
                  </li>
                  <li className="complete active">
                    <span></span>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
          <div
            className={`${
              width > 767 ? "date-Preview-text" : "date-suggetion-text mt-4"
            } `}
          >
            <div className="inner_container preview-date-header">
              <div className="d-flex justify-content-center flex-column">
                {width > 767 && (
                  <>
                    <div
                      className="d-flex justify-content-center"
                      //style={{ margin:"0 auto",paddingLeft:"25px" }}
                    >
                      <h6
                        className="m-0 text-white"
                        style={{ fontWeight: "400px", fontSize: "16px" }}
                      >
                        CREATE A NEW DATE
                      </h6>
                      <div onClick={toggle} className="w-0 cursor-pointer">
                        {/* <IoIosClose
                          className="desk-close-first mouse-point"
                          size={33}
                          onClick={toggle}
                        /> */}
                      </div>
                    </div>
                    <div className="step-wraps steps_wraps_previewdate">
                      <ul style={{ margin: "0 auto" }}>
                        <li className=" complete active">
                          <span></span>
                        </li>
                        <li className="complete active">
                          <span></span>
                        </li>
                        <li className=" complete active">
                          <span></span>
                        </li>
                        <li className="complete active">
                          <span></span>
                        </li>
                        <li className=" complete active">
                          <span></span>
                        </li>
                        <li className="complete active">
                          <span></span>
                        </li>
                      </ul>
                    </div>
                    {/* <h6>Date Preview</h6>} */}
                  </>
                )}
                {width > 767 && (
                  <>
                    <div className="city-suggestion-text">
                      <h6>Date Preview</h6>
                      <p>
                        Please review all the details of your date before posting. You will only have an opportunity to edit your description in the future. 
                      </p>
                    </div>
                  </>
                )}
                {/* {width > 767 && 
                (
                  <IoIosClose
                    className="desk-close-icon-new"
                    size={32}
                    onClick={toggle}
                  />
                )} */}
              </div>
              {width < 768 && (
                <>
                  <h6 className="m-3 text-center">Date Preview</h6>
                  <p className="text-suggestion-city">
                    Please check all the details of your date before posting.
                    You will have a chance to edit it in the future
                  </p>
                </>
              )}
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="date-class-section choose-gender date-preview-card"
          >
            <div className="inner_container inner_container_Date_Preview_width">
              <UserCardDetail
                user={user}
                cityState={cityState}
                dateSuggestion={dateSuggestion}
                timeState={timeState}
                priceState={priceState}
                dateDescription={dateDescription}
              />
              {!confirmPopup && (
                <div className="bottom-mobile register-bottom">
                  <div className="secret-input type-submit next-prev">
                    {!router?.query?.new_edit && (
                      <button type="button" className="edit next">
                        <Link legacyBehavior href="/create-date/choose-city?edit=true">
                          <a>Edit</a>
                        </Link>
                      </button>
                    )}

                    <button
                      type="button"
                      className="next"
                      onClick={router?.query?.new_edit ? updateDate : postDate}
                    >
                      {loader ? (
                        <span className="spin-loader-button"></span>
                      ) : (
                        <>
                          <a className="forgot-passwrd">
                            {router?.query?.new_edit
                              ? "Update Date"
                              : "Post Date"}
                          </a>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </>
      ) : null}
      <ConfirmDate isOpen={confirmPopup} toggle={toggle} />
    </>
  );
};
export default reduxForm({
  form: "DatePreview",
  validate,
})(DatePreview);
