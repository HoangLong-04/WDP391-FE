import React, { useEffect, useState } from "react";
import PrivateAdminApi from "../../../services/PrivateAdminApi";
import { toast } from "react-toastify";
import { formatCurrency } from "../../../utils/currency";
import {
  Building2,
  Warehouse,
  Bike,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown,
  Download,
  Activity,
} from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import useAgencyList from "../../../hooks/useAgencyList";

function CompanyDash() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgencies: 0,
    totalWarehouses: 0,
    totalMotorbikes: 0,
    totalContractRevenue: 0,
  });
  const [previousStats, setPreviousStats] = useState({
    totalAgencies: 0,
    totalWarehouses: 0,
    totalMotorbikes: 0,
    totalContractRevenue: 0,
  });
  const [quarterRevenue, setQuarterRevenue] = useState([]);
  const [topMotorbikes, setTopMotorbikes] = useState([]);
  const [filters, setFilters] = useState({
    quarter: new Date().getMonth() < 3 ? 1 : new Date().getMonth() < 6 ? 2 : new Date().getMonth() < 9 ? 3 : 4,
    year: new Date().getFullYear(),
    agencyId: "",
  });
  const { agencyList } = useAgencyList();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        agenciesRes,
        warehousesRes,
        motorbikesRes,
        revenueRes,
        quarterRes,
        topMotorbikesRes,
      ] = await Promise.all([
        PrivateAdminApi.getTotalAgencies(),
        PrivateAdminApi.getTotalWarehouses(),
        PrivateAdminApi.getTotalMotorbikes(),
        PrivateAdminApi.getTotalContractRevenue(filters.agencyId ? { agencyId: filters.agencyId } : {}),
        PrivateAdminApi.getQuarterRevenue({
          quarter: filters.quarter,
          year: filters.year,
          ...(filters.agencyId && { agencyId: filters.agencyId }),
        }),
        PrivateAdminApi.getTop10Motorbikes(),
      ]);

      setPreviousStats(stats);
      setStats({
        totalAgencies: agenciesRes.data.data.totalAgencies,
        totalWarehouses: warehousesRes.data.data.totalWarehouses,
        totalMotorbikes: motorbikesRes.data.data.totalMotorbikes,
        totalContractRevenue: revenueRes.data.data.totalContractRevenue,
      });
      setQuarterRevenue(quarterRes.data.data.quarterContractChartData || []);
      setTopMotorbikes(topMotorbikesRes.data.data || []);
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
  }, [filters.quarter, filters.year, filters.agencyId]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const calculateTrend = (current, previous) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const colorConfigs = {
      green: {
        gradient: "from-emerald-500 to-teal-600",
        bgGradient: "from-emerald-50 to-teal-50",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        textColor: "text-emerald-600",
      },
      purple: {
        gradient: "from-purple-500 to-indigo-600",
        bgGradient: "from-purple-50 to-indigo-50",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        textColor: "text-purple-600",
      },
      blue: {
        gradient: "from-blue-500 to-cyan-600",
        bgGradient: "from-blue-50 to-cyan-50",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        textColor: "text-blue-600",
      },
      orange: {
        gradient: "from-orange-500 to-amber-600",
        bgGradient: "from-orange-50 to-amber-50",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        textColor: "text-orange-600",
      },
      indigo: {
        gradient: "from-indigo-500 to-purple-600",
        bgGradient: "from-indigo-50 to-purple-50",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        textColor: "text-indigo-600",
      },
    };

    const config = colorConfigs[color] || colorConfigs.blue;

    return (
      <div className={`relative bg-gradient-to-br ${config.bgGradient} rounded-2xl shadow-lg p-6 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
        {/* Background Icon */}
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-8 -translate-y-8">
          <Icon className="w-32 h-32" strokeWidth={1.5} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`${config.iconBg} p-3 rounded-xl`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                trend.isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}>
                {trend.isPositive ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {trend.value}%
              </div>
            )}
          </div>
          
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const getMaxRevenue = () => {
    if (quarterRevenue.length === 0) return 1;
    return Math.max(...quarterRevenue.map((item) => item.totalRevenue), 1);
  };

  const maxRevenue = getMaxRevenue();

  // Chart dimensions
  const chartHeight = 200;
  const chartWidth = 100;

  // Calculate line chart points for SVG
  const getChartData = () => {
    if (quarterRevenue.length === 0) return [];
    return quarterRevenue.map((item, index) => ({
      ...item,
      y: chartHeight - (item.totalRevenue / maxRevenue) * chartHeight,
      x: (index / (quarterRevenue.length - 1 || 1)) * chartWidth,
    }));
  };

  const chartData = getChartData();

  // Generate SVG path for line chart
  const generateLinePath = () => {
    if (chartData.length === 0) return "";
    let path = `M ${chartData[0].x} ${chartData[0].y}`;
    for (let i = 1; i < chartData.length; i++) {
      path += ` L ${chartData[i].x} ${chartData[i].y}`;
    }
    return path;
  };

  // Generate area path for gradient fill
  const generateAreaPath = () => {
    if (chartData.length === 0) return "";
    const path = generateLinePath();
    const lastPoint = chartData[chartData.length - 1];
    const firstPoint = chartData[0];
    return `${path} L ${lastPoint.x} ${chartHeight} L ${firstPoint.x} ${chartHeight} Z`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <CircularProgress size={60} />
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Overview of your business metrics and performance</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-gray-100">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={filters.quarter}
              onChange={(e) => handleFilterChange("quarter", parseInt(e.target.value))}
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
            </select>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-xl">
            <input
              type="number"
              value={filters.year}
              onChange={(e) => handleFilterChange("year", parseInt(e.target.value))}
              className="bg-transparent border-none text-sm font-medium text-gray-700 w-20 focus:outline-none"
              placeholder="Year"
            />
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-xl">
            <select
              value={filters.agencyId}
              onChange={(e) => handleFilterChange("agencyId", e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 min-w-[200px] focus:outline-none cursor-pointer"
            >
              <option value="">All Agencies</option>
              {agencyList.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Agencies"
          value={stats.totalAgencies}
          icon={Building2}
          color="blue"
          trend={calculateTrend(stats.totalAgencies, previousStats.totalAgencies)}
        />
        <StatCard
          title="Warehouses"
          value={stats.totalWarehouses}
          icon={Warehouse}
          color="green"
          trend={calculateTrend(stats.totalWarehouses, previousStats.totalWarehouses)}
        />
        <StatCard
          title="Motorbikes"
          value={stats.totalMotorbikes}
          icon={Bike}
          color="purple"
          trend={calculateTrend(stats.totalMotorbikes, previousStats.totalMotorbikes)}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalContractRevenue)}
          icon={DollarSign}
          color="indigo"
          trend={calculateTrend(stats.totalContractRevenue, previousStats.totalContractRevenue)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Revenue Overview
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Q{filters.quarter} {filters.year} - Monthly Breakdown
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {quarterRevenue.length > 0 ? (
            <div>
              {/* Line Chart */}
              <div className="mb-6">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-48"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d={generateAreaPath()}
                    fill="url(#areaGradient)"
                  />
                  {/* Line */}
                  <path
                    d={generateLinePath()}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {chartData.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill="#3b82f6"
                      className="hover:r-5 transition-all"
                    />
                  ))}
                </svg>
              </div>
              
              {/* Month labels */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {quarterRevenue.map((item, index) => {
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {monthNames[item.month - 1] || `M${item.month}`}
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No revenue data available for this quarter</p>
            </div>
          )}
        </div>

        {/* Top 10 Motorbikes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Bike className="w-5 h-5 text-purple-500" />
              Top 10 Motorbikes
            </h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
              Best Sellers
            </span>
          </div>
          {topMotorbikes.length > 0 ? (
            <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar">
              {topMotorbikes.map((item, index) => {
                const rankColors = [
                  "from-yellow-400 to-orange-500",
                  "from-gray-300 to-gray-400",
                  "from-orange-400 to-red-500",
                ];
                const rankColor = index < 3 ? rankColors[index] : "from-purple-400 to-purple-600";
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-purple-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankColor} flex items-center justify-center font-bold text-white text-sm shadow-lg`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Total Orders</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {item.total_quantity}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Bike className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No motorbike order data available</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default CompanyDash;
