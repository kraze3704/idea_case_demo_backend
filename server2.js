/*  No need to be able to create this back-end, just
    be able to read it for understanding how the 
    client must call it and what can it expect as response!

    server2.js, where the back-end is defined.

   1. First the modules it needs in its web services,
   2. Then the web services defined: URL pattern => handler function, 
   3. And at the end, starting the server and 
      making it to listen to port 80

   To start the web server for real, we need to run this
   command on server command line, in the folder of this file:
   > sudo node server2.js
 */

// > sudo npm install --save express          or -g mean-cli instead of --save express  + mean init yourNewApp
// (In your node server project folder, where you run "sudo node server.js" or same plus "sudo node server.js&")
var express = require('express');
var app = express();

// > sudo npm install --save fs    // Or was the npm install command needed for this package nowadays? 
var fs = require("fs");

// > sudo npm install --save body-parser    // Or was the npm install command needed for this package nowadays? 
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// > sudo npm install --save jsonfile       // This command was needed 
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

// Above commands for setting up the required modules, settings and headers!!!
// At the bottom of this file is the server starting function!!!

// Now follow the action functions that register to handle certain URL patterns

// 0 0 0 0 0 0 0 0 0 0
// Here the app.get will be executed when server started with: "sudo node server2.js" or 
// "sudo node server2.js&". When thid will be run it will register a event handler 
// function to be run AFTER client has sent a request with the URL '/hello'.
// So JavaScriptish way part of the code below will be run directly, part is definition
// of code that WILL be run LATER if an event will happen. E.g. System will do a 
// call-back or relay a button click to us.

app.get('/hello', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Hello World from Node.js Back-end");
});

// 1 1 1 1 1 1 1 1 1 1
app.get('/person', function (req, res) {
    var i;
    for (i = 0; i < 9; i = i + 1)   //  To slow dow change 9 to e.g. 99999999 or 999999999. That is 8 or 9 digits of 9:s
    {
        // !!! We should NEVER do that in school / any other shared server as it will make the server super-busy!!!
    }
    fs.readFile(__dirname + "/" + "person.json", 'utf8', function (err, data) {
        // console.log(data);   // ZZZZZ
        res.end(data);
    });
})

// 2 2 2 2 2 2 2 2 2 2
app.get('/listPlayers', function (req, res) {
    fs.readFile(__dirname + "/" + "players.json", 'utf8', function (err, data) {
        // console.log(data);   // ZZZZZ
        res.end(data);
    });
})

// 3 3 3 3 3 3 3 3 3 3   GET
app.get('/addPlayer', function (req, res) {
    var name = req.query.name;
    var points = req.query.points;
    console.log("Adding with GET - name: " + name + " points: " + points);   // ZZZZZ
    var returnValue = addPlayer(name, points);
    res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
    res.end(returnValue.HttpStatusCode + " " + returnValue.Message.toString());
})

// 3 3 3 3 3 3 3 3 3 3   POST
app.post('/addPlayer', function (req, res) {
    var name = req.body.name;
    var points = req.body.points;
    console.log("Adding with POST - name: " + name + " points: " + points);   // ZZZZZ
    var returnValue = addPlayer(name, points);
    res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
    res.end(returnValue.HttpStatusCode + " " + returnValue.Message.toString());
})

// 4 4 4 4 4 4 4 4 4 4
app.post('/findPlayer', function (req, res) {
    var name = req.body.name;
    console.log("Find/Search using this name: " + name);  // ZZZZZ
    "use strict";
    var returnValue;
    var index;
    var found = false;
    var array = [];
    var filePath = __dirname + "/" + "players.json";
    // console.log(filePath);   // ZZZZZ

    if (!name || name.length === 0) {
        returnValue = { "HttpStatusCode": "400", "Message": "Name cannot be empty!" };
        res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
        res.end(returnValue.Message.toString());
    } else {
        // array = getPlayerListStatic();   // Would work, but with hard-coded array written in JS

        // No 'Sync' here => Async, = good for performance
        jsonfile.readFile(filePath, function (err, obj) {
            array = obj;
            console.dir(array);   // ZZZZZ, console.dir is nice way to print complicated objects, like arrays
            for (index = 0; index < array.length; index = index + 1) {
                console.log("Array index: " + index);   // ZZZZZ
                if (array[index].name == name) {
                    found = true;
                    returnValue = {
                        "HttpStatusCode": "200",
                        "Message": "Ok, see Data",
                        "Data": { "name": name, "points": array[index].points }
                    };
                    break;
                }
            }

            if (found) {
                res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify(returnValue.Data));  // If found, just writing back the JSON
            } else {
                returnValue = { "HttpStatusCode": "404", "Message": "Name " + name + " not found!" };

                res.writeHead(Number(returnValue.HttpStatusCode), { 'Content-Type': 'text/plain' });
                res.end(returnValue.HttpStatusCode + " " + returnValue.Message.toString());
            }
        });
    }
});

