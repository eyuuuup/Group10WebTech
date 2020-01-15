const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("testo.db", sqlite3.OPEN_READWRITE, function(err) {
    if (err) {
        return console.error(err.message);
    } else {
        console.log("Connected to the SQlite database.")
    }
});

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000);
app.use("/api", router);
app.use(express.static('public'))

//https://developerhowto.com/2018/12/29/build-a-rest-api-with-node-js-and-express-js/

// /api/products GET
// https://stackoverflow.com/questions/19041837/difference-between-res-send-and-res-json-in-express-js
router.get("/products", function(req, res) {
    
    db.all("SELECT * FROM products", function(err, row){
        if (err) {
            console.error(err.message);
        } else {
            res.json(row);
        }
    });

});

// /api/products POST
// https://stackoverflow.com/questions/24543847/req-body-empty-on-posts

router.post("/products", function(req, res) {
    var params = [req.body.brand, req.body.model, req.body.os, req.body.image, req.body.screensize];
    
    db.run("INSERT INTO products (brand, model, os, image, screensize) VALUES (?,?,?,?,?)", params, function(err, result) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        } else {
            res.json({
                "message": "success",
                "data": req.body,
                "id": this.lastID
            })
        }
    })
    
});

router.get("/products/:id", function(req, res) {
    var params = [req.params.id]
    db.get("SELECT * FROM products where id = ?", params, function(err, row){
        if (err) {
            res.status(400).json({"error":err.message})
            return;
        } else {
            res.json(row);
        }
    });

});

router.put("/products/:id", function(req, res) {
    var params = [req.body.brand, req.body.model, req.body.os, req.body.image, req.body.screensize, req.params.id];
    db.run("UPDATE products SET brand = ?, model = ?, os = ?, image = ?, screensize = ? WHERE id = ?", 
    params, function(err, result){
        if (err) {
            res.status(400).json({"error":err.message})
            return;
        } else {
            res.status(204).send();
        }
    });

});

router.delete("/products/:id", function(req, res) {
    var params = [req.params.id];
    db.run("DELETE FROM products WHERE id = ?", params, 
    function(err, result){
        if(err) {
            res.status(400).json({"error": res.message});
            return;
        } else {
            res.status(204).send();
        }
    })
})

router.delete("/products/reset", function(req, res) {
    var params = [req.params.id];
    db.run("DELETE FROM products", params, 
    function(err, result){
        if(err) {
            res.status(400).json({"error": res.message});
            return;
        } else {
            res.status(204).send();
        }
    })
})

router.get("/", function(req, res, next) {
    res.json({"message":"OK"});
});





// https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
// https://stackoverflow.com/questions/21864127/nodejs-process-hangs-on-exit-ctrlc
process.on("exit", function(){
    console.log("Closing the database connection.");
    db.close(function(err){
        if (err) {
            return console.error(err.message);
        } else {
            console.log("Closed the database connection.");
        }
});
})

process.on("SIGINT", function(){
    process.exit();
});

