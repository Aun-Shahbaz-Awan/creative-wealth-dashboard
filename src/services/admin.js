import { ethers } from "ethers";
import { CFContractAddress } from "./../contracts/address";
import { postUserROIDB } from "./backend";
import toast from "react-hot-toast";

// Get Owner ---------------------------------------------------------------- [ READ ]
export const isOwner = async (context) => {
  return await context?.contracts?.tradeContract?.owner().then((owner) => {
    return context?.contracts?.user === owner ? true : false;
  });
};

// Get Owner Balance ------------------------------------------------------- [ READ ]
export const getOwnerBalance = async (context) => {
  return await context?.contracts?.tokenContract
    ?.balanceOf(context?.contracts?.user)
    .then((_balance) => {
      return ethers.utils.formatEther(_balance);
    });
};

// Get Contract Balance ---------------------------------------------------- [ READ ]
export const getContractBalance = async (context) => {
  return await context?.contracts?.tokenContract
    ?.balanceOf(CFContractAddress)
    .then((_balance) => {
      return ethers.utils.formatEther(_balance);
    });
};

// Get Withdrawal Status -------------------------------------------------- [ READ ]
export const getWithdrawalStatus = async (context) => {
  return await context?.contracts?.tradeContract?.withdrawl();
};

// Invest Funds by Owner --------------------------------------------------- [ CALL ]
export const ownerAddFunds = async (context, _amount, refresh, setRefresh) => {
  await context?.contracts?.tokenContract
    .approve(CFContractAddress, ethers.utils.parseEther(_amount.toString()))
    .then((allowance_responce) => {
      toast.promise(
        allowance_responce.wait().then(async () => {
          // After Allowance Successfully - Add Fund to Contract
          await context?.contracts?.tradeContract
            ?.fund(ethers.utils.parseEther(_amount.toString()))
            .then((tx) => {
              toast.promise(
                tx.wait().then((_responce) => {
                  setRefresh(!refresh);
                  console.log("Add Funds Res:", _responce);
                  return true;
                }),
                {
                  loading: "Adding Funds...",
                  success: "Successfully Done!",
                  error: "Something went Wrong!",
                }
              );
            });
        }),
        {
          loading: "Tx 1 of 2: Getting Approval...",
          success: "Successfully Approved!",
          error: "Something went wrong!",
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

// Withdraw Funds by Owner ------------------------------------------------ [ CALL ]
export const ownerWithdrawFunds = async (
  context,
  _amount,
  _address,
  refresh,
  setRefresh
) => {
  await context?.contracts?.tradeContract
    ?.withdraw(_address, ethers.utils.parseEther(_amount.toString()))
    .then((tx) => {
      toast.promise(
        tx.wait().then((_responce) => {
          setRefresh(!refresh);
          console.log("Withdraw Funds Res:", _responce);
          return true;
        }),
        {
          loading: "Withdraw in Progress...",
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

// Owner Update ROI ------------------------------------------------------ [ CALL ]
export const ownerUpdateROI = async (context, ROI, refresh, setRefresh) => {
  await context?.contracts?.tradeContract
    ?.updateROIWeekly(parseInt(ROI.percentage), ROI.profitStatus)
    .then((tx) => {
      toast.promise(
        tx.wait().then((_responce) => {
          console.log("Withdraw Funds Res:", _responce);
          setRefresh(!refresh);
          postUserROIDB(ROI.profitStatus, parseInt(ROI.percentage));
          return true;
        }),
        {
          loading: "Updating in Progress...",
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

// Owner Update Withdrawal Status --------------------------------------- [ CALL ]
export const ownerUpdateWithdrawalStatus = async (
  context,
  status,
  refresh,
  setRefresh
) => {
  await context?.contracts?.tradeContract
    ?.toggleWithdrawl(status)
    .then((_responce) => {
      toast.promise(
        _responce.wait((tx) => {
          setRefresh(!refresh);
          console.log("Withdrawal Status:", tx);
          return true;
        }),
        {
          loading: "Updating in Progress...",
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
