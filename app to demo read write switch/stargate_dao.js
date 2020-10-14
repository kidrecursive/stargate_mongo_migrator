

const stargate = require("./stargate");


const namespace = `mongo_migrator`;
const collection = "airlines";

//const gameId = faker.random.alphaNumeric(8);


async function insert(document, docid) {

  const docRootPath = `/namespaces/${namespace}/collections/${collection}/${docid}`;

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
    //await insert_client.delete(docRootPath);

    await insert_client.put(docRootPath, document);

    console.log("1 document inserted");
    // await insert_client.patch(docRootPath,airline_update);
    //const update_res = await insert_client.get(docRootPath);
    //console.log("After update : " +JSON.stringify(update_res.jsonResponse))
  })()


}

async function update(docid, document) {

  const docRootPath = `/namespaces/${namespace}/collections/${collection}/${docid}`;

  const stargateClient = async () => {
    const stargateClient = await stargate.createClient({
      baseUrl: `https://c72c60e1-d1c1-4730-8d6a-413abce921ff-us-east-1.apps.astra.datastax.com`,
      username: `mongo_migrator`,
      password: `mongo_migrator`,
    });

    return stargateClient;
  }


  (async () => {
    //console.log(document)
    let insert_client = await stargateClient();

    await insert_client.patch(docRootPath, document);

    console.log("1 document updated");

    //const update_res = await insert_client.get(docRootPath);
    //console.log("After update : " + JSON.stringify(update_res.jsonResponse))
  })()


}


async function delete_document(docid) {

  const docRootPath = `/namespaces/${namespace}/collections/${collection}/${docid}`;

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
    await insert_client.delete(docRootPath);
    console.log("1 document deleted");


  })()


}

async function find(docid) {

  const docRootPath = `/namespaces/${namespace}/collections/${collection}/${docid}`;

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
    const update_res = await insert_client.get(docRootPath);
    if( update_res.jsonResponse != null ){
    console.log("found document  : " + JSON.stringify(update_res.jsonResponse))
    }
    else {
      console.log("document not found for document id  : " + docid)

    }
  })()


}

module.exports = { insert, update, delete_document, find }


