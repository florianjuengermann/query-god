import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import axios from "axios";
// emotion import
import { css } from "@emotion/react";
// styled
import styled from "@emotion/styled";
import { Switch } from "antd";

const ChatTreeWrapper = styled.div``;
const BottomDiv = styled.div`
  padding: 25px;
`;

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

  const [messages, setMessages] = useState([]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAIResponse = async (messages) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api",
        {
          history: messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      console.log(response);
      setMessages(response.data);
      setWaitingOnAI(false);
      return response.data;
    } catch (error) {
      console.log(error, "error from AI response");
    }
  };

  const onAsk = (value) => {
    fetchAIResponse([...messages, { user: "human", text: value }]);
    setMessages([
      ...messages,
      {
        user: "human",
        text: value,
      },
    ]);
    setWaitingOnAI(true);
    // send request to AI
    // setTimeout(() => {
    //   setWaitingOnAI(false);
    //   setMessages((messages) => [
    //     ...messages,
    //     {
    //       user: "bot",
    //       text: "I found 600 users whose models currently have status TRAINING . This is the SQL query that I ran and its output",
    //       code: {
    //         code: "SELECT * FROM models WHERE status = 'TRAINING'",
    //         language: "sql",
    //       },
    //       tableOutput: [
    //         {
    //           id: 1,
    //           name: "model1",
    //           status: "TRAINING",
    //           created_at: "2021-01-01 00:00:00",
    //         },
    //       ],
    //     },
    //   ]);
    //   // scroll to bottom
    // }, 1);
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
      <BottomDiv ref={messagesEndRef} />
      <ChatInput onAsk={onAsk} waitingOnAI={waitingOnAI} />
    </ChatTreeWrapper>
  );
}

export default ChatTree;
