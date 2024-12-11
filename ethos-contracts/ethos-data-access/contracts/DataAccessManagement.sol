// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";

contract DataAccessManagement is HederaTokenService {
    // Structs
    struct DataSource {
        string name;
        string dataType;
        uint256 size;
        uint256 lastUpdated;
        bool isActive;
        address owner;
        string storageLink;
        string metadataLink;
        uint256 accessFee;    // Access fee in HBAR (in wei)
    }

    struct AccessRequest {
        uint256 requestId;
        address requester;
        uint256 dataSourceId;
        string purpose;
        RequestStatus status;
        uint256 requestDate;
        uint256 paidAmount;    // Amount of HBAR paid with request
    }

    enum RequestStatus { Pending, Approved, Rejected }

    // State variables
    mapping(uint256 => mapping(address => bool)) public dataSourceAccess;  
    mapping(uint256 => DataSource) public dataSources;
    mapping(uint256 => AccessRequest) public accessRequests;
    uint256 public dataSourceCounter;
    uint256 public requestCounter;

    // Events
    event DataSourceAdded(uint256 indexed id, string name, address indexed owner, string storageLink, uint256 accessFee);
    event DataSourceUpdated(uint256 indexed id, string newStorageLink);
    event AccessRequested(uint256 indexed requestId, address indexed requester, uint256 indexed dataSourceId, uint256 paidAmount);
    event AccessGranted(uint256 indexed dataSourceId, address indexed user, uint256 paidAmount);
    event AccessRevoked(uint256 indexed dataSourceId, address indexed user);
    event RequestProcessed(uint256 indexed requestId, RequestStatus status);
    event PaymentTransferred(address indexed to, uint256 amount);

    // Modifiers
    modifier onlyDataOwner(uint256 dataSourceId) {
        require(dataSources[dataSourceId].owner == msg.sender, "Not the data owner");
        _;
    }

    modifier dataSourceExists(uint256 dataSourceId) {
        require(dataSources[dataSourceId].owner != address(0), "Data source doesn't exist");
        _;
    }

    // Receive function to accept HBAR
    receive() external payable {}
    fallback() external payable {}

    // Functions
    function addDataSource(
        string memory name,
        string memory dataType,
        uint256 size,
        string memory storageLink,
        string memory metadataLink,
        uint256 accessFee
    ) external returns (uint256) {
        require(bytes(storageLink).length > 0, "Storage link cannot be empty");
        
        uint256 newDataSourceId = ++dataSourceCounter;
        DataSource storage newSource = dataSources[newDataSourceId];
        
        newSource.name = name;
        newSource.dataType = dataType;
        newSource.size = size;
        newSource.lastUpdated = block.timestamp;
        newSource.isActive = true;
        newSource.owner = msg.sender;
        newSource.storageLink = storageLink;
        newSource.metadataLink = metadataLink;
        newSource.accessFee = accessFee;

        emit DataSourceAdded(newDataSourceId, name, msg.sender, storageLink, accessFee);
        return newDataSourceId;
    }

    function requestAccess(
        uint256 dataSourceId,
        string memory purpose
    ) external payable dataSourceExists(dataSourceId) returns (uint256) {
        DataSource storage source = dataSources[dataSourceId];
        require(msg.value >= source.accessFee, "Insufficient payment for access request");
        
        uint256 newRequestId = ++requestCounter;
        
        accessRequests[newRequestId] = AccessRequest({
            requestId: newRequestId,
            requester: msg.sender,
            dataSourceId: dataSourceId,
            purpose: purpose,
            status: RequestStatus.Pending,
            requestDate: block.timestamp,
            paidAmount: msg.value
        });

        emit AccessRequested(newRequestId, msg.sender, dataSourceId, msg.value);
        return newRequestId;
    }

    function processAccessRequest(
        uint256 requestId,
        bool approved
    ) external {
        AccessRequest storage request = accessRequests[requestId];
        require(dataSources[request.dataSourceId].owner == msg.sender, "Not the data owner");
        require(request.status == RequestStatus.Pending, "Request already processed");

        if (approved) {
            request.status = RequestStatus.Approved;
            dataSourceAccess[request.dataSourceId][request.requester] = true;
            
            // Transfer the payment to data owner
            address payable owner = payable(dataSources[request.dataSourceId].owner);
            (bool sent, ) = owner.call{value: request.paidAmount}("");
            require(sent, "Failed to transfer payment");
            
            emit AccessGranted(request.dataSourceId, request.requester, request.paidAmount);
            emit PaymentTransferred(owner, request.paidAmount);
        } else {
            request.status = RequestStatus.Rejected;
            // Refund the requester
            address payable requester = payable(request.requester);
            (bool sent, ) = requester.call{value: request.paidAmount}("");
            require(sent, "Failed to refund payment");
            emit PaymentTransferred(requester, request.paidAmount);
        }

        emit RequestProcessed(requestId, request.status);
    }

    function updateAccessFee(
        uint256 dataSourceId,
        uint256 newAccessFee
    ) external onlyDataOwner(dataSourceId) {
        dataSources[dataSourceId].accessFee = newAccessFee;
    }

    function getAccessFee(
        uint256 dataSourceId
    ) external view returns (uint256) {
        return dataSources[dataSourceId].accessFee;
    }

    // Existing functions remain the same
    function revokeAccess(uint256 dataSourceId, address user) external onlyDataOwner(dataSourceId) {
        require(dataSourceAccess[dataSourceId][user], "User doesn't have access");
        dataSourceAccess[dataSourceId][user] = false;
        emit AccessRevoked(dataSourceId, user);
    }

    function getStorageLink(
        uint256 dataSourceId
    ) external view returns (string memory storageLink, string memory metadataLink) {
        require(dataSourceAccess[dataSourceId][msg.sender] || dataSources[dataSourceId].owner == msg.sender, 
                "No access to storage link");
        return (dataSources[dataSourceId].storageLink, dataSources[dataSourceId].metadataLink);
    }

    function checkAccess(
        uint256 dataSourceId,
        address user
    ) external view returns (bool) {
        return dataSourceAccess[dataSourceId][user] || dataSources[dataSourceId].owner == user;
    }


    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getDataSourceDetails(
        uint256 dataSourceId,
        address accessor
    ) external view returns (
        string memory name,
        string memory dataType,
        uint256 size,
        uint256 lastUpdated,
        bool isActive,
        address owner,
        uint256 accessFee,
        string memory storageLink,
        string memory metadataLink
    ) {
         require(accessor != address(0), "Invalid accessor address");
        DataSource storage source = dataSources[dataSourceId];
        // Only return storage link if user has access or is owner
                // Check access from the external mapping
        
        // Check access for the provided address instead of msg.sender
        bool hasAccess = dataSourceAccess[dataSourceId][accessor] || source.owner == accessor;
        
        
        return (
            source.name,
            source.dataType,
            source.size,
            source.lastUpdated,
            source.isActive,
            source.owner,
            source.accessFee,
            hasAccess ? source.storageLink : "",
            hasAccess ? source.metadataLink : ""
        );
    }

    function getRequestDetails(
        uint256 requestId,
        address accessor
    ) external view returns (
        address requester,
        uint256 dataSourceId,
        string memory purpose,
        RequestStatus status,
        uint256 requestDate,
        uint256 paidAmount
    ) {
        require(accessor != address(0), "Invalid accessor address");
        AccessRequest storage request = accessRequests[requestId];

        require(
            accessor == request.requester || 
            dataSources[request.dataSourceId].owner == accessor,
            "Unauthorized access to request details"
        );

        return (
            request.requester,
            request.dataSourceId,
            request.purpose,
            request.status,
            request.requestDate,
            request.paidAmount
        );
    }
}