var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
var config      = require('./knexfile.js');  
var env         = 'development';  
var knex        = require('knex')(config[env]);

module.exports = knex;

knex.migrate.latest([config]); 

var app = express();
app.use('/', express.static(path.join(__dirname, "./")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest items.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.post('/api/server', function(req, res) {
	var obj = req.body

	knex('todos').pluck('uuid').then(function(id) {
		if (id == []) {
			knex.table('todos')
				.then(function(test) {
					knex.insert(obj).into('todos')
						.then(function(rows) {
							knex.select('*').from('todos')
								.then(function(list) {
									return res.json(list);
								});
						});
				}).catch(function(error) {
					console.error(error);
				});
		} else {
		 var count = 0;
			for (var j = 0; j < id.length; j+=1) {
				if (id[j] == obj.uuid) {
					count += 1;
				};
			};							
			if (count != 0) {
				knex.from('todos').select('*')
					.then(function(test){
						return knex.update({
							'title': obj.title,
							'completed': obj.completed
						}).into('todos').where({'uuid': obj.uuid})
							.then(function(rows) {
								knex.select('*').from('todos')
									.then(function(list) {
										return res.json(list);
									});
							});
					}).catch(function(error) {
						console.error(error);
					}); 
			} else {
				knex.select('*').from('todos')
					.then(function(rows) {
						knex.insert(obj).into('todos')
							.then(function(rows) {
								knex.select('*').from('todos')
									.then(function(list) {
										return res.json(list);
									});
							});
					}).catch(function(error) {
						console.error(error);
					});
			};
		};
	});
});

app.get('/api/server', function(req, res) {
	knex.select('*').from('todos')
		.then(function(test) {
			res.json(test);
		});
});

app.post('/api/destroy', function(req, res) {
	var obj = req.body

	knex('todos').pluck('uuid').then(function(id) {
		for (var i=0; i < id.length; i+=1) {
			if (id[i] == obj.uuid) {
				return knex.from('todos').where('uuid', id[i]).del()
					.then(function() {
						knex.select('*').from('todos')
							.then(function(list) {
								return res.json(list);
							});						
					});
			};
		};
	});
});


app.listen(7777,function(){
    console.log("Started listening on port", 7777);
});
