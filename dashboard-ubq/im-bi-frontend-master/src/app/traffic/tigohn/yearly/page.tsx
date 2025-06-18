"use client";

import React from "react";
import { List } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Autocomplete, TextField, Checkbox, Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const YearlyTrafficPage: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = React.useState<string[]>([]);
  const [selectedYears, setSelectedYears] = React.useState<number[]>([]);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });

  React.useEffect(() => {
    fetch("http://localhost:3000/traffic/yearlytigo")
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

  const handleYearChange = (event: React.ChangeEvent<{}>, value: number[]) => {
    setSelectedYears(value);
  };

  const filteredData = data.filter((row) => 
    (selectedAccounts.length ? selectedAccounts.includes(row.account_name) : true) &&
    (selectedYears.length ? selectedYears.includes(row.year) : true)
  );

  console.log("Filtered data:", filteredData); // Log filtered data

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat().format(number);
  };

  const columns: GridColDef[] = [
    { field: "year", headerName: "Year", width: 150 },
    { field: "account_name", headerName: "Account Name", width: 200 },
    { field: "total", headerName: "Total", width: 150, valueGetter: (params) => formatNumber(params.row.total) },
  ];

  // Prepare data for the chart
  const chartData = selectedAccounts.length > 0 
    ? filteredData.reduce((acc, row) => {
        const existing = acc.find(item => item.name === row.account_name);
        if (existing) {
          existing[row.year] = row.total;
        } else {
          acc.push({ name: row.account_name, [row.year]: row.total });
        }
        return acc;
      }, [])
    : data.reduce((acc, row) => {
        const existing = acc.find(item => item.year === row.year);
        if (existing) {
          existing.total += row.total;
        } else {
          acc.push({ year: row.year, total: row.total });
        }
        return acc;
      }, []);

  return (
    <List>
      <Typography variant="h4" gutterBottom>
        Records per Year
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
        options={Array.from(new Set(data.map((row) => row.year)))}
        value={selectedYears}
        onChange={handleYearChange}
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
            label="Year"
            placeholder="Select years"
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
            <XAxis dataKey={selectedAccounts.length > 0 ? "name" : "year"} />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip formatter={(value) => formatNumber(value as number)} />
            <Legend />
            {selectedAccounts.length > 0 ? (
             <>
             <Bar dataKey="2023" fill="#a31d1d" />
             <Bar dataKey="2024" fill="#480000" />
           </>
           
            ) : (
              <Bar dataKey="total" fill="#a31d1d" />
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
          const year = row.year ?? Math.random().toString(36).substr(2, 9);
          return `${id}-${accountUid}-${year}`;
        }}
      />
    </List>
  );
};

export default YearlyTrafficPage;