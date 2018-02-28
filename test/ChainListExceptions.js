const ChainList = artifacts.require('./ChainList.sol');

contract('ChainList', accounts => {
    const seller = accounts[1];
    const buyer = accounts[2];
    const articleName1 = 'article 1';
    const articleDescription1 = 'Description for article 1';
    const articlePrice1 = 10;

    it('should throw an exception when buying and no article is defined', () => {
        let chainListInstance;
        return ChainList.deployed()
            .then(instance => {
                chainListInstance = instance;
            })
            .then(() => chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice1, 'ether')}))
            .then(assert.fail)
            .catch(() => assert(true))
            .then(() => chainListInstance.getArticlesCount())
            .then(data => {
                assert.equal(data.toNumber(), 0, 'article count should be 0')
                // assert.equal(data[0], 0x0, 'seller must be empty');
                // assert.equal(data[1], 0x0, 'buyer must be empty');
                // assert.equal(data[2], '', 'article name must be empty');
                // assert.equal(data[3], '', 'article description must be empty');
                // assert.equal(data[4].toNumber(), 0, 'article price must be zero');
            });
    });

    it('should fail when you buy your own article', () => {
        let chainListInstance;
        return ChainList.deployed()
            .then(instance => {
                chainListInstance = instance;
            })
            .then(() => chainListInstance.sellArticle(
                articleName1, articleDescription1, web3.toWei(articlePrice1, 'ether'), {from: seller}))
            .then(() => chainListInstance.buyArticle(1, {from: seller, value: web3.toWei(articlePrice1, 'ether')}))
            .then(assert.fail)
            .catch(() => assert(true))
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

    it ('should throw an error if article is not found', () => {
        let chainListInstance;
        return ChainList.deployed()
            .then(instance => {
                chainListInstance = instance;
            })
            .then(() => chainListInstance.buyArticle(99, {from: seller, value: web3.toWei(articlePrice1, 'ether')}))
            .then(assert.fail)
            .catch(() => assert(true))
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

    it('should fail when you buy with incorrect price', () => {
        let chainListInstance;
        return ChainList.deployed()
            .then(instance => {
                chainListInstance = instance;
            })
            .then(() => chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice1 - 1, 'ether')}))
            .then(assert.fail)
            .catch(() => assert(true))
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

    it('should fail when you buy an article already sold', () => {
        let chainListInstance;
        return ChainList.deployed()
            .then(instance => {
                chainListInstance = instance;
            })
            .then(() => chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice1, 'ether')}))
            .then(() => chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice1, 'ether')}))
            .then(assert.fail)
            .catch(() => assert(true))
            .then(() => chainListInstance.articles(1))
            .then(data => {
                assert.equal(data[0].toNumber(), 1, `article id must be 1`);
                assert.equal(data[1], seller, `seller must be ${seller}`);
                assert.equal(data[2], buyer, `buyer must be ${buyer}`);
                assert.equal(data[3], articleName1, `article name must be ${articleName1}`);
                assert.equal(data[4], articleDescription1, `article description must be ${articleDescription1}`);
                assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, 'ether'), `article price must be ${articlePrice1}`);
            });
    });
});