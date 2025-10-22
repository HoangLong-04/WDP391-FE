import React from "react";
import { BrowserRouter, Navigate, Route } from "react-router";
import { Routes } from "react-router";
import Login from "./pages/login/Login";
import UserLayout from "./layouts/userLayout/UserLayout";
import HomePage from "./pages/customer/homePage/HomePage";
import AuthenLayout from "./layouts/AuthenLayout";
import CompanyDash from "./pages/company/companyDashboard/CompanyDash";
import CompanyLayout from "./layouts/companyLayout/CompanyLayout";
import CompanyProduct from "./pages/company/companyProduct/CompanyProduct";
import CompanyReport from "./pages/company/companyReport/CompanyReport";
import AgencyManagement from "./pages/company/admin/agencyManagement/AgencyManagement";
import DealerManager from "./pages/company/dealerManager/DealerManager";
import DrivingTest from "./pages/customer/drivingTest/DrivingTest";
import BikeDetail from "./pages/customer/bikeDetail/BikeDetail";
import Product from "./pages/customer/product/Product";
import { AuthProvider } from "./contexts/AuthProvider";
import { ToastContainer } from "react-toastify";
import AgencyLayout from "./layouts/agencyLayout/AgencyLayout";
import AgencyDash from "./pages/agency/agencyDashboard/AgencyDash";
import RoleManagement from "./pages/company/admin/roleManagement/RoleManagement";
import StaffManagement from "./pages/company/admin/staffManagement/StaffManagement";
import InventoryManagement from "./pages/company/inventoryManagement/InventoryManagement";
import DiscountManagement from "./pages/company/discountManagement/DiscountManagement";
import PricePolicyManagement from "./pages/company/pricePolicyManagement/PricePolicyManagement";
import PromotionManagement from "./pages/company/promotionManagement/PromotionManagement";

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/user/home" />} />

          {/* Public */}
          <Route path="/" element={<AuthenLayout />}>
            <Route path="login" element={<Login />} />
          </Route>
          <Route path="/" element={<UserLayout />}>
            <Route path="user/home" element={<HomePage />} />
            <Route path="user/driving-test" element={<DrivingTest />} />
            <Route path="user/bike-detail" element={<BikeDetail />} />
            <Route path="user/products" element={<Product />} />
          </Route>

          {/* Private agency */}
          <Route path="/" element={<AgencyLayout />}>
            <Route path="agency/dashboard" element={<AgencyDash />} />
          </Route>

          {/* Private company */}
          <Route path="/" element={<CompanyLayout />}>
            <Route path="company/all-staff" element={<StaffManagement />} />
            <Route path="company/role" element={<RoleManagement />} />
            <Route path="company/discount" element={<DiscountManagement />} />
            <Route
              path="company/price-policy"
              element={<PricePolicyManagement />}
            />
            <Route path="company/promotion" element={<PromotionManagement />} />
            <Route path="company/inventory" element={<InventoryManagement />} />
            <Route path="company/dashboard" element={<CompanyDash />} />
            <Route path="company/product" element={<CompanyProduct />} />
            <Route path="company/report" element={<CompanyReport />} />
            <Route
              path="company/agency-management"
              element={<AgencyManagement />}
            />
            <Route path="company/dealerManager" element={<DealerManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
