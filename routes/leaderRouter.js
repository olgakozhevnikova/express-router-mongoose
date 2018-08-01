const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-type', 'text/plain');
  next();
})
.get((req, res) => {
  res.end('Will send all the leaders to you!')
})
.post((req, res) => {
  res.end('Will add the leaders: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res) => {
  res.end('PUT operation is not supported on /leaders');
})
.delete((req, res) => {
  res.end('Deleting all the leaders!');
});

leaderRouter.route('/:leaderId')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-type', 'text/plain');
  next();
})
.get((req, res) => {
  res.end('Will send the details of the leader: ' + req.params.leaderId + ' to you');
})
.post((req, res) => {
  res.end('POST operation is not supported on /leaders/' + req.params.leaderId)
})
.put((req, res) => {
  res.write('Updating the leaders: ' + req.params.leaderId)
  res.end('Will update the leaders: ' + req.body.name + ' with details: ' + req.body.description);
})
.delete((req, res) => {
  res.end('Deleting the promotion: ' + req.params.leaderId);
});

module.exports = leaderRouter;
