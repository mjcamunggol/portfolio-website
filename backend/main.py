from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

app = FastAPI()

db = FAISS.load_local("vectorstore", OpenAIEmbeddings())
llm = ChatOpenAI(model="gpt-4o-mini")

qa = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=db.as_retriever()
)

@app.post("/chat")
async def chat(query: str):
    answer = qa.run(query)
    return {"response": answer}
