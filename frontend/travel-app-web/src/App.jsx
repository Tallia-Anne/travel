import { BrowserRouter as Router, Routes,Route, Navigate } from "react-router-dom"

import Login from "./pages/Auth/Login"
import SignUp from "./pages/Auth/SignUp"
import Home from "./pages/Home/Home"
import ViewUser from "./pages/Setting/ViewUser"
import UpdateUser from "./pages/Setting/UpdateUser"


const App = () => {
  return (
    <div>

    <Router>
    <Routes>
      <Route path="/" exact element={<Root />} />
       <Route path="/viewuser" exact element={<ViewUser />} />
      <Route path="/updateuser" exact element={<UpdateUser />} />
      <Route path="/dashboard" exact element={<Home />} />
       <Route path="/login" exact element={<Login />} />
       <Route path="/signUp" exact element={<SignUp />} />

      </Routes>
    </Router>

    </div>
  )
}


const Root = () => {


const isAuthenticated = !!localStorage.getItem('token');

return isAuthenticated ? (

  <Navigate to="/dashboard" />
 ) :  (
 <Navigate to="/login" />
)



}


export default App