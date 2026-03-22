from typing import List
from datetime import datetime
import uuid
from ..clients.cosmos_client import CosmosRepository
from ..schemas.workspace import WorkspaceCreate, WorkspaceResponse

class WorkspaceService:
    """
    Business logic for workspace management.
    """
    
    def __init__(self, cosmos_repo: CosmosRepository):
        self.cosmos_repo = cosmos_repo
    
    async def create_workspace(
        self, 
        user_id: str, 
        workspace_data: WorkspaceCreate
    ) -> WorkspaceResponse:
        """
        Create new tax year workspace.
        
        Args:
            user_id: Authenticated user ID
            workspace_data: Workspace creation data (tax year)
        
        Returns:
            WorkspaceResponse: Created workspace
        """
        workspace_id = f"ws_{uuid.uuid4().hex[:12]}"
        
        document = {
            "id": workspace_id,
            "userId": user_id,
            "taxYear": workspace_data.tax_year,
            "status": "draft",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "metadata": {
                "completedQuestionnaire": False,
                "hasIncomeEntries": False,
                "hasCryptoTransactions": False,
                "hasDocuments": False
            },
            "incomeEntries": [],
            "cryptoTransactions": [],
            "calculatedTotals": {},
            "ir3Mapping": {}
        }
        
        await self.cosmos_repo.create_item("workspaces", document)
        
        return WorkspaceResponse(
            id=workspace_id,
            user_id=user_id,
            tax_year=workspace_data.tax_year,
            status="draft",
            created_at=document["createdAt"],
            updated_at=document["updatedAt"]
        )
    
    async def get_workspace(
        self, 
        workspace_id: str, 
        user_id: str
    ) -> WorkspaceResponse | None:
        """Get workspace by ID."""
        try:
            document = await self.cosmos_repo.read_item(
                "workspaces", 
                workspace_id, 
                user_id
            )
            
            return WorkspaceResponse(
                id=document["id"],
                user_id=document["userId"],
                tax_year=document["taxYear"],
                status=document["status"],
                created_at=document["createdAt"],
                updated_at=document["updatedAt"]
            )
        except Exception:
            return None
    
    async def list_workspaces(self, user_id: str) -> List[WorkspaceResponse]:
        """List all workspaces for user."""
        query = "SELECT * FROM c WHERE c.userId = @userId AND c.type = 'workspace'"
        
        items = await self.cosmos_repo.query_items(
            "workspaces",
            query,
            [{"name": "@userId", "value": user_id}],
            partition_key=user_id
        )
        
        return [
            WorkspaceResponse(
                id=item["id"],
                user_id=item["userId"],
                tax_year=item["taxYear"],
                status=item["status"],
                created_at=item["createdAt"],
                updated_at=item["updatedAt"]
            )
            for item in items
        ]