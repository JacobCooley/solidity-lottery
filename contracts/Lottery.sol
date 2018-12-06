pragma solidity ^0.4.17;

contract Lottery{
    address public owner;
    address[] public players;

    function Lottery() public{
        owner = msg.sender;
    }

    function getPlayers() public view returns(address[]){
        return players;
    }

    modifier isOwner{
        require(owner == msg.sender);
        _;
    }

    function random() public view returns(uint){
        return uint(sha3(block.difficulty, now, players));
    }

    function enter() public payable{
        require(msg.value >= .01 ether);
        players.push(msg.sender);
    }

    function withdraw() isOwner public{
        uint i = random() % players.length;
        players[i].send(this.balance);
        players = new address[](0);
    }
}