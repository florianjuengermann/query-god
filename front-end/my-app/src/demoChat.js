export const demoChat = [
  {
    user: "human",
    text: "We had a server problem yesterday, are there some users who are stuck in training?",
  },
  {
    user: "bot",
    text: "I found 600 users whose models currently have status TRAINING . This is the SQL query that I ran and its output",
    code: {
      code: "SELECT * FROM models WHERE status = 'TRAINING'",
      language: "sql",
      executable: false,
    },
    debug: `
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
    `,
    tableOutput: [
      {
        id: 1,
        name: "model1",
        status: "TRAINING",
        created_at: "2021-01-01 00:00:00",
      },
      {
        id: 2,
        name: "model2",
        status: "TRAINING",
        created_at: "2021-01-01 00:00:00",
      },
    ],
  },
  {
    user: "human",
    text: "Great can you rekick thier models?",
  },
  {
    user: "bot",
    text: "Sure! This code will rekick all of the models that are stuck in training.",
    code: {
      code: `
    for user_id in user_ids:
    # Call the API to rekick the user
    # Replace "API_URL" with the actual URL of the API
    response = requests.post("API_URL", json={"user_id": user_id})
    if response.status_code != 200:
        # Handle the error if the API call fails
        print(f"Error rekicking user {user_id}: {response.text}")
    `,
      language: "python",
      executable: true,
    },
    debug: `
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
    `,
  },
];
