
// #################################################################
// ## commands for setting up required modules, settings and headers

let express = require('express');
let app = express();

let fs = require('fs');
// do i need fs?
let jsonfile = require('jsonfile');

let bodyParser = require('body-parser')
app.use(bodyParser.json());              // for JSON-encoded body support
app.use(bodyParser.urlencoded({         // for url-encoded body support
    extended: true
}));

app.use(function (req, res, next) {
    "use strict";
    // We need the following as you'll run HTML+JS+Ajax+jQuery on http://localhost, 
    // but service is taken from http://protoNNN.haaga-helia.fi (NNN is some number)
    // https://www.w3.org/TR/cors/#access-control-allow-origin-response-header
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// ###################################################################
// ## server settings for each path starts below

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
    let returnValue = { "HttpStatusCode": "", "Message": "", "Data": "", };
    
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
function CategoryADD(name, budget) {
    "use strict";
    let returnValue = { "HttpStatusCode": "", "Message": "", "Data": "", };

    if( budget != 0 && !budget ) {
        returnValue = {
            "HttpStatusCode": "400",
            "Message": "error: Budget cannot be missing"
        };
    }else if( budget < 0 ) {
        returnValue = {
            "HttpStatusCode": "400",
            "Message": "error: Budget cannot be below zero"
        };
    }else if( !name || name.length == 0 ) {
        returnValue = {
            "HttpStatusCode": "400",
            "Message": "error: Name cannot be missing"
        };
    } else {
        returnValue = {
            "HttpStatusCode": "200",
            "Message": `[name:${name} budget:${budget}] added`
        };
        const newCategory = {
            id: '',
            name,
            budget
        }
        jsonfile.readFile(FILEPATH)
            .then(obj => {
                const SIZE = obj.length;
                let id = obj[SIZE - 1].id;
                id++;
                newCategory.id = id; // increment id and add to new category object

                obj.push(newCategory);
                return obj;
            }).then(obj => jsonfile.writeFile(FILEPATH, obj, function(err) { if(err) console.error(err) }))
            .catch(err => console.error(err));
    }

    return returnValue;
}

app.post("/categoryADD", function(req,res) {
    const name = req.body.name;
    const budget = req.body.budget;
    console.log(`Adding with POST: [name]${name}[budget]${budget}`);
    const returnValue = CategoryADD(name, budget);
    res.writeHead(Number(returnValue.HttpStatusCode), { "Content-Type": "text/plain" });
    res.end(`${returnValue.HttpStatusCode}: ${returnValue.Message}`);
});

// 4.DELETE category?id={id} deletes the category with id {id}
app.get("/categoryDELETE", function(req,res) {
    let id = req.query.id;
    console.log(`Deleting with GET: [id]${id}`);
    
    "use strict";
    let returnValue = { "HttpStatusCode": "", "Message": "", "Data": "", };
    let isFound = false;

    if(!id || id.length == 0) { // error handling for ID
        returnValue = {
            "HttpStatusCode": "400",
            "Message": "ID cannot be empty!",
        };
        res.writeHead(Number(returnValue.HttpStatusCode), { "Content-Type": "text/plain" });
        res.end(returnValue.Message.toString());
    } else {
        jsonfile.readFile(FILEPATH, function(err, obj){
            for( let i = 0 ; i < obj.length ; i++ ) {
                if(obj[i].id == id) {
                    isFound = true;
                    break;
                }
            } // search if the requested id exists in the db
            
            if(isFound) {
                let new_obj = obj.filter(obj => obj.id != id);
                jsonfile.writeFile(FILEPATH, new_obj, function(err) { if(err) console.error(err) });
                returnValue = {
                    "HttpStatusCode": "200",
                    "Message": `category id ${id} deleted`
                };
            } else {
                returnValue = {
                    "HttpStatusCode": "404",
                    "Message": `category id ${id} not found`
                };
            }
            res.end(`${returnValue.HttpStatusCode} : ${returnValue.Message}`);
        });
    }
/*
    jsonfile.readFile(FILEPATH)
        .then(obj => {
            let new_obj = obj.filter(obj => obj.id != id);
            return new_obj;
        }).then(obj => jsonfile.writeFile(FILEPATH, obj, function(err) { if(err) console.error(err) }))
        .catch(err => console.error(err));
*/
});

app.get("/categoryBudgetLimit", async function(req, res) {
    const LIMIT = req.query.limit;
    const ABOVE = req.query.above;
    const returnValue = await CategoryBudgetLimit(LIMIT, ABOVE);
    // console.dir(returnValue);

    res.writeHead(Number(returnValue.HttpStatusCode), { "Content-Type": "text/plain" });

    if(returnValue.HttpStatusCode == 200) {
        const JSON_LIST = JSON.stringify(returnValue.CategoryIDFiltered)
        res.end(JSON_LIST);
    }else {
        res.end(`${returnValue.HttpStatusCode}: ${returnValue.Message}`);
    };
});

// backend will return 200/OK and the id array as JSON
async function CategoryBudgetLimit(LIMIT, isABOVE) {
    "use strict";
    let returnValue = { "HttpStatusCode": "", "Message": "", };

    if( LIMIT != 0 && !LIMIT ) {
        returnValue = {
            "HttpStatusCode": "400",
            "Message": "error: Limit cannot be missing"
        };
    }else if( LIMIT < 0 ) {
        returnValue = {
            "HttpStatusCode": "400",
            "Message": "error: Limit cannot be below zero"
        };
    }else if( isABOVE != "true" && isABOVE != "false" ) {
        returnValue = {
            "HttpStatusCode": "400",
            "Message": "error: above should be true or false"
        };
    }else {
        const ABOVE = (isABOVE == "true") ? true : false;
        let CategoryIDFiltered = [];

        await jsonfile.readFile(FILEPATH).
            then(obj => {
                for(let i = 0 ; i < obj.length ; i++){
                    if( ABOVE ? obj[i].budget > LIMIT : obj[i].budget < LIMIT )
                        CategoryIDFiltered.push(obj[i].id);
                };
            }).then(res => {
                returnValue = {
                    "HttpStatusCode": "200",
                    "Message": `filtering with budget limit ${(ABOVE) ? "above" : "below"} ${LIMIT}`,
                    "CategoryIDFiltered": CategoryIDFiltered,
                };
            }).catch(err => console.error(err));
        /*
        if(ABOVE) {
            await jsonfile.readFile(FILEPATH).then( obj => {
                for(let i = 0 ; i < obj.length ; i++) {
                    if(obj[i].budget > LIMIT)
                        CategoryIDFiltered.push(obj[i].id);
                        console.log(`${i}:${CategoryIDFiltered.toString()}`);
                }
            }).then( res => {
                returnValue = {
                    "HttpStatusCode": "200",
                    "Message": `filtering with budget limit ${(ABOVE) ? "above" : "below"} ${LIMIT}`,
                    "CategoryIDFiltered": CategoryIDFiltered,
                };
            }).catch(err => console.error(err));
        }else {
            jsonfile.readFile(FILEPATH, function(err, obj) {
                for(let i = 0 ; i < obj.length ; i++) {
                    if(obj[i].budget < LIMIT)
                        CategoryIDFiltered.push(obj[i].id);
                }
            });
        }
        */
    }
    return returnValue;
}

let server = app.listen(8080, function() {
    console.log("app listening to port 8080")
});
