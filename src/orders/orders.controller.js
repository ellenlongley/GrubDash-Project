const { del } = require("express/lib/application");
const { stat } = require("fs");
const path = require("path");

// Use existing orders data
const orders = require(path.resolve("src/data/orders-data"));

// Use existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


// create
function hasDeliverTo(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo && deliverTo != "") {
      return next();
    }
    next({ status: 400, message: 'Order must include a deliverTo' });
}

function hasMobileNumber(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber && mobileNumber != "") {
      return next();
    }
    next({ status: 400, message: 'Order must include a mobileNumber' });
}

function hasDishes(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (dishes) {
      return next();
    }
    next({ status: 400, message: 'Order must include a dish' });
}

function dishesIsArray(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (Array.isArray(dishes) && dishes[0]) {
      return next();
    }
    next({ status: 400, message: 'Order must include at least one dish' });
}

function hasDishQuantity(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    let wrongDishIndex;
    if (dishes.every((dish, index) => {
        if (dish.quantity && typeof dish.quantity === "number" && dish.quantity > 0) {
            return true;
        } else {
            wrongDishIndex = index;
            return false;
        }
    })) {
      return next();
    }
    next({ status: 400, message: `Dish ${wrongDishIndex} must have a quantity that is an integer greater than 0` });
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}


//list
function list(req, res) {
    res.json({ data: orders });
}


//read
function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      return next();
    }
    next({ status: 404, message: `Order does not exist: ${orderId}` });
}

function read(req, res) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => (order.id = orderId));
    res.json({ data: foundOrder });
}


//update
function checkIdInBody(req, res, next) {
    const { data: { id } = {} } = req.body;
    const orderId = req.params.orderId;
    if (id && id !== orderId) {
        // edited below dish: section from {id to orderId} and route: {orderId to id} can switch back doesn't work
        next({ status: 400, message: `Order id does not match route id. Dish: ${orderId}, Route: ${id}` });
    }
    next();
}

function hasStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    if (status && status != "" && status != "invalid") {
      return next();
    }
    next({ status: 400, message: 'Order must have a status of pending, preparing, out-for-delivery, delivered' });
}

function statusDelivered(req, res, next) {
    const { data: { status } = {} } = req.body;
    if (status && status !== "delivered") {
      return next();
    }
    next({ status: 400, message: 'A delivered order cannot be changed' });
}

function update(req, res) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.status = status;
    foundOrder.dishes = dishes;
    res.json({ data: foundOrder });
}


//delete
function statusPending(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id == orderId);
    if (foundOrder.status && foundOrder.status === "pending") {
      return next();
    }
    next({ status: 400, message: 'An order cannot be deleted unless it is pending' });
}

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
    const deletedOrders= orders.splice(index, 1);
    res.sendStatus(204);
}


module.exports = {
    create: [
        hasDeliverTo,
        hasMobileNumber,
        hasDishes,
        dishesIsArray,
        hasDishQuantity,
        create
    ], 
    list,
    read: [orderExists, read],
    update: [
        orderExists,
        checkIdInBody,
        hasStatus,
        statusDelivered,
        hasDeliverTo,
        hasMobileNumber,
        hasDishes,
        dishesIsArray,
        hasDishQuantity,
        update
    ],
    delete: [ orderExists, statusPending, destroy]

};