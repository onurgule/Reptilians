const BITBOX = require('bitbox-sdk').BITBOX
const { GrpcClient } = require('grpc-bchrpc-node')
const slpjs = require('slpjs')
const BigNumber = require('bignumber.js')
const bchaddr = require('bchaddrjs-slp')
const express = require('express')
const axios = require('axios');
const app = express()
const port = 3000

const fromSlpAddress = '#PARENTSLPADDRESS'
const fromWIF = ''
//bunlar geçersiz artık.
//console.error("add:"+fromSlpAddress);
const TOKENID = '#TOKENID';
const bitbox = new BITBOX({restURL: 'https://bchd.fountainhead.cash'})
const client = new GrpcClient({url: 'bchd.fountainhead.cash' })
const validator = new slpjs.BchdValidator(client, console)
const bchdNetwork = new slpjs.BchdNetwork({ BITBOX: bitbox, client, validator })
async function sendChildNFT (tokenId, to, from, fromWif,namem,tid) {
  try {
    const balances = await bchdNetwork.getAllSlpBalancesAndUtxos(from)
    let burnUtxo
    balances.slpTokenUtxos[tokenId].forEach(txo => {
      if (!burnUtxo && txo.slpUtxoJudgementAmount.isEqualTo(1)) {
        burnUtxo = txo
      }
    })
    // ...
    inputs = [burnUtxo, ...balances.nonSlpUtxos]
	inputs = inputs.filter(x=> x!== undefined)
	console.error(inputs);
    inputs.map(txo => txo.wif = fromWif)
    const name = namem
    const ticker = 'TICK'
    const documentUri = "uri"
    const documentHash = null

    const genesisTxid = await bchdNetwork.simpleNFT1ChildGenesis(
      tokenId,
      name,
      ticker,
      documentUri,
      documentHash,
      to,
      bchaddr.toCashAddress(from),
      inputs,
      true // allowBurnAnyAmount
    )
    //console.log(genesisTxid);
	return genesisTxid;
  } catch (error) {
    console.error('error in sendNFT: ', error)
  }
}
async function kurator (tokenId, to, from, fromWif) {
  try {
    const balances = await bchdNetwork.getAllSlpBalancesAndUtxos(from)
    let burnUtxo
    balances.slpTokenUtxos[tokenId].forEach(txo => {
      if (!burnUtxo && txo.slpUtxoJudgementAmount.isEqualTo(1)) {
        burnUtxo = txo
      }
    })
    // ...
    inputs = [burnUtxo, ...balances.nonSlpUtxos]
	inputs = inputs.filter(x=> x!== undefined)
	console.error(inputs);
    inputs.map(txo => txo.wif = fromWif)
	
	const genesisTxid = await bchdNetwork.simpleTokenMint(
      tokenId,
      2,
	  inputs,
      fromSlpAddress,
	  546,
	  fromSlpAddress,
	  fromSlpAddress // allowBurnAnyAmount
    )
	return genesisTxid;
  } catch (error) {
    console.error('error in sendNFT: ', error)
  }
}



app.get('/mine', async (req, res) => {
	if(req.query.name != undefined && req.query.name != null && req.query.tid != undefined && req.query.tid != null && req.query.too != undefined && req.query.too != null && req.query.type != null && req.query.type != undefined){
		//buraya yolla
		try{
		var too = req.query.too;
		var type = req.query.type;
		if(too.indexOf(":")==false) too = "simpleledger:"+too;
		var namem = req.query.name;
		var tid = req.query.tid;
		var fromslp = ""; //parent slp address
		var fromwif = ""; //parent wif 
		
	
		console.error("sendChildNFT("+TOKENID+", "+too+", "+fromslp+", "+fromwif+", "+namem+", "+tid+")");
		var tx = await sendChildNFT(TOKENID, too, fromslp, fromwif, namem, tid);
		//console.error("var tx="+tx);
		res.send(tx);
		} catch (error) {
    console.error('error2 in sendNFT: ', error)
			res.send('0');
  }
	}
	else{
		console.error("Empty!");
		res.send('0');
	
	}

})



app.listen(port, () => {
  console.log(`TICK app listening at localhost:${port}`)
})