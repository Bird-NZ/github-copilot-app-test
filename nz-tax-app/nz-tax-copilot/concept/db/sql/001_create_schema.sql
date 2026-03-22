-- ============================================================================
-- NZ Tax Copilot - SQL Database Schema
-- Stage 12: SQL Schema
-- ============================================================================
-- Purpose: Create all tables, indexes, and reference data
-- Authentication: Deploy via Entra ID admin (no SQL auth)
-- Managed Identity: Container App identity will be granted db_datareader/db_datawriter
-- ============================================================================

-- Set context
USE TaxCopilotDB;
GO

-- ============================================================================
-- Table: Users
-- Purpose: User profile information (linked to Azure AD B2C sub claim)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId NVARCHAR(128) PRIMARY KEY,  -- Azure AD B2C sub claim
        Email NVARCHAR(255) NOT NULL,
        DisplayName NVARCHAR(255),
        GivenName NVARCHAR(255),
        FamilyName NVARCHAR(255),
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsActive BIT NOT NULL DEFAULT 1,
        LastLoginAt DATETIME2,
        
        INDEX IX_Users_Email (Email),
        INDEX IX_Users_IsActive (IsActive)
    );
    
    PRINT 'Created table: Users';
END
GO

-- ============================================================================
-- Table: Income
-- Purpose: Income entries for tax workspaces
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Income')
BEGIN
    CREATE TABLE Income (
        IncomeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        WorkspaceId NVARCHAR(50) NOT NULL,
        UserId NVARCHAR(128) NOT NULL,
        
        -- Income details
        IncomeType NVARCHAR(50) NOT NULL,  -- 'salary', 'dividends', 'interest', etc.
        Amount DECIMAL(18,2) NOT NULL,
        TaxWithheld DECIMAL(18,2) DEFAULT 0,
        Description NVARCHAR(MAX),
        
        -- IR3 mapping
        IR3BoxCode NVARCHAR(10) NOT NULL,
        
        -- Metadata
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        DeletedAt DATETIME2,
        
        -- Foreign key
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        
        -- Indexes
        INDEX IX_Income_WorkspaceId (WorkspaceId),
        INDEX IX_Income_UserId (UserId),
        INDEX IX_Income_IsDeleted (IsDeleted),
        INDEX IX_Income_IncomeType (IncomeType)
    );
    
    PRINT 'Created table: Income';
END
GO

-- ============================================================================
-- Table: CryptoTransactions
-- Purpose: Cryptocurrency buy/sell transactions
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CryptoTransactions')
BEGIN
    CREATE TABLE CryptoTransactions (
        TransactionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        WorkspaceId NVARCHAR(50) NOT NULL,
        UserId NVARCHAR(128) NOT NULL,
        
        -- Transaction details
        TransactionType NVARCHAR(20) NOT NULL,  -- 'buy' or 'sell'
        Currency NVARCHAR(10) NOT NULL,  -- 'BTC', 'ETH', etc.
        Amount DECIMAL(18,8) NOT NULL,
        PriceNZD DECIMAL(18,2) NOT NULL,
        TransactionDate DATE NOT NULL,
        FeeNZD DECIMAL(18,2) DEFAULT 0,
        
        -- Exchange details
        ExchangeName NVARCHAR(100),
        TransactionHash NVARCHAR(255),
        
        -- Capital gains (for sell transactions)
        CostBasis DECIMAL(18,2),
        CapitalGain DECIMAL(18,2),
        CapitalLoss DECIMAL(18,2),
        
        -- Metadata
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        DeletedAt DATETIME2,
        
        -- Foreign key
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        
        -- Indexes
        INDEX IX_CryptoTransactions_WorkspaceId (WorkspaceId),
        INDEX IX_CryptoTransactions_UserId (UserId),
        INDEX IX_CryptoTransactions_IsDeleted (IsDeleted),
        INDEX IX_CryptoTransactions_Currency (Currency),
        INDEX IX_CryptoTransactions_Date (TransactionDate)
    );
    
    PRINT 'Created table: CryptoTransactions';
END
GO

