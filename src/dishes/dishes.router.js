const express = require("express");

const router = require("express").Router();
const controller = require("./dishes.controller");

const errorHandler = require("../errors/errorHandler");
const notFound = require("../errors/notFound");
const methodNotAllowed = require("../errors/methodNotAllowed");

const app = express();


router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed);
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);


app.use(notFound);
app.use(errorHandler);

module.exports = router;
