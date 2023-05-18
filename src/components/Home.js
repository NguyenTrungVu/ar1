import React from "react";
import {Link } from 'react-router-dom';

export default function Home(){
    return(
        <div className="m-0 auto w-full flex items-center ">
      <div className=" w-full flex">
        <div
          className="   opacity-10"
          style={{ height: "700px" }}
        ></div>
        <div className=" flex m-0 p-0 w-full z-5">
          <div className="p-0 mt-[100px] ml-[50px] mr-0 w-2/5 m-0 ">
            <h1 className="text-[40px] ">Welcome !!</h1>
            <span>I hope you could have a good experience!</span>
          </div>
          <div className="p-0 mt-[100px] ml-[50px] mr-[50px] h-full w-2/5 m-0">
            <div className="hover:bg-[#AEE2FF] shadow-lg shadow-gray-100 xs:shadow-xs md:shadow-gray-100 p-4 text-center rounded-md h-[70px] mb-[10px]">
              <Link to="/imagedetection">
              Image Detection
              </Link>
             
            </div>
            <div className="hover:bg-[#AEE2FF] shadow-lg shadow-gray-100 xs:shadow-xs md:shadow-gray-100 p-4 text-center rounded-md h-[70px] mb-[10px]">
            <Link to="/planedetection">
              Plane Detection
              </Link>
            </div>
            <div className="hover:bg-[#AEE2FF] shadow-lg shadow-gray-100 xs:shadow-xs md:shadow-gray-100 p-4 text-center rounded-md h-[70px] mb-[10px]">
             <Link to="/upload">Upload Models</Link> 
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}