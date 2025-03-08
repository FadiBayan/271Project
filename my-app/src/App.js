import { Routes, Route } from "react-router-dom";
import LoginForm from "./Pages/LoginPage/LoginForm";
import SignupForm from "./Pages/LoginPage/SignUpForm";
import HomePage from "./Pages/Cabinet_Choice/HomePage";
import CabinetPage from "./Pages/Cabinet_Page/CabinetPage";  
import StudentPage from "./Pages/Student_Page/StudentPage";  
import "./static/LoginPage/Login.css";    

const App = () => {
  return (
    <div className="container">
      <Routes>
        {/* 🔹 Default Route (Login Page) */}
        <Route path="/" element={<LoginForm />} />  

        {/* 🔹 Login & Signup Routes */}
        <Route path="/login" element={<LoginForm />} />  
        <Route path="/signup" element={<SignupForm />} />  

        {/* 🔹 Home Route (Cabinet Selection) */}
        <Route path="/home" element={<HomePage />} />  

        {/* 🔹 Cabinet Section */}
        <Route path="/cabinet" element={<CabinetPage />} />  

        {/* 🔹 Student Section */}
        <Route path="/student" element={<StudentPage />} />  
      </Routes>
    </div>
  );
};

export default App;
