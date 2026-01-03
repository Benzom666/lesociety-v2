import React, { useState, useEffect, useRef } from "react";
import { Field, reduxForm, initialize } from "redux-form";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import validate from "modules/auth/forms/validate/validate";
import { CustomIcon } from "core/icon";
import { useRouter } from "next/router";
import useWindowSize from "utils/useWindowSize";
import { IoIosClose } from "react-icons/io";
import { apiRequest } from "utils/Utilities";
import DateWarningModal from "./DateWarningModal";
import { findDOMNode } from "react-dom";

const CreateStepFour = (props) => {
  const {
    handleSubmit,
    previousPage,
    invalid,
    pristine,
    reset,
    submitting,
    onClose,
    confirmPopup,
  } = props;
  const state = useSelector((state) => state?.form?.CreateStepFour);
  const user = useSelector((state) => state?.authReducer.user);
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [hideModal, setHideModal] = useState(false);
  const [val, setVal] = useState("");
  const [showWarningPopup, setShowWarningPopup] = useState(
    user?.date_warning_popup || false
  );
  const [showAnimation, setShowAnimation] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (user?.date_warning_popup && !hideModal) {
      setHideModal(true);
    }
  }, [user?.date_warning_popup]);

  useEffect(() => {
    if (!hideModal && val.length > 0) {
      if (inputRef.current) {
        const node = findDOMNode(inputRef.current);
        const inputEl = node.getElementsByTagName("textarea");
        if (inputEl.length > 0) inputEl[0].blur();
      }
      setShowWarningPopup(true);
      setTimeout(() => {
        setShowAnimation(true);
      }, 50);
    }
  }, [hideModal, val]);

  useEffect(() => {
    if (hideModal) {
      setShowAnimation(false);
      setTimeout(() => {
        setShowWarningPopup(false);
      }, 2000);
    }
  }, [hideModal]);

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

  const postDate = async () => {
    setLoader(true);
    if (router?.query?.new_edit) {
      setLoader(false);
      return;
    }
    const data = {
      location: cityState?.enter_city?.name,
      country_code: cityState?.enter_country?.value,
      country: cityState?.enter_country?.label,
      province: cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
        ? cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
        : cityState?.enter_city?.province[0]?.short_code,
      [dateSuggestion?.search_type?.category]:
        dateSuggestion?.search_type?.label,
      date_length: timeState?.education,
      price: priceState?.education,
      date_details: dateDescription?.date_description,
      user_name: user?.user_name,
      date_status: false,
      isUpdate: router?.query?.edit ? Boolean(router?.query.edit) : undefined,
    };

    try {
      const res = await apiRequest({
        method: "POST",
        url: `/date`,
        data: data,
      });
      if (res?.data?.data?._id) {
        dispatch(
          initialize("CreateStepOne", {
            ...dateSuggestion,
            dateId: res?.data?.data?._id,
          })
        );
      }
      setLoader(false);
    } catch (e) {
      setLoader(false);
    }
  };

  const updateDate = async () => {
    setLoader(true);
    const data = {
      date_id: dateSuggestion?.dateId,
      location: cityState?.enter_city?.name,
      country_code: cityState?.enter_country?.value,
      country: cityState?.enter_country?.label,
      province: cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
        ? cityState?.enter_city?.province[0]?.short_code?.split("-")[1]
        : cityState?.enter_city?.province[0]?.short_code,
      [dateSuggestion?.search_type?.category]:
        dateSuggestion?.search_type?.label,
      date_length: timeState?.education,
      price: priceState?.education,
      date_details: dateDescription?.date_description,
      user_name: user?.user_name,
      date_status: false,
      isUpdate: router?.query?.edit ? Boolean(router?.query.edit) : undefined,
    };
    try {
      const res = await apiRequest({
        method: "POST",
        url: `/date/update`,
        data: data,
      });
      setLoader(false);
    } catch (e) {
      setLoader(false);
    }
  };

  const { width } = useWindowSize();

  const changeHandler = (e) => {
    if (!showWarningPopup) {
      setVal(e.target.value);
    } else {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (showWarningPopup) {
      // stop scrolling page
      document.body.style.overflow = "hidden";
    } else {
      // allow scrolling page
      document.body.style.overflow = "unset";
    }
  }, [showWarningPopup]);

  return (
    <>
      {showWarningPopup && (
        <DateWarningModal
          showAnimation={showAnimation}
          setHideModal={setHideModal}
          hideModal={hideModal}
          val={val}
        />
      )}

      <>
        {!confirmPopup ? (
          <div className="outer_container">
            <div className="inner_container">
              <div className="d-flex d-md-none justify-content-between align-items-center login-text mb-0">
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
                <h6 className="m-0 text-white-50 text-uppercase">
                  Create a New Date
                </h6>
                <IoIosClose
                  className="mouse-point"
                  size={32}
                  style={{ color: " rgba(255, 255, 255, 0.5)" }}
                  onClick={onClose}
                />
              </div>
              {width > 767 && (
                <div
                  className="d-flex justify-content-center"
                  //style={{ marginLeft: "22px" }}
                >
                  <h3 className="text-center text-uppercase">
                    Create a New Date
                  </h3>
                  {/* <IoIosClose
              className="desk-close-icon mouse-point"
              size={32}
              onClick={toggle}
            /> */}
                </div>
              )}
              <div
                className="step-wraps"
                // style={{ marginLeft: "10px" }}
              >
                <ul>
                  <li className="complete active">
                    <span></span>
                  </li>
                  <li className="complete active">
                    <span></span>
                  </li>
                  <li className="complete active">
                    <span></span>
                  </li>
                  <li className="complete active">
                    <span></span>
                  </li>
                  <li className="active">
                    <span></span>
                  </li>
                  <li>
                    <span></span>
                  </li>
                </ul>
              </div>
            </div>
            <>
              {" "}
              <div className="date-suggetion-text">
                <div
                  className="inner_container"
                  //style={{ paddingRight: "35px", paddingLeft: "35px" }}
                >
                  <h6>
                    {" "}
                    {router?.query?.new_edit ? "Edit" : "Describe"} your date.
                  </h6>
                  <p>
                    {router?.query?.new_edit
                      ? "You can only edit your date description."
                      : "Write more about your date suggestion, and why someone should choose you as their date."}
                  </p>
                </div>
              </div>
              <form
                onSubmit={handleSubmit}
                className="date-class-section choose-gender"
                style={{ paddingRight: "10px", paddingLeft: "10px" }}
              >
                <div className="inner_container">
                  <div className="mb-5 date-description">
                    <Field
                      ref={inputRef}
                      withRef
                      name="date_description"
                      type="text"
                      validationLength={500}
                      component={Inputs.textarea}
                      //label="Describe_Date_Details"
                      placeholder="Help our gentlemen understand your choice for this date and give them insight into your personality. This will help them know what to expect from the experience. (You can also include expectations, your availability or any rules you might have.)"
                      onChange={changeHandler}
                      value={val}
                    />
                  </div>
                </div>
                {/* {width > 767 && (
                    <div className="date-suggetion-text mb-5">
                        <div className="inner_container">
                            <h6>Want To Offer <br /> A Free Date To Mr. Right?</h6>
                            <p>How much money does he need to be making per year for you to offer a free date?</p>   
                        </div>
                    </div>
                 )}    */}
                <div className="inner_container">
                  <>
                    {/* <div className="mb-4">
                                <div className="secret-input type-text select-wrap-icon">
                                    <select className="form-control">
                                        <option>Minimum yearly income</option>
                                        <option>Minimum yearly income</option>
                                        <option>Minimum yearly income</option>
                                        <option>Minimum yearly income</option>
                                    </select>
                                </div>    
                            </div> */}
                    {/* <div className="mb-5">
                                <Field
                                    name="education"
                                    options={education_plan}
                                    value={education_plan}
                                    component={Inputs.checkboxField}
                                />
                            </div> */}
                    <div className="mb-2 text-center">
                      <CustomIcon.Diamond color={"#fff"} size={120} />
                    </div>
                  </>

                  <div
                    className="mb-8 bottom-content text-center"
                    style={{ marginBottom: "28px" }}
                  >
                    <p style={{ fontSize: "16px", paddingBottom: "30px" }}>
                      Thank you for being one of our early adopters! To show you
                      our appreciation, we will keep your posts active until you
                      delete it. This allows you to earn multiple times for each
                      post. Goodluck!
                    </p>
                  </div>
                  <div className="bottom-mobile register-bottom">
                    <div className="secret-input type-submit next-prev">
                      {!confirmPopup && (
                        <button
                          type="submit"
                          className="next"
                          onClick={router?.query?.edit ? updateDate : postDate}
                          disabled={!state?.values?.date_description || invalid}
                        >
                          {loader ? (
                            <span className="spin-loader-button"></span>
                          ) : (
                            <>
                              Next <FiArrowRight />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </>
          </div>
        ) : null}
        {/* <ConfirmDate isOpen={confirmPopup} toggle={toggle} /> */}
      </>
    </>
  );
};
export default reduxForm({
  form: "CreateStepFour",
  destroyOnUnmount: false,
  validate,
})(CreateStepFour);
