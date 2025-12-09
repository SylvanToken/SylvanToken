// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IPlatformIntegration
 * @dev Interface for platform integration and compliance reporting
 */
interface IPlatformIntegration {
    
    // Platform compliance data structure
    struct PlatformData {
        bool isApproved;
        uint256 score;
        uint256 lastUpdated;
        string status;
    }
    
    // Security analysis structure
    struct SecurityAnalysis {
        bool hasHoneypotRisk;
        bool hasRugPullRisk;
        bool hasBlacklistFunction;
        bool hasHiddenFunctions;
        bool isOwnerRenounced;
        bool isLiquidityLocked;
        uint256 riskScore;
        uint256 securityScore;
    }
    
    // Trading metrics structure
    struct TradingMetrics {
        uint256 volume24h;
        uint256 transactions24h;
        uint256 uniqueTraders24h;
        uint256 averageTransactionSize;
        uint256 currentPrice;
        uint256 priceChange24h;
        uint256 marketCap;
    }
    
    // Holder distribution structure
    struct HolderDistribution {
        uint256 totalHolders;
        uint256 topHolderPercentage;
        uint256 top10HoldersPercentage;
        uint256 top100HoldersPercentage;
        uint256 holderGrowthRate;
    }
    
    /**
     * @dev Get platform compliance status
     */
    function getPlatformCompliance(string memory platform) external view returns (PlatformData memory);
    
    /**
     * @dev Get comprehensive security analysis
     */
    function getSecurityAnalysis() external view returns (SecurityAnalysis memory);
    
    /**
     * @dev Get trading metrics
     */
    function getTradingMetrics() external view returns (TradingMetrics memory);
    
    /**
     * @dev Get holder distribution
     */
    function getHolderDistribution() external view returns (HolderDistribution memory);
    
    /**
     * @dev Check if token is honeypot
     */
    function isHoneypot() external view returns (bool);
    
    /**
     * @dev Check if token has rug pull risk
     */
    function hasRugPullRisk() external view returns (bool);
    
    /**
     * @dev Get tax information
     */
    function getTaxInfo() external view returns (
        uint256 buyTax,
        uint256 sellTax,
        bool hasTax,
        bool isTransparent
    );
    
    /**
     * @dev Get liquidity information
     */
    function getLiquidityInfo() external view returns (
        uint256 totalLiquidity,
        bool isLocked,
        uint256 lockDuration,
        address[] memory pairs
    );
    
    /**
     * @dev Get contract verification status
     */
    function getVerificationStatus() external view returns (
        bool isVerified,
        bool isOpenSource,
        bool hasAudit,
        string memory auditReport
    );
}