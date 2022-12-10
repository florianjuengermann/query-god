from langchain import OpenAI, SelfAskWithSearchChain, LLMMathChain
from sqlalchemy.engine import Engine, create_engine
from langchain.agents import initialize_agent, Tool

import os

from modules.database.sql_chain import SQLDatabaseChain
from modules.database.sql_database import SQLDatabase


db = SQLDatabase.from_uri(os.getenv("DB_CONNECTION_STRING"))
print("Tables found:", db._all_tables)

db_chain = SQLDatabaseChain(
    llm=OpenAI(temperature=0),
    database=db,
    verbose=True,
    debug=False
)


# Load the tool configs that are needed.
llm = OpenAI(temperature=0)
llm_math_chain = LLMMathChain(llm=llm, verbose=True)
tools = [
    Tool(
        name="Database",
        func=db_chain.run,
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


agent.run("We had a bug yesterday. Are there any users that are stuck in training?")
