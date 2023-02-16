/* global BigInt */
import React, { useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useSigner } from "wagmi";
import { UseContractContext } from "../context/contracts";
import { BUSDContractAbi, CFContractAbi } from "../contracts/abi";
import { BUSDContractAddress, CFContractAddress } from "../contracts/address";
import {
  getBUSDBalance,
  getUserInvestment,
  getROI,
  investFunds,
  withdrawFunds,
  weeklyWithdraw,
  getWithdrawStatus,
  getDepositStatus,
} from "../services/user";
import {
  getMinInvestment,
  getMaxInvestment,
  getMaxUserInvestment,
} from "../services/admin";
import { getUserTransactions } from "./../services/moralis";
import { getUserAverageROIDB } from "../services/backend";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import Countdown from "react-countdown";

export default function UserDashboard() {
  const context = UseContractContext();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [busdBalance, setBUSDBalance] = React.useState("");
  const [depositStatus, setDepositStatus] = React.useState(false);
  const [withdrawStatus, setWithdrawStatus] = React.useState(false);
  const [userInvestment, setUserInvestment] = React.useState([]);
  const [depositAmount, setDepositAmount] = React.useState(0);
  const [withdrawAmount, setWithdrawAmount] = React.useState(0);
  const [averageROI, setAverageROI] = React.useState(0);
  const [weeklyROI, setWeeklyROI] = React.useState({
    percentage: 0,
    profitStatus: 0,
    time: 0,
  });
  const [transactions, setTransactions] = React.useState({});
  const [refresh, setRefresh] = React.useState(true);
  const [time, setTime] = React.useState(0);
  const [minMaxInvestment, setMinMaxInvestment] = React.useState({
    minInvestment: 0,
    maxInvestment: 0,
    maxUserInvestment: 0,
  }); // Get Min/Max

  let BUSDContract,
    DEXContract = "";

  if (signer) {
    BUSDContract = new ethers.Contract(
      BUSDContractAddress,
      BUSDContractAbi,
      signer
    );
    DEXContract = new ethers.Contract(CFContractAddress, CFContractAbi, signer);
  }

  const fetchInvestments = async () => {
    const _min = await getMinInvestment(context);
    const _max = await getMaxInvestment(context);
    const _user = await getMaxUserInvestment(context);
    setMinMaxInvestment({
      minInvestment: parseInt(_min),
      maxInvestment: parseInt(_max),
      maxUserInvestment: parseInt(_user),
    });
  };
  // console.log("Min/Max:", minMaxInvestment);

  const fetchBUSDContractInfo = async () => {
    // User Investment ---------------------------------------------------------------------------------------------[ READ ]
    // _balance datatype is BigNumber
    const _balance = await getBUSDBalance(BUSDContract, address);
    if (parseFloat(ethers.utils.formatEther(_balance) > 0.1))
      setBUSDBalance(
        ethers.utils.formatEther(_balance).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      );
    else setBUSDBalance(ethers.utils.formatEther(_balance));
    // Withdraw Status ---------------------------------------------------------------------------------------------[ READ ]
    getWithdrawStatus(DEXContract).then((_response) =>
      setWithdrawStatus(_response)
    );
    getDepositStatus(DEXContract).then((_response) =>
      setDepositStatus(_response)
    );
    // Withdraw Status ---------------------------------------------------------------------------------------------[ READ ]
    getROI(DEXContract).then((_roi) =>
      setWeeklyROI({
        percentage: _roi?.percentage / 100,
        profitStatus: _roi?.profitStatus,
        time: _roi?.time,
      })
    );
    // User Investment ---------------------------------------------------------------------------------------------[ READ ]
    // _user_investment array of datatype is BigNumber
    const _user_investment = await getUserInvestment(DEXContract, address);

    const _withdraw_date = new Date(
      parseInt(_user_investment.timeperiod?._hex, 16) * 1000
    ).toLocaleDateString("en-US", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // console.log(
    //   "Remaining Time",
    //   Date.now() + 2592000 * 1000,
    //   ethers.BigNumber.from(_user_investment.timeperiod).toString() * 1000
    // );
    setTime(
      Date.now() +
        2592000 * 1000 -
        ethers.BigNumber.from(_user_investment.timeperiod).toString() * 1000
    );

    if (
      ethers.BigNumber.from(_user_investment.timeperiod).toString() * 1000 <
      Date.now() + 60 * 5 * 1000
    ) {
      setTime(
        ethers.BigNumber.from(_user_investment.timeperiod).toString() * 1000 -
          Date.now() +
          60 * 5 * 1000
      );
    } else {
      setTime(
        Date.now() +
          60 * 5 * 1000 -
          ethers.BigNumber.from(_user_investment.timeperiod).toString() * 1000
      );
    }

    fetchInvestments(); // Fetch min max investments
    setUserInvestment({
      amount: ethers.utils.formatEther(_user_investment.amount),
      withdrawable: ethers.utils.formatEther(_user_investment.withdrawable),
      loss: parseInt(_user_investment.loss?._hex, 16),
      profit: parseInt(_user_investment.profit?._hex, 16),
      weekTimeperiod: parseInt(_user_investment.timeperiod?._hex, 16) / 1000,
      timeperiod: _withdraw_date,
      invested_status: _user_investment.invested,
    });
  };

  useEffect(() => {
    if (signer) fetchBUSDContractInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer, refresh]);
  // console.log("Refresh Status:", refresh);

  // Get Transactions Data ---------------------------------------------------------------------------------------[3rd Party APIs]
  useEffect(() => {
    getUserAverageROIDB().then((_average) => {
      // console.log("Average ROID :", _average);
      setAverageROI(_average);
    });
    getUserTransactions(address, null).then((_transactions) => {
      setTransactions(_transactions);
      // console.log("Transactions:", transactions);
    });
  }, [address]);

  // console.log("timeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", time);

  // Renderer callback with condition
  const liveWithdrawTime = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a complete state
      return (
        <span className="text-green-300">
          {userInvestment?.withdrawable
            ? " " + parseInt(userInvestment?.withdrawable).toFixed(2) + " USDT"
            : ""}
        </span>
      );
    } else {
      // Render a countdown
      return (
        <span>
          &nbsp;In:&nbsp;
          {days
            ? `${days} Days : ${hours} Hrs: ${minutes} Mins : ${seconds} Sec`
            : hours
            ? `${hours} Hrs : ${minutes} Mins : ${seconds} Sec`
            : minutes
            ? `${minutes} Mins : ${seconds} Sec`
            : seconds + " Sec"}
        </span>
      );
    }
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <section className="p-6">
        {/* Top Container */}
        <div className="container grid gap-6 mx-auto text-center lg:grid-cols-2 xl:grid-cols-7">
          {/* Balance Status */}
          <div className="w-full rounded-md xl:col-span-2 border border-primary_gray p-3">
            <div className="container grid gap-3 mx-auto text-center grid-cols-1 xl:grid-cols-2">
              <div className="w-full text-left p-3 rounded-md bg-gray-900 text-white h-24">
                <h3 className="text-primary_gray">USDT Balance</h3>
                <h3>{busdBalance} USDT</h3>
              </div>
              <div className="w-full text-left p-3 rounded-md bg-gray-900 text-white h-24">
                <h3 className="text-primary_gray">USDT Invested</h3>
                <h3>
                  {userInvestment?.invested_status === true
                    ? userInvestment?.amount
                    : ""}
                  {userInvestment?.invested_status === true ? " USDT" : "--:--"}
                </h3>
              </div>
            </div>
          </div>
          {/* ROI / Date Status */}
          <div className="w-full rounded-md xl:col-span-5 border border-primary_gray p-3">
            <div className="container grid gap-6 mx-auto text-center lg:grid-cols-1 xl:grid-cols-3">
              <div className="w-full rounded-md bg-primary_light drop-shadow-lg text-left p-3 pl-6 h-24 lg:col-span-2">
                <div>
                  <h3 className="text-white">This Week's ROI</h3>
                  {weeklyROI?.profitStatus ? (
                    <span className="text-green-800">
                      {weeklyROI.percentage.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-red-600">
                      {weeklyROI.percentage.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-md bg-primary_light drop-shadow-lg text-left p-3 pl-6 h-24">
                <div>
                  <h3 className="text-white drop-shadow-lg">Weekly Avg ROI:</h3>
                  <h3 className="text-pr">{averageROI?.toFixed(2)}%</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Write Functions */}
        <div className="container grid gap-8 border border-primary_gray text-center lg:grid-cols-2 xl:grid-cols-7 mx-auto mt-6 p-3 rounded-md">
          {/* Tab 1 */}
          <div className="w-full rounded-md xl:col-span-2 bg-gray-900 text-white p-3 shadow-lg">
            {/* Deposit */}
            <div className="w-full text-left mb-2">
              <h3 className="text-primary_gray">
                Min. {minMaxInvestment?.minInvestment?.toFixed(2)} USDT Max.{" "}
                {minMaxInvestment?.maxUserInvestment?.toFixed(2)} USDT
              </h3>
            </div>
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
                onClick={() => {
                  axios
                    .get(
                      "https://app.creativewealth.finance/api/current/day",
                      {}
                    )
                    .then((res) =>
                      // res.data == "Saturday" || res.data == "Sunday"
                      true
                        ? investFunds(
                            BUSDContract,
                            DEXContract,
                            CFContractAddress,
                            depositAmount,
                            address,
                            refresh,
                            setRefresh
                          )
                        : toast.error("Only Deposit on Weekends!")
                    );
                }}
                disabled={
                  depositAmount >= minMaxInvestment?.minInvestment &&
                  depositAmount <= minMaxInvestment?.maxUserInvestment
                    ? false
                    : true
                }
                className={`w-1/3 py-2 font-semibold rounded-sm text-white ${
                  depositAmount >= minMaxInvestment?.minInvestment &&
                  depositAmount <= minMaxInvestment?.maxUserInvestment
                    ? "bg-primary"
                    : "bg-slate-600"
                }`}
              >
                Deposit
              </button>
            </div>
            <p className="text-xs text-red-300 mt-2 text-left">
              {depositStatus ? "" : "Deposits Are Currently Off!"}
            </p>
            <hr className="my-5" />
            {/* ROI */}
            <div>
              {/* Deposit */}
              <div className="w-full text-left mb-2">
                <h3 className="text-primary_gray mb-4">
                  {userInvestment.invested_status ? (
                    <span>
                      Balance Available
                      <Countdown
                        date={Date.now() + time}
                        renderer={liveWithdrawTime}
                      />
                    </span>
                  ) : (
                    "Please Invest First"
                  )}
                </h3>
              </div>
              {/* Withdraw */}
              <div className="w-full">
                <input
                  id="name"
                  type="number"
                  placeholder="Enter Amount"
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full mr-2 pl-4 py-2 text-primary rounded-sm border border-primary focus:ring focus:ring-primary"
                />
                <div className="flex sm:flex-row gap-3 sm:gap-0 flex-col mt-3">
                  {/* Reinvest */}
                  {/* <button
                    type="button"
                    disabled={withdrawAmount > 0 ? false : true}
                    onClick={() =>
                      reinvestFunds(
                        DEXContract,
                        withdrawAmount,
                        refresh,
                        setRefresh
                      )
                    }
                    className={`w-full py-2 font-semibold rounded-sm bg-primary text-white mr-3 ${
                      withdrawAmount > 0 ? "bg-primary" : "bg-slate-600"
                    }`}
                  >
                    Reinvest
                  </button> */}
                  {/* Rewithdraw ---- */}
                  <button
                    type="button"
                    disabled={withdrawAmount > 0 ? false : true}
                    onClick={() =>
                      withdrawFunds(
                        DEXContract,
                        withdrawAmount,
                        address,
                        refresh,
                        setRefresh
                      )
                    }
                    className={`w-full py-2 font-semibold rounded-sm bg-primary text-white ${
                      withdrawAmount > 0 ? "bg-primary" : "bg-slate-600"
                    }`}
                  >
                    Withdraw
                  </button>
                </div>
              </div>

              <hr className="my-5" />
              {/* ROI */}
              <div className="w-full flex justify-between px-3 pt-2">
                <div className="w-full text-left">
                  <h3 className="text-primary_gray">This Week's ROI</h3>
                  {withdrawStatus ? (
                    userInvestment.profit ? (
                      <span className="text-green-300">
                        {(
                          (userInvestment.amount * userInvestment.profit) /
                          10000
                        ).toFixed(2)}{" "}
                        USDT
                      </span>
                    ) : (
                      <span className="text-red-300">
                        {(
                          (userInvestment.amount * userInvestment.loss) /
                          10000
                        ).toFixed(2)}{" "}
                        USDT
                      </span>
                    )
                  ) : (
                    "Not Available Yet"
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    weeklyWithdraw(DEXContract, refresh, setRefresh)
                  }
                  className="w-2/3 h-10 px-0 text-sm font-semibold rounded-full border border-gray-100 hover:bg-primary text-white"
                >
                  Claim ROI
                </button>
              </div>
            </div>
          </div>
          {/* Tx Table ================================================================================================= */}
          <div className="w-full xl:col-span-5 overflow-x-auto">
            <h5 className="text-left mb-2 text-lg font-medium mt-2">
              Recent Transactions
            </h5>
            <div className="w-full rounded-md xl:col-span-5 overflow-x-auto shadow-md">
              <div className="inline-block min-w-full rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-primary_light text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Hash
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-primary_light text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Block
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-primary_light text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-primary_light text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-5 py-3 min-w-[200px] border-b-2 border-gray-200 bg-primary_light text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.result?.map((tx) => (
                      <tr
                        key={tx?.block_hash}
                        onClick={() =>
                          window.open(
                            `https://${process.env.REACT_APP_CHAIN}.${process.env.REACT_APP_BLOCK_EXPLORER}.com/tx/${tx?.hash}`,
                            "_blank"
                          )
                        }
                        className="cursor-pointer hover:bg-gray-200"
                      >
                        <td className="px-5 py-5 border-b border-gray-200 text-sm text-left">
                          {tx?.block_hash.slice(0, 8) + "..."}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm text-left">
                          {tx?.block_number}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm text-left">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {tx?.from_address.slice(0, 8) +
                              "..." +
                              tx?.from_address.slice(35, -1)}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm text-left">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {tx?.to_address.slice(0, 8) +
                              "..." +
                              tx?.to_address.slice(35, -1)}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm text-left">
                          <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                            <span
                              aria-hidden
                              className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                            ></span>
                            <span className="relative">
                              {tx?.block_timestamp.split("T")[0]}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between          ">
                  <span className="text-xs xs:text-sm text-gray-900">
                    Showing {transactions.page + 1} to{" "}
                    {transactions.page_size + 1} of {transactions.total} Entries
                  </span>
                  <div className="inline-flex mt-2 xs:mt-0">
                    {/* <button className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l">
                    Prev
                  </button> */}
                    <button
                      onClick={() =>
                        getUserTransactions(address, transactions?.cursor).then(
                          (_tx) => setTransactions(_tx)
                        )
                      }
                      className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                    >
                      Next Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
