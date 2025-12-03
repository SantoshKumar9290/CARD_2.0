/* global mongodb;
 * FileName @mongoose.service
 * author @Criticl River
 * <summary>
 *  A service is used to connect database, check connection if failed to connect it will retry to connect again.
 *  <npm>
 *      @log4js {Used for logging debug,information and errors in mongoose module}
 *      @mongoose {Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. Mongoose supports both promises and callbacks}
 *  </npm>
 * </summary>
 */

const mongoose = require('mongoose');
const env = require('dotenv');
mongoose.set('strictQuery', true);
env.config();

// const uri = 'mongodb+srv://hmr_cruser:hmr_cruser%40123@hmrcluster.gz42my3.mongodb.net/PDE?retryWrites=true&w=majority';
let count = 0;

const options = {
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    useNewUrlParser: true
};

const connectWithRetry = async () => {
    console.log('MongoDB connection with retry')
    try{
        // mongodb connection string
        // const con = await mongoose.connect("mongodb://" + process.env.MONDODB_HOST + ":" + process.env.MONDODB_PORT + "/" + process.env.MONGODB_DB, {
        const con = await mongoose.connect(process.env.MONGO_DB_CFMS, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB connected : ${process.env.MONGO_DB_CFMS}`);
    }catch(err){
        console.log(err);
        console.log('MongoDB connection unsuccessful, retry after 5 seconds. ', ++count);
    }
};

connectWithRetry();

exports.mongoose = mongoose;
