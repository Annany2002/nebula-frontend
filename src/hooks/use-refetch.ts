import { url } from "@/App";
import { DataBaseType } from "@/types/allType";
import { useState } from "react";

export const useRefetch = () => {
  const [databases, setDatabases] = useState<DataBaseType[]>([]);
  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");

  const refetchDb = async () => {
    try {
      const response = await fetch(`${url}/api/v1/databases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDatabases(data.databases);
    } catch (error) {
      console.log(error);
    }
  };

  return { databases, setDatabases, token, refetchDb, user_id };
};
