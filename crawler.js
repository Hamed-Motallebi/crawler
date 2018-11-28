var MongoDB = require('mongodb').MongoClient,
    cheerio = require('cheerio'),
    http = require('https'),
    tools = require('./tools'),
    collection, databaseCrawler,
    dateString = '2013-04-28',
    urlBase = 'https://coinmarketcap.com/historical/';

var fetch = (url) => {
    console.log('Start fetching...', url);
    return new Promise((resolve, reject) => {
        var request = http.get(url, (res) => {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                // console.log(chunk);
                body += chunk;
            });

            res.on('end', () => {
                resolve(body);
            });
        });

        request.on('error', function (err) {
            reject(err);
        })
    });
};


var process = (url) => {
    fetch(url)
        .then((body) => {
            $ = cheerio.load(body);
            var docs = [];
            var date = new Date(`${url.slice(-9, -5)}-${url.slice(-5, -3)}-${url.slice(-3, -1)}`);

            $('#currencies-all > tbody > tr')
                .each(function (i, n) {
                    var $row = $(n);

                    docs.push({
                        // row: i + 1,
                        // row: $row.find('td:first-child').text().replace(/\n/g, ''),
                        name: $row.find('td.currency-name > a').text().replace(/\n/g, ''),
                        symbol: $row.find('td.col-symbol').text().replace(/\n/g, ''),
                        market_cap: $row.find('td.market-cap').text().replace(/\n/g, ''),
                        price: $row.find('td:nth-child(5) > a').text().replace(/\n/g, ''),
                        circulating_supply: $row.find('td.circulating-supply > span').text().replace(/\n/g, ''),
                        '1h': $row.find('td:nth-child(8)').text().replace(/\n/g, ''),
                        '24h': $row.find('td:nth-child(9)').text().replace(/\n/g, ''),
                        '7d': $row.find('td:nth-child(10)').text().replace(/\n/g, ''),
                        date: date
                    });
                });

            console.log(`DOM ${date}`);
            return Promise.all([docs, date]);
        })
        .then(res => {
            if (res[0]) {
                return Promise.all([collection.insertMany(res[0]), res[1]]);
            }
            else reject('no data...');
        })
        .then(res => {
            console.log('inserted...', res[1]);
        });
};

var process1 = (url) => {
    console.log('Start processing...', url);
    fetch(url)
        .then((body) => {
            $ = cheerio.load(body);
            var docs = [];
            var date = new Date(dateString);

            $('#currencies-all > tbody > tr')
                .each(function (i, n) {
                    var $row = $(n);

                    docs.push({
                        name: $row.find('td.currency-name > a').text().replace(/\n/g, ''),
                        symbol: $row.find('td.col-symbol').text().replace(/\n/g, ''),
                        market_cap: $row.find('td.market-cap').text().replace(/\n/g, ''),
                        price: $row.find('td:nth-child(5) > a').text().replace(/\n/g, ''),
                        circulating_supply: $row.find('td.circulating-supply > span').text().replace(/\n/g, ''),
                        '1h': $row.find('td:nth-child(8)').text().replace(/\n/g, ''),
                        '24h': $row.find('td:nth-child(9)').text().replace(/\n/g, ''),
                        '7d': $row.find('td:nth-child(10)').text().replace(/\n/g, ''),
                        date: date
                    });
                });

            console.log(`DOM ${date}`);
            return Promise.all([docs, date]);
        })
        .then(res => {
            if (res[0]) {
                return Promise.all([collection.insertMany(res[0]), res[1]]);
            }
            else reject('no data...');
        })
        .then(res => {
            console.log('inserted...', res[1]);
            var processDate = new Date(dateString);
            processDate.setDate(processDate.getDate() + 1);
            dateString = tools.datePart(processDate, 'T');
            main();
        })
        .catch(err => {
            console.log(err);
            main();
        });
};

async function main() {
    // var urls = [];
    console.log('dateString', dateString);
    var d = new Date(dateString);
    var today = new Date();
    // while (d <= today) {
    //     urls.push(`${urlBase}${(tools.datePartNumber(d, 'T'))}/`);
    //     d.setDate(d.getDate() + 1);
    // }

    // await Promise.all(urls.map(async (url) => {
    //     await process(url);
    //     console.log(url)
    // }));

    if (d <= today) {
        setTimeout(() => {
            var url = `${urlBase}${(tools.datePartNumber(d, 'T'))}/`;
            process1(url);
        }, 3000);
    } else {
        console.log('End Process...');
    }
}

(async function () {
    var mongoConnection = await MongoDB.connect('mongodb://54a9be9c46756d7c0e7093b535ba9960:q1w2e3r4t5@9a.mongo.evennode.com:27017/54a9be9c46756d7c0e7093b535ba9960', {useNewUrlParser: true});
    databaseCrawler = mongoConnection.db('54a9be9c46756d7c0e7093b535ba9960');
    collection = databaseCrawler.collection('coinmarketcap');
    main();
})();