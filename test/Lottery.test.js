const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const EventEmitter = require('events').EventEmitter.prototype._maxListeners = 100
const web3 = new Web3(ganache.provider())

const { interface, bytecode } = require('../compile')
let lottery
let accounts

beforeEach(async () => {
	accounts = await web3.eth.getAccounts()
	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
		.send({ from: accounts[0], gas: 1000000 })
})

describe('Lottery Contract', () => {
	it('Gets Deployed', () => {
		assert.ok(lottery.options.address)
	})
	
	it('Address enters lottery',async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.2", 'ether')
		})
		const players = await lottery.methods.getPlayers().call()
		
		assert.equal(1,players.length)
		assert.equal(accounts[0],players[0])
	})
	
	it('Multiple addresses enter the lottery',async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.2", 'ether')
		})
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei("0.2", 'ether')
		})
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei("0.2", 'ether')
		})
		const players = await lottery.methods.getPlayers().call()
		
		assert.equal(3,players.length)
		assert.equal(accounts[0],players[0])
		assert.equal(accounts[1],players[1])
		assert.equal(accounts[2],players[2])
	})
	
	it('Requires minimum value to enter',async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: web3.utils.toWei("0.002", 'ether')
			})
			assert(false)
		}catch (e) {
			assert(e)
		}
	})
	
	it('Only owner can withdraw',async () => {
		try {
			await lottery.methods.withdraw().send({
				from: accounts[2]
			})
			assert(false)
		}catch (e) {
			assert(e)
		}
	})
	
	it('Sends money to winner and resets player array',async () => {
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei("2", 'ether')
		})
		const originalValue = await web3.eth.getBalance(accounts[1])
		await lottery.methods.withdraw().send({
			from: accounts[0]
		})
		const newValue = await web3.eth.getBalance(accounts[1])
		const difference = newValue - originalValue
		console.log(difference)
		assert(difference > web3.utils.toWei("1.8", "ether"))
	})
})