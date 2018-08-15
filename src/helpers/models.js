import db from "../db";
const uuidv1 = require("uuid/v1");

// export const getVotes = (guid, callback) => {
//   db("votes")
//     .count('restaurantId as voteCount')
//     .where({ ballotId: guid })
//     .groupBy('restaurantId')
//
//     .asCallback((err, rows) => {
//       if (err)
//         return callback({
//           msg: "Unable to fetch records",
//           raw: err.toString()
//         });
//       callback(err, rows);
//     });
// };

export const getBallot = (guid, callback) => {
  db("ballots")
    .select()
    .where({ guid })
    .first()
    .asCallback((err, ballot) => {
      if (err)
        return callback({
          msg: "Unable to fetch records",
          raw: err.toString()
        });

      db("ballot_choices")
        .select()
        .where({ ballotId: guid })
        .asCallback((err, choices) => {
          if (err)
            return callback({
              msg: "Unable to fetch records",
              raw: err.toString()
            });
          callback(err, { ballot, choices });
        });
    });
};

export const getBallotRestaurants = (guid, callback) => {
  db("ballotRestaurants")
    .select()
    .where({ guid })
    .first()
    .asCallback((err, rows) => {
      if (err)
        return callback({
          msg: "Unable to fetch records",
          raw: err.toString()
        });
      callback(err, rows);
    });
};

export const getBallots = callback => {
  db("ballots")
    .select()
    .asCallback((err, rows) => {
      if (err)
        return callback({
          msg: "Unable to fetch records",
          raw: err.toString()
        });
      callback(err, rows);
    });
};

export const createBallot = ({ endTime, voters, choices }, callback) => {
  const guid = uuidv1();

  db.transaction(function(trx) {
    db("ballots")
      .transacting(trx)
      .insert({ guid, endTime })
      .asCallback(err => {
        if (err) {
          trx.rollback();
          return callback({
            msg: "Unable to insert records",
            raw: err.toString()
          });
        }

        const votes = voters.map(voter => ({ ballotId: guid, ...voter }));
        db("votes")
          .transacting(trx)
          .insert(votes)
          .asCallback(err => {
            if (err) {
              trx.rollback();
              return callback({
                msg: "Unable to insert records",
                raw: err.toString()
              });
            }

            let topAverageReview = 0;
            let topChoiceIdx = 0;
            const preparedChoices = choices.map((choice, idx) => {
              delete choice.ratings;
              delete choice.topRating;
              const restaurantId = choice.id;
              const {
                name,
                description,
                averageReview,
                TopReviewer: topReviewer,
                Review: review
              } = choice;

              // determine suggested restaurant choice
              if (choice.averageReview > topAverageReview) {
                topChoiceIdx = idx;
                topAverageReview = choice.averageReview;
              }

              return {
                ballotId: guid,
                restaurantId,
                name,
                description,
                averageReview,
                topReviewer,
                review
              };
            });
            preparedChoices[topChoiceIdx].isSuggested = 1;

            const query = db("ballot_choices")
              .transacting(trx)
              .insert(preparedChoices)
              .asCallback(err => {
                if (err) {
                  trx.rollback();
                  return callback({
                    msg: "Unable to insert records",
                    raw: err.toString()
                  });
                }

                trx.commit();
                callback(err, { ballotId: guid });
              });
          });
      });
  });
};

export const getVotes = (ballotId, callback) => {
  // note: Doesn't work in sqlite
  // const query = db("votes")
  // .leftOuterJoin('ballotChoices', {'votes.ballotId': 'ballotChoices.ballotId', 'votes.restaurantId': 'ballotChoices.restaurantId'})
  // .where({ ballotId });

  db("votes")
    .select("restaurantId")
    .count("restaurantId as voteCount")
    .where({ ballotId })
    .groupBy("restaurantId")
    .asCallback((err, rows) => {
      if (err)
        return callback({
          msg: "Unable to update record",
          raw: err.toString()
        });
      callback(null, rows);
    });
};

export const castVote = (voteData, callback) => {
  const { ballotId, name, emailAddress, id: restaurantId } = voteData;

  db("votes")
    .update({ restaurantId })
    .where({ ballotId, emailAddress })
    .asCallback(err => {
      if (err)
        return callback({
          msg: "Unable to update record",
          raw: err.toString()
        });
      callback();
    });
};
