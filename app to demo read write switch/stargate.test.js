const assert = require("assert");
const faker = require("faker");
const stargate = require("./stargate");
const _ = require("lodash");

// setup envars
require("dotenv").config();

describe("BattleStax Playthrough", () => {
  // setup test context
  let stargateClient = null;
  const namespace = `mongo_migrator`;
  const collection = "games";
  const gameId = faker.random.alphaNumeric(8);
  const docRootPath = `/namespaces/${namespace}/collections/${collection}/${gameId}`;

  before(async () => {
    stargateClient = await stargate.createClient({
      baseUrl: `https://c72c60e1-d1c1-4730-8d6a-413abce921ff-us-east-1.apps.astra.datastax.com`,
      username: `mongo_migrator`,
      password: `mongo_migrator`,
    });
  });

  it("should create a game document to start a game", async () => {
    await stargateClient.put(docRootPath, {
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
    });

    const res = await stargateClient.get(docRootPath);
    assert.equal(res.jsonResponse.data.gameCode, "DANG");
    assert.equal(res.jsonResponse.data.currentState.name, "ADD_PLAYERS");
  });

  it("should add players to a game", async () => {
    await stargateClient.put(`${docRootPath}/players`, {
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
    });

    const res = await stargateClient.get(`${docRootPath}/players`);
    assert.equal(res.jsonResponse.data.CRW.name, "CRW");
    assert.equal(res.jsonResponse.data.DOG.score, 0);
  });

  it("should move the game to the tutorial", async () => {
    await stargateClient.put(`${docRootPath}/currentState`, {
      name: "TUTORIAL",
      roundId: null,
    });

    const res = await stargateClient.get(`${docRootPath}/currentState`);
    assert.equal(res.jsonResponse.data.name, "TUTORIAL");
  });

  it("should move the game to round 1 input", async () => {
    await stargateClient.patch(`${docRootPath}`, {
      currentState: {
        name: "ROUND_INPUT",
        roundId: 1,
      },
    });

    const res = await stargateClient.get(`${docRootPath}/currentState`);
    assert.equal(res.jsonResponse.data.roundId, 1);
  });

  it("should recieve round 1 answers", async () => {
    // get game questions
    const questionRes = await stargateClient.get(`${docRootPath}/questions`);
    let questionId = null;
    _.mapKeys(questionRes.jsonResponse.data, (value, key) => {
      if (value.roundId === 1) {
        questionId = key;
      }
    });

    // get game players
    const playerRes = await stargateClient.get(`${docRootPath}/players`);
    let answers = {};
    _.mapKeys(playerRes.jsonResponse.data, (player, playerId) => {
      answers[faker.random.alphaNumeric(8)] = {
        questionId,
        playerId,
        content: Date.now(),
        score: 0,
      };
    });

    // set the answers
    await stargateClient.put(`${docRootPath}/answers`, answers);

    const answerRes = await stargateClient.get(docRootPath);
    assert(answerRes.jsonResponse.data.answers);
  });

  it("should delete a game", async () => {
    const res = await stargateClient.delete(docRootPath);
    assert.equal(res.status, 204);
  });
});