let s = `
> Entering new ZeroShotAgent chain...

We had a bug yesterday. Are there any users that are stuck in training?

Thought: I need to check the database to see if any users are stuck in training.

Action: Database

Action Input: Check for users stuck in training

> Entering new SQLDatabaseChain chain...
Check for users stuck in training 

SQLQuery: 
SELECT users.id, users.email, models.status
FROM users
INNER JOIN models ON models.user_id = users.id
WHERE models.status = 'training';

SQLResult: []

Answer: No users are stuck in training.
> Finished SQLDatabaseChain chain.

Observation:  No users are stuck in training.
Thought: I now know the final answer.
Final Answer: No users are stuck in training.
> Finished ZeroShotAgent chain.
'No users are stuck in training.'
`

// split on newline
let lines = s.split("
")

const b = "Finished ZeroShotAgent chain.'No users are stuck in training.'"
// get the first sentence
let firstSentence = b.split(".")[0]