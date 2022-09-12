const path = require("path");

// Use existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

//use existing orders data
const orders = require(path.resolve("src/data/orders-data"));

//Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


//create
function hasName(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name && name != "") {
      return next();
    }
    next({ status: 400, message: 'Dish must include a name' });
}

function hasDescription(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description && description != "") {
      return next();
    }
    next({ status: 400, message: 'Dish must include a description' });
}

function hasPrice(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (price) {
      return next();
    }
    next({ status: 400, message: 'Dish must include a price' });
}

function priceGreaterThanZero(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (typeof price === "number" && price > 0) {
        return next();
    }
    next({ status: 400, message: 'Dish must have a price that is an integer greater than 0' });
}

function hasImage(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (image_url && image_url != "") {
      return next();
    }
    next({ status: 400, message: 'Dish must include a image_url' });
}

function create(req, res) {
    const { data: { description, name, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        description,
        name,
        price,
        image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}


//list
function list(req, res) {
    res.json({ data: dishes });
}


//read
function dishExists(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      return next();
    }
    next({ status: 404, message: `Dish does not exist: ${dishId}` });
}

function read(req, res) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => (dish.id = dishId));
    res.json({ data: foundDish });
}


//update
function checkIdInBody(req, res, next) {
    const { data: { id } = {} } = req.body;
    const dishId = req.params.dishId;
    if (id && id !== dishId) {
        // edited below dish: section from {id to dishId} and route: {dishId to id} can switch back doesn't work
        next({ status: 400, message: `Dish id does not match route id. Dish: ${dishId}, Route: ${id}` });
    }
    next();
}

function update(req, res) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    const { data: { description, name, price, image_url } = {} } = req.body;
    foundDish.description = description;
    foundDish.name = name;
    foundDish.price = price;
    foundDish.image_url = image_url;
    res.json({ data: foundDish });
}


module.exports = {
    create: [
        hasName, 
        hasDescription, 
        hasPrice, 
        priceGreaterThanZero, 
        hasImage,
        create
    ],
    list,
    read: [dishExists, read],
    update: [
        dishExists,
        checkIdInBody,
        hasName,
        hasDescription,
        hasPrice,
        priceGreaterThanZero,
        hasImage,
        update
    ],
    dishExists,
};