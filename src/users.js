const express = require('express');
const router = express.Router();

idCounter = 0;

users = [];

router.get('/', async function(request, response) {
  response.json(users);
});

router.get('/:id', async function(request, response) {
  var id = request.params.id;

  var userIndex = findUserIndexById(id);

  response.json(users[userIndex]);
});

router.post('/', async function(request, response) {
  var newUser = {
    id: idCounter,
    firstName: request.body['firstName'],
    lastName: request.body['lastName'],
    age: request.body['age'],
    weight: request.body['weight']
  }

  users.push(newUser)

  idCounter = idCounter + 1

  console.log(newUser)
  response.json(newUser)
});

router.put('/:id', async function(request, response) {
  var id = request.params.id;

  var userIndex = findUserIndexById(id);

  var user = users[userIndex];
  user['firstName'] = request.body['firstName'];
  user['lastName'] = request.body['lastName'];
  user['age'] = request.body['age'];
  user['weight'] = request.body['weight'];

  console.log(user);
  response.json(user);
});

router.delete('/:id', async function(request, response) {
  var id = request.params.id;

  var userIndex = findUserIndexById(id);

  users.splice(userIndex, 1);

  response.json({ msg: 'Deleted user' });
});

function findUserIndexById(id) {
  for (var i = 0; i < users.length; i++) {
    var user = users[i];

    if (user['id'] == id) {
      return i;
    }
  }
}

module.exports = router;
