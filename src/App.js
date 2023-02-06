import { useState } from "react";
import { useSigner } from "wagmi";
import { UseContractContext } from "./context/contracts";
import { isOwner } from "./services/admin";
import UserDashboard from "./components/UserDashboard";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const context = UseContractContext();
  const { data: signer } = useSigner();
  const [owner, setOwner] = useState(false);
  const [temp, setTemp] = useState(true);
  if (signer) isOwner(context).then((res) => setOwner(res));

  return (
    <div>
      <Navbar />
      {temp ? <AdminDashboard /> : <UserDashboard />}
      <p className="text-xs mx-20 mt-10 mb-3">
        This button is added just for testing purposes
      </p>
      <button
        onClick={() => setTemp(!temp)}
        className="border border-primary px-3 py-2 rounded mx-20 hover:bg-primary hover:text-white"
      >
        {temp ? "Show User Dashboard" : "Show Admin Dashboard"}
      </button>
      {/* {!owner ? <AdminDashboard /> : <UserDashboard />} */}
    </div>
  );
}
