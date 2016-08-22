// Create an error to throw if needed
const error = new Error('Missing Auth Token!');

/**
 * Helper function to create token map used below.
 * Maps the same token to multiple files.
 *
 * @param {Array} ids box file ids
 * @param {String} token
 * @returns {Object}
 */
function createIdTokenMap(ids, token) {
    const tokenMap = {};
    ids.forEach((id) => {
        tokenMap[id] = token; // all files use the same token
    });
    return tokenMap;
}

/**
 * Grab the token from the saved preview options to parse it.
 * The token can either be a simple string or a function that returns
 * a promise which resolves to a key value map where key is the file
 * id and value is the token. The function accepts either a simple id
 * or an array of file ids
 *
 * @param {String|Array} id box file id(s)
 * @param {String|Function} token
 * @returns {void}
 */
export default function getTokens(id, token) {
    // Auth token should be available
    if (!token || !id) {
        return Promise.reject(error);
    }

    let ids = [id];

    // If instead id(s) were passed in, we fetch those
    // This will be the use case for prefetch and viewers
    // Normalize to an array so that we always deal with ids
    if (Array.isArray(id)) {
        ids = id;
    }

    return new Promise((resolve, reject) => {
        if (typeof token === 'function') {
            // Token may be a function that returns a promise
            token(ids).then((tokens) => {
                // Resolved tokens can either be a map of { id: token }
                // or it can just be a single string token that applies
                // to all the files irrespective of the id.
                if (typeof tokens === 'string') {
                    // String token which is the same for all files
                    resolve(createIdTokenMap(ids, tokens));
                } else {
                    // Iterate over all the requested file ids
                    // and make sure we got them back otherwise
                    // throw and error about missing tokens
                    if (!ids.every((fileId) => !!tokens[fileId])) {
                        reject(error);
                    }
                    resolve(tokens);
                }
            });
        } else {
            // Token may just be a string, create a map
            // from id to token to normalize. In this case
            // the value is going to be the same for all files
            resolve(createIdTokenMap(ids, token));
        }
    });
}
