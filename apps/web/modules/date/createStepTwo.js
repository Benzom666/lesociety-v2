import React, { useState, useMemo } from "react";
import { Field, reduxForm, change, initialize } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import validate from "modules/auth/forms/validate/validate";
import { Inputs } from "core";
import { FiArrowRight } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import PriceSelection from "core/priceSelection";
import useWindowSize from "utils/useWindowSize";
import ConfirmDate from "./../../modules/date/confirmDate";
import { Select } from "antd";

import { useEffect } from "react";
import { apiRequest } from "utils/Utilities";
import { logout } from "../auth/authActions";
import { useRouter } from "next/router";
import { AUTHENTICATE_UPDATE } from "../auth/actionConstants";

const education = [
  {
    id: "1",
    name: "The date is short and sweet",
    suptag: "$",
    price: "80",
  },
  {
    id: "2",
    name: "Ok, lets make some money!",
    suptag: "$",
    price: "100",
  },
  {
    id: "3",
    name: "I’m as beatiful as they come, he’ll be lucky to date me",
    suptag: "$",
    price: "125",
  },
  {
    id: "4",
    name: "I will not go on date for anything less",
    suptag: "$",
    price: "150",
  },
  {
    id: "5",
    name: "I’m drop dead gergeous. Period",
    suptag: "$",
    price: "200",
  },
  {
    id: "6",
    name: "Crème de la crème",
    suptag: "$",
    price: "250",
  },
  {
    id: "7",
    name: "Crème de la crème",
    suptag: "$",
    price: "300",
  },
  {
    id: "8",
    name: "Crème de la crème",
    suptag: "$",
    price: "350",
  },
  {
    id: "9",
    name: "Crème de la crème",
    suptag: "$",
    price: "400",
  },
  {
    id: "10",
    name: "Crème de la crème",
    suptag: "$",
    price: "450",
  },
  {
    id: "11",
    name: "Crème de la crème",
    suptag: "$",
    price: "500",
  },
];

