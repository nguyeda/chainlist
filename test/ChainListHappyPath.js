const ChainList = artifacts.require('./ChainList.sol');

contract('ChainList', accounts => {
    const seller = accounts[1];
    const buyer = accounts[2];
    const articleName1 = 'article 1';
    const articleDescription1 = 'Description for article 1';
    const articlePrice1 = 10;

    const articleName2 = 'article 2';
    const articleDescription2 = 'Description for article 2';
    const articlePrice2 = 20;

    it('should be initialized with empty values', () => {
        let chainListInstance;
        return ChainList.deployed()
            .then(instance => chainListInstance = instance)
            .then(() => chainListInstance.getArticlesCount())
            .then(count => {
                assert.equal(count.toNumber(), 0, 'article count should be 0');
            })
            .then(() => chainListInstance.getArticlesForSale())
            .then(data => {
                assert.equal(data.length, 0, 'there shouldn\'t be any article for sale')
            });
    });

    it('should sell a first article', () => {
        let chainListInstance;
        return ChainList.deployed()
            .then(instance => chainListInstance = instance)
            .then(() => chainListInstance.sellArticle(
                articleName1, articleDescription1, web3.toWei(articlePrice1, 'ether'), {from: seller}))
            .then(receipt => {
                assert.equal(receipt.logs.length, 1, 'one event has been triggered');
                assert.equal(receipt.logs[0].event, 'LogSellArticle');
                assert.equal(receipt.logs[0].args._id.toNumber(), 1, `article id must be 1`);
                assert.equal(receipt.logs[0].args._seller, seller, `seller must be ${seller}`);
                assert.equal(receipt.logs[0].args._name, articleName1, `article name must ben ${articleName1}`);
                assert.equal(receipt.logs[0].args._price, web3.toWei(articlePrice1, 'ether'), `article price must be ${articlePrice1}`);
            })
            .then(() => chainListInstance.getArticlesCount())
            .then(count => assert.equal(count.toNumber(), 1, 'article count should be 1'))
            .then(() => chainListInstance.getArticlesForSale())
            .then(data => {
                assert.equal(data.length, 1, 'there must be 1 article for sale');
                assert.equal(data[0].toNumber(), 1, 'article id should be 1');
            })
            .then(() => chainListInstance.articles(1))
            .then(data => {
                assert.equal(data[0].toNumber(), 1, `article id must be 1`);
                assert.equal(data[1], seller, `seller must be ${seller}`);
                assert.equal(data[2], 0x0, `buyer must be empty`);
                assert.equal(data[3], articleName1, `article name must be ${articleName1}`);
                assert.equal(data[4], articleDescription1, `article description must be ${articleDescription1}`);
                assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, 'ether'), `article price must be ${articlePrice1}`);
            });
    });

    it('should sell a second article', () => {
        let chainListInstance;
        return ChainList.deployed()
            .then(instance => chainListInstance = instance)
            .then(() => chainListInstance.sellArticle(
                articleName2, articleDescription2, web3.toWei(articlePrice2, 'ether'), {from: seller}))
            .then(receipt => {
                assert.equal(receipt.logs.length, 1, 'one event has been triggered');
                assert.equal(receipt.logs[0].event, 'LogSellArticle');
                assert.equal(receipt.logs[0].args._id.toNumber(), 2, `article id must be 1`);
                assert.equal(receipt.logs[0].args._seller, seller, `seller must be ${seller}`);
                assert.equal(receipt.logs[0].args._name, articleName2, `article name must ben ${articleName2}`);
                assert.equal(receipt.logs[0].args._price, web3.toWei(articlePrice2, 'ether'), `article price must be ${articlePrice2}`);
            })
            .then(() => chainListInstance.getArticlesCount())
            .then(count => assert.equal(count.toNumber(), 2, 'article count should be 2'))
            .then(() => chainListInstance.getArticlesForSale())
            .then(data => {
                assert.equal(data.length, 2, 'there must be 2 articles for sale');
                assert.equal(data[0].toNumber(), 1, 'first article id should be 2');
                assert.equal(data[1].toNumber(), 2, 'second article id should be 2');
            })
            .then(() => chainListInstance.articles(1))
            .then(data => {
                assert.equal(data[0].toNumber(), 1, `article id must be 1`);
                assert.equal(data[1], seller, `seller must be ${seller}`);
                assert.equal(data[2], 0x0, `buyer must be empty`);
                assert.equal(data[3], articleName1, `article name must be ${articleName1}`);
                assert.equal(data[4], articleDescription1, `article description must be ${articleDescription1}`);
                assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, 'ether'), `article price must be ${articlePrice1}`);
            })
            .then(() => chainListInstance.articles(2))
            .then(data => {
                assert.equal(data[0].toNumber(), 2, `article id must be 1`);
                assert.equal(data[1], seller, `seller must be ${seller}`);
                assert.equal(data[2], 0x0, `buyer must be empty`);
                assert.equal(data[3], articleName2, `article name must be ${articleName2}`);
                assert.equal(data[4], articleDescription2, `article description must be ${articleDescription2}`);
                assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, 'ether'), `article price must be ${articlePrice2}`);
            });
    });

    it('should buy an article', () => {
        let chainListInstance;
        const sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), 'ether').toNumber();
        const buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), 'ether').toNumber();
        return ChainList.deployed()
            .then(instance => chainListInstance = instance)
            .then(() => chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice1, 'ether')}))
            .then(receipt => {
                assert.equal(receipt.logs.length, 1, 'one event should have been triggered');
                assert.equal(receipt.logs[0].event, 'LogBuyArticle');
                assert.equal(receipt.logs[0].args._id, 1, `article id must be 1`);
                assert.equal(receipt.logs[0].args._seller, seller, `seller must be ${seller}`);
                assert.equal(receipt.logs[0].args._buyer, buyer, `buyer must be ${buyer}`);
                assert.equal(receipt.logs[0].args._name, articleName1, `article name must ben ${articleName1}`);
                assert.equal(receipt.logs[0].args._price, web3.toWei(articlePrice1, 'ether'), `article price must be ${articlePrice1}`);

                const sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), 'ether').toNumber();
                const buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), 'ether').toNumber();
                assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, `seller should have earned ${articlePrice1}`);
                assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, `buyer should have paid ${articlePrice1}`);
            })
            .then(() => chainListInstance.getArticlesCount())
            .then(count => assert.equal(count.toNumber(), 2, 'article count should be 2'))
            .then(() => chainListInstance.getArticlesForSale())
            .then(data => {
                assert.equal(data.length, 1, 'there must be 1 article for sale');
                assert.equal(data[0].toNumber(), 2, 'article id should be 2');
            })
            .then(() => chainListInstance.articles(1))
            .then(data => {
                assert.equal(data[0].toNumber(), 1, `article id must be 1`);
                assert.equal(data[1], seller, `seller must be ${seller}`);
                assert.equal(data[2], buyer, `buyer must be ${buyer}`);
                assert.equal(data[3], articleName1, `article name must be ${articleName1}`);
                assert.equal(data[4], articleDescription1, `article description must be ${articleDescription1}`);
                assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, 'ether'), `article price must be ${articlePrice1}`);
            })
            .then(() => chainListInstance.articles(2))
            .then(data => {
                assert.equal(data[0].toNumber(), 2, `article id must be 1`);
                assert.equal(data[1], seller, `seller must be ${seller}`);
                assert.equal(data[2], 0x0, `buyer must be empty`);
                assert.equal(data[3], articleName2, `article name must be ${articleName2}`);
                assert.equal(data[4], articleDescription2, `article description must be ${articleDescription2}`);
                assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, 'ether'), `article price must be ${articlePrice2}`);
            });
    });
});
