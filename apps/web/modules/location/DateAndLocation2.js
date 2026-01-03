import React, { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import SubHeading from "@/core/SubHeading";
import UserCardList from "@/core/UserCardList";
import SkeletonDate from "@/modules/skeleton/Dates/SkeletonDates";
import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import NoImage from "assets/img/no-image.png";
import Image from "next/image";
import { apiRequest } from "utils/Utilities";
import { fetchCities } from "../auth/forms/steps/validateRealTime";
import useWindowSize from "utils/useWindowSize";
import { useRef } from "react";

function DateAndLocation({
  currentLocationLoading,
  selectedLocation,
  show,
  openPopup,
  closePopup,
  receiverData,
  alreadyMessagedFromUser,
  setAlreadyMessagedFromUser,
  setLocation,
  growDiv,
}) {
  const [dateLength, setDateLength] = useState(0);
  const [loading, setLoader] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] = React.useState("");
  const [dates, setDates] = React.useState([]);
  const [dateId, setDateId] = React.useState("");
  const { width } = useWindowSize();
  const scrollRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedLocationDatesOver, setSelectedLocationDatesOver] =
    useState(false);

  //   useEffect(() => {
  //     fetchDates();
  //   }, [selectedLocation, page]);

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const user = useSelector((state) => state.authReducer.user);

  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      const citiesData = City.getCitiesOfState(
        (selectedLocation?.country || user?.country_code)?.toUpperCase(),
        (selectedLocation?.province || user?.province)?.toUpperCase()
      );

      setCities(citiesData);
    };
    if (selectedLocation) {
      fetchCities();
    }
  }, [selectedLocation]);

  useEffect(() => {
    setDateLength(dates?.length);
  }, [dates]);

  const nextPage = () => {
    setTimeout(() => {
      setPage(page + 1);
    }, 500);
  };

  const lastClickedDate = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDate = async (params) => {
    try {
      setLoader(true);
      const res = await apiRequest({
        url: "date",
        params: params,
      });
      console.log("res dates of user", res);

      if (res?.data?.data?.pagination?.current_page !== 1) {
        res?.data?.data?.dates;

        setDates([...dates, ...res?.data?.data?.dates]);
      } else {
        res?.data?.data?.dates;

        setTimeout(() => {
          setDates(res?.data?.data?.dates);
        }, 2000);
      }
      setPagination(res?.data?.data?.pagination);
      setTimeout(() => {
        setLoader(false);
      }, 2000);
    } catch (err) {
      setDates([]);
      // how to destructure this err
      const { data } = err.response;
      console.log(
        "err",
        data?.status === 400 &&
          data?.message ===
            "Invalid page number, can't be greater than total pages."
      );
      const selectedLocationDatesOver =
        data?.status === 400 &&
        data?.message ===
          "Invalid page number, can't be greater than total pages.";
      if (selectedLocationDatesOver) {
        setSelectedLocationDatesOver(true);
      }

      setLoader(false);
    }
  };

  const fetchDateWithSelectedLocation = async () => {
    try {
      setLoader(true);
      const res = await apiRequest({
        url: "date",
        params: {
          location: selectedLocation?.city,
          province: selectedLocation?.province,
          current_page: page,
          per_page: 10,
        },
      });
      console.log("res dates of user", res);

      if (res?.data?.data?.pagination?.current_page !== 1) {
        setDates([...dates, ...res?.data?.data?.dates]);
        if (
          res?.data?.data?.pagination?.current_page ===
          res?.data?.data?.pagination?.total_pages
        ) {
          setSelectedLocationDatesOver(true);
          setPage(1);
        }
      } else {
        setTimeout(() => {
          setDates(res?.data?.data?.dates);
        }, 2000);
      }
      setPagination(res?.data?.data?.pagination);
      setTimeout(() => {
        setLoader(false);
      }, 2000);
    } catch (err) {
      setDates([]);
      setLoader(false);
    }
  };

  const fetchDateWithProvince = async () => {
    try {
      setLoader(true);
      const res = await apiRequest({
        url: "date",
        params: {
          sort: "location",
          // selectedLocation: selectedLocation?.city,
          province: selectedLocation?.province,
          current_page: page,
          per_page: 10,
        },
      });
      console.log("res dates of user", res);

      if (res?.data?.data?.pagination?.current_page !== 1) {
        // filter with selectedLocation city
        const filteredDates =
          res?.data?.data?.dates?.length > 0 &&
          res?.data?.data?.dates?.filter(
            (date) => date?.location === selectedLocation?.city
          );

        setDates([...dates, ...filteredDates]);

        if (
          res?.data?.data?.pagination?.current_page ===
          res?.data?.data?.pagination?.total_pages
        ) {
          setHasMore(false);
        }
      } else {
        setTimeout(() => {
          setDates([dates, ...res?.data?.data?.dates]);
        }, 2000);
      }
      setPagination(res?.data?.data?.pagination);
      setTimeout(() => {
        setLoader(false);
      }, 2000);
    } catch (err) {
      setDates([]);
      // how to destructure this err
      const { data } = err.response;
      console.log(
        "err",
        data?.status === 400 &&
          data?.message ===
            "Invalid page number, can't be greater than total pages."
      );
      // const selectedLocationDatesOver =
      //   data?.status === 400 &&
      //   data?.message ===
      //     "Invalid page number, can't be greater than total pages.";
      // if (selectedLocationDatesOver) {
      //   setHasMore(false);
      // }

      setLoader(false);
    }
  };

  useEffect(() => {
    if (selectedLocation?.city && !show) {
      //   const params = {
      //     // location: selectedLocation?.city,
      //     sort: "location",
      //     selectedLocation: selectedLocation?.city,
      //     province: selectedLocation?.province,
      //     current_page: page,
      //     per_page: 10,
      //   };
      if (selectedLocationDatesOver) {
        fetchDateWithProvince();
      } else {
        fetchDateWithSelectedLocation();
      }

      // fetchDate();
    }
  }, [selectedLocation, show, page]);

  useEffect(() => {
    if (selectedLocation) {
      setDates([]);
      setPage(1);
    }
  }, [selectedLocation]);

  console.log("selectedLocation", {
    selectedLocation,
    show,
    selectedLocationDatesOver,
    loading,
  });
  return (
    <InfiniteScroll
      // scrollableTarget="infiniteScroll"
      dataLength={dateLength}
      next={() => {
        nextPage();
      }}
      scrollThreshold={0.5}
      hasMore={hasMore}
      // hasMore={!loading && pagination?.total_pages !== page}
      style={{ overflowX: "hidden", scrollBehavior: "smooth" }}
    >
      <div className="row">
        {currentLocationLoading || (loading && dates.length === 0)
          ? [1, 2, 3, 4, 5, 6].map((n) => (
              <div className={`col-xl-6 col-lg-12`}>
                <SkeletonDate key={n} theme="dark" />
              </div>
            ))
          : dates.length > 0 &&
            dates.filter((item) => item?.date_status === true)?.length > 0
          ? dates
              .filter((item) => item?.date_status === true)
              .map((item, index) => (
                <div
                  className={`col-xl-6 col-lg-12 ${
                    (width > 767 && (index === 2 || index === 3)) ||
                    index === 0 ||
                    index === 1
                      ? "scrollActive"
                      : ""
                  }`}
                  id={`scrolldiv`}
                  key={index}
                  onClick={() => {
                    // if (index === dates?.length - 1) {
                    lastClickedDate();
                    // }
                  }}
                >
                  {width > 767 ? (
                    <UserCardList
                      setDateId={setDateId}
                      date={item}
                      cardId={`grow-${index}`}
                      openPopup={() => {
                        openPopup(item);
                      }}
                      closePopup={closePopup}
                      dateId={dateId}
                      isDesktopView={true}
                      key={index}
                      ref={scrollRef}
                      loading={loading}
                      setLoader={setLoader}
                      receiverData={receiverData}
                      alreadyMessagedFromUser={alreadyMessagedFromUser}
                      setAlreadyMessagedFromUser={setAlreadyMessagedFromUser}
                    />
                  ) : (
                    <UserCardList
                      setDateId={setDateId}
                      date={item}
                      cardId={`grow-${index}`}
                      openPopup={() => {
                        openPopup(item);
                      }}
                      setLoader={setLoader}
                      closePopup={closePopup}
                      growDiv={growDiv}
                      dateId={dateId}
                      key={index}
                      ref={scrollRef}
                      loading={loading}
                      receiverData={receiverData}
                      alreadyMessagedFromUser={alreadyMessagedFromUser}
                      setAlreadyMessagedFromUser={setAlreadyMessagedFromUser}
                    />
                  )}
                </div>
              ))
          : !loading && (
              <div className="no-message-card-date">
                <figure>
                  <Image src={NoImage} alt="NoImage" width={205} height={140} />
                </figure>
                <h6>Sorry, no dates found for the selected location</h6>
                <SubHeading title="Find a date by changing the location!" />
              </div>
            )}
        {loading &&
          [1, 2, 3, 4, 5, 6].map((n) => (
            <div className={`col-xl-6 col-lg-12`}>
              <SkeletonDate key={n} theme="dark" />
            </div>
          ))}
      </div>
    </InfiniteScroll>
  );
}

export default DateAndLocation;
