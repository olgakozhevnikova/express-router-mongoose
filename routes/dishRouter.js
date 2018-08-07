const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/')
// get request is allowed to any user without restrictions
.get((req, res, next) => {
  Dishes.find({})
  // when the dish is constructed, I populate author field from User document
  .populate('comments.author')
  .then((dishes) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    // get dishes and sends it back as json response
    res.json(dishes);
  }, (err) => next(err)) // if error is returned, we pass it to application error handler
  .catch((err) => next(err));
})
// post request requires authentication.
// when there is a post request, first execute authenticate.verifyUser middleware,
// if it is successful, proceed,
// if authentication failes, then passport authenticate will send an error message to a user
.post(authenticate.verifyUser, (req, res, next) => {
  Dishes.create(req.body)
  .then((dish) => {
    // console.log('Dish created ', dish);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end('PUT operation is not supported on /dishes');
})
.delete(authenticate.verifyUser, (req, res, next) => {
  Dishes.remove({})
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));  
});

// Actions for /:dishId endpoint
dishRouter.route('/:dishId')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .populate('comments.author')
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => next(err));  
})
.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation is not supported on /dishes/' + req.params.dishId);
})
.put(authenticate.verifyUser, (req, res, next) => {
  Dishes.findByIdAndUpdate(req.params.dishId,
    { $set: req.body },
    { new: true }
  )
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
  Dishes.findByIdAndRemove(req.params.dishId)
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .populate('comments.author')
  .then((dish) => {
    if (dish != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments);
    }
    else {
      err = new Error('Dish ' + req.params.dishId + ' does not exist.');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if (dish != null) {
      // by authenticating a user above, I already know which user is posting a comment
      req.body.author = req.user._id;
      dish.comments.push(req.body);
      dish.save()
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);
      }, (err) => next(err))
    }
    else {
      err = new Error('Dish ' + req.params.dishId + ' does not exist.');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end('PUT operation is not supported on /dishes/' + req.params.dishId + '/comments');
})
.delete(authenticate.verifyUser, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if (dish != null) {
      for (let i = (dish.comments.length - 1); i >= 0; i--) {
        // the way to access subdocument and remove each subdocument (comment) from an array of subdocuments (comments)
        dish.comments.id(dish.comments[i]._id).remove();
      }
      dish.save()
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);
      }, (err) => next(err));
    }
    else {
      err = new Error('Dish ' + req.params.dishId + ' does not exist.');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));  
});

dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .populate('comments.author')
  .then((dish) => {
    // both dish and comments exist
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments.id(req.params.commentId));
    }
    // dish doesn't exist
    else if (dish == null) {
      err = new Error('Dish ' + req.params.dishId + ' does not exist.');
      err.status = 404;
      return next(err);
    }
    // dish exists, but comments do not exist
    else {
      err = new Error('Comment ' + req.params.commentId + ' not found.');
      err.status = 404;
      return next(err);
    }    
  }, (err) => next(err))
  .catch((err) => next(err));  
})
.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation is not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    // both dish and comments exist
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
      // a user can change either rating...
      if (req.body.rating) {
        dish.comments.id(req.params.commentId).rating = req.body.rating;
      }
      // ... or comment
      if (req.body.comment) {
        dish.comments.id(req.params.commentId).comment = req.body.comment;
      }
      // after updating rating and/or comment, save the dish
      dish.save()
      // after saving the dish, send a reply
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err));
    }
    // dish doesn't exist
    else if (dish == null) {
      err = new Error('Dish ' + req.params.dishId + ' does not exist.');
      err.status = 404;
      return next(err);
    }
    // dish exists, but comments do not exist
    else {
      err = new Error('Comment ' + req.params.commentId + ' not found.');
      err.status = 404;
      return next(err);
    }    
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
      dish.comments.id(req.params.commentId).remove();
      // save the dish after removing a comment
      dish.save()
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err));
    }
    // dish doesn't exist
    else if (dish == null) {
      err = new Error('Dish ' + req.params.dishId + ' does not exist.');
      err.status = 404;
      return next(err);
    }
    // dish exists, but comments do not exist
    else {
      err = new Error('Comment ' + req.params.commentId + ' not found.');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = dishRouter;
