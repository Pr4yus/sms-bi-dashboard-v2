"use client";

import React from "react";
import { List } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Autocomplete, TextField, Checkbox, Typography, Box } from "@mui/material";
import { LineChart, Line, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DailyTrafficPage: React.FC = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = React.useState<string[]>([]);
  const [selectedDates, setSelectedDates] = React.useState<string[]>([]);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [totalForSelectedDate, setTotalForSelectedDate] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("http://localhost:3000/traffic/dailycr")
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

  const handleDateChange = (event: React.ChangeEvent<{}>, value: string[]) => {
    setSelectedDates(value);
    if (value.length === 1) {
      const selectedDate = value[0];
      const total = data
        .filter(row => row._id.date === selectedDate)
        .reduce((acc, row) => acc + row.total_sms_ok, 0);
      setTotalForSelectedDate(total);
    } else {
      setTotalForSelectedDate(null);
    }
  };

  const filteredData = data.filter((row) => 
    (selectedAccounts.length ? selectedAccounts.includes(row._id.account_name) : true) &&
    (selectedDates.length ? selectedDates.includes(row._id.date) : true)
  );

  console.log("Filtered data:", filteredData); // Log filtered data

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat().format(number);
  };

  const columns: GridColDef[] = [
    { field: "_id.date", headerName: "Date", width: 150, valueGetter: (params) => params.row._id.date },
    { field: "_id.account_name", headerName: "Account Name", width: 200, valueGetter: (params) => params.row._id.account_name },
    { field: "total_sms_ok", headerName: "Total SMS OK", width: 150, valueGetter: (params) => formatNumber(params.row.total_sms_ok) },
    { field: "total_sms_error", headerName: "Total SMS Error", width: 150, valueGetter: (params) => formatNumber(params.row.total_sms_error) },
  ];

  // Prepare data for the chart
  const chartData = data.reduce((acc, row) => {
    const existing = acc.find(item => item.date === row._id.date);
    if (existing) {
      existing.total += row.total_sms_ok;
    } else {
      acc.push({ date: row._id.date, total: row.total_sms_ok });
    }
    return acc;
  }, []);

  return (
    <List>
      <Typography variant="h4" gutterBottom>
        Records per Day
      </Typography>
      <Autocomplete
        multiple
        options={Array.from(new Set(data.map((row) => row._id.account_name)))}
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
        options={Array.from(new Set(data.map((row) => row._id.date)))}
        value={selectedDates}
        onChange={handleDateChange}
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
            label="Date"
            placeholder="Select dates"
          />
        )}
      />
      {totalForSelectedDate !== null && (
        <Typography variant="h6" gutterBottom>
          Total SMS OK for selected date: {formatNumber(totalForSelectedDate)}
        </Typography>
      )}
      {selectedAccounts.length > 0 ? (
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={paginationModel.pageSize} // Set default page size to 10
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 100]} // Allow selection between 10, 25, or 100 rows per page
          getRowId={(row) => {
            const id = row._id ?? Math.random().toString(36).substr(2, 9);
            const accountUid = row.account_uid ?? Math.random().toString(36).substr(2, 9);
            const date = row._id.date ?? Math.random().toString(36).substr(2, 9);
            return `${id}-${accountUid}-${date}`;
          }}
        />
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis />
              <Tooltip formatter={(value, name, props) => [`${formatNumber(value as number)}`, `Date: ${props.payload.date}`]} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#A00E1E" dot />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </List>
  );
};

export default DailyTrafficPage;