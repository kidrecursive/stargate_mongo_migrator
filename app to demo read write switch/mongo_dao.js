
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://34.227.105.4:27017/";
async function insert(document,docid) {

    document._id = docid;

   await MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("airlines").deleteMany({}, function (err, result) {
            if (err) throw err;
        }); 
        dbo.collection("airlines").insertOne(document, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
           
        });        
        db.close();
    });

    return "success";
}

async function update(docid, document) {


    var query = { "_id": docid };
    await MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("airlines").updateOne(query, { $set: document }, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
        });

        db.close();
        
    });

    return "success";

}

async function delete_document(docid) {

    var query = { "_id": docid };
    await MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("airlines").deleteOne(query, function (err, res) {
            if (err) throw err;
            console.log("1 document deleted");
        });
        
        db.close();
    });

    return "success";

}

async function find(docid) {

    var query = { "_id": docid };


   await MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("airlines").findOne({}, function (err, result) {
            if (err) throw err;
            console.log("found document  : " +  JSON.stringify(result))
        });
        db.close();
    });

    return "success";

}


module.exports = { insert, update, delete_document ,find}


