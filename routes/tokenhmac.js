




// PASTED FROM cole's sophmoric working example of how to pull data from behind a JWT token
// https://github.com/colealbon/localbitcoins-analytics/blob/master/lbc-transaction-reports.js
// IT IS PROBABLY  NOT FUNCTIONAL HERE BECAUSE IT USES GENERATORS (NOT ASYNC/AWAIT)

function* generateHmac (message, secretkey, algorithm, encoding) {
    return crypto.createHmac(algorithm, secretkey).update(message).digest(encoding)
}

function* buildHmacMessage (the_nonce, api_key, pathname, query) {
    query = query || ''
    var message = the_nonce + api_key + pathname + query
    return message
}

function* buildOptions ( api_key, the_nonce, target_url, api_secret, algorithm, encoding) {
    var url = require("url");
    var urlobj = url.parse(target_url)
    var pathname = urlobj.pathname
    var query = urlobj.query
    return {
        url: target_url,
        "headers": {
            "Apiauth-Key": api_key,
            "Apiauth-Nonce": the_nonce,
            "Apiauth-Signature": yield generateHmac ( yield buildHmacMessage(the_nonce, api_key, pathname, query), api_secret, algorithm, encoding)
            },
        "form": {
        }
    }
}

//// download paginated transactions from localbitcoins.com
co(function* () {  //author doesn't know if "co" non-blocking something-or-other is helping
    console.log('please wait: downloading all transactions from localbitcoins')
    // obtain read only api key from your localbitcoins account and put it in ./config/options.js
    var api_key = config.lbc_readonly_api_key
    var api_secret = config.lbc_readonly_api_secret
    var target_url = 'https://localbitcoins.com/api/dashboard/released/'

    var algorithm = 'sha256'
    var encoding = 'hex'
    while (target_url != null) {
        var the_nonce = nonce() * 10
        var options = yield buildOptions( api_key, the_nonce, target_url, api_secret, algorithm, encoding)
        var result = yield request(options)
        var response = result
        var next_page = yield JSON.parse( response.body ).pagination
        if ( next_page.next != '')  {
            target_url = next_page.next
            thepayload.push(JSON.parse(response.body))
        }
        else
        {
            thepayload.push(JSON.parse(response.body))
            console.log(response.body)
        }
    }
