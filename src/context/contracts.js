import { createContext, useContext, useEffect, useState } from "react";
// WEB3
import { ethers } from "ethers";
import { useAccount, useSigner } from "wagmi";
import { BUSDContractAbi, CFContractAbi } from "../contracts/abi";
import { BUSDContractAddress, CFContractAddress } from "../contracts/address";

const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const [contracts, setContracts] = useState({});
  const { data: signer, isError } = useSigner();
  const { address } = useAccount();

  useEffect(() => {
    if (isError) return;
    if (signer) {
      const BUSDContract = new ethers.Contract(
        BUSDContractAddress,
        BUSDContractAbi,
        signer
      );
      const DEXContract = new ethers.Contract(
        CFContractAddress,
        CFContractAbi,
        signer
      );
      setContracts({
        user: address,
        tokenContract: BUSDContract,
        tradeContract: DEXContract,
      });
    }
  }, [signer]);

  return (
    <ContractContext.Provider value={{ contracts, setContracts }}>
      {children}
    </ContractContext.Provider>
  );
};

export const UseContractContext = () => {
  return useContext(ContractContext);
};
