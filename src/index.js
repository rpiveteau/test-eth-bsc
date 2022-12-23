const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const bip39 = require('bip39');
const fs = require('fs');

const providers = {
    bsc: "https://bsc-dataseed.binance.org/",
    eth: "https://mainnet.infura.io/v3/b75e1aaacf2148278272bb28e044c2d9",
    tron: "https://api.trongrid.io/v1/",
}

const ENGLISH_WORDLIST = require('./words/english.json');
const ADDRESS_FILE_DIR = "./src/addresses";
const startTime = Date.now() / 1000;

let found = 0;
let tries = 0;

const getRandIndex = (max = 2048) => {
    return Math.round((Math.random() * 10 * max) / 10)
}

function saveAddress({addr, mnemonic, chain, bal}) {
    fs.writeFileSync(`${ADDRESS_FILE_DIR}/${chain}/${addr}.json`, JSON.stringify({
        mnemonic, addr, chain
    }));
}

async function checkWallet({mnemonic}) {
    try {
        const providerBSC = new HDWalletProvider({mnemonic, providerOrUrl: providers.bsc});
        const providerETH = new HDWalletProvider({mnemonic, providerOrUrl: providers.eth});
        const walletAddresses = providerETH.getAddresses();
        const ethWeb3 = new Web3(providerETH);
        const bscWeb3 = new Web3(providerBSC);

        return walletAddresses.forEach(async (addr) => {
            const balances = {
                eth: await ethWeb3.eth.getBalance(addr),
                bsc: await bscWeb3.eth.getBalance(addr)
            }
            if (balances.bsc != 0) {
                (console.log(`${++found} balances with mnemo: "${mnemonic}"`, `Bal: ${balances.bsc}`));
                saveAddress({mnemonic, chain: "BSC", addr, bal: balances.bsc});
            }
            if (balances.eth != 0) {
                (console.log(`${++found} balances with mnemo: "${mnemonic}"`, `Bal: ${balances.eth}`));
                saveAddress({mnemonic, chain: "ETH", addr, bal: balances.eth});
            }
        })
    } catch(e) {
        console.log("Invalid mnemonic:", mnemonic)
    }
}

function getValidMemo() {
    let mnemo = `${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]}`;
    while(!bip39.validateMnemonic(mnemo)) {
        mnemo = `${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]} ${ENGLISH_WORDLIST[getRandIndex()]}`;
    }
    return mnemo;
}

function run() {
    // level slam cross begin smooth sorry trial busy finish describe fetch vault
    const mnemonic = getValidMemo();
    checkWallet({
        mnemonic
    })

    if (!(++tries % 10)) {
        console.log(`${tries} in ${((Date.now() / 1000) - startTime).toFixed(2)}s with ${found} results`)
    }
}

setInterval(run, 50)