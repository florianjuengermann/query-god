import React, { useState } from "react";
import { Table } from "antd";
import { CopyBlock, dracula } from "react-code-blocks";
import styled from "@emotion/styled";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import alfred from "./alfred.JPG";
import hal from "./hal.jpeg";
import { Button } from "antd";
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

const CodeWrapper = styled.div`
  text-align: left;
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

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
`;

// add props messages
function ChatBubble({ messages, debugMode }) {
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
                    {console.log(
                      message.debug
                        // replace newlines so it works for markdown
                        //.replace(/>/gm, "####")
                        .replace(/\n/gm, "  &nbsp; &nbsp; \n  &nbsp; ")
                    )}
                    <ReactMarkdown
                      children={message.debug
                        //.replace(/>/gm, "####")
                        .replace(/^\s+/gm, "\n")
                        .replace(/\. /gm, ".\n")
                        .replace(/\n/gm, "   \n")}
                    />
                  </DebuggerWrapper>
                </TextBlock>
              )}
              <TextAndImage className="text">
                <Avatar
                  style={{ marginRight: "20px" }}
                  size="medium"
                  icon={
                    message.user === "bot" ? (
                      <img src={hal} alt="hal" />
                    ) : (
                      <img src={alfred} alt="alfred" />
                    )
                  }
                />
                <TextCentered style={{}}>{message.text}</TextCentered>
              </TextAndImage>
              {message.code && (
                <TextBlock className="code">
                  <CodeWrapper>
                    <CopyBlock
                      language={message.code.language}
                      text={message.code.code}
                      showLineNumbers={false}
                      theme={dracula}
                      wrapLines={true}
                      codeBlock
                    />
                    {message.code.executable && (
                      <ButtonWrapper>
                        <Button type="primary"> Run Workflow </Button>
                      </ButtonWrapper>
                    )}
                  </CodeWrapper>
                </TextBlock>
              )}
              {message.tableOutput && (
                <TextBlock className="tableOutput">
                  <Table
                    columns={Object.keys(message.tableOutput[0]).map((key) => {
                      return {
                        title: key,
                        dataIndex: key,
                        key: key,
                      };
                    })}
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
