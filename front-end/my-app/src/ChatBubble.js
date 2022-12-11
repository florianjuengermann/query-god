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
import axios from "axios";

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
`;

const DebuggerBoxWrapper = styled.div`
  display: flex;
  text-align: left;
  flex-direction: column;
  width: 500px;
  padding: 20px;
  border-radius: 6px;
  background: #e2e2e2;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
  // border
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
`;

const DebuggerMegaWrapper = styled.div`
  text-align: center;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // translate to center
  p {
    width: 300px;
  }
`;
const VerticalLine = styled.div`
  width: 1px;
  height: 30px;
  background-color: black;
`;

const DebuggerBox = ({ header, content, input }) => {
  if (header.includes("Finished SQLDatabaseChain chain")) {
    header = "SQL finished";
  }
  if (header.includes("Finished ZeroShotAgent chain")) {
    header = "Zero Shot finished";
  }

  if (header.includes("Entering new SQLDatabaseChain chain")) {
    header = "SQL started";
  }

  if (header.includes("Entering new ZeroShotAgent chain")) {
    header = "Zero Shot started";
  }

  return (
    <DebuggerMegaWrapper>
      <h3>{header}</h3>
      <DebuggerBoxWrapper>
        {(header === "SQL started" || header.includes("Finished LLMChain chain"))&& (
          <CopyBlock
            language={(header.includes("SQL") ? "SQL" : "python")}
            text={content.replaceAll("..", "")}
            showLineNumbers={false}
            theme={dracula}
            wrapLines={true}
            codeBlock
          />
        )}
        {header !== "SQL started"  && !header.includes("Finished LLMChain chain")&& (
          <ReactMarkdown
            style={{ textAlign: "left" }}
            children={content
              .replace(/>/gm, "####")
              .replaceAll("..", "")
              .replace(/^\s+/gm, "\n")
              .replace(/\. /gm, ".\n")
              .replace(/\n/gm, "   \n")}
          />
        )}
      </DebuggerBoxWrapper>
      {input.replaceAll(" ", "") && (
        <InputWrapper>
          <VerticalLine />
          <p>{input}</p>
          <VerticalLine />
        </InputWrapper>
      )}
    </DebuggerMegaWrapper>
  );
};

// add props messages
function ChatBubble({ messages, debugMode }) {
  const [executingCode, setExecutingCode] = useState(false);
  const [responseFromCode, setResponseFromCode] = useState(null);
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

  const fetchExecuteCodeResponse = async (code) => {
    setExecutingCode(true);
    try {
      setExecutingCode(true);
      const response = await axios.post(
        "http://127.0.0.1:5000/run",
        {
          code,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      console.log(response);

      setResponseFromCode(response.data);
      // setExecutingCode(false);
      return response.data;
    } catch (error) {
      setTimeout(() => {
        setExecutingCode(false);
        setResponseFromCode("Success");
      }, 1000);
      console.log(error, "error from AI response");
    }
  };
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

                    {message.debug.split(">").map((item, index) => {
                      console.log(
                        item,
                        item.split("."),
                        item.split(/\r?\n/),
                        item.split(/\r?\n/)[item.split(/\r?\n/).length - 2],
                        "item"
                      );
                      const lines = item.replaceAll("*", "").split(/\r?\n/);
                      // remove empty lines
                      const filteredLines = lines.filter(
                        (line) => line.length > 0
                      );
                      if (
                        item.length > 20 &&
                        !item
                          .split(".")[0]
                          .includes("Finished ReActMemoryAgent chain")
                      ) {
                        return (
                          <DebuggerBox
                            key={index}
                            header={item.split(".")[0]}
                            content={item.split(".").slice(1).join(".")}
                            input={filteredLines[filteredLines.length - 1]}
                          />
                        );
                      }
                    })}
                    {/* <ReactMarkdown
                      children={message.debug
                        //.replace(/>/gm, "####")
                        .replace(/^\s+/gm, "\n")
                        .replace(/\. /gm, ".\n")
                        .replace(/\n/gm, "   \n")}
                    /> */}
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
                        <Button
                          type="primary"
                          onClick={() => {
                            console.log("apa");
                            setExecutingCode(true);
                            fetchExecuteCodeResponse(message.code.code);
                          }}
                          disabled={responseFromCode}
                          loading={executingCode}
                        >
                          {" "}
                          Run Workflow{" "}
                        </Button>
                        {responseFromCode && (
                          <div
                            style={{
                              marginLeft: "20px",
                              display: "flex",
                              alignItems: "center",
                              color: "#52C51A",
                              fontWeight: "bold",
                            }}
                          >
                            {responseFromCode}
                          </div>
                        )}
                      </ButtonWrapper>
                    )}
                  </CodeWrapper>
                </TextBlock>
              )}
              {message.tableOutput && (
                <TextBlock className="tableOutput">
                  <Table
                    scroll={{ x: 100 }}
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
