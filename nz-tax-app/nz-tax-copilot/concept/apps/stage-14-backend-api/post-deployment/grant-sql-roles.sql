-- Stage 14 Post-Deployment: Grant SQL Database Permissions
--
-- This script grants the Container App managed identity the necessary
-- database roles and table permissions for the backend API.
--
-- Prerequisites:
-- 1. Connect to SQL Database as Entra admin user (assigned in Stage 5)
-- 2. Replace <api_identity_principal_id> with actual value from terraform outputs

USE TaxCopilotDB;
GO

-- Get managed identity principal ID from Terraform outputs
-- az containerapp show --name zd-ca-api-dev-aue --resource-group zd-rg-tax-dev-aue --query identity.principalId -o tsv
DECLARE @ContainerAppIdentityName NVARCHAR(128) = 'zd-ca-api-dev-aue';

-- Create contained database user for Container App managed identity
-- This maps the Entra ID identity to a database user
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @ContainerAppIdentityName)
BEGIN
    DECLARE @Sql NVARCHAR(MAX) = 'CREATE USER [' + @ContainerAppIdentityName + '] FROM EXTERNAL PROVIDER;';
    EXEC sp_executesql @Sql;
    PRINT 'Created database user: ' + @ContainerAppIdentityName;
END
ELSE
BEGIN
    PRINT 'Database user already exists: ' + @ContainerAppIdentityName;
END
GO

-- Grant database roles
ALTER ROLE db_datareader ADD MEMBER [zd-ca-api-dev-aue];
ALTER ROLE db_datawriter ADD MEMBER [zd-ca-api-dev-aue];
PRINT 'Granted db_datareader and db_datawriter roles';
GO

-- Grant specific table permissions (belt-and-suspenders approach)
-- Even with db_datareader/db_datawriter, explicit grants improve clarity

-- Users table: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Users TO [zd-ca-api-dev-aue];

-- Income table: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Income TO [zd-ca-api-dev-aue];

-- CryptoTransactions table: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.CryptoTransactions TO [zd-ca-api-dev-aue];

-- Documents table: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Documents TO [zd-ca-api-dev-aue];

-- IR3Calculations table: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.IR3Calculations TO [zd-ca-api-dev-aue];

-- AuditLog table: Read and Insert only (no UPDATE or DELETE to preserve audit trail)
GRANT SELECT, INSERT ON dbo.AuditLog TO [zd-ca-api-dev-aue];

PRINT 'Granted table-level permissions on all application tables';
GO

-- Verify permissions granted
SELECT 
    dp.name AS principal_name,
    dp.type_desc,
    p.permission_name,
    p.state_desc,
    OBJECT_NAME(p.major_id) AS object_name
FROM sys.database_permissions AS p
JOIN sys.database_principals AS dp ON p.grantee_principal_id = dp.principal_id
WHERE dp.name = 'zd-ca-api-dev-aue'
ORDER BY object_name, permission_name;
GO

PRINT 'Database permissions granted successfully for zd-ca-api-dev-aue';
PRINT 'The Container App can now access all application tables';