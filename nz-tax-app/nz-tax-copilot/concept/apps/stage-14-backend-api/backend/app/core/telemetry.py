"""
Application Insights telemetry configuration.
"""
import logging
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace import config_integration
from opencensus.trace.samplers import ProbabilitySampler
from opencensus.trace.tracer import Tracer

from app.core.config import settings

logger = logging.getLogger(__name__)


def configure_telemetry():
    """Configure Application Insights telemetry exporters."""
    connection_string = settings.APPLICATIONINSIGHTS_CONNECTION_STRING
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Console handler for container logs (stdout/stderr)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(
        logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    root_logger.addHandler(console_handler)
    
    # Azure Application Insights handler
    azure_handler = AzureLogHandler(connection_string=connection_string)
    root_logger.addHandler(azure_handler)
    
    # Configure distributed tracing
    config_integration.trace_integrations(['requests', 'logging', 'sqlalchemy'])
    
    tracer = Tracer(
        exporter=AzureExporter(connection_string=connection_string),
        sampler=ProbabilitySampler(1.0)  # 100% sampling for prototype
    )
    
    logger.info("Application Insights telemetry configured")