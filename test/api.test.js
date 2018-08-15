import _ from "lodash";
import {
  createBallot,
  getBallot,
  castVote,
  createBallotWithEndTime
} from "./helpers/internalApi";
import {
  prepareBallotsForCreateBallot,
  prepareBallotsForGetBallot,
  prepareVotesForCastVote
} from "./helpers/models";
import { getBallots, getVotes } from "../src/helpers/models";
import faker from "faker";
import { getEndDateFormatted, getEndDateParts } from "../src/helpers/utils";
import moment from "moment";
import { getCache } from "../src/cache";

let cache = {};

describe("internal api", () => {
  beforeAll(() => {
    return new Promise((resolve, reject) => {
      getCache((err, cachedRecords) => {
        if (err) {
          console.error("Unable to cache external records", err);
          return reject();
        }
        cache = cachedRecords;
        cache["restaurantIds"] = cache.restaurants.map(
          restaurant => restaurant.id
        );
        console.log("Cache accessed (test)", Object.keys(cache));
        resolve();
      });
    });
  });

  describe("create ballots", () => {
    beforeEach(() => {
      return prepareBallotsForCreateBallot();
    });

    test("should create 1 new ballot", done => {
      createBallot((err, res) => {
        expect(err).toBeNull();
        const rePayload = new RegExp(`{"ballotId":"[^"]+"}`);
        expect(JSON.stringify(res)).toMatch(rePayload);

        getBallots((err, rows) => {
          expect(rows).not.toBeNull();
          expect(rows.length).toBe(1);
          done();
        });
      });
    });

    test("should new ballot with default endTime of 11:45am local time", done => {
      const endTime = getEndDateFormatted();

      createBallot(() => {
        getBallots((err, rows) => {
          expect(rows[0].endTime).toBe(endTime);
          done();
        });
      });
    });

    test("should handle datetime format as specified (e.g., '3/20/17 11:45')", done => {
      const endTime = getEndDateFormatted("3/20/17 11:45");
      // moment('3/20/17 11:45', 'M/D/YY HH:mm')

      createBallotWithEndTime(endTime, () => {
        getBallots((err, rows) => {
          expect(rows[0].endTime).toBe(endTime);
          done();
        });
      });
    });

    test("should new ballot with custom endTime", done => {
      const { date, timezone } = getEndDateParts();
      const customTime = "14:30:00";
      const endTime = getEndDateFormatted(`${date} ${customTime}${timezone}`);

      createBallotWithEndTime(endTime, () => {
        getBallots((err, rows) => {
          expect(rows[0].endTime).toBe(endTime);
          done();
        });
      });
    });
  });

  describe("fetch finished ballot", () => {
    const guid = faker.random.uuid();
    const endTime = getEndDateFormatted(moment().subtract(1, "d"));
    const ballotRecord = { guid, endTime };

    beforeAll(() => {
      return prepareBallotsForGetBallot(ballotRecord);
    });

    test("should fetch 1 existing ballot", done => {
      getBallot(guid, (err, res) => {
        const finishedBallot = JSON.parse(res);
        expect(Object.keys(finishedBallot)).toContain("choices");
        expect(Object.keys(finishedBallot)).toContain("winner");
        done();
      });
    });

    test("should return a payload appropriate for post-finish, winner", done => {
      getBallot(guid, (err, res) => {
        const finishedBallot = JSON.parse(res);
        const expectedKeys = ["id", "datetime", "name", "votes"];
        const difference = _.difference(
          Object.keys(finishedBallot.winner),
          expectedKeys
        );
        expect(difference.length).toBe(0);
        done();
      });
    });

    test("should return a payload with 5 choices", done => {
      getBallot(guid, (err, res) => {
        const finishedBallot = JSON.parse(res);
        expect(finishedBallot.choices.length).toBe(5);
        done();
      });
    });

    test("should return a payload appropriate for post-finish, choices", done => {
      getBallot(guid, (err, res) => {
        const finishedBallot = JSON.parse(res);
        const expectedKeys = ["id", "name", "votes"];
        const difference = _.difference(
          Object.keys(finishedBallot.choices[0]),
          expectedKeys
        );
        expect(difference.length).toBe(0);

        done();
      });
    });
  });

  describe("fetch ballot, in progress", () => {
    const guid = faker.random.uuid();
    const endTime = getEndDateFormatted(moment().add(1, "h"));
    const ballotRecord = { guid, endTime };

    beforeAll(() => {
      return prepareBallotsForGetBallot(ballotRecord);
    });

    test("should fetch 1 existing ballot", done => {
      getBallot(guid, (err, res) => {
        const activeBallot = JSON.parse(res);
        expect(Object.keys(activeBallot)).toContain("choices");
        expect(Object.keys(activeBallot)).toContain("suggestion");
        done();
      });
    });

    test("should return a payload appropriate for pre-finish, suggestion", done => {
      getBallot(guid, (err, res) => {
        const activeBallot = JSON.parse(res);
        const expectedSuggestionKeys = [
          "id",
          "name",
          "averageReview",
          "TopReviewer",
          "Review"
        ];
        const difference = _.difference(
          Object.keys(activeBallot.suggestion),
          expectedSuggestionKeys
        );
        expect(difference.length).toBe(0);
        done();
      });
    });

    test("should return a payload with 5 choices", done => {
      getBallot(guid, (err, res) => {
        const activeBallot = JSON.parse(res);
        expect(activeBallot.choices.length).toBe(5);
        done();
      });
    });

    test("should return a payload appropriate for pre-finish, choices", done => {
      getBallot(guid, (err, res) => {
        const activeBallot = JSON.parse(res);
        const expectedChoiceKeys = [
          "id",
          "name",
          "averageReview",
          "description"
        ];
        const difference = _.difference(
          Object.keys(activeBallot.choices[0]),
          expectedChoiceKeys
        );
        expect(difference.length).toBe(0);

        done();
      });
    });
  });

  describe("cast vote", () => {
    const guid = faker.random.uuid();
    const voterName = faker.name.firstName();
    const emailAddress = faker.internet.email();
    const endTime = getEndDateFormatted();
    const ballotRecord = { guid, endTime };
    const restaurantIdx = faker.random.number({ min: 0, max: 10 });

    let restaurantId = -1;
    let voteRecord = {
      ballotId: guid,
      voterName,
      emailAddress
    };

    beforeAll(() => {
      restaurantId = cache.restaurantIds[restaurantIdx];
      voteRecord["id"] = restaurantId;

      return prepareVotesForCastVote({ ballotRecord, voteRecord });
    });

    test("should record 1 vote", done => {
      getVotes(guid, (err, rows) => {
        expect(rows.length).toBe(1);
        expect(rows[0].restaurantId).toBeNull();

        castVote(voteRecord, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(body).toBe("OK");

          getVotes(guid, (err, rows) => {
            expect(rows.length).toBe(1);
            expect(rows[0].restaurantId).toBe(restaurantId);
            done();
          });
        });
      });
    });
  });
});
