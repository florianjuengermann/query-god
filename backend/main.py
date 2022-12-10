from langchain.llms import OpenAI

llm = OpenAI(temperature=0.0)

text = "What would be a good company name an AI coding assistant that can answer any question about your data and can use your apis?"
print(llm(text))
