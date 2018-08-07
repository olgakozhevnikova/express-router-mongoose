const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },

  // it has reference to the ID of the user document,
  // it takes the information about an author from User schema
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},{
  timestamps: true
});

const dishSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  price: {
    type: Currency,
    required: true,
    min: 0
  },
  field: {
    type: Boolean,
    default: false
  },
  // comments field is an array of the type commentSchema,
  // that means that every dish document has multiple number of comments (objects) stored in an array
  comments: [commentSchema]
},{
  timestamps: true // it automatically adds 2 timestamps - created at and updated at - into each document
});

// constructs a model from the schema
const Dishes = mongoose.model('Dish', dishSchema);

module.exports = Dishes;
