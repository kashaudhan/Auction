App = {
    web3Provider : null,
    contracts : {},
    account: '0x0',
    hasEnded: false,
    init : function(){
        return App.initWeb3();
    },
    initWeb3: function(){
       if(typeof web3 !== 'undefined'){
           App.web3Provider = window.ethereum;
           window.eth_requestAccounts;
           ethereum.autoRefreshOnNetworkChange = false;
       }else{
           App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
           web3 = new Web3(App.web3Provider);
       }
       return App.intiContract();
    },

    intiContract: function(){
        $.getJSON("../Auction.json", function(auction) {
            App.contracts.Auction = TruffleContract(auction);
            App.contracts.Auction.setProvider(App.web3Provider);
            App.highestBidIncereaseEvent();
            App.auctionEndEvent();
            return App.render();
        });
        App.bindEndEvent();
        return App.bindBidEvent();
    },

    bindBidEvent: function(){
        $(document).on('click', '#place-bid', App.handleBid);
    },

    bindEndEvent: ()=> {
        $(document).on('click', '#end-auction', App.handleEndAuction);
    },
    
    highestBidIncereaseEvent : () => {
        App.contracts.Auction.deployed().then((instance) => {
            instance.HighestBidIncreased().watch((err, event) => {
                if(!err){
                    console.log("Highest bid increased with tx hash", event.transactionHash);
                }
            });
            App.render();
        });
    },

    auctionEndEvent: () => {
        App.contracts.Auction.deployed().then((instance) => {
            instance.AuctionEnded().watch((err, event) => {
                if(!err){
                    console.log("auction tx hash", event.transactionHash);
                }
            });
            App.render();
        });
    },

    render: function(){
        var auctionObj;
        var el = function(id){return document.querySelector(id);}
        var auctionInterval = setInterval(() => {
            //render account address
            web3.eth.getAccounts((err, accounts)=>{
                if(!err){
                    App.account = accounts[0];
                    el("#yourAccount").innerHTML = accounts[0].substr(0, 10) + "..." + accounts[0].substr(37, 5);
                }else{
                    console.log("error occured while rendering account address");
                }
                //render account balance
                web3.eth.getBalance(App.account, (err, balance)=>{
                    if(!err){
                        el("#balance").innerHTML = web3.fromWei(balance, 'ether') + " ETH";
                    }else{
                        console.log("error occured while rendering account balance");
                    }
                });
            });

            App.contracts.Auction.deployed().then((instance)=>{
                auctionObj = instance;
                return auctionObj.beneficiary();
            }).then((beneficiary) => {//render beneficiary address
                el("#beneficiary").innerHTML = beneficiary.substr(0, 10) + "..." + beneficiary.substr(37, 5);
                return auctionObj.highestBidder();
            }).then((highestBidder) => {//render highest bidder's address
                el("#highestBidder").innerHTML = highestBidder.substr(0, 10) + "..." + highestBidder.substr(37, 5);
                return auctionObj.highestBid();
            }).then((highestBid) => { //render highest bid amount
                el("#raised").innerHTML = web3.fromWei(highestBid, 'ether') + " ETH";
                return auctionObj.auctionStart();
            }).then((auctionStart) => { //render time
                auctionObj.biddingTime().then((biddingTime) => {   
                    var timeleft = (auctionStart.c[0] + (biddingTime.c[0])) - (new web3.BigNumber((new Date()).getTime()/1000)).c[0];
                    el('#timeleft').innerHTML = timeleft.toString(10);
                    if(timeleft <= 0){
                        clearInterval(auctionInterval);
                        el("#timeleft").innerHTML = "Auction Ended";
                        el("#end").disabled = true;
                        el("#place-bid").disabled = true;
                        el("#input").disabled = true;
                    }
                });
                return auctionObj.ended();
            }).then((hasEnded) => {
                if(hasEnded){
                    clearInterval(auctionInterval);
                    el("#timeleft").innerHTML = "Auction Ended";
                    el("#end-auction").disabled = true;
                    el("#place-bid").disabled = true;
                    el("#input").disabled = true;
                    console.log("auction ended");
                }
            })

        }, 1000);
    },

    handleEndAuction: (event) => {
        event.preventDefault();
        var el = function(id){return document.querySelector(id);}
        console.log("ending auction...");
        App.contracts.Auction.deployed().then((instance) => {
            return instance.auctionEnd();    
        });
    },

    handleBid : (event) => {
        event.preventDefault();
        var senderAddress;
        var bidAmount = parseFloat($(":input")[0].value).toPrecision(20);
        console.log("Bid Amount: ", bidAmount);

        web3.eth.getAccounts((err, accounts) => {
            if(err){
                console.log("error occured on line 111: ", err);
            }else{
                senderAddress = accounts[0];
            }
        })
        
        App.contracts.Auction.deployed().then((instance) => {
            return instance.bid({from: senderAddress, value: web3.toWei(bidAmount, 'ether')});
        }).then((result) => {
            console.log("bid successful with tx hash: ", result.receipt.transactionHash);
        });
    }
};

$(function() {
    $(window).load(function() {
      App.init();
    });
});