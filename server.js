var express = require('express');
var app = express();

var fs = require('fs');
// do i need fs?
var jsonfile = require('jsonfile');

app.use(function (req, res, next) {
    "use strict";
    // We need the following as you'll run HTML+JS+Ajax+jQuery on http://localhost, 
    // but service is taken from http://protoNNN.haaga-helia.fi (NNN is some number)
    // https://www.w3.org/TR/cors/#access-control-allow-origin-response-header
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// make a simple backend for the Categories frontend
// use .then() style promises

const FILEPATH = `${__dirname}/category.json`;

// 1.GET category/all => returns all categories as JSON
app.get("/category/all", function(req, res) {
    /* returns the file data, not json object
    fs.readFile(FILEPATH, 'utf8',
        function(err, data) {
            res.end(data);
        }
    );
    */
    jsonfile.readFile(FILEPATH, function(err, obj) {
        let JSON_STRING = JSON.stringify(obj);
        res.end(JSON_STRING);
    })
});

// 2.GET category?id={id} returns the category with id {id}
app.get("/category", function(req,res) {
    "use strict";
    let id = req.query.id;
    console.log(`searching for category id[${id}]`);

    let found = false;
    let returnValue = {
        "HttpStatusCode": "",
        "Message": "",
        "Data": "",
    };
    
    if(!id || id.length == 0) { // error handling for ID
        returnValue = {
            "HttpStatusCode": "400",
            "Message": "ID cannot be empty!",
        };
        res.writeHead(Number(returnValue.HttpStatusCode), { "Content-Type": "text/plain" });
        res.end(returnValue.Message.toString());
    } else { // search and return if category{id} exists
        jsonfile.readFile(FILEPATH, function(err, obj) {
            for(let i = 0; i<obj.length; i++) {
                console.log(`Index[i]: ${JSON.stringify(obj[i])}`);
                if(obj[i].id == id) {
                    found = true;
                    returnValue = {
                        "HttpStatusCode": "200",
                        "Message": "category found",
                        "Data": obj[i]
                    };
                    // console.dir(returnValue);
                    break; // exit loop if category is found
                }
            }
            if(found) {
                res.writeHead(Number(returnValue.HttpStatusCode), {"Content-type": "text/plain"});
                res.end(JSON.stringify(returnValue.Data));
            } else {
                returnValue = { "HttpStatusCode": "404", "Message": "Category not found"};
                res.writeHead(Number(returnValue.HttpStatusCode), {"Content-Type": "text/plain"});
                res.end(`${returnValue.HttpStatusCode} : ${returnValue.Message}`);
            }
        });
    }
//  res.end(`request query id: ${id}`);
});
// 3.POST category => sent category added to the server's JSON file (POST: name, budget, id?)
// 4.DELETE category?id={id} deletes the category with id {id}

var server = app.listen(8080, function() {
    console.log("app listening to port 8080")
});
