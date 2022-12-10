import React, { useState } from "react";
import { Input, Space } from "antd";
import styled from "@emotion/styled";
const { Search } = Input;

// styled

const ChatInputWrapper = styled.div`
  position: fixed;
  bottom: 0px;
  width: 100%;
  height: 100px;

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 75%
  );
`;

const InnerWrapper = styled.div`
  max-width: 80%;
  margin: 0 auto;
`;
function ChatInput({ onAsk, waitingOnAI }) {
  return (
    <ChatInputWrapper>
      <InnerWrapper
        style={{
          marginTop: "20px",
          boxShadow: "box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Search
          style={{ width: "100%" }}
          placeholder="input search text"
          allowClear
          enterButton="Ask"
          size="large"
          loading={waitingOnAI}
          onSearch={onAsk}
        />
      </InnerWrapper>
    </ChatInputWrapper>
  );
}

export default ChatInput;
