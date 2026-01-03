import React from 'react'
import Card_Mobile from '../assets/img/Card_Mobile.png';
import CardMob_1 from '../assets/img/CardMob_1.png';
import CardMob_2 from '../assets/img/CardMob_2.png';
import CardMob$$_1 from '../assets/img/CardMob$$_1.png';
import CardMob$$_2 from '../assets/img/CardMob$$_2.png';
function HomePageCardSectionMobile() {
    return (
        <div className='bottom-Card-mobile mt-0 mb-5'>
            < div className='card-1'>
                <figure>
                    <img src={CardMob$$_1.src} alt="card-1" />
                    <figcaption className='text-over-1'>
                        <div className='card-title-1'>
                            <h5 className="heading-1">Need More</h5>
                            <h5 className="heading-1" style={{paddingTop:"5px"}}>Information?</h5>
                        </div>
                        <div className='card-btn-1'>
                            <a href="/howItWork" className="btn btn-danger" id="howitworkbtn">How it Works</a>
                        </div>
                    </figcaption>
                </figure>
            </div>
            < div className='card-2'>
                <figure>
                    <img src={CardMob$$_2.src} alt="card-1" />
                    <figcaption className='text-over-2'>
                        <div className='card-title-2'>
                            <h5 className="heading-2">The future of</h5>
                            <h5 className="heading-2" style={{paddingTop:"5px"}}> Le Society</h5>
                        </div>
                        <div className='card-btn-2'>
                            <a href="/future-date" className="btn btn-danger" id="sneakPeakbtn">Sneak Peak</a>
                            <p className="card-app-pay">In App Payment GPS Tracking …and more</p>
                        </div>
                    </figcaption>
                </figure>
            </div>
        </div>
    )
}

export default HomePageCardSectionMobile