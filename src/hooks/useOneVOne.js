import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { oneVOneApi } from "../api/oneVOne.js";

export const useMatchOneVOne = () => {
  return useMutation({
    mutationFn: oneVOneApi.matchSession,
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to find a 1v1 match"),
  });
};

export const useOneVOneSession = (id) => {
  return useQuery({
    queryKey: ["oneVOneSession", id],
    queryFn: () => oneVOneApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 2000,
  });
};

export const useSubmitOneVOneWin = () => {
  return useMutation({
    mutationFn: oneVOneApi.submitWin,
    onSuccess: () => toast.success("All tests passed. Match won!"),
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not submit match result"),
  });
};

export const useLeaveOneVOneSession = () => {
  return useMutation({
    mutationFn: oneVOneApi.leaveSession,
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Could not leave this match"),
  });
};
