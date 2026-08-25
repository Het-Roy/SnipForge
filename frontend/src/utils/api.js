const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

const DEFAULT_NETWORK_ERROR =
  'Unable to reach the SnipForge API. Start the backend server on port 5000 and try again.';

const parseJsonResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: 'Received an invalid response from the server.' };
  }
};

export const fetchJson = async (path, options) => {
  try {
    const response = await fetch(apiUrl(path), options);
    const json = await parseJsonResponse(response);

    return { response, json };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(DEFAULT_NETWORK_ERROR);
    }

    throw new Error(error.message || DEFAULT_NETWORK_ERROR);
  }
};