-- ============================================================================
-- Table: Documents
-- Purpose: Document metadata (links to Blob Storage)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Documents')
BEGIN
    CREATE TABLE Documents (
        DocumentId NVARCHAR(50) PRIMARY KEY,
        WorkspaceId NVARCHAR(50) NOT NULL,
        UserId NVARCHAR(128) NOT NULL,
        
        -- Blob Storage reference
        BlobPath NVARCHAR(500) NOT NULL,
        BlobUrl NVARCHAR(1000),
        BlobContainer NVARCHAR(100) NOT NULL DEFAULT 'tax-documents',
        
        -- File metadata
        FileName NVARCHAR(255) NOT NULL,
        FileSize BIGINT NOT NULL,
        FileType NVARCHAR(100) NOT NULL,
        FileHash NVARCHAR(64),  -- SHA-256 hash for integrity verification
        
        -- Categorization
        Category NVARCHAR(50),  -- 'income-receipt', 'expense-invoice', 'crypto-statement'
        Description NVARCHAR(MAX),
        Tags NVARCHAR(500),  -- Comma-separated tags
        
        -- Associated entity
        AssociatedEntityType NVARCHAR(50),  -- 'income', 'crypto_transaction'
        AssociatedEntityId NVARCHAR(50),
        
        -- Status
        Status NVARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'uploaded', 'error', 'deleted'
        
        -- Timestamps
        UploadedAt DATETIME2,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        DeletedAt DATETIME2,
        
        -- Foreign key
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        
        -- Indexes
        INDEX IX_Documents_WorkspaceId (WorkspaceId),
        INDEX IX_Documents_UserId (UserId),
        INDEX IX_Documents_Status (Status),
        INDEX IX_Documents_IsDeleted (IsDeleted),
        INDEX IX_Documents_Category (Category),
        INDEX IX_Documents_AssociatedEntity (AssociatedEntityType, AssociatedEntityId)
    );
    
    PRINT 'Created table: Documents';
END
GO

-- ============================================================================
-- Table: IR3Calculations
-- Purpose: Cached IR3 calculation results
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IR3Calculations')
BEGIN
    CREATE TABLE IR3Calculations (
        CalculationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        WorkspaceId NVARCHAR(50) NOT NULL,
        UserId NVARCHAR(128) NOT NULL,
        
        -- Calculation results
        TaxYear INT NOT NULL,
        TotalIncome DECIMAL(18,2) NOT NULL,
        TotalDeductions DECIMAL(18,2) DEFAULT 0,
        TaxableIncome DECIMAL(18,2) NOT NULL,
        TaxPayable DECIMAL(18,2) NOT NULL,
        CryptoCapitalGains DECIMAL(18,2) DEFAULT 0,
        
        -- IR3 breakdown (JSON)
        IR3Breakdown NVARCHAR(MAX),  -- JSON with line-by-line IR3 details
        
        -- Metadata
        CalculatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CalculationVersion NVARCHAR(20) DEFAULT 'v1.0',
        
        -- Foreign key
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        
        -- Indexes
        INDEX IX_IR3Calculations_WorkspaceId (WorkspaceId),
        INDEX IX_IR3Calculations_UserId (UserId),
        INDEX IX_IR3Calculations_CalculatedAt (CalculatedAt DESC)
    );
    
    PRINT 'Created table: IR3Calculations';
END
GO

-- ============================================================================
-- Table: AuditLog
-- Purpose: Audit trail for all user actions and data modifications
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE AuditLog (
        AuditLogId BIGINT IDENTITY(1,1) PRIMARY KEY,
        
        -- User context
        UserId NVARCHAR(128) NOT NULL,
        WorkspaceId NVARCHAR(50),
        
        -- Event details
        EventType NVARCHAR(50) NOT NULL,  -- 'income_added', 'crypto_transaction_updated', 'document_uploaded'
        EntityType NVARCHAR(50) NOT NULL,  -- 'income', 'crypto_transaction', 'document', 'workspace'
        EntityId NVARCHAR(50),
        
        -- Change tracking
        OldValue NVARCHAR(MAX),  -- JSON snapshot before change
        NewValue NVARCHAR(MAX),  -- JSON snapshot after change
        
        -- Request metadata
        IpAddress NVARCHAR(45),
        UserAgent NVARCHAR(500),
        CorrelationId NVARCHAR(36),
        
        -- Timestamp
        EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        
        -- Foreign key
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        
        -- Indexes
        INDEX IX_AuditLog_UserId (UserId),
        INDEX IX_AuditLog_WorkspaceId (WorkspaceId),
        INDEX IX_AuditLog_EventType (EventType),
        INDEX IX_AuditLog_EntityType (EntityType),
        INDEX IX_AuditLog_EventTimestamp (EventTimestamp DESC),
        INDEX IX_AuditLog_CorrelationId (CorrelationId)
    );
    
    PRINT 'Created table: AuditLog';
END
GO

