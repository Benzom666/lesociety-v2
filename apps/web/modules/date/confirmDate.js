import React from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";

const ConfirmDate = ({ toggle, isOpen }) => {
  const router = useRouter();

  const redirect = () => {
    router.push("/user/user-list");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={toggle}
      bodyOpenClassName="open-modal-body"
      portalClassName="overlay-modal"
      className="date-wrapper"
      ariaHideApp={false}
    >
      <div className="model_content city-wrapper">
        <div className="header">
          <h4 className="text-bold-h4 pb-2" style={{fontSize:"20px"}}>Not Ready To Commit?</h4>
          <p>If you close this page you will have start over again</p>
        </div>
        <div className="button-wrapper">
          <button type="submit" className="next-button" onClick={toggle}>
            Continue Creating
          </button>
        </div>
        <p type="submit" className="a-wrapper" onClick={redirect}>
          Close page
        </p>
      </div> 
    </Modal>
  );
};

export default ConfirmDate;
