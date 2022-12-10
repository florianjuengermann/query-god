import React, { useState } from "react";
import { Table } from "antd";
import { CopyBlock, dracula } from "react-code-blocks";
import styled from "@emotion/styled";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";

const ChatBubbleWrapper = styled.div`
  // if user is human check with props
  ${(props) =>
    props.user === "human"
      ? `
          background-color: #fff;          
          `
      : `
          background-color: #F7F7F8;          
          `}
  padding: 30px;
`;

const InnerWrapper = styled.div`
  max-width: 80%;
  // center align
  margin: 0 auto;
`;

const TextBlock = styled.div`
  margin-bottom: 20px;
`;

const TextAndImage = styled.div`
  // first element is left aligned and second element is centered use flex box
  display: grid;
  grid-template-columns: 1fr 5fr 1fr;
  grid-gap: 20px;
  margin-bottom: 20px;
`;

const TextCentered = styled.div`
  // self center
  justify-self: center;
  align-self: center;
`;

const DebuggerWrapper = styled.div`
  background-color: #fff;
  border-radius 10px !important;
  padding: 20px;
`;

// add props messages
function ChatBubble({ messages, debugMode }) {
  // const [messages, setMessages] = useState([
  //   {
  //     user: "human",
  //     text: "We had a server problem yesterday, are there some users who are stuck in training?",
  //   },
  //   {
  //     user: "bot",
  //     text: "I found 600 users whose models currently have status TRAINING . This is the SQL query that I ran and its output",
  //     code: "SELECT * FROM models WHERE status = 'TRAINING'",
  //     debug: `adsas`
  //     tableOutput: [
  //       {
  //         id: 1,
  //         name: "model1",
  //         status: "TRAINING",
  //         created_at: "2021-01-01 00:00:00",
  //       },
  //       {
  //         id: 2,
  //         name: "model2",
  //         status: "TRAINING",
  //         created_at: "2021-01-01 00:00:00",
  //       },
  //     ],
  //   },
  // ]);
  const columns = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "created_at",
      dataIndex: "created_at",
      key: "created_at",
    },
  ];
  return (
    <div className="ChatBubble">
      {messages.map((message, index) => {
        return (
          <ChatBubbleWrapper
            key={index}
            user={message.user}
            className={message.user}
          >
            <InnerWrapper>
              {message.debug && debugMode && (
                <TextBlock style={{ textAlign: "left" }} className="debug">
                  <DebuggerWrapper style={{ borderRadius: "10px" }}>
                    <h3>LLM Debugging 🤖</h3>
                    <ReactMarkdown
                      children={message.debug
                        .replace(/>/gm, "####")
                        .replace(/^\s+/gm, "\n")
                        .replace(/\. /gm, ".\n")}
                    />
                  </DebuggerWrapper>
                </TextBlock>
              )}
              <TextAndImage className="text">
                <Avatar
                  style={{ marginRight: "20px" }}
                  size="medium"
                  icon={<UserOutlined />}
                />
                <TextCentered style={{}}>{message.text}</TextCentered>
              </TextAndImage>
              {message.code && (
                <TextBlock className="code">
                  <CopyBlock
                    language={"sql"}
                    text={message.code}
                    showLineNumbers={false}
                    theme={dracula}
                    wrapLines={true}
                    codeBlock
                  />
                </TextBlock>
              )}
              {message.tableOutput && (
                <TextBlock className="tableOutput">
                  <Table
                    columns={columns}
                    dataSource={message.tableOutput}
                    onChange={() => "apa"}
                  />
                </TextBlock>
              )}
            </InnerWrapper>
          </ChatBubbleWrapper>
        );
      })}
    </div>
  );
}

export default ChatBubble;
