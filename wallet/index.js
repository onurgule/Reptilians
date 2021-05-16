const BchWallet = require('./api')
const BCHJS = require('@psf/bch-js')
const BITBOXSDK = require('bitbox-sdk');
const BigNumber = require('bignumber.js');
const slpjs = require('slpjs')
const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const port = 3000
const BCHN_MAINNET = 'https://rest.bitcoin.com/v2/'
const bchjs = new BCHJS({ restURL: BCHN_MAINNET })
const BITBOX = new BITBOXSDK.BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });
const bitboxNetwork = new slpjs.BitboxNetwork(BITBOX);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function createWallet () {
  try {
    // Instantiate the wallet library.
    const bchWallet = new BchWallet()

    // Wait for the wallet to be created.
    await bchWallet.walletInfoPromise

    // Print out the wallet information.
    return JSON.stringify(bchWallet.walletInfo, null, 2);
  } catch (err) {
	console.error('Error in getBalance: ', err)
    return null;
  }
}
async function getBalance (walletInfo) {
  try {
    const balance = await bchjs.Electrumx.balance(walletInfo.cashAddress)
	var balances = await bitboxNetwork.getAllSlpBalancesAndUtxos(walletInfo.cashAddress);
    return JSON.stringify(balances, null, 2);
  } catch (err) {
    console.error('Error in getBalance: ', err)
    return null
  }
}
async function getFaucetCount(addr, tokenid){
	let tokenCount = 0;
	try{
	let balances = await bitboxNetwork.getAllSlpBalancesAndUtxos(addr);
	tokenCount = (balances.slpTokenUtxos[tokenid].length-1)
	} catch(err){
		console.error("error in getFaucetCount: ", err);
	}
	
	return tokenCount;
}

async function sendBch (senderMnemonic, receiverAddress, amount) {
  try {
    const MNEMONIC = senderMnemonic
    const RECIEVER = receiverAddress
    const SATS_TO_SEND = amount
    const slpWallet = new BchWallet(MNEMONIC)
    await slpWallet.walletInfoPromise
    const balance = await slpWallet.getBalance()
    if (balance === 0) {
      return 701;
    }

    const outputs = []

    if (RECIEVER === '') {
      return 704;
    // Send the funds to the reciever.
    } else {
      outputs.push({
        address: RECIEVER,
        amountSat: SATS_TO_SEND
      })
    }
	console.error(JSON.stringify(outputs));
	
    const txid = await slpWallet.send(outputs)

    return txid;
  } catch (err) {
    console.error('Error: ', err)
    return 700;
  }
}

async function sendToken(senderMnemonic, receiverAddress, tokenId) {
  try {
    // Replace the values for the constants below to customize for your use.
    const MNEMONIC = senderMnemonic
    const RECIEVER = receiverAddress
    const TOKENID = tokenId
    const TOKENS_TO_SEND = 1
    const slpWallet = new BchWallet(MNEMONIC)
    await slpWallet.walletInfoPromise
    const balance = await slpWallet.getBalance()
    if (balance === 0) {
      return 701;
    }
    let output = {}

    if (RECIEVER === '') {
      return 704;
      // Send the funds to the reciever.
    } else {
      output = {
        address: RECIEVER,
        tokenId: TOKENID,
        qty: TOKENS_TO_SEND
      }
    }

    const txid = await slpWallet.sendTokens(output)
	
	return txid;
  } catch (err) {
    console.error('Error: ', err)
	  return 700;
  }
}
async function burnToken(senderMnemonic, tokenId) {
  try {
    // Replace the values for the constants below to customize for your use.
    const MNEMONIC = senderMnemonic
    const TOKENID = tokenId
	console.error("burn:"+MNEMONIC+"-"+TOKENID);
    const TOKENS_TO_SEND = 1
    const slpWallet = new BchWallet(MNEMONIC)
    await slpWallet.walletInfoPromise
    const balance = await slpWallet.getBalance()
    if (balance === 0) {
      return 701;
    }


    const txid = await slpWallet.burnTokens(TOKENID)
	
	return txid;
  } catch (err) {
    console.error('Error: ', err)
	  return 700;
  }
}
async function sendAllBch (senderMnemonic, receiverAddress) {
  try {
    const MNEMONIC = senderMnemonic
    const RECIEVER = receiverAddress
    const slpWallet = new BchWallet(MNEMONIC)
    await slpWallet.walletInfoPromise
    const balance = await slpWallet.getBalance()
    if (balance === 0) {
      return 701;
    }

    const txid = await slpWallet.sendAll(RECIEVER)

    return txid;
  } catch (err) {
    console.error('Error: ', err)
    return 700;
  }
}

