import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sessionApi } from '../api/sessions.js';


export const useActiveSessions= ()=>{
    const result = useQuery({
        queryKey: ['activeSessions'],
        queryFn: sessionApi.getActiveSessions,
    })
    return result;
}

export const useCreateSession = () => {
  return useMutation({
    mutationFn: sessionApi.createSession,
    onSuccess: (data) => {
      toast.success("Session Created Successfully");
      console.log("Created Session Data:", data);
      return data; // important for caller
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to create session"),
  });
};

export const useRecentSessions= ()=>{
    const result = useQuery({
        queryKey: ['recentSessions'],
        queryFn: sessionApi.getRecentSessions,
    })
    return result;
}

export const useSessionById= (id)=>{
    const result = useQuery({
        queryKey: ['session'],
        queryFn: ()=> sessionApi.getSessionbyId(id),
        enabled: !!id,
        refetchInterval: 5000,
    })
    return result;
}
export const useJoinSession= ()=>{
    const result = useMutation({
        mutationFn: sessionApi.joinSession,
        onSuccess: ()=> toast.success("Joined Session Successfully"),
        onError: (error)=> toast.error(error?.response?.data?.message || "Failed to join session"),
    })
    return result;
}
export const useEndSession= ()=>{
    const result = useMutation({
        mutationFn: sessionApi.endSession,
        onSuccess: ()=> toast.success("Ended Session Successfully"),
        onError: (error)=> toast.error(error?.response?.data?.message || "Failed to end session"),
    })
    return result;
}