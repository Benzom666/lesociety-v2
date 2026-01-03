import React from 'react';
import Modal from 'react-modal';
import { CustomIcon } from 'core/icon';
import H5 from "core/H5";
import SubHeading from "core/SubHeading";
import Link from 'next/link'

const DatePopup = ({ modalIsOpen, closeModal }) => {

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            bodyOpenClassName="create-date-modal-body"
            portalClassName="overlay-modal"
        >
            <div className="model_content">
                <span onClick={closeModal} style={{ float: 'right', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.9924 12.9926L1.00244 1.00006" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M12.9887 1.00534L1.00873 12.9853" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </span>
                <div className="icon_wrap">
                    <CustomIcon.Diamond color={'#fff'} size={70} />
                </div>
                <H5>What are you waiting for?</H5>
                <SubHeading title="Post your own date and start earning now" />
                <div className="d-flex align-items-center my-4 header_btn_wrap">
                    <Link legacyBehavior href="/create-date/choose-city"><a className="create-date">Create New Date</a></Link>
                </div>
            </div>
        </Modal>
    )
}

export default DatePopup;