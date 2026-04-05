// Hook for Calendar API operations with built-in token management

"use client";

import { useCallback, useState } from "react";
import {
  createMonthlyPlan,
  getRandomImageBySubIndustry,
  getUserPlan,
  updateCalendarPost,
  getPostDetail,
  CreatePlanRequest,
  CreatePlanResponse,
  GetPlanResponse,
  Post,
  UpdatePostRequest,
  UpdatePostResponse,
  DisplayImage,
} from "@/api/calendarApi";

interface UseCalendarApiState {
  loading: boolean;
  error: string | null;
}

export function useCalendarApi() {
  const [state, setState] = useState<UseCalendarApiState>({
    loading: false,
    error: null,
  });

  const getToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shoutly_token") || "";
    }
    return "";
  }, []);

  const handleError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : "An error occurred";
    setState({ loading: false, error: message });
    console.error("[Calendar API Error]", message);
    return null;
  }, []);

  // Create a monthly plan
  const createPlan = useCallback(
    async (request: CreatePlanRequest): Promise<CreatePlanResponse | null> => {
      setState({ loading: true, error: null });
      try {
        const token = getToken();
        const response = await createMonthlyPlan(request, token);
        setState({ loading: false, error: null });
        return response;
      } catch (error) {
        return handleError(error);
      }
    },
    [getToken, handleError]
  );

  // Fetch user's current plan
  const fetchPlan = useCallback(async (): Promise<GetPlanResponse | null> => {
    setState({ loading: true, error: null });
    try {
      const token = getToken();
      const response = await getUserPlan(token);
      setState({ loading: false, error: null });
      return response;
    } catch (error) {
      return handleError(error);
    }
  }, [getToken, handleError]);

  // Get a specific post by ID
  const fetchPost = useCallback(
    async (postId: string) => {
      setState({ loading: true, error: null });
      try {
        const token = getToken();
        const response = await getPostDetail(postId, token);
        setState({ loading: false, error: null });
        return response;
      } catch (error) {
        return handleError(error);
      }
    },
    [getToken, handleError]
  );

  // Update a post
  const updatePost = useCallback(
    async (
      postId: string,
      request: UpdatePostRequest,
      file?: File
    ): Promise<UpdatePostResponse | null> => {
      setState({ loading: true, error: null });
      try {
        const token = getToken();
        const response = await updateCalendarPost(postId, request, token, file);
        setState({ loading: false, error: null });
        return response;
      } catch (error) {
        return handleError(error);
      }
    },
    [getToken, handleError]
  );

  // Get random image by sub-industry
  const fetchRandomImage = useCallback(
    async (subIndustryId: string): Promise<DisplayImage | null> => {
      setState({ loading: true, error: null });
      try {
        const image = await getRandomImageBySubIndustry(subIndustryId);
        setState({ loading: false, error: null });
        return image;
      } catch (error) {
        return handleError(error);
      }
    },
    [handleError]
  );

  return {
    // State
    loading: state.loading,
    error: state.error,

    // Methods
    createPlan,
    fetchPlan,
    fetchPost,
    updatePost,
    fetchRandomImage,

    // Clear error
    clearError: () => setState((s) => ({ ...s, error: null })),
  };
}
