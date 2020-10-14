
const mongo_dao = require("./mongo_dao");
const stargate_dao = require("./stargate_dao");
const fs = require('fs');

const db_target = "DUAL";
//const db_target = "MONGO";
//const db_target = "STARGATE";

//const db_operation = "READ";
//const db_operation = "INSERT";
//const db_operation = "UPDATE";
//const db_operation = "DELETE";
const db_operation = "READ";

var rawdata = fs.readFileSync('jsonfiles/airline_10.json');
var airline_insert = JSON.parse(rawdata);
var airline_id = 10;

rawdata = fs.readFileSync('jsonfiles/airline_10_update.json');
var airline_update = JSON.parse(rawdata);





if (db_target == "MONGO") {
    if (db_operation == "INSERT") {
        mongo_dao.insert(airline_insert, airline_id)
    }
    else if (db_operation == "READ") {
        mongo_dao.find(airline_id)
    }
    else if (db_operation == "UPDATE") {
        mongo_dao.update(airline_id, airline_update)
    }
    else if (db_operation == "DELETE") {
        mongo_dao.delete_document(airline_id)
    }
}
else if (db_target == "STARGATE") {

    if (db_operation == "INSERT") {
        stargate_dao.insert(airline_insert, airline_id)
    }
    else if (db_operation == "READ") {
        stargate_dao.find(airline_id)
    }
    else if (db_operation == "UPDATE") {
        stargate_dao.update(airline_id, airline_update)
    }
    else if (db_operation == "DELETE") {
        stargate_dao.delete_document(airline_id)
    }
}
else {
    console.log("ERROR : UNKNOWN TARGET DB")
}









