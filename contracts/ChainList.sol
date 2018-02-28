pragma solidity ^0.4.18;

import './Ownable.sol';

contract ChainList is Ownable {
    struct Article {
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    mapping(uint => Article) public articles;
    uint articlesCounter = 0;

    event LogSellArticle(uint indexed _id, address indexed _seller, string _name, uint256 _price);
    event LogBuyArticle(uint indexed _id, address indexed _seller, address indexed _buyer, string _name, uint256 _price);

    function kill() public onlyOwner {
        selfdestruct(owner);
    }

    function sellArticle(string _name, string _description, uint256 _price) public {
        articlesCounter++;
        articles[articlesCounter] = Article(
            articlesCounter,
            msg.sender,
            0x0,
            _name,
            _description,
            _price
        );

        LogSellArticle(articlesCounter, msg.sender, _name, _price);
    }

    function getArticlesCount() public view returns (uint) {
        return articlesCounter;
    }

    function getArticlesForSale() public view returns (uint[]) {
        uint[] memory articleIds = new uint[](articlesCounter);

        uint articlesForSaleCount = 0;
        for(uint i = 1; i <= articlesCounter; i++) {
            if (articles[i].buyer == 0x0) {
                articleIds[articlesForSaleCount] = articles[i].id;
                articlesForSaleCount++;
            }
        }

        uint[] memory forSale = new uint[](articlesForSaleCount);
        for (uint j= 0; j < articlesForSaleCount; j++) {
            forSale[j] = articleIds[j];
        }

        return forSale;
    }

    //    function getArticles() public view returns (
    //        address _seller,
    //        address _buyer,
    //        string _name,
    //        string _description,
    //        uint256 _price) {
    //        return (seller, buyer, name, description, price);
    //    }

    function buyArticle(uint _id) payable public {
        require(articlesCounter > 0);
        require(_id > 0 && _id <= articlesCounter);
        Article storage article = articles[_id];
        require(article.buyer == 0x0);
        require(msg.sender != article.seller);
        require(msg.value == article.price);

        article.buyer = msg.sender;
        article.seller.transfer(msg.value);
        LogBuyArticle(article.id, article.seller, article.buyer, article.name, article.price);
    }
}
