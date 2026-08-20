import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/users.js";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: userApi.getCurrentUser,
  });
};
