const mongoose = require('mongoose');
const uri = "mongodb://hetroycg_db_user:het1234567890@ac-jyu8rux-shard-00-00.ecnzslj.mongodb.net:27017,ac-jyu8rux-shard-00-01.ecnzslj.mongodb.net:27017,ac-jyu8rux-shard-00-02.ecnzslj.mongodb.net:27017/snipforge?ssl=true&replicaSet=atlas-ojftyk-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS! Connected to MongoDB Atlas.");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILED TO CONNECT", err);
    process.exit(1);
  });
