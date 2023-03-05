import pandas as pd 
import os 
from datasets import load_dataset 

def clean_data(data):
    df = pd.read_csv(data)
    # Drop all data that where book isn't equal to Book of Mormon
    df = df[df['volume_title'] == "Book of Mormon"]
    # split into test and train sets 

    # output df to csv 
    df.to_csv('lds-scriptures-cleaned.csv', index=True)
    return df.head()

def upload_to_huggingface(data):
    # log into huggingface 
    #os.system('huggingface-cli login')
    # Upload to huggingface
    dataset = load_dataset('csv', data_files=data)
    dataset.push_to_hub('jbrazzy/book_of_mormon_corpus')

if __name__ == '__main__':
    # Clean data
    clean_data('lds-scriptures.csv')
    # push to huggingface
    upload_to_huggingface('lds-scriptures-cleaned.csv')