import faker from "faker";
import {
  getVotes,
  createBallot,
  getBallots,
  getBallot
} from "../src/helpers/models";
import { prepareVotes, prepareBallots } from "./helpers/models";

describe("models", () => {
  describe("votes", () => {
    let guid = null;

    beforeAll(() => {
      guid = faker.random.uuid();
      return prepareVotes(guid, 3);
    });

    test("should fetch votes", done => {
      getVotes(guid, (err, rows) => {
        expect(rows.length).toBe(3);
        done();
      });
    });
  });

  describe("ballots", () => {
    let guid = null;

    beforeAll(() => {
      guid = faker.random.uuid();
      return prepareBallots(guid, 3);
    });

    test("should fetch 1 ballot", done => {
      getBallot(guid, (err, { ballot }) => {
        expect(ballot.guid).toBe(guid);
        done();
      });
    });
  });
});
