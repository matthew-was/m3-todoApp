
exports.up = function(knex, Promise) {

    return Promise.all([

        knex.schema.createTable('todos', function(table) {
            table.increments('id').primary();
            table.string('title');
            table.boolean('completed');
        }),
    ])
};

exports.down = function(knex, Promise) {  
    return Promise.all([
        knex.schema.dropTable('todos'),
    ])

  
};
