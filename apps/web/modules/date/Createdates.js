import React, { useState } from "react";
import { useSelector } from "react-redux";
import CreateStepOne from "modules/date/createStepOne";
import CreateStepTwo from "modules/date/createStepTwo";
import CreateStepThree from "modules/date/createStepThree";
import CreateStepFour from "modules/date/createStepFour";
import DatePreview from "modules/date/datePreview";
import ConfirmDate from "./confirmDate";
import { useRouter } from "next/router";
import useWindowSize from "utils/useWindowSize";
import { useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosClose } from "react-icons/io";
import CreatedatesWarningPopUp from "./CreatedatesWarningPopUp";

const CreateDate = (props) => {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const [confirmPopup, setConfirmPopup] = useState(false);
  const cityState = useSelector((state) => state?.form?.ChooseCity?.values);
  const { width } = useWindowSize();
  const [hideModal, setHideModal] = useState(false);

  const mobile = width < 768;

  if (!cityState?.enter_city) {
    router.push("/create-date/choose-city");
    window.scrollTo(0, 0);
  }

  const toggle = () => setConfirmPopup(!confirmPopup);

  useEffect(() => {
    if (router.query.new_edit) {
      setPage(3);
    }
  }, [router]);

  const nextPage = () => {
    setPage(page + 1);
    window.scrollTo(0, 0);
  };
  const previousPage = () => {
    if (router?.query?.new_edit && page === 3) {
      router.push("/user/user-profile");
    }

    if (mobile && page === 0) {
      router.push("/create-date/choose-city");
    }

    setPage(page - 1);
    window.scrollTo(0, 0);
  };

  // useEffect(() => {
  //   router.beforePopState(({ as }) => {
  //     console.log("as", as);
  //     if (as === "/create-date/choose-city") {
  //       if (page > 0) {
  //         router.push("/create-date/date-event");
  //         previousPage();
  //         return false;
  //       }
  //     }
  //     return true;
  //   });
  // }, [router, page]);

  return (
    <div>
      {!mobile &&
        page !== 4 &&
        !router.query?.new_edit &&
        !router.query?.drafted && (
          <div className="d-flex justify-content-between align-items-center">
            <div
              onClick={() => {
                if (page > 0) {
                  previousPage();
                } else {
                  router.push("/create-date/choose-city");
                }
              }}
              className="pl-4 cursor-pointer"
            >
              <span>
                <IoIosArrowBack
                  size={25}
                  color={"rgba(255, 255, 255, 0.7)"}
                  className="message-mobile-header-icon"
                />
              </span>
            </div>
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
          </div>
        )}

      {!router.query.drafted && page == 0 && (
        <CreateStepOne
          previousPage={previousPage}
          onSubmit={nextPage}
          onClose={toggle}
          confirmPopup={confirmPopup}
        />
      )}
      {!router.query.drafted && page == 1 && (
        <>
          <CreateStepTwo
            previousPage={previousPage}
            onSubmit={nextPage}
            onClose={toggle}
            confirmPopup={confirmPopup}
          />
        </>
      )}
      {!router.query.drafted && page == 2 && (
        <>
          <CreateStepThree
            previousPage={previousPage}
            onSubmit={nextPage}
            onClose={toggle}
            confirmPopup={confirmPopup}
          />
        </>
      )}
      {/* {!router.query.drafted && page == 3 && (
        <>
          {hideModal ? (
            <CreateStepFour
              previousPage={previousPage}
              onSubmit={nextPage}
              onClose={toggle}
              confirmPopup={confirmPopup}
            />
          ) : (
            <CreatedatesWarningPopUp
              setHideModal={setHideModal}
              hideModal={hideModal}
            />
          )}
        </>
      )} */}
       {!router.query.drafted && page == 3 && (
        <>
          <CreateStepFour
            previousPage={previousPage}
            onSubmit={nextPage}
            onClose={toggle}
            confirmPopup={confirmPopup}
          />
        </>
      )}
      {(router.query.drafted || page == 4) && (
        <>
          <DatePreview setPage={setPage} />
        </>
      )}
      {/* {width < 767 && ( */}
      <ConfirmDate isOpen={confirmPopup} toggle={toggle} />
      {/* )} */}
    </div>
  );
};

export default CreateDate;
