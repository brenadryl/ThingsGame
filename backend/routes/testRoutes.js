const connectToDb = require('../configs/db.config');

const getPrompts = async (req, res) => {
  try {
    let db = await connectToDb();
    const collection = db.collection(process.env.DB_COLLECTION);
    const data = await collection.find({}).sort({promptId: 1}).toArray();
    res.send({
      message: 'And the Backend too!',
      data
    });
  } catch (error) {
    console.error('Error accessing the database', error);
    res.status(500).send('Failed to fetch data');
  }
};

module.exports = {
  getPrompts,
};




// const collection = db.collection('prompts');

// // get all
// await collection.find().toArray();

// // get one (for example, by name
// await collection.findOne({ promptId: '28' });

// // create one
// await collection.insertOne({ promptId: '50', text: 'Things you would not want to hear from a doctor' });

// // create many
// await collection.insertMany([
//   { promptId: 55, text: 'Things you can fit in the microwave' },
//   { promptId: 56, text: 'Things you can build with your hands' }
// ]);

// // update one
// await collection.updateOne({ promptId: '55' }, { $set: { text: 'Things you can fit in your hands' } });

// // delete one
// // await collection.deleteOne({ promptId: '5' });

// // get all whose userId is less than 3
// await collection.find({ promptId: { $lt: 3 } }).toArray();

// // append '*' to user names whose id is in a list [2,3]
// // await collection.updateMany(
// //   { promptId: { $in: [2, 3] } },
// //   { $set: { name: { $concat: ['$text', '*'] } } }
// // );

// // delete all whose userId is an odd number
// // await collection.deleteMany({ promptId: { $mod: [2, 1] } });