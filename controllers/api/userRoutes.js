const router = require('express').Router();
const { User } = require('../../models');

router.post('/login', async (req, res) => {
  try {
    // Find the user who matches the posted e-mail address
    const userData = await User.scope('loginScope').findOne({
      where: { username: req.body.username },
      // include: [
      //   {
      //     model: User,
      //     attributes: ['username', 'password']
      //   }
      // ]
    });
    console.log(userData);
    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect username or password, please try again' });
      return;
    }

    // Verify the posted password with the password store in the database
    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect username or password, please try again' });
      return;
    }

    // Create session variables based on the logged in user
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/create', async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password
    });
    res.status(200).json("Successfully created account.");
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/profile', async (req, res) => {
  try {
    const result = await User.update(
      { username: req.body.username,  
        icon: req.body.icon  
      },
      { where: { id: req.session.user_id } }
    )
    res.status(200).json("Successfully updated profile.");
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/logout', (req, res) => {
  if (req.session.logged_in) {
    // Remove the session variables
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

router.get('/', async (req, res) => {
try {
  const userData = await User.findAll({attributes: { exclude: ['password', 'user_id'] }})
  if (!userData) {
    res
      .status(400)
      .json({ message: 'No users exist.' });
    return;
  } else {
    return res.status(200).json(userData);
  }
} catch (err) {
  res.status(400).json(err);
}
})

module.exports = router;
