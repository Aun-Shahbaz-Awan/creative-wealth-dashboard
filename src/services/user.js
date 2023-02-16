import { ethers } from "ethers";
import { postUserInvestmentDB, postUserWithdrawDB } from "./backend";
import toast from "react-hot-toast";

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ UTIL ]
export const handleEthDecimalFormat = (number) => {
  return number
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ READ ]
export const getBUSDBalance = async (contract, u_address) => {
  return await contract?.balanceOf(u_address);
};

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ READ ]
export const getUserInvestment = async (contract, u_address) => {
  return await contract?.userInvestment(u_address);
};

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ READ ]
export const getROI = async (contract) => {
  return await contract?.roi().then((roi) => {
    // console.log("Internal ROI____________:", roi);
    return {
      percentage: parseInt(roi?.per._hex, 16),
      profitStatus: roi?.pl,
      time: parseInt(roi?.time._hex, 16),
    };
  });
};

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ READ ]
export const getDepositStatus = async (contract) => {
  return await contract?.deposit();
};

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ CALL ]
export const investFunds = async (
  busdContract,
  dexContract,
  dexAddress,
  _amount,
  u_address,
  refresh,
  setRefresh
) => {
  await busdContract
    .approve(dexAddress, ethers.utils.parseEther(_amount.toString()))
    .then((_ap_tx) => {
      // Wait for BUSD Approval to consumed by Smart-Contract ---------------- [SM CALL 1]
      toast.promise(
        _ap_tx.wait().then(
          // Invest Iniciated ------------------------------------------------ [SM CALL 2]
          async (_tx_responce) => {
            dexContract
              ?.invest(
                ethers.utils.parseEther(_amount.toString()),
                process.env.REACT_APP_DAPP_PASSWARD
              )
              .then(async (tx) => {
                toast.promise(
                  tx.wait().then((_responce) => {
                    // Save Record to DB ------------------------------------- [SM CALL DB]
                    postUserInvestmentDB(
                      u_address,
                      ethers.utils.parseEther(_amount.toString()).toString()
                    ).then((db_res) => {
                      console.log("DB Respoce:", db_res);
                    });
                    setRefresh(!refresh);
                  }),
                  {
                    loading: "Tx 2 of 2: Your funds on the way...",
                    success: "Successfully Done!",
                    error: "Something went wrong!",
                  }
                );
              })
              .catch((error) => {
                console.log("Investment Error:", error);
                if (error?.error?.data?.code === 3)
                  toast.error(error?.error?.data?.message);
                else {
                  toast.error("Something went Wrong!");
                }
              });
          }
        ),
        {
          loading: "Tx 1 of 2: Getting Approval...",
          success: "Successfully Approved!",
          error: "Something went wrong!",
        }
      );
    })
    .catch((err) => {
      console.log("Reject at 1st Stage:", err);
      return false;
    });
};

// Withdraw User's Monthly Available Funds ------------------------------------------------------------ [ CALL ]
export const withdrawFunds = async (
  dexContract,
  amount,
  u_address,
  refresh,
  setRefresh
) => {
  await dexContract
    ?.monthlyWithdraw(ethers.utils.parseEther(amount.toString()))
    .then((tx) => {
      toast.promise(
        tx.wait().then((_responce) => {
          console.log("Withdraw Funds Tx Res:", _responce);
          postUserWithdrawDB(
            u_address,
            ethers.utils.parseEther(amount.toString()).toString()
          ).then((db_res) => {
            console.log("DB Respoce:", db_res);
          });
          toast.success("Successfully Done!");
          setRefresh(!refresh);
          return true;
        }),
        {
          loading: "Withdraw in Process...",
          error: "Something went Wrong!",
        }
      );
    })
    .catch((error) => {
      console.log("Withdraw Error: ", error?.error?.data);
      if (error?.error?.data?.code === 3)
        toast.error(error?.error?.data?.message);
      else {
        toast.error("Something went Wrong!");
      }
      return true;
    });
};

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ CALL ]
export const reinvestFunds = async (
  dexContract,
  amount,
  refresh,
  setRefresh
) => {
  await dexContract
    ?.reInvestMonthly(ethers.utils.parseEther(amount.toString()))
    .then((tx) => {
      toast.promise(
        tx.wait().then((_responce) => {
          console.log("Reinvest Funds Tx Res:", _responce);
          setRefresh(!refresh);
          return true;
        }),
        {
          loading: "Withdraw in Process...",
          success: "Successfully Done!",
          error: "Something went Wrong!",
        }
      );
    })
    .catch((error) => {
      console.log("Reinvest Error: ", error?.error?.data);
      if (error?.error?.data?.code === 3)
        toast.error(error?.error?.data?.message);
      else {
        toast.error("Something went Wrong!");
      }
      return true;
    });
};

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ CALL ]
export const weeklyWithdraw = async (dexContract, refresh, setRefresh) => {
  await dexContract
    ?.weeklyWithdraw()
    .then((tx) => {
      toast.promise(
        tx.wait().then((_responce) => {
          console.log("Weely Withdrawal Tx Res:", _responce);
          setRefresh(!refresh);
          return true;
        }),
        {
          loading: "Withdraw in Process...",
          success: "Successfully Done!",
          error: "Something went Wrong!",
        }
      );
    })
    .catch((error) => {
      console.log("Reinvest Error: ", error?.error?.data);
      if (error?.error?.data?.code === 3)
        toast.error(error?.error?.data?.message);
      else {
        toast.error("Something went Wrong!");
      }
      return true;
    });
};

// Get User's BUSD Token  Balance --------------------------------------------------------------------- [ READ ]
export const getWithdrawStatus = async (dexContract) => {
  return await dexContract?.withdrawl();
};
