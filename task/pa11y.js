'use strict';

const async = require('async');
const chalk = require('chalk');
const {CronJob} = require('cron');

module.exports = initTask;
exports.runPa11yOnTasks = runPa11yOnTasks;

// Initialise the task
function initTask(config, app) {
	if (!config.cron) {
		config.cron = '0 30 0 * * *'; // 00:30 daily
	}
	const job = new CronJob(config.cron, taskRunner.bind(null, app));
	job.start();
}

// Runs the task
async function taskRunner(app) {
	console.log('');
	console.log(chalk.grey('Starting to run task @ %s'), new Date());

	try {
		const tasks = await app.model.task.getAll();
		runPa11yOnTasks(tasks, app);
	} catch (error) {
		console.error(chalk.red('Failed to run task: %s'), error.message);
		console.log('');
		process.exit(1);
	}
}

// Runs an array of pa11y tasks
function runPa11yOnTasks(tasks, app) {
	if (tasks.length === 0) {
		console.log('No pa11y tasks to run');
		return;
	}

	const worker = async task => {
		console.log('Starting pa11y task %s', task.id);
		try {
			await app.model.task.runById(task.id);
			console.log(chalk.green('Finished pa11y task %s'), task.id);
		} catch (error) {
			console.log(chalk.red('Failed to finish pa11y task %s: %s'), task.id, error.message);
		}
	};

	const queue = async.queue(worker, 2);
	queue.push(tasks);

	queue.drain(() => {
		console.log(chalk.grey('Finished running pa11y tasks @ %s'), new Date());
	});
}
