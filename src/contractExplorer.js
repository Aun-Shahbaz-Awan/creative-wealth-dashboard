import { ethers } from "ethers";

// Utils
export const calculateDateDifference = async (
  _deposit_date,
  _withdraw_date
) => {
  var diff = _withdraw_date - _deposit_date;

  var diffInSeconds = diff / 1000;
  var diffInMinutes = diffInSeconds / 60;
  var diffInHours = diffInMinutes / 60;
  var diffInDays = diffInHours / 24;

  var days = Math.floor(diffInDays);
  var hours = Math.floor(diffInHours % 24);
  var minutes = Math.floor(diffInMinutes % 60);
  var seconds = Math.floor(diffInSeconds % 60);

  console.log(days + ":" + hours + ":" + minutes + ":" + seconds);
  return 0;
};

// Get User's BUSD Token  Balance ------------------------------------------------ [ CALC ]
export const handleEthDecimalFormat = (number) => {
  return number
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Get User's BUSD Token  Balance ------------------------------------------------ [ READ ]
export const getBUSDBalance = async (contract, u_address) => {
  return await contract?.balanceOf(u_address);
};

// Get User's BUSD Token  Balance ------------------------------------------------ [ READ ]
export const getUserInvestment = async (contract, u_address) => {
  return await contract?.userInvestment(u_address);
};

// Get User's BUSD Token  Balance ------------------------------------------------ [ CALL ]
export const investFunds = async (
  busdContract,
  dexContract,
  dexAddress,
  _amount
) => {
  await busdContract
    .approve(dexAddress, ethers.utils.parseEther(_amount.toString()))
    .then((ap_res) => {
      console.log("Approve Responce:", ap_res);
    });

  await dexContract
    ?.invest(
      ethers.utils.parseEther(_amount.toString()),
      process.env.REACT_APP_DAPP_PASSWARD
    )
    .then((tx) => {
      tx.wait().then((_responce) => {
        console.log("Tx Res:", _responce);
      });
    });
};

// Get User's BUSD Token  Balance ------------------------------------------------ [ CALL ]
export const getWithdrawStatus = async (dexContract) => {
  return await dexContract?.withdrawl();
};

// Get User's BUSD Token  Balance ------------------------------------------------ [ CALL ]
export const reinvestFunds = async (dexContract) => {
  await dexContract?.reInvestMonthly().then((tx) => {
    tx.wait().then((_responce) => {
      console.log("Tx Res:", _responce);
    });
  });
};

// Withdraw User's Monthly Available Funds --------------------------------------- [ CALL ]
export const withdrawFunds = async (dexContract) => {
  await dexContract?.monthlyWidthdraw().then((tx) => {
    tx.wait().then((_responce) => {
      console.log("Tx Res:", _responce);
    });
  });
};
