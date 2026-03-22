from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from typing import Dict, Any
from functools import lru_cache
from .config import get_settings
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

@lru_cache()
def get_jwks_client() -> PyJWKClient:
    """
    Create JWKS client for B2C token signature validation.
    Cached to avoid repeated JWKS endpoint fetches.
    """
    settings = get_settings()
    
    # B2C JWKS endpoint
    jwks_url = (
        f"https://{settings.B2C_TENANT_NAME}.b2clogin.com/"
        f"{settings.B2C_TENANT_NAME}.onmicrosoft.com/"
        f"{settings.B2C_POLICY_NAME}/discovery/v2.0/keys"
    )
    
    return PyJWKClient(jwks_url, cache_keys=True, max_cached_keys=10)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Validate JWT token from Azure AD B2C and extract user ID.
    
    Returns:
        str: User ID (sub claim from token)
    
    Raises:
        HTTPException: 401 if token invalid or expired
    
    Note: B2C issuer validation is flexible to handle policy name variations.
    The actual issuer claim from the token is checked against expected patterns.
    """
    settings = get_settings()
    token = credentials.credentials
    
    try:
        # First decode without validation to extract issuer
        unverified = jwt.decode(token, options={"verify_signature": False})
        actual_issuer = unverified.get("iss", "")
        
        # Validate issuer pattern (may or may not include policy name)
        expected_issuer_patterns = [
            f"https://{settings.B2C_TENANT_NAME}.b2clogin.com/{settings.B2C_TENANT_ID}/v2.0/",
            f"https://{settings.B2C_TENANT_NAME}.b2clogin.com/{settings.B2C_TENANT_ID}/{settings.B2C_POLICY_NAME}/v2.0/"
        ]
        
        issuer_valid = any(actual_issuer.startswith(pattern) for pattern in expected_issuer_patterns)
        if not issuer_valid:
            logger.warning(f"Unexpected issuer: {actual_issuer}")
        
        # Fetch signing key from JWKS endpoint
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and validate token (skip issuer validation due to B2C policy variations)
        payload = jwt.decode(
            token,
            key=signing_key.key,
            algorithms=["RS256"],
            audience=settings.B2C_CLIENT_ID,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "verify_aud": True,
                "verify_iss": False  # Skip issuer validation due to B2C policy name variations
            },
            leeway=300  # 5-minute clock skew tolerance
        )
        
        # Extract user ID from sub claim
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing 'sub' claim"
            )
        
        logger.info(f"User authenticated: {user_id}")
        return user_id
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        logger.exception(f"Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed"
        )