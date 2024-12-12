// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";

contract SurveyManager is HederaTokenService {
    struct Survey {
        address creator;
        string name;
        string ipfsHash;
        uint256 responsesNeeded;
        uint256 responseCount;
        uint256 endDate;
        bool isActive;
        uint256 rewardPerResponse;  // in tinybar (1 HBAR = 100,000,000 tinybar)
    }

    struct Response {
        address respondent;
        string ipfsHash;
        bool isApproved;
        bool isPaid;
    }

    mapping(uint256 => Survey) public surveys;
    mapping(uint256 => mapping(uint256 => Response)) public responses;
    mapping(uint256 => uint256) public responseCountPerSurvey;
    mapping(address => mapping(uint256 => bool)) public hasResponded;
    
    uint256 public surveyCount;
    
    // Events
    event SurveyCreated(uint256 indexed surveyId, string name, string ipfsHash, uint256 endDate);
    event ResponseSubmitted(uint256 indexed surveyId, uint256 responseId, address respondent);
    event ResponseApproved(uint256 indexed surveyId, uint256 responseId, address respondent);
    event RewardPaid(uint256 indexed surveyId, address respondent, uint256 amount);

    // To receive HBAR
    receive() external payable {}
    fallback() external payable {}

    modifier surveyExists(uint256 _surveyId) {
        require(_surveyId <= surveyCount, "Survey does not exist");
        _;
    }

    modifier onlySurveyCreator(uint256 _surveyId) {
        require(msg.sender == surveys[_surveyId].creator, "Only survey creator can call this");
        _;
    }

    modifier surveyActive(uint256 _surveyId) {
        require(surveys[_surveyId].isActive, "Survey is not active");
        require(block.timestamp <= surveys[_surveyId].endDate, "Survey has ended");
        _;
    }

    function createSurvey(
        string memory _name,
        string memory _ipfsHash,
        uint256 _responsesNeeded,
        uint256 _endDate,
        uint256 _rewardPerResponse
    ) external payable {
        require(_endDate > block.timestamp, "End date must be in the future");
        require(_responsesNeeded > 0, "Responses needed must be greater than 0");
        require(_rewardPerResponse > 0, "Reward must be greater than 0");
        
        // Calculate total required HBAR (in tinybar)
        uint256 totalRewardRequired = _responsesNeeded * _rewardPerResponse;
        require(msg.value >= totalRewardRequired, "Insufficient HBAR for rewards");

        uint256 surveyId = ++surveyCount;
        
        surveys[surveyId] = Survey({
            creator: msg.sender,
            name: _name,
            ipfsHash: _ipfsHash,
            responsesNeeded: _responsesNeeded,
            responseCount: 0,
            endDate: _endDate,
            isActive: true,
            rewardPerResponse: _rewardPerResponse
        });

        emit SurveyCreated(surveyId, _name, _ipfsHash, _endDate);
    }

    function submitResponse(uint256 _surveyId, string memory _ipfsHash) 
        external 
        surveyExists(_surveyId)
        surveyActive(_surveyId)
    {
        require(!hasResponded[msg.sender][_surveyId], "Already responded to this survey");
        require(surveys[_surveyId].responseCount < surveys[_surveyId].responsesNeeded, "Survey response limit reached");

        uint256 responseId = responseCountPerSurvey[_surveyId]++;
        
        responses[_surveyId][responseId] = Response({
            respondent: msg.sender,
            ipfsHash: _ipfsHash,
            isApproved: false,
            isPaid: false
        });

        hasResponded[msg.sender][_surveyId] = true;
        surveys[_surveyId].responseCount++;

        emit ResponseSubmitted(_surveyId, responseId, msg.sender);
    }

    function approveResponse(uint256 _surveyId, uint256 _responseId) 
        external 
        surveyExists(_surveyId)
        onlySurveyCreator(_surveyId)
    {
        Response storage response = responses[_surveyId][_responseId];
        require(!response.isApproved, "Response already approved");
        require(response.respondent != address(0), "Response does not exist");

        response.isApproved = true;
        
        if (!response.isPaid && surveys[_surveyId].rewardPerResponse > 0) {
            response.isPaid = true;
            
            // Use Hedera's transfer mechanism
            address payable receiver = payable(response.respondent);
            (bool sent, ) = receiver.call{value: surveys[_surveyId].rewardPerResponse}("");
            require(sent, "Failed to send HBAR");
            
            emit RewardPaid(_surveyId, response.respondent, surveys[_surveyId].rewardPerResponse);
        }

        emit ResponseApproved(_surveyId, _responseId, response.respondent);
    }

    function closeSurvey(uint256 _surveyId) 
        external 
        surveyExists(_surveyId)
        onlySurveyCreator(_surveyId)
    {
        Survey storage survey = surveys[_surveyId];
        require(survey.isActive, "Survey already closed");
        
        survey.isActive = false;
        
        // Return remaining HBAR to creator
        uint256 remainingFunds = survey.rewardPerResponse * (survey.responsesNeeded - survey.responseCount);
        if (remainingFunds > 0) {
            address payable creator = payable(msg.sender);
            (bool sent, ) = creator.call{value: remainingFunds}("");
            require(sent, "Failed to return remaining HBAR");
        }
    }

    // View functions
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getSurveyDetails(uint256 _surveyId) 
        external 
        view 
        returns (
            address creator,
            string memory name,
            string memory ipfsHash,
            uint256 responsesNeeded,
            uint256 responseCount,
            uint256 endDate,
            bool isActive,
            uint256 rewardPerResponse
        ) 
    {
        Survey storage survey = surveys[_surveyId];
        return (
            survey.creator,
            survey.name,
            survey.ipfsHash,
            survey.responsesNeeded,
            survey.responseCount,
            survey.endDate,
            survey.isActive,
            survey.rewardPerResponse
        );
    }
}