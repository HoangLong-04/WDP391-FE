import React, { useEffect, useState, useMemo } from "react";
import PrivateDealerManagerApi from "../../../services/PrivateDealerManagerApi";
import { toast } from "react-toastify";
import { formatCurrency } from "../../../utils/currency";
import { useAuth } from "../../../hooks/useAuth";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
} from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AgencyDash() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [staffRevenueList, setStaffRevenueList] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 5,
    totalItems: 0,
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchAllData = async () => {
    if (!user?.agencyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [customerRes, revenueRes, chartRes, staffRes] = await Promise.all([
        PrivateDealerManagerApi.getTotalCustomer(user.agencyId),
        PrivateDealerManagerApi.getTotalRevenue(user.agencyId),
        PrivateDealerManagerApi.getCustomerContractChart(user.agencyId, {
          year: selectedYear,
        }),
        PrivateDealerManagerApi.getStaffRevenueList(user.agencyId, {
          page: paginationInfo.page,
          limit: paginationInfo.limit,
        }),
      ]);

      setTotalCustomers(customerRes.data?.data?.totalCustomers || 0);
      setTotalRevenue(revenueRes.data?.data?.totalRevenue || 0);
      setChartData(chartRes.data?.data || []);
      setStaffRevenueList(staffRes.data?.data || []);
      setPaginationInfo({
        page: staffRes.data?.paginationInfo?.page || 1,
        limit: staffRes.data?.paginationInfo?.limit || 5,
        totalItems: staffRes.data?.paginationInfo?.totalItems || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.agencyId, selectedYear, paginationInfo.page, paginationInfo.limit]);

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

  const handlePageChange = (newPage) => {
    setPaginationInfo((prev) => ({ ...prev, page: newPage }));
  };

  // Chart configuration
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Transform data for Recharts
  const chartDataFormatted = useMemo(() => {
    if (chartData.length === 0) return [];
    return chartData.map((item) => ({
      month: monthNames[item.month - 1] || `Month ${item.month}`,
      Completed: item.totalContractCompleted || 0,
      Delivered: item.totalContractDelivered || 0,
      Pending: item.totalContractPending || 0,
    }));
  }, [chartData]);

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => {
    const colorConfigs = {
      blue: {
        gradient: "from-blue-500 via-blue-600 to-cyan-600",
        bgGradient: "from-blue-50 via-cyan-50 to-blue-50",
        iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
        iconColor: "text-white",
        shadow: "shadow-blue-200",
        border: "border-blue-200",
      },
      green: {
        gradient: "from-emerald-500 via-teal-600 to-green-600",
        bgGradient: "from-emerald-50 via-teal-50 to-emerald-50",
        iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
        iconColor: "text-white",
        shadow: "shadow-emerald-200",
        border: "border-emerald-200",
      },
    };

    const config = colorConfigs[color] || colorConfigs.blue;

    return (
      <div
        className={`relative bg-white rounded-2xl shadow-lg p-6 overflow-hidden border ${config.border} hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group`}
      >
        {/* Animated background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 opacity-5 group-hover:opacity-10 transform translate-x-8 -translate-y-8 transition-all duration-500">
          <Icon className="w-40 h-40" strokeWidth={1} />
        </div>
        
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`${config.iconBg} p-4 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
            >
              <Icon className={`w-7 h-7 ${config.iconColor}`} strokeWidth={2.5} />
            </div>
            {subtitle && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-gray-700">{subtitle}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">
              {title}
            </p>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300">
              {value}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Loading Skeleton Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
        <div className="w-20 h-6 bg-gray-200 rounded-full" />
      </div>
      <div className="w-24 h-4 bg-gray-200 rounded mb-2" />
      <div className="w-32 h-10 bg-gray-200 rounded" />
    </div>
  );

  const SkeletonChart = () => (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 animate-pulse">
      <div className="h-6 w-64 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
      <div className="h-80 bg-gray-100 rounded" />
    </div>
  );

  const SkeletonTable = () => (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 animate-pulse">
      <div className="h-6 w-64 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonChart />
        <div className="mt-8">
          <SkeletonTable />
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(
    paginationInfo.totalItems / paginationInfo.limit
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
              Manager Dashboard
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Real-time insights and analytics
            </p>
          </div>
        </div>
        <p className="text-gray-600 text-base sm:text-lg ml-14">
          Overview of your agency metrics and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toLocaleString("vi-VN")}
          icon={Users}
          color="blue"
          subtitle="Active"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="green"
          subtitle="All time"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Customer Contract Statistics
              </h2>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              Monthly contract status breakdown
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 w-fit">
            <Calendar className="w-5 h-5 text-gray-600" />
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="px-3 py-1.5 border-0 bg-transparent text-gray-800 font-semibold focus:outline-none focus:ring-0 cursor-pointer appearance-none bg-no-repeat bg-right pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
              }}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
  return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {chartDataFormatted.length > 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartDataFormatted}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                  stroke="#9ca3af"
                  tickLine={{ stroke: "#9ca3af" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                  stroke="#9ca3af"
                  tickLine={{ stroke: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    padding: "12px",
                  }}
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  labelStyle={{ fontWeight: 600, color: "#374151", marginBottom: "4px" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="square"
                  iconSize={12}
                  formatter={(value) => <span style={{ color: "#6b7280", fontWeight: 500 }}>{value}</span>}
                />
                <Bar
                  dataKey="Completed"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Completed"
                />
                <Bar
                  dataKey="Delivered"
                  fill="#eab308"
                  radius={[8, 8, 0, 0]}
                  name="Delivered"
                />
                <Bar
                  dataKey="Pending"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                  name="Pending"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">No data available for the selected year</p>
            <p className="text-sm mt-1">Try selecting a different year</p>
          </div>
        )}
      </div>

      {/* Staff Revenue Table */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Staff Revenue Performance
            </h2>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Top performing staff by revenue
          </p>
        </div>

        {staffRevenueList.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-right py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Total Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {staffRevenueList.map((staff, index) => (
                    <tr
                      key={staff.id}
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 group"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200">
                            {index + 1}
                          </div>
                          <span className="text-gray-800 font-semibold group-hover:text-gray-900">
                            {staff.username}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-600 group-hover:text-gray-700">
                        {staff.email}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 group-hover:shadow-md transition-all duration-200">
                          {/* <DollarSign className="w-4 h-4" /> */}
                          {formatCurrency(staff.total_contract_revenue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Showing{" "}
                  <span className="font-semibold text-gray-800">
                    {(paginationInfo.page - 1) * paginationInfo.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-800">
                    {Math.min(
                      paginationInfo.page * paginationInfo.limit,
                      paginationInfo.totalItems
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-800">
                    {paginationInfo.totalItems}
                  </span>{" "}
                  results
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => handlePageChange(paginationInfo.page - 1)}
                    disabled={paginationInfo.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:hover:shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                    Page {paginationInfo.page} of {totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(paginationInfo.page + 1)}
                    disabled={paginationInfo.page >= totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:hover:shadow-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">No staff revenue data available</p>
            <p className="text-sm mt-1">Staff revenue will appear here once data is available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgencyDash;
