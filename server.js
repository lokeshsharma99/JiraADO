const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/jira', async (req, res) => {
    try {
        const response = await axios.get('https://lokeshsharma99.atlassian.net/rest/api/3/search?jql=filter=10001', {
            headers: {
                'Authorization': 'Basic ' + Buffer.from('swarnim.lokesh.sharma99@gmail.com:ATATT3xFfGF0oIqlu95M19RlnZlP6fF2UR57iFkzmvjlAd1-ENVKchz-gH4xIYAn0ev9WE4rrNoaodbywMbL4LgoA8lIiERu2F7YIOcKEzEst56feKd2D0XPZ4w86s3c8yuqgTctLhzo4wRMmYT6_jFQXPo56_pkfVTUa_JmL3liJ9MckRMh6G0=1DF63E20').toString('base64'),
                'Accept': 'application/json'
            },
            params: {
                fields: 'summary,status,issuetype,project,parent,customfield_10016,customfield_10020,customfield_10026,description,issuelinks'
            }
        });

        const issues = response.data.issues.map(issue => {
            const parentSummary = issue.fields.parent ? issue.fields.parent.fields.summary : null;
            const storyPoints = issue.fields.customfield_10016 || null;
            const description = issue.fields.description || '';

           

            const linkedIssues = (issue.fields.issuelinks || []).map(link => {
                const linkedIssue = link.outwardIssue || link.inwardIssue;
                return linkedIssue ? {
                    key: linkedIssue.key,
                    summary: linkedIssue.fields.summary,
                    status: linkedIssue.fields.status.name
                } : null;
            }).filter(link => link);

            return {
                key: issue.key,
                fields: {
                    summary: issue.fields.summary,
                    status: issue.fields.status,
                    issuetype: issue.fields.issuetype,
                    project: issue.fields.project,
                    parent: parentSummary,
                    storyPoints: storyPoints,
                    customfield_10020: issue.fields.customfield_10020,
                    description: description,
                    //testCase: testCase,
                    linkedIssues: linkedIssues
                }
            };
        });

        const filePath = path.join(__dirname, 'issues.json');
        fs.writeFileSync(filePath, JSON.stringify({ issues }, null, 2));

        res.download(filePath, 'issues.json', (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = 3000;

app.listen(port, () => {
    console.log(`Proxy server running on http://localhost:${port}/jira`);
});
