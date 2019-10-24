'use strict';

exports.up = async database => {

	// Create the results table
	await database.schema.createTable('results', table => {

		// Meta information
		table.string('id').unique().primary();
		table.timestamp('created_at').defaultTo(database.fn.now());
		table.string('task_id');
		table.string('runner');
		table.string('issue_code');
		table.string('issue_element');
	});

};

exports.down = async database => {
	await database.schema.dropTable('results');
};
