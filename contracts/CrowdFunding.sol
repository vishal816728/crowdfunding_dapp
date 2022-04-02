// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;



contract CrowdFunding{

    mapping(address=>uint) public contributors;   
    address public Manager; 
    uint public target;
    uint public raisedAmount;
    uint public noOfContributors;
    uint public deadline;
    uint public minimumContribution;

    struct Request{
        string description;
        address payable recipient;
        uint value;
        uint noOfVoters;
        bool completed;
        mapping(address=>bool) voters;
    }

    mapping(uint=>Request) public requests;
    uint public numRequests;
    constructor(){
              target=3000000000;
              Manager=msg.sender;
              minimumContribution=100 wei;
              deadline=block.timestamp+216000;
      
    }
    
    function remainingTime()public view returns(uint){
        return deadline-block.timestamp;
    }

    //modification
    // function startDate()public view returns(uint){
    //     return block.timestamp;
    // }

    function sendEth() public payable {
        require(block.timestamp<=deadline,"Time Limit exceeded");
        require(msg.value>=minimumContribution,"Minimum contribution is 100 wei");
        if(contributors[msg.sender]==0){
            noOfContributors++;
        }
        raisedAmount+=msg.value;
        contributors[msg.sender]+=msg.value;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    function refund() public {
        require(block.timestamp>deadline,"deadline is not over yet");
        require(contributors[msg.sender]>0,"you have not make any contribution");
        address payable user=payable(msg.sender);
        user.transfer(contributors[msg.sender]);
        contributors[msg.sender]=0;
    }

    modifier onlyManager(){
        require(msg.sender==Manager,"Only manager can send the request.");
        _;
    }   
    
    function createRequest(string memory _description,address payable _recipient,uint _value) public onlyManager{
            Request storage newRequest=requests[numRequests];
            numRequests++;
            newRequest.description=_description;
            newRequest.recipient=_recipient;
            newRequest.value=_value;
            newRequest.completed=false;
            newRequest.noOfVoters=0;
    }


    function voteRequest(uint _requestNo) public {
        require(contributors[msg.sender]>0,"You have no rights to vote, please contribute first.");
        Request storage thisRequest=requests[_requestNo];
        require(thisRequest.voters[msg.sender]==false,"you have already voted.");
        thisRequest.voters[msg.sender]=true;
        thisRequest.noOfVoters++;
    }

    function makePayment(uint _requestNo) public onlyManager{
        require(raisedAmount>target,"Raised fund did not meet the Target");
        Request storage thisRequest=requests[_requestNo];
        require(thisRequest.completed==false);
        require(thisRequest.noOfVoters>noOfContributors/2,"Majority must agree the proposal");
        thisRequest.recipient.transfer(thisRequest.value);
        thisRequest.completed=true;
    }
    receive() payable external{}
}