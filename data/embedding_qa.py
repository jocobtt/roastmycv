import os 
import openai 
import pinecone
from datasets import load_dataset, Dataset
#import supabase 
from tqdm.auto import tqdm
import pandas as pd
import json
import numpy as np

# we are going to be utilizing multiple models for our different functions - ie embeddings for docs, embeddings for queries etc. 
COMP_MODEL = "text-davinci-003"
MODEL_NAME = "curie"
DOC_EMBEDDINGS_MODEL = DOC_EMBEDDINGS_MODEL = f"text-search-{MODEL_NAME}-doc-001"
QUERY_EMBEDDINGS_MODEL = f"text-search-{MODEL_NAME}-query-001"


# initialize openai api key
openai.api_key = os.getenv("OPENAI_API_KEY")
# check that we are connected 
openai.Engine.list()

# base embedding function 
def get_embedding(text: str, model: str) -> list[float]:
    response = openai.Embedding.create(
        engine=model,
        query=text, # want sample of the text
    )
    return response["data"][0]["embedding"]

def get_doc_embedding(text: str) -> list[float]:
    return get_embedding(text, DOC_EMBEDDINGS_MODEL)

def query_embedding(text: str) -> list[float]:
    return get_embedding(text, QUERY_EMBEDDINGS_MODEL)

def get_vector_similiarity(x: list[float], y: list[float]):
    return np.cosine(np.array(x), np.array(y))

def order_document_sections_by_query_similarity(query: str, contexts: dict[(str, str), np.array]) -> list[(float, (str, str))]:

    query_embedding = query_embedding(query)

    document_similarities = sorted([
        (get_vector_similiarity(query_embedding, doc_embedding) for doc_index, doc_embedding in contexts.items())
    ], reverse = True)

    return document_similarities


def load_embeddings(fname: str) -> dict[tuple[str, str], list[float]]:
    # load the embeddings from pinecone 
    pinecone_client = pinecone.Client()
    index = pinecone_client.index(fname)
    max_dim = max([int(c) for c in index.metadata["dimensions"].split(",")])
    return {

    }

def construct_prompt(question: str, context_embeddings: dict, df: pd.DataFrame) -> tuple[str, str]


    res = openai.Completion.create(
        engine = "text-davinci-003",
        prompt = prompt,
        temperature = 0,
        max_tokens = 100,
        top_p = 3,
        frequency_penalty = 0,
        presence_penalty = 0,
        stop = None
    )
    return res['choices'][0]['text']
