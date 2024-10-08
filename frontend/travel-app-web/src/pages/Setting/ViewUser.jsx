import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosinstance";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const ViewUser = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);  // Initialisation à null

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');

      if (response.data && response.data.user) {
        setUserInfo(response.data.user); // Stocker les informations utilisateur
        console.log(response.data.user); // Afficher pour le debug
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        
      }
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  // Gérer l'état où userInfo est encore null ou en cours de chargement
  if (!userInfo) {
    return <div>Chargement...</div>; // Afficher un message de chargement ou un spinner
  }

  return (
    <>
    <Navbar userInfo={userInfo}
      />
    
    <div className="flex items-center justify-center w-[100%] h-[100vh] flex-col">
    <h1 className="pb-8 font-bold text-2xl uppercase">Les informations</h1>
      <table className="table-auto">
        <thead>
          <tr>
            <th>Nom complet</th>
            <th className="font-normal">{userInfo.fullName}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-bold">Email</td> {/* Afficher le nom complet */}
            <td>{userInfo.email}</td>     {/* Afficher l'email */}
          </tr>
        </tbody>
      </table>

    <div className="p-12" >
     <button
              type="submit"
              className="btn-primary btn-light"
              onClick={() => {
                navigate("/updateuser");
              }}
            >
              {" "}
              UPDATE ACCOUNT{" "}
            </button>
    </div>

    </div>
</>
  );
};

export default ViewUser;
