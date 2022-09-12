const express = require("express");

const router = require("express").Router();
const controller = require("./orders.controller");

const errorHandler = require("../errors/errorHandler");
const notFound = require("../errors/notFound");
const methodNotAllowed = require("../errors/methodNotAllowed");

const app = express();


router.route("/:orderId").get(controller.read).put(controller.update).delete(controller.delete).all(methodNotAllowed);

router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);


app.use(notFound);
app.use(errorHandler);

module.exports = router;
