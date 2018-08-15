import {
  createBallot as dbCreateBallot,
  getBallot as dbGetBallot,
  castVote as dbCastVote,
  getVotes
} from "./models";
import {
  formatTime,
  getEndDateFormatted,
  getEndDate,
  cleanPayload,
  cleanFinishedPayload
} from "./utils";
import { getRestaurants } from "./externalApi";
import moment from "moment";
import _ from "lodash";
import { getCache } from "../cache";

let cache = {};
getCache((err, cachedRecords) => {
  if (err) return console.error("Unable to cache external records", err);
  cache = cachedRecords;
  console.log(
    "Cache accessed",
    Object.keys(cache),
    Object.keys(cache.choices[0])
  );
});

export const createBallot = (req, res, next) => {
  const endTime = getEndDateFormatted();
  const choices = _.shuffle(cache.choices).slice(0, 5);
  dbCreateBallot({ endTime, ...req.body, choices }, (err, obj) => {
    res.json(obj);
  });
};

const checkBallotStatus = (ballotId, callback) => {
  dbGetBallot(ballotId, (err, data) => {
    if (err) return callback(err);

    const { ballot, choices } = data;
    const ballotEndTime = getEndDate(ballot.endTime);
    const currentTime = moment();

    // console.log( ">>> ballot expired?", currentTime > ballotEndTime, formatTime(currentTime), formatTime(ballotEndTime));
    if (currentTime > ballotEndTime)
      return callback(Error("Ballot is closed"), {
        ballotStatus: "closed",
        ...data
      });
    callback(null, data);
  });
};

export const getBallot = (req, res, next) => {
  checkBallotStatus(req.params.id, (err, data) => {
    if (err && data && data.ballotStatus === "closed") {
      delete data.ballotStatus;
      return getFinishedBallot(data, req, res, next);
    }
    if (err) return res.sendStatus(500);
    if (Object.keys(data.ballot).length === 0) return res.sendStatus(404);

    getActiveBallot(data, req, res, next);
  });
};

export const getActiveBallot = (data, req, res, next) => {
  const { ballot, choices } = data;
  const shuffledRestaurants = _.shuffle(choices);
  const suggestion = shuffledRestaurants.filter(
    restaurant => restaurant.isSuggested === 1
  )[0];
  res.json(cleanPayload({ choices: shuffledRestaurants, suggestion }));
};

export const getFinishedBallot = (data, req, res, next) => {
  console.log("data", data);
  getVotes(data.ballot.guid, (err, votes) => {
    const votesByRestaurantId = votes.reduce((lookupHash, vote) => {
      lookupHash[vote.restaurantId] = vote.voteCount;
      return lookupHash;
    }, {});

    res.json(cleanFinishedPayload({ choices: data.choices, votesByRestaurantId }));
  });
};

export const castVote = (req, res, next) => {
  checkBallotStatus(req.query.ballotId, (err, data) => {
    if (err && data && data.ballotStatus === "closed")
      return res.sendStatus(409);
    if (err) return res.sendStatus(500);
    if (Object.keys(data.ballot).length === 0) return res.sendStatus(404);

    const voterName = req.query.voterName;
    delete req.query.voterName;
    dbCastVote({ ...req.query, name: voterName }, (err, obj) => {
      if (err) return res.sendStatus(500);
      res.sendStatus(200);
    });
  });
};
