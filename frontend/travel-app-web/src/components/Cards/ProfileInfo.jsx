import { getInitials } from "../../utils/helper"
import { Link } from 'react-router-dom';


const ProfileInfo = ({ userInfo, onLogout }) => {  // Déstructuration des props
  return (
    userInfo && (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
          {getInitials(userInfo.fullName || "")}  {/* Utilisation correcte de userInfo.fullName */}
        </div>
        <div>
           <Link to="/viewuser">
          <p className="text-sm font-medium">{userInfo.fullName || ""}</p>  
          </Link>
          <button className="text-sm text-slate-700 underline" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default ProfileInfo;
