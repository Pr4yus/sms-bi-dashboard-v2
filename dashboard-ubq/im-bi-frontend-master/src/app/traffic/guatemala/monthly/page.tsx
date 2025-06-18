"use client";

import React from "react";
import { List } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Autocomplete, TextField, Checkbox, Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyTrafficPage: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = React.useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = React.useState<string[]>([]);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });

  React.useEffect(() => {
    fetch("http://localhost:3000/traffic/monthlygt")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data); // Log fetched data
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleAccountChange = (event: React.ChangeEvent<{}>, value: string[]) => {
    setSelectedAccounts(value);
  };

  const handleMonthChange = (event: React.ChangeEvent<{}>, value: string[]) => {
    setSelectedMonths(value);
  };

  const filteredData = data.filter((row) => 
    (selectedAccounts.length ? selectedAccounts.includes(row.account_name) : true) &&
    (selectedMonths.length ? selectedMonths.includes(row.month) : true)
  );

  console.log("Filtered data:", filteredData); // Log filtered data

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat().format(number);
  };

  const columns: GridColDef[] = [
    { field: "month", headerName: "Month", width: 150 },
    { field: "account_name", headerName: "Account Name", width: 200 },
    { field: "total", headerName: "Total", width: 150, valueGetter: (params) => formatNumber(params.row.total) },
  ];

  // Prepare data for the chart
  const chartData = selectedAccounts.length > 0 
    ? filteredData.reduce((acc, row) => {
        const existing = acc.find(item => item.name === row.account_name);
        if (existing) {
          existing[row.month] = row.total;
        } else {
          acc.push({ name: row.account_name, [row.month]: row.total });
        }
        return acc;
      }, [])
    : data.reduce((acc, row) => {
        const existing = acc.find(item => item.month === row.month);
        if (existing) {
          existing.total += row.total;
        } else {
          acc.push({ month: row.month, total: row.total });
        }
        return acc;
      }, []);

  return (
    <List>
      <Typography variant="h4" gutterBottom>
        Records per Month
      </Typography>
      <Autocomplete
        multiple
        options={Array.from(new Set(data.map((row) => row.account_name)))}
        value={selectedAccounts}
        onChange={handleAccountChange}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Account Name"
            placeholder="Select accounts"
          />
        )}
      />
      <Autocomplete
        multiple
        options={Array.from(new Set(data.map((row) => row.month)))}
        value={selectedMonths}
        onChange={handleMonthChange}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Month"
            placeholder="Select months"
          />
        )}
      />
      <Box sx={{ height: 400, width: '100%' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={selectedAccounts.length > 0 ? "name" : "month"} />
            <YAxis />
            <Tooltip formatter={(value) => formatNumber(value as number)} />
            <Legend />
            {selectedAccounts.length > 0 ? (
              <>
                {Array.from(new Set(filteredData.map(row => row.month))).map(month => (
                  <Bar key={month} dataKey={month} fill="#A00E1E" />
                ))}
              </>
            ) : (
              <Bar dataKey="total" fill="#A00E1E" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <DataGrid
        rows={filteredData}
        columns={columns}
        pageSize={paginationModel.pageSize} // Set default page size to 10
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 100]} // Allow selection between 10, 25, or 100 rows per page
        getRowId={(row) => {
          const id = row.id ?? Math.random().toString(36).substr(2, 9);
          const accountUid = row.account_uid ?? Math.random().toString(36).substr(2, 9);
          const month = row.month ?? Math.random().toString(36).substr(2, 9);
          return `${id}-${accountUid}-${month}`;
        }}
      />
    </List>
  );
};

export default MonthlyTrafficPage;