const router = require('express').Router();
const { OpenAI } = require('openai');

const { Task, User, CompletedTask } = require('../../models');

const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const taskData = await Task.findAll({
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'id', 'email'] }
        }        
      ],
      attributes: { exclude: ['user_id'] },
    });

    if (!taskData.length) {
      res
        .status(400)
        .json({ message: 'No tasks! Check back later.' });
      return;
    } else {
      return res.status(200).json(taskData);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/incompleteCount', async (req, res) => {
  try {
    const taskData = await Task.count({
      attributes: { exclude: ['user_id'] },
      where: {
        complete_date: null,
        user_id: req.session.user_id,
      }
    });

    if (!taskData) {
      res
        .status(400)
        .json({ message: 'No tasks! Check back later.' });
      return;
    } else {
      return res.status(200).json(taskData);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/completeCount', async (req, res) => {
  try {
    const taskData = await CompletedTask.count({
      where: { 
        user_id: req.session.user_id,
      }
    });

    if (!taskData) {
      res
        .status(400)
        .json({ message: 'No tasks! Check back later.' });
      return;
    } else {
      return res.status(200).json(taskData);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/completeCount/:priority', async (req, res) => {
  try {
    const taskData = await CompletedTask.count({
      where: { 
        priority: req.params.priority,
        user_id: req.session.user_id,
       }
    });

    if (!taskData) {
      res
        .status(400)
        .json({ message: 'No tasks! Check back later.' });
      return;
    } else {
      return res.status(200).json(taskData);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const taskData = await Task.findByPk(req.params.id);

    if (!taskData) {
      res
        .status(400)
        .json({ message: 'No tasks! Check back later.' });
      return;
    } else {
      return res.status(200).json(taskData);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// Get all tasks for a user
// Optional query parameters "complete", "priority", "dueAfter", and "dueBefore", "createdAfter", "createdBefore"
// "complete" can be either "yes" or "no", to get only completed or incomplete tasks.
// "after" and "before" are dates.
router.get('/user/:id', async (req, res) => {

  let user_id = req.params.id || req.session.user_id;
  if (user_id === 'me') {user_id = req.session.user_id};
  
  let where = {user_id}

  switch (req.query.complete) {
    case 'yes':
      where.complete_date = {[Op.not]: null}
      break;
    case 'no':
      where.complete_date = null
      break;
  }

  if (req.query.priority) {
    where.priority = req.query.priority
  }

  const dueAfter = req.query.dueAfter ? new Date(decodeURIComponent(req.query.dueAfter)) : undefined;
  const dueBefore = req.query.dueBefore ? new Date(decodeURIComponent(req.query.dueBefore)) : undefined;
  const createdAfter = req.query.createdAfter ? new Date(decodeURIComponent(req.query.createdAfter)) : undefined;
  const createdBefore = req.query.createdBefore ? new Date(decodeURIComponent(req.query.createdBefore)) : undefined;

  if (dueAfter && dueBefore) {
    if (dueBefore <= dueAfter) {
      res
        .status(400)
        .json({ message: 'Make sure the dueBefore date is later than the dueAfter date.' });
      return;
    }
    where.due_date = {
      [Op.between]: [dueAfter, dueBefore]
    }
  } else if (dueAfter) {
    where.due_date = {
      [Op.gte]: dueAfter
    }
  } else if (dueBefore) {
    where.due_date = {
      [Op.lte]: dueBefore
    }
  }

  if (createdAfter && createdBefore) {
    if (createdBefore <= createdAfter) {
      res
        .status(400)
        .json({ message: 'Make sure the createdBefore date is later than the createdAfter date.' });
      return;
    }
    where.createdAt = {
      [Op.between]: [createdAfter, createdBefore]
    }
  } else if (createdAfter) {
    where.createdAt = {
      [Op.gte]: createdAfter
    }
  } else if (createdBefore) {
    where.createdAt = {
      [Op.lte]: createdBefore
    }
  }

  try {
    const taskData = await Task.findAll({
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'id', 'email'] }
        }        
      ],
      attributes: { exclude: ['user_id'] },
      where,
    });

    if (!taskData.length) {
      res
        .status(400)
        .json({ message: 'No tasks with those criteria! Check back later.' });
      return;
    } else {
      return res.status(200).json(taskData);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/', async (req, res) => {
   try {
    // var due_date;
    // if (req.body.due_date = '') {
    //   due_date = null;
    // } else {
    //   due_date = new Date(req.body.due_date);
    // }
    // console.log(due_date);
    const newTask = await Task.create({
      title: req.body.title,
      body: req.body.body,
      due_date: req.body.due_date,
      priority: req.body.priority,
      points: req.body.points,
      minutes: req.body.minutes,
      user_id: req.session.user_id
    });
    res.status(200).json("Successfully created task.");
  } catch (err) {
    res.status(400).json(err);
  }
})


router.post('/generate', async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY// This is the default and can be omitted
    });
    const taskParameters = {
      prompt: `Generate a random task parameters for shortTitle and body, with appropriate values for the rest of the parameters returning a defined JSON string using JavaScript JSON.parse(response) with following parameters, for example:
      '{
        "task": {
          "title": shortTitle, // A short title for the task, be creative and choose tasks that are generally applicable to people in general, not specific to a single person or group of people,
          "body": body, // A longer description of the task,
          "priority": rand(1, 5), // A priority from 1 to 5,
          "due_date": futureDate // A due date for the task,
          "minutes": rand(1, 120), // The number of minutes the task will take,
          "points": rand(1, 1000) // The number of points the task is worth
        }
      }'.
      
      Strip everything but the JSON object. Check to make sure the JSON you provided is valid and matches the format. It should start with [ and end with ], and only contain an object. If not, fix it and send just the JSON again."`
    }
    console.log("Task parameters: " + taskParameters);
    const solution = await openai.chat.completions.create({
      messages: [{ role: 'assistant', content: taskParameters.prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 1,
      max_tokens: 100
    });
    const solutionText = solution.choices[0].message.content.replace("```json", '').replace("```", '');
    console.log(solutionText);
    try {
      const solutionArray = JSON.parse(solutionText);
      return res.status(200).json(solutionArray);
    
    } catch (error) {
      console.log(error);
      console.log(solutionText);

      console.log("Failed to parse JSON solution.");
      console.log(error);
      return error + "There was an error generating a solution. Please try again.";
    };
  } catch (error) {
    console.log("Failed to get solution.");
    console.log(error);
    return error + "There was an error generating a solution. Please try again.";
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task_id = req.params.id;
    const taskToDelete = await Task.findByPk(task_id);
    const taskTitle = taskToDelete.title;

    if (req.session.user_id !== taskToDelete.user_id) {
      res
        .status(400)
        .json({ message: 'You can only delete your own tasks.' });
      return;
    }

    const deletedRows = await Task.destroy({
      where: {
        id: task_id,
      },
    });
    
    if (deletedRows > 0) {
      res.status(200).json(`Task "${taskTitle}" deleted successfully`);
    } else {
      res.status(400).json(`Task with ID ${task_id} not found`);
    }
  } catch (err) {
    res.status(400).json(err);
  }
})

router.put('/:id', async (req, res) => {
  try {
    const task_id = req.params.id;
    const taskToUpdate = await Task.findByPk(task_id);

      if (req.session.user_id !== taskToUpdate.user_id) {
        res
          .status(400)
          .json({ message: 'You can only update your own tasks.' });
        return;
      }

      taskToUpdate.set({
        title: req.body.title || taskToUpdate.title,
        body: req.body.body || taskToUpdate.body,
        due_date: new Date(req.body.due_date) || taskToUpdate.due_date,
        complete_date: new Date(req.body.complete_date) || taskToUpdate.complete_date,
        priority: req.body.priority || taskToUpdate.priority,
        points: req.body.points || taskToUpdate.points,
        minutes: req.body.minutes || taskToUpdate.minutes,
      })
      
      taskToUpdate.save();
      res.status(200).json("Success.");
    } catch (err) {
      res.status(400).json(err);
    }
  }
)

// Special update route to toggle a task.
router.put('/complete/:id',  async (req, res) => {
  try {
    const task_id = req.params.id;
    const taskToUpdate = await Task.findByPk(task_id);

    if (+req.session.user_id !== +taskToUpdate.user_id) {
      res
        .status(400)
        .json({ message: 'You can only update your own tasks.' });
      return;
    }

    // Toggle completion state
    if (taskToUpdate.complete_date) {
      taskToUpdate.complete_date = null;
    } else {
      taskToUpdate.complete_date = new Date();
    }

    // the user's total points are updated in the models' hooks.

    await taskToUpdate.save();
    res.json(taskToUpdate);

  } catch (err) {
    res.status(400).json(err);
  }
})

// Special update route to snooze a task.
router.put('/snooze/:id', 
  async (req, res) => {
    let days = req.query.days || 0;
    let hours = req.query.hours || 0;
    let minutes = req.query.minutes || 0;

    // default snooze 1 day
    // but maybe someone wants to snooze for 0 time??
    // if (days+hours+minutes === 0) {days = 1};

    try {
      const task_id = req.params.id;
      const taskToUpdate = await Task.findByPk(task_id);

      let dueDate = new Date(taskToUpdate.due_date);
      dueDate.setDate(dueDate.getDate() + days);
      dueDate.setHours(dueDate.getHours() + hours);
      dueDate.setMinutes(dueDate.getMinutes() + minutes);

      taskToUpdate.due_date = dueDate;

      await taskToUpdate.save();
      res.json(taskToUpdate);

    } catch (err) {
      res.status(400).json(err);
    }
  }
)


module.exports = router;
