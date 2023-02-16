import axios from "axios";

// USER INVESTMENTS ---------------------------------------------------------------- [ POST ]
export const postUserInvestmentDB = async (_user, _investment) => {
  axios
    .post(
      `${process.env.REACT_APP_BASE_URL}/invest?wallet_address=${_user}&investment=${_investment}`
    )
    .then((response) => {
      console.log("API Responce:", response);
    })
    .catch((error) => {
      console.log("User Investment API Error:", error);
    });
};
// USER WITHDRAW ---------------------------------------------------------------- [ POST ]
export const postUserWithdrawDB = async (_user, _investment) => {
  axios
    .post(
      `${process.env.REACT_APP_BASE_URL}/withdraw?address=${_user}&amount=${_investment}`
    )
    .then((response) => {
      console.log("API Responce:", response);
    })
    .catch((error) => {
      console.log("User Investment API Error:", error);
    });
};

// GET Total INVESTMENTS ---------------------------------------------------------- [ GET ]
export const getTotalInvestmentDB = async () => {
  const _res = await axios
    .get(`${process.env.REACT_APP_BASE_URL}/investment/total`)
    .then((response) => {
      return response?.data?.total;
    })
    .catch((error) => {
      console.log("GET TOTAL Responce API Error:", error);
    });
  return _res;
};

// GET ALL USER INVESTMENTS ------------------------------------------------------- [ GET ]
export const getAllInvestmentDB = async (_user, _investment) => {
  const _res = await axios
    .get(`${process.env.REACT_APP_BASE_URL}/total`)
    .then((response) => {
      return response?.data;
    })
    .catch((error) => {
      console.log("GET TOTAL Responce API Error:", error);
    });
  return _res;
};

// GET ALL USER INVESTMENTS ------------------------------------------------------- [ GET ]
export const getMonthlyTradeVolumn = async () => {
  const _res = await axios
    .get(`${process.env.REACT_APP_BASE_URL}/get-trade-volume`)
    .then((response) => {
      return response?.data?.total;
    })
    .catch((error) => {
      console.log("GET TOTAL Responce API Error:", error);
    });
  return _res;
};

// ROI ---------------------------------------------------------------------------- [ POST ]
export const postUserROIDB = async (status, percentage) => {
  axios
    .post(
      `${process.env.REACT_APP_BASE_URL}/roi?profit=${status}&amount=${percentage}`
    )
    .then((response) => {
      console.log("ROI API Responce:", response);
    })
    .catch((error) => {
      console.log("User Investment API Error:", error);
    });
};

// GET Average ROI ----------------------------------------------------------------- [ POST ]
export const getUserAverageROIDB = async () => {
  const roi = axios
    .get(`${process.env.REACT_APP_BASE_URL}/roi/average`, {
      headers: { Accept: "*/*", "Access-Control-Allow-Origin": "*" },
    })
    .then((response) => {
      console.log("ROI API Responce:", response?.data?.average);
      return response?.data?.average;
    })
    .catch((error) => {
      console.log("User Investment API Error:", error);
    });
  return roi;
};
