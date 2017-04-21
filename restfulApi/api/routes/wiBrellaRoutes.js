'use strict';
module.exports = function(app) {
  var WiBrella = require('../controllers/wiBrellaController');


  app.route('/measurements')
    .get(WiBrella.get_all_measurements)
    .post(WiBrella.create_a_measurement);

  app.route('/sources')
    .post(WiBrella.create_a_source);

  // app.route('/tasks/:taskId')
  //   .get(WiBrella.read_a_task)
  //   .put(WiBrella.update_a_task)
  //   .delete(WiBrella.delete_a_task);
};
