const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./models/Project');

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const result = await Project.updateMany(
      { status: 'In Development' },
      { $set: { status: 'Completed' } }
    );
    
    console.log(`Migration complete: ${result.modifiedCount} projects updated.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