app.get('/wallet/create', async (req, res) => {
if(req.query.pw === "uri_pw"){
	var wall = await createWallet();
	res.send(wall);
}
else {
	console.error("Error!")
	res.send('Error!')
}
})
app.get('/wallet/balance', async (req, res) => {
	try{
	if(req.query.cash != undefined && req.query.cash!=""){
	var walletInfo = {"cashAddress":req.query.cash};
	//var wall = await getBalance(walletInfo);
	var wall = await bitboxNetwork.getAllSlpBalancesAndUtxos(walletInfo.cashAddress);
	res.send(wall);
	}
	else res.send("0");
	} catch(err){
		console.error("req.query.cash bulunamadi",err)
		res.send("0");
	}
})
app.get('/wallet/simpleBalance', async (req, res) => {
	try{
	if(req.query.cash != undefined && req.query.cash!=""){
	var walletInfo = {"cashAddress":req.query.cash};
	//var wall = await getBalance(walletInfo);
	let wnet = await bitboxNetwork.getAllSlpBalancesAndUtxos(walletInfo.cashAddress);
	var wall = {"satoshis_available_bch":wnet.satoshis_available_bch}
	res.send(wall);
	}
	else res.send("0");
	} catch(err){
		console.error("req.query.cash bulunamadi",err)
		res.send("0");
	}
})
app.get('/wallet/sendBch', async (req, res) => {
	try{
	if(req.query.pw == "uri_pw" && req.query.mnemonic != undefined && req.query.mnemonic != null &&req.query.mnemonic != "" && req.query.rec != undefined && req.query.rec != null &&req.query.rec != "" && req.query.amount != undefined && req.query.amount != null &&req.query.amount != ""){
		
	console.error(JSON.stringify(req.query));
	
	var txid = await sendBch(req.query.mnemonic, req.query.rec, parseInt(req.query.amount));
	console.error(txid);
	res.status(200).send((txid).toString());
	//res.send(txid);
	}
	else res.send("0");
	} catch(err){
		console.error("sendbch error:",err)
		res.send("0");
	}
})

app.get('/wallet/sendToken', async (req, res) => {
	try{
		console.error(JSON.stringify(req.query));
	if(req.query.pw == "uri_pw" && req.query.mnemonic != undefined && req.query.mnemonic != null &&req.query.mnemonic != "" && req.query.rec != undefined && req.query.rec != null &&req.query.rec != "" && req.query.tokenid != undefined && req.query.tokenid != null &&req.query.tokenid != ""){
	console.error(JSON.stringify(req.query));
	var txid = await sendToken(req.query.mnemonic, req.query.rec, req.query.tokenid);
	console.error("tokentxid:"+txid);
	res.status(200).send((txid).toString());
	//res.send(txid);
	}
	else res.send("0");
	} catch(err){
		console.error("sendtoken error:",err)
		res.send("0");
	}
})
app.get('/wallet/burnToken', async (req, res) => {
	try{
		console.error(JSON.stringify(req.query));
	if(req.query.pw == "uri_pw" && req.query.mnemonic != undefined && req.query.mnemonic != null &&req.query.mnemonic != "" && req.query.tokenid != undefined && req.query.tokenid != null &&req.query.tokenid != ""){
	console.error(JSON.stringify(req.query));
	var txid = await burnToken(req.query.mnemonic, req.query.tokenid);
	console.error("tokentxid:"+txid);
	res.status(200).send((txid).toString());
	//res.send(txid);
	}
	else res.send("0");
	} catch(err){
		console.error("burntoken error:",err)
		res.send("0");
	}
})
app.get('/wallet/sendAllBch', async (req, res) => {
	try{
	if(req.query.pw == "uri_pw" && req.query.mnemonic != undefined && req.query.mnemonic != null &&req.query.mnemonic != "" && req.query.rec != undefined && req.query.rec != null &&req.query.rec != ""){
		
	console.error(JSON.stringify(req.query));
	
	var txid = await sendAllBch(req.query.mnemonic, req.query.rec);
	console.error(txid);
	res.status(200).send((txid).toString());
	//res.send(txid);
	}
	else res.send("0");
	} catch(err){
		console.error("sendAllbch error:",err)
		res.send("0");
	}
})
app.get('/wallet/test', async (req, res) => {
	try{
	if(req.query.pw == "uri_pw" && req.query.mnemonic != undefined && req.query.mnemonic != null &&req.query.mnemonic != "" && req.query.rec != undefined && req.query.rec != null &&req.query.rec != ""){

	var txid = await sendBch(req.query.mnemonic, req.query.rec, 612);
	console.error(txid);
	res.status(200).send((txid).toString());
	//res.send(JSON.stringify(req.query));
	}
	else res.send("0");
	} catch(err){
		console.error("sendtoken error:",err)
		res.send("0");
	}
})
app.get('/wallet/faucetCount', async (req, res) => {
	try{
let counts = await getFaucetCount("FAUCET_SLP_ADDRESS", "PARENT_TOKEN_ID");
res.send(JSON.stringify({faucetCount:counts}));
	}
	catch(exp){
		console.error("faucetCount:",exp);
		res.send("0");
	}
})
app.get('/wallet/lootboxCount', async (req, res) => {
	try{
let counts = await getFaucetCount("LOOTBOX_SLP_ADDRESS", "PARENT_TOKEN_ID");
res.send(JSON.stringify({lootboxCount:counts}));
	}
	catch(exp){
		console.error("lootboxCount:",exp);
		res.send("0");
	}
})

app.listen(port, () => {
  console.log(`TICK Wallet app listening at localhost:${port}`)
})