// Works but now objects are hard-coded in the JavaScript, it's better read then from file system
// UNLESS they are something of 'never' changing nature. Like parts/rules of a board game. 
// In our case here this would not be too good an idea to hard-code like this:
function getPlayerListStatic() {
    var array = [];

    jsObj = [{ "name": "Alfred", "points": 11 },
    { "name": "Bertha", "points": 22 },
    { "name": "Cecilia", "points": 3 },
    { "name": "David", "points": 4 }];
    console.log(Array.isArray(jsObj));  // ZZZZZ usually gives false if using files

    for (var item in jsObj) {
        array.push(jsObj[item]);
    }

    return array;
}

function addPlayer(name, points) {
    "use strict";
    var returnValue;
    if (points !== 0 && !points) {
        returnValue = { "HttpStatusCode": "400", "Message": "Error: Points cannot be missing!" };
    } else if (points < 0) {
        returnValue = { "HttpStatusCode": "400", "Message": "Error: Points cannot be below zero!" };
    } else if (!name || name.length === 0) {
        returnValue = { "HttpStatusCode": "400", "Message": "Error: Name cannot be empty!" };
    } else {
        switch (name) {
            case 'Alfred':
                returnValue = { "HttpStatusCode": "409", "Message": "Error: Alfred already in database!" };
                break;
            case 'Errol':
                returnValue = { "HttpStatusCode": "500", "Message": "Error: Some server error inserting Errol!" };
                break;
            case 'Conrad':
                returnValue = { "HttpStatusCode": "502", "Message": "Error: Connection to secondary server could not be established for Conrad!" };
                break;
            case 'Deborah':
                returnValue = { "HttpStatusCode": "503", "Message": "Error: Database not available for Deborah!" };
                break;
            default:
                returnValue = { "HttpStatusCode": "200", "Message": name + ", " + points + " added OK!" };

                const file = __dirname + "/" + "players.json";
                const newPlayer = { name: name, points: points };
                //        console.log(newPlayer);

                // this method doesn't work as intended, need to fetch the array and add to the array, not append to json file
                /*
                jsonfile.writeFile(jsonFile, newPlayer, { flag: 'a' }, function (err) {
                    if (err)
                        console.error(err);
                })
                */
                jsonfile.readFile(file)
                    .then(obj => { obj.push(newPlayer); return obj })
                    .then(newJSON => jsonfile.writeFile(file, newJSON, function (err) { if (err) console.error(err) }))
                    .catch(err => console.error(err));

                break;
        }
    }

    return returnValue;
}

/*
 * GET request to path /cateogry/idsByBudgetLimit
 * isAbove :: true -> > / false -> <=
 * budget limit given
 * return ids that matches the search
*/
app.get('/category/idsByBudgetLimit', function(req, res) {
    let budget = req.query.budget;
    let isAbove = req.query.above; // both parameters are String typess

    // change isAbove attribute to boolean if it is false
    if(isAbove == 'false')
        isAbove = false;

    console.log(`searching for ids that has budget ${isAbove ? "above" : "below"} ${budget}`);
    
    fs.readFile(__dirname + "/" + "category.json", 'utf8', function (err, data) {
        let categoryFiltered = [];
        let fullList = JSON.parse(data);

        if(isAbove) {
            fullList.map((category, index) => { if (category.budget > budget) categoryFiltered.push(fullList[index].name)});
        } else {
            fullList.map((category, index) => { if (category.budget <= budget) categoryFiltered.push(fullList[index].name)});
        }
        console.dir(categoryFiltered);

        res.end(JSON.stringify(categoryFiltered));
        }
    );

});

var server = app.listen(8080, function () {
    "use strict";
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});