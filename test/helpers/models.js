import db from "../../src/db";
import faker from "faker";
import _ from "lodash";
import moment from "moment";

export const prepareVotes = (guid, cnt) => {
  const voteRecords = _.range(cnt).map(() => ({
    ballotId: guid,
    emailAddress: faker.internet.email(),
    name: faker.name.firstName(),
    restaurantId: faker.random.number()
  }));

  return db("votes")
    .del()
    .then(() => {
      return db("votes").insert(voteRecords);
    });
};

export const prepareBallotChoices = (guid, cnt = 5) => {
  const suggestedIdx = faker.random.number({ min: 0, max: cnt - 1 });
  return db("ballot_choices")
    .del()
    .then(() => {
      const choices = _.range(cnt).map(idx => ({
        ballotId: guid,
        restaurantId: faker.random.number(),
        name: faker.company.companyName(),
        averageReview: faker.random.number({ min: 0, max: 10 }),
        topReviewer: faker.name.firstName(),
        review: faker.lorem.sentence(),
        isSuggested: idx === suggestedIdx ? 1 : 0
      }));

      return db("ballot_choices").insert(choices);
    });
};

export const prepareBallots = (guid, cnt) => {
  let offsetCnt = 0;
  const endTime = dayOffset =>
    moment()
      .add(dayOffset, "d")
      .utc()
      .format("YYYY-MM-DD HH:mm:SS");
  const ballotRecords = _.range(cnt).map(() => ({
    guid: faker.random.uuid(),
    endTime: endTime(offsetCnt++)
  }));
  ballotRecords[0].guid = guid;

  return db("ballots")
    .del()
    .then(() => prepareBallotChoices(guid))
    .then(() => {
      return db("ballots").insert(ballotRecords);
    });
};

export const prepareBallotsForCreateBallot = () => {
  return db("ballots")
    .del()
    .then(() => {
      return db("ballot_choices").del();
    });
};

export const prepareBallotsForGetBallot = ballotRecord => {
  return db("ballots")
    .del()
    .then(() => prepareBallotChoices(ballotRecord.guid))
    .then(() => {
      return db("ballots").insert(ballotRecord);
    });
};

export const prepareVotesForCastVote = ({ ballotRecord, voteRecord }) => {
  return db("votes")
    .del()
    .then(() => {
      return db("ballots").del();
    })
    .then(() => prepareBallotChoices(ballotRecord.guid))
    .then(() => {
      return db("ballots").insert(ballotRecord);
    })
    .then(() => {
      const { ballotId, voterName: name, emailAddress } = voteRecord;
      return db("votes").insert({ ballotId, name, emailAddress });
    });
};
