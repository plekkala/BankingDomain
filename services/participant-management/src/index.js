/**
 * Service entry point.
 */

'use strict';

const app  = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Participant Management Service listening on port ${PORT}`);
});
