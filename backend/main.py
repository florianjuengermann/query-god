from langchain import OpenAI, ConversationChain, LLMMathChain
from sqlalchemy.engine import Engine, create_engine
from langchain.agents import initialize_agent, Tool

import os
import sys
import re
import json

from backend.modules.database.sql_chain import SQLDatabaseChain
from backend.modules.database.sql_database import SQLDatabase
from backend.modules.agents.ReActMemoryAgent import ReActMemoryAgent
from backend.modules.api.api_chain import APIChain
from backend.modules.api.api import API
from backend.modules.resources.resource import Resource
from backend.modules.utils.text_formatting import colored_text_to_md

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
      user: "user",
      text: "Great can you rekick thier models?",
    },
]

"""


def get_chat_history(history):
    return "\n".join([
        ("AI: " if entry["user"] == "bot" else "USER: ")
        + entry["text"]
        for entry in history
    ])


def get_resources(history):
    return [
        Resource(
            type=entry["tableOutputSummary"]["type"],
            name=entry["tableOutputSummary"]["name"],
            description=f'{entry["tableOutputSummary"]["outline"]} like {entry["tableOutputSummary"]["example"]}. Source: {entry["tableOutputSummary"]["source"]}',
        )
        for entry in history
        if "tableOutputSummary" in entry
    ]


def run(history, capture_output=True):

    # prase history
    prompt = history[-1]["text"]  # TODO

    input = prompt
    history_text = get_chat_history(history)
    resources = get_resources(history)
    apis = [
        API(
            type="REST POST",
            signature="send_email(email, message)",
            description="send message to an email.",
        ),
        API(
            type="REST POST",
            signature="rekick_model(model_id)",
            description="restart a training for a model",
        ),
        API(
            type="REST POST",
            signature="reimburse_user(user_id, credits)",
            description="reimburse user id with credits",
        ),
    ]

    db_connection_string = os.environ.get("DB_CONNECTION_STRING")
    assert db_connection_string is not None, "DB_CONNECTION_STRING env var not set"
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
        debug=True,
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
        llm, tools, resources, history_text, verbose=True, debug=True)

    # save all stdout to a file buffer & also print to console
    with NamedTemporaryFile() as tmp_file:
        if capture_output:
            stdout = sys.stdout
            sys.stdout = open(tmp_file.name, "w")

        agent_output = agent.run(input)

        if capture_output:
            sys.stdout = stdout
        # print to console
        with open(tmp_file.name, "r") as f:
            debug_output = f.read()
            print(debug_output)
            # replace non-printable characters
            debug_output = re.sub(r'[^\x00-\x7f]', r'', debug_output)
            # replace color codes
            #debug_output = re.sub(r'\x1b\[[0-9;]*m', '', debug_output)
            debug_output = colored_text_to_md(debug_output)

    entry = {
        "user": "bot",
        "text": agent_output,
        "debug": debug_output,
    }
    if api_chain.custom_memory:
        entry["code"] = {
            "code": api_chain.custom_memory["python_code"],
            "language": "python",
            "executable": True,
        }
    elif db_chain.custom_memory:
        entry["code"] = {
            "code": db_chain.custom_memory["sql_cmd"],
            "language": "sql",
            "executable": False,
        }
        entry["tableOutput"] = db_chain.custom_memory["query_result"]
        entry["tableOutputSummary"] = db_chain.custom_memory["query_result_summary"]

    print("\n\n")
    print("New entry:")
    print(json.dumps(entry, indent=2, default=str))

    return [*history, entry]


def toy_test():
    history1 = [{
        "user": "user",
        "text": "We had a bug yesterday, can you tell me if there are any models stuck at training?"
    }]
    history2 = [
        {
            "user": "user",
            "text": "We had a bug yesterday, can you tell me if there are any models stuck at training?"
        },
        {
            "user": "bot",
            "text": "There are 15 models that are stuck at training.",
            "debug": "\n\n> Entering new ReActMemoryAgent chain...\n...\n",
            "code": {
                "code": " SELECT * FROM models WHERE status = 'training';",
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
            # "tableOutputSummary": "15 rows returned:\n[{'email': '205c5203-00f8-4cde-bed6-87f4000a6f05@gmail.com', 'status': 'training'}, ...]\nAll results are stored in query_result.json"
            "tableOutputSummary": {
                "type": "json file",
                "name": "query_result.json",
                "outline": "15 rows",
                "example": "[{'id': UUID('53bc36f5-73ba-4ec2-9961-0f00b6e864f8'), 'user_id': UUID('205c5203-00f8-4cde-bed6-87f4000a6f05'), 'training_images': ['images/1e5e98747869.png', 'images/fe98d806957b.png', 'images/05b5c763a8e5.png', 'images/b0386223f9c4.png', 'images/d4d28ea9be25.png', 'images/7f7938ea0c38.png', 'images/b00ba5ab725b.png', 'images/50af53451304.png', 'images/a47b5f0a3b2f.png', 'images/9eea40e6b80d.png', 'images/a7adea3aaccb.png', 'images/6687ef2fa9e6.png', 'images/35f784a6fd8e.png', 'images/3247fb402fb9.png', 'images/d08be9be7f62.png', 'images/e9efebe12afa.png', 'images/027ac8cbe295.png'], 'created_at': datetime.datetime(2022, 12, 10, 13, 27, 39, 368527, tzinfo=psycopg2.tz.FixedOffsetTimezone(offset=0, name=None)), 'updated_at': datetime.datetime(2022, 12, 10, 13, 48, 10, 904000, tzinfo=psycopg2.tz.FixedOffsetTimezone(offset=0, name=None)), 'status': 'training', 'estimated_time_to_completion': datetime.datetime(2022, 12, 10, 13, 48, 9, 278000, tzinfo=psycopg2.tz.FixedOffsetTimezone(offset=0, name=None)), 'model_name': 'prod-finetune-lcngl', 'gender': 'Man', 'face_attributes': {'age': 32}}, ...]",
                "source": " SELECT * FROM models WHERE status = 'training';",
                "text": "15 rows returned:\n[{'email': '205c5203-00f8-4cde-bed6-87f4000a6f05@gmail.com', 'status': 'training'}, ...]\nAll results are stored in query_result.json",
            }
        },
        {
            "user": "user",
            "text": "Great can you rekick these models?"
        }
    ]

    run(history2, capture_output=False)
