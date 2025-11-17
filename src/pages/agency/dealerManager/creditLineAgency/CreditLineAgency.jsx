import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import CreditLineCard from "./CreditLineCard/CreditLineCard";

function CreditLineAgency() {
  const { user } = useAuth();
  const [creditLine, setCreditLine] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchCreditAgency = useCallback(async () => {
    if (!user?.agencyId) return;
    setLoading(true);

    try {
      const res = await PrivateDealerManagerApi.getCreditLine(user.agencyId);
      setCreditLine(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [user?.agencyId]);

  useEffect(() => {
    fetchCreditAgency();
  }, [fetchCreditAgency]);

  return (
    <div className="p-4">
      <CreditLineCard data={creditLine} loading={loading} />
    </div>
  );
}

export default CreditLineAgency;
