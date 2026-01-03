import React, { useState } from "react";
import { Field, reduxForm } from "redux-form";
import { useSelector } from "react-redux";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import validate from "modules/auth/forms/validate/validate";
import { IoIosClose } from "react-icons/io";
import useWindowSize from "utils/useWindowSize";
import PriceSelection from "core/priceSelection";
import ConfirmDate from "./../../modules/date/confirmDate";

const education_plan = [
  {
    id: "1",
    name: "Lets get straight to the point",
    price: "1/2H",
  },
  {
    id: "2",
    name: "This should be fair enough",
    price: "1H",
  },
  {
    id: "3",
    name: "He will be spending a lot",
    price: "2H",
  },
  {
    id: "4",
    name: "He deserves the change",
    price: "3H",
  },
  // {
  //   id: "5",
  //   name: "This is necessary for my date",
  //   price: "4H",
  // },
];

const CreateStepThree = (props) => {
  const {
    handleSubmit,
    previousPage,
    invalid,
    pristine,
    reset,
    submitting,
    onClose,
    confirmPopup
  } = props;
  const state = useSelector((state) => state.form.CreateStepThree);
  const { width } = useWindowSize();
  // const [confirmPopup, setConfirmPopup] = useState(false);

  // const toggle = () => {
  //   setConfirmPopup(!confirmPopup);
  // };
  return (
    <>
    {!confirmPopup ? <>
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

          <div onClick={onClose} className="w-15 cursor-pointer">
            <IoIosClose
              className="mouse-point"
              style={{ color: " rgba(255, 255, 255, 0.5)" }}
              size={33}
              onClick={onClose}
            />
          </div>
        </div>
        {width > 767 && (
          <div
            className="d-flex justify-content-center"
            //style={{ marginLeft: "22px" }}
          >
            <h3 className="text-center text-uppercase">Create a New Date</h3>
            {/* <div onClick={toggle} className="w-15 cursor-pointer">
              <IoIosClose
                className="desk-close-first mouse-point"
                size={33}
                onClick={toggle}
              />
            </div> */}
          </div>
        )}
        <div
          className="step-wraps"
          //  style={{ marginLeft: '10px' }}
        >
          <ul>
            <li className="complete active">
              <span></span>
            </li>
            <li className="complete active">
              <span></span>
            </li>
            <li className=" complete active">
              <span></span>
            </li>
            <li className="active">
              <span></span>
            </li>
            <li>
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
              // style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <h6>Set date duration.</h6>
              <p>
                What is the approximate length of time you’re willing to spend
                on this particular date experience.
              </p>
            </div>
          </div>
          <div className="date-class-section choose-gender">
            <form
              onSubmit={handleSubmit}
              className="inner_container"
              style={{
                paddingRight: "30px",
                paddingLeft: "30px",
                paddingTop: "0px",
              }}
            >
              <div className="mb-5">
                <div className="auth-radio inner-radio">
                  <Field
                    // label="Level of education"
                    name="education"
                    options={education_plan}
                    value={education_plan}
                    component={PriceSelection}
                    onlyLabel={true}
                  />
                </div>
              </div>
              <div
                className="bottom-mobile register-bottom"
                style={{ paddingTop: "0px" }}
              >
                <div className="secret-input type-submit next-prev">
                  {!confirmPopup && (
                    <button
                      type="submit"
                      className="next"
                      disabled={!state.values?.education || invalid}
                    >
                      Next <FiArrowRight />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </>
      </> : null}
      {/* <ConfirmDate isOpen={confirmPopup} toggle={toggle} /> */}
    </>
  );
};
export default reduxForm({
  form: "CreateStepThree",
  destroyOnUnmount: false,
  validate,
})(CreateStepThree);
