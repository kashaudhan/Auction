pragma solidity >=0.5.16 <0.8.0;

contract Auction{
    address payable public beneficiary; // highest bid amount will go to this account
    uint public auctionStart; //auction start time
    uint public biddingTime; // 
    uint public highestBid;
    address public highestBidder;
    mapping(address => uint) pendingReturn; // maps bidder's address to bidder's address
    bool public ended; // mark end of the auction

    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    constructor(address payable _beneficiary, uint _biddingTime) public {
        beneficiary = _beneficiary;
        biddingTime = _biddingTime;
        auctionStart = block.timestamp;
    }

    function bid() payable  public {
        require(block.timestamp <= auctionStart + biddingTime, "time limit execded error");
        require(msg.value > highestBid, "low bid amount error");
        require(ended==false, "auction ended error");
        if(highestBidder != address(0)){
            pendingReturn[msg.sender] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(highestBidder, highestBid);  
    }

    function withdraw() public returns(bool){
        uint amount = pendingReturn[msg.sender];
        if(amount > 0){
            pendingReturn[msg.sender] = 0;
            if(!msg.sender.send(amount)){
                pendingReturn[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function auctionEnd() public{
        require(block.timestamp <=auctionStart +  biddingTime, "time limit execded error");
        require(ended == false, "auction ended error");
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        require(!beneficiary.send(highestBid));
    }

}
