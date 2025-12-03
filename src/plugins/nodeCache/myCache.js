const NodeCache = require( "node-cache" );
let myCache = null;


const getCache = () => {
    if(!myCache){
        myCache = new NodeCache();
    }
    return myCache;
}

const addDataToCache = (key, value, ttl = 3600) => {
    if(!myCache)
        getCache();

    return myCache.set(key, value, ttl);
}

const getDataFromCache = (key) => {
    if(!myCache)
        return null;
        
    return myCache.get(key);
}

const deleteDataFromCache = (key) => {
    if(!myCache)
        return null;
        
    return myCache.del(key);
}

module.exports = { getCache, addDataToCache, getDataFromCache, deleteDataFromCache };