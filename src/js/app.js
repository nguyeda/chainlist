App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    loading: false,

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');

        }
        web3 = new Web3(App.web3Provider);
        App.displayAccountInfo();

        return App.initContract();
    },

    displayAccountInfo: function () {
        web3.eth.getCoinbase(function (err, account) {
            if (!err) {
                App.account = account;
                $('#account').text(account);
                web3.eth.getBalance(account, function (err, balance) {
                    if (!err) {
                        $('#accountBalance').text(web3.fromWei(balance, 'ether') + ' ETH');
                    }
                });
            }

        });
    },

    initContract: function () {
        $.getJSON('ChainList.json', function (chainListArtifact) {
            App.contracts.ChainList = TruffleContract(chainListArtifact);
            App.contracts.ChainList.setProvider(App.web3Provider);
            App.listenToEvents();
            return App.reloadArticles();
        });
    },

    reloadArticles: function () {
        if (App.loading) {
            return;
        }
        App.loading = true;
        App.displayAccountInfo();
        $('#articlesRow').empty();

        var chainListInstance;
        App.contracts.ChainList.deployed()
            .then(function (instance) {
                chainListInstance = instance;
            })
            .then(function () {
                return chainListInstance.getArticlesForSale();
            })
            .then(function (articleIds) {
                return Promise.all(articleIds.map(function (articleId) {
                    return chainListInstance.articles(articleId.toNumber())
                }));
            })
            .then(function (articles) {
                articles.forEach(function (article) {
                    App.displayArticle(article[0].toNumber(), article[1], article[3], article[4],
                        web3.fromWei(article[5], 'ether'));
                });
            })
            .catch(function (err) {
                console.error(err.message);
            })
            .then(function () {
                App.loading = false;
            });
    },

    displayArticle: function(id, seller, name, description, price) {
        var articleTemplate = $('#articleTemplate');
        articleTemplate.find('.panel-title').text(name);
        articleTemplate.find('.article-description').text(description);
        articleTemplate.find('.article-price').text(price);
        articleTemplate.find('.btn-buy').attr('data-id', id);
        articleTemplate.find('.btn-buy').attr('data-value', price);

        if (seller == App.account) {
            articleTemplate.find('.article-seller').text('You');
            articleTemplate.find('.btn-buy').hide();
        } else {
            articleTemplate.find('.article-seller').text(seller);
            articleTemplate.find('.btn-buy').show();
        }

        $('#articlesRow').append(articleTemplate.html());
    },

    sellArticle: function () {
        var articleName = $('#article_name').val();
        var articleDescription = $('#article_description').val();
        var articlePrice = web3.toWei(parseFloat($('#article_price').val() || 0), 'ether');

        if (articleName.trim() === '' || articlePrice === 0) {
            // nothing to sell
            return false;
        }

        App.contracts.ChainList.deployed()
            .then(function (instance) {
                return instance.sellArticle(articleName, articleDescription, articlePrice, {
                    from: App.account,
                    gas: 500000,
                });
            })
            .catch(function (err) {
                console.error(err.message);
            });
    },

    listenToEvents: function () {
        console.log('init listener');

        App.contracts.ChainList.deployed().then(function (instance) {
            instance.LogSellArticle({}, {})
                .watch(function (error, event) {
                    if (!error) {
                        $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
                    } else {
                        console.error(error);
                    }
                    App.reloadArticles();
                });

            instance.LogBuyArticle({}, {})
                .watch(function (error, event) {
                    if (!error) {
                        $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought article</li>');
                    } else {
                        console.error(error);
                    }
                    App.reloadArticles();
                });
        });
    },

    buyArticle: function () {
        event.preventDefault();
        var id = parseFloat($(event.target).data('id'));
        var price = parseFloat($(event.target).data('value'));

        App.contracts.ChainList.deployed()
            .then(function (instance) {
                return instance.buyArticle(id, {from: App.account, value: web3.toWei(price, 'ether'), gas: 500000});
            })
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
