import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import axios from "axios";
import useWebSocket, { ReadyState } from 'react-use-websocket';
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

const DOMAIN = "http://127.0.0.1:5000";

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

  const wsUrl = `${DOMAIN}/debug-output`.replace(/^http/, 'ws');
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(
    wsUrl,{
      onOpen: (event) => console.log("websocket opened"),
      onClose: (event) => console.log("websocket closed"),
  });

  useEffect(() => {
    if (!lastMessage || lastMessage === "")
      return;
    console.log("last message:", lastMessage.data);
    const botMsgs = messages.filter((msg) => msg.user === "bot");
    if(botMsgs.length === 0)
      return;
    const lastBotMsg = {...botMsgs[botMsgs.length - 1]};
    // replace last bot message with new message
    lastBotMsg.debug += lastMessage.data;
    //console.log("All debug:", lastBotMsg.debug);
    // replace message in messages array
    const newMessages = messages.map((msg) => {
      if(msg.user === "bot" && msg.text === lastBotMsg.text)
        return lastBotMsg;
      return msg;
    });
    setMessages(newMessages);
  }, [lastMessage]);

  const fetchAIResponse = async (messages) => {
    try {
      if(!readyState === ReadyState.OPEN) {
        console.error("Websocket not open");
      }
      //sendJsonMessage({user: "0"});

      const response = await axios.post(
        `${DOMAIN}/api`,
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
      {
        user: "bot",
        debug: "",
      }
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
