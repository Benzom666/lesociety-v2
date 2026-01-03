import React, { useState } from "react";
import withAuth from "@/core/withAuth";
import HomePagePopUp from "@/core/HomePagePopUp";
import CreatedatesWarningPopUp from "@/modules/date/CreatedatesWarningPopUp";
import Blank from "@/core/Blank";
function payment() {
  const [show,setShow]= useState(false);

  const handleModal =()=>{
    setShow(!show);
  }

  return (
    //  <div>payment</div>
    <>
    {/* { !show && <button onClick={handleModal}>show modal</button>}
    { show && <HomePagePopUp onClose={handleModal} show={show}/>} */}
    {/* <CreatedatesWarningPopUp/> */}
    <Blank/>
     </>
  );
}

export default withAuth(payment);
