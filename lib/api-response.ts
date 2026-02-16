/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response format across all API routes.
 * 
 * Success format:
 * {
 *   success: true,
 *   data: { ... }
 * }
 * 
 * Error format:
 * {
 *   success: false,
 *   error: {
 *     code: "ERROR_CODE",
 *     message: "Human readable message"
 *   }
 * }
 */

import { NextResponse } from "next/server"

// Standard error codes used throughout the API
export const ErrorCodes = {
  // Authentication errors (401)
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  ACCOUNT_DELETION_PENDING: "ACCOUNT_DELETION_PENDING",
  
  // Authorization errors (403)
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  
  // Not found errors (404)
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  STUDENT_NOT_FOUND: "STUDENT_NOT_FOUND",
  GROUP_NOT_FOUND: "GROUP_NOT_FOUND",
  CONVERSATION_NOT_FOUND: "CONVERSATION_NOT_FOUND",
  REQUEST_NOT_FOUND: "REQUEST_NOT_FOUND",
  
  // Validation errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  
  // Conflict errors (409)
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  REQUEST_ALREADY_SENT: "REQUEST_ALREADY_SENT",
  ALREADY_IN_GROUP: "ALREADY_IN_GROUP",
  GROUP_LOCKED: "GROUP_LOCKED",
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // Server errors (500)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  
  // Business logic errors
  CANNOT_MESSAGE_SELF: "CANNOT_MESSAGE_SELF",
  MESSAGING_NOT_ALLOWED: "MESSAGING_NOT_ALLOWED",
  GROUP_FULL: "GROUP_FULL",
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

interface ApiError {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
}

interface SuccessResponse<T> {
  success: true
  data: T
}

interface ErrorResponse {
  success: false
  error: ApiError
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

/**
 * Create an error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const error: ApiError = { code, message }
  if (details) {
    error.details = details
  }
  
  return NextResponse.json(
    { success: false, error },
    { status }
  )
}

// Convenience methods for common error responses

export function unauthorizedResponse(
  message: string = "Authentication required"
): NextResponse<ErrorResponse> {
  return errorResponse(ErrorCodes.UNAUTHORIZED, message, 401)
}

export function forbiddenResponse(
  message: string = "You do not have permission to perform this action"
): NextResponse<ErrorResponse> {
  return errorResponse(ErrorCodes.FORBIDDEN, message, 403)
}

export function notFoundResponse(
  resource: string = "Resource"
): NextResponse<ErrorResponse> {
  return errorResponse(ErrorCodes.NOT_FOUND, `${resource} not found`, 404)
}

export function validationErrorResponse(
  message: string,
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  return errorResponse(ErrorCodes.VALIDATION_ERROR, message, 400, details)
}

export function conflictResponse(
  code: ErrorCode,
  message: string
): NextResponse<ErrorResponse> {
  return errorResponse(code, message, 409)
}

export function rateLimitResponse(
  retryAfter: number
): NextResponse<ErrorResponse> {
  const response = errorResponse(
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
    429,
    { retryAfter }
  )
  
  // Add standard retry-after header
  response.headers.set("Retry-After", String(retryAfter))
  
  return response
}

export function internalErrorResponse(
  message: string = "An unexpected error occurred"
): NextResponse<ErrorResponse> {
  return errorResponse(ErrorCodes.INTERNAL_ERROR, message, 500)
}

/**
 * Safe error handler that prevents leaking internal details
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Log the actual error for debugging (in development only)
  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]", error)
  }
  
  // Return generic error to client
  return internalErrorResponse()
}
