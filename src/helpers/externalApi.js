import request from "request";
import fs from "fs";

const BASE_URL = "https://interview-project-17987.herokuapp.com/api";
const RESTAURANTS = `${BASE_URL}/restaurants`;
const REVIEWS = `${BASE_URL}/reviews`;

// const BASE_PATH = "/Users/davidvezzani/projects/lunchinator-3000/be/data";
// const RESTAURANTS_PATH = `${BASE_PATH}/restaurants.json`;
// const REVIEWS_PATH = `${BASE_PATH}/reviews.json`;

const fetch = (url, callback) => {
  console.log("url", url);
  var options = {
    url,
    headers: { "Content-Type": "application/json" }
  };

  request(options, callback);
};

export const getRestaurants = callback => {
  // fs.readFile(RESTAURANTS_PATH, (err, data) => {
  //   callback(null, JSON.parse(data));
  // });

  fetch(RESTAURANTS, (error, response, body) => {
    callback(error, JSON.parse(body));
  });
};

export const getRestaurant = (name, callback) => {
  const urlEncodedName = encodeURIComponent(name);
  fetch(`${RESTAURANTS}/${urlEncodedName}`, (error, response, body) => {
    callback(error, JSON.parse(body));
  });
};

export const getReviews = callback => {
  // fs.readFile(REVIEWS_PATH, (err, data) => {
  //   callback(null, JSON.parse(data));
  // });

  fetch(REVIEWS, (error, response, body) => {
    callback(error, JSON.parse(body));
  });
};

export const getReview = (restaurantName, callback) => {
  const urlEncodedRestaurantName = encodeURIComponent(restaurantName);
  fetch(`${REVIEWS}/${urlEncodedRestaurantName}`, (error, response, body) => {
    callback(error, JSON.parse(body));
  });
};
