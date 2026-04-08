export class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new ApiRequestError(
      data?.message || 'Request failed. Please try again.',
      response.status
    );
  }

  return data;
};
