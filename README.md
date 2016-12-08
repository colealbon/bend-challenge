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
navigate to localhost:3000 (or port settings from config/options.js)

# task list   
* <s>Package.json identifying package dependencies from npm.</s>
* <s>install Express.js</s>
* <s>install Mocha</s>* <s>install Mongoose</s>* <s>install Mockgoose</s>
* <s>POST /order validate order parameters</s>
* <s>install fake json server https://github.com/typicode/json-server</s>
* <s>ACME Autos submit order</s>
* <s>Rainer submit order</s>
* persist completed order to mongo
* GET /orders orders report from mongo
* install JWT middleware (or document as approach to prevent external users)
* split routes/order.js functions into library for more granular unit testing.
* placeOrderXXX functions should't try to validate <b>and</b> submit.  refactor to separate functs.
