var express = require("express");
var router = express.Router();
import moment from "moment";
import { createBallot, getBallot, castVote } from "../src/helpers/internalApi";

/* GET home page. */
router.post("/create-ballot", createBallot);
router.get("/ballot/:id", getBallot);
router.post("/vote", castVote);

module.exports = router;
