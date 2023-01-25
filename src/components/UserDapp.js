/* global BigInt */
import React, { useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useSigner } from "wagmi";
import { BUSDContractAbi, CrowdFundingContractAbi } from "../contracts/abi";
import {
  BUSDContractAddress,
  CrowdFundingContractAddress,
} from "../contracts/address";
import {
  calculateDateDifference,
  getBUSDBalance,
  getUserInvestment,
  investFunds,
  reinvestFunds,
  withdrawFunds,
  getWithdrawStatus,
} from "../contractExplorer";

export default function UserDapp() {
  const [busdBalance, setBusdBalance] = React.useState("");
  const [withdrawStatus, setWithdrawStatus] = React.useState(false);
  const [userInvestment, setUserInvestment] = React.useState([]);
  const [depositAmount, setDepositAmount] = React.useState(0);
  const {
    address,
    // isConnecting, isDisconnected
  } = useAccount();
  const {
    data: signer,
    // isError, isLoading
  } = useSigner();

  let BUSDContract,
    DEXContract = "";

  if (signer) {
    BUSDContract = new ethers.Contract(
      BUSDContractAddress,
      BUSDContractAbi,
      signer
    );
    DEXContract = new ethers.Contract(
      CrowdFundingContractAddress,
      CrowdFundingContractAbi,
      signer
    );
  }

  const fetchBUSDContractInfo = async () => {
    // User Investment ---------------------------------------------------------------------------------------------[ READ ]
    // _balance datatype is BigNumber
    const _balance = await getBUSDBalance(BUSDContract, address);
    if (parseFloat(ethers.utils.formatEther(_balance) > 0.1))
      setBusdBalance(
        ethers.utils.formatEther(_balance).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      );
    else setBusdBalance(ethers.utils.formatEther(_balance));
    // Withdraw Status ---------------------------------------------------------------------------------------------[ READ ]
    getWithdrawStatus(DEXContract).then((_response) =>
      setWithdrawStatus(_response)
    );
    // User Investment ---------------------------------------------------------------------------------------------[ READ ]
    // _user_investment array of datatype is BigNumber
    const _user_investment = await getUserInvestment(DEXContract, address);
    const _deposit_date = new Date(
      parseInt(_user_investment.timeperiod, 10) * 1000
    );
    const _withdraw_date = new Date();
    _withdraw_date.setDate(_deposit_date.getDate() + 30);
    console.log("Deposit Date:", _deposit_date);
    setUserInvestment({
      amount: ethers.utils.formatEther(_user_investment.amount),
      invested_status: _user_investment.invested,
      loss: ethers.utils.formatEther(_user_investment.loss),
      profit: ethers.utils.formatEther(_user_investment.profit),
      timeperiod: 0,
      weekTimeperiod: calculateDateDifference(_deposit_date, _withdraw_date),
    });
    console.log("User Investment Data:", userInvestment);
  };

  useEffect(() => {
    if (signer) fetchBUSDContractInfo();
  }, [signer]);

  return (
    <div>
      <section className="p-6">
        {/* Top Container */}
        <div className="container grid gap-6 mx-auto text-center lg:grid-cols-2 xl:grid-cols-7">
          {/* Balance Status */}
          <div className="w-full rounded-md xl:col-span-2 border border-primary_gray p-3">
            <div className="container grid gap-3 mx-auto text-center grid-cols-1 xl:grid-cols-2">
              <div className="w-full text-left p-3 rounded-md bg-gray-900 text-white h-24">
                <h3 className="text-primary_gray">Busd Balance</h3>
                <h3>{busdBalance} BUSD</h3>
              </div>
              <div className="w-full text-left p-3 rounded-md bg-gray-900 text-white h-24">
                <h3 className="text-primary_gray">Busd Invested</h3>
                <h3>
                  {userInvestment?.invested_status === true
                    ? userInvestment?.amount
                    : ""}
                  {userInvestment?.invested_status === true ? " BUSD" : "--:--"}
                </h3>
              </div>
            </div>
          </div>
          {/* ROI / Date Status */}
          <div className="w-full rounded-md xl:col-span-5 border border-primary_gray p-3">
            <div className="container grid gap-6 mx-auto text-center lg:grid-cols-1 xl:grid-cols-3">
              <div className="w-full rounded-md bg-primary_light shadow-lg h-24 text-left p-3 lg:col-span-2">
                <h3 className="text-white drop-shadow-lg">ROI %</h3>
                <h3>
                  {userInvestment.profit > 0 ? (
                    <span className="text-green-600">
                      {userInvestment.profit}%
                    </span>
                  ) : userInvestment.loss > 0 ? (
                    <span className="text-red-600">
                      -{userInvestment.profit}%
                    </span>
                  ) : (
                    "00.00"
                  )}
                </h3>
              </div>
              <div className="w-full rounded-md bg-primary_light drop-shadow-lg h-24 text-left p-3">
                {/* <h3 className="text-white">Time Left To Withdraw</h3> */}
                <h3 className="text-white">Deposit Date:</h3>
                <h3>{userInvestment.timeperiod}</h3>
              </div>
            </div>
          </div>
        </div>
        {/* Write Functions */}
        <div className="container grid gap-8 border border-primary_gray text-center lg:grid-cols-2 xl:grid-cols-7 mx-auto mt-6 p-3 rounded-md">
          <div className="w-full rounded-md xl:col-span-2 bg-gray-900 text-white p-3">
            {/* Deposit */}
            <div className="w-full text-left mb-2">
              <h3 className="text-primary_gray">Minimum 50 BUSD</h3>
              {/* <h3>--:--</h3> */}
            </div>
            {/* Withdraw */}
            <div className="flex justify-between w-full">
              <input
                id="name"
                type="number"
                placeholder="Enter Amount"
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-2/3 mr-2 pl-4 rounded-sm text-primary border border-primary focus:ring focus:ring-primary"
              />
              <button
                type="button"
                onClick={() =>
                  investFunds(
                    BUSDContract,
                    DEXContract,
                    CrowdFundingContractAddress,
                    depositAmount
                  )
                }
                disabled={depositAmount >= 50 ? false : true}
                className="w-1/3 py-2 font-semibold rounded-sm bg-primary text-white"
              >
                Deposit
              </button>
            </div>
            <hr className="my-5" />
            {/* ROI */}
            <div>
              {/* Deposit */}
              <div className="w-full text-left mb-2">
                <h3 className="text-primary_gray">Balance Available</h3>
                <h3>{withdrawStatus ? userInvestment?.amount : "--:--"}</h3>
              </div>
              {/* Withdraw */}
              <div className="w-full">
                {/* <input
                  id="name"
                  type="number"
                  placeholder="Enter Amount"
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full mr-2 pl-4 py-2 rounded-sm border border-primary focus:ring focus:ring-primary"
                /> */}
                <div className="flex sm:flex-row gap-3 sm:gap-0 flex-col mt-3">
                  {/* Reinvest */}
                  <button
                    type="button"
                    onClick={() => reinvestFunds()}
                    className="w-full py-2 font-semibold rounded-sm bg-primary text-white mr-3"
                  >
                    Reinvest
                  </button>
                  {/* Rewithdraw ---- */}
                  <button
                    type="button"
                    onClick={() => withdrawFunds()}
                    className="w-full py-2 font-semibold rounded-sm bg-primary text-white"
                  >
                    Withdraw
                  </button>
                </div>
              </div>

              <hr className="my-5" />
              {/* ROI */}
              <div className="w-full flex justify-between px-3 pt-2">
                <div className="w-full text-left">
                  <h3 className="text-primary_gray">ROI BUSD</h3>
                  <h3>--:--</h3>
                </div>
                <button
                  type="button"
                  // onClick={() =>
                  //   investFunds(
                  //     BUSDContract,
                  //     DEXContract,
                  //     CrowdFundingContractAddress,
                  //     depositAmount
                  //   )
                  // }
                  className="w-2/3 h-10 px-0 text-sm font-semibold rounded-full border border-gray-100 hover:bg-primary text-white"
                >
                  Claim ROI
                </button>
              </div>
            </div>
          </div>
          {/* Tx Table */}
          <div className="w-full rounded-md xl:col-span-5 border border-primary_gray h-auto p-3">
            User Tx will Shows Here
          </div>
        </div>
      </section>
    </div>
  );
}
