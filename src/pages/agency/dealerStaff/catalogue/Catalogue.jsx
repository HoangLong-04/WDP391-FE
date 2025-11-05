import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerStaffApi from "../../../../services/PrivateDealerStaffApi";
import PublicApi from "../../../../services/PublicApi";
import { toast } from "react-toastify";
import { formatCurrency } from "../../../../utils/currency";

function Catalogue() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [motorList, setMotorList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [motorDetail, setMotorDetail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.agencyId) return;
      setLoading(true);
      try {
        const [stockRes, motorRes] = await Promise.all([
          PrivateDealerStaffApi.getStockList(user.agencyId, { page: 1, limit: 100 }),
          PublicApi.getMotorList({ page: 1, limit: 200 }),
        ]);
        setStocks(stockRes.data?.data || []);
        setMotorList(motorRes.data?.data || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.agencyId]);

  const motorIdToMotor = useMemo(() => {
    const map = new Map();
    motorList.forEach((m) => map.set(m.id, m));
    return map;
  }, [motorList]);

  const openDetail = async (stockId) => {
    setSelectedId(stockId);
    setDetailLoading(true);
    try {
      const res = await PrivateDealerStaffApi.getStockById(stockId);
      const detail = res.data?.data || null;
      setSelectedDetail(detail);
      if (detail?.motorbikeId) {
        try {
          const motorRes = await PublicApi.getMotorDetailForUser(detail.motorbikeId);
          setMotorDetail(motorRes.data?.data || null);
        } catch (error) {
          // If motor detail fails, still show stock detail
          console.error(error);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const TitleBreadcrumb = () => {
    if (!selectedId) return <h2 className="text-2xl font-bold mb-2">Catalogue</h2>;
    const modelName = motorDetail?.model || motorDetail?.name || `#${selectedId}`;
    return (
      <div className="flex items-baseline gap-2 mb-2">
        <button className="text-2xl font-bold text-blue-600 hover:underline" onClick={() => { setSelectedId(null); setSelectedDetail(null); setMotorDetail(null); }}>Catalogue</button>
        <span className="text-2xl">/</span>
        <h2 className="text-2xl font-bold text-gray-900">{modelName}</h2>
      </div>
    );
  };

  return (
    <div className="p-4">
      <TitleBreadcrumb />
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : selectedId ? (
        <div className="bg-white/95 rounded-2xl shadow p-4 md:p-6 border border-gray-100">
          {detailLoading ? (
            <div className="text-gray-500">Loading detail...</div>
          ) : selectedDetail ? (
            <>
              {(() => {
                const motor = motorDetail || motorIdToMotor.get(selectedDetail.motorbikeId);
                const name = motor?.name || `Motor #${selectedDetail.motorbikeId}`;
                const bannerImg = motor?.images?.[0]?.imageUrl || motor?.images?.[0] || "";
                const colorType = motor?.colors?.find((c) => String(c.color?.id) === String(selectedDetail.colorId))?.color?.colorType;
                return (
                  <div className="rounded-2xl border bg-gradient-to-br from-[#f8fbff] to-white p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-3xl md:text-4xl font-extrabold tracking-wide uppercase mb-2">{motor?.model || name}</div>
                        <div className="text-sm text-gray-500">Listed price</div>
                        <div className="text-2xl font-bold text-indigo-700">{formatCurrency(selectedDetail.price)}</div>
                      </div>
                      <div className="mt-4 md:mt-0 h-48 md:h-56 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                        {bannerImg ? (
                          <img src={bannerImg} alt={name} className="object-contain w-full h-full" />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-gray-500">Color</div>
                        <div className="flex items-center gap-2 mt-1">
                          {colorType ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: colorType }} />
                              <span className="capitalize text-gray-700 text-sm font-medium">{colorType}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">#{selectedDetail.colorId}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Quantity</div>
                        <div className="text-lg font-semibold mt-1">{selectedDetail.quantity}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Battery Capacity</div>
                        <div className="text-lg font-semibold mt-1">{motor?.battery?.capacity || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Max Speed</div>
                        <div className="text-lg font-semibold mt-1">{motor?.configuration?.speedLimit || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Distance (WLTP)</div>
                        <div className="text-lg font-semibold mt-1">{motor?.battery?.limit || '-'}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {motorDetail?.appearance && (
                <div className="rounded-xl border bg-white p-4 mt-4">
                  <p className="font-semibold mb-2">Dimensions</p>
                  <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
                    <p>L: {motorDetail.appearance.length} mm</p>
                    <p>W: {motorDetail.appearance.width} mm</p>
                    <p>H: {motorDetail.appearance.height} mm</p>
                    <p>Weight: {motorDetail.appearance.weight} kg</p>
                    <p>Undercarriage: {motorDetail.appearance.undercarriageDistance} mm</p>
                    <p>Storage: {motorDetail.appearance.storageLimit} L</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {motorDetail?.battery && (
                  <div className="rounded-xl border p-4">
                    <p className="font-semibold mb-2">Battery</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>Type: {motorDetail.battery.type}</p>
                      <p>Capacity: {motorDetail.battery.capacity}</p>
                      <p>Charge time: {motorDetail.battery.chargeTime}</p>
                      <p>Energy consumption: {motorDetail.battery.energyConsumption}</p>
                    </div>
                  </div>
                )}
                {motorDetail?.configuration && (
                  <div className="rounded-xl border p-4">
                    <p className="font-semibold mb-2">Configuration</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>Motor type: {motorDetail.configuration.motorType}</p>
                      <p>Speed limit: {motorDetail.configuration.speedLimit}</p>
                      <p>Max capacity: {motorDetail.configuration.maximumCapacity}</p>
                    </div>
                  </div>
                )}
                {motorDetail?.safeFeature && (
                  <div className="rounded-xl border p-4">
                    <p className="font-semibold mb-2">Safe Features</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>Brake: {motorDetail.safeFeature.brake}</p>
                      <p>Lock: {motorDetail.safeFeature.lock}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-500">No data.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stocks.map((s) => {
            const motor = motorIdToMotor.get(s.motorbikeId);
            const name = motor?.name || `Motor #${s.motorbikeId}`;
            const image = motor?.images?.[0]?.imageUrl || motor?.images?.[0] || "";
            const colorType = motor?.colors?.find((c) => String(c.color?.id) === String(s.colorId))?.color?.colorType;
            return (
              <button key={s.id} onClick={() => openDetail(s.id)} className="text-left rounded-2xl bg-white/90 border border-gray-100 shadow-md p-4 flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="h-48 bg-gradient-to-br from-gray-50 to-white rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img src={image} alt={name} className="object-contain w-full h-full" />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </div>
                <div className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>Color:</span>
                  {colorType ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: colorType }} />
                      <span className="capitalize text-gray-600">{colorType}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">#{s.colorId}</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">Qty: {s.quantity}</div>
                <div className="mt-2 text-indigo-600 font-extrabold text-xl">{formatCurrency(s.price)}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Catalogue;


