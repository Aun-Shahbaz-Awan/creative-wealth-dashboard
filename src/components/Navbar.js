import React from "react";
import Logo from "./../assets/logos/transparent_logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function Navbar() {
  return (
    <header class="bg-white bg-opacity-5 shadow-lg">
      <div class="container mx-auto flex justify-between items-center h-24">
        <a href="/">
          <img class="h-8 pl-3 md:pl-0 sm:h-10 md:h-16" src={Logo} alt="" />
        </a>
        {/* <nav class="contents font-semibold text-base lg:text-lg">
          <ul class="mx-auto flex items-center">
            <li class="p-5 xl:p-8 active">
              <a href="">
                <span>Home</span>
              </a>
            </li>
            <li class="p-5 xl:p-8">
              <a href="">
                <span>About</span>
              </a>
            </li>
            <li class="p-5 xl:p-8">
              <a href="">
                <span>Projects</span>
              </a>
            </li>
            <li class="p-5 xl:p-8">
              <a href="">
                <span>Services</span>
              </a>
            </li>
            <li class="p-5 xl:p-8">
              <a href="">
                <span>Blog</span>
              </a>
            </li>
          </ul>
        </nav> */}
        {/* <button class="flex items-center border border-primary text-primary rounded-full font-bold px-8 py-2 hover:bg-primary hover:text-white">
          <ImRocket className="mr-2" />
          HOme
        </button> */}
        <ConnectButton className="pr-3 md:pr-0" />
      </div>
    </header>
  );
}

export default Navbar;
