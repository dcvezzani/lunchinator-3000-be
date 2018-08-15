import moment from "moment";
import faker from "faker";
import {
  DEFAULT_TIME_VALUE,
  DATE_FORMAT,
  TIME_FORMAT,
  DATE_TIME_FORMAT,
  TIMEZONE_FORMAT
} from "../constants";

export const formatTime = date => {
  return moment(date)
    .utc()
    .format(DATE_TIME_FORMAT);
};

export const getEndDateFormatted = (date = null) => {
  const endTimeLocal = getEndDate(date).toDate();
  return formatTime(endTimeLocal);
};

export const getEndDateParts = (date = null) => {
  const now = date ? moment(date, DATE_TIME_FORMAT) : moment();

  return {
    date: now.format(DATE_FORMAT),
    time: date ? now.format(TIME_FORMAT) : DEFAULT_TIME_VALUE,
    timezone: now.format(TIMEZONE_FORMAT)
  };
};

export const getEndDate = (dateValue = null) => {
  const { date, time, timezone } = getEndDateParts(dateValue);
  return moment(`${date} ${time}${timezone}`, DATE_TIME_FORMAT);
};

export const cleanPayload = ({ choices, suggestion }) => {
  const preparedSuggestion = cleanSuggestion(suggestion);
  const preparedChoices = cleanChoices(choices);
  return { choices: preparedChoices, suggestion: preparedSuggestion };
};

export const cleanFinishedPayload = ({ choices, votesByRestaurantId }) => {
  choices.forEach(choice => {
    const voteValue = votesByRestaurantId[choice.restaurantId.toString()];
    choice.votes = voteValue ? voteValue : 0;
  });
  const choiceLeaderBoard = choices.sort((a, b) => {
    if (a.votes > b.votes) return -1;
    if (a.votes < b.votes) return 1;
    return 0;
  });

  const preparedWinner = cleanWinner(choiceLeaderBoard[0]);
  const preparedChoices = cleanFinishedChoices(choiceLeaderBoard);
  return { winner: preparedWinner, choices: preparedChoices };
};

const cleanSuggestion = suggestion => {
  const {
    restaurantId,
    name,
    averageReview,
    topReviewer: TopReviewer,
    review: Review
  } = suggestion;
  return { id: restaurantId, name, averageReview, TopReviewer, Review };
};
const cleanChoices = choices => {
  return choices.map(({ restaurantId, name, averageReview, description }) => ({
    id: restaurantId,
    name,
    averageReview,
    description
  }));
};
const cleanWinner = choice => {
  const datetime = formatTime(moment());
  const { restaurantId: id, name, votes } = choice;
  return { id, datetime, name, votes };
};
const cleanFinishedChoices = choices => {
  return choices.map(({ restaurantId: id, name, votes }) => {
    return { id, name, votes };
  });
};
