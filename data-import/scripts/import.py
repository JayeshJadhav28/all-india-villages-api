# data-import/scripts/import.py
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
BATCH_SIZE = int(os.getenv('BATCH_SIZE', 2000))