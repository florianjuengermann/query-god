from langchain import OpenAI, ConversationChain, LLMMathChain
from sqlalchemy.engine import Engine, create_engine
from langchain.agents import initialize_agent, Tool

import os
import sys
import re

from modules.database.sql_chain import SQLDatabaseChain
from modules.database.sql_database import SQLDatabase

from tempfile import NamedTemporaryFile


db = SQLDatabase.from_uri(os.getenv("DB_CONNECTION_STRING"))
print("Tables found:", db._all_tables)

db_chain = SQLDatabaseChain(
    llm=OpenAI(temperature=0),
    database=db,
    verbose=True,
    debug=False
)

last_db_output = None


def run_db_chain(text: str):
    global last_db_output
    output = db_chain({db_chain.input_keys[0]: text})
    last_db_output = output
    return output[db_chain.output_keys[0]]


# Load the tool configs that are needed.
llm = OpenAI(temperature=0)
llm_math_chain = LLMMathChain(llm=llm, verbose=True)
tools = [
    Tool(
        name="Database",
        func=run_db_chain,
        description="useful for when you need to answer questions about data in your database"
    ),
    Tool(
        name="Calculator",
        func=llm_math_chain.run,
        description="useful for when you need to answer questions about math"
    )
]

llm = OpenAI(temperature=0)


agent = initialize_agent(
    tools, llm, agent="zero-shot-react-description", verbose=True)


# save all stdout to a file buffer & also print to console
with NamedTemporaryFile() as tmp_file:
    stdout = sys.stdout

    sys.stdout = open(tmp_file.name, "w")

    r = agent.run(
        "We had a bug yesterday. Are there any users that are stuck in training?")

    sys.stdout = stdout
    # print to console
    with open(tmp_file.name, "r") as f:
        debug_output = f.read()
        print(debug_output)
        # replace non-printable characters
        debug_output = re.sub(r'[^\x00-\x7f]', r'', debug_output)
        # replace color codes
        debug_output = re.sub(r'\x1b\[[0-9;]*m', '', debug_output)

# print(debug_output)
print("DB output:", last_db_output)

result = {
    "debug_output": debug_output,
    **last_db_output,
}
