/**
 * Standard API response wrapper for consistent JSON output.
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success(res, message = 'Success', data = null) {
    const response = new ApiResponse(200, message, data);
    return res.status(200).json(response);
  }

  static created(res, message = 'Created successfully', data = null) {
    const response = new ApiResponse(201, message, data);
    return res.status(201).json(response);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
