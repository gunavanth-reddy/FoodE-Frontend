export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  'Unsupported FormDataPart implementation':
    'Unable to attach the selected image. Please select it again.',
  'LIMIT_FILE_SIZE': 'Image size cannot exceed 5 MB.',
  'Network request failed':
    'Unable to connect to FoodE. Check your connection and try again.',
};

const TECHNICAL_ERROR_PATTERN =
  /<(!doctype|html)|internal server error|unsupported formdata|\b(?:TypeError|ReferenceError|SyntaxError|MongoServerError|MulterError|AxiosError)\b|\b(?:ECONNREFUSED|ENOTFOUND|ETIMEDOUT|LIMIT_FILE_SIZE)\b|\bat\s+.+\(.+:\d+:\d+\)/i;

/** Returns a user-safe message while preserving known API and validation errors. */
export const getUserFacingErrorMessage = (
  error: unknown,
  fallback = GENERIC_ERROR_MESSAGE,
): string => {
  if (typeof error === 'string') {
    const message = error.trim();
    if (!message) return fallback;
    if (KNOWN_ERROR_MESSAGES[message]) return KNOWN_ERROR_MESSAGES[message];
    if (TECHNICAL_ERROR_PATTERN.test(message)) return fallback;
    return message;
  }

  if (!error || typeof error !== 'object') return fallback;

  const value = error as any;
  const responseData = value.response?.data;
  const apiMessage =
    responseData?.message || responseData?.error?.message || value.data?.message;

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    const message = apiMessage.trim();
    if (KNOWN_ERROR_MESSAGES[message]) return KNOWN_ERROR_MESSAGES[message];
    if (TECHNICAL_ERROR_PATTERN.test(message)) return fallback;
    // Explicit API error payloads are intentional user-facing messages.
    if (responseData?.success === false || value.data?.success === false) {
      return message;
    }
  }

  const code = value.code || value.response?.data?.code;
  if (typeof code === 'string' && KNOWN_ERROR_MESSAGES[code]) {
    return KNOWN_ERROR_MESSAGES[code];
  }

  const message = typeof value.message === 'string' ? value.message.trim() : '';
  if (message && KNOWN_ERROR_MESSAGES[message]) return KNOWN_ERROR_MESSAGES[message];
  if (message && !TECHNICAL_ERROR_PATTERN.test(message) && value.isOperational) {
    return message;
  }

  return fallback;
};
