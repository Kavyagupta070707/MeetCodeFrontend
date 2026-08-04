import axiosInstance from "./axios";

export async function executeCode(language, code) {
  try {
    const response = await axiosInstance.post("/api/code/execute", {
      language,
      code,
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        `Failed to execute code: ${error.message}`,
    };
  }
}
