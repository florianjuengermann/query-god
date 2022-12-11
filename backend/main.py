from langchain import OpenAI, ConversationChain, LLMMathChain
from sqlalchemy.engine import Engine, create_engine
from langchain.agents import initialize_agent, Tool

import os
import sys
import re

from backend.modules.database.sql_chain import SQLDatabaseChain
from backend.modules.database.sql_database import SQLDatabase
from backend.modules.agents.ReActMemoryAgent import ReActMemoryAgent
from backend.modules.api.api_chain import APIChain

from tempfile import NamedTemporaryFile

"""
History looks like this:
[
    {
        "user": "user",
        "text": "We had a bug yesterday. Are there any users that are stuck in training?",
    },
    {
        "user": "bot",
        "text": "There are X users stuck in training.",
        "code": {
            "code": "SELECT * FROM models WHERE status = 'TRAINING'",
            "language": "sql",
            "executable": false,
        },
        "tableOutput": <JSON>,
        "tableOutputSummary": "15 rows returned:\n[{'email': '205c5203-00f8-4cde-bed6-87f4000a6f05@gmail.com', 'status': 'training'}, ...]\nAll results are stored in query_result.json",
        "debug": "> Entering new ZeroShotAgent chain..."
    },
    {
      user: "human",
      text: "Great can you rekick thier models?",
    },
]

"""


def craft_high_level_prompt(history):
    # have all the direct interactions in the history
    text = "\n".join([
        ""
    ])


def run(history, capture_output=True):

    # prase history
    prompt = history[-1]["text"]  # TODO

    input = prompt
    history = ""
    resources = []
    apis = []

    db_connection_string = os.environ.get("DB_CONNECTION_STRING")
    print("db_connection_string set:", db_connection_string is not None)
    db = SQLDatabase.from_uri(db_connection_string)
    print("Tables found:", db._all_tables)

    db_chain = SQLDatabaseChain(
        llm=OpenAI(temperature=0),
        database=db,
        verbose=True,
        debug=False
    )

    api_chain = APIChain(
        llm=OpenAI(temperature=0),
        apis=apis,
        resources=resources,
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
        ),
        Tool(
            name="API",
            func=api_chain.run,
            description="useful for when you need to perform actions on data"
        )
    ]

    llm = OpenAI(temperature=0)

    # agent = initialize_agent(
    #    tools, llm, agent="zero-shot-react-description", verbose=True)
    agent = ReActMemoryAgent.from_llm_tools_resources_history(
        llm, tools, resources, history, verbose=True, debug=True)

    # save all stdout to a file buffer & also print to console
    with NamedTemporaryFile() as tmp_file:
        if capture_output:
            stdout = sys.stdout
            sys.stdout = open(tmp_file.name, "w")

        r = agent.run(input)

        if capture_output:
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
    print("DB output:", db_chain.custom_memory)

    entry = {
        "user": "bot",
        "text": r,
        "debug": debug_output,
    }
    if db_chain.custom_memory:
        entry["code"] = {
            "code": db_chain.custom_memory["sql_cmd"],
            "language": "sql",
            "executable": False,
        }
        entry["tableOutput"] = db_chain.custom_memory["query_result"]
        entry["tableOutputSummary"] = db_chain.custom_memory["query_result_summary"]

    return [*history, entry]


def toy_test():
    history1 = [{
        "user": "user",
        "text": "We had a bug yesterday. Are there any users that are stuck in training?"
    }]
    history2 = [
        {
            "user": "user",
            "text": "We had a bug yesterday. Are there any users that are stuck in training?"
        },
        {
            "user": "bot",
            "text": "Yes, there are 15 users stuck in training.",
            "debug": "\n\n> Entering new ReActMemoryAgent chain...\n...\n",
            "code": {
                "code": " SELECT users.email, models.status FROM users INNER JOIN models ON users.id = models.user_id WHERE models.status = 'training';",
                "language": "sql",
                "executable": False
            },
            "tableOutput": [
                {
                    "email": "205c5203-00f8-4cde-bed6-87f4000a6f05@gmail.com",
                    "status": "training"
                },
                {
                    "email": "db53a306-324a-432e-b95b-b3efbc8fdfd7@gmail.com",
                    "status": "training"
                },
            ],
            "tableOutputSummary": "15 rows returned:\n[{'email': '205c5203-00f8-4cde-bed6-87f4000a6f05@gmail.com', 'status': 'training'}, ...]\nAll results are stored in query_result.json"
        },
        {
            "user": "user",
            "text": "Great can you rekick their models?"
        }
    ]

    run(history2, capture_output=False)
