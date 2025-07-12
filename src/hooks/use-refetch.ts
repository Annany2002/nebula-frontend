import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "@/App";
import { DataBaseType, RecordSchemaType, TableType } from "@/types/allType";

export const useRefetch = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");

  const [databases, setDatabases] = useState<DataBaseType[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [records, setRecords] = useState<RecordSchemaType[]>([]);
  const [tableFields, setTableFields] = useState([]);

  const [dbLoading, setDbLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const refetchDb = async () => {
    setDbLoading(true);
    try {
      const response = await fetch(`${url}/api/v1/databases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401 || response.status === 403) {
        navigate("/");
        return;
      }
      const data = await response.json();
      setDatabases(data.databases);
    } catch (error) {
      console.log(error);
    } finally {
      setDbLoading(false);
    }
  };

  const refetchTables = async (db_name: string) => {
    setTableLoading(true);
    try {
      const response = await fetch(
        `${url}/api/v1/databases/${db_name}/tables`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 401 || response.status === 403) {
        navigate("/");
        return;
      }
      const data = await response.json();
      setTables(data.tables);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  const refetchRecords = async (db_name: string, table_name: string) => {
    setRecordsLoading(true);
    try {
      const response = await fetch(
        `${url}/api/v1/databases/${db_name}/tables/${table_name}/records`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 401 || response.status === 403) {
        navigate("/");
        return;
      }
      const data = await response.json();
      setRecords(data);
      if (data.length > 0) {
        setTableFields(Object.keys(data[0]));
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setRecordsLoading(false);
    }
  };

  return {
    databases,
    tables,
    records,
    tableFields,
    dbLoading,
    tableLoading,
    recordsLoading,
    token,
    refetchDb,
    user_id,
    setDatabases,
    setRecords,
    setTables,
    refetchTables,
    refetchRecords,
  };
};
