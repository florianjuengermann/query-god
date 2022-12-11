import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import { ApiTwoTone } from "@ant-design/icons";
import { DatabaseTwoTone } from "@ant-design/icons";
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

const IntroPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: 700px;
  height: 300px;

  background-color: white;
  border-radius: 10px;
  padding: 20px;
`;

const TopHeaderIntro = styled.div`
  font-size: 40px;
  font-weight: 600;
`;

const WrapperIntro = styled.div`
  display: flex;
  align-items: center;
  padding: 30px;
  padding-top: 0px;
  height: 100%;
  justify-content: space-between;
`;

const ImageWrapper = styled.div``;

const ImageDescription = styled.div`
  font-size: 20px;
  font-weight: bold;
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
      console.log(messages);
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
      {messages.length === 0 && (
        <IntroPopup>
          {" "}
          <TopHeaderIntro>Datable</TopHeaderIntro>
          <WrapperIntro>
            <ImageWrapper>
              <DatabaseTwoTone
                style={{ fontSize: "100px", marginBottom: "20px" }}
              />
              <ImageDescription>Ask questions to any database</ImageDescription>
            </ImageWrapper>
            <ImageWrapper>
              <ApiTwoTone style={{ fontSize: "100px", marginBottom: "20px" }} />
              <ImageDescription>Execute tasks on any API</ImageDescription>
            </ImageWrapper>
          </WrapperIntro>
        </IntroPopup>
      )}
      <ChatBubble debugMode={debugMode} messages={messages} />
      <BottomDiv ref={messagesEndRef} />
      <ChatInput onAsk={onAsk} waitingOnAI={waitingOnAI} />
    </ChatTreeWrapper>
  );
}

export default ChatTree;
