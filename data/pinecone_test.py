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
    # initialize openai api key
    openai.api_key = os.getenv("OPENAI_API_KEY")
    # check that we are connected 
    openai.Engine.list()

    MODEL = model # "text-embedding-ada-002"
    # embed the text 
   # response = openai.Embedding.create(
   #    engine=MODEL,
   #    query=text, # want sample of the text
    #)

    # extract our embeddings as a listto then be uploaded to pinecone
   # embeds = [record["embedding"] for record in response["data"]]

    # initialize pinecone index 
    pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment = "us-east1-gcp")
    # check that our index exists already, if not create it
    if "chatbom" not in pinecone.list_indexes():
        pinecone.create_index("chatbom", dimension=1536, metric="cosine")
    # connect to our index
    index = pinecone.Index("chatbom")

    # file1 = open('lds-scriptures.csv', 'r')
    # lines = file1.read()
    # count = 0
    # for line in lines:
    #     count += 1
    # print('lines', lines[0:300])
    # return
    # want chapter and verse vector, return multiple vectors for a person
    # now populate the index 
    # jbrazzy/book_of_mormon_corpus
    data = load_dataset("jbrazzy/book_of_mormon_corpus", split="full_data") 
    #df = pd.read_csv("lds-scriptures.csv")
    #data_df = df[df['volume_title'] == "Book of Mormon"]

    #data = Dataset.from_pandas(data_df)

    # iterate through the dataset and embed each text in batches 
    batch_size = 32 
    for i in tqdm(range(0, len(data["scripture_text"]), batch_size)):
        print('index: ', i)
        # end position of batch 
        i_end = min(i + batch_size, len(data["scripture_text"]))

        # get batch of lines and IDs
        lines = data["scripture_text"][i:i+batch_size]
        book_ids = data["book_id"][i:i+batch_size]
        chapter_ids = data["chapter_id"][i:i+batch_size]
        verse_ids = data["verse_id"][i:i+batch_size]
        volume_titles = data["volume_title"][i:i+batch_size]
        book_titles = data["book_title"][i:i+batch_size]
        volume_long_titles = data["volume_long_title"][i:i+batch_size]
        book_long_titles = data["book_long_title"][i:i+batch_size]
        volume_subtitles = data["volume_subtitle"][i:i+batch_size]
        book_subtitles = data["book_subtitle"][i:i+batch_size]
        volume_short_titles = data["volume_short_title"][i:i+batch_size]
        book_short_titles = data["book_short_title"][i:i+batch_size]
        volume_lds_urls = data["volume_lds_url"][i:i+batch_size]
        book_lds_urls = data["book_lds_url"][i:i+batch_size]
        chapter_numbers = data["chapter_number"][i:i+batch_size]
        verse_numbers = data["verse_number"][i:i+batch_size]
        scripture_texts = data["scripture_text"][i:i+batch_size]
        verse_titles = data["verse_title"][i:i+batch_size]
        verse_short_titles = data["verse_short_title"][i:i+batch_size]

        metadatas = []
        for line, book_id, chapter_id, verse_id, volume_title, book_title, volume_long_title, book_long_title, volume_subtitle, book_subtitle, volume_short_title, book_short_title, volume_lds_url, book_lds_url, chapter_number, verse_number, scripture_text, verse_title, verse_short_title in zip(
            lines, book_ids, chapter_ids, verse_ids, volume_titles, book_titles, volume_long_titles, book_long_titles, volume_subtitles, book_subtitles, volume_short_titles, book_short_titles, volume_lds_urls, book_lds_urls, chapter_numbers, verse_numbers, scripture_texts, verse_titles, verse_short_titles
        ):
            metadatas.append({
                'book_id': book_id,
                'chapter_id': chapter_id,
                'verse_id': verse_id,
                'volume_title': volume_title,
                'book_title': book_title,
                'volume_long_title': volume_long_title,
                'book_long_title': book_long_title,
                'volume_subtitle': volume_subtitle,
                'book_subtitle': "" if book_subtitle == None else book_subtitle,
                'volume_short_title': volume_short_title,
                'book_short_title': book_short_title,
                'volume_lds_url': volume_lds_url,
                'book_lds_url': book_lds_url,
                'chapter_number': chapter_number,
                'verse_number': verse_number,
                'scripture_text': scripture_text,
                'verse_title': verse_title,
                'verse_short_title': verse_short_title
            })

        #del metadatas['scripture_text']
        ids = [str(n) for n in range(i, i_end)]

        # create our embeddings 
        res = openai.Embedding.create(input=lines, engine=MODEL)
        embeds = [record['embedding'] for record in res['data']]

        # prep metadata and upsert batch 
        to_upsert = zip(ids, embeds, metadatas)
        # if i == 640:
        #     print(ids)
        #     print(json.dumps(metadatas))

        # upsert to pinecone 
        index.upsert(vectors=list(to_upsert))


    # Embed every verse
    # for i, row in data_df.iterrows():
    #     # get batch of lines and IDs
    #     text = row["scripture_text"]
    #     verse_id = row["verse_id"]

    #     ids = [verse_id]

    #     # get col : val as dict
    #     metadata = row.to_dict()
    #     del metadata['scripture_text']

    #     #create our embeddings 
    #     res = openai.Embedding.create(input=text, engine=MODEL)
    #     embeds = [record['embedding'] for record in res['data']]

    #     # prep metadata and upsert batch 
    #     to_upsert = zip([ids], embeds, metadata)

    #     # upsert to pinecone 
    #     index.upsert(vectors=list(to_upsert))

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
    