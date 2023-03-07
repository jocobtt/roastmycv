import pandas as pd 
import os 
from datasets import load_dataset 
import numpy as np 

def clean_data(data):
    df = pd.read_csv(data)
    # Drop all data that where book isn't equal to Book of Mormon
    df = df[df['volume_title'] == "Book of Mormon"]
    # make a test set 
    df["train_test"] = np.random.choice(["train", "test"], size = len(df), p = [0.8, 0.2])    
    # split into train and test
    train = df[df["train_test"] == "train"]
    test = df[df["train_test"] == "test"]
    # drop train_test column
    train = train.drop(columns=['train_test'])
    test = test.drop(columns=['train_test'])
    df = df.drop(columns = ['train_test'])

    # output df to csv 
    df.to_csv('lds-scriptures-cleaned.csv', index=False)
    train.to_csv('bom_train.csv', index=False)
    test.to_csv('bom_test.csv', index=False)
    return df.head()

def upload_to_huggingface():
    # log into huggingface 
    #os.system('huggingface-cli login')
    # Upload to huggingface
    data_files = {"full_data": "lds-scriptures-cleaned.csv", "train": "bom_train.csv", "test": "bom_test.csv"}
    dataset = load_dataset('csv', data_files=data_files)
    dataset.push_to_hub('jbrazzy/book_of_mormon_corpus')

if __name__ == '__main__':
    # Clean data
    clean_data('lds-scriptures.csv')
    # push to huggingface
    upload_to_huggingface()