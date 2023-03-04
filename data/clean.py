import pandas as pd 
import os 
#from datasets import load_dataset 

def clean_data(df):
    df = pd.read
    # Drop all data that where book isn't equal to Book of Mormon
    df = df[df['volume_title'] == 'Book of Mormon']
    # output df to csv 
    df.to_csv('lds-scriptures-cleaned.csv', index=False)
    return df.head()

#def upload_to_huggingface(df):
    # log into huggingface 
#    os.system('huggingface-cli login')
    # Upload to huggingface
#    dataset = load_dataset('book_of_mormon_corpus', data_files='lds-scriptures-cleaned.csv')
#    dataset.push_to_hub('jbrazzy/book_of_mormon_corpus')

if __name__ == '__main__':
    # Read in data
    df = pd.read_csv('lds-scriptures.csv')
    # Clean data
    clean_data(df)