# testing out pinecone & openai to create our embeddings for our chatbot 

import os 
import openai 
import pinecone
from datasets import load_dataset, Dataset
#import supabase 
from tqdm.auto import tqdm
import pandas as pd
import json

def embed_model(model): # text 
    openai.api_key = os.getenv("OPENAI_API_KEY")
    openai.Engine.list()

    MODEL = model # "text-embedding-ada-002"

    # initialize pinecone index 
    pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment = "us-east1-gcp")

    # check that our index exists already, if not create it
    if "chatbom" not in pinecone.list_indexes():
        pinecone.create_index("chatbom", dimension=1536, metric="cosine")

    # connect to our index
    index = pinecone.Index("chatbom")

    # jbrazzy/book_of_mormon_corpus
    with open('/Users/isaactai/genera_raw.txt', "r") as f:
        raw = f.read()
        sections = [e.strip() for e in raw.split("$$$$$")]

    writeables = []
    for section in sections:
        lines = section.splitlines()
        text = " ".join(lines[2:]) if len(lines) > 1 else lines
        text = text.replace(" • ", "\n• ")
        writeables.append({
            'section': lines[0],
            'title': lines[1],
            'text': " ".join(lines[2:]) if len(lines) > 1 else lines,
            'raw': section,
            'source': 'General Handbook',
            'revision_date': 'August 2022'
        })

    writeables = writeables[2:]
        
    # data = Dataset.from_pandas(data_df)

    # iterate through the dataset and embed each text in batches 
    batch_size = 8 
    for i in tqdm(range(0, len(writeables), batch_size)):
        print('index: ', i)
        # end position of batch 
        i_end = min(i + batch_size, len(writeables))

        # get batch of lines and IDs
        lines = [e['raw'] for e in writeables[i:i+batch_size]]
        metadatas = writeables[i:i+batch_size] 

        if i == 72:
            print(lines)
            print(metadatas)

        ids = [str(n) for n in range(i, i_end)]

        # create our embeddings 
        res = openai.Embedding.create(input=lines, engine=MODEL)
        embeds = [record['embedding'] for record in res['data']]

        # prep metadata and upsert batch 
        to_upsert = zip(ids, embeds, metadatas)

        # upsert to pinecone 
        index.upsert(vectors=list(to_upsert))

    return index 

def test_query(MODEL):
    pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment = "us-east1-gcp")
    # connect to our index - we don't need the if statement since in this case we are assuming that the index already exists 
    index = pinecone.Index("chatbom")

    # test query 
    query = "What year did Lehi leave Jerusalem?"
    # create our embeddings 
    eq = openai.Embedding.create(input=query, engine=MODEL)['data'][0]['embedding']
    

    # now query our index 
    eq_res = index.query([eq], top_k = 5, include_metadata = True)

    # print our results 
    for match in eq_res['matches']:
        print(f"{match['score']:.2f}: {match['metadata']['scripture_texts']}")

    return eq_res

if "__main__" == __name__:
    embed_model("text-embedding-ada-002")
    # running a test query on our embeddings
    # test_query("text-embedding-ada-002")
    