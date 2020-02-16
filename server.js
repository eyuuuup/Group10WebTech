var pg = require("pg");
var conString = "postgres://ymhvoatimofyig:1b7c59f8f1f2211d81651c94fe503fbffcd19c8e78901da92ef1575c525b1f91@ec2-46-137-177-160.eu-west-1.compute.amazonaws.com:5432/d40qb6lj4kjhfb";
var db = new pg.Client(conString);
db.connect();
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var router = express.Router();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port);
app.use("/api", router);

// https://stackoverflow.com/questions/10434001/static-files-with-express-js
app.use(express.static('public'))

//https://developerhowto.com/2018/12/29/build-a-rest-api-with-node-js-and-express-js/

// /api/products GET
// https://stackoverflow.com/questions/19041837/difference-between-res-send-and-res-json-in-express-js
router.get("/weather", function (req, res) {
    
    const query = {
        text: "SELECT * FROM (SELECT * FROM weather ORDER BY id DESC LIMIT 50) sub ORDER BY id ASC",
    }

    db.query(query, (err, data) => {
        if (err) {
            res.status(400).json(
                {
                    "error": err.message
                }
            );
            console.log(err.stack);
        } else {
            res.status(200).json(data.rows);
        }
    })

});

router.post("/weather/add", function (req, res) {
    console.log(req.body)
    console.log(req.body.date)
    console.log(req.body.temp)
    console.log(req.body.humid)
    const query = {
        text: "INSERT INTO weather(temp, humid) VALUES ($1, $2)",
        values: [req.body.temp, req.body.humid]
    }

    db.query(query, (err, data) => {
        if (err) {
            res.status(400).json(
                {
                    "error": err.message
                }
            );
            console.log(err.stack);
        } else {
            res.status(201).json({
                "message": "success"
            }
            );
        }
    })

});

// /api/products/id GET
router.get("/weather/:id", function (req, res) {
    const query = {
        text: "SELECT temp, humid FROM weather where id = $1",
        values: [req.params.id],
        rowMode: 'array',
    }

    db.query(query, (err, data) => {
        if (err) {
            res.status(400).json(
                {
                    "error": err.message
                }
            );
            console.log(err.stack)
        } else if (data.rowCount == 0) {
            res.sendStatus(404);
        } else {
            res.json(data.rows);
        }
    });
});

// /api/products/reset DELETE
router.delete("/weather/reset", function (req, res) {
    const query = {
        text: "DELETE FROM weather",
        rowMode: 'array',
    }

    db.query(query, (err, data) => {
        if (err) {
            res.status(400).json(
                {
                    "error": err.message
                }
              
            );
            console.log(err.stack)
        } else {
            res.sendStatus(204);
        }
    });
});

// /api/products/id DELETE
router.delete("/weather/:id", function (req, res) {

    const query = {
        text: "DELETE FROM weather where id = $1",
        values: [req.params.id],
        rowMode: 'array',
    }

    db.query(query, (err, data) => {
            if (err) {
                res.status(400).json(
                    {
                        "error": err.message
                    }
                );
                return;
            } else if (data.rowCount == 0) {
                res.sendStatus(404);
            } else {
                res.sendStatus(204);
            }
        });
});

// check if api is online
router.get("/", function (req, res) {
    res.status(200).json(
        {
            "message": "api online"
        }
    );
});

// everything else throws a 404
app.use(function (req, res, next) {
    res.sendStatus(404);
});

/*  https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    https://stackoverflow.com/questions/21864127/nodejs-process-hangs-on-exit-ctrlc
    close the database first before closing the application */
process.on("exit", function () {
    console.log("Closing the database connection.");
    db.end(function (err) {
        if (err) {
            return console.error(err.message);
        } else {
            console.log("Closed the database connection.");
        }
    });
});

// call procces exit on ctrl-c
process.on("SIGINT", function () {
    process.exit();
});
