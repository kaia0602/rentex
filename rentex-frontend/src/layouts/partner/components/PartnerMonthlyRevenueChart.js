// src/layouts/partner/components/PartnerMonthlyRevenueChart.js
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "api/client";
import { getToken, getUserIdFromToken } from "utils/auth";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function PartnerMonthlyRevenueChart({ year }) {
  const [data, setData] = useState([]);
  const token = getToken();
  const userId = token ? getUserIdFromToken(token) : null;

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      if (!userId) return;

      try {
        const promises = MONTHS.map((month) =>
          api.get(`/partner/statistics/${userId}`, { params: { year, month } }),
        );

        const responses = await Promise.all(promises);
        const monthlyData = responses.map((res, idx) => ({
          month: `${idx + 1}월`,
          revenue: res.data?.totalRevenue ?? 0,
        }));

        setData(monthlyData);
      } catch (err) {
        console.error("월별 수익 조회 실패:", err);
      }
    };

    fetchMonthlyRevenue();
  }, [year, userId]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [`${value.toLocaleString()}원`, "수익"]}
          contentStyle={{ fontSize: "12px" }}
        />

        <Line dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// PropTypes 정의
PartnerMonthlyRevenueChart.propTypes = {
  year: PropTypes.number.isRequired,
};
