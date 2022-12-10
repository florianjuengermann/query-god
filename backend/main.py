from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain


prompt = PromptTemplate(
    input_variables=["product"],
    template="What is a good name for a company that makes {product}?",
)

llm = OpenAI(temperature=0.0)

chain = LLMChain(llm=llm, prompt=prompt)

chain.run("colorful socks")

text = "What would be a good company name an AI coding assistant that can answer any question about your data and can use your apis?"
print(llm(text))
