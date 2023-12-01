import React, { useEffect, useState } from "react";
import { getData } from "../utills/firebaseHelpers";
import DataTable from "react-data-table-component";

const Symbols = () => {
  const [symbolData, setSymbolData] = useState([]);

  const getSymbols = async () => {
    try {
      const data = await getData("symbols");
      console.log(1234, data);
      setSymbolData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getSymbols();
  }, []);

  const columns = [
    { name: "Symbol", selector: (row) => row.symbol },
    { name: "Price", selector: (row) => row.price },
  ];

  return (
    <div>
      <DataTable data={symbolData} columns={columns} pagination />
    </div>
  );
};

export default Symbols;
