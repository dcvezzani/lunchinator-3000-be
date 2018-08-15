import request from "request";
import faker from "faker";

const BASE_PORT = process.env.PORT || "3000";
const BASE_URL = `http://localhost:${BASE_PORT}/api`;
const CREATE_BALLOT = `${BASE_URL}/create-ballot`;
const GET_BALLOT = `${BASE_URL}/ballot/:id`;
const CAST_VOTE = `${BASE_URL}/vote`;

export const api = (url, callback) => {
  let options = null;
  const defaultOptions = {
    headers: { "Content-Type": "application/json" }
  };

  if (typeof url === "object") options = { ...defaultOptions, ...url };
  else {
    options = { ...defaultOptions, url };
  }

  request(options, callback);
};

export const createBallot = callback => {
  const options = {
    url: CREATE_BALLOT,
    method: "POST",
    json: true,
    body: {
      voters: [
        { name: faker.name.firstName(), emailAddress: faker.internet.email() },
        { name: faker.name.firstName(), emailAddress: faker.internet.email() },
        { name: faker.name.firstName(), emailAddress: faker.internet.email() }
      ]
    }
  };
  api(options, (error, response, body) => {
    callback(error, body);
  });
};

export const createBallotWithEndTime = (endTime, callback) => {
  const options = {
    url: CREATE_BALLOT,
    method: "POST",
    json: true,
    body: {
      endTime,
      voters: [
        { name: faker.name.firstName(), emailAddress: faker.internet.email() },
        { name: faker.name.firstName(), emailAddress: faker.internet.email() },
        { name: faker.name.firstName(), emailAddress: faker.internet.email() }
      ]
    }
  };
  api(options, (error, response, body) => {
    callback(error, body);
  });
};

export const getBallot = (guid, callback) => {
  api(GET_BALLOT.replace(/:id/, guid), (error, response, body) => {
    callback(error, body);
  });
};

export const castVote = (voteData, callback) => {
  const queryString = Object.keys(voteData)
    .map(attr => `${attr}=${voteData[attr]}`)
    .join("&");
  const options = {
    url: `${CAST_VOTE}?${queryString}`,
    method: "POST"
  };

  api(options, (error, response, body) => {
    callback(error, response, body);
  });
};
