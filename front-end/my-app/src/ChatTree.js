import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
// emotion import
import { css } from "@emotion/react";
// styled
import styled from "@emotion/styled";
import { Switch } from "antd";

const ChatTreeWrapper = styled.div``;

const SettingsWrapper = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  padding: 20px;
`;

function ChatTree() {
  const [debugMode, setDebugMode] = useState(false);
  const [waitingOnAI, setWaitingOnAI] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const [messages, setMessages] = useState([
    {
      user: "human",
      text: "We had a server problem yesterday, are there some users who are stuck in training?",
    },
    {
      user: "bot",
      text: "I found 600 users whose models currently have status TRAINING . This is the SQL query that I ran and its output",
      code: "SELECT * FROM models WHERE status = 'TRAINING'",
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
  ]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onAsk = (value) => {
    setMessages([
      ...messages,
      {
        user: "human",
        text: value,
      },
    ]);
    setWaitingOnAI(true);
    // send request to AI
    setTimeout(() => {
      setWaitingOnAI(false);
      setMessages((messages) => [
        ...messages,
        {
          user: "bot",
          text: "I found 600 users whose models currently have status TRAINING . This is the SQL query that I ran and its output",
          code: "SELECT * FROM models WHERE status = 'TRAINING'",
          tableOutput: [
            {
              id: 1,
              name: "model1",
              status: "TRAINING",
              created_at: "2021-01-01 00:00:00",
            },
          ],
        },
      ]);
      // scroll to bottom
    }, 1);
  };
  return (
    <ChatTreeWrapper className="ChatTree">
      <SettingsWrapper>
        <Switch
          checkedChildren="Debug"
          unCheckedChildren="Debug"
          defaultChecked={debugMode}
          onChange={(checked) => setDebugMode(checked)}
        />
      </SettingsWrapper>
      <ChatBubble debugMode={debugMode} messages={messages} />
      <div ref={messagesEndRef} />
      <ChatInput onAsk={onAsk} waitingOnAI={waitingOnAI} />
    </ChatTreeWrapper>
  );
}

export default ChatTree;
