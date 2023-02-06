import React, { useEffect, useState } from "react";
import { UseContractContext } from "../context/contracts";
import { useSigner } from "wagmi";
import { ethers } from "ethers";
import { Switch } from "@headlessui/react";
import {
  getOwnerBalance,
  getContractBalance,
  ownerAddFunds,
  ownerWithdrawFunds,
  ownerUpdateROI,
  getWithdrawalStatus,
  ownerUpdateWithdrawalStatus,
} from "../services/admin";
import { getAllInvestmentDB, getTotalInvestmentDB } from "../services/backend";
import { getTransactions } from "./../services/moralis";
import TotalInvestmentChart from "./charts/TotalInvestmentChart";
import { Toaster } from "react-hot-toast";
// Chart ---->

function AdminDashboard() {
  const context = UseContractContext();
  const { data: signer } = useSigner();
  const [contractBalance, setContractBalance] = useState(0);
  const [ownerBalance, setOwnerBalance] = useState(0);
  const [addAmount, setAddAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [roi, setRoi] = useState({ percentage: "", profitStatus: true }); //
  const [withdrawalStatus, setWithdrawalStatus] = useState(false);
  const [allInvestments, setAllInvestments] = useState({});
  const [showGraph, setShowGraph] = useState(false); // To resolve rander issue
  const [transactions, setTransactions] = React.useState({}); // Past Transactions
  const [totalInvestment, setTotalInvestment] = React.useState(0); // Past Transactions
  const [refresh, setRefresh] = React.useState(true);

  useEffect(() => {
    if (signer) {
      getContractBalance(context).then((balance) =>
        setContractBalance(balance)
      );
      getOwnerBalance(context).then((balance) => setOwnerBalance(balance));
      getWithdrawalStatus(context).then((status) =>
        setWithdrawalStatus(status)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer, refresh]);

  // if (signer) {
  //   getContractBalance(context).then((balance) => setContractBalance(balance));
  //   getOwnerBalance(context).then((balance) => setOwnerBalance(balance));
  //   getWithdrawalStatus(context).then((status) => setWithdrawalStatus(status));
  // }

  useEffect(() => {
    getAllInvestmentDB().then((_inv) => {
      let _newKeyObject = [];
      _inv?.investments.map((record) => {
        var date = new Date(record?.created_at);
        return _newKeyObject.push({
          time: Math.floor(date.getTime() / 1000),
          value: parseFloat(ethers.utils.formatEther(record?.amount)),
        });
      });
      setAllInvestments(_newKeyObject);
      setShowGraph(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const fetchBackendRecord = () => {
    getTransactions(null).then((_transactions) => {
      setTransactions(_transactions);
      console.log("Transactions:", transactions);
    });
    getTotalInvestmentDB().then((_total) => {
      setTotalInvestment(ethers.utils.formatEther(_total.toString()));
    });
  };
  console.log("All Investments UP:", allInvestments);

  useEffect(() => {
    fetchBackendRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return (
    <section className="p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container grid gap-6 mx-auto text-center lg:grid-cols-2 xl:grid-cols-7">
        {/* COLUMN 1 - (border border-primary_gray p-3)*/}
        <div className="w-full rounded-md xl:col-span-2">
          {/* COL 1 SUB 1 */}
          <div className="container grid gap-3 mx-auto text-center grid-cols-1 xl:grid-cols-2 mb-3">
            <div className="w-full text-left p-3 rounded-md bg-gray-900 text-white h-24">
              <h3 className="text-primary_gray">Total Trade</h3>
              <h3>{totalInvestment} BUSD</h3>
            </div>
            <div className="w-full text-left p-3 rounded-md bg-gray-900 text-white h-24">
              <h3 className="text-primary_gray">Wallet Balance</h3>
              <h3>{ownerBalance} BUSD</h3>
            </div>
          </div>
          {/* COL 1 SUB 2 */}
          <div className="w-full rounded-md xl:col-span-2 bg-gray-900 text-white p-3">
            {/* ROI ------------------------------------------------------------------------------------ COL1-MOD1 */}
            <div className="w-full flex justify-between items-center mb-2">
              <h3 className="text-primary_gray">Update ROI %</h3>
              <div className="flex items-center">
                <p className="mr-2">{roi.profitStatus ? "Profit " : "Loss "}</p>
                <Switch
                  checked={roi.profitStatus}
                  onChange={() =>
                    setRoi({ ...roi, profitStatus: !roi.profitStatus })
                  }
                  className={`${
                    roi.profitStatus ? "bg-green-300" : "bg-red-300"
                  }
          relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      roi.profitStatus ? "translate-x-4" : "translate-x-0"
                    }
            pointer-events-none inline-block h-[18px] w-[20px] transform rounded-full bg-primary shadow-md ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <input
                id="name"
                type="number"
                placeholder="Percentage"
                onChange={(e) => {
                  setRoi({ ...roi, percentage: e.target.value });
                }}
                className="w-2/3 mr-2 pl-4 rounded-sm text-primary border border-primary focus:ring focus:ring-primary"
              />
              <button
                type="button"
                onClick={() =>
                  ownerUpdateROI(context, roi, refresh, setRefresh)
                }
                disabled={roi?.percentage === "" ? true : false}
                className="w-1/3 py-2 font-semibold rounded-sm bg-primary text-white disabled:bg-primary_gray"
              >
                Update
              </button>
            </div>
            <hr className="my-5" />
            {/* Upadte Withdrawal Status --------------------------------------------------------------- COL1-MOD2 */}
            <div className="w-full flex justify-between items-center mb-2">
              <h3 className="text-primary_gray">Update Withdrawal Status</h3>
              <div className="flex items-center">
                <p className="mr-2">{withdrawalStatus ? "NO" : "OFF"}</p>
                <Switch
                  checked={withdrawalStatus}
                  onChange={() =>
                    ownerUpdateWithdrawalStatus(
                      context,
                      !withdrawalStatus,
                      refresh,
                      setRefresh
                    )
                  }
                  className={`${
                    withdrawalStatus ? "bg-green-300" : "bg-red-300"
                  }
          relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      withdrawalStatus ? "translate-x-4" : "translate-x-0"
                    }
            pointer-events-none inline-block h-[18px] w-[20px] transform rounded-full bg-primary shadow-md ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>
            </div>
            <hr className="my-5" />
            {/* Withdraw / Add ------------------------------------------------------------------------- COL1-MOD3 */}
            <div className="w-full text-left mb-2">
              <h3 className="text-primary_gray">Balance Available</h3>
              <h3>{contractBalance} BUSD</h3>
            </div>
            {/* Add Funds */}
            <div className="flex justify-between w-full mb-3">
              <input
                id="name"
                type="number"
                placeholder="Enter Amount"
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-2/3 mr-2 pl-4 rounded-sm text-primary border border-primary focus:ring focus:ring-primary"
              />
              <button
                type="button"
                onClick={() =>
                  ownerAddFunds(context, addAmount, refresh, setRefresh)
                }
                className="w-1/3 py-2 font-semibold rounded-sm bg-primary text-white"
              >
                Add
              </button>
            </div>
            {/* Withdraw ---------------------------------------------------------------- */}
            <div className="w-full text-left mb-2 mt-9">
              <h3>Withdraw Funds</h3>
            </div>
            <div>
              <div className="w-full">
                <input
                  id="name"
                  type="number"
                  placeholder="Enter Amount"
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full mb-3 mr-2 pl-4 py-2 rounded-sm border border-primary text-primary focus:ring focus:ring-primary"
                />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter Wallet Address"
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full mr-2 pl-4 py-2 rounded-sm border border-primary text-primary focus:ring focus:ring-primary"
                />
                <div className="flex sm:flex-row gap-3 sm:gap-0 flex-col mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      ownerWithdrawFunds(
                        context,
                        withdrawAmount,
                        withdrawAddress,
                        refresh,
                        setRefresh
                      )
                    }
                    className="w-full py-2 font-semibold rounded-sm bg-primary text-white"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* COLUMN 2 (border border-primary_gray p-3) */}
        <div className="w-full rounded-md xl:col-span-5 ">
          {/* COL 2 SUB 1 */}
          <div className="w-full">
            <h5 className="text-left mb-2 text-lg font-medium">
              All Investments
            </h5>
            {showGraph && <TotalInvestmentChart data={allInvestments} />}
          </div>
          {/* COL 2 SUB 2 */}
          {/* Tx Table ================================================================================================= */}
          <div className="w-full ">
            <h5 className="text-left mb-2 text-lg font-medium mt-5">
              Recent Transactions
            </h5>

            <div class="overflow-x-auto w-full shadow-md sm:rounded-lg">
              <div class="inline-block max-w-xs mx-auto sm:min-w-full overflow-x-auto align-middle">
                <div class="overflow-hidden ">
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
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-primary_light text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                      {transactions.page_size + 1} of {transactions.total}{" "}
                      Entries
                    </span>
                    <div className="inline-flex mt-2 xs:mt-0">
                      {/* <button className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l">
                    Prev
                  </button> */}
                      <button
                        onClick={() =>
                          getTransactions(transactions?.cursor).then((_tx) =>
                            setTransactions(_tx)
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
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
