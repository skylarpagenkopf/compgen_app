var express = require('express');
var router = express.Router();

// connect to db to get info for page rendering
var mongo = require('mongodb');
var mongoose = require('mongoose');
var ObjectID = mongo.ObjectID;
var db;

// connects to db
mongo.MongoClient.connect('mongodb://localhost:27017/cg', function(err, database) {
	if (err) throw err;
	db = database;
});

// get home page and list groups
router.get('/', function(req, res) {
  db.collection('rels').find({},{group: 1, _id: 0 }).toArray(function(err, data) {
	var groups = [],
		i;
	for (i = 0; i < data.length; i++) {
		if (groups.indexOf(data[i].group) == -1) {
			groups.push(data[i].group);
		}
	}
	res.render('index', { title: 'Home', groups: groups });
  });
});

// show group info
router.get('/:group/:search', function(req, res) {
	var params = {group: req.params.group},
		searched = '';
	if (req.params.search != 'all') {
		params = {
			$or: [
					{
						group: req.params.group,
						pop1: req.params.search
					},
					{
						group: req.params.group,
						pop2: req.params.search
					}
		]};
		searched = req.params.search;
	}
 	db.collection('rels').find(params).toArray(function(err, data) {
 		// separate drift and mig data
 		var driftdata = [],
 			migdata = [],
 			i;
 		for (i = 0; i < data.length; i++) {
 			if (data[i].type == 'drift') {
 				driftdata.push(data[i]);
 			} else {
 				migdata.push(data[i]);
 			}
 		}
		res.render('group', {
			title: req.params.group, 
			driftdata: driftdata,
			migdata: migdata,
			searched: searched
		});
	});
});

module.exports = router;
