import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import QuotationManagementStaff from "../dealerStaff/quotationManagement/QuotationManagement";
import QuotationManagementManager from "../dealerManager/quotationManagement/QuotationManagement";

function QuotationManagementWrapper() {
  const { user } = useAuth();
  const userRole = user?.role?.[0] || "";

  // Render different component based on role
  if (userRole === "Dealer Manager") {
    return <QuotationManagementManager />;
  }

  // Default to staff component
  return <QuotationManagementStaff />;
}

export default QuotationManagementWrapper;

