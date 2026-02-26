import azure.functions as func
import logging
import json
import os
import uuid
from datetime import datetime, timezone
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.core.exceptions import AzureError

# Initialize Function App
app = func.FunctionApp()

# Read configuration from environment variables (set by Terraform in app_settings)
STORAGE_ACCOUNT_NAME = os.environ.get("STORAGE_ACCOUNT_NAME", "")
STORAGE_CONTAINER_NAME = os.environ.get("STORAGE_CONTAINER_NAME", "function-output")

# Initialize Azure SDK clients (singleton pattern for performance)
credential = DefaultAzureCredential()
blob_service_client = None

def get_blob_service_client():
    """Lazy initialization of BlobServiceClient to handle cold starts efficiently."""
    global blob_service_client
    if blob_service_client is None:
        if not STORAGE_ACCOUNT_NAME:
            raise ValueError("STORAGE_ACCOUNT_NAME environment variable not set")
        
        account_url = f"https://{STORAGE_ACCOUNT_NAME}.blob.core.windows.net"
        blob_service_client = BlobServiceClient(
            account_url=account_url,
            credential=credential
        )
        logging.info(f"Initialized BlobServiceClient for account: {STORAGE_ACCOUNT_NAME}")
    
    return blob_service_client


@app.route(route="hello", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def hello(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP trigger function that returns "Hello World" and writes a JSON payload to blob storage.
    
    Endpoint: GET /api/hello
    Response: 200 OK with "Hello World" text
    Side Effect: Creates a new blob in the function-output container with request metadata
    
    Args:
        req: HttpRequest object containing request metadata (method, URL, headers, etc.)
        
    Returns:
        HttpResponse with status 200 and "Hello World" body
        
    Raises:
        Exception: Any unhandled storage or SDK error (captured by Application Insights)
    """
    
    # Log request start (captured by Application Insights as 'traces' telemetry)
    logging.info('Python HTTP trigger function received a request.')
    
    try:
        # Generate unique identifiers
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        request_id = str(uuid.uuid4())
        
        # Construct JSON payload with request metadata
        payload = {
            "timestamp": timestamp,
            "requestId": request_id,
            "message": "Hello World",
            "method": req.method
        }
        
        # Serialize to JSON string with indentation (human-readable)
        json_data = json.dumps(payload, indent=2)
        
        # Construct blob name using timestamp and GUID for uniqueness
        # Format: hello-{ISO8601-timestamp}-{uuid}.json
        # Example: hello-2025-06-15T12:34:56Z-a1b2c3d4-e5f6-7890-abcd-ef1234567890.json
        blob_name = f"hello-{timestamp}-{request_id}.json"
        
        # Get blob service client (lazy initialization)
        client = get_blob_service_client()
        
        # Get container client
        container_client = client.get_container_client(STORAGE_CONTAINER_NAME)
        
        # Get blob client
        blob_client = container_client.get_blob_client(blob_name)
        
        # Upload JSON data to blob storage
        # - Uses managed identity authentication (no connection string)
        # - Sets Content-Type header for proper MIME type
        # - overwrite=False prevents accidental overwrites (each invocation creates new blob)
        blob_client.upload_blob(
            data=json_data,
            overwrite=False,
            content_settings=ContentSettings(content_type="application/json")
        )
        
        # Log success (captured by Application Insights)
        logging.info(f'Successfully wrote blob: {blob_name}')
        
        # Return HTTP 200 response with "Hello World" body
        return func.HttpResponse(
            body="Hello World",
            status_code=200,
            mimetype="text/plain"
        )
        
    except ValueError as e:
        # Configuration error (missing environment variable)
        logging.error(f'Configuration error: {str(e)}')
        return func.HttpResponse(
            body=f"Configuration error: {str(e)}",
            status_code=500,
            mimetype="text/plain"
        )
        
    except AzureError as e:
        # Azure SDK error (storage API failure, RBAC issue, network timeout, etc.)
        logging.error(f'Azure SDK error: {str(e)}')
        return func.HttpResponse(
            body=f"Storage error: {str(e)}",
            status_code=500,
            mimetype="text/plain"
        )
        
    except Exception as e:
        # Unexpected error (catch-all for debugging)
        logging.exception(f'Unexpected error: {str(e)}')
        return func.HttpResponse(
            body=f"Internal server error: {str(e)}",
            status_code=500,
            mimetype="text/plain"
        )


@app.route(route="health", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """
    Health check endpoint for monitoring and load balancer health probes.
    
    Endpoint: GET /api/health
    Response: 200 OK with JSON health status
    
    Args:
        req: HttpRequest object (unused but required by function signature)
        
    Returns:
        HttpResponse with status 200 and health check JSON
    """
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "hello-world-function",
        "version": "1.0.0"
    }
    
    # Optionally verify storage connectivity
    try:
        if STORAGE_ACCOUNT_NAME:
            client = get_blob_service_client()
            # Quick connectivity test (list containers with max_results=1)
            containers = list(client.list_containers(max_results=1))
            health_status["storage_connected"] = True
    except Exception as e:
        logging.warning(f'Health check: Storage connectivity test failed: {str(e)}')
        health_status["storage_connected"] = False
        health_status["storage_error"] = str(e)
    
    return func.HttpResponse(
        body=json.dumps(health_status, indent=2),
        status_code=200,
        mimetype="application/json"
    )