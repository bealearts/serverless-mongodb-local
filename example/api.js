const { list } = require('./store');

exports.get = async function get() {
  try {
    const items = await list();
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(items)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify('Unexpected Error')
    };
  }
};
