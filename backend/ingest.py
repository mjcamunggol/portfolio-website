import os
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()

DATA_DIR = "../data"
VECTOR_DIR = "vectorstore"

docs = []

for file in os.listdir(DATA_DIR):
    if file.endswith(".md"):
        loader = TextLoader(
            os.path.join(DATA_DIR, file),
            encoding="utf-8"
        )
        docs.extend(loader.load())

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = splitter.split_documents(docs)

db = FAISS.from_documents(
    chunks,
    OpenAIEmbeddings()
)

db.save_local(VECTOR_DIR)

print("✅ Portfolio data successfully ingested.")