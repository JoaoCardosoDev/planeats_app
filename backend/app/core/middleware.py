from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add basic security headers to all responses.
    Implements security best practices for web applications.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        if settings.security_headers_enabled:
            # Strict Transport Security - Forces HTTPS connections
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
            # Prevent MIME type sniffing
            response.headers["X-Content-Type-Options"] = "nosniff"
            
            # Prevent clickjacking attacks
            response.headers["X-Frame-Options"] = "DENY"
            
            # XSS Protection
            response.headers["X-XSS-Protection"] = "1; mode=block"
            
            # Referrer Policy - Control referrer information
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            
            # Content Security Policy - Basic policy
            response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
            
            # Permissions Policy - Restrict access to browser features
            response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response