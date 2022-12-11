# flake8: noqa
PREFIX = """Answer the following questions as best you can. You have access to the following tools:"""
FORMAT_INSTRUCTIONS = """Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action (describe the entire action as this will be sent to the next AI, be verbose)
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question"""
HISTORY = """Conversation with a human so far:
{history}
"""
RESOURCES = """
You have access to the following resources:
{resources}
"""

SUFFIX = """Begin and stick to the Question/Thought/Action/Action Input/Observation format:

Question: {input}"""