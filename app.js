const conseiljs = require('conseiljs');
const softsigner = require('conseiljs-softsigner');
const fetch = require('node-fetch');
const log = require('loglevel');
const logger = log.getLogger('conseiljs');
logger.setLevel('ERROR',true);
conseiljs.registerLogger(logger);
conseiljs.registerFetch(fetch);
const tezosNode = 'https://carthagenet.smartpy.io';

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const TezosDomainClient = require('@tezos-domains/client');
const Taquito = require('@taquito/taquito');


Taquito.Tezos.setRpcProvider('https://carthagenet.smartpy.io');
const DomainNameResolver = new TezosDomainClient.TezosDomainsClient({ network: 'carthagenet', caching: { enabled: true } });

const keystore = {
    publicKey: 'edpkukocydHK4BwwZUrRmhT4JGNg1wRVqcgnc7hWYYg2YHuLDqQMib',
    privateKey: 'edskRkWyj8xhpUv8ge1B3hQHGki2AtvFox86AVKbftajP7t6Sd3npdGdAYDdpZvoqbvTn5vi1ytFL58B4RmHN7oeQAEh695C3Y',
    publicKeyHash: 'tz1a4UNywaxaAfh2LRBP2UugQTeCVcLCn5Sa',
    seed: '',
    storeType: conseiljs.KeyStoreType.Fundraiser
};

const resolveAndTransfer = async (domain,amount) => {
    const signer = await softsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keystore.privateKey,'edsk'));
    DomainNameResolver.resolver.resolve(domain)
        .then(receiverAddress => {
            return conseiljs.TezosNodeWriter.sendTransactionOperation(tezosNode,signer,keystore,receiverAddress.address,amount,100000,-1)
        })
        .then( operationResponse => {
            console.log('Transfer Successfull : ' , operationResponse.operationGroupID);
            
        })
        .catch(err => {
            console.log(err);
            
        })
}

rl.question('To whom you want to send tez ? ', receiver => {
    rl.question('How much ? ' , amount => {
        resolveAndTransfer(receiver , amount);
        rl.close();
    })
})
