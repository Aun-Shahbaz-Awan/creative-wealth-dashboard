import axios from "axios";
import { CFContractAddress } from "./../contracts/address";

export const getTransactions = async (_cursor) => {
  console.log("cursor:", _cursor);
  const options = {
    method: "GET",
    url: `https://deep-index.moralis.io/api/v2/${CFContractAddress}`,
    params: {
      chain: process.env.REACT_APP_CHAIN,
      limit: 4,
      cursor: _cursor,
      format: "decimal",
      normalizeMetadata: "false",
    },
    headers: {
      accept: "application/json",
      "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY,
    },
  };

  const data = await axios
    .request(options)
    .then((response) => {
      console.log("All DATA:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Get User NFT Error:", error);
      return {};
    });

  return data;
};

export const getUserTransactions = async (address, _cursor) => {
  console.log("cursor:", _cursor);
  const options = {
    method: "GET",
    url: `https://deep-index.moralis.io/api/v2/${address}`,
    params: {
      chain: process.env.REACT_APP_CHAIN,
      limit: 4,
      cursor: _cursor,
      format: "decimal",
      normalizeMetadata: "false",
    },
    headers: {
      accept: "application/json",
      "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY,
    },
  };

  const data = await axios
    .request(options)
    .then((response) => {
      console.log("All DATA:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Get User NFT Error:", error);
      return {};
    });

  return data;
};
