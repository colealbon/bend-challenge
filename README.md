# bend-challenge
a project to assess competence

# installation
```
git clone https://github.com/colealbon/bend-challenge.git
cd bend-challenge;
npm install;
# (modify config/options.js if needed)
npm test;
npm start; ( or npm run livereload for development)
```

# usage   
this is an api.  See javascript files in the test folder for example fetch operations.

# task list   
* <s>Package.json identifying package dependencies from npm.</s>
* <s>install Express.js</s>
* <s>install Mocha</s>* <s>POST /order validate order parameters</s>
* <s>install fake json server https://github.com/typicode/json-server</s>
* <s>ACME Autos submit order</s>
* <s>Rainer submit order</s>
* <s>install Mongoose</s>
* <s>install Mockgoose</s>
* <s>persist completed order to mongo</s>
* <s>refactor: move mongoose schema definition to models folder</s>
* <s>refactor: move mongo helper functions to lib folder</s>
* <s>GET /orders orders report from mongo</s>
* ACME Content Type: xwwwformurlencoded
* ACME Parameters:   api_key="cascade.53bce4f1dfa0fe8e7ca126f91b3 5d3a6"
* RANIER GET /nonce_token   Parameters:   storefront="ccasbb9630c04f"
* RANIER token="ff6bfd673ab6ae03d8911"
* install JWT middleware (or document as approach to prevent external users)
* split routes/order.js functions into library for more granular unit testing.
* placeOrderXXX functions should't try to validate <b>and</b> submit.  refactor to separate functs.
* don't use relative paths.  use "node root folder function"
