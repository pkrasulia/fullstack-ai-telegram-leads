"""JWT Authentication service for backend API communication."""

import logging
import os
import time
import requests
from typing import Optional, Dict, Any
from threading import Lock

logger = logging.getLogger(__name__)


class AuthService:
    """Service for handling JWT authentication with the backend API."""
    
    def __init__(self):
        self._token: Optional[str] = None
        self._token_expires_at: Optional[float] = None
        self._lock = Lock()
        self._backend_base_url = "http://backend:4343/api/v1"
        
        # Get credentials from environment variables
        self._service_email = os.getenv('SERVICE_ACCOUNT_LOGIN', 'service@example.com')
        self._service_password = os.getenv('SERVICE_ACCOUNT_PASSWORD', 'secret')
        
        logger.info("AuthService initialized with email: %s", self._service_email)
    
    def _login(self) -> bool:
        """
        Perform login and get JWT token.
        
        Returns:
            bool: True if login successful, False otherwise
        """
        login_url = f"{self._backend_base_url}/auth/email/login"
        login_data = {
            "email": self._service_email,
            "password": self._service_password
        }
        
        try:
            logger.info("Attempting login to %s with email: %s", login_url, self._service_email)
            
            response = requests.post(
                login_url,
                json=login_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                response_data = response.json()
                token = response_data.get('token')
                
                if token:
                    self._token = token
                    # Assume token expires in 1 hour (3600 seconds) if not specified
                    # Refresh 5 minutes before expiration
                    self._token_expires_at = time.time() + 3300  # 55 minutes
                    
                    logger.info("Login successful, token obtained and expires at: %s", 
                              time.ctime(self._token_expires_at))
                    return True
                else:
                    logger.error("Login response missing token: %s", response_data)
                    return False
            else:
                error_msg = f"Login failed with status {response.status_code}"
                try:
                    error_details = response.json()
                    error_msg += f": {error_details}"
                except:
                    error_msg += f": {response.text}"
                
                logger.error(error_msg)
                return False
                
        except requests.exceptions.ConnectionError as e:
            logger.error("Connection error during login: %s", str(e))
            return False
        except requests.exceptions.Timeout as e:
            logger.error("Timeout error during login: %s", str(e))
            return False
        except Exception as e:
            logger.error("Unexpected error during login: %s", str(e))
            return False
    
    def _is_token_valid(self) -> bool:
        """
        Check if current token is valid and not expired.
        
        Returns:
            bool: True if token is valid, False otherwise
        """
        if not self._token:
            logger.debug("No token available")
            return False
        
        if not self._token_expires_at:
            logger.debug("No token expiration time set")
            return False
        
        if time.time() >= self._token_expires_at:
            logger.debug("Token expired at %s", time.ctime(self._token_expires_at))
            return False
        
        logger.debug("Token is valid, expires at %s", time.ctime(self._token_expires_at))
        return True
    
    def get_auth_headers(self) -> Dict[str, str]:
        """
        Get authentication headers with valid JWT token.
        Automatically handles login and token refresh.
        
        Returns:
            Dict[str, str]: Headers dictionary with Authorization header
        """
        with self._lock:
            if not self._is_token_valid():
                logger.info("Token invalid or expired, attempting login...")
                
                if not self._login():
                    logger.error("Failed to obtain valid token")
                    raise Exception("Authentication failed: Unable to obtain valid JWT token")
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self._token}'
            }
            
            logger.debug("Returning auth headers with token: %s...", self._token[:20] if self._token else "None")
            return headers
    
    def make_authenticated_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """
        Make an authenticated request to the backend API.
        Automatically handles authentication and token refresh.
        
        Args:
            method (str): HTTP method (GET, POST, PUT, DELETE, etc.)
            endpoint (str): API endpoint (e.g., '/leads', '/leads/123')
            **kwargs: Additional arguments to pass to requests
        
        Returns:
            requests.Response: The response object
        
        Raises:
            Exception: If authentication fails or request fails after retries
        """
        url = f"{self._backend_base_url}{endpoint}"
        max_retries = 2
        
        for attempt in range(max_retries):
            try:
                # Get fresh auth headers
                headers = self.get_auth_headers()
                
                # Merge with any additional headers
                if 'headers' in kwargs:
                    headers.update(kwargs['headers'])
                kwargs['headers'] = headers
                
                logger.info("Making %s request to %s (attempt %d)", method.upper(), url, attempt + 1)
                
                response = requests.request(method, url, timeout=10, **kwargs)
                
                # If we get 401, token might be invalid, try to refresh once
                if response.status_code == 401 and attempt == 0:
                    logger.warning("Got 401 response, token might be invalid. Forcing re-authentication...")
                    with self._lock:
                        self._token = None  # Force re-authentication
                    continue
                
                logger.info("Request completed with status: %d", response.status_code)
                return response
                
            except requests.exceptions.ConnectionError as e:
                logger.error("Connection error on attempt %d: %s", attempt + 1, str(e))
                if attempt == max_retries - 1:
                    raise Exception(f"Connection failed after {max_retries} attempts: {str(e)}")
                time.sleep(1)
                
            except requests.exceptions.Timeout as e:
                logger.error("Timeout error on attempt %d: %s", attempt + 1, str(e))
                if attempt == max_retries - 1:
                    raise Exception(f"Request timeout after {max_retries} attempts: {str(e)}")
                time.sleep(1)
                
            except Exception as e:
                logger.error("Unexpected error on attempt %d: %s", attempt + 1, str(e))
                if attempt == max_retries - 1:
                    raise
                time.sleep(1)
        
        raise Exception("Request failed after all retry attempts")


# Global instance
_auth_service = None


def get_auth_service() -> AuthService:
    """
    Get the global AuthService instance (singleton pattern).
    
    Returns:
        AuthService: The global auth service instance
    """
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service