const CreateStepTwo = (props) => {
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
  const state = useSelector((state) => state.form.CreateStepTwo);
  const user = useSelector((state) => state.authReducer.user);
  const { width } = useWindowSize();
  const router = useRouter();

  const [category, setCategory] = useState([]);
  const [aspiration, setAspiration] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [aspirationId, setAspirationId] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    getcategoryData();
  }, []);

  const getcategoryData = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `categories`,
      });

      const category =
        res.data?.data?.length > 0
          ? res.data?.data?.map((da) => ({
              label: da?.name,
              value: da?._id,
            }))
          : [];
      setCategory(category);
    } catch (err) {
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
    return;
  };

  const getAspirationData = async (categoryId) => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `aspirations?category_id=${categoryId?.value}`,
      });
      const aspiration =
        res.data?.data?.length > 0
          ? res.data?.data?.map((da) => ({
              label: da?.name,
              value: da?._id,
            }))
          : [];
      setAspiration(aspiration);
    } catch (err) {
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
    return;
  };

  const dropDownHandleSubmit = async (values) => {
    try {
      const data = {
        categatoryName: categoryId?.label,
        aspirationName: aspirationId?.label,
        aspirationId: aspirationId?.value,
        categatoryId: categoryId?.value,
      };
      const res = await apiRequest({
        data: data,
        method: "POST",
        url: `user/save-aspiration`,
      });
      getUpdatedUserDetails();
    } catch (err) {
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
    return;
  };

  const getUpdatedUserDetails = async () => {
    try {
      const res = await apiRequest({
        method: "GET",
        url: `user/user-by-name?user_name=${user?.user_name}`,
      });
      dispatch({
        type: AUTHENTICATE_UPDATE,
        payload: { ...res.data?.data?.user },
      });
    } catch (err) {
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.message === "Failed to authenticate token!"
      ) {
        setTimeout(() => {
          logout(router, dispatch);
        }, 100);
      }
      return err;
    }
  };

  useEffect(() => {
    if (categoryId) {
      getAspirationData(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    setCategoryId(
      user?.categatoryId
        ? {
            value: user?.categatoryId,
            label: user?.categatoryName,
          }
        : ""
    );

    setAspirationId(
      user?.aspirationId
        ? {
            value: user?.aspirationId,
            label: user?.aspirationName,
          }
        : ""
    );
    dispatch(
      initialize("CreateStepTwo", {
        enter__category: user?.categatoryId,
        enter__aspiration: user?.aspirationId,
      })
    );
  }, []);

  const first30DaysDateCreateTime = user?.first30DaysDateCreateTime;

  // disable both dropdowns if first_30_days_date_create_time is not null and less than 30 days
  // Use useMemo to avoid SSR/client timestamp mismatch
  const disableDropdowns = useMemo(() => {
    if (typeof window === 'undefined' || !first30DaysDateCreateTime) {
      return false;
    }
    return (
      new Date(first30DaysDateCreateTime).getTime() +
        30 * 24 * 60 * 60 * 1000 -
        Date.now() >
      0
    );
  }, [first30DaysDateCreateTime]);

  return (
    <>
      {!confirmPopup ? (
        <>
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
                  size={33}
                  style={{ color: " rgba(255, 255, 255, 0.5)" }}
                  onClick={onClose}
                />
              </div>
            </div>
            {width > 767 && (
              <div
                className="d-flex justify-content-center"
                //style={{ marginLeft: "22px" }}
              >
                <h3 className="text-center text-uppercase">
                  Create a New Date
                </h3>
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
              //  style={{ marginLeft: "9px" }}
            >
              <ul>
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
                <h6 className="price-text">Make Every Date Count</h6>
                {/* <p>
                Determine how expensive you are and please consider he’s paying
                for the <br /> outing as well
              </p> */}
                <p>
                  When a man chooses to support your dreams, it signals his
                  commitment level. Specify your goals and the contribution
                  you’d like for a fast-tracked first date.
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
                  <div className="aspiration__main__dropdown">
                    <label htmlFor="category" className="aspiration__label1">
                      What are your life aspirations?
                    </label>
                    <label htmlFor="category" className="aspiration__label2">
                      (This selection will be locked in for 30 days)
                    </label>

                    {/* <Field
                      name="enter__category"
                      options={category}
                      component={Select}
                      onChange={(value) => categoryChange()}
                      placeholder="Select A Category"
                      className="aspiration__antd__dropdown"
                      showSearch={true}
                    /> */}
                    <Field
                      name="enter__category"
                      component={({ input, meta }) => (
                        <>
                          <Select
                            placeholder="Select A Category"
                            className="aspiration__antd__dropdown"
                            showSearch={false}
                            value={categoryId}
                            onChange={(value, event) => {
                              dispatch(initialize("CreateStepTwo", {}));
                              setAspiration([]);
                              setAspirationId("");
                              input.onChange(value);
                              setCategoryId({
                                value: value,
                                label: event.children,
                              });
                            }}
                            validate={validate}
                            onBlur={(e) => {
                              e.preventDefault();
                            }}
                            disabled={disableDropdowns}
                            // options={category}
                            popupClassName="aspiration__antd__dropdown__popup"
                            onDropdownVisibleChange={(open) => {
                              // If dropdown is open then disabled background scroll
                              if (open) {
                                document.body.style.overflow = "hidden";
                              } else {
                                document.body.style.overflow = "unset";
                              }
                            }}
                          >
                            <Option value="">Select A Category</Option>
                            {category.map((item) => (
                              <Option value={item.value}>{item.label}</Option>
                            ))}
                          </Select>
                          {meta.error && meta.touched && (
                            <span>{meta.error}</span>
                          )}
                        </>
                      )}
                    />
                    <div className="aspiration__antd__dropdown2">
                      {/* <Field
                        name="enter__aspiration"
                        component={Select}
                        placeholder="Select Your Aspiration"
                        className="aspiration__antd__dropdown"
                        options={aspiration}
                        value="aspiration1"
                        // open={true}
                        showSearch={true}
                        onChange={(value) => change(value)}
                      /> */}
                      <Field
                        name="enter__aspiration"
                        component={({ input, meta }) => (
                          <>
                            <Select
                              placeholder="Select Your Aspiration"
                              className="aspiration__antd__dropdown"
                              showSearch={false}
                              value={aspirationId}
                              onChange={(value, event) => {
                                input.onChange(value);
                                setAspirationId({
                                  value: value,
                                  label: event.children,
                                });
                              }}
                              validate={validate}
                              onBlur={(e) => {
                                e.preventDefault();
                              }}
                              disabled={
                                !categoryId ||
                                !(aspiration.length > 0) ||
                                disableDropdowns
                              }
                              popupClassName="aspiration__antd__dropdown__popup"
                              onDropdownVisibleChange={(open) => {
                                // If dropdown is open then disabled background scroll
                                if (open) {
                                  document.body.style.overflow = "hidden";
                                } else {
                                  document.body.style.overflow = "unset";
                                }
                              }}
                            >
                              <Option value="">Select Your Aspiration</Option>
                              {aspiration.map((item) => (
                                <Option value={item.value}>{item.label}</Option>
                              ))}
                            </Select>
                            {meta.error && meta.touched && (
                              <span>{meta.error}</span>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>
                  {/* <label htmlFor="category" className="price__radio__label">
                    What is your suggested contribution for a speedy first date?
                  </label> */}
                  <label htmlFor="category" className="price__radio__label">
                    Set your "Super Interested" offer
                  </label>
                  <p className="price__radio__gentlemen">
                    {" "}
                    A gentlemen who wishes to support your aspirations is
                    expressing his desire to empower you in your pursuit of
                    those goals. Please select the amount that piques your
                    interest for a speedy first date.
                  </p>

                  <div className="auth-radio inner-radio">
                    <Field
                      // label="Level of education"
                      name="education"
                      options={education}
                      value={education}
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
                        onClick={() => {
                          if (disableDropdowns) {
                            return;
                          }
                          dropDownHandleSubmit();
                        }}
                      >
                        Next <FiArrowRight />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </>
        </>
      ) : null}
      {/* <ConfirmDate isOpen={confirmPopup} toggle={toggle} /> */}
    </>
  );
};
export default reduxForm({
  form: "CreateStepTwo",
  destroyOnUnmount: false,
  validate,
})(CreateStepTwo);
