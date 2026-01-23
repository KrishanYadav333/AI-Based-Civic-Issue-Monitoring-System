/**
 * MongoDB Models Index
 * Exports all models
 */

const User = require('./User');
const Ward = require('./Ward');
const Issue = require('./Issue');
const IssueLog = require('./IssueLog');
const IssueType = require('./IssueType');

module.exports = {
    User,
    Ward,
    Issue,
    IssueLog,
    IssueType
};
