import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../../hooks/useAuth";
import PrivateDealerStaffApi from "../../../../services/PrivateDealerStaffApi";
import PublicApi from "../../../../services/PublicApi";
import { toast } from "react-toastify";
import { formatCurrency } from "../../../../utils/currency";
import FormModal from "../../../../components/modal/formModal/FormModal";
import PrivateDealerManagerApi from "../../../../services/PrivateDealerManagerApi";
import { FileText } from "lucide-react";

function Catalogue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [motorList, setMotorList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [motorDetail, setMotorDetail] = useState(null);
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    type: "AT_STORE",
    basePrice: 0,
    promotionPrice: 0,
    finalPrice: 0,
    validUntil: "",
    customerId: "",
    motorbikeId: "",
    colorId: "",
    dealerStaffId: "",
    agencyId: "",
  });
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    credentialId: "",
    dob: "",
  });
  const [stockPromotions, setStockPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState("");
  const [motorDetailsMap, setMotorDetailsMap] = useState(new Map()); // Cache motor details with full color info

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.agencyId) return;
      setLoading(true);
      try {
        const [stockRes, motorRes] = await Promise.all([
          PrivateDealerStaffApi.getStockList(user.agencyId, { page: 1, limit: 100 }),
          PublicApi.getMotorList({ page: 1, limit: 200 }),
        ]);
        const stocksData = stockRes.data?.data || [];
        const motorsData = motorRes.data?.data || [];
        setStocks(stocksData);
        setMotorList(motorsData);
        
        // Fetch motor details for motors that have stock to get full color information
        const motorIdsWithStock = new Set(stocksData.map(s => s.motorbikeId).filter(Boolean));
        const detailsMap = new Map();
        
        // Fetch details for motors with stock (limit concurrent requests)
        const fetchPromises = Array.from(motorIdsWithStock).slice(0, 20).map(async (motorId) => {
          try {
            const detailRes = await PublicApi.getMotorDetailForUser(motorId);
            const detail = detailRes.data?.data || detailRes.data;
            if (detail) {
              detailsMap.set(motorId, detail);
            }
          } catch (error) {
            console.error(`Error fetching motor detail for ${motorId}:`, error);
          }
        });
        
        await Promise.all(fetchPromises);
        setMotorDetailsMap(detailsMap);
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

  // Create a map from motorbikeId to stock data (for quick lookup)
  // If a motor has multiple stocks (different colors), we'll use the first one or aggregate
  const motorbikeIdToStock = useMemo(() => {
    const map = new Map();
    stocks.forEach((stock) => {
      const motorId = stock.motorbikeId;
      if (motorId) {
        // If motor already has a stock, aggregate quantity or keep the first one
        const existing = map.get(motorId);
        if (existing) {
          // Aggregate quantity and use the first price
          map.set(motorId, {
            ...existing,
            quantity: (existing.quantity || 0) + (stock.quantity || 0),
            stockId: existing.stockId, // Keep first stockId for detail view
          });
        } else {
          map.set(motorId, {
            stockId: stock.id,
            price: stock.price,
            quantity: stock.quantity,
            colorId: stock.colorId,
            color: stock.color, // Store color object if available
          });
        }
      }
    });
    return map;
  }, [stocks]);

  // Create a map from colorId to color object (from all stocks)
  const colorIdToColor = useMemo(() => {
    const map = new Map();
    stocks.forEach((stock) => {
      if (stock.colorId && stock.color) {
        map.set(String(stock.colorId), stock.color);
      }
    });
    return map;
  }, [stocks]);

  // Create a map from motorbikeId to all stock colors (for displaying available colors)
  const motorbikeIdToStockColors = useMemo(() => {
    const map = new Map();
    stocks.forEach((stock) => {
      const motorId = stock.motorbikeId;
      if (motorId && stock.colorId) {
        const existing = map.get(motorId);
        if (existing) {
          // Add color if not already in the list
          if (!existing.some((c) => String(c.colorId) === String(stock.colorId))) {
            existing.push({
              colorId: stock.colorId,
              stockId: stock.id,
              color: stock.color, // Store color object if available
            });
          }
        } else {
          map.set(motorId, [{
            colorId: stock.colorId,
            stockId: stock.id,
            color: stock.color, // Store color object if available
          }]);
        }
      }
    });
    return map;
  }, [stocks]);

  const openDetail = async (stockId) => {
    setSelectedId(stockId);
    setDetailLoading(true);
    try {
      const res = await PrivateDealerStaffApi.getStockById(stockId);
      const detail = res.data?.data || null;
      setSelectedDetail(detail);
      // preset quotation form from stock detail and user context
      setQuoteForm((prev) => ({
        ...prev,
        basePrice: Number(detail?.price || 0),
        promotionPrice: 0,
        finalPrice: Number(detail?.price || 0),
        motorbikeId: detail?.motorbikeId || "",
        colorId: detail?.colorId || "",
        dealerStaffId: user?.id || "",
        agencyId: user?.agencyId || "",
      }));
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

  // Check if current selection has stock
  const hasStock = selectedDetail !== null;

  return (
    <div className="p-4">
      <TitleBreadcrumb />
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : selectedId ? (
        <div className="bg-white/95 rounded-2xl shadow p-4 md:p-6 border border-gray-100">
          {detailLoading ? (
            <div className="text-gray-500">Loading detail...</div>
          ) : motorDetail ? (
            <>
              {(() => {
                const motor = motorDetail;
                const name = motor?.name || `Motor #${motor?.id}`;
                const bannerImg = motor?.images?.[0]?.imageUrl || motor?.images?.[0] || "";
                const colorType = selectedDetail?.colorId
                  ? motor?.colors?.find((c) => String(c.color?.id) === String(selectedDetail.colorId))?.color?.colorType
                  : motor?.colors?.[0]?.color?.colorType;
                return (
                  <div className="rounded-2xl border bg-gradient-to-br from-[#f8fbff] to-white p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-3xl md:text-4xl font-extrabold tracking-wide uppercase mb-2">{motor?.model || name}</div>
                        {motor?.name && (
                          <div className="text-base text-gray-700 font-semibold mb-1">{motor.name}</div>
                        )}
                        {selectedDetail ? (
                          <>
                            <div className="text-sm text-gray-500">Listed price</div>
                            <div className="text-2xl font-bold text-indigo-700">{formatCurrency(selectedDetail.price)}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-gray-500">Status</div>
                            <div className="text-2xl font-bold text-gray-400">Not in stock</div>
                          </>
                        )}
                      </div>
                      <div className="mt-4 md:mt-0 h-48 md:h-56 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-inner relative w-full md:w-1/2">
                        {bannerImg ? (
                          <img src={bannerImg} alt={name} className="object-contain w-full h-full" />
                        ) : (
                          <span className="text-gray-400">No image</span>
                         )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div className="text-lg font-semibold mt-1">{motor?.name || '-'}</div>
                      </div>
                       <div>
                        <div className="text-sm text-gray-500">Color</div>
                        <div className="flex items-center gap-2 mt-1">
                          {colorType ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: colorType }} />
                              <span className="capitalize text-gray-700 text-sm font-medium">{colorType}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full border bg-gray-300" />
                              <span className="text-gray-600 text-sm">Unknown</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Quantity</div>
                        <div className="text-lg font-semibold mt-1">{selectedDetail?.quantity ?? 0}</div>
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
              {hasStock && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={async () => {
                      setQuoteModal(true);
                      // Load stock promotions when opening modal
                      if (user?.agencyId) {
                        try {
                          const res = await PrivateDealerStaffApi.getStockPromotionListStaff(user.agencyId);
                          // API returns { statusCode, message, data: [...] }
                          const promotions = res.data?.data || [];
                          setStockPromotions(promotions);
                          // Reset to base price, no auto-selection
                          setSelectedPromotion(null);
                          setSelectedPromotionId("");
                          setQuoteForm((prev) => ({
                            ...prev,
                            basePrice: Number(selectedDetail.price || 0),
                            promotionPrice: 0,
                            finalPrice: Number(selectedDetail.price || 0),
                          }));
                        } catch (error) {
                          console.error("Error loading promotions:", error);
                          // Fallback to base price
                          setQuoteForm((prev) => ({
                            ...prev,
                            basePrice: Number(selectedDetail.price || 0),
                            promotionPrice: 0,
                            finalPrice: Number(selectedDetail.price || 0),
                          }));
                        }
                      }
                    }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all font-medium inline-flex items-center gap-2"
                  >
                    <FileText size={18} />
                    Create Quotation
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500">No data.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {motorList
            .filter((motor) => !motor.isDeleted) // Filter out deleted motors
            .map((motor) => {
              const stockInfo = motorbikeIdToStock.get(motor.id);
              return { motor, stockInfo };
            })
            .sort((a, b) => {
              // Sort: items with stock (price and quantity > 0) come first
              const aHasStock = a.stockInfo?.price != null && a.stockInfo?.price > 0 && (a.stockInfo?.quantity || 0) > 0;
              const bHasStock = b.stockInfo?.price != null && b.stockInfo?.price > 0 && (b.stockInfo?.quantity || 0) > 0;
              
              if (aHasStock && !bHasStock) return -1;
              if (!aHasStock && bHasStock) return 1;
              return 0; // Keep original order for items in same category
            })
            .map(({ motor, stockInfo }) => {
              const name = motor?.name || `Motor #${motor.id}`;
              const image = motor?.images?.[0]?.imageUrl || motor?.images?.[0] || "";
              
              // Get motor detail with full color info (from cache or use motor from list)
              const motorDetail = motorDetailsMap.get(motor.id) || motor;
              
              // Get color: priority: stock.color > colorIdToColor > motorDetail.colors.find > motorDetail.colors[0]
              let colorType = null;
              if (stockInfo?.color?.colorType) {
                // Use color directly from stock if available
                colorType = stockInfo.color.colorType;
              } else if (stockInfo?.colorId) {
                // Try to get color from colorIdToColor map (from stocks)
                const colorFromMap = colorIdToColor.get(String(stockInfo.colorId));
                if (colorFromMap?.colorType) {
                  colorType = colorFromMap.colorType;
                } else if (motorDetail?.colors) {
                  // Try to find color in motorDetail.colors array
                  const colorMatch = motorDetail.colors.find((c) => String(c.color?.id) === String(stockInfo.colorId));
                  colorType = colorMatch?.color?.colorType;
                }
              }
              // Fallback to first color from motor if still no color found
              if (!colorType && motorDetail?.colors?.[0]?.color?.colorType) {
                colorType = motorDetail.colors[0].color.colorType;
              }
              
              const quantity = stockInfo?.quantity || 0;
              const price = stockInfo?.price;
              const stockId = stockInfo?.stockId;
              const hasStock = price != null && price > 0 && quantity > 0;
              
              // Get all available colors in stock for this motor
              const stockColors = motorbikeIdToStockColors.get(motor.id) || [];

              return (
                <div key={motor.id} className="relative">
                  <button
                    onClick={async () => {
                      if (stockId) {
                        openDetail(stockId);
                      } else {
                        // If no stock, still show motor detail but without stock info
                        setSelectedId(`motor-${motor.id}`); // Use a unique identifier
                        setSelectedDetail(null); // No stock detail
                        setDetailLoading(true);
                        try {
                          const motorRes = await PublicApi.getMotorDetailForUser(motor.id);
                          setMotorDetail(motorRes.data?.data || motor);
                        } catch (error) {
                          setMotorDetail(motor);
                          console.error(error);
                        } finally {
                          setDetailLoading(false);
                        }
                      }
                    }}
                    className={`text-left rounded-2xl border shadow-md p-4 flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all w-full ${
                      hasStock 
                        ? "bg-gradient-to-br from-indigo-100/90 to-indigo-50/60 border-indigo-300" 
                        : "bg-white/90 border-gray-100"
                    }`}
                  >
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
                        <span className="inline-flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border bg-gray-300" />
                          <span className="text-gray-600">Unknown</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">Qty: {quantity}</div>
                    {price != null && price > 0 ? (
                      <div className="mt-2 text-indigo-600 font-extrabold text-xl">{formatCurrency(price)}</div>
                    ) : (
                      <div className="mt-2 text-gray-400 text-sm">Price not available</div>
                    )}
                  </button>
                </div>
              );
            })}
        </div>
      )}

      <FormModal
        isOpen={quoteModal}
        onClose={() => {
          setQuoteModal(false);
          setSelectedPromotionId("");
          setSelectedPromotion(null);
        }}
        title={"Tạo báo giá"}
        isDelete={false}
        isCreate={true}
        onSubmit={async (e) => {
          e.preventDefault();
          setQuoteSubmitting(true);
          try {
            // Validate user data
            console.log("User object:", user);
            const dealerStaffId = Number(user?.id || user?.userId);
            console.log("DealerStaffId:", dealerStaffId);
            if (!dealerStaffId || isNaN(dealerStaffId)) {
              throw new Error("Cannot get dealer staff ID from user. Please login again.");
            }
            const agencyId = Number(user?.agencyId);
            if (!agencyId || isNaN(agencyId)) {
              throw new Error("Cannot get agency ID from user. Please login again.");
            }

            // Create customer first if not provided
            let customerId = quoteForm.customerId;
            if (!customerId) {
              const customerPayload = {
                ...customerForm,
                agencyId,
                dob: customerForm.dob ? new Date(customerForm.dob).toISOString() : null,
              };
              const res = await PrivateDealerManagerApi.createCustomer(customerPayload);
              customerId = res.data?.data?.id || res.data?.id;
              if (!customerId) throw new Error("Cannot get created customer id");
            }
            const payload = {
              type: quoteForm.type,
              customerId,
              basePrice: Number(quoteForm.basePrice || 0),
              promotionPrice: Number(quoteForm.promotionPrice || 0),
              finalPrice: Number(quoteForm.finalPrice || 0),
              validUntil: quoteForm.validUntil ? new Date(quoteForm.validUntil).toISOString() : null,
              motorbikeId: Number(selectedDetail.motorbikeId),
              colorId: Number(selectedDetail.colorId),
              dealerStaffId,
              agencyId,
            };
            await PrivateDealerStaffApi.createQuotation(payload);
            toast.success("Create quotation successfully");
            setQuoteModal(false);
            navigate("/agency/quotation-management");
          } catch (error) {
            toast.error(error.message);
          } finally {
            setQuoteSubmitting(false);
          }
        }}
        isSubmitting={quoteSubmitting}
      >
         <div className="space-y-4">
          <div className="rounded-xl border p-3">
            <p className="font-semibold mb-2">Customer info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={customerForm.name}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={customerForm.phone}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg" value={customerForm.email}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={customerForm.address}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Credential ID</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={customerForm.credentialId}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, credentialId: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date of birth</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg" value={customerForm.dob}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, dob: e.target.value }))} />
              </div>
            </div>
          </div>
           <div className="rounded-xl border bg-gray-50 p-3">
             <p className="font-semibold mb-2">Preview</p>
             <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
               {(() => {
                 const colorType = motorDetail?.colors?.find((c) => String(c.color?.id) === String(selectedDetail?.colorId))?.color?.colorType;
                 return (
                   <>
                     <span className="inline-flex items-center gap-2">Color: <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: colorType || '#ccc' }} /><span className="capitalize">{colorType || 'Unknown'}</span></span>
                     <span>Quantity: <span className="font-medium">{selectedDetail?.quantity}</span></span>
                     <span>Price: <span className="font-medium">{formatCurrency(quoteForm.finalPrice || 0)}</span></span>
                     {selectedPromotion && (
                       <span className="text-green-600">Promotion: {selectedPromotion.name}</span>
                     )}
                   </>
                 );
               })()}
             </div>
           </div>
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={quoteForm.type}
              onChange={(e) => setQuoteForm((p) => ({ ...p, type: e.target.value }))}
            >
               <option value="AT_STORE">AT_STORE</option>
               <option value="ORDER">ORDER</option>
               <option value="PRE_ORDER">PRE_ORDER</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Promotion (optional)</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={selectedPromotionId}
              onChange={(e) => {
                const promoId = e.target.value;
                setSelectedPromotionId(promoId);
                if (!promoId) {
                  // No promotion selected
                  setSelectedPromotion(null);
                  const basePrice = Number(selectedDetail.price || 0);
                  setQuoteForm((prev) => ({
                    ...prev,
                    basePrice,
                    promotionPrice: 0,
                    finalPrice: basePrice,
                  }));
                } else {
                  // Find selected promotion
                  const promoItem = stockPromotions.find((p) => {
                    return String(p.id) === String(promoId);
                  });
                  if (promoItem) {
                    setSelectedPromotion(promoItem);
                    const basePrice = Number(selectedDetail.price || 0);
                    let promotionPrice = 0;
                    if (promoItem.valueType === "PERCENT") {
                      promotionPrice = (basePrice * Number(promoItem.value || 0)) / 100;
                    } else {
                      promotionPrice = Number(promoItem.value || 0);
                    }
                    const finalPrice = basePrice - promotionPrice;
                    setQuoteForm((prev) => ({
                      ...prev,
                      basePrice,
                      promotionPrice,
                      finalPrice: Math.max(0, finalPrice),
                    }));
                  }
                }
              }}
            >
              <option value="">-- No Promotion --</option>
              {stockPromotions && stockPromotions.length > 0 ? (
                stockPromotions
                  .filter((p) => {
                    // Filter by status ACTIVE and check date range
                    const isActive = p.status === "ACTIVE";
                    if (!isActive) return false;
                    // Check if promotion is still valid (optional - can be removed if not needed)
                    const now = new Date();
                    const startAt = p.startAt ? new Date(p.startAt) : null;
                    const endAt = p.endAt ? new Date(p.endAt) : null;
                    if (startAt && now < startAt) return false;
                    if (endAt && now > endAt) return false;
                    return true;
                  })
                  .map((p) => {
                    const promoId = p.id;
                    if (!promoId) return null;
                    const promoName = p.name || `Promotion #${promoId}`;
                    const discountValue = p.valueType === "PERCENT" 
                      ? `${p.value}%` 
                      : `${formatCurrency(p.value || 0)}`;
                    return (
                      <option key={promoId} value={promoId}>
                        {promoName} - {discountValue}
                      </option>
                    );
                  })
                  .filter(Boolean) // Remove null entries
              ) : (
                <option value="" disabled>No promotions available</option>
              )}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Base price</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg bg-gray-100" value={quoteForm.basePrice}
                disabled readOnly />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Promotion price</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg bg-gray-100" value={quoteForm.promotionPrice}
                disabled readOnly />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Final price</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg bg-gray-100" value={quoteForm.finalPrice}
                disabled readOnly />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Valid until</label>
            <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" value={quoteForm.validUntil}
              onChange={(e) => setQuoteForm((p) => ({ ...p, validUntil: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Customer ID (optional - leave empty to create new customer)</label>
            <input type="number" className="w-full px-3 py-2 border rounded-lg" value={quoteForm.customerId}
              onChange={(e) => setQuoteForm((p) => ({ ...p, customerId: e.target.value }))} placeholder="Leave empty to create new customer" />
          </div>
        </div>
      </FormModal>
    </div>
  );
}

export default Catalogue;


