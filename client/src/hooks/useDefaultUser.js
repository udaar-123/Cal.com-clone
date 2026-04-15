import { useEffect, useState } from "react";
import { api } from "../api";

export function useDefaultUser() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/users/default")
      .then(setUser)
      .catch((err) => setError(err.message));
  }, []);

  return { user, error };
}
