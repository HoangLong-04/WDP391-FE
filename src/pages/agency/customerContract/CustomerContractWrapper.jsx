import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import CustomerContract from "./CustomerContract";
import CustomerContractManager from "./CustomerContractManager";

function CustomerContractWrapper() {
  const { user } = useAuth();
  
  // Check both user.role (array) and user.roles (array) for compatibility
  const userRole = user?.role?.[0] || "";
  const hasDealerManagerRole = 
    userRole === "Dealer Manager" || 
    user?.roles?.includes("Dealer Manager") ||
    (Array.isArray(user?.role) && user.role.includes("Dealer Manager"));

  // Dealer Manager chỉ xem, không có actions
  if (hasDealerManagerRole) {
    return <CustomerContractManager />;
  }

  // Dealer Staff và các role khác dùng component đầy đủ với actions
  return <CustomerContract />;
}

export default CustomerContractWrapper;

