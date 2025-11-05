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
import WarehouseManagement from "./pages/company/warehouseManagement/WarehouseManagement";
import DealerStaffManagement from "./pages/agency/dealerManager/dealerStaffManagement/DealerStaffManagement";
import StockManagement from "./pages/agency/stockManagement/StockManagement";
import InstallmentPlan from "./pages/agency/installmentPlan/InstallmentPlan";
import StockPromotion from "./pages/agency/dealerManager/stockPromotion/StockPromotion";
import CustomerContract from "./pages/agency/customerContract/CustomerContract";
import CustomerManagement from "./pages/agency/customerManagement/CustomerManagement";
import MotorbikeManagement from "./pages/company/motorbikeManagement/MotorbikeManagement";
import ColorManagement from "./pages/company/colorManagement/ColorManagement";
import AppearanceManagement from "./pages/company/appearance/AppearanceManagement";
import ConfigurationManagement from "./pages/company/configuration/ConfigurationManagement";
import OrderRestockAgency from "./pages/agency/dealerManager/orderRestock/OrderRestockAgency";
import OrderRestockManagement from "./pages/company/orderRestockManagement/OrderRestockManagement";
import BookingManagement from "./pages/agency/dealerStaff/bookingManagement/BookingManagement";
import Catalogue from "./pages/agency/dealerStaff/catalogue/Catalogue";
import QuotationManagement from "./pages/agency/dealerStaff/quotationManagement/QuotationManagement";
import Payment from "./pages/payment/Payment";
import EvmStaffWarehouseManagement from "./pages/company/evmStaff/warehouseManagement/WarehouseManagementEVMStaff";
import EvmStaffDiscountManagement from "./pages/company/evmStaff/discountManagement/DiscountManagementEVMStaff";
import EvmStaffPromotionManagement from "./pages/company/evmStaff/promotionManagement/PromotionManagementEVMStaff";
import EvmStaffInventoryManagement from "./pages/company/evmStaff/inventoryManagement/InventoryManagementEVMStaff";
import EvmStaffOrderRestockManagement from "./pages/company/evmStaff/orderRestockManagement/OrderRestockManagementEVMStaff";
import EvmStaffPricePolicyManagement from "./pages/company/evmStaff/pricePolicyManagement/PricePolicyManagementEVMStaff";

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/user/home" />} />

          {/* Public */}
          <Route path="/payment" element={<Payment />} />
          <Route path="/" element={<AuthenLayout />}>
            <Route path="login" element={<Login />} />
          </Route>
          <Route path="/" element={<UserLayout />}>
            <Route path="user/home" element={<HomePage />} />
            <Route path="user/driving-test" element={<DrivingTest />} />
            <Route path="user/bike/:id" element={<BikeDetail />} />
            <Route path="user/products" element={<Product />} />
          </Route>

          {/* Private agency */}
          <Route path="/" element={<AgencyLayout />}>
            <Route path="agency/dashboard" element={<AgencyDash />} />
            <Route
              path="agency/all-staff"
              element={<DealerStaffManagement />}
            />
            <Route
              path="agency/stock-management"
              element={<StockManagement />}
            />
            <Route
              path="agency/installment-plan"
              element={<InstallmentPlan />}
            />
            <Route path="agency/stock-promotion" element={<StockPromotion />} />
            <Route path="agency/order-restock" element={<OrderRestockAgency />} />
            <Route path="agency/customer-contract" element={<CustomerContract />} />
            <Route path="agency/customer-management" element={<CustomerManagement />} />
            <Route path="agency/booking-management" element={<BookingManagement />} />
            <Route path="agency/catalogue" element={<Catalogue />} />
            <Route path="agency/quotation-management" element={<QuotationManagement />} />
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
            <Route path="company/warehouse" element={<WarehouseManagement />} />
            <Route
              path="company/order-restock"
              element={<OrderRestockManagement />}
            />
            <Route path="company/dashboard" element={<CompanyDash />} />
            <Route path="company/product" element={<CompanyProduct />} />
            <Route path="company/report" element={<CompanyReport />} />
            <Route
              path="company/agency-management"
              element={<AgencyManagement />}
            />
            <Route path="company/dealerManager" element={<DealerManager />} />
            <Route path="company/motorbike" element={<MotorbikeManagement />} />
            <Route path="company/color" element={<ColorManagement />} />
            <Route path="company/appearance" element={<AppearanceManagement />} />
            <Route path="company/configuration" element={<ConfigurationManagement />} />
            {/* EVM Staff Routes */}
            <Route
              path="company/evm-staff/warehouse"
              element={<EvmStaffWarehouseManagement />}
            />
            <Route
              path="company/evm-staff/discount"
              element={<EvmStaffDiscountManagement />}
            />
            <Route
              path="company/evm-staff/promotion"
              element={<EvmStaffPromotionManagement />}
            />
            <Route
              path="company/evm-staff/inventory"
              element={<EvmStaffInventoryManagement />}
            />
            <Route
              path="company/evm-staff/order-restock"
              element={<EvmStaffOrderRestockManagement />}
            />
            <Route
              path="company/evm-staff/price-policy"
              element={<EvmStaffPricePolicyManagement />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