-- ============================================================================
-- Table: CalculationCache
-- Purpose: Cache for expensive calculation results (crypto capital gains)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CalculationCache')
BEGIN
    CREATE TABLE CalculationCache (
        CacheKey NVARCHAR(200) PRIMARY KEY,
        WorkspaceId NVARCHAR(50) NOT NULL,
        UserId NVARCHAR(128) NOT NULL,
        
        -- Cache details
        CalculationType NVARCHAR(50) NOT NULL,  -- 'crypto_capital_gains'
        CalculatedValue NVARCHAR(MAX) NOT NULL,  -- JSON result
        
        -- Invalidation
        InputHash NVARCHAR(64) NOT NULL,  -- SHA-256 hash of input data
        LastCalculatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        ExpiresAt DATETIME2,
        
        -- Foreign key
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        
        -- Indexes
        INDEX IX_CalculationCache_WorkspaceId (WorkspaceId),
        INDEX IX_CalculationCache_UserId (UserId),
        INDEX IX_CalculationCache_ExpiresAt (ExpiresAt)
    );
    
    PRINT 'Created table: CalculationCache';
END
GO

-- ============================================================================
-- Reference Data: Income Type Mappings
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IncomeTypeMappings')
BEGIN
    CREATE TABLE IncomeTypeMappings (
        IncomeType NVARCHAR(50) PRIMARY KEY,
        IR3BoxCode NVARCHAR(10) NOT NULL,
        Description NVARCHAR(255) NOT NULL,
        Category NVARCHAR(50) NOT NULL,  -- 'employment', 'investment', 'business'
        IsActive BIT NOT NULL DEFAULT 1
    );
    
    -- Insert reference data
    INSERT INTO IncomeTypeMappings (IncomeType, IR3BoxCode, Description, Category) VALUES
    ('salary', '1', 'Salary, wages, and schedular payments', 'employment'),
    ('dividends', '7', 'Dividends from companies and unit trusts', 'investment'),
    ('interest', '8', 'Interest income', 'investment'),
    ('rental', '13', 'Rental income from property', 'investment'),
    ('business', '14', 'Business income', 'business'),
    ('partnership', '15', 'Partnership income', 'business'),
    ('estate', '16', 'Estate or trust income', 'investment'),
    ('other', '24', 'Other income not classified elsewhere', 'other'),
    ('crypto_gain', '25', 'Crypto capital gains (treated as property)', 'investment');
    
    PRINT 'Created table and populated reference data: IncomeTypeMappings';
END
GO

-- ============================================================================
-- Reference Data: IR3 Box Code Descriptions
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IR3BoxCodes')
BEGIN
    CREATE TABLE IR3BoxCodes (
        BoxCode NVARCHAR(10) PRIMARY KEY,
        Description NVARCHAR(500) NOT NULL,
        Category NVARCHAR(50) NOT NULL,  -- 'income', 'deduction', 'tax'
        IRDGuidanceUrl NVARCHAR(500)
    );
    
    -- Insert IR3 box code descriptions
    INSERT INTO IR3BoxCodes (BoxCode, Description, Category, IRDGuidanceUrl) VALUES
    ('1', 'Salary, wages, and schedular payments', 'income', 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/types-of-individual-income/salary-and-wage-income'),
    ('7', 'Dividends', 'income', 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/types-of-individual-income/dividends'),
    ('8', 'Interest', 'income', 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/types-of-individual-income/interest-income'),
    ('13', 'Rental income', 'income', 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/types-of-individual-income/rental-income'),
    ('14', 'Business income', 'income', 'https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations'),
    ('15', 'Partnership income', 'income', 'https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations/types-of-business-income/partnership-income'),
    ('16', 'Estate or trust income', 'income', 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/types-of-individual-income/estate-and-trust-income'),
    ('20', 'Other income', 'income', 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/types-of-individual-income/other-income'),
    ('25', 'Crypto capital gains', 'income', 'https://www.ird.govt.nz/cryptoassets/tax-on-crypto'),
    ('TAX', 'Tax payable', 'tax', NULL);
    
    PRINT 'Created table and populated reference data: IR3BoxCodes';
END
GO

-- ============================================================================
-- Verification: Check table creation
-- ============================================================================
PRINT '';
PRINT '=============================================================================';
PRINT 'Schema Creation Complete';
PRINT '=============================================================================';
PRINT '';

SELECT 
    TABLE_NAME,
    (SELECT COUNT(*) 
     FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = t.TABLE_NAME) AS ColumnCount
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

PRINT '';
PRINT 'Reference Data Row Counts:';
SELECT 'IncomeTypeMappings' AS TableName, COUNT(*) AS RowCount FROM IncomeTypeMappings
UNION ALL
SELECT 'IR3BoxCodes', COUNT(*) FROM IR3BoxCodes;
GO