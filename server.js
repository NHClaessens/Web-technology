// ###############################################################################
// Web Technology at VU University Amsterdam
// Assignment 3
//
// The assignment description is available on Canvas. 
// Please read it carefully before you proceed.
//
// This is a template for you to quickly get started with Assignment 3.
// Read through the code and try to understand it.
//
// Have you read the zyBook chapter on Node.js?
// Have you looked at the documentation of sqlite?
// https://www.sqlitetutorial.net/sqlite-nodejs/
//
// Once you are familiar with Node.js and the assignment, start implementing
// an API according to your design by adding routes.


// ###############################################################################
//
// Database setup:
// First: Our code will open a sqlite database file for you, and create one if it not exists already.
// We are going to use the variable "db' to communicate to the database:
// If you want to start with a clean sheet, delete the file 'phones.db'.
// It will be automatically re-created and filled with one example item.

const sqlite = require('sqlite3').verbose();
let db = my_database('./phones.db');

// ###############################################################################
// The database should be OK by now. Let's setup the Web server so we can start
// defining routes.
//
// First, create an express application `app`:

var express = require("express");
var cors = require("cors")
var app = express();

// We need some middleware to parse JSON data in the body of our HTTP requests:
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());


// ###############################################################################
// Routes
// 
// TODO: Add your routes here and remove the example routes once you know how
//       everything works.
// ###############################################################################

// This example route responds to http://localhost:3000/hello with an example JSON object.
// Please test if this works on your own device before you make any changes.


app.get("/", function(req, res){
	db.all("SELECT * FROM phones", function(err, rows){
		return res.status(200).json(rows);
	});
})
app.get("/id/:id", function(req, res){
	id = req.params.id;
	db.all("SELECT id, brand, model, os, image, screensize FROM phones WHERE id=" + id, function(err, rows){
		if(rows == ""){
			return res.status(404).json({error: "404: Item not found"})
		}else{
			return res.status(200).json(rows);
		}
	});		
})
app.post('/add', function(req, res) {
	var error;
	db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
	[req.body.brand, req.body.model, req.body.os, req.body.image,  req.body.screensize], function(err, rows){
		if(req.body.brand == "" || req.body.model == "" || req.body.os == "" || req.body.image == "" || req.body.screensize == "" || isNaN(req.body.screensize)){
			return res.status(400).json({error: "400: Invalid input"})
		}else if(err){
			return res.status(500).json({error: "500: Internal server error"});
		}else{
			return res.status(201).json();
		}
	});
});
app.put("/change/:id", function(req, res){
	id = req.params.id;
	db.all("SELECT id, brand, model, os, image, screensize FROM phones WHERE id=" + id, function(err, rows){
		if(req.body.brand == "" || req.body.model == "" || req.body.os == "" || req.body.image == "" || req.body.screensize == "" || isNaN(req.body.screensize)){
			return res.status(400).json({error: "400: Invalid input"})
		}else if(err){
			return res.status(500).json({error: "500: Internal server error"});
		}else if(rows == ""){
			return res.status(404).json({error: "404: Item not found"})
		}else{
			db.run(`UPDATE phones
			SET brand=?, model=?, os=?, image=?,screensize=? WHERE id=?`,
			[req.body.brand, req.body.model, req.body.os, req.body.image,  req.body.screensize, id], function(err, rows){})
			return res.status(204).json();
		}
	});		
});
app.delete("/delete", function(req, res){
	db.run(`DELETE FROM phones`, function(err) {
		if(err){
			return res.status(500).json({error: "500: Internal server error"});
		}else{
			return res.status(204).json();
		}
	});	
})
app.delete("/delete/:id", function(req, res){
	id = req.params.id;
	db.all("SELECT id, brand, model, os, image, screensize FROM phones WHERE id=" + id, function(err, rows){
		if(err){
			return res.status(500).json({error: "500: Internal server error"});
		}else if(rows == ""){
			return res.status(404).json({error: "404: Item not found"})
		}else{
			db.run("DELETE FROM phones WHERE id=" + id, function(err){
				if(err){
					return res.status(500).json({error: "500: Internal server error"});
				}else{
					return res.status(204).json();
				}
			});
		}
	});	
})


// ###############################################################################
// This should start the server, after the routes have been defined, at port 3000:

app.listen(3000);
console.log("Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/hello");

// ###############################################################################
// Some helper functions called above
function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
  		if (err) {
			console.error(err.message);
  		}
  		console.log('Connected to the phones database.');
	});
	// Create our phones table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
		db.all(`select count(*) as count from phones`, function(err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
				["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
				console.log('Inserted dummy phone entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	});
	return db;
}