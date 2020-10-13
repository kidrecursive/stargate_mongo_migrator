var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const assert = require("assert");
const faker = require("faker");
const stargate = require("./stargate");
const _ = require("lodash");

const db_target = "MONGO";
// setup envars
require("dotenv").config();

const fs = require('fs');

var rawdata = fs.readFileSync('jsonfiles/airline_10.json');
var airline_insert = JSON.parse(rawdata);
var docid = 10;
airline_insert._id=docid;

//console.log("###########"+airline_insert);

rawdata = fs.readFileSync('jsonfiles/airline_10_update.json');
var airline_update = JSON.parse(rawdata);

//console.log(airline_update);


const namespace = `mongo_migrator`;
const collection = "airlines";

const gameId = faker.random.alphaNumeric(8);
const docRootPath = `/namespaces/${namespace}/collections/${collection}/${docid}`;

/*
var myobj = {
    gameCode: "DANG",
    currentState: {
        name: "ADD_PLAYERS",
        roundId: null,
    },
    players: {},
    audienceSize: 0,
    rounds: {
        1: {
            type: "QUESTION",
            title: "Round 1",
            scoreMultiplier: 1,
        },
        2: {
            type: "QUESTION",
            title: "Round 1",
            scoreMultiplier: 2,
        },
        3: {
            type: "COMIC",
            title: "Final Round",
            scoreMultiplier: 3,
        },
    },
    questions: {
        [faker.random.alphaNumeric(8)]: {
            roundId: 1,
            content: "What time is it?",
        },
        [faker.random.alphaNumeric(8)]: {
            roundId: 2,
            content: "What day is it?",
        },
        [faker.random.alphaNumeric(8)]: {
            roundId: 3,
            content: "https://xkcd.com/386/",
        },
    },
    answers: {},
    votes: {},
    audienceVotes: {},
};


var updateDoc = {
    CRW: {
        name: "CRW",
        vip: true,
        score: 0,
    },
    DKG: {
        name: "DKG",
        score: 0,
    },
    JRG: {
        name: "JRG",
        score: 0,
    },
    DOG: {
        name: "DOG",
        score: 0,
    },
};
*/

// if (db_target.equal("MONGO)")) {
// }

MongoClient.connect(url, function (err, db) {
    if (err) throw err;


    var dbo = db.db("mydb");

    dbo.collection("airlines").deleteMany({}, function (err, result) {
        if (err) throw err;
       // console.log(result);

       
   //     db.close();
    });

    dbo.collection("airlines").insertOne(airline_insert, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
   //    db.close();
    });


    var myquery = { "id": docid };
   // console.log ("---"+myquery)
    dbo.collection("airlines").updateOne(myquery, { $set: airline_update }, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
     //   
    });

       dbo.collection("airlines").findOne({}, function (err, result) {
    if (err) throw err;
   console.log(result);});
   
   
    db.close();
    
 



});



const stargateClient = async () => {
    const stargateClient = await stargate.createClient({
      baseUrl: `https://c72c60e1-d1c1-4730-8d6a-413abce921ff-us-east-1.apps.astra.datastax.com`,
      username: `mongo_migrator`,
      password: `mongo_migrator`,
    });

    return stargateClient;
  }


  (async () => {
     let insert_client = await stargateClient();
     //console.log(insert_client)
     await insert_client.delete(docRootPath);

     await insert_client.put(docRootPath,airline_insert );
  
    const insert_res = await insert_client.get(docRootPath);
    console.log("After insert : " + JSON.stringify(insert_res.jsonResponse))
     await insert_client.patch(docRootPath,airline_update);
    const update_res = await insert_client.get(docRootPath);
    console.log("After update : " +JSON.stringify(update_res.jsonResponse))
  })()


/*
("should add players to a game", async () => {
    await stargateClient.put(`${docRootPath}/players`, updateDoc);

    const res = await stargateClient.get(`${docRootPath}/players`);
    assert.equal(res.jsonResponse.data.CRW.name, "CRW");
    assert.equal(res.jsonResponse.data.DOG.score, 0);
});
*/


//migration of existing mongo
//ease of migration from mongo to cassandra

